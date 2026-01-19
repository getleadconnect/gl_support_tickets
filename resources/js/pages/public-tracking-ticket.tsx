import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Search, Plus, Edit, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';

interface History {
  id: number;
  comment: string;
  created_at: string;
  created_by: number;
}

interface Status {
  id: number;
  name: string;
  color: string;
}

interface CustomerNote {
  id: number;
  description: string;
  time: string;
  created_at: string;
  agent_name: string | null;
  customer_name: string | null;
}

interface Agent {
  id: number;
  name: string;
}

interface SchedulePickup {
  id: number;
  address: string;
  landmark: string | null;
  schedule_date: string;
  time_slot: string;
  contact_person: string;
  mobile: string;
  created_at: string;
}

interface Customer {
  id: number;
  name: string;
  mobile: string;
  country_code: string;
  company_name?: string;
}

interface TrackingData {
  tracking_number: string;
  issue: string;
  description: string;
  customer_id: number;
  customer: Customer | null;
  status: Status | null;
  histories: History[];
  spare_parts: string[];
  customer_notes: CustomerNote[];
  agents: Agent[];
}

export default function PublicTrackingTicket() {
  const [searchParams] = useSearchParams();
  const [trackingNumber, setTrackingNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [trackingData, setTrackingData] = useState<TrackingData | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [companyLogo, setCompanyLogo] = useState<string>('');
  const [companyName, setCompanyName] = useState<string>('GL Tickets');
  const [showAddNoteModal, setShowAddNoteModal] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [showSchedulePickupModal, setShowSchedulePickupModal] = useState(false);
  const [schedulePickupData, setSchedulePickupData] = useState([]);
  const [isLoadingSchedulePickup, setIsLoadingSchedulePickup] = useState(false);
  const [schedulePickupForm, setSchedulePickupForm] = useState({
    address: '',
    landmark: '',
    schedule_date: '',
    time_slot: '',
    contact_person: '',
    mobile: ''
  });
  const [pickupTime, setPickupTime] = useState(660); // Default: 11:00 AM
  const [editingPickup, setEditingPickup] = useState(null);
  const [hasExistingPickup, setHasExistingPickup] = useState(false);

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
    
    setSchedulePickupForm(prev => ({
      ...prev,
      time_slot: timeStr
    }));
  }, [pickupTime]);

  // Handle pickup time change
  const handlePickupTimeChange = (value: number) => {
    setPickupTime(value);
  };

  // Function to handle edit pickup
  const handleEditPickup = (pickup: any) => {
    setEditingPickup(pickup);
    
    // Parse the existing time_slot and set it to the slider
    const parsedTime = timeToMinutes(pickup.time_slot);
    setPickupTime(parsedTime);
    
    setSchedulePickupForm({
      address: pickup.address,
      landmark: pickup.landmark || '',
      schedule_date: pickup.schedule_date || '',
      time_slot: pickup.time_slot,
      contact_person: pickup.contact_person,
      mobile: pickup.mobile
    });
    
    setShowSchedulePickupModal(true);
  };

  // Function to handle delete pickup
  const handleDeletePickup = async (pickupId: number) => {
    if (!confirm('Are you sure you want to delete this schedule pickup?')) {
      return;
    }

    try {
      const response = await axios.delete(`/schedule-pickups/${pickupId}`);
      if (response.status === 200) {
        toast.success('Schedule pickup deleted successfully!');
        // Refresh the pickup data
        if (trackingData?.tracking_number) {
          fetchSchedulePickups(trackingData.tracking_number);
        }
      }
    } catch (error: any) {
      console.error('Error deleting schedule pickup:', error);
      toast.error(error.response?.data?.message || 'Failed to delete schedule pickup');
    }
  };

  // Check for tracking_id parameter in URL
  useEffect(() => {
    const trackingId = searchParams.get('tracking_id');
    if (trackingId) {
      setTrackingNumber(trackingId.toUpperCase());
      // Automatically search
      handleAutoSearch(trackingId);
    }
  }, [searchParams]);

  // Fetch company info on component mount
  useEffect(() => {
    const fetchCompanyInfo = async () => {
      try {
        // Get APP_URL from meta tag (reads from .env)
        const metaTag = document.querySelector('meta[name="app-url"]');
        const appUrl = metaTag ? metaTag.getAttribute('content') : window.location.origin;
        console.log('Meta tag APP_URL:', appUrl);

        const response = await axios.get('/company');
        console.log('Company API response:', response.data);

        if (response.data.company) {
          if (response.data.company.logo) {
            // Prepend APP_URL if logo is a relative path
            const logoPath = response.data.company.logo;
            const fullLogoUrl = logoPath.startsWith('http')
              ? logoPath
              : `${appUrl}/${logoPath}`;
            console.log('Logo path from DB:', logoPath);
            console.log('Full logo URL:', fullLogoUrl);
            setCompanyLogo(fullLogoUrl);
          }
          if (response.data.company.company_name) {
            setCompanyName(response.data.company.company_name);
          }
        }
      } catch (err) {
        console.error('Error fetching company info:', err);
      }
    };

    fetchCompanyInfo();
  }, []);

  const handleAutoSearch = async (trackingId: string) => {
    if (!trackingId.trim()) return;

    setIsLoading(true);
    setHasSearched(true);
    try {
      const response = await axios.post('/track-ticket', {
        tracking_number: trackingId.trim()
      });

      if (response.data.success) {
        setTrackingData(response.data.data);
        // Fetch schedule pickup data
        fetchSchedulePickups(trackingId.trim());
      } else {
        setTrackingData(null);
        setSchedulePickupData([]);
      }
    } catch (error: any) {
      console.error('Error tracking ticket:', error);
      // Only show error toast once with unique ID to prevent duplicates
      toast.error('Ticket not found with this tracking number', {
        id: 'track-auto-error'
      });
      setTrackingData(null);
      setSchedulePickupData([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!trackingNumber.trim()) {
      toast.error('Please enter a tracking number');
      return;
    }

    setIsLoading(true);
    setHasSearched(true);
    try {
      const response = await axios.post('/track-ticket', {
        tracking_number: trackingNumber.trim()
      });

      if (response.data.success) {
        setTrackingData(response.data.data);
        // Fetch schedule pickup data
        fetchSchedulePickups(trackingNumber.trim());
        toast.success('Ticket found successfully!');
      } else {
        setTrackingData(null);
        setSchedulePickupData([]);
      }
    } catch (error: any) {
      console.error('Error tracking ticket:', error);
      // Only show error toast once with unique ID
      toast.error('Ticket not found with this tracking number', {
        id: 'track-search-error'
      });
      setTrackingData(null);
      setSchedulePickupData([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to fetch schedule pickups
  const fetchSchedulePickups = async (trackingNumber: string) => {
    try {
      const response = await axios.get(`/track-ticket/${trackingNumber}/schedule-pickups`);
      if (response.data.success) {
        setSchedulePickupData(response.data.data);
        setHasExistingPickup(response.data.data.length > 0);
      }
    } catch (error) {
      console.error('Error fetching schedule pickups:', error);
    }
  };


  // Function to handle schedule pickup button click
  const handleSchedulePickupClick = async () => {
    if (!trackingData?.tracking_number) return;

    // First, fetch existing schedule pickups
    await fetchSchedulePickups(trackingData.tracking_number);
    
    // Reset form and editing state
    setEditingPickup(null);
    setSchedulePickupForm({
      address: '',
      landmark: '',
      schedule_date: '',
      time_slot: '',
      contact_person: '',
      mobile: trackingData?.customer?.mobile || ''
    });
    setPickupTime(660); // Reset to default time
    
    setShowSchedulePickupModal(true);
  };

  // Function to handle schedule pickup form submission
  const handleSchedulePickupSubmit = async () => {
    if (!trackingData) {
      toast.error('No tracking data available');
      return;
    }

    // Basic validation
    if (!schedulePickupForm.address || !schedulePickupForm.schedule_date || !schedulePickupForm.time_slot || 
        !schedulePickupForm.contact_person || !schedulePickupForm.mobile) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsLoadingSchedulePickup(true);
    try {
      let response;
      
      if (editingPickup) {
        // Update existing pickup
        response = await axios.put(`/schedule-pickups/${editingPickup.id}`, schedulePickupForm);
        if (response.status === 200) {
          toast.success('Schedule pickup updated successfully!');
        }
      } else {
        // Create new pickup
        response = await axios.post(`/track-ticket/${trackingData.tracking_number}/schedule-pickups`, schedulePickupForm);
        if (response.data.success) {
          toast.success('Schedule pickup created successfully!');
        }
      }
      
      // Reset form and close modal
      setSchedulePickupForm({
        address: '',
        landmark: '',
        schedule_date: '',
        time_slot: '',
        contact_person: '',
        mobile: ''
      });
      setEditingPickup(null);
      setShowSchedulePickupModal(false);
      
      // Refresh schedule pickup data
      fetchSchedulePickups(trackingData.tracking_number);
      
    } catch (error: any) {
      console.error('Error saving schedule pickup:', error);
      const action = editingPickup ? 'update' : 'create';
      toast.error(error.response?.data?.message || `Failed to ${action} schedule pickup`);
    } finally {
      setIsLoadingSchedulePickup(false);
    }
  };

  // Function to handle adding a note
  const handleAddNote = async () => {
    if (!newNote.trim()) {
      toast.error('Please enter a note');
      return;
    }

    if (!trackingData) {
      toast.error('No tracking data available');
      return;
    }

    setIsAddingNote(true);
    try {
      const response = await axios.post(`/track-ticket/${trackingData.tracking_number}/customer-notes`, {
        note: newNote.trim(),
        customer_id: trackingData.customer_id
      });

      if (response.data.success) {
        // Add the new note from API response to the existing notes
        const newNoteData = {
          id: response.data.note.id,
          description: response.data.note.description,
          time: null,
          created_at: response.data.note.created_at,
          agent_name: response.data.note.agent_name,
          customer_name: response.data.note.customer_name
        };

        setTrackingData(prevData => ({
          ...prevData!,
          customer_notes: [...prevData!.customer_notes, newNoteData]
        }));

        setNewNote('');
        setShowAddNoteModal(false);
        toast.success(response.data.message);

        // Scroll to the newly added note at bottom
        setTimeout(() => {
          const customerNotesSection = document.querySelector('[data-customer-notes-section]');
          if (customerNotesSection) {
            customerNotesSection.scrollIntoView({ behavior: 'smooth', block: 'end' });
          }
        }, 100);
      } else {
        toast.error(response.data.message || 'Failed to add note');
      }
    } catch (error: any) {
      console.error('Error adding note:', error);
      const errorMessage = error.response?.data?.message || 'Failed to add note. Please try again.';
      toast.error(errorMessage);
    } finally {
      setIsAddingNote(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row items-center sm:items-center gap-3 sm:gap-4">
            {companyLogo ? (
              <img
                src={companyLogo}
                alt={companyName || 'Company Logo'}
                className="h-10 sm:h-12 w-auto object-contain"
                onError={(e) => {
                  console.error('Failed to load logo:', companyLogo);
                  setCompanyLogo(''); // Clear logo to show fallback
                }}
                onLoad={() => {
                  console.log('Logo loaded successfully:', companyLogo);
                }}
              />
            ) : (
              <div className="h-10 w-10 sm:h-12 sm:w-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-lg sm:text-xl">
                  {companyName ? companyName.charAt(0) : 'T'}
                </span>
              </div>
            )}
            <div className="text-center sm:text-left">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-800">Ticket Status Tracking</h1>
              <p className="text-slate-600 text-xs sm:text-sm mt-0.5 sm:mt-1">Track your service ticket status and history</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">

        {/* Search Form */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 sm:p-6 mb-4 sm:mb-6">
          <form onSubmit={handleSearch}>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <label className="text-sm font-medium text-slate-700 sm:whitespace-nowrap">
                Track Your Ticket Status:
              </label>
              <Input
                type="text"
                placeholder="Enter tracking number"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value.toUpperCase())}
                className="w-full sm:w-auto"
                style={{ width: undefined }}
                disabled={isLoading}
              />
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto"
                >
                  <Search className="h-4 w-4 mr-2" />
                  {isLoading ? 'Searching...' : 'Search'}
                </Button>
                <Button
                  type="button"
                  onClick={handleSchedulePickupClick}
                  disabled={trackingData?.status?.id === 3}
                  className="bg-green-600 hover:bg-green-700 w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Schedule Pickup
                </Button>
              </div>
            </div>
          </form>
        </div>

        {/* Results Display */}
        {trackingData && (
          <div className="space-y-4 sm:space-y-6">
            {/* Customer Information and Ticket Information - Side by Side */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {/* Customer Information */}
              {trackingData.customer && (
                <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 sm:p-6">
                  <h2 className="text-base sm:text-lg font-semibold text-slate-800 mb-3">Customer Information</h2>
                  <div className="space-y-3">
                    <div>
                      <span className="text-xs sm:text-sm font-medium text-slate-600">Customer Name:</span>
                      <p className="text-base sm:text-lg font-semibold text-slate-800 mt-1">{trackingData.customer.name}</p>
                    </div>
                    {trackingData.customer.company_name && (
                      <div>
                        <span className="text-xs sm:text-sm font-medium text-slate-600">Company Name:</span>
                        <p className="text-base sm:text-lg font-semibold text-slate-800 mt-1">{trackingData.customer.company_name}</p>
                      </div>
                    )}
                    <div>
                      <span className="text-xs sm:text-sm font-medium text-slate-600">Mobile Number:</span>
                      <p className="text-base sm:text-lg font-semibold text-slate-800 mt-1">
                        {trackingData.customer.country_code} {trackingData.customer.mobile}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Ticket Information */}
              <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 sm:p-6">
                <h2 className="text-base sm:text-lg font-semibold text-slate-800 mb-3">Ticket Information</h2>
                <div className="space-y-3">
                  <div>
                    <span className="text-xs sm:text-sm font-medium text-slate-600">Ticket Tracking Number:</span>
                    <p className="text-base sm:text-lg font-bold text-blue-600 mt-1 break-all">{trackingData.tracking_number}</p>
                  </div>
                  {trackingData.status && (
                    <div>
                      <span className="text-xs sm:text-sm font-medium text-slate-600">Current Status:</span>
                      <div className="mt-1">
                        <span
                          className="inline-flex items-center px-2.5 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-semibold"
                          style={{
                            backgroundColor: trackingData.status.color,
                            color: '#ffffff'
                          }}
                        >
                          {trackingData.status.name}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Issues */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 sm:p-6">
              <h2 className="text-base sm:text-lg font-semibold text-slate-800 mb-3">Issues</h2>
              <div className="space-y-2">
                <div>
                  <span className="text-xs sm:text-sm font-medium text-slate-600">Issue:</span>
                  <p className="text-sm sm:text-base text-slate-800 mt-1 break-words">{trackingData.issue}</p>
                </div>
                {trackingData.description && (
                  <div>
                    <span className="text-xs sm:text-sm font-medium text-slate-600">Description:</span>
                    <p className="text-sm sm:text-base text-slate-700 mt-1 break-words">{trackingData.description}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Schedule Pickup Information */}
            {schedulePickupData.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 sm:p-6">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-base sm:text-lg font-semibold text-slate-800">Schedule Pickup Details</h2>
                  {schedulePickupData.length === 1 && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditPickup(schedulePickupData[0])}
                        className="p-2 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-md transition-colors"
                        title="Edit Schedule"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeletePickup(schedulePickupData[0].id)}
                        className="p-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-md transition-colors"
                        title="Delete Schedule"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
                <div className="space-y-4">
                  {schedulePickupData.map((pickup: SchedulePickup, index: number) => (
                    <div key={pickup.id} className="border-l-4 border-purple-500 pl-3 sm:pl-4 py-2 relative">
                      {/* Edit/Delete Buttons for multiple pickups */}
                      {schedulePickupData.length > 1 && (
                        <div className="absolute top-2 right-2 flex gap-2">
                          <button
                            onClick={() => handleEditPickup(pickup)}
                            className="p-1 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded transition-colors"
                            title="Edit Schedule"
                          >
                            <Edit className="h-3 w-3" />
                          </button>
                          <button
                            onClick={() => handleDeletePickup(pickup.id)}
                            className="p-1 bg-red-100 hover:bg-red-200 text-red-600 rounded transition-colors"
                            title="Delete Schedule"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      )}
                      
                      <div className={`grid grid-cols-1 sm:grid-cols-2 gap-3 ${schedulePickupData.length > 1 ? 'pr-20' : ''}`}>
                        <div>
                          <span className="text-xs sm:text-sm font-medium text-slate-600">Address:</span>
                          <p className="text-sm sm:text-base text-slate-800 break-words">{pickup.address}</p>
                        </div>
                        {pickup.landmark && (
                          <div>
                            <span className="text-xs sm:text-sm font-medium text-slate-600">Landmark:</span>
                            <p className="text-sm sm:text-base text-slate-800 break-words">{pickup.landmark}</p>
                          </div>
                        )}
                        <div>
                          <span className="text-xs sm:text-sm font-medium text-slate-600">Date/Time Slot:</span>
                          <p className="text-sm sm:text-base text-slate-800">{format(new Date(pickup.schedule_date), 'MMM dd, yyyy')} {pickup.time_slot}</p>
                        </div>
                        <div>
                          <span className="text-xs sm:text-sm font-medium text-slate-600">Contact Person:</span>
                          <p className="text-sm sm:text-base text-slate-800">{pickup.contact_person}, {pickup.mobile}</p>
                        </div>
                        
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Technician */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 sm:p-6">
              <h2 className="text-base sm:text-lg font-semibold text-slate-800 mb-3">Technician</h2>
              {trackingData.agents && trackingData.agents.length > 0 ? (
                <div className="space-y-2">
                  {trackingData.agents.map((agent) => (
                    <div key={agent.id} className="flex items-center gap-2">
                      <div className="w-7 h-7 sm:w-8 sm:h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-semibold text-xs sm:text-sm">
                          {agent.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <span className="text-sm sm:text-base text-slate-700">{agent.name}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 text-xs sm:text-sm">No technician assigned</p>
              )}
            </div>

            {/* Customer Notes */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 sm:p-6" data-customer-notes-section>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base sm:text-lg font-semibold text-slate-800">Customer Notes</h2>
                <Button
                  onClick={() => setShowAddNoteModal(true)}
                  disabled={trackingData?.status?.id === 3}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Note
                </Button>
              </div>
              {trackingData.customer_notes && trackingData.customer_notes.length > 0 ? (
                <div className="space-y-4">
                  {trackingData.customer_notes.map((note) => {
                    // Check if this is a customer note (no agent_name or agent_name is "Customer")
                    const isCustomerNote = !note.agent_name || note.agent_name === 'Customer';
                    
                    return (
                      <div 
                        key={note.id} 
                        className={`border-l-4 pl-3 sm:pl-4 py-2 rounded-r ${
                          isCustomerNote 
                            ? 'border-l-4' 
                            : 'border-l-4'
                        }`}
                        style={{
                          background: isCustomerNote ? '#e3f8f3' : '#f7f7e4',
                          borderColor: isCustomerNote ? '#8ec6b8' : '#d2d299',
                          marginLeft: isCustomerNote ? '50px' : '0px'
                        }}
                      >
                        <p className="text-sm sm:text-base text-slate-700 break-words">{note.description}</p>
                        <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-2 text-xs sm:text-sm text-slate-500">
                          <span>By: <span style={{ fontWeight: 600 }}>{isCustomerNote ? (note.customer_name || 'Customer') : note.agent_name}</span></span>
                          {note.time && (
                            <span>Duration: {note.time}</span>
                          )}
                          <span>{format(new Date(note.created_at), 'MMM dd, yyyy hh:mm a')}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-slate-500 text-xs sm:text-sm">No notes available</p>
              )}
            </div>

            {/* Histories */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 sm:p-6">
              <h2 className="text-base sm:text-lg font-semibold text-slate-800 mb-4">Histories</h2>
              {trackingData.histories.length > 0 ? (
                <div className="relative">
                  {trackingData.histories.map((history, index) => (
                    <div key={history.id} className="relative pl-8 pb-6 last:pb-0">
                      {/* Timeline line */}
                      {index !== trackingData.histories.length - 1 && (
                        <div className="absolute left-[11px] top-6 bottom-0 w-0.5 bg-slate-200"></div>
                      )}

                      {/* Blue dot */}
                      <div className="absolute left-0 top-0 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>

                      {/* Content */}
                      <div>
                        <h3 className="text-sm sm:text-base font-semibold text-slate-800">
                          {history.comment.split(':')[0] || 'Activity'}
                        </h3>
                        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                          {format(new Date(history.created_at), 'MMM dd, hh:mm a')}
                        </p>
                        {history.comment.includes(':') && (
                          <p className="text-xs sm:text-sm text-slate-600 mt-1 break-words">
                            {history.comment.split(':').slice(1).join(':').trim()}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 text-xs sm:text-sm">No history records found</p>
              )}
            </div>

            {/* Spare Parts */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 sm:p-6">
              <h2 className="text-base sm:text-lg font-semibold text-slate-800 mb-3">Spare Parts</h2>
              {trackingData.spare_parts.length > 0 ? (
                <ul className="list-disc list-inside space-y-2">
                  {trackingData.spare_parts.map((part, index) => (
                    <li key={index} className="text-sm sm:text-base text-slate-700 break-words">{part}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-slate-500 text-xs sm:text-sm">No spare parts used</p>
              )}
            </div>
          </div>
        )}

        {/* No Results Message */}
        {!trackingData && !isLoading && hasSearched && (
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8 sm:p-12 text-center">
            <div className="text-slate-400 mb-3">
              <Search className="h-12 w-12 sm:h-16 sm:w-16 mx-auto" />
            </div>
            <p className="text-slate-600 text-base sm:text-lg font-medium">No ticket found</p>
            <p className="text-slate-500 text-xs sm:text-sm mt-2">Please check the tracking number and try again</p>
          </div>
        )}
      </div>

      {/* Add Note Modal */}
      <Dialog open={showAddNoteModal} onOpenChange={setShowAddNoteModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Customer Note</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              placeholder="Enter customer note here..."
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              rows={4}
              className="resize-none"
            />
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowAddNoteModal(false);
                  setNewNote('');
                }}
                disabled={isAddingNote}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleAddNote}
                disabled={isAddingNote || !newNote.trim()}
                className="bg-black hover:bg-gray-800 text-white"
              >
                {isAddingNote ? 'Saving...' : 'Save Note'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Schedule Pickup Modal */}
      <Dialog open={showSchedulePickupModal} onOpenChange={setShowSchedulePickupModal}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingPickup ? 'Edit Schedule Pickup' : 'Schedule Pickup'}</DialogTitle>
          </DialogHeader>
          
          {/* Show existing pickup message */}
          {hasExistingPickup && !editingPickup && (
            <div className="bg-amber-50 border border-amber-200 rounded-md p-3 mb-4">
              <p className="text-sm text-amber-700">
                <span className="font-medium">Notice:</span> A schedule pickup already exists for this ticket. You can create additional pickups or edit/delete existing ones below.
              </p>
            </div>
          )}
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1">Address *</label>
                <Textarea
                  placeholder="Enter pickup address..."
                  value={schedulePickupForm.address}
                  onChange={(e) => setSchedulePickupForm(prev => ({ ...prev, address: e.target.value }))}
                  rows={2}
                  className="resize-none"
                />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-1">Landmark</label>
                  <Input
                    placeholder="Enter landmark (optional)..."
                    value={schedulePickupForm.landmark}
                    onChange={(e) => setSchedulePickupForm(prev => ({ ...prev, landmark: e.target.value }))}
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-1">Schedule Date *</label>
                  <Input
                    type="date"
                    value={schedulePickupForm.schedule_date}
                    onChange={(e) => setSchedulePickupForm(prev => ({ ...prev, schedule_date: e.target.value }))}
                    min={new Date().toISOString().split('T')[0]} // Set minimum date to today
                  />
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-2">Pickup Time *</label>
                <div className="space-y-4">
                  {/* Pickup Time Slider */}
                  <div>
                    <label className="text-xs text-slate-600 block mb-1">Selected: {minutesToTime(pickupTime)}</label>
                    <input
                      type="range"
                      min="660"
                      max="1020"
                      step="15"
                      value={pickupTime}
                      onChange={(e) => handlePickupTimeChange(parseInt(e.target.value))}
                      className="w-full h-3 bg-blue-200 rounded-lg appearance-none cursor-pointer"
                      style={{
                        background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${((pickupTime - 660) / (1020 - 660)) * 100}%, #e2e8f0 ${((pickupTime - 660) / (1020 - 660)) * 100}%, #e2e8f0 100%)`
                      }}
                    />
                  </div>

                  {/* Selected Time Display */}
                  <div className="text-center">
                    <span className="text-sm text-slate-700 bg-blue-50 px-4 py-2 rounded-md border border-blue-200">
                      Pickup Time: {schedulePickupForm.time_slot || 'No time selected'}
                    </span>
                  </div>

                  {/* Time Range Labels */}
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
                  value={schedulePickupForm.contact_person}
                  onChange={(e) => setSchedulePickupForm(prev => ({ ...prev, contact_person: e.target.value }))}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1">Mobile Number *</label>
                <Input
                  placeholder="Enter mobile number..."
                  value={schedulePickupForm.mobile}
                  onChange={(e) => setSchedulePickupForm(prev => ({ ...prev, mobile: e.target.value }))}
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowSchedulePickupModal(false);
                  setSchedulePickupForm({
                    address: '',
                    landmark: '',
                    schedule_date: '',
                    time_slot: '',
                    contact_person: '',
                    mobile: ''
                  });
                  setEditingPickup(null);
                }}
                disabled={isLoadingSchedulePickup}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleSchedulePickupSubmit}
                disabled={isLoadingSchedulePickup || !schedulePickupForm.address || !schedulePickupForm.schedule_date || 
                         !schedulePickupForm.time_slot || !schedulePickupForm.contact_person || !schedulePickupForm.mobile}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isLoadingSchedulePickup ? 
                  (editingPickup ? 'Updating...' : 'Scheduling...') : 
                  (editingPickup ? 'Update Pickup' : 'Schedule Pickup')
                }
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Footer */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 mt-8 sm:mt-12">
        <div className="text-center text-slate-500 text-xs sm:text-sm">
          <p>&copy; {new Date().getFullYear()} Ticket Management System. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
