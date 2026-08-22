"use client";

import { cn } from "@masseurmatch/ui";
import * as React from "react";

/**
 * The controls the listing editor is built from.
 *
 * Each one takes its error as a prop rather than reaching for form state, so
 * the same component renders a server-returned error and a live client-side
 * one without knowing which it got.
 */

export function FieldShell({
  label,
  htmlFor,
  hint,
  error,
  required,
  aside,
  children,
}: {
  label: string;
  htmlFor?: string;
  hint?: React.ReactNode;
  error?: string;
  required?: boolean;
  aside?: React.ReactNode;
  children: React.ReactNode;
}) {
  const describedBy = error && htmlFor ? `${htmlFor}-error` : undefined;

  return (
    <div className="space-y-1.5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <label htmlFor={htmlFor} className="text-sm font-semibold text-ink">
          {label}
          {required ? (
            <>
              <span aria-hidden className="ml-0.5 text-wine">
                *
              </span>
              <span className="sr-only"> (required)</span>
            </>
          ) : null}
        </label>
        {aside}
      </div>
      {children}
      {hint ? <p className="text-xs text-text-secondary">{hint}</p> : null}
      {error ? (
        <p id={describedBy} role="alert" className="text-xs font-semibold text-wine">
          {error}
        </p>
      ) : null}
    </div>
  );
}

const controlClass = (invalid?: boolean) =>
  cn(
    "motion-premium h-12 w-full rounded-xl border bg-white/92 px-4 py-3 text-sm text-foreground",
    "shadow-[inset_0_1px_0_rgb(255_255_255/_0.88)]",
    "placeholder:text-muted-foreground/90",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/25 focus-visible:ring-offset-2",
    invalid
      ? "border-wine bg-wine/[0.04]"
      : "border-border/90 focus-visible:border-brand-secondary/35",
  );

export function TextField({
  id,
  label,
  value,
  onChange,
  error,
  hint,
  required,
  maxLength,
  placeholder,
  type = "text",
  inputMode,
  counter,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (next: string) => void;
  error?: string;
  hint?: React.ReactNode;
  required?: boolean;
  maxLength?: number;
  placeholder?: string;
  type?: "text" | "email" | "tel" | "url" | "number";
  inputMode?: "numeric" | "tel";
  counter?: boolean;
}) {
  return (
    <FieldShell
      label={label}
      htmlFor={id}
      hint={hint}
      error={error}
      required={required}
      aside={
        counter && maxLength ? (
          <span className="text-xs tabular-nums text-text-secondary">
            {value.length}/{maxLength}
          </span>
        ) : null
      }
    >
      <input
        id={id}
        type={type}
        inputMode={inputMode}
        value={value}
        maxLength={maxLength}
        placeholder={placeholder}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        onChange={(event) => onChange(event.target.value)}
        className={controlClass(Boolean(error))}
      />
    </FieldShell>
  );
}

export function TextArea({
  id,
  label,
  value,
  onChange,
  error,
  hint,
  maxLength,
  rows = 10,
  placeholder,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (next: string) => void;
  error?: string;
  hint?: React.ReactNode;
  maxLength?: number;
  rows?: number;
  placeholder?: string;
}) {
  return (
    <FieldShell
      label={label}
      htmlFor={id}
      hint={hint}
      error={error}
      aside={
        maxLength ? (
          <span className="text-xs tabular-nums text-text-secondary">
            {value.length}/{maxLength}
          </span>
        ) : null
      }
    >
      <textarea
        id={id}
        rows={rows}
        value={value}
        maxLength={maxLength}
        placeholder={placeholder}
        aria-invalid={error ? true : undefined}
        onChange={(event) => onChange(event.target.value)}
        className={cn(controlClass(Boolean(error)), "h-auto min-h-[10rem] leading-relaxed")}
      />
    </FieldShell>
  );
}

export function SelectField({
  id,
  label,
  value,
  onChange,
  options,
  placeholder = "Select…",
  error,
  hint,
  required,
  format,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (next: string) => void;
  options: readonly (string | number)[];
  placeholder?: string;
  error?: string;
  hint?: React.ReactNode;
  required?: boolean;
  format?: (option: string) => string;
}) {
  return (
    <FieldShell label={label} htmlFor={id} hint={hint} error={error} required={required}>
      <select
        id={id}
        value={value}
        aria-invalid={error ? true : undefined}
        onChange={(event) => onChange(event.target.value)}
        className={cn(controlClass(Boolean(error)), "cursor-pointer")}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={String(option)} value={String(option)}>
            {format ? format(String(option)) : String(option)}
          </option>
        ))}
      </select>
    </FieldShell>
  );
}

export function Toggle({
  id,
  title,
  description,
  checked,
  onChange,
}: {
  id: string;
  title: string;
  description: string;
  checked: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <label
      htmlFor={id}
      className={cn(
        "flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors",
        checked ? "border-brand-secondary/40 bg-brand-soft" : "border-border bg-bg-subtle",
      )}
    >
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="peer sr-only"
      />
      <span
        aria-hidden
        className={cn(
          "relative mt-0.5 h-[26px] w-[50px] shrink-0 rounded-full transition-colors",
          "peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2",
          "peer-focus-visible:outline-brand-secondary",
          checked ? "bg-action-primary" : "bg-border-strong",
        )}
      >
        <span
          className={cn(
            "absolute left-[3px] top-[3px] h-5 w-5 rounded-full bg-white shadow transition-transform",
            checked && "translate-x-6",
          )}
        />
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-semibold text-ink">{title}</span>
        <span className="block text-xs text-text-secondary">{description}</span>
      </span>
    </label>
  );
}

export function CheckGroup({
  label,
  options,
  selected,
  onChange,
  columns = 3,
  filterable,
  hint,
  error,
}: {
  label: string;
  options: readonly string[];
  selected: string[];
  onChange: (next: string[]) => void;
  columns?: 1 | 2 | 3;
  filterable?: boolean;
  hint?: React.ReactNode;
  error?: string;
}) {
  const [filter, setFilter] = React.useState("");
  const term = filter.trim().toLowerCase();
  const visible = term ? options.filter((o) => o.toLowerCase().includes(term)) : options;

  const toggle = (option: string) =>
    onChange(
      selected.includes(option) ? selected.filter((s) => s !== option) : [...selected, option],
    );

  return (
    <fieldset className="space-y-2">
      <div className="flex flex-wrap items-center gap-3">
        <legend className="text-sm font-semibold text-ink">{label}</legend>
        <span
          className={cn(
            "rounded-full border px-2.5 py-0.5 text-xs font-semibold tabular-nums",
            selected.length
              ? "border-brand-secondary/30 bg-brand-soft text-action-primary"
              : "border-border bg-bg-subtle text-text-secondary",
          )}
        >
          {selected.length} of {options.length} selected
        </span>
        {filterable ? (
          <input
            type="search"
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
            placeholder={`Filter ${options.length}…`}
            aria-label={`Filter ${label}`}
            className="h-10 max-w-[20rem] flex-1 rounded-xl border border-border/90 bg-white px-3 text-sm"
          />
        ) : null}
        {selected.length ? (
          <button
            type="button"
            onClick={() => onChange([])}
            className="text-xs font-semibold text-action-primary underline underline-offset-4"
          >
            Clear
          </button>
        ) : null}
      </div>

      <div
        className={cn(
          "grid gap-3",
          columns === 3 && "sm:grid-cols-2 lg:grid-cols-3",
          columns === 2 && "sm:grid-cols-2",
        )}
      >
        {visible.map((option) => {
          const isOn = selected.includes(option);
          return (
            <label
              key={option}
              className={cn(
                "flex cursor-pointer items-center gap-2.5 rounded-xl border px-3.5 py-2.5 text-sm transition-colors",
                isOn
                  ? "border-brand-secondary/45 bg-brand-soft font-semibold text-ink"
                  : "border-border bg-white text-ink hover:border-border-strong",
              )}
            >
              <input
                type="checkbox"
                checked={isOn}
                onChange={() => toggle(option)}
                className="h-4 w-4 shrink-0 accent-[var(--color-action-primary)]"
              />
              <span className="min-w-0">{option}</span>
            </label>
          );
        })}
      </div>

      {visible.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border p-4 text-center text-sm text-text-secondary">
          Nothing matches that filter.
        </p>
      ) : null}
      {hint ? <p className="text-xs text-text-secondary">{hint}</p> : null}
      {error ? (
        <p role="alert" className="text-xs font-semibold text-wine">
          {error}
        </p>
      ) : null}
    </fieldset>
  );
}

/** A repeatable collection: rows, a remove control, and a bounded add. */
export function Repeater<T>({
  label,
  noun,
  rows,
  max,
  blank,
  onChange,
  empty,
  hint,
  renderRow,
}: {
  label: string;
  noun: string;
  rows: T[];
  max: number;
  blank: () => T;
  onChange: (next: T[]) => void;
  empty: string;
  hint?: React.ReactNode;
  renderRow: (row: T, index: number, set: (patch: Partial<T>) => void) => React.ReactNode;
}) {
  return (
    <fieldset className="space-y-3">
      <legend className="text-sm font-semibold text-ink">{label}</legend>
      {hint ? <p className="text-xs text-text-secondary">{hint}</p> : null}

      {rows.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border p-5 text-center text-sm text-text-secondary">
          {empty}
        </p>
      ) : (
        <div className="space-y-3">
          {rows.map((row, index) => (
            <div
              key={index}
              className="relative rounded-xl border border-border bg-bg-subtle p-4 pr-14"
            >
              {renderRow(row, index, (patch) =>
                onChange(rows.map((r, i) => (i === index ? { ...r, ...patch } : r))),
              )}
              <button
                type="button"
                aria-label={`Remove ${noun} ${index + 1}`}
                onClick={() => onChange(rows.filter((_, i) => i !== index))}
                className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full border border-border bg-white text-text-secondary transition-colors hover:border-wine hover:text-wine"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          disabled={rows.length >= max}
          onClick={() => onChange([...rows, blank()])}
          className={cn(
            "inline-flex h-10 items-center gap-2 rounded-lg border border-dashed px-4 text-sm font-semibold transition-colors",
            rows.length >= max
              ? "cursor-not-allowed border-border text-text-secondary opacity-50"
              : "border-border-strong text-ink hover:border-brand-secondary hover:bg-brand-soft hover:text-action-primary",
          )}
        >
          <span aria-hidden>+</span> Add {noun}
        </button>
        <span className="text-xs tabular-nums text-text-secondary">
          {rows.length} of {max}
        </span>
      </div>
    </fieldset>
  );
}

/** A small labelled control inside a repeater row. */
export function RowField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold text-text-secondary">{label}</span>
      {children}
    </label>
  );
}

export function RowInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cn(controlClass(false), "h-11")} />;
}

export function RowSelect({
  options,
  placeholder,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & {
  options: readonly (string | number)[];
  placeholder?: string;
}) {
  return (
    <select {...props} className={cn(controlClass(false), "h-11 cursor-pointer")}>
      {placeholder === undefined ? null : <option value="">{placeholder}</option>}
      {options.map((option) => (
        <option key={String(option)} value={String(option)}>
          {String(option)}
        </option>
      ))}
    </select>
  );
}
