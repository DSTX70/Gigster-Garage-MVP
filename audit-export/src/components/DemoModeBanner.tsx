import { useDemoMode } from '@/hooks/useDemoMode';
import { useDemoGuard } from '@/hooks/useDemoGuard';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Zap, ArrowRight, X } from 'lucide-react';
import { useState } from 'react';

export function DemoModeBanner() {
  const { isDemoMode, timeRemainingFormatted, timeRemaining, endDemoSession } = useDemoMode();
  const { navigateToUpgrade } = useDemoGuard();
  const [isMinimized, setIsMinimized] = useState(false);

  if (!isDemoMode) return null;

  if (isMinimized) {
    return (
      <div className="fixed top-4 right-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsMinimized(false)}
          className="bg-gradient-to-r from-purple-600 to-blue-600 text-white border-none hover:from-purple-700 hover:to-blue-700 shadow-lg"
          data-testid="button-expand-demo-banner"
        >
          <Clock className="h-4 w-4 mr-1" />
          DEMO {timeRemainingFormatted}
        </Button>
      </div>
    );
  }

  return (
    <Card className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-gradient-to-r from-purple-600 via-blue-600 to-teal-600 text-white border-none shadow-xl max-w-md w-full mx-4">
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-white/20 text-white border-none">
              <Zap className="h-3 w-3 mr-1" />
              DEMO MODE
            </Badge>
            <div className="flex items-center gap-1 text-sm">
              <Clock className="h-4 w-4" />
              <span className="font-mono">{timeRemainingFormatted}</span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMinimized(true)}
            className="h-6 w-6 p-0 text-white hover:bg-white/20"
            data-testid="button-minimize-demo-banner"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="space-y-2">
          <p className="text-sm">
            You're exploring Gigster Garage with sample data. 
            <span className="font-semibold"> Explore key features with some limitations.</span>
          </p>
          
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigateToUpgrade('demo-banner')}
              className="bg-white text-purple-600 hover:bg-gray-100 flex-1"
              data-testid="button-upgrade-demo"
            >
              Upgrade to Full Access
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={endDemoSession}
              className="text-white hover:bg-white/20"
              data-testid="button-end-demo"
            >
              End Demo
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}

// Smaller demo mode indicator for pages
export function DemoModeIndicator() {
  const { isDemoMode, timeRemainingFormatted } = useDemoMode();

  if (!isDemoMode) return null;

  return (
    <Badge 
      variant="outline" 
      className="bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 border-purple-300"
      data-testid="badge-demo-mode"
    >
      <Zap className="h-3 w-3 mr-1" />
      DEMO ({timeRemainingFormatted})
    </Badge>
  );
}

// Demo mode status bar (subtle top bar)
export function DemoModeStatusBar() {
  const { isDemoMode, timeRemaining, timeRemainingFormatted } = useDemoMode();
  const { navigateToUpgrade } = useDemoGuard();
  
  if (!isDemoMode) return null;
  
  // Calculate progress percentage (45 minutes = 2700 seconds)
  const totalDemoTime = 45 * 60; // 45 minutes in seconds
  const progressPercentage = Math.max(0, Math.min(100, (timeRemaining / totalDemoTime) * 100));
  
  return (
    <div className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-2 px-4 text-center text-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4" />
          <span className="font-semibold">DEMO MODE ACTIVE</span>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span className="font-mono">{timeRemainingFormatted} remaining</span>
          </div>
          
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigateToUpgrade('demo-status-bar')}
            className="bg-white text-purple-600 hover:bg-gray-100 h-6 px-2 text-xs"
            data-testid="button-upgrade-status-bar"
          >
            Upgrade Now <ArrowRight className="h-3 w-3 ml-1" />
          </Button>
        </div>
      </div>
      
      {/* Progress bar */}
      <div className="w-full bg-white/20 rounded-full h-1 mt-2">
        <div 
          className="bg-white h-1 rounded-full transition-all duration-1000"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>
    </div>
  );
}