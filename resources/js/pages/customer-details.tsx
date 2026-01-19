import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { DashboardLayout } from '@/components/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Plus, Users, ArrowLeft, UserPlus } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { format } from 'date-fns';
import { CustomerAddTicketModal } from '@/components/CustomerAddTicketModal';
import { AssignUsersModal } from '@/components/AssignUsersModal';

interface Customer {
  id: number;
  name: string;
  email: string | null;
  country_code: string | null;
  mobile: string | null;
  company_name: string | null;
  branch_id?: number | null;
  branch?: {
    id: number;
    branch_name: string;
  };
  created_at: string;
  updated_at: string;
}

interface Status {
  id: number;
  status: string;
  color_code?: string;
}

interface Priority {
  id: number;
  title: string;
}

interface Ticket {
  id: number;
  issue: string;
  description: string | null;
  tracking_number: string;
  status: number;
  priority: number;
  customer_id: number;
  created_at: string;
  updated_at: string;
  created_by: number;
  ticketStatus?: {
    id: number;
    status: string;
    color_code?: string;
  };
  ticketPriority?: {
    id: number;
    title: string;
  };
  user?: {
    id: number;
    name: string;
  };
  agent?: Array<{
    id: number;
    name: string;
  }>;
}

interface CustomerStats {
  total_tickets: number;
  open_tickets: number;
  in_progress_tickets: number;
  closed_tickets: number;
}

export default function CustomerDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [stats, setStats] = useState<CustomerStats>({
    total_tickets: 0,
    open_tickets: 0,
    in_progress_tickets: 0,
    closed_tickets: 0,
  });
  const [loading, setLoading] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState<string>('');
  const [selectedPriority, setSelectedPriority] = useState<{ [key: number]: string }>({});
  const [selectedStatus, setSelectedStatus] = useState<{ [key: number]: string }>({});
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [priorities, setPriorities] = useState<Priority[]>([]);
  const [updatingStatus, setUpdatingStatus] = useState<number | null>(null);
  const [updatingPriority, setUpdatingPriority] = useState<number | null>(null);
  const [showAddTicketModal, setShowAddTicketModal] = useState(false);
  const [showAssignUsersModal, setShowAssignUsersModal] = useState(false);
  const [selectedTicketForAssign, setSelectedTicketForAssign] = useState<number | null>(null);
  const [selectedTicketAgents, setSelectedTicketAgents] = useState<number[]>([]);

  useEffect(() => {
    if (id) {
      fetchCustomerDetails();
    }
    fetchStatuses();
    fetchPriorities();
  }, [id]);

  const fetchCustomerDetails = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/customer-details/${id}`);
      const data = response.data;
      
      setCustomer(data.customer);
      setTickets(data.tickets || []);
      setStats({
        total_tickets: data.stats?.total_tickets || 0,
        open_tickets: data.stats?.open_tickets || 0,
        in_progress_tickets: data.stats?.in_progress_tickets || 0,
        closed_tickets: data.stats?.closed_tickets || 0,
      });

      // Initialize priority and status for each ticket
      const priorities: { [key: number]: string } = {};
      const statuses: { [key: number]: string } = {};
      
      data.tickets?.forEach((ticket: Ticket) => {
        priorities[ticket.id] = String(ticket.priority || 2);
        statuses[ticket.id] = ticket.ticketStatus?.status || 'Open';
      });
      
      setSelectedPriority(priorities);
      setSelectedStatus(statuses);
      setSelectedCustomer(data.customer?.name || '');
    } catch (error) {
      console.error('Error fetching customer details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTicket = () => {
    setShowAddTicketModal(true);
  };

  const handleTicketAdded = () => {
    fetchCustomerDetails();
  };

  const handleAssignUsers = (ticketId: number, currentAgents: any[]) => {
    setSelectedTicketForAssign(ticketId);
    const agentIds = currentAgents?.map(agent => agent.id) || [];
    setSelectedTicketAgents(agentIds);
    setShowAssignUsersModal(true);
  };

  const handleAgentsUpdated = () => {
    fetchCustomerDetails();
  };

  const fetchStatuses = async () => {
    try {
      const response = await axios.get('/ticket-statuses');
      setStatuses(response.data || []);
    } catch (err) {
      console.error('Error fetching statuses:', err);
      // Set default statuses if API fails
      setStatuses([
        { id: 1, status: 'Open', color_code: '#10b981' },
        { id: 2, status: 'In Progress', color_code: '#f59e0b' },
        { id: 3, status: 'Closed', color_code: '#ef4444' }
      ]);
    }
  };

  const fetchPriorities = async () => {
    try {
      const response = await axios.get('/priorities');
      setPriorities(response.data || []);
    } catch (err) {
      console.error('Error fetching priorities:', err);
      // Set default priorities if API fails
      setPriorities([
        { id: 1, title: 'Low' },
        { id: 2, title: 'Medium' },
        { id: 3, title: 'High' }
      ]);
    }
  };

  const handleStatusUpdate = async (ticketId: number, newStatusId: number) => {
    setUpdatingStatus(ticketId);
    try {
      await axios.patch(`/tickets/${ticketId}`, { status: newStatusId });
      toast.success('Status updated successfully');
      // Refresh tickets to get updated status
      fetchCustomerDetails();
    } catch (err: any) {
      console.error('Error updating status:', err);
      toast.error(err.response?.data?.message || 'Failed to update status');
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handlePriorityUpdate = async (ticketId: number, newPriorityId: number) => {
    setUpdatingPriority(ticketId);
    try {
      await axios.patch(`/tickets/${ticketId}`, { priority: newPriorityId });
      toast.success('Priority updated successfully');
      // Refresh tickets to get updated priority
      fetchCustomerDetails();
    } catch (err: any) {
      console.error('Error updating priority:', err);
      toast.error(err.response?.data?.message || 'Failed to update priority');
    } finally {
      setUpdatingPriority(null);
    }
  };

  const getInitials = (name: string) => {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 3: return 'bg-red-500 text-white';
      case 1: return 'bg-cyan-400 text-white';
      default: return 'bg-yellow-500 text-white';
    }
  };

  const getStatusBadgeVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    const statusLower = status.toLowerCase();
    if (statusLower.includes('progress')) return 'default';
    if (statusLower === 'open') return 'default';
    if (statusLower === 'closed') return 'secondary';
    if (statusLower === 'resolved') return 'outline';
    return 'secondary';
  };

  const getStatusBadgeStyle = (colorCode?: string) => {
    if (colorCode) {
      return {
        backgroundColor: colorCode,
        color: '#ffffff',
        border: `1px solid ${colorCode}`
      };
    }
    
    // Default style if no color code from database
    return {
      backgroundColor: '#e5e7eb',
      color: '#374151'
    };
  };

  const formatDate = (date: string) => {
    const d = new Date(date);
    const now = new Date();
    const diffInMs = now.getTime() - d.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);
    const diffInMonths = Math.floor(diffInDays / 30);

    if (diffInHours < 24) {
      return `${diffInHours} hours ago`;
    } else if (diffInDays === 1) {
      return '1 day ago';
    } else if (diffInDays < 30) {
      return `${diffInDays} days ago`;
    } else if (diffInMonths === 1) {
      return '1 month ago';
    } else {
      return `${diffInMonths} months ago`;
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Customer Details">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading customer details...</div>
        </div>
      </DashboardLayout>
    );
  }

  if (!customer) {
    return (
      <DashboardLayout title="Customer Details">
        <div className="flex items-center justify-center h-64">
          <div className="text-red-500">Customer not found</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Customer Details">
      <div className="h-full flex flex-col">
        {/* Header with Customer Info */}
        <div className="bg-white border-b px-6 flex items-center justify-between" style={{ height: '70px' }}>
          <div className="flex gap-4">
            <div className="w-12 h-12 bg-blue-600 text-white rounded-lg flex items-center justify-center font-semibold text-lg">
              {getInitials(customer.name)}
            </div>
            <div>
              <h3 className="font-semibold text-lg">{customer.name}</h3>
              <div className="text-sm text-gray-600">
                {customer.country_code && customer.mobile && (
                  <span>📞 +{customer.country_code} {customer.mobile}</span>
                )}
                {customer.email && (
                  <span className="ml-4">✉️ {customer.email}</span>
                )}
              </div>
              {customer.branch && (
                <div className="text-sm text-gray-600 mt-1">
                  <span>🏢 Branch: {customer.branch.branch_name}</span>
                </div>
              )}
            </div>
          </div>
          
          {/* Statistics Row */}
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="text-xl font-bold">{stats.total_tickets}</div>
              <div className="text-xs text-gray-600">Tickets</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-blue-600">{stats.open_tickets}</div>
              <div className="text-xs text-blue-600">Open</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-orange-600">{stats.in_progress_tickets}</div>
              <div className="text-xs text-orange-600">In Progress</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-gray-600">{stats.closed_tickets}</div>
              <div className="text-xs text-gray-600">Closed</div>
            </div>
            
            <Button
              onClick={handleAddTicket}
              className="flex items-center gap-2"
              variant="outline"
              size="sm"
            >
              Add Ticket
              <Plus className="h-4 w-4" />
            </Button>
            
            <Button
              onClick={() => navigate('/customers')}
              className="flex items-center gap-2 bg-black text-white hover:bg-gray-800"
              size="sm"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </div>
        </div>

        {/* Tickets Section */}
        <div className="flex-1 overflow-auto p-6 bg-gray-50">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <span className="text-gray-400">▶</span> Tickets
          </h3>
          
          {tickets.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No tickets found for this customer</div>
          ) : (
            <div className="space-y-3">
              {tickets.map((ticket) => (
                <div key={ticket.id} className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex flex-col gap-3">
                    {/* Row 1: Title/Status (left) and dropdowns (right) */}
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-3">
                        <span className="text-blue-600 font-medium">
                          Ticket ID : #{ticket.id} {ticket.issue}
                        </span>
                        <Badge 
                          style={(() => {
                            const currentStatus = statuses.find(s => s.id === ticket.status);
                            return getStatusBadgeStyle(currentStatus?.color_code);
                          })()}
                          className="px-2 py-0.5 text-xs font-medium"
                        >
                          {statuses.find(s => s.id === ticket.status)?.status || 'Open'}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-600 border border-gray-300 rounded px-2 py-1">
                          {customer.name}
                        </span>
                        
                        <Select
                          value={ticket.status?.toString() || '1'}
                          onValueChange={(value) => handleStatusUpdate(ticket.id, parseInt(value))}
                          disabled={updatingStatus === ticket.id}
                        >
                          <SelectTrigger className="w-32 h-8 bg-white">
                            <SelectValue>
                              {(() => {
                                const currentStatus = statuses.find(s => s.id === ticket.status);
                                return (
                                  <span style={{ color: currentStatus?.color_code || '#6b7280' }}>
                                    {currentStatus?.status || 'Unknown'}
                                  </span>
                                );
                              })()}
                            </SelectValue>
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
                        
                        <Select
                          value={ticket.priority?.toString() || '1'}
                          onValueChange={(value) => handlePriorityUpdate(ticket.id, parseInt(value))}
                          disabled={updatingPriority === ticket.id}
                        >
                          <SelectTrigger className={`w-24 h-8 bg-white border-gray-300 ${
                            ticket.priority === 3 ? 'text-red-500' : 
                            ticket.priority === 2 ? 'text-yellow-500' :
                            'text-cyan-500'
                          }`}>
                            <SelectValue>
                              {priorities.find(p => p.id === ticket.priority)?.title || 'Low'}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            {priorities.map((priority) => (
                              <SelectItem key={priority.id} value={priority.id.toString()}>
                                <span className={`${
                                  priority.id === 3 ? 'text-red-500' : 
                                  priority.id === 2 ? 'text-yellow-500' :
                                  'text-cyan-500'
                                }`}>
                                  {priority.title}
                                </span>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    {/* Row 2: Description and Tracking Number */}
                    <div className="mb-3 flex justify-between items-start gap-4">
                      <p className="text-sm text-gray-600 line-clamp-2 flex-1">{ticket.description || 'No description available'}</p>
                      {ticket.tracking_number && (
                        <span className="font-medium whitespace-nowrap" style={{ color: '#1f81c3', fontSize: '13px' }}>
                          Unique Id: {ticket.tracking_number}
                        </span>
                      )}
                    </div>
                    
                    {/* Row 3: Assigned users and timestamps - Mobile Responsive */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs sm:text-sm">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                          {ticket.agent && ticket.agent.length > 0 ? (
                            <>
                              {ticket.agent.slice(0, 2).map((agent, index) => (
                                <span key={agent.id} className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-medium" style={{ marginLeft: index > 0 ? '-10px' : '0' }}>
                                  {agent.name.charAt(0)}
                                </span>
                              ))}
                              {ticket.agent.length > 2 && (
                                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-200 text-gray-600 font-medium text-xs" style={{ marginLeft: '-10px' }}>
                                  +{ticket.agent.length - 2}
                                </span>
                              )}
                              <span className="text-gray-600 ml-2">
                                {ticket.agent.map(a => a.name).join(', ')}
                              </span>
                            </>
                          ) : (
                            <>
                              <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-gray-400 font-medium">
                                ?
                              </span>
                              <span className="text-gray-600">Unassigned</span>
                            </>
                          )}
                        </div>
                        <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">
                          {ticket.agent?.length || 0} users
                        </span>
                        <button 
                          className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                          onClick={() => handleAssignUsers(ticket.id, ticket.agent || [])}
                          title="Assign agents"
                        >
                          <UserPlus className="w-4 h-4 text-gray-600" />
                        </button>
                      </div>
                      
                      {/* Dates on the right */}
                      <div className="text-sm text-gray-600 flex items-center gap-2">
                        <span className="text-teal-500">●</span>
                        <span>Created : {format(new Date(ticket.created_at), 'MMM dd, hh:mm a')}</span>
                        <span className="text-blue-500 ml-4">●</span>
                        <span>Updated On : {formatDate(ticket.updated_at)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {customer && (
        <>
          <CustomerAddTicketModal
            isOpen={showAddTicketModal}
            onClose={() => setShowAddTicketModal(false)}
            customerId={customer.id}
            customerName={customer.name}
            onTicketAdded={handleTicketAdded}
          />
          {selectedTicketForAssign && (
            <AssignUsersModal
              isOpen={showAssignUsersModal}
              onClose={() => {
                setShowAssignUsersModal(false);
                setSelectedTicketForAssign(null);
                setSelectedTicketAgents([]);
              }}
              ticketId={selectedTicketForAssign}
              currentAgents={selectedTicketAgents}
              onAgentsUpdated={handleAgentsUpdated}
            />
          )}
        </>
      )}
    </DashboardLayout>
  );
}