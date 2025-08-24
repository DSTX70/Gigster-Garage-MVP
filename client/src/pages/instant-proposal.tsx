import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  Zap, 
  ArrowLeft, 
  Send, 
  FileText, 
  Eye, 
  Download,
  Mail,
  Link as LinkIcon,
  CheckCircle
} from "lucide-react";
import { Link } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Template, Project, GenerateProposalRequest } from "@shared/schema";

export default function InstantProposal() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [step, setStep] = useState<"select" | "customize" | "preview" | "send">("select");
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [showSendDialog, setShowSendDialog] = useState(false);
  const [generatedProposal, setGeneratedProposal] = useState<any>(null);

  const [formData, setFormData] = useState<GenerateProposalRequest>({
    templateId: "",
    title: "",
    projectId: "",
    clientName: "",
    clientEmail: "",
    variables: {},
    expiresInDays: 30,
  });

  const [sendData, setSendData] = useState({
    recipientEmail: "",
    subject: "",
    message: "",
  });

  // Fetch templates
  const { data: templates = [], isLoading: templatesLoading } = useQuery<Template[]>({
    queryKey: ["/api/templates", "proposal"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/templates?type=proposal");
      return Array.isArray(response) ? response : [];
    },
  });

  // Fetch projects
  const { data: projects = [] } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/projects");
      return Array.isArray(response) ? response : [];
    },
  });

  // Generate proposal mutation
  const generateProposalMutation = useMutation({
    mutationFn: (data: GenerateProposalRequest) => apiRequest("POST", "/api/proposals", data),
    onSuccess: (proposal) => {
      setGeneratedProposal(proposal);
      setStep("preview");
      toast({
        title: "Proposal generated",
        description: "Your proposal has been generated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to generate proposal.",
        variant: "destructive",
      });
    },
  });

  // Send proposal mutation
  const sendProposalMutation = useMutation({
    mutationFn: ({ proposalId, sendData }: { proposalId: string; sendData: any }) =>
      apiRequest("POST", `/api/proposals/${proposalId}/send`, sendData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/proposals"] });
      setShowSendDialog(false);
      setStep("send");
      toast({
        title: "Proposal sent",
        description: "Your proposal has been sent successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send proposal.",
        variant: "destructive",
      });
    },
  });

  // Handle template selection
  const handleTemplateSelect = (template: Template) => {
    setSelectedTemplate(template);
    setFormData(prev => ({
      ...prev,
      templateId: template.id,
      title: `${template.name} - ${new Date().toLocaleDateString()}`,
      variables: template.variables?.reduce((acc, variable) => {
        acc[variable.name] = variable.defaultValue || "";
        return acc;
      }, {} as Record<string, any>) || {},
    }));
    setStep("customize");
  };

  // Handle form data changes
  const updateFormData = (field: keyof GenerateProposalRequest, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updateVariable = (variableName: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      variables: { ...prev.variables, [variableName]: value }
    }));
  };

  // Generate the proposal
  const handleGenerate = () => {
    if (!formData.title.trim()) {
      toast({
        title: "Validation Error",
        description: "Proposal title is required.",
        variant: "destructive",
      });
      return;
    }

    generateProposalMutation.mutate(formData);
  };

  // Send the proposal
  const handleSend = () => {
    if (!generatedProposal) return;

    const dataToSend = {
      recipientEmail: sendData.recipientEmail || formData.clientEmail,
      subject: sendData.subject || `Proposal: ${formData.title}`,
      message: sendData.message,
    };

    sendProposalMutation.mutate({
      proposalId: generatedProposal.id,
      sendData: dataToSend,
    });
  };

  const resetFlow = () => {
    setStep("select");
    setSelectedTemplate(null);
    setGeneratedProposal(null);
    setFormData({
      templateId: "",
      title: "",
      projectId: "",
      clientName: "",
      clientEmail: "",
      variables: {},
      expiresInDays: 30,
    });
    setSendData({
      recipientEmail: "",
      subject: "",
      message: "",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {step !== "select" && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setStep(step === "customize" ? "select" : step === "preview" ? "customize" : "preview")}
              data-testid="button-back"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          )}
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Zap className="h-8 w-8 text-yellow-500" />
              Instant Proposal Builder
            </h1>
            <p className="text-muted-foreground mt-1">
              Generate professional proposals in minutes
            </p>
          </div>
        </div>
        {step === "send" && (
          <Button onClick={resetFlow} data-testid="button-create-another">
            Create Another Proposal
          </Button>
        )}
      </div>

      {/* Progress Steps */}
      <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
        {[
          { key: "select", label: "Select Template", icon: FileText },
          { key: "customize", label: "Customize", icon: Eye },
          { key: "preview", label: "Preview", icon: Download },
          { key: "send", label: "Send", icon: Send },
        ].map((stepItem, index) => {
          const Icon = stepItem.icon;
          const isActive = step === stepItem.key;
          const isCompleted = ["select", "customize", "preview", "send"].indexOf(step) > index;
          
          return (
            <div key={stepItem.key} className="flex items-center gap-2">
              <div className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
                isActive 
                  ? "bg-primary text-primary-foreground" 
                  : isCompleted 
                    ? "bg-green-100 text-green-700" 
                    : "bg-muted text-muted-foreground"
              }`}>
                <Icon className="h-4 w-4" />
                <span className="text-sm font-medium">{stepItem.label}</span>
              </div>
              {index < 3 && (
                <div className={`w-8 h-px ${
                  isCompleted ? "bg-green-300" : "bg-muted-foreground/30"
                }`} />
              )}
            </div>
          );
        })}
      </div>

      {/* Step 1: Template Selection */}
      {step === "select" && (
        <Card>
          <CardHeader>
            <CardTitle>Choose a Proposal Template</CardTitle>
            <CardDescription>
              Select from your available proposal templates to get started
            </CardDescription>
          </CardHeader>
          <CardContent>
            {templatesLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-32 bg-muted rounded animate-pulse" />
                ))}
              </div>
            ) : templates.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Proposal Templates</h3>
                <p className="text-muted-foreground mb-4">
                  You need to create a proposal template first.
                </p>
                <Link href="/templates/new?type=proposal">
                  <Button data-testid="button-create-template">
                    Create Template
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {templates.map((template) => (
                  <Card
                    key={template.id}
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => handleTemplateSelect(template)}
                    data-testid={`template-card-${template.id}`}
                  >
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                      <CardDescription className="line-clamp-2">
                        {template.description || "No description provided"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="text-sm text-muted-foreground">
                        {template.variables && Array.isArray(template.variables) && (
                          <div>
                            {template.variables.length} variable{template.variables.length !== 1 ? 's' : ''}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Step 2: Customize Proposal */}
      {step === "customize" && selectedTemplate && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Proposal Details</CardTitle>
              <CardDescription>
                Customize your proposal with client and project information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Proposal Title *</Label>
                  <Input
                    id="title"
                    data-testid="input-proposal-title"
                    value={formData.title}
                    onChange={(e) => updateFormData("title", e.target.value)}
                    placeholder="Enter proposal title"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="project">Project (Optional)</Label>
                  <Select 
                    value={formData.projectId || ""} 
                    onValueChange={(value) => updateFormData("projectId", value)}
                  >
                    <SelectTrigger data-testid="select-project">
                      <SelectValue placeholder="Select project" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">No project</SelectItem>
                      {projects.map(project => (
                        <SelectItem key={project.id} value={project.id}>
                          {project.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="clientName">Client Name</Label>
                  <Input
                    id="clientName"
                    data-testid="input-client-name"
                    value={formData.clientName || ""}
                    onChange={(e) => updateFormData("clientName", e.target.value)}
                    placeholder="Client or company name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="clientEmail">Client Email</Label>
                  <Input
                    id="clientEmail"
                    type="email"
                    data-testid="input-client-email"
                    value={formData.clientEmail || ""}
                    onChange={(e) => updateFormData("clientEmail", e.target.value)}
                    placeholder="client@example.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="expiresInDays">Expires In (Days)</Label>
                <Input
                  id="expiresInDays"
                  type="number"
                  min="1"
                  max="365"
                  data-testid="input-expires-days"
                  value={formData.expiresInDays}
                  onChange={(e) => updateFormData("expiresInDays", parseInt(e.target.value) || 30)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Template Variables */}
          {selectedTemplate.variables && Array.isArray(selectedTemplate.variables) && selectedTemplate.variables.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Template Variables</CardTitle>
                <CardDescription>
                  Fill in the variables that will be substituted in your proposal
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedTemplate.variables.map((variable) => (
                  <div key={variable.name} className="space-y-2">
                    <Label htmlFor={variable.name}>
                      {variable.label}
                      {variable.required && <span className="text-destructive ml-1">*</span>}
                    </Label>
                    {variable.type === "textarea" ? (
                      <Textarea
                        id={variable.name}
                        data-testid={`input-variable-${variable.name}`}
                        value={formData.variables[variable.name] || ""}
                        onChange={(e) => updateVariable(variable.name, e.target.value)}
                        placeholder={variable.placeholder || variable.label}
                        rows={3}
                      />
                    ) : (
                      <Input
                        id={variable.name}
                        type={variable.type === "email" ? "email" : variable.type === "number" ? "number" : "text"}
                        data-testid={`input-variable-${variable.name}`}
                        value={formData.variables[variable.name] || ""}
                        onChange={(e) => updateVariable(variable.name, e.target.value)}
                        placeholder={variable.placeholder || variable.label}
                      />
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          <div className="flex justify-end">
            <Button
              onClick={handleGenerate}
              disabled={generateProposalMutation.isPending}
              data-testid="button-generate-proposal"
            >
              <Zap className="h-4 w-4 mr-2" />
              {generateProposalMutation.isPending ? "Generating..." : "Generate Proposal"}
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Preview Proposal */}
      {step === "preview" && generatedProposal && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Proposal Preview</span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowSendDialog(true)}
                    data-testid="button-send-proposal"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Send Proposal
                  </Button>
                </div>
              </CardTitle>
              <CardDescription>
                Review your proposal before sending
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-muted/50 p-6 rounded-lg">
                <div className="prose prose-sm max-w-none">
                  <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                    {generatedProposal.content}
                  </pre>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Step 4: Success */}
      {step === "send" && (
        <Card>
          <CardContent className="text-center py-12">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-6" />
            <h2 className="text-2xl font-bold mb-2">Proposal Sent Successfully!</h2>
            <p className="text-muted-foreground mb-6">
              Your proposal has been sent and a shareable link has been generated.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Button variant="outline" data-testid="button-view-proposals">
                <FileText className="h-4 w-4 mr-2" />
                View All Proposals
              </Button>
              <Button onClick={resetFlow} data-testid="button-create-new">
                Create New Proposal
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Send Dialog */}
      <Dialog open={showSendDialog} onOpenChange={setShowSendDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Proposal</DialogTitle>
            <DialogDescription>
              Configure how you want to send this proposal
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="recipientEmail">Recipient Email</Label>
              <Input
                id="recipientEmail"
                type="email"
                data-testid="input-recipient-email"
                value={sendData.recipientEmail}
                onChange={(e) => setSendData(prev => ({ ...prev, recipientEmail: e.target.value }))}
                placeholder={formData.clientEmail || "recipient@example.com"}
              />
              <p className="text-xs text-muted-foreground">
                {formData.clientEmail ? `Defaults to: ${formData.clientEmail}` : "Enter recipient email"}
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="subject">Email Subject</Label>
              <Input
                id="subject"
                data-testid="input-email-subject"
                value={sendData.subject}
                onChange={(e) => setSendData(prev => ({ ...prev, subject: e.target.value }))}
                placeholder={`Proposal: ${formData.title}`}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Message (Optional)</Label>
              <Textarea
                id="message"
                data-testid="textarea-email-message"
                value={sendData.message}
                onChange={(e) => setSendData(prev => ({ ...prev, message: e.target.value }))}
                placeholder="Add a personal message..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowSendDialog(false)}
              data-testid="button-cancel-send"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSend}
              disabled={sendProposalMutation.isPending}
              data-testid="button-confirm-send"
            >
              <Mail className="h-4 w-4 mr-2" />
              {sendProposalMutation.isPending ? "Sending..." : "Send Proposal"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}