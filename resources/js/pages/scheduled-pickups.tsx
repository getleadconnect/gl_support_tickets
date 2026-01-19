import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { DashboardLayout } from '@/components/dashboard-layout';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Textarea } from '@/components/ui/textarea';
import { Search, Edit2, Calendar, Clock, MapPin, User, Phone, Trash2, Download, FileDown } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

interface SchedulePickup {
  id: number;
  ticket_id: number;
  address: string;
  landmark: string | null;
  schedule_date: string;
  time_slot: string;
  contact_person: string;
  mobile: string;
  status: string;
  created_at: string;
  updated_at: string;
  ticket?: {
    id: number;
    tracking_number: string;
    issue: string;
    customer_id: number;
  };
  customer?: {
    id: number;
    name: string;
    mobile: string;
    country_code: string;
  };
  branch?: {
    id: number;
    branch_name: string;
  };
}

export default function ScheduledPickups() {
  const [pickups, setPickups] = useState<SchedulePickup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedPickup, setSelectedPickup] = useState<SchedulePickup | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [editForm, setEditForm] = useState({
    address: '',
    landmark: '',
    schedule_date: '',
    time_slot: '',
    contact_person: '',
    mobile: ''
  });
  const [pickupTime, setPickupTime] = useState(660); // Default: 11:00 AM
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [selectedPickupForStatus, setSelectedPickupForStatus] = useState<SchedulePickup | null>(null);
  const [statusNote, setStatusNote] = useState('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [userRole, setUserRole] = useState<number | null>(null);
  const [userInfo, setUserInfo] = useState<{role_id: number, branch_id: number} | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [selectedPickupForDelete, setSelectedPickupForDelete] = useState<SchedulePickup | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Filter states
  const [startDate, setStartDate] = useState(() => {
    // Set default to current date
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => {
    // Set default to current date
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedBranch, setSelectedBranch] = useState('all');
  const [branches, setBranches] = useState<{id: number, branch_name: string}[]>([]);
  const [isExporting, setIsExporting] = useState(false);
  const [pickupCounts, setPickupCounts] = useState<{[key: string]: number}>({});

  useEffect(() => {
    fetchUserInfo();
    // Initial fetch with current date filter
    fetchScheduledPickups();
  }, []);

  // Fetch branches and pickup counts after user info is loaded
  useEffect(() => {
    if (userInfo) {
      fetchBranches();
      // Only fetch counts for admin and branch admin users
      if (userInfo.role_id === 1 || userInfo.role_id === 4) {
        fetchPickupCounts();
      }
    }
  }, [userInfo]);

  // Debounce search term - delay API call by 500ms after user stops typing
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchScheduledPickups();
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch data immediately when other filters or pagination changes
  useEffect(() => {
    fetchScheduledPickups();
  }, [currentPage, perPage, startDate, endDate, selectedStatus, selectedBranch]);

  // Helper function to convert minutes to time format
  const minutesToTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHour = hours > 12 ? hours - 12 : (hours === 0 ? 12 : hours);
    return `${displayHour}:${mins.toString().padStart(2, '0')} ${ampm}`;
  };

  // Helper function to convert time string back to minutes
  const timeToMinutes = (timeString: string): number => {
    if (!timeString) return 660; // Default to 11:00 AM
    
    try {
      // Handle formats like "2:30 PM" or "11:00 AM"
      const timeRegex = /(\d{1,2}):(\d{2})\s*(AM|PM)/i;
      const match = timeString.match(timeRegex);
      
      if (match) {
        let hours = parseInt(match[1]);
        const minutes = parseInt(match[2]);
        const ampm = match[3].toUpperCase();
        
        // Convert to 24-hour format
        if (ampm === 'PM' && hours !== 12) {
          hours += 12;
        } else if (ampm === 'AM' && hours === 12) {
          hours = 0;
        }
        
        const totalMinutes = hours * 60 + minutes;
        
        // Ensure the time is within our range (11:00 AM to 5:00 PM)
        if (totalMinutes >= 660 && totalMinutes <= 1020) {
          return totalMinutes;
        }
      }
    } catch (error) {
      console.error('Error parsing time string:', timeString, error);
    }
    
    return 660; // Default fallback to 11:00 AM
  };

  // Update time slot when pickup time changes
  useEffect(() => {
    const timeStr = minutesToTime(pickupTime);
    setEditForm(prev => ({
      ...prev,
      time_slot: timeStr
    }));
  }, [pickupTime]);

  const fetchUserInfo = async () => {
    try {
      const response = await axios.get('/user');
      console.log('User API response:', response.data); // Debug log
      if (response.data && response.data.user && response.data.user.role_id) {
        setUserRole(response.data.user.role_id);
        setUserInfo({
          role_id: response.data.user.role_id,
          branch_id: response.data.user.branch_id
        });
        console.log('User role set to:', response.data.user.role_id); // Debug log
      }
    } catch (err: any) {
      console.error('Error fetching user info:', err);
    }
  };

  const fetchBranches = async () => {
    try {
      const response = await axios.get('/branches');
      const allBranches = response.data || [];
      
      // For branch admin users (role_id = 4), only show their own branch
      if (userInfo && userInfo.role_id === 4 && userInfo.branch_id) {
        const userBranch = allBranches.find((branch: any) => branch.id === userInfo.branch_id);
        setBranches(userBranch ? [userBranch] : []);
        
        // Auto-select user's branch for branch admin
        if (userBranch) {
          setSelectedBranch(userBranch.id.toString());
        }
      } else {
        // For admin and other users, show all branches
        setBranches(allBranches);
      }
    } catch (error) {
      console.error('Error fetching branches:', error);
    }
  };

  const fetchPickupCounts = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await axios.get(`/schedule-pickups?start_date=${today}&end_date=${today}&export=counts`);
      
      // Process the response to get counts by branch
      const counts: {[key: string]: number} = {};
      if (response.data && response.data.data) {
        const pickups = response.data.data;
        
        // Count total pickups for today
        counts['total'] = pickups.length;
        
        // Count pickups by branch
        pickups.forEach((pickup: any) => {
          const branchName = pickup.branch?.branch_name || 'Unknown';
          counts[branchName] = (counts[branchName] || 0) + 1;
        });
      }
      
      setPickupCounts(counts);
    } catch (error) {
      console.error('Error fetching pickup counts:', error);
    }
  };

  const fetchScheduledPickups = async (clearFilters = false) => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        per_page: perPage.toString(),
        search: clearFilters ? '' : searchTerm,
        start_date: clearFilters ? '' : startDate,
        end_date: clearFilters ? '' : endDate,
        status: clearFilters ? '' : (selectedStatus === 'all' ? '' : selectedStatus),
        branch_id: clearFilters ? '' : (selectedBranch === 'all' ? '' : selectedBranch)
      });

      const response = await axios.get(`/schedule-pickups?${params}`);
      console.log('Scheduled Pickups API response:', response.data);

      if (response.data && response.data.data && Array.isArray(response.data.data)) {
        setPickups(response.data.data);
        setTotalRecords(response.data.total || 0);
        setTotalPages(response.data.last_page || 0);
      } else if (Array.isArray(response.data)) {
        // Fallback for non-paginated response
        setPickups(response.data);
        setTotalRecords(response.data.length);
        setTotalPages(1);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err: any) {
      console.error('Error fetching scheduled pickups:', err);
      setError(err.response?.data?.message || err.message || 'Failed to fetch scheduled pickups');
      setPickups([]);
      setTotalRecords(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handlePerPageChange = (value: string) => {
    setPerPage(parseInt(value));
    setCurrentPage(1);
  };

  const handleEditPickup = (pickup: SchedulePickup) => {
    setSelectedPickup(pickup);
    
    // Parse the existing time_slot and set it to the slider
    const parsedTime = timeToMinutes(pickup.time_slot);
    setPickupTime(parsedTime);
    
    setEditForm({
      address: pickup.address,
      landmark: pickup.landmark || '',
      schedule_date: pickup.schedule_date || '',
      time_slot: pickup.time_slot,
      contact_person: pickup.contact_person,
      mobile: pickup.mobile
    });
    
    setEditModalOpen(true);
  };

  const handleUpdatePickup = async () => {
    if (!selectedPickup) return;

    // Basic validation
    if (!editForm.address || !editForm.schedule_date || !editForm.time_slot || !editForm.contact_person || !editForm.mobile) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsUpdating(true);
    try {
      const response = await axios.put(`/schedule-pickups/${selectedPickup.id}`, editForm);
      
      if (response.status === 200) {
        toast.success('Schedule pickup updated successfully!');
        setEditModalOpen(false);
        setSelectedPickup(null);
        fetchScheduledPickups(); // Refresh the list
      }
    } catch (error: any) {
      console.error('Error updating schedule pickup:', error);
      toast.error(error.response?.data?.message || 'Failed to update schedule pickup');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleStatusClick = (pickup: SchedulePickup) => {
    if (pickup.status === 'Collected') {
      // Cannot change status if already collected
      toast.info('Status cannot be changed once collected');
      return;
    }
    
    setSelectedPickupForStatus(pickup);
    setStatusNote('');
    setStatusModalOpen(true);
  };

  const handleStatusUpdate = async () => {
    if (!selectedPickupForStatus) return;

    if (!statusNote.trim()) {
      toast.error('Please enter a note');
      return;
    }

    setIsUpdatingStatus(true);
    try {
      // Update pickup status to "Collected"
      await axios.put(`/schedule-pickups/${selectedPickupForStatus.id}`, {
        ...selectedPickupForStatus,
        status: 'Collected'
      });

      // Add note to ticket_customer_notes
      await axios.post(`/tickets/${selectedPickupForStatus.ticket_id}/customer-notes`, {
        note: statusNote.trim(),
        customer_id: selectedPickupForStatus.ticket?.customer_id
      });

      toast.success('Status updated and note added successfully!');
      setStatusModalOpen(false);
      setSelectedPickupForStatus(null);
      setStatusNote('');
      fetchScheduledPickups(); // Refresh the list
    } catch (error: any) {
      console.error('Error updating status:', error);
      toast.error(error.response?.data?.message || 'Failed to update status');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleDeleteClick = (pickup: SchedulePickup) => {
    setSelectedPickupForDelete(pickup);
    setDeleteConfirmOpen(true);
  };

  const handleDeletePickup = async () => {
    if (!selectedPickupForDelete) return;

    setIsDeleting(true);
    try {
      await axios.delete(`/schedule-pickups/${selectedPickupForDelete.id}`);
      toast.success('Schedule pickup deleted successfully!');
      setDeleteConfirmOpen(false);
      setSelectedPickupForDelete(null);
      fetchScheduledPickups(); // Refresh the list
    } catch (error: any) {
      console.error('Error deleting pickup:', error);
      toast.error(error.response?.data?.message || 'Failed to delete pickup');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleFilter = () => {
    setCurrentPage(1);
    fetchScheduledPickups();
  };

  const handleClearFilter = () => {
    const today = new Date().toISOString().split('T')[0];
    setStartDate(today);
    setEndDate(today);
    setSelectedStatus('all');
    
    // For branch admin, don't reset branch selection to 'all'
    if (userInfo && userInfo.role_id === 4 && userInfo.branch_id) {
      setSelectedBranch(userInfo.branch_id.toString());
    } else {
      setSelectedBranch('all');
    }
    
    setSearchTerm('');
    setCurrentPage(1);
    fetchScheduledPickups(true);
  };

  // Export function
  const handleExport = async () => {
    setIsExporting(true);
    try {
      const params = new URLSearchParams({
        search: searchTerm,
        start_date: startDate,
        end_date: endDate,
        status: selectedStatus === 'all' ? '' : selectedStatus,
        branch_id: selectedBranch === 'all' ? '' : selectedBranch,
        export: 'csv'
      });

      const response = await axios.get(`/schedule-pickups/export?${params}`, {
        responseType: 'blob'
      });

      // Create download link
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Generate filename with current date
      const today = new Date().toISOString().split('T')[0];
      link.download = `scheduled-pickups-${today}.csv`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('Data exported successfully!');
    } catch (error: any) {
      console.error('Error exporting data:', error);
      toast.error(error.response?.data?.message || 'Failed to export data');
    } finally {
      setIsExporting(false);
    }
  };

  // Check if user can delete (admin or branch admin)
  const canDelete = userRole === 1 || userRole === 4;
  console.log('UserRole:', userRole, 'CanDelete:', canDelete); // Debug log

  // Calculate display indices for pagination info
  const startIndex = (currentPage - 1) * perPage;
  const endIndex = Math.min(startIndex + perPage, totalRecords);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const renderPaginationNumbers = () => {
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
          className="w-9 h-9 p-0"
        >
          1
        </Button>
      );
      if (startPage > 2) {
        pages.push(
          <span key="start-ellipsis" className="px-2 text-slate-400">
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
          className={`w-9 h-9 p-0 ${currentPage === i ? 'bg-blue-600 text-white hover:bg-blue-700' : ''}`}
        >
          {i}
        </Button>
      );
    }

    // Last page with ellipsis
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(
          <span key="end-ellipsis" className="px-2 text-slate-400">
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
          className="w-9 h-9 p-0"
        >
          {totalPages}
        </Button>
      );
    }

    return pages;
  };

  return (
    <DashboardLayout title="Scheduled Pickups">
      <div>
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Scheduled Pickups</h1>
                <p className="text-xs sm:text-sm text-gray-500 mt-1">Manage scheduled pickup requests from customers</p>
              </div>
            </div>
          </div>

          {/* Info Cards - Only visible for Admin and Branch Admin */}
          {userInfo && (userInfo.role_id === 1 || userInfo.role_id === 4) && (
            <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                {/* Total Pickups Card */}
                <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <div className="w-5 h-5 text-purple-600">
                        <svg viewBox="0 0 24 24" fill="currentColor">
                          <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 3c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.57-3.5-3.5S10.07 6 12 6zm7 13H5v-.23c0-.62.28-1.2.76-1.58C7.47 15.82 9.64 15 12 15s4.53.82 6.24 2.19c.48.38.76.97.76 1.58V19z"/>
                        </svg>
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-700">Total Pickups</p>
                    </div>
                    <div>
                      <p className="text-xl font-bold text-purple-600">{pickupCounts['total'] || 0}</p>
                    </div>
                  </div>
                </div>

                {/* Branch-specific cards */}
                {userInfo.role_id === 1 ? (
                  // Admin users see all branches
                  branches.map((branch) => (
                    <div key={branch.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <div className="w-5 h-5 text-blue-600">
                            <svg viewBox="0 0 24 24" fill="currentColor">
                              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                            </svg>
                          </div>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-700">{branch.branch_name}</p>
                        </div>
                        <div>
                          <p className="text-xl font-bold text-blue-600">{pickupCounts[branch.branch_name] || 0}</p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  // Branch admin users see only their branch
                  branches.map((branch) => (
                    <div key={branch.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <div className="w-5 h-5 text-green-600">
                            <svg viewBox="0 0 24 24" fill="currentColor">
                              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                            </svg>
                          </div>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-700">My Branch</p>
                        </div>
                        <div>
                          <p className="text-xl font-bold text-green-600">{pickupCounts[branch.branch_name] || 0}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Filter Section */}
          <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
            <div className="flex flex-col gap-3">
              <span className="text-sm font-medium">Filter By:</span>
              
              <div className="flex flex-wrap gap-3 items-end justify-between">
                <div className="flex flex-wrap gap-3 items-end">
                <Input
                  type="date"
                  placeholder="Start Date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  style={{ width: '160px' }}
                />
                
                <Input
                  type="date"
                  placeholder="End Date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  style={{ width: '160px' }}
                />
                
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger style={{ width: '160px' }}>
                    <SelectValue placeholder="Select Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="No">No</SelectItem>
                    <SelectItem value="Collected">Collected</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={selectedBranch} onValueChange={setSelectedBranch}>
                  <SelectTrigger style={{ width: '160px' }}>
                    <SelectValue placeholder="Select Branch" />
                  </SelectTrigger>
                  <SelectContent>
                    {/* Only show "All Branches" option for non-branch admin users */}
                    {!(userInfo && userInfo.role_id === 4) && (
                      <SelectItem value="all">All Branches</SelectItem>
                    )}
                    {branches.map((branch) => (
                      <SelectItem key={branch.id} value={branch.id.toString()}>
                        {branch.branch_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className="flex gap-2">
                  <Button 
                    onClick={handleFilter}
                  >
                    Filter
                  </Button>

                  <Button 
                    onClick={handleClearFilter}
                    variant="outline"
                  >
                    Clear
                  </Button>
                </div>
                
                <Button
                  onClick={handleExport}
                  disabled={isExporting}
                  variant="secondary"
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  <span>{isExporting ? 'Exporting...' : 'Export CSV'}</span>
                </Button>
              </div>
            </div>
          </div>

          <div className="px-4 sm:px-6 py-4">
            <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm text-gray-700">Rows per page:</span>
                <Select value={perPage.toString()} onValueChange={handlePerPageChange}>
                  <SelectTrigger className="w-[80px] sm:w-[100px] h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="25">25</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="relative w-full sm:w-auto">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search pickups..."
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-9 pr-3 h-9 w-full sm:w-[300px]"
                />
              </div>
            </div>
          </div>

          {/* Desktop Table View */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-t border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    S.No
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ticket ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Issue
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Branch
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pickup Address
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Schedule Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Time Slot
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact Person
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mobile
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pickup Status
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={10} className="px-6 py-8 text-center text-gray-500">
                      Loading scheduled pickups...
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={10} className="px-6 py-8 text-center text-red-500">
                      Error: {error}
                    </td>
                  </tr>
                ) : pickups.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="px-6 py-8 text-center text-gray-500">
                      No scheduled pickups found for selected date range
                    </td>
                  </tr>
                ) : (
                  pickups.map((pickup, index) => (
                    <tr key={pickup.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {startIndex + index + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                        {pickup.ticket?.tracking_number || `#${pickup.ticket_id}`}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                        {pickup.ticket?.issue || '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                        {pickup.branch?.branch_name || '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 max-w-xs">
                        <div className="truncate">{pickup.address}</div>
                        {pickup.landmark && (
                          <div className="text-xs text-gray-500 truncate">📍 {pickup.landmark}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {pickup.schedule_date ? format(new Date(pickup.schedule_date), 'MMM dd, yyyy') : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {pickup.time_slot}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {pickup.contact_person}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {pickup.mobile}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <Button
                          size="sm"
                          onClick={() => handleStatusClick(pickup)}
                          variant={pickup.status === 'Collected' ? 'secondary' : 'outline'}
                          className={`w-20 h-7 text-xs ${
                            pickup.status === 'Collected' 
                              ? '' 
                              : 'border-red-200 hover:opacity-80'
                          }`}
                          style={pickup.status !== 'Collected' ? { backgroundColor: '#ffbebe', color: '#dc2626' } : {}}
                          disabled={pickup.status === 'Collected'}
                        >
                          {pickup.status === 'Collected' ? 'Collected' : 'No'}
                        </Button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditPickup(pickup)}
                            className={`w-8 h-7 p-1 ${
                              pickup.status === 'Collected'
                                ? 'text-gray-400 cursor-not-allowed'
                                : 'text-blue-600 hover:text-blue-900'
                            }`}
                            title={pickup.status === 'Collected' ? 'Cannot edit collected pickup' : 'Edit Schedule'}
                            disabled={pickup.status === 'Collected'}
                          >
                            <Edit2 className="h-3 w-3" />
                          </Button>
                          {canDelete && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteClick(pickup)}
                              className="w-8 h-7 p-1 text-red-600 hover:text-red-900"
                              title="Delete Schedule"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="lg:hidden">
            {loading ? (
              <div className="p-6 text-center text-gray-500">Loading scheduled pickups...</div>
            ) : error ? (
              <div className="p-6 text-center text-red-500">Error: {error}</div>
            ) : pickups.length === 0 ? (
              <div className="p-6 text-center text-gray-500">No scheduled pickups found</div>
            ) : (
              pickups.map((pickup, index) => (
                <div key={pickup.id} className="border-b border-gray-200 p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-gray-900">
                          #{startIndex + index + 1}
                        </span>
                        <span className="text-sm font-medium text-blue-600">
                          {pickup.ticket?.tracking_number || `Ticket #${pickup.ticket_id}`}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mb-1">{pickup.ticket?.issue || '-'}</p>
                      <p className="text-xs text-gray-600 mb-2">📍 Branch: {pickup.branch?.branch_name || '-'}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditPickup(pickup)}
                        className={`w-8 h-7 p-1 ${
                          pickup.status === 'Collected'
                            ? 'text-gray-400 cursor-not-allowed'
                            : 'text-blue-600 hover:text-blue-900'
                        }`}
                        title={pickup.status === 'Collected' ? 'Cannot edit collected pickup' : 'Edit Schedule'}
                        disabled={pickup.status === 'Collected'}
                      >
                        <Edit2 className="h-3 w-3" />
                      </Button>
                      {canDelete && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteClick(pickup)}
                          className="w-8 h-7 p-1 text-red-600 hover:text-red-900"
                          title="Delete Schedule"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                      <div className="text-sm text-gray-900">
                        <div>{pickup.address}</div>
                        {pickup.landmark && (
                          <div className="text-xs text-gray-500">📍 {pickup.landmark}</div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-900">
                        {pickup.schedule_date ? format(new Date(pickup.schedule_date), 'MMM dd, yyyy') : '-'}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-900">{pickup.time_slot}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-900">{pickup.contact_person}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-900">{pickup.mobile}</span>
                    </div>
                    
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                      <Button
                        size="sm"
                        onClick={() => handleStatusClick(pickup)}
                        variant={pickup.status === 'Collected' ? 'secondary' : 'outline'}
                        className={`w-20 h-7 text-xs ${
                          pickup.status === 'Collected' 
                            ? '' 
                            : 'border-red-200 hover:opacity-80'
                        }`}
                        style={pickup.status !== 'Collected' ? { backgroundColor: '#ffbebe', color: '#dc2626' } : {}}
                        disabled={pickup.status === 'Collected'}
                      >
                        {pickup.status === 'Collected' ? 'Collected' : 'No'}
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Pagination */}
          {!loading && !error && totalPages > 1 && (
            <div className="px-4 sm:px-6 py-4 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <p className="text-sm text-gray-700">
                  Showing {startIndex + 1} to {endIndex} of {totalRecords} results
                </p>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1 || loading}
                  >
                    Previous
                  </Button>

                  <div className="flex gap-1">
                    {renderPaginationNumbers()}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages || loading}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
        </div>
      </div>

      {/* Edit Pickup Modal */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Schedule Pickup</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1">Address *</label>
                <Textarea
                  placeholder="Enter pickup address..."
                  value={editForm.address}
                  onChange={(e) => setEditForm(prev => ({ ...prev, address: e.target.value }))}
                  rows={2}
                  className="resize-none"
                />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-1">Landmark</label>
                  <Input
                    placeholder="Enter landmark (optional)..."
                    value={editForm.landmark}
                    onChange={(e) => setEditForm(prev => ({ ...prev, landmark: e.target.value }))}
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-1">Schedule Date *</label>
                  <Input
                    type="date"
                    value={editForm.schedule_date}
                    onChange={(e) => setEditForm(prev => ({ ...prev, schedule_date: e.target.value }))}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-2">Pickup Time *</label>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-slate-600 block mb-1">Selected: {minutesToTime(pickupTime)}</label>
                    <input
                      type="range"
                      min="660"
                      max="1020"
                      step="15"
                      value={pickupTime}
                      onChange={(e) => setPickupTime(parseInt(e.target.value))}
                      className="w-full h-3 bg-blue-200 rounded-lg appearance-none cursor-pointer"
                      style={{
                        background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${((pickupTime - 660) / (1020 - 660)) * 100}%, #e2e8f0 ${((pickupTime - 660) / (1020 - 660)) * 100}%, #e2e8f0 100%)`
                      }}
                    />
                  </div>

                  <div className="text-center">
                    <span className="text-sm text-slate-700 bg-blue-50 px-4 py-2 rounded-md border border-blue-200">
                      Pickup Time: {editForm.time_slot || 'No time selected'}
                    </span>
                  </div>

                  <div className="flex justify-between text-xs text-slate-500 px-1">
                    <span>11:00 AM</span>
                    <span>1:00 PM</span>
                    <span>3:00 PM</span>
                    <span>5:00 PM</span>
                  </div>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1">Contact Person *</label>
                <Input
                  placeholder="Enter contact person name..."
                  value={editForm.contact_person}
                  onChange={(e) => setEditForm(prev => ({ ...prev, contact_person: e.target.value }))}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1">Mobile Number *</label>
                <Input
                  placeholder="Enter mobile number..."
                  value={editForm.mobile}
                  onChange={(e) => setEditForm(prev => ({ ...prev, mobile: e.target.value }))}
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setEditModalOpen(false);
                  setSelectedPickup(null);
                }}
                disabled={isUpdating}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleUpdatePickup}
                disabled={isUpdating || !editForm.address || !editForm.schedule_date || !editForm.time_slot || 
                         !editForm.contact_person || !editForm.mobile}
              >
                {isUpdating ? 'Updating...' : 'Update Pickup'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Status Update Modal */}
      <Dialog open={statusModalOpen} onOpenChange={setStatusModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Update Pickup Status</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Are you sure you want to mark this pickup as <strong>Collected</strong>?
            </p>
            
            {selectedPickupForStatus && (
              <div className="bg-gray-50 p-3 rounded-md">
                <p className="text-sm font-medium text-gray-900">
                  Ticket: {selectedPickupForStatus.ticket?.tracking_number}
                </p>
                <p className="text-sm text-gray-600">
                  Contact: {selectedPickupForStatus.contact_person}
                </p>
                <p className="text-sm text-gray-600">
                  Mobile: {selectedPickupForStatus.mobile}
                </p>
              </div>
            )}
            
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-2">
                Add a note about the pickup:
              </label>
              <Textarea
                placeholder="Enter pickup notes (e.g., items collected, condition, etc.)..."
                value={statusNote}
                onChange={(e) => setStatusNote(e.target.value)}
                rows={3}
                className="resize-none"
              />
            </div>
            
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setStatusModalOpen(false);
                  setSelectedPickupForStatus(null);
                  setStatusNote('');
                }}
                disabled={isUpdatingStatus}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleStatusUpdate}
                disabled={isUpdatingStatus || !statusNote.trim()}
                variant="secondary"
              >
                {isUpdatingStatus ? 'Updating...' : 'Mark as Collected'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Schedule Pickup</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this schedule pickup? This action cannot be undone.
              {selectedPickupForDelete && (
                <div className="mt-3 p-3 bg-gray-50 rounded-md">
                  <p className="text-sm font-medium text-gray-900">
                    Ticket: {selectedPickupForDelete.ticket?.tracking_number}
                  </p>
                  <p className="text-sm text-gray-600">
                    Contact: {selectedPickupForDelete.contact_person}
                  </p>
                  <p className="text-sm text-gray-600">
                    Address: {selectedPickupForDelete.address}
                  </p>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              onClick={() => {
                setDeleteConfirmOpen(false);
                setSelectedPickupForDelete(null);
              }}
              disabled={isDeleting}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeletePickup}
              disabled={isDeleting}
              className={buttonVariants({ variant: "destructive" })}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}