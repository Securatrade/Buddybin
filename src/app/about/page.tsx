import { ResponsiveImage } from "@/components/site/responsive-image";
import { SiteFooter } from "@/components/site/footer";
import { SiteHeader } from "@/components/site/header";
import { ButtonLink } from "@/components/ui/button";
import { BRAND } from "@/lib/constants";

export const metadata = {
  title: "About BuddyBin",
};

export default function AboutPage() {
  return (
    <>
      <SiteHeader />
      <main className="bg-white">
        <section className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 sm:py-14 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:px-8">
          <div>
            <p className="font-bold uppercase tracking-[0.18em] text-buddy-green">
              About
            </p>
            <h1 className="mt-3 text-3xl font-black leading-tight text-buddy-navy sm:text-5xl">
              Simple monthly bin cleaning.
            </h1>
            <p className="mt-4 text-base leading-7 text-slate-600 sm:text-lg">
              BuddyBin helps customers arrange recurring wheelie bin cleaning
              with one monthly payment.
            </p>
            <p className="mt-4 leading-7 text-slate-600">
              {BRAND.legalArrangement} BuddyBin manages signup, payment and
              service coordination.
            </p>
            <ButtonLink href="/#signup" className="mt-7">
              Sign up
            </ButtonLink>
          </div>
          <ResponsiveImage
            src="/images/buddybin-hero.webp"
            alt="A spotless wheelie bin outside a modern UK home"
            width={1600}
            height={1000}
            sizes="(min-width: 1024px) 560px, 100vw"
            className="aspect-[16/10] bg-buddy-pale"
          />
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
