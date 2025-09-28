/**
 * Mobile App Manifest and PWA Configuration
 * Transforms the existing mobile interface into a native-like mobile app
 */

export const mobileAppManifest = {
  name: "Gigster Garage - Enterprise Workflow Hub",
  short_name: "Gigster Garage",
  description: "Complete enterprise workflow management with time tracking, project management, and AI-powered automation",
  start_url: "/mobile",
  display: "standalone",
  orientation: "portrait",
  theme_color: "#004C6D", // Garage Navy
  background_color: "#0B1D3A", // Ignition Teal
  categories: ["productivity", "business", "utilities"],
  lang: "en",
  icons: [
    {
      src: "/icons/icon-72x72.png",
      sizes: "72x72",
      type: "image/png",
      purpose: "maskable any"
    },
    {
      src: "/icons/icon-96x96.png", 
      sizes: "96x96",
      type: "image/png",
      purpose: "maskable any"
    },
    {
      src: "/icons/icon-128x128.png",
      sizes: "128x128", 
      type: "image/png",
      purpose: "maskable any"
    },
    {
      src: "/icons/icon-144x144.png",
      sizes: "144x144",
      type: "image/png",
      purpose: "maskable any"
    },
    {
      src: "/icons/icon-152x152.png",
      sizes: "152x152",
      type: "image/png",
      purpose: "maskable any"
    },
    {
      src: "/icons/icon-192x192.png",
      sizes: "192x192",
      type: "image/png",
      purpose: "maskable any"
    },
    {
      src: "/icons/icon-384x384.png",
      sizes: "384x384",
      type: "image/png",
      purpose: "maskable any"
    },
    {
      src: "/icons/icon-512x512.png",
      sizes: "512x512",
      type: "image/png",
      purpose: "maskable any"
    }
  ],
  shortcuts: [
    {
      name: "Tasks",
      url: "/mobile/tasks",
      description: "View and manage tasks",
      icons: [{ src: "/icons/shortcut-tasks.png", sizes: "96x96" }]
    },
    {
      name: "Time Tracker",
      url: "/mobile/time-tracking", 
      description: "Track work time and productivity",
      icons: [{ src: "/icons/shortcut-timer.png", sizes: "96x96" }]
    },
    {
      name: "Projects",
      url: "/mobile/projects",
      description: "Manage project dashboards",
      icons: [{ src: "/icons/shortcut-projects.png", sizes: "96x96" }]
    },
    {
      name: "Analytics",
      url: "/mobile/analytics",
      description: "View productivity analytics",
      icons: [{ src: "/icons/shortcut-analytics.png", sizes: "96x96" }]
    }
  ],
  screenshots: [
    {
      src: "/screenshots/mobile-dashboard.png",
      sizes: "375x812",
      type: "image/png",
      form_factor: "narrow",
      label: "Mobile Dashboard - Enterprise overview with project cards and task summaries"
    },
    {
      src: "/screenshots/mobile-tasks.png", 
      sizes: "375x812",
      type: "image/png",
      form_factor: "narrow",
      label: "Task Management - Create, track, and manage tasks with priority levels"
    },
    {
      src: "/screenshots/mobile-timer.png",
      sizes: "375x812", 
      type: "image/png",
      form_factor: "narrow",
      label: "Time Tracking - Integrated timer with productivity analytics"
    }
  ]
};

/**
 * PWA Installation and Native Features
 */
export class MobileAppService {
  private deferredPrompt: any = null;
  private isInstallable = false;
  
  constructor() {
    this.initializePWA();
    this.setupNativeFeatures();
  }

  /**
   * Initialize Progressive Web App features
   */
  private initializePWA() {
    // Listen for install prompt
    window.addEventListener('beforeinstallprompt', (e) => {
      console.log('📱 PWA installation prompt available');
      e.preventDefault();
      this.deferredPrompt = e;
      this.isInstallable = true;
      this.showInstallBanner();
    });

    // Track installation
    window.addEventListener('appinstalled', () => {
      console.log('📱 PWA installed successfully');
      this.hideInstallBanner();
      this.trackInstallation();
    });

    // Register service worker
    if ('serviceWorker' in navigator) {
      this.registerServiceWorker();
    }
  }

  /**
   * Setup native-like mobile features
   */
  private setupNativeFeatures() {
    // Status bar styling for iOS
    this.setupStatusBar();
    
    // Haptic feedback for supported devices
    this.setupHapticFeedback();
    
    // Native-like navigation
    this.setupNativeNavigation();
    
    // Screen orientation handling
    this.setupOrientationHandling();
    
    // Battery status monitoring
    this.setupBatteryMonitoring();
    
    // Network status monitoring
    this.setupNetworkMonitoring();
  }

  /**
   * Register service worker for offline functionality
   */
  private async registerServiceWorker() {
    try {
      const registration = await navigator.serviceWorker.register('/mobile-sw.js', {
        scope: '/mobile/'
      });
      
      console.log('📱 Service Worker registered:', registration.scope);
      
      // Check for updates
      registration.addEventListener('updatefound', () => {
        console.log('📱 New service worker version available');
        this.showUpdateBanner();
      });
      
    } catch (error) {
      console.error('📱 Service Worker registration failed:', error);
    }
  }

  /**
   * Setup iOS status bar styling
   */
  private setupStatusBar() {
    // Add meta tags for iOS status bar
    const metaTags = [
      { name: 'apple-mobile-web-app-capable', content: 'yes' },
      { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
      { name: 'apple-mobile-web-app-title', content: 'Gigster Garage' },
      { name: 'mobile-web-app-capable', content: 'yes' },
      { name: 'theme-color', content: '#004C6D' },
      { name: 'msapplication-TileColor', content: '#004C6D' },
      { name: 'msapplication-navbutton-color', content: '#004C6D' }
    ];

    metaTags.forEach(tag => {
      const meta = document.createElement('meta');
      meta.name = tag.name;
      meta.content = tag.content;
      document.head.appendChild(meta);
    });
  }

  /**
   * Setup haptic feedback for supported devices
   */
  private setupHapticFeedback() {
    // Add haptic feedback to button interactions
    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      if (target.matches('button, .btn, [role="button"]')) {
        this.triggerHapticFeedback('light');
      }
    });
  }

  /**
   * Trigger haptic feedback
   */
  public triggerHapticFeedback(type: 'light' | 'medium' | 'heavy' = 'light') {
    // iOS Haptic Feedback
    if ('haptics' in navigator) {
      try {
        (navigator as any).haptics.notification({ type });
      } catch (error) {
        console.log('Haptic feedback not supported');
      }
    }
    
    // Android Vibration API fallback
    if ('vibrate' in navigator) {
      const patterns = {
        light: [10],
        medium: [20],
        heavy: [30]
      };
      navigator.vibrate(patterns[type]);
    }
  }

  /**
   * Setup native-like navigation with gestures
   */
  private setupNativeNavigation() {
    let startX = 0;
    let startY = 0;
    
    document.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    }, { passive: true });
    
    document.addEventListener('touchend', (e) => {
      const endX = e.changedTouches[0].clientX;
      const endY = e.changedTouches[0].clientY;
      const diffX = endX - startX;
      const diffY = endY - startY;
      
      // Swipe gestures for navigation
      if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 100) {
        if (diffX > 0 && startX < 50) {
          // Swipe right from left edge - go back
          this.handleBackNavigation();
        }
      }
    }, { passive: true });
  }

  /**
   * Handle back navigation
   */
  private handleBackNavigation() {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      // Navigate to mobile home if no history
      window.location.href = '/mobile';
    }
  }

  /**
   * Setup screen orientation handling
   */
  private setupOrientationHandling() {
    if (screen && screen.orientation) {
      screen.orientation.addEventListener('change', () => {
        console.log('📱 Orientation changed:', screen.orientation.angle);
        this.adjustLayoutForOrientation();
      });
    }
  }

  /**
   * Adjust layout for current orientation
   */
  private adjustLayoutForOrientation() {
    const isLandscape = window.innerWidth > window.innerHeight;
    document.body.classList.toggle('landscape', isLandscape);
    document.body.classList.toggle('portrait', !isLandscape);
  }

  /**
   * Setup battery status monitoring
   */
  private async setupBatteryMonitoring() {
    if ('getBattery' in navigator) {
      try {
        const battery = await (navigator as any).getBattery();
        
        const updateBatteryInfo = () => {
          console.log('📱 Battery:', Math.round(battery.level * 100) + '%');
          // Show battery warning if low and app is being used heavily
          if (battery.level < 0.15 && !battery.charging) {
            this.showBatteryWarning();
          }
        };

        battery.addEventListener('levelchange', updateBatteryInfo);
        battery.addEventListener('chargingchange', updateBatteryInfo);
        updateBatteryInfo();
        
      } catch (error) {
        console.log('Battery API not supported');
      }
    }
  }

  /**
   * Setup network status monitoring
   */
  private setupNetworkMonitoring() {
    window.addEventListener('online', () => {
      console.log('📱 Network: Online');
      this.hideOfflineBanner();
      this.syncOfflineData();
    });
    
    window.addEventListener('offline', () => {
      console.log('📱 Network: Offline');
      this.showOfflineBanner();
    });
    
    // Connection type detection
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      console.log('📱 Connection type:', connection.effectiveType);
      
      connection.addEventListener('change', () => {
        console.log('📱 Connection changed:', connection.effectiveType);
        this.adjustForConnectionSpeed(connection.effectiveType);
      });
    }
  }

  /**
   * Show install banner
   */
  private showInstallBanner() {
    const banner = document.createElement('div');
    banner.id = 'pwa-install-banner';
    banner.className = 'fixed top-0 left-0 right-0 bg-blue-600 text-white p-3 z-50 flex items-center justify-between';
    banner.innerHTML = `
      <div class="flex items-center space-x-3">
        <div class="text-lg">📱</div>
        <div>
          <div class="font-semibold">Install Gigster Garage</div>
          <div class="text-sm opacity-90">Get the full mobile experience</div>
        </div>
      </div>
      <div class="flex space-x-2">
        <button id="install-app" class="bg-white text-blue-600 px-4 py-1 rounded font-semibold">Install</button>
        <button id="dismiss-install" class="text-white opacity-75">✕</button>
      </div>
    `;
    
    document.body.appendChild(banner);
    
    // Add event listeners
    document.getElementById('install-app')?.addEventListener('click', () => {
      this.installApp();
    });
    
    document.getElementById('dismiss-install')?.addEventListener('click', () => {
      this.hideInstallBanner();
    });
  }

  /**
   * Install PWA
   */
  public async installApp() {
    if (!this.deferredPrompt) return;
    
    this.deferredPrompt.prompt();
    const { outcome } = await this.deferredPrompt.userChoice;
    
    console.log('📱 Install prompt outcome:', outcome);
    
    if (outcome === 'accepted') {
      this.hideInstallBanner();
    }
    
    this.deferredPrompt = null;
  }

  /**
   * Hide install banner
   */
  private hideInstallBanner() {
    const banner = document.getElementById('pwa-install-banner');
    if (banner) {
      banner.remove();
    }
  }

  /**
   * Show update banner
   */
  private showUpdateBanner() {
    // Implementation for showing app update notification
    console.log('📱 New app version available');
  }

  /**
   * Show battery warning
   */
  private showBatteryWarning() {
    // Implementation for low battery warning
    console.log('📱 Low battery warning');
  }

  /**
   * Show offline banner
   */
  private showOfflineBanner() {
    const banner = document.createElement('div');
    banner.id = 'offline-banner';
    banner.className = 'fixed top-0 left-0 right-0 bg-orange-500 text-white p-2 z-40 text-center text-sm';
    banner.innerHTML = '📶 You\'re offline. Changes will sync when connection is restored.';
    document.body.appendChild(banner);
  }

  /**
   * Hide offline banner
   */
  private hideOfflineBanner() {
    const banner = document.getElementById('offline-banner');
    if (banner) {
      banner.remove();
    }
  }

  /**
   * Sync offline data when connection is restored
   */
  private async syncOfflineData() {
    // Implementation for syncing offline changes
    console.log('📱 Syncing offline data...');
  }

  /**
   * Adjust app behavior based on connection speed
   */
  private adjustForConnectionSpeed(effectiveType: string) {
    // Reduce image quality, defer non-critical requests on slow connections
    document.body.classList.toggle('slow-connection', effectiveType === 'slow-2g' || effectiveType === '2g');
  }

  /**
   * Track app installation for analytics
   */
  private trackInstallation() {
    // Track PWA installation event
    if (typeof gtag !== 'undefined') {
      gtag('event', 'pwa_install', {
        event_category: 'engagement',
        event_label: 'mobile_app_installed'
      });
    }
  }

  /**
   * Check if app is installed
   */
  public isAppInstalled(): boolean {
    return window.matchMedia('(display-mode: standalone)').matches ||
           window.matchMedia('(display-mode: fullscreen)').matches ||
           (window.navigator as any).standalone === true;
  }

  /**
   * Get installation status
   */
  public getInstallationStatus() {
    return {
      isInstallable: this.isInstallable,
      isInstalled: this.isAppInstalled(),
      supportsServiceWorker: 'serviceWorker' in navigator,
      supportsNotifications: 'Notification' in window,
      supportsPushManager: 'PushManager' in window
    };
  }
}

// Initialize mobile app service
export const mobileAppService = new MobileAppService();