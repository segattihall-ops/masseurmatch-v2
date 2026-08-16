import Image from "next/image";
import Link from "next/link";
import { Avatar, Card, CardContent } from "@masseurmatch/ui";
import type { TherapistListing } from "@masseurmatch/db/actions/directory-config";
import { profilePath, therapistName } from "@masseurmatch/db/actions/directory-config";

import { hasImage } from "@/lib/cloudinary";

/**
 * Directory card.
 *
 * A therapist with no photo gets the design-system Avatar with their initials —
 * never a stock image standing in for a real person.
 */
export function TherapistCard({
  therapist,
  priority = false,
  headingLevel = 3,
}: {
  therapist: TherapistListing;
  /** Set on the first card above the fold so its image is not lazy-loaded. */
  priority?: boolean;
  /**
   * Heading level for the therapist's name.
   *
   * A card does not know what precedes it, and screen-reader navigation breaks
   * when levels skip. On the home page these sit under a section `<h2>`, so `3`
   * is right; on the city and search pages they follow the `<h1>` directly and
   * need `2`. Default is the more nested case, because a card nested one level
   * deeper is the common one.
   *
   * The visual size is unchanged either way — it comes from the class, not the
   * tag.
   */
  headingLevel?: 2 | 3;
}) {
  const Heading = `h${headingLevel}` as "h2" | "h3";
  const name = therapistName(therapist);
  const href = profilePath(therapist);
  const photo = therapist.avatar_url ?? therapist.photo_url;
  const services = (therapist.service_categories ?? []).slice(0, 3);

  const body = (
    <Card className="h-full">
      <div className="relative aspect-[4/3] overflow-hidden rounded-t-3xl bg-bg-subtle">
        {hasImage(photo) ? (
          <Image
            src={photo}
            alt={name}
            fill
            sizes="(min-width: 1024px) 320px, (min-width: 640px) 45vw, 90vw"
            className="object-cover"
            priority={priority}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Avatar size="2xl" name={name} />
          </div>
        )}
      </div>

      <CardContent className="space-y-3 p-6">
        <div className="space-y-1">
          <Heading className="font-display text-ds-18 font-semibold tracking-tight text-text-primary">
            {name}
          </Heading>
          {therapist.city && therapist.state ? (
            <p className="text-sm text-text-secondary">
              {therapist.city}, {therapist.state}
              {therapist.neighborhood ? ` · ${therapist.neighborhood}` : ""}
            </p>
          ) : null}
        </div>

        {therapist.headline ? (
          <p className="line-clamp-2 text-sm text-text-secondary">{therapist.headline}</p>
        ) : null}

        {services.length > 0 ? (
          <ul className="flex list-none flex-wrap gap-1.5 p-0">
            {services.map((service) => (
              <li
                key={service}
                className="rounded-full bg-brand-soft px-2.5 py-1 text-xs font-medium text-brand-secondary"
              >
                {service}
              </li>
            ))}
          </ul>
        ) : null}

        <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-text-secondary">
          {therapist.is_verified_identity ? (
            <span className="font-semibold text-badge-verified">ID verified</span>
          ) : null}
          {therapist.offers_incall ? <span>Incall</span> : null}
          {therapist.offers_outcall ? <span>Outcall</span> : null}
          {therapist.incall_price ? <span>from ${therapist.incall_price}</span> : null}
        </p>
      </CardContent>
    </Card>
  );

  if (!href) return body;

  return (
    <Link
      href={href}
      className="block rounded-3xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      {body}
    </Link>
  );
}
