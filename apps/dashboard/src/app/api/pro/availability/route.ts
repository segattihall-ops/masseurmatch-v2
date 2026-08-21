import { getViewer } from "@masseurmatch/db/auth";
import { updateMyProfile } from "@/lib/profile";
import { HIDDEN, PUBLIC } from "@masseurmatch/db/visibility";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

export async function POST(request: Request): Promise<Response> {
  try {
    const viewer = await getViewer();
    if (!viewer) {
      return Response.json({ ok: false, error: "Not authenticated" }, { status: 401 });
    }

    const body = await request.json();
    const { status } = body as { status: "hidden" | "available" };

    const userId = viewer.user.id;
    const visibilityStatus = status === "hidden" ? HIDDEN : PUBLIC;

    const written = await updateMyProfile(userId, {
      visibility_status: visibilityStatus,
    });

    if (written === 0) {
      return Response.json({ ok: false, error: "Profile not found" }, { status: 404 });
    }

    // Revalidate cache
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
