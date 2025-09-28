import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { AppHeader } from "@/components/app-header";
import { Link, useParams } from "wouter";
import { ArrowLeft, Receipt, Plus, X, Send, Download, Eye, DollarSign, Save } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Project, Invoice } from "@shared/schema";

interface LineItem {
  id: number;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

export default function EditInvoice() {
  const { toast } = useToast();
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [isPreview, setIsPreview] = useState(false);
  
  // Form data
  const [formData, setFormData] = useState({
    invoiceNumber: "",
    projectId: "",
    clientName: "",
    clientEmail: "",
    clientAddress: "",
    invoiceDate: "",
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

  // Fetch existing invoice
  const { data: invoice, isLoading: invoiceLoading } = useQuery<Invoice>({
    queryKey: ["/api/invoices", id],
    queryFn: () => apiRequest("GET", `/api/invoices/${id}`),
  });

  // Fetch projects
  const { data: projects = [] } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  // Update invoice mutation
  const updateInvoiceMutation = useMutation({
    mutationFn: (data: any) => apiRequest("PUT", `/api/invoices/${id}`, data),
    onSuccess: (response) => {
      toast({
        title: "Invoice updated",
        description: "Your invoice has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/invoices"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update invoice.",
        variant: "destructive",
      });
    },
  });

  // Send invoice mutation
  const sendInvoiceMutation = useMutation({
    mutationFn: () => apiRequest("POST", `/api/invoices/${id}/send`, { includePDF: true }),
    onSuccess: (response) => {
      toast({
        title: "Invoice sent!",
        description: response.message || "Invoice has been sent successfully",
      });
      // Redirect to invoices list after sending
      window.location.href = "/invoices";
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send invoice email.",
        variant: "destructive",
      });
    },
  });

  // Load invoice data when it's available
  useEffect(() => {
    if (invoice) {
      setFormData({
        invoiceNumber: invoice.invoiceNumber || "",
        projectId: invoice.projectId || "",
        clientName: invoice.clientName || "",
        clientEmail: invoice.clientEmail || "",
        clientAddress: invoice.clientAddress || "",
        invoiceDate: invoice.invoiceDate || "",
        dueDate: invoice.dueDate || "",
        notes: invoice.notes || "",
        taxRate: Number(invoice.taxRate) || 0,
        discountAmount: Number(invoice.discountAmount) || 0,
      });
      
      if (invoice.lineItems && invoice.lineItems.length > 0) {
        setLineItems(invoice.lineItems);
      }
      
      setNotesCount(invoice.notes?.length || 0);
      setAddressCount(invoice.clientAddress?.length || 0);
    }
  }, [invoice]);

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

  // Calculation functions
  const getSubtotal = () => {
    return lineItems.reduce((sum, item) => sum + item.amount, 0);
  };

  const getTaxAmount = () => {
    return getSubtotal() * (formData.taxRate / 100);
  };

  const getTotalAmount = () => {
    return getSubtotal() + getTaxAmount() - formData.discountAmount;
  };

  const handleUpdate = () => {
    const invoiceData = {
      ...formData,
      taxRate: formData.taxRate, // Keep as number
      discountAmount: formData.discountAmount, // Keep as number
      lineItems,
      subtotal: getSubtotal(), // Keep as number
      taxAmount: getTaxAmount(), // Keep as number
      totalAmount: getTotalAmount(), // Keep as number
    };
    updateInvoiceMutation.mutate(invoiceData);
  };

  const handleSend = () => {
    sendInvoiceMutation.mutate();
  };

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (invoiceLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AppHeader />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF7F00] mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading invoice...</p>
          </div>
        </main>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AppHeader />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Invoice not found</h1>
            <Link href="/invoices">
              <Button>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Invoices
              </Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  if (invoice.status !== "draft") {
    return (
      <div className="min-h-screen bg-gray-50">
        <AppHeader />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Cannot edit sent invoice</h1>
            <p className="text-gray-600 mb-6">Only draft invoices can be edited.</p>
            <Link href="/invoices">
              <Button>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Invoices
              </Button>
            </Link>
          </div>
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
            <Link href="/invoices">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Invoices
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                <Receipt className="h-8 w-8 text-[#FF7F00]" />
                Edit Invoice
              </h1>
              <p className="mt-2 text-gray-600">#{formData.invoiceNumber}</p>
            </div>
          </div>
          <Badge variant="secondary">Draft</Badge>
        </div>

        <div className="space-y-6">
          {/* Client Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Client Information 
                <Badge variant="outline" className="text-xs">required</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="invoiceDate">Invoice Date</Label>
                  <Input
                    id="invoiceDate"
                    type="date"
                    value={formData.invoiceDate}
                    onChange={(e) => updateFormData("invoiceDate", e.target.value)}
                    className="border-blue-200 focus:border-blue-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dueDate">Due Date</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => updateFormData("dueDate", e.target.value)}
                    className="border-blue-200 focus:border-blue-500"
                  />
                </div>
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
                            <div className="text-sm font-bold text-right px-2 py-1.5 bg-green-200 rounded border border-green-400">
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

          {/* Tax and Discounts */}
          <Card>
            <CardHeader>
              <CardTitle>Tax & Discounts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="taxRate">Tax Rate (%)</Label>
                  <Input
                    id="taxRate"
                    type="number"
                    placeholder="0"
                    value={formData.taxRate}
                    onChange={(e) => updateFormData("taxRate", Number(e.target.value))}
                    min="0"
                    max="100"
                    step="0.01"
                    className="border-blue-200 focus:border-blue-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="discountAmount">Discount Amount ($)</Label>
                  <Input
                    id="discountAmount"
                    type="number"
                    placeholder="0.00"
                    value={formData.discountAmount}
                    onChange={(e) => updateFormData("discountAmount", Number(e.target.value))}
                    min="0"
                    step="0.01"
                    className="border-blue-200 focus:border-blue-500"
                  />
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>${getSubtotal().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax ({formData.taxRate}%):</span>
                    <span>${getTaxAmount().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Discount:</span>
                    <span>-${formData.discountAmount.toFixed(2)}</span>
                  </div>
                  <hr className="my-2" />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total:</span>
                    <span>${getTotalAmount().toFixed(2)}</span>
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

          {/* Action Buttons */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-center space-x-4">
                <Button variant="outline" onClick={() => setIsPreview(true)}>
                  <Eye className="h-4 w-4 mr-2" />
                  Preview
                </Button>
                <Button onClick={handleUpdate} disabled={updateInvoiceMutation.isPending}>
                  <Save className="h-4 w-4 mr-2" />
                  {updateInvoiceMutation.isPending ? "Updating..." : "Update Invoice"}
                </Button>
                <Button onClick={handleSend} disabled={sendInvoiceMutation.isPending}>
                  {sendInvoiceMutation.isPending ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  ) : (
                    <Send className="h-4 w-4 mr-2" />
                  )}
                  Send Invoice
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}