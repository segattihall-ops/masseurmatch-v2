import type { ReactNode } from "react";
import Link from "next/link";
import {
  FadeIn,
  ScrollCue,
  ScrollParallax,
  ScrollProgressBar,
  StaggerItem,
  StaggerList,
} from "@masseurmatch/ui";

type Action = { label: string; href: string; secondary?: boolean };
type Stat = { value: string; label: string };
type Card = { eyebrow?: string; title: string; body: string; meta?: string };
type Step = { title: string; body: string; meta?: string };
type Faq = { question: string; answer: string };

function ActionLink({ action }: { action: Action }) {
  const className = action.secondary
    ? "inline-flex min-h-12 items-center justify-center rounded-full border border-white/15 bg-white/[0.06] px-6 py-3 text-sm font-semibold text-white transition duration-300 hover:border-white/25 hover:bg-white/[0.1]"
    : "inline-flex min-h-12 items-center justify-center rounded-full bg-brand-secondary px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-secondary/15 transition duration-300 hover:-translate-y-0.5 hover:bg-action-primary-hover hover:shadow-xl";

  if (/^https?:\/\//.test(action.href)) {
    return (
      <a href={action.href} className={className}>
        {action.label}
        <span aria-hidden="true" className="ml-2">↗</span>
      </a>
    );
  }

  return (
    <Link href={action.href} className={className}>
      {action.label}
      <span aria-hidden="true" className="ml-2">→</span>
    </Link>
  );
}

export function InstitutionalPage({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-clip bg-bg-surface text-text-primary">
      <ScrollProgressBar className="bg-brand-secondary" />
      {children}
    </div>
  );
}

export function InstitutionalHero({
  eyebrow,
  title,
  highlight,
  description,
  actions = [],
  stats = [],
}: {
  eyebrow: string;
  title: string;
  highlight?: string;
  description: string;
  actions?: Action[];
  stats?: Stat[];
}) {
  return (
    <section className="relative isolate overflow-hidden bg-[#0d0d0f] text-white">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-80"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.035) 1px, transparent 0)",
          backgroundSize: "30px 30px",
        }}
      />
      <div aria-hidden="true" className="pointer-events-none absolute -right-36 top-8 sm:-right-20">
        <ScrollParallax distance={34} className="h-[30rem] w-[30rem] rounded-full bg-brand-secondary/15 blur-3xl sm:h-[38rem] sm:w-[38rem]">
          <span className="block h-full w-full" />
        </ScrollParallax>
      </div>
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-black/30 to-transparent" />

      <div className="relative mx-auto flex min-h-[clamp(36rem,78svh,52rem)] w-full max-w-6xl flex-col justify-center px-6 pb-20 pt-24 sm:pb-24 sm:pt-28 lg:pb-28 lg:pt-32">
        <FadeIn className="max-w-5xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#d66b7a]">{eyebrow}</p>
          <h1 className="mt-5 max-w-5xl font-display text-[clamp(2.75rem,7vw,6.5rem)] font-bold leading-[0.96] tracking-[-0.045em] text-white">
            {title}
            {highlight ? <span className="mt-2 block text-[#d66b7a] sm:mt-3">{highlight}</span> : null}
          </h1>
          <p className="mt-7 max-w-2xl text-base leading-7 text-white/68 sm:text-lg sm:leading-8">{description}</p>
          {actions.length > 0 ? (
            <div className="mt-9 flex flex-wrap gap-3">
              {actions.map((action) => <ActionLink key={`${action.href}-${action.label}`} action={action} />)}
            </div>
          ) : null}
        </FadeIn>

        {stats.length > 0 ? (
          <StaggerList as="ul" className="mt-16 grid list-none gap-px overflow-hidden rounded-3xl border border-white/[0.08] bg-white/[0.08] p-0 sm:grid-cols-3 lg:mt-20">
            {stats.map((stat) => (
              <StaggerItem as="li" key={`${stat.value}-${stat.label}`} className="bg-[#111113]/95 p-6 sm:p-7">
                <p className="font-display text-2xl font-semibold tracking-tight text-white sm:text-3xl">{stat.value}</p>
                <p className="mt-2 text-sm leading-6 text-white/55">{stat.label}</p>
              </StaggerItem>
            ))}
          </StaggerList>
        ) : null}

        <div className="absolute bottom-6 left-6 hidden text-[10px] font-semibold uppercase tracking-[0.22em] text-white/35 sm:block">
          <ScrollCue>Scroll to explore <span aria-hidden="true">↓</span></ScrollCue>
        </div>
      </div>
    </section>
  );
}

export function InstitutionalBand({ children }: { children: ReactNode }) {
  return (
    <section className="border-y border-brand-secondary/15 bg-brand-soft/45 px-6 py-5">
      <FadeIn whileInView className="mx-auto max-w-4xl text-center text-sm font-medium leading-6 text-text-primary sm:text-base">{children}</FadeIn>
    </section>
  );
}

export function InstitutionalSection({
  eyebrow,
  title,
  intro,
  children,
  dark = false,
  id,
}: {
  eyebrow?: string;
  title: string;
  intro?: string;
  children?: ReactNode;
  dark?: boolean;
  id?: string;
}) {
  return (
    <section id={id} className={`scroll-mt-24 px-6 py-20 sm:py-24 lg:py-28 ${dark ? "bg-[#111113] text-white" : "bg-bg-surface text-text-primary"}`}>
      <div className="mx-auto w-full max-w-6xl">
        <FadeIn whileInView className="max-w-3xl">
          {eyebrow ? <p className={`text-[10px] font-semibold uppercase tracking-[0.26em] ${dark ? "text-[#d66b7a]" : "text-brand-secondary"}`}>{eyebrow}</p> : null}
          <h2 className={`mt-3 font-display text-[clamp(2rem,4.2vw,3.5rem)] font-bold leading-[1.02] tracking-[-0.035em] ${dark ? "text-white" : "text-text-primary"}`}>{title}</h2>
          {intro ? <p className={`mt-5 max-w-2xl text-base leading-7 sm:text-lg ${dark ? "text-white/60" : "text-text-secondary"}`}>{intro}</p> : null}
        </FadeIn>
        {children ? <div className="mt-12">{children}</div> : null}
      </div>
    </section>
  );
}

export function InstitutionalCardGrid({ cards, dark = false }: { cards: Card[]; dark?: boolean }) {
  return (
    <StaggerList whileInView as="ul" className={`grid list-none gap-px overflow-hidden rounded-[2rem] border p-0 sm:grid-cols-2 lg:grid-cols-3 ${dark ? "border-white/[0.08] bg-white/[0.08]" : "border-border-subtle bg-border-subtle"}`}>
      {cards.map((card) => (
        <StaggerItem as="li" key={card.title} className={`min-h-64 p-7 sm:p-8 ${dark ? "bg-[#151517]" : "bg-bg-surface"}`}>
          {card.eyebrow ? <p className={`text-[10px] font-semibold uppercase tracking-[0.22em] ${dark ? "text-[#d66b7a]" : "text-brand-secondary"}`}>{card.eyebrow}</p> : null}
          <h3 className={`mt-3 font-display text-xl font-semibold tracking-tight ${dark ? "text-white" : "text-text-primary"}`}>{card.title}</h3>
          <p className={`mt-4 text-sm leading-7 ${dark ? "text-white/58" : "text-text-secondary"}`}>{card.body}</p>
          {card.meta ? <p className={`mt-6 text-xs font-semibold uppercase tracking-[0.16em] ${dark ? "text-white/38" : "text-text-muted"}`}>{card.meta}</p> : null}
        </StaggerItem>
      ))}
    </StaggerList>
  );
}

export function InstitutionalSteps({ steps, dark = false }: { steps: Step[]; dark?: boolean }) {
  return (
    <StaggerList whileInView as="ol" className={`grid list-none gap-px overflow-hidden rounded-[2rem] border p-0 sm:grid-cols-2 lg:grid-cols-4 ${dark ? "border-white/[0.08] bg-white/[0.08]" : "border-border-subtle bg-border-subtle"}`}>
      {steps.map((step, index) => (
        <StaggerItem as="li" key={step.title} className={`relative min-h-72 p-7 sm:p-8 ${dark ? "bg-[#151517]" : "bg-bg-surface"}`}>
          <span aria-hidden="true" className={`font-display text-5xl font-bold tracking-[-0.04em] ${dark ? "text-white/[0.08]" : "text-brand-secondary/10"}`}>{String(index + 1).padStart(2, "0")}</span>
          <h3 className={`mt-8 font-display text-xl font-semibold tracking-tight ${dark ? "text-white" : "text-text-primary"}`}>{step.title}</h3>
          <p className={`mt-4 text-sm leading-7 ${dark ? "text-white/58" : "text-text-secondary"}`}>{step.body}</p>
          {step.meta ? <p className={`mt-6 text-xs font-semibold uppercase tracking-[0.16em] ${dark ? "text-[#d66b7a]" : "text-brand-secondary"}`}>{step.meta}</p> : null}
        </StaggerItem>
      ))}
    </StaggerList>
  );
}

export function InstitutionalSplit({ left, right, dark = false }: { left: ReactNode; right: ReactNode; dark?: boolean }) {
  return (
    <div className={`grid overflow-hidden rounded-[2rem] border lg:grid-cols-2 ${dark ? "border-white/[0.08]" : "border-border-subtle"}`}>
      <FadeIn whileInView direction="right" className={`p-7 sm:p-9 lg:p-12 ${dark ? "bg-[#151517]" : "bg-bg-surface"}`}>{left}</FadeIn>
      <FadeIn whileInView direction="left" delay={0.08} className={`border-t p-7 sm:p-9 lg:border-l lg:border-t-0 lg:p-12 ${dark ? "border-white/[0.08] bg-[#0d0d0f]" : "border-border-subtle bg-bg-subtle"}`}>{right}</FadeIn>
    </div>
  );
}

export function InstitutionalFaq({ items }: { items: Faq[] }) {
  return (
    <div className="divide-y divide-border-subtle overflow-hidden rounded-[2rem] border border-border-subtle bg-bg-surface">
      {items.map((item, index) => (
        <FadeIn whileInView key={item.question} delay={Math.min(index * 0.03, 0.15)}>
          <details className="group px-6 py-1 sm:px-8">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-5 py-6 font-display text-lg font-semibold tracking-tight text-text-primary marker:content-none">
              <span>{item.question}</span>
              <span aria-hidden="true" className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-border-subtle text-brand-secondary transition duration-300 group-open:rotate-45">+</span>
            </summary>
            <p className="max-w-3xl pb-7 pr-10 text-sm leading-7 text-text-secondary sm:text-base">{item.answer}</p>
          </details>
        </FadeIn>
      ))}
    </div>
  );
}

export function InstitutionalCta({ eyebrow = "Next step", title, description, actions }: { eyebrow?: string; title: string; description: string; actions: Action[] }) {
  return (
    <section className="relative overflow-hidden bg-[#0d0d0f] px-6 py-20 text-white sm:py-24 lg:py-28">
      <div aria-hidden="true" className="pointer-events-none absolute -left-24 top-0 h-80 w-80 rounded-full bg-brand-secondary/12 blur-3xl" />
      <FadeIn whileInView className="relative mx-auto max-w-4xl text-center">
        <p className="text-[10px] font-semibold uppercase tracking-[0.26em] text-[#d66b7a]">{eyebrow}</p>
        <h2 className="mt-4 font-display text-[clamp(2.1rem,5vw,4rem)] font-bold leading-[1] tracking-[-0.04em] text-white">{title}</h2>
        <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-white/60 sm:text-lg">{description}</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {actions.map((action) => <ActionLink key={`${action.href}-${action.label}`} action={action} />)}
        </div>
      </FadeIn>
    </section>
  );
}
