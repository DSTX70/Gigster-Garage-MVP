import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Clock, Zap, ArrowRight, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

interface DemoSessionResponse {
  success: boolean;
  session?: {
    id: string;
    userId: string;
    expiresAt: string;
    remainingMinutes: number;
  };
  user?: {
    id: string;
    username: string;
    name: string;
    isDemo: boolean;
  };
  error?: string;
}

export function DemoSessionCreator() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showLimitations, setShowLimitations] = useState(false);

  const createDemoMutation = useMutation({
    mutationFn: async (): Promise<DemoSessionResponse> => {
      const response = await fetch('/api/demo/create-session', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to create demo session: ${response.status}`);
      }

      return response.json();
    },
    onSuccess: (data) => {
      if (data.success && data.user) {
        // Invalidate auth queries to refresh user state
        queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
        
        toast({
          title: "🎮 Demo Session Started!",
          description: `Welcome ${data.user.name}! Your 45-minute demo session is now active.`,
          variant: "default",
        });

        // Redirect to main app
        setTimeout(() => {
          setLocation('/tasks');
        }, 1000);
      } else {
        throw new Error(data.error || 'Failed to create demo session');
      }
    },
    onError: (error: any) => {
      toast({
        title: "Demo Session Failed",
        description: error.message || "Unable to start demo session. Please try again.",
        variant: "destructive",
      });
    },
  });

  const demoLimitations = [
    "45-minute session with automatic cleanup",
    "Limited to 5 tasks and 3 projects", 
    "File uploads limited to 5MB",
    "No email notifications (demo data only)",
    "Sample data included for exploration"
  ];

  const demoFeatures = [
    "Full task management system",
    "Project organization tools", 
    "AI-powered content generation",
    "Invoice and proposal creation",
    "Time tracking and reporting",
    "Team collaboration features"
  ];

  return (
    <div className="space-y-4">
      {/* Demo Limitations Info */}
      <Card className="border-l-4 border-l-blue-500 bg-blue-50 dark:bg-blue-950/20">
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-blue-600" />
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  45-Minute Demo
                </Badge>
              </div>
              <h4 className="font-semibold text-sm mb-2">What's included in the demo:</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="font-medium mb-1 text-green-700">✅ Full Features:</p>
                  <ul className="space-y-1 text-xs">
                    {demoFeatures.map((feature, index) => (
                      <li key={index} className="flex items-center gap-1">
                        <CheckCircle className="h-3 w-3 text-green-500 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="font-medium mb-1 text-amber-700">⚠️ Demo Limits:</p>
                  <ul className="space-y-1 text-xs">
                    {demoLimitations.map((limitation, index) => (
                      <li key={index} className="flex items-center gap-1">
                        <AlertCircle className="h-3 w-3 text-amber-500 flex-shrink-0" />
                        {limitation}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="space-y-3">
        <Button
          onClick={() => createDemoMutation.mutate()}
          disabled={createDemoMutation.isPending}
          className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-lg shadow-lg transition-all duration-200 transform hover:scale-105"
          size="lg"
          data-testid="button-start-demo-session"
        >
          {createDemoMutation.isPending ? (
            <>
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              Creating Demo Session...
            </>
          ) : (
            <>
              <Zap className="h-5 w-5 mr-2" />
              Start 45-Minute Demo Now
              <ArrowRight className="h-5 w-5 ml-2" />
            </>
          )}
        </Button>

        <div className="text-center">
          <p className="text-sm text-gray-500 mb-2">
            Or use existing demo accounts:
          </p>
          <div className="flex gap-2 justify-center">
            <Button 
              variant="outline" 
              size="sm"
              asChild
              data-testid="button-login-existing"
            >
              <a href="/login">Login with Demo Credentials</a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}