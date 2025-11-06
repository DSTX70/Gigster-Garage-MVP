import { PostInput, PostResult } from '../icadence/platforms';

export interface InstagramCredentials {
  accessToken: string;
  userId: string; // Instagram Business Account ID
}

export interface InstagramPostInput extends PostInput {
  credentials: InstagramCredentials;
}

/**
 * Post to Instagram using Graph API
 * Supports single image or carousel posts
 * 
 * Instagram posting is a 2-step process:
 * 1. Create a media container
 * 2. Publish the container
 */
export async function postToInstagram(input: InstagramPostInput): Promise<PostResult> {
  try {
    const { credentials, text, mediaUrls = [] } = input;

    if (mediaUrls.length === 0) {
      return {
        ok: false,
        error: 'Instagram posts require at least one image',
        transient: false,
      };
    }

    const { accessToken, userId } = credentials;
    const baseUrl = 'https://graph.facebook.com/v18.0';

    if (mediaUrls.length === 1) {
      // Single image post
      const containerId = await createMediaContainer(baseUrl, userId, accessToken, mediaUrls[0], text);
      const mediaId = await publishContainer(baseUrl, userId, accessToken, containerId);
      
      return {
        ok: true,
        remoteId: mediaId,
      };

    } else {
      // Carousel post (2-10 images)
      const urlsToPost = mediaUrls.slice(0, 10); // Instagram allows max 10 images
      const containerIds: string[] = [];

      // Create container for each image
      for (const url of urlsToPost) {
        const itemId = await createMediaContainer(baseUrl, userId, accessToken, url, undefined, true);
        containerIds.push(itemId);
      }

      // Create carousel container
      const carouselId = await createCarouselContainer(baseUrl, userId, accessToken, containerIds, text);
      
      // Publish the carousel
      const mediaId = await publishContainer(baseUrl, userId, accessToken, carouselId);

      return {
        ok: true,
        remoteId: mediaId,
      };
    }

  } catch (error: any) {
    console.error('Instagram post error:', error);

    const errorMessage = error.message || String(error);
    const isTransient = isTransientError(error);

    return {
      ok: false,
      error: `Instagram API error: ${errorMessage}`,
      transient: isTransient,
    };
  }
}

/**
 * Create a media container
 */
async function createMediaContainer(
  baseUrl: string,
  userId: string,
  accessToken: string,
  imageUrl: string,
  caption?: string,
  isCarouselItem: boolean = false
): Promise<string> {
  const params = new URLSearchParams({
    image_url: imageUrl,
    access_token: accessToken,
  });

  if (caption && !isCarouselItem) {
    params.append('caption', caption);
  }

  if (isCarouselItem) {
    params.append('is_carousel_item', 'true');
  }

  const response = await fetch(`${baseUrl}/${userId}/media`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || `HTTP ${response.status}: ${response.statusText}`);
  }

  const data = await response.json();
  return data.id;
}

/**
 * Create a carousel container
 */
async function createCarouselContainer(
  baseUrl: string,
  userId: string,
  accessToken: string,
  childrenIds: string[],
  caption: string
): Promise<string> {
  const params = new URLSearchParams({
    media_type: 'CAROUSEL',
    children: childrenIds.join(','),
    caption: caption,
    access_token: accessToken,
  });

  const response = await fetch(`${baseUrl}/${userId}/media`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || `HTTP ${response.status}: ${response.statusText}`);
  }

  const data = await response.json();
  return data.id;
}

/**
 * Publish a media container
 */
async function publishContainer(
  baseUrl: string,
  userId: string,
  accessToken: string,
  creationId: string
): Promise<string> {
  const params = new URLSearchParams({
    creation_id: creationId,
    access_token: accessToken,
  });

  const response = await fetch(`${baseUrl}/${userId}/media_publish`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || `HTTP ${response.status}: ${response.statusText}`);
  }

  const data = await response.json();
  return data.id;
}

/**
 * Determine if an error is transient (retryable)
 */
function isTransientError(error: any): boolean {
  const errorMessage = String(error.message || error).toLowerCase();

  // Rate limit errors
  if (errorMessage.includes('rate limit') || errorMessage.includes('throttle')) {
    return true;
  }

  // Server errors (5xx)
  if (errorMessage.includes('500') || errorMessage.includes('503') || errorMessage.includes('504')) {
    return true;
  }

  // Temporary errors
  if (
    errorMessage.includes('timeout') ||
    errorMessage.includes('temporarily unavailable')
  ) {
    return true;
  }

  return false;
}

/**
 * Validate Instagram credentials by fetching user info
 */
export async function validateInstagramCredentials(
  credentials: InstagramCredentials
): Promise<boolean> {
  try {
    const { accessToken, userId } = credentials;
    const baseUrl = 'https://graph.facebook.com/v18.0';
    
    const response = await fetch(
      `${baseUrl}/${userId}?fields=id,username&access_token=${accessToken}`
    );

    return response.ok;
  } catch (error) {
    console.error('Instagram credentials validation failed:', error);
    return false;
  }
}
