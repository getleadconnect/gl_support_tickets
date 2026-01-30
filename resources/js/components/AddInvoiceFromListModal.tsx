import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { AddInvoiceModal } from './AddInvoiceModal';
import { Loader2 } from 'lucide-react';
import jQuery from 'jquery';
import select2Factory from 'select2';
import 'select2/dist/css/select2.min.css';

// Initialize select2 on jQuery
select2Factory(jQuery);

// Make jQuery available globally
(window as any).jQuery = jQuery;
(window as any).$ = jQuery;

interface Ticket {
  id: number;
  tracking_number: string;
  issue: string;
  customer_id: number;
  customer?: {
    id: number;
    name: string;
    mobile: string;
    country_code: string;
  };
}

interface AddInvoiceFromListModalProps {
  isOpen: boolean;
  onClose: () => void;
  verifiedTickets: Ticket[];
  loading: boolean;
}

export function AddInvoiceFromListModal({
  isOpen,
  onClose,
  verifiedTickets,
  loading
}: AddInvoiceFromListModalProps) {
  const [invoiceType, setInvoiceType] = useState<string>('');
  const [selectedTicketId, setSelectedTicketId] = useState<string>('');
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [paymentDues, setPaymentDues] = useState<any[]>([]);
  const [loadingDues, setLoadingDues] = useState(false);
  const [showGstAlert, setShowGstAlert] = useState(false);
  const ticketSelectRef = useRef<HTMLSelectElement>(null);

  // Initialize Select2
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    if (verifiedTickets.length === 0) {
      return;
    }

    const timeoutId = setTimeout(() => {
      if (!ticketSelectRef.current) {
        return;
      }

      const $ = jQuery;
      if (typeof $.fn.select2 !== 'function') {
        console.error('Select2 is not available on jQuery');
        return;
      }

      const $select = $(ticketSelectRef.current);

      // Find the dialog/modal container for proper dropdown rendering
      const $modalContainer = $select.closest('[role="dialog"]');

      // Destroy existing instance if any
      if ($select.data('select2')) {
        $select.select2('destroy');
      }

      $select.select2({
        placeholder: 'Choose a verified ticket...',
        allowClear: true,
        width: '100%',
        minimumResultsForSearch: 0, // Always show search box
        dropdownParent: $modalContainer.length > 0 ? $modalContainer : $select.parent(),
        templateResult: function(ticket: any) {
          if (!ticket.id) {
            return ticket.text;
          }
          const ticketData = verifiedTickets.find(t => t.id === parseInt(ticket.id));
          if (ticketData) {
            const issueText = ticketData.issue.length > 50 ? ticketData.issue.substring(0, 50) + '...' : ticketData.issue;
            const $result = $('<div style="width:300px !important;"></div>');
            $result.html(`
              <div style="font-size: 13px;">
                <div style="font-weight: 500;">${ticketData.tracking_number} - ${issueText}</div>
                <div style="color: #374151; font-size: 12px; margin-top: 2px;">
                  Customer: ${ticketData.customer?.name || 'N/A'} (${ticketData.customer?.country_code || ''} ${ticketData.customer?.mobile || ''})
                </div>
              </div>
            `);
            return $result;
          }
          return ticket.text;
        },
        templateSelection: function(ticket: any) {
          if (!ticket.id) {
            return ticket.text;
          }
          const ticketData = verifiedTickets.find(t => t.id === parseInt(ticket.id));
          if (ticketData) {
            const issueText = ticketData.issue.length > 60 ? ticketData.issue.substring(0, 60) + '...' : ticketData.issue;
            return `${ticketData.tracking_number} - ${issueText}`;
          }
          return ticket.text;
        }
      });

      // Apply height styling
      const $container = $select.next('.select2-container');
      $container.find('.select2-selection--single').css({
        'height': '38px',
        'display': 'flex',
        'align-items': 'center'
      });

      $container.find('.select2-selection__clear').css({
        'padding-left': '8px'
      });

      // Ensure dropdown has proper z-index (higher than modal overlay)
      $('.select2-dropdown').css({
        'z-index': '10000'
      });

      $select.on('change', function() {
        const value = $(this).val() as string;
        if (value) {
          handleTicketSelect(value);
        }
      });

      // Set initial value if there's a selected ticket
      if (selectedTicketId) {
        $select.val(selectedTicketId).trigger('change.select2');
      }

    }, 300);

    return () => {
      clearTimeout(timeoutId);
      try {
        const $select = jQuery(ticketSelectRef.current);
        if ($select.data('select2')) {
          $select.select2('destroy');
        }
      } catch (error) {
        // Silently fail
      }
    };
  }, [isOpen, verifiedTickets, selectedTicketId]);

  const fetchCustomerPaymentDues = async (customerId: number) => {
    setLoadingDues(true);
    try {
      const response = await axios.get(`/invoices/customer-payment-dues/${customerId}`);
      setPaymentDues(response.data || []);
    } catch (error) {
      console.error('Error fetching payment dues:', error);
      setPaymentDues([]);
    } finally {
      setLoadingDues(false);
    }
  };

  const handleTicketSelect = (ticketId: string) => {
    setSelectedTicketId(ticketId);
    const ticket = verifiedTickets.find(t => t.id.toString() === ticketId);
    setSelectedTicket(ticket || null);

    // Fetch payment dues for this customer
    if (ticket && ticket.customer_id) {
      fetchCustomerPaymentDues(ticket.customer_id);
    } else {
      setPaymentDues([]);
    }
  };

  const handleInvoiceTypeChange = async (type: string) => {
    // If "with_gst" is selected, check if GST value exists
    if (type === 'with_gst') {
      try {
        const response = await axios.get('/gst/rate');
        const gstValue = response.data?.gst;

        if (gstValue === null || gstValue === undefined) {
          // Show alert dialog if GST is not configured
          setShowGstAlert(true);
          return; // Don't proceed with selection
        }
      } catch (error) {
        console.error('Error checking GST rate:', error);
        setShowGstAlert(true);
        return;
      }
    }

    setInvoiceType(type);
    // Reset ticket selection when changing invoice type
    setSelectedTicketId('');
    setSelectedTicket(null);
    setPaymentDues([]);
  };

  const handleProceed = () => {
    if (selectedTicket) {
      setShowInvoiceModal(true);
    }
  };

  const handleClose = () => {
    setInvoiceType('');
    setSelectedTicketId('');
    setSelectedTicket(null);
    setShowInvoiceModal(false);
    setPaymentDues([]);
    onClose();
  };

  const handleInvoiceModalClose = () => {
    setShowInvoiceModal(false);
    // Optionally close the main modal too or refresh the invoices list
    handleClose();
  };

  if (showInvoiceModal && selectedTicket) {
    return (
      <AddInvoiceModal
        isOpen={true}
        onClose={handleInvoiceModalClose}
        ticketId={selectedTicket.id}
        customerId={selectedTicket.customer_id}
        customerName={selectedTicket.customer?.name || ''}
        invoiceType={invoiceType}
      />
    );
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg overflow-visible" style={{maxHeight: '90vh'}}>
        <DialogHeader>
          <DialogTitle>Select Ticket for Invoice</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4 overflow-visible" style={{maxHeight: 'calc(90vh - 120px)', overflowY: 'auto'}}>
          {/* Invoice Type Selection */}
          <div className="space-y-2">
            <Label htmlFor="invoice-type">
              Invoice Type
            </Label>
            <select
              id="invoice-type"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none "
              value={invoiceType}
              onChange={(e) => handleInvoiceTypeChange(e.target.value)}
            >
              <option value="">Select Type</option>
              <option value="without_gst">Without GST</option>
              <option value="with_gst">With GST</option>
            </select>
          </div>

          {/* Ticket Selection - Always visible */}
          <div className="space-y-2">
            <Label htmlFor="ticket-select">
              Select Verified Ticket
            </Label>

            {loading ? (
              <div className="flex items-center justify-center p-4">
                <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
                <span className="ml-2 text-sm text-gray-500">Loading verified tickets...</span>
              </div>
            ) : (
              <select
                ref={ticketSelectRef}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={selectedTicketId}
                onChange={(e) => handleTicketSelect(e.target.value)}
              >
                <option value="">Choose a verified ticket...</option>
                {verifiedTickets.map((ticket) => (
                  <option key={ticket.id} value={ticket.id.toString()}>
                    {ticket.tracking_number} - {ticket.issue}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Ticket Details - Show for both GST types */}
          {invoiceType && selectedTicket && (
            <div className="mt-4 space-y-4">
              <div className="p-3 bg-gray-50 rounded-lg w-full overflow-hidden">
                <h4 className="text-sm font-medium mb-2">Selected Ticket Details:</h4>
                <div className="space-y-1 text-sm">
                  <div><strong>Tracking Number:</strong> {selectedTicket.tracking_number}</div>
                  <div className="break-words overflow-hidden"><strong>Issue:</strong> <span className="break-all whitespace-normal word-break-break-all" style={{wordBreak: 'break-all', overflowWrap: 'break-word'}} title={selectedTicket.issue}>{selectedTicket.issue.length > 80 ? selectedTicket.issue.substring(0, 80) + '...' : selectedTicket.issue}</span></div>
                  <div><strong>Customer:</strong> {selectedTicket.customer?.name}</div>
                  <div><strong>Mobile:</strong> {selectedTicket.customer?.country_code} {selectedTicket.customer?.mobile}</div>
                </div>
              </div>

              {/* Customer Payment Dues */}
              <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                <h4 className="text-sm font-medium mb-3 text-orange-800">Customer Payment Dues</h4>

                {loadingDues ? (
                  <div className="flex items-center justify-center p-2">
                    <Loader2 className="h-4 w-4 animate-spin text-orange-500 mr-2" />
                    <span className="text-sm text-orange-600">Loading payment dues...</span>
                  </div>
                ) : paymentDues.length === 0 ? (
                  <div className="text-sm text-green-600 text-center py-2">
                    ✅ No pending payment dues
                  </div>
                ) : (
                  <div className="space-y-2">
                    {/* Individual dues */}
                    <div className="space-y-1">
                      {paymentDues.map((due, index) => (
                        <div key={due.id || index} className="flex justify-between items-center text-sm bg-white p-2 rounded ">
                          <span className="text-gray-700">
                            Invoice #{due.invoice?.invoice_id || `INV-${due.invoice_id}`}
                            {due.ticket && ` (${due.ticket.tracking_number})`}
                          </span>
                          <span className="font-medium text-red-600">
                            ₹{parseFloat(due.balance_due || 0).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Total dues */}
                    <div className="border-t pt-2 mt-2">
                      <div className="flex justify-between items-center font-semibold text-base">
                        <span className="text-orange-800">Total Outstanding:</span>
                        <span className="text-red-700">
                          ₹{paymentDues.reduce((total, due) => total + parseFloat(due.balance_due || 0), 0).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={handleProceed}
            disabled={!invoiceType || !selectedTicket || loading}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            Proceed to Create Invoice
          </Button>
        </div>
      </DialogContent>
    </Dialog>

      {/* GST Not Configured Alert Dialog */}
      <AlertDialog open={showGstAlert} onOpenChange={setShowGstAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>GST Rate Not Configured</AlertDialogTitle>
            <AlertDialogDescription>
              The GST rate has not been configured in the system. Please configure the GST rate in the General Options page before creating invoices with GST.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowGstAlert(false)}>
              OK
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}