/**
 * @masseurmatch/db — typed surface over the Supabase schema.
 *
 * Types only: no runtime dependency on `@supabase/supabase-js`, so apps stay
 * free to create their own browser/server clients and simply parameterise them
 * with `Database`.
 *
 *   import { createClient } from "@supabase/supabase-js";
 *   import type { Database, Tables } from "@masseurmatch/db";
 *
 *   const supabase = createClient<Database>(url, anonKey);
 *   const therapist: Tables<"therapists"> = …;
 */
export type { Database, Json } from "./types.generated";

import type { Database } from "./types.generated";

/** Schema names available on the project. */
export type SchemaName = keyof Database;

type PublicSchema = Database["public"];

/** Row type of a table or view, e.g. `Tables<"therapists">`. */
export type Tables<T extends keyof PublicSchema["Tables"] | keyof PublicSchema["Views"]> =
  T extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][T]["Row"]
    : T extends keyof PublicSchema["Views"]
      ? PublicSchema["Views"][T]["Row"]
      : never;

/** Insert payload for a table, e.g. `TablesInsert<"therapists">`. */
export type TablesInsert<T extends keyof PublicSchema["Tables"]> =
  PublicSchema["Tables"][T]["Insert"];

/** Update payload for a table, e.g. `TablesUpdate<"therapists">`. */
export type TablesUpdate<T extends keyof PublicSchema["Tables"]> =
  PublicSchema["Tables"][T]["Update"];

/** Postgres enum union, e.g. `Enums<"therapist_status">`. */
export type Enums<T extends keyof PublicSchema["Enums"]> = PublicSchema["Enums"][T];

/** Arguments of a Postgres function exposed through PostgREST. */
export type FunctionArgs<T extends keyof PublicSchema["Functions"]> =
  PublicSchema["Functions"][T]["Args"];

/** Return type of a Postgres function exposed through PostgREST. */
export type FunctionReturns<T extends keyof PublicSchema["Functions"]> =
  PublicSchema["Functions"][T]["Returns"];
