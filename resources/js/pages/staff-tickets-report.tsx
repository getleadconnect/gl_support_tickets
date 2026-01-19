import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '@/components/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FileText, FileSpreadsheet, Calendar, User } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';
import jQuery from 'jquery';
import select2Factory from 'select2';
import 'select2/dist/css/select2.min.css';

// Initialize select2 on jQuery
select2Factory(jQuery);

// Make jQuery available globally
(window as any).jQuery = jQuery;
(window as any).$ = jQuery;

interface StaffMember {
  id: number;
  name: string;
  email: string;
}

interface TicketReport {
  id: number;
  tracking_number: string;
  issue: string;
  customer_name: string;
  status: string;
  priority: string;
  created_at: string;
  closed_at: string;
  resolution_time: string;
  service_charge?: number;
  parts_cost?: number;
  total_amount?: number;
}

export default function StaffTicketsReport() {
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]);
  const [selectedStaff, setSelectedStaff] = useState<string>('');
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('month'); // 'month' or 'custom'
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<TicketReport[]>([]);
  const [summary, setSummary] = useState({
    totalTickets: 0,
    totalServiceCharge: 0,
    totalPartsCost: 0,
    grandTotal: 0,
    avgResolutionTime: '0',
  });

  // Ref for Select2 staff dropdown
  const staffSelectRef = useRef<HTMLSelectElement>(null);

  useEffect(() => {
    fetchStaffMembers();
    // Set default month to current month
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    setSelectedMonth(currentMonth);
  }, []);

  const fetchStaffMembers = async () => {
    try {
      const response = await axios.get('/agent-users');
      setStaffMembers(response.data || []);
    } catch (error) {
      console.error('Error fetching staff members:', error);
      toast.error('Failed to fetch staff members');
    }
  };

  // Initialize Select2 for staff dropdown
  useEffect(() => {
    if (staffMembers.length === 0) return;

    const timeoutId = setTimeout(() => {
      if (!staffSelectRef.current) return;

      const $ = jQuery;
      const $select = $(staffSelectRef.current);

      // Destroy existing instance if any
      if ($select.data('select2')) {
        $select.select2('destroy');
      }

      $select.select2({
        placeholder: 'Select staff member',
        allowClear: true,
        width: '100%',
        minimumResultsForSearch: 0, // Always show search box
        dropdownParent: $select.parent(),
        templateResult: function(staff: any) {
          if (!staff.id) {
            return staff.text;
          }
          const $result = $('<span style="font-size: 14px;"></span>');
          $result.text(staff.text);
          return $result;
        },
        templateSelection: function(staff: any) {
          if (!staff.id) {
            return staff.text;
          }
          const $result = $('<span style="font-size: 14px;"></span>');
          $result.text(staff.text);
          return $result;
        }
      });

      // Apply height styling
      const $container = $select.next('.select2-container');
      $container.find('.select2-selection--single').css({
        'height': '38px',
        'display': 'flex',
        'align-items': 'center'
      });

      $container.find('.select2-selection__clear').css({
        'padding-left': '8px'
      });

      // Ensure dropdown has proper z-index
      $('.select2-dropdown').css({
        'z-index': '10000'
      });

      $select.on('change', function() {
        const value = $(this).val() as string;
        setSelectedStaff(value || '');
      });

      // Set initial value
      if (selectedStaff) {
        $select.val(selectedStaff).trigger('change.select2');
      }

    }, 300);

    return () => {
      clearTimeout(timeoutId);
      try {
        const $select = jQuery(staffSelectRef.current);
        if ($select.data('select2')) {
          $select.select2('destroy');
        }
      } catch (error) {
        // Silently fail
      }
    };
  }, [staffMembers, selectedStaff]);

  const generateReport = async () => {
    if (!selectedStaff) {
      toast.error('Please select a staff member');
      return;
    }

    if (filterType === 'custom' && (!startDate || !endDate)) {
      toast.error('Please select date range');
      return;
    }

    if (filterType === 'month' && !selectedMonth) {
      toast.error('Please select a month');
      return;
    }

    setLoading(true);
    try {
      const params: any = {
        staff_id: selectedStaff,
      };

      if (filterType === 'month') {
        params.month = selectedMonth;
      } else {
        params.start_date = startDate;
        params.end_date = endDate;
      }

      const response = await axios.get('/reports/staff-tickets', { params });

      if (response.data.success) {
        setReportData(response.data.tickets || []);
        setSummary(response.data.summary || {
          totalTickets: 0,
          totalServiceCharge: 0,
          totalPartsCost: 0,
          grandTotal: 0,
          avgResolutionTime: '0',
        });
      } else {
        throw new Error('Failed to generate report');
      }
    } catch (error: any) {
      console.error('Error generating report:', error);
      toast.error(error.response?.data?.message || 'Failed to generate report');
      setReportData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    if (reportData.length === 0) {
      toast.error('No data to export');
      return;
    }

    try {
      toast.loading('Generating export file...');

      // Get selected staff member name
      const selectedStaffMember = staffMembers.find(s => s.id.toString() === selectedStaff);
      const staffName = selectedStaffMember ? selectedStaffMember.name : 'Unknown Staff';

      // Prepare report parameters
      const params: any = {
        staff_id: selectedStaff,
        staff_name: staffName,
        format: 'csv'
      };

      if (filterType === 'month') {
        params.month = selectedMonth;
        params.filter_description = `Month: ${selectedMonth}`;
      } else {
        params.start_date = startDate;
        params.end_date = endDate;
        params.filter_description = `Date Range: ${startDate} to ${endDate}`;
      }

      // Make API call to generate CSV
      const response = await axios.get('/reports/staff-tickets-excel', {
        params,
        responseType: 'blob'
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;

      // Generate filename with date
      const date = new Date();
      const filename = `staff_tickets_report_${staffName.replace(/\s+/g, '_')}_${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}.csv`;

      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();

      // Cleanup
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.dismiss();
      toast.success('Report exported successfully');
    } catch (error: any) {
      console.error('Error exporting report:', error);
      toast.dismiss();
      toast.error(error.response?.data?.message || 'Failed to export report');
    }
  };

  return (
    <DashboardLayout>
      <div className="container-fluid px-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-2">
          <h1 className="text-xl sm:text-2xl font-semibold">Staff Tickets Report</h1>
          <div className="flex items-center gap-2 text-xs sm:text-sm">
            <Link to="/" className="text-gray-600 hover:text-gray-800">Home</Link>
            <span className="text-gray-400">/</span>
            <Link to="/reports" className="text-gray-600 hover:text-gray-800">Reports</Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-800">Staff Tickets</span>
          </div>
        </div>

        {/* Filter Section */}
        <Card className="mb-6" style={{ borderColor: '#e4e4e4' }}>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="h-5 w-5" />
              Report Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap items-end gap-3">
              {/* Staff Selection */}
              <div className="space-y-2" style={{ width: '200px' }}>
                <Label>Select Staff Member</Label>
                <select
                  ref={staffSelectRef}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={selectedStaff}
                  onChange={(e) => setSelectedStaff(e.target.value)}
                >
                  <option value="">Select staff member</option>
                  {staffMembers.map((staff) => (
                    <option key={staff.id} value={staff.id.toString()}>
                      {staff.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filter Type */}
              <div className="space-y-2" style={{ width: '150px' }}>
                <Label>Filter Type</Label>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select filter type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="month">Monthly</SelectItem>
                    <SelectItem value="custom">Custom Date</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Month Selection */}
              {filterType === 'month' && (
                <div className="space-y-2" style={{ width: '166px' }}>
                  <Label>Select Month</Label>
                  <Input
                    type="month"
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                  />
                </div>
              )}

              {/* Custom Date Range */}
              {filterType === 'custom' && (
                <>
                  <div className="space-y-2" style={{ width: '150px' }}>
                    <Label>Start Date</Label>
                    <Input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2" style={{ width: '150px' }}>
                    <Label>End Date</Label>
                    <Input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                  </div>
                </>
              )}

              {/* Buttons */}
              <Button
                onClick={generateReport}
                disabled={loading}
              >
                {loading ? 'Generating...' : 'Generate Report'}
              </Button>
              {reportData.length > 0 && (
                <Button
                  onClick={handleExport}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <FileSpreadsheet className="h-4 w-4" />
                  Export
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Summary Section */}
        {reportData.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            <Card style={{ borderColor: '#e4e4e4' }}>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-blue-600">
                  {summary.totalTickets}
                </div>
                <p className="text-sm text-gray-600">Total Tickets</p>
              </CardContent>
            </Card>
            <Card style={{ borderColor: '#e4e4e4' }}>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-green-600">
                  ₹{summary.totalServiceCharge.toFixed(2)}
                </div>
                <p className="text-sm text-gray-600">Service Charges</p>
              </CardContent>
            </Card>
            <Card style={{ borderColor: '#e4e4e4' }}>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-orange-600">
                  ₹{summary.totalPartsCost.toFixed(2)}
                </div>
                <p className="text-sm text-gray-600">Parts Cost</p>
              </CardContent>
            </Card>
            <Card style={{ borderColor: '#e4e4e4' }}>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-purple-600">
                  ₹{summary.grandTotal.toFixed(2)}
                </div>
                <p className="text-sm text-gray-600">Grand Total</p>
              </CardContent>
            </Card>
            <Card style={{ borderColor: '#e4e4e4' }}>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-indigo-600">
                  {summary.avgResolutionTime}
                </div>
                <p className="text-sm text-gray-600">Avg Resolution</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Report Table */}
        {reportData.length > 0 && (
          <Card style={{ borderColor: '#e4e4e4' }}>
            <CardHeader>
              <CardTitle className="text-lg">Closed Tickets Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b" style={{ borderColor: '#e4e4e4' }}>
                      <th className="text-left p-2 text-sm font-medium">#</th>
                      <th className="text-left p-2 text-sm font-medium">Tracking ID</th>
                      <th className="text-left p-2 text-sm font-medium">Issue</th>
                      <th className="text-left p-2 text-sm font-medium">Customer</th>
                      <th className="text-left p-2 text-sm font-medium">Priority</th>
                      <th className="text-left p-2 text-sm font-medium">Created</th>
                      <th className="text-left p-2 text-sm font-medium">Closed</th>
                      <th className="text-left p-2 text-sm font-medium">Resolution</th>
                      <th className="text-right p-2 text-sm font-medium">Service</th>
                      <th className="text-right p-2 text-sm font-medium">Parts</th>
                      <th className="text-right p-2 text-sm font-medium">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.map((ticket, index) => (
                      <tr key={ticket.id} className="border-b hover:bg-gray-50" style={{ borderColor: '#e4e4e4' }}>
                        <td className="p-2 text-sm">{index + 1}</td>
                        <td className="p-2 text-sm font-medium">{ticket.tracking_number}</td>
                        <td className="p-2 text-sm">{ticket.issue}</td>
                        <td className="p-2 text-sm">{ticket.customer_name}</td>
                        <td className="p-2">
                          <span className={`text-xs px-2 py-1 rounded ${
                            ticket.priority === 'High' ? 'bg-red-100 text-red-700' :
                            ticket.priority === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-green-100 text-green-700'
                          }`}>
                            {ticket.priority}
                          </span>
                        </td>
                        <td className="p-2 text-sm">
                          {new Date(ticket.created_at).toLocaleDateString()}
                        </td>
                        <td className="p-2 text-sm">
                          {ticket.closed_at ? new Date(ticket.closed_at).toLocaleDateString() : '-'}
                        </td>
                        <td className="p-2 text-sm">{ticket.resolution_time}</td>
                        <td className="p-2 text-sm text-right">₹{(ticket.service_charge || 0).toFixed(2)}</td>
                        <td className="p-2 text-sm text-right">₹{(ticket.parts_cost || 0).toFixed(2)}</td>
                        <td className="p-2 text-sm text-right font-medium">
                          ₹{(ticket.total_amount || 0).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="font-semibold bg-gray-50">
                      <td colSpan={8} className="p-2 text-sm text-right">Total:</td>
                      <td className="p-2 text-sm text-right">₹{summary.totalServiceCharge.toFixed(2)}</td>
                      <td className="p-2 text-sm text-right">₹{summary.totalPartsCost.toFixed(2)}</td>
                      <td className="p-2 text-sm text-right">₹{summary.grandTotal.toFixed(2)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* No Data Message */}
        {!loading && reportData.length === 0 && selectedStaff && (
          <Card style={{ borderColor: '#e4e4e4' }}>
            <CardContent className="py-12 text-center">
              <FileText className="h-12 w-12 mx-auto text-gray-400 mb-3" />
              <p className="text-gray-500">No tickets found for the selected criteria</p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}