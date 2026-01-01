import { useQuery } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Download, Printer } from "lucide-react";
import type { Client } from "@shared/schema";
import { format } from "date-fns";

interface InvoiceData {
  id: string;
  invoiceNumber?: string;
  clientId?: string;
  clientName?: string;
  status?: string;
  createdAt?: string;
  dueDate?: string;
  lineItems?: Array<{ description?: string; quantity?: number; rate?: number }>;
  taxRate?: number;
  notes?: string;
  terms?: string;
  paymentLink?: string;
  companyName?: string;
  companyAddress?: string;
  companyEmail?: string;
}

export default function InvoicePreview() {
  const [, params] = useRoute("/invoices/:id/preview");
  const invoiceId = params?.id;

  const { data: invoice, isLoading: invoiceLoading } = useQuery<InvoiceData>({
    queryKey: ["/api/invoices", invoiceId],
    enabled: !!invoiceId,
    queryFn: async () => {
      const response = await fetch(`/api/invoices/${invoiceId}`);
      if (!response.ok) throw new Error("Failed to fetch invoice");
      return response.json();
    },
  });

  const { data: client } = useQuery<Client>({
    queryKey: ["/api/clients", invoice?.clientId],
    enabled: !!invoice?.clientId,
    queryFn: async () => {
      const response = await fetch(`/api/clients/${invoice?.clientId}`);
      if (!response.ok) throw new Error("Failed to fetch client");
      return response.json();
    },
  });

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    window.open(`/api/invoices/${invoiceId}/pdf`, "_blank");
  };

  if (invoiceLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center print:hidden">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#004C6D]"></div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center print:hidden">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Invoice Not Found</h2>
          <p className="mt-2 text-gray-600">The invoice you're looking for doesn't exist.</p>
          <Link href="/invoices">
            <Button className="mt-4">Back to Invoices</Button>
          </Link>
        </div>
      </div>
    );
  }

  const lineItems = Array.isArray(invoice.lineItems) ? invoice.lineItems : [];
  const subtotal = lineItems.reduce((sum: number, item: any) => {
    return sum + (parseFloat(item.quantity || 0) * parseFloat(item.rate || 0));
  }, 0);
  const taxRate = invoice.taxRate || 0;
  const taxAmount = subtotal * (taxRate / 100);
  const total = subtotal + taxAmount;

  return (
    <>
      {/* Print-hidden toolbar */}
      <div className="fixed top-0 left-0 right-0 bg-white border-b z-50 print:hidden">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href={`/invoices/${invoiceId}`}>
              <Button variant="ghost" size="sm" data-testid="button-back-to-invoice">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Invoice
              </Button>
            </Link>
            <span className="text-sm text-muted-foreground">Client Preview Mode</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handlePrint} data-testid="button-print">
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
            <Button size="sm" onClick={handleDownloadPDF} data-testid="button-download-pdf">
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
          </div>
        </div>
      </div>

      {/* Invoice Preview - Print-friendly */}
      <div className="min-h-screen bg-gray-100 pt-16 pb-8 print:bg-white print:pt-0 print:pb-0">
        <div className="max-w-4xl mx-auto bg-white shadow-lg print:shadow-none">
          <div className="p-8 print:p-12">
            {/* Header */}
            <div className="flex justify-between items-start mb-8">
              <div>
                <h1 className="text-3xl font-bold text-[#004C6D] mb-1">INVOICE</h1>
                <p className="text-lg text-gray-600">#{invoice.invoiceNumber || invoice.id.slice(0, 8).toUpperCase()}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-lg">{invoice.companyName || "Your Company"}</p>
                {invoice.companyAddress && (
                  <p className="text-gray-600 whitespace-pre-line text-sm">{invoice.companyAddress}</p>
                )}
                {invoice.companyEmail && <p className="text-gray-600 text-sm">{invoice.companyEmail}</p>}
              </div>
            </div>

            <Separator className="my-6" />

            {/* Client & Dates */}
            <div className="grid grid-cols-2 gap-8 mb-8">
              <div>
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">Bill To</h3>
                <p className="font-semibold text-lg">{client?.name || invoice.clientName || "Client"}</p>
                {client?.email && <p className="text-gray-600">{client.email}</p>}
                {client?.address && <p className="text-gray-600 whitespace-pre-line">{client.address}</p>}
              </div>
              <div className="text-right">
                <div className="mb-3">
                  <p className="text-sm text-gray-500">Invoice Date</p>
                  <p className="font-medium">
                    {invoice.createdAt ? format(new Date(invoice.createdAt), "MMMM dd, yyyy") : "N/A"}
                  </p>
                </div>
                {invoice.dueDate && (
                  <div>
                    <p className="text-sm text-gray-500">Due Date</p>
                    <p className="font-medium">{format(new Date(invoice.dueDate), "MMMM dd, yyyy")}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Line Items */}
            <div className="mb-8">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left py-3 text-sm font-medium text-gray-500 uppercase tracking-wide">
                      Description
                    </th>
                    <th className="text-right py-3 text-sm font-medium text-gray-500 uppercase tracking-wide w-24">
                      Qty
                    </th>
                    <th className="text-right py-3 text-sm font-medium text-gray-500 uppercase tracking-wide w-32">
                      Rate
                    </th>
                    <th className="text-right py-3 text-sm font-medium text-gray-500 uppercase tracking-wide w-32">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {lineItems.map((item: any, index: number) => {
                    const qty = parseFloat(item.quantity || 0);
                    const rate = parseFloat(item.rate || 0);
                    const amount = qty * rate;
                    return (
                      <tr key={index} className="border-b border-gray-100">
                        <td className="py-4">
                          <p className="font-medium">{item.description || "Item"}</p>
                        </td>
                        <td className="py-4 text-right text-gray-600">{qty}</td>
                        <td className="py-4 text-right text-gray-600">${rate.toFixed(2)}</td>
                        <td className="py-4 text-right font-medium">${amount.toFixed(2)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="flex justify-end mb-8">
              <div className="w-64">
                <div className="flex justify-between py-2">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">${subtotal.toFixed(2)}</span>
                </div>
                {taxRate > 0 && (
                  <div className="flex justify-between py-2">
                    <span className="text-gray-600">Tax ({taxRate}%)</span>
                    <span className="font-medium">${taxAmount.toFixed(2)}</span>
                  </div>
                )}
                <Separator className="my-2" />
                <div className="flex justify-between py-2">
                  <span className="text-lg font-semibold">Total</span>
                  <span className="text-lg font-bold text-[#004C6D]">${total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Terms */}
            {invoice.notes && (
              <div className="mb-8">
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">Notes</h3>
                <p className="text-gray-600 whitespace-pre-line">{invoice.notes}</p>
              </div>
            )}

            {invoice.terms && (
              <div className="mb-8">
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">Terms & Conditions</h3>
                <p className="text-gray-600 whitespace-pre-line text-sm">{invoice.terms}</p>
              </div>
            )}

            {/* Payment Section */}
            {invoice.paymentLink && (
              <div className="bg-[#004C6D]/5 border border-[#004C6D]/20 rounded-lg p-6 text-center">
                <h3 className="font-semibold text-[#004C6D] mb-2">Pay Online</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Click the button below to pay this invoice securely online.
                </p>
                <a
                  href={invoice.paymentLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block bg-[#004C6D] text-white px-6 py-2 rounded-lg font-medium hover:bg-[#003a54] transition-colors"
                >
                  Pay ${total.toFixed(2)}
                </a>
              </div>
            )}

            {/* Footer */}
            <div className="mt-12 pt-6 border-t text-center text-sm text-gray-500">
              <p>Thank you for your business!</p>
            </div>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          @page {
            size: A4;
            margin: 0.5in;
          }
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }
      `}</style>
    </>
  );
}
