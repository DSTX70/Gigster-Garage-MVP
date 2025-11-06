import { eq, and } from 'drizzle-orm';
import { db } from '../db';
import { platformCredentials, type PlatformCredential, type InsertPlatformCredential } from '@shared/schema';
import { postToX, validateXCredentials, type XCredentials } from '../integrations/platforms/x.adapter';
import { postToInstagram, validateInstagramCredentials, type InstagramCredentials } from '../integrations/platforms/instagram.adapter';
import { postToLinkedIn, validateLinkedInCredentials, type LinkedInCredentials } from '../integrations/platforms/linkedin.adapter';
import { PostInput, PostResult } from '../integrations/icadence/platforms';

/**
 * OAuth Token Management Service
 * Handles secure storage and retrieval of platform credentials
 */
export class PlatformCredentialsService {
  
  /**
   * Store platform credentials for a user
   */
  async storeCredentials(
    userId: string,
    platform: "x" | "instagram" | "linkedin" | "facebook" | "tiktok" | "youtube",
    profileId: string,
    profileName: string,
    credentials: any
  ): Promise<PlatformCredential> {
    // Check if credentials already exist
    const existing = await this.getCredentials(userId, platform, profileId);
    
    if (existing) {
      // Update existing credentials
      const [updated] = await db
        .update(platformCredentials)
        .set({
          credentials,
          profileName,
          status: 'active' as const,
          updatedAt: new Date(),
        })
        .where(eq(platformCredentials.id, existing.id))
        .returning();
      
      return updated;
    }

    // Insert new credentials
    const [newCred] = await db
      .insert(platformCredentials)
      .values({
        userId,
        platform,
        profileId,
        profileName,
        credentials,
        status: 'active' as const,
      })
      .returning();

    return newCred;
  }

  /**
   * Get credentials for a specific platform and profile
   */
  async getCredentials(
    userId: string,
    platform: "x" | "instagram" | "linkedin" | "facebook" | "tiktok" | "youtube",
    profileId: string
  ): Promise<PlatformCredential | null> {
    const [cred] = await db
      .select()
      .from(platformCredentials)
      .where(
        and(
          eq(platformCredentials.userId, userId),
          eq(platformCredentials.platform, platform),
          eq(platformCredentials.profileId, profileId)
        )
      )
      .limit(1);

    return cred || null;
  }

  /**
   * Get all credentials for a user
   */
  async getUserCredentials(userId: string): Promise<PlatformCredential[]> {
    return await db
      .select()
      .from(platformCredentials)
      .where(eq(platformCredentials.userId, userId));
  }

  /**
   * Get credentials for a specific platform (all profiles)
   */
  async getPlatformCredentials(userId: string, platform: "x" | "instagram" | "linkedin" | "facebook" | "tiktok" | "youtube"): Promise<PlatformCredential[]> {
    return await db
      .select()
      .from(platformCredentials)
      .where(
        and(
          eq(platformCredentials.userId, userId),
          eq(platformCredentials.platform, platform)
        )
      );
  }

  /**
   * Validate credentials by testing them with the platform API
   */
  async validateCredentials(credentialId: string, userId: string): Promise<boolean> {
    const [cred] = await db
      .select()
      .from(platformCredentials)
      .where(
        and(
          eq(platformCredentials.id, credentialId),
          eq(platformCredentials.userId, userId)
        )
      )
      .limit(1);

    if (!cred) {
      return false;
    }

    let isValid = false;

    try {
      switch (cred.platform) {
        case 'x':
          isValid = await validateXCredentials(cred.credentials as XCredentials);
          break;
        case 'instagram':
          isValid = await validateInstagramCredentials(cred.credentials as InstagramCredentials);
          break;
        case 'linkedin':
          isValid = await validateLinkedInCredentials(cred.credentials as LinkedInCredentials);
          break;
        default:
          return false;
      }

      // Update status based on validation
      await db
        .update(platformCredentials)
        .set({
          status: isValid ? 'active' : 'error',
          lastValidated: new Date(),
        })
        .where(eq(platformCredentials.id, credentialId));

      return isValid;
    } catch (error) {
      console.error(`Validation error for credential ${credentialId}:`, error);
      
      await db
        .update(platformCredentials)
        .set({
          status: 'error',
          lastValidated: new Date(),
        })
        .where(eq(platformCredentials.id, credentialId));

      return false;
    }
  }

  /**
   * Delete credentials
   */
  async deleteCredentials(userId: string, credentialId: string): Promise<boolean> {
    const result = await db
      .delete(platformCredentials)
      .where(
        and(
          eq(platformCredentials.id, credentialId),
          eq(platformCredentials.userId, userId)
        )
      );

    return true;
  }

  /**
   * Post to a platform using stored credentials
   */
  async postWithCredentials(
    credentialId: string,
    userId: string,
    text: string,
    mediaUrls?: string[]
  ): Promise<PostResult> {
    const [cred] = await db
      .select()
      .from(platformCredentials)
      .where(
        and(
          eq(platformCredentials.id, credentialId),
          eq(platformCredentials.userId, userId)
        )
      )
      .limit(1);

    if (!cred) {
      return {
        ok: false,
        error: 'Credentials not found',
        transient: false,
      };
    }

    if (cred.status !== 'active') {
      return {
        ok: false,
        error: `Credentials are ${cred.status}. Please re-authenticate.`,
        transient: false,
      };
    }

    const input: PostInput = {
      profileId: cred.profileId,
      text,
      mediaUrls,
    };

    try {
      let result: PostResult;

      switch (cred.platform) {
        case 'x':
          result = await postToX({
            ...input,
            credentials: cred.credentials as XCredentials,
          });
          break;
        
        case 'instagram':
          result = await postToInstagram({
            ...input,
            credentials: cred.credentials as InstagramCredentials,
          });
          break;
        
        case 'linkedin':
          result = await postToLinkedIn({
            ...input,
            credentials: cred.credentials as LinkedInCredentials,
          });
          break;

        default:
          result = {
            ok: false,
            error: `Platform ${cred.platform} not supported`,
            transient: false,
          };
      }

      // Mark as error if posting failed with auth error
      if (!result.ok && !result.transient) {
        const errorMsg = result.error.toLowerCase();
        if (errorMsg.includes('auth') || errorMsg.includes('token') || errorMsg.includes('credential')) {
          await db
            .update(platformCredentials)
            .set({ status: 'error' })
            .where(eq(platformCredentials.id, credentialId));
        }
      }

      return result;
    } catch (error: any) {
      console.error(`Post error for credential ${credentialId}:`, error);
      return {
        ok: false,
        error: `Unexpected error: ${error.message}`,
        transient: true,
      };
    }
  }

  /**
   * Mark credentials as expired (for OAuth 2.0 token expiry)
   */
  async markExpired(credentialId: string): Promise<void> {
    await db
      .update(platformCredentials)
      .set({ status: 'expired' })
      .where(eq(platformCredentials.id, credentialId));
  }

  /**
   * Mark credentials as revoked
   */
  async markRevoked(credentialId: string): Promise<void> {
    await db
      .update(platformCredentials)
      .set({ status: 'revoked' })
      .where(eq(platformCredentials.id, credentialId));
  }
}

export const platformCredentialsService = new PlatformCredentialsService();
