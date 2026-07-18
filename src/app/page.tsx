import { ArrowRight, CheckCircle2 } from "lucide-react";
import { SignupFlow } from "@/components/signup/signup-flow";
import { BinIllustration } from "@/components/site/bin-illustration";
import { SiteFooter } from "@/components/site/footer";
import { SiteHeader } from "@/components/site/header";
import { ButtonLink } from "@/components/ui/button";
import { BRAND } from "@/lib/constants";

const reassurance = [
  "Easy monthly payment",
  "No cash or chasing",
  "Cancel anytime",
] as const;

const steps = [
  {
    title: "Choose your bins",
    copy: "Tell us which bins need cleaning.",
  },
  {
    title: "Tell us your collection days",
    copy: "We organise cleaning around the council collection schedule.",
  },
  {
    title: "We sort everything",
    copy: "BuddyBin finds the local cleaning partner and manages the payment.",
  },
] as const;

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="overflow-hidden bg-white">
          <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-[1fr_0.9fr] lg:px-8 lg:py-24">
            <div className="flex flex-col justify-center">
              <p className="font-bold uppercase tracking-[0.18em] text-buddy-green">
                {BRAND.tagline}
              </p>
              <h1 className="mt-5 max-w-3xl text-5xl font-black leading-tight text-buddy-navy sm:text-6xl lg:text-7xl">
                Never clean your wheelie bin again.
              </h1>
              <p className="mt-6 max-w-2xl text-xl leading-9 text-slate-600">
                Choose your bins and collection schedule. BuddyBin organises a
                local cleaning partner and manages everything through one simple
                monthly payment.
              </p>
              <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
                <ButtonLink href="#signup" size="lg">
                  Get started
                  <ArrowRight aria-hidden size={20} />
                </ButtonLink>
              </div>
              <ul className="mt-8 grid gap-3 text-sm font-bold text-buddy-navy sm:grid-cols-3">
                {reassurance.map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <CheckCircle2 className="text-buddy-green" size={20} aria-hidden />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <BinIllustration />
          </div>
        </section>

        <section className="bg-buddy-pale py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <h2 className="text-3xl font-black text-buddy-navy sm:text-4xl">
                Bin cleaning, organised without the chasing
              </h2>
              <p className="mt-4 text-lg leading-8 text-slate-600">
                {BRAND.legalArrangement}
              </p>
            </div>
            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {steps.map((step, index) => (
                <article
                  key={step.title}
                  className="rounded-2xl border border-buddy-border bg-white p-6 shadow-sm"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-buddy-green text-lg font-black text-white">
                    {index + 1}
                  </div>
                  <h3 className="mt-5 text-xl font-black text-buddy-navy">
                    {step.title}
                  </h3>
                  <p className="mt-3 leading-7 text-slate-600">{step.copy}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <SignupFlow />
      </main>
      <SiteFooter />
    </>
  );
}
