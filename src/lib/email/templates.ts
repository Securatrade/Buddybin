import { BRAND } from "@/lib/constants";

type TemplateInput = {
  name?: string;
  actionUrl?: string;
  message?: string;
  subject?: string;
  ticketReference?: string;
  email?: string;
  telephone?: string;
};

const logoUrl = "/buddybin-logo.png";

function escapeHtml(value?: string) {
  return (value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function shell(title: string, body: string, action?: { label: string; url: string }) {
  return `<!doctype html>
  <html lang="en">
    <body style="margin:0;background:#ffffff;color:#132238;font-family:Arial,Helvetica,sans-serif;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#ffffff;padding:28px 0;">
        <tr>
          <td align="center">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:620px;border:1px solid #DDE8E0;border-radius:18px;overflow:hidden;">
              <tr>
                <td style="padding:28px 32px;background:#F5F9F5;">
                  <img src="${logoUrl}" width="148" alt="BuddyBin" style="display:block;margin-bottom:20px;" />
                  <h1 style="margin:0;color:#061B2F;font-size:28px;line-height:1.2;">${title}</h1>
                </td>
              </tr>
              <tr>
                <td style="padding:28px 32px;font-size:16px;line-height:1.65;">
                  ${body}
                  ${
                    action
                      ? `<p style="margin:28px 0 0;"><a href="${action.url}" style="background:#39B929;color:#ffffff;text-decoration:none;padding:13px 18px;border-radius:999px;font-weight:700;display:inline-block;">${action.label}</a></p>`
                      : ""
                  }
                  <p style="margin:28px 0 0;color:#516070;font-size:14px;">${BRAND.legalArrangement}</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
  </html>`;
}

export const emailTemplates = {
  signupReceived({ name, actionUrl }: TemplateInput) {
    return shell(
      "Payment and signup received",
      `<p>Hi ${name || "there"},</p><p>Your BuddyBin signup has been received. We are checking your details and arranging a local cleaning partner.</p>`,
      actionUrl ? { label: "Open your BuddyBin account", url: actionUrl } : undefined,
    );
  },
  awaitingCleaner({ name }: TemplateInput) {
    return shell(
      "We're arranging your cleaner",
      `<p>Hi ${name || "there"},</p><p>We're arranging your local BuddyBin cleaning partner. We'll email you as soon as everything is confirmed.</p>`,
    );
  },
  cleanerConfirmed({ name }: TemplateInput) {
    return shell(
      "Your BuddyBin partner is confirmed",
      `<p>Hi ${name || "there"},</p><p>Your local BuddyBin cleaning partner has been confirmed.</p>`,
    );
  },
  subscriptionCancelled({ name }: TemplateInput) {
    return shell(
      "Your BuddyBin service is cancelled",
      `<p>Hi ${name || "there"},</p><p>Your BuddyBin service has been cancelled. No further cleanings will be arranged.</p>`,
    );
  },
  paymentFailed({ name, actionUrl }: TemplateInput) {
    return shell(
      "Payment failed",
      `<p>Hi ${name || "there"},</p><p>We could not collect your latest BuddyBin payment. Please update your payment method through Stripe.</p>`,
      actionUrl ? { label: "Review payment", url: actionUrl } : undefined,
    );
  },
  contactAcknowledgement({ name, subject, ticketReference }: TemplateInput) {
    return shell(
      "Support ticket received",
      `<p>Hi ${escapeHtml(name) || "there"},</p><p>Thank you for contacting BuddyBin.</p><p>We have received your support ticket and our team will review it. We aim to reply by email or telephone within 24 hours.</p><p><strong>Ticket reference:</strong> ${escapeHtml(ticketReference) || "Pending"}</p><p><strong>Subject:</strong> ${escapeHtml(subject) || "Support enquiry"}</p><p>If you need to add anything else, please contact ${BRAND.supportEmailFallback} and include your ticket reference.</p>`,
    );
  },
  adminNewCustomer({ message }: TemplateInput) {
    return shell("New BuddyBin customer", `<p>${message || "A new customer has completed checkout."}</p>`);
  },
  adminNewMessage({
    name,
    email,
    telephone,
    subject,
    message,
    ticketReference,
  }: TemplateInput) {
    return shell(
      "New BuddyBin support ticket",
      `<p><strong>Ticket reference:</strong> ${escapeHtml(ticketReference) || "Pending"}</p><p><strong>Name:</strong> ${escapeHtml(name) || "Not supplied"}</p><p><strong>Email:</strong> ${escapeHtml(email) || "Not supplied"}</p><p><strong>Telephone:</strong> ${escapeHtml(telephone) || "Not supplied"}</p><p><strong>Subject:</strong> ${escapeHtml(subject) || "Support enquiry"}</p><p style="white-space:pre-wrap;">${escapeHtml(message) || "A customer has sent a support ticket."}</p>`,
    );
  },
};
