import { Router } from 'express';
import { z } from 'zod';
import { platformCredentialsService } from '../services/platformCredentials';

const router = Router();

/**
 * Get all platform credentials for the current user
 */
router.get('/api/platform-credentials', async (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const userId = (req.user as any)?.id;
    if (!userId) {
      return res.status(401).json({ error: 'User not found' });
    }

    const credentials = await platformCredentialsService.getUserCredentials(userId);
    
    // Remove sensitive data before sending to client
    const sanitized = credentials.map(cred => ({
      id: cred.id,
      platform: cred.platform,
      profileId: cred.profileId,
      profileName: cred.profileName,
      status: cred.status,
      lastValidated: cred.lastValidated,
      createdAt: cred.createdAt,
    }));

    res.json(sanitized);
  } catch (error: any) {
    console.error('Error fetching platform credentials:', error);
    res.status(500).json({ error: 'Failed to fetch credentials' });
  }
});

/**
 * Store new platform credentials
 */
const storeCredentialsSchema = z.object({
  platform: z.enum(['x', 'instagram', 'linkedin', 'facebook', 'tiktok', 'youtube']),
  profileId: z.string(),
  profileName: z.string(),
  credentials: z.object({
    // X/Twitter OAuth 1.0a
    appKey: z.string().optional(),
    appSecret: z.string().optional(),
    accessToken: z.string().optional(),
    accessSecret: z.string().optional(),
    // OAuth 2.0
    refreshToken: z.string().optional(),
    expiresAt: z.number().optional(),
    // Platform-specific
    userId: z.string().optional(),
    personUrn: z.string().optional(),
  }),
});

router.post('/api/platform-credentials', async (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const userId = (req.user as any)?.id;
    if (!userId) {
      return res.status(401).json({ error: 'User not found' });
    }

    const data = storeCredentialsSchema.parse(req.body);

    const credential = await platformCredentialsService.storeCredentials(
      userId,
      data.platform,
      data.profileId,
      data.profileName,
      data.credentials
    );

    // Validate the credentials
    const isValid = await platformCredentialsService.validateCredentials(credential.id, userId);

    res.json({
      id: credential.id,
      platform: credential.platform,
      profileId: credential.profileId,
      profileName: credential.profileName,
      status: credential.status,
      isValid,
    });
  } catch (error: any) {
    console.error('Error storing platform credentials:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request data', details: error.errors });
    }
    
    res.status(500).json({ error: 'Failed to store credentials' });
  }
});

/**
 * Validate platform credentials
 */
router.post('/api/platform-credentials/:id/validate', async (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const userId = (req.user as any)?.id;
    if (!userId) {
      return res.status(401).json({ error: 'User not found' });
    }

    const { id } = req.params;
    const isValid = await platformCredentialsService.validateCredentials(id, userId);

    res.json({ isValid });
  } catch (error: any) {
    console.error('Error validating credentials:', error);
    res.status(500).json({ error: 'Failed to validate credentials' });
  }
});

/**
 * Delete platform credentials
 */
router.delete('/api/platform-credentials/:id', async (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const userId = (req.user as any)?.id;
    if (!userId) {
      return res.status(401).json({ error: 'User not found' });
    }

    const { id } = req.params;
    await platformCredentialsService.deleteCredentials(userId, id);

    res.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting credentials:', error);
    res.status(500).json({ error: 'Failed to delete credentials' });
  }
});

/**
 * Test posting with credentials
 */
const testPostSchema = z.object({
  text: z.string(),
  mediaUrls: z.array(z.string().url()).optional(),
});

router.post('/api/platform-credentials/:id/test', async (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const userId = (req.user as any)?.id;
    if (!userId) {
      return res.status(401).json({ error: 'User not found' });
    }

    const { id } = req.params;
    const data = testPostSchema.parse(req.body);

    const result = await platformCredentialsService.postWithCredentials(
      id,
      userId,
      data.text,
      data.mediaUrls
    );

    res.json(result);
  } catch (error: any) {
    console.error('Error testing post:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request data', details: error.errors });
    }
    
    res.status(500).json({ error: 'Failed to test post' });
  }
});

export default router;
