import React, { useState, useEffect, useMemo } from 'react';
import { X, Edit, Trash2, User, Phone, Mail, Calendar, Clock, Building, Tag, PlusCircle, MessageSquare, Paperclip, Download, FileText, Package } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Label } from './ui/label';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from './ui/alert-dialog';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { AddInvoiceModal } from './AddInvoiceModal';
import { useAuth } from '@/contexts/AuthContext';

interface TicketDetailsModalProps {
  ticket: any;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

interface SelectedUser {
  id: number;
  name: string;
}

interface SelectedLabel {
  id: number;
  label: string;
  color: string;
}

interface LogNote {
  id: number;
  agent_id: number;
  ticket_id: number;
  type_id: number;
  outcome_id?: number;
  time?: string;
  description: string;
  log?: string;
  file_type?: string;
  created_at: string;
  user?: {
    id: number;
    name: string;
  };
}

interface CustomerNote {
  id: number;
  ticket_id: number;
  note: string;
  created_at: string;
  updated_at: string;
  user?: {
    id: number;
    name: string;
  };
}

interface Task {
  id: number;
  task_name: string;
  user_id: number;
  ticket_id: number;
  type_id?: number;
  time?: string;
  description?: string;
  category_id?: number;
  status?: string;
  closed_time?: string;
  closed_by?: number;
  closing_comment?: string;
  created_at: string;
  updated_at: string;
  user?: {
    id: number;
    name: string;
  };
  category?: any;
  type?: any;
  assigned_agents?: Array<{
    id: number;
    name: string;
  }>;
}

interface Attachment {
  id: number;
  ticket_id: number;
  name: string;
  file_path: string;
  file_size?: number;
  created_at: string;
  updated_at: string;
}

interface Product {
  id: number;
  name: string;
  cost?: number;
}

interface SparePart {
  id: number;
  ticket_id: number;
  product_id: number;
  quantity: number;
  price: number;
  total_price: number;
  created_at: string;
  updated_at: string;
  product?: Product;
}

export const TicketDetailsModal: React.FC<TicketDetailsModalProps> = ({
  ticket,
  isOpen,
  onClose,
  onUpdate
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [notifyUsers, setNotifyUsers] = useState<any[]>([]);
  const [allNotifyUsers, setAllNotifyUsers] = useState<any[]>([]);
  const [selectedAssignees, setSelectedAssignees] = useState<SelectedUser[]>([]);
  const [selectedNotifyUsers, setSelectedNotifyUsers] = useState<SelectedUser[]>([]);
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('');
  const [branch, setBranch] = useState('');
  const [ticketStatuses, setTicketStatuses] = useState([]);
  const [priorities, setPriorities] = useState([]);
  const [branches, setBranches] = useState([]);
  const [ticketLabels, setTicketLabels] = useState([]);
  const [selectedLabels, setSelectedLabels] = useState<SelectedLabel[]>([]);
  const [accessories, setAccessories] = useState<Array<{id: number; name: string}>>([]);
  const [selectedAccessories, setSelectedAccessories] = useState<Array<{id: number; name: string}>>([]);
  const [currentTicket, setCurrentTicket] = useState(ticket || { activity: [] });
  const [logNotes, setLogNotes] = useState<LogNote[]>([]);
  const [newNote, setNewNote] = useState('');
  const [isLoadingNotes, setIsLoadingNotes] = useState(false);
  const [showAddNote, setShowAddNote] = useState(false);
  const [customerNotes, setCustomerNotes] = useState<CustomerNote[]>([]);
  const [newCustomerNote, setNewCustomerNote] = useState('');
  const [isLoadingCustomerNotes, setIsLoadingCustomerNotes] = useState(false);
  const [showAddCustomerNote, setShowAddCustomerNote] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskName, setNewTaskName] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [newTaskAssignedTo, setNewTaskAssignedTo] = useState<SelectedUser[]>([]);
  const [newTaskStatus, setNewTaskStatus] = useState('1'); // Default to Open
  const [newTaskDate, setNewTaskDate] = useState('');
  const [newTaskTime, setNewTaskTime] = useState('');
  const [taskUsers, setTaskUsers] = useState([]); // Users with role_id = 2
  const [isLoadingTasks, setIsLoadingTasks] = useState(false);
  const [showAddTask, setShowAddTask] = useState(false);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isLoadingAttachments, setIsLoadingAttachments] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showUploadFile, setShowUploadFile] = useState(false);
  const [spareParts, setSpareParts] = useState<SparePart[]>([]);
  const [isLoadingSpareParts, setIsLoadingSpareParts] = useState(false);
  const [showAddSparePart, setShowAddSparePart] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState('1');
  const [closeConfirmOpen, setCloseConfirmOpen] = useState(false);
  const [pendingCloseStatus, setPendingCloseStatus] = useState<string | null>(null);
  const [completedConfirmOpen, setCompletedConfirmOpen] = useState(false);
  const [pendingCompletedStatus, setPendingCompletedStatus] = useState<string | null>(null);
  const [totalPrice, setTotalPrice] = useState(0);
  const [showEditTicket, setShowEditTicket] = useState(false);
  const [editIssue, setEditIssue] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);
  const [showReopenConfirm, setShowReopenConfirm] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  
  // Additional Fields states
  const [additionalFields, setAdditionalFields] = useState<any[]>([]);
  const [ticketAdditionalFields, setTicketAdditionalFields] = useState<any>({});

  // Function to refresh ticket data
  const refreshTicketData = async () => {
    try {
      const response = await axios.get(`/tickets/${ticket.id}`);
      console.log('Refreshed ticket data:', response.data);
      const updatedTicket = response.data;
      setCurrentTicket(updatedTicket);
      
      // Update all related states with fresh data
      if (updatedTicket.agent && Array.isArray(updatedTicket.agent)) {
        setSelectedAssignees(updatedTicket.agent.map(agent => ({
          id: agent.id,
          name: agent.name
        })));
      }
      
      if (updatedTicket.notify_to && Array.isArray(updatedTicket.notify_to)) {
        setSelectedNotifyUsers(updatedTicket.notify_to.map(user => ({
          id: user.id,
          name: user.name
        })));
      }
      
      // Check multiple possible label field names
      const ticketLabels = updatedTicket.ticket_label || 
                          updatedTicket.ticketLabel || 
                          updatedTicket.ticket_labels || 
                          updatedTicket.labels || 
                          [];
      console.log('Updated ticket labels:', ticketLabels);
      if (ticketLabels && Array.isArray(ticketLabels)) {
        setSelectedLabels(ticketLabels.map(label => ({
          id: label.id,
          label: label.label_name || label.label || label.name || label.title,
          color: label.color || '#5a4b81'
        })));
      }
    } catch (error) {
      console.error('Error refreshing ticket data:', error);
    }
  };

  // Function to fetch log notes
  const fetchLogNotes = async () => {
    if (!ticket?.id) return;
    
    setIsLoadingNotes(true);
    try {
      const response = await axios.get(`/tickets/${ticket.id}/log-notes`);
      console.log('Log notes response:', response.data);
      
      // Ensure we have an array
      const notes = Array.isArray(response.data) ? response.data : 
                    (response.data?.data ? response.data.data : []);
      setLogNotes(notes);
    } catch (error) {
      console.error('Error fetching log notes:', error);
      toast.error('Failed to load log notes');
      setLogNotes([]); // Set empty array on error
    } finally {
      setIsLoadingNotes(false);
    }
  };

  // Function to add a new log note
  const handleAddNote = async () => {
    if (!newNote.trim()) {
      toast.error('Please enter a note');
      return;
    }

    try {
      const response = await axios.post(`/tickets/${ticket.id}/log-notes`, {
        note: newNote,
        type_id: 1
      });
      
      toast.success('Note added successfully');
      setNewNote('');
      setShowAddNote(false);
      
      // Add the new note to the list
      const newLogNote = response.data.logNote || response.data;
      setLogNotes(prevNotes => [newLogNote, ...prevNotes]);
      
      // Refresh ticket data to update activities
      await refreshTicketData();
    } catch (error) {
      console.error('Error adding note:', error);
      console.error('Error response:', error.response);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else if (error.response?.data?.errors) {
        const firstError = Object.values(error.response.data.errors)[0][0];
        toast.error(firstError);
      } else {
        toast.error('Failed to add note');
      }
    }
  };

  // Function to fetch customer notes
  const fetchCustomerNotes = async () => {
    if (!ticket?.id) return;
    
    setIsLoadingCustomerNotes(true);
    try {
      const response = await axios.get(`/tickets/${ticket.id}/customer-notes`);
      console.log('Customer notes response:', response.data);
      
      // Ensure we have an array
      const notes = Array.isArray(response.data) ? response.data : 
                    (response.data?.data ? response.data.data : []);
      setCustomerNotes(notes);
      
      // Scroll to bottom after notes are loaded
      setTimeout(() => {
        const customerNotesContainer = document.querySelector('[data-customer-notes-container]');
        if (customerNotesContainer) {
          customerNotesContainer.scrollTop = customerNotesContainer.scrollHeight;
        }
      }, 100);
    } catch (error) {
      console.error('Error fetching customer notes:', error);
      toast.error('Failed to load customer notes');
      setCustomerNotes([]); // Set empty array on error
    } finally {
      setIsLoadingCustomerNotes(false);
    }
  };

  // Function to add a new customer note
  const handleAddCustomerNote = async () => {
    if (!newCustomerNote.trim()) {
      toast.error('Please enter a customer note');
      return;
    }

    try {
      const response = await axios.post(`/tickets/${ticket.id}/customer-notes`, {
        note: newCustomerNote
      });
      
      toast.success('Customer note added successfully');
      setNewCustomerNote('');
      setShowAddCustomerNote(false);
      
      // Add the new note to the list
      const newNote = response.data.customerNote || response.data;
      setCustomerNotes(prevNotes => [...prevNotes, newNote]);
      
      // Scroll to bottom after adding new note
      setTimeout(() => {
        const customerNotesContainer = document.querySelector('[data-customer-notes-container]');
        if (customerNotesContainer) {
          customerNotesContainer.scrollTop = customerNotesContainer.scrollHeight;
        }
      }, 100);
      
      // Refresh ticket data to update activities
      await refreshTicketData();
    } catch (error) {
      console.error('Error adding customer note:', error);
      console.error('Error response:', error.response);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else if (error.response?.data?.errors) {
        const firstError = Object.values(error.response.data.errors)[0][0];
        toast.error(firstError);
      } else {
        toast.error('Failed to add customer note');
      }
    }
  };

  // Function to fetch tasks
  const fetchTasks = async () => {
    if (!ticket?.id) return;
    
    setIsLoadingTasks(true);
    try {
      const response = await axios.get(`/tickets/${ticket.id}/tasks`);
      console.log('Tasks response:', response.data);
      
      // Ensure we have an array
      const tasksList = Array.isArray(response.data) ? response.data : 
                       (response.data?.data ? response.data.data : []);
      setTasks(tasksList);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast.error('Failed to load tasks');
      setTasks([]); // Set empty array on error
    } finally {
      setIsLoadingTasks(false);
    }
  };

  // Function to add a new task
  const handleAddTask = async () => {
    if (!newTaskName.trim()) {
      toast.error('Please enter a task name');
      return;
    }

    try {
      const taskData = {
        task_name: newTaskName,
        description: newTaskDescription,
        status: parseInt(newTaskStatus),
        time: newTaskDate && newTaskTime ? `${newTaskDate} ${newTaskTime}:00` : null,
        assigned_users: newTaskAssignedTo.map(u => u.id)
      };
      
      const response = await axios.post(`/tickets/${ticket.id}/tasks`, taskData);
      
      toast.success('Task added successfully');
      setNewTaskName('');
      setNewTaskDescription('');
      setNewTaskAssignedTo([]);
      setNewTaskStatus('1');
      setNewTaskDate('');
      setNewTaskTime('');
      setShowAddTask(false);
      
      // Add the new task to the list
      const newTask = response.data.task || response.data;
      setTasks(prevTasks => [newTask, ...prevTasks]);
      
      // Refresh ticket data to update activities
      await refreshTicketData();
    } catch (error) {
      console.error('Error adding task:', error);
      console.error('Error response:', error.response);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else if (error.response?.data?.errors) {
        const firstError = Object.values(error.response.data.errors)[0][0];
        toast.error(firstError);
      } else {
        toast.error('Failed to add task');
      }
    }
  };

  // Function to fetch attachments
  const fetchAttachments = async () => {
    if (!ticket?.id) return;
    
    setIsLoadingAttachments(true);
    try {
      const response = await axios.get(`/tickets/${ticket.id}/attachments`);
      console.log('Attachments response:', response.data);
      
      // Ensure we have an array
      const attachmentsList = Array.isArray(response.data) ? response.data : 
                             (response.data?.data ? response.data.data : []);
      setAttachments(attachmentsList);
    } catch (error) {
      console.error('Error fetching attachments:', error);
      toast.error('Failed to load attachments');
      setAttachments([]); // Set empty array on error
    } finally {
      setIsLoadingAttachments(false);
    }
  };

  // Function to upload attachment
  const handleFileUpload = async () => {
    if (!selectedFile) {
      toast.error('Please select a file');
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await axios.post(`/tickets/${ticket.id}/attachments`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      toast.success('File uploaded successfully');
      setSelectedFile(null);
      setShowUploadFile(false);
      
      // Add the new attachment to the list
      const newAttachment = response.data.attachment || response.data;
      setAttachments(prevAttachments => [newAttachment, ...prevAttachments]);
      
      // Clear file input
      const fileInput = document.getElementById('file-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      
      // Refresh ticket data to update activities
      await refreshTicketData();
    } catch (error) {
      console.error('Error uploading file:', error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Failed to upload file');
      }
    } finally {
      setIsUploading(false);
    }
  };

  // Function to format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Function to delete attachment
  const handleDeleteAttachment = async (attachmentId: number) => {
    if (!confirm('Are you sure you want to delete this file?')) {
      return;
    }

    try {
      await axios.delete(`/tickets/${ticket.id}/attachments/${attachmentId}`);
      
      toast.success('File deleted successfully');
      
      // Remove the attachment from the list
      setAttachments(prevAttachments => 
        prevAttachments.filter(attachment => attachment.id !== attachmentId)
      );
      
      // Refresh ticket data to update activities
      await refreshTicketData();
    } catch (error) {
      console.error('Error deleting file:', error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Failed to delete file');
      }
    }
  };

  // Function to fetch products
  const fetchProducts = async () => {
    try {
      const response = await axios.get('/products');
      const productsList = response.data.data || response.data || [];
      setProducts(productsList);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load products');
    }
  };

  // Function to fetch spare parts
  const fetchSpareParts = async () => {
    if (!ticket?.id) return;
    
    setIsLoadingSpareParts(true);
    try {
      const response = await axios.get(`/tickets/${ticket.id}/spare-parts`);
      console.log('Spare parts response:', response.data);
      
      // Ensure we have an array
      const sparePartsList = Array.isArray(response.data) ? response.data : 
                            (response.data?.data ? response.data.data : []);
      setSpareParts(sparePartsList);
    } catch (error) {
      console.error('Error fetching spare parts:', error);
      toast.error('Failed to load spare parts');
      setSpareParts([]); // Set empty array on error
    } finally {
      setIsLoadingSpareParts(false);
    }
  };

  // Function to add spare part
  const handleAddSparePart = async () => {
    if (!selectedProductId || !quantity || parseInt(quantity) <= 0) {
      toast.error('Please select a product and enter valid quantity');
      return;
    }

    try {
      const response = await axios.post(`/tickets/${ticket.id}/spare-parts`, {
        product_id: parseInt(selectedProductId),
        quantity: parseInt(quantity)
      });
      
      toast.success('Spare part added successfully');
      setSelectedProductId('');
      setSelectedProduct(null);
      setQuantity('1');
      setTotalPrice(0);
      setShowAddSparePart(false);
      
      // Add the new spare part to the list
      const newSparePart = response.data.sparePart || response.data;
      setSpareParts(prevParts => [newSparePart, ...prevParts]);
      
      // Refresh ticket data to update activities
      await refreshTicketData();
    } catch (error) {
      console.error('Error adding spare part:', error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Failed to add spare part');
      }
    }
  };

  // Function to delete spare part
  const handleDeleteSparePart = async (sparePartId: number) => {
    if (!confirm('Are you sure you want to remove this spare part?')) {
      return;
    }

    try {
      await axios.delete(`/tickets/${ticket.id}/spare-parts/${sparePartId}`);
      
      toast.success('Spare part removed successfully');
      
      // Remove the spare part from the list
      setSpareParts(prevParts => 
        prevParts.filter(part => part.id !== sparePartId)
      );
      
      // Refresh ticket data to update activities
      await refreshTicketData();
    } catch (error) {
      console.error('Error deleting spare part:', error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Failed to remove spare part');
      }
    }
  };

  // Calculate total price when product or quantity changes
  useEffect(() => {
    if (selectedProduct && quantity) {
      const qty = parseInt(quantity) || 0;
      const cost = selectedProduct.cost || 0;
      setTotalPrice(qty * cost);
    }
  }, [selectedProduct, quantity]);

  // Handle product selection
  const handleProductChange = (productId: string) => {
    setSelectedProductId(productId);
    const product = products.find(p => p.id.toString() === productId);
    setSelectedProduct(product || null);
  };

  // Function to handle ticket edit
  const handleEditTicket = () => {
    setEditIssue(currentTicket?.issue || '');
    setEditDescription(currentTicket?.description || '');
    setShowEditTicket(true);
  };

  // Function to update ticket
  const handleUpdateTicketInfo = async () => {
    if (!editIssue.trim()) {
      toast.error('Please enter ticket issue');
      return;
    }

    try {
      const response = await axios.put(`/tickets/${ticket.id}/update-issue`, {
        issue: editIssue,
        description: editDescription
      });

      toast.success('Ticket updated successfully');
      setShowEditTicket(false);

      // Update current ticket data
      setCurrentTicket({
        ...currentTicket,
        issue: editIssue,
        description: editDescription
      });

      // Call the parent update function
      onUpdate();
    } catch (error) {
      console.error('Error updating ticket:', error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Failed to update ticket');
      }
    }
  };

  const handleDeleteTicket = async () => {
    try {
      await axios.delete(`/tickets/${ticket.id}`);
      toast.success('Ticket deleted successfully');
      setShowDeleteConfirm(false);
      onClose(); // Close the modal
      onUpdate(); // Refresh the parent component
      // Navigate to tickets list
      window.location.href = '/tickets';
    } catch (error) {
      console.error('Error deleting ticket:', error);
      toast.error('Failed to delete ticket');
    }
  };

  const handleCloseTicket = async () => {
    try {
      await axios.put(`/tickets/${ticket.id}`, {
        status: 3 // Closed status
      });
      toast.success('Ticket closed successfully');
      setShowCloseConfirm(false);
      
      // Update current ticket data
      setCurrentTicket({
        ...currentTicket,
        status: 3
      });
      
      // Update the status dropdown value
      setStatus('3');
      
      // Refresh parent component
      onUpdate();
    } catch (error) {
      console.error('Error closing ticket:', error);
      toast.error('Failed to close ticket');
    }
  };

  const handleReopenTicket = async () => {
    try {
      await axios.put(`/tickets/${ticket.id}`, {
        status: 1 // Open status
      });
      toast.success('Ticket re-opened successfully');
      setShowReopenConfirm(false);
      
      // Update current ticket data
      setCurrentTicket({
        ...currentTicket,
        status: 1
      });
      
      // Update the status dropdown value
      setStatus('1');
      
      // Refresh parent component
      onUpdate();
    } catch (error) {
      console.error('Error re-opening ticket:', error);
      toast.error('Failed to re-open ticket');
    }
  };

  useEffect(() => {
    if (isOpen && ticket) {
      console.log('Modal opened with ticket:', ticket);
      setCurrentTicket(ticket);

      // Set the ticket's branch first
      const ticketBranch = ticket.branch_id ? ticket.branch_id.toString() : '';
      setBranch(ticketBranch);

      // Fetch all data
      fetchTicketStatuses();
      fetchPriorities();
      fetchBranches();
      fetchTicketLabels();
      fetchAdditionalFields();
      fetchAccessories();
      fetchTicketAdditionalFields(ticket.id);

      // Fetch users and filter by the ticket's branch
      fetchUsers(ticketBranch);

      // Set other ticket data
      setStatus(ticket.status ? ticket.status.toString() : '1');
      setPriority(ticket.priority ? ticket.priority.toString() : '2');
      // Extract date part from datetime string (YYYY-MM-DD from YYYY-MM-DD HH:MM:SS)
      setDueDate(ticket.due_date ? ticket.due_date.split(' ')[0] : '');
      setDueTime(ticket.closed_time || ticket.due_time || '');
      
      // Set assigned agents from the agent relationship
      if (ticket.agent && Array.isArray(ticket.agent)) {
        setSelectedAssignees(ticket.agent.map(agent => ({
          id: agent.id,
          name: agent.name
        })));
      } else {
        setSelectedAssignees([]);
      }
      
      // Set notify users from the notifyTo relationship
      if (ticket.notify_to && Array.isArray(ticket.notify_to)) {
        setSelectedNotifyUsers(ticket.notify_to.map(user => ({
          id: user.id,
          name: user.name
        })));
      } else {
        setSelectedNotifyUsers([]);
      }
      
      // Set selected labels from the ticketLabel or ticket_label relationship
      console.log('Ticket data for labels:', ticket);
      const ticketLabels = ticket.ticket_label || 
                          ticket.ticketLabel || 
                          ticket.ticket_labels || 
                          ticket.labels || 
                          [];
      console.log('Found ticket labels:', ticketLabels);
      
      if (ticketLabels && Array.isArray(ticketLabels)) {
        setSelectedLabels(ticketLabels.map(label => ({
          id: label.id,
          label: label.label_name || label.label || label.name || label.title,
          color: label.color || '#5a4b81'
        })));
      } else {
        setSelectedLabels([]);
      }
      
      // Set selected accessories from the accessories field
      if (ticket.accessories && Array.isArray(ticket.accessories)) {
        setSelectedAccessories(ticket.accessories.map(accessory => ({
          id: accessory.id,
          name: accessory.name
        })));
      } else {
        setSelectedAccessories([]);
      }
    }
  }, [isOpen, ticket]);

  const fetchUsers = async (initialBranch?: string) => {
    try {
      const response = await axios.get('/agent-users');
      const fetchedUsers = response.data || [];

      // Store all users
      setAllUsers(fetchedUsers);
      setAllNotifyUsers(fetchedUsers);

      // Filter users with role_id === 2 for task assignment
      const roleId2Users = fetchedUsers.filter((user: any) => user.role_id === 2);
      setTaskUsers(roleId2Users);

      // Use the provided branch or the current branch state
      const branchToFilter = initialBranch || branch;

      if (branchToFilter) {
        // Filter users by the branch
        const branchIdNum = parseInt(branchToFilter);
        const filteredUsers = fetchedUsers.filter((u: any) => u.branch_id === branchIdNum);
        const filteredNotifyUsers = fetchedUsers.filter((u: any) => u.branch_id === branchIdNum);

        // Set filtered users
        if (user?.role_id === 1) {
          // Admin users - show filtered or all if no matches
          setUsers(filteredUsers.length > 0 ? filteredUsers : fetchedUsers);
          setNotifyUsers(filteredNotifyUsers.length > 0 ? filteredNotifyUsers : fetchedUsers);
        } else {
          // Non-admin users - always filter by branch
          setUsers(filteredUsers);
          setNotifyUsers(filteredNotifyUsers);
        }
      } else {
        // No branch selected, show all users
        setUsers(fetchedUsers);
        setNotifyUsers(fetchedUsers);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchTicketStatuses = async () => {
    try {
      const response = await axios.get('/ticket-statuses');
      setTicketStatuses(response.data || []);
    } catch (error) {
      console.error('Error fetching ticket statuses:', error);
      // Set default statuses if API fails
      setTicketStatuses([
        { id: 1, status: 'Open' },
        { id: 2, status: 'In Progress' },
        { id: 3, status: 'Resolved' },
        { id: 4, status: 'Closed' }
      ]);
    }
  };

  const fetchPriorities = async () => {
    try {
      const response = await axios.get('/priorities');
      setPriorities(response.data || []);
    } catch (error) {
      console.error('Error fetching priorities:', error);
      // Set default priorities if API fails
      setPriorities([
        { id: 1, title: 'Low' },
        { id: 2, title: 'Medium' },
        { id: 3, title: 'High' }
      ]);
    }
  };

  const fetchBranches = async () => {
    try {
      const response = await axios.get('/branches');
      const branchesData = response.data || [];

      // For non-admin users, filter branches to show only their branch
      if (user?.role_id !== 1 && user?.branch_id) {
        const userBranch = branchesData.filter((b: any) => b.id === user.branch_id);
        setBranches(userBranch);
      } else {
        setBranches(branchesData);
      }
    } catch (error) {
      console.error('Error fetching branches:', error);
    }
  };

  const filterUsersByBranch = (branchId: string) => {
    if (!branchId || branchId === '') {
      // If no branch selected, show all users
      setUsers(allUsers);
      setNotifyUsers(allNotifyUsers);
      return;
    }

    const branchIdNum = parseInt(branchId);

    // Filter users by branch
    const filteredUsers = allUsers.filter((u: any) => u.branch_id === branchIdNum);
    const filteredNotifyUsers = allNotifyUsers.filter((u: any) => u.branch_id === branchIdNum);

    // If admin user, show filtered users or all users if no match
    if (user?.role_id === 1) {
      setUsers(filteredUsers.length > 0 ? filteredUsers : allUsers);
      setNotifyUsers(filteredNotifyUsers.length > 0 ? filteredNotifyUsers : allNotifyUsers);
    } else {
      // For non-admin users, always filter by branch
      setUsers(filteredUsers);
      setNotifyUsers(filteredNotifyUsers);
    }
  };

  const fetchTicketLabels = async () => {
    try {
      // Try the management endpoint first, then fall back to the old endpoint
      let response;
      try {
        response = await axios.get('/ticket-labels-management');
      } catch (err) {
        response = await axios.get('/ticket-labels');
      }
      
      console.log('Ticket labels response:', response.data);
      // Handle both response.data.data and response.data structures
      const labels = response.data?.data || response.data || [];
      console.log('Processed ticket labels:', labels);
      setTicketLabels(labels);
    } catch (error) {
      console.error('Error fetching ticket labels:', error);
      // Set some default labels if the API fails
      setTicketLabels([]);
    }
  };
  
  const fetchAccessories = async () => {
    try {
      const response = await axios.get('/accessories?all=true');
      setAccessories(response.data || []);
    } catch (error) {
      console.error('Error fetching accessories:', error);
      setAccessories([]);
    }
  };
  
  const fetchAdditionalFields = async () => {
    try {
      const response = await axios.get('/additional-fields');
      setAdditionalFields(response.data || []);
    } catch (error) {
      console.error('Error fetching additional fields:', error);
    }
  };
  
  const fetchTicketAdditionalFields = async (ticketId: number) => {
    try {
      const response = await axios.get(`/tickets/${ticketId}/additional-fields`);
      const fieldsData = {};
      if (response.data && Array.isArray(response.data)) {
        response.data.forEach(field => {
          fieldsData[field.additional_field_id] = field.user_input;
        });
      }
      setTicketAdditionalFields(fieldsData);
    } catch (error) {
      console.error('Error fetching ticket additional fields:', error);
    }
  };
  
  const handleAdditionalFieldChange = async (fieldId: number, value: string) => {
    if (!ticket?.id) return;
    
    try {
      await axios.post(`/tickets/${ticket.id}/additional-fields`, {
        additional_field_id: fieldId,
        user_input: value
      });
      
      // Update local state
      setTicketAdditionalFields(prev => ({
        ...prev,
        [fieldId]: value
      }));
      
      toast.success('Field updated successfully');
    } catch (error) {
      console.error('Error updating additional field:', error);
      toast.error('Failed to update field');
    }
  };

  const handleAddAssignee = (userId: string) => {
    const user = users.find(u => u.id.toString() === userId);
    if (user && !selectedAssignees.find(u => u.id === user.id)) {
      setSelectedAssignees([...selectedAssignees, { id: user.id, name: user.name }]);
    }
  };

  const handleRemoveAssignee = async (userId: number) => {
    try {
      // Make API call to remove agent from ticket
      await axios.delete(`/tickets/${ticket.id}/agents/${userId}`);
      
      // Remove from local state
      setSelectedAssignees(selectedAssignees.filter(u => u.id !== userId));
      
      // Refresh ticket data to get updated activities
      await refreshTicketData();
    } catch (error) {
      console.error('Error removing agent:', error);
      toast.error('Failed to remove agent');
    }
  };

  const handleAddNotifyUser = (userId: string) => {
    const user = notifyUsers.find(u => u.id.toString() === userId);
    if (user && !selectedNotifyUsers.find(u => u.id === user.id)) {
      setSelectedNotifyUsers([...selectedNotifyUsers, { id: user.id, name: user.name }]);
    }
  };

  const handleRemoveNotifyUser = async (userId: number) => {
    try {
      // Make API call to remove notify user from ticket
      await axios.delete(`/tickets/${ticket.id}/notify/${userId}`);
      
      // Remove from local state
      setSelectedNotifyUsers(selectedNotifyUsers.filter(u => u.id !== userId));
      
      // Refresh ticket data to get updated activities
      await refreshTicketData();
    } catch (error) {
      console.error('Error removing notify user:', error);
      toast.error('Failed to remove notify user');
    }
  };

  const handleAddLabel = async (labelId: string) => {
    const label = ticketLabels.find(l => l.id.toString() === labelId);
    if (label && !selectedLabels.find(l => l.id === label.id)) {
      const newLabels = [...selectedLabels, { 
        id: label.id, 
        label: label.label_name || label.label || label.name || label.title || 'Label', 
        color: label.color || '#5a4b81' 
      }];
      setSelectedLabels(newLabels);
      
      // Call the update API to add the label
      try {
        const requestData = {
          status: parseInt(status),
          priority: parseInt(priority),
          due_date: dueDate,
          closed_time: dueTime,
          branch_id: branch ? parseInt(branch) : null,
          assigned_users: selectedAssignees.map(u => u.id),
          notify_users: selectedNotifyUsers.map(u => u.id),
          ticket_labels: newLabels.map(l => l.id)
        };
        
        await axios.put(`/tickets/${ticket.id}`, requestData);
        const labelName = label.label_name || label.label || label.name || label.title || 'Label';
        toast.success(`Label "${labelName}" added successfully`);
        
        // Refresh ticket data to get updated activities
        await refreshTicketData();
      } catch (error) {
        console.error('Error adding label:', error);
        // Remove from local state if API call fails
        setSelectedLabels(selectedLabels);
        toast.error('Failed to add label');
      }
    }
  };

  const handleRemoveLabel = async (labelId: number) => {
    try {
      // Make API call to remove label from ticket
      await axios.delete(`/tickets/${ticket.id}/labels/${labelId}`);
      
      // Find the label to show its name in the success message
      const removedLabel = selectedLabels.find(l => l.id === labelId);
      
      // Remove from local state
      setSelectedLabels(selectedLabels.filter(l => l.id !== labelId));
      
      if (removedLabel) {
        toast.success(`Label "${removedLabel.label}" removed successfully`);
      }
      
      // Refresh ticket data to get updated activities
      await refreshTicketData();
    } catch (error) {
      console.error('Error removing label:', error);
      toast.error('Failed to remove label');
    }
  };

  const handleAddAccessory = async (accessoryId: string) => {
    const accessory = accessories.find(a => a.id.toString() === accessoryId);
    if (accessory && !selectedAccessories.find(a => a.id === accessory.id)) {
      const newAccessories = [...selectedAccessories, { 
        id: accessory.id, 
        name: accessory.name
      }];
      setSelectedAccessories(newAccessories);
      
      // Call the update API to add the accessory
      try {
        const requestData = {
          status: parseInt(status),
          priority: parseInt(priority),
          due_date: dueDate,
          closed_time: dueTime,
          branch_id: branch ? parseInt(branch) : null,
          assigned_users: selectedAssignees.map(u => u.id),
          notify_users: selectedNotifyUsers.map(u => u.id),
          accessories: newAccessories.map(a => a.id)
        };
        
        await axios.put(`/tickets/${ticket.id}`, requestData);
        toast.success(`Accessory "${accessory.name}" added successfully`);
        
        // Refresh ticket data to get updated activities
        await refreshTicketData();
      } catch (error) {
        console.error('Error adding accessory:', error);
        // Remove from local state if API call fails
        setSelectedAccessories(selectedAccessories);
        toast.error('Failed to add accessory');
      }
    }
  };

  const handleRemoveAccessory = async (accessoryId: number) => {
    try {
      // Find the accessory to show its name in the success message
      const removedAccessory = selectedAccessories.find(a => a.id === accessoryId);
      
      // Remove from local state
      const newAccessories = selectedAccessories.filter(a => a.id !== accessoryId);
      setSelectedAccessories(newAccessories);
      
      // Call the update API to remove the accessory
      const requestData = {
        status: parseInt(status),
        priority: parseInt(priority),
        due_date: dueDate,
        closed_time: dueTime,
        branch_id: branch ? parseInt(branch) : null,
        assigned_users: selectedAssignees.map(u => u.id),
        notify_users: selectedNotifyUsers.map(u => u.id),
        accessories: newAccessories.map(a => a.id)
      };
      
      await axios.put(`/tickets/${ticket.id}`, requestData);
      
      if (removedAccessory) {
        toast.success(`Accessory "${removedAccessory.name}" removed successfully`);
      }
      
      // Refresh ticket data to get updated activities
      await refreshTicketData();
    } catch (error) {
      console.error('Error removing accessory:', error);
      toast.error('Failed to remove accessory');
    }
  };

  const handleUpdateTicket = async (options?: { newStatus?: string; newPriority?: string; newBranch?: string }) => {
    try {
      const currentStatus = currentTicket?.status;
      const currentPriority = currentTicket?.priority;
      
      const requestData = {
        status: parseInt(options?.newStatus || status),
        priority: parseInt(options?.newPriority || priority),
        due_date: dueDate,
        closed_time: dueTime,
        branch_id: branch ? parseInt(branch) : null,
        assigned_users: selectedAssignees.map(u => u.id),
        notify_users: selectedNotifyUsers.map(u => u.id),
        ticket_labels: selectedLabels.map(l => l.id),
        accessories: selectedAccessories.map(a => a.id)
      };
      
      console.log('Updating ticket with data:', requestData);
      
      const response = await axios.put(`/tickets/${ticket.id}`, requestData);
      
      // Check what was changed and show appropriate message
      if (options?.newStatus && currentStatus !== parseInt(options.newStatus)) {
        const statusName = ticketStatuses.find(s => s.id === parseInt(options.newStatus))?.status || 'Unknown';
        toast.success(`Ticket status updated to ${statusName}`);
      } else if (options?.newPriority && currentPriority !== parseInt(options.newPriority)) {
        const priorityName = priorities.find(p => p.id === parseInt(options.newPriority))?.title || 'Unknown';
        toast.success(`Ticket priority updated to ${priorityName}`);
      } else if (options?.newBranch) {
        const branchName = branches.find(b => b.id === parseInt(options.newBranch))?.branch || 'Unknown';
        toast.success(`Ticket branch updated to ${branchName}`);
      } else {
        toast.success('Ticket updated successfully');
      }
      
      // Refresh ticket data to get updated activities
      await refreshTicketData();
      
      // Don't close modal or refresh list - just update was successful
    } catch (error) {
      console.error('Error updating ticket:', error);
      console.error('Error response:', error.response?.data);
      toast.error(error.response?.data?.message || 'Failed to update ticket. Please try again.');
    }
  };

  const handleConfirmClose = async () => {
    if (!pendingCloseStatus) return;

    try {
      setStatus(pendingCloseStatus);
      await handleUpdateTicket({ newStatus: pendingCloseStatus });
      setCloseConfirmOpen(false);
      setPendingCloseStatus(null);
    } catch (error) {
      console.error('Error closing ticket:', error);
      toast.error('Failed to close ticket');
    }
  };

  const handleConfirmCompleted = async () => {
    if (!pendingCompletedStatus) return;

    try {
      setStatus(pendingCompletedStatus);
      await handleUpdateTicket({ newStatus: pendingCompletedStatus });
      setCompletedConfirmOpen(false);
      setPendingCompletedStatus(null);
    } catch (error) {
      console.error('Error completing ticket:', error);
      toast.error('Failed to complete ticket');
    }
  };

  if (!ticket) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="max-w-[95vw] sm:max-w-[90vw] w-full sm:w-[1400px] h-[100vh] sm:h-[90vh] p-0 overflow-hidden [&>button]:hidden"
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        <DialogTitle className="sr-only">Ticket Details</DialogTitle>
        {/* Header */}
        <div className="bg-black text-white h-[45px] sm:h-[50px] flex items-center justify-between px-4 sm:px-6">
          <h2 className="text-sm sm:text-base font-normal">TICKET DETAILS</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-white hover:bg-white/20 h-7 w-7 sm:h-8 sm:w-8"
          >
            <X className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex flex-col sm:flex-row h-[calc(100%-45px)] sm:h-[calc(100%-50px)] bg-gray-50 overflow-y-auto sm:overflow-y-hidden">
          {/* Left Column - Mobile: Full width, Desktop: 30% */}
          <div className="w-full sm:w-[30%] sm:min-w-[300px] bg-white sm:border-r border-b sm:border-b-0 border-[#e4e4e4] flex flex-col" style={{ minHeight: 'auto', height: 'auto', maxHeight: '100%' }}>
            <div className="flex-1 overflow-y-auto p-3 sm:p-4 custom-scrollbar">
            {/* Ticket Header */}
            <div className="mb-3 sm:mb-4">
              <h3 className="text-base sm:text-lg font-semibold text-gray-800">
                #{currentTicket?.tracking_number || currentTicket?.id}- {currentTicket?.issue || 'This is new issue-7777'}
              </h3>
            </div>

            {/* Description with action buttons */}
            <div className="mb-3 sm:mb-4">
              <p className="text-xs sm:text-sm text-gray-600 mb-2">
                {currentTicket?.description || 'This is testing new tickets 7777'}
              </p>
              <div className="flex gap-2 items-center justify-end flex-wrap">
                <Button variant="ghost"  className="p-0" style={{ width: '25px', height: '25px' }} onClick={handleEditTicket}>
                  <Edit style={{ width: '20px', height: '20px' }} />
                </Button>
                <Button variant="ghost" className="p-0" style={{ width: '25px', height: '25px' }} onClick={() => setShowDeleteConfirm(true)}>
                  <Trash2 style={{ width: '20px', height: '20px' }} />
                </Button>
                {currentTicket?.status === 3 ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-green-600 border-green-600 hover:bg-green-50 h-7 ml-2"
                    onClick={() => setShowReopenConfirm(true)}
                  >
                    Re-open Ticket
                  </Button>
                ) : (
                  user?.role_id !== 2 && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 border-red-600 hover:bg-red-50 h-7 ml-2"
                      onClick={() => setShowCloseConfirm(true)}
                    >
                      Close Ticket
                    </Button>
                  )
                )}
              </div>
            </div>

            {/* Edit Ticket Form */}
            {showEditTicket && (
              <div 
                className="p-4 rounded-lg border border-gray-200 mb-4"
                style={{ 
                  position: 'fixed', 
                  left: '200px', 
                  width: '400px', 
                  zIndex: 9999999, 
                  top: '154px',
                  backgroundColor: '#e4e4e4'
                }}
              >
                <h3 className="text-lg font-semibold mb-4">Edit</h3>
                <div className="space-y-3">
                  <div>
                    <Label className="text-xs font-medium mb-1">Ticket Issue *</Label>
                    <Input
                      value={editIssue}
                      onChange={(e) => setEditIssue(e.target.value)}
                      placeholder="Enter ticket issue..."
                    />
                  </div>
                  
                  <div>
                    <Label className="text-xs font-medium mb-1">Description</Label>
                    <Textarea
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      placeholder="Enter description..."
                      rows={3}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2" style={{ marginTop: '15px' }}>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setShowEditTicket(false);
                      setEditIssue('');
                      setEditDescription('');
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    variant="default"
                    onClick={handleUpdateTicketInfo}
                  >
                    Update Ticket
                  </Button>
                </div>
              </div>
            )}

            {/* Customer Info */}
            <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="h-7 w-7 sm:h-8 sm:w-8 bg-gray-200 rounded-full flex items-center justify-center">
                  <User className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-600" />
                </div>
                <div>
                  <p className="text-[10px] sm:text-xs text-gray-500">Customer</p>
                  <p className="text-xs sm:text-sm font-medium">{currentTicket?.customer?.name || 'Ramshad'}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm">
                <Phone className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-400" />
                <span className="text-xs sm:text-sm">phone : {currentTicket?.customer?.country_code || '+91'} {currentTicket?.customer?.mobile || '9846337019'}</span>
              </div>

              <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm">
                <Mail className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-400" />
                <span className="text-xs sm:text-sm">Email :</span>
              </div>

              <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm">
                <span className="text-xs sm:text-sm font-medium" style={{ color: '#4f46e5' }}>
                  Branch: {currentTicket?.branch?.branch_name || 'N/A'}
                </span>
              </div>
            </div>

            {/* Update Ticket Section */}
            <div className="border-t border-[#e4e4e4] pt-3 sm:pt-4">
              <h4 className="text-[#5a4b81] font-semibold text-xs sm:text-sm mb-3 sm:mb-4">Update Ticket</h4>
              
              {/* Status and Priority */}
              <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-3 sm:mb-4">
                <div>
                  <Label className="text-xs text-gray-600 font-normal">Ticket Status</Label>
                  <Select value={status} onValueChange={(value) => {
                    // Check if status is being changed to "Closed" (value = 3)
                    if (value === '3') {
                      setPendingCloseStatus(value);
                      setCloseConfirmOpen(true);
                    } else if (value === '4') {
                      // Check if status is being changed to "Completed" (value = 4)
                      setPendingCompletedStatus(value);
                      setCompletedConfirmOpen(true);
                    } else {
                      setStatus(value);
                      handleUpdateTicket({ newStatus: value });
                    }
                  }}>
                    <SelectTrigger className="h-8 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ticketStatuses
                        .filter(ticketStatus => {
                          // Hide "Closed/Delivered" option (id=3) for agents (role_id=2)
                          if (user?.role_id === 2 && ticketStatus.id === 3) {
                            return false;
                          }
                          return true;
                        })
                        .map(ticketStatus => (
                          <SelectItem key={ticketStatus.id} value={ticketStatus.id.toString()}>
                            {ticketStatus.status}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs text-gray-600 font-normal">Priority</Label>
                  <Select value={priority} onValueChange={(value) => {
                    setPriority(value);
                    handleUpdateTicket({ newPriority: value });
                  }}>
                    <SelectTrigger className={`h-8 text-sm bg-white border-gray-300 ${
                      priority === '3' ? 'text-red-500' : 
                      priority === '1' ? 'text-cyan-500' : 
                      'text-gray-600'
                    }`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {priorities.map((priority) => (
                        <SelectItem key={priority.id} value={priority.id.toString()}>
                          {priority.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>


              {/* Branch - Filters users in Assigned To and Notify To */}
              <div className="mb-4">
                <Label className="text-xs text-gray-600 font-normal">Branch</Label>
                <Select value={branch} onValueChange={(value) => {
                  setBranch(value);
                  filterUsersByBranch(value);
                  handleUpdateTicket({ newBranch: value });
                }}>
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue placeholder="Select branch" />
                  </SelectTrigger>
                  <SelectContent>
                    {branches.map((branch) => (
                      <SelectItem key={branch.id} value={branch.id.toString()}>
                        {branch.branch || branch.branch_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {branch && (
                  <p className="text-xs text-gray-500 mt-1">Users below are filtered by selected branch</p>
                )}
              </div>

              {/* Assigned To */}
              <div className="mb-4">
                <Label className="text-xs text-gray-600 font-normal">Assigned To</Label>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Select onValueChange={handleAddAssignee}>
                      <SelectTrigger className="min-h-[32px] h-auto text-sm py-1">
                        <div className="flex items-center gap-1 flex-wrap w-full">
                          {selectedAssignees.length > 0 ? (
                            selectedAssignees.map((user) => (
                              <Badge 
                                key={user.id} 
                                className="bg-[#5a4b81] text-white hover:bg-[#4a3b71] text-xs h-5 px-1 pointer-events-none"
                              >
                                {user.name}
                                <button
                                  type="button"
                                  className="ml-1 hover:text-red-200 pointer-events-auto"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleRemoveAssignee(user.id);
                                  }}
                                >
                                  ×
                                </button>
                              </Badge>
                            ))
                          ) : (
                            <span className="text-gray-400">Select users...</span>
                          )}
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        {users.filter(user => !selectedAssignees.find(a => a.id === user.id)).map(user => (
                          <SelectItem key={user.id} value={user.id.toString()}>
                            {user.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-7 sm:h-8 px-2 sm:px-3 text-[10px] sm:text-xs"
                    onClick={handleUpdateTicket}
                  >
                    Update
                  </Button>
                </div>
              </div>

              {/* Notify To */}
              <div className="mb-4">
                <Label className="text-xs text-gray-600 font-normal">Notify To</Label>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Select onValueChange={handleAddNotifyUser}>
                      <SelectTrigger className="min-h-[32px] h-auto text-sm py-1">
                        <div className="flex items-center gap-1 flex-wrap w-full">
                          {selectedNotifyUsers.length > 0 ? (
                            selectedNotifyUsers.map((user) => (
                              <Badge 
                                key={user.id} 
                                className="bg-[#5a4b81] text-white hover:bg-[#4a3b71] text-xs h-5 px-1 pointer-events-none"
                              >
                                {user.name}
                                <button
                                  type="button"
                                  className="ml-1 hover:text-red-200 pointer-events-auto"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleRemoveNotifyUser(user.id);
                                  }}
                                >
                                  ×
                                </button>
                              </Badge>
                            ))
                          ) : (
                            <span className="text-gray-400">Select users to notify...</span>
                          )}
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        {notifyUsers.filter(user => !selectedNotifyUsers.find(n => n.id === user.id)).map(user => (
                          <SelectItem key={user.id} value={user.id.toString()}>
                            {user.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-7 sm:h-8 px-2 sm:px-3 text-[10px] sm:text-xs"
                    onClick={handleUpdateTicket}
                  >
                    Update
                  </Button>
                </div>
              </div>

              {/* Due Date and Time */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <Label className="text-xs text-gray-600 font-normal">Due Date</Label>
                  <Input 
                    type="date" 
                    value={dueDate} 
                    onChange={async (e) => {
                      const newDate = e.target.value;
                      setDueDate(newDate);
                      
                      try {
                        const updateData = {
                          due_date: newDate || null,
                          closed_time: dueTime || null,
                          issue: currentTicket?.issue,
                          description: currentTicket?.description || '',
                          customer_id: currentTicket?.customer_id || currentTicket?.customer?.id
                        };
                        
                        // Only add status and priority if they have valid values
                        if (status && !isNaN(parseInt(status))) {
                          updateData.status = parseInt(status);
                        }
                        if (priority && !isNaN(parseInt(priority))) {
                          updateData.priority = parseInt(priority);
                        }
                        console.log('Updating due date with data:', updateData);
                        
                        const response = await axios.put(`/tickets/${ticket.id}`, updateData);
                        console.log('Due date update response:', response.data);
                        
                        toast.success(newDate ? `Due date updated to ${newDate}` : 'Due date cleared');
                        
                        // Refresh ticket data to get updated activities
                        await refreshTicketData();
                      } catch (error) {
                        console.error('Error updating due date:', error);
                        console.error('Error response:', error.response?.data);
                        toast.error(error.response?.data?.message || 'Failed to update due date');
                      }
                    }}
                    className="h-7 sm:h-8 text-xs sm:text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs text-gray-600 font-normal">Closing Time</Label>
                  <Input 
                    type="time" 
                    value={dueTime} 
                    onChange={async (e) => {
                      const newTime = e.target.value;
                      setDueTime(newTime);
                      
                      try {
                        const updateData = {
                          due_date: dueDate || null,
                          closed_time: newTime || null,
                          issue: currentTicket?.issue,
                          description: currentTicket?.description || '',
                          customer_id: currentTicket?.customer_id || currentTicket?.customer?.id
                        };
                        
                        // Only add status and priority if they have valid values
                        if (status && !isNaN(parseInt(status))) {
                          updateData.status = parseInt(status);
                        }
                        if (priority && !isNaN(parseInt(priority))) {
                          updateData.priority = parseInt(priority);
                        }
                        console.log('Updating closing time with data:', updateData);
                        
                        const response = await axios.put(`/tickets/${ticket.id}`, updateData);
                        console.log('Closing time update response:', response.data);
                        
                        toast.success(newTime ? `Closing time updated to ${newTime}` : 'Closing time cleared');
                        
                        // Refresh ticket data to get updated activities
                        await refreshTicketData();
                      } catch (error) {
                        console.error('Error updating closing time:', error);
                        console.error('Error response:', error.response?.data);
                        toast.error(error.response?.data?.message || 'Failed to update closing time');
                      }
                    }}
                    className="h-7 sm:h-8 text-xs sm:text-sm"
                  />
                </div>
              </div>


              {/* Accessories */}
              <div className="mb-4">
                <Label className="text-xs text-gray-600 font-normal">Accessories</Label>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Select onValueChange={handleAddAccessory}>
                      <SelectTrigger className="min-h-[32px] h-auto text-sm py-1">
                        <div className="flex items-center gap-1 flex-wrap w-full">
                          {selectedAccessories.length > 0 ? (
                            selectedAccessories.map((accessory) => (
                              <Badge 
                                key={accessory.id} 
                                className="bg-blue-100 text-blue-800 hover:bg-blue-200 text-xs h-5 px-1 pointer-events-none"
                              >
                                {accessory.name}
                                <button
                                  type="button"
                                  className="ml-1 hover:text-red-600 pointer-events-auto"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleRemoveAccessory(accessory.id);
                                  }}
                                >
                                  ×
                                </button>
                              </Badge>
                            ))
                          ) : (
                            <span className="text-gray-400">Select accessories...</span>
                          )}
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        {accessories && accessories.length > 0 ? (
                          accessories.filter(accessory => !selectedAccessories.find(a => a.id === accessory.id)).map(accessory => (
                            <SelectItem key={accessory.id} value={accessory.id.toString()}>
                              {accessory.name}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="no-accessories" disabled>
                            No accessories available
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Ticket Label */}
              <div className="mb-4">
                <Label className="text-xs text-gray-600 font-normal">Ticket Labels</Label>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Select onValueChange={handleAddLabel}>
                      <SelectTrigger className="min-h-[32px] h-auto text-sm py-1">
                        <div className="flex items-center gap-1 flex-wrap w-full">
                          {selectedLabels.length > 0 ? (
                            selectedLabels.map((label) => (
                              <Badge 
                                key={label.id} 
                                className="text-white hover:bg-opacity-80 text-xs h-5 px-1 pointer-events-none"
                                style={{ backgroundColor: label.color || '#5a4b81' }}
                              >
                                {label.label_name || label.label || label.name || 'Label'}
                                <button
                                  type="button"
                                  className="ml-1 hover:text-red-200 pointer-events-auto"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleRemoveLabel(label.id);
                                  }}
                                >
                                  ×
                                </button>
                              </Badge>
                            ))
                          ) : (
                            <span className="text-gray-400">Select labels...</span>
                          )}
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        {ticketLabels && ticketLabels.length > 0 ? (
                          ticketLabels.filter(label => !selectedLabels.find(l => l.id === label.id)).map(label => (
                            <SelectItem key={label.id} value={label.id.toString()}>
                              <div className="flex items-center gap-2">
                                <div 
                                  className="w-3 h-3 rounded-full" 
                                  style={{ backgroundColor: label.color || '#5a4b81' }}
                                />
                                {label.label_name || label.label || label.name || 'Label ' + label.id}
                              </div>
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="no-labels" disabled>
                            No labels available
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Fields */}
            <div className="border-t border-[#e4e4e4] pt-4 mt-4">
              <h4 className="text-[#5a4b81] font-semibold text-sm mb-4">Additional Fields</h4>
              <div className="space-y-3">
                {additionalFields.length > 0 ? (
                  additionalFields.map((field, index) => (
                    <div key={field.id} style={{ marginTop: index === 0 ? '0' : '10px' }}>
                      <Label className="text-xs text-gray-600 font-normal">
                        {field.title}
                        {field.mandatory === 1 && <span className="text-red-500 ml-1">*</span>}
                      </Label>
                      {field.type === 'select' ? (
                        <Select 
                          value={ticketAdditionalFields[field.id] || ''} 
                          onValueChange={(value) => handleAdditionalFieldChange(field.id, value)}
                        >
                          <SelectTrigger className="h-8 text-sm">
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
                          type="text"
                          value={ticketAdditionalFields[field.id] || ''}
                          onChange={(e) => handleAdditionalFieldChange(field.id, e.target.value)}
                          placeholder={`Enter ${field.title}...`}
                          className="h-7 sm:h-8 text-xs sm:text-sm"
                        />
                      ) : field.type === 'date' ? (
                        <Input
                          type="date"
                          value={ticketAdditionalFields[field.id] || ''}
                          onChange={(e) => handleAdditionalFieldChange(field.id, e.target.value)}
                          className="h-7 sm:h-8 text-xs sm:text-sm"
                        />
                      ) : null}
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-gray-500">No additional fields configured</p>
                )}
              </div>
            </div>
            </div>
          </div>

          {/* Right Column - Mobile: Full width, Desktop: 70% */}
          <div className="w-full sm:w-[70%] sm:min-w-[500px] bg-white flex flex-col">
            {/* Top buttons */}
            <div className="flex justify-end items-center px-4 sm:px-6 py-2 sm:py-3 border-b border-[#e4e4e4]">
              <Button
                variant="default"
                size="sm"
                onClick={() => {
                  setShowInvoiceModal(true);
                }}
                disabled={!currentTicket.verified_at}
                title={!currentTicket.verified_at ? "Ticket must be verified before creating an invoice" : "Create invoice for this ticket"}
                className="text-xs sm:text-sm h-7 sm:h-8"
              >
                Add Invoice
              </Button>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="activity" className="flex-1 flex flex-col" onValueChange={(value) => {
              if (value === 'log-note') {
                fetchLogNotes();
              } else if (value === 'customer-notes') {
                fetchCustomerNotes();
              } else if (value === 'task') {
                fetchTasks();
              } else if (value === 'attachments') {
                fetchAttachments();
              } else if (value === 'spare-parts') {
                fetchSpareParts();
                fetchProducts();
              }
            }}>
              <TabsList className="w-full justify-start rounded-none border-b border-[#e4e4e4] bg-transparent h-auto p-0 overflow-x-auto flex-nowrap">
                <TabsTrigger 
                  value="activity" 
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 px-2 sm:px-4 py-1.5 sm:py-2 text-[10px] sm:text-sm whitespace-nowrap"
                >
                  ACTIVITY
                </TabsTrigger>
                <TabsTrigger 
                  value="log-note"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 px-2 sm:px-4 py-1.5 sm:py-2 text-[10px] sm:text-sm whitespace-nowrap"
                >
                  LOG NOTE
                </TabsTrigger>
                <TabsTrigger 
                  value="customer-notes"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 px-2 sm:px-4 py-1.5 sm:py-2 text-[10px] sm:text-sm whitespace-nowrap"
                >
                  CUSTOMER NOTES
                </TabsTrigger>
                <TabsTrigger 
                  value="task"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 px-2 sm:px-4 py-1.5 sm:py-2 text-[10px] sm:text-sm whitespace-nowrap"
                >
                  TASK
                </TabsTrigger>
                <TabsTrigger 
                  value="attachments"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 px-2 sm:px-4 py-1.5 sm:py-2 text-[10px] sm:text-sm whitespace-nowrap"
                >
                  FILES
                </TabsTrigger>
                <TabsTrigger 
                  value="spare-parts"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 px-2 sm:px-4 py-1.5 sm:py-2 text-[10px] sm:text-sm whitespace-nowrap"
                >
                  PARTS
                </TabsTrigger>
              </TabsList>
              
              <div className="flex-1 overflow-y-auto">
                <TabsContent value="activity" className="p-3 sm:p-6 m-0">
                  <div className="overflow-y-auto custom-scrollbar" style={{ maxHeight: '480px', height: 'auto' }}>
                    <div className="space-y-4 pr-2">
                      {currentTicket && currentTicket.activity && currentTicket.activity.length > 0 ? (
                      currentTicket.activity.map((activity, index) => (
                        <div key={activity.id} className="flex gap-4">
                          <div className="flex flex-col items-center">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                            </div>
                            {index < currentTicket.activity.length - 1 && (
                              <div className="w-0.5 h-12 bg-gray-200"></div>
                            )}
                          </div>
                          <div className="flex-1">
                            <h5 className="font-medium text-sm">{activity.title || activity.type}</h5>
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(activity.created_at).toLocaleDateString('en-US', { 
                                month: 'short', 
                                day: '2-digit',
                                hour: '2-digit',
                                minute: '2-digit',
                                hour12: true
                              })}
                              {activity.user && ` by ${activity.user.name}`}
                            </p>
                            <p className="text-sm text-gray-600 mt-2">{activity.note || activity.description}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center text-gray-500 py-8">
                        <p>No activities recorded for this ticket yet.</p>
                      </div>
                    )}
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="log-note" className="p-3 sm:p-6 m-0">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-base sm:text-lg font-semibold">Log Notes</h3>
                      </div>
                      <Button 
                        variant="default"
                        className="h-7 sm:h-8 text-[11px] sm:text-[13px] px-2 sm:px-3"
                        onClick={() => setShowAddNote(!showAddNote)}
                      >
                        + Add Note
                      </Button>
                    </div>
                    
                    {/* Add Note Form */}
                    {showAddNote && (
                      <div 
                        className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-4"
                        style={{ 
                          position: 'absolute', 
                          right: '20px', 
                          width: '400px', 
                          zIndex: 9999999, 
                          top: '170px' 
                        }}
                      >
                        <Textarea
                          placeholder="Enter your note here..."
                          value={newNote}
                          onChange={(e) => setNewNote(e.target.value)}
                          className="mb-3"
                          rows={3}
                        />
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setShowAddNote(false);
                              setNewNote('');
                            }}
                          >
                            Cancel
                          </Button>
                          <Button
                            size="sm"
                            variant="default"
                            onClick={handleAddNote}
                          >
                            Save Note
                          </Button>
                        </div>
                      </div>
                    )}
                    
                    {/* Log Notes List */}
                    <div className="overflow-y-auto custom-scrollbar" style={{ maxHeight: '350px', height: 'auto' }}>
                      {isLoadingNotes ? (
                        <div className="text-center py-8">
                          <p className="text-gray-500">Loading notes...</p>
                        </div>
                      ) : logNotes && logNotes.length > 0 ? (
                        <div className="space-y-4 pr-2">
                          {(Array.isArray(logNotes) ? logNotes : []).map((note, index) => (
                            <div key={note.id} className="flex gap-4">
                              <div className="flex flex-col items-center">
                                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                                  <MessageSquare className="w-4 h-4 text-purple-600" />
                                </div>
                                {index < logNotes.length - 1 && (
                                  <div className="w-0.5 h-12 bg-gray-200"></div>
                                )}
                              </div>
                              <div className="flex-1">
                                <h5 className="font-medium text-sm">Log Note</h5>
                                <p className="text-xs text-gray-500 mt-1">
                                  {new Date(note.time || note.created_at).toLocaleDateString('en-US', { 
                                    month: 'short', 
                                    day: '2-digit',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    hour12: true
                                  })}
                                  {note.user && ` by ${note.user.name}`}
                                </p>
                                <p className="text-sm text-gray-600 mt-2 whitespace-pre-wrap">{note.description || note.log}</p>
                                {note.type_id && (
                                  <span className="text-xs text-gray-400 mt-1">Type ID: {note.type_id}</span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center text-gray-500 py-8">
                          <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                          <p>No log notes recorded for this ticket yet.</p>
                          <p className="text-sm mt-2">Click "+ Add Note" to create the first note.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="customer-notes" className="p-3 sm:p-6 m-0">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-base sm:text-lg font-semibold">Note For Customer</h3>
                      </div>
                      <Button 
                        variant="default"
                        className="h-7 sm:h-8 text-[11px] sm:text-[13px] px-2 sm:px-3"
                        onClick={() => setShowAddCustomerNote(!showAddCustomerNote)}
                      >
                        + Add Note
                      </Button>
                    </div>
                    
                    {/* Add Customer Note Form */}
                    {showAddCustomerNote && (
                      <div 
                        className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-4"
                        style={{ 
                          position: 'absolute', 
                          right: '20px', 
                          width: '400px', 
                          zIndex: 9999999, 
                          top: '170px' 
                        }}
                      >
                        <Textarea
                          placeholder="Enter customer note here..."
                          value={newCustomerNote}
                          onChange={(e) => setNewCustomerNote(e.target.value)}
                          className="mb-3"
                          rows={3}
                        />
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setShowAddCustomerNote(false);
                              setNewCustomerNote('');
                            }}
                          >
                            Cancel
                          </Button>
                          <Button
                            size="sm"
                            variant="default"
                            onClick={handleAddCustomerNote}
                          >
                            Save Note
                          </Button>
                        </div>
                      </div>
                    )}
                    
                    {/* Customer Notes List */}
                    <div className="overflow-y-auto custom-scrollbar" style={{ maxHeight: '450px', height: 'auto' }} data-customer-notes-container>
                      {isLoadingCustomerNotes ? (
                        <div className="text-center py-8">
                          <p className="text-gray-500">Loading customer notes...</p>
                        </div>
                      ) : customerNotes && customerNotes.length > 0 ? (
                        <div className="space-y-4 pr-2">
                          {(Array.isArray(customerNotes) ? customerNotes : []).map((note, index) => {
                            // Check if this is a customer note (has customer info but no user/agent info)
                            const isCustomerNote = !note.user && note.customer;
                            
                            return (
                              <div key={note.id} className="flex gap-4"
                                   style={{
                                     background: isCustomerNote ? '#e3f8f3' : '#f7f7e4',
                                     marginLeft: isCustomerNote ? '50px' : '0px',
                                     padding: '12px',
                                     borderRadius: '8px'
                                   }}>
                                <div className="flex flex-col items-center">
                                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                    <User className="w-4 h-4 text-green-600" />
                                  </div>

                                </div>
                                <div className="flex-1">
                                  <p className="text-xs text-gray-500 mt-1">
                                    {new Date(note.created_at).toLocaleDateString('en-US', { 
                                      month: 'short', 
                                      day: '2-digit',
                                      hour: '2-digit',
                                      minute: '2-digit',
                                      hour12: true
                                    })}
                                    {note.user && (
                                      <span> by <span style={{ fontWeight: 600 }}>{note.user.name}</span></span>
                                    )}
                                    {!note.user && note.customer && (
                                      <span> by <span style={{ fontWeight: 600 }}>{note.customer.name}</span></span>
                                    )} 
                                  </p>
                                  <p className="text-sm text-gray-600 mt-2 whitespace-pre-wrap">{note.note}</p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="text-center text-gray-500 py-8">
                          <User className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                          <p>No customer notes recorded for this ticket yet.</p>
                          <p className="text-sm mt-2">Click "+ Add Note" to create the first customer note.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="task" className="p-3 sm:p-6 m-0">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-base sm:text-lg font-semibold">Tasks</h3>
                      </div>
                      <Button 
                        variant="default"
                        className="h-7 sm:h-8 text-[11px] sm:text-[13px] px-2 sm:px-3"
                        onClick={() => setShowAddTask(!showAddTask)}
                      >
                        + Add Task
                      </Button>
                    </div>
                    
                    {/* Add Task Form */}
                    {showAddTask && (
                      <div 
                        className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-4"
                        style={{ 
                          position: 'absolute', 
                          right: '20px', 
                          width: '400px', 
                          zIndex: 9999999, 
                          top: '170px' 
                        }}
                      >
                        <div className="space-y-3">
                          <div>
                            <Label className="text-xs font-medium mb-1">Task Name *</Label>
                            <Input
                              placeholder="Enter task name..."
                              value={newTaskName}
                              onChange={(e) => setNewTaskName(e.target.value)}
                            />
                          </div>
                          
                          <div>
                            <Label className="text-xs font-medium mb-1">Description</Label>
                            <Textarea
                              placeholder="Enter task description (optional)..."
                              value={newTaskDescription}
                              onChange={(e) => setNewTaskDescription(e.target.value)}
                              rows={2}
                            />
                          </div>
                          
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <Label className="text-xs font-medium mb-1">Assigned To</Label>
                              <Select onValueChange={(userId) => {
                                const user = taskUsers.find(u => u.id.toString() === userId);
                                if (user && !newTaskAssignedTo.find(u => u.id === user.id)) {
                                  setNewTaskAssignedTo([...newTaskAssignedTo, { id: user.id, name: user.name }]);
                                }
                              }}>
                                <SelectTrigger>
                                  <div className="flex items-center gap-1 flex-wrap w-full">
                                    {newTaskAssignedTo.length > 0 ? (
                                      newTaskAssignedTo.map((user) => (
                                        <Badge 
                                          key={user.id} 
                                          className="bg-[#5a4b81] text-white hover:bg-[#4a3b71] text-xs h-5 px-1 pointer-events-none"
                                        >
                                          {user.name}
                                          <button
                                            type="button"
                                            className="ml-1 hover:text-red-200 pointer-events-auto"
                                            onClick={(e) => {
                                              e.preventDefault();
                                              e.stopPropagation();
                                              setNewTaskAssignedTo(newTaskAssignedTo.filter(u => u.id !== user.id));
                                            }}
                                          >
                                            ×
                                          </button>
                                        </Badge>
                                      ))
                                    ) : (
                                      <span className="text-gray-400">Select users...</span>
                                    )}
                                  </div>
                                </SelectTrigger>
                                <SelectContent>
                                  {taskUsers.filter(user => !newTaskAssignedTo.find(a => a.id === user.id)).map(user => (
                                    <SelectItem key={user.id} value={user.id.toString()}>
                                      {user.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label className="text-xs font-medium mb-1">Task Status</Label>
                              <Select value={newTaskStatus} onValueChange={setNewTaskStatus}>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="1">Open</SelectItem>
                                  <SelectItem value="2">In Progress</SelectItem>
                                  <SelectItem value="3">Closed</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <Label className="text-xs font-medium mb-1">Date</Label>
                              <Input
                                type="date"
                                value={newTaskDate}
                                onChange={(e) => setNewTaskDate(e.target.value)}
                              />
                            </div>
                            <div>
                              <Label className="text-xs font-medium mb-1">Time</Label>
                              <Input
                                type="time"
                                value={newTaskTime}
                                onChange={(e) => setNewTaskTime(e.target.value)}
                              />
                            </div>
                          </div>
                        </div>
                        <div className="flex justify-end gap-2" style={{ marginTop: '15px' }}>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setShowAddTask(false);
                              setNewTaskName('');
                              setNewTaskDescription('');
                              setNewTaskAssignedTo([]);
                              setNewTaskStatus('1');
                              setNewTaskDate('');
                              setNewTaskTime('');
                            }}
                          >
                            Cancel
                          </Button>
                          <Button
                            size="sm"
                            variant="default"
                            onClick={handleAddTask}
                          >
                            Save Task
                          </Button>
                        </div>
                      </div>
                    )}
                    
                    {/* Tasks List */}
                    <div className="overflow-y-auto custom-scrollbar" style={{ maxHeight: '350px', height: 'auto' }}>
                      {isLoadingTasks ? (
                        <div className="text-center py-8">
                          <p className="text-gray-500">Loading tasks...</p>
                        </div>
                      ) : tasks && tasks.length > 0 ? (
                        <div className="space-y-4 pr-2">
                          {(Array.isArray(tasks) ? tasks : []).map((task, index) => (
                            <div key={task.id} className="flex gap-4">
                              <div className="flex flex-col items-center">
                                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                  <Tag className="w-4 h-4 text-green-600" />
                                </div>
                                {index < tasks.length - 1 && (
                                  <div className="w-0.5 h-12 bg-gray-200"></div>
                                )}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <h5 className="font-medium text-sm">{task.task_name}</h5>
                                  {task.status && (
                                    <span 
                                      className="text-xs font-medium"
                                      style={{
                                        color: 
                                          task.status === '1' || task.status === 1 ? '#22C55E' : // Bright green for Open
                                          task.status === '2' || task.status === 2 ? '#800000' : // Maroon for In Progress
                                          task.status === '3' || task.status === 3 ? '#EF4444' : // Bright red for Closed
                                          '#6B7280'
                                      }}
                                    >
                                      {task.status === '1' || task.status === 1 ? 'Open' :
                                       task.status === '2' || task.status === 2 ? 'In Progress' :
                                       task.status === '3' || task.status === 3 ? 'Closed' :
                                       task.status}
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                  Created: {new Date(task.created_at).toLocaleDateString('en-US', { 
                                    month: 'short', 
                                    day: '2-digit',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    hour12: true
                                  })}
                                  {task.user && ` by ${task.user.name}`}
                                </p>
                                {task.time && (
                                  <p className="text-xs text-gray-500 mt-1">
                                    <Clock className="inline-block w-3 h-3 mr-1" />
                                    Time: {new Date(task.time).toLocaleDateString('en-US', { 
                                      month: 'short', 
                                      day: '2-digit',
                                      year: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit',
                                      hour12: true
                                    })}
                                  </p>
                                )}
                                {task.assigned_agents && task.assigned_agents.length > 0 && (
                                  <div className="flex items-center gap-1 mt-1">
                                    <span className="text-xs text-gray-500">Assigned to:</span>
                                    {task.assigned_agents.map((agent) => (
                                      <Badge 
                                        key={agent.id} 
                                        className="bg-[#5a4b81] text-white text-xs h-4 px-1"
                                      >
                                        {agent.name}
                                      </Badge>
                                    ))}
                                  </div>
                                )}
                                {task.description && (
                                  <p className="text-sm text-gray-600 mt-2 whitespace-pre-wrap">{task.description}</p>
                                )}
                                {task.category && (
                                  <span className="text-xs text-gray-400 mt-1">Category: {task.category.name}</span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center text-gray-500 py-8">
                          <Tag className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                          <p>No tasks recorded for this ticket yet.</p>
                          <p className="text-sm mt-2">Click "+ Add Task" to create the first task.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="attachments" className="p-3 sm:p-6 m-0">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-base sm:text-lg font-semibold">Attachments</h3>
                      </div>
                      <Button 
                        variant="default"
                        className="h-7 sm:h-8 text-[11px] sm:text-[13px] px-2 sm:px-3"
                        onClick={() => setShowUploadFile(!showUploadFile)}
                      >
                        + Add File
                      </Button>
                    </div>
                    
                    {/* Upload File Form */}
                    {showUploadFile && (
                      <div 
                        className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-4"
                        style={{ 
                          position: 'absolute', 
                          right: '20px', 
                          width: '400px', 
                          zIndex: 9999999, 
                          top: '170px' 
                        }}
                      >
                        <div className="space-y-3">
                          <div>
                            <Label className="text-xs font-medium mb-1">Select File</Label>
                            <input
                              id="file-upload"
                              type="file"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  setSelectedFile(file);
                                }
                              }}
                            />
                            <label
                              htmlFor="file-upload"
                              className="cursor-pointer inline-flex items-center justify-center w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white hover:bg-gray-50"
                            >
                              <Paperclip className="w-4 h-4 mr-2" />
                              {selectedFile ? selectedFile.name : 'Choose File'}
                            </label>
                          </div>
                          
                          {selectedFile && (
                            <div className="text-xs text-gray-600">
                              <p>Size: {formatFileSize(selectedFile.size)}</p>
                              <p>Type: {selectedFile.type || 'Unknown'}</p>
                            </div>
                          )}
                        </div>
                        <div className="flex justify-end gap-2" style={{ marginTop: '15px' }}>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setShowUploadFile(false);
                              setSelectedFile(null);
                              const fileInput = document.getElementById('file-upload') as HTMLInputElement;
                              if (fileInput) fileInput.value = '';
                            }}
                          >
                            Cancel
                          </Button>
                          <Button
                            size="sm"
                            variant="default"
                            onClick={handleFileUpload}
                            disabled={!selectedFile || isUploading}
                          >
                            {isUploading ? 'Uploading...' : 'Upload File'}
                          </Button>
                        </div>
                      </div>
                    )}
                    
                    {/* Attachments List */}
                    <div className="overflow-y-auto custom-scrollbar" style={{ maxHeight: '350px', height: 'auto' }}>
                      {isLoadingAttachments ? (
                        <div className="text-center py-8">
                          <p className="text-gray-500">Loading attachments...</p>
                        </div>
                      ) : attachments && attachments.length > 0 ? (
                        <div className="space-y-3 pr-2">
                          {attachments.map((attachment) => (
                            <div key={attachment.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                              <div className="flex items-center gap-3">
                                <FileText className="w-8 h-8 text-gray-400" />
                                <div>
                                  <a 
                                    href={`/${attachment.file_path}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline"
                                  >
                                    {attachment.name}
                                  </a>
                                  <p className="text-xs text-gray-500">
                                    Uploaded on {new Date(attachment.created_at).toLocaleDateString('en-US', {
                                      month: 'short',
                                      day: '2-digit',
                                      year: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit',
                                      hour12: true
                                    })}
                                    {attachment.file_size && ` • ${formatFileSize(attachment.file_size)}`}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <a
                                  href={`/${attachment.file_path}`}
                                  download={attachment.name}
                                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-md"
                                  title="Download"
                                >
                                  <Download className="w-4 h-4" />
                                </a>
                                <button
                                  onClick={() => handleDeleteAttachment(attachment.id)}
                                  className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                                  title="Delete"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center text-gray-500 py-8">
                          <Paperclip className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                          <p>No attachments uploaded for this ticket yet.</p>
                          <p className="text-sm mt-2">Click "Add File" to upload the first attachment.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="spare-parts" className="p-3 sm:p-6 m-0">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-base sm:text-lg font-semibold">Spare Parts</h3>
                      </div>
                      <Button 
                        variant="default"
                        className="h-7 sm:h-8 text-[11px] sm:text-[13px] px-2 sm:px-3"
                        onClick={() => setShowAddSparePart(!showAddSparePart)}
                      >
                        + Add Part
                      </Button>
                    </div>
                    
                    {/* Add Spare Part Form */}
                    {showAddSparePart && (
                      <div 
                        className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-4"
                        style={{ 
                          position: 'absolute', 
                          right: '20px', 
                          width: '400px', 
                          zIndex: 9999999, 
                          top: '170px' 
                        }}
                      >
                        <div className="space-y-3">
                          <div>
                            <Label className="text-xs font-medium mb-1">Product *</Label>
                            <Select value={selectedProductId} onValueChange={handleProductChange}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select product..." />
                              </SelectTrigger>
                              <SelectContent>
                                {products.map(product => (
                                  <SelectItem key={product.id} value={product.id.toString()}>
                                    {product.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div>
                            <Label className="text-xs font-medium mb-1">Quantity *</Label>
                            <Input
                              type="number"
                              min="1"
                              value={quantity}
                              onChange={(e) => setQuantity(e.target.value)}
                              placeholder="Enter quantity..."
                            />
                          </div>
                          
                          {selectedProduct && (
                            <div className="text-sm space-y-1 p-2 bg-blue-50 rounded">
                              <p>Unit Price: ₹{selectedProduct.cost || 0}</p>
                              <p className="font-semibold">Total Price: ₹{totalPrice.toFixed(2)}</p>
                            </div>
                          )}
                        </div>
                        <div className="flex justify-end gap-2" style={{ marginTop: '15px' }}>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setShowAddSparePart(false);
                              setSelectedProductId('');
                              setSelectedProduct(null);
                              setQuantity('1');
                              setTotalPrice(0);
                            }}
                          >
                            Cancel
                          </Button>
                          <Button
                            size="sm"
                            variant="default"
                            onClick={handleAddSparePart}
                            disabled={!selectedProductId || !quantity || parseInt(quantity) <= 0}
                          >
                            Add Spare Part
                          </Button>
                        </div>
                      </div>
                    )}
                    
                    {/* Spare Parts List */}
                    <div className="overflow-y-auto custom-scrollbar" style={{ maxHeight: '350px', height: 'auto' }}>
                      {isLoadingSpareParts ? (
                        <div className="text-center py-8">
                          <p className="text-gray-500">Loading spare parts...</p>
                        </div>
                      ) : spareParts && spareParts.length > 0 ? (
                        <div className="space-y-3 pr-2">
                          {spareParts.map((sparePart) => (
                            <div key={sparePart.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                              <div className="flex items-center gap-3">
                                <Package className="w-8 h-8 text-gray-400" />
                                <div>
                                  <p className="text-sm font-medium">
                                    {sparePart.product?.name || 'Unknown Product'}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    Quantity: {sparePart.quantity} • 
                                    Unit Price: ₹{sparePart.price} • 
                                    Total: ₹{sparePart.total_price}
                                  </p>
                                  <p className="text-xs text-gray-400">
                                    Added on {new Date(sparePart.created_at).toLocaleDateString('en-US', {
                                      month: 'short',
                                      day: '2-digit',
                                      year: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit',
                                      hour12: true
                                    })}
                                  </p>
                                </div>
                              </div>
                              <button
                                onClick={() => handleDeleteSparePart(sparePart.id)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                                title="Remove"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center text-gray-500 py-8">
                          <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                          <p>No spare parts added for this ticket yet.</p>
                          <p className="text-sm mt-2">Click "Add Spare Part" to add the first spare part.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>
              </div>
            </Tabs>

            {/* Bottom Close button */}
            <div className="p-3 sm:p-4 border-t border-[#e4e4e4] flex justify-end">
              <Button 
                variant="default"
                onClick={onClose}
                className="text-xs sm:text-sm h-8 sm:h-9 px-3 sm:px-4"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will delete the ticket. The ticket will be moved to trash and can be restored if needed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteTicket} className="bg-red-500 hover:bg-red-600 text-white">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Close Confirmation Dialog */}
      <AlertDialog open={showCloseConfirm} onOpenChange={setShowCloseConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Close Ticket?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to close this ticket? This will mark the ticket as closed and it will no longer be active.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleCloseTicket} className="bg-red-500 hover:bg-red-600 text-white">
              Close Ticket
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Re-open Confirmation Dialog */}
      <AlertDialog open={showReopenConfirm} onOpenChange={setShowReopenConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Re-open Ticket?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to re-open this ticket? This will mark the ticket as open and make it active again.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleReopenTicket} className="bg-green-600 hover:bg-green-700 text-white">
              Re-open Ticket
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Add Invoice Modal */}
      {currentTicket && (
        <AddInvoiceModal
          isOpen={showInvoiceModal}
          onClose={() => setShowInvoiceModal(false)}
          ticketId={currentTicket.id}
          customerId={currentTicket.customer_id}
          customerName={currentTicket.customer?.name || ''}
        />
      )}

      {/* Status Change to Closed Confirmation Dialog */}
      <AlertDialog open={closeConfirmOpen} onOpenChange={setCloseConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Close Ticket</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to close ticket <strong className="font-bold">#{currentTicket?.tracking_number}</strong>?
              This will set the ticket status to "Closed".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setCloseConfirmOpen(false);
              setPendingCloseStatus(null);
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

      {/* Status Change to Completed Confirmation Dialog */}
      <AlertDialog open={completedConfirmOpen} onOpenChange={setCompletedConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Complete Ticket</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to mark ticket <strong className="font-bold">#{currentTicket?.tracking_number}</strong> as completed?
              This will set the ticket status to "Completed".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setCompletedConfirmOpen(false);
              setPendingCompletedStatus(null);
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
    </Dialog>
  );
};