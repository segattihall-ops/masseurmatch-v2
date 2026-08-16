/**
 * Service options offered in the pickers.
 *
 * Hard-coded rather than read from a table: `profiles.service_categories` is a
 * free-text array, and there is no service taxonomy table an authenticated
 * therapist can read. Kept in one module so onboarding and profile editing
 * cannot drift apart — two copies of this list would silently produce profiles
 * whose services do not round-trip through the edit form.
 */
export const SERVICE_OPTIONS = [
  "Swedish",
  "Deep tissue",
  "Sports",
  "Trigger point",
  "Myofascial release",
  "Prenatal",
  "Hot stone",
  "Reflexology",
  "Lymphatic drainage",
  "Stretch therapy",
] as const;
