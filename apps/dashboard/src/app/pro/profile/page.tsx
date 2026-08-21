import { redirect } from "next/navigation";

/**
 * The profile editor lives at `/pro/listing`.
 *
 * Production kept this path as a redirect after a second, partial editor here
 * was found writing the same table under different field names. Mirrored so a
 * link to either address lands on the one editor.
 */
export default function ProProfilePage() {
  redirect("/pro/listing");
}
