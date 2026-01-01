import { useQuery } from "@tanstack/react-query";
import { useLocation, Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import {
  ArrowLeft,
  Activity,
  Database,
  CreditCard,
  Mail,
  MessageSquare,
  Cloud,
  Brain,
  Server,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  Copy,
  RefreshCw,
} from "lucide-react";

interface SystemStatus {
  database: { configured: boolean; connected: boolean };
  stripe: { configured: boolean };
  sendgrid: { configured: boolean };
  twilio: { configured: boolean };
  objectStorage: { configured: boolean };
  openai: { configured: boolean };
  slack: { configured: boolean };
}

interface DiagnosticsData {
  timestamp: string;
  uptime: number;
  nodeVersion: string;
  systemStatus: SystemStatus;
  recentErrors: Array<{
    timestamp: string;
    requestId: string;
    message: string;
    path?: string;
    statusCode?: number;
  }>;
  errorStats: {
    total: number;
    last5Minutes: number;
    last15Minutes: number;
    byPath: Record<string, number>;
  };
}

function StatusIcon({ status }: { status: "ok" | "warning" | "error" | "unknown" }) {
  switch (status) {
    case "ok":
      return <CheckCircle2 className="h-5 w-5 text-green-500" />;
    case "warning":
      return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
    case "error":
      return <XCircle className="h-5 w-5 text-red-500" />;
    default:
      return <Clock className="h-5 w-5 text-gray-400" />;
  }
}

function SubsystemCard({
  title,
  icon: Icon,
  configured,
  connected,
  description,
}: {
  title: string;
  icon: typeof Database;
  configured: boolean;
  connected?: boolean;
  description: string;
}) {
  const status = !configured ? "warning" : connected === false ? "error" : "ok";
  const statusText = !configured ? "Not configured" : connected === false ? "Connection failed" : "Operational";

  return (
    <Card className="relative" data-testid={`card-subsystem-${title.toLowerCase().replace(/\s+/g, "-")}`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon className="h-5 w-5 text-[#004C6D]" />
            <CardTitle className="text-base">{title}</CardTitle>
          </div>
          <StatusIcon status={status} />
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-2">{description}</p>
        <Badge
          variant={status === "ok" ? "default" : status === "warning" ? "secondary" : "destructive"}
          className="text-xs"
        >
          {statusText}
        </Badge>
      </CardContent>
    </Card>
  );
}

export default function AdminDiagnostics() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { isAdmin, isLoading: authLoading } = useAuth();

  const { data: diagnostics, isLoading, refetch, isFetching } = useQuery<DiagnosticsData>({
    queryKey: ["/api/admin/diagnostics"],
    refetchInterval: 30000,
  });

  const copyDiagnosticBundle = () => {
    if (!diagnostics) return;

    const bundle = {
      timestamp: diagnostics.timestamp,
      uptime: `${Math.floor(diagnostics.uptime / 3600)}h ${Math.floor((diagnostics.uptime % 3600) / 60)}m`,
      nodeVersion: diagnostics.nodeVersion,
      subsystems: Object.entries(diagnostics.systemStatus).map(([name, status]) => ({
        name,
        configured: status.configured,
        connected: "connected" in status ? status.connected : "N/A",
      })),
      errorStats: diagnostics.errorStats,
      recentErrorCount: diagnostics.recentErrors.length,
    };

    navigator.clipboard.writeText(JSON.stringify(bundle, null, 2));
    toast({
      title: "Copied",
      description: "Diagnostic bundle copied to clipboard (no secrets included)",
    });
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#004C6D]"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Access Denied</CardTitle>
            <CardDescription>You don't have permission to view this page.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/">
              <Button data-testid="button-go-home">Go to Dashboard</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link href="/admin">
              <Button variant="outline" size="sm" data-testid="button-back-to-admin">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Admin
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Activity className="h-8 w-8 text-[#004C6D]" />
                System Diagnostics
              </h1>
              <p className="text-gray-600 mt-1">Monitor system health and recent errors</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => refetch()}
              disabled={isFetching}
              data-testid="button-refresh-diagnostics"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isFetching ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button onClick={copyDiagnosticBundle} disabled={!diagnostics} data-testid="button-copy-bundle">
              <Copy className="h-4 w-4 mr-2" />
              Copy Diagnostic Bundle
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#004C6D] mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading diagnostics...</p>
          </div>
        ) : diagnostics ? (
          <>
            {/* System Info */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Server className="h-5 w-5" />
                  System Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Timestamp</p>
                    <p className="font-medium">{new Date(diagnostics.timestamp).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Uptime</p>
                    <p className="font-medium">
                      {Math.floor(diagnostics.uptime / 3600)}h {Math.floor((diagnostics.uptime % 3600) / 60)}m
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Node Version</p>
                    <p className="font-medium">{diagnostics.nodeVersion}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Environment</p>
                    <p className="font-medium">{process.env.NODE_ENV || "development"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Subsystem Cards */}
            <h2 className="text-xl font-semibold mb-4">Subsystem Status</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              <SubsystemCard
                title="Database"
                icon={Database}
                configured={diagnostics.systemStatus.database.configured}
                connected={diagnostics.systemStatus.database.connected}
                description="PostgreSQL database connection"
              />
              <SubsystemCard
                title="Stripe"
                icon={CreditCard}
                configured={diagnostics.systemStatus.stripe.configured}
                description="Payment processing integration"
              />
              <SubsystemCard
                title="SendGrid"
                icon={Mail}
                configured={diagnostics.systemStatus.sendgrid.configured}
                description="Email delivery service"
              />
              <SubsystemCard
                title="Twilio"
                icon={MessageSquare}
                configured={diagnostics.systemStatus.twilio.configured}
                description="SMS messaging service"
              />
              <SubsystemCard
                title="Object Storage"
                icon={Cloud}
                configured={diagnostics.systemStatus.objectStorage.configured}
                description="File storage service"
              />
              <SubsystemCard
                title="OpenAI"
                icon={Brain}
                configured={diagnostics.systemStatus.openai.configured}
                description="AI content generation"
              />
            </div>

            <Separator className="my-6" />

            {/* Error Stats */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Error Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-3xl font-bold text-gray-900">{diagnostics.errorStats.last5Minutes}</p>
                    <p className="text-sm text-muted-foreground">Last 5 minutes</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-3xl font-bold text-gray-900">{diagnostics.errorStats.last15Minutes}</p>
                    <p className="text-sm text-muted-foreground">Last 15 minutes</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-3xl font-bold text-gray-900">{diagnostics.errorStats.total}</p>
                    <p className="text-sm text-muted-foreground">Total tracked</p>
                  </div>
                </div>

                {Object.keys(diagnostics.errorStats.byPath).length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Errors by Path</h4>
                    <div className="space-y-1">
                      {Object.entries(diagnostics.errorStats.byPath)
                        .sort(([, a], [, b]) => b - a)
                        .slice(0, 5)
                        .map(([path, count]) => (
                          <div key={path} className="flex justify-between text-sm">
                            <code className="text-xs bg-gray-100 px-2 py-1 rounded">{path}</code>
                            <Badge variant="secondary">{count}</Badge>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Errors */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Errors</CardTitle>
                <CardDescription>Last {diagnostics.recentErrors.length} errors tracked</CardDescription>
              </CardHeader>
              <CardContent>
                {diagnostics.recentErrors.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle2 className="h-12 w-12 mx-auto text-green-500 mb-2" />
                    <p>No recent errors. System is running smoothly.</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {diagnostics.recentErrors.map((error, index) => (
                      <div
                        key={`${error.requestId}-${index}`}
                        className="p-3 bg-red-50 border border-red-100 rounded-lg text-sm"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <code className="text-xs text-gray-500">{error.requestId}</code>
                          <span className="text-xs text-gray-500">
                            {new Date(error.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="font-medium text-red-800">{error.message}</p>
                        {error.path && (
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {error.path}
                            </Badge>
                            {error.statusCode && (
                              <Badge variant="destructive" className="text-xs">
                                {error.statusCode}
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <XCircle className="h-12 w-12 mx-auto text-red-500 mb-4" />
              <p className="text-gray-600">Failed to load diagnostics. Please try again.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
