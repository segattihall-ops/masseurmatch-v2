/**
 * GENERATED FILE — do not edit by hand.
 *
 * Regenerate against the remote project:
 *   SUPABASE_PROJECT_ID=<project-ref> pnpm --filter @masseurmatch/db generate
 *
 * …or against a local stack (`supabase start`):
 *   pnpm --filter @masseurmatch/db generate:local
 *
 * The committed version below is the empty scaffold produced before any schema
 * has been introduced in this repository. It is shaped exactly like the
 * Supabase CLI output, so regenerating overwrites it cleanly and every
 * consumer of `Tables<…>` / `TablesInsert<…>` keeps compiling.
 */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: Record<
      never,
      {
        Row: Record<string, unknown>;
        Insert: Record<string, unknown>;
        Update: Record<string, unknown>;
        Relationships: [];
      }
    >;
    Views: Record<
      never,
      {
        Row: Record<string, unknown>;
        Relationships: [];
      }
    >;
    Functions: Record<
      never,
      {
        Args: Record<string, unknown>;
        Returns: unknown;
      }
    >;
    Enums: Record<never, string>;
    CompositeTypes: Record<never, Record<string, unknown>>;
  };
};
