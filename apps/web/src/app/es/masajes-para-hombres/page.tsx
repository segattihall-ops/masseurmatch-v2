import type { Metadata } from "next";

import {
  InstitutionalBand,
  InstitutionalCardGrid,
  InstitutionalCta,
  InstitutionalHero,
  InstitutionalPage,
  InstitutionalSection,
  InstitutionalSteps,
} from "@/components/institutional/institutional-page";
import { jsonLdScript } from "@/lib/jsonld";
import { absoluteUrl, SITE_NAME } from "@/lib/site";

const PATH = "/es/masajes-para-hombres";
const TITLE = "Masajes para Hombres | Masajistas Masculinos Cerca de Ti";
const DESCRIPTION =
  "Encuentra masajes para hombres y masajistas masculinos por ciudad. Compara perfiles, servicios, precios, disponibilidad, incall, outcall y opciones LGBTQ+ friendly.";

const FAQS = [
  {
    question: "¿Cómo encuentro masajes para hombres cerca de mí?",
    answer:
      "Empieza por tu ciudad y compara los perfiles públicos disponibles. Revisa servicios, precios, disponibilidad y si el masajista ofrece incall, outcall o ambos. Después confirma los detalles directamente con el proveedor.",
  },
  {
    question: "¿Puedo buscar un masajista masculino?",
    answer:
      "Sí. MasseurMatch organiza perfiles públicos de masajistas masculinos independientes para que puedas comparar opciones por ciudad, servicios y detalles del perfil antes de contactar al proveedor.",
  },
  {
    question: "¿Hay opciones LGBTQ+ friendly?",
    answer:
      "Los perfiles pueden incluir información LGBTQ+ affirming y otras señales de confianza. Revisa cada perfil y confirma directamente con el proveedor el ambiente y el tipo de servicio que buscas.",
  },
  {
    question: "¿MasseurMatch reserva o cobra por las citas?",
    answer:
      "No. MasseurMatch es un directorio de descubrimiento. Los clientes comparan perfiles públicos y contactan directamente a proveedores independientes para confirmar disponibilidad, precios y ubicación.",
  },
] as const;

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: {
    canonical: absoluteUrl(PATH),
    languages: {
      "es-US": absoluteUrl(PATH),
      "en-US": absoluteUrl("/massage-for-men"),
      "x-default": absoluteUrl("/massage-for-men"),
    },
  },
  openGraph: {
    type: "website",
    url: absoluteUrl(PATH),
    siteName: SITE_NAME,
    title: TITLE,
    description: DESCRIPTION,
    locale: "es_US",
  },
};

export const dynamic = "force-static";

export default function MasajesParaHombresPage() {
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };

  return (
    <InstitutionalPage>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(faqJsonLd) }}
      />

      <InstitutionalHero
        eyebrow="Masajes para hombres"
        title="Encuentra masajistas masculinos"
        highlight="por ciudad."
        description={DESCRIPTION}
        actions={[
          { label: "Ver ciudades", href: "/cities" },
          { label: "Buscar masajistas", href: "/search", secondary: true },
        ]}
        stats={[
          {
            value: "Búsqueda local",
            label: "Compara perfiles públicos en las ciudades disponibles.",
          },
          {
            value: "Incall / outcall",
            label: "Revisa el formato de sesión que ofrece cada proveedor.",
          },
          {
            value: "Contacto directo",
            label: "Confirma precios, ubicación y disponibilidad directamente.",
          },
        ]}
      />

      <InstitutionalBand>
        MasseurMatch ayuda a personas que buscan masajes para hombres, masajistas para hombres o un
        masajista masculino cerca de su ubicación a encontrar perfiles públicos y opciones locales
        sin depender de páginas duplicadas o contenido genérico.
      </InstitutionalBand>

      <InstitutionalSection
        eyebrow="Cómo empezar"
        title="Busca por ciudad y compara cada perfil."
        intro="La mejor experiencia local combina ubicación, servicios, precios, disponibilidad y señales visibles del perfil."
      >
        <InstitutionalSteps
          steps={[
            {
              title: "Elige tu ciudad",
              body: "Abre una página local para ver los perfiles públicos disponibles en ese mercado.",
              meta: "Cerca de mí",
            },
            {
              title: "Compara servicios",
              body: "Revisa técnicas, especialidades, precios y detalles publicados por cada proveedor.",
              meta: "Servicios",
            },
            {
              title: "Revisa incall y outcall",
              body: "Comprueba si viajas al proveedor o si el proveedor ofrece servicio en una ubicación acordada.",
              meta: "Formato de sesión",
            },
            {
              title: "Contacta directamente",
              body: "Confirma ubicación exacta, horario, precio total y detalles del servicio antes de la cita.",
              meta: "Contacto directo",
            },
          ]}
        />
      </InstitutionalSection>

      <InstitutionalSection
        dark
        eyebrow="Qué puedes comparar"
        title="Información útil antes de contactar."
      >
        <InstitutionalCardGrid
          dark
          cards={[
            {
              title: "Técnicas de masaje",
              body: "Compara deep tissue, Swedish, sports, Thai y otras técnicas listadas en el perfil.",
            },
            {
              title: "Precios",
              body: "Usa los precios publicados como referencia y confirma el total directamente con el proveedor.",
            },
            {
              title: "Disponibilidad",
              body: "Revisa la disponibilidad visible y confirma la hora exacta directamente.",
            },
            {
              title: "LGBTQ+ friendly",
              body: "Los perfiles pueden incluir información affirming para ayudar a comparar el ambiente y el fit.",
            },
          ]}
        />
      </InstitutionalSection>

      <InstitutionalSection
        eyebrow="Preguntas"
        title="Masajes para hombres: preguntas frecuentes"
      >
        <div className="grid gap-8 md:grid-cols-2">
          {FAQS.map((faq) => (
            <div key={faq.question}>
              <h3 className="font-display text-xl font-semibold text-text-primary">
                {faq.question}
              </h3>
              <p className="mt-3 text-sm leading-7 text-text-secondary">{faq.answer}</p>
            </div>
          ))}
        </div>
      </InstitutionalSection>

      <InstitutionalCta
        title="Encuentra masajes para hombres en tu ciudad."
        description="Compara perfiles públicos, servicios, precios y disponibilidad, y contacta directamente al proveedor independiente."
        actions={[
          { label: "Ver ciudades", href: "/cities" },
          { label: "English: Massage for men", href: "/massage-for-men", secondary: true },
        ]}
      />
    </InstitutionalPage>
  );
}
