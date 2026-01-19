import React, { useEffect, useState, useMemo } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { DashboardLayout } from '@/components/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, ArrowLeft, FileText, Filter } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';


interface TicketReportItem {
  date: string;
  ticketId: string;
  customer: string;
  assignedTo: string;
  priority: string;
  status: string;
  category: string;
  createdDate: string;
  resolvedDate?: string;
  responseTime?: string;
  resolutionTime?: string;
}

interface CustomerAnalyticsItem {
  customerId: string;
  customerName: string;
  company: string;
  email?: string;
  mobile?: string;
  totalTickets: number;
  openTickets: number;
  inProgressTickets: number;
  closedTickets: number;
  avgResolutionTime: string;
  totalSpent: number;
  lastActivity: string;
  satisfaction: number;
  joinDate: string;
}

interface CustomerReportItem {
  customerId: string;
  customerName: string;
  email: string;
  mobile: string;
  company: string;
  joinDate: string;
  totalTickets: number;
  totalSpent: number;
  status: string;
  lastActivity: string;
}

interface InventoryReportItem {
  productId: string;
  productCode: string;
  productName: string;
  category: string;
  brand: string;
  currentStock: number;
  initialStock: number;
  stockUsed: number;
  stockUsagePercent: number;
  unitCost: number;
  totalValue: number;
  status: string;
  stockStatus: string;
  stockLevel: string;
  lastUpdated: string;
  createdDate: string;
}

interface PerformanceReportItem {
  agentId: string;
  agentName: string;
  email: string;
  assignedTickets: number;
  openTickets: number;
  inProgressTickets: number;
  closedTickets: number;
  completionRate: number;
  avgResolutionTime: string;
  performance: string;
  joinDate: string;
}

interface MonthlySummaryItem {
  month: string;
  year: number;
  totalRevenue: number;
  totalPayments: number;
  averagePaymentAmount: number;
  paymentModes: {
    cash: number;
    online: number;
    card: number;
    cheque: number;
    other: number;
  };
  topCustomers: Array<{
    customerId: string;
    customerName: string;
    totalPaid: number;
    paymentCount: number;
  }>;
  dailyRevenue: Array<{
    date: string;
    revenue: number;
    paymentCount: number;
  }>;
  ticketStats: {
    totalTickets: number;
    closedTickets: number;
    averageClosureTime: string;
  };
  growthPercentage: number;
  previousMonthRevenue: number;
  newCustomers: number;
}

interface ReportData {
  id: string;
  name: string;
  type: string;
  generatedDate: string;
  dateRange: {
    start: string;
    end: string;
  };
  data?: any;
}

export default function ReportPreview() {
  const location = useLocation();
  const navigate = useNavigate();
  const [report, setReport] = useState<ReportData | null>(null);
  
  // Filter states for ticket reports
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [statuses, setStatuses] = useState<Array<{id: number, status: string, color_code?: string}>>([]);
  const [priorities, setPriorities] = useState<Array<{id: number, title: string, color?: string}>>([]);

  useEffect(() => {
    // Get report data from navigation state
    if (location.state && location.state.report) {
      setReport(location.state.report);
    } else {
      // If no report data, redirect back to reports
      toast.error('No report data found');
      navigate('/reports');
    }
    // Fetch ticket statuses and priorities
    fetchTicketStatuses();
    fetchPriorities();
  }, [location, navigate]);

  const fetchTicketStatuses = async () => {
    try {
      const response = await axios.get('/ticket-statuses');
      const statusData = Array.isArray(response.data) ? response.data : [];
      setStatuses(statusData);
    } catch (err) {
      console.error('Error fetching ticket statuses:', err);
    }
  };

  const fetchPriorities = async () => {
    try {
      const response = await axios.get('/priorities');
      const priorityData = Array.isArray(response.data) ? response.data : [];
      setPriorities(priorityData);
    } catch (err) {
      console.error('Error fetching priorities:', err);
    }
  };

  // Filter ticket data based on selected filters
  const filteredTicketData = useMemo(() => {
    if (!report || report.type !== 'tickets' || !report.data) return [];
    
    let filtered = [...report.data] as TicketReportItem[];
    
    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(item => item.status === statusFilter);
    }
    
    // Apply priority filter
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(item => item.priority === priorityFilter);
    }
    
    return filtered;
  }, [report, statusFilter, priorityFilter]);

  const handleResetFilters = () => {
    setStatusFilter('all');
    setPriorityFilter('all');
  };

  const handleDownloadReport = (useFiltered = false) => {
    if (!report || !report.data) {
      toast.error('No data available to download');
      return;
    }

    let csvContent = '';
    const dataToExport = useFiltered && report.type === 'tickets' ? filteredTicketData : report.data;
    
    // Create CSV content based on report type
    if (report.type === 'customer-analytics') {
      const headers = ['Customer ID', 'Customer Name', 'Company', 'Email', 'Mobile', 'Total Tickets', 'Open Tickets', 'In Progress', 'Closed Tickets', 'Avg Resolution Time', 'Total Spent (₹)', 'Satisfaction %'];
      csvContent = [
        headers.join(','),
        ...dataToExport.map((item: CustomerAnalyticsItem) => 
          [item.customerId, item.customerName, item.company, item.email || 'N/A', item.mobile || 'N/A', item.totalTickets, item.openTickets, item.inProgressTickets, item.closedTickets, item.avgResolutionTime, item.totalSpent, item.satisfaction].join(',')
        )
      ].join('\n');
    } else if (report.type === 'tickets') {
      const headers = ['Date', 'Ticket ID', 'Customer', 'Assigned To', 'Priority', 'Status', 'Category', 'Response Time', 'Resolution Time'];
      csvContent = [
        headers.join(','),
        ...dataToExport.map((item: TicketReportItem) => 
          [item.date, item.ticketId, item.customer, item.assignedTo, item.priority, item.status, item.category, item.responseTime || 'N/A', item.resolutionTime || 'N/A'].join(',')
        )
      ].join('\n');
    }
    
    if (csvContent) {
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${report.name.replace(/[^a-z0-9]/gi, '_')}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      toast.success('Report downloaded successfully');
    } else {
      toast.error('Report type not supported for download');
    }
  };


  if (!report) {
    return (
      <DashboardLayout>
        <div className="container-fluid px-4">
          <div className="flex items-center justify-center h-64">
            <p className="text-gray-500">Loading report...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container-fluid px-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-3">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate('/reports')}
              className="flex items-center gap-2 w-fit"
            >
              <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="text-xs sm:text-sm">Back to Reports</span>
            </Button>
            <h1 className="text-xl sm:text-2xl font-semibold">Report Preview</h1>
          </div>
          <div className="flex items-center gap-2 text-xs sm:text-sm">
            <Link to="/" className="text-gray-600 hover:text-gray-800">Home</Link>
            <span className="text-gray-400">/</span>
            <Link to="/reports" className="text-gray-600 hover:text-gray-800">Reports</Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-800">Preview</span>
          </div>
        </div>

        {/* Report Display - Sales Report Removed */}
        {false && (
          <Card className="mb-6">
            <CardHeader className="print:hidden">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                <div>
                  <CardTitle className="text-lg sm:text-2xl">{report.name}</CardTitle>
                  <CardDescription className="mt-2 text-xs sm:text-sm">
                    <span className="block">Generated on: {new Date(report.generatedDate).toLocaleString()}</span>
                    <span className="block">Date Range: {report.dateRange.start === 'all' || report.dateRange.end === 'all' ? 'All Data' : `${new Date(report.dateRange.start).toLocaleDateString()} - ${new Date(report.dateRange.end).toLocaleDateString()}`}</span>
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    onClick={handleDownloadReport}
                    size="sm"
                    className="flex-1 sm:flex-initial"
                  >
                    <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                    <span className="text-xs sm:text-sm">Download CSV</span>
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            {/* Print Header - Only visible when printing */}
            <div className="hidden print:block mb-6 text-center">
              <h1 className="text-3xl font-bold mb-2">{report.name}</h1>
              <p className="text-gray-600">Generated on: {new Date(report.generatedDate).toLocaleString()}</p>
              <p className="text-gray-600">Date Range: {new Date(report.dateRange.start).toLocaleDateString()} - {new Date(report.dateRange.end).toLocaleDateString()}</p>
            </div>

            <CardContent>
              {/* Summary Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8 print:grid-cols-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 font-medium">Total Sales</p>
                  <p className="text-2xl font-bold text-blue-600">
                    ${report.data.reduce((sum: number, item: any) => sum + (item.total || 0), 0).toLocaleString()}
                  </p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 font-medium">Total Transactions</p>
                  <p className="text-2xl font-bold text-green-600">{report.data.length}</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 font-medium">Paid Invoices</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {report.data.filter((item: any) => item.status === 'Paid').length}
                  </p>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 font-medium">Pending Amount</p>
                  <p className="text-2xl font-bold text-orange-600">
                    ${report.data
                      .filter((item: any) => item.status === 'Pending')
                      .reduce((sum: number, item: any) => sum + (item.total || 0), 0)
                      .toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Sales Table */}
              <div className="overflow-x-auto">
                <h3 className="text-lg font-semibold mb-4">Sales Details</h3>
                <table className="w-full border" style={{ borderColor: '#e4e4e4' }}>
                  <thead>
                    <tr className="border-b bg-gray-50" style={{ borderColor: '#e4e4e4' }}>
                      <th className="text-left p-2 text-sm font-medium border-r" style={{ borderColor: '#e4e4e4' }}>Date</th>
                      <th className="text-left p-2 text-sm font-medium border-r" style={{ borderColor: '#e4e4e4' }}>Invoice ID</th>
                      <th className="text-left p-2 text-sm font-medium border-r" style={{ borderColor: '#e4e4e4' }}>Customer</th>
                      <th className="text-left p-2 text-sm font-medium border-r" style={{ borderColor: '#e4e4e4' }}>Items</th>
                      <th className="text-left p-2 text-sm font-medium border-r" style={{ borderColor: '#e4e4e4' }}>Service Charge</th>
                      <th className="text-left p-2 text-sm font-medium border-r" style={{ borderColor: '#e4e4e4' }}>Item Cost</th>
                      <th className="text-left p-2 text-sm font-medium border-r" style={{ borderColor: '#e4e4e4' }}>Total</th>
                      <th className="text-left p-2 text-sm font-medium border-r" style={{ borderColor: '#e4e4e4' }}>Payment</th>
                      <th className="text-left p-2 text-sm font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(report.data as any[]).map((item, index) => (
                      <tr key={index} className="border-b hover:bg-gray-50 print:hover:bg-white" style={{ borderColor: '#e4e4e4' }}>
                        <td className="p-2 text-sm border-r" style={{ borderColor: '#e4e4e4' }}>
                          {new Date(item.date).toLocaleDateString()}
                        </td>
                        <td className="p-2 text-sm border-r" style={{ borderColor: '#e4e4e4' }}>{item.invoiceId}</td>
                        <td className="p-2 text-sm border-r" style={{ borderColor: '#e4e4e4' }}>{item.customer}</td>
                        <td className="p-2 text-sm border-r text-center" style={{ borderColor: '#e4e4e4' }}>{item.items}</td>
                        <td className="p-2 text-sm border-r text-right" style={{ borderColor: '#e4e4e4' }}>${item.serviceCharge.toLocaleString()}</td>
                        <td className="p-2 text-sm border-r text-right" style={{ borderColor: '#e4e4e4' }}>${item.itemCost.toLocaleString()}</td>
                        <td className="p-2 text-sm font-semibold border-r text-right" style={{ borderColor: '#e4e4e4' }}>${item.total.toLocaleString()}</td>
                        <td className="p-2 text-sm border-r" style={{ borderColor: '#e4e4e4' }}>{item.paymentMethod}</td>
                        <td className="p-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            item.status === 'Paid' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
                          }`}>
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-gray-100 font-semibold">
                      <td colSpan={4} className="p-2 text-sm border-r" style={{ borderColor: '#e4e4e4' }}>Total</td>
                      <td className="p-2 text-sm border-r text-right" style={{ borderColor: '#e4e4e4' }}>
                        ${report.data.reduce((sum: number, item: any) => sum + (item.serviceCharge || 0), 0).toLocaleString()}
                      </td>
                      <td className="p-2 text-sm border-r text-right" style={{ borderColor: '#e4e4e4' }}>
                        ${report.data.reduce((sum: number, item: any) => sum + (item.itemCost || 0), 0).toLocaleString()}
                      </td>
                      <td className="p-2 text-sm border-r text-right" style={{ borderColor: '#e4e4e4' }}>
                        ${report.data.reduce((sum: number, item: any) => sum + (item.total || 0), 0).toLocaleString()}
                      </td>
                      <td colSpan={2} className="p-2"></td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Report Footer */}
              <div className="mt-8 pt-4 border-t text-center text-sm text-gray-500">
                <p>Report ID: {report.id}</p>
                <p>Generated by GL Tickets System</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Ticket Report Display */}
        {report.type === 'tickets' && report.data && (
          <Card className="mb-6" style={{ borderColor: '#e4e4e4' }}>
            <CardHeader className="print:hidden">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                <div>
                  <CardTitle className="text-lg sm:text-2xl">{report.name}</CardTitle>
                  <CardDescription className="mt-2 text-xs sm:text-sm">
                    <span className="block">Generated on: {new Date(report.generatedDate).toLocaleString()}</span>
                    <span className="block">Date Range: {report.dateRange.start === 'all' || report.dateRange.end === 'all' ? 'All Data' : `${new Date(report.dateRange.start).toLocaleDateString()} - ${new Date(report.dateRange.end).toLocaleDateString()}`}</span>
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    onClick={handleDownloadReport}
                    size="sm"
                    className="flex-1 sm:flex-initial"
                  >
                    <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                    <span className="text-xs sm:text-sm">Download CSV</span>
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            {/* Print Header - Only visible when printing */}
            <div className="hidden print:block mb-6 text-center">
              <h1 className="text-3xl font-bold mb-2">{report.name}</h1>
              <p className="text-gray-600">Generated on: {new Date(report.generatedDate).toLocaleString()}</p>
              <p className="text-gray-600">Date Range: {new Date(report.dateRange.start).toLocaleDateString()} - {new Date(report.dateRange.end).toLocaleDateString()}</p>
            </div>

            <CardContent>
              {/* Filter Controls */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg print:hidden">
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Filter className="h-3 w-3 sm:h-4 sm:w-4 text-gray-600" />
                      <span className="text-xs sm:text-sm font-medium">Filters:</span>
                    </div>
                    <div className="text-xs sm:text-sm text-gray-600">
                      Showing {filteredTicketData.length} of {report.data.length} tickets
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-3">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="All Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        {statuses.map((status) => (
                          <SelectItem key={status.id} value={status.status}>
                            <span style={{ color: status.color_code || '#6b7280' }}>
                              {status.status}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="All Priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Priority</SelectItem>
                        {priorities.map((priority) => (
                          <SelectItem key={priority.id} value={priority.title}>
                            <span style={{ color: priority.color || '#6b7280' }}>
                              {priority.title}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    {(statusFilter !== 'all' || priorityFilter !== 'all') && (
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={handleResetFilters}
                          style={{ width: '140px', backgroundColor: '#e2cef2', borderColor: '#e2cef2' }}
                          className="hover:bg-purple-200"
                        >
                          Reset Filters
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDownloadReport(true)}
                          style={{ width: '140px', backgroundColor: '#bcefef', borderColor: '#bcefef' }}
                          className="hover:bg-cyan-200"
                        >
                          <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                          Export Filtered
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Summary Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mb-8 print:grid-cols-5">
                <div className="bg-blue-50 p-3 sm:p-4 rounded-lg">
                  <p className="text-xs sm:text-sm text-gray-600 font-medium">Total Tickets</p>
                  <p className="text-lg sm:text-2xl font-bold text-blue-600">{filteredTicketData.length}</p>
                  {filteredTicketData.length !== report.data.length && (
                    <p className="text-xs text-gray-500">of {report.data.length}</p>
                  )}
                </div>
                <div className="bg-green-50 p-3 sm:p-4 rounded-lg">
                  <p className="text-xs sm:text-sm text-gray-600 font-medium">Resolved</p>
                  <p className="text-lg sm:text-2xl font-bold text-green-600">
                    {filteredTicketData.filter((item: TicketReportItem) => item.status === 'Resolved' || item.status === 'Closed').length}
                  </p>
                </div>
                <div className="bg-yellow-50 p-3 sm:p-4 rounded-lg">
                  <p className="text-xs sm:text-sm text-gray-600 font-medium">In Progress</p>
                  <p className="text-lg sm:text-2xl font-bold text-yellow-600">
                    {filteredTicketData.filter((item: TicketReportItem) => item.status === 'In Progress').length}
                  </p>
                </div>
                <div className="bg-orange-50 p-3 sm:p-4 rounded-lg">
                  <p className="text-xs sm:text-sm text-gray-600 font-medium">Open</p>
                  <p className="text-lg sm:text-2xl font-bold text-orange-600">
                    {filteredTicketData.filter((item: TicketReportItem) => item.status === 'Open').length}
                  </p>
                </div>
                <div className="bg-red-50 p-3 sm:p-4 rounded-lg col-span-2 sm:col-span-1">
                  <p className="text-xs sm:text-sm text-gray-600 font-medium">High Priority</p>
                  <p className="text-lg sm:text-2xl font-bold text-red-600">
                    {filteredTicketData.filter((item: TicketReportItem) => item.priority === 'High' || item.priority === 'Urgent').length}
                  </p>
                </div>
              </div>

              {/* Tickets Table */}
              <div className="overflow-x-auto">
                <h3 className="text-lg font-semibold mb-4">Ticket Details</h3>
                <table className="w-full border" style={{ borderColor: '#e4e4e4' }}>
                  <thead>
                    <tr className="border-b bg-gray-50" style={{ borderColor: '#e4e4e4' }}>
                      <th className="text-left p-2 text-sm font-medium border-r" style={{ borderColor: '#e4e4e4' }}>Date</th>
                      <th className="text-left p-2 text-sm font-medium border-r" style={{ borderColor: '#e4e4e4' }}>Ticket ID</th>
                      <th className="text-left p-2 text-sm font-medium border-r" style={{ borderColor: '#e4e4e4' }}>Customer</th>
                      <th className="text-left p-2 text-sm font-medium border-r" style={{ borderColor: '#e4e4e4' }}>Assigned To</th>
                      <th className="text-left p-2 text-sm font-medium border-r" style={{ borderColor: '#e4e4e4' }}>Category</th>
                      <th className="text-left p-2 text-sm font-medium border-r" style={{ borderColor: '#e4e4e4' }}>Priority</th>
                      <th className="text-left p-2 text-sm font-medium border-r" style={{ borderColor: '#e4e4e4' }}>Status</th>
                      <th className="text-left p-2 text-sm font-medium border-r" style={{ borderColor: '#e4e4e4' }}>Response</th>
                      <th className="text-left p-2 text-sm font-medium">Resolution</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTicketData.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="text-center py-8 text-gray-500">
                          No tickets found matching the selected filters
                        </td>
                      </tr>
                    ) : (
                      filteredTicketData.map((item, index) => (
                      <tr key={index} className="border-b hover:bg-gray-50 print:hover:bg-white" style={{ borderColor: '#e4e4e4' }}>
                        <td className="p-2 text-sm border-r" style={{ borderColor: '#e4e4e4' }}>
                          {new Date(item.date).toLocaleDateString()}
                        </td>
                        <td className="p-2 text-sm border-r font-medium" style={{ borderColor: '#e4e4e4' }}>{item.ticketId}</td>
                        <td className="p-2 text-sm border-r" style={{ borderColor: '#e4e4e4' }}>{item.customer}</td>
                        <td className="p-2 text-sm border-r" style={{ borderColor: '#e4e4e4' }}>{item.assignedTo}</td>
                        <td className="p-2 text-sm border-r" style={{ borderColor: '#e4e4e4' }}>{item.category}</td>
                        <td className="p-2 text-sm border-r" style={{ borderColor: '#e4e4e4' }}>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            item.priority === 'Urgent' ? 'bg-red-100 text-red-800' :
                            item.priority === 'High' ? 'bg-orange-100 text-orange-800' :
                            item.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {item.priority}
                          </span>
                        </td>
                        <td className="p-2 text-sm border-r" style={{ borderColor: '#e4e4e4' }}>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            item.status === 'Closed' || item.status === 'Resolved' ? 'bg-green-100 text-green-800' :
                            item.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                            item.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {item.status}
                          </span>
                        </td>
                        <td className="p-2 text-sm border-r" style={{ borderColor: '#e4e4e4' }}>{item.responseTime || 'N/A'}</td>
                        <td className="p-2 text-sm" style={{ borderColor: '#e4e4e4' }}>{item.resolutionTime || 'N/A'}</td>
                      </tr>
                    )))}
                  </tbody>
                </table>
              </div>

              {/* Performance Metrics */}
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                  <p className="text-xs sm:text-sm text-gray-600 font-medium">Average Response Time</p>
                  <p className="text-lg sm:text-xl font-bold">
                    {(() => {
                      const times = filteredTicketData
                        .map((item: TicketReportItem) => parseInt(item.responseTime?.replace('h', '') || '0'))
                        .filter((t: number) => t > 0);
                      const avg = times.length > 0 ? Math.round(times.reduce((a: number, b: number) => a + b, 0) / times.length) : 0;
                      return `${avg}h`;
                    })()}
                  </p>
                  {filteredTicketData.length !== report.data.length && (
                    <p className="text-xs text-gray-500">(filtered)</p>
                  )}
                </div>
                <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                  <p className="text-xs sm:text-sm text-gray-600 font-medium">Average Resolution Time</p>
                  <p className="text-lg sm:text-xl font-bold">
                    {(() => {
                      const times = filteredTicketData
                        .map((item: TicketReportItem) => parseInt(item.resolutionTime?.replace('h', '') || '0'))
                        .filter((t: number) => t > 0);
                      const avg = times.length > 0 ? Math.round(times.reduce((a: number, b: number) => a + b, 0) / times.length) : 0;
                      return `${avg}h`;
                    })()}
                  </p>
                  {filteredTicketData.length !== report.data.length && (
                    <p className="text-xs text-gray-500">(filtered)</p>
                  )}
                </div>
                <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                  <p className="text-xs sm:text-sm text-gray-600 font-medium">Resolution Rate</p>
                  <p className="text-lg sm:text-xl font-bold">
                    {filteredTicketData.length > 0 
                      ? Math.round((filteredTicketData.filter((item: TicketReportItem) => 
                          item.status === 'Resolved' || item.status === 'Closed'
                        ).length / filteredTicketData.length) * 100)
                      : 0}%
                  </p>
                  {filteredTicketData.length !== report.data.length && (
                    <p className="text-xs text-gray-500">(filtered)</p>
                  )}
                </div>
              </div>

              {/* Report Footer */}
              <div className="mt-8 pt-4 border-t text-center text-sm text-gray-500">
                <p>Report ID: {report.id}</p>
                <p>Generated by GL Tickets System</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Customer Analytics Report Display */}
        {report.type === 'customer-analytics' && report.data && (
          <Card className="mb-6" style={{ borderColor: '#e4e4e4' }}>
            <CardHeader className="print:hidden">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-2xl">{report.name}</CardTitle>
                  <CardDescription className="mt-2">
                    <span className="block">Generated on: {new Date(report.generatedDate).toLocaleString()}</span>
                    <span className="block">Showing all customers with ticket statistics</span>
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleDownloadReport()}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export CSV
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              {/* Summary Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8 print:grid-cols-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 font-medium">Total Customers</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {report.data.length}
                  </p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 font-medium">Total Tickets</p>
                  <p className="text-2xl font-bold text-green-600">
                    {report.data.reduce((sum: number, item: CustomerAnalyticsItem) => sum + item.totalTickets, 0)}
                  </p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 font-medium">Active Customers</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {report.data.filter((item: CustomerAnalyticsItem) => item.totalTickets > 0).length}
                  </p>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 font-medium">Total Revenue</p>
                  <p className="text-2xl font-bold text-orange-600">
                    ₹{report.data.reduce((sum: number, item: CustomerAnalyticsItem) => sum + item.totalSpent, 0).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Customer Analytics Table */}
              <div className="overflow-x-auto">
                <h3 className="text-lg font-semibold mb-4">Customer Analytics Details</h3>
                <table className="w-full border" style={{ borderColor: '#e4e4e4' }}>
                  <thead>
                    <tr className="border-b bg-gray-50" style={{ borderColor: '#e4e4e4' }}>
                      <th className="text-left p-2 text-sm font-medium border-r" style={{ borderColor: '#e4e4e4' }}>Customer ID</th>
                      <th className="text-left p-2 text-sm font-medium border-r" style={{ borderColor: '#e4e4e4' }}>Name</th>
                      <th className="text-left p-2 text-sm font-medium border-r" style={{ borderColor: '#e4e4e4' }}>Company</th>
                      <th className="text-left p-2 text-sm font-medium border-r" style={{ borderColor: '#e4e4e4' }}>Total Tickets</th>
                      <th className="text-left p-2 text-sm font-medium border-r" style={{ borderColor: '#e4e4e4' }}>Open</th>
                      <th className="text-left p-2 text-sm font-medium border-r" style={{ borderColor: '#e4e4e4' }}>In Progress</th>
                      <th className="text-left p-2 text-sm font-medium border-r" style={{ borderColor: '#e4e4e4' }}>Closed</th>
                      <th className="text-left p-2 text-sm font-medium border-r" style={{ borderColor: '#e4e4e4' }}>Avg Resolution</th>
                      <th className="text-left p-2 text-sm font-medium" style={{ borderColor: '#e4e4e4' }}>Total Spent</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(report.data as CustomerAnalyticsItem[]).map((item, index) => (
                      <tr key={index} className="border-b hover:bg-gray-50 print:hover:bg-white" style={{ borderColor: '#e4e4e4' }}>
                        <td className="p-2 text-sm border-r" style={{ borderColor: '#e4e4e4' }}>{item.customerId}</td>
                        <td className="p-2 text-sm border-r font-medium" style={{ borderColor: '#e4e4e4' }}>{item.customerName}</td>
                        <td className="p-2 text-sm border-r" style={{ borderColor: '#e4e4e4' }}>{item.company}</td>
                        <td className="p-2 text-sm font-semibold border-r text-center" style={{ borderColor: '#e4e4e4' }}>{item.totalTickets}</td>
                        <td className="p-2 text-sm border-r text-center" style={{ borderColor: '#e4e4e4' }}>
                          <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">{item.openTickets}</span>
                        </td>
                        <td className="p-2 text-sm border-r text-center" style={{ borderColor: '#e4e4e4' }}>
                          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">{item.inProgressTickets}</span>
                        </td>
                        <td className="p-2 text-sm border-r text-center" style={{ borderColor: '#e4e4e4' }}>
                          <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">{item.closedTickets}</span>
                        </td>
                        <td className="p-2 text-sm border-r text-center" style={{ borderColor: '#e4e4e4' }}>{item.avgResolutionTime}</td>
                        <td className="p-2 text-sm text-right font-medium">₹{item.totalSpent.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-gray-100 font-semibold">
                      <td colSpan={3} className="p-2 text-sm border-r" style={{ borderColor: '#e4e4e4' }}>Total</td>
                      <td className="p-2 text-sm border-r text-center" style={{ borderColor: '#e4e4e4' }}>
                        {report.data.reduce((sum: number, item: CustomerAnalyticsItem) => sum + item.totalTickets, 0)}
                      </td>
                      <td className="p-2 text-sm border-r text-center" style={{ borderColor: '#e4e4e4' }}>
                        {report.data.reduce((sum: number, item: CustomerAnalyticsItem) => sum + item.openTickets, 0)}
                      </td>
                      <td className="p-2 text-sm border-r text-center" style={{ borderColor: '#e4e4e4' }}>
                        {report.data.reduce((sum: number, item: CustomerAnalyticsItem) => sum + item.inProgressTickets, 0)}
                      </td>
                      <td className="p-2 text-sm border-r text-center" style={{ borderColor: '#e4e4e4' }}>
                        {report.data.reduce((sum: number, item: CustomerAnalyticsItem) => sum + item.closedTickets, 0)}
                      </td>
                      <td className="p-2 text-sm border-r" style={{ borderColor: '#e4e4e4' }}>-</td>
                      <td className="p-2 text-sm text-right" style={{ borderColor: '#e4e4e4' }}>
                        ₹{report.data.reduce((sum: number, item: CustomerAnalyticsItem) => sum + item.totalSpent, 0).toLocaleString()}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Report Footer */}
              <div className="mt-8 pt-4 border-t text-center text-sm text-gray-500">
                <p>Report ID: {report.id}</p>
                <p>Generated by GL Tickets System</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Customer Report Display */}
        {report.type === 'customers' && report.data && (
          <Card className="mb-6" style={{ borderColor: '#e4e4e4' }}>
            <CardHeader className="print:hidden">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-2xl">{report.name}</CardTitle>
                  <CardDescription className="mt-2">
                    <span className="block">Generated on: {new Date(report.generatedDate).toLocaleString()}</span>
                    <span className="block">Date Range: {report.dateRange.start === 'all' || report.dateRange.end === 'all' ? 'All Data' : `${new Date(report.dateRange.start).toLocaleDateString()} - ${new Date(report.dateRange.end).toLocaleDateString()}`}</span>
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleDownloadReport()}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export CSV
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              {/* Summary Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8 print:grid-cols-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 font-medium">Total Customers</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {report.data.length}
                  </p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 font-medium">Active Customers</p>
                  <p className="text-2xl font-bold text-green-600">
                    {report.data.filter((item: CustomerReportItem) => item.status === 'Active').length}
                  </p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 font-medium">Total Tickets</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {report.data.reduce((sum: number, item: CustomerReportItem) => sum + item.totalTickets, 0)}
                  </p>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 font-medium">Total Revenue</p>
                  <p className="text-2xl font-bold text-orange-600">
                    ₹{report.data.reduce((sum: number, item: CustomerReportItem) => sum + item.totalSpent, 0).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Customer Report Table */}
              <div className="overflow-x-auto">
                <h3 className="text-lg font-semibold mb-4">Customer Details</h3>
                <table className="w-full border" style={{ borderColor: '#e4e4e4' }}>
                  <thead>
                    <tr className="border-b bg-gray-50" style={{ borderColor: '#e4e4e4' }}>
                      <th className="text-left p-2 text-sm font-medium border-r" style={{ borderColor: '#e4e4e4' }}>Customer ID</th>
                      <th className="text-left p-2 text-sm font-medium border-r" style={{ borderColor: '#e4e4e4' }}>Name</th>
                      <th className="text-left p-2 text-sm font-medium border-r" style={{ borderColor: '#e4e4e4' }}>Email</th>
                      <th className="text-left p-2 text-sm font-medium border-r" style={{ borderColor: '#e4e4e4' }}>Mobile</th>
                      <th className="text-left p-2 text-sm font-medium border-r" style={{ borderColor: '#e4e4e4' }}>Company</th>
                      <th className="text-left p-2 text-sm font-medium border-r" style={{ borderColor: '#e4e4e4' }}>Join Date</th>
                      <th className="text-left p-2 text-sm font-medium border-r" style={{ borderColor: '#e4e4e4' }}>Total Tickets</th>
                      <th className="text-left p-2 text-sm font-medium border-r" style={{ borderColor: '#e4e4e4' }}>Total Spent</th>
                      <th className="text-left p-2 text-sm font-medium" style={{ borderColor: '#e4e4e4' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(report.data as CustomerReportItem[]).map((item, index) => (
                      <tr key={index} className="border-b hover:bg-gray-50 print:hover:bg-white" style={{ borderColor: '#e4e4e4' }}>
                        <td className="p-2 text-sm border-r" style={{ borderColor: '#e4e4e4' }}>{item.customerId}</td>
                        <td className="p-2 text-sm border-r font-medium" style={{ borderColor: '#e4e4e4' }}>{item.customerName}</td>
                        <td className="p-2 text-sm border-r" style={{ borderColor: '#e4e4e4' }}>{item.email}</td>
                        <td className="p-2 text-sm border-r" style={{ borderColor: '#e4e4e4' }}>{item.mobile}</td>
                        <td className="p-2 text-sm border-r" style={{ borderColor: '#e4e4e4' }}>{item.company}</td>
                        <td className="p-2 text-sm border-r" style={{ borderColor: '#e4e4e4' }}>{item.joinDate}</td>
                        <td className="p-2 text-sm font-semibold border-r text-center" style={{ borderColor: '#e4e4e4' }}>{item.totalTickets}</td>
                        <td className="p-2 text-sm border-r text-right font-medium" style={{ borderColor: '#e4e4e4' }}>₹{item.totalSpent.toLocaleString()}</td>
                        <td className="p-2 text-sm" style={{ borderColor: '#e4e4e4' }}>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            item.status === 'Active' ? 'bg-green-100 text-green-800' :
                            item.status === 'New' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-gray-100 font-semibold">
                      <td colSpan={6} className="p-2 text-sm border-r" style={{ borderColor: '#e4e4e4' }}>Total</td>
                      <td className="p-2 text-sm border-r text-center" style={{ borderColor: '#e4e4e4' }}>
                        {report.data.reduce((sum: number, item: CustomerReportItem) => sum + item.totalTickets, 0)}
                      </td>
                      <td className="p-2 text-sm border-r text-right" style={{ borderColor: '#e4e4e4' }}>
                        ₹{report.data.reduce((sum: number, item: CustomerReportItem) => sum + item.totalSpent, 0).toLocaleString()}
                      </td>
                      <td className="p-2 text-sm" style={{ borderColor: '#e4e4e4' }}>-</td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Report Footer */}
              <div className="mt-8 pt-4 border-t text-center text-sm text-gray-500">
                <p>Report ID: {report.id}</p>
                <p>Generated by GL Tickets System</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Inventory Report Display */}
        {report.type === 'inventory' && report.data && (
          <Card className="mb-6" style={{ borderColor: '#e4e4e4' }}>
            <CardHeader className="print:hidden">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-2xl">{report.name}</CardTitle>
                  <CardDescription className="mt-2">
                    <span className="block">Generated on: {new Date(report.generatedDate).toLocaleString()}</span>
                    <span className="block">Date Range: {report.dateRange.start === 'all' || report.dateRange.end === 'all' ? 'All Data' : `${new Date(report.dateRange.start).toLocaleDateString()} - ${new Date(report.dateRange.end).toLocaleDateString()}`}</span>
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleDownloadReport()}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export CSV
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              {/* Summary Stats */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8 print:grid-cols-5">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 font-medium">Total Products</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {report.data.length}
                  </p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 font-medium">In Stock</p>
                  <p className="text-2xl font-bold text-green-600">
                    {report.data.filter((item: InventoryReportItem) => item.stockLevel === 'Normal' && item.currentStock > 0).length}
                  </p>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 font-medium">Low Stock</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {report.data.filter((item: InventoryReportItem) => ['Low', 'Warning'].includes(item.stockLevel)).length}
                  </p>
                </div>
                <div className="bg-red-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 font-medium">Out of Stock</p>
                  <p className="text-2xl font-bold text-red-600">
                    {report.data.filter((item: InventoryReportItem) => item.stockLevel === 'Critical').length}
                  </p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 font-medium">Total Value</p>
                  <p className="text-2xl font-bold text-purple-600">
                    ₹{report.data.reduce((sum: number, item: InventoryReportItem) => sum + item.totalValue, 0).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Inventory Report Table */}
              <div className="overflow-x-auto">
                <h3 className="text-lg font-semibold mb-4">Inventory Details</h3>
                <table className="w-full border" style={{ borderColor: '#e4e4e4' }}>
                  <thead>
                    <tr className="border-b bg-gray-50" style={{ borderColor: '#e4e4e4' }}>
                      <th className="text-left p-2 text-sm font-medium border-r" style={{ borderColor: '#e4e4e4' }}>Product ID</th>
                      <th className="text-left p-2 text-sm font-medium border-r" style={{ borderColor: '#e4e4e4' }}>Code</th>
                      <th className="text-left p-2 text-sm font-medium border-r" style={{ borderColor: '#e4e4e4' }}>Product Name</th>
                      <th className="text-left p-2 text-sm font-medium border-r" style={{ borderColor: '#e4e4e4' }}>Category</th>
                      <th className="text-left p-2 text-sm font-medium border-r" style={{ borderColor: '#e4e4e4' }}>Brand</th>
                      <th className="text-left p-2 text-sm font-medium border-r" style={{ borderColor: '#e4e4e4' }}>Current Stock</th>
                      <th className="text-left p-2 text-sm font-medium border-r" style={{ borderColor: '#e4e4e4' }}>Stock Status</th>
                      <th className="text-left p-2 text-sm font-medium border-r" style={{ borderColor: '#e4e4e4' }}>Unit Cost</th>
                      <th className="text-left p-2 text-sm font-medium" style={{ borderColor: '#e4e4e4' }}>Total Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(report.data as InventoryReportItem[]).map((item, index) => (
                      <tr key={index} className="border-b hover:bg-gray-50 print:hover:bg-white" style={{ borderColor: '#e4e4e4' }}>
                        <td className="p-2 text-sm border-r" style={{ borderColor: '#e4e4e4' }}>{item.productId}</td>
                        <td className="p-2 text-sm border-r" style={{ borderColor: '#e4e4e4' }}>{item.productCode}</td>
                        <td className="p-2 text-sm border-r font-medium" style={{ borderColor: '#e4e4e4' }}>{item.productName}</td>
                        <td className="p-2 text-sm border-r" style={{ borderColor: '#e4e4e4' }}>{item.category}</td>
                        <td className="p-2 text-sm border-r" style={{ borderColor: '#e4e4e4' }}>{item.brand}</td>
                        <td className="p-2 text-sm border-r text-center font-semibold" style={{ borderColor: '#e4e4e4' }}>{item.currentStock}</td>
                        <td className="p-2 text-sm border-r" style={{ borderColor: '#e4e4e4' }}>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            item.stockLevel === 'Critical' ? 'bg-red-100 text-red-800' :
                            item.stockLevel === 'Low' ? 'bg-yellow-100 text-yellow-800' :
                            item.stockLevel === 'Warning' ? 'bg-orange-100 text-orange-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {item.stockStatus}
                          </span>
                        </td>
                        <td className="p-2 text-sm border-r text-right" style={{ borderColor: '#e4e4e4' }}>₹{item.unitCost.toLocaleString()}</td>
                        <td className="p-2 text-sm text-right font-medium">₹{item.totalValue.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-gray-100 font-semibold">
                      <td colSpan={5} className="p-2 text-sm border-r" style={{ borderColor: '#e4e4e4' }}>Total</td>
                      <td className="p-2 text-sm border-r text-center" style={{ borderColor: '#e4e4e4' }}>
                        {report.data.reduce((sum: number, item: InventoryReportItem) => sum + item.currentStock, 0)}
                      </td>
                      <td className="p-2 text-sm border-r" style={{ borderColor: '#e4e4e4' }}>-</td>
                      <td className="p-2 text-sm border-r" style={{ borderColor: '#e4e4e4' }}>-</td>
                      <td className="p-2 text-sm text-right" style={{ borderColor: '#e4e4e4' }}>
                        ₹{report.data.reduce((sum: number, item: InventoryReportItem) => sum + item.totalValue, 0).toLocaleString()}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Stock Level Summary */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 font-medium">Average Stock Level</p>
                  <p className="text-xl font-bold">
                    {Math.round(report.data.reduce((sum: number, item: InventoryReportItem) => sum + item.currentStock, 0) / report.data.length)}
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 font-medium">Total Stock Value</p>
                  <p className="text-xl font-bold">
                    ₹{report.data.reduce((sum: number, item: InventoryReportItem) => sum + item.totalValue, 0).toLocaleString()}
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 font-medium">Products Need Restock</p>
                  <p className="text-xl font-bold">
                    {report.data.filter((item: InventoryReportItem) => ['Low', 'Warning', 'Critical'].includes(item.stockLevel)).length}
                  </p>
                </div>
              </div>

              {/* Report Footer */}
              <div className="mt-8 pt-4 border-t text-center text-sm text-gray-500">
                <p>Report ID: {report.id}</p>
                <p>Generated by GL Tickets System</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Performance Report Display */}
        {report.type === 'performance' && report.data && (
          <Card className="mb-6" style={{ borderColor: '#e4e4e4' }}>
            <CardHeader className="print:hidden">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-2xl">{report.name}</CardTitle>
                  <CardDescription className="mt-2">
                    <span className="block">Generated on: {new Date(report.generatedDate).toLocaleString()}</span>
                    <span className="block">Date Range: {report.dateRange.start === 'all' || report.dateRange.end === 'all' ? 'All Data' : `${new Date(report.dateRange.start).toLocaleDateString()} - ${new Date(report.dateRange.end).toLocaleDateString()}`}</span>
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleDownloadReport()}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export CSV
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              {/* Summary Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8 print:grid-cols-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 font-medium">Total Agents</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {report.data.length}
                  </p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 font-medium">Total Assigned</p>
                  <p className="text-2xl font-bold text-green-600">
                    {report.data.reduce((sum: number, item: PerformanceReportItem) => sum + item.assignedTickets, 0)}
                  </p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 font-medium">Total Closed</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {report.data.reduce((sum: number, item: PerformanceReportItem) => sum + item.closedTickets, 0)}
                  </p>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 font-medium">Avg Completion</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {report.data.length > 0 ? 
                      (report.data.reduce((sum: number, item: PerformanceReportItem) => sum + item.completionRate, 0) / report.data.length).toFixed(1) : 0}%
                  </p>
                </div>
              </div>

              {/* Performance Report Table */}
              <div className="overflow-x-auto">
                <h3 className="text-lg font-semibold mb-4">Agent Performance Details</h3>
                <table className="w-full border" style={{ borderColor: '#e4e4e4' }}>
                  <thead>
                    <tr className="border-b bg-gray-50" style={{ borderColor: '#e4e4e4' }}>
                      <th className="text-left p-2 text-sm font-medium border-r" style={{ borderColor: '#e4e4e4' }}>Agent ID</th>
                      <th className="text-left p-2 text-sm font-medium border-r" style={{ borderColor: '#e4e4e4' }}>Name</th>
                      <th className="text-left p-2 text-sm font-medium border-r" style={{ borderColor: '#e4e4e4' }}>Email</th>
                      <th className="text-center p-2 text-sm font-medium border-r" style={{ borderColor: '#e4e4e4' }}>Assigned</th>
                      <th className="text-center p-2 text-sm font-medium border-r" style={{ borderColor: '#e4e4e4' }}>Open</th>
                      <th className="text-center p-2 text-sm font-medium border-r" style={{ borderColor: '#e4e4e4' }}>In Progress</th>
                      <th className="text-center p-2 text-sm font-medium border-r" style={{ borderColor: '#e4e4e4' }}>Closed</th>
                      <th className="text-center p-2 text-sm font-medium border-r" style={{ borderColor: '#e4e4e4' }}>Completion %</th>
                      <th className="text-center p-2 text-sm font-medium border-r" style={{ borderColor: '#e4e4e4' }}>Avg Time</th>
                      <th className="text-center p-2 text-sm font-medium" style={{ borderColor: '#e4e4e4' }}>Performance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(report.data as PerformanceReportItem[]).map((item, index) => (
                      <tr key={index} className="border-b hover:bg-gray-50 print:hover:bg-white" style={{ borderColor: '#e4e4e4' }}>
                        <td className="p-2 text-sm border-r" style={{ borderColor: '#e4e4e4' }}>{item.agentId}</td>
                        <td className="p-2 text-sm border-r font-medium" style={{ borderColor: '#e4e4e4' }}>{item.agentName}</td>
                        <td className="p-2 text-sm border-r" style={{ borderColor: '#e4e4e4' }}>{item.email}</td>
                        <td className="p-2 text-sm border-r text-center font-semibold" style={{ borderColor: '#e4e4e4' }}>{item.assignedTickets}</td>
                        <td className="p-2 text-sm border-r text-center" style={{ borderColor: '#e4e4e4' }}>{item.openTickets}</td>
                        <td className="p-2 text-sm border-r text-center" style={{ borderColor: '#e4e4e4' }}>{item.inProgressTickets}</td>
                        <td className="p-2 text-sm border-r text-center" style={{ borderColor: '#e4e4e4' }}>{item.closedTickets}</td>
                        <td className="p-2 text-sm border-r text-center font-medium" style={{ borderColor: '#e4e4e4' }}>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            item.completionRate >= 80 ? 'bg-green-100 text-green-800' :
                            item.completionRate >= 60 ? 'bg-blue-100 text-blue-800' :
                            item.completionRate >= 40 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {item.completionRate}%
                          </span>
                        </td>
                        <td className="p-2 text-sm border-r text-center" style={{ borderColor: '#e4e4e4' }}>{item.avgResolutionTime}</td>
                        <td className="p-2 text-sm text-center" style={{ borderColor: '#e4e4e4' }}>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            item.performance === 'Excellent' ? 'bg-green-100 text-green-800' :
                            item.performance === 'Good' ? 'bg-blue-100 text-blue-800' :
                            item.performance === 'Average' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {item.performance}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-gray-100 font-semibold">
                      <td colSpan={3} className="p-2 text-sm border-r" style={{ borderColor: '#e4e4e4' }}>Total</td>
                      <td className="p-2 text-sm border-r text-center" style={{ borderColor: '#e4e4e4' }}>
                        {report.data.reduce((sum: number, item: PerformanceReportItem) => sum + item.assignedTickets, 0)}
                      </td>
                      <td className="p-2 text-sm border-r text-center" style={{ borderColor: '#e4e4e4' }}>
                        {report.data.reduce((sum: number, item: PerformanceReportItem) => sum + item.openTickets, 0)}
                      </td>
                      <td className="p-2 text-sm border-r text-center" style={{ borderColor: '#e4e4e4' }}>
                        {report.data.reduce((sum: number, item: PerformanceReportItem) => sum + item.inProgressTickets, 0)}
                      </td>
                      <td className="p-2 text-sm border-r text-center" style={{ borderColor: '#e4e4e4' }}>
                        {report.data.reduce((sum: number, item: PerformanceReportItem) => sum + item.closedTickets, 0)}
                      </td>
                      <td colSpan={3} className="p-2 text-sm" style={{ borderColor: '#e4e4e4' }}>-</td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Top Performers */}
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-4">Top Performers</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {(report.data as PerformanceReportItem[])
                    .sort((a, b) => b.completionRate - a.completionRate)
                    .slice(0, 3)
                    .map((agent, index) => (
                      <div key={index} className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">{agent.agentName}</span>
                          <span className={`text-lg font-bold ${
                            index === 0 ? 'text-yellow-600' :
                            index === 1 ? 'text-gray-600' :
                            'text-orange-600'
                          }`}>
                            #{index + 1}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">Completion: {agent.completionRate}%</p>
                        <p className="text-sm text-gray-600">Closed: {agent.closedTickets} tickets</p>
                      </div>
                    ))}
                </div>
              </div>

              {/* Report Footer */}
              <div className="mt-8 pt-4 border-t text-center text-sm text-gray-500">
                <p>Report ID: {report.id}</p>
                <p>Generated by GL Tickets System</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Monthly Summary Report Display */}
        {report.type === 'monthly' && report.data && (
          <Card className="mb-6" style={{ borderColor: '#e4e4e4' }}>
            <CardHeader className="print:hidden">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-2xl">{report.name}</CardTitle>
                  <CardDescription className="mt-2">
                    <span className="block">Generated on: {new Date(report.generatedDate).toLocaleString()}</span>
                    <span className="block">Date Range: {report.dateRange.start === 'all' || report.dateRange.end === 'all' ? 'All Data' : `${new Date(report.dateRange.start).toLocaleDateString()} - ${new Date(report.dateRange.end).toLocaleDateString()}`}</span>
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleDownloadReport()}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export CSV
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              {(() => {
                const summary = report.data as MonthlySummaryItem;
                return (
                  <>
                    {/* Month Header */}
                    <div className="text-center mb-6">
                      <h2 className="text-3xl font-bold">{summary.month} {summary.year}</h2>
                      <p className="text-gray-600">Monthly Business Summary</p>
                    </div>

                    {/* Key Metrics */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 print:grid-cols-4">
                      <div className="bg-green-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-600 font-medium">Total Revenue</p>
                        <p className="text-2xl font-bold text-green-600">
                          ₹{summary.totalRevenue.toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-500">
                          {summary.growthPercentage > 0 ? '+' : ''}{summary.growthPercentage}% vs last month
                        </p>
                      </div>
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-600 font-medium">Total Payments</p>
                        <p className="text-2xl font-bold text-blue-600">
                          {summary.totalPayments}
                        </p>
                        <p className="text-xs text-gray-500">
                          Avg: ₹{summary.averagePaymentAmount.toLocaleString()}
                        </p>
                      </div>
                      <div className="bg-purple-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-600 font-medium">New Customers</p>
                        <p className="text-2xl font-bold text-purple-600">
                          {summary.newCustomers}
                        </p>
                        <p className="text-xs text-gray-500">This month</p>
                      </div>
                      <div className="bg-orange-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-600 font-medium">Closed Tickets</p>
                        <p className="text-2xl font-bold text-orange-600">
                          {summary.ticketStats.closedTickets}
                        </p>
                        <p className="text-xs text-gray-500">
                          Avg closure: {summary.ticketStats.averageClosureTime}
                        </p>
                      </div>
                    </div>

                    {/* Payment Modes Breakdown */}
                    <div className="mb-8">
                      <h3 className="text-lg font-semibold mb-4">Payment Modes Distribution</h3>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        <div className="bg-gray-50 p-4 rounded-lg text-center">
                          <p className="text-sm text-gray-600">Cash</p>
                          <p className="text-xl font-bold">₹{summary.paymentModes.cash.toLocaleString()}</p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg text-center">
                          <p className="text-sm text-gray-600">Online</p>
                          <p className="text-xl font-bold">₹{summary.paymentModes.online.toLocaleString()}</p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg text-center">
                          <p className="text-sm text-gray-600">Card</p>
                          <p className="text-xl font-bold">₹{summary.paymentModes.card.toLocaleString()}</p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg text-center">
                          <p className="text-sm text-gray-600">Cheque</p>
                          <p className="text-xl font-bold">₹{summary.paymentModes.cheque.toLocaleString()}</p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg text-center">
                          <p className="text-sm text-gray-600">Other</p>
                          <p className="text-xl font-bold">₹{summary.paymentModes.other.toLocaleString()}</p>
                        </div>
                      </div>
                    </div>

                    {/* Top Customers */}
                    <div className="mb-8">
                      <h3 className="text-lg font-semibold mb-4">Top 5 Customers</h3>
                      <div className="overflow-x-auto">
                        <table className="w-full border" style={{ borderColor: '#e4e4e4' }}>
                          <thead>
                            <tr className="border-b bg-gray-50" style={{ borderColor: '#e4e4e4' }}>
                              <th className="text-left p-2 text-sm font-medium border-r" style={{ borderColor: '#e4e4e4' }}>Rank</th>
                              <th className="text-left p-2 text-sm font-medium border-r" style={{ borderColor: '#e4e4e4' }}>Customer ID</th>
                              <th className="text-left p-2 text-sm font-medium border-r" style={{ borderColor: '#e4e4e4' }}>Customer Name</th>
                              <th className="text-left p-2 text-sm font-medium border-r" style={{ borderColor: '#e4e4e4' }}>Total Paid</th>
                              <th className="text-left p-2 text-sm font-medium" style={{ borderColor: '#e4e4e4' }}>Payment Count</th>
                            </tr>
                          </thead>
                          <tbody>
                            {summary.topCustomers.map((customer, index) => (
                              <tr key={index} className="border-b hover:bg-gray-50 print:hover:bg-white" style={{ borderColor: '#e4e4e4' }}>
                                <td className="p-2 text-sm border-r font-medium" style={{ borderColor: '#e4e4e4' }}>
                                  <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full ${
                                    index === 0 ? 'bg-yellow-100 text-yellow-800' :
                                    index === 1 ? 'bg-gray-100 text-gray-800' :
                                    index === 2 ? 'bg-orange-100 text-orange-800' :
                                    'bg-blue-50 text-blue-600'
                                  }`}>
                                    {index + 1}
                                  </span>
                                </td>
                                <td className="p-2 text-sm border-r" style={{ borderColor: '#e4e4e4' }}>{customer.customerId}</td>
                                <td className="p-2 text-sm border-r font-medium" style={{ borderColor: '#e4e4e4' }}>{customer.customerName}</td>
                                <td className="p-2 text-sm border-r text-right font-medium" style={{ borderColor: '#e4e4e4' }}>
                                  ₹{customer.totalPaid.toLocaleString()}
                                </td>
                                <td className="p-2 text-sm text-center" style={{ borderColor: '#e4e4e4' }}>
                                  {customer.paymentCount}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Daily Revenue Chart (Table Format) */}
                    {summary.dailyRevenue && summary.dailyRevenue.length > 0 && (
                      <div className="mb-8">
                        <h3 className="text-lg font-semibold mb-4">Daily Revenue Breakdown</h3>
                        <div className="overflow-x-auto max-h-96">
                          <table className="w-full border" style={{ borderColor: '#e4e4e4' }}>
                            <thead className="sticky top-0 bg-white">
                              <tr className="border-b bg-gray-50" style={{ borderColor: '#e4e4e4' }}>
                                <th className="text-left p-2 text-sm font-medium border-r" style={{ borderColor: '#e4e4e4' }}>Date</th>
                                <th className="text-left p-2 text-sm font-medium border-r" style={{ borderColor: '#e4e4e4' }}>Revenue</th>
                                <th className="text-left p-2 text-sm font-medium" style={{ borderColor: '#e4e4e4' }}>Payments</th>
                              </tr>
                            </thead>
                            <tbody>
                              {summary.dailyRevenue.map((day, index) => (
                                <tr key={index} className="border-b hover:bg-gray-50 print:hover:bg-white" style={{ borderColor: '#e4e4e4' }}>
                                  <td className="p-2 text-sm border-r font-medium" style={{ borderColor: '#e4e4e4' }}>{day.date}</td>
                                  <td className="p-2 text-sm border-r text-right" style={{ borderColor: '#e4e4e4' }}>
                                    ₹{day.revenue.toLocaleString()}
                                  </td>
                                  <td className="p-2 text-sm text-center" style={{ borderColor: '#e4e4e4' }}>
                                    {day.paymentCount}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                            <tfoot>
                              <tr className="bg-gray-100 font-semibold">
                                <td className="p-2 text-sm border-r" style={{ borderColor: '#e4e4e4' }}>Total</td>
                                <td className="p-2 text-sm border-r text-right" style={{ borderColor: '#e4e4e4' }}>
                                  ₹{summary.totalRevenue.toLocaleString()}
                                </td>
                                <td className="p-2 text-sm text-center" style={{ borderColor: '#e4e4e4' }}>
                                  {summary.totalPayments}
                                </td>
                              </tr>
                            </tfoot>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* Comparison with Previous Month */}
                    <div className="mb-8">
                      <h3 className="text-lg font-semibold mb-4">Month-over-Month Comparison</h3>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-600">Previous Month Revenue</p>
                            <p className="text-xl font-bold">₹{summary.previousMonthRevenue.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Growth Rate</p>
                            <p className={`text-xl font-bold ${summary.growthPercentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {summary.growthPercentage >= 0 ? '+' : ''}{summary.growthPercentage}%
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Report Footer */}
                    <div className="mt-8 pt-4 border-t text-center text-sm text-gray-500">
                      <p>Report ID: {report.id}</p>
                      <p>Generated by GL Tickets System</p>
                    </div>
                  </>
                );
              })()}
            </CardContent>
          </Card>
        )}

        {/* Show message for other report types */}
        {report.type !== 'sales' && report.type !== 'tickets' && report.type !== 'customer-analytics' && report.type !== 'customers' && report.type !== 'inventory' && report.type !== 'performance' && report.type !== 'monthly' && (
          <Card style={{ borderColor: '#e4e4e4' }}>
            <CardHeader>
              <CardTitle>{report.name}</CardTitle>
              <CardDescription>
                Generated on {new Date(report.generatedDate).toLocaleString()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <FileText className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <p className="text-lg text-gray-600">
                  Preview for {report.type} reports is coming soon
                </p>
                <Button 
                  className="mt-4"
                  onClick={() => navigate('/reports')}
                >
                  Back to Reports
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Print styles */}
      <style jsx>{`
        @media print {
          .print\\:hidden {
            display: none !important;
          }
          .print\\:block {
            display: block !important;
          }
          .print\\:grid-cols-4 {
            grid-template-columns: repeat(4, minmax(0, 1fr)) !important;
          }
          .print\\:hover\\:bg-white:hover {
            background-color: white !important;
          }
        }
      `}</style>
    </DashboardLayout>
  );
}