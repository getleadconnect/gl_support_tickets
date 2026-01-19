import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '@/components/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, DollarSign, FileText, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';

interface InvoiceItem {
  invoice_id: string;
  customer_name: string;
  tracking_number: string;
  invoice_date: string;
  total_amount: number;
  discount: number;
  net_amount: number;
  service_type: string;
  branch: string;
}

interface ReportData {
  month: string;
  monthValue: string;
  shopInvoices: InvoiceItem[];
  shopTotal: number;
  outsourceInvoices: InvoiceItem[];
  outsourceTotal: number;
  grandTotal: number;
  summary: {
    totalInvoices: number;
    shopCount: number;
    outsourceCount: number;
  };
}

interface Branch {
  id: number;
  branch_name: string;
}

interface User {
  id: number;
  name: string;
  email: string;
  role_id: number;
  branch_id: number | null;
}

export default function MonthlyRevenueReport() {
  const [filterType, setFilterType] = useState<'month' | 'custom'>('month');
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [selectedBranch, setSelectedBranch] = useState<string>('all');
  const [branches, setBranches] = useState<Branch[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [initialLoad, setInitialLoad] = useState(true);

  useEffect(() => {
    // Set default month to current month
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    setSelectedMonth(currentMonth);

    // Fetch user, then conditionally fetch branches, then auto-load report
    const initializeData = async () => {
      const user = await fetchCurrentUser();
      // Only fetch branches if user is admin
      if (user?.role_id === 1) {
        await fetchBranches();
      }
      // Auto-load report after data is fetched
      setInitialLoad(false);
    };

    initializeData();
  }, []);

  useEffect(() => {
    // Auto-load report only once after initial data is ready
    if (!initialLoad && selectedMonth) {
      generateReport();
    }
  }, [initialLoad]);

  const fetchCurrentUser = async (): Promise<User | null> => {
    try {
      const response = await axios.get('/user');
      const user = response.data.user || null;
      setCurrentUser(user);
      return user;
    } catch (error) {
      console.error('Error fetching current user:', error);
      toast.error('Failed to fetch user information');
      return null;
    }
  };

  const fetchBranches = async () => {
    try {
      const response = await axios.get('/branches');
      setBranches(response.data || []);
    } catch (error) {
      console.error('Error fetching branches:', error);
      toast.error('Failed to fetch branches');
    }
  };

  const generateReport = async (showToast: boolean = false) => {
    // Validation based on filter type
    if (filterType === 'month' && !selectedMonth) {
      toast.error('Please select a month');
      return;
    }

    if (filterType === 'custom') {
      if (!startDate || !endDate) {
        toast.error('Please select both start and end dates');
        return;
      }
      if (new Date(startDate) > new Date(endDate)) {
        toast.error('Start date must be before end date');
        return;
      }
    }

    setLoading(true);
    try {
      const params: any = {};

      // Add filter parameters based on filter type
      if (filterType === 'month') {
        params.month = selectedMonth;
      } else {
        params.start_date = startDate;
        params.end_date = endDate;
      }

      // For admin users (role_id == 1), use selected branch
      // For non-admin users, the backend will automatically use their branch_id
      if (currentUser?.role_id === 1) {
        // Add branch_id if not 'all' and user is admin
        if (selectedBranch && selectedBranch !== 'all') {
          params.branch_id = selectedBranch;
        }
      }
      // For non-admin users, backend handles branch filtering automatically

      const response = await axios.get('/reports/monthly-invoice-revenue', { params });

      if (response.data.success) {
        setReportData(response.data);
        // Only show success toast if manually triggered
        if (showToast) {
          toast.success('Report generated successfully');
        }
      } else {
        throw new Error('Failed to generate report');
      }
    } catch (error: any) {
      console.error('Error generating report:', error);
      toast.error(error.response?.data?.message || 'Failed to generate report');
      setReportData(null);
    } finally {
      setLoading(false);
    }
  };

  const exportReport = async () => {
    if (!reportData) {
      toast.error('Please generate a report first');
      return;
    }

    // Validation based on filter type
    if (filterType === 'month' && !selectedMonth) {
      toast.error('Please select a month');
      return;
    }

    if (filterType === 'custom' && (!startDate || !endDate)) {
      toast.error('Please select both start and end dates');
      return;
    }

    try {
      const params: any = {};

      // Add filter parameters based on filter type
      if (filterType === 'month') {
        params.month = selectedMonth;
      } else {
        params.start_date = startDate;
        params.end_date = endDate;
      }

      // For admin users (role_id == 1), use selected branch
      // For non-admin users, the backend will automatically use their branch_id
      if (currentUser?.role_id === 1) {
        // Add branch_id if not 'all' and user is admin
        if (selectedBranch && selectedBranch !== 'all') {
          params.branch_id = selectedBranch;
        }
      }

      // Fetch the file with authentication headers
      const response = await axios.get('/reports/monthly-invoice-revenue/export', {
        params,
        responseType: 'blob', // Important: Tell axios to expect a blob response
      });

      // Create a blob from the response
      const blob = new Blob([response.data], { type: 'text/csv; charset=utf-8' });

      // Create a temporary URL for the blob
      const url = window.URL.createObjectURL(blob);

      // Generate filename based on filter type
      let filename = 'revenue_report';
      if (filterType === 'month') {
        filename = `monthly_revenue_report_${selectedMonth}.csv`;
      } else {
        filename = `revenue_report_${startDate}_to_${endDate}.csv`;
      }

      // Create a temporary link and trigger download
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('Report exported successfully');
    } catch (error: any) {
      console.error('Error exporting report:', error);
      toast.error(error.response?.data?.message || 'Failed to export report');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <DashboardLayout>
      <div className="container-fluid px-3 sm:px-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6 gap-2">
          <h1 className="text-lg sm:text-xl lg:text-2xl font-semibold">Monthly Revenue Report</h1>
          <div className="flex items-center gap-2 text-xs sm:text-sm">
            <Link to="/" className="text-gray-600 hover:text-gray-800">Home</Link>
            <span className="text-gray-400">/</span>
            <Link to="/reports" className="text-gray-600 hover:text-gray-800">Reports</Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-800">Monthly Revenue</span>
          </div>
        </div>

        {/* Filter Section */}
        <Card className="mb-6" style={{ borderColor: '#e4e4e4' }}>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Filter
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Single Row: All Filter Controls and Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 sm:items-center flex-wrap">
              {/* Filter Type Dropdown */}
              <div className="flex items-center gap-2">
                <Label htmlFor="filterType" className="text-sm font-medium whitespace-nowrap">
                  Filter By
                </Label>
                <Select value={filterType} onValueChange={(value: 'month' | 'custom') => setFilterType(value)}>
                  <SelectTrigger
                    id="filterType"
                    className="w-full sm:w-auto"
                    style={{ minWidth: '150px' }}
                  >
                    <SelectValue placeholder="Select filter type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="month">Month</SelectItem>
                    <SelectItem value="custom">Custom Date</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Month Selector - Show only when filterType is 'month' */}
              {filterType === 'month' && (
                <div className="flex items-center gap-2">
                  <Label htmlFor="month" className="text-sm font-medium whitespace-nowrap">
                    Month
                  </Label>
                  <Input
                    id="month"
                    type="month"
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="flex-shrink-0 w-full sm:w-auto"
                    style={{ maxWidth: '200px' }}
                  />
                </div>
              )}

              {/* Date Range - Show only when filterType is 'custom' */}
              {filterType === 'custom' && (
                <>
                  <div className="flex items-center gap-2">
                    <Label htmlFor="startDate" className="text-sm font-medium whitespace-nowrap">
                      Date Range
                    </Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="flex-shrink-0 w-full sm:w-auto"
                      style={{ maxWidth: '200px' }}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    
                    <Input
                      id="endDate"
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="flex-shrink-0 w-full sm:w-auto"
                      style={{ maxWidth: '200px' }}
                    />
                  </div>
                </>
              )}

              {/* Only show branch filter for admin users (role_id === 1) */}
              {currentUser?.role_id === 1 && (
                <div className="flex items-center gap-2">
                  <Label htmlFor="branch" className="text-sm font-medium whitespace-nowrap">
                    Branch
                  </Label>
                  <Select value={selectedBranch} onValueChange={setSelectedBranch}>
                    <SelectTrigger
                      id="branch"
                      className="w-full sm:w-auto"
                      style={{ minWidth: '200px' }}
                    >
                      <SelectValue placeholder="Select branch" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Branches</SelectItem>
                      {branches.map((branch) => (
                        <SelectItem key={branch.id} value={branch.id.toString()}>
                          {branch.branch_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <Button
                onClick={() => generateReport(true)}
                disabled={loading}
                className="whitespace-nowrap w-full sm:w-auto"
              >
                {loading ? 'Generating...' : 'Generate Report'}
              </Button>

              <Button
                onClick={exportReport}
                disabled={!reportData}
                variant="secondary"
                className="whitespace-nowrap w-full sm:w-auto flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Export
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Report Display */}
        {reportData && (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 mb-6">
              <Card style={{ borderColor: '#e4e4e4' }}>
                <CardContent className="pt-4 pb-4 px-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs sm:text-sm text-gray-600">Total Invoices</p>
                      <p className="text-xl sm:text-2xl font-bold">{reportData.summary.totalInvoices}</p>
                    </div>
                    <FileText className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>
              <Card style={{ borderColor: '#e4e4e4' }}>
                <CardContent className="pt-4 pb-4 px-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs sm:text-sm text-gray-600">Shop Invoices</p>
                      <p className="text-xl sm:text-2xl font-bold">{reportData.summary.shopCount}</p>
                    </div>
                    <FileText className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>
              <Card style={{ borderColor: '#e4e4e4' }}>
                <CardContent className="pt-4 pb-4 px-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs sm:text-sm text-gray-600">Outsource Invoices</p>
                      <p className="text-xl sm:text-2xl font-bold">{reportData.summary.outsourceCount}</p>
                    </div>
                    <FileText className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>
              <Card style={{ borderColor: '#e4e4e4' }}>
                <CardContent className="pt-4 pb-4 px-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs sm:text-sm text-gray-600">Shop Total</p>
                      <p className="text-lg sm:text-2xl font-bold text-blue-600 break-words">{formatCurrency(reportData.shopTotal)}</p>
                    </div>
                    <DollarSign className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>
              <Card style={{ borderColor: '#e4e4e4' }}>
                <CardContent className="pt-4 pb-4 px-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs sm:text-sm text-gray-600">Outsource Total</p>
                      <p className="text-lg sm:text-2xl font-bold text-green-600 break-words">{formatCurrency(reportData.outsourceTotal)}</p>
                    </div>
                    <DollarSign className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>
              <Card style={{ borderColor: '#e4e4e4' }}>
                <CardContent className="pt-4 pb-4 px-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs sm:text-sm text-gray-600">Grand Total</p>
                      <p className="text-lg sm:text-2xl font-bold text-purple-600 break-words">{formatCurrency(reportData.grandTotal)}</p>
                    </div>
                    <DollarSign className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
              {/* Shop Invoices Column */}
              <Card style={{ borderColor: '#e4e4e4' }}>
                <CardHeader className="bg-blue-50 p-4">
                  <CardTitle className="text-base sm:text-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <span>Shop Invoices</span>
                    <span className="text-blue-600 text-sm sm:text-base">{formatCurrency(reportData.shopTotal)}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  {/* Desktop Table View */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full">
                      <thead style={{ borderBottom: '1px solid #e4e4e4' }}>
                        <tr className="bg-gray-50">
                          <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700">Invoice ID</th>
                          <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700">Customer</th>
                          <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700">Date</th>
                          <th className="px-3 py-3 text-right text-xs font-semibold text-gray-700">Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reportData.shopInvoices.length > 0 ? (
                          reportData.shopInvoices.map((invoice, index) => (
                            <tr
                              key={index}
                              style={{ borderBottom: '1px solid #e4e4e4' }}
                              className="hover:bg-gray-50"
                            >
                              <td className="px-3 py-3 text-sm">{invoice.invoice_id}</td>
                              <td className="px-3 py-3 text-sm">{invoice.customer_name}</td>
                              <td className="px-3 py-3 text-sm">{invoice.invoice_date}</td>
                              <td className="px-3 py-3 text-sm text-right font-medium">
                                {formatCurrency(invoice.net_amount)}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={4} className="px-3 py-8 text-center text-gray-500 text-sm">
                              No shop invoices found for this month
                            </td>
                          </tr>
                        )}
                      </tbody>
                      <tfoot style={{ borderTop: '2px solid #e4e4e4' }}>
                        <tr className="bg-blue-50">
                          <td colSpan={3} className="px-3 py-3 text-sm font-semibold">Total</td>
                          <td className="px-3 py-3 text-sm font-bold text-right text-blue-600">
                            {formatCurrency(reportData.shopTotal)}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>

                  {/* Mobile Card View */}
                  <div className="md:hidden">
                    {reportData.shopInvoices.length > 0 ? (
                      <>
                        {reportData.shopInvoices.map((invoice, index) => (
                          <div
                            key={index}
                            className="p-4"
                            style={{ borderBottom: '1px solid #e4e4e4' }}
                          >
                            <div className="flex justify-between items-start mb-2">
                              <div className="font-semibold text-sm text-gray-900">{invoice.invoice_id}</div>
                              <div className="font-bold text-sm text-blue-600">{formatCurrency(invoice.net_amount)}</div>
                            </div>
                            <div className="text-sm text-gray-700 mb-1">{invoice.customer_name}</div>
                            <div className="text-xs text-gray-500">{invoice.invoice_date}</div>
                          </div>
                        ))}
                        <div className="p-4 bg-blue-50" style={{ borderTop: '2px solid #e4e4e4' }}>
                          <div className="flex justify-between items-center">
                            <span className="font-semibold text-sm">Total</span>
                            <span className="font-bold text-sm text-blue-600">{formatCurrency(reportData.shopTotal)}</span>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="p-8 text-center text-gray-500 text-sm">
                        No shop invoices found for this month
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Outsource Invoices Column */}
              <Card style={{ borderColor: '#e4e4e4' }}>
                <CardHeader className="bg-green-50 p-4">
                  <CardTitle className="text-base sm:text-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <span>Outsource Invoices</span>
                    <span className="text-green-600 text-sm sm:text-base">{formatCurrency(reportData.outsourceTotal)}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  {/* Desktop Table View */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full">
                      <thead style={{ borderBottom: '1px solid #e4e4e4' }}>
                        <tr className="bg-gray-50">
                          <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700">Invoice ID</th>
                          <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700">Customer</th>
                          <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700">Date</th>
                          <th className="px-3 py-3 text-right text-xs font-semibold text-gray-700">Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reportData.outsourceInvoices.length > 0 ? (
                          reportData.outsourceInvoices.map((invoice, index) => (
                            <tr
                              key={index}
                              style={{ borderBottom: '1px solid #e4e4e4' }}
                              className="hover:bg-gray-50"
                            >
                              <td className="px-3 py-3 text-sm">{invoice.invoice_id}</td>
                              <td className="px-3 py-3 text-sm">{invoice.customer_name}</td>
                              <td className="px-3 py-3 text-sm">{invoice.invoice_date}</td>
                              <td className="px-3 py-3 text-sm text-right font-medium">
                                {formatCurrency(invoice.net_amount)}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={4} className="px-3 py-8 text-center text-gray-500 text-sm">
                              No outsource invoices found for this month
                            </td>
                          </tr>
                        )}
                      </tbody>
                      <tfoot style={{ borderTop: '2px solid #e4e4e4' }}>
                        <tr className="bg-green-50">
                          <td colSpan={3} className="px-3 py-3 text-sm font-semibold">Total</td>
                          <td className="px-3 py-3 text-sm font-bold text-right text-green-600">
                            {formatCurrency(reportData.outsourceTotal)}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>

                  {/* Mobile Card View */}
                  <div className="md:hidden">
                    {reportData.outsourceInvoices.length > 0 ? (
                      <>
                        {reportData.outsourceInvoices.map((invoice, index) => (
                          <div
                            key={index}
                            className="p-4"
                            style={{ borderBottom: '1px solid #e4e4e4' }}
                          >
                            <div className="flex justify-between items-start mb-2">
                              <div className="font-semibold text-sm text-gray-900">{invoice.invoice_id}</div>
                              <div className="font-bold text-sm text-green-600">{formatCurrency(invoice.net_amount)}</div>
                            </div>
                            <div className="text-sm text-gray-700 mb-1">{invoice.customer_name}</div>
                            <div className="text-xs text-gray-500">{invoice.invoice_date}</div>
                          </div>
                        ))}
                        <div className="p-4 bg-green-50" style={{ borderTop: '2px solid #e4e4e4' }}>
                          <div className="flex justify-between items-center">
                            <span className="font-semibold text-sm">Total</span>
                            <span className="font-bold text-sm text-green-600">{formatCurrency(reportData.outsourceTotal)}</span>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="p-8 text-center text-gray-500 text-sm">
                        No outsource invoices found for this month
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Grand Total Card */}
            <Card className="mt-4 lg:mt-6" style={{ borderColor: '#e4e4e4' }}>
              <CardHeader className="bg-purple-50 p-4">
                <CardTitle className="text-base sm:text-lg lg:text-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <span>Grand Total for {reportData.month}</span>
                  <span className="text-purple-600 font-bold">{formatCurrency(reportData.grandTotal)}</span>
                </CardTitle>
              </CardHeader>
            </Card>
          </>
        )}

        {/* No Data Message */}
        {!reportData && !loading && (
          <Card style={{ borderColor: '#e4e4e4' }}>
            <CardContent className="py-12 text-center">
              <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600">Select a month and click "Generate Report" to view data</p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
