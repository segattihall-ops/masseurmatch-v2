import { notFound, permanentRedirect } from "next/navigation";

const LEGACY_MODALITY_TARGETS: Record<string, string> = {
  "deep-tissue-massage-guide": "/services/deep-tissue",
  "swedish-massage-benefits-guide": "/services/swedish",
  "sports-massage-for-athletes": "/services/sports",
  "thai-massage-traditional-guide": "/services/thai",
};

/**
 * Preserve OLD modality-guide backlinks without republishing medical claims
 * that are no longer part of the reviewed V2 content. Each known guide lands on
 * the maintained service resource for the same modality; unknown slugs 404.
 */
export default function LegacyModalityGuidePage({ params }: { params: { slug: string } }) {
  const target = LEGACY_MODALITY_TARGETS[params.slug];
  if (!target) notFound();
  permanentRedirect(target);
}
