import { randomInt, randomUUID } from "node:crypto";

import { createServiceClient } from "@masseurmatch/db/client";
import { createSessionClient } from "@masseurmatch/db/auth";
import type { Json } from "@masseurmatch/db";
import { NextResponse } from "next/server";

import { rateLimit } from "@/lib/rate-limit";

const CHALLENGE_TTL_MS = 30 * 60 * 1000;

/**
 * Start an identity verification flow.
 *
 * Returns a verification ID and challenge code used to verify document ownership.
 * Documents uploaded in this session are tied to this verification ID.
 *
 * If an active verification exists, it is cancelled and documents are removed.
 * This prevents orphaned documents.
 */

export async function POST() {
  try {
    const {
      data: { user },
    } = await createSessionClient().auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Rate limit per user: 5 starts per hour
    const limited = rateLimit(
      `identity-start:${user.id}`,
      5,
      60 * 60 * 1000,
    );
    if (!limited.ok) {
      return NextResponse.json(
        { error: "Too many verification attempts. Please wait an hour before trying again." },
        { status: 429 },
      );
    }

    const supabase = createServiceClient();

    // Get or create the profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: "Profile not found. Complete onboarding first." },
        { status: 404 },
      );
    }

    const now = new Date();
    const nowIso = now.toISOString();
    const expiresAt = new Date(now.getTime() + CHALLENGE_TTL_MS).toISOString();

    // Cancel any active verifications and clean up their documents
    const { data: activeAttempts } = await supabase
      .from("identity_verifications")
      .select("id, metadata")
      .eq("user_id", user.id)
      .eq("provider", "manual")
      .in("status", ["not_started", "pending"]);

    if (activeAttempts && activeAttempts.length > 0) {
      // Clean up old documents
      const pathsToRemove: string[] = [];
      for (const attempt of activeAttempts) {
        const metadata = attempt.metadata as Record<string, unknown> | null;
        if (!metadata?.manual) continue;
        const manual = metadata.manual as Record<string, unknown>;
        const files = manual.files as Record<string, unknown> | undefined;
        if (!files) continue;
        for (const fileData of Object.values(files)) {
          if (!fileData || typeof fileData !== "object") continue;
          const path = (fileData as Record<string, unknown>).path;
          if (typeof path === "string") pathsToRemove.push(path);
        }
      }

      if (pathsToRemove.length > 0) {
        await supabase.storage
          .from("identity-documents")
          .remove(pathsToRemove);
      }

      // Mark old verifications as canceled
      await supabase
        .from("identity_verifications")
        .update({ status: "canceled", updated_at: nowIso })
        .eq("user_id", user.id)
        .eq("provider", "manual")
        .in("status", ["not_started", "pending"]);
    }

    const verificationId = randomUUID();
    const challengeCode = String(randomInt(100000, 1000000));
    const metadata = {
      manual: {
        version: 1,
        challengeCode,
        expiresAt,
        files: {},
        submittedAt: null,
      },
    };

    const { error: insertError } = await supabase
      .from("identity_verifications")
      .insert({
        id: verificationId,
        user_id: user.id,
        profile_id: profile.id,
        provider: "manual",
        status: "not_started",
        last_error: null,
        metadata: metadata as Json,
        updated_at: nowIso,
      });

    if (insertError) {
      return NextResponse.json(
        { error: "Could not start verification." },
        { status: 500 },
      );
    }

    return NextResponse.json({
      ok: true,
      verificationId,
      challengeCode,
      expiresAt,
    });
  } catch (error) {
    console.error("Identity verification start error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

/**
 * GET /api/provider/verification/identity/manual/start
 *
 * Retrieve the current verification challenge if one exists and is still active.
 */
export async function GET(request: Request) {
  try {
    const {
      data: { user },
    } = await createSessionClient().auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(request.url);
    const verificationId = url.searchParams.get("verificationId")?.trim() ?? "";
    if (!verificationId) {
      return NextResponse.json(
        { error: "verificationId is required" },
        { status: 400 },
      );
    }

    const supabase = createServiceClient();
    const { data: verification, error } = await supabase
      .from("identity_verifications")
      .select("id, user_id, provider, status, metadata")
      .eq("id", verificationId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (error || !verification || verification.provider !== "manual") {
      return NextResponse.json(
        { error: "Verification not found" },
        { status: 404 },
      );
    }

    if (!["not_started", "pending"].includes(verification.status as string)) {
      return NextResponse.json(
        { error: "Verification is no longer active" },
        { status: 409 },
      );
    }

    const metadata = verification.metadata as Record<string, unknown> | null;
    if (!metadata?.manual) {
      return NextResponse.json(
        { error: "Verification challenge unavailable" },
        { status: 409 },
      );
    }

    const manual = metadata.manual as Record<string, unknown>;
    const challengeCode = typeof manual.challengeCode === "string" ? manual.challengeCode : "";
    const expiresAt = typeof manual.expiresAt === "string" ? manual.expiresAt : "";

    if (!challengeCode || !expiresAt) {
      return NextResponse.json(
        { error: "Verification challenge unavailable" },
        { status: 409 },
      );
    }

    if (new Date(expiresAt) <= new Date()) {
      return NextResponse.json(
        { error: "Verification challenge expired" },
        { status: 410 },
      );
    }

    return NextResponse.json({
      ok: true,
      verificationId,
      challengeCode,
      expiresAt,
    });
  } catch (error) {
    console.error("Identity verification GET error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
