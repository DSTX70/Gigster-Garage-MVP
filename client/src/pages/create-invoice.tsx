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
import { ArrowLeft, Receipt, Plus, X, Send, Download, Eye, DollarSign } from "lucide-react";
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

export default function CreateInvoice() {
  const { toast } = useToast();
  const [isPreview, setIsPreview] = useState(false);
  
  // Form data
  const [formData, setFormData] = useState({
    invoiceNumber: `INV-${Date.now()}`,
    projectId: "",
    clientName: "",
    clientEmail: "",
    clientAddress: "",
    invoiceDate: new Date().toISOString().split('T')[0],
    dueDate: "",
    notes: "",
    taxRate: 0,
    discountAmount: 0,
  });

  // Line items for services
  const [lineItems, setLineItems] = useState<LineItem[]>([
    { id: 1, description: "", quantity: 1, rate: 0, amount: 0 }
  ]);

  // Character count state
  const [notesCount, setNotesCount] = useState(0);
  const [addressCount, setAddressCount] = useState(0);

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

  const getSubtotal = () => {
    return lineItems.reduce((total, item) => total + (item.amount || 0), 0);
  };

  const getTaxAmount = () => {
    return (getSubtotal() * formData.taxRate) / 100;
  };

  const getTotalAmount = () => {
    return getSubtotal() + getTaxAmount() - formData.discountAmount;
  };

  // Save invoice mutation
  const saveInvoiceMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/invoices", data),
    onSuccess: () => {
      toast({
        title: "Invoice saved",
        description: "Your invoice has been saved successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save invoice.",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    const invoiceData = {
      ...formData,
      lineItems,
      subtotal: getSubtotal(),
      taxAmount: getTaxAmount(),
      totalAmount: getTotalAmount(),
      type: "invoice"
    };
    saveInvoiceMutation.mutate(invoiceData);
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
                Send Invoice
              </Button>
            </div>
          </div>

          {/* Invoice Preview */}
          <Card className="mb-8">
            <CardContent className="p-8">
              <div className="space-y-8">
                <div className="flex justify-between items-start">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">INVOICE</h1>
                    <p className="text-lg font-medium">#{formData.invoiceNumber}</p>
                  </div>
                  <div className="text-right">
                    <h2 className="text-xl font-bold mb-2">Your Company</h2>
                    <p className="text-gray-600">123 Business St</p>
                    <p className="text-gray-600">City, State 12345</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Bill To:</h3>
                    <p className="font-medium">{formData.clientName || "Client Name"}</p>
                    <p className="text-gray-600">{formData.clientEmail}</p>
                    <div className="text-gray-600 whitespace-pre-wrap">
                      {formData.clientAddress || "Client Address"}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="space-y-2">
                      <div>
                        <span className="font-medium">Invoice Date: </span>
                        <span>{formData.invoiceDate}</span>
                      </div>
                      <div>
                        <span className="font-medium">Due Date: </span>
                        <span>{formData.dueDate || "Not specified"}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Services Table */}
                <div>
                  <div className="border rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="text-left py-3 px-4 font-medium">Description</th>
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
                    </table>
                  </div>
                  
                  {/* Totals */}
                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>${getSubtotal().toFixed(2)}</span>
                    </div>
                    {formData.discountAmount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Discount:</span>
                        <span>-${formData.discountAmount.toFixed(2)}</span>
                      </div>
                    )}
                    {formData.taxRate > 0 && (
                      <div className="flex justify-between">
                        <span>Tax ({formData.taxRate}%):</span>
                        <span>${getTaxAmount().toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between border-t-2 pt-2 text-lg font-bold">
                      <span>Total:</span>
                      <span>${getTotalAmount().toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {formData.notes && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Notes</h3>
                    <p className="text-gray-700 whitespace-pre-wrap">{formData.notes}</p>
                  </div>
                )}
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
                <Receipt className="h-8 w-8 text-green-600" />
                Create Invoice
              </h1>
              <p className="text-gray-600 mt-1">Generate professional invoices with automatic calculations</p>
            </div>
          </div>
          <div className="space-x-2">
            <Button variant="outline" onClick={() => setIsPreview(true)}>
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Button>
            <Button onClick={handleSave} disabled={saveInvoiceMutation.isPending}>
              <Send className="h-4 w-4 mr-2" />
              Save Invoice
            </Button>
          </div>
        </div>

        <div className="space-y-8">
          {/* Invoice Details */}
          <Card>
            <CardHeader>
              <CardTitle>Invoice Information</CardTitle>
              <CardDescription>Basic invoice details and client information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="invoiceNumber">Invoice Number</Label>
                  <Input
                    id="invoiceNumber"
                    placeholder="INV-001"
                    value={formData.invoiceNumber}
                    onChange={(e) => updateFormData("invoiceNumber", e.target.value)}
                    className="border-green-200 focus:border-green-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="invoiceDate">Invoice Date</Label>
                  <Input
                    id="invoiceDate"
                    type="date"
                    value={formData.invoiceDate}
                    onChange={(e) => updateFormData("invoiceDate", e.target.value)}
                    className="border-green-200 focus:border-green-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dueDate">Due Date</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => updateFormData("dueDate", e.target.value)}
                    className="border-green-200 focus:border-green-500"
                  />
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
                  placeholder="Enter client billing address..."
                  rows={3}
                  className="min-h-[80px] resize-y bg-orange-50 border-orange-200 focus:border-orange-500"
                  maxLength={500}
                  value={formData.clientAddress}
                  onChange={(e) => {
                    updateFormData("clientAddress", e.target.value);
                    setAddressCount(e.target.value.length);
                  }}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>📍 Client's billing address</span>
                  <span className="font-medium">{addressCount} / 500 characters</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Project</Label>
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

          {/* Line Items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Billable Items 
                <Badge variant="outline" className="text-xs">line items</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-green-200 rounded-lg p-4 bg-green-50">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-green-900">Services & Products</h4>
                    <Button size="sm" variant="outline" className="text-xs" onClick={addLineItem}>
                      <Plus className="h-3 w-3 mr-1" />
                      Add Item
                    </Button>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-green-300">
                          <th className="text-left py-2 px-2 font-medium text-green-800">Description</th>
                          <th className="text-center py-2 px-2 font-medium text-green-800 w-20">Qty</th>
                          <th className="text-right py-2 px-2 font-medium text-green-800 w-24">Rate</th>
                          <th className="text-right py-2 px-2 font-medium text-green-800 w-20">Amount</th>
                          <th className="w-8"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {lineItems.map((item) => (
                          <tr key={item.id} className="border-b border-green-100">
                            <td className="py-2 px-2">
                              <Input 
                                placeholder="Service or product description..." 
                                className="text-xs border-green-300"
                                value={item.description}
                                onChange={(e) => updateLineItem(item.id, 'description', e.target.value)}
                              />
                            </td>
                            <td className="py-2 px-2">
                              <Input 
                                type="number"
                                placeholder="1" 
                                className="text-xs text-center border-green-300"
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
                                  className="text-xs text-right border-green-300 pl-4"
                                  value={item.rate}
                                  onChange={(e) => updateLineItem(item.id, 'rate', Number(e.target.value))}
                                  min="0"
                                  step="0.01"
                                />
                                <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-xs text-gray-500">$</span>
                              </div>
                            </td>
                            <td className="py-2 px-2">
                              <div className="text-xs font-medium text-right px-2 py-1.5 bg-green-100 rounded border border-green-300">
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
                          <td colSpan={3} className="text-right py-2 px-2 font-medium text-green-900">
                            Subtotal:
                          </td>
                          <td className="py-2 px-2">
                            <div className="text-sm font-bold text-right px-2 py-1.5 bg-green-200 rounded border-2 border-green-400">
                              ${getSubtotal().toFixed(2)}
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

          {/* Tax & Discount */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Tax & Discount
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="taxRate">Tax Rate (%)</Label>
                  <Input
                    id="taxRate"
                    type="number"
                    placeholder="0"
                    min="0"
                    max="100"
                    step="0.1"
                    value={formData.taxRate}
                    onChange={(e) => updateFormData("taxRate", Number(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    Discount Amount
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
                      value={formData.discountAmount}
                      onChange={(e) => updateFormData("discountAmount", Number(e.target.value))}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="font-bold">Total Amount</Label>
                  <div className="text-xl font-bold text-green-700 py-2 px-3 bg-green-100 rounded border-2 border-green-300">
                    ${getTotalAmount().toFixed(2)}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Notes & Terms 
                <Badge variant="outline" className="text-xs">textarea</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Payment terms, additional notes..."
                rows={4}
                className="min-h-[100px] resize-y bg-orange-50 border-orange-200 focus:border-orange-500"
                maxLength={1000}
                value={formData.notes}
                onChange={(e) => {
                  updateFormData("notes", e.target.value);
                  setNotesCount(e.target.value.length);
                }}
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-2">
                <span>📝 Payment terms, special instructions, etc.</span>
                <span className="font-medium">{notesCount} / 1,000 characters</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}