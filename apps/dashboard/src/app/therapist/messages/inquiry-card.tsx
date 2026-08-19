"use client";

import { Button } from "@masseurmatch/ui";
import { useFormState } from "react-dom";

import type { StepState } from "@/app/onboarding/form-state";

import { setInquiryStatus } from "./actions";

type Inquiry = {
  id: string;
  client_name: string | null;
  client_email: string | null;
  client_phone: string | null;
  message: string | null;
  status: string | null;
  created_at: string;
};

export function InquiryCard({ inquiry }: { inquiry: Inquiry }) {
  const [state, formAction] = useFormState<StepState, FormData>(setInquiryStatus, {});
  const status = inquiry.status ?? "new";
  const isNew = status === "new";

  return (
    <div
      className={`rounded-lg border p-4 transition ${
        isNew ? "border-blue-200 bg-blue-50" : "border-border bg-surface"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className={`font-semibold ${isNew ? "text-blue-900" : "text-text-primary"}`}>
            {inquiry.client_name || "Client"}
          </p>
          <p className="text-xs text-text-secondary">
            {new Date(inquiry.created_at).toLocaleString()} · {status}
          </p>
        </div>
        {isNew ? <div className="mt-1 h-3 w-3 flex-shrink-0 rounded-full bg-blue-500" /> : null}
      </div>

      {inquiry.message ? (
        <p className="mt-2 whitespace-pre-wrap text-sm text-text-secondary">{inquiry.message}</p>
      ) : null}

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {inquiry.client_email ? (
          <a
            className="text-sm font-medium text-brand-primary hover:underline"
            href={`mailto:${inquiry.client_email}`}
          >
            Reply by email
          </a>
        ) : null}
        {inquiry.client_phone ? (
          <a
            className="text-sm font-medium text-brand-primary hover:underline"
            href={`tel:${inquiry.client_phone}`}
          >
            Call
          </a>
        ) : null}

        {status !== "responded" ? (
          <form action={formAction}>
            <input type="hidden" name="inquiry_id" value={inquiry.id} />
            <input type="hidden" name="status" value="responded" />
            <Button type="submit" variant="ghost" size="sm">
              Mark responded
            </Button>
          </form>
        ) : null}
        {status !== "archived" ? (
          <form action={formAction}>
            <input type="hidden" name="inquiry_id" value={inquiry.id} />
            <input type="hidden" name="status" value="archived" />
            <Button type="submit" variant="ghost" size="sm">
              Archive
            </Button>
          </form>
        ) : null}
      </div>

      {state.error ? (
        <p role="alert" className="mt-2 text-sm text-wine">
          {state.error}
        </p>
      ) : null}
    </div>
  );
}
