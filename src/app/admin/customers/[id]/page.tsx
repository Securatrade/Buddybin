import { AdminShell } from "@/components/admin/admin-shell";
import { StatusControls } from "@/components/admin/status-controls";
import { requireAdmin } from "@/lib/admin/session";
import { getAdminCustomer } from "@/lib/database";
import { collectionSummary } from "@/lib/pricing";
import { compactAddress, formatPence } from "@/lib/utils";
import {
  SUPPORT_TICKET_STATUS_CONTENT,
  type OperationalStatus,
  type SupportTicketStatus,
} from "@/lib/constants";

export const dynamic = "force-dynamic";

type AdminBinRow = {
  id: string;
  display_label: string;
  cleaning_frequency_weeks: number;
  collection_day: string;
  collection_frequency: "weekly" | "every_two_weeks";
  next_collection_date?: string | null;
  monthly_price_pence?: number | null;
  price_category?: string | null;
};

type AdminMessageRow = {
  id: string;
  subject: string;
  message: string;
  ticket_reference?: string | null;
  status?: SupportTicketStatus | null;
};

export default async function AdminCustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const customer = await getAdminCustomer(id);

  if (!customer) {
    return (
      <AdminShell>
        <p className="rounded-2xl border border-buddy-border bg-white p-6 text-slate-600">
          Customer not found.
        </p>
      </AdminShell>
    );
  }

  const profile = customer.profiles;
  const property = customer.properties;
  const bins = (customer.plan_bins || []) as AdminBinRow[];
  const messages = (customer.contact_messages || []) as AdminMessageRow[];

  return (
    <AdminShell>
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <section className="space-y-6">
          <div>
            <h1 className="text-3xl font-black text-buddy-navy">
              {profile?.full_name || "Customer"}
            </h1>
            <p className="mt-2 text-slate-600">{profile?.email}</p>
          </div>
          <InfoCard title="Customer details">
            <Detail label="Mobile" value={profile?.mobile} />
            <Detail
              label="Created"
              value={
                customer.created_at
                  ? new Date(customer.created_at).toLocaleString("en-GB")
                  : ""
              }
            />
          </InfoCard>
          <InfoCard title="Property">
            <Detail
              label="Address"
              value={compactAddress([
                property?.address_line_1,
                property?.address_line_2,
                property?.town,
                property?.county,
                property?.postcode,
              ])}
            />
            <Detail label="Bin location" value={property?.bin_location} />
            <Detail label="Other location" value={property?.bin_location_other} />
            <Detail label="Access instructions" value={property?.access_instructions} />
          </InfoCard>
          <InfoCard title="Selected bins">
            <div className="grid gap-3">
              {bins.map((bin) => (
                <div key={bin.id} className="rounded-2xl border border-buddy-border p-4">
                  <p className="font-black text-buddy-navy">{bin.display_label}</p>
                  <p className="mt-1 text-sm text-slate-600">
                    Cleaned once a month.{" "}
                    {collectionSummary({
                      collectionDay: bin.collection_day,
                      collectionFrequency: bin.collection_frequency,
                      nextCollectionDate: bin.next_collection_date || undefined,
                    })}
                  </p>
                  <p className="mt-1 text-sm font-bold text-buddy-navy">
                    {formatPence(bin.monthly_price_pence || 0)} monthly, {bin.price_category}
                  </p>
                </div>
              ))}
            </div>
          </InfoCard>
          <InfoCard title="Support tickets">
            <div className="grid gap-3">
              {messages.map((message) => (
                <article key={message.id} className="rounded-2xl border border-buddy-border p-4">
                  <p className="text-sm font-bold text-slate-500">
                    {message.ticket_reference || "BB-PENDING"} ·{" "}
                    {message.status
                      ? SUPPORT_TICKET_STATUS_CONTENT[message.status].label
                      : "New"}
                  </p>
                  <p className="font-black text-buddy-navy">{message.subject}</p>
                  <p className="mt-2 text-slate-600">{message.message}</p>
                </article>
              ))}
              {messages.length === 0 ? <p className="text-slate-600">No support tickets yet.</p> : null}
            </div>
          </InfoCard>
        </section>
        <aside className="space-y-6">
          <InfoCard title="Payment">
            <Detail label="Monthly total" value={formatPence(customer.monthly_total_pence || 0)} />
            <Detail label="Payment status" value={customer.payment_status} />
            <Detail label="Operational status" value={customer.operational_status} />
            <Detail label="Stripe Customer ID" value={customer.stripe_customer_id} />
            <Detail label="Stripe Subscription ID" value={customer.stripe_subscription_id} />
          </InfoCard>
          <StatusControls
            customerPlanId={customer.id}
            currentStatus={customer.operational_status as OperationalStatus}
          />
        </aside>
      </div>
    </AdminShell>
  );
}

function InfoCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-buddy-border bg-white p-5 shadow-sm">
      <h2 className="text-xl font-black text-buddy-navy">{title}</h2>
      <div className="mt-4 space-y-3">{children}</div>
    </section>
  );
}

function Detail({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">{label}</p>
      <p className="mt-1 break-words text-buddy-navy">{value || "Not provided"}</p>
    </div>
  );
}
