import Link from "next/link";
import { AdminShell } from "@/components/admin/admin-shell";
import { MarkMessageReadButton } from "@/components/admin/message-actions";
import { requireAdmin } from "@/lib/admin/session";
import { getAdminMessages } from "@/lib/database";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Admin Messages",
};

export default async function AdminMessagesPage() {
  await requireAdmin();
  const messages = await getAdminMessages();

  return (
    <AdminShell>
      <section>
        <h1 className="text-3xl font-black text-buddy-navy">Contact messages</h1>
        <div className="mt-6 grid gap-4">
          {messages.map((message) => (
            <article key={message.id} className="rounded-2xl border border-buddy-border bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-bold text-slate-500">
                    {message.is_read ? "Read" : "Unread"} ·{" "}
                    {message.created_at
                      ? new Date(message.created_at).toLocaleString("en-GB")
                      : ""}
                  </p>
                  <h2 className="mt-2 text-xl font-black text-buddy-navy">
                    {message.subject}
                  </h2>
                  <p className="mt-2 text-slate-600">
                    {String(message.message || "").slice(0, 140)}
                    {String(message.message || "").length > 140 ? "..." : ""}
                  </p>
                  <details className="mt-3 rounded-2xl border border-buddy-border bg-buddy-pale p-4">
                    <summary className="cursor-pointer font-bold text-buddy-navy">
                      Open message
                    </summary>
                    <p className="mt-3 whitespace-pre-wrap text-slate-700">
                      {message.message}
                    </p>
                    <p className="mt-3 text-sm text-slate-600">
                      Customer:{" "}
                      <Link
                        href={`/admin/customers/${message.customer_plan_id}`}
                        className="font-bold text-buddy-navy hover:text-buddy-blue"
                      >
                        {message.profiles?.full_name ||
                          message.profiles?.email ||
                          "Open customer"}
                      </Link>
                    </p>
                  </details>
                </div>
                {!message.is_read ? <MarkMessageReadButton messageId={message.id} /> : null}
              </div>
            </article>
          ))}
          {messages.length === 0 ? (
            <p className="rounded-2xl border border-buddy-border bg-white p-6 text-slate-600">
              No messages yet.
            </p>
          ) : null}
        </div>
      </section>
    </AdminShell>
  );
}
