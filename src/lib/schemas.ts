import { z } from "zod";
import {
  BIN_LOCATIONS,
  BIN_TYPES,
  COLLECTION_DAYS,
  COLLECTION_FREQUENCIES,
  MONTHLY_CLEANING_FREQUENCY_WEEKS,
  OPERATIONAL_STATUSES,
  PAYMENT_STATUSES,
  SUPPORT_TICKET_STATUSES,
} from "@/lib/constants";
import { todayInputValue } from "@/lib/utils";

const binTypeValues = BIN_TYPES.map((bin) => bin.value) as [
  (typeof BIN_TYPES)[number]["value"],
  ...(typeof BIN_TYPES)[number]["value"][],
];
const collectionDayValues = COLLECTION_DAYS as unknown as [
  (typeof COLLECTION_DAYS)[number],
  ...(typeof COLLECTION_DAYS)[number][],
];
const collectionFrequencyValues = COLLECTION_FREQUENCIES.map(
  (frequency) => frequency.value,
) as [
  (typeof COLLECTION_FREQUENCIES)[number]["value"],
  ...(typeof COLLECTION_FREQUENCIES)[number]["value"][],
];
const binLocationValues = BIN_LOCATIONS as unknown as [
  (typeof BIN_LOCATIONS)[number],
  ...(typeof BIN_LOCATIONS)[number][],
];
const supportTicketStatusValues = SUPPORT_TICKET_STATUSES as unknown as [
  (typeof SUPPORT_TICKET_STATUSES)[number],
  ...(typeof SUPPORT_TICKET_STATUSES)[number][],
];

export const ukPostcodeSchema = z
  .string()
  .trim()
  .min(3, "Enter a postcode")
  .max(10, "Postcode is too long")
  .regex(
    /^[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}$/i,
    "Enter a valid UK postcode",
  )
  .transform((value) => value.toUpperCase().replace(/\s+/g, " ").trim());

export const addressSchema = z.object({
  postcode: ukPostcodeSchema,
  addressLine1: z.string().trim().min(2, "Enter the first line of the address"),
  addressLine2: z.string().trim().max(120).optional().or(z.literal("")),
  town: z.string().trim().max(80).optional().or(z.literal("")),
  county: z.string().trim().max(80).optional().or(z.literal("")),
});

export const planBinInputSchema = z
  .object({
    clientId: z.string().min(1),
    binType: z.enum(binTypeValues),
    displayLabel: z.string().trim().min(1).max(80).optional(),
    cleaningFrequencyWeeks: z.literal(MONTHLY_CLEANING_FREQUENCY_WEEKS),
    collectionDay: z.enum(collectionDayValues),
    collectionFrequency: z.enum(collectionFrequencyValues),
    nextCollectionDate: z.string().optional().or(z.literal("")),
  })
  .superRefine((bin, context) => {
    if (bin.collectionFrequency !== "every_two_weeks") {
      return;
    }

    if (!bin.nextCollectionDate) {
      context.addIssue({
        code: "custom",
        path: ["nextCollectionDate"],
        message: "Enter the next collection date",
      });
      return;
    }

    if (bin.nextCollectionDate < todayInputValue()) {
      context.addIssue({
        code: "custom",
        path: ["nextCollectionDate"],
        message: "Next collection cannot be in the past",
      });
    }
  });

export const customerDetailsSchema = z
  .object({
    fullName: z.string().trim().min(2, "Enter your full name"),
    email: z.email("Enter a valid email address").transform((v) => v.toLowerCase()),
    mobile: z
      .string()
      .trim()
      .regex(
        /^(\+44\s?7\d{3}|07\d{3})\s?\d{3}\s?\d{3}$/,
        "Enter a UK mobile number",
      ),
    binLocation: z.enum(binLocationValues),
    binLocationOther: z.string().trim().max(160).optional().or(z.literal("")),
    accessInstructions: z.string().trim().max(800).optional().or(z.literal("")),
    termsAccepted: z.boolean().refine(Boolean, {
      message: "You must agree to the Terms and Conditions",
    }),
  })
  .superRefine((details, context) => {
    if (
      details.binLocation === "Other" &&
      !details.binLocationOther?.trim()
    ) {
      context.addIssue({
        code: "custom",
        path: ["binLocationOther"],
        message: "Tell us where the bins are normally left",
      });
    }
  });

export const signupSchema = z.object({
  address: addressSchema,
  bins: z.array(planBinInputSchema).min(1, "Add at least one bin"),
  customer: customerDetailsSchema,
  collectionDayNotes: z.string().trim().max(800).optional().or(z.literal("")),
});

export const contactMessageSchema = z.object({
  subject: z.string().trim().min(3, "Enter a subject").max(120),
  message: z.string().trim().min(10, "Enter a message").max(2000),
});

export const publicSupportTicketSchema = contactMessageSchema.extend({
  name: z.string().trim().min(2, "Enter your name").max(120),
  email: z.email("Enter a valid email address").transform((v) => v.toLowerCase()),
  telephone: z.string().trim().min(7, "Enter a telephone number").max(30),
  company: z.string().max(0).optional().or(z.literal("")),
});

export const supportTicketStatusSchema = z.enum(supportTicketStatusValues);

export const supportTicketUpdateSchema = z.object({
  status: supportTicketStatusSchema,
  internalNotes: z.string().trim().max(4000).optional().or(z.literal("")),
});

export const adminLoginSchema = z.object({
  pin: z.string().trim().min(4).max(32),
});

export const operationalStatusSchema = z.enum(
  OPERATIONAL_STATUSES as unknown as [
    (typeof OPERATIONAL_STATUSES)[number],
    ...(typeof OPERATIONAL_STATUSES)[number][],
  ],
);

export const paymentStatusSchema = z.enum(
  PAYMENT_STATUSES as unknown as [
    (typeof PAYMENT_STATUSES)[number],
    ...(typeof PAYMENT_STATUSES)[number][],
  ],
);

export const adminStatusUpdateSchema = z.object({
  customerPlanId: z.uuid(),
  operationalStatus: operationalStatusSchema,
  cancelStripe: z.boolean().optional().default(false),
});

export const pricingUpdateSchema = z.object({
  pricingRuleId: z.uuid().optional(),
  binType: z.enum(binTypeValues),
  cleaningFrequencyWeeks: z.literal(MONTHLY_CLEANING_FREQUENCY_WEEKS),
  firstBinPrice: z.string().trim().min(1),
  additionalBinPrice: z.string().trim().min(1),
  isActive: z.boolean(),
});

export type AddressInput = z.infer<typeof addressSchema>;
export type PlanBinInput = z.infer<typeof planBinInputSchema>;
export type CustomerDetailsInput = z.infer<typeof customerDetailsSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
export type ContactMessageInput = z.infer<typeof contactMessageSchema>;
export type PublicSupportTicketInput = z.infer<typeof publicSupportTicketSchema>;
export type SupportTicketUpdateInput = z.infer<typeof supportTicketUpdateSchema>;
