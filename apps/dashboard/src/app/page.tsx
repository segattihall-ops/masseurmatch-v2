import {
  Avatar,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  FadeIn,
  PageTransition,
  StaggerItem,
  StaggerList,
} from "@masseurmatch/ui";

/**
 * Dashboard home.
 *
 * Server component — the motion wrappers below own their client boundaries,
 * so nothing here is forced onto the client.
 */

const stats = [
  { label: "Profile views", value: "1,284", delta: "+12% vs last week" },
  { label: "Booking requests", value: "37", delta: "+4 pending reply" },
  { label: "Response rate", value: "94%", delta: "Top 10% of therapists" },
];

export default function DashboardPage() {
  return (
    <PageTransition transitionKey="dashboard-home">
      <div className="mx-auto w-full max-w-5xl px-6 py-12">
        <FadeIn className="flex items-center gap-4">
          <Avatar size="xl" name="Andre Silva" />
          <div className="space-y-1">
            <h1 className="font-display text-ds-32 font-bold tracking-tight text-text-primary">
              Welcome back, Andre
            </h1>
            <p className="text-sm text-text-secondary">
              Your profile is live and verified. Here is how this week is going.
            </p>
          </div>
        </FadeIn>

        <StaggerList className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-3">
          {stats.map((stat) => (
            <StaggerItem key={stat.label}>
              <Card className="h-full">
                <CardHeader>
                  <CardDescription>{stat.label}</CardDescription>
                  <CardTitle className="font-stat text-ds-32">{stat.value}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-text-muted">{stat.delta}</p>
                </CardContent>
              </Card>
            </StaggerItem>
          ))}
        </StaggerList>

        <FadeIn delay={0.12} className="mt-10 flex flex-wrap gap-3">
          <Button>Edit profile</Button>
          <Button variant="outline">Manage availability</Button>
          <Button variant="ghost">View public page</Button>
        </FadeIn>
      </div>
    </PageTransition>
  );
}
