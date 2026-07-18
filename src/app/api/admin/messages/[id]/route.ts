import { requireAdmin } from "@/lib/admin/session";
import { updateSupportTicket } from "@/lib/database";
import { supportTicketUpdateSchema } from "@/lib/schemas";

export const dynamic = "force-dynamic";

export async function PATCH(
  request: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  await requireAdmin();
  const { id } = await ctx.params;
  const parsed = supportTicketUpdateSchema.safeParse(await request.json());

  if (!parsed.success) {
    return Response.json({ error: "Please check the ticket update." }, { status: 400 });
  }

  await updateSupportTicket({
    messageId: id,
    status: parsed.data.status,
    internalNotes: parsed.data.internalNotes,
  });

  return Response.json({ ok: true });
}
