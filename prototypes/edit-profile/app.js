/* ============================================================================
   MasseurMatch — Edit Profile
   Vanilla ES2020, no build step, no dependencies.

   The form is the source of truth. Everything else — progress, tabs, section
   summaries, the preview, undo history and autosave — is derived from a flat
   snapshot of the form taken on every change.
   ========================================================================== */

(function () {
  "use strict";

  /* ── Reference data ─────────────────────────────────────────────────────── */

  const STATES =
    "AL Alabama|AK Alaska|AZ Arizona|AR Arkansas|CA California|CO Colorado|CT Connecticut|" +
    "DE Delaware|DC District of Columbia|FL Florida|GA Georgia|HI Hawaii|ID Idaho|IL Illinois|" +
    "IN Indiana|IA Iowa|KS Kansas|KY Kentucky|LA Louisiana|ME Maine|MD Maryland|" +
    "MA Massachusetts|MI Michigan|MN Minnesota|MS Mississippi|MO Missouri|MT Montana|" +
    "NE Nebraska|NV Nevada|NH New Hampshire|NJ New Jersey|NM New Mexico|NY New York|" +
    "NC North Carolina|ND North Dakota|OH Ohio|OK Oklahoma|OR Oregon|PA Pennsylvania|" +
    "RI Rhode Island|SC South Carolina|SD South Dakota|TN Tennessee|TX Texas|UT Utah|" +
    "VT Vermont|VA Virginia|WA Washington|WV West Virginia|WI Wisconsin|WY Wyoming";

  const SELECTS = {
    body_type: {
      placeholder: "Select…",
      options: ["Slim", "Athletic", "Average", "Muscular", "Curvy", "Other", "Prefer not to say"],
    },
    outcall_radius: {
      placeholder: "Select a radius…",
      options: ["5 miles", "10 miles", "15 miles", "20 miles", "30 miles", "Unlimited"],
    },
    booking_platform: {
      placeholder: "Select…",
      options: ["Calendly", "Square", "Acuity", "Genbook", "SimplyBook", "None", "Other"],
    },
    booking_lead_time: {
      placeholder: "Select…",
      options: ["Same day", "24 hours", "2 days", "3 days", "1 week", "2 weeks"],
    },
  };

  const HEADLINES = ["Therapeutic Massage", "Sports Massage", "Relaxation", "Other"];

  const GROUPS = {
    techniques: {
      label: "massage techniques",
      options: [
        "Acupressure",
        "AMMA Therapy",
        "Body Scrub",
        "Cupping",
        "Deep Tissue",
        "Fitness Training",
        "Hot Stone",
        "Lingam Massage",
        "Lomi Lomi",
        "Lymphatic Drainage",
        "Myofascial Release",
        "Nuru",
        "Prostate Massage",
        "Reflexology",
        "Reiki",
        "Shiatsu",
        "Sports Massage",
        "Swedish",
        "Tantra Massage",
        "Tantric Massage",
        "Thai Massage",
        "Tui Na",
        "Yoni Massage",
        "Zero Balancing",
      ],
    },
    setup: {
      label: "setup options",
      options: ["On table", "On mat", "On floor", "Ask me for details"],
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
    amenities: {
      label: "studio amenities",
      options: [
        "Aromatherapy Enhanced",
        "Bottled Water",
        "Candles",
        "Drinking Water",
        "Free Parking",
        "Heated Room",
        "Hot Towels",
        "Music System",
        "Private Entrance",
        "Private Restroom",
        "Shower",
        "Towel Service",
      ],
    },
    products: {
      label: "products",
      options: ["Massage cream", "Massage lotion", "Massage gel", "Massage oil", "Various"],
    },
    additional_services: {
      label: "additional services",
      options: [
        "Acupuncture",
        "Body scrub",
        "Colonic cleansing",
        "Cupping",
        "Fitness training",
        "Hair styling",
        "Nutrition coaching",
        "Personal training",
        "Skin care",
        "Waxing",
      ],
    },
    payment_methods: {
      label: "payment methods",
      options: [
        "American Express",
        "Apple Pay",
        "Bank Transfer",
        "Bitcoin",
        "Cash",
        "Mastercard",
        "Venmo",
        "Visa",
        "Zelle",
        "Other",
      ],
    },
    languages: {
      label: "languages",
      options: [
        "English",
        "Spanish",
        "Portuguese",
        "French",
        "German",
        "Italian",
        "Chinese",
        "Japanese",
        "Korean",
        "Russian",
        "Other",
      ],
    },
  };

  const GROUP_NAMES = Object.keys(GROUPS);

  const RATE_ROWS = [
    { key: "30min", label: "30 min" },
    { key: "60min", label: "60 min" },
    { key: "90min", label: "90 min" },
    { key: "2h", label: "2 hours" },
    { key: "3h", label: "3 hours" },
    { key: "overnight", label: "Overnight" },
  ];

  const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  const MONTHS = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  /* Sections drive the tabs, the progress counter and the collapsed summaries.
     `extra` is what "complete" means for a section with no required fields. */
  const SECTIONS = [
    {
      id: "about",
      label: "About you",
      short: "About",
      extra: null,
      summary: (s) =>
        join([
          s.display_name,
          s.headline,
          s.body_type && s.body_type !== "Prefer not to say" ? s.body_type : "",
        ]) || "Name, headline and the bio clients read first.",
    },
    {
      id: "location",
      label: "Location & contact",
      short: "Location",
      extra: null,
      summary: (s) =>
        join([
          s.city && s.state ? s.city + ", " + s.state : s.city || s.state,
          s.offer_incall && s.offer_outcall
            ? "In-call & out-call"
            : s.offer_incall
              ? "In-call only"
              : s.offer_outcall
                ? "Out-call only"
                : "",
          s.phone,
        ]) || "Where you work and how clients reach you.",
    },
    {
      id: "services",
      label: "Services",
      short: "Services",
      extra: (s) => s.techniques.length > 0,
      hint: "Pick at least one massage technique.",
      summary: (s) =>
        join([
          count(s.techniques, "technique"),
          count(s.amenities, "amenity", "amenities"),
          count(s.additional_services, "extra service"),
        ]) || "Techniques, setup and what you provide.",
    },
    {
      id: "rates",
      label: "Rates & payments",
      short: "Rates",
      extra: (s) => rateValues(s).some((n) => n > 0),
      hint: "Add at least one session price.",
      summary: (s) => {
        const values = rateValues(s).filter((n) => n > 0);
        const from = values.length ? "From " + money(Math.min.apply(null, values)) : "";
        return (
          join([from, count(s.payment_methods, "payment method")]) ||
          "Session pricing, discounts and payment methods."
        );
      },
    },
    {
      id: "schedule",
      label: "Schedule",
      short: "Schedule",
      extra: (s) => DAYS.some((d) => (s["hours_" + d.toLowerCase()] || "").trim() !== ""),
      hint: "Fill in the hours for at least one day.",
      summary: (s) => {
        const open = DAYS.filter((d) => {
          const v = (s["hours_" + d.toLowerCase()] || "").trim();
          return v !== "" && v.toLowerCase() !== "closed";
        }).length;
        return (
          join([
            open ? open + (open === 1 ? " day open" : " days open") : "",
            s.available_now ? "Available now" : "",
            s.booking_lead_time ? s.booking_lead_time + " notice" : "",
          ]) || "Studio hours, availability and lead time."
        );
      },
    },
    {
      id: "credentials",
      label: "Credentials",
      short: "Credentials",
      extra: null,
      summary: (s) =>
        join([
          s.years_experience ? s.years_experience + " years experience" : "",
          s.certification,
          count(s.languages, "language"),
        ]) || "Experience, training and languages.",
    },
  ];

  /* Every rule returns an error string, or "" when the value passes. */
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;
  const PHONE_RE = /^\(\d{3}\) \d{3}-\d{4}$/;
  const ZIP_RE = /^\d{5}(-\d{4})?$/;

  const RULES = {
    display_name: [req("Add the name clients will see on your listing.")],
    headline: [req("Choose the headline that fits most of your work.")],
    bio: [
      req("Your bio is what clients read first — it cannot be empty."),
      (v) =>
        v.trim().length < 120
          ? "Tell clients a little more — at least 120 characters (currently " +
            v.trim().length +
            ")."
          : "",
    ],
    zip: [
      req("A ZIP code is how clients find you in search."),
      (v) => (ZIP_RE.test(v.trim()) ? "" : "Use 5 digits, or ZIP+4 — for example 75219."),
    ],
    city: [req("Add the city you work in.")],
    state: [req("Choose your state.")],
    phone: [
      req("Add a phone number clients can reach you on."),
      (v) => (PHONE_RE.test(v.trim()) ? "" : "Use the format (555) 123-4567."),
    ],
    whatsapp: [
      (v) => (v.trim() === "" || PHONE_RE.test(v.trim()) ? "" : "Use the format (555) 123-4567."),
    ],
    email: [
      req("Add an email address."),
      (v) => (EMAIL_RE.test(v.trim()) ? "" : "That does not look like a valid email address."),
    ],
    website: [url],
    booking_url: [url],
    years_experience: [
      req("How many years have you been practising?"),
      (v) => {
        const n = Number(v);
        if (!Number.isFinite(n) || !Number.isInteger(n)) return "Enter a whole number of years.";
        if (n < 0) return "Years of experience cannot be negative.";
        if (n > 70) return "That looks too high — enter 70 or fewer years.";
        return "";
      },
    ],
    rates: [
      (value, snap) =>
        rateValues(snap).some((n) => n < 0)
          ? "Session rates cannot be negative — remove the minus sign."
          : "",
    ],
    first_time_discount_pct: [
      (v, snap) => {
        if (!snap.first_time_discount) return "";
        if (v.trim() === "") return "Enter the discount percentage, or turn the discount off.";
        const n = Number(v);
        if (!Number.isFinite(n)) return "Enter a number between 1 and 100.";
        if (n <= 0) return "A discount has to be greater than 0%.";
        if (n > 100) return "A discount cannot be more than 100%.";
        return "";
      },
    ],
  };

  /* Prefilled demo data — also what "Reset to sample data" restores. */
  const SAMPLE = {
    display_name: "Bruno",
    headline: "Therapeutic Massage",
    tagline: "Deep tissue and sports recovery in Oak Lawn, Dallas — 14 years on the table.",
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
    height: "6'8\" (203cm)",
    weight: "175 lb (79kg)",
    body_type: "Athletic",

    zip: "75219",
    city: "Dallas",
    state: "TX",
    neighborhood: "Oak Lawn",
    cross_streets: "Cedar Springs Rd & Throckmorton St",
    offer_incall: true,
    offer_outcall: true,
    show_on_map: true,
    outcall_radius: "20 miles",
    phone: "(555) 123-4567",
    whatsapp: "(555) 123-4567",
    email: "segatti.hall@gmail.com",
    email_public: false,
    website: "https://yoursite.com",
    booking_url: "https://book.yoursite.com",
    booking_platform: "Calendly",

    techniques: [
      "AMMA Therapy",
      "Deep Tissue",
      "Hot Stone",
      "Myofascial Release",
      "Reiki",
      "Shiatsu",
      "Sports Massage",
      "Swedish",
    ],
    setup: ["On table", "On mat"],
    outcall_extras: ["Heated Massage Table", "Hot Towels", "Massage Table", "Music"],
    amenities: [
      "Aromatherapy Enhanced",
      "Bottled Water",
      "Candles",
      "Free Parking",
      "Hot Towels",
      "Private Restroom",
      "Shower",
    ],
    products: ["Massage oil", "Massage cream"],
    additional_services: ["Cupping", "Fitness training"],

    rate_30min_incall: "80",
    rate_60min_incall: "120",
    rate_90min_incall: "170",
    rate_2h_incall: "220",
    rate_3h_incall: "300",
    rate_overnight_incall: "",
    rate_30min_outcall: "",
    rate_60min_outcall: "160",
    rate_90min_outcall: "210",
    rate_2h_outcall: "260",
    rate_3h_outcall: "340",
    rate_overnight_outcall: "",
    longer_sessions: true,
    rates_vary_distance: true,
    first_time_discount: true,
    first_time_discount_pct: "15",
    special_day_discount: "10% de desconto nas terças-feiras",
    payment_methods: [
      "American Express",
      "Apple Pay",
      "Cash",
      "Mastercard",
      "Venmo",
      "Visa",
      "Zelle",
    ],

    hours_monday: "9:00 AM - 11:00 PM",
    hours_tuesday: "9:00 AM - 11:00 PM",
    hours_wednesday: "9:00 AM - 11:00 PM",
    hours_thursday: "9:00 AM - 11:00 PM",
    hours_friday: "9:00 AM - 11:00 PM",
    hours_saturday: "9:00 AM - 11:00 PM",
    hours_sunday: "9:00 AM - 11:00 PM",
    mobile_hours_same: true,
    available_now: true,
    lgbtq_affirming: true,
    booking_lead_time: "Same day",

    years_experience: "14",
    career_start: "January 2010",
    certification: "Certified Massage Therapist",
    school: "Instituto Brasileiro de Terapias Manuais",
    school_location: "Rio de Janeiro, Rio de Janeiro",
    languages: ["Portuguese", "English", "Spanish"],
  };

  const DRAFT_KEY = "mm.edit-profile.draft.v1";
  const THEME_KEY = "mm.edit-profile.theme";
  const AUTOSAVE_MS = 30000;
  const HISTORY_MAX = 60;

  /* ── Small helpers ──────────────────────────────────────────────────────── */

  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.prototype.slice.call((root || document).querySelectorAll(sel));

  function req(message) {
    return (v) => (String(v).trim() === "" ? message : "");
  }

  function url(v) {
    const value = v.trim();
    if (value === "") return "";
    if (!/^https?:\/\//i.test(value)) return "Start the address with http:// or https://.";
    try {
      new URL(value);
      return "";
    } catch (err) {
      return "That does not look like a valid web address.";
    }
  }

  function labelText(raw) {
    return String(raw || "")
      .replace("*", "")
      .replace(/\(required\)/i, "")
      .trim();
  }

  function markTouched(el) {
    if (el.name) touched[el.name] = true;
    const holder = el.closest ? el.closest("[data-field]") : null;
    if (holder) touched[holder.dataset.field] = true;
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

  function rateValues(snap) {
    const out = [];
    RATE_ROWS.forEach((row) => {
      ["incall", "outcall"].forEach((type) => {
        const raw = snap["rate_" + row.key + "_" + type];
        const n = Number(raw);
        if (raw !== "" && Number.isFinite(n)) out.push(n);
      });
    });
    return out;
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

  /* localStorage is a convenience here, never a requirement: private windows
     and blocked site data throw on access, and the page must still work. */
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

  /* ── Element handles ────────────────────────────────────────────────────── */

  const form = $("#profile-form");
  const tabsEl = $("#tabs");
  const stickybar = $("#stickybar");
  const toastsEl = $("#toasts");
  const formError = $("#form-error");
  const formErrorList = $("#form-error-list");
  const formErrorTitle = $("#form-error-title");

  let touched = {};
  let submitted = false;
  let restoring = false;
  let dirty = false;
  let history = [];
  let historyIndex = -1;
  let lastFocused = null;

  /* ── Rendering ──────────────────────────────────────────────────────────── */

  function renderSelects() {
    const stateSelect = $('[data-mount="states"]');
    stateSelect.innerHTML =
      '<option value="">Select a state…</option>' +
      STATES.split("|")
        .map((entry) => {
          const i = entry.indexOf(" ");
          const code = entry.slice(0, i);
          const name = entry.slice(i + 1);
          return '<option value="' + code + '">' + esc(code + " — " + name) + "</option>";
        })
        .join("");

    Object.keys(SELECTS).forEach((name) => {
      const el = $('[data-mount="' + name + '"]');
      if (!el) return;
      el.innerHTML =
        '<option value="">' +
        esc(SELECTS[name].placeholder) +
        "</option>" +
        SELECTS[name].options
          .map((opt) => '<option value="' + esc(opt) + '">' + esc(opt) + "</option>")
          .join("");
    });

    const year = new Date().getFullYear();
    const months = [];
    for (let y = year; y >= year - 45; y--) {
      MONTHS.forEach((m) => months.push('<option value="' + m + " " + y + '"></option>'));
    }
    $("#months").innerHTML = months.join("");
  }

  function renderHeadline() {
    $('[data-mount="headline"]').innerHTML = HEADLINES.map((opt, i) => {
      return (
        '<label class="seg">' +
        '<input type="radio" name="headline" value="' +
        esc(opt) +
        '"' +
        (i === 0 ? " data-required" : "") +
        " />" +
        '<span class="seg__face">' +
        esc(opt) +
        "</span></label>"
      );
    }).join("");
  }

  function renderGroups() {
    $$(".checkgroup").forEach((mount) => {
      const name = mount.dataset.group;
      const group = GROUPS[name];
      const cols = mount.dataset.cols || "3";
      const searchable = mount.dataset.searchable === "true";

      const bar =
        '<div class="checkgroup__bar">' +
        '<span class="checkgroup__count" data-group-count>0 of ' +
        group.options.length +
        " selected</span>" +
        (searchable
          ? '<input type="search" class="checkgroup__search" data-group-search ' +
            'placeholder="Filter ' +
            group.options.length +
            " " +
            esc(group.label) +
            '…" aria-label="Filter ' +
            esc(group.label) +
            '" />'
          : "") +
        '<button type="button" class="linkbtn" data-group-clear hidden>Clear</button>' +
        "</div>";

      const items = group.options
        .map((opt) => {
          return (
            '<label class="check" data-option="' +
            esc(opt.toLowerCase()) +
            '">' +
            '<input type="checkbox" name="' +
            name +
            '" value="' +
            esc(opt) +
            '" />' +
            '<span class="check__box" aria-hidden="true"></span>' +
            '<span class="check__text">' +
            esc(opt) +
            "</span></label>"
          );
        })
        .join("");

      mount.innerHTML =
        bar +
        '<div class="checkgroup__grid" data-cols="' +
        cols +
        '" role="group" aria-label="' +
        esc(group.label) +
        '">' +
        items +
        "</div>" +
        '<p class="checkgroup__empty" data-group-empty hidden>Nothing matches that filter.</p>';
    });
  }

  function renderRates() {
    $('[data-mount="rates-rows"]').innerHTML = RATE_ROWS.map((row) => {
      const cell = (type) =>
        '<td><div class="money"><span class="money__box">' +
        '<span class="money__sign" aria-hidden="true">$</span>' +
        '<input type="number" min="0" step="1" inputmode="numeric" name="rate_' +
        row.key +
        "_" +
        type +
        '" data-money aria-label="' +
        esc(row.label + " " + (type === "incall" ? "in-call" : "out-call") + " rate") +
        '" placeholder="—" /></span>' +
        '<span class="money__fmt" data-money-fmt aria-live="off"></span>' +
        "</div></td>";
      return (
        '<tr><th scope="row">' +
        esc(row.label) +
        "</th>" +
        cell("incall") +
        cell("outcall") +
        "</tr>"
      );
    }).join("");
  }

  function renderHours() {
    $('[data-mount="hours-rows"]').innerHTML = DAYS.map((day) => {
      const key = "hours_" + day.toLowerCase();
      return (
        '<tr><th scope="row"><label for="' +
        key +
        '">' +
        day +
        "</label></th>" +
        '<td><input type="text" id="' +
        key +
        '" name="' +
        key +
        '" placeholder="9:00 AM - 11:00 PM" /></td>' +
        '<td><button type="button" class="daybtn" data-day-closed="' +
        key +
        '">Closed</button></td></tr>'
      );
    }).join("");
  }

  function renderTabs() {
    tabsEl.innerHTML = SECTIONS.map((section, i) => {
      return (
        '<button type="button" class="tab" data-tab="' +
        section.id +
        '" aria-controls="section-' +
        section.id +
        '">' +
        '<span class="tab__dot" aria-hidden="true"></span>' +
        "<span>" +
        (i + 1) +
        ". " +
        esc(section.short) +
        "</span>" +
        '<span class="tab__count" data-tab-count aria-hidden="true">0</span>' +
        "</button>"
      );
    }).join("");
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
      else if (el.type === "radio") {
        if (el.checked) out[name] = el.value;
        else if (!(name in out)) out[name] = "";
      } else out[name] = el.value;
    });

    return out;
  }

  function restore(data) {
    restoring = true;

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
      else if (el.type === "radio") el.checked = el.value === data[name];
      else el.value = data[name] == null ? "" : String(data[name]);
    });

    restoring = false;
    refresh();
  }

  /* The structured payload — what a real save would POST. */
  function toProfileJson(snap) {
    const pricing = {};
    RATE_ROWS.forEach((row) => {
      const incall = snap["rate_" + row.key + "_incall"];
      const outcall = snap["rate_" + row.key + "_outcall"];
      if (incall === "" && outcall === "") return;
      pricing[row.label] = {
        incall: incall === "" ? null : Number(incall),
        outcall: outcall === "" ? null : Number(outcall),
      };
    });

    const studioHours = {};
    DAYS.forEach((day) => {
      const value = (snap["hours_" + day.toLowerCase()] || "").trim();
      if (value) studioHours[day] = value;
    });

    return {
      about: {
        display_name: snap.display_name.trim(),
        headline: snap.headline,
        tagline: snap.tagline.trim() || null,
        bio: snap.bio.trim(),
        height: snap.height.trim() || null,
        weight: snap.weight.trim() || null,
        body_type: snap.body_type || null,
      },
      location: {
        zip: snap.zip.trim(),
        city: snap.city.trim(),
        state: snap.state,
        neighborhood: snap.neighborhood.trim() || null,
        cross_streets: snap.cross_streets.trim() || null,
        offer_incall: snap.offer_incall,
        offer_outcall: snap.offer_outcall,
        show_on_map: snap.show_on_map,
        outcall_radius: snap.offer_outcall ? snap.outcall_radius || null : null,
      },
      contact: {
        phone: snap.phone.trim(),
        whatsapp: snap.whatsapp.trim() || null,
        email: snap.email.trim(),
        email_public: snap.email_public,
        website: snap.website.trim() || null,
        booking_url: snap.booking_url.trim() || null,
        booking_platform: snap.booking_platform || null,
      },
      services: {
        techniques: snap.techniques,
        setup: snap.setup,
        outcall_extras: snap.outcall_extras,
        amenities: snap.amenities,
        products: snap.products,
        additional_services: snap.additional_services,
      },
      rates: {
        pricing: pricing,
        longer_sessions: snap.longer_sessions,
        rates_vary_distance: snap.rates_vary_distance,
        first_time_discount: snap.first_time_discount
          ? { percent: Number(snap.first_time_discount_pct) || null }
          : null,
        special_day_discount: snap.special_day_discount.trim() || null,
        payment_methods: snap.payment_methods,
      },
      schedule: {
        studio_hours: studioHours,
        mobile_hours_same_as_studio: snap.mobile_hours_same,
        available_now: snap.available_now,
        lgbtq_affirming: snap.lgbtq_affirming,
        booking_lead_time: snap.booking_lead_time || null,
      },
      credentials: {
        years_experience: snap.years_experience === "" ? null : Number(snap.years_experience),
        career_start: snap.career_start.trim() || null,
        certification: snap.certification.trim() || null,
        school: snap.school.trim() || null,
        school_location: snap.school_location.trim() || null,
        languages: snap.languages,
      },
    };
  }

  /* ── Validation ─────────────────────────────────────────────────────────── */

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
      $$("input, select, textarea", field).forEach((el) => {
        el.setAttribute("aria-invalid", "true");
        el.setAttribute("aria-describedby", name + "-error");
      });
    } else {
      field.classList.remove("is-invalid");
      if (node) node.remove();
      $$("input, select, textarea", field).forEach((el) => {
        el.removeAttribute("aria-invalid");
        el.removeAttribute("aria-describedby");
      });
    }
  }

  function paintAll(snap, errors) {
    Object.keys(RULES).forEach((name) => {
      const message = errors[name] || "";
      paintField(name, message, Boolean(message) && (submitted || touched[name]));
    });
  }

  /* ── Derived UI ─────────────────────────────────────────────────────────── */

  function updateCounters() {
    $$("[data-counter-for]").forEach((el) => {
      const input = document.getElementById(el.dataset.counterFor);
      if (!input) return;
      const max = Number(input.getAttribute("maxlength")) || 0;
      const used = input.value.length;
      el.textContent = used + "/" + max;
      el.classList.toggle("is-warn", max > 0 && used >= max * 0.9 && used < max);
      el.classList.toggle("is-max", max > 0 && used >= max);
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
      outcall_radius: snap.offer_outcall,
      first_time_discount_pct: snap.first_time_discount,
    };
    Object.keys(rules).forEach((key) => {
      const el = $('[data-conditional="' + key + '"]');
      if (el) el.hidden = !rules[key];
    });

    const note = $("[data-outcall-note]");
    if (note) note.hidden = Boolean(snap.offer_outcall);
  }

  function updateMoney() {
    $$("[data-money]").forEach((input) => {
      const out = $("[data-money-fmt]", input.closest(".money"));
      const raw = input.value.trim();
      const n = Number(raw);
      if (raw === "") {
        out.textContent = "";
        out.style.color = "";
        input.classList.remove("is-invalid");
      } else if (!Number.isFinite(n) || n < 0) {
        out.textContent = "No negative rates";
        out.style.color = "var(--error)";
        input.classList.add("is-invalid");
      } else {
        out.textContent = money(n);
        out.style.color = "";
        input.classList.remove("is-invalid");
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

  function sectionState(snap, errors) {
    return SECTIONS.map((section) => {
      const sectionEl = document.getElementById("section-" + section.id);
      const names = $$("[data-field]", sectionEl).map((el) => el.dataset.field);
      const own = names.filter((n) => errors[n]);
      const hasRequired = names.some((n) => RULES[n] && RULES[n].length && isRequired(n));
      const extraOk = section.extra ? section.extra(snap) : true;
      return {
        section: section,
        errors: own,
        complete: own.length === 0 && extraOk && (hasRequired || section.extra !== null),
      };
    });
  }

  function isRequired(name) {
    const field = fieldEl(name);
    return field ? $$("[data-required]", field).length > 0 : false;
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
        esc(errorCount) +
        (errorCount === 1 ? " field needs" : " fields need") +
        " attention — the red dots in the section bar show where.";
    } else if (done === SECTIONS.length) {
      hint.innerHTML = "Every section is complete. Save when you are happy with the preview.";
    } else {
      const next = states.filter((s) => !s.complete)[0];
      hint.innerHTML =
        "Next up: <strong>" +
        esc(next.section.label) +
        "</strong>" +
        (next.section.hint ? " — " + esc(next.section.hint) : " — fill in the required fields.");
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
          : "Not finished yet";
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
    const place = join([snap.city.trim(), snap.state]);
    $("#hero-place").textContent = place || "add a city";
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
    paintAll(snap, errors);
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
    const payload = { savedAt: new Date().toISOString(), data: snapshot() };
    const ok = store.set(DRAFT_KEY, JSON.stringify(payload));
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
      if (!dirty) return;
      persist("auto");
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
    if (!card) return card;
    setCollapsed(card, false);
    return card;
  }

  function goToSection(id) {
    const card = openSection(id);
    if (!card) return;
    window.requestAnimationFrame(() => {
      card.scrollIntoView({ behavior: "smooth", block: "start" });
    });
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
    if (snap.offer_incall) badges.push('<span class="pv__badge pv__badge--brand">In-call</span>');
    if (snap.offer_outcall) {
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

    const rateRows = RATE_ROWS.map((row) => {
      const incall = snap["rate_" + row.key + "_incall"];
      const outcall = snap["rate_" + row.key + "_outcall"];
      if (incall === "" && outcall === "") return "";
      return (
        '<tr><th scope="row">' +
        esc(row.label) +
        "</th><td>" +
        (incall === "" ? "—" : money(incall)) +
        "</td><td>" +
        (outcall === "" ? "—" : money(outcall)) +
        "</td></tr>"
      );
    }).join("");

    const hourRows = DAYS.map((day) => {
      const value = (snap["hours_" + day.toLowerCase()] || "").trim();
      if (!value) return "";
      return '<tr><th scope="row">' + day + "</th><td>" + esc(value) + "</td></tr>";
    }).join("");

    const discounts = [];
    if (snap.first_time_discount && snap.first_time_discount_pct)
      discounts.push(snap.first_time_discount_pct + "% off your first session");
    if (snap.special_day_discount.trim()) discounts.push(snap.special_day_discount.trim());

    const contact = [];
    if (snap.phone.trim()) contact.push(["Phone", snap.phone.trim()]);
    if (snap.whatsapp.trim()) contact.push(["WhatsApp", snap.whatsapp.trim()]);
    if (snap.email_public && snap.email.trim()) contact.push(["Email", snap.email.trim()]);
    if (snap.website.trim()) contact.push(["Website", snap.website.trim()]);
    if (snap.booking_url.trim()) contact.push(["Booking", snap.booking_url.trim()]);
    if (snap.booking_lead_time) contact.push(["Lead time", snap.booking_lead_time]);

    const physical = join([snap.height.trim(), snap.weight.trim(), snap.body_type]);

    $("#preview-body").innerHTML =
      '<div class="pv__top">' +
      '<div class="pv__avatar" aria-hidden="true">' +
      esc(initials) +
      "</div><div>" +
      '<p class="pv__name">' +
      esc(snap.display_name.trim() || "Unnamed profile") +
      "</p>" +
      '<p class="pv__headline">' +
      esc(snap.headline || "No headline chosen") +
      "</p>" +
      '<p class="pv__meta">' +
      esc(place || "Location not set") +
      (physical ? " · " + esc(physical) : "") +
      "</p>" +
      (badges.length ? '<div class="pv__badges">' + badges.join("") + "</div>" : "") +
      "</div></div>" +
      (snap.tagline.trim()
        ? '<div class="pv__section"><p class="pv__headline">' +
          esc(snap.tagline.trim()) +
          "</p></div>"
        : "") +
      '<div class="pv__section"><p class="pv__h">About</p><p class="pv__bio">' +
      (snap.bio.trim() ? esc(snap.bio.trim()) : '<span class="pv__empty">No bio yet.</span>') +
      "</p></div>" +
      '<div class="pv__section"><p class="pv__h">Techniques</p>' +
      chips(snap.techniques) +
      "</div>" +
      '<div class="pv__section"><p class="pv__h">Rates</p>' +
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
      "</div>" +
      '<div class="pv__section"><p class="pv__h">Studio</p>' +
      chips(snap.amenities) +
      "</div>" +
      '<div class="pv__section"><p class="pv__h">Hours</p>' +
      (hourRows
        ? '<div class="table-wrap"><table><tbody>' + hourRows + "</tbody></table></div>"
        : '<p class="pv__empty">No hours published.</p>') +
      (snap.mobile_hours_same && snap.offer_outcall
        ? '<p class="pv__meta" style="margin-top:10px">Out-call hours match the studio.</p>'
        : "") +
      "</div>" +
      '<div class="pv__section"><p class="pv__h">Credentials</p><div class="pv__grid">' +
      [
        ["Experience", snap.years_experience ? snap.years_experience + " years" : ""],
        ["Practising since", snap.career_start.trim()],
        ["Certification", snap.certification.trim()],
        ["School", join([snap.school.trim(), snap.school_location.trim()])],
        ["Languages", snap.languages.join(", ")],
      ]
        .filter((pair) => pair[1])
        .map(
          (pair) =>
            '<dl class="pv__kv"><dt>' + esc(pair[0]) + "</dt><dd>" + esc(pair[1]) + "</dd></dl>",
        )
        .join("") +
      "</div></div>" +
      (contact.length
        ? '<div class="pv__section"><p class="pv__h">Contact</p><div class="pv__grid">' +
          contact
            .map(
              (pair) =>
                '<dl class="pv__kv"><dt>' +
                esc(pair[0]) +
                "</dt><dd>" +
                esc(pair[1]) +
                "</dd></dl>",
            )
            .join("") +
          "</div>" +
          (snap.email_public
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
          const label = field
            ? ($(".field__label, legend", field) || {}).textContent || name
            : name;
          return (
            '<li><button type="button" data-goto="' +
            esc(name) +
            '">' +
            esc(labelText(label)) +
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

    /* Where a real integration would POST to the API. */
    console.log("[MasseurMatch] profile saved", profile);
    console.log("[MasseurMatch] payload JSON\n" + JSON.stringify(profile, null, 2));

    toast("success", "Profile saved", "All six sections are valid. The payload is in the console.");
  }

  /* ── Wiring ─────────────────────────────────────────────────────────────── */

  function bind() {
    form.addEventListener("submit", handleSubmit);

    form.addEventListener("input", (event) => {
      const el = event.target;
      if (restoring) return;

      if (el.dataset && el.dataset.phone !== undefined) {
        const formatted = formatPhone(el.value);
        if (formatted !== el.value) el.value = formatted;
      }

      markDirty();
      refresh();
      pushHistoryDebounced();
    });

    form.addEventListener("change", (event) => {
      if (restoring) return;
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

    /* Tabs */
    tabsEl.addEventListener("click", (event) => {
      const tab = event.target.closest("[data-tab]");
      if (tab) goToSection(tab.dataset.tab);
    });

    /* Jump links inside the error summary */
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

      const clear = $("[data-group-clear]", mount);
      clear.addEventListener("click", () => {
        $$('input[type="checkbox"]', mount).forEach((el) => (el.checked = false));
        markDirty();
        refresh();
        pushHistory();
      });
    });

    /* Rates helper */
    $("#btn-copy-rates").addEventListener("click", () => {
      let copied = 0;
      RATE_ROWS.forEach((row) => {
        const from = form.elements["rate_" + row.key + "_incall"];
        const to = form.elements["rate_" + row.key + "_outcall"];
        if (from && to && from.value !== "") {
          to.value = from.value;
          copied++;
        }
      });
      markDirty();
      refresh();
      pushHistory();
      toast("info", "Rates copied", copied + " in-call rate(s) copied to the out-call column.");
    });

    /* Schedule helpers */
    $("#hours-table").addEventListener("click", (event) => {
      const btn = event.target.closest("[data-day-closed]");
      if (!btn) return;
      const input = form.elements[btn.dataset.dayClosed];
      input.value = input.value.trim().toLowerCase() === "closed" ? "" : "Closed";
      markDirty();
      refresh();
      pushHistory();
    });

    $("#btn-apply-all").addEventListener("click", () => {
      const value = form.elements.hours_monday.value;
      DAYS.forEach((day) => (form.elements["hours_" + day.toLowerCase()].value = value));
      markDirty();
      refresh();
      pushHistory();
      toast("info", "Hours applied", "Every day now matches Monday.");
    });

    $("#btn-weekend-closed").addEventListener("click", () => {
      form.elements.hours_saturday.value = "Closed";
      form.elements.hours_sunday.value = "Closed";
      markDirty();
      refresh();
      pushHistory();
      toast("info", "Weekend closed", "Saturday and Sunday are marked closed.");
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
      restore(SAMPLE);
      pushHistory();
      markDirty();
      toast("info", "Sample data restored", "The form is back to the demo profile.");
    });

    $$("[data-close-modal]").forEach((el) => el.addEventListener("click", closeModals));

    /* Keyboard */
    document.addEventListener("keydown", (event) => {
      const key = event.key.toLowerCase();
      const inField = /^(input|textarea|select)$/i.test(event.target.tagName);

      if (event.key === "Escape") {
        closeModals();
        return;
      }
      if ((event.ctrlKey || event.metaKey) && key === "s") {
        event.preventDefault();
        form.requestSubmit();
        return;
      }
      if ((event.ctrlKey || event.metaKey) && key === "p") {
        event.preventDefault();
        renderPreview(snapshot());
        openModal("preview");
        return;
      }
      if ((event.ctrlKey || event.metaKey) && key === "z") {
        event.preventDefault();
        if (event.shiftKey) redo();
        else undo();
        return;
      }
      if (event.key === "?" && !inField) {
        event.preventDefault();
        openModal("help");
      }
    });

    /* Sticky bar shadow + active tab */
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
    const btn = $("#btn-theme");
    btn.setAttribute("aria-pressed", String(theme === "dark"));
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
    renderHeadline();
    renderGroups();
    renderRates();
    renderHours();
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

    restore(restored && restored.data ? restored.data : SAMPLE);
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
