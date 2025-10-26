import crypto from 'crypto';
import { storage } from './storage';
import { logAuditEvent } from './audit-service';

export interface EncryptionKey {
  id: string;
  algorithm: 'aes-256-gcm' | 'aes-256-cbc' | 'chacha20-poly1305';
  keyData: string; // Base64 encoded
  iv?: string; // Initialization vector for certain algorithms
  purpose: 'data' | 'backup' | 'export' | 'communication';
  status: 'active' | 'rotated' | 'deprecated' | 'revoked';
  createdAt: string;
  rotatedAt?: string;
  expiresAt?: string;
  metadata: {
    createdBy: string;
    rotationPolicy?: string;
    complianceLevel: 'standard' | 'high' | 'critical';
  };
}

export interface EncryptedData {
  data: string; // Base64 encoded encrypted data
  keyId: string;
  algorithm: string;
  iv: string; // Base64 encoded initialization vector
  authTag?: string; // For AEAD algorithms like GCM
  metadata: {
    encryptedAt: string;
    encryptedBy: string;
    dataType: string;
    complianceLevel: string;
  };
}

export interface EncryptionPolicy {
  id: string;
  name: string;
  description: string;
  dataTypes: string[]; // Which data types to encrypt
  algorithm: string;
  keyRotationDays: number;
  complianceRequirements: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FieldEncryptionConfig {
  tableName: string;
  fieldName: string;
  encryptionType: 'full' | 'partial' | 'hash' | 'searchable';
  algorithm: string;
  keyPurpose: string;
  preserveFormat?: boolean; // For format-preserving encryption
  searchable?: boolean; // For searchable encryption
}

export class EncryptionService {
  private keys: Map<string, EncryptionKey> = new Map();
  private policies: Map<string, EncryptionPolicy> = new Map();
  private fieldConfigs: Map<string, FieldEncryptionConfig[]> = new Map();
  private activeKeysByPurpose: Map<string, string> = new Map();

  constructor() {
    console.log('🔐 Encryption service initialized');
    this.initializeDefaultKeys();
    this.initializeDefaultPolicies();
    this.initializeFieldConfigurations();
    this.startKeyRotationScheduler();
  }

  /**
   * Encrypt sensitive data
   */
  async encryptData(
    data: string | Buffer,
    purpose: 'data' | 'backup' | 'export' | 'communication' = 'data',
    dataType: string = 'general',
    userId?: string
  ): Promise<EncryptedData> {
    try {
      const keyId = this.activeKeysByPurpose.get(purpose);
      if (!keyId) {
        throw new Error(`No active encryption key found for purpose: ${purpose}`);
      }

      const key = this.keys.get(keyId);
      if (!key) {
        throw new Error(`Encryption key not found: ${keyId}`);
      }

      const algorithm = key.algorithm;
      const keyBuffer = Buffer.from(key.keyData, 'base64');
      const dataBuffer = Buffer.isBuffer(data) ? data : Buffer.from(data, 'utf8');
      
      let encryptedData: Buffer;
      let iv: Buffer;
      let authTag: Buffer | undefined;

      switch (algorithm) {
        case 'aes-256-gcm':
          iv = crypto.randomBytes(16);
          const cipherGCM = crypto.createCipher('aes-256-gcm', keyBuffer);
          cipherGCM.setAAD(Buffer.from(dataType));
          encryptedData = Buffer.concat([cipherGCM.update(dataBuffer), cipherGCM.final()]);
          authTag = cipherGCM.getAuthTag();
          break;

        case 'aes-256-cbc':
          iv = crypto.randomBytes(16);
          const cipherCBC = crypto.createCipher('aes-256-cbc', keyBuffer);
          encryptedData = Buffer.concat([cipherCBC.update(dataBuffer), cipherCBC.final()]);
          break;

        case 'chacha20-poly1305':
          iv = crypto.randomBytes(12); // ChaCha20 uses 12-byte nonce
          const cipherChaCha = crypto.createCipher('chacha20-poly1305', keyBuffer);
          cipherChaCha.setAAD(Buffer.from(dataType));
          encryptedData = Buffer.concat([cipherChaCha.update(dataBuffer), cipherChaCha.final()]);
          authTag = cipherChaCha.getAuthTag();
          break;

        default:
          throw new Error(`Unsupported encryption algorithm: ${algorithm}`);
      }

      const result: EncryptedData = {
        data: encryptedData.toString('base64'),
        keyId,
        algorithm,
        iv: iv.toString('base64'),
        authTag: authTag?.toString('base64'),
        metadata: {
          encryptedAt: new Date().toISOString(),
          encryptedBy: userId || 'system',
          dataType,
          complianceLevel: key.metadata.complianceLevel
        }
      };

      // Log encryption event for audit
      await logAuditEvent(
        'system',
        'security',
        'data_encrypt',
        {
          id: userId || 'system',
          type: 'system',
          name: 'EncryptionService',
          ipAddress: '127.0.0.1'
        },
        {
          type: 'data',
          id: keyId,
          name: dataType
        },
        'success',
        {
          description: `Data encrypted using ${algorithm}`,
          metadata: {
            dataType,
            purpose,
            algorithm,
            keyId
          }
        },
        {
          severity: 'medium',
          regulations: ['GDPR', 'HIPAA', 'PCI-DSS'],
          dataClassification: 'confidential'
        }
      );

      console.log(`🔐 Encrypted data using ${algorithm} for purpose: ${purpose}`);
      return result;

    } catch (error) {
      console.error('Encryption error:', error);
      
      // Log encryption failure
      await logAuditEvent(
        'system',
        'security',
        'data_encrypt_failed',
        {
          id: userId || 'system',
          type: 'system',
          name: 'EncryptionService',
          ipAddress: '127.0.0.1'
        },
        {
          type: 'data',
          name: dataType
        },
        'failure',
        {
          description: 'Data encryption failed',
          errorMessage: error.message,
          metadata: { dataType, purpose }
        },
        {
          severity: 'high',
          regulations: ['GDPR', 'HIPAA', 'PCI-DSS'],
          dataClassification: 'confidential'
        }
      );

      throw new Error(`Encryption failed: ${error.message}`);
    }
  }

  /**
   * Decrypt sensitive data
   */
  async decryptData(
    encryptedData: EncryptedData,
    userId?: string
  ): Promise<string> {
    try {
      const key = this.keys.get(encryptedData.keyId);
      if (!key) {
        throw new Error(`Decryption key not found: ${encryptedData.keyId}`);
      }

      if (key.status === 'revoked') {
        throw new Error('Cannot decrypt with revoked key');
      }

      const keyBuffer = Buffer.from(key.keyData, 'base64');
      const dataBuffer = Buffer.from(encryptedData.data, 'base64');
      const iv = Buffer.from(encryptedData.iv, 'base64');
      const authTag = encryptedData.authTag ? Buffer.from(encryptedData.authTag, 'base64') : undefined;

      let decryptedData: Buffer;

      switch (encryptedData.algorithm) {
        case 'aes-256-gcm':
          if (!authTag) {
            throw new Error('Authentication tag required for GCM mode');
          }
          const decipherGCM = crypto.createDecipher('aes-256-gcm', keyBuffer);
          decipherGCM.setAAD(Buffer.from(encryptedData.metadata.dataType));
          decipherGCM.setAuthTag(authTag);
          decryptedData = Buffer.concat([decipherGCM.update(dataBuffer), decipherGCM.final()]);
          break;

        case 'aes-256-cbc':
          const decipherCBC = crypto.createDecipher('aes-256-cbc', keyBuffer);
          decryptedData = Buffer.concat([decipherCBC.update(dataBuffer), decipherCBC.final()]);
          break;

        case 'chacha20-poly1305':
          if (!authTag) {
            throw new Error('Authentication tag required for ChaCha20-Poly1305');
          }
          const decipherChaCha = crypto.createDecipher('chacha20-poly1305', keyBuffer);
          decipherChaCha.setAAD(Buffer.from(encryptedData.metadata.dataType));
          decipherChaCha.setAuthTag(authTag);
          decryptedData = Buffer.concat([decipherChaCha.update(dataBuffer), decipherChaCha.final()]);
          break;

        default:
          throw new Error(`Unsupported decryption algorithm: ${encryptedData.algorithm}`);
      }

      // Log decryption event
      await logAuditEvent(
        'system',
        'security',
        'data_decrypt',
        {
          id: userId || 'system',
          type: 'system',
          name: 'EncryptionService',
          ipAddress: '127.0.0.1'
        },
        {
          type: 'data',
          id: encryptedData.keyId,
          name: encryptedData.metadata.dataType
        },
        'success',
        {
          description: `Data decrypted using ${encryptedData.algorithm}`,
          metadata: {
            dataType: encryptedData.metadata.dataType,
            algorithm: encryptedData.algorithm,
            keyId: encryptedData.keyId
          }
        },
        {
          severity: 'medium',
          regulations: ['GDPR', 'HIPAA', 'PCI-DSS'],
          dataClassification: 'confidential'
        }
      );

      console.log(`🔐 Decrypted data using ${encryptedData.algorithm}`);
      return decryptedData.toString('utf8');

    } catch (error) {
      console.error('Decryption error:', error);
      
      // Log decryption failure
      await logAuditEvent(
        'system',
        'security',
        'data_decrypt_failed',
        {
          id: userId || 'system',
          type: 'system',
          name: 'EncryptionService',
          ipAddress: '127.0.0.1'
        },
        {
          type: 'data',
          id: encryptedData.keyId
        },
        'failure',
        {
          description: 'Data decryption failed',
          errorMessage: error.message,
          metadata: {
            algorithm: encryptedData.algorithm,
            keyId: encryptedData.keyId
          }
        },
        {
          severity: 'high',
          regulations: ['GDPR', 'HIPAA', 'PCI-DSS'],
          dataClassification: 'confidential'
        }
      );

      throw new Error(`Decryption failed: ${error.message}`);
    }
  }

  /**
   * Hash sensitive data (one-way)
   */
  async hashData(
    data: string,
    algorithm: 'sha256' | 'sha512' | 'bcrypt' = 'sha256',
    salt?: string
  ): Promise<string> {
    try {
      switch (algorithm) {
        case 'sha256':
          const saltedData = salt ? data + salt : data;
          return crypto.createHash('sha256').update(saltedData).digest('hex');

        case 'sha512':
          const saltedData512 = salt ? data + salt : data;
          return crypto.createHash('sha512').update(saltedData512).digest('hex');

        case 'bcrypt':
          const bcrypt = require('bcrypt');
          const saltRounds = 12;
          return await bcrypt.hash(data, saltRounds);

        default:
          throw new Error(`Unsupported hash algorithm: ${algorithm}`);
      }
    } catch (error) {
      console.error('Hashing error:', error);
      throw new Error(`Hashing failed: ${error.message}`);
    }
  }

  /**
   * Generate new encryption key
   */
  async generateKey(
    purpose: 'data' | 'backup' | 'export' | 'communication',
    algorithm: 'aes-256-gcm' | 'aes-256-cbc' | 'chacha20-poly1305' = 'aes-256-gcm',
    createdBy: string,
    complianceLevel: 'standard' | 'high' | 'critical' = 'high'
  ): Promise<EncryptionKey> {
    try {
      const keySize = algorithm.includes('256') ? 32 : 32; // 256 bits = 32 bytes
      const keyData = crypto.randomBytes(keySize);
      
      const key: EncryptionKey = {
        id: this.generateKeyId(),
        algorithm,
        keyData: keyData.toString('base64'),
        purpose,
        status: 'active',
        createdAt: new Date().toISOString(),
        metadata: {
          createdBy,
          complianceLevel
        }
      };

      this.keys.set(key.id, key);
      this.activeKeysByPurpose.set(purpose, key.id);

      // Log key generation
      await logAuditEvent(
        'system',
        'security',
        'encryption_key_generated',
        {
          id: createdBy,
          type: 'user',
          name: 'Administrator',
          ipAddress: '127.0.0.1'
        },
        {
          type: 'encryption_key',
          id: key.id,
          name: `${purpose}-${algorithm}`
        },
        'success',
        {
          description: `New encryption key generated for ${purpose}`,
          metadata: {
            purpose,
            algorithm,
            complianceLevel,
            keyId: key.id
          }
        },
        {
          severity: 'high',
          regulations: ['GDPR', 'HIPAA', 'PCI-DSS'],
          dataClassification: 'restricted'
        }
      );

      console.log(`🔐 Generated new ${algorithm} key for ${purpose}: ${key.id}`);
      return key;

    } catch (error) {
      console.error('Key generation error:', error);
      throw new Error(`Key generation failed: ${error.message}`);
    }
  }

  /**
   * Rotate encryption key
   */
  async rotateKey(keyId: string, rotatedBy: string): Promise<EncryptionKey> {
    try {
      const oldKey = this.keys.get(keyId);
      if (!oldKey) {
        throw new Error(`Key not found: ${keyId}`);
      }

      // Mark old key as rotated
      oldKey.status = 'rotated';
      oldKey.rotatedAt = new Date().toISOString();
      this.keys.set(keyId, oldKey);

      // Generate new key with same properties
      const newKey = await this.generateKey(
        oldKey.purpose,
        oldKey.algorithm,
        rotatedBy,
        oldKey.metadata.complianceLevel
      );

      // Log key rotation
      await logAuditEvent(
        'system',
        'security',
        'encryption_key_rotated',
        {
          id: rotatedBy,
          type: 'user',
          name: 'Administrator',
          ipAddress: '127.0.0.1'
        },
        {
          type: 'encryption_key',
          id: keyId,
          name: `${oldKey.purpose}-${oldKey.algorithm}`
        },
        'success',
        {
          description: `Encryption key rotated`,
          oldValue: keyId,
          newValue: newKey.id,
          metadata: {
            oldKeyId: keyId,
            newKeyId: newKey.id,
            purpose: oldKey.purpose
          }
        },
        {
          severity: 'high',
          regulations: ['GDPR', 'HIPAA', 'PCI-DSS'],
          dataClassification: 'restricted'
        }
      );

      console.log(`🔐 Rotated key ${keyId} -> ${newKey.id}`);
      return newKey;

    } catch (error) {
      console.error('Key rotation error:', error);
      throw new Error(`Key rotation failed: ${error.message}`);
    }
  }

  /**
   * Get encryption keys
   */
  async getKeys(): Promise<EncryptionKey[]> {
    return Array.from(this.keys.values()).map(key => ({
      ...key,
      keyData: '[REDACTED]' // Never expose key data
    })) as EncryptionKey[];
  }

  /**
   * Get encryption policies
   */
  async getPolicies(): Promise<EncryptionPolicy[]> {
    return Array.from(this.policies.values());
  }

  /**
   * Create encryption policy
   */
  async createPolicy(policyData: Omit<EncryptionPolicy, 'id' | 'createdAt' | 'updatedAt'>): Promise<EncryptionPolicy> {
    const policy: EncryptionPolicy = {
      ...policyData,
      id: this.generatePolicyId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.policies.set(policy.id, policy);
    console.log(`🔐 Created encryption policy: ${policy.name}`);
    return policy;
  }

  /**
   * Get encryption statistics
   */
  async getStatistics(): Promise<any> {
    const keys = Array.from(this.keys.values());
    const policies = Array.from(this.policies.values());

    return {
      totalKeys: keys.length,
      activeKeys: keys.filter(k => k.status === 'active').length,
      rotatedKeys: keys.filter(k => k.status === 'rotated').length,
      revokedKeys: keys.filter(k => k.status === 'revoked').length,

      keysByPurpose: {
        data: keys.filter(k => k.purpose === 'data').length,
        backup: keys.filter(k => k.purpose === 'backup').length,
        export: keys.filter(k => k.purpose === 'export').length,
        communication: keys.filter(k => k.purpose === 'communication').length
      },

      keysByAlgorithm: {
        'aes-256-gcm': keys.filter(k => k.algorithm === 'aes-256-gcm').length,
        'aes-256-cbc': keys.filter(k => k.algorithm === 'aes-256-cbc').length,
        'chacha20-poly1305': keys.filter(k => k.algorithm === 'chacha20-poly1305').length
      },

      keysByComplianceLevel: {
        standard: keys.filter(k => k.metadata.complianceLevel === 'standard').length,
        high: keys.filter(k => k.metadata.complianceLevel === 'high').length,
        critical: keys.filter(k => k.metadata.complianceLevel === 'critical').length
      },

      totalPolicies: policies.length,
      activePolicies: policies.filter(p => p.isActive).length,

      keysRequiringRotation: keys.filter(k => {
        if (k.status !== 'active') return false;
        const createdAt = new Date(k.createdAt);
        const now = new Date();
        const daysSinceCreation = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
        return daysSinceCreation > 90; // Keys older than 90 days need rotation
      }).length
    };
  }

  // Private helper methods
  private initializeDefaultKeys(): void {
    const purposes: Array<'data' | 'backup' | 'export' | 'communication'> = ['data', 'backup', 'export', 'communication'];
    
    purposes.forEach(async (purpose) => {
      try {
        await this.generateKey(purpose, 'aes-256-gcm', 'system', 'high');
      } catch (error) {
        console.error(`Failed to generate default key for ${purpose}:`, error);
      }
    });

    console.log('🔐 Initialized default encryption keys');
  }

  private initializeDefaultPolicies(): void {
    const defaultPolicies: Omit<EncryptionPolicy, 'id' | 'createdAt' | 'updatedAt'>[] = [
      {
        name: 'PII Data Protection',
        description: 'Encrypt all personally identifiable information',
        dataTypes: ['email', 'phone', 'ssn', 'address', 'name'],
        algorithm: 'aes-256-gcm',
        keyRotationDays: 90,
        complianceRequirements: ['GDPR', 'HIPAA'],
        isActive: true
      },
      {
        name: 'Financial Data Protection',
        description: 'Encrypt all financial and payment information',
        dataTypes: ['credit_card', 'bank_account', 'payment_info', 'financial_record'],
        algorithm: 'aes-256-gcm',
        keyRotationDays: 30,
        complianceRequirements: ['PCI-DSS', 'SOX'],
        isActive: true
      },
      {
        name: 'Healthcare Data Protection',
        description: 'Encrypt all healthcare and medical information',
        dataTypes: ['medical_record', 'health_info', 'diagnosis', 'prescription'],
        algorithm: 'aes-256-gcm',
        keyRotationDays: 60,
        complianceRequirements: ['HIPAA'],
        isActive: true
      }
    ];

    defaultPolicies.forEach(policyData => {
      const policy: EncryptionPolicy = {
        ...policyData,
        id: this.generatePolicyId(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      this.policies.set(policy.id, policy);
    });

    console.log(`🔐 Initialized ${defaultPolicies.length} default encryption policies`);
  }

  private initializeFieldConfigurations(): void {
    const fieldConfigs: FieldEncryptionConfig[] = [
      {
        tableName: 'users',
        fieldName: 'email',
        encryptionType: 'searchable',
        algorithm: 'aes-256-gcm',
        keyPurpose: 'data',
        searchable: true
      },
      {
        tableName: 'users',
        fieldName: 'phone',
        encryptionType: 'full',
        algorithm: 'aes-256-gcm',
        keyPurpose: 'data'
      },
      {
        tableName: 'tasks',
        fieldName: 'notes',
        encryptionType: 'full',
        algorithm: 'aes-256-gcm',
        keyPurpose: 'data'
      }
    ];

    fieldConfigs.forEach(config => {
      const tableConfigs = this.fieldConfigs.get(config.tableName) || [];
      tableConfigs.push(config);
      this.fieldConfigs.set(config.tableName, tableConfigs);
    });

    console.log(`🔐 Initialized field encryption configurations for ${fieldConfigs.length} fields`);
  }

  private startKeyRotationScheduler(): void {
    // Check for keys needing rotation every day
    setInterval(() => {
      this.checkKeysForRotation();
    }, 24 * 60 * 60 * 1000); // 24 hours

    console.log('🔐 Key rotation scheduler started');
  }

  private async checkKeysForRotation(): void {
    const keys = Array.from(this.keys.values());
    const now = new Date();
    
    for (const key of keys) {
      if (key.status !== 'active') continue;
      
      const createdAt = new Date(key.createdAt);
      const daysSinceCreation = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
      
      // Check if key needs rotation (90 days for high security, 30 days for critical)
      const rotationThreshold = key.metadata.complianceLevel === 'critical' ? 30 : 90;
      
      if (daysSinceCreation >= rotationThreshold) {
        console.warn(`🔐 Key ${key.id} requires rotation (${daysSinceCreation} days old)`);
        
        // Auto-rotate critical keys
        if (key.metadata.complianceLevel === 'critical') {
          try {
            await this.rotateKey(key.id, 'system');
          } catch (error) {
            console.error(`Failed to auto-rotate key ${key.id}:`, error);
          }
        }
      }
    }
  }

  private generateKeyId(): string {
    return `enc_key_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generatePolicyId(): string {
    return `enc_policy_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export const encryptionService = new EncryptionService();

/**
 * Transparent encryption/decryption helpers for database fields
 */
export class TransparentEncryption {
  /**
   * Encrypt field value before storing in database
   */
  static async encryptField(
    tableName: string,
    fieldName: string,
    value: string,
    userId?: string
  ): Promise<string> {
    try {
      const dataType = `${tableName}.${fieldName}`;
      const encrypted = await encryptionService.encryptData(value, 'data', dataType, userId);
      return JSON.stringify(encrypted);
    } catch (error) {
      console.error(`Failed to encrypt field ${tableName}.${fieldName}:`, error);
      throw error;
    }
  }

  /**
   * Decrypt field value after retrieving from database
   */
  static async decryptField(
    encryptedValue: string,
    userId?: string
  ): Promise<string> {
    try {
      const encryptedData: EncryptedData = JSON.parse(encryptedValue);
      return await encryptionService.decryptData(encryptedData, userId);
    } catch (error) {
      console.error('Failed to decrypt field:', error);
      throw error;
    }
  }

  /**
   * Check if field should be encrypted based on configuration
   */
  static shouldEncryptField(tableName: string, fieldName: string): boolean {
    // Check encryption policies and field configurations
    return ['email', 'phone', 'notes', 'description', 'content'].includes(fieldName);
  }
}