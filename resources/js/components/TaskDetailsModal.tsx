import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from './ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import {
  Calendar,
  Clock,
  User,
  Ticket,
  ListTodo,
  Users,
  FileText,
  Activity as ActivityIcon,
  MessageSquare,
  Plus
} from 'lucide-react';

interface Task {
  id: number;
  task_name: string;
  user_id: number;
  ticket_id: number;
  type_id: number;
  time: string;
  description: string;
  created_at: string;
  updated_at: string;
  category_id: number | null;
  status: string | number | null;
  closed_time: string | null;
  closed_by: number | null;
  closing_comment: string | null;
  user?: {
    id: number;
    name: string;
  };
  ticket?: {
    id: number;
    tracking_number: string;
    issue: string;
  };
  type?: {
    id: number;
    type: string;
  };
  category?: {
    id: number;
    category: string;
  };
  agent?: Array<{
    id: number;
    name: string;
    email: string;
  }>;
}

interface Activity {
  id: number;
  task_id: number;
  ticket_id: number | null;
  type: string;
  note: string;
  created_by: number;
  created_at: string;
  user?: {
    id: number;
    name: string;
  };
}

interface TaskNote {
  id: number;
  task_id: number;
  task_status: number | null;
  comment: string;
  created_by: number;
  created_at: string;
  user?: {
    id: number;
    name: string;
  };
}

interface TaskStatus {
  id: number;
  status: string;
}

interface TaskDetailsModalProps {
  open: boolean;
  onClose: () => void;
  task: Task;
  onTaskUpdate?: (updatedTask: Task) => void;
}

export function TaskDetailsModal({ open, onClose, task, onTaskUpdate }: TaskDetailsModalProps) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [notes, setNotes] = useState<TaskNote[]>([]);
  const [taskStatuses, setTaskStatuses] = useState<TaskStatus[]>([]);
  const [loadingActivities, setLoadingActivities] = useState(false);
  const [loadingNotes, setLoadingNotes] = useState(false);
  const [addNoteModalOpen, setAddNoteModalOpen] = useState(false);
  const [noteFormData, setNoteFormData] = useState({
    comment: '',
    task_status: String(task.status || '1'),
  });
  const [submitting, setSubmitting] = useState(false);
  const [currentTask, setCurrentTask] = useState<Task>(task);

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Format date time
  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Get status label and color
  const getStatusDisplay = (status: string | number | null) => {
    if (!status) return { label: 'Unknown', color: 'bg-gray-100 text-gray-700' };

    const statusNum = typeof status === 'string' ? parseInt(status) : status;

    switch (statusNum) {
      case 1:
        return { label: 'open', color: 'bg-blue-100 text-blue-700' };
      case 2:
        return { label: 'pending', color: 'bg-yellow-100 text-yellow-700' };
      case 3:
        return { label: 'In Progress', color: 'bg-purple-100 text-purple-700' };
      case 4:
        return { label: 'closed', color: 'bg-green-100 text-green-700' };
      default:
        return { label: 'Unknown', color: 'bg-gray-100 text-gray-700' };
    }
  };

  // Fetch activities
  const fetchActivities = async () => {
    if (!task.id) return;

    try {
      setLoadingActivities(true);
      const response = await axios.get(`/tasks/${task.id}/activities`);
      setActivities(response.data);
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setLoadingActivities(false);
    }
  };

  // Fetch notes
  const fetchNotes = async () => {
    if (!task.id) return;

    try {
      setLoadingNotes(true);
      const response = await axios.get(`/tasks/${task.id}/notes`);
      setNotes(response.data);
    } catch (error) {
      console.error('Error fetching notes:', error);
    } finally {
      setLoadingNotes(false);
    }
  };

  // Handle add note
  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!noteFormData.comment.trim()) {
      alert('Please enter a comment');
      return;
    }

    try {
      setSubmitting(true);
      const response = await axios.post(`/tasks/${task.id}/notes`, {
        comment: noteFormData.comment,
        task_status: parseInt(noteFormData.task_status),
      });

      // Update current task with new status
      if (response.data.task) {
        setCurrentTask(response.data.task);

        // Notify parent component of task update
        if (onTaskUpdate) {
          onTaskUpdate(response.data.task);
        }
      }

      // Reset form
      setNoteFormData({
        comment: '',
        task_status: String(response.data.task?.status || task.status || '1'),
      });

      // Close modal
      setAddNoteModalOpen(false);

      // Refresh notes and activities list
      fetchNotes();
      fetchActivities();

    } catch (error: any) {
      console.error('Error adding note:', error);
      alert(error.response?.data?.message || 'Failed to add note');
    } finally {
      setSubmitting(false);
    }
  };

  // Fetch task statuses
  const fetchTaskStatuses = async () => {
    try {
      const response = await axios.get('/task-statuses');
      setTaskStatuses(response.data || []);
    } catch (error) {
      console.error('Error fetching task statuses:', error);
    }
  };

  useEffect(() => {
    if (open && task.id) {
      setCurrentTask(task);
      fetchActivities();
      fetchNotes();
      fetchTaskStatuses();
    }
  }, [open, task.id]);

  const statusDisplay = getStatusDisplay(currentTask.status);

  return (
    <>
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-x-hidden overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <ListTodo className="w-6 h-6 text-purple-600" />
            Task Details
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-[35%_65%] gap-4">
          {/* Left Column - Task Details (35%) */}
          <div className="space-y-4 lg:border-r lg:pr-4 pr-0">
            {/* Task Name */}
            <div>
              <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Task Name
              </Label>
              <p className="mt-1 font-semibold text-gray-900">{currentTask.task_name}</p>
            </div>

            {/* Status */}
            <div className="flex items-center gap-2">
              <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Status:
              </Label>
              <Badge
                className={`${statusDisplay.color} cursor-pointer hover:opacity-80 transition-opacity`}
                onClick={() => setAddNoteModalOpen(true)}
                title="Click to add note"
              >
                {statusDisplay.label}
              </Badge>
            </div>

            {/* Description */}
            <div>
              <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Description
              </Label>
              <p className="mt-1 text-gray-700 text-sm whitespace-pre-wrap">{currentTask.description}</p>
            </div>

            {/* Ticket */}
            {currentTask.ticket && (
              <div>
                <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1">
                  <Ticket className="w-3 h-3" />
                  Ticket
                </Label>
                <div className="mt-1 bg-purple-50 p-2 rounded border border-purple-100">
                  <p className="font-semibold text-purple-600 text-sm">{currentTask.ticket.tracking_number}</p>
                  <p className="text-xs text-gray-600 mt-1">{currentTask.ticket.issue}</p>
                </div>
              </div>
            )}

            {/* Assigned Agents */}
            {currentTask.agent && currentTask.agent.length > 0 && (
              <div>
                <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  Assigned Agents
                </Label>
                <div className="mt-1 space-y-1">
                  {currentTask.agent.map((agent) => (
                    <div key={agent.id} className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-600" />
                      <p className="text-sm text-gray-900">{agent.name}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Due Date */}
            <div className="flex items-center gap-2">
              <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                Due Date:
              </Label>
              <p className="text-gray-900 text-sm">{formatDateTime(currentTask.time)}</p>
            </div>

            {/* Created At */}
            <div className="flex items-center gap-2">
              <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Created At:
              </Label>
              <p className="text-gray-900 text-sm">{formatDateTime(currentTask.created_at)}</p>
            </div>

            {/* Created By */}
            {currentTask.user && (
              <div className="flex items-center gap-2">
                <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1">
                  <User className="w-3 h-3" />
                  Created By:
                </Label>
                <p className="text-gray-900 text-sm font-medium">{currentTask.user.name}</p>
              </div>
            )}
          </div>

          {/* Right Column - Tabs (65%) */}
          <div>
            <Tabs defaultValue="notes" className="w-full">
              <TabsList className="grid grid-cols-2 w-fit">
                <TabsTrigger value="notes" className="flex items-center gap-2" style={{ width: '150px' }}>
                  <MessageSquare className="w-4 h-4" />
                  Notes
                </TabsTrigger>
                <TabsTrigger value="activities" className="flex items-center gap-2" style={{ width: '150px' }}>
                  <ActivityIcon className="w-4 h-4" />
                  Activities
                </TabsTrigger>
              </TabsList>

              {/* Notes Tab */}
              <TabsContent value="notes" className="mt-4">
                <div className="flex justify-end mb-3">
                  <Button
                    onClick={() => setAddNoteModalOpen(true)}
                    size="sm"
                    className="flex items-center gap-1"
                    style={{ marginRight: '20px' }}
                  >
                    <Plus className="w-4 h-4" />
                    Add
                  </Button>
                </div>
                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 mr-2" >
                  {loadingNotes ? (
                    <p className="text-center text-gray-500 py-8">Loading notes...</p>
                  ) : notes.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">No notes found</p>
                  ) : (
                    notes.map((note) => {
                      return (
                        <div key={note.id} className="p-4 bg-white hover:bg-gray-50">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                              <MessageSquare className="w-5 h-5 text-blue-600" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-2">
                                <p className="text-xs text-gray-500">{formatDateTime(note.created_at)}</p>
                                {note.user && (
                                  <p className="text-xs text-gray-600 font-medium">Created By: {note.user.name}</p>
                                )}
                              </div>
                              <p className="text-sm text-gray-700 whitespace-pre-wrap">{note.comment}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </TabsContent>

              {/* Activities Tab */}
              <TabsContent value="activities" className="mt-4">
                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                  {loadingActivities ? (
                    <p className="text-center text-gray-500 py-8">Loading activities...</p>
                  ) : activities.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">No activities found</p>
                  ) : (
                    activities.map((activity) => (
                      <div key={activity.id} className="p-4 bg-white hover:bg-gray-50">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <ActivityIcon className="w-5 h-5 text-purple-600" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <p className="font-semibold text-gray-900">{activity.type}</p>
                              <p className="text-xs text-gray-500">{formatDateTime(activity.created_at)}</p>
                            </div>
                            <p className="text-sm text-gray-700 mt-1">{activity.note}</p>
                            {activity.user && (
                              <p className="text-xs text-gray-500 mt-2">By: {activity.user.name}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        <DialogFooter className="mt-4">
          <Button onClick={onClose} variant="outline">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    {/* Add Note Modal */}
    <Dialog open={addNoteModalOpen} onOpenChange={setAddNoteModalOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Note</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleAddNote} className="space-y-4">
          {/* Task Status */}
          <div>
            <Label htmlFor="task_status">Task Status</Label>
            <Select
              value={noteFormData.task_status}
              onValueChange={(value) =>
                setNoteFormData({ ...noteFormData, task_status: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
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

          {/* Comment */}
          <div>
            <Label htmlFor="comment">Comment</Label>
            <Textarea
              id="comment"
              value={noteFormData.comment}
              onChange={(e) =>
                setNoteFormData({ ...noteFormData, comment: e.target.value })
              }
              placeholder="Enter your note here..."
              rows={5}
              required
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setAddNoteModalOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
    </>
  );
}
