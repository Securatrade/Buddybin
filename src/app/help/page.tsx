import { Mail } from "lucide-react";
import Link from "next/link";
import { SiteFooter } from "@/components/site/footer";
import { SiteHeader } from "@/components/site/header";
import { BRAND } from "@/lib/constants";

export const metadata = {
  title: "Help",
};

const faqs = [
  ["Does BuddyBin clean the bins directly?", "No. BuddyBin arranges recurring bin-cleaning services through independent local cleaning partners."],
  ["Can I cancel?", "Yes. See the cancellation policy for the current launch terms."],
  ["Do I need to request a quote?", "No. Choose your bins and see the monthly price before payment."],
  ["When will cleaning happen?", "Cleaning is arranged around your collection day once a local partner is assigned."],
] as const;

export default function HelpPage() {
  return (
    <>
      <SiteHeader />
      <main className="bg-white">
        <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
          <p className="font-bold uppercase tracking-[0.18em] text-buddy-green">
            Help
          </p>
          <h1 className="mt-3 text-3xl font-black text-buddy-navy sm:text-5xl">
            Questions about BuddyBin
          </h1>
          <p className="mt-4 text-base leading-7 text-slate-600 sm:text-lg">
            {BRAND.legalArrangement}
          </p>
          <div className="mt-8 grid gap-3">
            {faqs.map(([question, answer]) => (
              <article key={question} className="rounded-lg border border-buddy-border bg-white p-5 shadow-sm">
                <h2 className="text-xl font-black text-buddy-navy">{question}</h2>
                <p className="mt-3 leading-7 text-slate-600">{answer}</p>
              </article>
            ))}
          </div>
          <div className="mt-6 rounded-lg border border-buddy-border bg-buddy-pale p-5">
            <div className="flex items-center gap-3 text-buddy-navy">
              <Mail aria-hidden className="text-buddy-blue" />
              <h2 className="text-xl font-black">Need support?</h2>
            </div>
            <p className="mt-3 text-slate-700">
              Create a support ticket and we will review your enquiry. We aim to
              reply by email or telephone within 24 hours.
            </p>
            <Link
              href="/contact"
              className="mt-4 inline-flex font-bold text-buddy-blue hover:text-buddy-navy"
            >
              Contact support
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
