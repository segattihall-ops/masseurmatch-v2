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
 *
 * The row/insert/update helpers come straight from the generated file, so they
 * keep supporting the `{ schema: … }` option form for non-public schemas.
 */
export type {
  CompositeTypes,
  Database,
  Enums,
  Json,
  Tables,
  TablesInsert,
  TablesUpdate,
} from "./types";

export { Constants } from "./types";

import type { Database } from "./types";

/** Schema names available on the project. */
export type SchemaName = Exclude<keyof Database, "__InternalSupabase">;

type PublicSchema = Database["public"];

/** Names of every table in the `public` schema. */
export type TableName = keyof PublicSchema["Tables"];

/** Names of every view in the `public` schema. */
export type ViewName = keyof PublicSchema["Views"];

/** Names of every Postgres function exposed through PostgREST. */
export type FunctionName = keyof PublicSchema["Functions"];

/** Arguments of an RPC function, e.g. `FunctionArgs<"current_user_role">`. */
export type FunctionArgs<T extends FunctionName> = PublicSchema["Functions"][T]["Args"];

/** Return type of an RPC function, e.g. `FunctionReturns<"current_user_role">`. */
export type FunctionReturns<T extends FunctionName> = PublicSchema["Functions"][T]["Returns"];
