/* ============================================================================
   MasseurMatch — Edit Profile

   Field list, option lists and limits follow the editor the provider actually
   uses today at /pro/listing. Where that editor has a known defect the field
   is built the correct way here and the defect is called out inline, so the
   difference is visible rather than silently carried over.

   The form is the source of truth. Every change takes a flat snapshot of it,
   and progress, section status, summaries, the preview, undo history and the
   autosaved draft are all derived from that one snapshot.
   ========================================================================== */

(function () {
  "use strict";

  /* ── Reference data ─────────────────────────────────────────────────────── */

  const STATES =
    "AL Alabama|AK Alaska|AZ Arizona|AR Arkansas|CA California|CO Colorado|CT Connecticut|" +
    "DE Delaware|FL Florida|GA Georgia|HI Hawaii|ID Idaho|IL Illinois|IN Indiana|IA Iowa|" +
    "KS Kansas|KY Kentucky|LA Louisiana|ME Maine|MD Maryland|MA Massachusetts|MI Michigan|" +
    "MN Minnesota|MS Mississippi|MO Missouri|MT Montana|NE Nebraska|NV Nevada|" +
    "NH New Hampshire|NJ New Jersey|NM New Mexico|NY New York|NC North Carolina|" +
    "ND North Dakota|OH Ohio|OK Oklahoma|OR Oregon|PA Pennsylvania|RI Rhode Island|" +
    "SC South Carolina|SD South Dakota|TN Tennessee|TX Texas|UT Utah|VT Vermont|VA Virginia|" +
    "WA Washington|WV West Virginia|WI Wisconsin|WY Wyoming|DC District of Columbia";

  /* The 70 presets the editor offers. Headline is a choice, not free text —
     the listing composes "{Headline} by {Display Name}" from it. */
  const HEADLINES = [
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
  ];

  const MONTHS = [
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
  ];
  const YEAR_MIN = 1956;
  const YEAR_MAX = 2026;

  const SELECTS = {
    headline: { placeholder: "Choose a headline…", options: HEADLINES },
    body_type: {
      placeholder: "Select…",
      options: ["Slim", "Athletic", "Average", "Muscular", "Stocky", "Large"],
    },
    outcall_radius: {
      placeholder: "Select a radius…",
      options: ["10 km", "20 km", "40 km", "80 km", "160 km", "240 km"],
    },
    dow_discount_percent: {
      placeholder: "No day-of-week discount",
      options: ["10% off", "20% off", "30% off", "40% off", "50% off"],
    },
    dow_discount_day: {
      placeholder: "Select a day…",
      options: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
    },
    /* profiles.current_status accepts exactly these six. The live editor shows
       a different, prettier list and writes it straight in — see the notice
       rendered next to this field. */
    current_status: {
      placeholder: "Select…",
      options: ["available", "mobile", "traveling", "hidden", "active", "inactive"],
    },
    /* profiles.visibility_status is a separate column with its own set. */
    visibility_status: {
      placeholder: "Select…",
      options: ["public", "hidden", "paused", "suspended"],
    },
    career_start_month: { placeholder: "Month", options: MONTHS },
  };

  const GROUPS = {
    techniques: {
      label: "massage techniques",
      options: [
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
      ],
    },
    setup: {
      label: "setup options",
      options: ["On a table", "On the floor", "On a mat", "Ask me for details"],
    },
    outcall_extras: {
      label: "out-call extras",
      options: [
        "Aromatherapy Enhanced",
        "Candles",
        "Heated Massage Table",
        "Hot Towels",
        "Massage Table",
        "Music",
      ],
    },
    additional_services: {
      label: "additional services",
      options: [
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
      ],
    },
    amenities: {
      label: "studio amenities",
      options: [
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
      ],
    },
    products_used: { label: "products", options: [] },
    products_sold: { label: "products", options: [] },
    rate_disclaimers: {
      label: "disclaimers",
      options: [
        "Longer sessions available",
        "Amounts listed are base rates only. Actual rates vary based on distance travelled, services provided etc.",
        "Ask about discounts for prepaid bodywork packages",
        "Gift certificates available",
      ],
    },
    regular_discounts: {
      label: "discounts",
      options: [
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
      ],
    },
    payment_methods: {
      label: "payment methods",
      options: [
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
      ],
    },
    languages: {
      label: "languages",
      options: [
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
      ],
    },
    affiliations: {
      label: "affiliations",
      options: [
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
      ],
    },
  };

  /* Products Sold offers exactly the same 25 options as Products Used. */
  const PRODUCTS = [
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
  ];
  GROUPS.products_used.options = PRODUCTS;
  GROUPS.products_sold.options = PRODUCTS;

  const GROUP_NAMES = Object.keys(GROUPS);

  const DAY_OPTIONS = [
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
  ];
  const CLOCK_HOURS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"];
  const CLOCK_MINUTES = ["00", "15", "30", "45"];
  const MERIDIEM = ["AM", "PM"];

  /* A stand-in for the geo lookup the ZIP field triggers in production. */
  const ZIP_TABLE = {
    75219: { city: "Dallas", state: "TX", neighborhood: "Oak Lawn" },
    75201: { city: "Dallas", state: "TX", neighborhood: "Downtown" },
    10011: { city: "New York", state: "NY", neighborhood: "Chelsea" },
    90069: { city: "West Hollywood", state: "CA", neighborhood: "Sunset Strip" },
    33139: { city: "Miami Beach", state: "FL", neighborhood: "South Beach" },
    60614: { city: "Chicago", state: "IL", neighborhood: "Lincoln Park" },
    94114: { city: "San Francisco", state: "CA", neighborhood: "The Castro" },
    20009: { city: "Washington", state: "DC", neighborhood: "Dupont Circle" },
  };

  /* ── Repeatable collections ─────────────────────────────────────────────── */

  const REPEATERS = {
    sessions: {
      max: 40,
      noun: "session",
      empty: "No sessions yet. Add the lengths you offer and what they cost.",
      blank: () => ({ minutes: "", incall: "", outcall: "" }),
    },
    studio_hours: {
      max: 20,
      noun: "range",
      empty: "No studio hours yet. Add the days and times you are open.",
      blank: () => ({
        days: "Every day",
        from_h: "9",
        from_m: "00",
        from_ap: "AM",
        to_h: "11",
        to_m: "00",
        to_ap: "PM",
      }),
    },
    mobile_hours: {
      max: 20,
      noun: "range",
      empty: "No separate mobile hours yet.",
      blank: () => ({
        days: "Weekdays",
        from_h: "10",
        from_m: "00",
        from_ap: "AM",
        to_h: "8",
        to_m: "00",
        to_ap: "PM",
      }),
    },
    education: {
      max: 40,
      noun: "record",
      empty: "No training recorded yet.",
      blank: () => ({
        degree: "",
        institution: "",
        location: "",
        start_month: "",
        start_year: "",
        end_month: "",
        end_year: "",
      }),
    },
  };

  const REPEATER_NAMES = Object.keys(REPEATERS);

  /* ── Sections ───────────────────────────────────────────────────────────── */

  const SECTIONS = [
    {
      id: "about",
      label: "About you",
      short: "About",
      need: "Pick a headline and write your bio.",
      complete: (s) => s.display_name.trim() !== "" && s.headline !== "" && s.bio.trim() !== "",
      summary: (s) =>
        join([s.display_name, s.headline, s.body_type]) ||
        "Name, headline and the bio clients read first.",
    },
    {
      id: "location",
      label: "Location & contact",
      short: "Location",
      need: "Add your city, state and a phone number.",
      complete: (s) => s.city.trim() !== "" && s.state !== "" && s.phone.trim() !== "",
      summary: (s) =>
        join([
          s.city && s.state ? s.city + ", " + s.state : s.city || s.state,
          s.offers_incall && s.offers_outcall
            ? "In-call & out-call"
            : s.offers_incall
              ? "In-call only"
              : s.offers_outcall
                ? "Out-call only"
                : "",
          s.phone,
        ]) || "Where you work and how clients reach you.",
    },
    {
      id: "services",
      label: "Services",
      short: "Services",
      need: "Pick at least one massage technique.",
      complete: (s) => s.techniques.length > 0,
      summary: (s) =>
        join([
          count(s.techniques, "technique"),
          count(s.amenities, "amenity", "amenities"),
          count(s.additional_services, "extra service"),
        ]) || "Techniques, setup, amenities and products.",
    },
    {
      id: "rates",
      label: "Rates & payments",
      short: "Rates",
      need: "Add at least one session with a rate.",
      complete: (s) => s.sessions.some((r) => rateOf(r.incall) > 0 || rateOf(r.outcall) > 0),
      summary: (s) => {
        const values = [];
        s.sessions.forEach((r) => {
          if (rateOf(r.incall) > 0) values.push(rateOf(r.incall));
          if (rateOf(r.outcall) > 0) values.push(rateOf(r.outcall));
        });
        return (
          join([
            values.length ? "From " + money(Math.min.apply(null, values)) : "",
            count(s.sessions, "session"),
            count(s.payment_methods, "payment method"),
          ]) || "Session pricing, discounts and payment methods."
        );
      },
    },
    {
      id: "schedule",
      label: "Schedule",
      short: "Schedule",
      need: "Add at least one range of studio hours.",
      complete: (s) => s.studio_hours.length > 0,
      summary: (s) =>
        join([
          count(s.studio_hours, "studio range"),
          s.available_now ? "Available now" : "",
          s.current_status,
        ]) || "Studio hours, availability and status.",
    },
    {
      id: "credentials",
      label: "Credentials",
      short: "Credentials",
      need: "Add your years of experience.",
      complete: (s) => s.years_experience.trim() !== "",
      summary: (s) =>
        join([
          s.years_experience ? s.years_experience + " years experience" : "",
          count(s.education, "qualification"),
          count(s.languages, "language"),
        ]) || "Experience, training, languages and affiliations.",
    },
  ];

  /* ── Validation ─────────────────────────────────────────────────────────── */

  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;
  const PHONE_RE = /^\(\d{3}\) \d{3}-\d{4}$/;
  const ZIP_RE = /^\d{5}$/;

  /* Only three fields block a save — the same three the provider API insists
     on. Everything else is validated for shape and counts towards a section's
     completeness instead. */
  const RULES = {
    display_name: [
      req("Add the name clients will see on your listing."),
      max(120, "Display name has to be 120 characters or fewer."),
    ],
    city: [req("Add the city you work in.")],
    phone: [
      req("A phone number is required to save a provider profile."),
      (v) => (PHONE_RE.test(v.trim()) ? "" : "Use the format (555) 123-4567."),
    ],
    tagline: [max(120, "Tagline is limited to 120 characters here (the API accepts 200).")],
    bio: [max(4000, "Bio has to be 4,000 characters or fewer.")],
    zip: [(v) => (v.trim() === "" || ZIP_RE.test(v.trim()) ? "" : "A ZIP code is 5 digits.")],
    whatsapp: [
      (v) => (v.trim() === "" || PHONE_RE.test(v.trim()) ? "" : "Use the format (555) 123-4567."),
    ],
    email: [
      (v) =>
        v.trim() === "" || EMAIL_RE.test(v.trim()) ? "" : "That is not a valid email address.",
    ],
    website: [url],
    booking_url: [url],
    height_in: [range(36, 96, "Height is recorded in inches, between 36 and 96.")],
    weight_lb: [range(60, 600, "Weight is recorded in pounds, between 60 and 600.")],
    years_experience: [range(0, 80, "Years of experience has to be a whole number from 0 to 80.")],
    sessions: [(v, snap) => (sessionErrors(snap).length ? firstRowError(sessionErrors(snap)) : "")],
    education: [
      (v, snap) => (educationErrors(snap).length ? firstRowError(educationErrors(snap)) : ""),
    ],
  };

  /* ── Sample data ────────────────────────────────────────────────────────── */

  const SAMPLE = {
    display_name: "Bruno",
    headline: "Therapeutic Massage",
    tagline: "Deep tissue and sports recovery in Oak Lawn — 14 years on the table.",
    bio:
      "Bruno is a Brazilian massage therapist from São Paulo with 14 years of experience, now " +
      "working out of a private studio in Oak Lawn, Dallas.\n\n" +
      "My work sits between clinical and restorative. Sessions start with a short conversation " +
      "about what hurts, how you sleep and what you do all day, and I build the hour around that " +
      "— usually deep tissue and myofascial release layered over slower Swedish work, so the " +
      "nervous system has a chance to catch up with the muscle.\n\n" +
      "I see a lot of runners, cyclists and desk-bound professionals: shoulders that never come " +
      "down, low backs that never let go, hips locked up from sitting. If you are coming back " +
      "from an injury, bring whatever your physio or doctor told you and we will work inside " +
      "those limits.\n\n" +
      "The studio is quiet, private and LGBTQ+ affirming. The table is heated, the towels are " +
      "hot and the water is on me. English, Portuguese and Spanish spoken.",
    height_in: "80",
    weight_lb: "175",
    body_type: "Athletic",

    zip: "75219",
    city: "Dallas",
    state: "TX",
    neighborhood: "Oak Lawn",
    street_1: "Cedar Springs Rd",
    street_2: "Throckmorton St",
    offers_incall: true,
    offers_outcall: true,
    map_enabled: true,
    outcall_radius: "40 km",
    phone: "(555) 123-4567",
    whatsapp: "(555) 123-4567",
    email: "segatti.hall@gmail.com",
    show_email: false,
    website: "https://yoursite.com",
    booking_url: "https://book.yoursite.com",
    booking_platform: "Calendly",

    techniques: [
      "AMMA Therapy",
      "Deep Tissue",
      "Hot Stone",
      "Lymphatic Drainage",
      "Myofascial Release",
      "Neuromuscular",
      "Reiki",
      "Shiatsu",
      "Sports",
      "Swedish",
      "Trigger Point",
      "Zero Balancing",
    ],
    setup: ["On a table", "On a mat"],
    outcall_extras: ["Heated Massage Table", "Hot Towels", "Massage Table", "Music"],
    additional_services: ["Cupping", "Fitness training", "Personal training"],
    amenities: [
      "Aromatherapy Enhanced",
      "Bottled Water",
      "Candles",
      "Free Parking",
      "Hot Towels",
      "Music",
      "Private Restroom",
      "Shower",
    ],
    products_used: ["Biotone Massage Creme/Gel/Lotion/Oil", "Heated oil", "Massage cream"],
    products_sold: ["Biofreeze"],

    sessions: [
      { minutes: "30", incall: "80", outcall: "" },
      { minutes: "60", incall: "120", outcall: "160" },
      { minutes: "90", incall: "170", outcall: "210" },
      { minutes: "120", incall: "220", outcall: "260" },
    ],
    rate_disclaimers: [
      "Longer sessions available",
      "Amounts listed are base rates only. Actual rates vary based on distance travelled, services provided etc.",
    ],
    regular_discounts: ["first-time clients", "repeat clients", "military veterans"],
    dow_discount_percent: "10% off",
    dow_discount_day: "Tuesday",
    payment_methods: [
      "American Express",
      "Apple Pay",
      "Cash",
      "Mastercard",
      "Venmo",
      "Visa",
      "Zelle",
    ],

    studio_hours: [
      {
        days: "Weekdays",
        from_h: "9",
        from_m: "00",
        from_ap: "AM",
        to_h: "11",
        to_m: "00",
        to_ap: "PM",
      },
      {
        days: "Saturday & Sunday",
        from_h: "10",
        from_m: "00",
        from_ap: "AM",
        to_h: "9",
        to_m: "00",
        to_ap: "PM",
      },
    ],
    mobile_hours_same: true,
    mobile_hours: [],
    available_now: true,
    current_status: "available",
    visibility_status: "public",
    lgbtq_affirming: true,

    career_start_month: "Jan",
    career_start_year: "2010",
    years_experience: "14",
    education: [
      {
        degree: "Certified Massage Therapist",
        institution: "Instituto Brasileiro de Terapias Manuais",
        location: "Rio de Janeiro, Rio de Janeiro",
        start_month: "Feb",
        start_year: "2009",
        end_month: "Dec",
        end_year: "2010",
      },
    ],
    languages: ["English", "Portuguese", "Spanish"],
    affiliations: ["Associated Bodywork and Massage Professionals"],
  };

  const DRAFT_KEY = "mm.edit-profile.draft.v2";
  const THEME_KEY = "mm.edit-profile.theme";
  const AUTOSAVE_MS = 30000;
  const HISTORY_MAX = 60;

  /* ── Helpers ────────────────────────────────────────────────────────────── */

  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.prototype.slice.call((root || document).querySelectorAll(sel));

  function req(message) {
    return (v) => (String(v).trim() === "" ? message : "");
  }

  function max(limit, message) {
    return (v) => (String(v).length > limit ? message : "");
  }

  function range(lo, hi, message) {
    return (v) => {
      const value = String(v).trim();
      if (value === "") return "";
      const n = Number(value);
      if (!Number.isFinite(n) || !Number.isInteger(n) || n < lo || n > hi) return message;
      return "";
    };
  }

  function url(v) {
    const value = v.trim();
    if (value === "") return "";
    if (!/^https?:\/\//i.test(value)) return "Start the address with http:// or https://.";
    try {
      new URL(value);
      return "";
    } catch (err) {
      return "That is not a valid web address.";
    }
  }

  function join(parts) {
    return parts.filter((p) => p && String(p).trim() !== "").join(" · ");
  }

  function count(list, singular, plural) {
    if (!list || !list.length) return "";
    return list.length + " " + (list.length === 1 ? singular : plural || singular + "s");
  }

  function money(n) {
    return "$" + Number(n).toFixed(2);
  }

  function rateOf(value) {
    const n = Number(String(value).trim());
    return String(value).trim() === "" || !Number.isFinite(n) ? 0 : n;
  }

  function esc(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, (c) => {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function formatPhone(value) {
    const d = String(value).replace(/\D/g, "").slice(0, 10);
    if (d.length === 0) return "";
    if (d.length < 4) return "(" + d;
    if (d.length < 7) return "(" + d.slice(0, 3) + ") " + d.slice(3);
    return "(" + d.slice(0, 3) + ") " + d.slice(3, 6) + "-" + d.slice(6);
  }

  function clockTime(date) {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  function debounce(fn, wait) {
    let timer = null;
    return function () {
      const args = arguments;
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(null, args), wait);
    };
  }

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function optionList(values, selectedPlaceholder) {
    return (
      (selectedPlaceholder == null
        ? ""
        : '<option value="">' + esc(selectedPlaceholder) + "</option>") +
      values.map((v) => '<option value="' + esc(v) + '">' + esc(v) + "</option>").join("")
    );
  }

  function years() {
    const out = [];
    for (let y = YEAR_MAX; y >= YEAR_MIN; y--) out.push(String(y));
    return out;
  }

  /* localStorage is a convenience, never a requirement: private windows and
     blocked site data throw on access and the page must still work. */
  const store = {
    get(key) {
      try {
        return window.localStorage.getItem(key);
      } catch (err) {
        return null;
      }
    },
    set(key, value) {
      try {
        window.localStorage.setItem(key, value);
        return true;
      } catch (err) {
        return false;
      }
    },
    remove(key) {
      try {
        window.localStorage.removeItem(key);
      } catch (err) {
        /* nothing to do */
      }
    },
  };

  /* ── Element handles and mutable state ──────────────────────────────────── */

  const form = $("#profile-form");
  const tabsEl = $("#tabs");
  const stickybar = $("#stickybar");
  const toastsEl = $("#toasts");
  const formError = $("#form-error");
  const formErrorList = $("#form-error-list");
  const formErrorTitle = $("#form-error-title");

  /* Repeatable rows live here rather than in the DOM, so adding or removing a
     row never has to re-read half-typed values back out of inputs. */
  const rows = { sessions: [], studio_hours: [], mobile_hours: [], education: [] };

  let touched = {};
  let submitted = false;
  let restoring = false;
  let dirty = false;
  let history = [];
  let historyIndex = -1;
  let lastFocused = null;
  let zipTimer = null;

  /* ── Rendering ──────────────────────────────────────────────────────────── */

  function renderSelects() {
    $('[data-mount="states"]').innerHTML =
      '<option value="">Select a state…</option>' +
      STATES.split("|")
        .map((entry) => {
          const i = entry.indexOf(" ");
          const code = entry.slice(0, i);
          return (
            '<option value="' + code + '">' + esc(code + " — " + entry.slice(i + 1)) + "</option>"
          );
        })
        .join("");

    Object.keys(SELECTS).forEach((name) => {
      const el = $('[data-mount="' + name + '"]');
      if (el) el.innerHTML = optionList(SELECTS[name].options, SELECTS[name].placeholder);
    });

    $('[data-mount="career_start_year"]').innerHTML = optionList(years(), "Year");
    $("#booking-platforms").innerHTML = ["Calendly", "Square", "Acuity", "Genbook", "SimplyBook"]
      .map((v) => '<option value="' + esc(v) + '"></option>')
      .join("");
  }

  function renderGroups() {
    $$(".checkgroup").forEach((mount) => {
      const name = mount.dataset.group;
      const group = GROUPS[name];
      const cols = mount.dataset.cols || "3";
      const searchable = mount.dataset.searchable === "true";

      mount.innerHTML =
        '<div class="checkgroup__bar">' +
        '<span class="checkgroup__count" data-group-count>0 of ' +
        group.options.length +
        " selected</span>" +
        (searchable
          ? '<input type="search" class="checkgroup__search" data-group-search placeholder="Filter ' +
            group.options.length +
            " " +
            esc(group.label) +
            '…" aria-label="Filter ' +
            esc(group.label) +
            '" />'
          : "") +
        '<button type="button" class="linkbtn" data-group-clear hidden>Clear</button>' +
        "</div>" +
        '<div class="checkgroup__grid" data-cols="' +
        cols +
        '" role="group" aria-label="' +
        esc(group.label) +
        '">' +
        group.options
          .map(
            (opt) =>
              '<label class="check" data-option="' +
              esc(opt.toLowerCase()) +
              '"><input type="checkbox" name="' +
              name +
              '" value="' +
              esc(opt) +
              '" /><span class="check__box" aria-hidden="true"></span>' +
              '<span class="check__text">' +
              esc(opt) +
              "</span></label>",
          )
          .join("") +
        "</div>" +
        '<p class="checkgroup__empty" data-group-empty hidden>Nothing matches that filter.</p>';
    });
  }

  function renderTabs() {
    tabsEl.innerHTML = SECTIONS.map(
      (section, i) =>
        '<button type="button" class="tab" data-tab="' +
        section.id +
        '" aria-controls="section-' +
        section.id +
        '"><span class="tab__dot" aria-hidden="true"></span><span>' +
        (i + 1) +
        ". " +
        esc(section.short) +
        '</span><span class="tab__count" data-tab-count aria-hidden="true">0</span></button>',
    ).join("");
  }

  /* One shell for every repeatable collection; the row body differs per key. */
  const ROW_BODY = {
    sessions: (row, i) =>
      '<div class="rep-row__cols" data-cols="3">' +
      cell("Minutes", numberField("sessions", i, "minutes", row.minutes, 1, 600, "60")) +
      cell("In-call rate", moneyField("sessions", i, "incall", row.incall)) +
      cell("Out-call rate", moneyField("sessions", i, "outcall", row.outcall)) +
      "</div>",

    studio_hours: (row, i) => hoursBody("studio_hours", row, i),
    mobile_hours: (row, i) => hoursBody("mobile_hours", row, i),

    education: (row, i) =>
      '<div class="rep-row__cols" data-cols="3">' +
      cell(
        "Degree / certification",
        textField("education", i, "degree", row.degree, 120, "Certified Massage Therapist"),
      ) +
      cell(
        "Institution",
        textField("education", i, "institution", row.institution, 160, "School name"),
      ) +
      cell("Location", textField("education", i, "location", row.location, 160, "City, region")) +
      "</div>" +
      '<div class="rep-row__cols" data-cols="4">' +
      cell(
        "Start month",
        selectField("education", i, "start_month", row.start_month, MONTHS, "Month"),
      ) +
      cell(
        "Start year",
        selectField("education", i, "start_year", row.start_year, years(), "Year"),
      ) +
      cell("End month", selectField("education", i, "end_month", row.end_month, MONTHS, "Month")) +
      cell("End year", selectField("education", i, "end_year", row.end_year, years(), "Year")) +
      "</div>",
  };

  function hoursBody(key, row, i) {
    return (
      '<div class="rep-row__cols" data-cols="2">' +
      cell("Days", selectField(key, i, "days", row.days, DAY_OPTIONS, null)) +
      cell(
        "Hours",
        '<div class="timerange">' +
          selectField(key, i, "from_h", row.from_h, CLOCK_HOURS, null, "From hour") +
          selectField(key, i, "from_m", row.from_m, CLOCK_MINUTES, null, "From minutes") +
          selectField(key, i, "from_ap", row.from_ap, MERIDIEM, null, "From AM or PM") +
          '<span class="timerange__sep" aria-hidden="true">–</span>' +
          selectField(key, i, "to_h", row.to_h, CLOCK_HOURS, null, "To hour") +
          selectField(key, i, "to_m", row.to_m, CLOCK_MINUTES, null, "To minutes") +
          selectField(key, i, "to_ap", row.to_ap, MERIDIEM, null, "To AM or PM") +
          "</div>",
      ) +
      "</div>"
    );
  }

  function cell(label, control) {
    return '<div><span class="rep-row__label">' + esc(label) + "</span>" + control + "</div>";
  }

  function repAttrs(key, i, field, label) {
    return (
      'data-rep="' +
      key +
      '" data-rep-i="' +
      i +
      '" data-rep-f="' +
      field +
      '" aria-label="' +
      esc((label || field.replace(/_/g, " ")) + " for " + REPEATERS[key].noun + " " + (i + 1)) +
      '"'
    );
  }

  function textField(key, i, field, value, maxlen, placeholder) {
    return (
      '<input type="text" maxlength="' +
      maxlen +
      '" placeholder="' +
      esc(placeholder) +
      '" value="' +
      esc(value) +
      '" ' +
      repAttrs(key, i, field) +
      " />"
    );
  }

  function numberField(key, i, field, value, lo, hi, placeholder) {
    return (
      '<input type="number" inputmode="numeric" min="' +
      lo +
      '" max="' +
      hi +
      '" step="1" placeholder="' +
      placeholder +
      '" value="' +
      esc(value) +
      '" ' +
      repAttrs(key, i, field) +
      " />"
    );
  }

  function moneyField(key, i, field, value) {
    return (
      '<div class="money"><span class="money__box">' +
      '<span class="money__sign" aria-hidden="true">$</span>' +
      '<input type="number" inputmode="numeric" min="0" step="1" placeholder="—" value="' +
      esc(value) +
      '" data-money ' +
      repAttrs(key, i, field) +
      ' /></span><span class="money__fmt" data-money-fmt></span></div>'
    );
  }

  function selectField(key, i, field, value, options, placeholder, label) {
    const opts = options
      .map(
        (opt) =>
          '<option value="' +
          esc(opt) +
          '"' +
          (opt === value ? " selected" : "") +
          ">" +
          esc(opt) +
          "</option>",
      )
      .join("");
    const head =
      placeholder == null
        ? ""
        : '<option value=""' + (value ? "" : " selected") + ">" + esc(placeholder) + "</option>";
    return "<select " + repAttrs(key, i, field, label) + ">" + head + opts + "</select>";
  }

  function renderRepeater(key) {
    const cfg = REPEATERS[key];
    const mount = $('[data-repeater="' + key + '"]');
    if (!mount) return;
    const list = $("[data-rep-list]", mount);

    list.innerHTML = rows[key].length
      ? rows[key]
          .map(
            (row, i) =>
              '<div class="rep-row" data-rep-row="' +
              key +
              '" data-row-index="' +
              i +
              '">' +
              ROW_BODY[key](row, i) +
              '<button type="button" class="rep-row__drop" data-rep-drop="' +
              key +
              '" data-row-index="' +
              i +
              '" aria-label="Remove ' +
              cfg.noun +
              " " +
              (i + 1) +
              '">✕</button></div>',
          )
          .join("")
      : '<p class="rep-empty">' + esc(cfg.empty) + "</p>";

    $("[data-rep-count]", mount).textContent = rows[key].length + " of " + cfg.max;
    $("[data-rep-add]", mount).disabled = rows[key].length >= cfg.max;
  }

  function renderAllRepeaters() {
    REPEATER_NAMES.forEach(renderRepeater);
  }

  /* ── Snapshot / restore ─────────────────────────────────────────────────── */

  function snapshot() {
    const out = {};

    GROUP_NAMES.forEach((name) => {
      out[name] = $$('input[name="' + name + '"]:checked', form).map((el) => el.value);
    });

    $$("input, select, textarea", form).forEach((el) => {
      const name = el.name;
      if (!name || GROUP_NAMES.indexOf(name) !== -1) return;
      if (el.type === "checkbox") out[name] = el.checked;
      else out[name] = el.value;
    });

    REPEATER_NAMES.forEach((key) => {
      out[key] = clone(rows[key]);
    });

    return out;
  }

  function restore(data) {
    restoring = true;

    REPEATER_NAMES.forEach((key) => {
      rows[key] = Array.isArray(data[key]) ? clone(data[key]) : [];
    });
    renderAllRepeaters();

    GROUP_NAMES.forEach((name) => {
      const selected = Array.isArray(data[name]) ? data[name] : [];
      $$('input[name="' + name + '"]', form).forEach((el) => {
        el.checked = selected.indexOf(el.value) !== -1;
      });
    });

    $$("input, select, textarea", form).forEach((el) => {
      const name = el.name;
      if (!name || GROUP_NAMES.indexOf(name) !== -1) return;
      if (!(name in data)) return;
      if (el.type === "checkbox") el.checked = Boolean(data[name]);
      else el.value = data[name] == null ? "" : String(data[name]);
    });

    restoring = false;
    refresh();
  }

  /* The structured payload a real save would PATCH. Column names are the ones
     the provider API writes to. */
  function toProfileJson(snap) {
    const hours = (list) =>
      list.map((r) => ({
        days: r.days,
        from: r.from_h + ":" + r.from_m + " " + r.from_ap,
        to: r.to_h + ":" + r.to_m + " " + r.to_ap,
      }));

    return {
      about: {
        display_name: snap.display_name.trim(),
        full_name: snap.display_name.trim(),
        headline: snap.headline || null,
        composed_headline: composedHeadline(snap),
        tagline: snap.tagline.trim() || null,
        bio: snap.bio.trim(),
        height_inches: snap.height_in === "" ? null : Number(snap.height_in),
        weight_pounds: snap.weight_lb === "" ? null : Number(snap.weight_lb),
        body_type: snap.body_type || null,
      },
      location: {
        zip_code: snap.zip.trim() || null,
        city: snap.city.trim(),
        state: snap.state || null,
        neighborhood: snap.neighborhood.trim() || null,
        /* The live editor drops both street fields on save; they belong here. */
        street_reference: streetReference(snap),
        offers_incall: snap.offers_incall,
        offers_outcall: snap.offers_outcall,
        map_enabled: snap.map_enabled,
        outcall_radius: snap.offers_outcall ? snap.outcall_radius || null : null,
      },
      contact: {
        phone: snap.phone.trim(),
        phone_number: snap.phone.trim(),
        whatsapp_number: snap.whatsapp.trim() || null,
        email_address: snap.email.trim() || null,
        show_email: snap.email.trim() === "" ? false : snap.show_email,
        website: snap.website.trim() || null,
        booking_url: snap.booking_url.trim() || null,
        booking_platform: snap.booking_platform.trim() || null,
      },
      services: {
        massage_techniques: snap.techniques,
        /* Both are derived from the techniques, not edited separately. */
        service_categories: snap.techniques,
        specialties: snap.techniques.slice(0, 12),
        massage_setup: snap.setup,
        outcall_extras: snap.outcall_extras,
        additional_services: snap.additional_services,
        studio_amenities: snap.amenities,
        products_used: snap.products_used,
        products_sold: snap.products_sold,
      },
      rates: {
        sessions: snap.sessions
          .filter((r) => r.minutes !== "")
          .map((r) => ({
            minutes: Number(r.minutes),
            incall_rate: r.incall === "" ? null : Number(r.incall),
            outcall_rate: r.outcall === "" ? null : Number(r.outcall),
          })),
        rate_disclaimers: snap.rate_disclaimers,
        regular_discounts: snap.regular_discounts,
        day_of_week_discount:
          snap.dow_discount_percent && snap.dow_discount_day
            ? { percent: snap.dow_discount_percent, day: snap.dow_discount_day }
            : null,
        payment_methods: snap.payment_methods,
      },
      schedule: {
        studio_hours: hours(snap.studio_hours),
        mobile_hours_same_as_studio: snap.mobile_hours_same,
        mobile_hours: snap.mobile_hours_same ? null : hours(snap.mobile_hours),
        available_now: snap.available_now,
        current_status: snap.current_status || null,
        visibility_status: snap.visibility_status || null,
        lgbtq_affirming: snap.lgbtq_affirming,
      },
      credentials: {
        career_start:
          snap.career_start_month && snap.career_start_year
            ? snap.career_start_month + " " + snap.career_start_year
            : null,
        years_experience: snap.years_experience === "" ? null : Number(snap.years_experience),
        education: snap.education
          .filter((r) => r.degree.trim() !== "")
          .map((r) => ({
            degree: r.degree.trim(),
            institution: r.institution.trim() || null,
            location: r.location.trim() || null,
            start: r.start_month && r.start_year ? r.start_month + " " + r.start_year : null,
            end: r.end_month && r.end_year ? r.end_month + " " + r.end_year : null,
          })),
        languages_spoken: snap.languages,
        affiliations: snap.affiliations,
      },
    };
  }

  function composedHeadline(snap) {
    const name = snap.display_name.trim();
    if (!snap.headline) return name || null;
    return name ? snap.headline + " by " + name : snap.headline;
  }

  function streetReference(snap) {
    const parts = [snap.street_1.trim(), snap.street_2.trim()].filter(Boolean);
    return parts.length ? parts.join(" + ") : null;
  }

  /* ── Row-level validation ───────────────────────────────────────────────── */

  /* When a 60-minute session exists, no other length may cost more than a
     third above its proportional share of that hour. */
  function ceilingFor(minutes, hourRate) {
    return (hourRate * (minutes / 60) * 4) / 3;
  }

  function sessionErrors(snap) {
    const list = snap.sessions;
    const out = [];
    const hour = list.filter((r) => Number(r.minutes) === 60)[0];

    list.forEach((row, i) => {
      const minutes = String(row.minutes).trim();
      if (minutes === "")
        return void out.push({ index: i, message: "Add the session length in minutes." });

      const n = Number(minutes);
      if (!Number.isInteger(n) || n < 1 || n > 600) {
        return void out.push({ index: i, message: "Session length is 1 to 600 minutes." });
      }

      let bad = "";
      ["incall", "outcall"].forEach((type) => {
        if (bad) return;
        const raw = String(row[type]).trim();
        if (raw === "") return;
        const rate = Number(raw);
        const label = type === "incall" ? "In-call" : "Out-call";
        if (!Number.isFinite(rate) || !Number.isInteger(rate) || rate < 0) {
          bad = label + " rate has to be a whole number of dollars, 0 or more.";
          return;
        }
        if (!hour || hour === row) return;
        const base = Number(String(hour[type]).trim());
        if (!Number.isFinite(base) || base <= 0) return;
        const ceiling = ceilingFor(n, base);
        if (rate > ceiling + 0.001) {
          bad =
            label +
            " tops out at " +
            money(Math.floor(ceiling)) +
            " for " +
            n +
            " min, based on your " +
            money(base) +
            " hour.";
        }
      });
      if (bad) out.push({ index: i, message: bad });
    });

    return out;
  }

  function educationErrors(snap) {
    const out = [];
    snap.education.forEach((row, i) => {
      const filled = ["institution", "location", "start_year", "end_year"].some(
        (f) => String(row[f]).trim() !== "",
      );
      if (row.degree.trim() === "") {
        if (filled) out.push({ index: i, message: "Name the degree or certification." });
        return;
      }
      const start = Number(row.start_year);
      const end = Number(row.end_year);
      if (start && end && end < start) {
        out.push({ index: i, message: "The end year cannot be before the start year." });
        return;
      }
      if (start && end && end === start && row.start_month && row.end_month) {
        if (MONTHS.indexOf(row.end_month) < MONTHS.indexOf(row.start_month)) {
          out.push({ index: i, message: "The end month cannot be before the start month." });
        }
      }
    });
    return out;
  }

  function firstRowError(list) {
    return "Row " + (list[0].index + 1) + ": " + list[0].message;
  }

  function paintRowErrors(key, errors) {
    $$('[data-rep-row="' + key + '"]').forEach((rowEl) => {
      const index = Number(rowEl.dataset.rowIndex);
      const hit = errors.filter((e) => e.index === index)[0];
      let node = $(".rep-row__error", rowEl);
      const show = hit && (submitted || touched[key]);
      if (show) {
        if (!node) {
          node = document.createElement("p");
          node.className = "rep-row__error";
          node.setAttribute("role", "alert");
          rowEl.appendChild(node);
        }
        node.textContent = hit.message;
        rowEl.classList.add("is-invalid");
      } else {
        if (node) node.remove();
        rowEl.classList.remove("is-invalid");
      }
    });
  }

  /* ── Field validation ───────────────────────────────────────────────────── */

  function fieldEl(name) {
    return $('[data-field="' + name + '"]');
  }

  function errorFor(name, snap) {
    const rules = RULES[name];
    if (!rules) return "";
    const value = snap[name] == null ? "" : String(snap[name]);
    for (let i = 0; i < rules.length; i++) {
      const message = rules[i](value, snap);
      if (message) return message;
    }
    return "";
  }

  function allErrors(snap) {
    const out = {};
    Object.keys(RULES).forEach((name) => {
      const message = errorFor(name, snap);
      if (message) out[name] = message;
    });
    return out;
  }

  function paintField(name, message, show) {
    const field = fieldEl(name);
    if (!field) return;

    let node = $(".field__error", field);
    if (message && show) {
      if (!node) {
        node = document.createElement("p");
        node.className = "field__error";
        node.id = name + "-error";
        node.setAttribute("role", "alert");
        field.appendChild(node);
      }
      node.textContent = message;
      field.classList.add("is-invalid");
      $$("input[name], select[name], textarea[name]", field).forEach((el) => {
        el.setAttribute("aria-invalid", "true");
        el.setAttribute("aria-describedby", name + "-error");
      });
    } else {
      field.classList.remove("is-invalid");
      if (node) node.remove();
      $$("input[name], select[name], textarea[name]", field).forEach((el) => {
        el.removeAttribute("aria-invalid");
        el.removeAttribute("aria-describedby");
      });
    }
  }

  /* ── Derived UI ─────────────────────────────────────────────────────────── */

  function updateCounters() {
    $$("[data-counter-for]").forEach((el) => {
      const input = document.getElementById(el.dataset.counterFor);
      if (!input) return;
      const limit = Number(input.getAttribute("maxlength")) || 0;
      const used = input.value.length;
      el.textContent = used + "/" + limit;
      el.classList.toggle("is-warn", limit > 0 && used >= limit * 0.9 && used < limit);
      el.classList.toggle("is-max", limit > 0 && used >= limit);
    });
  }

  function updateToggleText() {
    $$("[data-toggle-desc]").forEach((el) => {
      const input = $(".toggle__input", el.closest(".toggle"));
      el.textContent = input && input.checked ? el.dataset.on : el.dataset.off;
    });
  }

  function updateConditionals(snap) {
    const rules = {
      outcall_radius: snap.offers_outcall,
      show_email: snap.email.trim() !== "",
      mobile_hours: !snap.mobile_hours_same,
      dow_discount_day: snap.dow_discount_percent !== "",
    };
    Object.keys(rules).forEach((key) => {
      const el = $('[data-conditional="' + key + '"]');
      if (el) el.hidden = !rules[key];
    });

    const note = $("[data-outcall-note]");
    if (note) note.hidden = Boolean(snap.offers_outcall);
  }

  function updateMoney() {
    $$("[data-money]").forEach((input) => {
      const out = $("[data-money-fmt]", input.closest(".money"));
      const raw = input.value.trim();
      const n = Number(raw);
      if (raw === "") {
        out.textContent = "";
        out.style.color = "";
      } else if (!Number.isFinite(n) || n < 0) {
        out.textContent = "No negative rates";
        out.style.color = "var(--error)";
      } else {
        out.textContent = money(n);
        out.style.color = "";
      }
    });
  }

  function updateGroups() {
    $$(".checkgroup").forEach((mount) => {
      const name = mount.dataset.group;
      const total = GROUPS[name].options.length;
      const selected = $$('input[name="' + name + '"]:checked', mount).length;
      const label = $("[data-group-count]", mount);
      label.textContent = selected + " of " + total + " selected";
      label.classList.toggle("is-active", selected > 0);
      const clear = $("[data-group-clear]", mount);
      if (clear) clear.hidden = selected === 0;
    });
  }

  function updateConversions(snap) {
    const height = $("[data-convert=height]");
    const inches = Number(snap.height_in);
    height.textContent =
      snap.height_in.trim() !== "" && Number.isFinite(inches) && inches >= 36 && inches <= 96
        ? Math.floor(inches / 12) +
          "′ " +
          (inches % 12) +
          "″ · " +
          Math.round(inches * 2.54) +
          " cm"
        : "";

    const weight = $("[data-convert=weight]");
    const pounds = Number(snap.weight_lb);
    weight.textContent =
      snap.weight_lb.trim() !== "" && Number.isFinite(pounds) && pounds >= 60 && pounds <= 600
        ? Math.round(pounds * 0.45359237) + " kg"
        : "";
  }

  function updateDerived(snap) {
    $("[data-composed]").textContent = composedHeadline(snap) || "Pick a headline to see this";

    const specialties = snap.techniques.slice(0, 12);
    $("[data-derived=service_categories]").innerHTML = snap.techniques.length
      ? "<strong>" +
        esc(String(snap.techniques.length)) +
        "</strong> categories, and the first <strong>" +
        esc(String(specialties.length)) +
        "</strong> as specialties: " +
        esc(specialties.join(", "))
      : "Nothing yet — these follow whatever you tick above.";

    const street = $("[data-derived=street_reference]");
    if (street) {
      street.textContent = streetReference(snap) || "Both streets are blank.";
    }
  }

  function sectionState(snap, errors) {
    return SECTIONS.map((section) => {
      const sectionEl = document.getElementById("section-" + section.id);
      const names = $$("[data-field]", sectionEl).map((el) => el.dataset.field);
      const own = names.filter((n) => errors[n]);
      return {
        section: section,
        errors: own,
        complete: own.length === 0 && section.complete(snap),
      };
    });
  }

  function updateProgress(states) {
    const done = states.filter((s) => s.complete).length;
    const errorCount = states.reduce((sum, s) => sum + s.errors.length, 0);

    $("#progress-count").textContent = String(done);
    $("#progress-fill").style.width = (done / SECTIONS.length) * 100 + "%";
    $("#progress-bar").setAttribute("aria-valuenow", String(done));

    const meta = $("#progress-meta");
    if (done === SECTIONS.length) meta.textContent = "Ready to publish";
    else if (done >= 4) meta.textContent = "Almost there";
    else if (done >= 1) meta.textContent = "In progress";
    else meta.textContent = "Getting started";

    const hint = $("#progress-hint");
    if (errorCount > 0 && (submitted || Object.keys(touched).length)) {
      hint.innerHTML =
        esc(String(errorCount)) +
        (errorCount === 1 ? " field needs" : " fields need") +
        " attention — the red dots in the section bar show where.";
    } else if (done === SECTIONS.length) {
      hint.innerHTML = "Every section is complete. Save when you are happy with the preview.";
    } else {
      const next = states.filter((s) => !s.complete)[0];
      hint.innerHTML =
        "Next up: <strong>" + esc(next.section.label) + "</strong> — " + esc(next.section.need);
    }
  }

  function updateTabs(states) {
    states.forEach((state) => {
      const tab = $('[data-tab="' + state.section.id + '"]');
      if (!tab) return;
      const showErrors =
        state.errors.length > 0 && (submitted || state.errors.some((n) => touched[n]));
      tab.classList.toggle("is-complete", state.complete && !showErrors);
      tab.classList.toggle("is-error", showErrors);
      $("[data-tab-count]", tab).textContent = String(state.errors.length);
      tab.title = showErrors
        ? state.errors.length + " field(s) to fix"
        : state.complete
          ? "Complete"
          : state.section.need;
    });
  }

  function updateSummaries(snap, states) {
    states.forEach((state) => {
      const sectionEl = document.getElementById("section-" + state.section.id);
      const summary = $("[data-summary]", sectionEl);
      const status = $("[data-status]", sectionEl);
      if (summary) summary.textContent = state.section.summary(snap);
      if (status) {
        const showErrors =
          state.errors.length > 0 && (submitted || state.errors.some((n) => touched[n]));
        status.textContent = showErrors
          ? state.errors.length + " to fix"
          : state.complete
            ? "Complete"
            : "In progress";
        status.classList.toggle("is-complete", state.complete && !showErrors);
        status.classList.toggle("is-error", showErrors);
      }
    });
  }

  function updateHero(snap) {
    $("#hero-name").textContent = snap.display_name.trim() || "your listing";
    $("#hero-place").textContent = join([snap.city.trim(), snap.state]) || "add a city";
  }

  /* One pass that re-derives every piece of UI from the form. */
  function refresh() {
    const snap = snapshot();
    const errors = allErrors(snap);
    const states = sectionState(snap, errors);

    updateCounters();
    updateToggleText();
    updateConditionals(snap);
    updateMoney();
    updateGroups();
    updateConversions(snap);
    updateDerived(snap);

    Object.keys(RULES).forEach((name) => {
      const message = errors[name] || "";
      paintField(name, message, Boolean(message) && (submitted || touched[name]));
    });
    paintRowErrors("sessions", sessionErrors(snap));
    paintRowErrors("education", educationErrors(snap));

    updateProgress(states);
    updateTabs(states);
    updateSummaries(snap, states);
    updateHero(snap);

    return { snap: snap, errors: errors, states: states };
  }

  /* ── Undo / redo ────────────────────────────────────────────────────────── */

  function pushHistory() {
    const entry = JSON.stringify(snapshot());
    if (history[historyIndex] === entry) return;
    history = history.slice(0, historyIndex + 1);
    history.push(entry);
    if (history.length > HISTORY_MAX) history.shift();
    historyIndex = history.length - 1;
    updateHistoryButtons();
  }

  const pushHistoryDebounced = debounce(pushHistory, 450);

  function updateHistoryButtons() {
    $("#btn-undo").disabled = historyIndex <= 0;
    $("#btn-redo").disabled = historyIndex >= history.length - 1;
  }

  function undo() {
    if (historyIndex <= 0) return;
    historyIndex--;
    restore(JSON.parse(history[historyIndex]));
    updateHistoryButtons();
    markDirty();
    toast("info", "Undone", "Reverted the last change.");
  }

  function redo() {
    if (historyIndex >= history.length - 1) return;
    historyIndex++;
    restore(JSON.parse(history[historyIndex]));
    updateHistoryButtons();
    markDirty();
    toast("info", "Redone", "Reapplied the change.");
  }

  /* ── Autosave ───────────────────────────────────────────────────────────── */

  function setSaveState(text, kind) {
    [$("#savestate"), $("#savestate-foot")].forEach((el) => {
      if (!el) return;
      el.textContent = text;
      el.classList.toggle("is-dirty", kind === "dirty");
      el.classList.toggle("is-saved", kind === "saved");
    });
  }

  function markDirty() {
    dirty = true;
    setSaveState("Unsaved changes", "dirty");
  }

  function persist(reason) {
    const ok = store.set(
      DRAFT_KEY,
      JSON.stringify({ savedAt: new Date().toISOString(), data: snapshot() }),
    );
    dirty = false;
    setSaveState(
      ok
        ? (reason === "auto" ? "Auto-saved at " : "Saved at ") + clockTime(new Date())
        : "Saved in this tab only (storage unavailable)",
      "saved",
    );
    return ok;
  }

  function startAutosave() {
    window.setInterval(() => {
      if (dirty) persist("auto");
    }, AUTOSAVE_MS);
  }

  /* ── Toasts ─────────────────────────────────────────────────────────────── */

  function toast(kind, title, message) {
    const el = document.createElement("div");
    el.className = "toast toast--" + kind;
    el.innerHTML =
      '<span class="toast__icon" aria-hidden="true">' +
      (kind === "success" ? "✓" : kind === "error" ? "!" : "i") +
      '</span><div><p class="toast__title">' +
      esc(title) +
      '</p><p class="toast__msg">' +
      esc(message) +
      "</p></div>";
    toastsEl.appendChild(el);

    window.setTimeout(
      () => {
        el.classList.add("is-out");
        el.addEventListener("animationend", () => el.remove(), { once: true });
      },
      kind === "error" ? 6000 : 3600,
    );
  }

  /* ── Sections, tabs, modals ─────────────────────────────────────────────── */

  function setCollapsed(card, collapsed) {
    card.classList.toggle("is-collapsed", collapsed);
    $("[data-toggle-section]", card).setAttribute("aria-expanded", String(!collapsed));
  }

  function openSection(id) {
    const card = document.getElementById("section-" + id);
    if (card) setCollapsed(card, false);
    return card;
  }

  function goToSection(id) {
    const card = openSection(id);
    if (!card) return;
    window.requestAnimationFrame(() => card.scrollIntoView({ behavior: "smooth", block: "start" }));
  }

  function focusField(name) {
    const field = fieldEl(name);
    if (!field) return;
    const section = field.closest("[data-section]");
    if (section) openSection(section.dataset.section);
    const control = $("input, select, textarea", field);
    window.requestAnimationFrame(() => {
      field.scrollIntoView({ behavior: "smooth", block: "center" });
      if (control) control.focus({ preventScroll: true });
    });
  }

  function openModal(id) {
    lastFocused = document.activeElement;
    const modal = document.getElementById(id);
    modal.hidden = false;
    document.body.style.overflow = "hidden";
    $(".modal__panel", modal).focus();
  }

  function closeModals() {
    $$(".modal").forEach((m) => (m.hidden = true));
    document.body.style.overflow = "";
    if (lastFocused && lastFocused.focus) lastFocused.focus();
  }

  /* ── Preview ────────────────────────────────────────────────────────────── */

  function renderPreview(snap) {
    const initials = (snap.display_name.trim() || "?").slice(0, 2).toUpperCase();
    const place = join([snap.neighborhood.trim(), snap.city.trim(), snap.state]);

    const badges = [];
    if (snap.available_now) badges.push('<span class="pv__badge">Available now</span>');
    if (snap.lgbtq_affirming) badges.push('<span class="pv__badge">LGBTQ+ affirming</span>');
    if (snap.offers_incall) badges.push('<span class="pv__badge pv__badge--brand">In-call</span>');
    if (snap.offers_outcall) {
      badges.push(
        '<span class="pv__badge pv__badge--brand">Out-call' +
          (snap.outcall_radius ? " · " + esc(snap.outcall_radius) : "") +
          "</span>",
      );
    }

    const chips = (list) =>
      list.length
        ? '<div class="pv__chips">' +
          list.map((v) => '<span class="pv__chip">' + esc(v) + "</span>").join("") +
          "</div>"
        : '<p class="pv__empty">Nothing selected yet.</p>';

    const rateRows = snap.sessions
      .filter((r) => r.minutes !== "")
      .map(
        (r) =>
          '<tr><th scope="row">' +
          esc(r.minutes) +
          " min</th><td>" +
          (r.incall === "" ? "—" : money(r.incall)) +
          "</td><td>" +
          (r.outcall === "" ? "—" : money(r.outcall)) +
          "</td></tr>",
      )
      .join("");

    const hourRows = (list) =>
      list
        .map(
          (r) =>
            '<tr><th scope="row">' +
            esc(r.days) +
            "</th><td>" +
            esc(
              r.from_h +
                ":" +
                r.from_m +
                " " +
                r.from_ap +
                " – " +
                r.to_h +
                ":" +
                r.to_m +
                " " +
                r.to_ap,
            ) +
            "</td></tr>",
        )
        .join("");

    const physical = join([
      snap.height_in ? $("[data-convert=height]").textContent : "",
      snap.weight_lb ? $("[data-convert=weight]").textContent : "",
      snap.body_type,
    ]);

    const contact = [];
    if (snap.phone.trim()) contact.push(["Phone", snap.phone.trim()]);
    if (snap.whatsapp.trim()) contact.push(["WhatsApp", snap.whatsapp.trim()]);
    if (snap.show_email && snap.email.trim()) contact.push(["Email", snap.email.trim()]);
    if (snap.website.trim()) contact.push(["Website", snap.website.trim()]);
    if (snap.booking_url.trim()) contact.push(["Booking", snap.booking_url.trim()]);
    if (streetReference(snap)) contact.push(["Near", streetReference(snap)]);

    const kv = (pairs) =>
      '<div class="pv__grid">' +
      pairs
        .filter((p) => p[1])
        .map((p) => '<dl class="pv__kv"><dt>' + esc(p[0]) + "</dt><dd>" + esc(p[1]) + "</dd></dl>")
        .join("") +
      "</div>";

    const discounts = [];
    if (snap.dow_discount_percent && snap.dow_discount_day) {
      discounts.push(snap.dow_discount_percent + " on " + snap.dow_discount_day + "s");
    }
    snap.regular_discounts.forEach((d) => discounts.push("Discount for " + d));

    $("#preview-body").innerHTML =
      '<div class="pv__top"><div class="pv__avatar" aria-hidden="true">' +
      esc(initials) +
      '</div><div><p class="pv__name">' +
      esc(composedHeadline(snap) || "Unnamed profile") +
      '</p><p class="pv__headline">' +
      esc(snap.tagline.trim() || snap.headline || "No headline chosen") +
      '</p><p class="pv__meta">' +
      esc(place || "Location not set") +
      (physical ? " · " + esc(physical) : "") +
      "</p>" +
      (badges.length ? '<div class="pv__badges">' + badges.join("") + "</div>" : "") +
      "</div></div>" +
      '<div class="pv__section"><p class="pv__h">About</p><p class="pv__bio">' +
      (snap.bio.trim() ? esc(snap.bio.trim()) : '<span class="pv__empty">No bio yet.</span>') +
      '</p></div><div class="pv__section"><p class="pv__h">Techniques</p>' +
      chips(snap.techniques) +
      '</div><div class="pv__section"><p class="pv__h">Rates</p>' +
      (rateRows
        ? '<div class="table-wrap pv__rates"><table><thead><tr><th>Session</th><th>In-call</th>' +
          "<th>Out-call</th></tr></thead><tbody>" +
          rateRows +
          "</tbody></table></div>"
        : '<p class="pv__empty">No rates published — clients will have to ask.</p>') +
      (discounts.length
        ? '<div class="pv__badges">' +
          discounts.map((d) => '<span class="pv__badge">' + esc(d) + "</span>").join("") +
          "</div>"
        : "") +
      (snap.payment_methods.length
        ? '<p class="pv__meta" style="margin-top:10px">Accepts ' +
          esc(snap.payment_methods.join(", ")) +
          "</p>"
        : "") +
      '</div><div class="pv__section"><p class="pv__h">Studio</p>' +
      chips(snap.amenities) +
      '</div><div class="pv__section"><p class="pv__h">Hours</p>' +
      (snap.studio_hours.length
        ? '<div class="table-wrap"><table><tbody>' +
          hourRows(snap.studio_hours) +
          "</tbody></table></div>"
        : '<p class="pv__empty">No hours published.</p>') +
      (snap.mobile_hours_same
        ? '<p class="pv__meta" style="margin-top:10px">Mobile hours match the studio.</p>'
        : snap.mobile_hours.length
          ? '<p class="pv__h" style="margin-top:16px">Mobile</p><div class="table-wrap"><table><tbody>' +
            hourRows(snap.mobile_hours) +
            "</tbody></table></div>"
          : "") +
      '</div><div class="pv__section"><p class="pv__h">Credentials</p>' +
      kv([
        ["Experience", snap.years_experience ? snap.years_experience + " years" : ""],
        [
          "Practising since",
          snap.career_start_month && snap.career_start_year
            ? snap.career_start_month + " " + snap.career_start_year
            : "",
        ],
        ["Languages", snap.languages.join(", ")],
        ["Affiliations", snap.affiliations.join(", ")],
      ]) +
      (snap.education.filter((r) => r.degree.trim()).length
        ? '<div class="pv__chips" style="margin-top:12px">' +
          snap.education
            .filter((r) => r.degree.trim())
            .map(
              (r) =>
                '<span class="pv__chip">' +
                esc(join([r.degree.trim(), r.institution.trim(), r.end_year])) +
                "</span>",
            )
            .join("") +
          "</div>"
        : "") +
      "</div>" +
      (contact.length
        ? '<div class="pv__section"><p class="pv__h">Contact</p>' +
          kv(contact) +
          (snap.show_email
            ? ""
            : '<p class="pv__meta" style="margin-top:10px">Your email stays private.</p>') +
          "</div>"
        : "");
  }

  /* ── Submit ─────────────────────────────────────────────────────────────── */

  function handleSubmit(event) {
    event.preventDefault();
    submitted = true;

    const result = refresh();
    const names = Object.keys(result.errors);

    if (names.length) {
      formErrorTitle.textContent =
        names.length === 1
          ? "One field needs attention before you can save"
          : names.length + " fields need attention before you can save";
      formErrorList.innerHTML = names
        .map((name) => {
          const field = fieldEl(name);
          const raw = field ? ($(".field__label, legend", field) || {}).textContent || name : name;
          return (
            '<li><button type="button" data-goto="' +
            esc(name) +
            '">' +
            esc(labelText(raw)) +
            " — " +
            esc(result.errors[name]) +
            "</button></li>"
          );
        })
        .join("");
      formError.hidden = false;
      formError.scrollIntoView({ behavior: "smooth", block: "center" });
      formError.focus();
      toast("error", "Not saved", "Fix the highlighted fields and try again.");
      return;
    }

    formError.hidden = true;
    const profile = toProfileJson(result.snap);
    persist("manual");
    pushHistory();

    /* Where a real integration would PATCH the provider profile. */
    console.log("[MasseurMatch] profile saved", profile);
    console.log("[MasseurMatch] payload JSON\n" + JSON.stringify(profile, null, 2));

    toast("success", "Profile saved", "All six sections are valid. The payload is in the console.");
  }

  function labelText(raw) {
    return String(raw || "")
      .replace("*", "")
      .replace(/\(required\)/i, "")
      .trim();
  }

  function markTouched(el) {
    if (el.name) touched[el.name] = true;
    if (el.dataset && el.dataset.rep) touched[el.dataset.rep] = true;
    const holder = el.closest ? el.closest("[data-field]") : null;
    if (holder) touched[holder.dataset.field] = true;
  }

  /* ── ZIP lookup ─────────────────────────────────────────────────────────── */

  function lookupZip(zip) {
    const status = $("[data-zip-status]");
    const hit = ZIP_TABLE[zip];
    if (!hit) {
      status.textContent = "No match in the demo ZIP table — fill City and State yourself.";
      status.classList.add("is-idle");
      return;
    }
    status.textContent = "Filled City, State and Neighborhood from " + zip + ".";
    status.classList.remove("is-idle");
    form.elements.city.value = hit.city;
    form.elements.state.value = hit.state;
    form.elements.neighborhood.value = hit.neighborhood;
    markDirty();
    refresh();
    pushHistory();
  }

  /* ── Wiring ─────────────────────────────────────────────────────────────── */

  function writeRepeaterValue(el) {
    const key = el.dataset.rep;
    const row = rows[key][Number(el.dataset.repI)];
    if (row) row[el.dataset.repF] = el.value;
  }

  function bind() {
    form.addEventListener("submit", handleSubmit);

    form.addEventListener("input", (event) => {
      const el = event.target;
      if (restoring) return;

      if (el.dataset && el.dataset.phone !== undefined) {
        const formatted = formatPhone(el.value);
        if (formatted !== el.value) el.value = formatted;
      }
      if (el.dataset && el.dataset.rep) writeRepeaterValue(el);

      if (el.id === "zip") {
        const zip = el.value.replace(/\D/g, "").slice(0, 5);
        if (zip !== el.value) el.value = zip;
        const status = $("[data-zip-status]");
        window.clearTimeout(zipTimer);
        if (zip.length === 5) {
          status.textContent = "Looking up " + zip + "…";
          status.classList.remove("is-idle");
          zipTimer = window.setTimeout(() => lookupZip(zip), 450);
        } else {
          status.textContent = "City, State and Neighborhood fill in from the ZIP code.";
          status.classList.add("is-idle");
        }
      }

      markDirty();
      refresh();
      pushHistoryDebounced();
    });

    form.addEventListener("change", (event) => {
      if (restoring) return;
      if (event.target.dataset && event.target.dataset.rep) writeRepeaterValue(event.target);
      markTouched(event.target);
      markDirty();
      refresh();
      pushHistoryDebounced();
    });

    form.addEventListener(
      "blur",
      (event) => {
        if (restoring) return;
        markTouched(event.target);
        refresh();
      },
      true,
    );

    /* Repeatable rows */
    form.addEventListener("click", (event) => {
      const add = event.target.closest("[data-rep-add]");
      if (add) {
        const key = add.dataset.repAdd;
        if (rows[key].length >= REPEATERS[key].max) return;
        rows[key].push(REPEATERS[key].blank());
        renderRepeater(key);
        markDirty();
        refresh();
        pushHistory();
        const fresh = $$('[data-rep-row="' + key + '"]').pop();
        const first = fresh && $("input, select", fresh);
        if (first) first.focus();
        return;
      }

      const drop = event.target.closest("[data-rep-drop]");
      if (drop) {
        const key = drop.dataset.repDrop;
        rows[key].splice(Number(drop.dataset.rowIndex), 1);
        renderRepeater(key);
        markDirty();
        refresh();
        pushHistory();
      }
    });

    /* Collapsible sections */
    $$("[data-toggle-section]").forEach((head) => {
      head.addEventListener("click", () => {
        const card = head.closest(".card");
        setCollapsed(card, !card.classList.contains("is-collapsed"));
        syncToggleAllLabel();
      });
    });

    $("#btn-toggle-all").addEventListener("click", () => {
      const anyOpen = $$(".card").some((c) => !c.classList.contains("is-collapsed"));
      $$(".card").forEach((card) => setCollapsed(card, anyOpen));
      syncToggleAllLabel();
    });

    tabsEl.addEventListener("click", (event) => {
      const tab = event.target.closest("[data-tab]");
      if (tab) goToSection(tab.dataset.tab);
    });

    formErrorList.addEventListener("click", (event) => {
      const btn = event.target.closest("[data-goto]");
      if (btn) focusField(btn.dataset.goto);
    });

    /* Checkbox group filter + clear */
    $$(".checkgroup").forEach((mount) => {
      const search = $("[data-group-search]", mount);
      if (search) {
        search.addEventListener("input", () => {
          const term = search.value.trim().toLowerCase();
          let visible = 0;
          $$(".check", mount).forEach((item) => {
            const match = item.dataset.option.indexOf(term) !== -1;
            item.hidden = !match;
            if (match) visible++;
          });
          $("[data-group-empty]", mount).hidden = visible > 0;
        });
      }
      $("[data-group-clear]", mount).addEventListener("click", () => {
        $$('input[type="checkbox"]', mount).forEach((el) => (el.checked = false));
        markDirty();
        refresh();
        pushHistory();
      });
    });

    /* Copy the in-call column across */
    $("#btn-copy-rates").addEventListener("click", () => {
      let copied = 0;
      rows.sessions.forEach((row) => {
        if (String(row.incall).trim() !== "") {
          row.outcall = row.incall;
          copied++;
        }
      });
      renderRepeater("sessions");
      markDirty();
      refresh();
      pushHistory();
      toast("info", "Rates copied", copied + " in-call rate(s) copied to the out-call column.");
    });

    /* Header tools */
    $("#btn-undo").addEventListener("click", undo);
    $("#btn-redo").addEventListener("click", redo);
    $("#btn-theme").addEventListener("click", () =>
      setTheme(currentTheme() === "dark" ? "light" : "dark"),
    );
    $("#btn-help").addEventListener("click", () => openModal("help"));

    [$("#btn-preview"), $("#btn-preview-foot")].forEach((btn) => {
      btn.addEventListener("click", () => {
        renderPreview(snapshot());
        openModal("preview");
      });
    });

    /* Click-again-to-confirm rather than window.confirm: a native dialog is
       blocked outright in a sandboxed frame, and this stays in the page. */
    const reset = $("#btn-reset");
    const resetLabel = reset.textContent;
    let resetArmed = null;
    reset.addEventListener("click", () => {
      if (!resetArmed) {
        reset.textContent = "Click again to discard your changes";
        resetArmed = window.setTimeout(() => {
          reset.textContent = resetLabel;
          resetArmed = null;
        }, 5000);
        return;
      }
      window.clearTimeout(resetArmed);
      resetArmed = null;
      reset.textContent = resetLabel;
      store.remove(DRAFT_KEY);
      touched = {};
      submitted = false;
      formError.hidden = true;
      restore(clone(SAMPLE));
      pushHistory();
      markDirty();
      toast("info", "Sample data restored", "The form is back to the demo profile.");
    });

    $$("[data-close-modal]").forEach((el) => el.addEventListener("click", closeModals));

    document.addEventListener("keydown", (event) => {
      const key = event.key.toLowerCase();
      const inField = /^(input|textarea|select)$/i.test(event.target.tagName);

      if (event.key === "Escape") return void closeModals();
      if ((event.ctrlKey || event.metaKey) && key === "s") {
        event.preventDefault();
        return void form.requestSubmit();
      }
      if ((event.ctrlKey || event.metaKey) && key === "p") {
        event.preventDefault();
        renderPreview(snapshot());
        return void openModal("preview");
      }
      if ((event.ctrlKey || event.metaKey) && key === "z") {
        event.preventDefault();
        return void (event.shiftKey ? redo() : undo());
      }
      if (event.key === "?" && !inField) {
        event.preventDefault();
        openModal("help");
      }
    });

    let ticking = false;
    window.addEventListener(
      "scroll",
      () => {
        if (ticking) return;
        ticking = true;
        window.requestAnimationFrame(() => {
          stickybar.classList.toggle("is-stuck", window.scrollY > 40);
          syncActiveTab();
          ticking = false;
        });
      },
      { passive: true },
    );

    window.addEventListener("beforeunload", (event) => {
      if (!dirty) return;
      event.preventDefault();
      event.returnValue = "";
    });
  }

  function syncToggleAllLabel() {
    const anyOpen = $$(".card").some((c) => !c.classList.contains("is-collapsed"));
    $("#btn-toggle-all").textContent = anyOpen ? "Collapse all" : "Expand all";
  }

  function syncActiveTab() {
    const offset = stickybar.getBoundingClientRect().height + 40;
    let active = SECTIONS[0].id;
    SECTIONS.forEach((section) => {
      const card = document.getElementById("section-" + section.id);
      if (card && card.getBoundingClientRect().top - offset <= 0) active = section.id;
    });
    $$(".tab").forEach((tab) => tab.classList.toggle("is-active", tab.dataset.tab === active));
  }

  /* ── Theme ──────────────────────────────────────────────────────────────── */

  function currentTheme() {
    return document.documentElement.dataset.theme;
  }

  function setTheme(theme) {
    document.documentElement.dataset.theme = theme;
    store.set(THEME_KEY, theme);
    $("#btn-theme").setAttribute("aria-pressed", String(theme === "dark"));
    $("#theme-label").textContent = theme === "dark" ? "Light" : "Dark";
  }

  function initTheme() {
    const saved = store.get(THEME_KEY);
    const prefersDark =
      window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    setTheme(saved || (prefersDark ? "dark" : "light"));
  }

  /* ── Boot ───────────────────────────────────────────────────────────────── */

  function init() {
    renderSelects();
    renderGroups();
    renderTabs();
    initTheme();
    bind();

    let restored = null;
    const raw = store.get(DRAFT_KEY);
    if (raw) {
      try {
        restored = JSON.parse(raw);
      } catch (err) {
        restored = null;
      }
    }

    restore(restored && restored.data ? restored.data : clone(SAMPLE));
    pushHistory();
    syncToggleAllLabel();
    syncActiveTab();
    startAutosave();

    if (restored && restored.data) {
      setSaveState("Draft from " + clockTime(new Date(restored.savedAt)), "saved");
      toast("info", "Draft restored", "Picked up where you left off. Reset below for sample data.");
    } else {
      setSaveState("Sample profile loaded", null);
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
