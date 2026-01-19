import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { DashboardLayout } from '@/components/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { AlertCircle, Receipt, Eye, X, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import jQuery from 'jquery';
import select2Factory from 'select2';
import 'select2/dist/css/select2.min.css';

// Initialize select2 on jQuery
select2Factory(jQuery);

// Make jQuery available globally
(window as any).jQuery = jQuery;
(window as any).$ = jQuery;

interface PaymentDue {
  customer_id: number;
  payment_id?: number;
  total_balance_due: number;
  dues_count: number;
  payment_date?: string;
  payment_mode?: string;
  created_at?: string;
  updated_at?: string;
  customer?: {
    id: number;
    name: string;
    email?: string;
    mobile?: string;
    country_code?: string;
    company_name?: string;
    branch?: {
      id: number;
      branch_name: string;
    };
  };
}

interface PaymentDueDetail {
  id: number;
  invoice_id: number; // From payment_dues table
  ticket_id: number;
  customer_id?: number;
  branch_id?: number;
  balance_due: number;
  status?: 'Paid' | 'Pending';
  created_by?: number;
  created_at: string;
  updated_at?: string;
  invoice?: {
    id: number;
    invoice_id: string; // From invoices table - the actual invoice number
    status: string;
  };
  ticket?: {
    id?: number;
    tracking_number: string;
    issue: string;
  };
  created_by_user?: {
    id?: number;
    name: string;
  };
}

interface PaymentHistory {
  id: number;
  invoice_id: number;
  ticket_id: number;
  customer_id: number;
  service_charge: number;
  item_amount: number;
  total_amount: number;
  discount: number;
  net_amount: number;
  paid_amount?: number;
  balance_due?: number;
  payment_mode: string;
  created_at: string;
  updated_at: string;
  invoice?: {
    id: number;
    invoice_id: string;
    status: string;
  };
  ticket?: {
    id: number;
    tracking_number: string;
    issue: string;
  };
  customer?: {
    id: number;
    name: string;
    email?: string;
    mobile?: string;
    country_code?: string;
  };
}

interface PaymentDuesResponse {
  data: PaymentDue[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  total_balance_due: number;
}

export default function PaymentDues() {
  // Helper function to get date 3 months ago
  const getThreeMonthsAgo = () => {
    const date = new Date();
    date.setMonth(date.getMonth() - 3);
    return date.toISOString().split('T')[0];
  };

  // Helper function to get today's date
  const getToday = () => {
    return new Date().toISOString().split('T')[0];
  };

  const [paymentDues, setPaymentDues] = useState<PaymentDue[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [entriesPerPage, setEntriesPerPage] = useState(25);
  const [searchTerm, setSearchTerm] = useState('');
  const [totalBalanceDue, setTotalBalanceDue] = useState(0);

  // Date filter states for Due Payments - Empty by default (backend will apply 3-month filter)
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState('');

  // Paid payment dues states
  const [paidPaymentDues, setPaidPaymentDues] = useState<PaymentDue[]>([]);
  const [paidLoading, setPaidLoading] = useState(true);
  const [paidCurrentPage, setPaidCurrentPage] = useState(1);
  const [paidTotalPages, setPaidTotalPages] = useState(1);
  const [paidTotalItems, setPaidTotalItems] = useState(0);
  const [paidEntriesPerPage, setPaidEntriesPerPage] = useState(25);
  const [paidSearchTerm, setPaidSearchTerm] = useState('');
  const [paidTotalBalanceDue, setPaidTotalBalanceDue] = useState(0);
  const [paidIsInitialLoad, setPaidIsInitialLoad] = useState(true);

  // Date filter states for Paid Payments - Empty by default (backend will apply 3-month filter)
  const [paidStartDate, setPaidStartDate] = useState('');
  const [paidEndDate, setPaidEndDate] = useState('');
  const [paidSelectedCustomerId, setPaidSelectedCustomerId] = useState('');

  // Customers list for filter dropdown
  const [customers, setCustomers] = useState<any[]>([]);
  const [customersLoading, setCustomersLoading] = useState(false);

  // Refs for Select2 customer dropdowns
  const customerSelectRef = useRef<HTMLSelectElement>(null);
  const paidCustomerSelectRef = useRef<HTMLSelectElement>(null);

  // Modal states - Payment Dues Splitups
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [customerPaymentDues, setCustomerPaymentDues] = useState<PaymentDueDetail[]>([]);
  const [customerTotalAmount, setCustomerTotalAmount] = useState(0);
  const [modalLoading, setModalLoading] = useState(false);

  // Modal states - Payment History
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [selectedHistoryCustomer, setSelectedHistoryCustomer] = useState<any>(null);
  const [customerPaymentHistory, setCustomerPaymentHistory] = useState<PaymentHistory[]>([]);
  const [customerTotalPaid, setCustomerTotalPaid] = useState(0);
  const [historyModalLoading, setHistoryModalLoading] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Pay Dues confirmation and invoice modal states
  const [payConfirmOpen, setPayConfirmOpen] = useState(false);
  const [selectedPayCustomer, setSelectedPayCustomer] = useState<any>(null);
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
  const [generatedInvoiceUrl, setGeneratedInvoiceUrl] = useState('');
  const [invoiceLoading, setInvoiceLoading] = useState(false);

  // Invoice viewing modal states (for paid dues)
  const [viewInvoiceModalOpen, setViewInvoiceModalOpen] = useState(false);
  const [viewInvoiceUrl, setViewInvoiceUrl] = useState('');
  const [selectedInvoiceCustomer, setSelectedInvoiceCustomer] = useState<any>(null);

  // Tab state
  const [activeTab, setActiveTab] = useState('due-details');

  // Combined effect for tab switching and pagination
  useEffect(() => {
    if (activeTab === 'due-details') {
      fetchPaymentDues();
    } else if (activeTab === 'paid-details') {
      fetchPaidPaymentDues();
    }
  }, [activeTab, currentPage, entriesPerPage, paidCurrentPage, paidEntriesPerPage]);

  // Debounced search effect for due details tab
  useEffect(() => {
    if (isInitialLoad || activeTab !== 'due-details') {
      return; // Skip if initial load or not active tab
    }

    const timeoutId = setTimeout(() => {
      if (currentPage !== 1) {
        setCurrentPage(1);
      } else {
        fetchPaymentDues();
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  // Debounced search effect for paid tab
  useEffect(() => {
    if (paidIsInitialLoad || activeTab !== 'paid-details') {
      return; // Skip if initial load or not active tab
    }

    const timeoutId = setTimeout(() => {
      if (paidCurrentPage !== 1) {
        setPaidCurrentPage(1);
      } else {
        fetchPaidPaymentDues();
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [paidSearchTerm]);

  // Set initial load flags to false after first render
  useEffect(() => {
    if (isInitialLoad) {
      setIsInitialLoad(false);
    }
    if (paidIsInitialLoad) {
      setPaidIsInitialLoad(false);
    }
    // Fetch customers for filter dropdown
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    setCustomersLoading(true);
    try {
      const response = await axios.get('/customers');
      setCustomers(response.data || []);
    } catch (error) {
      console.error('Error fetching customers:', error);
      setCustomers([]);
    } finally {
      setCustomersLoading(false);
    }
  };

  // Initialize Select2 for Due Payments customer dropdown
  useEffect(() => {
    // Only initialize when on due-details tab and customers are loaded
    if (activeTab !== 'due-details' || customers.length === 0) return;

    const timeoutId = setTimeout(() => {
      if (!customerSelectRef.current) return;

      const $ = jQuery;
      const $select = $(customerSelectRef.current);

      // Destroy existing instance if any
      if ($select.data('select2')) {
        $select.select2('destroy');
      }

      $select.select2({
        placeholder: 'Customer wise',
        allowClear: true,
        width: '100%',
        minimumResultsForSearch: 0, // Always show search box
        dropdownParent: $select.parent(),
        templateResult: function(customer: any) {
          if (!customer.id) {
            return customer.text;
          }
          const $result = $('<span style="font-size: 14px;"></span>');
          $result.text(customer.text);
          return $result;
        },
        templateSelection: function(customer: any) {
          if (!customer.id) {
            return customer.text;
          }
          const $result = $('<span style="font-size: 14px;"></span>');
          $result.text(customer.text);
          return $result;
        }
      });

      // Apply height styling
      const $container = $select.next('.select2-container');
      $container.find('.select2-selection--single').css({
        'height': '38px',
        'display': 'flex',
        'align-items': 'center'
      });

      // Ensure dropdown has proper z-index
      $('.select2-dropdown').css({
        'z-index': '10000'
      });

      $select.on('change', function() {
        const value = $(this).val() as string;
        setSelectedCustomerId(value || '');
      });

      // Set initial value
      if (selectedCustomerId) {
        $select.val(selectedCustomerId).trigger('change.select2');
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
  }, [activeTab, customers, selectedCustomerId]);

  // Initialize Select2 for Paid Payments customer dropdown
  useEffect(() => {
    // Only initialize when on paid-details tab and customers are loaded
    if (activeTab !== 'paid-details' || customers.length === 0) return;

    const timeoutId = setTimeout(() => {
      if (!paidCustomerSelectRef.current) return;

      const $ = jQuery;
      const $select = $(paidCustomerSelectRef.current);

      // Destroy existing instance if any
      if ($select.data('select2')) {
        $select.select2('destroy');
      }

      $select.select2({
        placeholder: 'Customer wise',
        allowClear: true,
        width: '100%',
        minimumResultsForSearch: 0, // Always show search box
        dropdownParent: $select.parent(),
        templateResult: function(customer: any) {
          if (!customer.id) {
            return customer.text;
          }
          const $result = $('<span style="font-size: 14px;"></span>');
          $result.text(customer.text);
          return $result;
        },
        templateSelection: function(customer: any) {
          if (!customer.id) {
            return customer.text;
          }
          const $result = $('<span style="font-size: 14px;"></span>');
          $result.text(customer.text);
          return $result;
        }
      });

      // Apply height styling
      const $container = $select.next('.select2-container');
      $container.find('.select2-selection--single').css({
        'height': '38px',
        'display': 'flex',
        'align-items': 'center'
      });

      // Ensure dropdown has proper z-index
      $('.select2-dropdown').css({
        'z-index': '10000'
      });

      $select.on('change', function() {
        const value = $(this).val() as string;
        setPaidSelectedCustomerId(value || '');
      });

      // Set initial value
      if (paidSelectedCustomerId) {
        $select.val(paidSelectedCustomerId).trigger('change.select2');
      }

    }, 300);

    return () => {
      clearTimeout(timeoutId);
      try {
        const $select = jQuery(paidCustomerSelectRef.current);
        if ($select.data('select2')) {
          $select.select2('destroy');
        }
      } catch (error) {
        // Silently fail
      }
    };
  }, [activeTab, customers, paidSelectedCustomerId]);

  const fetchPaymentDues = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        per_page: entriesPerPage.toString(),
        search: searchTerm,
        start_date: startDate,
        end_date: endDate,
        customer_id: selectedCustomerId
      });

      const response = await axios.get<PaymentDuesResponse>(`/payment-dues?${params}`);
      
      if (response.data) {
        setPaymentDues(response.data.data || []);
        setTotalPages(response.data.last_page || 1);
        setTotalItems(response.data.total || 0);
        setCurrentPage(response.data.current_page || 1);
        setTotalBalanceDue(response.data.total_balance_due || 0);
      }
    } catch (error: any) {
      console.error('Error fetching payment dues:', error);
      
      // Check if it's a response error with a message
      const errorMessage = error.response?.data?.error || 'Failed to fetch payment dues';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const fetchPaidPaymentDues = async () => {
    setPaidLoading(true);
    try {
      const params = new URLSearchParams({
        page: paidCurrentPage.toString(),
        per_page: paidEntriesPerPage.toString(),
        search: paidSearchTerm,
        start_date: paidStartDate,
        end_date: paidEndDate,
        customer_id: paidSelectedCustomerId
      });

      const response = await axios.get<PaymentDuesResponse>(`/payment-dues/paid?${params}`);
      
      if (response.data) {
        setPaidPaymentDues(response.data.data || []);
        setPaidTotalPages(response.data.last_page || 1);
        setPaidTotalItems(response.data.total || 0);
        setPaidCurrentPage(response.data.current_page || 1);
        setPaidTotalBalanceDue(response.data.total_balance_due || 0);
      }
    } catch (error: any) {
      console.error('Error fetching paid payment dues:', error);
      
      const errorMessage = error.response?.data?.error || 'Failed to fetch paid payment dues';
      toast.error(errorMessage);
    } finally {
      setPaidLoading(false);
    }
  };

  const fetchCustomerPaymentDues = async (customerId: number, customer: any) => {
    setModalLoading(true);
    setSelectedCustomer(customer);
    setModalOpen(true);
    
    try {
      const response = await axios.get(`/payment-dues/customer/${customerId}`);
      
      if (response.data) {
        setCustomerPaymentDues(response.data.payment_dues || []);
        setCustomerTotalAmount(response.data.total_amount || 0);
      }
    } catch (error) {
      console.error('Error fetching customer payment dues:', error);
      toast.error('Failed to fetch customer payment dues');
    } finally {
      setModalLoading(false);
    }
  };

  const fetchCustomerPaymentHistory = async (customerId: number, customer: any) => {
    setHistoryModalLoading(true);
    setSelectedHistoryCustomer(customer);
    setHistoryModalOpen(true);
    
    try {
      const response = await axios.get(`/payment-history/customer/${customerId}`);
      
      if (response.data) {
        setCustomerPaymentHistory(response.data.payments || []);
        setCustomerTotalPaid(response.data.total_paid || 0);
      }
    } catch (error) {
      console.error('Error fetching customer payment history:', error);
      toast.error('Failed to fetch customer payment history');
    } finally {
      setHistoryModalLoading(false);
    }
  };

  const handlePayDuesClick = (customer: any) => {
    setSelectedPayCustomer(customer);
    setPayConfirmOpen(true);
  };

  const handleConfirmPayment = async () => {
    if (!selectedPayCustomer) return;

    setPayConfirmOpen(false);
    setInvoiceLoading(true);

    try {
      // Create invoice and payment
      const response = await axios.post(`/payment-dues/customer/${selectedPayCustomer.customer_id}/pay`, {
        payment_mode: 'Cash' // Default payment mode
      });

      if (response.data) {
        toast.success('Payment processed successfully!');
        
        // Use PDF URL from backend response
        const pdfUrl = response.data.pdf_url;
        setGeneratedInvoiceUrl(pdfUrl);
        setInvoiceModalOpen(true);
        
        // Refresh payment dues list
        fetchPaymentDues();
      }
    } catch (error: any) {
      console.error('Error processing payment:', error);
      const errorMessage = error.response?.data?.error || 'Failed to process payment';
      toast.error(errorMessage);
    } finally {
      setInvoiceLoading(false);
    }
  };

  const handleViewInvoice = async (customer: any) => {
    setSelectedInvoiceCustomer(customer);
    
    try {
      // Request signed URL from backend
      const response = await axios.post(`/payment-dues/customer/${customer.customer_id}/generate-signed-url`);
      
      if (response.data && response.data.pdf_url) {
        setViewInvoiceUrl(response.data.pdf_url);
        setViewInvoiceModalOpen(true);
      } else {
        toast.error('Failed to generate invoice URL');
      }
    } catch (error: any) {
      console.error('Error generating invoice URL:', error);
      toast.error('Failed to generate invoice URL');
    }
  };

  const handleFilter = () => {
    setCurrentPage(1);
    fetchPaymentDues();
  };

  const handleClearFilter = () => {
    setStartDate('');
    setEndDate('');
    setSelectedCustomerId('');
    setSearchTerm('');
    setCurrentPage(1);
    // Trigger fetch after clearing (backend will apply default 3-month filter)
    setTimeout(() => fetchPaymentDues(), 100);
  };

  const handlePaidFilter = () => {
    setPaidCurrentPage(1);
    fetchPaidPaymentDues();
  };

  const handlePaidClearFilter = () => {
    setPaidStartDate('');
    setPaidEndDate('');
    setPaidSelectedCustomerId('');
    setPaidSearchTerm('');
    setPaidCurrentPage(1);
    // Trigger fetch after clearing (backend will apply default 3-month filter)
    setTimeout(() => fetchPaidPaymentDues(), 100);
  };

  // CSV Export for Due Payments
  const exportDuePaymentsToCSV = async () => {
    try {
      toast.loading('Exporting due payments to CSV...');

      // Fetch all data without pagination
      const params = new URLSearchParams({
        page: '1',
        per_page: '999999', // Get all records
        search: searchTerm,
        start_date: startDate,
        end_date: endDate,
        customer_id: selectedCustomerId
      });

      const response = await axios.get<PaymentDuesResponse>(`/payment-dues?${params}`);

      if (response.data && response.data.data.length > 0) {
        const data = response.data.data;

        // CSV headers
        const headers = ['Sl No', 'Customer Name', 'Created Date', 'Contact', 'Company', 'Branch', 'Balance Due', 'Dues Count'];

        // CSV rows
        const rows = data.map((due, index) => [
          index + 1,
          due.customer?.name || 'N/A',
          due.created_at ? formatDateOnly(due.created_at) : 'N/A',
          `${due.customer?.country_code || ''} ${due.customer?.mobile || 'N/A'}`,
          due.customer?.company_name || 'N/A',
          due.customer?.branch?.branch_name || 'N/A',
          due.total_balance_due.toFixed(2),
          due.dues_count
        ]);

        // Add total row
        rows.push(['', '', '', '', '', 'Total:', response.data.total_balance_due.toFixed(2), '']);

        // Create CSV content
        const csvContent = [
          headers.join(','),
          ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');

        // Create blob and download
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `due_payments_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast.dismiss();
        toast.success('Due payments exported successfully');
      } else {
        toast.dismiss();
        toast.error('No data to export');
      }
    } catch (error) {
      console.error('Error exporting due payments:', error);
      toast.dismiss();
      toast.error('Failed to export due payments');
    }
  };

  // CSV Export for Paid Payments
  const exportPaidPaymentsToCSV = async () => {
    try {
      toast.loading('Exporting paid payments to CSV...');

      // Fetch all data without pagination
      const params = new URLSearchParams({
        page: '1',
        per_page: '999999', // Get all records
        search: paidSearchTerm,
        start_date: paidStartDate,
        end_date: paidEndDate,
        customer_id: paidSelectedCustomerId
      });

      const response = await axios.get<PaymentDuesResponse>(`/payment-dues/paid?${params}`);

      if (response.data && response.data.data.length > 0) {
        const data = response.data.data;

        // CSV headers
        const headers = ['Sl No', 'Customer Name', 'Contact', 'Company', 'Branch', 'Paid Amount', 'Payment Date', 'Updated Date'];

        // CSV rows
        const rows = data.map((due, index) => [
          index + 1,
          due.customer?.name || 'N/A',
          `${due.customer?.country_code || ''} ${due.customer?.mobile || 'N/A'}`,
          due.customer?.company_name || 'N/A',
          due.customer?.branch?.branch_name || 'N/A',
          due.total_balance_due.toFixed(2),
          due.payment_date ? formatDate(due.payment_date) : 'N/A',
          due.updated_at ? formatDateOnly(due.updated_at) : 'N/A'
        ]);

        // Add total row
        rows.push(['', '', '', '', 'Total:', response.data.total_balance_due.toFixed(2), '', '']);

        // Create CSV content
        const csvContent = [
          headers.join(','),
          ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');

        // Create blob and download
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `paid_payments_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast.dismiss();
        toast.success('Paid payments exported successfully');
      } else {
        toast.dismiss();
        toast.error('No data to export');
      }
    } catch (error) {
      console.error('Error exporting paid payments:', error);
      toast.dismiss();
      toast.error('Failed to export paid payments');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDateOnly = (dateString: string) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const renderPaginationNumbers = (isForPaidTab = false) => {
    const pages = [];
    const maxVisiblePages = 5;
    const currentPg = isForPaidTab ? paidCurrentPage : currentPage;
    const totalPgs = isForPaidTab ? paidTotalPages : totalPages;
    const isLoadingTab = isForPaidTab ? paidLoading : loading;

    let startPage = Math.max(1, currentPg - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPgs, startPage + maxVisiblePages - 1);

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
          onClick={() => isForPaidTab ? setPaidCurrentPage(1) : setCurrentPage(1)}
          disabled={isLoadingTab}
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
          variant={i === currentPg ? "default" : "outline"}
          size="sm"
          onClick={() => isForPaidTab ? setPaidCurrentPage(i) : setCurrentPage(i)}
          disabled={isLoadingTab}
          className={`w-9 h-9 p-0 ${i === currentPg ? 'bg-blue-600 text-white hover:bg-blue-700' : ''}`}
        >
          {i}
        </Button>
      );
    }

    // Last page
    if (endPage < totalPgs) {
      if (endPage < totalPgs - 1) {
        pages.push(<span key="end-ellipsis" className="px-2">...</span>);
      }
      pages.push(
        <Button
          key={totalPgs}
          variant="outline"
          size="sm"
          onClick={() => isForPaidTab ? setPaidCurrentPage(totalPgs) : setCurrentPage(totalPgs)}
          disabled={isLoadingTab}
          className="w-9 h-9 p-0"
        >
          {totalPgs}
        </Button>
      );
    }

    return pages;
  };

  const renderPaginationNumbersOld = () => {
    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <Button
          key={i}
          variant={i === currentPage ? "default" : "outline"}
          size="sm"
          onClick={() => setCurrentPage(i)}
          className="mx-1"
        >
          {i}
        </Button>
      );
    }

    return pages;
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto p-6" style={{maxWidth:'100%'}}>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-800">Payment Dues</h1>
          <div className="flex items-center space-x-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <span className="text-sm font-medium text-red-800">
                  Total Outstanding: {formatCurrency(totalBalanceDue)}
                </span>
              </div>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium text-green-800">
                  Total Paid: {formatCurrency(paidTotalBalanceDue)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-2" style={{ width: 'fit-content' }}>
            <TabsTrigger value="due-details" style={{ width: '200px' }}>
              Due Payments
            </TabsTrigger>
            <TabsTrigger value="paid-details" style={{ width: '200px' }}>
              Paid Payments
            </TabsTrigger>
          </TabsList>

          <TabsContent value="due-details" className="space-y-4">
            {/* Due Details Tab Content */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              {/* Filter Section */}
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <div className="flex items-end gap-3">
                  <div style={{ width: '80px' }}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Filter By:</label>
                  </div>
                  <div style={{ width: '155px' }}>
                    <Input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full"
                    />
                  </div>

                  <div style={{ width: '155px' }}>
                    <Input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full"
                    />
                  </div>

                  <div style={{ width: '200px' }}>
                    <select
                      ref={customerSelectRef}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={selectedCustomerId}
                      onChange={(e) => setSelectedCustomerId(e.target.value)}
                    >
                      <option value="">All Customers</option>
                      {customers.map((customer) => (
                        <option key={customer.id} value={customer.id.toString()}>
                          {customer.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <Button
                    onClick={handleFilter}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Filter
                  </Button>

                  {(startDate || endDate || selectedCustomerId) && (
                    <Button
                      onClick={handleClearFilter}
                      variant="outline"
                    >
                      Clear
                    </Button>
                  )}

                  <div className="ml-auto">
                    <Button
                      onClick={exportDuePaymentsToCSV}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Export CSV
                    </Button>
                  </div>
                </div>
              </div>

              {/* Datatable Controls - Top */}
              <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            {/* Left side - Show entries */}
            <div className="flex items-center space-x-2">
              <label className="text-sm text-gray-700">Rows per page:</label>
              <Select value={entriesPerPage.toString()} onValueChange={(value) => {
                setEntriesPerPage(parseInt(value));
                setCurrentPage(1);
              }}>
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Right side - Search */}
            <div className="flex items-center">
              <Input
                placeholder="Search customer name or mobile..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64"
              />
            </div>
          </div>
              </div>

              {/* Desktop Table View */}
              <div className="hidden lg:block">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200" style={{fontSize: '14px'}}>
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sl No
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Company
                  </th>
                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Branch
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Balance Due
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dues Count
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-8 text-center">
                      <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                      </div>
                    </td>
                  </tr>
                ) : paymentDues.length > 0 ? (
                  paymentDues.map((due, index) => (
                    <tr key={due.customer_id} className="hover:bg-gray-50">
                      <td className="px-6 py-2 whitespace-nowrap text-gray-900">
                        {((currentPage - 1) * entriesPerPage) + index + 1}
                      </td>
                      <td className="px-6 py-2 whitespace-nowrap">
                        <button
                          onClick={() => fetchCustomerPaymentHistory(due.customer_id, due.customer)}
                          className="font-medium text-blue-600 hover:text-blue-800 cursor-pointer text-left"
                        >
                          {due.customer?.name || 'N/A'}
                        </button>
                      </td>
                      <td className="px-6 py-2 whitespace-nowrap text-gray-900">
                        {due.created_at ? formatDateOnly(due.created_at) : 'N/A'}
                      </td>
                      <td className="px-6 py-2 whitespace-nowrap text-gray-900">
                        {due.customer?.country_code} {due.customer?.mobile || 'N/A'}
                      </td>

                      <td className="px-6 py-2 whitespace-nowrap text-gray-900">
                        {due.customer?.company_name}
                      </td>
                      <td className="px-6 py-2 whitespace-nowrap text-gray-900">
                           {due.customer?.branch?.branch_name}
                      </td>
                      <td className="px-6 py-2 whitespace-nowrap">
                        <span className="text-base text-red-600">
                          {formatCurrency(due.total_balance_due)}
                        </span>
                      </td>
                      <td className="px-6 py-2 whitespace-nowrap text-gray-900">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => fetchCustomerPaymentDues(due.customer_id, due.customer)}
                          className="text-blue-600 hover:text-blue-800 border-blue-300 hover:bg-blue-50"
                        >
                          {due.dues_count} dues
                        </Button>
                      </td>
                      <td className="px-6 py-2 whitespace-nowrap font-medium">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handlePayDuesClick(due)}
                          className="text-blue-600 hover:text-blue-900 border-blue-300 hover:bg-blue-50"
                        >
                          <Receipt className="w-4 h-4 mr-1" />
                          Pay Dues
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={9} className="px-6 py-8 text-center text-gray-500">
                      No payment dues found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
              </div>

              {/* Mobile Card View */}
              <div className="lg:hidden space-y-4 p-6">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            </div>
          ) : paymentDues.length > 0 ? (
            paymentDues.map((due, index) => (
              <div key={due.customer_id} className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="text-sm text-gray-500">#{((currentPage - 1) * entriesPerPage) + index + 1}</div>
                    <button
                      onClick={() => fetchCustomerPaymentHistory(due.customer_id, due.customer)}
                      className="font-medium text-blue-600 hover:text-blue-800 cursor-pointer text-left"
                    >
                      {due.customer?.name || 'N/A'}
                    </button>
                  </div>
                  <span className="text-lg font-semibold text-red-600">
                    {formatCurrency(due.total_balance_due)}
                  </span>
                </div>
                
                <div className="space-y-2 text-sm text-gray-600">
                  <div><strong>Contact:</strong> {due.customer?.country_code} {due.customer?.mobile || 'N/A'}</div>
                  <div><strong>Email:</strong> {due.customer?.email || 'No email'}</div>
                  {(due.customer?.company_name || due.customer?.branch?.branch_name) && (
                    <div>
                      <strong>Company/Branch:</strong>
                      <div className="mt-1">
                        {due.customer?.company_name && (
                          <div className="font-medium text-gray-900">{due.customer.company_name}</div>
                        )}
                        {due.customer?.branch?.branch_name && (
                          <div className="text-gray-500">{due.customer.branch.branch_name}</div>
                        )}
                      </div>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <strong>Total Dues:</strong> 
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fetchCustomerPaymentDues(due.customer_id, due.customer)}
                      className="text-blue-600 hover:text-blue-800 border-blue-300 hover:bg-blue-50 ml-2"
                    >
                      {due.dues_count} dues
                    </Button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-gray-500">
              No payment dues found
            </div>
          )}
              </div>

              {/* Bottom Controls - Entries Info and Pagination */}
              <div className="flex items-center justify-between px-6 py-3 border-t border-gray-200">
          <div className="flex items-center">
            <p className="text-sm text-gray-700">
              Showing {totalItems > 0 ? ((currentPage - 1) * entriesPerPage) + 1 : 0} to {Math.min(currentPage * entriesPerPage, totalItems)} of {totalItems} entries
            </p>
          </div>
          {totalPages > 1 && (
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="text-gray-600"
              >
                Previous
              </Button>
              
              {renderPaginationNumbers()}
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="text-gray-600"
              >
                Next
              </Button>
            </div>
          )}
              </div>
            </div>

            {/* Customer Payment Dues Modal */}
        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <div>
                <DialogTitle className="text-xl font-semibold">
                  Payment Dues Splitups
                </DialogTitle>
                {selectedCustomer && (
                  <div className="mt-2">
                    <div className="text-lg font-medium">{selectedCustomer.name}</div>
                    <div className="text-sm text-gray-600">
                      {selectedCustomer.country_code} {selectedCustomer.mobile} | {selectedCustomer.email || 'No email'}
                    </div>
                    <div className="mt-2">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                        Total Amount: {formatCurrency(customerTotalAmount)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </DialogHeader>

            <div className="mt-4">
              {modalLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200" style={{fontSize: '13px'}}>
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Sl No
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Ticket
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Invoice
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Balance Due
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Created Date
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {customerPaymentDues.length > 0 ? (
                        customerPaymentDues.map((due, index) => (
                          <tr key={due.id} className="hover:bg-gray-50">
                            <td className="px-2 py-2 whitespace-nowrap text-gray-900">
                              {index + 1}
                            </td>
                            <td className="px-2 py-2 whitespace-nowrap">
                              <div className="font-medium text-blue-600">
                                #{due.ticket?.tracking_number || 'N/A'}
                              </div>
                              <div className="text-gray-500 max-w-[200px] truncate">
                                {due.ticket?.issue || 'No description'}
                              </div>
                            </td>
                            <td className="px-2 py-2 whitespace-nowrap">
                              <div className="font-medium text-gray-900">
                                {due.invoice?.invoice_id || due.invoice_id || 'N/A'}
                              </div>
                              {/*<div className="text-gray-500">
                                {due.invoice?.status || 'N/A'}
                              </div>
                              */}
                            </td>
                            <td className="px-2 py-2 whitespace-nowrap">
                              <span className="font-semibold text-red-600">
                                {formatCurrency(due.balance_due)}
                              </span>
                            </td>
                            <td className="px-2 py-2 whitespace-nowrap text-gray-500">
                              {formatDateOnly(due.created_at)}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                            No payment dues found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
              
              {/* Modal Footer with Close Button */}
              <div className="flex justify-end mt-6 pt-4 border-t border-gray-200">
                <Button 
                  onClick={() => setModalOpen(false)}
                  variant="outline"
                  className="px-6"
                >
                  Close
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Customer Payment History Modal */}
        <Dialog open={historyModalOpen} onOpenChange={setHistoryModalOpen}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <div>
                <DialogTitle className="text-xl font-semibold">
                  Payment History
                </DialogTitle>
                {selectedHistoryCustomer && (
                  <div className="mt-2">
                    <div className="text-lg font-medium">{selectedHistoryCustomer.name}</div>
                    <div className="text-sm text-gray-600">
                      {selectedHistoryCustomer.country_code} {selectedHistoryCustomer.mobile} | {selectedHistoryCustomer.email || 'No email'}
                    </div>
                    <div className="mt-2">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                        Total Paid: {formatCurrency(customerTotalPaid)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </DialogHeader>

            <div className="mt-4">
              {historyModalLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Sl No
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Ticket
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Invoice
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Payment Mode
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Amount
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Discount
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Net
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Paid 
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Balance
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Payment Date
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {customerPaymentHistory.length > 0 ? (
                        customerPaymentHistory.map((payment, index) => (
                          <tr key={payment.id} className="hover:bg-gray-50">
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                              {index + 1}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-blue-600">
                                #{payment.ticket?.tracking_number || 'N/A'}
                              </div>
                              <div className="text-sm text-gray-500 max-w-[150px] truncate">
                                {payment.ticket?.issue || 'No description'}
                              </div>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {payment.invoice?.invoice_id || 'N/A'}
                              </div>
                              {/*<div className="text-sm text-gray-500">
                                {payment.invoice?.status || 'N/A'}
                              </div>*/}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {payment.payment_mode || 'N/A'}
                              </span>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                              {formatCurrency(payment.total_amount)}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                              {formatCurrency(payment.discount || 0)}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <span className="text-sm font-semibold text-green-600">
                                {formatCurrency(payment.net_amount)}
                              </span>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <span className="text-sm font-semibold text-blue-600">
                                {formatCurrency(payment.paid_amount || payment.net_amount)}
                              </span>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <span className="text-sm font-medium text-orange-600">
                                {formatCurrency(payment.balance_due || 0)}
                              </span>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatDate(payment.created_at)}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={10} className="px-4 py-8 text-center text-gray-500">
                            No payment history found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
              
              {/* Modal Footer with Close Button */}
              <div className="flex justify-end mt-6 pt-4 border-t border-gray-200">
                <Button 
                  onClick={() => setHistoryModalOpen(false)}
                  variant="outline"
                  className="px-6"
                >
                  Close
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Pay Dues Confirmation Dialog */}
        <AlertDialog open={payConfirmOpen} onOpenChange={setPayConfirmOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Payment</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to pay this amount of{' '}
                <strong>{selectedPayCustomer ? formatCurrency(selectedPayCustomer.total_balance_due) : '0'}</strong>{' '}
                for customer <strong>{selectedPayCustomer?.customer?.name}</strong>?
                <br /><br />
                This will generate an invoice and mark all pending dues as paid.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleConfirmPayment}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Yes, Pay Now
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Invoice Modal */}
        <Dialog open={invoiceModalOpen} onOpenChange={setInvoiceModalOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold">
                Payment Invoice
              </DialogTitle>
            </DialogHeader>

            <div className="mt-4">
              {invoiceLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-3">Generating invoice...</span>
                </div>
              ) : generatedInvoiceUrl ? (
                <div className="w-full h-96 border border-gray-200">
                  <iframe
                    src={generatedInvoiceUrl}
                    title="Invoice PDF"
                    className="w-full h-full"
                    frameBorder="0"
                  />
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No invoice to display
                </div>
              )}
              
              {/* Modal Footer */}
              <div className="flex justify-between mt-6 pt-4 border-t border-gray-200">
                <Button 
                  onClick={() => setInvoiceModalOpen(false)}
                  variant="outline"
                  className="px-6"
                >
                  Close
                </Button>
                {generatedInvoiceUrl && (
                  <Button
                    onClick={() => window.open(generatedInvoiceUrl, '_blank')}
                    variant="default"
                    className="px-6 bg-blue-600 hover:bg-blue-700"
                  >
                    <Receipt className="w-4 h-4 mr-2" />
                    Download Invoice
                  </Button>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
          </TabsContent>

          <TabsContent value="paid-details" className="space-y-4">
            {/* Paid Details Tab Content */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              {/* Filter Section */}
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <div className="flex items-end gap-3">
                  <div style={{ width: '80px' }}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Filter By:</label>
                  </div>
                  <div style={{ width: '155px' }}>
                    <Input
                      type="date"
                      value={paidStartDate}
                      onChange={(e) => setPaidStartDate(e.target.value)}
                      className="w-full"
                    />
                  </div>

                  <div style={{ width: '155px' }}>
                    <Input
                      type="date"
                      value={paidEndDate}
                      onChange={(e) => setPaidEndDate(e.target.value)}
                      className="w-full"
                    />
                  </div>

                  <div style={{ width: '200px' }}>
                    <select
                      ref={paidCustomerSelectRef}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={paidSelectedCustomerId}
                      onChange={(e) => setPaidSelectedCustomerId(e.target.value)}
                    >
                      <option value="">All Customers</option>
                      {customers.map((customer) => (
                        <option key={customer.id} value={customer.id.toString()}>
                          {customer.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <Button
                    onClick={handlePaidFilter}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Filter
                  </Button>

                  {(paidStartDate || paidEndDate || paidSelectedCustomerId) && (
                    <Button
                      onClick={handlePaidClearFilter}
                      variant="outline"
                    >
                      Clear
                    </Button>
                  )}

                  <div className="ml-auto">
                    <Button
                      onClick={exportPaidPaymentsToCSV}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Export CSV
                    </Button>
                  </div>
                </div>
              </div>

              {/* Info Message - Show when no filters are applied */}
              {!paidStartDate && !paidEndDate && !paidSelectedCustomerId && (
                <div className="px-6 py-3 bg-blue-50 border-b border-blue-200">
                  <div className="flex items-start">
                    <AlertCircle className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-blue-800">
                      Showing last 3 months data only. Use filters above to view different date ranges.
                    </span>
                  </div>
                </div>
              )}

              {/* Datatable Controls - Top */}
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  {/* Left side - Show entries */}
                  <div className="flex items-center space-x-2">
                    <label className="text-sm text-gray-700">Rows per page:</label>
                    <Select value={paidEntriesPerPage.toString()} onValueChange={(value) => {
                      setPaidEntriesPerPage(parseInt(value));
                      setPaidCurrentPage(1);
                    }}>
                      <SelectTrigger className="w-20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="25">25</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                        <SelectItem value="100">100</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Right side - Search and Total Paid */}
                  <div className="flex items-center space-x-4">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <div className="flex items-center space-x-2">
                        <AlertCircle className="w-5 h-5 text-green-600" />
                        <span className="text-sm font-medium text-green-800">
                          Total Paid: {formatCurrency(paidTotalBalanceDue)}
                        </span>
                      </div>
                    </div>
                    <Input
                      placeholder="Search customer name or mobile..."
                      value={paidSearchTerm}
                      onChange={(e) => setPaidSearchTerm(e.target.value)}
                      className="w-64"
                    />
                  </div>
                </div>
              </div>

              {/* Desktop Table View */}
              <div className="hidden lg:block">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200" style={{fontSize: '14px'}}>
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Sl No
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Customer
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Contact
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Company
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Branch
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Paid Amount
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Payment Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Updated Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {paidLoading ? (
                        <tr>
                          <td colSpan={9} className="px-6 py-8 text-center">
                            <div className="flex justify-center">
                              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                            </div>
                          </td>
                        </tr>
                      ) : paidPaymentDues.length > 0 ? (
                        paidPaymentDues.map((due, index) => (
                          <tr key={`${due.customer_id}-${due.payment_id}`} className="hover:bg-gray-50">
                            <td className="px-6 py-2 whitespace-nowrap text-gray-900">
                              {((paidCurrentPage - 1) * paidEntriesPerPage) + index + 1}
                            </td>
                            <td className="px-6 py-2 whitespace-nowrap">
                              <button
                                onClick={() => fetchCustomerPaymentHistory(due.customer_id, due.customer)}
                                className="font-medium text-blue-600 hover:text-blue-800 cursor-pointer text-left"
                              >
                                {due.customer?.name || 'N/A'}
                              </button>
                            </td>
                            <td className="px-6 py-2 whitespace-nowrap text-gray-900">
                              {due.customer?.country_code} {due.customer?.mobile || 'N/A'}
                            </td>
                            <td className="px-6 py-2 whitespace-nowrap text-gray-900">
                              {due.customer?.company_name || 'N/A'}
                            </td>
                            <td className="px-6 py-2 whitespace-nowrap text-gray-900">
                              {due.customer?.branch?.branch_name || 'N/A'}
                            </td>
                            <td className="px-6 py-2 whitespace-nowrap">
                              <span className="text-base text-green-600">
                                {formatCurrency(due.total_balance_due)}
                              </span>
                            </td>
                            <td className="px-6 py-2 whitespace-nowrap text-gray-900">
                              {due.payment_date ? formatDate(due.payment_date) : 'N/A'}
                            </td>
                            <td className="px-6 py-2 whitespace-nowrap text-gray-900">
                              {due.updated_at ? formatDateOnly(due.updated_at) : 'N/A'}
                            </td>
                            <td className="px-6 py-2 whitespace-nowrap font-medium">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleViewInvoice(due)}
                                className="text-green-600 hover:text-green-800 border-green-300 hover:bg-green-50"
                              >
                                <Receipt className="w-4 h-4 mr-1" />
                                Invoice
                              </Button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={9} className="px-6 py-8 text-center text-gray-500">
                            No paid payment dues found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Mobile Card View */}
              <div className="lg:hidden space-y-4 p-6">
                {paidLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  </div>
                ) : paidPaymentDues.length > 0 ? (
                  paidPaymentDues.map((due, index) => (
                    <div key={`${due.customer_id}-${due.payment_id}`} className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="text-sm text-gray-500">#{((paidCurrentPage - 1) * paidEntriesPerPage) + index + 1}</div>
                          <button
                            onClick={() => fetchCustomerPaymentHistory(due.customer_id, due.customer)}
                            className="font-medium text-blue-600 hover:text-blue-800 cursor-pointer text-left"
                          >
                            {due.customer?.name || 'N/A'}
                          </button>
                        </div>
                        <span className="text-lg font-semibold text-green-600">
                          {formatCurrency(due.total_balance_due)}
                        </span>
                      </div>
                      
                      <div className="space-y-2 text-sm text-gray-600">
                        <div><strong>Contact:</strong> {due.customer?.country_code} {due.customer?.mobile || 'N/A'}</div>
                        <div><strong>Email:</strong> {due.customer?.email || 'No email'}</div>
                        {(due.customer?.company_name || due.customer?.branch?.branch_name) && (
                          <div>
                            <strong>Company/Branch:</strong>
                            <div className="mt-1">
                              {due.customer?.company_name && (
                                <div className="font-medium text-gray-900">{due.customer.company_name}</div>
                              )}
                              {due.customer?.branch?.branch_name && (
                                <div className="text-gray-500">{due.customer.branch.branch_name}</div>
                              )}
                            </div>
                          </div>
                        )}
                        <div><strong>Payment Date:</strong> {due.payment_date ? formatDate(due.payment_date) : 'N/A'}</div>
                        <div className="flex items-center justify-between">
                          <strong>Actions:</strong> 
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewInvoice(due)}
                            className="text-green-600 hover:text-green-800 border-green-300 hover:bg-green-50 ml-2"
                          >
                            <Receipt className="w-4 h-4 mr-1" />
                            Invoice
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-gray-500">
                    No paid payment dues found
                  </div>
                )}
              </div>

              {/* Bottom Controls - Entries Info and Pagination */}
              <div className="flex items-center justify-between px-6 py-3 border-t border-gray-200">
                <div className="flex items-center">
                  <p className="text-sm text-gray-700">
                    Showing {paidTotalItems > 0 ? ((paidCurrentPage - 1) * paidEntriesPerPage) + 1 : 0} to {Math.min(paidCurrentPage * paidEntriesPerPage, paidTotalItems)} of {paidTotalItems} entries
                  </p>
                </div>
                {paidTotalPages > 1 && (
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPaidCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={paidCurrentPage === 1}
                      className="text-gray-600"
                    >
                      Previous
                    </Button>
                    
                    {renderPaginationNumbers(true)}
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPaidCurrentPage(prev => Math.min(prev + 1, paidTotalPages))}
                      disabled={paidCurrentPage === paidTotalPages}
                      className="text-gray-600"
                    >
                      Next
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Invoice Viewing Modal */}
        <Dialog open={viewInvoiceModalOpen} onOpenChange={setViewInvoiceModalOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold">
                Payment Dues Invoice
              </DialogTitle>
            </DialogHeader>

            <div className="mt-4">
              {viewInvoiceUrl ? (
                <div className="w-full h-96 border border-gray-200">
                  <iframe
                    src={viewInvoiceUrl}
                    title="Invoice PDF"
                    className="w-full h-full"
                    frameBorder="0"
                  />
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No invoice to display
                </div>
              )}
              
              {/* Modal Footer */}
              <div className="flex justify-between mt-6 pt-4 border-t border-gray-200">
                <Button 
                  onClick={() => setViewInvoiceModalOpen(false)}
                  variant="outline"
                  className="px-6"
                >
                  Close
                </Button>
                {viewInvoiceUrl && (
                  <Button
                    onClick={() => window.open(viewInvoiceUrl, '_blank')}
                    variant="default"
                    className="px-6 bg-green-600 hover:bg-green-700"
                  >
                    <Receipt className="w-4 h-4 mr-2" />
                    Download Invoice
                  </Button>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}