/**
 * @masseurmatch/billing
 *
 * Plans, the provider boundary, and the grace-period rules that decide whether
 * a subscription still entitles a public listing.
 *
 * Adapters (`providers/*`) are intentionally **not** re-exported here. They are
 * reached only through `getProvider()`, so an application file cannot import
 * `AuthorizeNetProvider` directly and quietly couple itself to one processor.
 *
 * PayPal configuration validation is also intentionally omitted from this
 * general entrypoint. It reads server credentials and is exposed through the
 * dedicated `@masseurmatch/billing/paypal-plan-configuration` subpath instead.
 */

export * from "./plans";
export * from "./features";
export * from "./provider";
export * from "./transitions";
export { getProvider } from "./providers/registry";
