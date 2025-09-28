import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AppHeader } from "@/components/app-header";
import { PaymentTracker } from "@/components/payment-tracker";
import { ArrowLeft, Download, Send, Edit, FileText } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import type { Invoice } from "@shared/schema";
import { format } from "date-fns";

export default function InvoiceDetails() {
  const [match, params] = useRoute("/invoices/:id");
  const invoiceId = params?.id;

  // Fetch invoice details
  const { data: invoice, isLoading } = useQuery({
    queryKey: ["/api/invoices", invoiceId],
    enabled: !!invoiceId,
    queryFn: async () => {
      const response = await fetch(`/api/invoices/${invoiceId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch invoice');
      }
      return response.json();
    }
  });

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "draft": return "secondary";
      case "sent": return "default";
      case "paid": return "outline";
      case "overdue": return "destructive";
      default: return "secondary";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft": return "text-gray-600";
      case "sent": return "text-blue-600";
      case "paid": return "text-green-600";
      case "overdue": return "text-red-600";
      default: return "text-gray-600";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AppHeader />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF7F00] mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading invoice details...</p>
          </div>
        </main>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AppHeader />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900">Invoice Not Found</h2>
            <p className="mt-4 text-gray-600">The invoice you're looking for doesn't exist.</p>
            <Link href="/invoices">
              <Button className="mt-4">Back to Invoices</Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link href="/invoices">
              <Button variant="ghost" size="sm" data-testid="button-back-to-invoices">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Invoices
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Invoice #{invoice.invoiceNumber || invoice.id.slice(0, 8)}
              </h1>
              <div className="flex items-center space-x-4 mt-2">
                <Badge 
                  variant={getStatusBadgeVariant(invoice.status)} 
                  className={getStatusColor(invoice.status)}
                >
                  {invoice.status.toUpperCase()}
                </Badge>
                <span className="text-gray-500">
                  Created {format(new Date(invoice.createdAt), "MMM dd, yyyy")}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              onClick={() => window.open(`/api/invoices/${invoice.id}/pdf`, '_blank')}
              data-testid="button-download-pdf"
            >
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
            <Link href={`/edit-invoice/${invoice.id}`}>
              <Button variant="outline" data-testid="button-edit-invoice">
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            </Link>
            {invoice.status === "draft" && (
              <Button
                onClick={() => {/* Send invoice logic */}}
                className="bg-[#FF7F00] hover:bg-[#e6720a] text-white"
                data-testid="button-send-invoice"
              >
                <Send className="h-4 w-4 mr-2" />
                Send Invoice
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Invoice Details */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Invoice Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Client Information */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Bill To:</h4>
                  <div className="text-gray-700">
                    <p className="font-medium">{invoice.clientName}</p>
                    <p>{invoice.clientEmail}</p>
                    {invoice.clientAddress && (
                      <p className="whitespace-pre-line">{invoice.clientAddress}</p>
                    )}
                  </div>
                </div>

                <Separator />

                {/* Invoice Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm font-medium text-gray-500">Invoice Date</span>
                    <p className="text-gray-900">
                      {invoice.invoiceDate ? format(new Date(invoice.invoiceDate), "MMM dd, yyyy") : "Not set"}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Due Date</span>
                    <p className="text-gray-900">
                      {invoice.dueDate ? format(new Date(invoice.dueDate), "MMM dd, yyyy") : "Not set"}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Project</span>
                    <p className="text-gray-900">{invoice.projectDescription || "Professional Services"}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Total Amount</span>
                    <p className="text-2xl font-bold text-blue-600">
                      ${parseFloat(invoice.totalAmount || "0").toFixed(2)}
                    </p>
                  </div>
                </div>

                <Separator />

                {/* Line Items */}
                {invoice.lineItems && invoice.lineItems.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Line Items</h4>
                    <div className="space-y-2">
                      {invoice.lineItems.map((item, index) => (
                        <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                          <div>
                            <p className="font-medium">{item.description}</p>
                            <p className="text-sm text-gray-600">
                              {item.quantity} × ${parseFloat(item.rate.toString()).toFixed(2)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">${parseFloat(item.amount.toString()).toFixed(2)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Notes */}
                {invoice.notes && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Notes</h4>
                    <p className="text-gray-700 whitespace-pre-wrap">{invoice.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Payment Tracking Sidebar */}
          <div className="lg:col-span-1">
            <PaymentTracker 
              invoiceId={invoice.id} 
              clientId={invoice.clientId || ""} 
              showHeader={false}
            />
          </div>
        </div>

        {/* Full Width Payment History */}
        <div className="mt-8">
          <PaymentTracker 
            invoiceId={invoice.id} 
            clientId={invoice.clientId || ""} 
            showHeader={true}
          />
        </div>
      </main>
    </div>
  );
}