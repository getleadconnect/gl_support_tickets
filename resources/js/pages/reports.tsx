import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { FileText, Download, TrendingUp, Users, DollarSign, Package, Calendar, BarChart3, Printer, Eye, Trash2, UserCheck } from 'lucide-react';
import { Table } from '@/components/ui/table';
import toast from 'react-hot-toast';
import axios from 'axios';

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

interface QuickStats {
  totalRevenue: number;
  totalTickets: number;
  activeCustomers: number;
  completionRate: number;
  closedTickets: number;
  totalCustomers: number;
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

export default function Reports() {
  const navigate = useNavigate();
  const [reportType, setReportType] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [ticketStatus, setTicketStatus] = useState('all');
  const [ticketType, setTicketType] = useState('all');
  const [statuses, setStatuses] = useState<Array<{id: number, status: string, color_code?: string}>>([]);
  const [generatedReports, setGeneratedReports] = useState<ReportData[]>(() => {
    // Load reports from localStorage on component mount
    const savedReports = localStorage.getItem('generatedReports');
    return savedReports ? JSON.parse(savedReports) : [];
  });
  const [currentReport, setCurrentReport] = useState<ReportData | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [quickStats, setQuickStats] = useState<QuickStats>({
    totalRevenue: 0,
    totalTickets: 0,
    activeCustomers: 0,
    completionRate: 0,
    closedTickets: 0,
    totalCustomers: 0
  });
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  const handleClearAllReports = () => {
    setGeneratedReports([]);
    localStorage.removeItem('generatedReports');
    toast.success('All reports cleared');
  };

  // Fetch quick stats from API
  const fetchQuickStats = async () => {
    try {
      setIsLoadingStats(true);
      const response = await axios.get('/reports/quick-stats');
      if (response.data.success && response.data.data) {
        setQuickStats(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching quick stats:', error);
      toast.error('Failed to load statistics');
    } finally {
      setIsLoadingStats(false);
    }
  };

  // Save reports to localStorage whenever they change
  React.useEffect(() => {
    localStorage.setItem('generatedReports', JSON.stringify(generatedReports));
  }, [generatedReports]);

  // Fetch quick stats when component mounts
  React.useEffect(() => {
    fetchQuickStats();
    fetchTicketStatuses();
  }, []);

  const fetchTicketStatuses = async () => {
    try {
      const response = await axios.get('/ticket-statuses');
      const statusData = Array.isArray(response.data) ? response.data : [];
      setStatuses(statusData);
    } catch (err) {
      console.error('Error fetching ticket statuses:', err);
    }
  };

  const reportTypes = [
    { id: 'customer-analytics', name: 'Customer Analytics', icon: UserCheck, description: 'Detailed customer behavior and insights' },
    { id: 'tickets', name: 'Tickets Report', icon: FileText, description: 'Analyze ticket statistics and trends' },
    { id: 'customers', name: 'Customer Report', icon: Users, description: 'Customer activity and engagement' },
    { id: 'inventory', name: 'Inventory Report', icon: Package, description: 'Stock levels and movement' },
    { id: 'performance', name: 'Performance Report', icon: TrendingUp, description: 'Overall business performance metrics' },
    { id: 'monthly', name: 'Monthly Summary', icon: Calendar, description: 'Monthly business overview' },
  ];

  // Generate ticket data from API
  const generateTicketData = async (): Promise<TicketReportItem[]> => {
    try {
      // Build query params based on date filter and ticket filters
      const params: any = {};
      if (dateFilter === 'custom' && startDate && endDate) {
        params.start_date = startDate;
        params.end_date = endDate;
      }
      
      // Add ticket status filter
      if (ticketStatus !== 'all') {
        params.status = ticketStatus;
      }
      
      // Add ticket type filter (based on tracking_number prefix)
      if (ticketType !== 'all') {
        params.ticket_type = ticketType;
      }
      
      const response = await axios.get('/reports/tickets-report', { params });
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      throw new Error('Failed to fetch tickets report');
    } catch (error) {
      console.error('Error fetching tickets report:', error);
      toast.error('Failed to fetch tickets report data');
      return [];
    }
  };

  // Generate customer analytics data from API
  const generateCustomerAnalyticsData = async (): Promise<CustomerAnalyticsItem[]> => {
    try {
      // Build query params based on date filter
      const params: any = {};
      if (dateFilter === 'custom' && startDate && endDate) {
        params.start_date = startDate;
        params.end_date = endDate;
      }
      
      const response = await axios.get('/reports/customer-analytics', { params });
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      throw new Error('Failed to fetch customer analytics');
    } catch (error) {
      console.error('Error fetching customer analytics:', error);
      toast.error('Failed to fetch customer analytics data');
      return [];
    }
  };

  // Generate customer report data from API
  const generateCustomerData = async (): Promise<CustomerReportItem[]> => {
    try {
      // Build query params based on date filter
      const params: any = {};
      if (dateFilter === 'custom' && startDate && endDate) {
        params.start_date = startDate;
        params.end_date = endDate;
      }
      
      const response = await axios.get('/reports/customer-report', { params });
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      throw new Error('Failed to fetch customer report');
    } catch (error) {
      console.error('Error fetching customer report:', error);
      toast.error('Failed to fetch customer report data');
      return [];
    }
  };

  // Generate inventory report data from API
  const generateInventoryData = async (): Promise<InventoryReportItem[]> => {
    try {
      // Build query params based on date filter
      const params: any = {};
      if (dateFilter === 'custom' && startDate && endDate) {
        params.start_date = startDate;
        params.end_date = endDate;
      }
      
      const response = await axios.get('/reports/inventory-report', { params });
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      throw new Error('Failed to fetch inventory report');
    } catch (error) {
      console.error('Error fetching inventory report:', error);
      toast.error('Failed to fetch inventory report data');
      return [];
    }
  };

  // Generate performance report data from API
  const generatePerformanceData = async (): Promise<PerformanceReportItem[]> => {
    try {
      // Build query params based on date filter
      const params: any = {};
      if (dateFilter === 'custom' && startDate && endDate) {
        params.start_date = startDate;
        params.end_date = endDate;
      }
      
      const response = await axios.get('/reports/agent-performance', { params });
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      throw new Error('Failed to fetch performance report');
    } catch (error) {
      console.error('Error fetching performance report:', error);
      toast.error('Failed to fetch performance report data');
      return [];
    }
  };

  // Generate monthly summary data from API
  const generateMonthlySummaryData = async (): Promise<MonthlySummaryItem> => {
    try {
      // Build query params based on date filter
      const params: any = {};
      if (dateFilter === 'custom' && startDate && endDate) {
        params.start_date = startDate;
        params.end_date = endDate;
      }
      
      const response = await axios.get('/reports/monthly-summary', { params });
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      throw new Error('Failed to fetch monthly summary');
    } catch (error) {
      console.error('Error fetching monthly summary:', error);
      toast.error('Failed to fetch monthly summary data');
      // Return default empty data
      return {
        month: new Date().toLocaleString('default', { month: 'long' }),
        year: new Date().getFullYear(),
        totalRevenue: 0,
        totalPayments: 0,
        averagePaymentAmount: 0,
        paymentModes: {
          cash: 0,
          online: 0,
          card: 0,
          cheque: 0,
          other: 0
        },
        topCustomers: [],
        dailyRevenue: [],
        ticketStats: {
          totalTickets: 0,
          closedTickets: 0,
          averageClosureTime: '0 hours'
        },
        growthPercentage: 0,
        previousMonthRevenue: 0,
        newCustomers: 0
      };
    }
  };

  const handleGenerateReport = () => {
    if (!reportType) {
      toast.error('Please select report type');
      return;
    }

    // For all reports, check date requirements based on filter
    if (dateFilter === 'custom' && (!startDate || !endDate)) {
      toast.error('Please select date range');
      return;
    }

    if (dateFilter === 'custom' && new Date(startDate) > new Date(endDate)) {
      toast.error('Start date must be before end date');
      return;
    }

    setIsGenerating(true);
    
    // Generate report
    const generateReport = async () => {
      const reportName = reportTypes.find(r => r.id === reportType)?.name || 'Report';
      
      let reportData: any = null;
      if (reportType === 'customer-analytics') {
        reportData = await generateCustomerAnalyticsData();
      } else if (reportType === 'tickets') {
        reportData = await generateTicketData();
      } else if (reportType === 'customers') {
        reportData = await generateCustomerData();
      } else if (reportType === 'inventory') {
        reportData = await generateInventoryData();
      } else if (reportType === 'performance') {
        reportData = await generatePerformanceData();
      } else if (reportType === 'monthly') {
        reportData = await generateMonthlySummaryData();
      }
      
      // Format report name based on date filter
      let reportNameWithDate = reportName;
      if (dateFilter === 'all') {
        reportNameWithDate = `${reportName} - All Data`;
      } else {
        reportNameWithDate = `${reportName} - ${new Date(startDate).toLocaleDateString()} to ${new Date(endDate).toLocaleDateString()}`;
      }

      const newReport: ReportData = {
        id: `report-${Date.now()}`,
        name: reportNameWithDate,
        type: reportType,
        generatedDate: new Date().toISOString(),
        dateRange: {
          start: startDate || 'all',
          end: endDate || 'all'
        },
        data: reportData
      };
      
      // Update state and save to localStorage
      const updatedReports = [newReport, ...generatedReports].slice(0, 10); // Keep last 10 reports
      setGeneratedReports(updatedReports);
      setCurrentReport(newReport);
      setIsGenerating(false);
      
      // Save to localStorage immediately
      localStorage.setItem('generatedReports', JSON.stringify(updatedReports));
      
      toast.success('Report generated successfully');
      
      // Navigate to preview
      navigate('/report-preview', { state: { report: newReport } });
    };

    // Execute async report generation
    generateReport().catch(error => {
      console.error('Error generating report:', error);
      toast.error('Failed to generate report');
      setIsGenerating(false);
    });
  };

  const handleViewReport = (report: ReportData) => {
    // Navigate to preview page with report data
    navigate('/report-preview', { state: { report } });
  };

  const handleDownloadReport = (report: ReportData) => {
    if (!report.data) {
      toast.error('No data available to download');
      return;
    }

    let csvContent = '';
    
    // Create CSV content based on report type
    if (report.type === 'customer-analytics') {
      const headers = ['Customer ID', 'Customer Name', 'Company', 'Total Tickets', 'Open Tickets', 'In Progress', 'Closed Tickets', 'Avg Resolution Time', 'Total Spent (₹)', 'Satisfaction %'];
      csvContent = [
        headers.join(','),
        ...report.data.map((item: CustomerAnalyticsItem) => 
          [item.customerId, item.customerName, item.company, item.totalTickets, item.openTickets, item.inProgressTickets, item.closedTickets, item.avgResolutionTime, item.totalSpent, item.satisfaction].join(',')
        )
      ].join('\n');
    } else if (report.type === 'tickets') {
      const headers = ['Date', 'Ticket ID', 'Customer', 'Assigned To', 'Priority', 'Status', 'Category', 'Response Time', 'Resolution Time'];
      csvContent = [
        headers.join(','),
        ...report.data.map((item: TicketReportItem) => 
          [item.date, item.ticketId, item.customer, item.assignedTo, item.priority, item.status, item.category, item.responseTime || 'N/A', item.resolutionTime || 'N/A'].join(',')
        )
      ].join('\n');
    } else if (report.type === 'customers') {
      const headers = ['Customer ID', 'Customer Name', 'Email', 'Mobile', 'Company', 'Join Date', 'Total Tickets', 'Total Spent (₹)', 'Status', 'Last Activity'];
      csvContent = [
        headers.join(','),
        ...report.data.map((item: CustomerReportItem) => 
          [item.customerId, item.customerName, item.email, item.mobile, item.company, item.joinDate, item.totalTickets, item.totalSpent, item.status, item.lastActivity].join(',')
        )
      ].join('\n');
    } else if (report.type === 'inventory') {
      const headers = ['Product ID', 'Product Code', 'Product Name', 'Category', 'Brand', 'Current Stock', 'Initial Stock', 'Stock Used', 'Usage %', 'Unit Cost (₹)', 'Total Value (₹)', 'Status', 'Stock Status', 'Stock Level'];
      csvContent = [
        headers.join(','),
        ...report.data.map((item: InventoryReportItem) => 
          [item.productId, item.productCode, item.productName, item.category, item.brand, item.currentStock, item.initialStock, item.stockUsed, item.stockUsagePercent + '%', item.unitCost, item.totalValue, item.status, item.stockStatus, item.stockLevel].join(',')
        )
      ].join('\n');
    } else if (report.type === 'performance') {
      const headers = ['Agent ID', 'Agent Name', 'Email', 'Assigned Tickets', 'Open Tickets', 'In Progress', 'Closed Tickets', 'Completion Rate (%)', 'Avg Resolution Time', 'Performance', 'Join Date'];
      csvContent = [
        headers.join(','),
        ...report.data.map((item: PerformanceReportItem) => 
          [item.agentId, item.agentName, item.email, item.assignedTickets, item.openTickets, item.inProgressTickets, item.closedTickets, item.completionRate, item.avgResolutionTime, item.performance, item.joinDate].join(',')
        )
      ].join('\n');
    } else if (report.type === 'monthly') {
      const summary: MonthlySummaryItem = report.data;
      // Create a comprehensive CSV for monthly summary
      csvContent = [
        'Monthly Summary Report',
        `Month: ${summary.month} ${summary.year}`,
        '',
        'Overall Statistics',
        `Total Revenue,₹${summary.totalRevenue}`,
        `Total Payments,${summary.totalPayments}`,
        `Average Payment,₹${summary.averagePaymentAmount}`,
        `Growth vs Previous Month,${summary.growthPercentage}%`,
        `Previous Month Revenue,₹${summary.previousMonthRevenue}`,
        `New Customers,${summary.newCustomers}`,
        '',
        'Payment Modes',
        `Cash,₹${summary.paymentModes.cash}`,
        `Online,₹${summary.paymentModes.online}`,
        `Card,₹${summary.paymentModes.card}`,
        `Cheque,₹${summary.paymentModes.cheque}`,
        `Other,₹${summary.paymentModes.other}`,
        '',
        'Top Customers',
        'Customer ID,Customer Name,Total Paid,Payment Count',
        ...summary.topCustomers.map(c => `${c.customerId},${c.customerName},₹${c.totalPaid},${c.paymentCount}`),
        '',
        'Daily Revenue',
        'Date,Revenue,Payment Count',
        ...summary.dailyRevenue.map(d => `${d.date},₹${d.revenue},${d.paymentCount}`),
        '',
        'Ticket Statistics',
        `Total Tickets,${summary.ticketStats.totalTickets}`,
        `Closed Tickets,${summary.ticketStats.closedTickets}`,
        `Average Closure Time,${summary.ticketStats.averageClosureTime}`
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

  return (
    <DashboardLayout>
      <div className="container-fluid px-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-2">
          <h1 className="text-xl sm:text-2xl font-semibold">Reports</h1>
          <div className="flex items-center gap-2 text-xs sm:text-sm">
            <Link to="/" className="text-gray-600 hover:text-gray-800">Home</Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-800">Reports</span>
          </div>
        </div>


        {/* Report Selection Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-6">
          {reportTypes.map((report) => {
            const Icon = report.icon;
            return (
              <Card 
                key={report.id} 
                className={`cursor-pointer transition-all hover:shadow-lg ${reportType === report.id ? 'ring-2 ring-blue-500' : ''}`}
                onClick={() => setReportType(report.id)}
                style={{ borderColor: '#e4e4e4' }}
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs sm:text-sm font-medium">
                    {report.name}
                  </CardTitle>
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-xs sm:text-sm">{report.description}</CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Report Configuration */}
        <Card className="mb-6" style={{ borderColor: '#e4e4e4' }}>
          <CardHeader>
            <CardTitle>Report Configuration</CardTitle>
            <CardDescription>Select report type and date range to generate reports</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Single Row Configuration */}
            <div className="flex flex-wrap gap-3 items-center">
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Report Type" />
                </SelectTrigger>
                <SelectContent>
                  {reportTypes.map((report) => (
                    <SelectItem key={report.id} value={report.id}>
                      {report.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select 
                value={dateFilter} 
                onValueChange={setDateFilter}
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Date Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Data</SelectItem>
                  <SelectItem value="custom">Custom Date</SelectItem>
                </SelectContent>
              </Select>

              <Input
                type="date"
                placeholder="Start"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                disabled={dateFilter === 'all'}
                className="w-40"
              />

              <Input
                type="date"
                placeholder="End"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                disabled={dateFilter === 'all'}
                className="w-40"
              />

              <Select value={ticketStatus} onValueChange={setTicketStatus}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  {statuses.map((status) => (
                    <SelectItem key={status.id} value={String(status.id)}>
                      <span style={{ color: status.color_code || '#6b7280' }}>
                        {status.status}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={ticketType} onValueChange={setTicketType}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="TKT">In Shop</SelectItem>
                  <SelectItem value="ONS">On Site</SelectItem>
                </SelectContent>
              </Select>

              <Button 
                onClick={handleGenerateReport}
                disabled={!reportType || (dateFilter === 'custom' && (!startDate || !endDate)) || isGenerating}
                className="bg-blue-600 hover:bg-blue-700 px-6"
              >
                {isGenerating ? (
                  <>
                    <span className="mr-2 text-xs sm:text-sm">Generating...</span>
                  </>
                ) : (
                  <>
                    <BarChart3 className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="text-xs sm:text-sm">Generate Report</span>
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
          <Card style={{ borderColor: '#e4e4e4' }}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoadingStats ? (
                <div className="text-lg sm:text-2xl font-bold text-gray-400">Loading...</div>
              ) : (
                <div className="text-lg sm:text-2xl font-bold">₹{quickStats.totalRevenue.toLocaleString()}</div>
              )}
              <p className="text-xs text-muted-foreground hidden sm:block">From payments table</p>
            </CardContent>
          </Card>

          <Card style={{ borderColor: '#e4e4e4' }}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Total Tickets</CardTitle>
              <FileText className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoadingStats ? (
                <div className="text-lg sm:text-2xl font-bold text-gray-400">Loading...</div>
              ) : (
                <div className="text-lg sm:text-2xl font-bold">{quickStats.totalTickets.toLocaleString()}</div>
              )}
              <p className="text-xs text-muted-foreground hidden sm:block">All tickets in system</p>
            </CardContent>
          </Card>

          <Card style={{ borderColor: '#e4e4e4' }}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Active Customers</CardTitle>
              <Users className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoadingStats ? (
                <div className="text-lg sm:text-2xl font-bold text-gray-400">Loading...</div>
              ) : (
                <div className="text-lg sm:text-2xl font-bold">{quickStats.activeCustomers}</div>
              )}
              <p className="text-xs text-muted-foreground hidden sm:block">Customers with tickets</p>
            </CardContent>
          </Card>

          <Card style={{ borderColor: '#e4e4e4' }}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Completion Rate</CardTitle>
              <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoadingStats ? (
                <div className="text-lg sm:text-2xl font-bold text-gray-400">Loading...</div>
              ) : (
                <div className="text-lg sm:text-2xl font-bold">{quickStats.completionRate}%</div>
              )}
              <p className="text-xs text-muted-foreground hidden sm:block">{quickStats.closedTickets} closed tickets</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Reports */}
        <Card style={{ borderColor: '#e4e4e4' }}>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Recent Reports</CardTitle>
                <CardDescription className="mt-1">
                  {generatedReports.length > 0 
                    ? 'Previously generated reports available for download and viewing'
                    : 'No reports generated yet. Generate your first report above.'}
                </CardDescription>
              </div>
              {generatedReports.length > 0 && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Clear All
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Clear All Reports</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to clear all reports? This action cannot be undone and will permanently delete all generated reports from your local storage.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={handleClearAllReports}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Clear All Reports
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {generatedReports.length > 0 ? (
                generatedReports.map((report) => {
                  const iconColors = {
                    'customer-analytics': 'text-blue-500',
                    tickets: 'text-green-500',
                    customers: 'text-purple-500',
                    inventory: 'text-orange-500',
                    performance: 'text-red-500',
                    monthly: 'text-indigo-500'
                  };
                  
                  return (
                    <div key={report.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors gap-3" style={{ borderColor: '#e4e4e4' }}>
                      <div className="flex items-center gap-3">
                        <FileText className={`h-6 w-6 sm:h-8 sm:w-8 ${iconColors[report.type as keyof typeof iconColors] || 'text-gray-500'}`} />
                        <div className="flex-1">
                          <p className="font-medium text-sm sm:text-base">{report.name}</p>
                          <p className="text-xs sm:text-sm text-gray-500">
                            Generated on {new Date(report.generatedDate).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2 w-full sm:w-auto">
                        {report.data && (
                          <>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleViewReport(report)}
                              title="View Report"
                              className="flex-1 sm:flex-initial text-xs sm:text-sm"
                            >
                              <Eye className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                              View
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleDownloadReport(report)}
                              title="Download Report"
                              className="flex-1 sm:flex-initial text-xs sm:text-sm"
                            >
                              <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                              Download
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p>No reports generated yet</p>
                  <p className="text-sm mt-1">Select a report type and date range above to generate your first report</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}