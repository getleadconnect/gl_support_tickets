import React, { useState } from 'react';
import axios from 'axios';
import { DashboardLayout } from '@/components/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

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

interface LogNote {
  id: number;
  description: string;
  time: string;
  created_at: string;
  agent_name: string | null;
}

interface Agent {
  id: number;
  name: string;
}

interface Customer {
  id: number;
  name: string;
  mobile: string;
  country_code: string;
}

interface TrackingData {
  tracking_number: string;
  issue: string;
  description: string;
  status: Status | null;
  histories: History[];
  spare_parts: string[];
  log_notes: LogNote[];
  agents: Agent[];
  customer: Customer | null;
}

export default function TrackingTicket() {
  const [trackingNumber, setTrackingNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [trackingData, setTrackingData] = useState<TrackingData | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

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
        toast.success('Ticket found successfully!');
      } else {
        toast.error(response.data.message || 'Ticket not found');
        setTrackingData(null);
      }
    } catch (error: any) {
      console.error('Error tracking ticket:', error);
      if (error.response?.status === 404) {
        toast.error('Ticket not found with this tracking number');
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Failed to track ticket. Please try again.');
      }
      setTrackingData(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout title="Ticket Status">
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-800">Track Your Ticket</h1>
          <p className="text-slate-600 mt-1">Enter your tracking number to view ticket status and history</p>
        </div>

        {/* Search Form */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 mb-6">
          <form onSubmit={handleSearch}>
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-slate-700 whitespace-nowrap">
                Track Your Ticket Status:
              </label>
              <Input
                type="text"
                placeholder="Enter tracking number"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value.toUpperCase())}
                style={{ width: '200px' }}
                disabled={isLoading}
              />
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Search className="h-4 w-4 mr-2" />
                {isLoading ? 'Searching...' : 'Search'}
              </Button>
            </div>
          </form>
        </div>

        {/* Results Display */}
        {trackingData && (
          <div className="space-y-6">
            {/* Customer Information */}
            {trackingData.customer && (
              <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
                <h2 className="text-lg font-semibold text-slate-800 mb-3">Customer Information</h2>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm font-medium text-slate-600">Customer Name:</span>
                    <p className="text-lg font-semibold text-slate-800 mt-1">{trackingData.customer.name}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-slate-600">Mobile Number:</span>
                    <p className="text-lg font-semibold text-slate-800 mt-1">
                      {trackingData.customer.country_code} {trackingData.customer.mobile}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Tracking Number */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-800 mb-3">Ticket Information</h2>
              <div className="space-y-3">
                <div>
                  <span className="text-sm font-medium text-slate-600">Ticket Tracking Number:</span>
                  <p className="text-lg font-bold text-blue-600 mt-1">{trackingData.tracking_number}</p>
                </div>
                {trackingData.status && (
                  <div>
                    <span className="text-sm font-medium text-slate-600">Current Status:</span>
                    <div className="mt-1">
                      <span
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold"
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

            {/* Issues */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-800 mb-3">Issues</h2>
              <div className="space-y-2">
                <div>
                  <span className="text-sm font-medium text-slate-600">Issue:</span>
                  <p className="text-slate-800 mt-1">{trackingData.issue}</p>
                </div>
                {trackingData.description && (
                  <div>
                    <span className="text-sm font-medium text-slate-600">Description:</span>
                    <p className="text-slate-700 mt-1">{trackingData.description}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Technician */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-800 mb-3">Technician</h2>
              {trackingData.agents && trackingData.agents.length > 0 ? (
                <div className="space-y-2">
                  {trackingData.agents.map((agent) => (
                    <div key={agent.id} className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-semibold text-sm">
                          {agent.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <span className="text-slate-700">{agent.name}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 text-sm">No technician assigned</p>
              )}
            </div>

            {/* Notes */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-800 mb-3">Notes</h2>
              {trackingData.log_notes && trackingData.log_notes.length > 0 ? (
                <div className="space-y-4">
                  {trackingData.log_notes.map((note) => (
                    <div key={note.id} className="border-l-4 border-blue-500 pl-4 py-2">
                      <p className="text-slate-700">{note.description}</p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
                        {note.agent_name && (
                          <span>By: {note.agent_name}</span>
                        )}
                        {note.time && (
                          <span>Duration: {note.time}</span>
                        )}
                        <span>{format(new Date(note.created_at), 'MMM dd, yyyy hh:mm a')}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 text-sm">No notes available</p>
              )}
            </div>

            {/* Histories */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-800 mb-4">Histories</h2>
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
                        <h3 className="text-base font-semibold text-slate-800">
                          {history.comment.split(':')[0] || 'Activity'}
                        </h3>
                        <p className="text-sm text-slate-500 mt-0.5">
                          {format(new Date(history.created_at), 'MMM dd, hh:mm a')}
                        </p>
                        {history.comment.includes(':') && (
                          <p className="text-sm text-slate-600 mt-1">
                            {history.comment.split(':').slice(1).join(':').trim()}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 text-sm">No history records found</p>
              )}
            </div>

            {/* Spare Parts */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-800 mb-3">Spare Parts</h2>
              {trackingData.spare_parts.length > 0 ? (
                <ul className="list-disc list-inside space-y-2">
                  {trackingData.spare_parts.map((part, index) => (
                    <li key={index} className="text-slate-700">{part}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-slate-500 text-sm">No spare parts used</p>
              )}
            </div>
          </div>
        )}

        {/* No Results Message */}
        {!trackingData && !isLoading && hasSearched && (
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-12 text-center">
            <div className="text-slate-400 mb-3">
              <Search className="h-16 w-16 mx-auto" />
            </div>
            <p className="text-slate-600 text-lg">No ticket found</p>
            <p className="text-slate-500 text-sm mt-2">Please check the tracking number and try again</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
