import { SiteFooter } from "@/components/site/footer";
import { SiteHeader } from "@/components/site/header";
import { ButtonLink } from "@/components/ui/button";

export const metadata = {
  title: "For Cleaners",
};

export default function ForCleanersPage() {
  return (
    <>
      <SiteHeader />
      <main className="bg-white">
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[1fr_0.8fr]">
            <div>
              <p className="font-bold uppercase tracking-[0.18em] text-buddy-green">
                For cleaners
              </p>
              <h1 className="mt-3 text-4xl font-black text-buddy-navy sm:text-6xl">
                Partner with a national service platform.
              </h1>
              <p className="mt-5 text-lg leading-8 text-slate-600">
                BuddyBin connects customers with independent local bin-cleaning
                partners. Cleaner onboarding, compliance checks and availability
                areas should be confirmed before launch.
              </p>
            </div>
            <div className="rounded-[28px] border border-buddy-border bg-buddy-pale p-6 shadow-sm">
              <h2 className="text-2xl font-black text-buddy-navy">
                Cleaner interest
              </h2>
              <p className="mt-3 leading-7 text-slate-700">
                Version one keeps cleaner onboarding manual. Use the support
                inbox to collect expressions of interest and assign customers
                from the admin area.
              </p>
              <ButtonLink href="/help" className="mt-6">
                Contact BuddyBin
              </ButtonLink>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
