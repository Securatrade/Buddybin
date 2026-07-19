import { SupportTicketForm } from "@/components/support/support-ticket-form";
import { SiteFooter } from "@/components/site/footer";
import { SiteHeader } from "@/components/site/header";
import { BRAND } from "@/lib/constants";

export const metadata = {
  title: "Contact BuddyBin Support",
  description:
    "Create a BuddyBin support ticket and our team will review your enquiry. We aim to reply by email or telephone within 24 hours.",
};

export default function ContactPage() {
  return (
    <>
      <SiteHeader />
      <main className="bg-buddy-pale">
        <section className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6 sm:py-12 lg:grid-cols-[0.75fr_1.25fr] lg:px-8">
          <div>
            <p className="font-bold uppercase tracking-[0.18em] text-buddy-green">
              Support
            </p>
            <h1 className="mt-3 text-3xl font-black text-buddy-navy sm:text-5xl">
              Contact support
            </h1>
            <p className="mt-4 text-base leading-7 text-slate-700 sm:text-lg">
              Create a support ticket and our team will review your enquiry.
            </p>
            <p className="mt-5 font-bold text-buddy-navy">
              Email:{" "}
              <a href="mailto:support@buddybin.co.uk" className="text-buddy-blue">
                support@buddybin.co.uk
              </a>
            </p>
          </div>
          <div className="rounded-lg border border-buddy-border bg-white p-5 shadow-sm sm:p-6">
            <h2 className="text-2xl font-black text-buddy-navy">
              Create a support ticket
            </h2>
            <p className="mt-2 text-slate-600">{BRAND.legalArrangement}</p>
            <div className="mt-6">
              <SupportTicketForm />
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
