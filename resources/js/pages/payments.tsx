import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { DashboardLayout } from '@/components/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Receipt, FileText, FileDown } from 'lucide-react';
import toast from 'react-hot-toast';
import jQuery from 'jquery';
import select2Factory from 'select2';
import 'select2/dist/css/select2.min.css';

// Initialize select2 on jQuery
select2Factory(jQuery);

// Make jQuery available globally
(window as any).jQuery = jQuery;
(window as any).$ = jQuery;

interface Payment {
  id: number;
  invoice_id: number;
  ticket_id: number;
  customer_id: number;
  service_charge: number;
  item_amount: number;
  total_amount: number;
  discount: number;
  net_amount: number;
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
    issue: string;
  };
  customer?: {
    id: number;
    name: string;
    email: string;
  };
  created_by?: {
    id: number;
    name: string;
  } | number;
}

export default function Payments() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [entriesPerPage, setEntriesPerPage] = useState(50);
  const [searchTerm, setSearchTerm] = useState('');
  const [totalPaidAmount, setTotalPaidAmount] = useState(0);
  
  // Filter states - Initialize with last 3 months
  const getInitialDates = () => {
    const today = new Date();
    const endDate = today.toISOString().split('T')[0];

    const threeMonthsAgo = new Date(today);
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    const startDate = threeMonthsAgo.toISOString().split('T')[0];

    return { startDate, endDate };
  };

  const { startDate: initialStartDate, endDate: initialEndDate } = getInitialDates();

  const [startDate, setStartDate] = useState(initialStartDate);
  const [endDate, setEndDate] = useState(initialEndDate);
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [selectedPaymentMode, setSelectedPaymentMode] = useState('');
  const [customers, setCustomers] = useState<any[]>([]);

  // Ref for Select2 customer dropdown
  const customerSelectRef = useRef<HTMLSelectElement>(null);

  useEffect(() => {
    fetchPayments();
    fetchCustomers();
  }, [currentPage, entriesPerPage]);

  const fetchPayments = async (clearFilters = false) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        per_page: entriesPerPage.toString(),
        search: clearFilters ? '' : searchTerm,
        start_date: clearFilters ? '' : startDate,
        end_date: clearFilters ? '' : endDate,
        customer_id: clearFilters ? '' : (selectedCustomer === 'all' ? '' : selectedCustomer),
        payment_mode: clearFilters ? '' : (selectedPaymentMode === 'all' ? '' : selectedPaymentMode)
      });

      const response = await axios.get(`/payments?${params}`);
      
      if (response.data) {
        const paymentsData = response.data.data || [];
        setPayments(paymentsData);
        setTotalPages(response.data.last_page || 1);
        setTotalItems(response.data.total || 0);
        setCurrentPage(response.data.current_page || 1);

        // Use total paid amount from API (includes all filtered records, not just current page)
        // Ensure it's converted to a number
        setTotalPaidAmount(Number(response.data.total_paid_amount) || 0);
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
      toast.error('Failed to fetch payments');
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
        placeholder: 'All Customers',
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

      $container.find('.select2-selection__clear').css({
        'padding-left': '8px'
      });

      // Ensure dropdown has proper z-index
      $('.select2-dropdown').css({
        'z-index': '10000'
      });

      $select.on('change', function() {
        const value = $(this).val() as string;
        setSelectedCustomer(value || '');
      });

      // Set initial value
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

  const handleFilter = () => {
    setCurrentPage(1);
    fetchPayments();
  };

  const handleClearFilter = () => {
    // Reset to last 3 months instead of clearing completely
    const { startDate: defaultStart, endDate: defaultEnd } = getInitialDates();
    setStartDate(defaultStart);
    setEndDate(defaultEnd);
    setSelectedCustomer('all');
    setSelectedPaymentMode('all');
    setSearchTerm('');
    setCurrentPage(1);
    // Fetch with default date range
    setTimeout(() => fetchPayments(false), 100);
  };

  const getPaymentModeBadge = (mode: string) => {
    const modeLower = mode.toLowerCase();
    if (modeLower === 'cash') {
      return <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">Cash</span>;
    } else if (modeLower === 'card' || modeLower === 'credit card' || modeLower === 'debit card') {
      return <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">Card</span>;
    } else if (modeLower === 'upi') {
      return <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">UPI</span>;
    } else if (modeLower === 'bank transfer' || modeLower === 'neft' || modeLower === 'rtgs') {
      return <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">Bank Transfer</span>;
    } else {
      return <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">{mode}</span>;
    }
  };

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const startIndex = (currentPage - 1) * entriesPerPage + 1;
  const endIndex = Math.min(startIndex + payments.length - 1, totalItems);

  // Check if filters are at default (showing last 3 months only)
  const { startDate: defaultStart, endDate: defaultEnd } = getInitialDates();
  const isDefaultFilter = startDate === defaultStart &&
                          endDate === defaultEnd &&
                          (!selectedCustomer || selectedCustomer === '' || selectedCustomer === 'all') &&
                          (!selectedPaymentMode || selectedPaymentMode === '' || selectedPaymentMode === 'all') &&
                          searchTerm === '';

  const exportPaymentsToCSV = async () => {
    try {
      toast.loading('Exporting payments...');

      // Fetch all filtered payments (not just current page)
      const params = new URLSearchParams({
        page: '1',
        per_page: '100000', // Large number to get all records
        search: searchTerm,
        start_date: startDate,
        end_date: endDate,
        customer_id: selectedCustomer === 'all' ? '' : selectedCustomer,
        payment_mode: selectedPaymentMode === 'all' ? '' : selectedPaymentMode
      });

      const response = await axios.get(`/payments?${params}`);
      const allPayments = response.data.data || [];

      if (allPayments.length === 0) {
        toast.dismiss();
        toast.error('No payments to export');
        return;
      }

      // Create CSV content
      const headers = [
        'Payment ID',
        'Invoice ID',
        'Ticket ID',
        'Customer',
        'Total Amount',
        'Discount',
        'Net Amount',
        'Paid Amount',
        'Balance Due',
        'Payment Mode',
        'Payment Date',
        'Created By'
      ];

      const csvRows = [headers.join(',')];

      allPayments.forEach((payment: Payment) => {
        const row = [
          `PAY-${payment.id.toString().padStart(6, '0')}`,
          payment.invoice?.invoice_id || payment.invoice_id,
          payment.ticket_id,
          `"${payment.customer?.name || 'N/A'}"`, // Quote to handle commas in names
          payment.total_amount,
          payment.discount,
          payment.net_amount,
          payment.paid_amount || 0,
          payment.balance_due || 0,
          payment.payment_mode,
          new Date(payment.created_at).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
          }).replace(/\//g, '-'),
          `"${typeof payment.created_by === 'object' && payment.created_by?.name ? payment.created_by.name : 'Super Admin'}"`
        ];
        csvRows.push(row.join(','));
      });

      // Create and download CSV file
      const csvContent = csvRows.join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);

      link.setAttribute('href', url);
      link.setAttribute('download', `payments_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.dismiss();
      toast.success(`Successfully exported ${allPayments.length} payments`);
    } catch (error) {
      console.error('Error exporting payments:', error);
      toast.dismiss();
      toast.error('Failed to export payments');
    }
  };

  return (
    <DashboardLayout>
      <div className="container-fluid px-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-2">
          <h1 className="text-xl sm:text-2xl font-semibold">Payments</h1>
          <div className="flex items-center gap-2 text-xs sm:text-sm">
            <Link to="/" className="text-gray-600 hover:text-gray-800">Home</Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-800">Payments</span>
          </div>
        </div>

        {/* Filter Section */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex items-end gap-3">
            <div style={{ width: '80px' }}>
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter By:</label>
            </div>
            <div style={{ width: '155px' }}>
              <Input
                type="date"
                placeholder="Start Date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full"
              />
            </div>

            <div style={{ width: '155px' }}>
              <Input
                type="date"
                placeholder="End Date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full"
              />
            </div>

            <div style={{ width: '200px' }}>
              <select
                ref={customerSelectRef}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={selectedCustomer}
                onChange={(e) => setSelectedCustomer(e.target.value)}
              >
                <option value="">All Customers</option>
                {customers.map(customer => (
                  <option key={customer.id} value={customer.id.toString()}>
                    {customer.name}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ width: '155px' }}>
              <Select value={selectedPaymentMode} onValueChange={setSelectedPaymentMode}>
                <SelectTrigger>
                  <SelectValue placeholder="Payment Mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Payment Modes</SelectItem>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="card">Card</SelectItem>
                  <SelectItem value="upi">UPI</SelectItem>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  <SelectItem value="credit">Credit</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={handleFilter}
            >
              Filter
            </Button>

            {(startDate || endDate || selectedCustomer || selectedPaymentMode) && (
              <Button
                onClick={handleClearFilter}
                variant="outline"
              >
                Clear
              </Button>
            )}

            <Button
              onClick={exportPaymentsToCSV}
              className="flex items-center gap-2"
            >
              <FileDown className="w-4 h-4" />
              Export CSV
            </Button>

            <div className="ml-auto bg-green-50 border border-green-200 rounded-lg px-4 py-2">
              <div className="flex items-center space-x-2">
                <Receipt className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium text-green-800">
                  Total Paid: ₹{Number(totalPaidAmount || 0).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Default Filter Message */}
        {isDefaultFilter && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
            <p className="text-sm text-blue-700 flex items-center">
              <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"></path>
              </svg>
              Showing last 3 months data only. Use filters above to view different date ranges.
            </p>
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
                placeholder="Search payments..."
              />
            </div>
          </div>

          {/* Desktop Table */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full border" style={{ borderColor: '#e4e4e4' }}>
              <thead>
                <tr className="border-b" style={{ borderColor: '#e4e4e4' }}>
                  <th className="text-left p-2 text-sm font-medium border-r" style={{ borderColor: '#e4e4e4' }}>#</th>
                  <th className="text-left p-2 text-sm font-medium border-r" style={{ borderColor: '#e4e4e4' }}>Payment ID</th>
                  <th className="text-left p-2 text-sm font-medium border-r" style={{ borderColor: '#e4e4e4' }}>Invoice ID</th>
                  <th className="text-left p-2 text-sm font-medium border-r" style={{ borderColor: '#e4e4e4' }}>Ticket ID</th>
                  <th className="text-left p-2 text-sm font-medium border-r" style={{ borderColor: '#e4e4e4' }}>Customer</th>
                  <th className="text-right p-2 text-sm font-medium border-r" style={{ borderColor: '#e4e4e4' }}>Total Amount</th>
                  <th className="text-right p-2 text-sm font-medium border-r" style={{ borderColor: '#e4e4e4' }}>Discount</th>
                  <th className="text-right p-2 text-sm font-medium border-r" style={{ borderColor: '#e4e4e4' }}>Net Amount</th>
                  <th className="text-right p-2 text-sm font-medium border-r" style={{ borderColor: '#e4e4e4' }}>Paid Amount</th>
                  <th className="text-right p-2 text-sm font-medium border-r" style={{ borderColor: '#e4e4e4' }}>Balance Due</th>
                  <th className="text-left p-2 text-sm font-medium border-r" style={{ borderColor: '#e4e4e4' }}>Payment Mode</th>
                  <th className="text-left p-2 text-sm font-medium border-r" style={{ borderColor: '#e4e4e4' }}>Payment Date</th>
                  <th className="text-left p-2 text-sm font-medium">Created By</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={13} className="text-center py-8 text-gray-500">
                      Loading payments...
                    </td>
                  </tr>
                ) : payments.length === 0 ? (
                  <tr>
                    <td colSpan={13} className="text-center py-8 text-gray-500">
                      No payments found
                    </td>
                  </tr>
                ) : (
                  payments.map((payment, index) => (
                    <tr key={payment.id} className="border-b hover:bg-gray-50" style={{ borderColor: '#e4e4e4' }}>
                      <td className="p-2 text-sm border-r" style={{ borderColor: '#e4e4e4' }}>{startIndex + index}</td>
                      <td className="p-2 text-sm border-r" style={{ borderColor: '#e4e4e4' }}>PAY-{payment.id.toString().padStart(6, '0')}</td>
                      <td className="p-2 text-sm border-r" style={{ borderColor: '#e4e4e4' }}>{payment.invoice?.invoice_id || payment.invoice_id}</td>
                      <td className="p-2 text-sm border-r" style={{ borderColor: '#e4e4e4' }}>{payment.ticket_id}</td>
                      <td className="p-2 text-sm border-r" style={{ borderColor: '#e4e4e4' }}>{payment.customer?.name || 'N/A'}</td>
                      <td className="p-2 text-sm text-right border-r" style={{ borderColor: '#e4e4e4' }}>{formatCurrency(payment.total_amount)}</td>
                      <td className="p-2 text-sm text-right border-r" style={{ borderColor: '#e4e4e4' }}>{formatCurrency(payment.discount)}</td>
                      <td className="p-2 text-sm text-right border-r" style={{ borderColor: '#e4e4e4' }}>{formatCurrency(payment.net_amount)}</td>
                      <td className="p-2 text-sm text-right border-r font-semibold" style={{ borderColor: '#e4e4e4', color: 'green' }}>{formatCurrency(payment.paid_amount || 0)}</td>
                      <td className="p-2 text-sm text-right border-r" style={{ borderColor: '#e4e4e4', color: 'red' }}>{formatCurrency(payment.balance_due || 0)}</td>
                      <td className="p-2 border-r" style={{ borderColor: '#e4e4e4' }}>
                        {getPaymentModeBadge(payment.payment_mode)}
                      </td>
                      <td className="p-2 text-sm border-r" style={{ borderColor: '#e4e4e4' }}>
                        {(() => {
                          const date = new Date(payment.created_at);
                          const day = String(date.getDate()).padStart(2, '0');
                          const month = String(date.getMonth() + 1).padStart(2, '0');
                          const year = date.getFullYear();
                          let hours = date.getHours();
                          const minutes = String(date.getMinutes()).padStart(2, '0');
                          const ampm = hours >= 12 ? 'PM' : 'AM';
                          hours = hours % 12;
                          hours = hours ? hours : 12;
                          const hoursStr = String(hours).padStart(2, '0');
                          return `${day}-${month}-${year} ${hoursStr}:${minutes} ${ampm}`;
                        })()}
                      </td>
                      <td className="p-2 text-sm">{typeof payment.created_by === 'object' && payment.created_by?.name ? payment.created_by.name : 'Super Admin'}</td>
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
                Loading payments...
              </div>
            ) : payments.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No payments found
              </div>
            ) : (
              <div className="space-y-3">
                {payments.map((payment, index) => (
                  <div key={payment.id} className="border rounded-lg p-4" style={{ borderColor: '#e4e4e4' }}>
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs text-gray-500">#{startIndex + index}</span>
                          <span className="font-medium text-sm">PAY-{payment.id.toString().padStart(6, '0')}</span>
                        </div>
                        <p className="text-xs text-gray-600">Invoice: {payment.invoice?.invoice_id || payment.invoice_id}</p>
                        <p className="text-xs text-gray-600">Ticket: #{payment.ticket_id}</p>
                      </div>
                      {getPaymentModeBadge(payment.payment_mode)}
                    </div>
                    
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Customer:</span>
                        <span className="font-medium">{payment.customer?.name || 'N/A'}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <span className="text-gray-500">Total:</span>
                          <p className="font-medium">{formatCurrency(payment.total_amount)}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Discount:</span>
                          <p className="font-medium">{formatCurrency(payment.discount)}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Paid Amount:</span>
                          <p className="font-medium text-green-600">{formatCurrency(payment.paid_amount || 0)}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Balance Due:</span>
                          <p className="font-medium text-red-600">{formatCurrency(payment.balance_due || 0)}</p>
                        </div>
                      </div>
                      <div className="flex justify-between font-semibold pt-2 border-t" style={{ borderColor: '#e4e4e4' }}>
                        <span>Net Amount:</span>
                        <span className="text-green-600">{formatCurrency(payment.net_amount)}</span>
                      </div>
                    </div>
                    
                    <div className="mt-3 pt-3 border-t flex justify-between text-xs text-gray-500" style={{ borderColor: '#e4e4e4' }}>
                      <span>{(() => {
                        const date = new Date(payment.created_at);
                        const day = String(date.getDate()).padStart(2, '0');
                        const month = String(date.getMonth() + 1).padStart(2, '0');
                        const year = date.getFullYear();
                        let hours = date.getHours();
                        const minutes = String(date.getMinutes()).padStart(2, '0');
                        const ampm = hours >= 12 ? 'PM' : 'AM';
                        hours = hours % 12;
                        hours = hours ? hours : 12;
                        const hoursStr = String(hours).padStart(2, '0');
                        return `${day}-${month}-${year} ${hoursStr}:${minutes} ${ampm}`;
                      })()}</span>
                      <span>By: {typeof payment.created_by === 'object' && payment.created_by?.name ? payment.created_by.name : 'Super Admin'}</span>
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
            
            <div className="flex items-center justify-center sm:justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="text-xs sm:text-sm"
              >
                Previous
              </Button>
              
              {/* Desktop Page numbers */}
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
    </DashboardLayout>
  );
}