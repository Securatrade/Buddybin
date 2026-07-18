import { AdminShell } from "@/components/admin/admin-shell";
import { PricingEditor } from "@/components/admin/pricing-editor";
import { requireAdmin } from "@/lib/admin/session";
import { getPricingRulesForAdmin } from "@/lib/database";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Admin Pricing",
};

export default async function AdminPricingPage() {
  await requireAdmin();
  const rules = await getPricingRulesForAdmin();

  return (
    <AdminShell>
      <section>
        <h1 className="text-3xl font-black text-buddy-navy">Pricing management</h1>
        <p className="mt-2 max-w-3xl text-slate-600">
          Saving a change creates replacement Stripe Price objects and a new
          pricing-rule version. Existing subscriptions are not moved.
        </p>
        <div className="mt-6">
          <PricingEditor rules={rules} />
        </div>
      </section>
    </AdminShell>
  );
}
