export type PostInput = {
  profileId: string;
  text: string;
  mediaUrls?: string[];
};

export type PostResult = 
  | { ok: true; remoteId: string } 
  | { ok: false; error: string; transient?: boolean };

export interface PlatformAdapter {
  name: string;
  post: (input: PostInput) => Promise<PostResult>;
}

async function fakeNetwork<T>(result: T, failChance = 0.1): Promise<T> {
  await new Promise(r => setTimeout(r, 250));
  if (Math.random() < failChance) throw new Error("Transient network error");
  return result;
}

export const XAdapter: PlatformAdapter = {
  name: "x",
  async post({ profileId, text }) {
    const res = await fakeNetwork({ id: `x_${Date.now()}` });
    return { ok: true, remoteId: res.id };
  }
};

export const InstagramAdapter: PlatformAdapter = {
  name: "instagram",
  async post({ profileId, text }) {
    const res = await fakeNetwork({ id: `ig_${Date.now()}` });
    return { ok: true, remoteId: res.id };
  }
};

export const LinkedInAdapter: PlatformAdapter = {
  name: "linkedin",
  async post({ profileId, text }) {
    const res = await fakeNetwork({ id: `li_${Date.now()}` });
    return { ok: true, remoteId: res.id };
  }
};

export const FacebookAdapter: PlatformAdapter = {
  name: "facebook",
  async post({ profileId, text }) {
    const res = await fakeNetwork({ id: `fb_${Date.now()}` });
    return { ok: true, remoteId: res.id };
  }
};

export const TikTokAdapter: PlatformAdapter = {
  name: "tiktok",
  async post({ profileId, text }) {
    const res = await fakeNetwork({ id: `tt_${Date.now()}` });
    return { ok: true, remoteId: res.id };
  }
};

export const YouTubeAdapter: PlatformAdapter = {
  name: "youtube",
  async post({ profileId, text }) {
    const res = await fakeNetwork({ id: `yt_${Date.now()}` });
    return { ok: true, remoteId: res.id };
  }
};

export function getAdapter(platform: string): PlatformAdapter {
  switch (platform) {
    case "x": return XAdapter;
    case "instagram": return InstagramAdapter;
    case "linkedin": return LinkedInAdapter;
    case "facebook": return FacebookAdapter;
    case "tiktok": return TikTokAdapter;
    case "youtube": return YouTubeAdapter;
    default: throw new Error(`Unsupported platform: ${platform}`);
  }
}
