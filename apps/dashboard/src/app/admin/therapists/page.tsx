import { redirect } from "next/navigation";

export default function LegacyTherapistsPage() {
  redirect("/admin/people");
}
