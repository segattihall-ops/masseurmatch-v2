import { activeProviderId, type PaymentProvider, type ProviderId } from "../provider";

import { authorizeNetProvider } from "./authorizenet";
import { payPalProvider } from "./paypal";

/**
 * The only way to reach an adapter.
 *
 * Keeping construction here means application code names a capability, not a
 * processor. Adding a third provider touches this file and nothing upstream.
 */
const PROVIDERS: Record<ProviderId, PaymentProvider> = {
  authorizenet: authorizeNetProvider,
  paypal: payPalProvider,
};

export function getProvider(id: ProviderId = activeProviderId()): PaymentProvider {
  return PROVIDERS[id];
}
