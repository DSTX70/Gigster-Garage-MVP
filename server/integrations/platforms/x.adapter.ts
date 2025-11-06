export async function postToX({ profileId, text, mediaUrls = [] }: { profileId: string; text: string; mediaUrls?: string[] }) {
  // TODO: replace with real X API call (use env X_BEARER_TOKEN)
  return { ok: true, remoteId: `x_${Date.now()}` };
}
