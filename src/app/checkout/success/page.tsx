import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { SiteFooter } from "@/components/site/footer";
import { SiteHeader } from "@/components/site/header";
import { ButtonLink } from "@/components/ui/button";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Checkout Received",
};

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const params = await searchParams;

  return (
    <>
      <SiteHeader />
      <main className="bg-white py-16 sm:py-24">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <CheckCircle2 className="mx-auto text-buddy-green" size={64} aria-hidden />
          <h1 className="mt-6 text-4xl font-black text-buddy-navy sm:text-5xl">
            Signup received
          </h1>
          <p className="mt-5 text-lg leading-8 text-slate-600">
            Stripe is confirming your subscription. The webhook is the
            authoritative payment confirmation, so your account status may take
            a moment to update.
          </p>
          {params.session_id ? (
            <p className="mt-4 rounded-2xl bg-buddy-pale px-4 py-3 text-sm font-semibold text-buddy-navy">
              Checkout session: {params.session_id}
            </p>
          ) : null}
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <ButtonLink href="/login">Log in</ButtonLink>
            <Link
              href="/help"
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-buddy-border px-5 font-bold text-buddy-navy"
            >
              Help
            </Link>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
