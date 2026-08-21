import { redirect } from "next/navigation";

export default function LegacyManualVerificationPage() {
  redirect("/admin/verifications/manual");
}
