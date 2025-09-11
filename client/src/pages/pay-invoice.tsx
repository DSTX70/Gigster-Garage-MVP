import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { CreditCard, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

// Load Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || '');

interface Invoice {
  id: string;
  invoiceNumber: string;
  clientName: string;
  clientEmail: string;
  companyName: string;
  companyAddress: string;
  subtotal: string;
  taxRate: string;
  taxAmount: string;
  totalAmount: string;
  lineItems: Array<{
    description: string;
    quantity: number;
    rate: number;
    amount: number;
  }>;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  invoiceDate: string;
  dueDate: string;
  notes: string;
}

function PaymentForm({ invoice, clientSecret }: { invoice: Invoice; clientSecret: string }) {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment-success?invoice=${invoice.invoiceNumber}`,
        },
      });

      if (error) {
        toast({
          title: "Payment Failed",
          description: error.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Payment Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      <Button 
        type="submit" 
        disabled={!stripe || isProcessing} 
        className="w-full"
        size="lg"
        data-testid="button-submit-payment"
      >
        {isProcessing ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Processing Payment...
          </>
        ) : (
          <>
            <CreditCard className="h-4 w-4 mr-2" />
            Pay ${invoice.totalAmount}
          </>
        )}
      </Button>
    </form>
  );
}

export default function PayInvoice() {
  const [, params] = useLocation();
  const { toast } = useToast();
  
  // Extract payment link from URL
  const urlParams = new URLSearchParams(window.location.search);
  const paymentLink = urlParams.get('link');
  
  if (!paymentLink) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Invalid Payment Link</h2>
              <p className="text-gray-600">This payment link is invalid or has expired.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Fetch invoice by payment link
  const { data: invoice, isLoading, error } = useQuery({
    queryKey: ['/api/public/invoice', paymentLink],
    queryFn: async () => {
      const response = await fetch(`/api/public/invoice/${paymentLink}`);
      if (!response.ok) {
        throw new Error('Invoice not found or payment link expired');
      }
      return response.json();
    },
  });

  // Create payment intent
  const { data: paymentIntent, isLoading: isCreatingPayment } = useQuery({
    queryKey: ['/api/public/create-payment-intent', paymentLink],
    queryFn: async () => {
      const response = await fetch('/api/public/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentLink }),
      });
      if (!response.ok) {
        throw new Error('Failed to create payment intent');
      }
      return response.json();
    },
    enabled: !!invoice && invoice.status !== 'paid',
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Loading invoice...</p>
        </div>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Invoice Not Found</h2>
              <p className="text-gray-600">
                This invoice doesn't exist or the payment link has expired.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (invoice.status === 'paid') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6">
            <div className="text-center">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Already Paid</h2>
              <p className="text-gray-600">
                Invoice #{invoice.invoiceNumber} has already been paid.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Pay Invoice</h1>
          <p className="text-gray-600">
            Secure payment powered by Stripe
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Invoice Details */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Invoice Details</CardTitle>
                <Badge variant={invoice.status === 'overdue' ? 'destructive' : 'secondary'}>
                  {invoice.status === 'overdue' ? (
                    <>
                      <Clock className="h-3 w-3 mr-1" />
                      Overdue
                    </>
                  ) : (
                    invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)
                  )}
                </Badge>
              </div>
              <CardDescription>
                Invoice #{invoice.invoiceNumber}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-sm text-gray-700 mb-1">From</h3>
                <p className="font-medium">{invoice.companyName || 'Company Name'}</p>
                {invoice.companyAddress && (
                  <p className="text-sm text-gray-600 whitespace-pre-line">
                    {invoice.companyAddress}
                  </p>
                )}
              </div>

              <div>
                <h3 className="font-semibold text-sm text-gray-700 mb-1">Bill To</h3>
                <p className="font-medium">{invoice.clientName}</p>
                <p className="text-sm text-gray-600">{invoice.clientEmail}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Invoice Date:</span>
                  <p className="font-medium">{invoice.invoiceDate}</p>
                </div>
                <div>
                  <span className="text-gray-600">Due Date:</span>
                  <p className="font-medium">{invoice.dueDate}</p>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <h3 className="font-semibold text-sm text-gray-700">Line Items</h3>
                {invoice.lineItems.map((item, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <div>
                      <p className="font-medium">{item.description}</p>
                      <p className="text-gray-600">
                        {item.quantity} × ${item.rate.toFixed(2)}
                      </p>
                    </div>
                    <p className="font-medium">${item.amount.toFixed(2)}</p>
                  </div>
                ))}
              </div>

              <Separator />

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>${invoice.subtotal}</span>
                </div>
                {parseFloat(invoice.taxAmount) > 0 && (
                  <div className="flex justify-between">
                    <span>Tax ({invoice.taxRate}%):</span>
                    <span>${invoice.taxAmount}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-lg pt-2 border-t">
                  <span>Total:</span>
                  <span>${invoice.totalAmount}</span>
                </div>
              </div>

              {invoice.notes && (
                <div>
                  <h3 className="font-semibold text-sm text-gray-700 mb-1">Notes</h3>
                  <p className="text-sm text-gray-600 whitespace-pre-line">
                    {invoice.notes}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Payment Form */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Information</CardTitle>
              <CardDescription>
                Enter your payment details to complete the transaction
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isCreatingPayment ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent mx-auto mb-4"></div>
                  <p className="text-gray-600">Setting up payment...</p>
                </div>
              ) : paymentIntent?.clientSecret ? (
                <Elements 
                  stripe={stripePromise} 
                  options={{ clientSecret: paymentIntent.clientSecret }}
                >
                  <PaymentForm invoice={invoice} clientSecret={paymentIntent.clientSecret} />
                </Elements>
              ) : (
                <div className="text-center py-8">
                  <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-4" />
                  <p className="text-gray-600">Unable to set up payment. Please try again later.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-8 text-sm text-gray-500">
          <p>🔒 Your payment is secured by Stripe. We do not store your payment information.</p>
        </div>
      </div>
    </div>
  );
}