import { Router } from 'express';
import { backupService } from './backup-service';
import { isAuthenticated } from './replitAuth';

/**
 * API routes for database backup and restore operations
 * Protected routes requiring admin authentication
 */

const router = Router();

// Middleware to ensure admin access only
const requireAdmin = (req: any, res: any, next: any) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

/**
 * GET /api/backups
 * List all available backups
 */
router.get('/backups', isAuthenticated, requireAdmin, async (req, res) => {
  try {
    const backups = await backupService.listBackups();
    res.json({ backups });
  } catch (error) {
    console.error('Failed to list backups:', error);
    res.status(500).json({ error: 'Failed to list backups' });
  }
});

/**
 * POST /api/backups
 * Create a new backup
 */
router.post('/backups', isAuthenticated, requireAdmin, async (req, res) => {
  try {
    const { description, includeTables, excludeTables } = req.body;
    
    const backupPath = await backupService.createBackup({
      description,
      includeTables,
      excludeTables
    });

    res.json({ 
      success: true, 
      message: 'Backup created successfully',
      backupPath 
    });
  } catch (error) {
    console.error('Backup creation failed:', error);
    res.status(500).json({ error: error.message || 'Backup creation failed' });
  }
});

/**
 * POST /api/backups/restore
 * Restore from a backup file
 */
router.post('/backups/restore', isAuthenticated, requireAdmin, async (req, res) => {
  try {
    const { 
      backupPath, 
      replaceExisting = false, 
      includeTables, 
      excludeTables,
      dryRun = false 
    } = req.body;

    if (!backupPath) {
      return res.status(400).json({ error: 'Backup path is required' });
    }

    await backupService.restoreBackup(backupPath, {
      replaceExisting,
      includeTables,
      excludeTables,
      dryRun
    });

    res.json({ 
      success: true, 
      message: dryRun ? 'Dry run completed successfully' : 'Restore completed successfully'
    });
  } catch (error) {
    console.error('Restore failed:', error);
    res.status(500).json({ error: error.message || 'Restore failed' });
  }
});

/**
 * DELETE /api/backups/cleanup
 * Clean up old backup files
 */
router.delete('/backups/cleanup', isAuthenticated, requireAdmin, async (req, res) => {
  try {
    const { keepCount = 5 } = req.body;
    
    await backupService.cleanupOldBackups(keepCount);
    
    res.json({ 
      success: true, 
      message: `Cleaned up old backups, kept ${keepCount} most recent` 
    });
  } catch (error) {
    console.error('Cleanup failed:', error);
    res.status(500).json({ error: error.message || 'Cleanup failed' });
  }
});

/**
 * POST /api/backups/schedule
 * Start or modify automatic backup schedule
 */
router.post('/backups/schedule', isAuthenticated, requireAdmin, async (req, res) => {
  try {
    const { intervalHours = 24 } = req.body;
    
    // Note: In a production environment, you'd want to store this in a 
    // persistent scheduler or background job system
    backupService.startAutomaticBackups(intervalHours);
    
    res.json({ 
      success: true, 
      message: `Automatic backups scheduled every ${intervalHours} hours`
    });
  } catch (error) {
    console.error('Schedule setup failed:', error);
    res.status(500).json({ error: error.message || 'Schedule setup failed' });
  }
});

export { router as backupRoutes };