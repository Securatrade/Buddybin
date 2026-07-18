import { SignupFlow } from "@/components/signup/signup-flow";
import { SiteFooter } from "@/components/site/footer";
import { SiteHeader } from "@/components/site/header";

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="border-b border-buddy-border bg-buddy-pale py-6 sm:py-8">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-buddy-green">
              Monthly wheelie bin cleaning
            </p>
            <h1 className="mt-3 max-w-3xl text-4xl font-black leading-tight text-buddy-navy sm:text-5xl">
              Sign up for regular wheelie bin cleans
            </h1>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600">
              Enter your address, choose your bins and checkout. BuddyBin
              arranges a local cleaner, one simple monthly payment and one
              clean per month for each bin.
            </p>
          </div>
        </section>

        <SignupFlow />
      </main>
      <SiteFooter />
    </>
  );
}
