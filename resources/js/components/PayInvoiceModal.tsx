import React, { useState } from 'react';
import axios from 'axios';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import toast from 'react-hot-toast';

interface PayInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: any;
  onPaymentSuccess: () => void;
}

export function PayInvoiceModal({
  isOpen,
  onClose,
  invoice,
  onPaymentSuccess
}: PayInvoiceModalProps) {
  const [loading, setLoading] = useState(false);
  const [discount, setDiscount] = useState<string>('0');
  const [paymentMode, setPaymentMode] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!paymentMode) {
      toast.error('Please select a payment mode');
      return;
    }

    // Check if discount exceeds service charge
    const discountValue = parseFloat(discount) || 0;
    if (discountValue > invoice.service_charge) {
      toast.error('Discount cannot exceed service charge');
      return;
    }

    setLoading(true);
    
    try {
      const paymentData = {
        payment_mode: paymentMode,
        discount: parseFloat(discount) || 0
      };

      const response = await (window as any).axios.post(`/invoices/${invoice.id}/payment`, paymentData);
      
      if (response.data) {
        toast.success('Payment recorded successfully');
        onPaymentSuccess();
        handleClose();
      }
    } catch (error: any) {
      console.error('Error recording payment:', error);
      toast.error(error.response?.data?.message || 'Failed to record payment');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setDiscount('0');
    setPaymentMode('');
    onClose();
  };

  const finalAmount = invoice ? (invoice.total_amount - (parseFloat(discount) || 0)) : 0;

  if (!invoice) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md p-0">
        <DialogHeader className="bg-[#5a4b81] text-white p-4 rounded-t-lg">
          <DialogTitle className="text-white">
            Add Invoice
          </DialogTitle>
        </DialogHeader>
        <div className="p-6">
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label className="text-sm font-medium">Invoice Id</Label>
            <div className="mt-1 p-2 bg-gray-50 rounded text-sm">
              {invoice.invoice_id}
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium">Service Charge</Label>
            <div className="mt-1 p-2 bg-gray-50 rounded text-sm">
              {invoice.service_charge}
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium">Item Cost</Label>
            <div className="mt-1 p-2 bg-gray-50 rounded text-sm">
              {invoice.item_cost}
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium">Total Amount</Label>
            <div className="mt-1 p-2 bg-gray-50 rounded text-sm font-semibold">
              {invoice.total_amount}
            </div>
          </div>

          <div>
            <Label htmlFor="discount" className="text-sm font-medium">Discount</Label>
            <Input
              id="discount"
              type="number"
              step="0.01"
              min="0"
              max={invoice.service_charge}
              placeholder="Enter discount amount"
              value={discount}
              onChange={(e) => setDiscount(e.target.value)}
              className="mt-1"
            />
            {parseFloat(discount) > invoice.service_charge && (
              <p className="text-xs text-red-500 mt-1">
                Discount cannot exceed service charge (₹{invoice.service_charge})
              </p>
            )}
          </div>

          <div>
            <Label className="text-sm font-medium">Final Amount</Label>
            <div className="mt-1 p-2 bg-green-50 rounded text-sm font-semibold text-green-700">
              ₹{finalAmount.toFixed(2)}
            </div>
          </div>

          <div>
            <Label htmlFor="paymentMode" className="text-sm font-medium">Payment Mode</Label>
            <Select value={paymentMode} onValueChange={setPaymentMode} required>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="select" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Cash">Cash</SelectItem>
                <SelectItem value="Card">Card</SelectItem>
                <SelectItem value="UPI">UPI</SelectItem>
                <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                <SelectItem value="Online">Online</SelectItem>
                <SelectItem value="Credit">Credit</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button 
              type="submit" 
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {loading ? 'Processing...' : 'Submit'}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleClose} 
              disabled={loading}
              className="bg-red-500 hover:bg-red-600 text-white border-red-500"
            >
              Cancel
            </Button>
          </div>
        </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}