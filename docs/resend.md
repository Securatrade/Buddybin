# Resend Setup

1. Create a Resend account.
2. Verify the sending domain or support email address.
3. Add environment variables:

```text
RESEND_API_KEY
SUPPORT_EMAIL
ADMIN_NOTIFICATION_EMAIL
```

BuddyBin sends:

- Payment and signup received
- Awaiting cleaner
- Cleaner confirmed
- Subscription cancelled
- Payment failed
- Contact message acknowledgement
- Admin new-customer notification
- Admin new-message notification

Emails are branded HTML templates with a white background, navy headings and green buttons.
