/**
 * Types for `origin.mjs`.
 *
 * The implementation is `.mjs` because `next.config.mjs` imports it and Next
 * reads that file with plain Node, which cannot load TypeScript — the same
 * reason `security-headers` is `.mjs`. This declaration is what lets the
 * TypeScript call sites in both apps import it without `allowJs`.
 */
export declare function normaliseOrigin(value: string | undefined | null): string | null;
