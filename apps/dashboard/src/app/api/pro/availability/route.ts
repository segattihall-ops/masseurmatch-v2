import { getViewer } from "@masseurmatch/db/auth";
import { HIDDEN, PUBLIC } from "@masseurmatch/db/visibility";
import { revalidatePath } from "next/cache";

import { updateModerationState } from "@/lib/profile";

export const dynamic = "force-dynamic";

export async function POST(request: Request): Promise<Response> {
  try {
    const viewer = await getViewer();
    if (!viewer) {
      return Response.json({ ok: false, error: "Not authenticated" }, { status: 401 });
    }
    if (viewer.role !== "provider" && viewer.role !== "admin") {
      return Response.json({ ok: false, error: "Not authorized" }, { status: 403 });
    }

    const body = await request.json();
    const { status } = body as { status?: unknown };
    if (status !== "hidden" && status !== "available") {
      return Response.json({ ok: false, error: "Invalid availability status" }, { status: 400 });
    }

    const visibilityStatus = status === "hidden" ? HIDDEN : PUBLIC;
    const written = await updateModerationState(viewer.user.id, {
      visibility_status: visibilityStatus,
    });

    if (written === 0) {
      return Response.json({ ok: false, error: "Profile not found" }, { status: 404 });
    }

    revalidatePath("/", "layout");

    const message =
      status === "hidden"
        ? "Your profile is hidden from search and discovery."
        : "Your profile is discoverable again.";

    return Response.json({ ok: true, message });
  } catch (error) {
    console.error("Availability toggle error:", error);
    return Response.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Failed to update",
      },
      { status: 500 },
    );
  }
}
