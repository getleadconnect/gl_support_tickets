import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle, X } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

interface VerifyTicketModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ticketId: number;
  ticketIssue: string;
  onSuccess: () => void;
}

export default function VerifyTicketModal({
  open,
  onOpenChange,
  ticketId,
  ticketIssue,
  onSuccess,
}: VerifyTicketModalProps) {
  const [remarks, setRemarks] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!remarks.trim()) {
      toast.error('Please enter remarks for verification');
      return;
    }

    setLoading(true);
    try {
      // Format date for MySQL (YYYY-MM-DD HH:MM:SS)
      const now = new Date();
      const mysqlDateTime = now.getFullYear() + '-' + 
        String(now.getMonth() + 1).padStart(2, '0') + '-' + 
        String(now.getDate()).padStart(2, '0') + ' ' + 
        String(now.getHours()).padStart(2, '0') + ':' + 
        String(now.getMinutes()).padStart(2, '0') + ':' + 
        String(now.getSeconds()).padStart(2, '0');

      await axios.put(`/tickets/${ticketId}/verify`, {
        remarks: remarks.trim(),
        verified_at: mysqlDateTime
      });
      
      toast.success('Ticket verified successfully');
      onSuccess();
      onOpenChange(false);
      setRemarks('');
    } catch (error) {
      console.error('Error verifying ticket:', error);
      toast.error('Failed to verify ticket');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onOpenChange(false);
      setRemarks('');
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Verify Ticket
          </DialogTitle>
          <DialogDescription>
            Verify ticket #{ticketId}: {ticketIssue}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="remarks" className="text-sm font-medium">
              Verification Remarks <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="remarks"
              placeholder="Enter verification remarks or notes..."
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="min-h-[120px] resize-none"
              disabled={loading}
            />
            <p className="text-xs text-gray-500">
              Please provide details about the verification of this ticket
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={loading}
          >
            <X className="h-4 w-4 mr-1" />
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={loading || !remarks.trim()}
            className="bg-green-600 hover:bg-green-700"
          >
            <CheckCircle className="h-4 w-4 mr-1" />
            {loading ? 'Verifying...' : 'Verify Ticket'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}