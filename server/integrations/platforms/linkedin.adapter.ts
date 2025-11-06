export async function postToLinkedIn({ profileId, text, mediaUrls = [] }: { profileId: string; text: string; mediaUrls?: string[] }) {
  // TODO: real LinkedIn API call
  return { ok: true, remoteId: `li_${Date.now()}` };
}
