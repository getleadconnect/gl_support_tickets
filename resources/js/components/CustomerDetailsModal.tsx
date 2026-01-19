import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Plus, Users, MoreVertical } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

interface Customer {
  id: number;
  name: string;
  email: string | null;
  country_code: string | null;
  mobile: string | null;
  company_name: string | null;
  created_at: string;
  updated_at: string;
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

interface CustomerDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: Customer | null;
}

export default function CustomerDetailsModal({ isOpen, onClose, customer }: CustomerDetailsModalProps) {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [stats, setStats] = useState<CustomerStats>({
    total_tickets: 0,
    open_tickets: 0,
    in_progress_tickets: 0,
    closed_tickets: 0,
  });
  const [loading, setLoading] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<string>('');
  const [selectedPriority, setSelectedPriority] = useState<{ [key: number]: string }>({});
  const [selectedStatus, setSelectedStatus] = useState<{ [key: number]: string }>({});
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen && customer) {
      fetchCustomerDetails();
    }
  }, [isOpen, customer]);

  const fetchCustomerDetails = async () => {
    if (!customer) return;
    
    setLoading(true);
    try {
      const response = await axios.get(`/customer-details/${customer.id}`);
      const data = response.data;
      
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
      setSelectedCustomer(customer.name);
    } catch (error) {
      console.error('Error fetching customer details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTicket = () => {
    if (customer) {
      navigate(`/tickets?customer_id=${customer.id}&action=add`);
      onClose();
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

  const getStatusColor = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower.includes('progress')) return 'text-orange-600';
    if (statusLower === 'open') return 'text-blue-600';
    if (statusLower === 'closed') return 'text-gray-600';
    return 'text-gray-600';
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

  if (!customer) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[90vw] w-[1400px] h-[90vh] p-0 overflow-hidden" style={{ display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <div className="bg-white border-b px-6 flex items-center" style={{ height: '50px' }}>
          <h2 className="text-2xl font-semibold text-black">Customer Details</h2>
        </div>

        {/* Customer Info Bar */}
        <div className="bg-green-50 px-6 py-4 flex justify-between">
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
              </div>
            </div>
          </div>

          <div className="flex gap-8">
            <div className="text-center">
              <div className="text-2xl font-bold">{stats.total_tickets}</div>
              <div className="text-sm text-gray-600">Tickets</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.open_tickets}</div>
              <div className="text-sm text-blue-600">Open</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{stats.in_progress_tickets}</div>
              <div className="text-sm text-orange-600">In Progress</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">{stats.closed_tickets}</div>
              <div className="text-sm text-gray-600">Closed</div>
            </div>
            
            <Button
              onClick={handleAddTicket}
              className="flex items-center gap-2"
              variant="outline"
            >
              Add Ticket
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Tickets Section */}
        <div className="flex-1 overflow-auto p-6 bg-gray-50">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <span className="text-gray-400">▶</span> Tickets
          </h3>
          
          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading tickets...</div>
          ) : tickets.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No tickets found for this customer</div>
          ) : (
            <div className="space-y-3">
              {tickets.map((ticket) => (
                <div key={ticket.id} className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="mb-2">
                        <span className="text-blue-600 font-medium">
                          Ticket ID : #{ticket.id} {ticket.issue}
                        </span>
                        <span className={`ml-2 text-sm font-medium ${getStatusColor(ticket.ticketStatus?.status || 'Open')}`}>
                          : {ticket.ticketStatus?.status || 'Open'}
                        </span>
                      </div>
                      
                      {ticket.description && (
                        <p className="text-gray-600 text-sm mb-3">{ticket.description}</p>
                      )}
                      
                      <div className="flex items-center gap-3">
                        {/* Created by */}
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-teal-500 text-white rounded-full flex items-center justify-center text-xs font-semibold">
                            {ticket.user ? getInitials(ticket.user.name) : 'M'}
                          </div>
                          <span className="text-sm text-gray-600">
                            {ticket.user?.name || 'Unknown'}
                          </span>
                        </div>

                        {/* X button for removing */}
                        <button className="text-gray-400 hover:text-red-500">
                          <X className="h-4 w-4" />
                        </button>

                        {/* Agent count */}
                        <div className="flex items-center gap-2">
                          <span className="text-sm bg-gray-100 px-2 py-1 rounded">{ticket.agent?.length || 0}</span>
                          <Users className="h-4 w-4 text-gray-400" />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="text-right text-sm">
                        <div className="text-gray-600 flex items-center gap-2">
                          <span className="text-teal-500">●</span>
                          <span>Created : {format(new Date(ticket.created_at), 'MMM dd, hh:mm a')}</span>
                          <span className="text-blue-500 ml-4">●</span>
                          <span>Updated On : {formatDate(ticket.updated_at)}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">Lost Items</span>
                        
                        <Select
                          value={selectedCustomer}
                          onValueChange={setSelectedCustomer}
                        >
                          <SelectTrigger className="w-32 h-8 bg-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={customer.name}>{customer.name}</SelectItem>
                          </SelectContent>
                        </Select>

                        <Select
                          value={String(ticket.priority || 1)}
                          onValueChange={(value) => setSelectedPriority({...selectedPriority, [ticket.id]: value})}
                        >
                          <SelectTrigger className={`w-24 h-8 ${
                            ticket.priority === 3 ? 'bg-red-500 text-white' : 
                            ticket.priority === 2 ? 'bg-yellow-500 text-white' :
                            'bg-cyan-400 text-white'
                          }`}>
                            <SelectValue>
                              {ticket.priority === 3 ? 'High' : ticket.priority === 2 ? 'Medium' : 'Low'}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">Low</SelectItem>
                            <SelectItem value="2">Medium</SelectItem>
                            <SelectItem value="3">High</SelectItem>
                          </SelectContent>
                        </Select>

                        <Select
                          value={ticket.ticketStatus?.status || 'Open'}
                          onValueChange={(value) => setSelectedStatus({...selectedStatus, [ticket.id]: value})}
                        >
                          <SelectTrigger className="w-32 h-8 bg-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Open">Open</SelectItem>
                            <SelectItem value="In Progress">In Progress</SelectItem>
                            <SelectItem value="Closed">Closed</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}