import { redirect } from "next/navigation";

export default function LegacyApprovalDetailPage({ params }: { params: { id: string } }) {
  redirect(`/admin/moderation?profile=${encodeURIComponent(params.id)}`);
}
