import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '@/components/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Download, Filter, X, AlertCircle } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

interface GstReportData {
  payment_id: number;
  invoice_id: number;
  invoice_number: string;
  customer_id: number;
  customer_name: string;
  net_amount: number;
  gst_amount: number;
  cgst_amount: number;
  sgst_amount: number;
}

interface Customer {
  id: number;
  name: string;
  mobile: string;
}

export default function GstReport() {
  const [data, setData] = useState<GstReportData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [customerFilter, setCustomerFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('last_3_months');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isExporting, setIsExporting] = useState(false);

  // Totals
  const [totals, setTotals] = useState({
    net_amount: 0,
    gst_amount: 0,
    cgst_amount: 0,
    sgst_amount: 0,
  });

  useEffect(() => {
    fetchCustomers();
  }, []);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchGstReport();
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Immediate fetch for other filters
  useEffect(() => {
    fetchGstReport();
  }, [currentPage, perPage, customerFilter, dateFilter, startDate, endDate]);

  const fetchCustomers = async () => {
    try {
      const response = await axios.get('/customers');
      const customersData = response.data.data || response.data;
      setCustomers(Array.isArray(customersData) ? customersData : []);
    } catch (error) {
      console.error('Error fetching customers:', error);
      setCustomers([]);
    }
  };

  const fetchGstReport = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        per_page: perPage.toString(),
      });

      // Apply date filter
      if (dateFilter === 'last_3_months') {
        const today = new Date();
        const threeMonthsAgo = new Date(today);
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
        params.append('start_date', threeMonthsAgo.toISOString().split('T')[0]);
        params.append('end_date', today.toISOString().split('T')[0]);
      } else if (dateFilter === 'custom') {
        if (startDate) params.append('start_date', startDate);
        if (endDate) params.append('end_date', endDate);
      }

      if (customerFilter !== 'all') params.append('customer_id', customerFilter);

      const response = await axios.get(`/reports/gst-report?${params}`);

      const responseData = Array.isArray(response.data.data) ? response.data.data : [];
      setData(responseData);
      setCurrentPage(response.data.current_page || 1);
      setTotalPages(response.data.last_page || 1);
      setTotalRecords(response.data.total || 0);
      setTotals(response.data.totals || {
        net_amount: 0,
        gst_amount: 0,
        cgst_amount: 0,
        sgst_amount: 0,
      });

      setLoading(false);
    } catch (error: any) {
      console.error('Error fetching GST report:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch GST report');
      setData([]);
      setLoading(false);
    }
  };

  const clearAllFilters = () => {
    setCustomerFilter('all');
    setDateFilter('last_3_months');
    setStartDate('');
    setEndDate('');
    setSearchTerm('');
    setCurrentPage(1);
  };

  const handleExport = async () => {
    try {
      setIsExporting(true);

      const params = new URLSearchParams();

      // Apply same filters as main query
      if (dateFilter === 'last_3_months') {
        const today = new Date();
        const threeMonthsAgo = new Date(today);
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
        params.append('start_date', threeMonthsAgo.toISOString().split('T')[0]);
        params.append('end_date', today.toISOString().split('T')[0]);
      } else if (dateFilter === 'custom') {
        if (startDate) params.append('start_date', startDate);
        if (endDate) params.append('end_date', endDate);
      }

      if (customerFilter !== 'all') params.append('customer_id', customerFilter);

      const response = await axios.get(`/reports/gst-report?${params}&per_page=999999`);
      const allData = Array.isArray(response.data.data) ? response.data.data : [];

      const headers = [
        'Payment ID',
        'Invoice ID',
        'Customer',
        'Net Amount',
        'GST Amount',
        'CGST Amount',
        'SGST Amount'
      ];

      const csvRows = [headers.join(',')];

      allData.forEach((item: GstReportData) => {
        const row = [
          `PAY-${item.payment_id.toString().padStart(6, '0')}`,
          item.invoice_number,
          `"${item.customer_name}"`,
          item.net_amount,
          item.gst_amount,
          item.cgst_amount,
          item.sgst_amount
        ];
        csvRows.push(row.join(','));
      });

      // Add totals row
      csvRows.push('');
      csvRows.push([
        'TOTAL',
        '',
        '',
        totals.net_amount,
        totals.gst_amount,
        totals.cgst_amount,
        totals.sgst_amount
      ].join(','));

      const csvContent = csvRows.join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);

      link.setAttribute('href', url);
      link.setAttribute('download', `gst_report_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success('GST report exported successfully');
    } catch (error) {
      console.error('Error exporting GST report:', error);
      toast.error('Failed to export GST report');
    } finally {
      setIsExporting(false);
    }
  };

  const startIndex = (currentPage - 1) * perPage;
  const endIndex = Math.min(startIndex + data.length, totalRecords);

  const formatCurrency = (amount: number) => {
    return `₹${parseFloat(amount.toString()).toFixed(2)}`;
  };

  // Filter data based on search term
  const filteredData = data.filter((item) => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      item.invoice_number?.toLowerCase().includes(search) ||
      item.customer_name?.toLowerCase().includes(search) ||
      `PAY-${item.payment_id.toString().padStart(6, '0')}`.toLowerCase().includes(search)
    );
  });

  return (
    <DashboardLayout>
      <div className="container-fluid px-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold">GST Report</h1>
            <p className="text-gray-600 text-sm mt-1">View and export GST details for payments</p>
          </div>
          <div className="flex items-center gap-2 text-xs sm:text-sm">
            <Link to="/" className="text-gray-600 hover:text-gray-800">Home</Link>
            <span className="text-gray-400">/</span>
            <Link to="/reports" className="text-gray-600 hover:text-gray-800">Reports</Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-800">GST Report</span>
          </div>
        </div>

        {/* Filters Section */}
        <Card className="mb-6" style={{ borderColor: '#e4e4e4' }}>
          <CardHeader>
            <div>
              <CardTitle className="flex items-center gap-2" style={{fontSize:'18px', paddingBottom:'0px'}}>
                <Filter className="h-5 w-5" />
                Filters
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {/* Filters Row */}
            <div className="flex flex-wrap gap-3 items-end">
              <div className="flex flex-col gap-1" style={{ width: '180px' }}>
                <Select value={customerFilter} onValueChange={setCustomerFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Customers</SelectItem>
                    {customers.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id.toString()}>
                        {customer.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-1" style={{ width: '140px' }}>
                <Select value={dateFilter} onValueChange={setDateFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Dates</SelectItem>
                    <SelectItem value="last_3_months">Last 3 Months</SelectItem>
                    <SelectItem value="custom">Custom Range</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {dateFilter === 'custom' && (
                <>
                  <div className="flex flex-col gap-1" style={{ width: '140px' }}>
                    <Input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </div>
                  <div className="flex flex-col gap-1" style={{ width: '140px' }}>
                    <Input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                  </div>
                </>
              )}

              <Button
                onClick={clearAllFilters}
                variant="outline"
                className="flex items-center gap-2"
              >
                <X className="h-4 w-4" />
                Clear
              </Button>

              <Button
                onClick={handleExport}
                disabled={isExporting || data.length === 0}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                {isExporting ? 'Exporting...' : 'Export CSV'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Info Message */}
        {dateFilter === 'last_3_months' && (
          <div className="mb-4 px-6 py-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
              <span className="text-sm text-blue-800">
                Showing last 3 months GST data. Use date filters above to view different date ranges.
              </span>
            </div>
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card style={{ borderColor: '#e4e4e4' }}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Net Amount</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {formatCurrency(totals.net_amount)}
              </div>
            </CardContent>
          </Card>
          <Card style={{ borderColor: '#e4e4e4' }}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total GST Amount</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(totals.gst_amount)}
              </div>
            </CardContent>
          </Card>
          <Card style={{ borderColor: '#e4e4e4' }}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total CGST Amount</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {formatCurrency(totals.cgst_amount)}
              </div>
            </CardContent>
          </Card>
          <Card style={{ borderColor: '#e4e4e4' }}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total SGST Amount</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {formatCurrency(totals.sgst_amount)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Rows per page and Search */}
        <div className="flex flex-wrap justify-between items-center gap-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Rows per page:</span>
            <Select value={perPage.toString()} onValueChange={(value) => setPerPage(Number(value))}>
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
          <div style={{ width: '250px' }}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search GST report..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <Card style={{ borderColor: '#e4e4e4' }}>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow style={{ borderColor: '#e4e4e4' }}>
                    <TableHead className="text-left" style={{ borderColor: '#e4e4e4' }}>S.NO</TableHead>
                    <TableHead className="text-left" style={{ borderColor: '#e4e4e4' }}>PAYMENT_ID</TableHead>
                    <TableHead className="text-left" style={{ borderColor: '#e4e4e4' }}>INVOICE_ID</TableHead>
                    <TableHead className="text-left" style={{ borderColor: '#e4e4e4' }}>CUSTOMER</TableHead>
                    <TableHead className="text-right" style={{ borderColor: '#e4e4e4' }}>NET_AMOUNT</TableHead>
                    <TableHead className="text-right" style={{ borderColor: '#e4e4e4' }}>GST_AMOUNT</TableHead>
                    <TableHead className="text-right" style={{ borderColor: '#e4e4e4' }}>CGST_AMOUNT</TableHead>
                    <TableHead className="text-right" style={{ borderColor: '#e4e4e4' }}>SGST_AMOUNT</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                        Loading GST report...
                      </TableCell>
                    </TableRow>
                  ) : filteredData.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                        No GST data found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredData.map((item, index) => (
                      <TableRow key={item.payment_id} style={{ borderColor: '#e4e4e4' }}>
                        <TableCell style={{ borderColor: '#e4e4e4' }}>
                          {startIndex + index + 1}
                        </TableCell>
                        <TableCell style={{ borderColor: '#e4e4e4' }}>
                          PAY-{item.payment_id.toString().padStart(6, '0')}
                        </TableCell>
                        <TableCell style={{ borderColor: '#e4e4e4' }}>
                          {item.invoice_number}
                        </TableCell>
                        <TableCell style={{ borderColor: '#e4e4e4' }}>
                          {item.customer_name}
                        </TableCell>
                        <TableCell className="text-right" style={{ borderColor: '#e4e4e4' }}>
                          {formatCurrency(item.net_amount)}
                        </TableCell>
                        <TableCell className="text-right" style={{ borderColor: '#e4e4e4' }}>
                          {formatCurrency(item.gst_amount)}
                        </TableCell>
                        <TableCell className="text-right" style={{ borderColor: '#e4e4e4' }}>
                          {formatCurrency(item.cgst_amount)}
                        </TableCell>
                        <TableCell className="text-right" style={{ borderColor: '#e4e4e4' }}>
                          {formatCurrency(item.sgst_amount)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Pagination */}
        <div className="flex justify-between items-center mt-4">
          <p className="text-sm text-gray-600">
            Showing {startIndex + 1}-{endIndex} of {totalRecords} entries
          </p>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1 || loading}
              variant="outline"
              size="sm"
            >
              Previous
            </Button>

            {/* Page Numbers */}
            <div className="flex items-center gap-1">
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
                      onClick={() => setCurrentPage(1)}
                      disabled={loading}
                      variant="outline"
                      size="sm"
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
                      onClick={() => setCurrentPage(i)}
                      disabled={loading}
                      variant={currentPage === i ? "default" : "outline"}
                      size="sm"
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
                      onClick={() => setCurrentPage(totalPages)}
                      disabled={loading}
                      variant="outline"
                      size="sm"
                      className="w-9 h-9 p-0"
                    >
                      {totalPages}
                    </Button>
                  );
                }

                return pages;
              })()}
            </div>

            <Button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage >= totalPages || loading}
              variant="outline"
              size="sm"
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
