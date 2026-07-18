import { LegalPage } from "@/components/site/legal-page";

export const metadata = {
  title: "Cancellation Policy",
};

export default function CancellationPolicyPage() {
  return (
    <LegalPage
      title="Cancellation Policy"
      sections={[
        ["Customer cancellation", "Customers can cancel their BuddyBin subscription. The exact notice period and refund position must be confirmed during legal review."],
        ["Stripe subscriptions", "When cancellation is confirmed, BuddyBin can cancel the Stripe subscription and stop arranging future cleanings."],
        ["Service status", "The customer portal shows the operational status separately from payment status."],
      ]}
    />
  );
}
