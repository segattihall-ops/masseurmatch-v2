/**
 * Listing editor — the option sets the profile editor offers.
 *
 * Every list here is closed: the server validates submitted values against
 * these arrays, so a client that posts anything else is rejected before it
 * reaches Postgres. They live apart from the schema in `listing.ts` because
 * they are long and change for editorial reasons, while the schema changes for
 * structural ones.
 *
 * Extracted from `prototypes/edit-profile`, the reviewed source for the
 * wording and the ordering.
 */

/**
 * Headline presets. Not free text: the listing composes
 * `"{HEADLINE} by {DISPLAY_NAME}"` from the chosen preset and the display name.
 */
export const HEADLINES = [
  "At-Home Massage",
  "Bodhi Healing",
  "Bodhi Massage",
  "Body Renewal",
  "Body+Spirit Healing",
  "Calming Bodywork",
  "Calming Massage",
  "Caring Bodywork",
  "Chi Balancing",
  "Clinical Bodywork",
  "Clinical Massage",
  "Comforting Massage",
  "Customized Massage",
  "Elevating Bodywork",
  "Elevating Massage",
  "Energetic Healing",
  "Energy Bodywork",
  "Energy Healing",
  "Energy Massage",
  "Energy Work",
  "Enlightened Massage",
  "Enlightening Massage",
  "Expert Massage",
  "Healing & Tranquility",
  "Healing Arts",
  "Healing Bodywork",
  "Higher Self Massage",
  "Holistic Healing",
  "Intuitive Bodywork",
  "Knot-busting",
  "Male Massage",
  "Massage & Yoga",
  "Massage Arts",
  "Massage Bliss",
  "Massage Rejuvenation",
  "Massage Therapy",
  "Masterful Massage",
  "Medical Massage",
  "Mind+Body Massage",
  "Mobile Day Spa",
  "Mobile Massage",
  "Neonatal Massage",
  "Pain Relief",
  "Pampering Massage",
  "Professional Relaxation",
  "Quantum Relaxation",
  "Rejuvenating Massage",
  "Revitalizing Massage",
  "Revitalizing Touch",
  "Sacred Massage",
  "Seasoned Bodywork",
  "Shamanistic Massage",
  "Soma Rejuvenation",
  "Spa at Home",
  "Sports Massage",
  "Sports Recovery",
  "Staycation Massage",
  "Stress Relief",
  "The Art of Massage",
  "The Art of Touch",
  "Therapeutic Healing",
  "Therapeutic Massage",
  "Therapeutic Touch",
  "Tranquil Touch",
  "Transformative Touch",
  "Yogic Bodywork",
  "Yogic Massage",
  "Zen Bodywork",
  "Zen Massage",
  "Zen Retreat",
] as const;

/** `profiles.body_type`. */
export const BODY_TYPES = ["Slim", "Athletic", "Average", "Muscular", "Stocky", "Large"] as const;

/**
 * Out-call radius, in **miles**.
 *
 * Miles is the platform's distance unit, not a display preference: the ranking
 * RPC takes `radius_miles` (see `packages/db/actions/ranking-config.ts`), and a
 * radius stored in anything else silently mis-ranks every out-call search that
 * uses it.
 *
 * `profiles` carries both `outcall_radius` and `outcall_radius_miles`. Neither
 * is read anywhere in this repository, so the name is the only evidence of
 * intent — and it says miles.
 */
export const OUTCALL_RADII_MILES = [5, 10, 15, 20, 30, 50] as const;

/** How a radius is written for the therapist. */
export function formatRadius(miles: number): string {
  return `${miles} ${miles === 1 ? "mile" : "miles"}`;
}

export const MASSAGE_TECHNIQUES = [
  "Acupressure",
  "Alexander Technique",
  "AMMA Therapy",
  "Anma",
  "Aromatherapy",
  "Ashiatsu",
  "Aston Patterning",
  "Ayurvedic",
  "Bhakti massage",
  "Breema",
  "British Sports",
  "Canadian Deep Muscle",
  "Chair massage",
  "Conscious Breathwork",
  "CranioSacral Therapy",
  "Deep Tissue",
  "Esalen",
  "Feldenkrais Method",
  "Hakomi",
  "Hellerwork",
  "Hot Stone",
  "Jin Shin Do",
  "Jin Shin Jyutsu",
  "Lomi Lomi",
  "Lymphatic Drainage",
  "Myofascial Release",
  "Neuromuscular",
  "Ortho-Bionomy",
  "Orthopedic",
  "Pfrimmer",
  "Polarity Therapy",
  "Prenatal and Postnatal",
  "Reflexology",
  "Reiki",
  "Rolfing",
  "Rosen Method",
  "Sensory Repatterning",
  "Shiatsu",
  "Soma Neuromuscular Integration",
  "Sports",
  "Steam Massage",
  "Swedish",
  "Tandem",
  "Tandem Massage",
  "Thai",
  "Thai Herbal",
  "Trager Integration",
  "Trigger Point",
  "Tui Na",
  "Watsu",
  "Zero Balancing",
] as const;

/** `profiles.massage_setup`. */
export const MASSAGE_SETUP = [
  "On a table",
  "On the floor",
  "On a mat",
  "Ask me for details",
] as const;

/** `profiles.mobile_extras` — what the therapist brings to an out-call. */
export const MOBILE_EXTRAS = [
  "Aromatherapy Enhanced",
  "Candles",
  "Heated Massage Table",
  "Hot Towels",
  "Massage Table",
  "Music",
] as const;

/** `profiles.additional_services`. */
export const ADDITIONAL_SERVICES = [
  "Acupuncture",
  "Body scrubs",
  "Body trimming",
  "Colonic cleansing",
  "Cupping",
  "Facials",
  "Fitness training",
  "Hair styling",
  "Hydrotherapy",
  "Manicures",
  "Meditation coaching",
  "Mud treatments",
  "Nutrition consulting",
  "Pedicures",
  "Personal coaching",
  "Personal training",
  "Physical therapy",
  "Waxing",
  "Yoga instruction",
] as const;

/**
 * `profiles.studio_amenities`. The older `incall_amenities` column still
 * exists and is deliberately not written here: it has no editor and no reader,
 * and mirroring into it would create a second source of truth.
 */
export const STUDIO_AMENITIES = [
  "Aromatherapy Enhanced",
  "Bottled Water",
  "Candles",
  "Drinking Water",
  "Free Parking",
  "Fully Handicapped Accessible",
  "Heated Massage Table",
  "Hot Towels",
  "Massage Table",
  "Metered Parking",
  "Music",
  "Pool",
  "Private Parking",
  "Private Restroom",
  "Sauna",
  "Secured Entrance/Doorman",
  "Shower",
  "Soft Drinks",
  "Spa/Hot Tub",
  "Tea",
  "Wine",
] as const;

/** Offered for both `products_used` and `products_sold` — one list, two columns. */
export const PRODUCTS = [
  "Alba Botanica Lotion",
  "Aroma Vera Massage Lotion",
  "Aroma Vera Massage Oil",
  "Ask me for details",
  "Aura Care Massage Cream/Lotion",
  "AVEDA massage lotion/oil",
  "Biofreeze",
  "Biotone Massage Creme/Gel/Lotion/Oil",
  "Deep tissue massage lotion/cream",
  "Earthlite Massage Oil",
  "Heated lotion",
  "Heated oil",
  "Kiehl’s Body Lotion",
  "Kiehl’s Massage Oil",
  "Lotus Touch Lotion",
  "Massage cream",
  "Massage FX Cream/Lotion/Oil",
  "Massage gel",
  "Massage lotion",
  "Massage oil",
  "None",
  "Santa Barbara Massage Cream",
  "Soothing Touch Massage Cream/Lotion/Oil",
  "Therapro Massage Lotion/Oil",
  "Various",
] as const;

/** `profiles.rate_disclaimers`. */
export const RATE_DISCLAIMERS = [
  "Longer sessions available",
  "Amounts listed are base rates only. Actual rates vary based on distance travelled, services provided etc.",
  "Ask about discounts for prepaid bodywork packages",
  "Gift certificates available",
] as const;

/** `profiles.regular_discounts`. */
export const REGULAR_DISCOUNTS = [
  "active military",
  "airline crews",
  "AIDS ride participants",
  "ask for details",
  "birthdays",
  "bodybuilders",
  "dancers",
  "emergency workers",
  "entertainment industry",
  "first-time clients",
  "law enforcement",
  "massage therapists",
  "military veterans",
  "repeat clients",
  "SAG/Equity members",
  "senior citizens",
  "students",
  "visiting clients",
] as const;

/** Day-of-week discount size. */
export const DISCOUNT_PERCENTAGES = [
  "10% off",
  "20% off",
  "30% off",
  "40% off",
  "50% off",
] as const;

/** Day-of-week discount day. */
export const WEEKDAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;

/** `profiles.payment_methods`. */
export const PAYMENT_METHODS = [
  "American Express",
  "Apple Pay",
  "Cash",
  "Cash App",
  "Check",
  "Discover",
  "Google Pay",
  "Mastercard",
  "PayPal",
  "Samsung Pay",
  "Venmo",
  "Visa",
  "Zelle",
] as const;

/** The day patterns one hours range may cover. */
export const SCHEDULE_DAYS = [
  "Every day",
  "Weekdays",
  "Saturday & Sunday",
  "Friday–Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;

/** Twelve-hour clock. */
export const CLOCK_HOURS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"] as const;

/** Quarter hours only, matching the editor the therapists already use. */
export const CLOCK_MINUTES = ["00", "15", "30", "45"] as const;

/** AM or PM. */
export const MERIDIEM = ["AM", "PM"] as const;

/** Abbreviated months, as the career-start and education fields store them. */
export const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

/** `profiles.languages_spoken`. */
export const LANGUAGES = [
  "Afrikaans",
  "Arabic",
  "Czech",
  "Danish",
  "English",
  "Estonian",
  "Finnish",
  "French",
  "German",
  "Greek",
  "Hebrew",
  "Hungarian",
  "Italian",
  "Japanese",
  "Norwegian",
  "Polish",
  "Portuguese",
  "Romanian",
  "Russian",
  "Spanish",
  "Swedish",
  "Turkish",
] as const;

/** `profiles.affiliations`. */
export const AFFILIATIONS = [
  "American College of Sports Medicine",
  "American Massage Therapy Association",
  "American Organization for Bodywork Therapies of Asia",
  "American Spa Association",
  "Associated Bodywork and Massage Professionals",
  "Esalen Massage and Bodywork Association",
  "Massage Association of Australia",
  "National Association of Massage Therapists",
  "National Association of Pregnancy Massage Therapy",
  "National Certification Board for Therapeutic Massage & Bodywork",
] as const;

/** Earliest year the career-start and education pickers offer. */
export const YEAR_MIN = 1956;

/** Latest UTC year offered; dynamic so the picker does not require annual maintenance. */
export const YEAR_MAX = new Date().getUTCFullYear();

/** Every year those pickers offer, newest first. */
export const YEARS: readonly string[] = Array.from({ length: YEAR_MAX - YEAR_MIN + 1 }, (_, i) =>
  String(YEAR_MAX - i),
);

/**
 * Bounds the provider API enforces.
 *
 * `tagline` and `taglineEditor` differ on purpose: the column accepts 200
 * characters, the editor stops at 120 because that is what the therapists
 * already use and a longer one is truncated in every listing card that renders
 * it.
 */
export const LIMITS = {
  sessions: 40,
  scheduleRanges: 20,
  education: 40,
  sessionMinutesMin: 1,
  sessionMinutesMax: 600,
  heightInchesMin: 36,
  heightInchesMax: 96,
  weightPoundsMin: 60,
  weightPoundsMax: 600,
  yearsExperienceMax: 80,
  displayName: 120,
  tagline: 200,
  taglineEditor: 120,
  bio: 4000,
  degree: 120,
  institution: 160,
  educationLocation: 160,
} as const;
