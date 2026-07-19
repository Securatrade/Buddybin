import { ResponsiveImage } from "@/components/site/responsive-image";
import { SiteFooter } from "@/components/site/footer";
import { SiteHeader } from "@/components/site/header";
import { ButtonLink } from "@/components/ui/button";
import { BRAND } from "@/lib/constants";

export const metadata = {
  title: "How It Works",
};

const sections = [
  ["Enter your address", "Tell us where your bins are kept."],
  ["Choose your bins", "Pick General Waste, Recycling or Garden Waste."],
  ["Set up payment", "Pay monthly through secure Stripe Checkout."],
] as const;

export default function HowItWorksPage() {
  return (
    <>
      <SiteHeader />
      <main className="bg-white">
        <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
            <div>
              <p className="font-bold uppercase tracking-[0.18em] text-buddy-green">
                How it works
              </p>
              <h1 className="mt-3 text-3xl font-black leading-tight text-buddy-navy sm:text-5xl">
                Monthly bin cleaning, set up in minutes.
              </h1>
              <p className="mt-4 text-base leading-7 text-slate-600 sm:text-lg">
                {BRAND.legalArrangement}
              </p>
              <div className="mt-7 grid gap-3">
                {sections.map(([title, copy], index) => (
                  <article
                    key={title}
                    className="grid grid-cols-[2.25rem_1fr] gap-3 rounded-lg border border-buddy-border bg-white p-4"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-buddy-green font-black text-white">
                      {index + 1}
                    </div>
                    <div>
                      <h2 className="font-black text-buddy-navy">{title}</h2>
                      <p className="mt-1 text-sm leading-6 text-slate-600">{copy}</p>
                    </div>
                  </article>
                ))}
              </div>
              <ButtonLink href="/#signup" className="mt-7">
                Sign up
              </ButtonLink>
            </div>
            <ResponsiveImage
              src="/images/buddybin-how-it-works.webp"
              alt="A friendly local cleaner professionally washing a wheelie bin"
              width={1200}
              height={800}
              sizes="(min-width: 1024px) 560px, 100vw"
              className="aspect-[3/2] bg-buddy-pale"
            />
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
