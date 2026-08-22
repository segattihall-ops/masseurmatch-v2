import "server-only";

import { createServiceClient } from "@masseurmatch/db/client";
import type { Json } from "@masseurmatch/db/types";

/**
 * Persist an admin action before or alongside the privileged mutation it
 * describes. New operational tools use this shared writer so restored legacy
 * functionality keeps the same audit guarantees as moderation and tickets.
 */
export async function recordAdminAudit({
  adminId,
  action,
  targetType,
  targetId,
  reason,
  details = {},
}: {
  adminId: string;
  action: string;
  targetType: string;
  targetId?: string | null;
  reason: string;
  details?: Json;
}): Promise<void> {
  const { error } = await createServiceClient()
    .from("audit_log")
    .insert({
      admin_id: adminId,
      admin_user_id: adminId,
      action,
      target_type: targetType,
      target_id: targetId ?? null,
      reason,
      details,
    });

  if (error) throw new Error(`Could not write audit log: ${error.message}`);
}
