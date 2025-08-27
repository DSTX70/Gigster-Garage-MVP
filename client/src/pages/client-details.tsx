import { useState, useEffect } from "react";
import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  ArrowLeft, 
  Mail, 
  Phone, 
  Building, 
  Globe, 
  MapPin, 
  FileText, 
  DollarSign, 
  Plus,
  Calendar,
  Eye,
  Download
} from "lucide-react";
import type { Client, Proposal, Invoice, Payment } from "@shared/schema";
import { ClientDocuments } from "@/components/ClientDocuments";
import { AppHeader } from "@/components/app-header";

export default function ClientDetails() {
  const { clientId } = useParams() as { clientId: string };
  const [activeTab, setActiveTab] = useState("overview");
  
  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const { data: client, isLoading: clientLoading } = useQuery<Client>({
    queryKey: ["/api/clients", clientId],
  });

  const { data: proposals = [], isLoading: proposalsLoading } = useQuery<Proposal[]>({
    queryKey: ["/api/proposals", "client", clientId],
  });

  const { data: invoices = [], isLoading: invoicesLoading } = useQuery<Invoice[]>({
    queryKey: ["/api/invoices", "client", clientId],
  });

  const { data: payments = [], isLoading: paymentsLoading } = useQuery<Payment[]>({
    queryKey: ["/api/payments", "client", clientId],
  });

  if (clientLoading) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <AppHeader />

        <div className="p-6">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-48 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <AppHeader />

        <div className="p-6">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Client Not Found</h2>
            <p className="text-gray-600 mb-6">The client you're looking for doesn't exist.</p>
            <Link href="/clients">
              <Button className="bg-[#FF7F00] hover:bg-[#e6720a] text-white">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Clients
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "active": return "default";
      case "inactive": return "secondary";
      case "prospect": return "outline";
      case "sent": return "secondary";
      case "accepted": return "default";
      case "rejected": return "destructive";
      case "paid": return "default";
      case "overdue": return "destructive";
      default: return "secondary";
    }
  };

  const totalRevenue = invoices.reduce((sum: number, invoice) => 
    sum + Number(invoice.amountPaid || 0), 0
  );

  const outstandingBalance = invoices.reduce((sum: number, invoice) => 
    sum + Number(invoice.balanceDue || 0), 0
  );

  return (
    <div className="min-h-screen bg-neutral-50">
      <AppHeader />

      <div className="p-6">
        {/* Page Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link href="/admin">
            <Button variant="outline" size="sm" data-testid="button-back-to-admin">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Admin
            </Button>
          </Link>
          <Link href="/clients">
            <Button variant="outline" size="sm" data-testid="button-back-to-clients">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Clients
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">{client.name}</h1>
          <Badge variant={getStatusBadgeVariant(client.status || '')} data-testid={`badge-status-${client.status || ''}`}>
            {client.status}
          </Badge>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-3 mb-6">
          <Link href={`/create-proposal?clientId=${client.id}`}>
            <Button className="bg-[#FF7F00] hover:bg-[#e6720a] text-white" data-testid="button-new-proposal">
              <Plus className="h-4 w-4 mr-2" />
              New Proposal
            </Button>
          </Link>
          <Link href={`/create-invoice?clientId=${client.id}`}>
            <Button variant="outline" data-testid="button-new-invoice">
              <Plus className="h-4 w-4 mr-2" />
              New Invoice
            </Button>
          </Link>
        </div>

        {/* Filing Cabinet - Always Visible */}
        <div className="mb-8">
          <ClientDocuments clientId={clientId} />
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="proposals">Proposals ({proposals.length})</TabsTrigger>
            <TabsTrigger value="invoices">Invoices ({invoices.length})</TabsTrigger>
            <TabsTrigger value="payments">Payments ({payments.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Client Information */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Client Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {client.company && (
                        <div className="flex items-center gap-3">
                          <Building className="h-5 w-5 text-gray-400" />
                          <div>
                            <div className="text-sm text-gray-500">Company</div>
                            <div className="font-medium">{client.company}</div>
                          </div>
                        </div>
                      )}
                      {client.email && (
                        <div className="flex items-center gap-3">
                          <Mail className="h-5 w-5 text-gray-400" />
                          <div>
                            <div className="text-sm text-gray-500">Email</div>
                            <div className="font-medium">{client.email}</div>
                          </div>
                        </div>
                      )}
                      {client.phone && (
                        <div className="flex items-center gap-3">
                          <Phone className="h-5 w-5 text-gray-400" />
                          <div>
                            <div className="text-sm text-gray-500">Phone</div>
                            <div className="font-medium">{client.phone}</div>
                          </div>
                        </div>
                      )}
                      {client.website && (
                        <div className="flex items-center gap-3">
                          <Globe className="h-5 w-5 text-gray-400" />
                          <div>
                            <div className="text-sm text-gray-500">Website</div>
                            <a 
                              href={client.website} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="font-medium text-blue-600 hover:underline"
                            >
                              {client.website}
                            </a>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {client.address && (
                      <div className="flex items-start gap-3 pt-4 border-t">
                        <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                        <div>
                          <div className="text-sm text-gray-500">Address</div>
                          <div className="font-medium whitespace-pre-line">{client.address}</div>
                        </div>
                      </div>
                    )}
                    
                    {client.notes && (
                      <div className="pt-4 border-t">
                        <div className="text-sm text-gray-500 mb-2">Notes</div>
                        <div className="text-sm text-gray-700 whitespace-pre-line">{client.notes}</div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Summary Stats */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5" />
                      Financial Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="text-sm text-gray-500">Total Revenue</div>
                      <div className="text-2xl font-bold text-green-600">
                        ${totalRevenue.toLocaleString()}
                      </div>
                    </div>
                    {outstandingBalance > 0 && (
                      <div>
                        <div className="text-sm text-gray-500">Outstanding Balance</div>
                        <div className="text-2xl font-bold text-orange-600">
                          ${outstandingBalance.toLocaleString()}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Activity Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Proposals</span>
                      <span className="font-medium">{proposals.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Invoices</span>
                      <span className="font-medium">{invoices.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Payments</span>
                      <span className="font-medium">{payments.length}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>


          <TabsContent value="proposals">
            <Card>
              <CardHeader>
                <CardTitle>Proposals</CardTitle>
              </CardHeader>
              <CardContent>
                {proposalsLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF7F00] mx-auto"></div>
                  </div>
                ) : proposals.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No proposals yet</h3>
                    <p className="text-gray-600 mb-4">Create the first proposal for this client.</p>
                    <Link href={`/create-proposal?clientId=${client.id}`}>
                      <Button className="bg-[#FF7F00] hover:bg-[#e6720a] text-white">
                        <Plus className="h-4 w-4 mr-2" />
                        Create Proposal
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {proposals.map((proposal) => (
                      <div key={proposal.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-semibold text-gray-900">{proposal.title}</h4>
                          <Badge variant={getStatusBadgeVariant(proposal.status || '')}>
                            {proposal.status}
                          </Badge>
                        </div>
                        <div className="flex justify-between items-center text-sm text-gray-600">
                          <div className="flex items-center gap-4">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {proposal.createdAt ? new Date(proposal.createdAt).toLocaleDateString() : 'N/A'}
                            </span>
                            <span className="flex items-center gap-1">
                              <DollarSign className="h-4 w-4" />
                              ${Number(proposal.calculatedTotal || 0).toLocaleString()}
                            </span>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline">
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                            <Button size="sm" variant="outline">
                              <Download className="h-4 w-4 mr-1" />
                              Download
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="invoices">
            <Card>
              <CardHeader>
                <CardTitle>Invoices</CardTitle>
              </CardHeader>
              <CardContent>
                {invoicesLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF7F00] mx-auto"></div>
                  </div>
                ) : invoices.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No invoices yet</h3>
                    <p className="text-gray-600 mb-4">Create the first invoice for this client.</p>
                    <Link href={`/create-invoice?clientId=${client.id}`}>
                      <Button className="bg-[#FF7F00] hover:bg-[#e6720a] text-white">
                        <Plus className="h-4 w-4 mr-2" />
                        Create Invoice
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {invoices.map((invoice) => (
                      <div key={invoice.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-semibold text-gray-900">#{invoice.invoiceNumber}</h4>
                            {invoice.proposalId && (
                              <p className="text-sm text-gray-500">From proposal</p>
                            )}
                          </div>
                          <Badge variant={getStatusBadgeVariant(invoice.status || 'draft')}>
                            {invoice.status || 'draft'}
                          </Badge>
                        </div>
                        <div className="flex justify-between items-center text-sm text-gray-600">
                          <div className="flex items-center gap-4">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              Due: {invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : 'N/A'}
                            </span>
                            <span className="flex items-center gap-1">
                              <DollarSign className="h-4 w-4" />
                              Total: ${Number(invoice.totalAmount || 0).toLocaleString()}
                            </span>
                            <span className="flex items-center gap-1">
                              <DollarSign className="h-4 w-4" />
                              Due: ${Number(invoice.balanceDue || 0).toLocaleString()}
                            </span>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline">
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                            <Button size="sm" variant="outline">
                              <Download className="h-4 w-4 mr-1" />
                              Download
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payments">
            <Card>
              <CardHeader>
                <CardTitle>Payment History</CardTitle>
              </CardHeader>
              <CardContent>
                {paymentsLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF7F00] mx-auto"></div>
                  </div>
                ) : payments.length === 0 ? (
                  <div className="text-center py-8">
                    <DollarSign className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No payments recorded</h3>
                    <p className="text-gray-600">Payment history will appear here when payments are received.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {payments.map((payment) => (
                      <div key={payment.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <div className="font-semibold text-gray-900">
                              ${Number(payment.amount).toLocaleString()}
                            </div>
                            {payment.isDeposit && (
                              <Badge variant="outline" className="mt-1">Deposit</Badge>
                            )}
                          </div>
                          <div className="text-right text-sm text-gray-600">
                            <div>{new Date(payment.paymentDate).toLocaleDateString()}</div>
                            {payment.paymentMethod && (
                              <div className="capitalize">{payment.paymentMethod}</div>
                            )}
                          </div>
                        </div>
                        {payment.reference && (
                          <div className="text-sm text-gray-600">
                            Reference: {payment.reference}
                          </div>
                        )}
                        {payment.notes && (
                          <div className="text-sm text-gray-600 mt-2">
                            {payment.notes}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}