import { SiteFooter } from "@/components/site/footer";
import { SiteHeader } from "@/components/site/header";
import { ButtonLink } from "@/components/ui/button";
import { BRAND } from "@/lib/constants";

export const metadata = {
  title: "How It Works",
};

const sections = [
  ["Choose your bins", "Select general waste, recycling, garden waste or food waste bins and choose a cleaning frequency for each one."],
  ["Share council collection details", "Tell BuddyBin the collection day and whether each bin is collected weekly or every two weeks."],
  ["One monthly payment", "BuddyBin calculates the plan securely on the server and starts a Stripe-hosted monthly subscription."],
  ["Local partner arranged", "BuddyBin arranges the service through an independent local cleaning partner and keeps your account status updated."],
] as const;

export default function HowItWorksPage() {
  return (
    <>
      <SiteHeader />
      <main className="bg-white">
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <div className="max-w-3xl">
            <p className="font-bold uppercase tracking-[0.18em] text-buddy-green">
              How it works
            </p>
            <h1 className="mt-3 text-4xl font-black text-buddy-navy sm:text-6xl">
              A simple way to organise recurring bin cleaning.
            </h1>
            <p className="mt-5 text-lg leading-8 text-slate-600">
              {BRAND.legalArrangement}
            </p>
          </div>
          <div className="mt-12 grid gap-4 md:grid-cols-2">
            {sections.map(([title, copy], index) => (
              <article key={title} className="rounded-2xl border border-buddy-border bg-white p-6 shadow-sm">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-buddy-green font-black text-white">
                  {index + 1}
                </div>
                <h2 className="mt-5 text-2xl font-black text-buddy-navy">{title}</h2>
                <p className="mt-3 leading-7 text-slate-600">{copy}</p>
              </article>
            ))}
          </div>
          <ButtonLink href="/#signup" className="mt-10">
            Get started
          </ButtonLink>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
