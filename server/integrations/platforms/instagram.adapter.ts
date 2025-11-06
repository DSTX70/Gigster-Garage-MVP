export async function postToInstagram({ profileId, text, mediaUrls = [] }: { profileId: string; text: string; mediaUrls?: string[] }) {
  // TODO: real IG Graph API call
  return { ok: true, remoteId: `ig_${Date.now()}` };
}
