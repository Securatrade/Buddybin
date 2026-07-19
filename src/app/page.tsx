import { SignupFlow } from "@/components/signup/signup-flow";
import { ResponsiveImage } from "@/components/site/responsive-image";
import { SiteFooter } from "@/components/site/footer";
import { SiteHeader } from "@/components/site/header";
import { WhyChooseBuddyBin } from "@/components/site/why-choose-buddybin";
import { BRAND } from "@/lib/constants";
import { siteUrl } from "@/lib/env";

export const metadata = {
  title: "Monthly Wheelie Bin Cleaning After Collection",
  description:
    "BuddyBin cleans selected wheelie bins once a month after your normal council collection. Choose your bins, set your schedule, and pay securely online.",
};

export default function Home() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: BRAND.name,
    serviceType: "Wheelie bin cleaning",
    url: siteUrl(),
    email: BRAND.supportEmailFallback,
  };

  return (
    <>
      <SiteHeader />
      <main>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        <section className="border-b border-buddy-border bg-buddy-pale py-5 sm:py-6">
          <div className="mx-auto grid max-w-7xl items-center gap-5 px-4 sm:px-6 md:grid-cols-[1fr_360px] lg:px-8">
            <div>
              <h1 className="max-w-3xl text-3xl font-black leading-tight text-buddy-navy sm:text-5xl">
                Sign up for monthly wheelie bin cleaning
              </h1>
              <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
                Enter your address, choose your bins and set up your monthly payment.
              </p>
            </div>
            <ResponsiveImage
              src="/images/buddybin-hero.webp"
              alt="A spotless wheelie bin outside a modern UK home on a sunny day"
              width={1600}
              height={1000}
              sizes="(min-width: 768px) 360px, 0px"
              className="hidden aspect-[16/10] md:block"
            />
          </div>
        </section>

        <SignupFlow />
        <WhyChooseBuddyBin />
      </main>
      <SiteFooter />
    </>
  );
}
