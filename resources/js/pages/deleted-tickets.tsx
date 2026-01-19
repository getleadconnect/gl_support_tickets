import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Filter,
  Trash2,
  RotateCcw,
  Calendar,
  User,
  Home,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Ticket {
  id: number;
  tracking_number: string;
  issue: string;
  description: string;
  status: number;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
  closed_at?: string;
  closed_time?: string | null;
  customer: {
    id: number;
    name: string;
    email?: string;
  };
  user?: {
    id: number;
    name: string;
  };
  ticketStatus?: {
    id: number;
    status: string;
    color_code?: string;
  };
  ticketPriority?: {
    id: number;
    title: string;
    color?: string;
  };
  agent?: Array<{
    id: number;
    name: string;
  }>;
}

interface Customer {
  id: number;
  name: string;
  email?: string;
}

export default function DeletedTickets() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [agents, setAgents] = useState<any[]>([]);
  const [loadingAgents, setLoadingAgents] = useState(false);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    customerId: 'all',
    agentId: 'all',
  });

  // Pagination and search states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [perPage, setPerPage] = useState('10');
  const [searchTerm, setSearchTerm] = useState('');
  const [totalItems, setTotalItems] = useState(0);

  // Restore confirmation dialog state
  const [restoreConfirmOpen, setRestoreConfirmOpen] = useState(false);
  const [pendingRestoreTicket, setPendingRestoreTicket] = useState<Ticket | null>(null);

  useEffect(() => {
    fetchCustomers();
    // Only fetch agents if user is admin (role_id = 1)
    if (user?.role_id === 1) {
      fetchAgents();
    }
  }, []);

  useEffect(() => {
    fetchDeletedTickets();
  }, [currentPage, perPage, searchTerm]);

  const fetchCustomers = async () => {
    try {
      const response = await axios.get('/customers');
      setCustomers(response.data || []);
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  const fetchAgents = async () => {
    setLoadingAgents(true);
    try {
      const response = await axios.get('/agent-users');
      setAgents(response.data || []);
    } catch (error) {
      console.error('Error fetching agents:', error);
    } finally {
      setLoadingAgents(false);
    }
  };

  const fetchDeletedTickets = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/tickets/trashed', {
        params: {
          page: currentPage,
          per_page: perPage,
          search: searchTerm,
          customer_id: filters.customerId !== 'all' ? filters.customerId : null,
          agent_id: filters.agentId !== 'all' ? filters.agentId : null,
          start_date: filters.startDate || null,
          end_date: filters.endDate || null,
        },
      });

      // All tickets returned are already deleted and filtered by backend
      const deletedTickets = response.data.data || [];
      setTickets(deletedTickets);

      // Set pagination data
      setTotalPages(response.data.last_page || 1);
      setTotalItems(response.data.total || 0);
      setCurrentPage(response.data.current_page || 1);
    } catch (error) {
      console.error('Error fetching deleted tickets:', error);
      toast.error('Failed to fetch deleted tickets');
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = () => {
    setCurrentPage(1); // Reset to first page when filtering
    fetchDeletedTickets();
  };

  const handleClear = () => {
    // Reset filters to default values
    const defaultFilters = {
      startDate: '',
      endDate: '',
      customerId: 'all',
      agentId: 'all',
    };
    setFilters(defaultFilters);
    setSearchTerm('');
    setCurrentPage(1);
    // fetchDeletedTickets will be called automatically by useEffect
  };

  const handlePerPageChange = (value: string) => {
    setPerPage(value);
    setCurrentPage(1); // Reset to first page when changing per page
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleRestoreClick = (ticket: Ticket) => {
    setPendingRestoreTicket(ticket);
    setRestoreConfirmOpen(true);
  };

  const handleConfirmRestore = async () => {
    if (!pendingRestoreTicket) return;

    try {
      // Restore ticket (remove deleted_at)
      await axios.put(`/tickets/${pendingRestoreTicket.id}/restore`);
      toast.success('Ticket restored successfully');
      setRestoreConfirmOpen(false);
      setPendingRestoreTicket(null);
      fetchDeletedTickets();
    } catch (error) {
      console.error('Error restoring ticket:', error);
      toast.error('Failed to restore ticket');
    }
  };


  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <DashboardLayout title="Deleted Tickets">
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white px-4 sm:px-6 py-4" style={{ borderBottom: '1px solid #c4c4c4' }}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-xl sm:text-2xl font-semibold">Deleted Tickets</h1>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Button
                variant="default"
                size="sm"
                onClick={() => navigate('/tickets')}
                className="w-full sm:w-auto"
              >
                <ChevronRight className="h-4 w-4 mr-1" />
                Tickets
              </Button>
            </div>
          </div>
        </div>

        {/* Filter Section */}
        <div className="bg-white mx-4 sm:mx-6 mt-4 p-4 rounded-lg shadow-sm">
          <div className="flex flex-col gap-3">
            <span className="text-sm font-medium mb-1">Filter By:</span>
            
            <div className="flex flex-wrap gap-3 items-end">
              <Input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
                className="w-[16.66%] min-w-[120px]"
                placeholder="Start Date"
              />
              
              <Input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
                className="w-[16.66%] min-w-[120px]"
                placeholder="End Date"
              />
              
              <Select
                value={filters.customerId}
                onValueChange={(value) => setFilters(prev => ({ ...prev, customerId: value }))}
              >
                <SelectTrigger className="w-[16.66%] min-w-[150px]">
                  <SelectValue placeholder="Select Customer" />
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

              {/* Only show agent filter for admin users (role_id = 1) */}
              {user?.role_id === 1 && (
                <Select
                  value={filters.agentId}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, agentId: value }))}
                >
                  <SelectTrigger className="w-[16.66%] min-w-[150px]">
                    <SelectValue placeholder="Select Agent" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Agents</SelectItem>
                    {agents.map((agent) => (
                      <SelectItem key={agent.id} value={agent.id.toString()}>
                        {agent.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              <div className="flex gap-2">
                <Button
                  onClick={handleFilter}
                  className="bg-blue-600 hover:bg-blue-700"
                  style={{ width: '140px' }}
                >
                  <Filter className="h-4 w-4 mr-1" />
                  Filter
                </Button>
                
                <Button
                  variant="secondary"
                  onClick={handleClear}
                  style={{ width: '140px' }}
                >
                  Clear
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Tickets List - Single Card */}
        <div className="px-4 sm:px-6 mt-4 pb-6">
          <div className="bg-white rounded-lg shadow-sm">
            {/* Show Entries and Search */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Show</span>
                  <Select value={perPage} onValueChange={handlePerPageChange}>
                    <SelectTrigger className="w-[70px] h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="25">25</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                      <SelectItem value="100">100</SelectItem>
                    </SelectContent>
                  </Select>
                  <span className="text-sm text-gray-600">entries</span>
                </div>

                <div className="w-full sm:w-auto">
                  <Input
                    type="text"
                    placeholder="Search tickets..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full sm:w-64"
                  />
                </div>
              </div>
            </div>

            {/* Tickets Content */}
            {loading ? (
              <div className="p-8 text-center">
                <div className="text-gray-500">Loading deleted tickets...</div>
              </div>
            ) : tickets.length === 0 ? (
              <div className="p-8 text-center">
                <div className="text-gray-500">No deleted tickets found</div>
              </div>
            ) : (
              <div className="p-2">
                {tickets.map((ticket, index) => (
                  <div
                    key={ticket.id}
                    className="bg-white hover:bg-gray-50 transition-colors"
                    style={{
                      margin: '7px 7px 10px 7px',
                      border: '1px solid #e4e4e4',
                      borderRadius: '10px',
                      padding: '16px'
                    }}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                          <span className="text-sm sm:text-base text-blue-600 font-medium">
                            Ticket ID : #{ticket.id} - {ticket.issue}
                          </span>
                          <div className="flex items-center gap-1">
                            <span className="text-gray-600 hidden sm:inline">:</span>
                            <span className="text-red-600 text-xs sm:text-sm">Deleted</span>
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 mt-3 text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3 flex-shrink-0" />
                            <span className="truncate">Created: {formatDateTime(ticket.created_at)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3 flex-shrink-0" />
                            <span className="truncate">Deleted: {formatDateTime(ticket.deleted_at || ticket.updated_at)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                        <div className="text-sm font-medium text-gray-700">
                          {ticket.customer?.name || 'Unknown'}
                        </div>

                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-green-600 border-green-600 hover:bg-green-50 flex-1 sm:flex-initial text-xs sm:text-sm"
                            onClick={() => handleRestoreClick(ticket)}
                          >
                            <RotateCcw className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                            Restore
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {!loading && tickets.length > 0 && (
              <div className="border-t border-gray-200 p-4">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
                  <div className="text-sm text-gray-600 text-center sm:text-left">
                    Showing {tickets.length === 0 ? 0 : ((currentPage - 1) * parseInt(perPage)) + 1} to{' '}
                    {Math.min(currentPage * parseInt(perPage), totalItems)} of {totalItems} entries
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="h-8"
                    >
                      <ChevronLeft className="h-4 w-4 sm:mr-1" />
                      <span className="hidden sm:inline">Previous</span>
                    </Button>

                    {totalPages <= 5 ? (
                      // Show all pages if 5 or fewer
                      Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <Button
                          key={page}
                          variant={page === currentPage ? "default" : "outline"}
                          size="sm"
                          onClick={() => handlePageChange(page)}
                          className="h-8 w-8 hidden sm:inline-flex"
                        >
                          {page}
                        </Button>
                      ))
                    ) : (
                      // Show pagination with ellipsis for more than 5 pages
                      Array.from({ length: 5 }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }
                        return (
                          <Button
                            key={i}
                            variant={pageNum === currentPage ? "default" : "outline"}
                            size="sm"
                            onClick={() => handlePageChange(pageNum)}
                            className="h-8 w-8 hidden sm:inline-flex"
                          >
                            {pageNum}
                          </Button>
                        );
                      })
                    )}

                    <span className="text-sm text-gray-600 sm:hidden">
                      {currentPage} / {totalPages}
                    </span>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="h-8"
                    >
                      <span className="hidden sm:inline">Next</span>
                      <ChevronRight className="h-4 w-4 sm:ml-1" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Restore Confirmation Dialog */}
      <AlertDialog open={restoreConfirmOpen} onOpenChange={setRestoreConfirmOpen}>
        <AlertDialogContent className="w-[90%] sm:w-full max-w-lg mx-auto">
          <AlertDialogHeader>
            <AlertDialogTitle>Restore Ticket</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to restore ticket{' '}
              <strong>#{pendingRestoreTicket?.tracking_number || pendingRestoreTicket?.id}</strong>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setRestoreConfirmOpen(false);
              setPendingRestoreTicket(null);
            }}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmRestore}
              className="bg-blue-600 hover:bg-blue-700"
            >
              OK
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}