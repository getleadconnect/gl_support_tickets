import React, { useState, useEffect } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Loader2, Package, Wrench, Receipt, User, Calendar, Building } from 'lucide-react';
import { format } from 'date-fns';

interface InvoiceDetailsOffcanvasProps {
  isOpen: boolean;
  onClose: () => void;
  invoiceId: number | null;
}

interface SparePart {
  id: number;
  product_id: number;
  product_name: string;
  product_code: string;
  brand: string;
  category: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

interface InvoiceDetails {
  invoice: any;
  spare_parts: SparePart[];
  breakdown: {
    parts_total: number;
    service_charge: number;
    sub_total: number;
    discount: number;
    grand_total: number;
  };
  payment: any;
}

export function InvoiceDetailsOffcanvas({
  isOpen,
  onClose,
  invoiceId,
}: InvoiceDetailsOffcanvasProps) {
  const [loading, setLoading] = useState(false);
  const [invoiceDetails, setInvoiceDetails] = useState<InvoiceDetails | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && invoiceId) {
      fetchInvoiceDetails();
    } else {
      // Clear data when closing
      setInvoiceDetails(null);
      setError(null);
    }
  }, [isOpen, invoiceId]);

  const fetchInvoiceDetails = async () => {
    if (!invoiceId) return;

    setLoading(true);
    setError(null);
    try {
      const response = await (window as any).axios.get(`/invoices/${invoiceId}/details`);
      setInvoiceDetails(response.data);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.response?.data?.error || 'Failed to fetch invoice details';
      setError(errorMessage);
      console.error('Error fetching invoice details:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const statusVariants: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      paid: 'bg-green-100 text-green-800',
      partial: 'bg-blue-100 text-blue-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return statusVariants[status?.toLowerCase()] || 'bg-gray-100 text-gray-800';
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-[500px] sm:max-w-[500px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Invoice Details
          </SheetTitle>
          <SheetDescription>
            Complete breakdown of invoice charges and parts
          </SheetDescription>
        </SheetHeader>

        {loading && (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
          </div>
        )}

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {!loading && !error && invoiceDetails && invoiceDetails.invoice && (
          <div className="mt-6 space-y-3">
            {/* Invoice Header Information */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-500">Invoice ID</p>
                  <p className="font-semibold text-lg">{invoiceDetails.invoice.invoice_id}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-500 flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Invoice Date
                  </p>
                  <p className="font-medium">
                    {format(new Date(invoiceDetails.invoice.invoice_date), 'dd MMM yyyy')}
                  </p>
                </div>
                <Badge className={getStatusBadge(invoiceDetails.invoice.status || 'pending')}>
                  {invoiceDetails.invoice.status || 'Pending'}
                </Badge>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                      <User className="h-3 w-3" />
                      Customer
                    </p>
                    <p className="font-medium">
                      {invoiceDetails.invoice.customer?.name || 'N/A'}
                    </p>
                    {invoiceDetails.invoice.customer?.mobile && (
                      <p className="text-sm text-gray-600">
                        {invoiceDetails.invoice.customer.country_code}
                        {invoiceDetails.invoice.customer.mobile}
                      </p>
                    )}
                  </div>
                  {invoiceDetails.invoice.branch && (
                    <div className="text-center">
                      <p className="text-sm text-gray-500 flex items-center gap-1">
                        <Building className="h-3 w-3" />
                        Branch
                      </p>
                      <p className="font-medium">
                        {invoiceDetails.invoice.branch.branch_name}
                      </p>
                    </div>
                  )}
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Ticket ID</p>
                    <p className="font-medium">#{invoiceDetails.invoice.ticket_id}</p>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Spare Parts Section */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-purple-600" />
                <h3 className="font-semibold text-base">Spare Parts Used</h3>
              </div>

              {invoiceDetails.spare_parts.length > 0 ? (
                <div>
                  {invoiceDetails.spare_parts.map((part, index) => (
                    <div
                      key={part.id}
                      className="py-3 border-b"
                      style={{ borderColor: '#e4e4e4' }}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex justify-between items-center">
                            <p className="font-medium text-sm">{part.product_name}</p>
                            <div className="flex items-center gap-3 text-sm">
                              <span className="text-gray-600">
                                {part.quantity} × {formatCurrency(part.unit_price)}
                              </span>
                              <span className="font-semibold">
                                = {formatCurrency(part.total_price)}
                              </span>
                            </div>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            Code: {part.product_code} | {part.brand} - {part.category}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500 bg-gray-50 rounded-lg">
                  No spare parts used
                </div>
              )}
            </div>

            <Separator />

            {/* Service Charges Section */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Wrench className="h-5 w-5 text-purple-600" />
                <h3 className="font-semibold text-base">Service Charges</h3>
              </div>
              <div className="py-3 border-b" style={{ borderColor: '#e4e4e4' }}>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Service Charge</span>
                  <span className="font-semibold">
                    {formatCurrency(invoiceDetails.breakdown.service_charge)}
                  </span>
                </div>
              </div>
            </div>

            <Separator />

            {/* Total Breakdown Section */}
            <div className="space-y-3 bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-base">Total Charges</h3>

              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Parts Total</span>
                  <span>{formatCurrency(invoiceDetails.breakdown.parts_total)}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Service Charge</span>
                  <span>{formatCurrency(invoiceDetails.breakdown.service_charge)}</span>
                </div>

                <div className="pt-2 border-t">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Sub Total</span>
                    <span>{formatCurrency(invoiceDetails.breakdown.sub_total)}</span>
                  </div>
                </div>

                {(invoiceDetails.invoice.discount > 0 || invoiceDetails.breakdown.discount > 0) && (
                  <div className="flex justify-between items-center text-sm text-green-600">
                    <span>Discount</span>
                    <span>- {formatCurrency(invoiceDetails.invoice.discount || invoiceDetails.breakdown.discount)}</span>
                  </div>
                )}

                <div className="pt-2 border-t">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-lg">Grand Total</span>
                    <span className="font-bold text-lg text-purple-600">
                      {formatCurrency(invoiceDetails.invoice.net_amount || invoiceDetails.breakdown.grand_total)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Information */}
            {invoiceDetails.invoice.status?.toLowerCase() === 'paid' && (
              <>
                <Separator />
                <div className="space-y-3">
                  <h3 className="font-semibold text-base">Payment Information</h3>
                  <div className="border rounded-lg p-3 space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Payment Method</span>
                      <span className="font-medium">
                        {invoiceDetails.invoice.payment_method || 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Amount Paid</span>
                      <span className="font-medium">
                        {formatCurrency(invoiceDetails.invoice.net_amount || invoiceDetails.invoice.total_amount || 0)}
                      </span>
                    </div>
                    {invoiceDetails.payment?.payment_date && (
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">Payment Date</span>
                        <span className="font-medium">
                          {format(new Date(invoiceDetails.payment.payment_date), 'dd MMM yyyy')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}