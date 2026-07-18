import { redirect } from "next/navigation";
import { AccountContactForm } from "@/components/account/contact-form";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { OPERATIONAL_STATUS_CONTENT, type OperationalStatus } from "@/lib/constants";
import { getAccountSnapshot } from "@/lib/database";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Account",
};

export default async function AccountPage() {
  let supabase;

  try {
    supabase = await createSupabaseServerClient();
  } catch {
    return (
      <PortalFrame>
        <StatusPanel
          status="awaiting_cleaner"
          override="Customer login is not configured yet. Add Supabase environment variables before launch."
        />
      </PortalFrame>
    );
  }

  const { data } = await supabase.auth.getUser();
  if (!data.user) {
    redirect("/login?redirect=/account");
  }

  const account = await getAccountSnapshot(data.user.id);
  const plans = Array.isArray(account?.customer_plans)
    ? account.customer_plans
    : account?.customer_plans
      ? [account.customer_plans]
      : [];
  const plan = plans[0];
  const status = (plan?.operational_status || "awaiting_cleaner") as OperationalStatus;

  return (
    <PortalFrame>
      <StatusPanel status={status} />
      <section id="contact" className="rounded-[28px] border border-buddy-border bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-black text-buddy-navy">Contact us</h2>
        <p className="mt-2 text-slate-600">
          Your customer details are attached securely on the server.
        </p>
        <div className="mt-6">
          <AccountContactForm />
        </div>
      </section>
    </PortalFrame>
  );
}

function PortalFrame({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-buddy-pale">
      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Logo />
          <nav className="flex items-center gap-2 text-sm font-bold text-buddy-navy">
            <a href="#status" className="rounded-full px-3 py-2 hover:bg-white">
              Status
            </a>
            <a href="#contact" className="rounded-full px-3 py-2 hover:bg-white">
              Contact us
            </a>
            <form action="/api/auth/logout" method="post">
              <Button type="submit" size="sm" variant="secondary">
                Log out
              </Button>
            </form>
          </nav>
        </div>
        <div className="mt-8 grid gap-6">{children}</div>
      </div>
    </main>
  );
}

function StatusPanel({
  status,
  override,
}: {
  status: OperationalStatus;
  override?: string;
}) {
  const content = OPERATIONAL_STATUS_CONTENT[status];
  const toneClass =
    content.tone === "green"
      ? "border-green-200 bg-green-50 text-green-800"
      : content.tone === "red"
        ? "border-red-200 bg-red-50 text-red-800"
        : "border-amber-200 bg-amber-50 text-amber-800";

  return (
    <section id="status" className="rounded-[28px] border border-buddy-border bg-white p-6 shadow-sm">
      <h1 className="text-3xl font-black text-buddy-navy">BuddyBin</h1>
      <div className={cn("mt-5 rounded-2xl border px-4 py-3 font-black", toneClass)}>
        Status: {content.label}
      </div>
      <p className="mt-4 text-lg leading-8 text-slate-700">
        {override || content.description}
      </p>
    </section>
  );
}
