/**
 * @masseurmatch/billing
 *
 * Plans, the provider boundary, and the grace-period rules that decide whether
 * a subscription still entitles a public listing.
 *
 * Adapters (`providers/*`) are intentionally **not** re-exported here. They are
 * reached only through `getProvider()`, so an application file cannot import
 * `AuthorizeNetProvider` directly and quietly couple itself to one processor.
 */

export * from "./plans";
export * from "./provider";
export { getProvider } from "./providers/registry";
