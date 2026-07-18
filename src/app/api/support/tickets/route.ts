import { env } from "@/lib/env";
import { emailTemplates } from "@/lib/email/templates";
import { sendEmail } from "@/lib/email/send";
import { storePublicSupportTicket } from "@/lib/database";
import { logger } from "@/lib/logger";
import { checkRateLimit } from "@/lib/rate-limit";
import { publicSupportTicketSchema } from "@/lib/schemas";
import { getClientIp } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const limiter = checkRateLimit({
    key: `support-ticket:${getClientIp(request)}`,
    limit: 4,
    windowMs: 60 * 60 * 1000,
  });

  if (!limiter.allowed) {
    return Response.json(
      { error: "Please wait before creating another support ticket." },
      { status: 429 },
    );
  }

  const parsed = publicSupportTicketSchema.safeParse(await request.json());
  if (!parsed.success) {
    return Response.json(
      { error: "Please check your support ticket details." },
      { status: 400 },
    );
  }

  if (parsed.data.company) {
    return Response.json({ ok: true, ticketReference: "BB-PENDING" });
  }

  try {
    const ticket = await storePublicSupportTicket(parsed.data);

    await Promise.all([
      sendEmail({
        to: parsed.data.email,
        subject: `BuddyBin support ticket received: ${ticket.ticket_reference}`,
        html: emailTemplates.contactAcknowledgement({
          name: parsed.data.name,
          subject: parsed.data.subject,
          ticketReference: ticket.ticket_reference,
        }),
      }),
      sendEmail({
        to: env("ADMIN_NOTIFICATION_EMAIL", { optional: true }) || env("SUPPORT_EMAIL"),
        subject: `New BuddyBin Support Ticket: ${ticket.ticket_reference} ${parsed.data.subject}`,
        html: emailTemplates.adminNewMessage({
          ticketReference: ticket.ticket_reference,
          name: parsed.data.name,
          email: parsed.data.email,
          telephone: parsed.data.telephone,
          subject: parsed.data.subject,
          message: parsed.data.message,
        }),
      }),
    ]);

    return Response.json({ ok: true, ticketReference: ticket.ticket_reference });
  } catch (error) {
    logger.error("Support ticket creation failed", {
      message: error instanceof Error ? error.message : "Unknown error",
    });
    return Response.json(
      { error: "Support ticket could not be created. Please try again." },
      { status: 500 },
    );
  }
}
