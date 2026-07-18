import { LegalPage } from "@/components/site/legal-page";

export const metadata = {
  title: "Cookies",
};

export default function CookiesPage() {
  return (
    <LegalPage
      title="Cookie Policy"
      sections={[
        ["Essential cookies", "Essential cookies support secure account login, admin sessions and checkout flow continuity."],
        ["Optional analytics", "Google Analytics and Meta Pixel can be enabled through environment variables once consent requirements are reviewed."],
        ["Managing cookies", "Customers can control cookies through their browser settings. A production consent tool should be added before enabling optional trackers."],
      ]}
    />
  );
}
