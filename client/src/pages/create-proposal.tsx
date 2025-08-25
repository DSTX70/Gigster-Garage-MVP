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
import { ArrowLeft, FileText, Plus, X, Send, Download, Eye } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Project } from "@shared/schema";

interface LineItem {
  id: number;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

export default function CreateProposal() {
  const { toast } = useToast();
  const [isPreview, setIsPreview] = useState(false);
  
  // Form data
  const [formData, setFormData] = useState({
    title: "",
    projectId: "",
    clientName: "",
    clientEmail: "",
    projectDescription: "",
    totalBudget: 0,
    timeline: "",
    deliverables: "",
    terms: "",
    expiresInDays: 30,
  });

  // Line items for services
  const [lineItems, setLineItems] = useState<LineItem[]>([
    { id: 1, description: "", quantity: 1, rate: 0, amount: 0 }
  ]);

  // Character count state
  const [descriptionCount, setDescriptionCount] = useState(0);
  const [deliverablesCount, setDeliverablesCount] = useState(0);
  const [termsCount, setTermsCount] = useState(0);

  // Fetch projects
  const { data: projects = [] } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  // Line items functions
  const addLineItem = () => {
    const newId = Math.max(...lineItems.map(item => item.id)) + 1;
    setLineItems([...lineItems, { id: newId, description: "", quantity: 1, rate: 0, amount: 0 }]);
  };

  const removeLineItem = (id: number) => {
    if (lineItems.length > 1) {
      setLineItems(lineItems.filter(item => item.id !== id));
    }
  };

  const updateLineItem = (id: number, field: string, value: string | number) => {
    setLineItems(lineItems.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        // Calculate amount when quantity or rate changes
        if (field === 'quantity' || field === 'rate') {
          updated.amount = Number(updated.quantity) * Number(updated.rate);
        }
        return updated;
      }
      return item;
    }));
  };

  const getTotalAmount = () => {
    return lineItems.reduce((total, item) => total + (item.amount || 0), 0);
  };

  // Save proposal mutation
  const saveProposalMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/proposals", data),
    onSuccess: () => {
      toast({
        title: "Proposal saved",
        description: "Your proposal has been saved successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save proposal.",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    const proposalData = {
      ...formData,
      lineItems,
      calculatedTotal: getTotalAmount(),
      type: "proposal"
    };
    saveProposalMutation.mutate(proposalData);
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
                Send Proposal
              </Button>
            </div>
          </div>

          {/* Proposal Preview */}
          <Card className="mb-8">
            <CardContent className="p-8">
              <div className="space-y-8">
                {/* Company Branding Header */}
                <div className="text-center border-b-2 border-[#FF7F00] pb-6 mb-8">
                  <div className="flex items-center justify-center gap-4 mb-4">
                    <div className="w-16 h-16 bg-[#FF7F00] rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-2xl">GG</span>
                    </div>
                    <div className="text-left">
                      <h1 className="text-3xl font-bold text-gray-900">Gigster Garage</h1>
                      <p className="text-[#FF7F00] font-semibold">Smarter tools for bolder dreams</p>
                    </div>
                  </div>
                </div>

                {/* Proposal Header */}
                <div className="text-center border-b pb-6">
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">{formData.title || "Untitled Proposal"}</h2>
                  <p className="text-gray-600">Prepared for {formData.clientName || "Client Name"}</p>
                  <p className="text-sm text-gray-500">{formData.clientEmail}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Project Overview</h3>
                    <p className="text-gray-700">{formData.projectDescription || "No description provided"}</p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Timeline</h3>
                    <p className="text-gray-700">{formData.timeline || "Timeline not specified"}</p>
                  </div>
                </div>

                {/* Services Table */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Services & Pricing</h3>
                  <div className="border rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="text-left py-3 px-4 font-medium">Service</th>
                          <th className="text-center py-3 px-4 font-medium w-20">Qty</th>
                          <th className="text-right py-3 px-4 font-medium w-24">Rate</th>
                          <th className="text-right py-3 px-4 font-medium w-24">Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {lineItems.map((item) => (
                          <tr key={item.id} className="border-t">
                            <td className="py-3 px-4">{item.description || "Service description"}</td>
                            <td className="py-3 px-4 text-center">{item.quantity}</td>
                            <td className="py-3 px-4 text-right">${item.rate.toFixed(2)}</td>
                            <td className="py-3 px-4 text-right font-medium">${item.amount.toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="bg-gray-50 border-t-2">
                        <tr>
                          <td colSpan={3} className="py-3 px-4 text-right font-bold">Total:</td>
                          <td className="py-3 px-4 text-right font-bold text-lg">${getTotalAmount().toFixed(2)}</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">Deliverables</h3>
                  <p className="text-gray-700 whitespace-pre-wrap">{formData.deliverables || "Deliverables not specified"}</p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">Terms & Conditions</h3>
                  <p className="text-gray-700 whitespace-pre-wrap">{formData.terms || "Terms not specified"}</p>
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
                <FileText className="h-8 w-8 text-blue-600" />
                Create Proposal
              </h1>
              <p className="text-gray-600 mt-1">Generate professional proposals with enhanced field types</p>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Proposal Details</CardTitle>
              <CardDescription>Basic information about your proposal</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Proposal Title *</Label>
                  <Input
                    id="title"
                    placeholder="Enter proposal title"
                    value={formData.title}
                    onChange={(e) => updateFormData("title", e.target.value)}
                    className="border-blue-200 focus:border-blue-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Project</Label>
                  <Select value={formData.projectId} onValueChange={(value) => updateFormData("projectId", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select project (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="no-project">No project</SelectItem>
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
            </CardContent>
          </Card>

          {/* Project Description */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Project Description 
                <Badge variant="outline" className="text-xs">textarea</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Enter detailed project description..."
                rows={6}
                className="min-h-[120px] resize-y bg-orange-50 border-orange-200 focus:border-orange-500"
                maxLength={1000}
                value={formData.projectDescription}
                onChange={(e) => {
                  updateFormData("projectDescription", e.target.value);
                  setDescriptionCount(e.target.value.length);
                }}
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-2">
                <span>📝 For detailed descriptions and multi-line content</span>
                <span className="font-medium">{descriptionCount} / 1,000 characters</span>
              </div>
            </CardContent>
          </Card>

          {/* Services & Line Items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Services & Pricing 
                <Badge variant="outline" className="text-xs">line items</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-indigo-200 rounded-lg p-4 bg-indigo-50">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-indigo-900">Itemized Services</h4>
                    <Button size="sm" variant="outline" className="text-xs" onClick={addLineItem}>
                      <Plus className="h-3 w-3 mr-1" />
                      Add Item
                    </Button>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-indigo-300">
                          <th className="text-left py-2 px-2 font-medium text-indigo-800">Description</th>
                          <th className="text-center py-2 px-2 font-medium text-indigo-800 w-20">Qty</th>
                          <th className="text-right py-2 px-2 font-medium text-indigo-800 w-24">Rate</th>
                          <th className="text-right py-2 px-2 font-medium text-indigo-800 w-20">Amount</th>
                          <th className="w-8"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {lineItems.map((item) => (
                          <tr key={item.id} className="border-b border-indigo-100">
                            <td className="py-2 px-2">
                              <Input 
                                placeholder="Service description..." 
                                className="text-xs border-indigo-300"
                                value={item.description}
                                onChange={(e) => updateLineItem(item.id, 'description', e.target.value)}
                              />
                            </td>
                            <td className="py-2 px-2">
                              <Input 
                                type="number"
                                placeholder="1" 
                                className="text-xs text-center border-indigo-300"
                                value={item.quantity}
                                onChange={(e) => updateLineItem(item.id, 'quantity', Number(e.target.value))}
                                min="0"
                                step="1"
                              />
                            </td>
                            <td className="py-2 px-2">
                              <div className="relative">
                                <Input 
                                  type="number"
                                  placeholder="100.00" 
                                  className="text-xs text-right border-indigo-300 pl-4"
                                  value={item.rate}
                                  onChange={(e) => updateLineItem(item.id, 'rate', Number(e.target.value))}
                                  min="0"
                                  step="0.01"
                                />
                                <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-xs text-gray-500">$</span>
                              </div>
                            </td>
                            <td className="py-2 px-2">
                              <div className="text-xs font-medium text-right px-2 py-1.5 bg-indigo-100 rounded border border-indigo-300">
                                ${item.amount.toFixed(2)}
                              </div>
                            </td>
                            <td className="py-2 px-1">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-6 w-6 p-0 text-red-500"
                                onClick={() => removeLineItem(item.id)}
                                disabled={lineItems.length === 1}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr>
                          <td colSpan={3} className="text-right py-2 px-2 font-medium text-indigo-900">
                            Total:
                          </td>
                          <td className="py-2 px-2">
                            <div className="text-sm font-bold text-right px-2 py-1.5 bg-indigo-200 rounded border-2 border-indigo-400">
                              ${getTotalAmount().toFixed(2)}
                            </div>
                          </td>
                          <td></td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Timeline & Budget */}
          <Card>
            <CardHeader>
              <CardTitle>Timeline & Budget</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="timeline">Project Timeline</Label>
                  <Input
                    id="timeline"
                    placeholder="e.g., 4-6 weeks"
                    value={formData.timeline}
                    onChange={(e) => updateFormData("timeline", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    Total Budget
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
                      value={formData.totalBudget}
                      onChange={(e) => updateFormData("totalBudget", Number(e.target.value))}
                    />
                  </div>
                </div>
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
                placeholder="List project deliverables..."
                rows={4}
                className="min-h-[100px] resize-y bg-orange-50 border-orange-200 focus:border-orange-500"
                maxLength={1000}
                value={formData.deliverables}
                onChange={(e) => {
                  updateFormData("deliverables", e.target.value);
                  setDeliverablesCount(e.target.value.length);
                }}
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-2">
                <span>📝 What will be delivered to the client</span>
                <span className="font-medium">{deliverablesCount} / 1,000 characters</span>
              </div>
            </CardContent>
          </Card>

          {/* Terms & Conditions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Terms & Conditions 
                <Badge variant="outline" className="text-xs">textarea</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Enter terms and conditions..."
                rows={6}
                className="min-h-[120px] resize-y bg-orange-50 border-orange-200 focus:border-orange-500"
                maxLength={2000}
                value={formData.terms}
                onChange={(e) => {
                  updateFormData("terms", e.target.value);
                  setTermsCount(e.target.value.length);
                }}
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-2">
                <span>📝 Payment terms, project scope, etc.</span>
                <span className="font-medium">{termsCount} / 2,000 characters</span>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsPreview(true)}>
                  <Eye className="h-4 w-4 mr-2" />
                  Preview
                </Button>
                <Button onClick={handleSave} disabled={saveProposalMutation.isPending}>
                  <Send className="h-4 w-4 mr-2" />
                  Save Proposal
                </Button>
                <Button variant="default" className="bg-green-600 hover:bg-green-700">
                  <Send className="h-4 w-4 mr-2" />
                  Send Proposal
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}