import { getViewer, createSessionClient } from "@masseurmatch/db/auth";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

export async function POST(request: Request): Promise<Response> {
  try {
    const viewer = await getViewer();
    if (!viewer) {
      return Response.json({ ok: false, error: "Not authenticated" }, { status: 401 });
    }

    const body = await request.json();
    const { activate } = body as { activate: boolean };

    const session = createSessionClient();
    const userId = viewer.user.id;

    if (activate) {
      const expires = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      const { error } = await session
        .from("profiles")
        .update({
          available_now: true,
          available_now_expires: expires,
        })
        .eq("user_id", userId);

      if (error) throw error;
    } else {
      const { error } = await session
        .from("profiles")
        .update({ available_now: false })
        .eq("user_id", userId);

      if (error) throw error;
    }

    revalidatePath("/", "layout");

    return Response.json({
      ok: true,
      message: activate ? "Available Now activated" : "Available Now turned off",
    });
  } catch (error) {
    console.error("Available Now toggle error:", error);
    return Response.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Failed to update",
      },
      { status: 500 },
    );
  }
}
