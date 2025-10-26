import fs from 'fs/promises';
import path from 'path';
import { logAuditEvent } from './audit-service';

export interface Language {
  code: string; // ISO 639-1 code (e.g., 'en', 'es', 'fr')
  name: string; // Native name (e.g., 'English', 'Español', 'Français')
  englishName: string; // English name for admin interface
  direction: 'ltr' | 'rtl';
  region?: string; // Optional region code (e.g., 'US', 'ES', 'CA')
  isActive: boolean;
  isDefault: boolean;
  completionPercentage: number; // % of strings translated
  lastUpdated: string;
}

export interface TranslationKey {
  key: string;
  category: string; // ui, validation, emails, notifications, etc.
  context?: string; // Additional context for translators
  pluralization?: boolean; // If key supports plural forms
  variables?: string[]; // Variable placeholders in the translation
  description?: string; // Description for translators
}

export interface Translation {
  language: string;
  key: string;
  value: string;
  pluralForms?: Record<string, string>; // For languages with multiple plural forms
  lastUpdated: string;
  translatedBy?: string;
  reviewed: boolean;
  reviewedBy?: string;
  reviewedAt?: string;
}

export interface TranslationNamespace {
  id: string;
  name: string; // e.g., 'common', 'dashboard', 'emails'
  description: string;
  keys: TranslationKey[];
  isSystem: boolean; // System namespaces cannot be deleted
  createdAt: string;
  updatedAt: string;
}

export interface LocalizationSettings {
  defaultLanguage: string;
  fallbackLanguage: string;
  supportedLanguages: string[];
  autoDetectLanguage: boolean;
  enableRTLSupport: boolean;
  dateTimeFormat: Record<string, string>; // per language
  numberFormat: Record<string, any>; // per language
  currencyFormat: Record<string, any>; // per language
  pseudoLocalization: boolean; // For testing
}

export class InternationalizationService {
  private languages: Map<string, Language> = new Map();
  private namespaces: Map<string, TranslationNamespace> = new Map();
  private translations: Map<string, Map<string, Translation>> = new Map(); // language -> key -> translation
  private translationKeys: Map<string, TranslationKey> = new Map();
  private settings: LocalizationSettings;

  constructor() {
    console.log('🌍 Internationalization service initialized');
    this.initializeDefaultSettings();
    this.initializeDefaultLanguages();
    this.initializeDefaultNamespaces();
    this.initializeDefaultTranslations();
  }

  /**
   * Get supported languages
   */
  async getLanguages(): Promise<Language[]> {
    return Array.from(this.languages.values()).sort((a, b) => {
      if (a.isDefault) return -1;
      if (b.isDefault) return 1;
      return a.englishName.localeCompare(b.englishName);
    });
  }

  /**
   * Add new language
   */
  async addLanguage(languageData: Omit<Language, 'completionPercentage' | 'lastUpdated'>): Promise<Language> {
    // If this is set as default, unset other defaults
    if (languageData.isDefault) {
      this.languages.forEach(lang => {
        if (lang.isDefault) {
          lang.isDefault = false;
          this.languages.set(lang.code, lang);
        }
      });
    }

    const language: Language = {
      ...languageData,
      completionPercentage: 0,
      lastUpdated: new Date().toISOString()
    };

    this.languages.set(language.code, language);

    // Initialize empty translations for this language
    this.translations.set(language.code, new Map());

    await logAuditEvent(
      'system',
      'system_config',
      'language_added',
      {
        id: 'system',
        type: 'system',
        name: 'I18nService',
        ipAddress: '127.0.0.1'
      },
      {
        type: 'language',
        id: language.code,
        name: language.name
      },
      'success',
      {
        description: `Language added: ${language.englishName}`,
        metadata: {
          code: language.code,
          direction: language.direction,
          isDefault: language.isDefault
        }
      },
      {
        severity: 'low',
        dataClassification: 'internal'
      }
    );

    console.log(`🌍 Added language: ${language.englishName} (${language.code})`);
    return language;
  }

  /**
   * Get translation namespaces
   */
  async getNamespaces(): Promise<TranslationNamespace[]> {
    return Array.from(this.namespaces.values()).sort((a, b) => a.name.localeCompare(b.name));
  }

  /**
   * Add translation namespace
   */
  async addNamespace(namespaceData: Omit<TranslationNamespace, 'id' | 'createdAt' | 'updatedAt'>): Promise<TranslationNamespace> {
    const namespace: TranslationNamespace = {
      ...namespaceData,
      id: this.generateNamespaceId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.namespaces.set(namespace.id, namespace);

    // Add keys to translation keys map
    namespace.keys.forEach(key => {
      this.translationKeys.set(key.key, key);
    });

    console.log(`🌍 Added namespace: ${namespace.name} with ${namespace.keys.length} keys`);
    return namespace;
  }

  /**
   * Get translation for specific key and language
   */
  async getTranslation(key: string, language: string = this.settings.defaultLanguage, variables?: Record<string, any>): Promise<string> {
    const langTranslations = this.translations.get(language);
    let translation = langTranslations?.get(key);

    // Fallback to default language if not found
    if (!translation && language !== this.settings.fallbackLanguage) {
      const fallbackTranslations = this.translations.get(this.settings.fallbackLanguage);
      translation = fallbackTranslations?.get(key);
    }

    // Return key itself if no translation found
    if (!translation) {
      console.warn(`🌍 Missing translation for key: ${key} (${language})`);
      return key;
    }

    let value = translation.value;

    // Replace variables if provided
    if (variables) {
      Object.entries(variables).forEach(([varKey, varValue]) => {
        value = value.replace(new RegExp(`{{${varKey}}}`, 'g'), String(varValue));
      });
    }

    return value;
  }

  /**
   * Get multiple translations for a language
   */
  async getTranslations(keys: string[], language: string = this.settings.defaultLanguage): Promise<Record<string, string>> {
    const result: Record<string, string> = {};
    
    for (const key of keys) {
      result[key] = await this.getTranslation(key, language);
    }

    return result;
  }

  /**
   * Get all translations for a namespace and language
   */
  async getNamespaceTranslations(namespaceId: string, language: string): Promise<Record<string, string>> {
    const namespace = this.namespaces.get(namespaceId);
    if (!namespace) {
      throw new Error(`Namespace not found: ${namespaceId}`);
    }

    const keys = namespace.keys.map(k => k.key);
    return this.getTranslations(keys, language);
  }

  /**
   * Set translation for a key
   */
  async setTranslation(
    key: string,
    language: string,
    value: string,
    translatedBy?: string,
    pluralForms?: Record<string, string>
  ): Promise<Translation> {
    let langTranslations = this.translations.get(language);
    if (!langTranslations) {
      langTranslations = new Map();
      this.translations.set(language, langTranslations);
    }

    const translation: Translation = {
      language,
      key,
      value,
      pluralForms,
      lastUpdated: new Date().toISOString(),
      translatedBy,
      reviewed: false
    };

    langTranslations.set(key, translation);

    // Update language completion percentage
    await this.updateLanguageCompletion(language);

    await logAuditEvent(
      'system',
      'data_modification',
      'translation_updated',
      {
        id: translatedBy || 'system',
        type: 'user',
        name: 'Translator',
        ipAddress: '127.0.0.1'
      },
      {
        type: 'translation',
        id: `${language}:${key}`,
        name: key
      },
      'success',
      {
        description: `Translation updated for ${key} in ${language}`,
        metadata: {
          key,
          language,
          hasPlurals: !!pluralForms
        }
      },
      {
        severity: 'low',
        dataClassification: 'internal'
      }
    );

    console.log(`🌍 Updated translation: ${key} (${language})`);
    return translation;
  }

  /**
   * Bulk import translations
   */
  async importTranslations(
    language: string,
    translations: Record<string, string>,
    importedBy: string
  ): Promise<{ imported: number; skipped: number; errors: string[] }> {
    const result = { imported: 0, skipped: 0, errors: [] as string[] };

    for (const [key, value] of Object.entries(translations)) {
      try {
        if (!value || value.trim() === '') {
          result.skipped++;
          continue;
        }

        await this.setTranslation(key, language, value, importedBy);
        result.imported++;
      } catch (error) {
        result.errors.push(`Failed to import ${key}: ${error.message}`);
      }
    }

    console.log(`🌍 Imported ${result.imported} translations for ${language}, skipped ${result.skipped}, ${result.errors.length} errors`);
    return result;
  }

  /**
   * Export translations for a language
   */
  async exportTranslations(language: string, format: 'json' | 'csv' = 'json'): Promise<string> {
    const langTranslations = this.translations.get(language);
    if (!langTranslations) {
      throw new Error(`No translations found for language: ${language}`);
    }

    const exportData: Record<string, any> = {};
    
    langTranslations.forEach((translation, key) => {
      exportData[key] = translation.value;
    });

    switch (format) {
      case 'json':
        return JSON.stringify(exportData, null, 2);
      
      case 'csv':
        const headers = 'key,translation\n';
        const rows = Object.entries(exportData)
          .map(([key, value]) => `"${key}","${String(value).replace(/"/g, '""')}"`)
          .join('\n');
        return headers + rows;
      
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  }

  /**
   * Get translation statistics
   */
  async getStatistics(): Promise<any> {
    const languages = Array.from(this.languages.values());
    const totalKeys = this.translationKeys.size;

    const languageStats = languages.map(lang => {
      const langTranslations = this.translations.get(lang.code);
      const translatedKeys = langTranslations ? langTranslations.size : 0;
      const completionPercentage = totalKeys > 0 ? Math.round((translatedKeys / totalKeys) * 100) : 0;

      return {
        code: lang.code,
        name: lang.englishName,
        translatedKeys,
        totalKeys,
        completionPercentage,
        isDefault: lang.isDefault,
        isActive: lang.isActive
      };
    });

    const namespaceStats = Array.from(this.namespaces.values()).map(ns => ({
      id: ns.id,
      name: ns.name,
      keyCount: ns.keys.length,
      isSystem: ns.isSystem
    }));

    return {
      totalLanguages: languages.length,
      activeLanguages: languages.filter(l => l.isActive).length,
      totalKeys: totalKeys,
      totalNamespaces: this.namespaces.size,
      
      defaultLanguage: this.settings.defaultLanguage,
      fallbackLanguage: this.settings.fallbackLanguage,
      
      languageStats,
      namespaceStats,
      
      recentTranslations: this.getRecentTranslations(10),
      missingTranslations: this.getMissingTranslations()
    };
  }

  /**
   * Search translations
   */
  async searchTranslations(query: string, language?: string): Promise<Array<{ key: string; value: string; language: string }>> {
    const results: Array<{ key: string; value: string; language: string }> = [];
    const searchTerm = query.toLowerCase();

    const languagesToSearch = language ? [language] : Array.from(this.languages.keys());

    languagesToSearch.forEach(lang => {
      const langTranslations = this.translations.get(lang);
      if (!langTranslations) return;

      langTranslations.forEach((translation, key) => {
        if (key.toLowerCase().includes(searchTerm) || 
            translation.value.toLowerCase().includes(searchTerm)) {
          results.push({
            key,
            value: translation.value,
            language: lang
          });
        }
      });
    });

    return results.slice(0, 100); // Limit results
  }

  /**
   * Get localization settings
   */
  async getSettings(): Promise<LocalizationSettings> {
    return { ...this.settings };
  }

  /**
   * Update localization settings
   */
  async updateSettings(updates: Partial<LocalizationSettings>): Promise<LocalizationSettings> {
    this.settings = { ...this.settings, ...updates };
    
    console.log('🌍 Updated localization settings');
    return this.settings;
  }

  // Private helper methods
  private initializeDefaultSettings(): void {
    this.settings = {
      defaultLanguage: 'en',
      fallbackLanguage: 'en',
      supportedLanguages: ['en', 'es', 'fr', 'de', 'zh', 'ja'],
      autoDetectLanguage: true,
      enableRTLSupport: false,
      dateTimeFormat: {
        'en': 'MM/dd/yyyy',
        'es': 'dd/MM/yyyy',
        'fr': 'dd/MM/yyyy',
        'de': 'dd.MM.yyyy',
        'zh': 'yyyy/MM/dd',
        'ja': 'yyyy/MM/dd'
      },
      numberFormat: {
        'en': { decimal: '.', thousands: ',' },
        'es': { decimal: ',', thousands: '.' },
        'fr': { decimal: ',', thousands: ' ' },
        'de': { decimal: ',', thousands: '.' },
        'zh': { decimal: '.', thousands: ',' },
        'ja': { decimal: '.', thousands: ',' }
      },
      currencyFormat: {
        'en': { symbol: '$', position: 'before' },
        'es': { symbol: '€', position: 'after' },
        'fr': { symbol: '€', position: 'after' },
        'de': { symbol: '€', position: 'after' },
        'zh': { symbol: '¥', position: 'before' },
        'ja': { symbol: '¥', position: 'before' }
      },
      pseudoLocalization: false
    };

    console.log('🌍 Initialized default localization settings');
  }

  private initializeDefaultLanguages(): void {
    const defaultLanguages: Language[] = [
      {
        code: 'en',
        name: 'English',
        englishName: 'English',
        direction: 'ltr',
        region: 'US',
        isActive: true,
        isDefault: true,
        completionPercentage: 100,
        lastUpdated: new Date().toISOString()
      },
      {
        code: 'es',
        name: 'Español',
        englishName: 'Spanish',
        direction: 'ltr',
        region: 'ES',
        isActive: true,
        isDefault: false,
        completionPercentage: 0,
        lastUpdated: new Date().toISOString()
      },
      {
        code: 'fr',
        name: 'Français',
        englishName: 'French',
        direction: 'ltr',
        region: 'FR',
        isActive: true,
        isDefault: false,
        completionPercentage: 0,
        lastUpdated: new Date().toISOString()
      },
      {
        code: 'de',
        name: 'Deutsch',
        englishName: 'German',
        direction: 'ltr',
        region: 'DE',
        isActive: true,
        isDefault: false,
        completionPercentage: 0,
        lastUpdated: new Date().toISOString()
      },
      {
        code: 'zh',
        name: '中文',
        englishName: 'Chinese',
        direction: 'ltr',
        region: 'CN',
        isActive: true,
        isDefault: false,
        completionPercentage: 0,
        lastUpdated: new Date().toISOString()
      },
      {
        code: 'ja',
        name: '日本語',
        englishName: 'Japanese',
        direction: 'ltr',
        region: 'JP',
        isActive: false,
        isDefault: false,
        completionPercentage: 0,
        lastUpdated: new Date().toISOString()
      }
    ];

    defaultLanguages.forEach(lang => {
      this.languages.set(lang.code, lang);
      this.translations.set(lang.code, new Map());
    });

    console.log(`🌍 Initialized ${defaultLanguages.length} default languages`);
  }

  private initializeDefaultNamespaces(): void {
    const defaultNamespaces: Omit<TranslationNamespace, 'id' | 'createdAt' | 'updatedAt'>[] = [
      {
        name: 'common',
        description: 'Common UI elements and actions',
        isSystem: true,
        keys: [
          { key: 'common.save', category: 'ui', description: 'Save button text' },
          { key: 'common.cancel', category: 'ui', description: 'Cancel button text' },
          { key: 'common.delete', category: 'ui', description: 'Delete button text' },
          { key: 'common.edit', category: 'ui', description: 'Edit button text' },
          { key: 'common.loading', category: 'ui', description: 'Loading indicator text' },
          { key: 'common.search', category: 'ui', description: 'Search placeholder text' },
          { key: 'common.filter', category: 'ui', description: 'Filter button text' },
          { key: 'common.export', category: 'ui', description: 'Export button text' },
          { key: 'common.import', category: 'ui', description: 'Import button text' },
          { key: 'common.close', category: 'ui', description: 'Close button text' }
        ]
      },
      {
        name: 'navigation',
        description: 'Navigation menu items',
        isSystem: true,
        keys: [
          { key: 'nav.dashboard', category: 'ui', description: 'Dashboard menu item' },
          { key: 'nav.tasks', category: 'ui', description: 'Tasks menu item' },
          { key: 'nav.projects', category: 'ui', description: 'Projects menu item' },
          { key: 'nav.users', category: 'ui', description: 'Users menu item' },
          { key: 'nav.settings', category: 'ui', description: 'Settings menu item' },
          { key: 'nav.reports', category: 'ui', description: 'Reports menu item' },
          { key: 'nav.logout', category: 'ui', description: 'Logout menu item' }
        ]
      },
      {
        name: 'validation',
        description: 'Form validation messages',
        isSystem: true,
        keys: [
          { key: 'validation.required', category: 'validation', description: 'Required field message', variables: ['field'] },
          { key: 'validation.email', category: 'validation', description: 'Invalid email message' },
          { key: 'validation.minLength', category: 'validation', description: 'Minimum length message', variables: ['min'] },
          { key: 'validation.maxLength', category: 'validation', description: 'Maximum length message', variables: ['max'] },
          { key: 'validation.password', category: 'validation', description: 'Password strength message' }
        ]
      },
      {
        name: 'enterprise',
        description: 'Enterprise features',
        isSystem: true,
        keys: [
          { key: 'enterprise.sso', category: 'ui', description: 'Single Sign-On' },
          { key: 'enterprise.permissions', category: 'ui', description: 'Permissions Management' },
          { key: 'enterprise.audit', category: 'ui', description: 'Audit Logging' },
          { key: 'enterprise.encryption', category: 'ui', description: 'Data Encryption' },
          { key: 'enterprise.backup', category: 'ui', description: 'Backup & Recovery' },
          { key: 'enterprise.compliance', category: 'ui', description: 'Compliance Reports' }
        ]
      }
    ];

    defaultNamespaces.forEach(nsData => {
      const namespace: TranslationNamespace = {
        ...nsData,
        id: this.generateNamespaceId(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      this.namespaces.set(namespace.id, namespace);

      // Add keys to translation keys map
      namespace.keys.forEach(key => {
        this.translationKeys.set(key.key, key);
      });
    });

    console.log(`🌍 Initialized ${defaultNamespaces.length} default namespaces`);
  }

  private initializeDefaultTranslations(): void {
    // Initialize English translations
    const englishTranslations = new Map<string, Translation>();

    const defaultTranslations: Record<string, string> = {
      // Common
      'common.save': 'Save',
      'common.cancel': 'Cancel',
      'common.delete': 'Delete',
      'common.edit': 'Edit',
      'common.loading': 'Loading...',
      'common.search': 'Search...',
      'common.filter': 'Filter',
      'common.export': 'Export',
      'common.import': 'Import',
      'common.close': 'Close',

      // Navigation
      'nav.dashboard': 'Dashboard',
      'nav.tasks': 'Tasks',
      'nav.projects': 'Projects',
      'nav.users': 'Users',
      'nav.settings': 'Settings',
      'nav.reports': 'Reports',
      'nav.logout': 'Logout',

      // Validation
      'validation.required': '{{field}} is required',
      'validation.email': 'Please enter a valid email address',
      'validation.minLength': 'Must be at least {{min}} characters long',
      'validation.maxLength': 'Must be no more than {{max}} characters long',
      'validation.password': 'Password must contain at least 8 characters with letters and numbers',

      // Enterprise
      'enterprise.sso': 'Single Sign-On',
      'enterprise.permissions': 'Permissions Management',
      'enterprise.audit': 'Audit Logging',
      'enterprise.encryption': 'Data Encryption',
      'enterprise.backup': 'Backup & Recovery',
      'enterprise.compliance': 'Compliance Reports'
    };

    Object.entries(defaultTranslations).forEach(([key, value]) => {
      englishTranslations.set(key, {
        language: 'en',
        key,
        value,
        lastUpdated: new Date().toISOString(),
        reviewed: true,
        reviewedBy: 'system',
        reviewedAt: new Date().toISOString()
      });
    });

    this.translations.set('en', englishTranslations);

    console.log(`🌍 Initialized ${Object.keys(defaultTranslations).length} English translations`);
  }

  private async updateLanguageCompletion(languageCode: string): Promise<void> {
    const language = this.languages.get(languageCode);
    if (!language) return;

    const langTranslations = this.translations.get(languageCode);
    const translatedKeys = langTranslations ? langTranslations.size : 0;
    const totalKeys = this.translationKeys.size;
    
    language.completionPercentage = totalKeys > 0 ? Math.round((translatedKeys / totalKeys) * 100) : 0;
    language.lastUpdated = new Date().toISOString();
    
    this.languages.set(languageCode, language);
  }

  private getRecentTranslations(limit: number): Array<{ key: string; language: string; value: string; lastUpdated: string }> {
    const recent: Array<{ key: string; language: string; value: string; lastUpdated: string }> = [];
    
    this.translations.forEach((langTranslations, language) => {
      langTranslations.forEach((translation, key) => {
        recent.push({
          key,
          language,
          value: translation.value,
          lastUpdated: translation.lastUpdated
        });
      });
    });

    return recent
      .sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime())
      .slice(0, limit);
  }

  private getMissingTranslations(): Array<{ key: string; language: string }> {
    const missing: Array<{ key: string; language: string }> = [];
    const allKeys = Array.from(this.translationKeys.keys());
    
    this.languages.forEach((language, langCode) => {
      if (!language.isActive) return;
      
      const langTranslations = this.translations.get(langCode);
      
      allKeys.forEach(key => {
        if (!langTranslations || !langTranslations.has(key)) {
          missing.push({ key, language: langCode });
        }
      });
    });

    return missing;
  }

  private generateNamespaceId(): string {
    return `ns_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export const i18nService = new InternationalizationService();

/**
 * Translation helper function for use throughout the application
 */
export const t = (key: string, language?: string, variables?: Record<string, any>): Promise<string> => {
  return i18nService.getTranslation(key, language, variables);
};