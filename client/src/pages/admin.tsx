import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAdminDiagnosticsCapture } from "@/hooks/useAdminDiagnosticsCapture";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { Plus, Trash2, Users, UserPlus, ArrowLeft, CheckCheck, ExternalLink, Search, FileText, Activity } from "lucide-react";

const GITHUB_WEBSITE_AUDIT_URL =
  "https://github.com/DSTX70/Gigster-Garage-MVP/actions/workflows/website-audit.yml";

const GITHUB_WEBSITE_AUDIT_RUNS_MAIN_URL =
  "https://github.com/DSTX70/Gigster-Garage-MVP/actions/workflows/website-audit.yml?query=branch%3Amain";
import type { User } from "@shared/schema";
import { useLocation } from "wouter";

const DTH_LS_KEY = "gg:DreamTeamHubBaseUrl";

function normalizeUrl(u: string) {
  return (u || "").trim().replace(/\/+$/, "");
}

function DreamTeamHubPanel() {
  const [dthBaseUrl, setDthBaseUrl] = useState<string>(() => {
    try {
      return localStorage.getItem(DTH_LS_KEY) || "";
    } catch {
      return "";
    }
  });

  const base = normalizeUrl(dthBaseUrl);
  const workItemsUrl = base ? `${base}/work-items` : "";
  const ggConnectorUrl = base ? `${base}/connectors/gigsterGarage` : "";

  function save() {
    try {
      localStorage.setItem(DTH_LS_KEY, base);
    } catch {}
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ExternalLink size={20} />
          DreamTeamHub
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-xs opacity-70 mb-3">
          Store the published DTH URL once, then jump to Work Items / GG Connector fast.
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <input
            className="min-w-[320px] rounded border px-2 py-1 text-sm"
            placeholder="https://your-dth-app.replit.app"
            value={dthBaseUrl}
            onChange={(e) => setDthBaseUrl(e.target.value)}
            data-testid="input-dth-url"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={save}
            disabled={!base}
            title={!base ? "Enter a published DreamTeamHub URL first" : "Save URL to this browser"}
            data-testid="button-save-dth-url"
          >
            Save
          </Button>
          <a
            href={workItemsUrl || "#"}
            target="_blank"
            rel="noreferrer"
            aria-disabled={!workItemsUrl}
            title={!workItemsUrl ? "Set URL first" : "Open DreamTeamHub Work Items"}
            className={`inline-flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium ${!workItemsUrl ? 'opacity-50 pointer-events-none' : ''}`}
            data-testid="link-dth-work-items"
          >
            Open Work Items
          </a>
          <a
            href={ggConnectorUrl || "#"}
            target="_blank"
            rel="noreferrer"
            aria-disabled={!ggConnectorUrl}
            title={!ggConnectorUrl ? "Set URL first" : "Open DTH GG Connector cockpit"}
            className={`inline-flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium ${!ggConnectorUrl ? 'opacity-50 pointer-events-none' : ''}`}
            data-testid="link-dth-gg-connector"
          >
            Open GG Connector
          </a>
        </div>
        {base && (
          <div className="mt-2 text-xs opacity-80">
            Using: <code>{base}</code>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function Admin() {
  useAdminDiagnosticsCapture();
  const [, navigate] = useLocation();
  const [showAddUser, setShowAddUser] = useState(false);
  const [newUser, setNewUser] = useState({
    username: "",
    password: "",
    name: "",
    email: "",
    role: "user" as "admin" | "user"
  });
  const { toast } = useToast();

  const { data: users = [], isLoading } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  const createUserMutation = useMutation({
    mutationFn: async (userData: typeof newUser) => {
      const response = await apiRequest("POST", "/api/users", userData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      setNewUser({ username: "", password: "", name: "", email: "", role: "user" });
      setShowAddUser(false);
      toast({
        title: "User created",
        description: "New user has been added successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      await apiRequest("DELETE", `/api/users/${userId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({
        title: "User deleted",
        description: "User has been removed successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.username.trim() || !newUser.password.trim() || !newUser.name.trim()) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    createUserMutation.mutate(newUser);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              onClick={() => navigate("/")}
              className="flex items-center"
            >
              <ArrowLeft size={16} className="mr-2" />
              Back to Tasks
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Users className="mr-3" size={32} />
                User Management
              </h1>
              <p className="text-gray-600 mt-1">Manage user accounts and permissions</p>
            </div>
          </div>
          <Button
            onClick={() => setShowAddUser(!showAddUser)}
            className="flex items-center"
          >
            <UserPlus size={16} className="mr-2" />
            Add User
          </Button>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ExternalLink size={20} />
              Quick Links
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3 flex-wrap">
              <Button
                variant="outline"
                onClick={() => navigate("/admin/diagnostics")}
                className="inline-flex items-center gap-2"
                data-testid="link-diagnostics"
              >
                <Activity size={16} />
                System Diagnostics
              </Button>
              <a
                href={GITHUB_WEBSITE_AUDIT_URL}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                data-testid="link-website-audit"
              >
                <Search size={16} />
                Website Audit (Lighthouse + a11y)
              </a>
              <a
                href={GITHUB_WEBSITE_AUDIT_RUNS_MAIN_URL}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                data-testid="link-audit-runs"
              >
                <FileText size={16} />
                Audit Runs (main)
              </a>
            </div>
          </CardContent>
        </Card>

        <DreamTeamHubPanel />

        {showAddUser && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Create New User</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateUser} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="username">Username *</Label>
                  <Input
                    id="username"
                    value={newUser.username}
                    onChange={(e) => setNewUser(prev => ({ ...prev, username: e.target.value }))}
                    placeholder="Enter username"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="password">Password *</Label>
                  <Input
                    id="password"
                    type="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="Enter password"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    value={newUser.name}
                    onChange={(e) => setNewUser(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter full name"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="Enter email address"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="role">Role</Label>
                  <Select
                    value={newUser.role}
                    onValueChange={(value: "admin" | "user") => 
                      setNewUser(prev => ({ ...prev, role: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="md:col-span-2 flex gap-2">
                  <Button
                    type="submit"
                    disabled={createUserMutation.isPending}
                  >
                    {createUserMutation.isPending ? "Creating..." : "Create User"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowAddUser(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Existing Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3">Username</th>
                    <th className="text-left p-3">Name</th>
                    <th className="text-left p-3">Email</th>
                    <th className="text-left p-3">Role</th>
                    <th className="text-left p-3">Created</th>
                    <th className="text-left p-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={`admin-table-${user.id}`} className="border-b">
                      <td className="p-3 font-medium">{user.username}</td>
                      <td className="p-3">{user.name}</td>
                      <td className="p-3">{user.email || "-"}</td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          user.role === 'admin' 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="p-3">
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-'}
                      </td>
                      <td className="p-3">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => deleteUserMutation.mutate(user.id)}
                          disabled={deleteUserMutation.isPending}
                        >
                          <Trash2 size={14} />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}