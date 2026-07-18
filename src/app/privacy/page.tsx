import { LegalPage } from "@/components/site/legal-page";

export const metadata = {
  title: "Privacy",
};

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      sections={[
        ["Data we collect", "BuddyBin collects customer contact details, property details, bin schedule information and account messages needed to arrange the service."],
        ["Processors", "Supabase, Stripe and Resend are used to provide authentication, subscriptions, database storage and email delivery."],
        ["Analytics", "Google Analytics and Meta Pixel are optional. Personal information must not be sent to analytics services."],
      ]}
    />
  );
}
