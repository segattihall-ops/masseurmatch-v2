"use client";

import { Button, Input } from "@masseurmatch/ui";
import { useCallback, useRef, useState } from "react";

const DOCUMENT_TYPES = [
  { value: "drivers_license", label: "Driver's License" },
  { value: "passport", label: "Passport" },
  { value: "state_id", label: "State ID" },
  { value: "military_id", label: "Military ID" },
];

const COUNTRIES = [
  { value: "US", label: "United States" },
  { value: "CA", label: "Canada" },
  { value: "MX", label: "Mexico" },
  { value: "GB", label: "United Kingdom" },
  { value: "AU", label: "Australia" },
];

type VerificationStage = "not_started" | "uploading" | "reviewing" | "error";

export function VerifyIdForm({ verificationStatus }: { verificationStatus: string }) {
  const [stage, setStage] = useState<VerificationStage>("not_started");
  const [error, setError] = useState<string | null>(null);
  const [documentType, setDocumentType] = useState("drivers_license");
  const [documentCountry, setDocumentCountry] = useState("US");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const idFrontInputRef = useRef<HTMLInputElement>(null);
  const idBackInputRef = useRef<HTMLInputElement>(null);
  const selfieInputRef = useRef<HTMLInputElement>(null);

  const [uploadedFiles, setUploadedFiles] = useState<{
    id_front?: File;
    id_back?: File;
    selfie?: File;
  }>({});

  const handleFileSelect = useCallback(
    (kind: "id_front" | "id_back" | "selfie", file: File | null) => {
      if (file) {
        setUploadedFiles((prev) => ({ ...prev, [kind]: file }));
        setError(null);
      }
    },
    [],
  );

  const handleStartVerification = async () => {
    try {
      setIsSubmitting(true);
      setError(null);

      const response = await fetch("/api/provider/verification/identity/manual/start", {
        method: "POST",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to start verification");
      }

      const data = await response.json();
      setStage("uploading");
      // Store verification ID for later use
      sessionStorage.setItem("verificationId", data.verificationId);
      sessionStorage.setItem("challengeCode", data.challengeCode);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setStage("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (kind: "id_front" | "id_back" | "selfie") => {
    const inputRef =
      kind === "id_front" ? idFrontInputRef : kind === "id_back" ? idBackInputRef : selfieInputRef;
    const file = inputRef.current?.files?.[0] || null;
    handleFileSelect(kind, file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setIsSubmitting(true);
      setError(null);

      const verificationId = sessionStorage.getItem("verificationId");
      if (!verificationId) {
        throw new Error("Verification not started");
      }

      // Upload files
      if (!uploadedFiles.id_front) throw new Error("Front of ID is required");
      if (!uploadedFiles.selfie) throw new Error("Selfie is required");
      if (documentType !== "passport" && !uploadedFiles.id_back) {
        throw new Error("Back of ID is required");
      }

      for (const [kind, file] of Object.entries(uploadedFiles)) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("verificationId", verificationId);
        formData.append("kind", kind);

        const response = await fetch("/api/provider/verification/identity/manual/upload", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Upload failed");
        }
      }

      // Submit verification
      const submitResponse = await fetch("/api/provider/verification/identity/manual/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          verificationId,
          documentType,
          documentCountry,
        }),
      });

      if (!submitResponse.ok) {
        const data = await submitResponse.json();
        throw new Error(data.error || "Submission failed");
      }

      setStage("reviewing");
      sessionStorage.removeItem("verificationId");
      sessionStorage.removeItem("challengeCode");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setStage("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (verificationStatus === "approved") {
    return (
      <div className="rounded-lg bg-green-50 p-4 text-sm text-green-900">
        <p className="font-medium">Identity verified</p>
        <p className="mt-1">Your verification badge is active on your listing.</p>
      </div>
    );
  }

  if (stage === "reviewing") {
    return (
      <div className="space-y-4">
        <div className="rounded-lg bg-blue-50 p-4 text-sm text-blue-900">
          <p className="font-medium">✓ Verification submitted</p>
          <p className="mt-1">
            We&apos;ve received your documents. Our team will review them within 1–3 business days.
          </p>
        </div>
        <Button onClick={handleStartVerification} variant="outline" className="w-full">
          Submit another verification
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {stage === "not_started" ? (
        <div className="space-y-4">
          <Button onClick={handleStartVerification} disabled={isSubmitting} className="w-full">
            {isSubmitting ? "Starting…" : "Start verification"}
          </Button>
        </div>
      ) : stage === "uploading" ? (
        <>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-ink">Document type</label>
              <select
                value={documentType}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                  setDocumentType(e.target.value)
                }
                disabled={isSubmitting}
                className="mt-1 w-full rounded-md border border-ink/20 bg-bg px-3 py-2 text-ink"
              >
                {DOCUMENT_TYPES.map((dt) => (
                  <option key={dt.value} value={dt.value}>
                    {dt.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-ink">Issuing country</label>
              <select
                value={documentCountry}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                  setDocumentCountry(e.target.value)
                }
                disabled={isSubmitting}
                className="mt-1 w-full rounded-md border border-ink/20 bg-bg px-3 py-2 text-ink"
              >
                {COUNTRIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-ink">Front of ID *</label>
              <Input
                ref={idFrontInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                disabled={isSubmitting}
                onChange={() => handleFileChange("id_front")}
              />
              {uploadedFiles.id_front && (
                <p className="text-xs text-green-600">✓ {uploadedFiles.id_front.name}</p>
              )}
            </div>

            {documentType !== "passport" && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-ink">Back of ID *</label>
                <Input
                  ref={idBackInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  disabled={isSubmitting}
                  onChange={() => handleFileChange("id_back")}
                />
                {uploadedFiles.id_back && (
                  <p className="text-xs text-green-600">✓ {uploadedFiles.id_back.name}</p>
                )}
              </div>
            )}

            <div className="space-y-2">
              <label className="block text-sm font-medium text-ink">Current selfie *</label>
              <Input
                ref={selfieInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                disabled={isSubmitting}
                onChange={() => handleFileChange("selfie")}
              />
              {uploadedFiles.selfie && (
                <p className="text-xs text-green-600">✓ {uploadedFiles.selfie.name}</p>
              )}
            </div>

            {error && <p className="text-sm text-wine">{error}</p>}

            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? "Submitting…" : "Submit for review"}
            </Button>
          </div>
        </>
      ) : null}
    </form>
  );
}
