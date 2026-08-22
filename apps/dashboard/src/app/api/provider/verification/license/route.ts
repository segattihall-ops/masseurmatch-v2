import { randomUUID } from "node:crypto";

import { createSessionClient } from "@masseurmatch/db/auth";
import { createServiceClient } from "@masseurmatch/db/client";
import { NextResponse } from "next/server";

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_BYTES = 8 * 1024 * 1024;

function text(data: FormData, key: string, max = 160) {
  return String(data.get(key) ?? "").trim().slice(0, max);
}

function extension(mime: string) {
  if (mime === "image/png") return "png";
  if (mime === "image/webp") return "webp";
  return "jpg";
}

export async function POST(request: Request) {
  const session = createSessionClient();
  const {
    data: { user },
  } = await session.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const data = await request.formData();
  const file = data.get("file") as File | null;
  const holderName = text(data, "holder_name");
  const licenseType = text(data, "license_type");
  const licenseNumber = text(data, "license_number", 100);
  const issuingAuthority = text(data, "issuing_authority");
  const jurisdiction = text(data, "jurisdiction", 80).toUpperCase();
  const issuedOn = text(data, "issued_on", 10) || null;
  const expiresOn = text(data, "expires_on", 10) || null;

  if (!holderName || !licenseType || !licenseNumber || !issuingAuthority || !jurisdiction) {
    return NextResponse.json({ error: "Complete all required license fields." }, { status: 400 });
  }
  if (!file || !ALLOWED_TYPES.has(file.type) || file.size <= 0 || file.size > MAX_BYTES) {
    return NextResponse.json({ error: "Upload a JPEG, PNG, or WebP license image up to 8 MB." }, { status: 400 });
  }

  const service = createServiceClient() as any;
  const { data: profile } = await service
    .from("profiles")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!profile) return NextResponse.json({ error: "Profile not found." }, { status: 404 });

  const { data: pending } = await service
    .from("profile_documents")
    .select("id,storage_path,url")
    .eq("profile_id", profile.id)
    .eq("status", "pending")
    .or("document_type.eq.professional_license,type.eq.professional_license");

  const oldPaths = (pending ?? [])
    .map((row: any) => row.storage_path ?? row.url)
    .filter((value: unknown): value is string => typeof value === "string" && value.length > 0);
  if (oldPaths.length) await service.storage.from("identity-documents").remove(oldPaths);
  if ((pending ?? []).length) {
    await service.from("profile_documents").delete().in("id", pending.map((row: any) => row.id));
  }

  const storagePath = `${user.id}/licenses/${randomUUID()}.${extension(file.type)}`;
  const bytes = new Uint8Array(await file.arrayBuffer());
  const { error: uploadError } = await service.storage
    .from("identity-documents")
    .upload(storagePath, bytes, { contentType: file.type, upsert: false });
  if (uploadError) return NextResponse.json({ error: "Could not upload the license image." }, { status: 500 });

  const { error: insertError } = await service.from("profile_documents").insert({
    profile_id: profile.id,
    type: "professional_license",
    document_type: "professional_license",
    storage_path: storagePath,
    status: "pending",
    holder_name: holderName,
    license_type: licenseType,
    license_number: licenseNumber,
    issuing_authority: issuingAuthority,
    jurisdiction,
    issued_on: issuedOn,
    expires_on: expiresOn,
  });

  if (insertError) {
    await service.storage.from("identity-documents").remove([storagePath]);
    return NextResponse.json({ error: "Could not save the license submission." }, { status: 500 });
  }

  return NextResponse.json({ ok: true, status: "pending" });
}
