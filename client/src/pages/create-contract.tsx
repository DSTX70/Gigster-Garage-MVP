import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { AppHeader } from "@/components/app-header";
import { Link } from "wouter";
import { ArrowLeft, FileCheck, Send, Download, Eye, Scale, Calendar } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Project } from "@shared/schema";

export default function CreateContract() {
  const { toast } = useToast();
  const [isPreview, setIsPreview] = useState(false);
  
  // Form data
  const [formData, setFormData] = useState({
    contractTitle: "",
    contractType: "",
    projectId: "",
    clientName: "",
    clientEmail: "",
    clientAddress: "",
    contractValue: 0,
    startDate: "",
    endDate: "",
    paymentTerms: "",
    scope: "",
    deliverables: "",
    responsibilities: "",
    termination: "",
    confidentiality: "",
    disputeResolution: "",
    governingLaw: "",
    signatures: "",
  });

  // Character counts
  const [scopeCount, setScopeCount] = useState(0);
  const [deliverablesCount, setDeliverablesCount] = useState(0);
  const [responsibilitiesCount, setResponsibilitiesCount] = useState(0);
  const [paymentTermsCount, setPaymentTermsCount] = useState(0);
  const [terminationCount, setTerminationCount] = useState(0);
  const [confidentialityCount, setConfidentialityCount] = useState(0);

  // Fetch projects
  const { data: projects = [] } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  // Save contract mutation
  const saveContractMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/contracts", data),
    onSuccess: () => {
      toast({
        title: "Contract saved",
        description: "Your contract has been saved successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save contract.",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    const contractData = {
      ...formData,
      type: "contract"
    };
    saveContractMutation.mutate(contractData);
  };

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (isPreview) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AppHeader />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-8">
            <Button variant="ghost" onClick={() => setIsPreview(false)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Editor
            </Button>
            <div className="space-x-2">
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export PDF
              </Button>
              <Button onClick={handleSave}>
                <Send className="h-4 w-4 mr-2" />
                Send Contract
              </Button>
            </div>
          </div>

          {/* Contract Preview */}
          <Card className="mb-8">
            <CardContent className="p-8 space-y-8">
              <div className="text-center border-b pb-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {formData.contractTitle || "Service Agreement"}
                </h1>
                <p className="text-gray-600">{formData.contractType}</p>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Parties</h3>
                  <p><strong>Client:</strong> {formData.clientName || "Client Name"}</p>
                  <p><strong>Email:</strong> {formData.clientEmail}</p>
                  <div className="whitespace-pre-wrap">{formData.clientAddress}</div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Contract Details</h3>
                    <p><strong>Start Date:</strong> {formData.startDate || "TBD"}</p>
                    <p><strong>End Date:</strong> {formData.endDate || "TBD"}</p>
                    <p><strong>Value:</strong> ${formData.contractValue.toFixed(2)}</p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Project</h3>
                    <p>{projects.find(p => p.id === formData.projectId)?.name || "No project selected"}</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">Scope of Work</h3>
                  <div className="whitespace-pre-wrap text-gray-700">{formData.scope || "Scope not defined"}</div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">Deliverables</h3>
                  <div className="whitespace-pre-wrap text-gray-700">{formData.deliverables || "Deliverables not specified"}</div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">Payment Terms</h3>
                  <div className="whitespace-pre-wrap text-gray-700">{formData.paymentTerms || "Payment terms not specified"}</div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">Responsibilities</h3>
                  <div className="whitespace-pre-wrap text-gray-700">{formData.responsibilities || "Responsibilities not defined"}</div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">Termination</h3>
                  <div className="whitespace-pre-wrap text-gray-700">{formData.termination || "Termination clause not specified"}</div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">Confidentiality</h3>
                  <div className="whitespace-pre-wrap text-gray-700">{formData.confidentiality || "Confidentiality terms not specified"}</div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Dispute Resolution</h3>
                    <div className="text-gray-700">{formData.disputeResolution || "Not specified"}</div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Governing Law</h3>
                    <div className="text-gray-700">{formData.governingLaw || "Not specified"}</div>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-4">Signatures</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <div className="border-b border-gray-300 mb-2 pb-8"></div>
                      <p className="font-medium">Client Signature</p>
                      <p className="text-sm text-gray-600">Date: _______________</p>
                    </div>
                    <div>
                      <div className="border-b border-gray-300 mb-2 pb-8"></div>
                      <p className="font-medium">Service Provider Signature</p>
                      <p className="text-sm text-gray-600">Date: _______________</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <FileCheck className="h-8 w-8 text-purple-600" />
                Create Contract
              </h1>
              <p className="text-gray-600 mt-1">Generate professional contracts with legal terms and conditions</p>
            </div>
          </div>
          <div className="space-x-2">
            <Button variant="outline" onClick={() => setIsPreview(true)}>
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Button>
            <Button onClick={handleSave} disabled={saveContractMutation.isPending}>
              <Send className="h-4 w-4 mr-2" />
              Save Contract
            </Button>
          </div>
        </div>

        <div className="space-y-8">
          {/* Contract Details */}
          <Card>
            <CardHeader>
              <CardTitle>Contract Information</CardTitle>
              <CardDescription>Basic contract details and parties involved</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contractTitle">Contract Title *</Label>
                  <Input
                    id="contractTitle"
                    placeholder="Service Agreement"
                    value={formData.contractTitle}
                    onChange={(e) => updateFormData("contractTitle", e.target.value)}
                    className="border-purple-200 focus:border-purple-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contractType">Contract Type</Label>
                  <Select value={formData.contractType} onValueChange={(value) => updateFormData("contractType", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select contract type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="service-agreement">Service Agreement</SelectItem>
                      <SelectItem value="consulting">Consulting Agreement</SelectItem>
                      <SelectItem value="development">Development Contract</SelectItem>
                      <SelectItem value="maintenance">Maintenance Agreement</SelectItem>
                      <SelectItem value="nda">Non-Disclosure Agreement</SelectItem>
                      <SelectItem value="retainer">Retainer Agreement</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="clientName">Client Name *</Label>
                  <Input
                    id="clientName"
                    placeholder="Enter client name"
                    value={formData.clientName}
                    onChange={(e) => updateFormData("clientName", e.target.value)}
                    className="border-blue-200 focus:border-blue-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="clientEmail">Client Email</Label>
                  <Input
                    id="clientEmail"
                    type="email"
                    placeholder="client@company.com"
                    value={formData.clientEmail}
                    onChange={(e) => updateFormData("clientEmail", e.target.value)}
                    className="border-blue-200 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  Client Address
                  <Badge variant="outline" className="text-xs">textarea</Badge>
                </Label>
                <Textarea
                  placeholder="Enter client's full business address..."
                  rows={3}
                  className="min-h-[80px] resize-y bg-orange-50 border-orange-200 focus:border-orange-500"
                  maxLength={500}
                  value={formData.clientAddress}
                  onChange={(e) => updateFormData("clientAddress", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Related Project</Label>
                <Select value={formData.projectId} onValueChange={(value) => updateFormData("projectId", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select project (optional)" />
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
            </CardContent>
          </Card>

          {/* Contract Terms */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Contract Terms
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => updateFormData("startDate", e.target.value)}
                    className="border-purple-200 focus:border-purple-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => updateFormData("endDate", e.target.value)}
                    className="border-purple-200 focus:border-purple-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    Contract Value
                    <Badge variant="outline" className="text-xs">currency</Badge>
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">$</span>
                    <Input
                      type="number"
                      placeholder="0.00"
                      className="pl-8 text-right bg-green-50 border-green-200 focus:border-green-500"
                      min="0"
                      step="0.01"
                      value={formData.contractValue}
                      onChange={(e) => updateFormData("contractValue", Number(e.target.value))}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Scope of Work */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Scope of Work 
                <Badge variant="outline" className="text-xs">textarea</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Define the scope of work, objectives, and project boundaries..."
                rows={6}
                className="min-h-[120px] resize-y bg-orange-50 border-orange-200 focus:border-orange-500"
                maxLength={2000}
                value={formData.scope}
                onChange={(e) => {
                  updateFormData("scope", e.target.value);
                  setScopeCount(e.target.value.length);
                }}
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-2">
                <span>📋 Detailed description of work to be performed</span>
                <span className="font-medium">{scopeCount} / 2,000 characters</span>
              </div>
            </CardContent>
          </Card>

          {/* Deliverables */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Deliverables 
                <Badge variant="outline" className="text-xs">textarea</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="List specific deliverables, milestones, and expected outcomes..."
                rows={4}
                className="min-h-[100px] resize-y bg-orange-50 border-orange-200 focus:border-orange-500"
                maxLength={1500}
                value={formData.deliverables}
                onChange={(e) => {
                  updateFormData("deliverables", e.target.value);
                  setDeliverablesCount(e.target.value.length);
                }}
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-2">
                <span>📦 What will be delivered to the client</span>
                <span className="font-medium">{deliverablesCount} / 1,500 characters</span>
              </div>
            </CardContent>
          </Card>

          {/* Payment Terms */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Payment Terms 
                <Badge variant="outline" className="text-xs">textarea</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Payment schedule, methods, late fees, etc..."
                rows={4}
                className="min-h-[100px] resize-y bg-orange-50 border-orange-200 focus:border-orange-500"
                maxLength={1000}
                value={formData.paymentTerms}
                onChange={(e) => {
                  updateFormData("paymentTerms", e.target.value);
                  setPaymentTermsCount(e.target.value.length);
                }}
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-2">
                <span>💰 Payment schedule and terms</span>
                <span className="font-medium">{paymentTermsCount} / 1,000 characters</span>
              </div>
            </CardContent>
          </Card>

          {/* Responsibilities */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Responsibilities 
                <Badge variant="outline" className="text-xs">textarea</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Responsibilities of both parties, client obligations, etc..."
                rows={4}
                className="min-h-[100px] resize-y bg-orange-50 border-orange-200 focus:border-orange-500"
                maxLength={1500}
                value={formData.responsibilities}
                onChange={(e) => {
                  updateFormData("responsibilities", e.target.value);
                  setResponsibilitiesCount(e.target.value.length);
                }}
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-2">
                <span>👥 Each party's roles and responsibilities</span>
                <span className="font-medium">{responsibilitiesCount} / 1,500 characters</span>
              </div>
            </CardContent>
          </Card>

          {/* Legal Terms */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scale className="h-5 w-5" />
                Legal Terms
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  Termination Clause 
                  <Badge variant="outline" className="text-xs">textarea</Badge>
                </Label>
                <Textarea
                  placeholder="Conditions under which the contract can be terminated..."
                  rows={3}
                  className="min-h-[80px] resize-y bg-orange-50 border-orange-200 focus:border-orange-500"
                  maxLength={1000}
                  value={formData.termination}
                  onChange={(e) => {
                    updateFormData("termination", e.target.value);
                    setTerminationCount(e.target.value.length);
                  }}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>⚖️ How either party can end the contract</span>
                  <span className="font-medium">{terminationCount} / 1,000 characters</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  Confidentiality 
                  <Badge variant="outline" className="text-xs">textarea</Badge>
                </Label>
                <Textarea
                  placeholder="Confidentiality and non-disclosure terms..."
                  rows={3}
                  className="min-h-[80px] resize-y bg-orange-50 border-orange-200 focus:border-orange-500"
                  maxLength={1000}
                  value={formData.confidentiality}
                  onChange={(e) => {
                    updateFormData("confidentiality", e.target.value);
                    setConfidentialityCount(e.target.value.length);
                  }}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>🔒 Protection of confidential information</span>
                  <span className="font-medium">{confidentialityCount} / 1,000 characters</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="disputeResolution">Dispute Resolution</Label>
                  <Select value={formData.disputeResolution} onValueChange={(value) => updateFormData("disputeResolution", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mediation">Mediation</SelectItem>
                      <SelectItem value="arbitration">Arbitration</SelectItem>
                      <SelectItem value="litigation">Litigation</SelectItem>
                      <SelectItem value="mediation-arbitration">Mediation then Arbitration</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="governingLaw">Governing Law</Label>
                  <Input
                    id="governingLaw"
                    placeholder="State/Country"
                    value={formData.governingLaw}
                    onChange={(e) => updateFormData("governingLaw", e.target.value)}
                    className="border-purple-200 focus:border-purple-500"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}