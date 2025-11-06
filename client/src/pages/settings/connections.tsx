import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { CheckCircle2, XCircle, Loader2, Twitter, Linkedin, Instagram, Key, Trash2 } from "lucide-react";
import { SiX } from "react-icons/si";

type Platform = "x" | "instagram" | "linkedin";

interface PlatformCredential {
  platform: Platform;
  status: "active" | "inactive" | "error";
  lastUsed?: string;
  accountName?: string;
}

export default function ConnectionsPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<Platform>("x");

  const { data: credentials, isLoading } = useQuery<PlatformCredential[]>({
    queryKey: ["/api/platform-credentials"],
  });

  const saveMutation = useMutation({
    mutationFn: async ({ platform, credentials }: { platform: Platform; credentials: Record<string, string> }) => {
      return await apiRequest(`/api/platform-credentials/${platform}` as any, {
        method: "POST",
        body: JSON.stringify(credentials),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/platform-credentials"] });
      toast({ title: "Credentials saved successfully" });
    },
    onError: () => {
      toast({ title: "Failed to save credentials", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (platform: Platform) => {
      return await apiRequest(`/api/platform-credentials/${platform}` as any, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/platform-credentials"] });
      toast({ title: "Credentials removed successfully" });
    },
  });

  const testMutation = useMutation({
    mutationFn: async (platform: Platform) => {
      return await apiRequest(`/api/platform-credentials/${platform}/test` as any, {
        method: "POST",
      });
    },
    onSuccess: (data: any) => {
      toast({
        title: "Connection successful!",
        description: data.accountName ? `Connected as @${data.accountName}` : "Credentials verified",
      });
    },
    onError: () => {
      toast({ title: "Connection failed", description: "Please check your credentials", variant: "destructive" });
    },
  });

  const getCredentialStatus = (platform: Platform) => {
    return credentials?.find((c) => c.platform === platform);
  };

  const PlatformForm = ({ platform, fields }: { platform: Platform; fields: Array<{ name: string; label: string; type?: string; placeholder?: string }> }) => {
    const [formData, setFormData] = useState<Record<string, string>>({});
    const status = getCredentialStatus(platform);

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      saveMutation.mutate({ platform, credentials: formData });
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        {status && (
          <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/50">
            <div className="flex items-center gap-3">
              {status.status === "active" ? (
                <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-600 dark:text-red-500" />
              )}
              <div>
                <p className="font-medium">
                  {status.status === "active" ? "Connected" : "Not Connected"}
                </p>
                {status.accountName && (
                  <p className="text-sm text-muted-foreground">@{status.accountName}</p>
                )}
                {status.lastUsed && (
                  <p className="text-xs text-muted-foreground">
                    Last used: {new Date(status.lastUsed).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => testMutation.mutate(platform)}
                disabled={testMutation.isPending}
                data-testid={`button-test-${platform}`}
              >
                {testMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Test"}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => deleteMutation.mutate(platform)}
                disabled={deleteMutation.isPending}
                data-testid={`button-delete-${platform}`}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {fields.map((field) => (
          <div key={field.name} className="space-y-2">
            <Label htmlFor={`${platform}-${field.name}`}>{field.label}</Label>
            <Input
              id={`${platform}-${field.name}`}
              type={field.type || "text"}
              placeholder={field.placeholder}
              value={formData[field.name] || ""}
              onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
              required
              data-testid={`input-${platform}-${field.name}`}
            />
          </div>
        ))}

        <Button
          type="submit"
          className="w-full"
          disabled={saveMutation.isPending}
          data-testid={`button-save-${platform}`}
        >
          {saveMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Key className="mr-2 h-4 w-4" />
              Save Credentials
            </>
          )}
        </Button>
      </form>
    );
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Platform Connections</h1>
        <p className="text-muted-foreground">
          Connect your social media accounts to enable automated posting
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Social Media Platforms</CardTitle>
          <CardDescription>
            Add your API credentials to post content to your social media accounts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as Platform)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="x" className="gap-2" data-testid="tab-x">
                <SiX className="h-4 w-4" />
                X (Twitter)
              </TabsTrigger>
              <TabsTrigger value="instagram" className="gap-2" data-testid="tab-instagram">
                <Instagram className="h-4 w-4" />
                Instagram
              </TabsTrigger>
              <TabsTrigger value="linkedin" className="gap-2" data-testid="tab-linkedin">
                <Linkedin className="h-4 w-4" />
                LinkedIn
              </TabsTrigger>
            </TabsList>

            <TabsContent value="x" className="mt-6 space-y-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <SiX className="h-4 w-4" />
                  X (Twitter) API Setup
                </h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Get your API credentials from the{" "}
                  <a
                    href="https://developer.twitter.com/en/portal/dashboard"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 dark:text-blue-400 underline"
                  >
                    Twitter Developer Portal
                  </a>
                </p>
                <ol className="text-sm text-muted-foreground list-decimal list-inside space-y-1">
                  <li>Create a new app or use an existing one</li>
                  <li>Generate API Key & API Secret</li>
                  <li>Generate Access Token & Access Token Secret</li>
                  <li>Ensure your app has Read and Write permissions</li>
                </ol>
              </div>
              <PlatformForm
                platform="x"
                fields={[
                  { name: "apiKey", label: "API Key", placeholder: "Your X API Key" },
                  { name: "apiSecret", label: "API Secret", type: "password", placeholder: "Your X API Secret" },
                  { name: "accessToken", label: "Access Token", placeholder: "Your Access Token" },
                  { name: "accessSecret", label: "Access Token Secret", type: "password", placeholder: "Your Access Token Secret" },
                ]}
              />
            </TabsContent>

            <TabsContent value="instagram" className="mt-6 space-y-4">
              <div className="p-4 bg-pink-50 dark:bg-pink-950/20 rounded-lg border border-pink-200 dark:border-pink-800">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <Instagram className="h-4 w-4" />
                  Instagram Graph API Setup
                </h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Get your credentials from{" "}
                  <a
                    href="https://developers.facebook.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-pink-600 dark:text-pink-400 underline"
                  >
                    Meta for Developers
                  </a>
                </p>
                <ol className="text-sm text-muted-foreground list-decimal list-inside space-y-1">
                  <li>Create a Facebook App with Instagram Graph API</li>
                  <li>Add Instagram Business Account</li>
                  <li>Generate long-lived access token</li>
                  <li>Get your Instagram Business Account ID</li>
                </ol>
              </div>
              <PlatformForm
                platform="instagram"
                fields={[
                  { name: "accessToken", label: "Access Token", type: "password", placeholder: "Your Instagram Access Token" },
                  { name: "accountId", label: "Instagram Business Account ID", placeholder: "Your Account ID" },
                ]}
              />
            </TabsContent>

            <TabsContent value="linkedin" className="mt-6 space-y-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <Linkedin className="h-4 w-4" />
                  LinkedIn API Setup
                </h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Get your credentials from the{" "}
                  <a
                    href="https://www.linkedin.com/developers/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 dark:text-blue-400 underline"
                  >
                    LinkedIn Developer Portal
                  </a>
                </p>
                <ol className="text-sm text-muted-foreground list-decimal list-inside space-y-1">
                  <li>Create a new LinkedIn App</li>
                  <li>Add "Sign In with LinkedIn" and "Share on LinkedIn" products</li>
                  <li>Generate OAuth 2.0 credentials</li>
                  <li>Get your access token via OAuth flow</li>
                </ol>
              </div>
              <PlatformForm
                platform="linkedin"
                fields={[
                  { name: "accessToken", label: "Access Token", type: "password", placeholder: "Your LinkedIn Access Token" },
                  { name: "organizationId", label: "Organization ID (optional)", placeholder: "For company pages" },
                ]}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Security & Privacy</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>🔒 Your API credentials are encrypted at rest using industry-standard encryption</p>
          <p>🔐 Credentials are never logged or exposed in error messages</p>
          <p>🛡️ All API calls are made server-side to protect your tokens</p>
          <p>⏰ Credentials are validated on save and before each use</p>
        </CardContent>
      </Card>
    </div>
  );
}
