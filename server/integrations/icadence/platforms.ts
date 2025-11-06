import { pool } from '../../db';
import { postToX, type XCredentials } from '../platforms/x.adapter';
import { postToInstagram, type InstagramCredentials } from '../platforms/instagram.adapter';
import { postToLinkedIn, type LinkedInCredentials } from '../platforms/linkedin.adapter';

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

/**
 * Fetch platform credentials from database
 */
async function getCredentialsForProfile(profileId: string, platform: string): Promise<any | null> {
  const { rows } = await pool.query(
    `SELECT credentials FROM platform_credentials
     WHERE profile_id = $1 AND platform = $2 AND status = 'active'
     LIMIT 1`,
    [profileId, platform]
  );
  
  return rows[0]?.credentials || null;
}

/**
 * Real adapters that fetch credentials from database
 */
export const XAdapter: PlatformAdapter = {
  name: "x",
  async post({ profileId, text, mediaUrls }) {
    const credentials = await getCredentialsForProfile(profileId, "x");
    
    if (!credentials) {
      return {
        ok: false,
        error: "No active X credentials found for profile",
        transient: false,
      };
    }

    return await postToX({
      profileId,
      text,
      mediaUrls,
      credentials: credentials as XCredentials,
    });
  }
};

export const InstagramAdapter: PlatformAdapter = {
  name: "instagram",
  async post({ profileId, text, mediaUrls }) {
    const credentials = await getCredentialsForProfile(profileId, "instagram");
    
    if (!credentials) {
      return {
        ok: false,
        error: "No active Instagram credentials found for profile",
        transient: false,
      };
    }

    return await postToInstagram({
      profileId,
      text,
      mediaUrls,
      credentials: credentials as InstagramCredentials,
    });
  }
};

export const LinkedInAdapter: PlatformAdapter = {
  name: "linkedin",
  async post({ profileId, text, mediaUrls }) {
    const credentials = await getCredentialsForProfile(profileId, "linkedin");
    
    if (!credentials) {
      return {
        ok: false,
        error: "No active LinkedIn credentials found for profile",
        transient: false,
      };
    }

    return await postToLinkedIn({
      profileId,
      text,
      mediaUrls,
      credentials: credentials as LinkedInCredentials,
    });
  }
};

/**
 * Stub adapters for platforms not yet implemented
 */
export const FacebookAdapter: PlatformAdapter = {
  name: "facebook",
  async post({ profileId, text }) {
    return {
      ok: false,
      error: "Facebook adapter not yet implemented",
      transient: false,
    };
  }
};

export const TikTokAdapter: PlatformAdapter = {
  name: "tiktok",
  async post({ profileId, text }) {
    return {
      ok: false,
      error: "TikTok adapter not yet implemented",
      transient: false,
    };
  }
};

export const YouTubeAdapter: PlatformAdapter = {
  name: "youtube",
  async post({ profileId, text }) {
    return {
      ok: false,
      error: "YouTube adapter not yet implemented",
        transient: false,
    };
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
