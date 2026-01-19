import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useSearchParams } from 'react-router-dom';
import jQuery from 'jquery';
import select2Factory from 'select2';
import 'select2/dist/css/select2.min.css';

// Initialize select2 on jQuery
select2Factory(jQuery);

// Make jQuery available globally
(window as any).jQuery = jQuery;
(window as any).$ = jQuery;

const $ = jQuery;
import { DashboardLayout } from '@/components/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Eye, 
  Edit, 
  Trash2,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  CheckCircle,
  X,
  FileText
} from 'lucide-react';
import { TicketDetailsModal } from '@/components/TicketDetailsModal';
import { AssignAgentModal } from '@/components/AssignAgentModal';
import { AddTicketModal } from '@/components/AddTicketModal';

interface Ticket {
  id: number;
  issue: string;
  description: string | null;
  tracking_number: string;
  status: number; // Changed to number (ID)
  priority: number; // Changed to number (ID)
  due_date: string | null;
  ticket_type: string | null;
  branch_id: string | null;
  service_id: string | null;
  created_by: number;
  slug: string;
  closed_time: string | null;
  closed_at: string | null;
  verified_at: string | null;
  remarks: string | null;
  created_at: string;
  updated_at: string;
  customer_id: number;
  customer?: {
    id: number;
    name: string;
  };
  user?: {
    id: number;
    name: string;
  };
  agent?: Array<{
    id: number;
    name: string;
  }>;
  ticket_status?: {
    id: number;
    name: string;
    color?: string;
  };
  ticket_priority?: {
    id: number;
    name: string;
    color?: string;
  };
  branch?: {
    id: number;
    branch_name: string;
  };
  accessories?: Array<{
    id: number;
    name: string;
  }>;
}

interface Customer {
  id: number;
  name: string;
  mobile?: string;
  country_code?: string;
}

export default function Tickets() {
  console.log('Tickets component rendering');
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [perPage, setPerPage] = useState('10');
  const [searchTerm, setSearchTerm] = useState('');
  const [totalItems, setTotalItems] = useState(0);
  const [sortField, setSortField] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingTicket, setEditingTicket] = useState<Ticket | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<Ticket>>({});
  const [saving, setSaving] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deletingTicket, setDeletingTicket] = useState<Ticket | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [statuses, setStatuses] = useState<Array<{id: number, status: string, color_code?: string}>>([]);
  const [priorities, setPriorities] = useState<Array<{id: number, title: string, color?: string}>>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [assignAgentModalOpen, setAssignAgentModalOpen] = useState(false);
  const [selectedTicketForAgent, setSelectedTicketForAgent] = useState<Ticket | null>(null);
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>(() => {
    const statusParam = searchParams.get('status');
    return statusParam ? statusParam : 'all';
  });
  const [filterDue, setFilterDue] = useState<string>(() => {
    const dueParam = searchParams.get('due');
    return dueParam ? dueParam : '';
  });
  const [filterCustomer, setFilterCustomer] = useState<string>('all');
  const [filterAgent, setFilterAgent] = useState<string>('all');
  const [filterBranch, setFilterBranch] = useState<string>('all');
  const [filterTicketType, setFilterTicketType] = useState<string>('all');
  const [filterTicketLabel, setFilterTicketLabel] = useState<string>('all');
  const [ticketLabels, setTicketLabels] = useState<any[]>([]);
  const [loadingTicketLabels, setLoadingTicketLabels] = useState(false);
  const [filteredTickets, setFilteredTickets] = useState<Ticket[]>([]);
  const [agents, setAgents] = useState<any[]>([]);
  const [allAgents, setAllAgents] = useState<any[]>([]);
  const [loadingAgents, setLoadingAgents] = useState(false);
  const [branches, setBranches] = useState<any[]>([]);
  const [loadingBranches, setLoadingBranches] = useState(false);
  const [editSelectedAgents, setEditSelectedAgents] = useState<number[]>([]);
  const [editSelectedNotifyUsers, setEditSelectedNotifyUsers] = useState<number[]>([]);
  const [editSelectedAccessories, setEditSelectedAccessories] = useState<number[]>([]);
  const [accessories, setAccessories] = useState<Array<{id: number; name: string}>>([]);
  const [closeConfirmOpen, setCloseConfirmOpen] = useState(false);
  const [pendingCloseTicket, setPendingCloseTicket] = useState<Ticket | null>(null);
  const [completedConfirmOpen, setCompletedConfirmOpen] = useState(false);
  const [pendingCompletedTicket, setPendingCompletedTicket] = useState<Ticket | null>(null);
  const [pendingCompletedStatus, setPendingCompletedStatus] = useState<string>('');
  const [addFormData, setAddFormData] = useState<any>({});
  const [showCreatedByMe, setShowCreatedByMe] = useState(false);
  
  // Verify modal states
  const [verifyModalOpen, setVerifyModalOpen] = useState(false);
  const [verifyingTicket, setVerifyingTicket] = useState<Ticket | null>(null);
  const [verifyRemarks, setVerifyRemarks] = useState('');

  // Ref for Select2 customer dropdown in edit modal
  const editCustomerSelectRef = useRef<HTMLSelectElement>(null);

  useEffect(() => {
    console.log('useEffect running for fetchTickets');
    const debounceTimer = setTimeout(() => {
      fetchTickets();
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [currentPage, perPage, searchTerm, sortField, sortOrder, filterStatus, filterCustomer, filterAgent, filterBranch, filterStartDate, filterEndDate, filterTicketType, filterTicketLabel, filterDue]);

  useEffect(() => {
    fetchCustomers();
    fetchStatuses();
    fetchPriorities();
    fetchBranches();
    fetchAgents();
    fetchTicketLabels();
    fetchAccessories();
  }, []);


  useEffect(() => {
    // Update filtered tickets when tickets change
    // This ensures the list refreshes after priority updates
    setFilteredTickets(tickets);
  }, [tickets]);

  // Initialize Select2 for edit customer dropdown
  useEffect(() => {
    if (!editModalOpen) {
      return;
    }

    // Wait for customers to be loaded
    if (customers.length === 0) {
      return;
    }

    // Wait for the modal to render and ref to attach
    const timeoutId = setTimeout(() => {
      if (!editCustomerSelectRef.current) {
        return;
      }

      const $select = $(editCustomerSelectRef.current);

      // Check if select2 is available
      if (typeof $.fn.select2 !== 'function') {
        console.error('Select2 is not available on jQuery');
        return;
      }

      try {
        // Destroy any existing Select2 instance
        if ($select.data('select2')) {
          $select.select2('destroy');
        }

        // Find the dialog/modal container for proper dropdown rendering
        const $modalContainer = $select.closest('[role="dialog"]');

        // Initialize Select2 with search enabled
        $select.select2({
          placeholder: 'Select a customer...',
          allowClear: true,
          width: '100%',
          minimumResultsForSearch: 0, // Always show search box
          dropdownParent: $modalContainer.length > 0 ? $modalContainer : $select.parent(),
          templateResult: function(customer: any) {
            if (!customer.id) {
              return customer.text;
            }
            const customerData = customers.find(c => c.id === parseInt(customer.id));
            if (customerData && customerData.mobile) {
              const $result = $('<div></div>');
              $result.html(`<span style="font-size: 13px;">${customerData.name}</span> <span style="color: #374151; font-size: 13px;">(${customerData.country_code || ''} ${customerData.mobile})</span>`);
              return $result;
            }
            const $result = $('<div></div>');
            $result.html(`<span style="font-size: 13px;">${customer.text}</span>`);
            return $result;
          },
          templateSelection: function(customer: any) {
            if (!customer.id) {
              return customer.text;
            }
            const customerData = customers.find(c => c.id === parseInt(customer.id));
            if (customerData && customerData.mobile) {
              const $result = $('<div></div>');
              $result.html(`<span style="font-size: 13px;">${customerData.name}</span> <span style="color: #374151; font-size: 13px;">(${customerData.country_code || ''} ${customerData.mobile})</span>`);
              return $result;
            }
            return customerData ? customerData.name : customer.text;
          }
        });

        // Set custom height for Select2 container
        const $container = $select.next('.select2-container');
        $container.find('.select2-selection--single').css({
          'height': '38px',
          'display': 'flex',
          'align-items': 'center'
        });

        // Style clear button
        $container.find('.select2-selection__clear').css({
          'margin-right': '10px',
          'padding-left': '10px'
        });

        // Handle change event
        $select.on('change', function() {
          const value = $(this).val() as string;
          if (value) {
            handleEditFormChange('customer_id', parseInt(value));
          }
        });

        // Set initial value if exists
        if (editFormData.customer_id) {
          $select.val(editFormData.customer_id.toString()).trigger('change.select2');
        }
      } catch (error) {
        console.error('Error initializing Select2:', error);
      }
    }, 300);

    // Cleanup
    return () => {
      clearTimeout(timeoutId);
      try {
        if (editCustomerSelectRef.current) {
          const $select = $(editCustomerSelectRef.current);
          if ($select.data('select2')) {
            $select.select2('destroy');
          }
        }
      } catch (error) {
        // Silently fail
      }
    };
  }, [editModalOpen, customers, editFormData.customer_id]);

  const fetchTickets = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get('/tickets', {
        params: {
          page: currentPage,
          per_page: perPage,
          search: searchTerm,
          sort_by: sortField,
          sort_order: sortOrder,
          status: filterStatus !== 'all' ? filterStatus : null,
          customer_id: filterCustomer !== 'all' ? filterCustomer : null,
          agent_id: filterAgent !== 'all' ? filterAgent : null,
          branch_id: filterBranch !== 'all' ? filterBranch : null,
          start_date: filterStartDate || null,
          end_date: filterEndDate || null,
          ticket_type: filterTicketType !== 'all' ? filterTicketType : null,
          label_id: filterTicketLabel !== 'all' ? filterTicketLabel : null,
          due: filterDue || null,
        },
      });

      const data = response.data;
      console.log('API Response:', data);
      console.log('First ticket:', data.data?.[0]);
      
      // Filter out only strictly closed tickets (status = 3), keep all others including 4 (Completed) and 5 (Returned)
      const activeTickets = (data.data || []).filter(ticket => {
        // Exclude only status 3 (Closed)
        const isNotClosed = ticket.status !== 3;
        console.log(`Ticket #${ticket.id} - Status: ${ticket.status}, Include: ${isNotClosed}`);
        return isNotClosed;
      });
      
      console.log('Fetched tickets statuses:', activeTickets.map(t => ({ id: t.id, status: t.status })));
      setTickets(activeTickets);
      setTotalPages(data.last_page || 1);
      setTotalItems(data.total || 0);
      setCurrentPage(data.current_page || 1);
    } catch (err: any) {
      console.error('Error fetching tickets:', err);
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 401) {
          console.log('Authentication error - user might be logged out');
          // Don't set error here, let the auth context handle redirect
          return;
        }
        setError(err.response?.data?.message || err.message);
      } else {
        setError('An error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomers = async () => {
    setLoadingCustomers(true);
    try {
      const response = await axios.get('/customers');
      setCustomers(response.data || []);
    } catch (err) {
      console.error('Error fetching customers:', err);
    } finally {
      setLoadingCustomers(false);
    }
  };

  const fetchAgents = async () => {
    setLoadingAgents(true);
    try {
      const response = await axios.get('/agent-users');
      const agentsData = response.data || [];
      setAllAgents(agentsData);
      setAgents(agentsData);
    } catch (err) {
      console.error('Error fetching agents:', err);
    } finally {
      setLoadingAgents(false);
    }
  };

  const fetchBranches = async () => {
    setLoadingBranches(true);
    try {
      const response = await axios.get('/branches');
      setBranches(response.data || []);
    } catch (err) {
      console.error('Error fetching branches:', err);
    } finally {
      setLoadingBranches(false);
    }
  };

  const fetchStatuses = async () => {
    try {
      const response = await axios.get('/ticket-statuses');
      console.log('Fetched ticket statuses:', response.data);
      
      // The API returns an array directly
      const statusData = Array.isArray(response.data) ? response.data : [];
      
      // Ensure we have the data
      if (statusData.length > 0) {
        setStatuses(statusData);
        console.log('Statuses set:', statusData);
        
        // Set default status to first available if not set
        if (!addFormData.status) {
          setAddFormData(prev => ({ ...prev, status: statusData[0].id }));
        }
      } else {
        // If no data from API, use defaults
        console.log('No statuses from API, using defaults');
        setStatuses([
          { id: 1, status: 'Open', color_code: '#82BBFF' },
          { id: 2, status: 'In Progress', color_code: '#e6af84' },
          { id: 3, status: 'Closed', color_code: '#D23B3B' },
          { id: 4, status: 'Completed', color_code: '#9810fa' },
          { id: 5, status: 'Returned', color_code: '#c3840b' }
        ]);
      }
    } catch (err) {
      console.error('Error fetching statuses:', err);
      // Use fallback statuses from database
      setStatuses([
        { id: 1, status: 'Open', color_code: '#82BBFF' },
        { id: 2, status: 'In Progress', color_code: '#e6af84' },
        { id: 3, status: 'Closed', color_code: '#D23B3B' },
        { id: 4, status: 'Completed', color_code: '#9810fa' },
        { id: 5, status: 'Returned', color_code: '#c3840b' }
      ]);
    }
  };

  const fetchTicketLabels = async () => {
    setLoadingTicketLabels(true);
    try {
      const response = await axios.get('/ticket-labels');
      setTicketLabels(response.data || []);
    } catch (err) {
      console.error('Error fetching ticket labels:', err);
    } finally {
      setLoadingTicketLabels(false);
    }
  };

  const fetchPriorities = async () => {
    try {
      const response = await axios.get('/priorities');
      console.log('Fetched priorities:', response.data);
      const priorityData = Array.isArray(response.data) ? response.data : (response.data.data || response.data || []);
      setPriorities(priorityData);
      
      // Set default priority to first available if not set
      if (priorityData.length > 0 && !addFormData.priority) {
        setAddFormData(prev => ({ ...prev, priority: priorityData[0].id }));
      }
    } catch (err) {
      console.error('Error fetching priorities:', err);
      // Set default priorities if API fails
      setPriorities([
        { id: 1, title: 'Low', color: '#0dcaf0' },
        { id: 2, title: 'Medium', color: '#6c757d' },
        { id: 3, title: 'High', color: '#dc3545' }
      ]);
    }
  };

  const fetchAccessories = async () => {
    try {
      const response = await axios.get('/accessories?all=true');
      setAccessories(response.data || []);
    } catch (error) {
      console.error('Error fetching accessories:', error);
    }
  };

  const getStatusVariant = (statusName: string | undefined) => {
    const name = String(statusName || '').toLowerCase();
    switch (name) {
      case 'open':
        return 'secondary';
      case 'in_progress':
      case 'in progress':
        return 'default';
      case 'resolved':
        return 'outline';
      case 'closed':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  const getPriorityVariant = (priorityName: string | undefined) => {
    const name = String(priorityName || '').toLowerCase();
    switch (name) {
      case 'urgent':
        return 'destructive';
      case 'high':
        return 'destructive';
      case 'medium':
        return 'default';
      case 'low':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  const formatDate = (date: string | null) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString();
  };
  
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };
  
  const handlePerPageChange = (value: string) => {
    setPerPage(value);
    setCurrentPage(1);
  };
  
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };
  
  const getSortIcon = (field: string) => {
    if (sortField !== field) {
      return <ArrowUpDown className="ml-2 h-4 w-4" />;
    }
    return sortOrder === 'asc' 
      ? <ArrowUp className="ml-2 h-4 w-4" />
      : <ArrowDown className="ml-2 h-4 w-4" />;
  };

  const handleEditClick = (ticket: Ticket) => {
    setEditingTicket(ticket);
    setEditFormData({
      issue: ticket.issue,
      description: ticket.description,
      status: ticket.status,
      priority: ticket.priority,
      due_date: ticket.due_date,
      closed_time: ticket.closed_time,
      customer_id: ticket.customer_id || ticket.customer?.id,
      ticket_type: ticket.ticket_type,
      branch_id: ticket.branch_id,
      service_id: ticket.service_id,
    });
    // Set selected agents, notify users, and accessories
    setEditSelectedAgents(ticket.agent?.map(a => a.id) || []);
    setEditSelectedNotifyUsers(ticket.notify_to?.map(u => u.id) || []);
    setEditSelectedAccessories(ticket.accessories?.map(a => a.id) || []);
    setEditModalOpen(true);
  };

  const handleEditFormChange = (field: keyof Ticket, value: string | number) => {
    if (field === 'customer_id') {
      setEditFormData(prev => ({ ...prev, [field]: value ? parseInt(value as string) : undefined }));
    } else {
      setEditFormData(prev => ({ ...prev, [field]: value }));
    }

    // When branch is changed, filter users by selected branch for all users
    if (field === 'branch_id') {
      if (value) {
        // Filter users by selected branch
        const filteredAgents = allAgents.filter((u: any) => u.branch_id === parseInt(value as string));
        setAgents(filteredAgents.length > 0 ? filteredAgents : allAgents);
        // Clear selected agents/notify users if they're not in the new branch
        if (filteredAgents.length > 0) {
          setEditSelectedAgents(prev => prev.filter(id => filteredAgents.some(u => u.id === id)));
          setEditSelectedNotifyUsers(prev => prev.filter(id => filteredAgents.some(u => u.id === id)));
        }
      } else {
        // If no branch selected, show all users
        setAgents(allAgents);
      }
    }
  };

  const handleSaveEdit = async () => {
    if (!editingTicket) return;

    // Validate required fields
    if (!editFormData.customer_id) {
      toast.error('Please select a customer');
      return;
    }
    if (!editFormData.issue) {
      toast.error('Please enter an issue title');
      return;
    }
    if (!editFormData.status) {
      toast.error('Please select a status');
      return;
    }
    if (!editFormData.priority) {
      toast.error('Please select a priority');
      return;
    }
    if (!editFormData.due_date) {
      toast.error('Please select a due date');
      return;
    }
    if (!editFormData.closed_time) {
      toast.error('Please select a time');
      return;
    }
    if (editSelectedAgents.length === 0) {
      toast.error('Please assign at least one agent');
      return;
    }
    if (editSelectedNotifyUsers.length === 0) {
      toast.error('Please select at least one user to notify');
      return;
    }
    if (!editFormData.branch_id) {
      toast.error('Please select a branch');
      return;
    }

    setSaving(true);
    try {
      const response = await axios.put(`/tickets/${editingTicket.id}`, {
        ...editFormData,
        assigned_users: editSelectedAgents,
        notify_users: editSelectedNotifyUsers,
        accessories: editSelectedAccessories
      });
      const updatedTicket = response.data.ticket || response.data;
      toast.success('Ticket updated successfully');
      fetchTickets(); // Refresh the list
      setEditModalOpen(false);
      setEditingTicket(null);
      setEditFormData({});
      setEditSelectedAgents([]);
      setEditSelectedNotifyUsers([]);
      setEditSelectedAccessories([]);
    } catch (err) {
      console.error('Error updating ticket:', err);
      toast.error('Failed to update ticket');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteClick = (ticket: Ticket) => {
    setDeletingTicket(ticket);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingTicket) return;

    try {
      await axios.put(`/tickets/${deletingTicket.id}`, {
        status: 3 // Closed status
      });

      setDeleteConfirmOpen(false);
      setDeletingTicket(null);

      // Refresh the tickets list
      await fetchTickets();

      toast.success('Ticket deleted successfully');
    } catch (err) {
      console.error('Error closing ticket:', err);
      toast.error('Failed to delete ticket');
    }
  };

  const handleConfirmClose = async () => {
    if (!pendingCloseTicket) return;

    try {
      console.log('Updating status to: Closed (3)');
      const response = await axios.put(`/tickets/${pendingCloseTicket.id}`, {
        status: 3,
        priority: pendingCloseTicket.priority,
        issue: pendingCloseTicket.issue,
        description: pendingCloseTicket.description,
        customer_id: pendingCloseTicket.customer_id
      });
      console.log('Update response:', response.data);
      toast.success('Ticket closed successfully');

      setCloseConfirmOpen(false);
      setPendingCloseTicket(null);

      // Refresh the tickets list
      await fetchTickets();
    } catch (error) {
      console.error('Error closing ticket:', error);
      console.error('Error details:', error.response?.data);
      toast.error(error.response?.data?.message || 'Failed to close ticket');
    }
  };

  const handleConfirmCompleted = async () => {
    if (!pendingCompletedTicket) return;

    try {
      console.log('Updating status to: Completed (4)');
      const response = await axios.put(`/tickets/${pendingCompletedTicket.id}`, {
        status: parseInt(pendingCompletedStatus),
        priority: pendingCompletedTicket.priority,
        issue: pendingCompletedTicket.issue,
        description: pendingCompletedTicket.description,
        customer_id: pendingCompletedTicket.customer_id
      });
      console.log('Update response:', response.data);
      toast.success('Ticket marked as completed successfully');

      setCompletedConfirmOpen(false);
      setPendingCompletedTicket(null);
      setPendingCompletedStatus('');

      // Refresh the tickets list
      await fetchTickets();
    } catch (error) {
      console.error('Error completing ticket:', error);
      console.error('Error details:', error.response?.data);
      toast.error(error.response?.data?.message || 'Failed to complete ticket');
    }
  };

  const handleVerifyTicket = (ticket: Ticket) => {
    setVerifyingTicket(ticket);
    setVerifyRemarks('');
    setVerifyModalOpen(true);
  };

  const handleConfirmVerify = async () => {
    if (!verifyingTicket) return;

    try {
      // Generate current timestamp in the format expected by backend
      const now = new Date();
      const verified_at = now.getFullYear() + '-' + 
                         String(now.getMonth() + 1).padStart(2, '0') + '-' + 
                         String(now.getDate()).padStart(2, '0') + ' ' + 
                         String(now.getHours()).padStart(2, '0') + ':' + 
                         String(now.getMinutes()).padStart(2, '0') + ':' + 
                         String(now.getSeconds()).padStart(2, '0');

      const response = await axios.put(`/tickets/${verifyingTicket.id}/verify`, {
        remarks: verifyRemarks,
        verified_at: verified_at
      });
      toast.success('Ticket verified successfully');
      setVerifyModalOpen(false);
      setVerifyingTicket(null);
      setVerifyRemarks('');
      // Refresh the tickets list
      await fetchTickets();
    } catch (error: any) {
      console.error('Error verifying ticket:', error);
      toast.error(error.response?.data?.message || 'Failed to verify ticket');
    }
  };

  const handleTicketClick = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setDetailsModalOpen(true);
  };

  const handleDetailsModalClose = () => {
    setDetailsModalOpen(false);
    setSelectedTicket(null);
    // Refresh tickets list when modal is closed
    fetchTickets();
  };

  const handleTicketUpdate = () => {
    fetchTickets();
    handleDetailsModalClose();
  };


  const applyFilters = () => {
    let filtered = [...tickets];
    
    console.log('Applying filters. Total tickets before filter:', filtered.length);
    console.log('Filter Status:', filterStatus);
    console.log('Available ticket statuses:', [...new Set(filtered.map(t => t.status))]);

    // Filter by date range
    if (filterStartDate) {
      filtered = filtered.filter(ticket => {
        const ticketDate = new Date(ticket.created_at).toISOString().split('T')[0];
        return ticketDate >= filterStartDate;
      });
    }
    if (filterEndDate) {
      filtered = filtered.filter(ticket => {
        const ticketDate = new Date(ticket.created_at).toISOString().split('T')[0];
        return ticketDate <= filterEndDate;
      });
    }

    // Filter by status
    if (filterStatus && filterStatus !== 'all') {
      const beforeStatusFilter = filtered.length;
      filtered = filtered.filter(ticket => String(ticket.status) === filterStatus);
      console.log(`Status filter applied. Before: ${beforeStatusFilter}, After: ${filtered.length}`);
    }

    // Filter by customer
    if (filterCustomer && filterCustomer !== 'all') {
      filtered = filtered.filter(ticket => String(ticket.customer_id) === filterCustomer);
    }

    console.log('Total tickets after all filters:', filtered.length);
    setFilteredTickets(filtered);
  };

  const handleFilter = () => {
    // Fetch tickets with filter parameters from server
    fetchTickets();
  };

  const handleClearFilters = async () => {
    // Clear all filter states
    setFilterStartDate('');
    setFilterEndDate('');
    setFilterStatus('all');
    setFilterCustomer('all');
    setFilterAgent('all');
    setFilterBranch('all');
    setFilterTicketType('all');
    setFilterTicketLabel('all');
    setShowCreatedByMe(false);
    setFilteredTickets([]);
    
    // Fetch tickets with cleared filters directly
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get('/tickets', {
        params: {
          page: currentPage,
          per_page: perPage,
          search: searchTerm,
          sort_by: sortField,
          sort_order: sortOrder,
          status: null,
          customer_id: null,
          start_date: null,
          end_date: null,
          ticket_type: null,
        },
      });

      const data = response.data;
      const activeTickets = data.data?.filter((ticket: Ticket) => {
        const isNotClosed = ticket.status !== 3;
        return isNotClosed;
      });

      setTickets(activeTickets);
      setTotalPages(data.last_page || 1);
      setTotalItems(data.total || 0);
      setCurrentPage(data.current_page || 1);
    } catch (err: any) {
      console.error('Error fetching tickets:', err);
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 401) {
          return;
        }
        setError(err.response?.data?.message || err.message);
      } else {
        setError('An error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  const displayTickets = filteredTickets.length > 0 ? filteredTickets : tickets;

  try {
    return (
      <DashboardLayout title="Tickets">
        <div className="p-6 space-y-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-semibold text-black">Active Tickets</h2>
              <p className="text-gray-600 text-xs sm:text-sm">
                Manage and track open and in-progress tickets
              </p>
            </div>
            <Button 
              variant="default"
              onClick={() => setAddModalOpen(true)}
              className="w-full sm:w-auto"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Ticket
            </Button>
          </div>

          {/* Filter Section - Desktop Single Line, Mobile Responsive */}
          <div className="bg-gray-50 p-3 sm:p-4 rounded-lg mb-4">
            {/* Filter Title and Controls Row */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:gap-3">
              {/* Filter Title */}
              <div className="flex items-center gap-2 mb-3 lg:mb-0">
                <Filter className="h-4 w-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700 whitespace-nowrap">Filter By:</span>
              </div>

              {/* Filter Controls - Single line on desktop, stacked on mobile */}
              <div className="flex flex-col sm:flex-row flex-wrap lg:flex-nowrap gap-2 flex-1 lg:items-center">
                {/* Date Range */}
                <Input
                  type="date"
                  value={filterStartDate}
                  onChange={(e) => setFilterStartDate(e.target.value)}
                  className="h-9 w-full sm:w-36 text-sm"
                  style={{ width: '150px' }}
                  placeholder="Start Date"
                />
                <span className="hidden lg:flex items-center text-sm text-gray-500">to</span>
                <Input
                  type="date"
                  value={filterEndDate}
                  onChange={(e) => setFilterEndDate(e.target.value)}
                  className="h-9 w-full sm:w-36 text-sm"
                  style={{ width: '150px' }}
                  placeholder="End Date"
                />

                {/* Status Filter */}
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="h-9 w-full sm:w-40 lg:w-32 text-sm">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    {statuses.map((status) => (
                      <SelectItem key={status.id} value={String(status.id)}>
                        {status.status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Customer Filter */}
                <Select value={filterCustomer} onValueChange={setFilterCustomer}>
                  <SelectTrigger className="h-9 w-full sm:w-44 lg:w-36 text-sm">
                    <SelectValue placeholder="All Customers" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Customers</SelectItem>
                    {customers.map((customer) => (
                      <SelectItem key={customer.id} value={String(customer.id)}>
                        {customer.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Agent Filter - Only show for admin users (role_id = 1) */}
                {user?.role_id === 1 && (
                  <Select value={filterAgent} onValueChange={setFilterAgent}>
                    <SelectTrigger className="h-9 w-full sm:w-44 lg:w-36 text-sm">
                      <SelectValue placeholder="All Agents" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Agents</SelectItem>
                      {agents.map((agent) => (
                        <SelectItem key={agent.id} value={String(agent.id)}>
                          {agent.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}

                {/* Branch Filter - Only show for admin users (role_id = 1) */}
                {user?.role_id === 1 && (
                  <Select value={filterBranch} onValueChange={setFilterBranch}>
                    <SelectTrigger className="h-9 w-full sm:w-44 lg:w-36 text-sm">
                      <SelectValue placeholder="All Branches" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Branches</SelectItem>
                      {branches.map((branch) => (
                        <SelectItem key={branch.id} value={String(branch.id)}>
                          {branch.branch_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}

                {/* Ticket Type Filter */}
                <Select value={filterTicketType} onValueChange={setFilterTicketType}>
                  <SelectTrigger className="h-9 w-full sm:w-36 lg:w-32 text-sm">
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="TKT">In Shop</SelectItem>
                    <SelectItem value="ONS">On Site</SelectItem>
                  </SelectContent>
                </Select>

                {/* Ticket Label Filter */}
                <Select value={filterTicketLabel} onValueChange={setFilterTicketLabel}>
                  <SelectTrigger className="h-9 w-full sm:w-36 lg:w-40 text-sm">
                    <SelectValue placeholder="All Labels" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Labels</SelectItem>
                    {loadingTicketLabels ? (
                      <SelectItem value="loading" disabled>Loading...</SelectItem>
                    ) : (
                      ticketLabels.map((label) => (
                        <SelectItem key={label.id} value={label.id.toString()}>
                          {label.label_name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button
                    onClick={handleFilter}
                    variant="default"
                    size="sm"
                    className="h-9 px-3 text-sm whitespace-nowrap"
                  >
                    <Filter className="mr-1 h-3 w-3" />
                    Apply
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleClearFilters}
                    size="sm"
                    className="h-9 px-3 text-sm whitespace-nowrap"
                  >
                    Clear
                  </Button>
                </div>

              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-3">
            <div className="flex items-center space-x-2">
              <span className="text-xs sm:text-sm text-gray-600">Show:</span>
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
              <span className="text-xs sm:text-sm text-gray-600">entries</span>
            </div>
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search tickets..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-9 pr-3 h-9 w-full sm:w-[250px]"
              />
            </div>
          </div>

          <div className="space-y-4">
            {loading ? (
              <div className="flex items-center justify-center h-24">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
              </div>
            ) : error ? (
              <div className="text-center h-24 flex items-center justify-center">
                <div className="text-destructive">Error: {error}</div>
              </div>
            ) : displayTickets.length === 0 ? (
              <div className="text-center h-24 flex items-center justify-center">
                No tickets found.
              </div>
            ) : (
              displayTickets.map((ticket) => (
                <div key={ticket.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  {/* Branch Name at top */}
                  {ticket.branch?.branch_name && (
                    <div className="text-xs mb-2" style={{ color: '#4f46e5' }}>
                      {ticket.branch.branch_name}
                    </div>
                  )}

                  {/* Mobile Layout */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                      <h3
                        className="text-base sm:text-lg font-medium cursor-pointer hover:opacity-80 transition-opacity"
                        style={{ color: '#3883c9' }}
                        onClick={() => handleTicketClick(ticket)}
                      >
                        <span className="block sm:inline">Ticket #{ticket.id}</span>
                        <span className="block sm:inline sm:ml-2">{ticket.issue}</span>
                      </h3>
                      <span className={`inline-block text-xs px-2 py-1 rounded ${
                        ticket.ticket_status?.name?.toLowerCase() === 'in_progress' || ticket.ticket_status?.name?.toLowerCase() === 'in progress'
                          ? 'bg-orange-100 text-orange-700' 
                          : ticket.ticket_status?.name?.toLowerCase() === 'open' 
                          ? 'bg-green-100 text-green-700' 
                          : ticket.ticket_status?.name?.toLowerCase() === 'resolved'
                          ? 'bg-blue-100 text-blue-700'
                          : ticket.ticket_status?.name?.toLowerCase() === 'closed'
                          ? 'bg-gray-100 text-gray-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {ticket.ticket_status?.name || 'Unknown'}
                      </span>
                      {ticket.verified_at && (
                        <CheckCircle className="h-5 w-5 text-green-600" title="Verified" />
                      )}
                    </div>
                    
                    {/* Action Buttons - Mobile Responsive */}
                    <div className="flex flex-wrap items-center gap-2 mt-2 sm:mt-0">
                      {ticket.customer && (
                        <span className="text-xs text-gray-600 border border-gray-300 rounded px-2 py-1">
                          {ticket.customer.name}
                        </span>
                      )}
                      {ticket.ticket_type && (
                        <span className={`text-xs border rounded px-2 py-1 ${
                          ticket.ticket_type === 'On Site'
                            ? 'bg-purple-100 text-purple-700 border-purple-300'
                            : 'bg-blue-100 text-blue-700 border-blue-300'
                        }`}>
                          {ticket.ticket_type}
                        </span>
                      )}
                      <Select
                        value={String(ticket.status)}
                        onValueChange={(value) => {
                          // Check if status is being changed to "Closed" (value = 3)
                          if (value === '3') {
                            setPendingCloseTicket(ticket);
                            setCloseConfirmOpen(true);
                          } else if (value === '4') {
                            // Check if status is being changed to "Completed" (value = 4)
                            setPendingCompletedTicket(ticket);
                            setPendingCompletedStatus(value);
                            setCompletedConfirmOpen(true);
                          } else {
                            // For other statuses, update directly
                            (async () => {
                              try {
                                console.log('Updating status to:', value);
                                const response = await axios.put(`/tickets/${ticket.id}`, {
                                  status: parseInt(value),
                                  priority: ticket.priority,
                                  issue: ticket.issue,
                                  description: ticket.description,
                                  customer_id: ticket.customer_id
                                });
                                console.log('Update response:', response.data);
                                const statusName = statuses.find(s => s.id === parseInt(value))?.status || 'Unknown';
                                toast.success(`Status updated to ${statusName}`);
                                fetchTickets(); // Refresh the list
                              } catch (error) {
                                console.error('Error updating status:', error);
                                console.error('Error details:', error.response?.data);
                                toast.error(error.response?.data?.message || 'Failed to update status');
                              }
                            })();
                          }
                        }}
                      >
                        <SelectTrigger className="w-28 sm:w-32 h-8 text-xs">
                          <span style={{ color: ticket.ticketStatus?.color_code || ticket.ticket_status?.color || '#6b7280' }}>
                            {ticket.ticketStatus?.status || ticket.ticket_status?.name || 'Unknown'}
                          </span>
                        </SelectTrigger>
                        <SelectContent>
                          {statuses.length === 0 ? (
                            <SelectItem value="0" disabled>Loading statuses...</SelectItem>
                          ) : (
                            statuses.map((status) => (
                              <SelectItem key={status.id} value={String(status.id)}>
                                <span style={{ color: status.color_code || '#6b7280' }}>
                                  {status.status}
                                </span>
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      <Select 
                        value={String(ticket.priority || 1)}
                        onValueChange={async (value) => {
                          try {
                            console.log('Updating priority to:', value, 'parsed:', parseInt(value));
                            const response = await axios.put(`/tickets/${ticket.id}`, {
                              priority: parseInt(value),
                              status: ticket.status,
                              issue: ticket.issue,
                              description: ticket.description,
                              customer_id: ticket.customer_id
                            });
                            console.log('Update response:', response.data);
                            const priorityName = priorities.find(p => p.id === parseInt(value))?.title || 'Unknown';
                            toast.success(`Priority updated to ${priorityName}`);
                            // Refresh all ticket data
                            await fetchTickets();
                            // Reset filtered tickets to show updated data
                            setFilteredTickets([]);
                          } catch (error) {
                            console.error('Error updating priority:', error);
                            console.error('Error details:', error.response?.data);
                            toast.error(error.response?.data?.message || 'Failed to update priority');
                          }
                        }}
                      >
                        <SelectTrigger className={`w-20 sm:w-24 h-8 text-xs bg-white border-gray-300 ${
                          (ticket.priority || 1) === 3
                            ? 'text-red-500' 
                            : (ticket.priority || 1) === 1 
                            ? 'text-cyan-500' 
                            : 'text-yellow-500'
                        }`}>
                          <span>{priorities.find(p => p.id === (ticket.priority || 1))?.title || 'Low'}</span>
                        </SelectTrigger>
                        <SelectContent>
                          {priorities.map((priority) => (
                            <SelectItem key={priority.id} value={String(priority.id)}>
                              {priority.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditClick(ticket)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDeleteClick(ticket)}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  {/* Row 2: Description and Tracking Number */}
                  <div className="mb-2 flex justify-between items-start gap-4">
                    <p className="text-sm text-gray-600 line-clamp-2 flex-1">{ticket.description || 'No description available'}</p>
                    <div className="flex flex-col items-end gap-1">
                      {ticket.tracking_number && (
                        <span className="font-medium whitespace-nowrap" style={{ color: '#1f81c3', fontSize: '13px' }}>
                          Unique Id: {ticket.tracking_number}
                          {ticket.due_date && (
                            <span className="ml-2" style={{color:'#ff5259'}}>
                              (Due: {new Date(ticket.due_date).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })})
                            </span>
                          )}
                        </span>
                      )}
                      {ticket.accessories && ticket.accessories.length > 0 && (
                        <div className="flex flex-wrap gap-1 justify-end">
                          <span className="text-xs text-gray-500 mr-1">Accessories:</span>
                          {ticket.accessories.map((accessory, index) => (
                            <span key={accessory.id} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-blue-100 text-blue-800">
                              {accessory.name}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Row 3: Assigned users and timestamps - Mobile/Desktop Responsive */}
                  <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-3">
                    {/* Assigned Users Section */}
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="flex items-center gap-1">
                        {ticket.agent && ticket.agent.length > 0 ? (
                          <>
                            {ticket.agent.slice(0, 2).map((agent, index) => (
                              <span key={agent.id} className="inline-flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-blue-100 text-blue-600 font-medium text-xs sm:text-sm" style={{ marginLeft: index > 0 ? '-10px' : '0' }}>
                                {agent.name.charAt(0)}
                              </span>
                            ))}
                            {ticket.agent.length > 2 && (
                              <span className="inline-flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gray-200 text-gray-600 font-medium text-xs" style={{ marginLeft: '-10px' }}>
                                +{ticket.agent.length - 2}
                              </span>
                            )}
                            <span className="text-gray-600 ml-2 text-xs sm:text-sm truncate max-w-[150px] sm:max-w-none">
                              {ticket.agent.map(a => a.name).join(', ')}
                            </span>
                          </>
                        ) : (
                          <>
                            <span className="inline-flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gray-100 text-gray-400 font-medium text-xs sm:text-sm">
                              ?
                            </span>
                            <span className="text-gray-600 text-xs sm:text-sm">Unassigned</span>
                          </>
                        )}
                      </div>
                      <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">
                        {ticket.agent?.length || 0} users
                      </span>
                      <button
                        className="inline-flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                        onClick={() => {
                          // Get the latest ticket data from displayTickets
                          const latestTicket = displayTickets.find(t => t.id === ticket.id) || ticket;
                          setSelectedTicketForAgent(latestTicket);
                          setAssignAgentModalOpen(true);
                        }}
                      >
                        <svg className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <Plus className="h-2 w-2 sm:h-3 sm:w-3 text-gray-600 -ml-1" />
                      </button>
                    </div>

                    {/* Timestamps Section - Right side on desktop */}
                    <div className="flex flex-col sm:flex-row gap-1 sm:gap-4 text-xs text-gray-500">
                      <span className="truncate">Created: {new Date(ticket.created_at).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}</span>
                      <span className="truncate">Updated: {ticket.updated_at ? new Date(ticket.updated_at).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      }) : 'Never'}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Pagination - Mobile Responsive */}
          <div className="flex flex-col sm:flex-row items-center justify-between mt-4 gap-3">
            <div className="text-xs sm:text-sm text-gray-600 text-center sm:text-left">
              Showing {displayTickets.length === 0 ? 0 : ((currentPage - 1) * parseInt(perPage)) + 1} to{' '}
              {Math.min(currentPage * parseInt(perPage), totalItems)} of {totalItems} entries
              {(filterStartDate || filterEndDate || (filterStatus !== 'all') || (filterCustomer !== 'all') || (filterTicketType !== 'all') || (filterTicketLabel !== 'all')) && (
                <span className="ml-2 text-blue-600">
                  (Filtered: {displayTickets.length} results)
                </span>
              )}
            </div>
            <div className="flex items-center space-x-1">
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-2 sm:px-3"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4 sm:mr-1" />
                <span className="hidden sm:inline">Previous</span>
              </Button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
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
                    className="h-8 w-8 hidden sm:inline-flex"
                    onClick={() => setCurrentPage(pageNum)}
                  >
                    {pageNum}
                  </Button>
                );
              })}
              {/* Mobile Page Indicator */}
              <span className="inline-flex sm:hidden mx-2 text-sm text-gray-600">
                {currentPage} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-2 sm:px-3"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="h-4 w-4 sm:ml-1" />
              </Button>
            </div>
          </div>
        </div>

        <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
          <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Ticket</DialogTitle>
              <DialogDescription>
                Make changes to ticket #{editingTicket?.tracking_number}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
              {/* Customer */}
              <div className="grid gap-2">
                <Label htmlFor="edit-customer">Customer <span className="text-red-500">*</span></Label>
                <select
                  ref={editCustomerSelectRef}
                  id="edit-customer"
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm"
                >
                  <option value="">Select a customer...</option>
                  {customers.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name}
                      {customer.mobile ? ` (${customer.country_code || ''} ${customer.mobile})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Issue */}
              <div className="grid gap-2">
                <Label htmlFor="edit-issue">Issue <span className="text-red-500">*</span></Label>
                <Input
                  id="edit-issue"
                  value={editFormData.issue || ''}
                  onChange={(e) => handleEditFormChange('issue', e.target.value)}
                  placeholder="Enter ticket issue"
                  required
                />
              </div>

              {/* Description */}
              <div className="grid gap-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={editFormData.description || ''}
                  onChange={(e) => handleEditFormChange('description', e.target.value)}
                  rows={3}
                  placeholder="Enter ticket description"
                />
              </div>

              {/* Status and Priority */}
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-status">Status <span className="text-red-500">*</span></Label>
                  <Select
                    value={editFormData.status?.toString() || ''}
                    onValueChange={(value) => handleEditFormChange('status', parseInt(value))}
                  >
                    <SelectTrigger id="edit-status">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {statuses.map((status) => (
                        <SelectItem key={status.id} value={status.id.toString()}>
                          <div className="flex items-center gap-2">
                            {status.color_code && (
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: status.color_code }}
                              />
                            )}
                            {status.status}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="edit-priority">Priority <span className="text-red-500">*</span></Label>
                  <Select
                    value={editFormData.priority?.toString() || ''}
                    onValueChange={(value) => handleEditFormChange('priority', parseInt(value))}
                  >
                    <SelectTrigger id="edit-priority">
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      {priorities.map((priority) => (
                        <SelectItem key={priority.id} value={priority.id.toString()}>
                          <div className="flex items-center gap-2">
                            {priority.color && (
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: priority.color }}
                              />
                            )}
                            {priority.title}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Due Date and Time */}
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-due-date">Due Date <span className="text-red-500">*</span></Label>
                  <Input
                    id="edit-due-date"
                    type="date"
                    value={editFormData.due_date || ''}
                    onChange={(e) => handleEditFormChange('due_date', e.target.value)}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-time">Time <span className="text-red-500">*</span></Label>
                  <Input
                    id="edit-time"
                    type="time"
                    value={editFormData.closed_time || ''}
                    onChange={(e) => handleEditFormChange('closed_time', e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Branch - For Admin users, this filters Assigned To and Notify To */}
              <div className="grid gap-2">
                <Label htmlFor="edit-branch">Branch <span className="text-red-500">*</span></Label>
                <Select
                  value={editFormData.branch_id?.toString() || ''}
                  onValueChange={(value) => handleEditFormChange('branch_id', value)}
                >
                  <SelectTrigger id="edit-branch">
                    <SelectValue placeholder="Select a branch" />
                  </SelectTrigger>
                  <SelectContent>
                    {branches.map((branch) => (
                      <SelectItem key={branch.id} value={branch.id.toString()}>
                        {branch.branch_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {editFormData.branch_id && (
                  <p className="text-xs text-gray-500">Users below will be filtered by selected branch</p>
                )}
              </div>

              {/* Assigned To */}
              <div className="grid gap-2">
                <Label>Assigned To <span className="text-red-500">*</span></Label>
                <div className="border rounded-md p-2 max-h-32 overflow-y-auto">
                  {agents.map((agent) => (
                    <label key={agent.id} className="flex items-center gap-2 py-1 hover:bg-gray-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editSelectedAgents.includes(agent.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setEditSelectedAgents([...editSelectedAgents, agent.id]);
                          } else {
                            setEditSelectedAgents(editSelectedAgents.filter(id => id !== agent.id));
                          }
                        }}
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm">{agent.name}</span>
                    </label>
                  ))}
                  {agents.length === 0 && (
                    <div className="text-sm text-gray-500">No agents available</div>
                  )}
                </div>
                {editSelectedAgents.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {editSelectedAgents.map(agentId => {
                      const agent = agents.find(a => a.id === agentId);
                      return agent ? (
                        <span key={agentId} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-blue-100">
                          {agent.name}
                        </span>
                      ) : null;
                    })}
                  </div>
                )}
              </div>

              {/* Notify To */}
              <div className="grid gap-2">
                <Label>Notify To <span className="text-red-500">*</span></Label>
                <div className="border rounded-md p-2 max-h-32 overflow-y-auto">
                  {agents.map((agent) => (
                    <label key={agent.id} className="flex items-center gap-2 py-1 hover:bg-gray-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editSelectedNotifyUsers.includes(agent.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setEditSelectedNotifyUsers([...editSelectedNotifyUsers, agent.id]);
                          } else {
                            setEditSelectedNotifyUsers(editSelectedNotifyUsers.filter(id => id !== agent.id));
                          }
                        }}
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm">{agent.name}</span>
                    </label>
                  ))}
                  {agents.length === 0 && (
                    <div className="text-sm text-gray-500">No users available</div>
                  )}
                </div>
                {editSelectedNotifyUsers.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {editSelectedNotifyUsers.map(userId => {
                      const user = agents.find(a => a.id === userId);
                      return user ? (
                        <span key={userId} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-green-100">
                          {user.name}
                        </span>
                      ) : null;
                    })}
                  </div>
                )}
              </div>

              {/* Accessories */}
              <div className="grid gap-2">
                <Label>Accessories</Label>
                <div className="border rounded-md p-2 max-h-32 overflow-y-auto">
                  {accessories.map((accessory) => (
                    <label key={accessory.id} className="flex items-center gap-2 py-1 hover:bg-gray-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editSelectedAccessories.includes(accessory.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setEditSelectedAccessories([...editSelectedAccessories, accessory.id]);
                          } else {
                            setEditSelectedAccessories(editSelectedAccessories.filter(id => id !== accessory.id));
                          }
                        }}
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm">{accessory.name}</span>
                    </label>
                  ))}
                  {accessories.length === 0 && (
                    <div className="text-sm text-gray-500">No accessories available</div>
                  )}
                </div>
                {editSelectedAccessories.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {editSelectedAccessories.map(accessoryId => {
                      const accessory = accessories.find(a => a.id === accessoryId);
                      return accessory ? (
                        <span key={accessoryId} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-blue-100 text-blue-800">
                          {accessory.name}
                        </span>
                      ) : null;
                    })}
                  </div>
                )}
              </div>

            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setEditModalOpen(false);
                  setEditSelectedAgents([]);
                  setEditSelectedNotifyUsers([]);
                  setEditSelectedAccessories([]);
                }}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleSaveEdit}
                disabled={saving}
                variant="default"
              >
                {saving ? 'Saving...' : 'Save changes'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Add Ticket Modal - Using the shared component */}
        <AddTicketModal
          open={addModalOpen}
          onOpenChange={setAddModalOpen}
          onTicketCreated={() => {
            fetchTickets();
          }}
        />

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Delete</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete ticket #{deletingTicket?.tracking_number}?
                This will close the ticket and set its status to "Closed".
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleConfirmDelete}
                className="bg-red-500 hover:bg-red-600 text-white"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Close Ticket Confirmation Dialog */}
        <AlertDialog open={closeConfirmOpen} onOpenChange={setCloseConfirmOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Close Ticket</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to close ticket <strong className="font-bold">#{pendingCloseTicket?.tracking_number}</strong>?
                This will set the ticket status to "Closed".
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => {
                setCloseConfirmOpen(false);
                setPendingCloseTicket(null);
              }}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleConfirmClose}
                className="bg-blue-500 hover:bg-blue-600 text-white"
              >
                OK
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Complete Ticket Confirmation Dialog */}
        <AlertDialog open={completedConfirmOpen} onOpenChange={setCompletedConfirmOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Complete Ticket</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to mark ticket <strong className="font-bold">#{pendingCompletedTicket?.tracking_number}</strong> as completed?
                This will set the ticket status to "Completed".
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => {
                setCompletedConfirmOpen(false);
                setPendingCompletedTicket(null);
                setPendingCompletedStatus('');
              }}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleConfirmCompleted}
                className="bg-blue-500 hover:bg-blue-600 text-white"
              >
                OK
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Verify Ticket Modal */}
        <Dialog open={verifyModalOpen} onOpenChange={setVerifyModalOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Verify Ticket
              </DialogTitle>
              <DialogDescription>
                Verify ticket #{verifyingTicket?.tracking_number}: {verifyingTicket?.issue}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="verification-remarks" className="text-sm font-medium">
                  Verification Remarks <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="verification-remarks"
                  placeholder="Enter verification remarks or notes..."
                  value={verifyRemarks}
                  onChange={(e) => setVerifyRemarks(e.target.value)}
                  rows={5}
                  className="resize-none"
                />
                <p className="text-xs text-gray-500">
                  Please provide details about the verification of this ticket
                </p>
              </div>
            </div>
            <DialogFooter className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => {
                  setVerifyModalOpen(false);
                  setVerifyingTicket(null);
                  setVerifyRemarks('');
                }}
                className="flex items-center gap-2"
              >
                <X className="h-4 w-4" />
                Cancel
              </Button>
              <Button 
                onClick={handleConfirmVerify}
                disabled={!verifyRemarks.trim()}
                className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
              >
                <CheckCircle className="h-4 w-4" />
                Verify Ticket
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <TicketDetailsModal
          ticket={selectedTicket}
          isOpen={detailsModalOpen}
          onClose={handleDetailsModalClose}
          onUpdate={() => {}}
        />

        <AssignAgentModal
          ticket={selectedTicketForAgent}
          isOpen={assignAgentModalOpen}
          onClose={async () => {
            setAssignAgentModalOpen(false);
            setSelectedTicketForAgent(null);
            // Force reload ticket data from server
            await fetchTickets();
          }}
          onUpdate={async () => {
            // Force reload ticket data from server
            await fetchTickets();
          }}
        />
      </div>
    </DashboardLayout>
  );
  } catch (error) {
    console.error('Error rendering tickets component:', error);
    return (
      <DashboardLayout title="Tickets">
        <div className="p-6">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <strong>Error:</strong> {error instanceof Error ? error.message : 'An error occurred rendering the tickets page'}
          </div>
        </div>
      </DashboardLayout>
    );
  }
}