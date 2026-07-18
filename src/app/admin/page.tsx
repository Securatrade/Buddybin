import { AdminLoginForm } from "@/components/admin/admin-login-form";
import { AdminShell } from "@/components/admin/admin-shell";
import { getAdminDashboard } from "@/lib/database";
import { isAdminRequest } from "@/lib/admin/session";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Admin",
};

const labels = [
  ["totalCustomers", "Total customers"],
  ["awaitingCleaner", "Awaiting cleaner"],
  ["confirmed", "Confirmed"],
  ["cancelled", "Cancelled"],
  ["activeSubscriptions", "Active subscriptions"],
  ["pastDueSubscriptions", "Past-due subscriptions"],
  ["unreadMessages", "Unread messages"],
] as const;

export default async function AdminPage() {
  const admin = await isAdminRequest();

  if (!admin) {
    return (
      <main className="min-h-screen bg-buddy-pale">
        <div className="mx-auto grid max-w-5xl gap-10 px-4 py-16 sm:px-6 md:grid-cols-[1fr_420px]">
          <div>
            <p className="font-bold uppercase tracking-[0.18em] text-buddy-green">
              Admin
            </p>
            <h1 className="mt-3 text-4xl font-black text-buddy-navy sm:text-5xl">
              BuddyBin admin area
            </h1>
            <p className="mt-5 text-lg leading-8 text-slate-600">
              Enter the launch PIN. Failed attempts are rate-limited and logged
              without storing entered PINs.
            </p>
          </div>
          <AdminLoginForm />
        </div>
      </main>
    );
  }

  const dashboard = await getAdminDashboard();

  return (
    <AdminShell>
      <section>
        <h1 className="text-3xl font-black text-buddy-navy">Dashboard</h1>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {labels.map(([key, label]) => (
            <article key={key} className="rounded-2xl border border-buddy-border bg-white p-5 shadow-sm">
              <p className="text-sm font-bold text-slate-500">{label}</p>
              <p className="mt-3 text-4xl font-black text-buddy-navy">
                {dashboard[key]}
              </p>
            </article>
          ))}
        </div>
      </section>
    </AdminShell>
  );
}
