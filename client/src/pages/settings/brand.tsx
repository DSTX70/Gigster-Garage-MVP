import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Palette, Upload, Sparkles, Save, FileText } from "lucide-react";

const brandAssetsSchema = z.object({
  logoUrl: z.string().optional(),
  primaryColor: z.string().optional(),
  secondaryColor: z.string().optional(),
  accentColor: z.string().optional(),
  headingFont: z.string().optional(),
  bodyFont: z.string().optional(),
  brandGuidelinesUrl: z.string().optional(),
});

const brandIdentitySchema = z.object({
  brandPersonality: z.string().min(10, "Please describe your brand personality (at least 10 characters)"),
  brandValues: z.string().min(10, "Please describe your brand values"),
  targetAudience: z.string().min(10, "Please describe your target audience"),
});

type BrandAssetsData = z.infer<typeof brandAssetsSchema>;
type BrandIdentityData = z.infer<typeof brandIdentitySchema>;

export default function BrandSettingsPage() {
  const [activeTab, setActiveTab] = useState("assets");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ["/api/user"],
  });

  const updateBrandMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("PATCH", "/api/user/profile", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({
        title: "Brand Updated",
        description: "Your brand settings have been saved successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to save brand settings",
        variant: "destructive",
      });
    },
  });

  return (
    <div className="container max-w-4xl py-8 space-y-6" data-testid="container-brand-settings">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Palette className="h-8 w-8 text-[#004C6D] dark:text-[#4DA8DA]" />
          Brand Identity
        </h1>
        <p className="text-muted-foreground mt-2">
          Build and manage your brand assets, colors, fonts, and identity
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="assets" data-testid="tab-assets">
            <Upload className="h-4 w-4 mr-2" />
            Brand Assets
          </TabsTrigger>
          <TabsTrigger value="identity" data-testid="tab-identity">
            <Sparkles className="h-4 w-4 mr-2" />
            Brand Identity
          </TabsTrigger>
          <TabsTrigger value="wizard" data-testid="tab-wizard">
            <FileText className="h-4 w-4 mr-2" />
            AI Brand Wizard
          </TabsTrigger>
        </TabsList>

        <TabsContent value="assets" className="space-y-6">
          <BrandAssetsForm 
            initialData={{
              logoUrl: user?.logoUrl,
              primaryColor: user?.brandColors?.primary,
              secondaryColor: user?.brandColors?.secondary,
              accentColor: user?.brandColors?.accent,
              headingFont: user?.brandFonts?.heading,
              bodyFont: user?.brandFonts?.body,
              brandGuidelinesUrl: user?.brandGuidelinesUrl,
            }}
            onSubmit={(data) => {
              updateBrandMutation.mutate({
                logoUrl: data.logoUrl,
                brandColors: {
                  primary: data.primaryColor,
                  secondary: data.secondaryColor,
                  accent: data.accentColor,
                },
                brandFonts: {
                  heading: data.headingFont,
                  body: data.bodyFont,
                },
                brandGuidelinesUrl: data.brandGuidelinesUrl,
              });
            }}
            isLoading={updateBrandMutation.isPending}
          />
        </TabsContent>

        <TabsContent value="identity" className="space-y-6">
          <BrandIdentityForm 
            initialData={{
              brandPersonality: user?.brandPersonality || "",
              brandValues: user?.brandValues?.join(", ") || "",
              targetAudience: user?.targetAudience || "",
            }}
            onSubmit={(data) => {
              updateBrandMutation.mutate({
                brandPersonality: data.brandPersonality,
                brandValues: data.brandValues.split(',').map(v => v.trim()),
                targetAudience: data.targetAudience,
              });
            }}
            isLoading={updateBrandMutation.isPending}
          />
        </TabsContent>

        <TabsContent value="wizard" className="space-y-6">
          <BrandWizard />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function BrandAssetsForm({ 
  initialData, 
  onSubmit, 
  isLoading 
}: { 
  initialData: BrandAssetsData; 
  onSubmit: (data: BrandAssetsData) => void;
  isLoading: boolean;
}) {
  const form = useForm<BrandAssetsData>({
    resolver: zodResolver(brandAssetsSchema),
    defaultValues: initialData,
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Brand Assets</CardTitle>
        <CardDescription>
          Upload your logo, define brand colors, and specify typography
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="logoUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Logo</FormLabel>
                  <FormControl>
                    <div className="flex items-center gap-3">
                      <Input placeholder="Logo URL" {...field} data-testid="input-logo-url" />
                      <Button type="button" variant="outline" size="icon" data-testid="button-upload-logo">
                        <Upload className="h-4 w-4" />
                      </Button>
                    </div>
                  </FormControl>
                  <FormDescription>PNG, SVG, or JPG format recommended</FormDescription>
                  {field.value && (
                    <div className="mt-2 p-4 border rounded-lg bg-muted/50">
                      <img src={field.value} alt="Logo preview" className="h-16 object-contain" />
                    </div>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <Separator />

            <div className="space-y-4">
              <FormLabel>Brand Colors</FormLabel>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="primaryColor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm text-muted-foreground">Primary Color</FormLabel>
                      <FormControl>
                        <div className="space-y-2">
                          <Input type="color" {...field} className="h-16 w-full cursor-pointer" data-testid="input-primary-color" />
                          <Input placeholder="#004C6D" {...field} data-testid="input-primary-hex" />
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="secondaryColor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm text-muted-foreground">Secondary Color</FormLabel>
                      <FormControl>
                        <div className="space-y-2">
                          <Input type="color" {...field} className="h-16 w-full cursor-pointer" data-testid="input-secondary-color" />
                          <Input placeholder="#0B1D3A" {...field} data-testid="input-secondary-hex" />
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="accentColor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm text-muted-foreground">Accent Color</FormLabel>
                      <FormControl>
                        <div className="space-y-2">
                          <Input type="color" {...field} className="h-16 w-full cursor-pointer" data-testid="input-accent-color" />
                          <Input placeholder="#4DA8DA" {...field} data-testid="input-accent-hex" />
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="headingFont"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Heading Font</FormLabel>
                    <FormControl>
                      <Input placeholder="Inter, Montserrat, Poppins, etc." {...field} data-testid="input-heading-font" />
                    </FormControl>
                    <FormDescription>Font family for headings</FormDescription>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="bodyFont"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Body Font</FormLabel>
                    <FormControl>
                      <Input placeholder="Open Sans, Roboto, Lato, etc." {...field} data-testid="input-body-font" />
                    </FormControl>
                    <FormDescription>Font family for body text</FormDescription>
                  </FormItem>
                )}
              />
            </div>

            <Separator />

            <FormField
              control={form.control}
              name="brandGuidelinesUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Brand Guidelines Document</FormLabel>
                  <FormControl>
                    <div className="flex items-center gap-3">
                      <Input placeholder="PDF URL or upload" {...field} data-testid="input-guidelines-url" />
                      <Button type="button" variant="outline" size="icon" data-testid="button-upload-guidelines">
                        <Upload className="h-4 w-4" />
                      </Button>
                    </div>
                  </FormControl>
                  <FormDescription>PDF or document with your brand guidelines</FormDescription>
                </FormItem>
              )}
            />

            <Button type="submit" disabled={isLoading} data-testid="button-save-assets">
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? "Saving..." : "Save Brand Assets"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

function BrandIdentityForm({ 
  initialData, 
  onSubmit, 
  isLoading 
}: { 
  initialData: BrandIdentityData; 
  onSubmit: (data: BrandIdentityData) => void;
  isLoading: boolean;
}) {
  const form = useForm<BrandIdentityData>({
    resolver: zodResolver(brandIdentitySchema),
    defaultValues: initialData,
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Brand Identity</CardTitle>
        <CardDescription>
          Define your brand's personality, values, and target audience
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="brandPersonality"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Brand Personality</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe your brand's personality... (e.g., professional yet approachable, innovative and bold, trustworthy and reliable)"
                      className="min-h-[120px]"
                      {...field}
                      data-testid="textarea-brand-personality"
                    />
                  </FormControl>
                  <FormDescription>
                    How would you describe your brand's character and tone?
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="brandValues"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Brand Values</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="List your core values... (e.g., innovation, integrity, customer-first, excellence, sustainability)"
                      className="min-h-[120px]"
                      {...field}
                      data-testid="textarea-brand-values"
                    />
                  </FormControl>
                  <FormDescription>
                    Comma-separated list of your brand's core values
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="targetAudience"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Target Audience</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe your ideal customers... (demographics, needs, pain points, behaviors)"
                      className="min-h-[120px]"
                      {...field}
                      data-testid="textarea-target-audience"
                    />
                  </FormControl>
                  <FormDescription>
                    Who are you trying to reach? What do they care about?
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={isLoading} data-testid="button-save-identity">
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? "Saving..." : "Save Brand Identity"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

function BrandWizard() {
  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  
  const questions = [
    {
      id: "style",
      question: "What style best represents your brand?",
      options: ["Modern & Minimal", "Bold & Vibrant", "Classic & Professional", "Creative & Playful", "Luxury & Sophisticated"],
    },
    {
      id: "emotion",
      question: "What emotion should your brand evoke?",
      options: ["Trust & Reliability", "Innovation & Excitement", "Warmth & Friendliness", "Authority & Expertise", "Inspiration & Creativity"],
    },
    {
      id: "colors",
      question: "Which color palette appeals to you?",
      options: ["Cool Blues", "Warm Oranges/Reds", "Natural Greens", "Bold Purples", "Neutral Grays/Blacks"],
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-[#004C6D] dark:text-[#4DA8DA]" />
          AI Brand Development Wizard
        </CardTitle>
        <CardDescription>
          Answer a few questions and we'll help you build a complete brand identity
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-muted/50 p-6 rounded-lg text-center">
          <Sparkles className="h-12 w-12 mx-auto mb-4 text-[#004C6D] dark:text-[#4DA8DA]" />
          <h3 className="text-lg font-semibold mb-2">Coming Soon: AI-Powered Brand Builder</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Our AI wizard will guide you through creating a comprehensive brand identity, including:
          </p>
          <ul className="text-sm text-left max-w-md mx-auto space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-[#004C6D] dark:text-[#4DA8DA]">•</span>
              <span>Personalized color palette recommendations</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#004C6D] dark:text-[#4DA8DA]">•</span>
              <span>Typography suggestions based on your industry</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#004C6D] dark:text-[#4DA8DA]">•</span>
              <span>AI-generated logo concepts</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#004C6D] dark:text-[#4DA8DA]">•</span>
              <span>Complete brand guidelines document</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#004C6D] dark:text-[#4DA8DA]">•</span>
              <span>Tone of voice recommendations</span>
            </li>
          </ul>
          <p className="text-xs text-muted-foreground mt-6">
            For now, use the "Brand Assets" and "Brand Identity" tabs to manually define your brand.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
