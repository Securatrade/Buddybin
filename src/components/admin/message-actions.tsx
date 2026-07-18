"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function MarkMessageReadButton({ messageId }: { messageId: string }) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  async function markRead() {
    setSubmitting(true);
    await fetch(`/api/admin/messages/${messageId}/read`, { method: "POST" });
    router.refresh();
    setSubmitting(false);
  }

  return (
    <Button type="button" variant="secondary" size="sm" onClick={markRead} disabled={submitting}>
      {submitting ? "Saving..." : "Mark read"}
    </Button>
  );
}
