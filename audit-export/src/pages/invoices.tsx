import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { AppHeader } from "@/components/app-header";
import { Link } from "wouter";
import { Plus, FileText, Edit, Send, Trash2, Eye, Download, Search } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Invoice } from "@shared/schema";

export default function Invoices() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch all invoices
  const { data: invoices = [], isLoading } = useQuery<Invoice[]>({
    queryKey: ["/api/invoices"],
  });

  // Send invoice mutation
  const sendInvoiceMutation = useMutation({
    mutationFn: ({ invoiceId }: { invoiceId: string }) => 
      apiRequest("POST", `/api/invoices/${invoiceId}/send`, { includePDF: true }),
    onSuccess: (response) => {
      toast({
        title: "Invoice sent!",
        description: response.message || "Invoice has been sent successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/invoices"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send invoice.",
        variant: "destructive",
      });
    },
  });

  // Delete invoice mutation
  const deleteInvoiceMutation = useMutation({
    mutationFn: (invoiceId: string) => apiRequest("DELETE", `/api/invoices/${invoiceId}`),
    onSuccess: () => {
      toast({
        title: "Invoice deleted",
        description: "Draft invoice has been deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/invoices"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete invoice.",
        variant: "destructive",
      });
    },
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

  // Filter invoices based on search term
  const filteredInvoices = invoices.filter(invoice => 
    invoice.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.clientEmail?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AppHeader />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF7F00] mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading invoices...</p>
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
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Invoices</h1>
            <p className="mt-2 text-gray-600">Create, manage, and send invoices to clients</p>
          </div>
          <Link href="/create-invoice">
            <Button className="bg-[#FF7F00] hover:bg-[#e6720a] text-white">
              <Plus className="h-4 w-4 mr-2" />
              New Invoice
            </Button>
          </Link>
        </div>

        {/* Search and Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search invoices by number, client name, or email..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Invoice Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">Total Invoices</p>
                  <p className="text-2xl font-bold text-gray-900">{invoices.length}</p>
                </div>
                <FileText className="h-8 w-8 text-gray-400" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">Draft Invoices</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {invoices.filter(inv => inv.status === "draft").length}
                  </p>
                </div>
                <Edit className="h-8 w-8 text-gray-400" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">Sent Invoices</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {invoices.filter(inv => inv.status === "sent").length}
                  </p>
                </div>
                <Send className="h-8 w-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">Total Amount</p>
                  <p className="text-2xl font-bold text-green-600">
                    ${invoices.reduce((sum, inv) => sum + Number(inv.totalAmount || 0), 0).toLocaleString()}
                  </p>
                </div>
                <div className="h-8 w-8 text-green-400 flex items-center justify-center">$</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Invoices List */}
        {filteredInvoices.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {searchTerm ? "No invoices found" : "No invoices yet"}
              </h3>
              <p className="text-gray-600 mb-6">
                {searchTerm 
                  ? "Try adjusting your search terms" 
                  : "Create your first invoice to get started"}
              </p>
              {!searchTerm && (
                <Link href="/create-invoice">
                  <Button className="bg-[#FF7F00] hover:bg-[#e6720a] text-white">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Invoice
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredInvoices.map((invoice) => (
              <Card key={invoice.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          #{invoice.invoiceNumber}
                        </h3>
                        <Badge variant={getStatusBadgeVariant(invoice.status || "draft")}>
                          {invoice.status || "draft"}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                        <div>
                          <p className="font-medium">Client</p>
                          <p>{invoice.clientName || "N/A"}</p>
                          <p>{invoice.clientEmail || "N/A"}</p>
                        </div>
                        <div>
                          <p className="font-medium">Amount</p>
                          <p className="text-lg font-semibold text-gray-900">
                            ${Number(invoice.totalAmount || 0).toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="font-medium">Due Date</p>
                          <p>{invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : "N/A"}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 ml-6">
                      {invoice.status === "draft" && (
                        <>
                          <Link href={`/edit-invoice/${invoice.id}`}>
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                          
                          <Button 
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                            onClick={() => sendInvoiceMutation.mutate({ invoiceId: invoice.id })}
                            disabled={sendInvoiceMutation.isPending}
                          >
                            <Send className="h-4 w-4" />
                          </Button>
                          
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                            onClick={() => deleteInvoiceMutation.mutate(invoice.id)}
                            disabled={deleteInvoiceMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      
                      {invoice.status === "sent" && (
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}