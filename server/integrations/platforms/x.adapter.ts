import { TwitterApi, TweetV2PostTweetResult } from 'twitter-api-v2';
import { PostInput, PostResult } from '../icadence/platforms';

export interface XCredentials {
  appKey: string;
  appSecret: string;
  accessToken: string;
  accessSecret: string;
}

export interface XPostInput extends PostInput {
  credentials: XCredentials;
}

/**
 * Post to X (Twitter) using OAuth 1.0a credentials
 * Supports text posts and up to 4 media attachments
 */
export async function postToX(input: XPostInput): Promise<PostResult> {
  try {
    const { credentials, text, mediaUrls = [] } = input;

    // Initialize Twitter client with OAuth 1.0a
    const client = new TwitterApi({
      appKey: credentials.appKey,
      appSecret: credentials.appSecret,
      accessToken: credentials.accessToken,
      accessSecret: credentials.accessSecret,
    });

    const rwClient = client.readWrite;

    // Handle media uploads if present
    const mediaIds: string[] = [];
    
    if (mediaUrls.length > 0) {
      // X allows up to 4 images per tweet
      const urlsToUpload = mediaUrls.slice(0, 4);
      
      for (const url of urlsToUpload) {
        try {
          // Download media from URL
          const response = await fetch(url);
          if (!response.ok) {
            console.warn(`Failed to fetch media from ${url}: ${response.statusText}`);
            continue;
          }

          const buffer = await response.arrayBuffer();
          const uint8Array = new Uint8Array(buffer);

          // Upload to X
          const mediaId = await rwClient.v1.uploadMedia(Buffer.from(uint8Array), {
            mimeType: response.headers.get('content-type') || 'image/jpeg',
          });
          
          mediaIds.push(mediaId);
        } catch (mediaError) {
          console.error(`Error uploading media from ${url}:`, mediaError);
          // Continue with other media - don't fail the whole post
        }
      }
    }

    // Post tweet with or without media
    const tweetPayload: any = { text };
    if (mediaIds.length > 0) {
      tweetPayload.media = { media_ids: mediaIds };
    }

    const tweet: TweetV2PostTweetResult = await rwClient.v2.tweet(tweetPayload);

    return { 
      ok: true, 
      remoteId: tweet.data.id 
    };

  } catch (error: any) {
    console.error('X post error:', error);
    
    // Classify error types for retry logic
    const errorMessage = error.message || String(error);
    const isTransient = isTransientError(error);
    
    return {
      ok: false,
      error: `X API error: ${errorMessage}`,
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

  // Rate limit errors (should retry with backoff)
  if (errorCode === 429 || errorMessage.includes('rate limit')) {
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
    errorMessage.includes('enotfound') ||
    errorMessage.includes('network')
  ) {
    return true;
  }

  // Auth errors, validation errors are NOT transient
  return false;
}

/**
 * Validate X credentials by checking rate limit status
 */
export async function validateXCredentials(credentials: XCredentials): Promise<boolean> {
  try {
    const client = new TwitterApi({
      appKey: credentials.appKey,
      appSecret: credentials.appSecret,
      accessToken: credentials.accessToken,
      accessSecret: credentials.accessSecret,
    });

    // Try to verify credentials
    await client.v2.me();
    return true;
  } catch (error) {
    console.error('X credentials validation failed:', error);
    return false;
  }
}
