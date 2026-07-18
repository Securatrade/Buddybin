import { LegalPage } from "@/components/site/legal-page";

export const metadata = {
  title: "Terms",
};

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms and Conditions"
      sections={[
        ["Subscription", "Customers authorise BuddyBin to arrange recurring monthly services and collect a monthly Stripe subscription for the selected bins."],
        ["Independent partners", "Cleaning is performed by independent local cleaning partners. BuddyBin manages customer signup, payment and service coordination."],
        ["Availability", "No guarantee of national availability or specific cleaning dates is made in this placeholder wording."],
      ]}
    />
  );
}
