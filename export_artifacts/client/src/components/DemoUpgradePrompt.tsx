import { useDemoMode } from '@/hooks/useDemoMode';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Zap, 
  ArrowRight, 
  Check, 
  Clock, 
  Shield, 
  Users, 
  BarChart3,
  FileText,
  Mail,
  X
} from 'lucide-react';
import { useState } from 'react';

interface DemoUpgradePromptProps {
  context?: 'task-creation' | 'client-management' | 'document-creation' | 'general';
  compact?: boolean;
  dismissible?: boolean;
}

export function DemoUpgradePrompt({ 
  context = 'general', 
  compact = false, 
  dismissible = true 
}: DemoUpgradePromptProps) {
  const { isDemoMode, timeRemainingFormatted } = useDemoMode();
  const [isDismissed, setIsDismissed] = useState(false);

  if (!isDemoMode || isDismissed) return null;

  const contextMessages = {
    'task-creation': {
      title: 'Unlock Unlimited Task Management',
      description: 'Create unlimited tasks, set advanced workflows, and track progress across multiple projects.',
      icon: BarChart3,
      benefits: ['Unlimited tasks & projects', 'Advanced workflow automation', 'Time tracking & reporting']
    },
    'client-management': {
      title: 'Professional Client Management',
      description: 'Manage unlimited clients with full CRM features, custom fields, and communication history.',
      icon: Users,
      benefits: ['Unlimited client profiles', 'Custom fields & tags', 'Communication tracking']
    },
    'document-creation': {
      title: 'Professional Document Suite',
      description: 'Create unlimited proposals, invoices, and contracts with advanced templates and branding.',
      icon: FileText,
      benefits: ['Unlimited documents', 'Custom templates', 'Digital signatures']
    },
    'general': {
      title: 'Unlock the Full Platform',
      description: 'Experience everything Gigster Garage has to offer with unlimited access and premium features.',
      icon: Zap,
      benefits: ['Unlimited everything', 'Premium support', 'Advanced integrations']
    }
  };

  const currentContext = contextMessages[context];
  const Icon = currentContext.icon;

  const handleUpgrade = () => {
    // TODO: Implement upgrade flow
    console.log('Upgrade flow triggered from:', context);
  };

  if (compact) {
    return (
      <Card className="border-l-4 border-l-purple-500 bg-gradient-to-r from-purple-50 to-blue-50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-purple-100 p-2 rounded-lg">
                <Icon className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <h4 className="font-semibold text-sm">{currentContext.title}</h4>
                <p className="text-xs text-gray-600">
                  Demo ends in {timeRemainingFormatted}
                </p>
              </div>
            </div>
            
            <Button
              onClick={handleUpgrade}
              size="sm"
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
              data-testid={`button-upgrade-compact-${context}`}
            >
              Upgrade <ArrowRight className="h-3 w-3 ml-1" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 via-blue-50 to-teal-50 relative overflow-hidden">
      {dismissible && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsDismissed(true)}
          className="absolute top-2 right-2 h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
          data-testid="button-dismiss-upgrade-prompt"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
      
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-3 rounded-lg text-white">
            <Icon className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <Badge variant="outline" className="bg-white/80 text-purple-700 border-purple-300 mb-2">
              <Clock className="h-3 w-3 mr-1" />
              Demo: {timeRemainingFormatted} left
            </Badge>
            <CardTitle className="text-lg">{currentContext.title}</CardTitle>
          </div>
        </div>
        <p className="text-sm text-gray-600">{currentContext.description}</p>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-3 mb-4">
          {currentContext.benefits.map((benefit, index) => (
            <div key={index} className="flex items-center gap-2">
              <div className="bg-green-100 p-1 rounded-full">
                <Check className="h-3 w-3 text-green-600" />
              </div>
              <span className="text-sm text-gray-700">{benefit}</span>
            </div>
          ))}
          
          <div className="flex items-center gap-2 text-purple-600 font-medium">
            <Shield className="h-4 w-4" />
            <span className="text-sm">30-day money-back guarantee</span>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button
            onClick={handleUpgrade}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white flex-1"
            data-testid={`button-upgrade-full-${context}`}
          >
            <Zap className="h-4 w-4 mr-2" />
            Upgrade Now
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
          
          <Button
            variant="outline"
            className="border-purple-300 text-purple-700 hover:bg-purple-50"
            data-testid={`button-learn-more-${context}`}
          >
            <Mail className="h-4 w-4 mr-2" />
            Learn More
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Quick upgrade CTA for inline use
export function DemoUpgradeCTA({ className = '' }: { className?: string }) {
  const { isDemoMode } = useDemoMode();
  
  if (!isDemoMode) return null;
  
  const handleUpgrade = () => {
    console.log('Quick upgrade CTA triggered');
  };
  
  return (
    <Button
      onClick={handleUpgrade}
      variant="outline"
      size="sm"
      className={`bg-gradient-to-r from-purple-50 to-blue-50 border-purple-300 text-purple-700 hover:from-purple-100 hover:to-blue-100 ${className}`}
      data-testid="button-quick-upgrade-cta"
    >
      <Zap className="h-3 w-3 mr-1" />
      Upgrade to Pro
      <ArrowRight className="h-3 w-3 ml-1" />
    </Button>
  );
}