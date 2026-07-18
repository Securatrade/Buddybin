import { requireAdmin } from "@/lib/admin/session";
import { markMessageRead } from "@/lib/database";

export const dynamic = "force-dynamic";

export async function POST(
  _request: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  await requireAdmin();
  const { id } = await ctx.params;
  await markMessageRead(id);
  return Response.json({ ok: true });
}
