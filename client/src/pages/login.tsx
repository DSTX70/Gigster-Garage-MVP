import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { LogIn, Shield } from "lucide-react";
import { Link } from "wouter";
import { VSuiteLogo } from "@/components/vsuite-logo";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { toast } = useToast();

  const loginMutation = useMutation({
    mutationFn: async (credentials: { username: string; password: string }) => {
      const response = await apiRequest("POST", "/api/login", credentials);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Login successful",
        description: "Welcome to VSuite HQ",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      toast({
        title: "Missing information",
        description: "Please enter both username and password",
        variant: "destructive",
      });
      return;
    }
    loginMutation.mutate({ username: username.trim(), password });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="vsuite-card w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-6">
            <VSuiteLogo size="medium" showText={false} />
          </div>
          <div className="space-y-1">
            <CardTitle className="text-2xl brand-heading">VSuite HQ</CardTitle>
            <p className="text-xs brand-tagline">Simplified Workflow Hub</p>
            <p className="text-gray-600 pt-2">Sign in to your account</p>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                Username
              </Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                className="w-full"
                required
              />
            </div>
            <div>
              <Label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full"
                required
              />
            </div>
            <Button
              type="submit"
              className="vsuite-button-primary w-full"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? (
                "Signing in..."
              ) : (
                <>
                  <LogIn size={16} className="mr-2" />
                  Sign In
                </>
              )}
            </Button>
          </form>
          
          <div className="mt-6 text-center text-sm text-gray-600 space-y-3">
            <p>
              Don't have an account?{" "}
              <Link href="/signup" className="text-blue-600 hover:underline">
                Create one here
              </Link>
            </p>
            
            <div className="border-t pt-3">
              <p>Admin Demo Account:</p>
              <p>Username: <code className="bg-gray-100 px-1 rounded">admin</code></p>
              <p>Password: <code className="bg-gray-100 px-1 rounded">admin123</code></p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}