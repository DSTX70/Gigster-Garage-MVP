import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle, 
  Bell, 
  Users, 
  Calendar, 
  Mail, 
  Smartphone, 
  BarChart3, 
  Shield,
  ArrowRight,
  Star,
  Clock,
  Target
} from "lucide-react";
import { Link } from "wouter";

export default function Landing() {
  const [activeFeature, setActiveFeature] = useState(0);

  const features = [
    {
      icon: <Bell className="h-6 w-6" />,
      title: "Smart Reminders",
      description: "24-hour and 1-hour advance notifications keep you on track",
      color: "text-yellow-600"
    },
    {
      icon: <Mail className="h-6 w-6" />,
      title: "Email & SMS Alerts",
      description: "High-priority tasks trigger automatic notifications",
      color: "text-blue-600"
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "Team Collaboration",
      description: "Multi-user support with admin controls and task assignment",
      color: "text-green-600"
    },
    {
      icon: <BarChart3 className="h-6 w-6" />,
      title: "Progress Tracking",
      description: "Add comments and track progress with detailed timestamps",
      color: "text-purple-600"
    },
    {
      icon: <Target className="h-6 w-6" />,
      title: "Project Organization",
      description: "Group tasks by projects for better workflow management",
      color: "text-red-600"
    },
    {
      icon: <Clock className="h-6 w-6" />,
      title: "Time Management",
      description: "Due dates with precise time tracking and status indicators",
      color: "text-indigo-600"
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-white py-20">
        <div className="max-w-6xl mx-auto px-4 text-center">
          {/* Logo and Branding */}
          <div className="flex justify-center mb-6">
            <div className="bg-blue-600 p-4 rounded-2xl shadow-lg">
              <img 
                src="@assets/IMG_3649_1755004491378.jpeg" 
                alt="VSuite HQ Logo"
                className="w-12 h-12 object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  target.nextElementSibling?.classList.remove('hidden');
                }}
              />
              <Shield className="text-white hidden" size={48} />
            </div>
          </div>
          
          <h1 className="text-5xl font-black text-black mb-4">
            VSuite HQ
          </h1>
          
          <p className="text-xl font-medium text-black mb-8">
            Simplified Workflow Hub
          </p>
          
          <p className="text-lg text-gray-600 mb-10 max-w-2xl mx-auto">
            Transform your productivity with intelligent task management, 
            smart notifications, and seamless team collaboration.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/signup">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3">
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            
            <Link href="/login">
              <Button variant="outline" size="lg" className="px-8 py-3">
                Sign In
              </Button>
            </Link>
          </div>
          
          <div className="mt-8 text-sm text-gray-500">
            <div className="flex items-center justify-center gap-4">
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                <span>Free to start</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                <span>Team collaboration</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-black mb-4">
              Everything you need to stay organized
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              VSuite HQ combines powerful task management with intelligent automation 
              to keep you and your team focused on what matters most.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card 
                key={index}
                className="border-2 border-gray-200 hover:border-blue-300 transition-colors cursor-pointer"
                onClick={() => setActiveFeature(index)}
              >
                <CardHeader>
                  <div className={`${feature.color} mb-4`}>
                    {feature.icon}
                  </div>
                  <CardTitle className="text-lg font-semibold">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-black mb-8">
            Try it now with our demo account
          </h2>
          
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-8">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div className="text-left">
                  <h3 className="text-xl font-semibold mb-4">Admin Demo Access</h3>
                  <p className="text-gray-600 mb-6">
                    Experience the full power of VSuite HQ with admin privileges. 
                    Create tasks, manage users, and explore all features.
                  </p>
                  
                  <div className="space-y-2 mb-6">
                    <div className="flex items-center">
                      <Badge variant="secondary" className="mr-2">Username</Badge>
                      <code className="bg-white px-2 py-1 rounded">admin</code>
                    </div>
                    <div className="flex items-center">
                      <Badge variant="secondary" className="mr-2">Password</Badge>
                      <code className="bg-white px-2 py-1 rounded">admin123</code>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    <span>Full admin dashboard access</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    <span>User management capabilities</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    <span>All notification features</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    <span>Task assignment and tracking</span>
                  </div>
                  
                  <Link href="/login">
                    <Button className="w-full mt-4">
                      Try Demo Now
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-black text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to simplify your workflow?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Join teams who trust VSuite HQ to keep their projects on track.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 px-8 py-3">
                Create Your Account
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            
            <Link href="/login">
              <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-black px-8 py-3">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-gray-50 border-t">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <div className="bg-blue-600 p-2 rounded-lg mr-3">
                <img 
                  src="@assets/IMG_3649_1755004491378.jpeg" 
                  alt="VSuite HQ Logo"
                  className="w-6 h-6 object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    target.nextElementSibling?.classList.remove('hidden');
                  }}
                />
                <Shield className="text-white hidden" size={24} />
              </div>
              <div>
                <h3 className="font-bold text-black">VSuite HQ</h3>
                <p className="text-sm text-gray-600">Simplified Workflow Hub</p>
              </div>
            </div>
            
            <div className="text-sm text-gray-500">
              © {new Date().getFullYear()} VSuite HQ. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}