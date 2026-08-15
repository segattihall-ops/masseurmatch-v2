import {
  Avatar,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  FadeIn,
  Input,
  StaggerItem,
  StaggerList,
} from "@masseurmatch/ui";

/**
 * Public site home.
 *
 * This is a server component — no `"use client"` here. The motion wrappers
 * carry their own client boundary, which is what lets them be composed
 * directly into a server-rendered tree.
 */

const therapists = [
  { name: "Andre Silva", city: "Los Angeles, CA", modality: "Deep tissue · Sports" },
  { name: "Marcus Reed", city: "New York, NY", modality: "Swedish · Myofascial" },
  { name: "Julian Okafor", city: "Miami, FL", modality: "Thai · Stretch therapy" },
];

export default function HomePage() {
  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-20">
      <FadeIn className="space-y-5">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-secondary">
          MasseurMatch
        </p>
        <h1 className="max-w-3xl font-display text-ds-56 font-bold tracking-tight text-text-primary">
          Verified male massage therapists, without the guesswork.
        </h1>
        <p className="max-w-2xl text-ds-18 text-text-secondary">
          A premium directory built on identity-verified profiles, real availability and honest
          pricing.
        </p>
      </FadeIn>

      <FadeIn delay={0.08} className="mt-10 flex flex-col gap-3 sm:flex-row">
        <Input
          type="search"
          name="q"
          placeholder="Search by city, modality or name"
          aria-label="Search therapists"
          className="sm:max-w-md"
        />
        <Button size="lg">Find a therapist</Button>
        <Button size="lg" variant="outline">
          List your practice
        </Button>
      </FadeIn>

      <StaggerList
        whileInView
        as="ul"
        className="mt-16 grid list-none grid-cols-1 gap-6 p-0 sm:grid-cols-2 lg:grid-cols-3"
      >
        {therapists.map((therapist) => (
          <StaggerItem as="li" key={therapist.name}>
            <Card className="h-full">
              <CardHeader className="flex-row items-center gap-4 space-y-0">
                <Avatar size="lg" name={therapist.name} />
                <div className="space-y-1">
                  <CardTitle>{therapist.name}</CardTitle>
                  <CardDescription>{therapist.city}</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-text-secondary">{therapist.modality}</p>
                <Button variant="secondary" size="sm">
                  View profile
                </Button>
              </CardContent>
            </Card>
          </StaggerItem>
        ))}
      </StaggerList>
    </main>
  );
}
