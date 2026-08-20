import { createSessionClient } from "@masseurmatch/db/auth";

import { PhotosStep } from "@/app/onboarding/photos-step";
import { photoLimitForProfile } from "@/lib/cloudinary";
import { getOrCreateMyProfile, listMyPhotos } from "@/lib/profile";

export default async function TherapistPhotosPage() {
  const supabase = createSessionClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { profile } = await getOrCreateMyProfile(user.id);
  const photos = await listMyPhotos(profile.id);
  const limit = photoLimitForProfile(profile);

  return (
    <div className="space-y-8 p-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-text-primary">Photos</h1>
        <p className="text-text-secondary">
          Upload and manage your gallery. New photos are reviewed before they appear publicly, and
          the primary photo is the one shown on your public card.
        </p>
      </div>

      <div className="rounded-lg border border-border bg-surface p-6">
        <PhotosStep photos={photos} limit={limit} managePrimary />
      </div>
    </div>
  );
}
