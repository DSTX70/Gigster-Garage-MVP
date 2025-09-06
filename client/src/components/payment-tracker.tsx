import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, DollarSign, CreditCard, Calendar, Receipt, Trash2, Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { format } from "date-fns";
import type { Payment, InsertPayment, Invoice } from "@shared/schema";

interface PaymentTrackerProps {
  invoiceId?: string;
  clientId?: string;
  showHeader?: boolean;
}

const PAYMENT_METHODS = [
  { value: "cash", label: "Cash", icon: DollarSign },
  { value: "check", label: "Check", icon: Receipt },
  { value: "credit_card", label: "Credit Card", icon: CreditCard },
  { value: "bank_transfer", label: "Bank Transfer", icon: DollarSign },
  { value: "paypal", label: "PayPal", icon: CreditCard },
  { value: "stripe", label: "Stripe", icon: CreditCard },
  { value: "other", label: "Other", icon: DollarSign }
];

export function PaymentTracker({ invoiceId, clientId, showHeader = true }: PaymentTrackerProps) {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [newPayment, setNewPayment] = useState<Partial<InsertPayment>>({
    amount: "",
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMethod: "credit_card",
    reference: "",
    notes: "",
    isDeposit: false,
    invoiceId: invoiceId || "",
    clientId: clientId || ""
  });

  // Fetch payments
  const { data: payments = [], isLoading } = useQuery<Payment[]>({
    queryKey: invoiceId ? ["/api/invoices", invoiceId, "payments"] : ["/api/payments"],
    queryFn: async () => {
      if (invoiceId) {
        return apiRequest("GET", `/api/invoices/${invoiceId}/payments`);
      }
      const allPayments = await apiRequest("GET", "/api/payments");
      return clientId ? allPayments.filter((p: Payment) => p.clientId === clientId) : allPayments;
    }
  });

  // Fetch invoice details if invoiceId is provided
  const { data: invoice } = useQuery<Invoice>({
    queryKey: ["/api/invoices", invoiceId],
    enabled: !!invoiceId,
    queryFn: () => apiRequest("GET", `/api/invoices/${invoiceId}`)
  });

  const createPaymentMutation = useMutation({
    mutationFn: (paymentData: InsertPayment) => apiRequest("POST", "/api/payments", paymentData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/payments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/invoices"] });
      if (invoiceId) {
        queryClient.invalidateQueries({ queryKey: ["/api/invoices", invoiceId, "payments"] });
        queryClient.invalidateQueries({ queryKey: ["/api/invoices", invoiceId] });
      }
      toast({
        title: "Payment recorded",
        description: "Payment has been successfully recorded.",
      });
      setShowAddDialog(false);
      setNewPayment({
        amount: "",
        paymentDate: new Date().toISOString().split('T')[0],
        paymentMethod: "credit_card",
        reference: "",
        notes: "",
        isDeposit: false,
        invoiceId: invoiceId || "",
        clientId: clientId || ""
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to record payment.",
        variant: "destructive",
      });
    },
  });

  const updatePaymentMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Payment> }) => 
      apiRequest("PUT", `/api/payments/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/payments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/invoices"] });
      setEditingPayment(null);
      toast({
        title: "Payment updated",
        description: "Payment has been successfully updated.",
      });
    },
  });

  const deletePaymentMutation = useMutation({
    mutationFn: (paymentId: string) => apiRequest("DELETE", `/api/payments/${paymentId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/payments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/invoices"] });
      toast({
        title: "Payment deleted",
        description: "Payment has been successfully deleted.",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingPayment) {
      updatePaymentMutation.mutate({
        id: editingPayment.id,
        data: newPayment
      });
    } else {
      createPaymentMutation.mutate(newPayment as InsertPayment);
    }
  };

  const getPaymentMethodIcon = (method: string) => {
    const paymentMethod = PAYMENT_METHODS.find(pm => pm.value === method);
    const Icon = paymentMethod?.icon || DollarSign;
    return <Icon className="h-4 w-4" />;
  };

  const getTotalPaid = () => {
    return payments.reduce((sum, payment) => sum + parseFloat(payment.amount), 0);
  };

  const getBalanceDue = () => {
    if (!invoice) return 0;
    return parseFloat(invoice.totalAmount || "0") - getTotalPaid();
  };

  return (
    <div className="space-y-4">
      {showHeader && (
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Payment Tracking</h3>
            <p className="text-sm text-muted-foreground">
              Track and manage payments for {invoiceId ? 'this invoice' : 'all invoices'}
            </p>
          </div>
          <Dialog open={showAddDialog || !!editingPayment} onOpenChange={(open) => {
            setShowAddDialog(open);
            if (!open) setEditingPayment(null);
          }}>
            <DialogTrigger asChild>
              <Button data-testid="button-add-payment">
                <Plus className="h-4 w-4 mr-2" />
                Record Payment
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingPayment ? 'Edit Payment' : 'Record New Payment'}
                </DialogTitle>
                <DialogDescription>
                  {editingPayment ? 'Update payment details' : 'Add a new payment record'}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="amount">Amount *</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      min="0"
                      value={newPayment.amount}
                      onChange={(e) => setNewPayment({...newPayment, amount: e.target.value})}
                      placeholder="0.00"
                      required
                      data-testid="input-payment-amount"
                    />
                  </div>
                  <div>
                    <Label htmlFor="paymentDate">Payment Date *</Label>
                    <Input
                      id="paymentDate"
                      type="date"
                      value={newPayment.paymentDate}
                      onChange={(e) => setNewPayment({...newPayment, paymentDate: e.target.value})}
                      required
                      data-testid="input-payment-date"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="paymentMethod">Payment Method</Label>
                  <Select 
                    value={newPayment.paymentMethod} 
                    onValueChange={(value) => setNewPayment({...newPayment, paymentMethod: value})}
                  >
                    <SelectTrigger data-testid="select-payment-method">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PAYMENT_METHODS.map((method) => (
                        <SelectItem key={method.value} value={method.value}>
                          <div className="flex items-center gap-2">
                            <method.icon className="h-4 w-4" />
                            {method.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="reference">Reference/Transaction ID</Label>
                  <Input
                    id="reference"
                    value={newPayment.reference}
                    onChange={(e) => setNewPayment({...newPayment, reference: e.target.value})}
                    placeholder="Check number, transaction ID, etc."
                    data-testid="input-payment-reference"
                  />
                </div>

                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={newPayment.notes}
                    onChange={(e) => setNewPayment({...newPayment, notes: e.target.value})}
                    placeholder="Additional notes about this payment"
                    data-testid="textarea-payment-notes"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isDeposit"
                    checked={newPayment.isDeposit}
                    onChange={(e) => setNewPayment({...newPayment, isDeposit: e.target.checked})}
                    data-testid="checkbox-is-deposit"
                  />
                  <Label htmlFor="isDeposit">This is a deposit payment</Label>
                </div>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => {
                    setShowAddDialog(false);
                    setEditingPayment(null);
                  }}>
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createPaymentMutation.isPending || updatePaymentMutation.isPending}
                    data-testid="button-save-payment"
                  >
                    {editingPayment ? 'Update Payment' : 'Record Payment'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      )}

      {/* Payment Summary */}
      {invoice && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Invoice Total</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                ${parseFloat(invoice.totalAmount || "0").toFixed(2)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Total Paid</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                ${getTotalPaid().toFixed(2)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Balance Due</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${getBalanceDue() > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                ${getBalanceDue().toFixed(2)}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Payments List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Payment History</CardTitle>
          <CardDescription>
            {payments.length} payment{payments.length !== 1 ? 's' : ''} recorded
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-4">Loading payments...</div>
          ) : payments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No payments recorded yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {payments.map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50"
                  data-testid={`payment-${payment.id}`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-full">
                      {getPaymentMethodIcon(payment.paymentMethod || "other")}
                    </div>
                    <div>
                      <div className="font-medium">${parseFloat(payment.amount).toFixed(2)}</div>
                      <div className="text-sm text-muted-foreground">
                        {format(new Date(payment.paymentDate), "MMM dd, yyyy")} • {PAYMENT_METHODS.find(m => m.value === payment.paymentMethod)?.label}
                        {payment.isDeposit && <Badge variant="secondary" className="ml-2">Deposit</Badge>}
                      </div>
                      {payment.reference && (
                        <div className="text-xs text-muted-foreground">
                          Ref: {payment.reference}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditingPayment(payment);
                        setNewPayment({
                          amount: payment.amount,
                          paymentDate: payment.paymentDate,
                          paymentMethod: payment.paymentMethod,
                          reference: payment.reference,
                          notes: payment.notes,
                          isDeposit: payment.isDeposit
                        });
                      }}
                      data-testid={`button-edit-payment-${payment.id}`}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        if (confirm('Are you sure you want to delete this payment?')) {
                          deletePaymentMutation.mutate(payment.id);
                        }
                      }}
                      data-testid={`button-delete-payment-${payment.id}`}
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}