import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { Mail, Phone, Bell, MessageSquare, CheckCircle } from "lucide-react";
import { onboardingSchema, type OnboardingRequest } from "@shared/schema";

interface OnboardingProps {
  onComplete: () => void;
}

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [notificationEmail, setNotificationEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [emailOptIn, setEmailOptIn] = useState(true);
  const [smsOptIn, setSmsOptIn] = useState(false);
  const { toast } = useToast();

  const onboardingMutation = useMutation({
    mutationFn: async (data: OnboardingRequest) => {
      const response = await apiRequest("POST", "/api/user/onboarding", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Welcome to VSuite HQ!",
        description: "Your notification preferences have been saved.",
      });
      onComplete();
    },
    onError: (error: Error) => {
      toast({
        title: "Setup Error",
        description: error.message || "Failed to save your preferences",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const data = onboardingSchema.parse({
        notificationEmail: notificationEmail.trim(),
        phone: phone.trim() || undefined,
        emailOptIn,
        smsOptIn: smsOptIn && phone.trim() !== "", // Only enable SMS if phone is provided
      });
      
      onboardingMutation.mutate(data);
    } catch (error: any) {
      toast({
        title: "Validation Error",
        description: error.errors?.[0]?.message || "Please check your input",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Bell className="w-6 h-6 text-primary" />
          </div>
          <div className="space-y-2">
            <CardTitle className="text-2xl font-black text-black">VSuite HQ</CardTitle>
            <p className="text-xs text-black font-medium">Simplified Workflow Hub</p>
            <p className="text-gray-600 pt-2">
              Set up your notification preferences to stay on top of your tasks
            </p>
          </div>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center text-sm font-medium">
                <Mail className="w-4 h-4 mr-2" />
                Email for Notifications *
              </Label>
              <Input
                id="email"
                type="email"
                value={notificationEmail}
                onChange={(e) => setNotificationEmail(e.target.value)}
                placeholder="your.email@example.com"
                required
                className="w-full"
              />
              <p className="text-xs text-gray-500">
                You'll receive notifications for high priority tasks assigned to you
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="flex items-center text-sm font-medium">
                <Phone className="w-4 h-4 mr-2" />
                Phone Number (Optional)
              </Label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 123-4567"
                className="w-full"
              />
              <p className="text-xs text-gray-500">
                Required for SMS notifications
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-900">Notification Preferences</h3>
              
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="email-opt-in"
                  checked={emailOptIn}
                  onCheckedChange={(checked) => setEmailOptIn(checked === true)}
                />
                <div className="flex-1">
                  <Label 
                    htmlFor="email-opt-in" 
                    className="text-sm flex items-center cursor-pointer"
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Email Notifications
                  </Label>
                  <p className="text-xs text-gray-500">
                    Get email alerts for high priority tasks
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Checkbox
                  id="sms-opt-in"
                  checked={smsOptIn && phone.trim() !== ""}
                  onCheckedChange={(checked) => setSmsOptIn(checked === true)}
                  disabled={phone.trim() === ""}
                />
                <div className="flex-1">
                  <Label 
                    htmlFor="sms-opt-in" 
                    className={`text-sm flex items-center cursor-pointer ${
                      phone.trim() === "" ? "text-gray-400" : ""
                    }`}
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    SMS Notifications
                  </Label>
                  <p className="text-xs text-gray-500">
                    {phone.trim() === "" 
                      ? "Enter a phone number to enable SMS notifications"
                      : "Get text message alerts for urgent tasks"
                    }
                  </p>
                </div>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={onboardingMutation.isPending || !notificationEmail.trim()}
            >
              {onboardingMutation.isPending ? (
                "Setting up..."
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Complete Setup
                </>
              )}
            </Button>

            <p className="text-xs text-gray-500 text-center">
              You can change these preferences later in your account settings
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}