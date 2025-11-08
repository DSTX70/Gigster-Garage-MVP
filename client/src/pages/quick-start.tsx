import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation } from "wouter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Rocket, CheckCircle2 } from "lucide-react";

const quickStartSchema = z.object({
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2, "Last name is required"),
  companyName: z.string().min(2, "Company name is required"),
  entityType: z.string().min(1, "Entity type is required"),
  businessType: z.string().min(2, "Business type is required"),
  productsServices: z.string().min(10, "Please describe your products/services (at least 10 characters)"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
});

type QuickStartData = z.infer<typeof quickStartSchema>;

export default function QuickStartPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<QuickStartData>({
    resolver: zodResolver(quickStartSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      companyName: "",
      entityType: "",
      businessType: "",
      productsServices: "",
      city: "",
      state: "",
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: async (data: QuickStartData) => {
      await apiRequest("PATCH", "/api/user/profile", data);
      return apiRequest("POST", "/api/user/complete-onboarding", {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Welcome to Gigster Garage!",
        description: "You're all set. Let's start building!",
      });
      navigate("/");
    },
    onError: (error: Error) => {
      toast({
        title: "Setup Error",
        description: error.message || "Failed to complete setup",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: QuickStartData) => {
    updateUserMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#004C6D] via-[#0B1D3A] to-black dark:from-[#0B1D3A] dark:via-black dark:to-black flex items-center justify-center p-4">
      <Card className="w-full max-w-3xl" data-testid="card-quick-start">
        <CardHeader>
          <div className="flex items-center gap-3 mb-4">
            <div className="h-12 w-12 bg-[#004C6D]/10 dark:bg-[#4DA8DA]/10 rounded-full flex items-center justify-center">
              <Rocket className="h-6 w-6 text-[#004C6D] dark:text-[#4DA8DA]" />
            </div>
            <div>
              <CardTitle className="text-2xl">Quick Start - Get Up & Running in 3 Minutes</CardTitle>
              <CardDescription>Tell us about your business and we'll personalize your experience</CardDescription>
            </div>
          </div>
          <Progress value={50} className="h-2" />
        </CardHeader>
        
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John" {...field} data-testid="input-first-name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Doe" {...field} data-testid="input-last-name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="companyName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Acme Inc." {...field} data-testid="input-company-name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="entityType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Entity Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-entity-type">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="sole-proprietorship">Sole Proprietorship</SelectItem>
                          <SelectItem value="llc">LLC</SelectItem>
                          <SelectItem value="corporation">Corporation</SelectItem>
                          <SelectItem value="partnership">Partnership</SelectItem>
                          <SelectItem value="non-profit">Non-Profit</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="businessType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Industry/Business Type</FormLabel>
                      <FormControl>
                        <Input placeholder="Consulting, SaaS, E-commerce, etc." {...field} data-testid="input-business-type" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input placeholder="San Francisco" {...field} data-testid="input-city" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>State</FormLabel>
                      <FormControl>
                        <Input placeholder="CA" {...field} data-testid="input-state" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="productsServices"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>What Do You Offer?</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe your products or services in a few sentences..."
                        className="min-h-[100px] resize-none"
                        {...field}
                        data-testid="textarea-products-services"
                      />
                    </FormControl>
                    <FormDescription>
                      This helps us personalize proposals, invoices, and AI-generated content for your business
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <strong>💡 Next step:</strong> After setup, visit <strong>Settings → Brand</strong> to upload your logo, brand colors, and build your brand identity with our guided wizard.
                </p>
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 text-lg" 
                disabled={updateUserMutation.isPending}
                data-testid="button-complete-quick-start"
              >
                {updateUserMutation.isPending ? (
                  "Setting up your workspace..."
                ) : (
                  <>
                    <CheckCircle2 className="h-5 w-5 mr-2" />
                    Get Started
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
