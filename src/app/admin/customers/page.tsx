import Link from "next/link";
import { AdminShell } from "@/components/admin/admin-shell";
import { requireAdmin } from "@/lib/admin/session";
import { getAdminCustomers } from "@/lib/database";
import { formatPence } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Admin Customers",
};

export default async function AdminCustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  await requireAdmin();
  const params = await searchParams;
  const customers = await getAdminCustomers(params.q || "");

  return (
    <AdminShell>
      <section>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-buddy-navy">Customers</h1>
            <p className="mt-2 text-slate-600">Search by name, email, mobile or postcode.</p>
          </div>
          <form className="flex gap-2">
            <input
              name="q"
              defaultValue={params.q || ""}
              className="min-h-12 rounded-full border border-buddy-border px-4"
              placeholder="Search customers"
            />
            <button className="min-h-12 rounded-full bg-buddy-navy px-5 font-bold text-white">
              Search
            </button>
          </form>
        </div>
        <div className="mt-6 overflow-x-auto rounded-2xl border border-buddy-border bg-white shadow-sm">
          <table className="min-w-[1100px] w-full text-left text-sm">
            <thead className="bg-buddy-pale text-buddy-navy">
              <tr>
                {[
                  "Name",
                  "Postcode",
                  "Email",
                  "Mobile",
                  "Number of bins",
                  "Monthly total",
                  "Payment status",
                  "Operational status",
                  "Signup date",
                ].map((heading) => (
                  <th key={heading} className="px-4 py-3 font-black">
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => (
                <tr key={customer.id} className="border-t border-buddy-border">
                  <td className="px-4 py-3 font-bold text-buddy-navy">
                    <Link href={`/admin/customers/${customer.id}`} className="hover:text-buddy-blue">
                      {customer.profiles?.full_name || "Unknown"}
                    </Link>
                  </td>
                  <td className="px-4 py-3">{customer.properties?.postcode || ""}</td>
                  <td className="px-4 py-3">{customer.profiles?.email || ""}</td>
                  <td className="px-4 py-3">{customer.profiles?.mobile || ""}</td>
                  <td className="px-4 py-3">{customer.plan_bins?.length || 0}</td>
                  <td className="px-4 py-3">{formatPence(customer.monthly_total_pence || 0)}</td>
                  <td className="px-4 py-3">{customer.payment_status}</td>
                  <td className="px-4 py-3">{customer.operational_status}</td>
                  <td className="px-4 py-3">
                    {customer.created_at
                      ? new Date(customer.created_at).toLocaleDateString("en-GB")
                      : ""}
                  </td>
                </tr>
              ))}
              {customers.length === 0 ? (
                <tr>
                  <td className="px-4 py-8 text-center text-slate-600" colSpan={9}>
                    No customers found.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </AdminShell>
  );
}
