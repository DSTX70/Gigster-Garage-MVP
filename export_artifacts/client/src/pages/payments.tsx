import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { AppHeader } from "@/components/app-header";
import { PaymentTracker } from "@/components/payment-tracker";
import { Link } from "wouter";
import { Search, DollarSign, CreditCard, Receipt, TrendingUp, Calendar } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import type { Payment, Invoice, Client } from "@shared/schema";
import { format } from "date-fns";

const PAYMENT_METHODS = [
  { value: "cash", label: "Cash", icon: DollarSign },
  { value: "check", label: "Check", icon: Receipt },
  { value: "credit_card", label: "Credit Card", icon: CreditCard },
  { value: "bank_transfer", label: "Bank Transfer", icon: DollarSign },
  { value: "paypal", label: "PayPal", icon: CreditCard },
  { value: "stripe", label: "Stripe", icon: CreditCard },
  { value: "other", label: "Other", icon: DollarSign }
];

export default function Payments() {
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch all payments
  const { data: payments = [], isLoading: paymentsLoading } = useQuery<Payment[]>({
    queryKey: ["/api/payments"],
  });

  // Fetch all invoices for reference
  const { data: invoices = [] } = useQuery<Invoice[]>({
    queryKey: ["/api/invoices"],
  });

  // Fetch all clients for reference
  const { data: clients = [] } = useQuery<Client[]>({
    queryKey: ["/api/clients"],
  });

  // Helper functions to get related data
  const getInvoice = (invoiceId: string) => invoices.find(inv => inv.id === invoiceId);
  const getClient = (clientId: string) => clients.find(client => client.id === clientId);
  const getPaymentMethodInfo = (method: string) => PAYMENT_METHODS.find(pm => pm.value === method);

  // Filter payments based on search term
  const filteredPayments = payments.filter(payment => {
    const invoice = getInvoice(payment.invoiceId || "");
    const client = getClient(payment.clientId || "");
    const searchLower = searchTerm.toLowerCase();
    
    return (
      payment.amount.includes(searchLower) ||
      payment.reference?.toLowerCase().includes(searchLower) ||
      invoice?.invoiceNumber?.toLowerCase().includes(searchLower) ||
      client?.name?.toLowerCase().includes(searchLower) ||
      client?.email?.toLowerCase().includes(searchLower) ||
      payment.paymentMethod?.toLowerCase().includes(searchLower)
    );
  });

  // Calculate summary statistics
  const totalPayments = payments.reduce((sum, p) => sum + parseFloat(p.amount), 0);
  const thisMonthPayments = payments.filter(p => {
    const paymentDate = new Date(p.paymentDate);
    const now = new Date();
    return paymentDate.getMonth() === now.getMonth() && paymentDate.getFullYear() === now.getFullYear();
  }).reduce((sum, p) => sum + parseFloat(p.amount), 0);
  
  const depositPayments = payments.filter(p => p.isDeposit).reduce((sum, p) => sum + parseFloat(p.amount), 0);

  if (paymentsLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AppHeader />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF7F00] mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading payments...</p>
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
            <h1 className="text-3xl font-bold text-gray-900">Payment Tracking</h1>
            <p className="mt-2 text-gray-600">Track and manage all client payments</p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Payments</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                ${totalPayments.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">
                {payments.length} payment{payments.length !== 1 ? 's' : ''}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Month</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                ${thisMonthPayments.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">
                Current month payments
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Deposits</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                ${depositPayments.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">
                Deposit payments
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Payment</CardTitle>
              <Receipt className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                ${payments.length > 0 ? (totalPayments / payments.length).toFixed(2) : '0.00'}
              </div>
              <p className="text-xs text-muted-foreground">
                Per payment average
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by amount, reference, invoice, client, or payment method..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                data-testid="input-search-payments"
              />
            </div>
          </CardContent>
        </Card>

        {/* Payment Tracker Component */}
        <PaymentTracker showHeader={true} />

        {/* Payments List */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>All Payments</CardTitle>
            <CardDescription>
              {filteredPayments.length} of {payments.length} payment{payments.length !== 1 ? 's' : ''}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredPayments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>{searchTerm ? 'No payments match your search' : 'No payments recorded yet'}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredPayments.map((payment) => {
                  const invoice = getInvoice(payment.invoiceId || "");
                  const client = getClient(payment.clientId || "");
                  const paymentMethodInfo = getPaymentMethodInfo(payment.paymentMethod || "other");
                  const PaymentIcon = paymentMethodInfo?.icon || DollarSign;

                  return (
                    <div
                      key={payment.id}
                      className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50"
                      data-testid={`payment-item-${payment.id}`}
                    >
                      <div className="flex items-center space-x-4">
                        <div className="p-3 bg-blue-100 rounded-full">
                          <PaymentIcon className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <div className="flex items-center space-x-3">
                            <span className="text-lg font-semibold text-green-600">
                              ${parseFloat(payment.amount).toFixed(2)}
                            </span>
                            {payment.isDeposit && (
                              <Badge variant="secondary">Deposit</Badge>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {format(new Date(payment.paymentDate), "MMM dd, yyyy")} • {paymentMethodInfo?.label}
                          </div>
                          {client && (
                            <div className="text-sm text-muted-foreground">
                              Client: <Link href={`/client/${client.id}`} className="text-blue-600 hover:underline">{client.name}</Link>
                            </div>
                          )}
                          {invoice && (
                            <div className="text-sm text-muted-foreground">
                              Invoice: <Link href={`/invoices/${invoice.id}`} className="text-blue-600 hover:underline">#{invoice.invoiceNumber || invoice.id.slice(0, 8)}</Link>
                            </div>
                          )}
                          {payment.reference && (
                            <div className="text-xs text-muted-foreground">
                              Ref: {payment.reference}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-sm text-muted-foreground">
                          Payment #{payment.id.slice(0, 8)}
                        </div>
                        {payment.notes && (
                          <div className="text-xs text-muted-foreground max-w-xs truncate">
                            {payment.notes}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}