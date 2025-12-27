import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { AppHeader } from "@/components/app-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  User,
  Bell,
  Palette,
  Key,
  Download,
  Trash2,
  Mail,
  Smartphone,
  Globe,
  Shield,
  Database,
  Zap,
  Save,
  AlertCircle,
  Check,
  Info,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function Settings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t, language: contextLanguage, setLanguage: setContextLanguage } = useTranslation();
  const [activeTab, setActiveTab] = useState("account");

  // Fetch app version info with long stale time (15 minutes)
  const { data: healthInfo } = useQuery<{
    ok: boolean;
    service: string;
    version: string;
    build: { sha: string | null; time: string | null };
    uptimeSeconds: number;
    timestamp: string;
  }>({
    queryKey: ['/api/health'],
    staleTime: 15 * 60 * 1000, // 15 minutes
    refetchOnWindowFocus: false,
  });

  // Preferences state - load from localStorage with defaults
  const [emailNotifications, setEmailNotifications] = useState(() => {
    const saved = localStorage.getItem("pref_emailNotifications");
    return saved !== null ? saved === "true" : true;
  });
  const [smsNotifications, setSmsNotifications] = useState(() => {
    const saved = localStorage.getItem("pref_smsNotifications");
    return saved !== null ? saved === "true" : false;
  });
  const [taskReminders, setTaskReminders] = useState(() => {
    const saved = localStorage.getItem("pref_taskReminders");
    return saved !== null ? saved === "true" : true;
  });
  const [invoiceAlerts, setInvoiceAlerts] = useState(() => {
    const saved = localStorage.getItem("pref_invoiceAlerts");
    return saved !== null ? saved === "true" : true;
  });
  const [weeklyDigest, setWeeklyDigest] = useState(() => {
    const saved = localStorage.getItem("pref_weeklyDigest");
    return saved !== null ? saved === "true" : true;
  });
  const [quietHoursStart, setQuietHoursStart] = useState(() => {
    return localStorage.getItem("pref_quietHoursStart") || "22:00";
  });
  const [quietHoursEnd, setQuietHoursEnd] = useState(() => {
    return localStorage.getItem("pref_quietHoursEnd") || "08:00";
  });
  const [timezone, setTimezone] = useState(() => {
    return localStorage.getItem("pref_timezone") || "America/New_York";
  });
  const [dateFormat, setDateFormat] = useState(() => {
    return localStorage.getItem("pref_dateFormat") || "MM/DD/YYYY";
  });
  const [timeFormat, setTimeFormat] = useState(() => {
    return localStorage.getItem("pref_timeFormat") || "12h";
  });
  const [language, setLanguageLocal] = useState(contextLanguage);
  
  // Update language immediately when changed (not just on save)
  const setLanguage = (newLang: string) => {
    setLanguageLocal(newLang);
    setContextLanguage(newLang); // Update context immediately so UI changes
  };

  // Account settings
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Update password mutation
  const updatePasswordMutation = useMutation({
    mutationFn: async (data: { currentPassword: string; newPassword: string }) => {
      return apiRequest("POST", "/api/user/update-password", data);
    },
    onSuccess: () => {
      toast({
        title: "Password updated",
        description: "Your password has been changed successfully",
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update password",
        variant: "destructive",
      });
    },
  });

  // Save preferences mutation
  const savePreferencesMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("POST", "/api/user/preferences", data);
    },
    onSuccess: () => {
      toast({
        title: "Preferences saved",
        description: "Your preferences have been updated",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to save preferences",
        variant: "destructive",
      });
    },
  });

  // Export data mutation
  const exportDataMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/user/export-data");
    },
    onSuccess: (data: any) => {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `gigster-garage-export-${new Date().toISOString()}.json`;
      a.click();
      toast({
        title: "Data exported",
        description: "Your data has been downloaded successfully",
      });
    },
  });

  const handlePasswordUpdate = () => {
    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }
    if (newPassword.length < 8) {
      toast({
        title: "Error",
        description: "Password must be at least 8 characters",
        variant: "destructive",
      });
      return;
    }
    updatePasswordMutation.mutate({ currentPassword, newPassword });
  };

  const handleSavePreferences = () => {
    // Save to localStorage for persistence
    localStorage.setItem("pref_emailNotifications", String(emailNotifications));
    localStorage.setItem("pref_smsNotifications", String(smsNotifications));
    localStorage.setItem("pref_taskReminders", String(taskReminders));
    localStorage.setItem("pref_invoiceAlerts", String(invoiceAlerts));
    localStorage.setItem("pref_weeklyDigest", String(weeklyDigest));
    localStorage.setItem("pref_quietHoursStart", quietHoursStart);
    localStorage.setItem("pref_quietHoursEnd", quietHoursEnd);
    localStorage.setItem("pref_timezone", timezone);
    localStorage.setItem("pref_dateFormat", dateFormat);
    localStorage.setItem("pref_timeFormat", timeFormat);
    
    // Update language in context (this also saves to localStorage)
    setContextLanguage(language);
    
    // Also save to backend
    savePreferencesMutation.mutate({
      emailNotifications,
      smsNotifications,
      taskReminders,
      invoiceAlerts,
      weeklyDigest,
      quietHoursStart,
      quietHoursEnd,
      timezone,
      dateFormat,
      timeFormat,
      language,
    });
  };

  return (
    <div className="min-h-screen" style={{ background: "var(--bg)" }}>
      <AppHeader />
      
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold" style={{ color: "var(--text)" }}>Settings</h1>
          <p className="text-gray-600 mt-2">Manage your account settings and preferences</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-grid">
            <TabsTrigger value="account" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Account</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              <span className="hidden sm:inline">Notifications</span>
            </TabsTrigger>
            <TabsTrigger value="appearance" className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              <span className="hidden sm:inline">Appearance</span>
            </TabsTrigger>
            <TabsTrigger value="integrations" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              <span className="hidden sm:inline">Integrations</span>
            </TabsTrigger>
            <TabsTrigger value="data" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              <span className="hidden sm:inline">Data</span>
            </TabsTrigger>
          </TabsList>

          {/* Account Tab */}
          <TabsContent value="account" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Update your account details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={user?.username || ""}
                    disabled
                    className="bg-gray-50"
                  />
                  <p className="text-sm text-gray-500">Username cannot be changed</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name">Display Name</Label>
                  <Input
                    id="name"
                    value={user?.name || ""}
                    disabled
                    className="bg-gray-50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={user?.email || "N/A"}
                    disabled
                    className="bg-gray-50"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Change Password</CardTitle>
                <CardDescription>Update your password to keep your account secure</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current-password">Current Password</Label>
                  <Input
                    id="current-password"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <Input
                    id="new-password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password (min. 8 characters)"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                  />
                </div>

                <Button
                  onClick={handlePasswordUpdate}
                  disabled={updatePasswordMutation.isPending || !currentPassword || !newPassword}
                  className="w-full sm:w-auto"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Update Password
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Email Notifications</CardTitle>
                <CardDescription>Configure when you receive email notifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="email-notif">Email Notifications</Label>
                    <p className="text-sm text-gray-500">Receive notifications via email</p>
                  </div>
                  <Switch
                    id="email-notif"
                    checked={emailNotifications}
                    onCheckedChange={setEmailNotifications}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="task-reminders">Task Reminders</Label>
                    <p className="text-sm text-gray-500">Get reminders for upcoming tasks</p>
                  </div>
                  <Switch
                    id="task-reminders"
                    checked={taskReminders}
                    onCheckedChange={setTaskReminders}
                    disabled={!emailNotifications}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="invoice-alerts">Invoice Alerts</Label>
                    <p className="text-sm text-gray-500">Notifications for invoice payments</p>
                  </div>
                  <Switch
                    id="invoice-alerts"
                    checked={invoiceAlerts}
                    onCheckedChange={setInvoiceAlerts}
                    disabled={!emailNotifications}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="weekly-digest">Weekly Digest</Label>
                    <p className="text-sm text-gray-500">Summary of your week every Monday</p>
                  </div>
                  <Switch
                    id="weekly-digest"
                    checked={weeklyDigest}
                    onCheckedChange={setWeeklyDigest}
                    disabled={!emailNotifications}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>SMS Notifications</CardTitle>
                <CardDescription>Receive text messages for urgent alerts</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    SMS notifications require Twilio configuration. Contact your administrator.
                  </AlertDescription>
                </Alert>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="sms-notif">SMS Notifications</Label>
                    <p className="text-sm text-gray-500">Receive text messages for high-priority tasks</p>
                  </div>
                  <Switch
                    id="sms-notif"
                    checked={smsNotifications}
                    onCheckedChange={setSmsNotifications}
                    disabled
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quiet Hours</CardTitle>
                <CardDescription>Set hours when you don't want to be disturbed</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="quiet-start">Start Time</Label>
                    <Input
                      id="quiet-start"
                      type="time"
                      value={quietHoursStart}
                      onChange={(e) => setQuietHoursStart(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="quiet-end">End Time</Label>
                    <Input
                      id="quiet-end"
                      type="time"
                      value={quietHoursEnd}
                      onChange={(e) => setQuietHoursEnd(e.target.value)}
                    />
                  </div>
                </div>
                <p className="text-sm text-gray-500">
                  You won't receive notifications between these hours
                </p>
              </CardContent>
            </Card>

            <Button onClick={handleSavePreferences} disabled={savePreferencesMutation.isPending}>
              <Save className="h-4 w-4 mr-2" />
              Save Notification Preferences
            </Button>
          </TabsContent>

          {/* Appearance Tab */}
          <TabsContent value="appearance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Display Settings</CardTitle>
                <CardDescription>Customize how information is displayed</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select value={timezone} onValueChange={setTimezone}>
                    <SelectTrigger id="timezone">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                      <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                      <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
                      <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                      <SelectItem value="Europe/London">London (GMT)</SelectItem>
                      <SelectItem value="Europe/Paris">Paris (CET)</SelectItem>
                      <SelectItem value="Asia/Tokyo">Tokyo (JST)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date-format">Date Format</Label>
                  <Select value={dateFormat} onValueChange={setDateFormat}>
                    <SelectTrigger id="date-format">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MM/DD/YYYY">MM/DD/YYYY (12/31/2025)</SelectItem>
                      <SelectItem value="DD/MM/YYYY">DD/MM/YYYY (31/12/2025)</SelectItem>
                      <SelectItem value="YYYY-MM-DD">YYYY-MM-DD (2025-12-31)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="time-format">Time Format</Label>
                  <Select value={timeFormat} onValueChange={setTimeFormat}>
                    <SelectTrigger id="time-format">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="12h">12-hour (3:00 PM)</SelectItem>
                      <SelectItem value="24h">24-hour (15:00)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="language">Language</Label>
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger id="language" data-testid="select-language">
                      <Globe className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
                      <SelectItem value="ja">日本語 (Japanese)</SelectItem>
                      <SelectItem value="es">Español (Spanish)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-gray-500">
                    Choose your preferred display language
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Theme</CardTitle>
                <CardDescription>Choose your color scheme</CardDescription>
              </CardHeader>
              <CardContent>
                <Alert>
                  <Palette className="h-4 w-4" />
                  <AlertDescription>
                    Use the Mood Palette switcher in the header to change your color scheme
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            <Button onClick={handleSavePreferences} disabled={savePreferencesMutation.isPending}>
              <Save className="h-4 w-4 mr-2" />
              Save Appearance Preferences
            </Button>
          </TabsContent>

          {/* Integrations Tab */}
          <TabsContent value="integrations" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Connected Services</CardTitle>
                <CardDescription>Manage your third-party integrations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Mail className="h-8 w-8 text-orange-500" />
                    <div>
                      <h4 className="font-medium">SendGrid</h4>
                      <p className="text-sm text-gray-500">Email delivery service</p>
                    </div>
                  </div>
                  <Badge variant="secondary">Not Configured</Badge>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Smartphone className="h-8 w-8 text-blue-500" />
                    <div>
                      <h4 className="font-medium">Twilio</h4>
                      <p className="text-sm text-gray-500">SMS notifications</p>
                    </div>
                  </div>
                  <Badge variant="secondary">Not Configured</Badge>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Zap className="h-8 w-8 text-purple-500" />
                    <div>
                      <h4 className="font-medium">Slack</h4>
                      <p className="text-sm text-gray-500">Team communication</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">Connect</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Data Tab */}
          <TabsContent value="data" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Export Your Data</CardTitle>
                <CardDescription>Download a copy of your account data</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600">
                  Download all your tasks, projects, clients, invoices, and other data in JSON format.
                </p>
                <Button
                  onClick={() => exportDataMutation.mutate()}
                  disabled={exportDataMutation.isPending}
                  variant="outline"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export Data
                </Button>
              </CardContent>
            </Card>

            <Card className="border-red-200">
              <CardHeader>
                <CardTitle className="text-red-600">Danger Zone</CardTitle>
                <CardDescription>Irreversible and destructive actions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    These actions cannot be undone. Please proceed with caution.
                  </AlertDescription>
                </Alert>

                <div className="space-y-2">
                  <h4 className="font-medium">Delete Account</h4>
                  <p className="text-sm text-gray-600">
                    Permanently delete your account and all associated data.
                  </p>
                  <Button variant="destructive" disabled>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Account
                  </Button>
                  <p className="text-xs text-gray-500">
                    Contact your administrator to delete your account
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Version Info Footer */}
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <Info className="h-4 w-4" />
            <span data-testid="text-app-version">
              {healthInfo?.service || "GigsterGarage"} v{healthInfo?.version || "..."}
            </span>
            {healthInfo?.build?.sha && (
              <span className="text-xs text-gray-400 dark:text-gray-500">
                ({healthInfo.build.sha.slice(0, 7)})
              </span>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
