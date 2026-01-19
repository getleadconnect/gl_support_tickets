import React, { useState, useEffect, useRef } from 'react';
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
import { Badge } from '@/components/ui/badge';
import { X, Check } from 'lucide-react';

interface Ticket {
  id: number;
  tracking_number: string;
  issue: string;
}

interface TaskType {
  id: number;
  type: string;
}

interface TaskCategory {
  id: number;
  category: string;
}

interface TaskStatus {
  id: number;
  status: string;
}

interface Agent {
  id: number;
  name: string;
  email: string;
}

interface Task {
  id: number;
  task_name: string;
  user_id: number;
  ticket_id: number;
  type_id: number;
  time: string;
  description: string;
  category_id: number | null;
  status: string | null;
  closing_comment?: string | null;
  agent?: Array<{
    id: number;
    name: string;
  }>;
}

interface AddTaskModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  task?: Task;
}

export function AddTaskModal({ open, onClose, onSuccess, task }: AddTaskModalProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [taskCategories, setTaskCategories] = useState<TaskCategory[]>([]);
  const [taskStatuses, setTaskStatuses] = useState<TaskStatus[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedAgents, setSelectedAgents] = useState<number[]>([]);
  const [showAgentsDropdown, setShowAgentsDropdown] = useState(false);
  const agentsDropdownRef = useRef<HTMLDivElement>(null);
  const [formData, setFormData] = useState({
    task_name: '',
    ticket_id: '',
    category_id: '',
    time: '',
    description: '',
    status: '1',
    closing_comment: '',
  });

  useEffect(() => {
    if (open) {
      fetchReferenceData();

      // If editing, populate form with task data
      if (task) {
        setFormData({
          task_name: task.task_name || '',
          ticket_id: task.ticket_id?.toString() || '',
          category_id: task.category_id?.toString() || '',
          time: task.time ? task.time.slice(0, 16) : '', // Format for datetime-local input
          description: task.description || '',
          status: task.status?.toString() || '1',
          closing_comment: task.closing_comment || '',
        });

        // Set selected agents
        if (task.agent) {
          setSelectedAgents(task.agent.map(a => a.id));
        }
      } else {
        // Reset form for new task
        setFormData({
          task_name: '',
          ticket_id: '',
          category_id: '',
          time: '',
          description: '',
          status: '1',
          closing_comment: '',
        });
        setSelectedAgents([]);
      }
    }
  }, [open, task]);

  // Click outside handler for dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (agentsDropdownRef.current && !agentsDropdownRef.current.contains(event.target as Node)) {
        setShowAgentsDropdown(false);
      }
    };

    if (showAgentsDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showAgentsDropdown]);

  const fetchReferenceData = async () => {
    try {
      const [ticketsRes, categoriesRes, statusesRes, agentsRes] = await Promise.all([
        axios.get('/tickets'),
        axios.get('/task-categories'),
        axios.get('/task-statuses'),
        axios.get('/task-agents'),
      ]);

      setTickets(ticketsRes.data.data || ticketsRes.data || []);
      setTaskCategories(categoriesRes.data || []);
      setTaskStatuses(statusesRes.data || []);
      setAgents(agentsRes.data || []);
    } catch (error) {
      console.error('Error fetching reference data:', error);
      toast.error('Failed to load form data');
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const toggleAgent = (agentId: number) => {
    setSelectedAgents(prev => {
      if (prev.includes(agentId)) {
        return prev.filter(id => id !== agentId);
      } else {
        return [...prev, agentId];
      }
    });
  };

  const removeAgent = (agentId: number) => {
    setSelectedAgents(prev => prev.filter(id => id !== agentId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.task_name.trim()) {
      toast.error('Please enter a task name');
      return;
    }

    if (!formData.time) {
      toast.error('Please select a due date and time');
      return;
    }

    if (!formData.description.trim()) {
      toast.error('Please enter a description');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        task_name: formData.task_name,
        ticket_id: task ? task.ticket_id : (formData.ticket_id ? parseInt(formData.ticket_id) : null),
        type_id: task ? task.type_id : null,
        category_id: formData.category_id ? parseInt(formData.category_id) : null,
        time: formData.time,
        description: formData.description,
        status: formData.status,
        agent_ids: selectedAgents,
        ...(formData.status === '4' && formData.closing_comment && { closing_comment: formData.closing_comment })
      };

      if (task) {
        // Update existing task
        await axios.put(`/tasks/${task.id}`, payload);
        toast.success('Task updated successfully');
      } else {
        // Create new task
        await axios.post('/tasks', payload);
        toast.success('Task created successfully');
      }

      onSuccess();
    } catch (error: any) {
      console.error('Error saving task:', error);
      const errorMessage = error.response?.data?.message || 'Failed to save task';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getSelectedAgentNames = () => {
    return agents
      .filter(agent => selectedAgents.includes(agent.id))
      .map(agent => agent.name);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{task ? 'Edit Task' : 'Add New Task'}</DialogTitle>
          <DialogDescription>
            {task ? 'Update task details below' : 'Fill in the details to create a new task'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Task Name */}
            <div>
              <Label htmlFor="task_name">
                Task Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="task_name"
                value={formData.task_name}
                onChange={(e) => handleInputChange('task_name', e.target.value)}
                placeholder="Enter task name"
                required
              />
            </div>

            {/* Ticket - Only show when creating new task */}
            {!task && (
              <div>
                <Label htmlFor="ticket_id">Ticket</Label>
                <Select
                  value={formData.ticket_id ? String(formData.ticket_id) : undefined}
                  onValueChange={(value) => handleInputChange('ticket_id', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a ticket (Optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {tickets.map((ticket) => (
                      <SelectItem key={ticket.id} value={ticket.id.toString()}>
                        {ticket.tracking_number} - {ticket.issue}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Category and Status */}
            <div className="grid grid-cols-2 gap-4">



              <div>
                <Label htmlFor="category_id">Task Category</Label>
                <Select
                  value={formData.category_id ? String(formData.category_id) : undefined}
                  onValueChange={(value) => handleInputChange('category_id', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category (Optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {taskCategories.map((category) => (
                      <SelectItem key={category.id} value={category.id.toString()}>
                        {category.category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
                
              <div>
                <Label>Assign Agents</Label>
              <div className="relative" ref={agentsDropdownRef}>
                <div
                  className="min-h-[42px] border rounded-md p-2 cursor-pointer hover:border-gray-400 transition-colors"
                  onClick={() => setShowAgentsDropdown(!showAgentsDropdown)}
                >
                  {selectedAgents.length === 0 ? (
                    <span className="text-gray-400">Select agents...</span>
                  ) : (
                    <div className="flex flex-wrap gap-1">
                      {getSelectedAgentNames().map((name, index) => (
                        <Badge key={index} variant="secondary" className="text-sm">
                          {name}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeAgent(selectedAgents[index]);
                            }}
                            className="ml-1 hover:text-red-600"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                {showAgentsDropdown && (
                  <div className="absolute z-50 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
                    {agents.length === 0 ? (
                      <div className="p-3 text-sm text-gray-500 text-center">
                        No agents available
                      </div>
                    ) : (
                      agents.map((agent) => (
                        <div
                          key={agent.id}
                          className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 cursor-pointer"
                          onClick={() => toggleAgent(agent.id)}
                        >
                          <div
                            className={`w-5 h-5 border-2 rounded flex items-center justify-center ${
                              selectedAgents.includes(agent.id)
                                ? 'bg-purple-600 border-purple-600'
                                : 'border-gray-300'
                            }`}
                          >
                            {selectedAgents.includes(agent.id) && (
                              <Check className="w-3 h-3 text-white" />
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">{agent.name}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
              </div>


            </div>

            {/* Due Date/Time and Assign Agents */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="status">Status</Label>
                <Select
                  value={String(formData.status)}
                  onValueChange={(value) => handleInputChange('status', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {taskStatuses.map((status) => (
                      <SelectItem key={status.id} value={status.id.toString()}>
                        {status.status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="time">
                  Due Date & Time <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="time"
                  type="datetime-local"
                  value={formData.time}
                  onChange={(e) => handleInputChange('time', e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description">
                Description <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Enter task description"
                rows={4}
                required
              />
            </div>

            {/* Closing Comment (only show when status is closed) */}
            {formData.status === '4' && (
              <div>
                <Label htmlFor="closing_comment">Closing Comment</Label>
                <Textarea
                  id="closing_comment"
                  value={formData.closing_comment}
                  onChange={(e) => handleInputChange('closing_comment', e.target.value)}
                  placeholder="Enter closing comment"
                  rows={3}
                />
              </div>
            )}
          </div>

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  {task ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                task ? 'Update Task' : 'Create Task'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
