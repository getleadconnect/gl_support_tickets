import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Printer, Check, Download } from 'lucide-react';
import toast from 'react-hot-toast';

interface AddInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticketId: number;
  customerId: number;
  customerName: string;
}

export function AddInvoiceModal({
  isOpen,
  onClose,
  ticketId,
  customerId,
  customerName
}: AddInvoiceModalProps) {
  const [loading, setLoading] = useState(false);
  const [serviceCharge, setServiceCharge] = useState<string>('');
  const [discount, setDiscount] = useState<string>('');
  const [paidAmount, setPaidAmount] = useState<string>('');
  const [balanceDue, setBalanceDue] = useState<string>('0');
  const [paymentMode, setPaymentMode] = useState<string>('');
  const [serviceType, setServiceType] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [productTotal, setProductTotal] = useState<number>(0);
  const [products, setProducts] = useState<any[]>([]);
  const [checkingInvoice, setCheckingInvoice] = useState(true);
  const [invoiceExists, setInvoiceExists] = useState(false);
  const [existingInvoice, setExistingInvoice] = useState<any>(null);
  const [invoiceCreated, setInvoiceCreated] = useState(false);
  const [createdInvoiceId, setCreatedInvoiceId] = useState<number | null>(null);
  const [pdfModalOpen, setPdfModalOpen] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string>('');
  const [loadingPdf, setLoadingPdf] = useState(false);

  const handleClose = () => {
    // Reset states when closing
    setServiceCharge('');
    setDiscount('');
    setPaidAmount('');
    setBalanceDue('0');
    setPaymentMode('');
    setServiceType('');
    setDescription('');
    setInvoiceExists(false);
    setExistingInvoice(null);
    setCheckingInvoice(true);
    setInvoiceCreated(false);
    setCreatedInvoiceId(null);
    setPdfModalOpen(false);
    setPdfUrl('');
    setLoadingPdf(false);
    onClose();
  };

  useEffect(() => {
    if (isOpen && ticketId) {
      checkExistingInvoice();
    }
  }, [isOpen, ticketId]);

  const checkExistingInvoice = async () => {
    setCheckingInvoice(true);
    try {
      const response = await axios.get(`/invoices/check-ticket/${ticketId}`);
      if (response.data.exists) {
        setInvoiceExists(true);
        setExistingInvoice(response.data.invoice);
      } else {
        setInvoiceExists(false);
        fetchTicketProducts();
      }
    } catch (error) {
      console.error('Error checking existing invoice:', error);
      setInvoiceExists(false);
      fetchTicketProducts();
    } finally {
      setCheckingInvoice(false);
    }
  };

  const fetchTicketProducts = async () => {
    try {
      const response = await axios.get(`/tickets/${ticketId}/spare-parts`);
      const productsData = response.data || [];
      setProducts(productsData);
      
      // Calculate total from products using total_price column
      const total = productsData.reduce((sum: number, item: any) => {
        return sum + (parseFloat(item.total_price) || 0);
      }, 0);
      setProductTotal(total);
    } catch (error) {
      console.error('Error fetching ticket products:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!paymentMode) {
      toast.error('Please select a payment mode');
      return;
    }

    if (!serviceCharge || parseFloat(serviceCharge) < 0) {
      toast.error('Please enter a valid service charge');
      return;
    }

    if (!paidAmount || parseFloat(paidAmount) < 0) {
      toast.error('Please enter a valid paid amount');
      return;
    }

    setLoading(true);
    
    try {
      const totalWithoutDiscount = productTotal + (parseFloat(serviceCharge) || 0);
      
      const invoiceData = {
        ticket_id: ticketId,
        customer_id: customerId,
        item_cost: productTotal,
        service_charge: parseFloat(serviceCharge) || 0,
        discount: parseFloat(discount) || 0,
        total_amount: totalWithoutDiscount,  // Total without discount
        net_amount: grandTotal,              // Total after discount
        paid_amount: parseFloat(paidAmount) || 0,
        balance_due: parseFloat(balanceDue) || 0,
        payment_mode: paymentMode,
        payment_status: 'paid',
        invoice_date: new Date().toISOString().split('T')[0],
        service_type: serviceType || null,
        description: description || null,
        products: products.map(p => ({
          product_id: p.product_id,
          quantity: p.quantity,
          price: p.price,
          total: p.total_price
        }))
      };

      const response = await axios.post('/invoices', invoiceData);
      
      if (response.data) {
        setCreatedInvoiceId(response.data.invoice.id);
        setInvoiceCreated(true);
        toast.success('Invoice created successfully');
      }
    } catch (error: any) {
      console.error('Error creating invoice:', error);
      toast.error(error.response?.data?.message || 'Failed to create invoice');
    } finally {
      setLoading(false);
    }
  };

  const grandTotal = productTotal + (parseFloat(serviceCharge) || 0) - (parseFloat(discount) || 0);

  // Update balance due when paid amount or grand total changes
  useEffect(() => {
    const paid = parseFloat(paidAmount) || 0;
    const balance = Math.max(0, grandTotal - paid);
    setBalanceDue(balance.toFixed(2));
  }, [paidAmount, grandTotal]);

  const handlePrintInvoice = async () => {
    if (!createdInvoiceId) return;
    
    try {
      setLoadingPdf(true);
      setPdfModalOpen(true);
      
      const response = await axios.get(`/invoices/${createdInvoiceId}/download`, {
        responseType: 'blob',
        headers: {
          'Accept': 'application/pdf',
        }
      });

      // Create blob URL for iframe
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      setPdfUrl(url);
      setLoadingPdf(false);
    } catch (error) {
      console.error('Error loading invoice PDF:', error);
      setLoadingPdf(false);
      setPdfModalOpen(false);
      toast.error('Failed to load invoice PDF');
    }
  };

  const closePdfModal = () => {
    if (pdfUrl) {
      window.URL.revokeObjectURL(pdfUrl);
    }
    setPdfUrl('');
    setPdfModalOpen(false);
    setLoadingPdf(false);
    // Reset all states and close the main modal
    handleClose();
  };

  const handleDownloadPdf = () => {
    if (pdfUrl) {
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.setAttribute('download', 'invoice.pdf');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Invoice PDF downloaded successfully');
    }
  };

  return (
    <>
    <Dialog open={isOpen && !pdfModalOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Invoice</DialogTitle>
        </DialogHeader>
        
        {checkingInvoice ? (
          <div className="text-center py-8">
            <p>Checking for existing invoice...</p>
          </div>
        ) : invoiceExists ? (
          <div className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-yellow-800 font-semibold">Invoice Already Exists</p>
              <p className="text-yellow-700 text-sm mt-2">
                An invoice has already been created for this ticket.
              </p>
              {existingInvoice && (
                <div className="mt-3 text-sm text-yellow-700">
                  <p><strong>Invoice ID:</strong> {existingInvoice.invoice_id}</p>
                  <p><strong>Date:</strong> {new Date(existingInvoice.invoice_date).toLocaleDateString()}</p>
                  <p><strong>Total:</strong> ₹{existingInvoice.total_amount}</p>
                  <p><strong>Status:</strong> {existingInvoice.status}</p>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button type="button" onClick={handleClose}>
                Close
              </Button>
            </DialogFooter>
          </div>
        ) : invoiceCreated ? (
          <div className="space-y-6">
            <div className="flex flex-col items-center justify-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <Check className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Invoice Created Successfully!</h3>
              <p className="text-sm text-gray-600 text-center">
                Your invoice has been created successfully. You can now print or download the invoice.
              </p>
            </div>
            
            <div className="flex justify-center gap-3">
              <Button
                onClick={handlePrintInvoice}
                className="bg-white hover:bg-gray-50 text-blue-600 border border-blue-600"
              >
                <Printer className="h-4 w-4 text-red-500 mr-2" />
                Print Invoice
              </Button>
              <Button
                onClick={handleClose}
                variant="outline"
              >
                Close
              </Button>
            </div>
          </div>
        ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {products.length > 0 && (
            <div className="space-y-2">
              <Label>Products Used</Label>
              <div className="border rounded-lg p-3 max-h-32 overflow-y-auto">
                {products.map((product, index) => (
                  <div key={index} className="flex justify-between text-sm py-1">
                    <span>{product.product?.name || 'Unknown Product'} x {product.quantity}</span>
                    <span>₹{product.total_price}</span>
                  </div>
                ))}
                <div className="border-t mt-2 pt-2 flex justify-between font-medium">
                  <span>Products Total:</span>
                  <span>₹{productTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="serviceCharge">Service Charge</Label>
              <Input
                id="serviceCharge"
                type="number"
                step="0.01"
                min="0"
                placeholder="Enter service charge"
                value={serviceCharge}
                onChange={(e) => setServiceCharge(e.target.value)}
                className="mt-1"
                required
              />
            </div>

            <div>
              <Label htmlFor="discount">Discount</Label>
              <Input
                id="discount"
                type="number"
                step="0.01"
                min="0"
                placeholder="Enter discount amount"
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="paidAmount">Paid Amount</Label>
              <Input
                id="paidAmount"
                type="number"
                step="0.01"
                min="0"
                placeholder="Enter paid amount"
                value={paidAmount}
                onChange={(e) => setPaidAmount(e.target.value)}
                className="mt-1"
                required
              />
            </div>

            <div>
              <Label htmlFor="balanceDue">Balance Due</Label>
              <Input
                id="balanceDue"
                type="number"
                step="0.01"
                min="0"
                placeholder="Auto calculated"
                value={balanceDue}
                readOnly
                className="mt-1 bg-gray-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="serviceType">Service Type</Label>
              <Select value={serviceType} onValueChange={setServiceType}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select service type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Shop">Shop</SelectItem>
                  <SelectItem value="Outsource">Outsource</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="paymentMode">Payment Mode</Label>
              <Select value={paymentMode} onValueChange={setPaymentMode} required>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select payment mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Cash">Cash</SelectItem>
                  <SelectItem value="Card">Card</SelectItem>
                  <SelectItem value="UPI">UPI</SelectItem>
                  <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                  <SelectItem value="Credit">Credit</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Enter description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 min-h-[80px]"
              maxLength={1000}
            />
          </div>

          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="flex justify-between text-sm mb-1">
              <span>Item Cost:</span>
              <span>₹{productTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm mb-1">
              <span>Service Charge:</span>
              <span>₹{(parseFloat(serviceCharge) || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm mb-2 border-t pt-2">
              <span className="font-medium">Subtotal:</span>
              <span className="font-medium">₹{(productTotal + (parseFloat(serviceCharge) || 0)).toFixed(2)}</span>
            </div>
            {(parseFloat(discount) || 0) > 0 && (
              <div className="flex justify-between text-sm mb-2 text-green-600">
                <span>Discount:</span>
                <span>-₹{(parseFloat(discount) || 0).toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between font-semibold text-base border-t pt-2">
              <span>Net Amount:</span>
              <span>₹{grandTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm mt-2 text-blue-600">
              <span>Paid Amount:</span>
              <span>₹{(parseFloat(paidAmount) || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm mt-1 text-orange-600 font-medium">
              <span>Balance Due:</span>
              <span>₹{(parseFloat(balanceDue) || 0).toFixed(2)}</span>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Invoice'}
            </Button>
          </DialogFooter>
        </form>
        )}
      </DialogContent>
    </Dialog>

    {/* PDF Preview Modal */}
    <Dialog open={pdfModalOpen} onOpenChange={closePdfModal}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col" style={{ height: '90vh' }}>
        <DialogHeader style={{ height: '50px' }} className="flex-shrink-0 flex items-center">
          <DialogTitle>Invoice PDF Preview</DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 flex flex-col" style={{ minHeight: '0' }}>
          {loadingPdf ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span>Loading PDF...</span>
              </div>
            </div>
          ) : (
            <iframe
              src={pdfUrl}
              className="w-full flex-1 border-0"
              title="Invoice PDF Preview"
            />
          )}
        </div>
        
        <div className="flex-shrink-0 flex justify-end space-x-2 pt-4">
          <Button
            onClick={handleDownloadPdf}
            disabled={loadingPdf || !pdfUrl}
          >
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
          <Button onClick={closePdfModal} variant="outline">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
    </>
  );
}