import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Download, Printer, DollarSign, Eye, Trash2, Plus } from 'lucide-react';
import { PayInvoiceModal } from '@/components/PayInvoiceModal';
import { InvoiceDetailsOffcanvas } from '@/components/InvoiceDetailsOffcanvas';
import { AddInvoiceFromListModal } from '@/components/AddInvoiceFromListModal';
import toast from 'react-hot-toast';
import jQuery from 'jquery';
import select2Factory from 'select2';
import 'select2/dist/css/select2.min.css';

// Initialize select2 on jQuery
select2Factory(jQuery);

// Make jQuery available globally
(window as any).jQuery = jQuery;
(window as any).$ = jQuery;

interface Invoice {
  id: number;
  invoice_id: string;
  ticket_id: number;
  customer_id: number;
  invoice_date: string;
  service_type?: string;
  total_amount: number;
  discount?: number;
  gst_amount?: number;
  net_amount?: number;
  paid_amount?: number;
  balance_due?: number;
  status: string;
  payment_method: string;
  created_by: number;
  customer?: {
    id: number;
    name: string;
  };
  ticket?: {
    id: number;
  };
  createdBy?: {
    id: number;
    name: string;
  };
}

export default function Invoices() {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [entriesPerPage, setEntriesPerPage] = useState(50);
  const [searchTerm, setSearchTerm] = useState('');

  // Filter states
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [customers, setCustomers] = useState<any[]>([]);

  // Payment modal states
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  // Invoice details offcanvas states
  const [showDetailsOffcanvas, setShowDetailsOffcanvas] = useState(false);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<number | null>(null);

  // Delete states
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [pendingDeleteInvoice, setPendingDeleteInvoice] = useState<Invoice | null>(null);

  // PDF Preview modal states
  const [pdfModalOpen, setPdfModalOpen] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string>('');
  const [loadingPdf, setLoadingPdf] = useState(false);

  // Add Invoice modal states
  const [showAddInvoiceModal, setShowAddInvoiceModal] = useState(false);
  const [selectedTicketForInvoice, setSelectedTicketForInvoice] = useState<any>(null);
  const [verifiedTickets, setVerifiedTickets] = useState<any[]>([]);
  const [loadingVerifiedTickets, setLoadingVerifiedTickets] = useState(false);

  // Ref for Select2 customer dropdown
  const customerSelectRef = useRef<HTMLSelectElement>(null);

  useEffect(() => {
    fetchInvoices();
    fetchCustomers();
  }, [currentPage, entriesPerPage]);

  // Initialize Select2 for customer dropdown
  useEffect(() => {
    if (customers.length === 0) return;

    const timeoutId = setTimeout(() => {
      if (!customerSelectRef.current) return;

      const $ = jQuery;
      const $select = $(customerSelectRef.current);

      // Destroy existing instance if any
      if ($select.data('select2')) {
        $select.select2('destroy');
      }

      $select.select2({
        placeholder: 'Select Customer...',
        allowClear: true,
        width: '250px',
        minimumResultsForSearch: 0,
        dropdownAutoWidth: false,
        templateResult: function(customer: any) {
          if (!customer.id) {
            return customer.text;
          }
          const customerData = customers.find(c => c.id === parseInt(customer.id));
          if (!customerData) return customer.text;

          const $result = $('<div></div>');
          $result.html(`
            <span style="font-size: 13px;">${customerData.name}</span>
            ${customerData.mobile ? `<span style="color: #374151; font-size: 13px;"> (${customerData.country_code || ''} ${customerData.mobile})</span>` : ''}
          `);
          return $result;
        },
        templateSelection: function(customer: any) {
          if (!customer.id) {
            return customer.text;
          }
          const customerData = customers.find(c => c.id === parseInt(customer.id));
          if (!customerData) return customer.text;

          const $result = $('<div></div>');
          $result.html(`
            <span style="font-size: 13px;">${customerData.name}</span>
            ${customerData.mobile ? `<span style="color: #374151; font-size: 13px;"> (${customerData.country_code || ''} ${customerData.mobile})</span>` : ''}
          `);
          return $result;
        }
      });

      // Apply height styling to selection box
      const $container = $select.next('.select2-container');
      $container.find('.select2-selection--single').css({
        'height': '38px',
        'display': 'flex',
        'align-items': 'center'
      });

      $container.find('.select2-selection__clear').css({
        'padding-left': '8px'
      });

      // Style dropdown when it opens
      $select.on('select2:open', function() {
        const $dropdown = $('.select2-dropdown');
        $dropdown.css({
          'width': '250px',
          'z-index': '10000'
        });

        // Style search box
        $('.select2-search--dropdown .select2-search__field').css({
          'width': '100%',
          'padding': '6px 10px',
          'border': '1px solid #d1d5db',
          'border-radius': '4px',
          'font-size': '13px'
        });
      });

      $select.on('change', function() {
        const value = $(this).val() as string;
        setSelectedCustomer(value || '');
      });

      if (selectedCustomer) {
        $select.val(selectedCustomer).trigger('change.select2');
      }

    }, 300);

    return () => {
      clearTimeout(timeoutId);
      try {
        const $select = jQuery(customerSelectRef.current);
        if ($select.data('select2')) {
          $select.select2('destroy');
        }
      } catch (error) {
        // Silently fail
      }
    };
  }, [customers, selectedCustomer]);

  const fetchInvoices = async (clearFilters = false) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        per_page: entriesPerPage.toString(),
        search: clearFilters ? '' : searchTerm,
        start_date: clearFilters ? '' : startDate,
        end_date: clearFilters ? '' : endDate,
        customer_id: clearFilters ? '' : (selectedCustomer === 'all' ? '' : selectedCustomer),
        status: clearFilters ? '' : (selectedStatus === 'all' ? '' : selectedStatus)
      });

      const response = await axios.get(`/invoices?${params}`);
      
      if (response.data) {
        setInvoices(response.data.data || []);
        setTotalPages(response.data.last_page || 1);
        setTotalItems(response.data.total || 0);
        setCurrentPage(response.data.current_page || 1);
      }
    } catch (error) {
      console.error('Error fetching invoices:', error);
      toast.error('Failed to fetch invoices');
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomers = async () => {
    try {
      const response = await axios.get('/customers');
      setCustomers(response.data || []);
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  const handleFilter = () => {
    setCurrentPage(1);
    fetchInvoices();
  };

  const handleClearFilter = () => {
    setStartDate('');
    setEndDate('');
    setSelectedCustomer('all');
    setSelectedStatus('all');
    setSearchTerm('');
    setCurrentPage(1);
    fetchInvoices(true); // Pass true to clear filters
  };

  const handlePayClick = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = () => {
    setShowPaymentModal(false);
    setSelectedInvoice(null);
    fetchInvoices();
  };

  const handleViewDetails = (invoiceId: number) => {
    setSelectedInvoiceId(invoiceId);
    setShowDetailsOffcanvas(true);
  };

  const handleDeleteClick = (invoice: Invoice) => {
    setPendingDeleteInvoice(invoice);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!pendingDeleteInvoice) return;

    try {
      await axios.delete(`/invoices/${pendingDeleteInvoice.id}`);
      toast.success('Invoice deleted successfully');
      setDeleteConfirmOpen(false);
      setPendingDeleteInvoice(null);
      fetchInvoices();
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to delete invoice';
      toast.error(message);
    }
  };

  const handleDownloadInvoice = async (invoiceId: number) => {
    try {
      setLoadingPdf(true);
      setPdfModalOpen(true);
      
      const response = await axios.get(`/invoices/${invoiceId}/download`, {
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

  // Download PDF from preview modal
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

  // Close PDF modal and cleanup
  const closePdfModal = () => {
    if (pdfUrl) {
      window.URL.revokeObjectURL(pdfUrl);
    }
    setPdfUrl('');
    setPdfModalOpen(false);
    setLoadingPdf(false);
  };

  const handlePrintInvoice = async (invoiceId: number) => {
    try {
      const response = await axios.get(`/invoices/${invoiceId}/download`, {
        responseType: 'blob',
        headers: {
          'Accept': 'application/pdf',
        }
      });
      
      // Create blob URL and open in new tab
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      window.open(url, '_blank');
      
      // Clean up the URL after a short delay
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 1000);
      
      toast.success('Invoice opened in new tab');
    } catch (error) {
      console.error('Error printing invoice:', error);
      toast.error('Failed to open invoice');
    }
  };

  const fetchVerifiedTickets = async () => {
    setLoadingVerifiedTickets(true);
    try {
      const response = await axios.get('/tickets/verified');
      setVerifiedTickets(response.data || []);
    } catch (error) {
      console.error('Error fetching verified tickets:', error);
      toast.error('Failed to load verified tickets');
    } finally {
      setLoadingVerifiedTickets(false);
    }
  };

  const handleAddInvoice = async () => {
    await fetchVerifiedTickets();
    setShowAddInvoiceModal(true);
  };

  const handleTicketSelect = (ticketId: string) => {
    const selectedTicket = verifiedTickets.find(ticket => ticket.id.toString() === ticketId);
    setSelectedTicketForInvoice(selectedTicket);
  };

  const handleCloseAddInvoiceModal = async () => {
    setShowAddInvoiceModal(false);
    setSelectedTicketForInvoice(null);
    setVerifiedTickets([]);
    // Refresh invoices list when modal closes (in case an invoice was created)
    await fetchInvoices();
  };

  const getStatusBadge = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower === 'paid') {
      return <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">Paid</span>;
    } else if (statusLower === 'credit') {
      return <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">Credit</span>;
    } else {
      return <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">{status}</span>;
    }
  };

  const startIndex = (currentPage - 1) * entriesPerPage + 1;
  const endIndex = Math.min(startIndex + invoices.length - 1, totalItems);

  return (
    <DashboardLayout>
      <div className="container-fluid px-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-2">
          <h1 className="text-xl sm:text-2xl font-semibold">Invoices</h1>
          <div className="flex items-center gap-2 text-xs sm:text-sm">
            <Link to="/" className="text-gray-600 hover:text-gray-800">Home</Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-800">Invoices</span>
          </div>
        </div>

      {/* Filter Section */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium whitespace-nowrap">Filter By:</span>

          <Input
            type="date"
            placeholder="Start Date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            style={{width:'155px'}}
          />

          <Input
            type="date"
            placeholder="End Date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            style={{width:'155px'}}
          />

          <select
            ref={customerSelectRef}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            style={{width:'250px'}}
            value={selectedCustomer}
            onChange={(e) => setSelectedCustomer(e.target.value)}
          >
            <option value="">All Customers</option>
            {customers.map(customer => (
              <option key={customer.id} value={customer.id.toString()}>
                {customer.name} {customer.mobile ? `(${customer.country_code || ''} ${customer.mobile})` : ''}
              </option>
            ))}
          </select>

          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger style={{width:'155px'}}>
              <SelectValue placeholder="Select Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
            </SelectContent>
          </Select>

          <Button
            onClick={handleFilter}
          >
            Filter
          </Button>

          {(startDate || endDate || (selectedCustomer && selectedCustomer !== 'all') || (selectedStatus && selectedStatus !== 'all')) && (
            <Button
              onClick={handleClearFilter}
              variant="outline"
            >
              Clear
            </Button>
          )}

          <Button
            onClick={handleAddInvoice}
            className="ml-auto"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Invoice
          </Button>
        </div>
      </div>

      {/* Info Message - Default 3 Month Filter */}
      {!startDate && !endDate && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
          <div className="flex items-start gap-2">
            <div className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center mt-0.5">
              <span className="text-white text-xs font-semibold">i</span>
            </div>
            <p className="text-sm text-blue-700">
              Showing last 3 months data only. Use filters above to view different date ranges.
            </p>
          </div>
        </div>
      )}

      {/* Table Controls */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xs sm:text-sm">Show</span>
            <Select value={entriesPerPage.toString()} onValueChange={(value) => setEntriesPerPage(parseInt(value))}>
              <SelectTrigger className="w-16 sm:w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-xs sm:text-sm">entries</span>
          </div>
          
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs sm:text-sm">Search:</span>
            <Input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleFilter()}
              className="flex-1 sm:w-48"
              placeholder="Search invoices..."
            />
          </div>
        </div>

        {/* Desktop Table */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full border" style={{ borderColor: '#e4e4e4' }}>
            <thead>
              <tr className="border-b" style={{ borderColor: '#e4e4e4' }}>
                <th className="text-left p-2 text-sm font-medium border-r" style={{ borderColor: '#e4e4e4' }}>#</th>
                <th className="text-left p-2 text-sm font-medium border-r" style={{ borderColor: '#e4e4e4' }}>Invoice_id</th>
                <th className="text-left p-2 text-sm font-medium border-r" style={{ borderColor: '#e4e4e4' }}>Ticket Id</th>
                <th className="text-left p-2 text-sm font-medium border-r" style={{ borderColor: '#e4e4e4' }}>Customer</th>
                <th className="text-left p-2 text-sm font-medium border-r" style={{ borderColor: '#e4e4e4' }}>Inv.Date</th>
                <th className="text-left p-2 text-sm font-medium border-r" style={{ borderColor: '#e4e4e4' }}>Service Type</th>
                <th className="text-right p-2 text-sm font-medium border-r" style={{ borderColor: '#e4e4e4' }}>Total Amount</th>
                <th className="text-right p-2 text-sm font-medium border-r" style={{ borderColor: '#e4e4e4' }}>Discount</th>
                <th className="text-right p-2 text-sm font-medium border-r" style={{ borderColor: '#e4e4e4' }}>GST</th>
                <th className="text-right p-2 text-sm font-medium border-r" style={{ borderColor: '#e4e4e4' }}>Net Amount</th>
                <th className="text-right p-2 text-sm font-medium border-r" style={{ borderColor: '#e4e4e4' }}>Paid Amount</th>
                <th className="text-right p-2 text-sm font-medium border-r" style={{ borderColor: '#e4e4e4' }}>Balance Due</th>
                <th className="text-left p-2 text-sm font-medium border-r" style={{ borderColor: '#e4e4e4' }}>Created By</th>
                <th className="text-left p-2 text-sm font-medium border-r" style={{ borderColor: '#e4e4e4' }}>Pay.Status</th>
                <th className="text-left p-2 text-sm font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={15} className="text-center py-8 text-gray-500">
                    Loading invoices...
                  </td>
                </tr>
              ) : invoices.length === 0 ? (
                <tr>
                  <td colSpan={15} className="text-center py-8 text-gray-500">
                    No invoices found
                  </td>
                </tr>
              ) : (
                invoices.map((invoice, index) => (
                  <tr key={invoice.id} className="border-b hover:bg-gray-50" style={{ borderColor: '#e4e4e4' }}>
                    <td className="p-2 text-sm border-r" style={{ borderColor: '#e4e4e4' }}>{startIndex + index}</td>
                    <td className="p-2 text-sm border-r" style={{ borderColor: '#e4e4e4' }}>
                      <button
                        onClick={() => handleViewDetails(invoice.id)}
                        className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
                      >
                        {invoice.invoice_id}
                      </button>
                    </td>
                    <td className="p-2 text-sm border-r" style={{ borderColor: '#e4e4e4' }}>{invoice.ticket_id}</td>
                    <td className="p-2 text-sm border-r" style={{ borderColor: '#e4e4e4' }}>{invoice.customer?.name || 'N/A'}</td>
                    <td className="p-2 text-sm border-r" style={{ borderColor: '#e4e4e4' }}>
                      {new Date(invoice.invoice_date).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                      }).replace(/\//g, '-')} {new Date(invoice.invoice_date).toLocaleTimeString('en-GB', {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true
                      })}
                    </td>
                    <td className="p-2 text-sm border-r" style={{ borderColor: '#e4e4e4' }}>
                      {invoice.service_type ? (
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          invoice.service_type === 'Shop'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}>
                          {invoice.service_type}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="p-2 text-sm text-right border-r" style={{ borderColor: '#e4e4e4' }}>₹{invoice.total_amount}</td>
                    <td className="p-2 text-sm text-right border-r" style={{ borderColor: '#e4e4e4' }}>₹{invoice.discount || 0}</td>
                    <td className="p-2 text-sm text-right border-r" style={{ borderColor: '#e4e4e4' }}>
                      {invoice.gst_amount && invoice.gst_amount > 0 ? `₹${invoice.gst_amount}` : '--'}
                    </td>
                    <td className="p-2 text-sm text-right border-r " style={{ borderColor: '#e4e4e4' }}>₹{invoice.net_amount || invoice.total_amount}</td>
                    <td className="p-2 text-sm text-right border-r font-semibold" style={{ borderColor: '#e4e4e4',color:'green' }}>₹{invoice.paid_amount || 0}</td>
                    <td className="p-2 text-sm text-right border-r" style={{ borderColor: '#e4e4e4',color:'red' }}>₹{invoice.balance_due || 0}</td>
                    <td className="p-2 text-sm border-r" style={{ borderColor: '#e4e4e4' }}>{invoice.createdBy?.name || (invoice as any).created_by?.name || 'N/A'}</td>
                    <td className="p-2 border-r" style={{ borderColor: '#e4e4e4' }}>
                      {getStatusBadge(invoice.status)}
                    </td>
                    <td className="p-2">
                      {invoice.status?.toLowerCase() === 'paid' ? (
                        <div className="flex items-center gap-1">
                          
                          <Button
                            size="sm"
                            onClick={() => handleDownloadInvoice(invoice.id)}
                            className="bg-white hover:bg-gray-50 text-blue-600 border border-blue-600 px-3 py-1 text-xs font-medium rounded"
                            title="Print Invoice"
                          >
                            <Printer className="h-4 w-4 text-red-500" /> &nbsp;Print
                          </Button>
                        </div>

                      ) : (
                        <div className="flex items-center gap-1">

                          <Button
                            size="sm"
                            onClick={() => handleDownloadInvoice(invoice.id)}
                            className="bg-white hover:bg-gray-50 text-blue-600 border border-blue-600 px-3 py-1 text-xs font-medium rounded"
                            title="Print Invoice"
                          >
                            <Printer className="h-4 w-4 text-red-500" /> &nbsp;Print
                          </Button>

                          {/*<Button
                            size="sm"
                            onClick={() => handlePayClick(invoice)}
                            className="bg-white hover:bg-gray-50 text-blue-600 border border-blue-600 px-3 py-1 text-xs font-medium rounded"
                          >
                            Pay →
                          </Button>*/}

                          {/*user?.role_id === 1 && (
                            <Trash2
                              className="h-4 w-4 text-red-500 cursor-pointer hover:text-red-700"
                              onClick={() => handleDeleteClick(invoice)}
                            />
                          )*/}
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="lg:hidden">
          {loading ? (
            <div className="text-center py-8 text-gray-500">
              Loading invoices...
            </div>
          ) : invoices.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No invoices found
            </div>
          ) : (
            <div className="space-y-3">
              {invoices.map((invoice, index) => (
                <div key={invoice.id} className="border rounded-lg p-4" style={{ borderColor: '#e4e4e4' }}>
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs text-gray-500">#{startIndex + index}</span>
                        <button
                          onClick={() => handleViewDetails(invoice.id)}
                          className="font-medium text-sm text-blue-600 hover:text-blue-800 hover:underline"
                        >
                          {invoice.invoice_id}
                        </button>
                      </div>
                      <p className="text-xs text-gray-600">Ticket: #{invoice.ticket_id}</p>
                    </div>
                    {getStatusBadge(invoice.status)}
                  </div>
                  
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Customer:</span>
                      <span className="font-medium">{invoice.customer?.name || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Date:</span>
                      <span>{new Date(invoice.invoice_date).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                      }).replace(/\//g, '-')} {new Date(invoice.invoice_date).toLocaleTimeString('en-GB', {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true
                      })}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Service Type:</span>
                      <span>
                        {invoice.service_type ? (
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                            invoice.service_type === 'Shop'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-blue-100 text-blue-700'
                          }`}>
                            {invoice.service_type}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Total:</span>
                      <span>₹{invoice.total_amount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Discount:</span>
                      <span>₹{invoice.discount || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">GST:</span>
                      <span>{invoice.gst_amount && invoice.gst_amount > 0 ? `₹${invoice.gst_amount}` : '--'}</span>
                    </div>
                    <div className="flex justify-between font-medium pt-2 border-t" style={{ borderColor: '#e4e4e4' }}>
                      <span>Net Amount:</span>
                      <span>₹{invoice.net_amount || invoice.total_amount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Paid Amount:</span>
                      <span className="text-blue-600">₹{invoice.paid_amount || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Balance Due:</span>
                      <span className="text-orange-600 font-medium">₹{invoice.balance_due || 0}</span>
                    </div>
                  </div>
                  
                  <div className="mt-3 pt-3 border-t flex justify-between items-center" style={{ borderColor: '#e4e4e4' }}>
                    <span className="text-xs text-gray-500">By: {invoice.createdBy?.name || (invoice as any).created_by?.name || 'N/A'}</span>
                    {invoice.status?.toLowerCase() === 'paid' ? (
                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDownloadInvoice(invoice.id)}
                          className="h-8 w-8 p-0 rounded-full border-blue-500 hover:bg-blue-50"
                          title="Download Invoice"
                        >
                          <Download className="h-4 w-4 text-blue-500" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handlePrintInvoice(invoice.id)}
                          className="h-8 w-8 p-0 rounded-full border-red-500 hover:bg-red-50"
                          title="Print Invoice"
                        >
                          <Printer className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          onClick={() => handlePayClick(invoice)}
                          className="bg-white hover:bg-gray-50 text-blue-600 border border-blue-600 px-3 py-1 text-xs font-medium rounded"
                        >
                          Pay →
                        </Button>
                        {user?.role_id === 1 && (
                          <Trash2
                            className="h-4 w-4 text-red-500 cursor-pointer hover:text-red-700"
                            onClick={() => handleDeleteClick(invoice)}
                          />
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mt-4 gap-3">
          <div className="text-xs sm:text-sm text-gray-600 text-center sm:text-left">
            Showing {startIndex} to {endIndex} of {totalItems} entries
          </div>
          
          <div className="flex items-center justify-center sm:justify-end gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="text-xs sm:text-sm"
            >
              Prev
            </Button>
            
            {/* Desktop page numbers */}
            <div className="hidden sm:flex items-center gap-1">
              {(() => {
                const pages = [];
                const maxVisiblePages = 5;
                let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
                let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

                if (endPage - startPage < maxVisiblePages - 1) {
                  startPage = Math.max(1, endPage - maxVisiblePages + 1);
                }

                // First page
                if (startPage > 1) {
                  pages.push(
                    <Button
                      key={1}
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(1)}
                      disabled={loading}
                      className="w-9 h-9 p-0"
                    >
                      1
                    </Button>
                  );
                  if (startPage > 2) {
                    pages.push(<span key="start-ellipsis" className="px-2">...</span>);
                  }
                }

                // Page numbers
                for (let i = startPage; i <= endPage; i++) {
                  pages.push(
                    <Button
                      key={i}
                      variant={currentPage === i ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(i)}
                      disabled={loading}
                      className={`w-9 h-9 p-0 ${currentPage === i ? 'bg-blue-600 text-white hover:bg-blue-700' : ''}`}
                    >
                      {i}
                    </Button>
                  );
                }

                // Last page
                if (endPage < totalPages) {
                  if (endPage < totalPages - 1) {
                    pages.push(<span key="end-ellipsis" className="px-2">...</span>);
                  }
                  pages.push(
                    <Button
                      key={totalPages}
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(totalPages)}
                      disabled={loading}
                      className="w-9 h-9 p-0"
                    >
                      {totalPages}
                    </Button>
                  );
                }

                return pages;
              })()}
            </div>
            
            {/* Mobile page indicator */}
            <div className="flex sm:hidden items-center px-3 text-xs">
              Page {currentPage} of {totalPages}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="text-xs sm:text-sm"
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
    
    {/* Payment Modal */}
    {selectedInvoice && (
      <PayInvoiceModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        invoice={selectedInvoice}
        onPaymentSuccess={handlePaymentSuccess}
      />
    )}

    {/* Invoice Details Offcanvas */}
    <InvoiceDetailsOffcanvas
      isOpen={showDetailsOffcanvas}
      onClose={() => {
        setShowDetailsOffcanvas(false);
        setSelectedInvoiceId(null);
      }}
      invoiceId={selectedInvoiceId}
    />

    {/* Delete Confirmation Dialog */}
    <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Invoice</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete invoice <strong>{pendingDeleteInvoice?.invoice_id}</strong>? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => {
            setDeleteConfirmOpen(false);
            setPendingDeleteInvoice(null);
          }}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirmDelete}
            className="bg-red-600 hover:bg-red-700"
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>

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

    {/* Add Invoice From List Modal */}
    <AddInvoiceFromListModal
      isOpen={showAddInvoiceModal}
      onClose={handleCloseAddInvoiceModal}
      verifiedTickets={verifiedTickets}
      loading={loadingVerifiedTickets}
    />
    </DashboardLayout>
  );
}