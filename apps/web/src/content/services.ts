export type ServiceSlug =
  | "deep-tissue"
  | "swedish"
  | "sports"
  | "thai"
  | "mobile"
  | "hotel"
  | "lymphatic"
  | "hot-stone";

export type ServiceDefinition = {
  slug: ServiceSlug;
  label: string;
  query: string;
  title: string;
  description: string;
  intro: string;
  faqs: Array<{ question: string; answer: string }>;
};

export const SERVICES: ServiceDefinition[] = [
  {
    slug: "deep-tissue",
    label: "Deep Tissue",
    query: "deep tissue",
    title: "Deep Tissue Massage Therapists",
    description:
      "Find male massage therapists offering deep tissue work. Compare verified profiles, pricing, session formats and direct-contact options on MasseurMatch.",
    intro:
      "Deep tissue massage uses focused pressure and slower techniques to address muscle tension and recovery. Compare therapists who list deep tissue among their services, review trust signals, and contact them directly to confirm fit and availability.",
    faqs: [
      {
        question: "What is deep tissue massage?",
        answer:
          "Deep tissue massage generally uses slower, more focused pressure to work deeper layers of muscle and connective tissue. Technique and pressure vary by therapist.",
      },
      {
        question: "How do I choose a deep tissue therapist?",
        answer:
          "Compare experience, listed techniques, verification signals, pricing and session format, then contact the therapist directly about pressure preferences and goals.",
      },
    ],
  },
  {
    slug: "swedish",
    label: "Swedish Massage",
    query: "swedish",
    title: "Swedish Massage Therapists",
    description:
      "Browse male massage therapists offering Swedish massage, with visible profile details, pricing, trust signals and direct contact.",
    intro:
      "Swedish massage typically uses long flowing strokes and kneading with a relaxation-focused approach. Browse therapists who list Swedish massage and compare their session options before contacting them directly.",
    faqs: [
      {
        question: "What is Swedish massage?",
        answer:
          "Swedish massage commonly uses gliding strokes, kneading and rhythmic techniques intended to promote relaxation and reduce everyday muscle tension.",
      },
      {
        question: "Is Swedish massage a good first massage?",
        answer:
          "Many people choose Swedish massage when they prefer a gentler, relaxation-oriented session, but the right technique depends on your goals and comfort preferences.",
      },
    ],
  },
  {
    slug: "sports",
    label: "Sports Massage",
    query: "sports",
    title: "Sports Massage Therapists",
    description:
      "Find male massage therapists offering sports and recovery-focused massage. Compare profiles, pricing, availability and direct-contact options.",
    intro:
      "Sports massage is commonly used by active clients for recovery, mobility and muscle maintenance. Browse therapists who list sports or recovery work and review their experience before contacting them directly.",
    faqs: [
      {
        question: "What is sports massage?",
        answer:
          "Sports massage is a broad category of massage techniques used around training, activity and recovery. Individual therapists may combine stretching, targeted pressure and other modalities.",
      },
      {
        question: "How is sports massage different from deep tissue?",
        answer:
          "Sports massage is organized around activity and recovery goals, while deep tissue describes a pressure and tissue-focused approach. A therapist may use both in the same practice.",
      },
    ],
  },
  {
    slug: "thai",
    label: "Thai Massage",
    query: "thai",
    title: "Thai Massage Therapists",
    description:
      "Browse male massage therapists offering Thai massage and assisted stretching, with verified profile details and direct contact.",
    intro:
      "Thai massage often combines assisted stretching, compression and acupressure-style techniques. Compare therapists who list Thai massage, their experience and session format, then contact them directly.",
    faqs: [
      {
        question: "What is Thai massage?",
        answer:
          "Thai massage commonly combines assisted movement, stretching and pressure techniques. Exact methods vary with the practitioner's training and style.",
      },
      {
        question: "What should I ask before a Thai massage?",
        answer:
          "Ask about the therapist's training, how much assisted stretching is involved, what clothing is recommended and whether the session format matches your mobility needs.",
      },
    ],
  },
  {
    slug: "mobile",
    label: "Mobile & Outcall Massage",
    query: "mobile",
    title: "Mobile & Outcall Massage Therapists",
    description:
      "Find male massage therapists who offer outcall or mobile sessions at homes, hotels and other permitted locations.",
    intro:
      "Mobile and outcall therapists travel to the client's location. Use MasseurMatch to compare providers who advertise outcall service, review pricing and trust signals, and contact them directly to confirm travel area and availability.",
    faqs: [
      {
        question: "What does outcall massage mean?",
        answer:
          "Outcall means the therapist travels to an agreed client location rather than the client visiting the therapist's workspace.",
      },
      {
        question: "How do I confirm an outcall session?",
        answer:
          "Contact the therapist directly to confirm the service area, travel fee if any, timing, location requirements and session details before the appointment.",
      },
    ],
  },
  {
    slug: "hotel",
    label: "Hotel Massage",
    query: "hotel",
    title: "Hotel Massage Therapists",
    description:
      "Browse male massage therapists who indicate hotel or travel-friendly outcall service and contact them directly to confirm availability.",
    intro:
      "Some outcall therapists work with travelers staying at hotels. MasseurMatch lists providers and their stated services; hotel access rules, travel fees and availability must be confirmed directly with the therapist and property.",
    faqs: [
      {
        question: "Can a therapist provide massage at a hotel?",
        answer:
          "Some therapists offer hotel outcall service, but access and guest policies vary by property. Confirm the therapist's service area and the hotel's rules before scheduling.",
      },
      {
        question: "Does MasseurMatch book hotel massage appointments?",
        answer:
          "No. MasseurMatch is a directory. Clients contact therapists directly to discuss availability, pricing and location details.",
      },
    ],
  },
  {
    slug: "lymphatic",
    label: "Lymphatic Drainage",
    query: "lymphatic",
    title: "Lymphatic Drainage Massage Therapists",
    description:
      "Find male massage therapists who list lymphatic drainage among their services and compare their profiles, experience and direct-contact options.",
    intro:
      "Lymphatic drainage is a specialized, typically gentle technique. Because training and scope can vary, review each therapist's stated experience and contact them directly before scheduling.",
    faqs: [
      {
        question: "What is lymphatic drainage massage?",
        answer:
          "Lymphatic drainage generally refers to gentle manual techniques intended to encourage lymphatic movement. It is different from standard relaxation or deep tissue massage.",
      },
      {
        question: "What should I verify before choosing a provider?",
        answer:
          "Review the provider's stated training and experience and discuss your goals directly. For medical or post-procedure concerns, follow guidance from an appropriate licensed healthcare professional.",
      },
    ],
  },
  {
    slug: "hot-stone",
    label: "Hot Stone Massage",
    query: "hot stone",
    title: "Hot Stone Massage Therapists",
    description:
      "Browse male massage therapists who list hot stone massage, compare profile details and contact providers directly.",
    intro:
      "Hot stone massage incorporates heated stones as part of a massage session. Browse therapists who list this technique, compare session options and contact them directly to confirm availability and how they use the modality.",
    faqs: [
      {
        question: "What is hot stone massage?",
        answer:
          "Hot stone massage uses heated smooth stones as part of a massage session, often combined with hands-on massage techniques.",
      },
      {
        question: "How do I know whether a therapist offers hot stone massage?",
        answer:
          "Check the services listed on the therapist's profile and contact them directly to confirm that the modality is currently available.",
      },
    ],
  },
];

export const SERVICE_SLUGS = SERVICES.map((service) => service.slug);

export function getServiceBySlug(slug: string): ServiceDefinition | null {
  return SERVICES.find((service) => service.slug === slug) ?? null;
}
