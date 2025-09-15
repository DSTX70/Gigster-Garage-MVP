import { useDemoMode } from './useDemoMode';
import { useLocation } from 'wouter';
import { useToast } from './use-toast';

interface DemoGuardOptions {
  showToast?: boolean;
  customMessage?: string;
  redirectTo?: string;
}

export function useDemoGuard() {
  const { isDemoMode } = useDemoMode();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const canPerformAction = (limitation?: string, options: DemoGuardOptions = {}) => {
    if (!isDemoMode) {
      return true;
    }
    
    // Show toast notification about limitation
    if (options.showToast !== false) {
      toast({
        title: "Demo Limitation",
        description: options.customMessage || `This feature is limited in demo mode. ${limitation ? `(${limitation})` : ''} Upgrade to unlock full access.`,
        variant: "default",
      });
    }
    
    // Navigate to signup with context
    const redirectUrl = options.redirectTo || '/signup';
    const urlParams = new URLSearchParams({
      from: 'demo',
      ...(limitation && { reason: limitation })
    });
    
    setLocation(`${redirectUrl}?${urlParams.toString()}`);
    return false;
  };
  
  const guardedAction = <T extends any[]>(
    action: (...args: T) => void,
    limitation?: string,
    options?: DemoGuardOptions
  ) => {
    return (...args: T) => {
      if (canPerformAction(limitation, options)) {
        action(...args);
      }
    };
  };
  
  const navigateToUpgrade = (reason?: string) => {
    const urlParams = new URLSearchParams({
      from: 'demo',
      ...(reason && { reason })
    });
    setLocation(`/signup?${urlParams.toString()}`);
  };
  
  return {
    isDemoMode,
    canPerformAction,
    guardedAction,
    navigateToUpgrade,
    requiresUpgrade: isDemoMode,
  };
}

// Demo limitations constants
export const DEMO_LIMITATIONS = {
  CREATE_TASK: 'Task creation is limited to 5 tasks in demo mode',
  CREATE_CLIENT: 'Client management requires full account',
  FILE_UPLOAD: 'File uploads are limited in demo mode',
  EXPORT_DATA: 'Data export requires full account',
  BULK_OPERATIONS: 'Bulk operations require full account', 
  ADVANCED_FEATURES: 'Advanced features require full account',
  CUSTOM_FIELDS: 'Custom fields require full account',
  API_ACCESS: 'API access requires full account',
  INTEGRATIONS: 'Integrations require full account',
  UNLIMITED_PROJECTS: 'Project creation is limited in demo mode',
} as const;

// Hook for specific demo limitations
export function useDemoLimitations() {
  const { isDemoMode, canPerformAction, navigateToUpgrade } = useDemoGuard();
  
  return {
    isDemoMode,
    limitations: DEMO_LIMITATIONS,
    checkCreateTask: () => canPerformAction(DEMO_LIMITATIONS.CREATE_TASK),
    checkCreateClient: () => canPerformAction(DEMO_LIMITATIONS.CREATE_CLIENT),
    checkFileUpload: () => canPerformAction(DEMO_LIMITATIONS.FILE_UPLOAD),
    checkExportData: () => canPerformAction(DEMO_LIMITATIONS.EXPORT_DATA),
    checkBulkOperations: () => canPerformAction(DEMO_LIMITATIONS.BULK_OPERATIONS),
    checkAdvancedFeatures: () => canPerformAction(DEMO_LIMITATIONS.ADVANCED_FEATURES),
    navigateToUpgrade,
  };
}