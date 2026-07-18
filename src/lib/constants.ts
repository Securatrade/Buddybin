export const BRAND = {
  name: "BuddyBin",
  tagline: "We sort it. You don't.",
  legalArrangement:
    "BuddyBin arranges recurring bin-cleaning services through independent local cleaning partners.",
  supportEmailFallback: "support@buddybin.co.uk",
} as const;

export const BIN_TYPES = [
  { value: "general_waste", label: "General waste", colour: "#061B2F" },
  { value: "recycling", label: "Recycling", colour: "#159EE4" },
  { value: "garden_waste", label: "Garden waste", colour: "#39B929" },
  { value: "food_waste", label: "Food waste", colour: "#735C3D" },
] as const;

export const CLEANING_FREQUENCIES = [
  { value: 2, label: "Every 2 weeks" },
  { value: 4, label: "Every 4 weeks", badge: "Most popular" },
  { value: 8, label: "Every 8 weeks" },
] as const;

export const COLLECTION_DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;

export const COLLECTION_FREQUENCIES = [
  { value: "weekly", label: "Weekly" },
  { value: "every_two_weeks", label: "Every two weeks" },
] as const;

export const BIN_LOCATIONS = [
  "Front of property",
  "Side of property",
  "Bin store",
  "Other",
] as const;

export const OPERATIONAL_STATUSES = [
  "awaiting_cleaner",
  "confirmed",
  "cancelled",
] as const;

export const PAYMENT_STATUSES = [
  "pending",
  "active",
  "past_due",
  "unpaid",
  "cancelled",
] as const;

export const SUPPORT_TICKET_STATUSES = [
  "new",
  "in_progress",
  "awaiting_customer",
  "resolved",
  "closed",
] as const;

export const OPERATIONAL_STATUS_CONTENT = {
  awaiting_cleaner: {
    label: "Awaiting cleaner",
    tone: "amber",
    description:
      "We're arranging your local BuddyBin cleaning partner. We'll email you as soon as everything is confirmed.",
  },
  confirmed: {
    label: "Confirmed",
    tone: "green",
    description: "Your local BuddyBin cleaning partner has been confirmed.",
  },
  cancelled: {
    label: "Cancelled",
    tone: "red",
    description: "Your BuddyBin service has been cancelled.",
  },
} as const;

export type BinType = (typeof BIN_TYPES)[number]["value"];
export type CleaningFrequencyWeeks =
  (typeof CLEANING_FREQUENCIES)[number]["value"];
export type CollectionDay = (typeof COLLECTION_DAYS)[number];
export type CollectionFrequency =
  (typeof COLLECTION_FREQUENCIES)[number]["value"];
export type BinLocation = (typeof BIN_LOCATIONS)[number];
export type OperationalStatus = (typeof OPERATIONAL_STATUSES)[number];
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];
export type SupportTicketStatus = (typeof SUPPORT_TICKET_STATUSES)[number];

export const BIN_TYPE_LABELS = Object.fromEntries(
  BIN_TYPES.map((bin) => [bin.value, bin.label]),
) as Record<BinType, string>;

export const SUPPORT_TICKET_STATUS_CONTENT = {
  new: { label: "New", tone: "blue" },
  in_progress: { label: "In Progress", tone: "amber" },
  awaiting_customer: { label: "Awaiting Customer", tone: "amber" },
  resolved: { label: "Resolved", tone: "green" },
  closed: { label: "Closed", tone: "slate" },
} as const satisfies Record<
  SupportTicketStatus,
  { label: string; tone: "blue" | "amber" | "green" | "slate" }
>;
