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
        <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[1fr_0.8fr]">
            <div>
              <p className="font-bold uppercase tracking-[0.18em] text-buddy-green">
                For cleaners
              </p>
              <h1 className="mt-3 text-3xl font-black text-buddy-navy sm:text-5xl">
                Partner with BuddyBin
              </h1>
              <p className="mt-4 text-base leading-7 text-slate-600 sm:text-lg">
                BuddyBin connects customers with independent local bin-cleaning
                partners.
              </p>
            </div>
            <div className="rounded-lg border border-buddy-border bg-buddy-pale p-5 shadow-sm">
              <h2 className="text-2xl font-black text-buddy-navy">
                Cleaner interest
              </h2>
              <p className="mt-3 leading-7 text-slate-700">
                Send us your details and the areas you cover.
              </p>
              <ButtonLink href="/contact" className="mt-6">
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
