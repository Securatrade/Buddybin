import {
  BIN_TYPES,
  MONTHLY_CLEANING_FREQUENCY_WEEKS,
  type OperationalStatus,
  type PaymentStatus,
  type SupportTicketStatus,
} from "@/lib/constants";
import { hasSupabaseServiceEnv } from "@/lib/env";
import { logger } from "@/lib/logger";
import { DEFAULT_PRICING_RULES, type PlanCalculation, type PricingRule } from "@/lib/pricing";
import type {
  ContactMessageInput,
  PublicSupportTicketInput,
  SignupInput,
} from "@/lib/schemas";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

type JsonRecord = Record<string, unknown>;

const supportedBinTypeValues = BIN_TYPES.map((bin) => bin.value);

function toPricingRule(row: JsonRecord): PricingRule {
  return {
    id: String(row.id),
    binType: row.bin_type as PricingRule["binType"],
    cleaningFrequencyWeeks: Number(
      row.cleaning_frequency_weeks,
    ) as PricingRule["cleaningFrequencyWeeks"],
    firstBinPricePence: Number(row.first_bin_price_pence),
    additionalBinPricePence: Number(row.additional_bin_price_pence),
    stripeProductId: (row.stripe_product_id as string | null) || null,
    stripeFirstBinPriceId:
      (row.stripe_first_bin_price_id as string | null) || null,
    stripeAdditionalBinPriceId:
      (row.stripe_additional_bin_price_id as string | null) || null,
    version: Number(row.version),
    effectiveFrom: String(row.effective_from),
    isActive: Boolean(row.is_active),
  };
}

export async function getActivePricingRules(): Promise<PricingRule[]> {
  if (!hasSupabaseServiceEnv()) {
    logger.warn("Using development fallback pricing because Supabase is not configured");
    return DEFAULT_PRICING_RULES;
  }

  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase
    .from("pricing_rules")
    .select("*")
    .eq("is_active", true)
    .in("bin_type", supportedBinTypeValues)
    .eq("cleaning_frequency_weeks", MONTHLY_CLEANING_FREQUENCY_WEEKS)
    .order("bin_type", { ascending: true })
    .order("cleaning_frequency_weeks", { ascending: true });

  if (error) {
    throw new Error(`Could not load pricing rules: ${error.message}`);
  }

  return (data || []).map((row) => toPricingRule(row as JsonRecord));
}

export async function getPricingRulesForAdmin() {
  if (!hasSupabaseServiceEnv()) {
    return DEFAULT_PRICING_RULES;
  }

  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase
    .from("pricing_rules")
    .select("*")
    .in("bin_type", supportedBinTypeValues)
    .eq("cleaning_frequency_weeks", MONTHLY_CLEANING_FREQUENCY_WEEKS)
    .order("bin_type", { ascending: true })
    .order("cleaning_frequency_weeks", { ascending: true })
    .order("version", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data || []).map((row) => toPricingRule(row as JsonRecord));
}

export async function replacePricingRule({
  existingRuleId,
  firstBinPricePence,
  additionalBinPricePence,
  stripeFirstBinPriceId,
  stripeAdditionalBinPriceId,
  isActive,
}: {
  existingRuleId: string;
  firstBinPricePence: number;
  additionalBinPricePence: number;
  stripeFirstBinPriceId: string;
  stripeAdditionalBinPriceId: string;
  isActive: boolean;
}) {
  const supabase = createSupabaseServiceClient();
  const { data: existing, error: existingError } = await supabase
    .from("pricing_rules")
    .select("*")
    .eq("id", existingRuleId)
    .single();

  if (existingError || !existing) {
    throw new Error(existingError?.message || "Pricing rule not found");
  }

  const { error: deactivateError } = await supabase
    .from("pricing_rules")
    .update({ is_active: false })
    .eq("bin_type", existing.bin_type)
    .eq("cleaning_frequency_weeks", existing.cleaning_frequency_weeks)
    .eq("is_active", true);

  if (deactivateError) {
    throw new Error(deactivateError.message);
  }

  const { data: nextRule, error: insertError } = await supabase
    .from("pricing_rules")
    .insert({
      bin_type: existing.bin_type,
      cleaning_frequency_weeks: existing.cleaning_frequency_weeks,
      first_bin_price_pence: firstBinPricePence,
      additional_bin_price_pence: additionalBinPricePence,
      stripe_product_id: existing.stripe_product_id,
      stripe_first_bin_price_id: stripeFirstBinPriceId,
      stripe_additional_bin_price_id: stripeAdditionalBinPriceId,
      version: Number(existing.version || 1) + 1,
      effective_from: new Date().toISOString(),
      is_active: isActive,
    })
    .select("*")
    .single();

  if (insertError || !nextRule) {
    throw new Error(insertError?.message || "Could not create pricing rule");
  }

  await logAdminAudit({
    action: "pricing_rule_replaced",
    entityType: "pricing_rule",
    entityId: String(nextRule.id),
    previousValues: existing as JsonRecord,
    newValues: nextRule as JsonRecord,
  });

  return toPricingRule(nextRule as JsonRecord);
}

export async function createPendingSignup(
  input: SignupInput,
  calculation: PlanCalculation,
) {
  const supabase = createSupabaseServiceClient();

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .upsert(
      {
        full_name: input.customer.fullName,
        email: input.customer.email,
        mobile: input.customer.mobile,
      },
      { onConflict: "email" },
    )
    .select("id,email,full_name")
    .single();

  if (profileError || !profile) {
    throw new Error(profileError?.message || "Could not create customer profile");
  }

  const { data: property, error: propertyError } = await supabase
    .from("properties")
    .insert({
      profile_id: profile.id,
      address_line_1: input.address.addressLine1,
      address_line_2: input.address.addressLine2 || null,
      town: input.address.town || "Not supplied",
      county: input.address.county || null,
      postcode: input.address.postcode,
      bin_location: input.customer.binLocation,
      bin_location_other: input.customer.binLocationOther || null,
      access_instructions: input.customer.accessInstructions || null,
      collection_day_notes: input.collectionDayNotes || null,
    })
    .select("id")
    .single();

  if (propertyError || !property) {
    throw new Error(propertyError?.message || "Could not create property");
  }

  const { data: plan, error: planError } = await supabase
    .from("customer_plans")
    .insert({
      profile_id: profile.id,
      property_id: property.id,
      operational_status: "awaiting_cleaner",
      payment_status: "pending",
      monthly_total_pence: calculation.monthlyTotalPence,
      currency: calculation.currency,
      pricing_version: calculation.pricingVersion,
    })
    .select("id")
    .single();

  if (planError || !plan) {
    throw new Error(planError?.message || "Could not create customer plan");
  }

  const planBins = calculation.bins.map((bin) => ({
    customer_plan_id: plan.id,
    bin_type: bin.binType,
    display_label: bin.displayLabel,
    cleaning_frequency_weeks: bin.cleaningFrequencyWeeks,
    collection_day: bin.collectionDay,
    collection_frequency: bin.collectionFrequency,
    next_collection_date: bin.nextCollectionDate || null,
    position: bin.position,
    price_category: bin.priceCategory,
    monthly_price_pence: bin.monthlyPricePence,
    pricing_rule_id: bin.pricingRuleId,
    stripe_price_id: bin.stripePriceId,
  }));

  const { error: binsError } = await supabase.from("plan_bins").insert(planBins);

  if (binsError) {
    throw new Error(binsError.message);
  }

  const { data: existingStripePlan } = await supabase
    .from("customer_plans")
    .select("stripe_customer_id")
    .eq("profile_id", profile.id)
    .not("stripe_customer_id", "is", null)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return {
    profileId: profile.id as string,
    propertyId: property.id as string,
    customerPlanId: plan.id as string,
    email: profile.email as string,
    fullName: profile.full_name as string,
    stripeCustomerId:
      (existingStripePlan?.stripe_customer_id as string | null) || null,
  };
}

export async function updatePlanStripeReferences({
  customerPlanId,
  stripeCustomerId,
  stripeCheckoutSessionId,
  stripeSubscriptionId,
}: {
  customerPlanId: string;
  stripeCustomerId?: string | null;
  stripeCheckoutSessionId?: string | null;
  stripeSubscriptionId?: string | null;
}) {
  const supabase = createSupabaseServiceClient();
  const updates: JsonRecord = {};
  if (stripeCustomerId !== undefined) updates.stripe_customer_id = stripeCustomerId;
  if (stripeCheckoutSessionId !== undefined) {
    updates.stripe_checkout_session_id = stripeCheckoutSessionId;
  }
  if (stripeSubscriptionId !== undefined) {
    updates.stripe_subscription_id = stripeSubscriptionId;
  }

  const { error } = await supabase
    .from("customer_plans")
    .update(updates)
    .eq("id", customerPlanId);

  if (error) {
    throw new Error(error.message);
  }
}

export async function markCheckoutCompleted({
  customerPlanId,
  stripeCustomerId,
  stripeCheckoutSessionId,
  stripeSubscriptionId,
}: {
  customerPlanId: string;
  stripeCustomerId?: string | null;
  stripeCheckoutSessionId?: string | null;
  stripeSubscriptionId?: string | null;
}) {
  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase
    .from("customer_plans")
    .update({
      payment_status: "active",
      operational_status: "awaiting_cleaner",
      stripe_customer_id: stripeCustomerId || null,
      stripe_checkout_session_id: stripeCheckoutSessionId || null,
      stripe_subscription_id: stripeSubscriptionId || null,
    })
    .eq("id", customerPlanId)
    .select("*, profiles(*)")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function getAccountSnapshot(authUserId: string) {
  if (!hasSupabaseServiceEnv()) {
    return null;
  }

  const supabase = createSupabaseServiceClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("*, properties(*), customer_plans(*), contact_messages(*)")
    .eq("auth_user_id", authUserId)
    .single();

  return profile || null;
}

export async function associateProfileAuthUser(authUserId: string, email: string) {
  if (!hasSupabaseServiceEnv()) {
    return;
  }

  const supabase = createSupabaseServiceClient();
  const { error } = await supabase
    .from("profiles")
    .update({ auth_user_id: authUserId })
    .eq("email", email.toLowerCase())
    .or(`auth_user_id.is.null,auth_user_id.eq.${authUserId}`);

  if (error) {
    throw new Error(error.message);
  }
}

export async function storeContactMessage({
  profileId,
  customerPlanId,
  customerName,
  customerEmail,
  customerTelephone,
  message,
}: {
  profileId: string;
  customerPlanId: string;
  customerName?: string | null;
  customerEmail?: string | null;
  customerTelephone?: string | null;
  message: ContactMessageInput;
}) {
  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase
    .from("contact_messages")
    .insert({
      profile_id: profileId,
      customer_plan_id: customerPlanId,
      name: customerName || null,
      email: customerEmail || null,
      telephone: customerTelephone || null,
      subject: message.subject,
      message: message.message,
      source: "customer_portal",
      status: "new",
    })
    .select("id,ticket_reference")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function storePublicSupportTicket(input: PublicSupportTicketInput) {
  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase
    .from("contact_messages")
    .insert({
      name: input.name,
      email: input.email,
      telephone: input.telephone,
      subject: input.subject,
      message: input.message,
      source: "public_contact",
      status: "new",
    })
    .select("id,ticket_reference")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function getAdminDashboard() {
  if (!hasSupabaseServiceEnv()) {
    return {
      totalCustomers: 0,
      awaitingCleaner: 0,
      confirmed: 0,
      cancelled: 0,
      activeSubscriptions: 0,
      pastDueSubscriptions: 0,
      unreadMessages: 0,
    };
  }

  const supabase = createSupabaseServiceClient();
  const [
    profiles,
    awaitingCleaner,
    confirmed,
    cancelled,
    activeSubscriptions,
    pastDueSubscriptions,
    unreadMessages,
  ] = await Promise.all([
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase
      .from("customer_plans")
      .select("id", { count: "exact", head: true })
      .eq("operational_status", "awaiting_cleaner"),
    supabase
      .from("customer_plans")
      .select("id", { count: "exact", head: true })
      .eq("operational_status", "confirmed"),
    supabase
      .from("customer_plans")
      .select("id", { count: "exact", head: true })
      .eq("operational_status", "cancelled"),
    supabase
      .from("customer_plans")
      .select("id", { count: "exact", head: true })
      .eq("payment_status", "active"),
    supabase
      .from("customer_plans")
      .select("id", { count: "exact", head: true })
      .eq("payment_status", "past_due"),
    supabase
      .from("contact_messages")
      .select("id", { count: "exact", head: true })
      .in("status", ["new", "in_progress", "awaiting_customer"]),
  ]);

  return {
    totalCustomers: profiles.count || 0,
    awaitingCleaner: awaitingCleaner.count || 0,
    confirmed: confirmed.count || 0,
    cancelled: cancelled.count || 0,
    activeSubscriptions: activeSubscriptions.count || 0,
    pastDueSubscriptions: pastDueSubscriptions.count || 0,
    unreadMessages: unreadMessages.count || 0,
  };
}

export async function recordAdminLoginAttempt({
  hashedIdentifier,
  successful,
}: {
  hashedIdentifier: string;
  successful: boolean;
}) {
  if (!hasSupabaseServiceEnv()) {
    return;
  }

  const supabase = createSupabaseServiceClient();
  await supabase.from("admin_login_attempts").insert({
    hashed_ip_or_identifier: hashedIdentifier,
    successful,
  });
}

export async function getAdminCustomers(search = "") {
  if (!hasSupabaseServiceEnv()) {
    return [];
  }

  const supabase = createSupabaseServiceClient();
  let query = supabase
    .from("customer_plans")
    .select("*, profiles(*), properties(*), plan_bins(*)")
    .order("created_at", { ascending: false })
    .limit(100);

  if (search) {
    const term = `%${search}%`;
    query = query.or(
      `profiles.full_name.ilike.${term},profiles.email.ilike.${term},profiles.mobile.ilike.${term},properties.postcode.ilike.${term}`,
    );
  }

  const { data, error } = await query;
  if (error) {
    throw new Error(error.message);
  }

  return data || [];
}

export async function getAdminCustomer(customerPlanId: string) {
  if (!hasSupabaseServiceEnv()) {
    return null;
  }

  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase
    .from("customer_plans")
    .select("*, profiles(*), properties(*), plan_bins(*), contact_messages(*)")
    .eq("id", customerPlanId)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function getAdminMessages({
  status,
  q,
}: {
  status?: SupportTicketStatus | "all";
  q?: string;
} = {}) {
  if (!hasSupabaseServiceEnv()) {
    return [];
  }

  const supabase = createSupabaseServiceClient();
  let query = supabase
    .from("contact_messages")
    .select("*, profiles(*), customer_plans(*)")
    .order("created_at", { ascending: false })
    .limit(100);

  if (status && status !== "all") {
    query = query.eq("status", status);
  }

  if (q?.trim()) {
    const term = `%${q.trim()}%`;
    query = query.or(
      `ticket_reference.ilike.${term},name.ilike.${term},email.ilike.${term},telephone.ilike.${term},subject.ilike.${term}`,
    );
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return data || [];
}

export async function markMessageRead(messageId: string) {
  const supabase = createSupabaseServiceClient();
  const { error } = await supabase
    .from("contact_messages")
    .update({ is_read: true })
    .eq("id", messageId);

  if (error) {
    throw new Error(error.message);
  }
}

export async function updateSupportTicket({
  messageId,
  status,
  internalNotes,
}: {
  messageId: string;
  status: SupportTicketStatus;
  internalNotes?: string;
}) {
  const supabase = createSupabaseServiceClient();
  const updates: JsonRecord = {
    status,
    is_read: true,
    internal_notes: internalNotes || null,
  };

  if (status === "resolved" || status === "closed") {
    updates.resolved_at = new Date().toISOString();
  } else {
    updates.resolved_at = null;
  }

  const { data, error } = await supabase
    .from("contact_messages")
    .update(updates)
    .eq("id", messageId)
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  await logAdminAudit({
    action: "support_ticket_updated",
    entityType: "contact_message",
    entityId: messageId,
    newValues: data as JsonRecord,
  });

  return data;
}

export async function updateOperationalStatus({
  customerPlanId,
  operationalStatus,
}: {
  customerPlanId: string;
  operationalStatus: OperationalStatus;
}) {
  const supabase = createSupabaseServiceClient();
  const updates: JsonRecord = {
    operational_status: operationalStatus,
  };

  if (operationalStatus === "confirmed") {
    updates.confirmed_at = new Date().toISOString();
  }

  if (operationalStatus === "cancelled") {
    updates.cancelled_at = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from("customer_plans")
    .update(updates)
    .eq("id", customerPlanId)
    .select("*, profiles(*)")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function updatePaymentStatusBySubscription({
  stripeSubscriptionId,
  paymentStatus,
}: {
  stripeSubscriptionId: string;
  paymentStatus: PaymentStatus;
}) {
  const supabase = createSupabaseServiceClient();
  const updates: JsonRecord = { payment_status: paymentStatus };

  if (paymentStatus === "cancelled") {
    updates.operational_status = "cancelled";
    updates.cancelled_at = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from("customer_plans")
    .update(updates)
    .eq("stripe_subscription_id", stripeSubscriptionId)
    .select("*, profiles(*)")
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function hasProcessedStripeEvent(stripeEventId: string) {
  if (!hasSupabaseServiceEnv()) {
    return false;
  }

  const supabase = createSupabaseServiceClient();
  const { data } = await supabase
    .from("stripe_events")
    .select("stripe_event_id")
    .eq("stripe_event_id", stripeEventId)
    .maybeSingle();

  return Boolean(data);
}

export async function recordStripeEvent({
  stripeEventId,
  eventType,
  processingResult,
}: {
  stripeEventId: string;
  eventType: string;
  processingResult: string;
}) {
  if (!hasSupabaseServiceEnv()) {
    return;
  }

  const supabase = createSupabaseServiceClient();
  const { error } = await supabase.from("stripe_events").insert({
    stripe_event_id: stripeEventId,
    event_type: eventType,
    processing_result: processingResult,
  });

  if (error && !error.message.includes("duplicate")) {
    throw new Error(error.message);
  }
}

export async function logAdminAudit({
  action,
  entityType,
  entityId,
  previousValues,
  newValues,
}: {
  action: string;
  entityType: string;
  entityId?: string | null;
  previousValues?: JsonRecord | null;
  newValues?: JsonRecord | null;
}) {
  if (!hasSupabaseServiceEnv()) {
    return;
  }

  const supabase = createSupabaseServiceClient();
  await supabase.from("admin_audit_log").insert({
    action,
    entity_type: entityType,
    entity_id: entityId || null,
    previous_values: previousValues || null,
    new_values: newValues || null,
  });
}
