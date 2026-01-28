import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '@/components/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Download, FileText, Calendar, User, AlertCircle, Filter, X } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

interface Ticket {
  id: number;
  tracking_number: string;
  issue: string;
  customer_name: string;
  customer_mobile: string;
  customer_email?: string;
  agent_names?: string;
  priority_name?: string;
  priority_color?: string;
  status_name?: string;
  status_color?: string;
  branch_name?: string;
  created_at: string;
  updated_at: string;
  due_date?: string;
  closed_at?: string;
  // Invoice financial data
  invoice?: {
    id: number;
    total_amount: number;
    paid_amount: number;
    balance_due: number;
  };
  // Related object structures
  priority?: {
    id: number;
    title: string;    // priorities table uses 'title' column
    color?: string;
  };
  ticketPriority?: {
    id: number;
    title: string;    // priorities table uses 'title' column
    color?: string;
  };
  status?: {
    id: number;
    status: string;   // ticket_statuses table uses 'status' column
    color_code?: string;
  };
  ticketStatus?: {
    id: number;
    status: string;   // ticket_statuses table uses 'status' column
    color_code?: string;
  };
  customer?: {
    id: number;
    name: string;
    mobile: string;
    email?: string;
    country_code?: string;
  };
  branch?: {
    id: number;
    branch_name: string;
  };
  user?: {           // users table for assigned_to
    id: number;
    name: string;     // users table uses 'name' column
    email?: string;
  };
  agent?: {
    id: number;
    name: string;
    email?: string;
  };
  assignedAgent?: {
    id: number;
    name: string;
    email?: string;
  };
  agents?: Array<{
    id: number;
    name: string;
    email?: string;
  }>;
}

interface TicketStatus {
  id: number;
  status: string;
  color_code?: string;
}

interface Customer {
  id: number;
  name: string;
  mobile: string;
  email?: string;
}

export default function TicketsReport() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [customerFilter, setCustomerFilter] = useState('all');
  const [branchFilter, setBranchFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [statuses, setStatuses] = useState<TicketStatus[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [branches, setBranches] = useState<{id: number, branch_name: string}[]>([]);
  const [isExporting, setIsExporting] = useState(false);
  const [isFiltering, setIsFiltering] = useState(false);

  useEffect(() => {
    fetchStatuses();
    fetchCustomers();
    fetchPriorities();
    fetchBranches();
  }, []);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTickets();
    }, 500); // 500ms debounce for search

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Immediate fetch for other filters
  useEffect(() => {
    fetchTickets();
  }, [currentPage, perPage, statusFilter, customerFilter, branchFilter, dateFilter, startDate, endDate]);

  const fetchPriorities = async () => {
    try {
      const response = await axios.get('/priorities');
      console.log('Priorities data:', response.data);
      // Store priorities for lookup if needed
    } catch (error) {
      console.error('Error fetching priorities:', error);
    }
  };

  // Fetch related data if needed
  // New function specifically for enriching tickets with lookup data
  const enrichTicketsWithLookupData = async (tickets) => {
    try {
      console.log('Enriching tickets with lookup data...');
      
      // Fetch lookup data from API
      const [prioritiesRes, statusesRes] = await Promise.all([
        axios.get('/priorities').catch(() => ({ data: [] })),
        axios.get('/ticket-statuses').catch(() => ({ data: [] }))
      ]);

      const priorities = Array.isArray(prioritiesRes.data) ? prioritiesRes.data : [];
      const statuses = Array.isArray(statusesRes.data) ? statusesRes.data : [];

      console.log('Lookup data:', { priorities, statuses });

      // Enrich tickets with proper lookup data
      return tickets.map(ticket => {
        const priority = priorities.find(p => p.id === ticket.priority);
        const status = statuses.find(s => s.id === ticket.status);

        console.log(`Ticket ${ticket.id}:`, {
          priority_field: ticket.priority,
          status_field: ticket.status,
          found_priority: priority,
          found_status: status
        });

        return {
          ...ticket,
          priority_name: priority?.title || 'Not set',
          priority_color: priority?.color || '#6b7280',
          status_name: status?.status || 'Unknown',
          status_color: status?.color_code || '#6b7280'
        };
      });
    } catch (error) {
      console.error('Error enriching tickets with lookup data:', error);
      return tickets;
    }
  };

  const enrichTicketData = async (tickets) => {
    try {
      // If tickets don't have all relationship data, fetch it separately
      const needsEnrichment = tickets.some(ticket => 
        !ticket.priority_name || 
        !ticket.status_name || 
        !ticket.customer_name || 
        !ticket.branch_name
      );

      if (needsEnrichment) {
        console.log('Enriching ticket data with related information...');
        
        // Fetch all related data in parallel
        const [prioritiesRes, statusesRes, customersRes, branchesRes, usersRes] = await Promise.all([
          axios.get('/priorities').catch(() => ({ data: [] })),
          axios.get('/ticket-statuses').catch(() => ({ data: [] })),
          axios.get('/customers').catch(() => ({ data: { data: [] } })),
          axios.get('/branches').catch(() => ({ data: [] })),
          axios.get('/users').catch(() => ({ data: [] }))
        ]);

        const priorities = Array.isArray(prioritiesRes.data) ? prioritiesRes.data : [];
        const statuses = Array.isArray(statusesRes.data) ? statusesRes.data : [];
        const customers = Array.isArray(customersRes.data?.data) ? customersRes.data.data : 
                         Array.isArray(customersRes.data) ? customersRes.data : [];
        const branches = Array.isArray(branchesRes.data) ? branchesRes.data : [];

        // Enrich tickets with related data using proper relationship checks
        return tickets.map(ticket => ({
          ...ticket,
          priority_name: ticket.priority_name || 
                        ticket.priority?.title ||
                        ticket.ticketPriority?.title ||
                        priorities.find(p => p.id === ticket.priority)?.title || 
                        'Not set',
          priority_color: ticket.priority_color || 
                         ticket.priority?.color ||
                         ticket.ticketPriority?.color ||
                         priorities.find(p => p.id === ticket.priority)?.color || 
                         '#6b7280',
          status_name: ticket.status_name || 
                      ticket.ticketStatus?.status ||
                      ticket.status?.status ||
                      statuses.find(s => s.id === ticket.status)?.status || 
                      'Unknown',
          status_color: ticket.status_color || 
                       ticket.ticketStatus?.color_code ||
                       ticket.status?.color_code ||
                       statuses.find(s => s.id === ticket.status)?.color_code || 
                       '#6b7280',
          customer_name: ticket.customer_name || 
                        ticket.customer?.name ||
                        customers.find(c => c.id === ticket.customer_id)?.name || 
                        'Unknown Customer',
          customer_mobile: ticket.customer_mobile || 
                          (() => {
                            if (ticket.customer) {
                              return `${ticket.customer.country_code || ''} ${ticket.customer.mobile || ''}`.trim();
                            }
                            const customer = customers.find(c => c.id === ticket.customer_id);
                            return customer ? `${customer.country_code || ''} ${customer.mobile || ''}`.trim() : 'Not provided';
                          })(),
          customer_email: ticket.customer_email || 
                         ticket.customer?.email ||
                         customers.find(c => c.id === ticket.customer_id)?.email || 
                         '',
          branch_name: ticket.branch_name || 
                      ticket.branch?.branch_name ||
                      branches.find(b => b.id === ticket.branch_id)?.branch_name || 
                      'No branch',
          agent_names: (() => {
            // Check users table relationship first
            if (ticket.user?.name) {
              return ticket.user.name;
            }
            if (ticket.agent?.name) {
              return ticket.agent.name;
            }
            if (ticket.assignedAgent?.name) {
              return ticket.assignedAgent.name;
            }
            if (ticket.agents && Array.isArray(ticket.agents) && ticket.agents.length > 0) {
              return ticket.agents.map(agent => agent.name).join(', ');
            }
            if (ticket.agent_names) {
              return ticket.agent_names;
            }
            return 'Not assigned';
          })()
        }));
      }

      return tickets;
    } catch (error) {
      console.error('Error enriching ticket data:', error);
      return tickets; // Return original tickets if enrichment fails
    }
  };

  const fetchTickets = async () => {
    try {
      setLoading(true);

      // Build query parameters for server-side filtering and pagination
      const params: any = {
        page: currentPage,
        per_page: perPage
      };

      // Add search term
      if (searchTerm) {
        params.search = searchTerm;
      }

      // Add status filter
      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }

      // Add customer filter
      if (customerFilter !== 'all') {
        params.customer = customerFilter;
      }

      // Add branch filter
      if (branchFilter !== 'all') {
        params.branch = branchFilter;
      }

      // Add date range filter
      if (dateFilter === 'custom' && startDate && endDate) {
        params.start_date = startDate;
        params.end_date = endDate;
      }

      const response = await axios.get('/tickets', { params });

      if (response.data && Array.isArray(response.data.data)) {
        // Set pagination metadata
        setTotalRecords(response.data.total || 0);
        setTotalPages(response.data.last_page || 0);

        // Map the response to ensure we have all the required fields using proper relationships
        const mappedTickets = response.data.data.map(ticket => ({
          ...ticket,
          // Priority data from priorities table (title column)
          priority_name: ticket.priority?.title ||
                        ticket.ticketPriority?.title ||
                        ticket.priority_name ||
                        'Not set',
          priority_color: ticket.priority?.color ||
                         ticket.ticketPriority?.color ||
                         ticket.priority_color ||
                         '#6b7280',

          // Status data from ticket_statuses table (status column)
          status_name: ticket.ticketStatus?.status ||
                      ticket.status?.status ||
                      ticket.status_name ||
                      'Unknown',
          status_color: ticket.ticketStatus?.color_code ||
                       ticket.status?.color_code ||
                       ticket.status_color ||
                       '#6b7280',

          // Customer data from customer relationship
          customer_name: ticket.customer?.name || ticket.customer_name || 'Unknown Customer',
          customer_mobile: ticket.customer ?
            `${ticket.customer.country_code || ''} ${ticket.customer.mobile || ''}`.trim() :
            ticket.customer_mobile || 'Not provided',
          customer_email: ticket.customer?.email || ticket.customer_email || '',

          // Branch data from branch relationship
          branch_name: ticket.branch?.branch_name || ticket.branch_name || 'No branch',

          // Agent data from users table (name column for assigned_to)
          agent_names: (() => {
            // Priority order: users relationship > agents array > agent_names field
            if (ticket.user && ticket.user.name) {
              return ticket.user.name;
            }
            if (ticket.agent && ticket.agent.name) {
              return ticket.agent.name;
            }
            if (ticket.assignedAgent && ticket.assignedAgent.name) {
              return ticket.assignedAgent.name;
            }
            if (ticket.agents && Array.isArray(ticket.agents) && ticket.agents.length > 0) {
              return ticket.agents.map(agent => agent.name).join(', ');
            }
            if (ticket.agent_names) {
              return ticket.agent_names;
            }
            return 'Not assigned';
          })()
        }));

        // Always enrich with lookup data for priorities and statuses
        const enrichedTickets = await enrichTicketsWithLookupData(mappedTickets);

        setTickets(enrichedTickets);
      } else {
        setTickets([]);
        setTotalRecords(0);
        setTotalPages(0);
      }
    } catch (error) {
      console.error('Error fetching tickets:', error);
      toast.error('Failed to fetch tickets');
      setTickets([]);
      setTotalRecords(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  };

  const fetchStatuses = async () => {
    try {
      const response = await axios.get('/ticket-statuses');
      setStatuses(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching statuses:', error);
    }
  };

  const fetchCustomers = async () => {
    try {
      const response = await axios.get('/customers');
      console.log('Customers API response:', response.data);
      
      if (response.data && Array.isArray(response.data.data)) {
        console.log('Setting customers:', response.data.data);
        setCustomers(response.data.data);
      } else if (Array.isArray(response.data)) {
        console.log('Setting customers (direct array):', response.data);
        setCustomers(response.data);
      } else {
        console.log('No customers data found');
        setCustomers([]);
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
      setCustomers([]);
    }
  };

  const fetchBranches = async () => {
    try {
      const response = await axios.get('/branches');
      console.log('Branches API response:', response.data);
      
      if (response.data && Array.isArray(response.data.data)) {
        console.log('Setting branches:', response.data.data);
        setBranches(response.data.data);
      } else if (Array.isArray(response.data)) {
        console.log('Setting branches (direct array):', response.data);
        setBranches(response.data);
      } else {
        console.log('No branches data found');
        setBranches([]);
      }
    } catch (error) {
      console.error('Error fetching branches:', error);
      setBranches([]);
    }
  };

  const applyFilters = () => {
    // With server-side pagination, just reset to page 1 and let useEffect trigger fetchTickets
    setCurrentPage(1);
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setCustomerFilter('all');
    setBranchFilter('all');
    setDateFilter('all');
    setStartDate('');
    setEndDate('');
    setCurrentPage(1);
  };

  const handleExport = async () => {
    try {
      setIsExporting(true);

      // Fetch all tickets with current filters for export
      const params: any = {
        per_page: 10000 // Large number to get all matching tickets
      };

      if (searchTerm) params.search = searchTerm;
      if (statusFilter !== 'all') params.status = statusFilter;
      if (customerFilter !== 'all') params.customer = customerFilter;
      if (branchFilter !== 'all') params.branch = branchFilter;
      if (dateFilter === 'custom' && startDate && endDate) {
        params.start_date = startDate;
        params.end_date = endDate;
      }

      const response = await axios.get('/tickets', { params });
      const allTickets = response.data?.data || [];

      // Create CSV content
      const headers = [
        'Tracking Number',
        'Issue',
        'Customer Name',
        'Customer Mobile',
        'Customer Email',
        'Assigned Agent(s)',
        'Priority',
        'Status',
        'Branch',
        'Total Amount',
        'Paid Amount',
        'Balance Due',
        'Created Date',
        'Due Date',
        'Closed Date'
      ];

      const csvContent = [
        headers.join(','),
        ...allTickets.map(ticket => [
          `"${ticket.tracking_number}"`,
          `"${ticket.issue.replace(/"/g, '""')}"`,
          `"${ticket.customer_name}"`,
          `"${ticket.customer_mobile}"`,
          `"${ticket.customer_email || ''}"`,
          `"${ticket.agent_names}"`,
          `"${ticket.priority_name}"`,
          `"${ticket.status_name}"`,
          `"${ticket.branch_name || ''}"`,
          `"${ticket.invoice ? Number(ticket.invoice.total_amount).toFixed(2) : '0.00'}"`,
          `"${ticket.invoice ? Number(ticket.invoice.paid_amount).toFixed(2) : '0.00'}"`,
          `"${ticket.invoice ? Number(ticket.invoice.balance_due).toFixed(2) : '0.00'}"`,
          `"${new Date(ticket.created_at).toLocaleDateString()}"`,
          `"${ticket.due_date ? new Date(ticket.due_date).toLocaleDateString() : ''}"`,
          `"${ticket.closed_at ? new Date(ticket.closed_at).toLocaleDateString() : ''}"`
        ].join(','))
      ].join('\n');

      // Download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `tickets_report_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Tickets report exported successfully');
    } catch (error) {
      console.error('Error exporting tickets:', error);
      toast.error('Failed to export tickets report');
    } finally {
      setIsExporting(false);
    }
  };

  // Server-side pagination - use tickets directly from API
  const startIndex = (currentPage - 1) * perPage;
  const endIndex = Math.min(startIndex + tickets.length, totalRecords);

  const getPriorityBadge = (priority?: string, color?: string) => {
    if (!priority) {
      return <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">-</span>;
    }
    const priorityLower = priority.toLowerCase();
    if (priorityLower === 'high') {
      return <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">{priority}</span>;
    } else if (priorityLower === 'medium') {
      return <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">{priority}</span>;
    } else if (priorityLower === 'low') {
      return <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">{priority}</span>;
    }
    return <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">{priority}</span>;
  };

  const getStatusBadge = (status?: string, color?: string) => {
    if (!status) {
      return <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">-</span>;
    }
    const statusLower = status.toLowerCase();
    if (statusLower === 'open') {
      return <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">{status}</span>;
    } else if (statusLower === 'pending') {
      return <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">{status}</span>;
    } else if (statusLower === 'in progress') {
      return <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">{status}</span>;
    } else if (statusLower === 'delivered') {
      return <span className="px-3 py-1 rounded-full text-xs font-medium text-white" style={{ backgroundColor: '#ecccc8',color:'#f20c0c' }}>{status}</span>;
    } else if (statusLower === 'closed' || statusLower === 'completed') {
      return <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">{status}</span>;
    }
    return <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">{status}</span>;
  };

  return (
    <DashboardLayout>
      <div className="container-fluid px-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold">Tickets Report</h1>
            <p className="text-gray-600 text-sm mt-1">Manage ticket details and information</p>
          </div>
          <div className="flex items-center gap-2 text-xs sm:text-sm">
            <Link to="/" className="text-gray-600 hover:text-gray-800">Home</Link>
            <span className="text-gray-400">/</span>
            <Link to="/reports" className="text-gray-600 hover:text-gray-800">Reports</Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-800">Tickets Report</span>
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
              <div className="flex flex-col gap-1" style={{ width: '140px' }}>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    {statuses.map((status) => (
                      <SelectItem key={status.id} value={status.status}>
                        {status.status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-1" style={{ width: '180px' }}>
                
                <Select value={customerFilter} onValueChange={setCustomerFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Customers" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Customers</SelectItem>
                    {customers.length > 0 ? (
                      customers.map((customer) => (
                        <SelectItem key={customer.id} value={customer.name}>
                          {customer.name} {customer.mobile ? `(${customer.mobile})` : ''}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="loading" disabled>
                        {customers.length === 0 ? 'Loading customers...' : 'No customers found'}
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-1" style={{ width: '140px' }}>
    
                <Select value={branchFilter} onValueChange={setBranchFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Branches" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Branches</SelectItem>
                    {branches.length > 0 ? (
                      branches.map((branch) => (
                        <SelectItem key={branch.id} value={branch.branch_name}>
                          {branch.branch_name}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="loading" disabled>
                        {branches.length === 0 ? 'Loading branches...' : 'No branches found'}
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-1" style={{ width: '140px' }}>
  
                <Select value={dateFilter} onValueChange={setDateFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Dates" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Dates</SelectItem>
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
                disabled={isExporting || tickets.length === 0}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                {isExporting ? 'Exporting...' : 'Export CSV'}
              </Button>
            </div>
          </CardContent>
        </Card>

      {/* Info Message - Show when no date filters are applied */}
        {dateFilter === 'all' && !startDate && !endDate && (
          <div className="mb-4 px-6 py-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
              <span className="text-sm text-blue-800">
                Showing last 3 months tickets only. Use date filters above to view different date ranges.
              </span>
            </div>
          </div>
        )}

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
                placeholder="Search tickets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>

        

        {/* Tickets Table */}
        <Card style={{ borderColor: '#e4e4e4' }}>
          <CardContent className="p-0">
            <div className="overflow-x-auto" style={{ overflowX: 'auto', width: '100%' }}>
              <Table style={{ minWidth: '1400px' }}>
                <TableHeader>
                  <TableRow style={{ borderBottom: '1px solid #e4e4e4' }}>
                    <TableHead className="text-gray-600 font-medium">S.NO</TableHead>
                    <TableHead className="text-gray-600 font-medium">TRACKING_ID</TableHead>
                    <TableHead className="text-gray-600 font-medium">ISSUE</TableHead>
                    <TableHead className="text-gray-600 font-medium">CUSTOMER</TableHead>
                    <TableHead className="text-gray-600 font-medium">MOBILE</TableHead>
                    <TableHead className="text-gray-600 font-medium">AGENT</TableHead>
                    <TableHead className="text-gray-600 font-medium">PRIORITY</TableHead>
                    <TableHead className="text-gray-600 font-medium">STATUS</TableHead>
                    <TableHead className="text-gray-600 font-medium">BRANCH</TableHead>
                    <TableHead className="text-gray-600 font-medium">TOTAL</TableHead>
                    <TableHead className="text-gray-600 font-medium">PAID</TableHead>
                    <TableHead className="text-gray-600 font-medium">BALANCE</TableHead>
                    <TableHead className="text-gray-600 font-medium">CREATED_DATE</TableHead>
                    <TableHead className="text-gray-600 font-medium">DUE_DATE</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={14} className="text-center py-8">
                        Loading tickets...
                      </TableCell>
                    </TableRow>
                  ) : tickets.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={14} className="text-center py-8">
                        <div className="flex flex-col items-center gap-2">
                          <FileText className="h-12 w-12 text-gray-300" />
                          <p className="text-gray-500">No tickets found</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    tickets.map((ticket, index) => (
                      <TableRow key={ticket.id} className="hover:bg-gray-50" style={{ borderBottom: '1px solid #e4e4e4' }}>
                        <TableCell className="text-gray-800">
                          {((currentPage - 1) * perPage) + index + 1}
                        </TableCell>
                        <TableCell className="text-gray-800 font-medium">
                          {ticket.tracking_number}
                        </TableCell>
                        <TableCell className="text-gray-800 max-w-64">
                          <div className="truncate" title={ticket.issue}>
                            {ticket.issue}
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-800">
                          {ticket.customer_name}
                        </TableCell>
                        <TableCell className="text-gray-800">
                          {ticket.customer_mobile}
                        </TableCell>
                        <TableCell className="text-gray-800">
                          {ticket.agent_names || 'Not assigned'}
                        </TableCell>
                        <TableCell>
                          {getPriorityBadge(ticket.priority_name, ticket.priority_color)}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(ticket.status_name, ticket.status_color)}
                        </TableCell>
                        <TableCell className="text-gray-800">
                          {ticket.branch_name || '-'}
                        </TableCell>
                        <TableCell className="text-gray-800">
                          {ticket.invoice ? `₹${Number(ticket.invoice.total_amount).toFixed(2)}` : '-'}
                        </TableCell>
                        <TableCell className="text-gray-800">
                          {ticket.invoice ? `₹${Number(ticket.invoice.paid_amount).toFixed(2)}` : '-'}
                        </TableCell>
                        <TableCell className="text-gray-800">
                          {ticket.invoice ? (
                            <span className={Number(ticket.invoice.balance_due) > 0 ? 'text-red-600 font-medium' : 'text-green-600'}>
                              ₹{Number(ticket.invoice.balance_due).toFixed(2)}
                            </span>
                          ) : '-'}
                        </TableCell>
                        <TableCell className="text-gray-800">
                          {new Date(ticket.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-gray-800">
                          {ticket.due_date ? new Date(ticket.due_date).toLocaleDateString() : '-'}
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
            Showing {startIndex + 1}-{endIndex} of {totalRecords} tickets
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