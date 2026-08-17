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
   * Homepage cards use the larger editorial composition from the featured
   * profile reference. Directory/search cards retain their established layout.
   */
  variant?: "directory" | "home";
}) {
  const Heading = `h${headingLevel}` as "h2" | "h3";
  const name = therapistName(therapist);
  const href = profilePath(therapist);
  const photo = [therapist.avatar_url, therapist.photo_url].find(hasImage);
  const isHome = variant === "home";
  const services = (therapist.service_categories ?? []).slice(0, 3);

  const body = (
    <Card
      className={`h-full overflow-hidden ${
        isHome
          ? "rounded-[2rem] border-border-subtle bg-bg-surface shadow-ds-sm transition duration-300 hover:-translate-y-1 hover:shadow-ds-md"
          : ""
      }`}
    >
      <div
        className={`relative overflow-hidden bg-bg-subtle ${
          isHome ? "aspect-[4/3]" : "aspect-[4/3] rounded-t-3xl"
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
            className={`object-cover ${isHome ? "object-[50%_24%]" : ""}`}
            priority={priority}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-b from-bg-surface to-bg-subtle">
            <Avatar size="2xl" name={name} />
          </div>
        )}
      </div>

      <CardContent
        className={
          isHome
            ? "flex min-h-[238px] flex-col bg-bg-surface p-6 pt-6 sm:min-h-[250px] sm:p-7 sm:pt-7"
            : "space-y-3 p-6"
        }
      >
        <div className={isHome ? "space-y-2" : "space-y-1"}>
          <Heading
            className={
              isHome
                ? "font-display text-ds-24 font-semibold tracking-tight text-text-primary"
                : "font-display text-ds-18 font-semibold tracking-tight text-text-primary"
            }
          >
            {name}
          </Heading>
          {therapist.city && therapist.state ? (
            <p className={isHome ? "text-base text-text-secondary" : "text-sm text-text-secondary"}>
              {therapist.city}, {therapist.state}
              {therapist.neighborhood ? ` · ${therapist.neighborhood}` : ""}
            </p>
          ) : null}
        </div>

        {therapist.headline ? (
          <p
            className={`${
              isHome ? "mt-5 text-base leading-7" : "text-sm leading-6"
            } line-clamp-2 text-text-secondary`}
          >
            {therapist.headline}
          </p>
        ) : null}

        {services.length > 0 ? (
          <ul className={`${isHome ? "mt-5" : ""} flex list-none flex-wrap gap-2 p-0`}>
            {services.map((service) => (
              <li
                key={service}
                className={
                  isHome
                    ? "rounded-full bg-brand-soft px-3 py-1.5 text-sm font-medium leading-none text-brand-secondary"
                    : "rounded-full bg-brand-soft px-2.5 py-1 text-xs font-medium text-brand-secondary"
                }
              >
                {service}
              </li>
            ))}
          </ul>
        ) : null}

        <p
          className={`${
            isHome ? "mt-auto pt-5 text-sm" : "text-xs"
          } flex flex-wrap items-center gap-x-4 gap-y-2 text-text-secondary`}
        >
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
      className={`block h-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
        isHome ? "rounded-[2rem]" : "rounded-3xl"
      }`}
    >
      {body}
    </Link>
  );
}
