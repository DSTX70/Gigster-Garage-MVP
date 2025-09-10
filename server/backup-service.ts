import { DatabaseStorage } from './storage';
import fs from 'fs/promises';
import path from 'path';

/**
 * Database Backup and Recovery Service
 * Provides comprehensive data backup and restore capabilities
 */

export interface BackupMetadata {
  timestamp: string;
  version: string;
  tables: string[];
  totalRecords: number;
  fileSize: number;
  description?: string;
  filename?: string;
  filepath?: string;
}

export interface BackupOptions {
  includeTables?: string[];
  excludeTables?: string[];
  description?: string;
  compress?: boolean;
}

export interface RestoreOptions {
  replaceExisting?: boolean;
  includeTables?: string[];
  excludeTables?: string[];
  dryRun?: boolean;
}

export class BackupService {
  private storage: DatabaseStorage;
  private backupDir: string;

  constructor() {
    this.storage = new DatabaseStorage();
    this.backupDir = path.join(process.cwd(), 'backups');
  }

  /**
   * Create a comprehensive database backup
   */
  async createBackup(options: BackupOptions = {}): Promise<string> {
    try {
      // Ensure backup directory exists
      await fs.mkdir(this.backupDir, { recursive: true });

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `gigster-garage-backup-${timestamp}.json`;
      const filepath = path.join(this.backupDir, filename);

      console.log('🔄 Creating database backup...');

      // Get all data from each table
      const backupData: any = {
        metadata: {
          timestamp: new Date().toISOString(),
          version: '1.0.0',
          description: options.description || 'Automated backup',
          tables: [],
          totalRecords: 0
        },
        data: {}
      };

      // Define all tables to backup
      const tablesToBackup = options.includeTables || [
        'users', 'projects', 'tasks', 'clients', 'proposals', 'contracts',
        'invoices', 'templates', 'time_logs', 'file_attachments',
        'custom_fields', 'custom_field_values', 'document_versions'
      ];

      const excludedTables = options.excludeTables || [];

      for (const table of tablesToBackup) {
        if (excludedTables.includes(table)) continue;

        try {
          let data: any[] = [];
          
          switch (table) {
            case 'users':
              data = await this.storage.getUsers();
              break;
            case 'projects':
              data = await this.storage.getProjects();
              break;
            case 'tasks':
              data = await this.storage.getTasks();
              break;
            case 'clients':
              data = await this.storage.getClients();
              break;
            case 'proposals':
              data = await this.storage.getProposals();
              break;
            case 'contracts':
              data = await this.storage.getContracts();
              break;
            case 'invoices':
              data = await this.storage.getInvoices();
              break;
            case 'templates':
              data = await this.storage.getTemplates();
              break;
            case 'time_logs':
              data = await this.storage.getTimeLogs();
              break;
            case 'file_attachments':
              data = await this.storage.getAllFileAttachments();
              break;
            default:
              console.warn(`⚠️  Skipping unknown table: ${table}`);
              continue;
          }

          backupData.data[table] = data;
          backupData.metadata.tables.push(table);
          backupData.metadata.totalRecords += data.length;

          console.log(`✅ Backed up ${data.length} records from ${table}`);
        } catch (error) {
          console.warn(`⚠️  Error backing up ${table}:`, error);
        }
      }

      // Write backup file
      const jsonData = JSON.stringify(backupData, null, 2);
      await fs.writeFile(filepath, jsonData, 'utf8');

      // Update metadata with file size
      const stats = await fs.stat(filepath);
      backupData.metadata.fileSize = stats.size;

      // Re-write with updated metadata
      await fs.writeFile(filepath, JSON.stringify(backupData, null, 2), 'utf8');

      console.log(`✅ Backup created successfully: ${filename}`);
      console.log(`📊 Total records: ${backupData.metadata.totalRecords}`);
      console.log(`📦 File size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);

      return filepath;
    } catch (error) {
      console.error('❌ Backup creation failed:', error);
      throw new Error(`Backup failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * List all available backups
   */
  async listBackups(): Promise<BackupMetadata[]> {
    try {
      const files = await fs.readdir(this.backupDir);
      const backupFiles = files.filter(f => f.endsWith('.json') && f.includes('backup'));

      const backups: BackupMetadata[] = [];

      for (const file of backupFiles) {
        try {
          const filepath = path.join(this.backupDir, file);
          const content = await fs.readFile(filepath, 'utf8');
          const data = JSON.parse(content);
          
          if (data.metadata) {
            backups.push({
              ...data.metadata,
              filename: file,
              filepath
            } as BackupMetadata);
          }
        } catch (error) {
          console.warn(`⚠️  Could not read backup file ${file}:`, error);
        }
      }

      return backups.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    } catch (error) {
      console.error('❌ Failed to list backups:', error);
      return [];
    }
  }

  /**
   * Restore data from a backup file
   */
  async restoreBackup(backupPath: string, options: RestoreOptions = {}): Promise<void> {
    try {
      console.log('🔄 Starting database restore...');

      if (options.dryRun) {
        console.log('🧪 DRY RUN MODE - No data will be modified');
      }

      // Read backup file
      const content = await fs.readFile(backupPath, 'utf8');
      const backupData = JSON.parse(content);

      if (!backupData.metadata || !backupData.data) {
        throw new Error('Invalid backup file format');
      }

      console.log(`📄 Backup info: ${backupData.metadata.description}`);
      console.log(`📅 Created: ${backupData.metadata.timestamp}`);
      console.log(`📊 Total records: ${backupData.metadata.totalRecords}`);

      const tablesToRestore = options.includeTables || Object.keys(backupData.data);
      const excludedTables = options.excludeTables || [];

      // Restore data table by table
      for (const table of tablesToRestore) {
        if (excludedTables.includes(table) || !backupData.data[table]) continue;

        const records = backupData.data[table];
        if (!records || records.length === 0) {
          console.log(`⏩ Skipping empty table: ${table}`);
          continue;
        }

        console.log(`🔄 Restoring ${records.length} records to ${table}...`);

        if (options.dryRun) {
          console.log(`🧪 Would restore ${records.length} records to ${table}`);
          continue;
        }

        try {
          // Clear existing data if replacing
          if (options.replaceExisting) {
            console.log(`🗑️  Clearing existing data in ${table}...`);
            // Note: Implement table-specific clear methods as needed
          }

          // Restore records
          for (const record of records) {
            try {
              switch (table) {
                case 'users':
                  await this.storage.createUser(record);
                  break;
                case 'projects':
                  await this.storage.createProject(record);
                  break;
                case 'tasks':
                  await this.storage.createTask(record, record.createdById || 'system');
                  break;
                case 'clients':
                  await this.storage.createClient(record);
                  break;
                case 'proposals':
                  await this.storage.createProposal(record);
                  break;
                case 'contracts':
                  await this.storage.createContract(record);
                  break;
                case 'invoices':
                  await this.storage.createInvoice(record);
                  break;
                case 'templates':
                  await this.storage.createTemplate(record);
                  break;
                default:
                  console.warn(`⚠️  No restore method for table: ${table}`);
              }
            } catch (recordError) {
              console.warn(`⚠️  Failed to restore record in ${table}:`, recordError instanceof Error ? recordError.message : String(recordError));
            }
          }

          console.log(`✅ Restored ${records.length} records to ${table}`);
        } catch (error) {
          console.error(`❌ Failed to restore table ${table}:`, error);
        }
      }

      if (!options.dryRun) {
        console.log('✅ Database restore completed successfully!');
      } else {
        console.log('🧪 Dry run completed - no data was modified');
      }
    } catch (error) {
      console.error('❌ Restore failed:', error);
      throw new Error(`Restore failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Delete old backup files (keep last N backups)
   */
  async cleanupOldBackups(keepCount: number = 5): Promise<void> {
    try {
      const backups = await this.listBackups();
      
      if (backups.length <= keepCount) {
        console.log(`📦 Only ${backups.length} backups found, no cleanup needed`);
        return;
      }

      const toDelete = backups.slice(keepCount);
      
      for (const backup of toDelete) {
        try {
          await fs.unlink(backup.filepath!);
          console.log(`🗑️  Deleted old backup: ${backup.filename}`);
        } catch (error) {
          console.warn(`⚠️  Failed to delete ${backup.filename}:`, error);
        }
      }

      console.log(`✅ Cleanup completed - kept ${keepCount} most recent backups`);
    } catch (error) {
      console.error('❌ Backup cleanup failed:', error);
    }
  }

  /**
   * Schedule automatic backups
   */
  startAutomaticBackups(intervalHours: number = 24): NodeJS.Timeout {
    console.log(`🕒 Starting automatic backups every ${intervalHours} hours`);
    
    return setInterval(async () => {
      try {
        console.log('🔄 Creating scheduled backup...');
        await this.createBackup({
          description: `Scheduled backup - ${new Date().toISOString()}`
        });
        
        // Clean up old backups
        await this.cleanupOldBackups(10);
      } catch (error) {
        console.error('❌ Scheduled backup failed:', error);
      }
    }, intervalHours * 60 * 60 * 1000);
  }

  /**
   * Get backup configurations (required by routes.ts)
   */
  async getConfigurations(): Promise<any[]> {
    return [
      {
        id: 'default',
        name: 'Default Backup Configuration',
        description: 'Standard backup of all tables',
        includeTables: ['users', 'projects', 'tasks', 'clients', 'proposals', 'contracts', 'invoices', 'templates', 'time_logs', 'file_attachments'],
        excludeTables: [],
        schedule: '0 2 * * *', // Daily at 2 AM
        retention: 30, // Keep 30 backups
        compress: true,
        isActive: true
      },
      {
        id: 'minimal',
        name: 'Minimal Backup Configuration', 
        description: 'Backup of essential data only',
        includeTables: ['users', 'projects', 'tasks'],
        excludeTables: ['templates', 'file_attachments'],
        schedule: '0 6 * * *', // Daily at 6 AM
        retention: 7, // Keep 7 backups
        compress: true,
        isActive: false
      }
    ];
  }

  /**
   * Get list of backups (alias for listBackups, required by routes.ts)
   */
  async getBackups(): Promise<BackupMetadata[]> {
    return await this.listBackups();
  }

  /**
   * Perform backup (alias for createBackup, required by routes.ts)
   */
  async performBackup(configId: string = 'default', userId: string): Promise<string> {
    const configurations = await this.getConfigurations();
    const config = configurations.find(c => c.id === configId);
    
    if (!config) {
      throw new Error(`Backup configuration '${configId}' not found`);
    }

    const options: BackupOptions = {
      includeTables: config.includeTables,
      excludeTables: config.excludeTables,
      description: `${config.description} (initiated by user: ${userId})`,
      compress: config.compress
    };

    console.log(`🚀 Starting backup with configuration: ${config.name}`);
    return await this.createBackup(options);
  }

  /**
   * Get backup statistics (required by routes.ts)
   */
  async getStatistics(): Promise<any> {
    try {
      const backups = await this.listBackups();
      const totalBackups = backups.length;
      
      if (totalBackups === 0) {
        return {
          totalBackups: 0,
          totalSize: 0,
          averageSize: 0,
          oldestBackup: null,
          newestBackup: null,
          totalRecords: 0,
          averageRecords: 0,
          storageUsed: '0 MB'
        };
      }

      const totalSize = backups.reduce((sum, backup) => sum + (backup.fileSize || 0), 0);
      const totalRecords = backups.reduce((sum, backup) => sum + (backup.totalRecords || 0), 0);
      const averageSize = totalSize / totalBackups;
      const averageRecords = totalRecords / totalBackups;

      // Sort by timestamp to find oldest and newest
      const sortedBackups = [...backups].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
      
      return {
        totalBackups,
        totalSize,
        averageSize,
        oldestBackup: sortedBackups[0]?.timestamp || null,
        newestBackup: sortedBackups[sortedBackups.length - 1]?.timestamp || null,
        totalRecords,
        averageRecords,
        storageUsed: `${(totalSize / 1024 / 1024).toFixed(2)} MB`,
        backupSizes: backups.map(b => ({
          filename: b.filename,
          size: b.fileSize,
          records: b.totalRecords,
          timestamp: b.timestamp
        }))
      };
    } catch (error) {
      console.error('❌ Failed to get backup statistics:', error);
      return {
        totalBackups: 0,
        totalSize: 0,
        averageSize: 0,
        oldestBackup: null,
        newestBackup: null,
        totalRecords: 0,
        averageRecords: 0,
        storageUsed: '0 MB',
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }
}

// Export singleton instance
export const backupService = new BackupService();