import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';
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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
  X,
  Calendar,
  Users,
  ListTodo,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { AddTaskModal } from '@/components/AddTaskModal';
import { TaskDetailsModal } from '@/components/TaskDetailsModal';
import { TaskTicketInfoModal } from '@/components/TaskTicketInfoModal';

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
  status: string | null;
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
    description?: string;
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
  branch?: {
    id: number;
    branch_name: string;
  };
  task_status?: {
    id: number;
    status: string;
  };
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

export default function Tasks() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [perPage, setPerPage] = useState('15');
  const [searchTerm, setSearchTerm] = useState('');
  const [totalItems, setTotalItems] = useState(0);

  // Filters
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');
  const [filterAgent, setFilterAgent] = useState('all');
  const [filterTaskType, setFilterTaskType] = useState('all');
  const [filterTaskCategory, setFilterTaskCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  // Reference data
  const [taskTypes, setTaskTypes] = useState<TaskType[]>([]);
  const [taskCategories, setTaskCategories] = useState<TaskCategory[]>([]);
  const [taskStatuses, setTaskStatuses] = useState<TaskStatus[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);

  // Modals
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deletingTask, setDeletingTask] = useState<Task | null>(null);
  const [ticketModalOpen, setTicketModalOpen] = useState(false);
  const [ticketData, setTicketData] = useState<any>(null);
  const [loadingTicket, setLoadingTicket] = useState(false);

  // Fetch tasks with filters and pagination
  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params: any = {
        page: currentPage,
        per_page: perPage,
      };

      if (searchTerm) params.search = searchTerm;
      if (filterStartDate) params.start_date = filterStartDate;
      if (filterEndDate) params.end_date = filterEndDate;
      if (filterAgent && filterAgent !== 'all') params.agent_id = filterAgent;
      if (filterTaskType && filterTaskType !== 'all') params.type_id = filterTaskType;
      if (filterTaskCategory && filterTaskCategory !== 'all') params.category_id = filterTaskCategory;
      if (filterStatus && filterStatus !== 'all') params.status = filterStatus;

      const response = await axios.get('/tasks', { params });

      if (response.data) {
        setTasks(response.data.data || []);
        setCurrentPage(response.data.current_page || 1);
        setTotalPages(response.data.last_page || 1);
        setTotalItems(response.data.total || 0);
      }
    } catch (err: any) {
      console.error('Error fetching tasks:', err);
      setError(err.response?.data?.message || 'Failed to fetch tasks');
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, [currentPage, perPage, searchTerm, filterStartDate, filterEndDate, filterAgent, filterTaskType, filterTaskCategory, filterStatus]);

  // Fetch reference data
  const fetchReferenceData = async () => {
    try {
      const [typesRes, categoriesRes, statusesRes, agentsRes] = await Promise.all([
        axios.get('/task-types'),
        axios.get('/task-categories'),
        axios.get('/task-statuses'),
        axios.get('/task-agents'),
      ]);

      setTaskTypes(typesRes.data || []);
      setTaskCategories(categoriesRes.data || []);
      setTaskStatuses(statusesRes.data || []);
      setAgents(agentsRes.data || []);
    } catch (err) {
      console.error('Error fetching reference data:', err);
      toast.error('Failed to load filter options');
    }
  };

  useEffect(() => {
    fetchReferenceData();
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Handle page change
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  // Handle per page change
  const handlePerPageChange = (value: string) => {
    setPerPage(value);
    setCurrentPage(1); // Reset to first page
  };

  // Handle search
  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  // Clear all filters
  const clearFilters = () => {
    setFilterStartDate('');
    setFilterEndDate('');
    setFilterTaskType('all');
    setFilterTaskCategory('all');
    setFilterStatus('all');
    setFilterAgent('all');
    setSearchTerm('');
    setCurrentPage(1);
  };

  // Handle view details
  const handleViewDetails = (task: Task) => {
    setSelectedTask(task);
    setDetailsModalOpen(true);
  };

  // Handle edit task
  const handleEditTask = (task: Task) => {
    setSelectedTask(task);
    setEditModalOpen(true);
  };

  // Handle delete task
  const handleDeleteTask = (task: Task) => {
    setDeletingTask(task);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!deletingTask) return;

    try {
      await axios.delete(`/tasks/${deletingTask.id}`);
      toast.success('Task deleted successfully');
      fetchTasks();
      setDeleteConfirmOpen(false);
      setDeletingTask(null);
    } catch (err: any) {
      console.error('Error deleting task:', err);
      toast.error(err.response?.data?.message || 'Failed to delete task');
    }
  };

  // Handle ticket link click
  const handleTicketClick = async (trackingNumber: string) => {
    try {
      setLoadingTicket(true);
      const response = await axios.get(`/task-ticket/${trackingNumber}`);
      setTicketData(response.data);
      setTicketModalOpen(true);
    } catch (err: any) {
      console.error('Error fetching ticket:', err);
      toast.error(err.response?.data?.message || 'Failed to load ticket details');
    } finally {
      setLoadingTicket(false);
    }
  };

  // Get status display info from task_status relationship
  const getStatusDisplay = (task: Task) => {
    const statusLabel = task.task_status?.status || 'Unknown';
    const statusNum = typeof task.status === 'string' ? parseInt(task.status) : task.status;

    // Determine color based on status id
    let color = 'bg-gray-100 text-gray-700 border border-gray-300';
    switch (statusNum) {
      case 1:
        color = 'bg-blue-100 text-blue-700 border border-blue-300';
        break;
      case 2:
        color = 'bg-yellow-100 text-yellow-700 border border-yellow-300';
        break;
      case 3:
        color = 'bg-purple-100 text-purple-700 border border-purple-300';
        break;
      case 4:
        color = 'bg-green-100 text-green-700 border border-green-300';
        break;
    }

    return { label: statusLabel, color };
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Format date time
  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const hasActiveFilters =
    filterStartDate ||
    filterEndDate ||
    (filterTaskType && filterTaskType !== 'all') ||
    (filterTaskCategory && filterTaskCategory !== 'all') ||
    searchTerm;

  // Calculate task statistics
  const totalTasks = totalItems;
  const openTasks = tasks.filter(task => task.status === '1' || task.status === 1).length;
  const pendingTasks = tasks.filter(task => task.status === '2' || task.status === 2).length;
  const inProgressTasks = tasks.filter(task => task.status === '3' || task.status === 3).length;
  const closedTasks = tasks.filter(task => task.status === '4' || task.status === 4).length;
  const overdueTasks = tasks.filter(task => {
    const isNotClosed = task.status !== '4' && task.status !== 4;
    const isPastDue = new Date(task.time) < new Date();
    return isNotClosed && isPastDue;
  }).length;

  return (
    <DashboardLayout>
      <div className="space-y-4 md:space-y-6 p-2 sm:p-4 md:p-0">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Tasks</h1>
            <p className="text-sm sm:text-base text-gray-500 mt-1">Manage and track all tasks</p>
          </div>
          <Button onClick={() => setAddModalOpen(true)} className="w-full sm:w-auto">
            <Plus className="w-4 h-4 mr-2" />
            Add Task
          </Button>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3 md:gap-4">
          {/* Total Tasks */}
          <div className="bg-white rounded-lg shadow p-3 sm:p-4 md:p-6 border border-gray-200" style={{ height: '85px' }}>
            <div className="flex items-center justify-between h-full">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">Total Tasks</p>
                <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mt-1 sm:mt-2">{totalTasks}</p>
              </div>
              <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <ListTodo className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-purple-600" />
              </div>
            </div>
          </div>

          {/* Open Tasks */}
          <div className="bg-white rounded-lg shadow p-3 sm:p-4 md:p-6 border border-gray-200" style={{ height: '85px' }}>
            <div className="flex items-center justify-between h-full">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">Open</p>
                <p className="text-xl sm:text-2xl md:text-3xl font-bold text-blue-600 mt-1 sm:mt-2">{openTasks}</p>
              </div>
              <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-blue-600" />
              </div>
            </div>
          </div>

          {/* Pending Tasks */}
          <div className="bg-white rounded-lg shadow p-3 sm:p-4 md:p-6 border border-gray-200" style={{ height: '85px' }}>
            <div className="flex items-center justify-between h-full">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">Pending</p>
                <p className="text-xl sm:text-2xl md:text-3xl font-bold text-yellow-600 mt-1 sm:mt-2">{pendingTasks}</p>
              </div>
              <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <Clock className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          {/* In Progress Tasks */}
          <div className="bg-white rounded-lg shadow p-3 sm:p-4 md:p-6 border border-gray-200" style={{ height: '85px' }}>
            <div className="flex items-center justify-between h-full">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">In Progress</p>
                <p className="text-xl sm:text-2xl md:text-3xl font-bold text-purple-600 mt-1 sm:mt-2">{inProgressTasks}</p>
              </div>
              <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <ListTodo className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-purple-600" />
              </div>
            </div>
          </div>

          {/* Closed Tasks */}
          <div className="bg-white rounded-lg shadow p-3 sm:p-4 md:p-6 border border-gray-200" style={{ height: '85px' }}>
            <div className="flex items-center justify-between h-full">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">Closed</p>
                <p className="text-xl sm:text-2xl md:text-3xl font-bold text-green-600 mt-1 sm:mt-2">{closedTasks}</p>
              </div>
              <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-green-100 rounded-full flex items-center justify-center">
                <XCircle className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-green-600" />
              </div>
            </div>
          </div>

          {/* Overdue Tasks */}
          <div className="bg-white rounded-lg shadow p-3 sm:p-4 md:p-6 border border-gray-200" style={{ height: '85px' }}>
            <div className="flex items-center justify-between h-full">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">Overdue</p>
                <p className="text-xl sm:text-2xl md:text-3xl font-bold text-red-600 mt-1 sm:mt-2">{overdueTasks}</p>
              </div>
              <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-red-100 rounded-full flex items-center justify-center">
                <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters Section */}
        <div className="bg-white rounded-lg shadow p-3 sm:p-4">
          <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3">
            <span className="text-xs sm:text-sm font-semibold text-gray-700">Filter By:</span>

            {/* Start Date */}
            <Input
              type="date"
              value={filterStartDate}
              onChange={(e) => {
                setFilterStartDate(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="dd/mm/yyyy"
              className="w-full md:w-[170px] text-xs sm:text-sm"
            />

            {/* End Date */}
            <Input
              type="date"
              value={filterEndDate}
              onChange={(e) => {
                setFilterEndDate(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="dd/mm/yyyy"
              className="w-full md:w-[170px] text-xs sm:text-sm"
            />

            {/* Task Category */}
            <Select value={String(filterTaskCategory)} onValueChange={(value) => {
              setFilterTaskCategory(value);
              setCurrentPage(1);
            }}>
              <SelectTrigger className="w-full md:w-[170px] text-xs sm:text-sm">
                <SelectValue placeholder="Select Task Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {taskCategories.map((category) => (
                  <SelectItem key={category.id} value={String(category.id)}>
                    {String(category.category)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Task Status */}
            <Select value={String(filterTaskType)} onValueChange={(value) => {
              setFilterTaskType(value);
              setCurrentPage(1);
            }}>
              <SelectTrigger className="w-full md:w-[170px] text-xs sm:text-sm">
                <SelectValue placeholder="Select Task Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                  {taskStatuses.map((status) => (
                  <SelectItem key={status.id} value={String(status.id)}>
                    {String(status.status)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Action Buttons */}
            <div className="flex gap-2 w-full md:w-auto">
              <Button className="px-4 sm:px-6 md:px-8 text-xs sm:text-sm flex-1 md:flex-none">
                Filter
              </Button>

              {/* Clear Button */}
              {hasActiveFilters && (
                <Button variant="outline" onClick={clearFilters} className="px-4 sm:px-6 text-xs sm:text-sm flex-1 md:flex-none">
                  Clear
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Tasks Table with Show entries and Search */}
        <div className="bg-white rounded-lg shadow border" style={{ borderColor: '#e4e4e4' }}>
          {/* Show entries and Search - Inside card */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-3 sm:px-4 py-3 sm:py-4 border-b" style={{ borderColor: '#e4e4e4' }}>
            {/* Left side - Show entries */}
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm text-gray-700">Show</span>
              <Select value={perPage} onValueChange={handlePerPageChange}>
                <SelectTrigger className="w-16 sm:w-20 text-xs sm:text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="15">15</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Right side - Search */}
            <div className="flex items-center gap-2 flex-1 sm:flex-initial">
              <Input
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="flex-1 sm:w-48 md:w-64 text-xs sm:text-sm"
              />
            </div>
          </div>

          {/* Table content */}
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading tasks...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center text-red-600">
                <p className="text-lg font-semibold">Error</p>
                <p>{error}</p>
              </div>
            </div>
          ) : tasks.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center text-gray-500">
                <ListTodo className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-semibold">No tasks found</p>
                <p className="mt-2">
                  {hasActiveFilters
                    ? 'Try adjusting your filters'
                    : 'Get started by creating a new task'
                  }
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Mobile Card View */}
              <div className="block md:hidden divide-y divide-gray-200">
                {tasks.map((task, index) => {
                  const { label, color } = getStatusDisplay(task);
                  return (
                    <div key={task.id} className="p-4 hover:bg-gray-50">
                      <div className="space-y-3">
                        {/* Task Name and Number */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <button
                              onClick={() => handleViewDetails(task)}
                              className="font-semibold text-blue-600 hover:text-blue-800 text-left break-words text-sm"
                            >
                              #{(currentPage - 1) * parseInt(perPage) + index + 1}. {task.task_name}
                            </button>
                            {task.description && (
                              <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                                {task.description}
                              </p>
                            )}
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleViewDetails(task)}>
                                <Eye className="w-4 h-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleEditTask(task)}>
                                <Edit className="w-4 h-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              {(user?.role_id === 1 || task.user_id === user?.id) && (
                                <DropdownMenuItem
                                  onClick={() => handleDeleteTask(task)}
                                  className="text-red-600"
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>

                        {/* Status */}
                        <div>
                          {(() => {
                            const statusBadge = (
                              <span className={`inline-flex items-center ${color} px-2.5 py-1 rounded text-xs font-semibold`}>
                                {String(label)}
                              </span>
                            );

                            if (task.closing_comment) {
                              return (
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      {statusBadge}
                                    </TooltipTrigger>
                                    <TooltipContent className="max-w-xs">
                                      <p className="font-semibold mb-1">Closing Comment:</p>
                                      <p className="text-sm">{task.closing_comment}</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              );
                            }
                            return statusBadge;
                          })()}
                        </div>

                        {/* Info Grid */}
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          {task.ticket && (
                            <div>
                              <span className="text-gray-500">Ticket:</span>
                              <button
                                onClick={() => handleTicketClick(task.ticket!.tracking_number)}
                                className="ml-1 text-blue-600 hover:text-blue-800 hover:underline font-medium"
                                disabled={loadingTicket}
                              >
                                {String(task.ticket.tracking_number)}
                              </button>
                            </div>
                          )}
                          {task.category && (
                            <div>
                              <span className="text-gray-500">Category:</span>
                              <span className="ml-1 font-medium text-gray-900">
                                {String(task.category.category)}
                              </span>
                            </div>
                          )}
                          {task.branch && (
                            <div>
                              <span className="text-gray-500">Branch:</span>
                              <span className="ml-1 text-gray-900">{task.branch.branch_name}</span>
                            </div>
                          )}
                          <div>
                            <span className="text-gray-500">Created by:</span>
                            <span className="ml-1 text-gray-900">{task.user?.name || 'N/A'}</span>
                          </div>
                        </div>

                        {/* Agents */}
                        {task.agent && task.agent.length > 0 && (
                          <div className="text-xs">
                            <span className="text-gray-500">Agents:</span>
                            <span className="ml-1 text-gray-900">
                              {task.agent.map(agent => String(agent.name)).join(', ')}
                            </span>
                          </div>
                        )}

                        {/* Dates */}
                        <div className="flex justify-between text-xs text-gray-500 pt-2 border-t border-gray-100">
                          <span>Due: {formatDateTime(task.time)}</span>
                          <span>Created: {formatDate(task.created_at)}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <Table style={{ borderCollapse: 'collapse' }}>
                  <TableHeader style={{ backgroundColor: '#f9fafb' }}>
                    <TableRow className="border-b" style={{ borderColor: '#e4e4e4' }}>
                      <TableHead className="border-r font-medium text-gray-700 text-sm" style={{ borderColor: '#e4e4e4' }}>#</TableHead>
                      <TableHead className="border-r font-medium text-gray-700 text-sm" style={{ borderColor: '#e4e4e4' }}>Task Name</TableHead>
                      <TableHead className="border-r font-medium text-gray-700 text-sm" style={{ borderColor: '#e4e4e4' }}>Ticket</TableHead>
                      <TableHead className="border-r font-medium text-gray-700 text-sm" style={{ borderColor: '#e4e4e4' }}>Category</TableHead>
                      <TableHead className="border-r font-medium text-gray-700 text-sm" style={{ borderColor: '#e4e4e4' }}>Assigned Agents</TableHead>
                      <TableHead className="border-r font-medium text-gray-700 text-sm" style={{ borderColor: '#e4e4e4' }}>Branch</TableHead>
                      <TableHead className="border-r font-medium text-gray-700 text-sm" style={{ borderColor: '#e4e4e4' }}>Due Date</TableHead>
                      <TableHead className="border-r font-medium text-gray-700 text-sm" style={{ borderColor: '#e4e4e4' }}>Status</TableHead>
                      <TableHead className="border-r font-medium text-gray-700 text-sm" style={{ borderColor: '#e4e4e4' }}>Created By</TableHead>
                      <TableHead className="border-r font-medium text-gray-700 text-sm" style={{ borderColor: '#e4e4e4' }}>Created At</TableHead>
                      <TableHead className="text-center font-medium text-gray-700 text-sm">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tasks.map((task, index) => (
                      <TableRow key={task.id} className="hover:bg-gray-50 border-b" style={{ borderColor: '#e4e4e4' }}>
                        <TableCell className="border-r text-center" style={{ borderColor: '#e4e4e4' }}>
                          {(currentPage - 1) * parseInt(perPage) + index + 1}
                        </TableCell>
                        <TableCell className="border-r" style={{ borderColor: '#e4e4e4' }}>
                          <div>
                            <button
                              onClick={() => handleViewDetails(task)}
                              className="font-medium text-blue-600 hover:text-blue-800 hover:underline text-left transition-colors"
                            >
                              {task.task_name}
                            </button>
                            {task.description && (
                              <p className="text-sm text-gray-500 truncate max-w-xs">
                                {task.description}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="border-r" style={{ borderColor: '#e4e4e4' }}>
                          {task.ticket ? (
                            <button
                              onClick={() => handleTicketClick(task.ticket!.tracking_number)}
                              className="text-sm text-blue-600 hover:text-blue-800 hover:underline font-medium transition-colors"
                              disabled={loadingTicket}
                            >
                              {String(task.ticket.tracking_number)}
                            </button>
                          ) : (
                            <span className="text-gray-400 text-sm">N/A</span>
                          )}
                        </TableCell>
                        <TableCell className="border-r" style={{ borderColor: '#e4e4e4' }}>
                          {task.category ? (
                            <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold text-foreground">
                              {String(task.category.category)}
                            </span>
                          ) : null}
                        </TableCell>
                        <TableCell className="border-r" style={{ borderColor: '#e4e4e4' }}>
                          {task.agent && task.agent.length > 0 ? (
                            <span className="text-sm text-gray-900">
                              {task.agent.map(agent => String(agent.name)).join(', ')}
                            </span>
                          ) : (
                            <span className="text-sm text-gray-400">No agents</span>
                          )}
                        </TableCell>
                        <TableCell className="border-r" style={{ borderColor: '#e4e4e4' }}>
                          {task.branch ? (
                            <span className="text-sm text-gray-900">{task.branch.branch_name}</span>
                          ) : (
                            <span className="text-sm text-gray-400">N/A</span>
                          )}
                        </TableCell>
                        <TableCell className="text-sm border-r" style={{ borderColor: '#e4e4e4' }}>
                          {formatDateTime(task.time)}
                        </TableCell>
                        <TableCell className="border-r" style={{ borderColor: '#e4e4e4' }}>
                          {(() => {
                            const { label, color } = getStatusDisplay(task);
                            const statusBadge = (
                              <span className={`inline-flex items-center ${color} px-3 py-1 rounded text-xs font-semibold cursor-pointer`}>
                                {String(label)}
                              </span>
                            );

                            // Show tooltip with closing comment if it exists
                            if (task.closing_comment) {
                              return (
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      {statusBadge}
                                    </TooltipTrigger>
                                    <TooltipContent className="max-w-xs">
                                      <p className="font-semibold mb-1">Closing Comment:</p>
                                      <p className="text-sm">{task.closing_comment}</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              );
                            }

                            return statusBadge;
                          })()}
                        </TableCell>
                        <TableCell className="text-sm border-r" style={{ borderColor: '#e4e4e4' }}>
                          {task.user?.name || 'N/A'}
                        </TableCell>
                        <TableCell className="text-sm text-gray-500 border-r" style={{ borderColor: '#e4e4e4' }}>
                          {formatDate(task.created_at)}
                        </TableCell>
                        <TableCell className="text-center">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleViewDetails(task)}>
                                <Eye className="w-4 h-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleEditTask(task)}>
                                <Edit className="w-4 h-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              {(user?.role_id === 1 || task.user_id === user?.id) && (
                                <DropdownMenuItem
                                  onClick={() => handleDeleteTask(task)}
                                  className="text-red-600"
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-3 sm:px-4 py-3 border-t" style={{ borderColor: '#e4e4e4', backgroundColor: '#ffffff' }}>
                <div className="flex items-center justify-center sm:justify-start">
                  <span className="text-xs sm:text-sm text-gray-600">
                    Showing {Math.min((currentPage - 1) * parseInt(perPage) + 1, totalItems)} to{' '}
                    {Math.min(currentPage * parseInt(perPage), totalItems)} of {totalItems} entries
                  </span>
                </div>

                <div className="flex items-center justify-center gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1 || loading}
                      className="text-xs sm:text-sm px-2 sm:px-4 border-gray-300"
                    >
                      Prev
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

                        // First page with ellipsis
                        if (startPage > 1) {
                          pages.push(
                            <Button
                              key={1}
                              variant="outline"
                              size="sm"
                              onClick={() => handlePageChange(1)}
                              disabled={loading}
                              className="w-7 h-7 sm:w-9 sm:h-9 p-0 text-xs sm:text-sm bg-white border-gray-300 hover:bg-gray-50"
                            >
                              1
                            </Button>
                          );
                          if (startPage > 2) {
                            pages.push(
                              <span key="start-ellipsis" className="px-1 sm:px-2 text-slate-400 text-xs sm:text-sm">
                                ...
                              </span>
                            );
                          }
                        }

                        // Page numbers
                        for (let i = startPage; i <= endPage; i++) {
                          pages.push(
                            <Button
                              key={i}
                              variant={currentPage === i ? "default" : "outline"}
                              size="sm"
                              onClick={() => handlePageChange(i)}
                              disabled={loading}
                              className={`w-7 h-7 sm:w-9 sm:h-9 p-0 text-xs sm:text-sm ${
                                currentPage === i
                                  ? 'bg-blue-600 text-white hover:bg-blue-700 border-blue-600'
                                  : 'bg-white border-gray-300 hover:bg-gray-50'
                              }`}
                            >
                              {i}
                            </Button>
                          );
                        }

                        // Last page with ellipsis
                        if (endPage < totalPages) {
                          if (endPage < totalPages - 1) {
                            pages.push(
                              <span key="end-ellipsis" className="px-1 sm:px-2 text-slate-400 text-xs sm:text-sm">
                                ...
                              </span>
                            );
                          }
                          pages.push(
                            <Button
                              key={totalPages}
                              variant="outline"
                              size="sm"
                              onClick={() => handlePageChange(totalPages)}
                              disabled={loading}
                              className="w-7 h-7 sm:w-9 sm:h-9 p-0 text-xs sm:text-sm bg-white border-gray-300 hover:bg-gray-50"
                            >
                              {totalPages}
                            </Button>
                          );
                        }

                        return pages;
                      })()}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages || loading}
                      className="text-xs sm:text-sm px-2 sm:px-4 border-gray-300"
                    >
                      Next
                    </Button>
                  </div>
                </div>
            </>
          )}
        </div>
      </div>

      {/* Add Task Modal */}
      <AddTaskModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSuccess={() => {
          fetchTasks();
          setAddModalOpen(false);
        }}
      />

      {/* Edit Task Modal */}
      <AddTaskModal
        open={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setSelectedTask(null);
        }}
        onSuccess={() => {
          fetchTasks();
          setEditModalOpen(false);
          setSelectedTask(null);
        }}
        task={selectedTask || undefined}
      />

      {/* Task Details Modal */}
      {selectedTask && (
        <TaskDetailsModal
          open={detailsModalOpen}
          onClose={() => {
            setDetailsModalOpen(false);
            setSelectedTask(null);
          }}
          task={selectedTask}
          onTaskUpdate={(updatedTask) => {
            // Update the task in the tasks list
            setTasks((prevTasks) =>
              prevTasks.map((t) => (t.id === updatedTask.id ? updatedTask : t))
            );
            // Update selectedTask to reflect changes
            setSelectedTask(updatedTask);
          }}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Task</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the task "{deletingTask?.task_name}"? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setDeleteConfirmOpen(false);
              setDeletingTask(null);
            }}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Ticket Info Modal */}
      <TaskTicketInfoModal
        open={ticketModalOpen}
        onClose={() => {
          setTicketModalOpen(false);
          setTicketData(null);
        }}
        ticketData={ticketData}
      />
    </DashboardLayout>
  );
}
