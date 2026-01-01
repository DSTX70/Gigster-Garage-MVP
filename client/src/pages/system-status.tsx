import { useQuery } from "@tanstack/react-query";
import { PageShell } from "@/components/layout/PageShell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Database, 
  Mail, 
  MessageSquare, 
  CreditCard, 
  Brain, 
  HardDrive, 
  RefreshCw,
  ExternalLink,
  Shield,
  Globe
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SystemStatus {
  database: boolean;
  ai: boolean;
  email: boolean;
  sms: boolean;
  stripe: boolean;
  objectStorage: boolean;
  slack: boolean;
  dth: boolean;
}

interface StatusItemProps {
  name: string;
  description: string;
  configured: boolean | null;
  required: boolean;
  icon: typeof Database;
  docsLink?: string;
  planRequired?: string;
}

function StatusItem({ name, description, configured, required, icon: Icon, docsLink, planRequired }: StatusItemProps) {
  const getStatusBadge = () => {
    if (configured === null) {
      return <Badge variant="secondary">Loading...</Badge>;
    }
    if (configured) {
      return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">Configured</Badge>;
    }
    if (required) {
      return <Badge variant="destructive">Missing</Badge>;
    }
    return <Badge variant="outline">Optional</Badge>;
  };

  const getStatusIcon = () => {
    if (configured === null) {
      return <RefreshCw className="w-5 h-5 text-gray-400 animate-spin" />;
    }
    if (configured) {
      return <CheckCircle className="w-5 h-5 text-green-600" />;
    }
    if (required) {
      return <XCircle className="w-5 h-5 text-red-500" />;
    }
    return <AlertCircle className="w-5 h-5 text-amber-500" />;
  };

  return (
    <div className={cn(
      "flex items-center justify-between p-4 rounded-lg border",
      configured === false && required && "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950",
      configured === true && "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950",
      configured === false && !required && "border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950"
    )}>
      <div className="flex items-center gap-4">
        <div className={cn(
          "p-2 rounded-lg",
          configured === true && "bg-green-100 dark:bg-green-900",
          configured === false && required && "bg-red-100 dark:bg-red-900",
          configured === false && !required && "bg-amber-100 dark:bg-amber-900"
        )}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-medium">{name}</span>
            {planRequired && (
              <Badge variant="secondary" className="text-xs">
                {planRequired}+
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        {getStatusBadge()}
        {getStatusIcon()}
        {docsLink && !configured && (
          <Button variant="ghost" size="sm" asChild>
            <a href={docsLink} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="w-4 h-4" />
            </a>
          </Button>
        )}
      </div>
    </div>
  );
}

export default function SystemStatusPage() {
  const { data: status, isLoading, refetch, isRefetching } = useQuery<SystemStatus>({
    queryKey: ["/api/system/status"],
    refetchInterval: 60000,
  });

  const statusItems: StatusItemProps[] = [
    {
      name: "Database",
      description: "PostgreSQL connection for data storage",
      configured: status?.database ?? null,
      required: true,
      icon: Database,
    },
    {
      name: "AI / OpenAI",
      description: "Powers GigsterCoach, proposal generation, and content drafting",
      configured: status?.ai ?? null,
      required: false,
      icon: Brain,
      planRequired: "Pro",
    },
    {
      name: "Email (SendGrid)",
      description: "Send invoices, proposals, and notifications via email",
      configured: status?.email ?? null,
      required: false,
      icon: Mail,
    },
    {
      name: "SMS (Twilio)",
      description: "Send SMS notifications and reminders",
      configured: status?.sms ?? null,
      required: false,
      icon: MessageSquare,
    },
    {
      name: "Payments (Stripe)",
      description: "Accept credit card payments and manage subscriptions",
      configured: status?.stripe ?? null,
      required: false,
      icon: CreditCard,
    },
    {
      name: "Object Storage",
      description: "Store files, attachments, and media",
      configured: status?.objectStorage ?? null,
      required: false,
      icon: HardDrive,
    },
    {
      name: "Slack Integration",
      description: "Send notifications and updates to Slack",
      configured: status?.slack ?? null,
      required: false,
      icon: Globe,
    },
    {
      name: "DreamTeamHub",
      description: "Integration with DreamTeamHub for agent coordination",
      configured: status?.dth ?? null,
      required: false,
      icon: Shield,
      planRequired: "Enterprise",
    },
  ];

  const configuredCount = statusItems.filter(item => 
    (status as any)?.[item.name.toLowerCase().split(' ')[0].split('/')[0]] === true ||
    item.configured === true
  ).length;

  const requiredMissing = statusItems.filter(item => 
    item.required && item.configured === false
  );

  return (
    <PageShell
      title="System Status"
      subtitle="Check configuration status for all integrations and services"
      primaryAction={
        <Button 
          onClick={() => refetch()} 
          disabled={isRefetching}
          variant="outline"
          data-testid="button-refresh-status"
        >
          <RefreshCw className={cn("w-4 h-4 mr-2", isRefetching && "animate-spin")} />
          Refresh
        </Button>
      }
    >
      {requiredMissing.length > 0 && (
        <Card className="mb-6 border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-red-800 dark:text-red-200 flex items-center gap-2">
              <XCircle className="w-5 h-5" />
              Required Configuration Missing
            </CardTitle>
            <CardDescription className="text-red-700 dark:text-red-300">
              The following required services are not configured. Some features may not work correctly.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside text-sm text-red-700 dark:text-red-300">
              {requiredMissing.map(item => (
                <li key={item.name}>{item.name}: {item.description}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Integration Status</CardTitle>
              <CardDescription>
                {isLoading ? "Checking configuration..." : `${configuredCount} of ${statusItems.length} services configured`}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoading ? (
            Array(8).fill(0).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))
          ) : (
            statusItems.map(item => (
              <StatusItem key={item.name} {...item} />
            ))
          )}
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Plan Features</CardTitle>
          <CardDescription>
            Some features require specific subscription plans
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold text-lg mb-2">Free</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>Basic invoicing</li>
                <li>Client management</li>
                <li>Time tracking</li>
                <li>Task management</li>
              </ul>
            </div>
            <div className="p-4 border rounded-lg border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20">
              <h3 className="font-semibold text-lg mb-2 text-blue-800 dark:text-blue-200">Pro</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>Everything in Free</li>
                <li>AI proposal generation</li>
                <li>GigsterCoach suggestions</li>
                <li>Email notifications</li>
                <li>Advanced analytics</li>
              </ul>
            </div>
            <div className="p-4 border rounded-lg border-purple-200 bg-purple-50 dark:border-purple-800 dark:bg-purple-900/20">
              <h3 className="font-semibold text-lg mb-2 text-purple-800 dark:text-purple-200">Enterprise</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>Everything in Pro</li>
                <li>DreamTeamHub integration</li>
                <li>SSO / SAML</li>
                <li>Custom branding</li>
                <li>Priority support</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </PageShell>
  );
}
