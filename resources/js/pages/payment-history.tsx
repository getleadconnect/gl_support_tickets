import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { DashboardLayout } from '@/components/dashboard-layout';
import { Button } from '@/components/ui/button';
import { AlertCircle, Receipt, Filter, X, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import jQuery from 'jquery';
import select2Factory from 'select2';
import 'select2/dist/css/select2.min.css';

// Initialize select2 on jQuery
select2Factory(jQuery);

// Make jQuery available globally
(window as any).jQuery = jQuery;
(window as any).$ = jQuery;

interface Customer {
  id: number;
  name: string;
  email?: string;
  mobile?: string;
  country_code?: string;
  company_name?: string;
}

interface Branch {
  id: number;
  branch_name: string;
}

interface User {
  id: number;
  name: string;
  role_id: number;
  branch_id?: number;
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
}

interface PaymentDue {
  id: number;
  invoice_id: number;
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
    invoice_id: string;
    status: string;
  };
  ticket?: {
    id?: number;
    tracking_number: string;
    issue: string;
  };
}

export default function PaymentHistory() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistory[]>([]);
  const [paymentDues, setPaymentDues] = useState<PaymentDue[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalPaid, setTotalPaid] = useState(0);
  const [totalDue, setTotalDue] = useState(0);

  // Filter states
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedBranchId, setSelectedBranchId] = useState('');
  const [filterBranchId, setFilterBranchId] = useState(''); // For customer filtering

  const customerSelectRef = useRef<HTMLSelectElement>(null);

  useEffect(() => {
    fetchUser();
    // Don't fetch customers on initial load - wait for branch selection
    fetchBranches();
  }, []);

  const fetchUser = async () => {
    try {
      const response = await axios.get('/user');
      setUser(response.data);
      // Set default branch for non-admin users
      if (response.data.role_id !== 1 && response.data.branch_id) {
        setSelectedBranchId(response.data.branch_id.toString());
      }

      // Auto-select branch and fetch customers for branch admin users (role_id = 4)
      if (response.data.role_id === 4 && response.data.branch_id) {
        const branchId = response.data.branch_id.toString();
        setFilterBranchId(branchId);
        // Automatically fetch customers for this branch
        fetchCustomers(branchId);
      }
    } catch (error) {
      console.error('Error fetching user:', error);
    }
  };

  const fetchBranches = async () => {
    try {
      const response = await axios.get('/branches');
      setBranches(response.data || []);
    } catch (error) {
      console.error('Error fetching branches:', error);
    }
  };

  const fetchCustomers = async (branchId?: string) => {
    try {
      const params = new URLSearchParams();
      if (branchId) {
        params.append('branch_id', branchId);
      }
      const url = branchId ? `/customers?${params.toString()}` : '/customers';
      const response = await axios.get(url);
      setCustomers(response.data || []);
    } catch (error) {
      console.error('Error fetching customers:', error);
      toast.error('Failed to fetch customers');
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
        placeholder: 'Select a customer...',
        allowClear: true,
        width: '100%',
        minimumResultsForSearch: 0,
        dropdownParent: $select.parent(),
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

      $('.select2-dropdown').css({
        'z-index': '10000'
      });

      $select.on('change', function() {
        const value = $(this).val() as string;
        setSelectedCustomerId(value || '');
        if (value) {
          fetchCustomerData(parseInt(value));
        } else {
          setPaymentHistory([]);
          setPaymentDues([]);
          setTotalPaid(0);
          setTotalDue(0);
        }
      });

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
  }, [customers, selectedCustomerId]);

  const fetchCustomerData = async (customerId: number, filters?: { startDate?: string; endDate?: string; branchId?: string }) => {
    setLoading(true);
    try {
      // Use provided filters or fall back to state values
      const filterStartDate = filters?.startDate !== undefined ? filters.startDate : startDate;
      const filterEndDate = filters?.endDate !== undefined ? filters.endDate : endDate;
      const filterBranchId = filters?.branchId !== undefined ? filters.branchId : selectedBranchId;

      // Build query params
      const params = new URLSearchParams();
      if (filterStartDate) params.append('start_date', filterStartDate);
      if (filterEndDate) params.append('end_date', filterEndDate);
      if (filterBranchId) params.append('branch_id', filterBranchId);

      // Fetch payment history
      const historyResponse = await axios.get(`/payment-history/customer/${customerId}?${params.toString()}`);
      if (historyResponse.data) {
        setPaymentHistory(historyResponse.data.payments || []);
        setTotalPaid(historyResponse.data.total_paid || 0);
      }

      // Fetch payment dues
      const duesResponse = await axios.get(`/payment-dues/customer/${customerId}?${params.toString()}`);
      if (duesResponse.data) {
        setPaymentDues(duesResponse.data.payment_dues || []);
        setTotalDue(duesResponse.data.total_amount || 0);
      }
    } catch (error) {
      console.error('Error fetching customer data:', error);
      toast.error('Failed to fetch customer payment data');
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = () => {
    if (!selectedCustomerId) {
      toast.error('Please select a customer first');
      return;
    }
    fetchCustomerData(parseInt(selectedCustomerId));
  };

  const handleClearFilter = () => {
    // Clear state
    setStartDate('');
    setEndDate('');
    setSelectedBranchId('');

    // Re-fetch data without filters
    if (selectedCustomerId) {
      fetchCustomerData(parseInt(selectedCustomerId), {
        startDate: '',
        endDate: '',
        branchId: ''
      });
    }
  };

  const handleBranchFilterChange = (branchId: string) => {
    setFilterBranchId(branchId);
    setSelectedCustomerId(''); // Reset customer selection
    setPaymentHistory([]); // Clear payment history
    setPaymentDues([]); // Clear payment dues
    setTotalPaid(0);
    setTotalDue(0);
    fetchCustomers(branchId); // Fetch customers for selected branch
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    const hoursStr = String(hours).padStart(2, '0');
    return `${day}-${month}-${year} ${hoursStr}:${minutes} ${ampm}`;
  };

  const formatDateOnly = (dateString: string) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const handleExportCSV = () => {
    if (!selectedCustomerId) {
      toast.error('Please select a customer first');
      return;
    }

    if (paymentHistory.length === 0 && paymentDues.length === 0) {
      toast.error('No payment data to export');
      return;
    }

    // Customer details at the top
    const customerInfo = [
      ['Customer Payment Report'],
      [''],
      ['Customer Name:', selectedCustomer?.name || ''],
      ['Contact:', `${selectedCustomer?.country_code || ''} ${selectedCustomer?.mobile || ''}`],
      ['Email:', selectedCustomer?.email || 'N/A'],
      ['Company:', selectedCustomer?.company_name || 'N/A'],
      [''],
      ['Summary:'],
      ['Total Paid:', formatCurrency(totalPaid)],
      ['Total Due:', formatCurrency(totalDue)],
      [''],
      [''],
    ];

    // Payment History Section
    const paymentHistorySection = [];
    if (paymentHistory.length > 0) {
      paymentHistorySection.push(['PAYMENT HISTORY']);
      paymentHistorySection.push(['']);

      const historyHeaders = [
        'Sl No',
        'Invoice ID',
        'Ticket Number',
        'Payment Mode',
        'Total Amount',
        'Discount',
        'Net Amount',
        'Payment Date'
      ];
      paymentHistorySection.push(historyHeaders);

      const historyRows = paymentHistory.map((payment, index) => [
        index + 1,
        payment.invoice_id || 'N/A',
        payment.ticket?.tracking_number || 'N/A',
        payment.payment_mode,
        payment.total_amount,
        payment.discount || 0,
        payment.net_amount,
        formatDate(payment.created_at)
      ]);
      paymentHistorySection.push(...historyRows);
      paymentHistorySection.push(['']);
      paymentHistorySection.push(['']);
    }

    // Payment Dues Section
    const paymentDuesSection = [];
    if (paymentDues.length > 0) {
      paymentDuesSection.push(['PAYMENT DUES']);
      paymentDuesSection.push(['']);

      const duesHeaders = [
        'Sl No',
        'Invoice ID',
        'Ticket Number',
        'Issue',
        'Balance Due',
        'Created Date'
      ];
      paymentDuesSection.push(duesHeaders);

      const duesRows = paymentDues.map((due, index) => [
        index + 1,
        due.invoice?.invoice_id || due.invoice_id || 'N/A',
        due.ticket?.tracking_number || 'N/A',
        due.ticket?.issue || 'N/A',
        due.balance_due,
        formatDateOnly(due.created_at)
      ]);
      paymentDuesSection.push(...duesRows);
    }

    // Combine all sections
    const allRows = [
      ...customerInfo,
      ...paymentHistorySection,
      ...paymentDuesSection
    ];

    // Convert to CSV string
    const csvContent = allRows.map(row =>
      row.map(cell => {
        // Escape quotes and wrap in quotes if contains comma or quote
        const cellStr = String(cell);
        if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
          return `"${cellStr.replace(/"/g, '""')}"`;
        }
        return cellStr;
      }).join(',')
    ).join('\n');

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    const fileName = `payment_report_${selectedCustomer?.name.replace(/\s+/g, '_')}_${new Date().getTime()}.csv`;

    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success('Payment report exported successfully');
  };

  const selectedCustomer = customers.find(c => c.id === parseInt(selectedCustomerId));

  return (
    <DashboardLayout>
      <div className="container mx-auto p-6" style={{maxWidth:'100%'}}>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-800">Payment History</h1>
        </div>

        {/* Two Column Layout: 30% Customer Selection, 70% Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 lg:grid-cols-[30%_70%] gap-6">
            {/* Left Column: Customer Selection (30%) */}
            <div style={{ border: '1px solid #e4e4e4', borderRadius: '10px', padding: '10px', background: '#f9fafb' }}>
              {/* Title */}
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Branch & Customer
              </label>

              {/* Branch and Customer in single row */}
              <div className="grid grid-cols-2 gap-3">
                {/* Branch Filter */}
                <div>
                  <select
                    value={filterBranchId}
                    onChange={(e) => handleBranchFilterChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={user?.role_id === 4}
                  >
                    <option value="">All Branches</option>
                    {branches.map((branch) => (
                      <option key={branch.id} value={branch.id.toString()}>
                        {branch.branch_name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Customer Selection */}
                <div>
                  <select
                    ref={customerSelectRef}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={selectedCustomerId}
                    onChange={(e) => setSelectedCustomerId(e.target.value)}
                    disabled={!filterBranchId && customers.length === 0 && user?.role_id !== 4}
                  >
                    <option value="">
                      {!filterBranchId && customers.length === 0 && user?.role_id !== 4
                        ? 'Please select a branch first...'
                        : 'Select a customer...'}
                    </option>
                    {customers.map((customer) => (
                      <option key={customer.id} value={customer.id.toString()}>
                        {customer.name} {customer.mobile ? `(${customer.country_code || ''} ${customer.mobile})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Right Column: Filters (70%) */}
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 mr-3" style={{marginRight:'20px'}}>
              <div className="flex flex-wrap gap-4 items-end">
                {/* Start Date */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    style={{ width: '150px' }}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* End Date */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    style={{ width: '150px' }}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button
                    onClick={handleFilter}
                    className="flex items-center gap-2"
                  >
                    <Filter className="w-4 h-4" />
                    Filter
                  </Button>
                  <Button
                    onClick={handleClearFilter}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    Clear
                  </Button>
                </div>

                {/* Export Button - Aligned to Right */}
                <div className="ml-auto">
                  <Button
                    onClick={handleExportCSV}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Export CSV
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Customer Details Row */}
          {selectedCustomer && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200" style={{background:'#effffe'}}>
              <div className="grid grid-cols-4 gap-6">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Customer Name</p>
                  <p className="font-medium text-gray-900 text-sm">{selectedCustomer.name}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Contact</p>
                  <p className="font-medium text-gray-900 text-sm">
                    {selectedCustomer.country_code} {selectedCustomer.mobile || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Email</p>
                  <p className="font-medium text-gray-900 text-sm">{selectedCustomer.email || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Company</p>
                  <p className="font-medium text-gray-900 text-sm">{selectedCustomer.company_name || 'N/A'}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Two Column Layout */}
        {selectedCustomerId && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Payment History Column */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="px-6 py-4 bg-green-50 border-b border-green-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-800">Payment History</h2>
                  <div className="flex items-center space-x-2">
                    <Receipt className="w-5 h-5 text-green-600" />
                    <span className="text-sm font-medium text-green-800">
                      Total Paid: {formatCurrency(totalPaid)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                {loading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : paymentHistory.length > 0 ? (
                  <div className="max-h-[600px] overflow-y-auto">
                    <table className="min-w-full divide-y divide-gray-200" style={{fontSize: '13px'}}>
                      <thead className="bg-gray-50 sticky top-0">
                        <tr>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Sl No
                          </th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Invoice
                          </th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Ticket
                          </th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Payment Mode
                          </th>
                          <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Total
                          </th>
                          <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Discount
                          </th>
                          <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Net Amount
                          </th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Payment Date
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {paymentHistory.map((payment, index) => (
                          <tr key={payment.id} className="hover:bg-gray-50">
                            <td className="px-3 py-2 whitespace-nowrap text-gray-900">
                              {index + 1}
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {payment.invoice_id || 'N/A'}
                              </div>
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap">
                              <div className="text-sm text-blue-600">
                                #{payment.ticket?.tracking_number || 'N/A'}
                              </div>
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap">
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {payment.payment_mode}
                              </span>
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap text-right text-gray-900">
                              {formatCurrency(payment.total_amount)}
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap text-right text-gray-900">
                              {formatCurrency(payment.discount || 0)}
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap text-right">
                              <span className="font-semibold text-green-600">
                                {formatCurrency(payment.net_amount)}
                              </span>
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap text-gray-500 text-xs">
                              {formatDate(payment.created_at)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No payment history found
                  </div>
                )}
              </div>
            </div>

            {/* Payment Dues Column */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="px-6 py-4 bg-red-50 border-b border-red-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-800">Payment Dues</h2>
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    <span className="text-sm font-medium text-red-800">
                      Total Due: {formatCurrency(totalDue)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                {loading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : paymentDues.length > 0 ? (
                  <div className="max-h-[600px] overflow-y-auto">
                    <table className="min-w-full divide-y divide-gray-200" style={{fontSize: '13px'}}>
                      <thead className="bg-gray-50 sticky top-0">
                        <tr>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Sl No
                          </th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Invoice
                          </th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Ticket
                          </th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Issue
                          </th>
                          <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Balance Due
                          </th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Created Date
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {paymentDues.map((due, index) => (
                          <tr key={due.id} className="hover:bg-gray-50">
                            <td className="px-3 py-2 whitespace-nowrap text-gray-900">
                              {index + 1}
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {due.invoice?.invoice_id || due.invoice_id || 'N/A'}
                              </div>
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap">
                              <div className="text-sm text-blue-600">
                                #{due.ticket?.tracking_number || 'N/A'}
                              </div>
                            </td>
                            <td className="px-3 py-2">
                              <div className="text-sm text-gray-600 max-w-xs truncate" title={due.ticket?.issue || 'N/A'}>
                                {due.ticket?.issue || 'N/A'}
                              </div>
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap text-right">
                              <span className="font-semibold text-red-600">
                                {formatCurrency(due.balance_due)}
                              </span>
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap text-gray-500 text-xs">
                              {formatDateOnly(due.created_at)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No payment dues found
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!selectedCustomerId && (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Customer Selected</h3>
            <p className="text-gray-600">
              Please select a customer from the dropdown above to view their payment history and dues.
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
