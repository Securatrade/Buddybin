import Link from "next/link";
import { AdminShell } from "@/components/admin/admin-shell";
import { SupportTicketActions } from "@/components/admin/message-actions";
import { requireAdmin } from "@/lib/admin/session";
import {
  SUPPORT_TICKET_STATUSES,
  SUPPORT_TICKET_STATUS_CONTENT,
  type SupportTicketStatus,
} from "@/lib/constants";
import { getAdminMessages } from "@/lib/database";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Admin Support Tickets",
};

type AdminSupportTicketRow = {
  id: string;
  ticket_reference?: string | null;
  name?: string | null;
  email?: string | null;
  telephone?: string | null;
  subject?: string | null;
  message?: string | null;
  status?: SupportTicketStatus | null;
  source?: string | null;
  internal_notes?: string | null;
  created_at?: string | null;
  customer_plan_id?: string | null;
  profiles?: {
    full_name?: string | null;
    email?: string | null;
    mobile?: string | null;
  } | null;
};

export default async function AdminMessagesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: SupportTicketStatus | "all" }>;
}) {
  await requireAdmin();
  const params = await searchParams;
  const status = params.status || "all";
  const messages = (await getAdminMessages({
    status,
    q: params.q || "",
  })) as AdminSupportTicketRow[];

  return (
    <AdminShell>
      <section>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-buddy-navy">
              Support tickets
            </h1>
            <p className="mt-2 text-slate-600">
              Search by ticket reference, name, email, telephone or subject.
            </p>
          </div>
          <form className="flex flex-wrap gap-2">
            <input
              name="q"
              defaultValue={params.q || ""}
              className="min-h-12 rounded-full border border-buddy-border px-4"
              placeholder="Search tickets"
            />
            <select
              name="status"
              defaultValue={status}
              className="min-h-12 rounded-full border border-buddy-border bg-white px-4"
            >
              <option value="all">All statuses</option>
              {SUPPORT_TICKET_STATUSES.map((value) => (
                <option key={value} value={value}>
                  {SUPPORT_TICKET_STATUS_CONTENT[value].label}
                </option>
              ))}
            </select>
            <button className="min-h-12 rounded-full bg-buddy-navy px-5 font-bold text-white">
              Filter
            </button>
          </form>
        </div>
        <div className="mt-6 grid gap-4">
          {messages.map((message) => (
            <article
              key={message.id}
              className="rounded-2xl border border-buddy-border bg-white p-5 shadow-sm"
            >
              <div className="grid gap-5 lg:grid-cols-[1fr_300px]">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge status={message.status || "new"} />
                    <p className="text-sm font-bold text-slate-500">
                      {message.ticket_reference || "BB-PENDING"} ·{" "}
                      {message.created_at
                        ? new Date(message.created_at).toLocaleString("en-GB")
                        : ""}
                    </p>
                  </div>
                  <h2 className="mt-2 text-xl font-black text-buddy-navy">
                    {message.subject}
                  </h2>
                  <dl className="mt-3 grid gap-2 text-sm text-slate-600 sm:grid-cols-3">
                    <TicketDetail
                      label="Name"
                      value={message.name || message.profiles?.full_name}
                    />
                    <TicketDetail
                      label="Email"
                      value={message.email || message.profiles?.email}
                    />
                    <TicketDetail
                      label="Telephone"
                      value={message.telephone || message.profiles?.mobile}
                    />
                  </dl>
                  <details className="mt-4 rounded-2xl border border-buddy-border bg-buddy-pale p-4">
                    <summary className="cursor-pointer font-bold text-buddy-navy">
                      Open ticket
                    </summary>
                    <p className="mt-3 whitespace-pre-wrap text-slate-700">
                      {message.message}
                    </p>
                    {message.internal_notes ? (
                      <div className="mt-4 rounded-xl bg-white p-3 text-sm text-slate-700">
                        <p className="font-black text-buddy-navy">Internal notes</p>
                        <p className="mt-2 whitespace-pre-wrap">
                          {message.internal_notes}
                        </p>
                      </div>
                    ) : null}
                    {message.customer_plan_id ? (
                      <p className="mt-3 text-sm text-slate-600">
                        Related customer:{" "}
                        <Link
                          href={`/admin/customers/${message.customer_plan_id}`}
                          className="font-bold text-buddy-navy hover:text-buddy-blue"
                        >
                          Open customer
                        </Link>
                      </p>
                    ) : null}
                  </details>
                </div>
                <SupportTicketActions
                  messageId={message.id}
                  currentStatus={message.status || "new"}
                  currentNotes={message.internal_notes}
                />
              </div>
            </article>
          ))}
          {messages.length === 0 ? (
            <p className="rounded-2xl border border-buddy-border bg-white p-6 text-slate-600">
              No support tickets found.
            </p>
          ) : null}
        </div>
      </section>
    </AdminShell>
  );
}

function TicketDetail({
  label,
  value,
}: {
  label: string;
  value?: string | null;
}) {
  return (
    <div>
      <dt className="font-black text-buddy-navy">{label}</dt>
      <dd>{value || "Not supplied"}</dd>
    </div>
  );
}

function StatusBadge({ status }: { status: SupportTicketStatus }) {
  const content = SUPPORT_TICKET_STATUS_CONTENT[status];
  const toneClass =
    content.tone === "green"
      ? "bg-green-50 text-green-800"
      : content.tone === "amber"
        ? "bg-amber-50 text-amber-800"
        : content.tone === "blue"
          ? "bg-blue-50 text-blue-800"
          : "bg-slate-100 text-slate-700";

  return (
    <span className={cn("rounded-full px-3 py-1 text-xs font-black", toneClass)}>
      {content.label}
    </span>
  );
}
