import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart3, 
  CheckCircle2, 
  Timer, 
  Folder, 
  Settings,
  User,
  Bell,
  Zap
} from "lucide-react";

export default function MobileHome() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#004C6D] to-[#0B1D3A]">
      {/* Header */}
      <div className="bg-[#004C6D] px-4 py-6 shadow-lg">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-2">
            🚀 Gigster Garage
          </h1>
          <p className="text-blue-100">Smarter tools for bolder dreams</p>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Quick Access */}
        <Card className="bg-white/95 backdrop-blur border-0 shadow-lg" data-testid="card-quick-access">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-[#004C6D]">
              <Zap className="h-5 w-5 mr-2" />
              Quick Access
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <Link href="/mobile/dashboard">
                <Button
                  variant="outline"
                  className="w-full h-24 flex-col space-y-2 text-[#004C6D] border-[#004C6D]/20 hover:bg-[#004C6D]/5"
                  data-testid="button-dashboard"
                >
                  <BarChart3 className="h-8 w-8" />
                  <span className="text-sm font-medium">Dashboard</span>
                </Button>
              </Link>
              
              <Link href="/mobile/tasks">
                <Button
                  variant="outline"
                  className="w-full h-24 flex-col space-y-2 text-[#004C6D] border-[#004C6D]/20 hover:bg-[#004C6D]/5"
                  data-testid="button-tasks"
                >
                  <CheckCircle2 className="h-8 w-8" />
                  <span className="text-sm font-medium">Tasks</span>
                </Button>
              </Link>
              
              <Link href="/mobile/time-tracking">
                <Button
                  variant="outline"
                  className="w-full h-24 flex-col space-y-2 text-[#004C6D] border-[#004C6D]/20 hover:bg-[#004C6D]/5"
                  data-testid="button-time-tracking"
                >
                  <Timer className="h-8 w-8" />
                  <span className="text-sm font-medium">Time Tracking</span>
                </Button>
              </Link>
              
              <Link href="/mobile/projects">
                <Button
                  variant="outline"
                  className="w-full h-24 flex-col space-y-2 text-[#004C6D] border-[#004C6D]/20 hover:bg-[#004C6D]/5"
                  data-testid="button-projects"
                >
                  <Folder className="h-8 w-8" />
                  <span className="text-sm font-medium">Projects</span>
                </Button>
              </Link>
            </div>
            
            <div className="grid grid-cols-1 gap-4 mt-4">
              <Link href="/mobile/workflows">
                <Button
                  variant="outline"
                  className="w-full h-20 flex items-center space-x-3 text-[#004C6D] border-[#004C6D]/20 hover:bg-[#004C6D]/5"
                  data-testid="button-workflows"
                >
                  <Zap className="h-6 w-6" />
                  <div className="text-left">
                    <div className="text-sm font-medium">Workflows & Automation</div>
                    <div className="text-xs text-gray-600">Manage automation rules</div>
                  </div>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Features */}
        <Card className="bg-white/95 backdrop-blur border-0 shadow-lg" data-testid="card-features">
          <CardHeader className="pb-3">
            <CardTitle className="text-[#004C6D]">Mobile Features</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                <span className="text-sm font-medium text-green-800">Offline Mode</span>
              </div>
              <Badge variant="secondary" className="bg-green-100 text-green-800">Active</Badge>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                <span className="text-sm font-medium text-blue-800">Push Notifications</span>
              </div>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">Enabled</Badge>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                <span className="text-sm font-medium text-purple-800">Background Sync</span>
              </div>
              <Badge variant="secondary" className="bg-purple-100 text-purple-800">Running</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Account Actions */}
        <Card className="bg-white/95 backdrop-blur border-0 shadow-lg" data-testid="card-account">
          <CardHeader className="pb-3">
            <CardTitle className="text-[#004C6D]">Account</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start text-[#004C6D] border-[#004C6D]/20 hover:bg-[#004C6D]/5"
                data-testid="button-profile"
              >
                <User className="h-4 w-4 mr-2" />
                Profile Settings
              </Button>
              
              <Button
                variant="outline"
                className="w-full justify-start text-[#004C6D] border-[#004C6D]/20 hover:bg-[#004C6D]/5"
                data-testid="button-notifications"
              >
                <Bell className="h-4 w-4 mr-2" />
                Notifications
              </Button>
              
              <Button
                variant="outline"
                className="w-full justify-start text-[#004C6D] border-[#004C6D]/20 hover:bg-[#004C6D]/5"
                data-testid="button-settings"
              >
                <Settings className="h-4 w-4 mr-2" />
                App Settings
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Switch to Desktop */}
        <Card className="bg-white/95 backdrop-blur border-0 shadow-lg" data-testid="card-switch-desktop">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-3">
                Need more features?
              </p>
              <a 
                href="/"
                className="inline-block bg-[#004C6D] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#003A52] transition-colors"
                data-testid="link-desktop-version"
              >
                🖥️ Switch to Desktop Version
              </a>
            </div>
          </CardContent>
        </Card>

        {/* Add bottom padding */}
        <div className="h-8"></div>
      </div>
    </div>
  );
}