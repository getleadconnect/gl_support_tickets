import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import toast from 'react-hot-toast';

interface AddTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  customerId: number;
  customerName: string;
  onTicketAdded: () => void;
}

interface TicketStatus {
  id: number;
  status: string;
  color_code?: string;
}

interface Priority {
  id: number;
  title: string;
}

export function CustomerAddTicketModal({ isOpen, onClose, customerId, customerName, onTicketAdded }: AddTicketModalProps) {
  const [issue, setIssue] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('1');
  const [priority, setPriority] = useState('2');
  const [dueDate, setDueDate] = useState('');
  const [ticketStatuses, setTicketStatuses] = useState<TicketStatus[]>([]);
  const [priorities, setPriorities] = useState<Priority[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchTicketStatuses();
      fetchPriorities();
    }
  }, [isOpen]);

  const fetchTicketStatuses = async () => {
    try {
      const response = await axios.get('/ticket-statuses');
      const statuses = response.data || [];
      setTicketStatuses(statuses);
      if (statuses.length > 0) {
        setStatus(statuses[0].id.toString());
      }
    } catch (error) {
      console.error('Error fetching ticket statuses:', error);
    }
  };

  const fetchPriorities = async () => {
    try {
      const response = await axios.get('/priorities');
      const prioritiesData = response.data || [];
      setPriorities(prioritiesData);
      if (prioritiesData.length > 0) {
        const mediumPriority = prioritiesData.find((p: Priority) => p.title.toLowerCase() === 'medium');
        setPriority(mediumPriority ? mediumPriority.id.toString() : prioritiesData[0].id.toString());
      }
    } catch (error) {
      console.error('Error fetching priorities:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!issue.trim()) {
      toast.error('Please enter an issue title');
      return;
    }

    setIsSubmitting(true);
    
    try {
      await axios.post('/tickets', {
        issue: issue.trim(),
        description: description.trim(),
        status: parseInt(status),
        priority: parseInt(priority),
        customer_id: customerId,
        due_date: dueDate || null,
      });
      
      toast.success('Ticket successfully added!');
      
      // Reset form
      setIssue('');
      setDescription('');
      setStatus(ticketStatuses[0]?.id.toString() || '1');
      setPriority('2');
      setDueDate('');
      
      onTicketAdded();
      onClose();
    } catch (error: any) {
      console.error('Error creating ticket:', error);
      toast.error(error.response?.data?.message || 'Failed to create ticket');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: '#cdcccc61' }}>
      <div className="bg-white rounded-lg w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-xl font-semibold">Add New Ticket</h2>
            <p className="text-sm text-gray-600">Create a new support ticket</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Customer
            </label>
            <Input
              value={customerName}
              disabled
              className="bg-gray-50"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Issue
            </label>
            <Input
              value={issue}
              onChange={(e) => setIssue(e.target.value)}
              placeholder="Enter issue title"
              className="w-full"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the issue in detail"
              rows={4}
              className="w-full"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ticketStatuses.map((ticketStatus) => (
                    <SelectItem key={ticketStatus.id} value={ticketStatus.id.toString()}>
                      {ticketStatus.status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Priority
              </label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {priorities.map((p) => (
                    <SelectItem key={p.id} value={p.id.toString()}>
                      {p.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Due Date
            </label>
            <Input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full"
            />
          </div>
          
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="text-white hover:opacity-90"
              style={{ backgroundColor: '#6e6969' }}
            >
              {isSubmitting ? 'Creating...' : 'Create Ticket'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}