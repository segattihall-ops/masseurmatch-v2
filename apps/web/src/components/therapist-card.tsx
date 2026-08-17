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
  variant = "directory",
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
  /**
   * Homepage cards use a portrait-forward ratio for better placement of real
   * therapist photography. Directory/search cards retain the established 4:3
   * presentation to avoid changing unrelated surfaces.
   */
  variant?: "directory" | "home";
}) {
  const Heading = `h${headingLevel}` as "h2" | "h3";
  const name = therapistName(therapist);
  const href = profilePath(therapist);
  const photo = therapist.avatar_url ?? therapist.photo_url;
  const services = (therapist.service_categories ?? []).slice(0, variant === "home" ? 2 : 3);
  const isHome = variant === "home";

  const body = (
    <Card
      className={`h-full overflow-hidden ${
        isHome
          ? "border-border-subtle bg-gradient-to-b from-bg-surface to-bg-subtle shadow-ds-sm transition duration-300 hover:-translate-y-1 hover:shadow-ds-md"
          : ""
      }`}
    >
      <div
        className={`relative overflow-hidden bg-bg-subtle ${
          isHome ? "aspect-[3/4]" : "aspect-[4/3] rounded-t-3xl"
        }`}
      >
        {hasImage(photo) ? (
          <Image
            src={photo}
            alt={name}
            fill
            sizes={
              isHome
                ? "(min-width: 1280px) 390px, (min-width: 1024px) 31vw, (min-width: 640px) 47vw, 92vw"
                : "(min-width: 1024px) 320px, (min-width: 640px) 45vw, 90vw"
            }
            className={`object-cover ${isHome ? "object-[center_24%]" : ""}`}
            priority={priority}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Avatar size="2xl" name={name} />
          </div>
        )}

        {isHome && therapist.is_verified_identity ? (
          <span className="absolute left-4 top-4 rounded-full bg-text-primary/80 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-text-inverse backdrop-blur-sm">
            ID verified
          </span>
        ) : null}
      </div>

      <CardContent className={isHome ? "flex min-h-[220px] flex-col p-5 pt-5" : "space-y-3 p-6"}>
        <div className="space-y-1">
          <Heading className="font-display text-ds-18 font-semibold tracking-tight text-text-primary">
            {name}
          </Heading>
          {therapist.city && therapist.state ? (
            <p className={isHome ? "text-sm font-medium text-brand-secondary" : "text-sm text-text-secondary"}>
              {therapist.city}, {therapist.state}
              {therapist.neighborhood ? ` · ${therapist.neighborhood}` : ""}
            </p>
          ) : null}
        </div>

        {therapist.headline ? (
          <p className={`${isHome ? "mt-3" : ""} line-clamp-2 text-sm leading-6 text-text-secondary`}>
            {therapist.headline}
          </p>
        ) : null}

        {services.length > 0 ? (
          <ul className={`${isHome ? "mt-4" : ""} flex list-none flex-wrap gap-1.5 p-0`}>
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

        <p
          className={`${
            isHome ? "mt-auto border-t border-border-subtle pt-4" : ""
          } flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-text-secondary`}
        >
          {!isHome && therapist.is_verified_identity ? (
            <span className="font-semibold text-badge-verified">ID verified</span>
          ) : null}
          {therapist.offers_incall ? <span>Incall</span> : null}
          {therapist.offers_outcall ? <span>Outcall</span> : null}
          {therapist.incall_price ? (
            <span className={isHome ? "font-semibold text-brand-secondary" : ""}>
              from ${therapist.incall_price}
            </span>
          ) : null}
        </p>
      </CardContent>
    </Card>
  );

  if (!href) return body;

  return (
    <Link
      href={href}
      className={`block h-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
        isHome ? "rounded-[1.5rem]" : "rounded-3xl"
      }`}
    >
      {body}
    </Link>
  );
}
