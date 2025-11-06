import { RestliClient } from 'linkedin-api-client';
import { PostInput, PostResult } from '../icadence/platforms';

export interface LinkedInCredentials {
  accessToken: string;
  personUrn: string; // urn:li:person:XXX or organization URN
}

export interface LinkedInPostInput extends PostInput {
  credentials: LinkedInCredentials;
}

/**
 * Post to LinkedIn using Official API Client
 * Supports text posts and single image attachment
 */
export async function postToLinkedIn(input: LinkedInPostInput): Promise<PostResult> {
  try {
    const { credentials, text, mediaUrls = [] } = input;
    const { accessToken, personUrn } = credentials;

    const restliClient = new RestliClient();

    // Prepare post payload
    const sharePayload: any = {
      author: personUrn,
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: {
            text: text,
          },
          shareMediaCategory: mediaUrls.length > 0 ? 'IMAGE' : 'NONE',
        },
      },
      visibility: {
        'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC',
      },
    };

    // Handle media if present (LinkedIn supports 1 image per post via simple API)
    if (mediaUrls.length > 0) {
      const imageUrl = mediaUrls[0]; // Use first image only

      // For image posts, we need to upload the image first
      // This is a simplified version - full implementation requires:
      // 1. Register upload
      // 2. Upload image binary
      // 3. Create share with uploaded image reference
      
      // For now, we'll use a direct image URL if supported
      sharePayload.specificContent['com.linkedin.ugc.ShareContent'].media = [
        {
          status: 'READY',
          description: {
            text: text,
          },
          media: imageUrl,
          title: {
            text: 'Image',
          },
        },
      ];
    }

    // Create the post
    const response = await restliClient.create({
      resourcePath: '/ugcPosts',
      entity: sharePayload,
      accessToken: accessToken,
      versionString: '202304', // API version
    });

    // Extract post ID from response
    const postId = response?.data?.id || response?.data || 'unknown';

    return {
      ok: true,
      remoteId: String(postId),
    };

  } catch (error: any) {
    console.error('LinkedIn post error:', error);

    const errorMessage = error.message || String(error);
    const isTransient = isTransientError(error);

    return {
      ok: false,
      error: `LinkedIn API error: ${errorMessage}`,
      transient: isTransient,
    };
  }
}

/**
 * Determine if an error is transient (retryable)
 */
function isTransientError(error: any): boolean {
  const errorCode = error.code || error.statusCode || error.status;
  const errorMessage = String(error.message || error).toLowerCase();

  // Rate limit errors
  if (errorCode === 429 || errorMessage.includes('throttle')) {
    return true;
  }

  // Server errors (5xx)
  if (errorCode >= 500 && errorCode < 600) {
    return true;
  }

  // Network/timeout errors
  if (
    errorMessage.includes('timeout') ||
    errorMessage.includes('econnreset') ||
    errorMessage.includes('network')
  ) {
    return true;
  }

  return false;
}

/**
 * Validate LinkedIn credentials by fetching user profile
 */
export async function validateLinkedInCredentials(
  credentials: LinkedInCredentials
): Promise<boolean> {
  try {
    const { accessToken } = credentials;
    const restliClient = new RestliClient();

    // Try to fetch user profile
    await restliClient.get({
      resourcePath: '/me',
      accessToken: accessToken,
    });

    return true;
  } catch (error) {
    console.error('LinkedIn credentials validation failed:', error);
    return false;
  }
}
