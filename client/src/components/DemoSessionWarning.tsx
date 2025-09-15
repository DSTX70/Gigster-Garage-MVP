import { useDemoMode } from '@/hooks/useDemoMode';
import { useDemoGuard } from '@/hooks/useDemoGuard';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, AlertTriangle, Zap, ArrowRight } from 'lucide-react';
import { useState, useEffect } from 'react';

export function DemoSessionWarning() {
  const { 
    isDemoMode, 
    isExpiringSoon, 
    timeRemaining, 
    timeRemainingFormatted, 
    dismissWarning,
    endDemoSession,
    createDemoSession 
  } = useDemoMode();
  const { navigateToUpgrade } = useDemoGuard();
  
  const [isOpen, setIsOpen] = useState(false);
  const [hasShownWarning, setHasShownWarning] = useState(false);

  // Show warning when session is expiring soon and hasn't been shown yet
  useEffect(() => {
    if (isExpiringSoon && !hasShownWarning && isDemoMode) {
      setIsOpen(true);
      setHasShownWarning(true);
    }
  }, [isExpiringSoon, hasShownWarning, isDemoMode]);

  // Reset warning state when session is no longer expiring
  useEffect(() => {
    if (!isExpiringSoon) {
      setHasShownWarning(false);
    }
  }, [isExpiringSoon]);

  const handleDismiss = () => {
    setIsOpen(false);
    dismissWarning();
  };

  const handleExtendSession = async () => {
    try {
      await createDemoSession();
      setIsOpen(false);
      setHasShownWarning(false);
    } catch (error) {
      console.error('Failed to extend demo session:', error);
    }
  };

  const handleUpgrade = () => {
    setIsOpen(false);
    navigateToUpgrade('demo-session-expiring');
  };

  const handleEndSession = async () => {
    try {
      await endDemoSession();
      setIsOpen(false);
    } catch (error) {
      console.error('Failed to end demo session:', error);
    }
  };

  if (!isDemoMode) return null;

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <div className="bg-amber-100 p-2 rounded-full">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
            </div>
            <Badge variant="outline" className="bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 border-purple-300">
              <Zap className="h-3 w-3 mr-1" />
              DEMO MODE
            </Badge>
          </div>
          
          <AlertDialogTitle className="text-lg">
            Demo Session Expiring Soon
          </AlertDialogTitle>
          
          <AlertDialogDescription className="space-y-3">
            <div className="flex items-center gap-2 text-amber-600 font-medium">
              <Clock className="h-4 w-4" />
              <span>{timeRemainingFormatted} remaining</span>
            </div>
            
            <p>
              Your demo session is about to expire. You can extend your demo for another 45 minutes 
              or upgrade to unlock the full platform with unlimited access.
            </p>
            
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800">
                <strong>Upgrade benefits:</strong> Unlimited time, save your data, 
                access to premium features, and full customer support.
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <AlertDialogFooter className="flex-col gap-2 sm:flex-col">
          <div className="flex gap-2 w-full">
            <Button
              onClick={handleUpgrade}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white flex-1"
              data-testid="button-upgrade-session-warning"
            >
              <Zap className="h-4 w-4 mr-2" />
              Upgrade Now
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
            
            <Button
              variant="outline"
              onClick={handleExtendSession}
              className="flex-1"
              data-testid="button-extend-demo-session"
            >
              <Clock className="h-4 w-4 mr-2" />
              Extend Demo
            </Button>
          </div>
          
          <div className="flex gap-2 w-full">
            <AlertDialogCancel asChild>
              <Button
                variant="ghost"
                onClick={handleDismiss}
                className="flex-1"
                data-testid="button-dismiss-warning"
              >
                Continue Demo
              </Button>
            </AlertDialogCancel>
            
            <Button
              variant="ghost"
              onClick={handleEndSession}
              className="flex-1 text-gray-500"
              data-testid="button-end-session-warning"
            >
              End Session
            </Button>
          </div>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}