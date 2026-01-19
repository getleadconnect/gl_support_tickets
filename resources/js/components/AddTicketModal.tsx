import React, { useState, useEffect, useRef, useMemo } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus } from 'lucide-react';
import { AddCustomerModal } from './AddCustomerModal';
import jQuery from 'jquery';
import select2Factory from 'select2';
import 'select2/dist/css/select2.min.css';

// Initialize select2 on jQuery
select2Factory(jQuery);

// Make jQuery available globally
(window as any).jQuery = jQuery;
(window as any).$ = jQuery;

const $ = jQuery;

interface Customer {
  id: number;
  name: string;
  email?: string;
  mobile?: string;
  country_code?: string;
}

interface TicketStatus {
  id: number;
  status: string;
  color_code?: string;
}

interface Priority {
  id: number;
  title: string;
  color?: string;
}

interface AdditionalField {
  id: number;
  title: string;
  name: string;
  type: string;
  selection?: string | null;
  mandatory: number;
  show_filter: number;
  show_list: number;
  value: Array<{id: number; value: string}> | null;
}

interface User {
  id: number;
  name: string;
  email?: string;
  branch_id?: number;
}

interface AddTicketModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customerId?: number;
  customerName?: string;
  onTicketCreated?: () => void;
}

export function AddTicketModal({
  open,
  onOpenChange,
  customerId,
  customerName,
  onTicketCreated
}: AddTicketModalProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [ticketStatuses, setTicketStatuses] = useState<TicketStatus[]>([]);
  const [loadingStatuses, setLoadingStatuses] = useState(false);
  const [priorities, setPriorities] = useState<Priority[]>([]);
  const [loadingPriorities, setLoadingPriorities] = useState(false);
  const [additionalFields, setAdditionalFields] = useState<AdditionalField[]>([]);
  const [additionalFieldValues, setAdditionalFieldValues] = useState<{[key: number]: string}>({});
  const [branches, setBranches] = useState<Array<{id: number; branch_name: string}>>([]);
  const [ticketLabels, setTicketLabels] = useState<Array<{id: number; label_name: string; color?: string}>>([]);
  const [selectedLabels, setSelectedLabels] = useState<number[]>([]);
  const [showLabelsDropdown, setShowLabelsDropdown] = useState(false);
  const labelsDropdownRef = useRef<HTMLDivElement>(null);
  const [agentUsers, setAgentUsers] = useState<User[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [selectedAgents, setSelectedAgents] = useState<number[]>([]);
  const [selectedNotifyUsers, setSelectedNotifyUsers] = useState<number[]>([]);
  const [showAgentsDropdown, setShowAgentsDropdown] = useState(false);
  const [showNotifyDropdown, setShowNotifyDropdown] = useState(false);
  const agentsDropdownRef = useRef<HTMLDivElement>(null);
  const notifyDropdownRef = useRef<HTMLDivElement>(null);
  const [accessories, setAccessories] = useState<Array<{id: number; name: string}>>([]);
  const [selectedAccessories, setSelectedAccessories] = useState<number[]>([]);
  const [showAccessoriesDropdown, setShowAccessoriesDropdown] = useState(false);
  const accessoriesDropdownRef = useRef<HTMLDivElement>(null);
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);
  const customerSelectRef = useRef<HTMLSelectElement>(null);
  const [formData, setFormData] = useState({
    customer_id: customerId || undefined,
    issue: '',
    description: '',
    status: 1, // Default to first status
    priority: 1, // Default to 'Low'
    due_date: '',
    branch_id: '',
    ticket_type: '',
    closed_time: '',
  });

  useEffect(() => {
    if (open) {
      if (!customerId) {
        fetchCustomers();
      }
      fetchTicketStatuses();
      fetchPriorities();
      fetchAdditionalFields();
      fetchBranches();
      fetchTicketLabels();
      fetchAgentUsers();
      fetchAccessories();
    }
  }, [open, customerId]);

  useEffect(() => {
    if (customerId) {
      setFormData(prev => ({ ...prev, customer_id: customerId }));
    }
  }, [customerId]);

  // Click outside handler for dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (labelsDropdownRef.current && !labelsDropdownRef.current.contains(event.target as Node)) {
        setShowLabelsDropdown(false);
      }
      if (agentsDropdownRef.current && !agentsDropdownRef.current.contains(event.target as Node)) {
        setShowAgentsDropdown(false);
      }
      if (notifyDropdownRef.current && !notifyDropdownRef.current.contains(event.target as Node)) {
        setShowNotifyDropdown(false);
      }
      if (accessoriesDropdownRef.current && !accessoriesDropdownRef.current.contains(event.target as Node)) {
        setShowAccessoriesDropdown(false);
      }
    };

    if (showLabelsDropdown || showAgentsDropdown || showNotifyDropdown || showAccessoriesDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showLabelsDropdown, showAgentsDropdown, showNotifyDropdown, showAccessoriesDropdown]);

  // Initialize Select2 for customer dropdown
  useEffect(() => {
    if (!customerSelectRef.current || !open || customerId) {
      return;
    }

    // Wait for customers to be loaded
    if (customers.length === 0) {
      return;
    }

    const $select = $(customerSelectRef.current);

    // Check if select2 is available
    if (typeof $.fn.select2 !== 'function') {
      console.error('Select2 is not available on jQuery');
      console.log('jQuery version:', $.fn.jquery);
      console.log('Available jQuery methods:', Object.keys($.fn));
      return;
    }

    // Small delay to ensure DOM is ready
    const timeoutId = setTimeout(() => {
      try {
        // Destroy any existing Select2 instance
        if ($select.data('select2')) {
          $select.select2('destroy');
        }

        console.log('Initializing Select2...');

        // Initialize Select2 with search enabled
        $select.select2({
          placeholder: 'Select a customer...',
          allowClear: true,
          width: '100%',
          minimumResultsForSearch: 0, // Always show search box
          dropdownParent: $select.parent(),
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

        console.log('Select2 initialized successfully');

        // Handle change event
        $select.on('change', function() {
          const value = $(this).val() as string;
          if (value) {
            handleFormChange('customer_id', parseInt(value));
          } else {
            handleFormChange('customer_id', undefined);
          }
        });

        // Set initial value if exists
        if (formData.customer_id) {
          $select.val(formData.customer_id.toString()).trigger('change.select2');
        }
      } catch (error) {
        console.error('Error initializing Select2:', error);
      }
    }, 200);

    // Cleanup
    return () => {
      clearTimeout(timeoutId);
      try {
        if ($select.data('select2')) {
          $select.select2('destroy');
        }
      } catch (error) {
        // Silently fail
      }
    };
  }, [open, customers, customerId]);

  const fetchCustomers = async () => {
    setLoadingCustomers(true);
    try {
      const response = await axios.get('/customers');
      setCustomers(response.data.data || response.data || []);
    } catch (error) {
      console.error('Error fetching customers:', error);
      toast.error('Failed to load customers');
    } finally {
      setLoadingCustomers(false);
    }
  };

  const fetchTicketStatuses = async () => {
    setLoadingStatuses(true);
    try {
      const response = await axios.get('/ticket-statuses');
      const statuses = response.data || [];
      setTicketStatuses(statuses);
      // Set default status to first status if available
      if (statuses.length > 0 && !formData.status) {
        setFormData(prev => ({ ...prev, status: statuses[0].id }));
      }
    } catch (error) {
      console.error('Error fetching ticket statuses:', error);
      toast.error('Failed to load ticket statuses');
    } finally {
      setLoadingStatuses(false);
    }
  };

  const fetchPriorities = async () => {
    setLoadingPriorities(true);
    try {
      const response = await axios.get('/priorities');
      const prioritiesData = response.data || [];
      setPriorities(prioritiesData);
      // Set default priority to first priority if available
      if (prioritiesData.length > 0 && !formData.priority) {
        setFormData(prev => ({ ...prev, priority: prioritiesData[0].id }));
      }
    } catch (error) {
      console.error('Error fetching priorities:', error);
      toast.error('Failed to load priorities');
    } finally {
      setLoadingPriorities(false);
    }
  };

  const fetchAdditionalFields = async () => {
    try {
      const response = await axios.get('/additional-fields');
      console.log('Additional fields fetched:', response.data);
      setAdditionalFields(response.data || []);
    } catch (error) {
      console.error('Error fetching additional fields:', error);
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

  const fetchTicketLabels = async () => {
    try {
      const response = await axios.get('/ticket-labels-management');
      setTicketLabels(response.data || []);
    } catch (error) {
      console.error('Error fetching ticket labels:', error);
    }
  };

  const fetchAgentUsers = async () => {
    try {
      const response = await axios.get('/agent-users');
      const users = response.data || [];
      setAllUsers(users);
      setAgentUsers(users);
    } catch (error) {
      console.error('Error fetching agent users:', error);
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

  const handleFormChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // When branch is changed, filter users by selected branch for all users
    if (field === 'branch_id') {
      if (value && value !== '') {
        // Filter users by selected branch
        const branchId = parseInt(value);
        const filteredUsers = allUsers.filter((u: User) => u.branch_id === branchId);

        // Show filtered users if any exist, otherwise keep showing all users
        setAgentUsers(filteredUsers.length > 0 ? filteredUsers : allUsers);

        // Clear selected agents/notify users if they're not in the new branch
        if (filteredUsers.length > 0) {
          setSelectedAgents(prev => prev.filter(id => filteredUsers.some(u => u.id === id)));
          setSelectedNotifyUsers(prev => prev.filter(id => filteredUsers.some(u => u.id === id)));
        }
      } else {
        // If no branch selected, show all users
        setAgentUsers(allUsers);
      }
    }
  };

  const handleAdditionalFieldChange = (fieldId: number, value: string) => {
    setAdditionalFieldValues(prev => ({ ...prev, [fieldId]: value }));
  };

  const handleLabelChange = (labelId: number) => {
    setSelectedLabels(prev => {
      if (prev.includes(labelId)) {
        return prev.filter(id => id !== labelId);
      } else {
        return [...prev, labelId];
      }
    });
  };

  const handleAgentChange = (agentId: number) => {
    setSelectedAgents(prev => {
      if (prev.includes(agentId)) {
        return prev.filter(id => id !== agentId);
      } else {
        return [...prev, agentId];
      }
    });
  };

  const handleNotifyUserChange = (userId: number) => {
    setSelectedNotifyUsers(prev => {
      if (prev.includes(userId)) {
        return prev.filter(id => id !== userId);
      } else {
        return [...prev, userId];
      }
    });
  };

  const handleAccessoryChange = (accessoryId: number) => {
    setSelectedAccessories(prev => {
      if (prev.includes(accessoryId)) {
        return prev.filter(id => id !== accessoryId);
      } else {
        return [...prev, accessoryId];
      }
    });
  };

  const handleCustomerAdded = (newCustomer: Customer) => {
    // Add the new customer to the customers list
    setCustomers(prev => [...prev, newCustomer]);
    // Select the new customer
    setFormData(prev => ({ ...prev, customer_id: newCustomer.id }));

    // Destroy and reinitialize Select2 with new customer
    if (customerSelectRef.current) {
      const $select = $(customerSelectRef.current);
      if ($select.data('select2')) {
        // Destroy existing Select2
        $select.select2('destroy');
      }
    }

    // Close the add customer modal
    setShowAddCustomerModal(false);
  };

  const handleSubmit = async () => {
    // Validate required fields
    if (!formData.customer_id) {
      toast.error('Please select a customer');
      return;
    }
    if (!formData.issue) {
      toast.error('Please enter an issue title');
      return;
    }
    if (!formData.status) {
      toast.error('Please select a status');
      return;
    }
    if (!formData.priority) {
      toast.error('Please select a priority');
      return;
    }
    if (!formData.due_date) {
      toast.error('Please select a due date');
      return;
    }
    if (!formData.closed_time) {
      toast.error('Please select a time');
      return;
    }
    if (selectedAgents.length === 0) {
      toast.error('Please assign at least one agent');
      return;
    }
    if (selectedNotifyUsers.length === 0) {
      toast.error('Please select at least one user to notify');
      return;
    }
    if (!formData.branch_id) {
      toast.error('Please select a branch');
      return;
    }

    setLoading(true);
    try {
      // Prepare ticket data with assigned users, notify users, and accessories
      const ticketData = {
        ...formData,
        assigned_users: selectedAgents,
        notify_users: selectedNotifyUsers,
        accessories: selectedAccessories
      };
      
      const response = await axios.post('/tickets', ticketData);
      const ticketId = response.data.id;
      
      // Save additional field values if any
      if (Object.keys(additionalFieldValues).length > 0) {
        for (const [fieldId, value] of Object.entries(additionalFieldValues)) {
          if (value) {
            try {
              await axios.post(`/tickets/${ticketId}/additional-fields`, {
                additional_field_id: parseInt(fieldId),
                user_input: value
              });
            } catch (fieldError) {
              console.error(`Error saving additional field ${fieldId}:`, fieldError);
            }
          }
        }
      }
      
      // Save selected labels to label_ticket table
      if (selectedLabels.length > 0) {
        for (const labelId of selectedLabels) {
          try {
            await axios.post(`/tickets/${ticketId}/labels`, {
              label_id: labelId
            });
          } catch (labelError) {
            console.error(`Error saving label ${labelId}:`, labelError);
          }
        }
      }
      
      toast.success('Ticket created successfully');
      
      // Reset form
      setFormData({
        customer_id: customerId || undefined,
        issue: '',
        description: '',
        status: 1,
        priority: 1,
        due_date: '',
        branch_id: '',
        ticket_type: '',
        closed_time: '',
      });
      setAdditionalFieldValues({});
      setSelectedLabels([]);
      setSelectedAgents([]);
      setSelectedNotifyUsers([]);
      
      onOpenChange(false);
      if (onTicketCreated) {
        onTicketCreated();
      }
    } catch (error: any) {
      console.error('Error creating ticket:', error);
      toast.error(error.response?.data?.message || 'Failed to create ticket');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    // Reset form when closing
    setFormData({
      customer_id: customerId || undefined,
      issue: '',
      description: '',
      status: 1,
      priority: 1,
      due_date: '',
      branch_id: '',
      ticket_type: '',
      closed_time: '',
    });
    setAdditionalFieldValues({});
    setSelectedLabels([]);
    setSelectedAgents([]);
    setSelectedNotifyUsers([]);
    // Reset users to show all when modal reopens
    setAgentUsers(allUsers);
  };

  return (
    <>
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="dialog-content sm:max-w-[600px] max-h-[85vh] h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>Add New Ticket</DialogTitle>
          <DialogDescription>
            Create a new support ticket
          </DialogDescription>
        </DialogHeader>

        <div 
          className="flex-1 overflow-y-auto px-6 py-4 custom-scrollbar" 
          style={{ 
            maxHeight: 'calc(85vh - 180px)',
            overflowY: 'auto',
            scrollbarWidth: 'thin',
            scrollbarColor: '#888 #f1f1f1'
          }}
        >
          <div className="grid gap-4">
          {/* Customer Selection */}
          <div className="grid gap-2">
            <Label htmlFor="customer">Customer <span className="text-red-500">*</span></Label>
            <div className="flex gap-2">
              {customerId ? (
                <Input
                  id="customer"
                  value={customerName || 'Selected Customer'}
                  disabled
                  className="bg-gray-50 flex-1"
                />
              ) : (
                <>
                  <div className="flex-1">
                    <select
                      ref={customerSelectRef}
                      id="customer"
                      className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm"
                      value={formData.customer_id || ''}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value) {
                          handleFormChange('customer_id', parseInt(value));
                        } else {
                          handleFormChange('customer_id', undefined);
                        }
                      }}
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
                  <Button
                    type="button"
                    size="icon"
                    variant="outline"
                    onClick={() => setShowAddCustomerModal(true)}
                    className="px-3"
                    title="Add new customer"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Issue Title */}
          <div className="grid gap-2">
            <Label htmlFor="issue">Issue <span className="text-red-500">*</span></Label>
            <Input
              id="issue"
              value={formData.issue}
              onChange={(e) => handleFormChange('issue', e.target.value)}
              placeholder="Enter issue title"
              required
            />
          </div>

          {/* Description */}
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleFormChange('description', e.target.value)}
              placeholder="Describe the issue in detail"
              rows={4}
            />
          </div>

          {/* Status and Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="status">Status <span className="text-red-500">*</span></Label>
              <Select
                value={formData.status?.toString() || ''}
                onValueChange={(value) => handleFormChange('status', parseInt(value))}
                disabled={loadingStatuses}
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder={loadingStatuses ? "Loading..." : "Select status"} />
                </SelectTrigger>
                <SelectContent>
                  {loadingStatuses ? (
                    <SelectItem value="loading" disabled>
                      Loading statuses...
                    </SelectItem>
                  ) : ticketStatuses.length === 0 ? (
                    <SelectItem value="no-statuses" disabled>
                      No statuses available
                    </SelectItem>
                  ) : (
                    ticketStatuses.map((status) => (
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
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="priority">Priority <span className="text-red-500">*</span></Label>
              <Select
                value={formData.priority?.toString() || ''}
                onValueChange={(value) => handleFormChange('priority', parseInt(value))}
                disabled={loadingPriorities}
              >
                <SelectTrigger id="priority">
                  <SelectValue placeholder={loadingPriorities ? "Loading..." : "Select priority"} />
                </SelectTrigger>
                <SelectContent>
                  {loadingPriorities ? (
                    <SelectItem value="loading" disabled>
                      Loading priorities...
                    </SelectItem>
                  ) : priorities.length === 0 ? (
                    <SelectItem value="no-priorities" disabled>
                      No priorities available
                    </SelectItem>
                  ) : (
                    priorities.map((priority) => (
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
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Due Date and Closed Time */}
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="due_date">Due Date <span className="text-red-500">*</span></Label>
              <Input
                id="due_date"
                type="date"
                value={formData.due_date}
                onChange={(e) => handleFormChange('due_date', e.target.value)}
                placeholder="dd/mm/yyyy"
                required
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="closed_time">Time <span className="text-red-500">*</span></Label>
              <Input
                id="closed_time"
                type="time"
                value={formData.closed_time}
                onChange={(e) => handleFormChange('closed_time', e.target.value)}
                required
              />
            </div>
          </div>

          {/* Branch and Ticket Type - For Admin users, Branch filters Assigned To and Notify To */}
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="branch">Branch <span className="text-red-500">*</span></Label>
              <Select
                value={formData.branch_id?.toString() || ''}
                onValueChange={(value) => handleFormChange('branch_id', value)}
              >
                <SelectTrigger id="branch">
                  <SelectValue placeholder="Select a branch" />
                </SelectTrigger>
                <SelectContent>
                  {branches.length === 0 ? (
                    <SelectItem value="no-branches" disabled>
                      No branches available
                    </SelectItem>
                  ) : (
                    branches.map((branch) => (
                      <SelectItem key={branch.id} value={branch.id.toString()}>
                        {branch.branch_name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {/*formData.branch_id && (
                <p className="text-xs text-gray-500">Filters users below</p>
              )*/}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="ticket_type">Ticket Type <span className="text-red-500">*</span></Label>
              <Select
                value={formData.ticket_type}
                onValueChange={(value) => handleFormChange('ticket_type', value)}
              >
                <SelectTrigger id="ticket_type">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="In Shop">In Shop</SelectItem>
                  <SelectItem value="On Site">On Site</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Assigned To and Notify To Dropdowns */}
          <div className="grid grid-cols-2 gap-4">
            {/* Assigned To Multi-select Dropdown */}
            <div className="grid gap-2">
              <Label htmlFor="assigned-to">Assigned To <span className="text-red-500">*</span></Label>
              <div className="relative">
                <button
                  type="button"
                  className="w-full flex items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 min-h-[38px]"
                  onClick={() => setShowAgentsDropdown(!showAgentsDropdown)}
                >
                  <div className="flex-1 text-left">
                    {selectedAgents.length === 0 ? (
                      <span className="text-gray-500">Select agents...</span>
                    ) : (
                      <div className="flex flex-wrap gap-1">
                        {selectedAgents.map(agentId => {
                          const agent = agentUsers.find(u => u.id === agentId);
                          return agent ? (
                            <span key={agentId} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-blue-100">
                              {agent.name}
                            </span>
                          ) : null;
                        })}
                      </div>
                    )}
                  </div>
                  <svg className="h-5 w-5 text-gray-400 flex-shrink-0 ml-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
                
                {showAgentsDropdown && (
                  <div ref={agentsDropdownRef} className="absolute z-10 mt-1 w-full rounded-md bg-white shadow-lg">
                    <div className="max-h-48 overflow-y-auto rounded-md border border-gray-200">
                      {agentUsers.length === 0 ? (
                        <div className="px-3 py-2 text-sm text-gray-500">No agents available</div>
                      ) : (
                        <div className="py-1">
                          {agentUsers.map((user) => (
                            <div
                              key={user.id}
                              className="flex items-center px-3 py-2 hover:bg-gray-100 cursor-pointer"
                              onClick={() => handleAgentChange(user.id)}
                            >
                              <input
                                type="checkbox"
                                checked={selectedAgents.includes(user.id)}
                                onChange={() => {}}
                                className="mr-2 rounded border-gray-300"
                              />
                              <span className="text-sm">{user.name}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Notify To Multi-select Dropdown */}
            <div className="grid gap-2">
              <Label htmlFor="notify-to">Notify To <span className="text-red-500">*</span></Label>
              <div className="relative">
                <button
                  type="button"
                  className="w-full flex items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 min-h-[38px]"
                  onClick={() => setShowNotifyDropdown(!showNotifyDropdown)}
                >
                  <div className="flex-1 text-left">
                    {selectedNotifyUsers.length === 0 ? (
                      <span className="text-gray-500">Select users...</span>
                    ) : (
                      <div className="flex flex-wrap gap-1">
                        {selectedNotifyUsers.map(userId => {
                          const user = agentUsers.find(u => u.id === userId);
                          return user ? (
                            <span key={userId} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-green-100">
                              {user.name}
                            </span>
                          ) : null;
                        })}
                      </div>
                    )}
                  </div>
                  <svg className="h-5 w-5 text-gray-400 flex-shrink-0 ml-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
                
                {showNotifyDropdown && (
                  <div ref={notifyDropdownRef} className="absolute z-10 mt-1 w-full rounded-md bg-white shadow-lg">
                    <div className="max-h-48 overflow-y-auto rounded-md border border-gray-200">
                      {agentUsers.length === 0 ? (
                        <div className="px-3 py-2 text-sm text-gray-500">No users available</div>
                      ) : (
                        <div className="py-1">
                          {agentUsers.map((user) => (
                            <div
                              key={user.id}
                              className="flex items-center px-3 py-2 hover:bg-gray-100 cursor-pointer"
                              onClick={() => handleNotifyUserChange(user.id)}
                            >
                              <input
                                type="checkbox"
                                checked={selectedNotifyUsers.includes(user.id)}
                                onChange={() => {}}
                                className="mr-2 rounded border-gray-300"
                              />
                              <span className="text-sm">{user.name}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Ticket Labels Multi-select Dropdown */}
          <div className="grid gap-2">
            <Label htmlFor="ticket-labels">Ticket Labels</Label>
            <div className="relative">
              <button
                type="button"
                className="w-full flex items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 min-h-[38px]"
                onClick={() => setShowLabelsDropdown(!showLabelsDropdown)}
              >
                <div className="flex-1 text-left">
                  {selectedLabels.length === 0 ? (
                    <span className="text-gray-500">Select labels...</span>
                  ) : (
                    <div className="flex flex-wrap gap-1">
                      {selectedLabels.map(labelId => {
                        const label = ticketLabels.find(l => l.id === labelId);
                        return label ? (
                          <span key={labelId} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-gray-100">
                            {label.color && (
                              <span 
                                className="w-2 h-2 rounded-full" 
                                style={{ backgroundColor: label.color }}
                              />
                            )}
                            {label.label_name}
                          </span>
                        ) : null;
                      })}
                    </div>
                  )}
                </div>
                <svg className="h-5 w-5 text-gray-400 flex-shrink-0 ml-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
              
              {showLabelsDropdown && (
                <div ref={labelsDropdownRef} className="absolute z-10 mt-1 w-full rounded-md bg-white shadow-lg">
                  <div className="max-h-48 overflow-y-auto rounded-md border border-gray-200">
                    {ticketLabels.length === 0 ? (
                      <div className="px-3 py-2 text-sm text-gray-500">No labels available</div>
                    ) : (
                      <div className="py-1">
                        {ticketLabels.map((label) => (
                          <div
                            key={label.id}
                            className="flex items-center px-3 py-2 hover:bg-gray-100 cursor-pointer"
                            onClick={() => handleLabelChange(label.id)}
                          >
                            <input
                              type="checkbox"
                              checked={selectedLabels.includes(label.id)}
                              onChange={() => {}}
                              className="mr-2 rounded border-gray-300"
                            />
                            <div className="flex items-center gap-2 flex-1">
                              {label.color && (
                                <span 
                                  className="w-3 h-3 rounded-full flex-shrink-0" 
                                  style={{ backgroundColor: label.color }}
                                />
                              )}
                              <span className="text-sm">{label.label_name}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Accessories Multi-select Dropdown */}
          <div className="grid gap-2">
            <Label htmlFor="accessories">Accessories</Label>
            <div className="relative">
              <button
                type="button"
                className="w-full flex items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 min-h-[38px]"
                onClick={() => setShowAccessoriesDropdown(!showAccessoriesDropdown)}
              >
                <div className="flex-1 text-left">
                  {selectedAccessories.length === 0 ? (
                    <span className="text-gray-500">Select accessories...</span>
                  ) : (
                    <div className="flex flex-wrap gap-1">
                      {selectedAccessories.map(accessoryId => {
                        const accessory = accessories.find(a => a.id === accessoryId);
                        return accessory ? (
                          <span key={accessoryId} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-blue-100 text-blue-800">
                            {accessory.name}
                          </span>
                        ) : null;
                      })}
                    </div>
                  )}
                </div>
                <svg className="h-5 w-5 text-gray-400 flex-shrink-0 ml-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
              
              {showAccessoriesDropdown && (
                <div ref={accessoriesDropdownRef} className="absolute z-10 mt-1 w-full rounded-md bg-white shadow-lg">
                  <div className="max-h-48 overflow-y-auto rounded-md border border-gray-200">
                    {accessories.length === 0 ? (
                      <div className="px-3 py-2 text-sm text-gray-500">No accessories available</div>
                    ) : (
                      <div className="py-1">
                        {accessories.map((accessory) => (
                          <div
                            key={accessory.id}
                            className="flex items-center px-3 py-2 hover:bg-gray-100 cursor-pointer"
                            onClick={() => handleAccessoryChange(accessory.id)}
                          >
                            <input
                              type="checkbox"
                              checked={selectedAccessories.includes(accessory.id)}
                              onChange={() => {}}
                              className="mr-2 rounded border-gray-300"
                            />
                            <span className="text-sm">{accessory.name}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Dynamic Additional Fields - Right after Ticket Type */}
          <div className="space-y-3">
            {additionalFields.length > 0 ? (
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Additional Fields</h4>
                {additionalFields.map((field, index) => (
                <div key={field.id} className="grid gap-2" style={{ marginTop: index === 0 ? '0' : '10px' }}>
                  <Label htmlFor={`field-${field.id}`}>
                    {field.title}
                    {field.mandatory === 1 && <span className="text-red-500 ml-1">*</span>}
                  </Label>
                  {field.type === 'select' ? (
                    <Select
                      value={additionalFieldValues[field.id] || ''}
                      onValueChange={(value) => handleAdditionalFieldChange(field.id, value)}
                    >
                      <SelectTrigger id={`field-${field.id}`}>
                        <SelectValue placeholder={`Select ${field.title}...`} />
                      </SelectTrigger>
                      <SelectContent>
                        {field.value && Array.isArray(field.value) && field.value.map((option) => (
                          <SelectItem key={option.id} value={option.id.toString()}>
                            {option.value}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : field.type === 'text' ? (
                    <Input
                      id={`field-${field.id}`}
                      type="text"
                      value={additionalFieldValues[field.id] || ''}
                      onChange={(e) => handleAdditionalFieldChange(field.id, e.target.value)}
                      placeholder={`Enter ${field.title}...`}
                    />
                  ) : field.type === 'date' ? (
                    <Input
                      id={`field-${field.id}`}
                      type="date"
                      value={additionalFieldValues[field.id] || ''}
                      onChange={(e) => handleAdditionalFieldChange(field.id, e.target.value)}
                    />
                  ) : null}
                </div>
              ))}
              </div>
            ) : (
              <div className="text-sm text-gray-500 italic">
                {console.log('No additional fields configured in the system')}
                {/* No additional fields configured */}
              </div>
            )}
          </div>

          </div>
        </div>

        <DialogFooter className="flex-shrink-0 px-6 py-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={loading || !formData.issue || !formData.customer_id}
            className="bg-black hover:bg-gray-800 text-white"
          >
            {loading ? 'Creating...' : 'Create Ticket'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    {/* Add Customer Modal */}
    <AddCustomerModal
      open={showAddCustomerModal}
      onOpenChange={setShowAddCustomerModal}
      onCustomerAdded={handleCustomerAdded}
    />
    </>
  );
}