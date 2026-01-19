import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '@/components/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FileText, Calendar, Package, DollarSign, FileSpreadsheet } from 'lucide-react';
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

interface ProductDetail {
  id: number;
  product_name: string;
  product_code: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

interface TicketSplitup {
  id: number;
  tracking_number: string;
  issue: string;
  customer_name: string;
  customer_mobile: string;
  created_at: string;
  closed_at: string;
  products: ProductDetail[];
  service_charge: number;
  parts_total: number;
  total_amount: number;
}

interface MonthlySummary {
  totalTickets: number;
  totalServiceCharge: number;
  totalPartsAmount: number;
  grandTotal: number;
  totalProducts: number;
}

export default function StaffMonthlySplitups() {
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]);
  const [selectedStaff, setSelectedStaff] = useState<string>('');
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<TicketSplitup[]>([]);
  const [summary, setSummary] = useState<MonthlySummary>({
    totalTickets: 0,
    totalServiceCharge: 0,
    totalPartsAmount: 0,
    grandTotal: 0,
    totalProducts: 0,
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

    if (!selectedMonth) {
      toast.error('Please select a month');
      return;
    }

    setLoading(true);
    try {
      const params = {
        staff_id: selectedStaff,
        month: selectedMonth,
      };

      const response = await axios.get('/reports/staff-monthly-splitups', { params });

      if (response.data.success) {
        setReportData(response.data.tickets || []);
        setSummary(response.data.summary || {
          totalTickets: 0,
          totalServiceCharge: 0,
          totalPartsAmount: 0,
          grandTotal: 0,
          totalProducts: 0,
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

  const handleExportExcel = async () => {
    if (!selectedStaff || !selectedMonth) {
      toast.error('Please generate a report first');
      return;
    }

    try {
      const params = {
        staff_id: selectedStaff,
        month: selectedMonth,
      };

      // Get the selected staff name for filename
      const staff = staffMembers.find(s => s.id.toString() === selectedStaff);
      const staffName = staff ? staff.name.replace(/\s+/g, '_') : 'staff';
      const monthFormatted = selectedMonth.replace('-', '_');
      const filename = `staff_monthly_splitups_${staffName}_${monthFormatted}.xlsx`;

      const response = await axios.get('/reports/staff-monthly-splitups-excel', {
        params,
        responseType: 'blob',
        headers: {
          'Accept': 'text/csv',
        }
      });

      // Update filename to use .csv extension
      const csvFilename = filename.replace('.xlsx', '.csv');

      // Create blob link to download
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'text/csv' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', csvFilename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success('Excel report downloaded successfully');
    } catch (error: any) {
      console.error('Error exporting to Excel:', error);
      toast.error(error.response?.data?.message || 'Failed to export Excel report');
    }
  };

  return (
    <DashboardLayout>
      <div className="container-fluid px-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-2">
          <h1 className="text-xl sm:text-2xl font-semibold">Staff Monthly Split-ups (invoice report)</h1>
          <div className="flex items-center gap-2 text-xs sm:text-sm">
            <Link to="/" className="text-gray-600 hover:text-gray-800">Home</Link>
            <span className="text-gray-400">/</span>
            <Link to="/reports" className="text-gray-600 hover:text-gray-800">Reports</Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-800">Monthly Split-ups</span>
          </div>
        </div>

        {/* Filter Section */}
        <Card className="mb-6" style={{ borderColor: '#e4e4e4' }}>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Report Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap items-end gap-3">
              {/* Staff Selection */}
              <div className="flex flex-col gap-1" style={{ width: '200px' }}>
                <Label className="text-sm">Staff Member</Label>
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

              {/* Month Selection */}
              <div className="flex flex-col gap-1" style={{ width: '165px' }}>
                <Label className="text-sm">Month</Label>
                <Input
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="h-9"
                />
              </div>

              {/* Generate Button */}
              <Button
                onClick={generateReport}
                disabled={loading}
                className="h-9 px-4"
              >
                {loading ? 'Generating...' : 'Generate Report'}
              </Button>

              {/* Export Button - Show only when data is available */}
              {reportData.length > 0 && (
                <Button
                  onClick={handleExportExcel}
                  variant="outline"
                  className="flex items-center gap-2 h-9 bg-green-50 hover:bg-green-100 border-green-500 text-green-700"
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
                  ₹{summary.totalPartsAmount.toFixed(2)}
                </div>
                <p className="text-sm text-gray-600">Parts Amount</p>
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
                  {summary.totalProducts}
                </div>
                <p className="text-sm text-gray-600">Total Products</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Detailed Report */}
        {reportData.length > 0 && (
          <div className="space-y-6">
            {reportData.map((ticket, ticketIndex) => (
              <Card key={ticket.id} style={{ borderColor: '#e4e4e4' }}>
                <CardHeader className="bg-gray-50">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                    <div>
                      <h3 className="font-semibold text-lg">#{ticket.tracking_number}</h3>
                      <p className="text-sm text-gray-600">{ticket.issue}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">{ticket.customer_name}</p>
                      <p className="text-xs text-gray-500">{ticket.customer_mobile}</p>
                      <p className="text-xs text-gray-500">
                        Closed: {ticket.closed_at ? new Date(ticket.closed_at).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  {/* Two Column Layout */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Left Column - Spare Parts Details */}
                    <div>
                      <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                        <Package className="h-4 w-4" />
                        Spare Parts Used
                      </h4>
                      {ticket.products && ticket.products.length > 0 ? (
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm" style={{ border: '1px solid #e4e4e4' }}>
                            <thead className="bg-gray-50">
                              <tr style={{ borderBottom: '1px solid #e4e4e4' }}>
                                <th className="text-left py-2 px-2" style={{ borderRight: '1px solid #e4e4e4' }}>S.No</th>
                                <th className="text-left py-2 px-2" style={{ borderRight: '1px solid #e4e4e4' }}>Product</th>
                                <th className="text-left py-2 px-2" style={{ borderRight: '1px solid #e4e4e4' }}>Code</th>
                                <th className="text-center py-2 px-2" style={{ borderRight: '1px solid #e4e4e4' }}>Qty</th>
                                <th className="text-right py-2 px-2" style={{ borderRight: '1px solid #e4e4e4' }}>Unit Price</th>
                                <th className="text-right py-2 px-2">Total</th>
                              </tr>
                            </thead>
                            <tbody>
                              {ticket.products.map((product, index) => (
                                <tr key={product.id} className="hover:bg-gray-50" style={{ borderBottom: '1px solid #e4e4e4' }}>
                                  <td className="py-2 px-2" style={{ borderRight: '1px solid #e4e4e4' }}>{index + 1}</td>
                                  <td className="py-2 px-2" style={{ borderRight: '1px solid #e4e4e4' }}>{product.product_name}</td>
                                  <td className="py-2 px-2" style={{ borderRight: '1px solid #e4e4e4' }}>{product.product_code}</td>
                                  <td className="py-2 px-2 text-center" style={{ borderRight: '1px solid #e4e4e4' }}>{product.quantity}</td>
                                  <td className="py-2 px-2 text-right" style={{ borderRight: '1px solid #e4e4e4' }}>₹{product.unit_price.toFixed(2)}</td>
                                  <td className="py-2 px-2 text-right font-medium">₹{product.total_price.toFixed(2)}</td>
                                </tr>
                              ))}
                              <tr className="bg-gray-50 font-semibold" style={{ borderBottom: '1px solid #e4e4e4' }}>
                                <td colSpan={5} className="py-2 px-2 text-right" style={{ borderRight: '1px solid #e4e4e4' }}>Parts Subtotal:</td>
                                <td className="py-2 px-2 text-right">₹{ticket.parts_total.toFixed(2)}</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div>
                          <div className="text-sm text-gray-500 bg-gray-50 p-3 rounded mb-3">
                            No spare parts used for this ticket
                          </div>
                          <table className="w-full text-sm" style={{ border: '1px solid #e4e4e4' }}>
                            <tbody>
                              <tr className="bg-gray-50 font-semibold" style={{ borderBottom: '1px solid #e4e4e4' }}>
                                <td className="py-2 px-2 text-right" style={{ borderRight: '1px solid #e4e4e4' }}>Parts Subtotal:</td>
                                <td className="py-2 px-2 text-right w-32">₹0.00</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>

                    {/* Right Column - Ticket Total Summary */}
                    <div>
                      <div className="bg-blue-50 p-4 rounded-lg h-full">
                        <h4 className="font-medium text-sm mb-3 flex items-center gap-2">
                          <DollarSign className="h-4 w-4" />
                          Ticket Total Summary
                        </h4>
                        <div className="space-y-3">
                          <div className="bg-white p-3 rounded">
                            <div className="flex justify-between text-sm mb-2">
                              <span className="text-gray-600">Parts Count:</span>
                              <span className="font-medium">{ticket.products?.length || 0} items</span>
                            </div>
                            <div className="flex justify-between text-sm mb-2">
                              <span className="text-gray-600">Parts Total:</span>
                              <span className="font-medium text-orange-600">₹{ticket.parts_total.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Service Charge:</span>
                              <span className="font-medium text-green-600">₹{ticket.service_charge.toFixed(2)}</span>
                            </div>
                          </div>

                          <div className="bg-gradient-to-r from-blue-100 to-blue-200 p-3 rounded">
                            <div className="flex justify-between font-bold text-lg">
                              <span>Grand Total:</span>
                              <span className="text-blue-700">₹{ticket.total_amount.toFixed(2)}</span>
                            </div>
                          </div>

                          {/* Additional Info */}
                          <div className="text-xs text-gray-600 pt-2">
                            <div className="flex justify-between">
                              <div>
                                <span className="text-gray-500">Created: </span>
                                <span className="font-medium">{ticket.created_at ? new Date(ticket.created_at).toLocaleDateString() : 'N/A'}</span>
                              </div>
                              <div>
                                <span className="text-gray-500">Closed: </span>
                                <span className="font-medium">{ticket.closed_at ? new Date(ticket.closed_at).toLocaleDateString() : 'N/A'}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Grand Total Card */}
            <Card className="bg-gradient-to-r from-blue-50 to-purple-50" style={{ borderColor: '#e4e4e4' }}>
              <CardContent className="p-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-700">Report Grand Total</h3>
                    <p className="text-sm text-gray-600">Total for all {summary.totalTickets} tickets</p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-purple-700">
                      ₹{summary.grandTotal.toFixed(2)}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      Service: ₹{summary.totalServiceCharge.toFixed(2)} | Parts: ₹{summary.totalPartsAmount.toFixed(2)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* No Data Message */}
        {!loading && reportData.length === 0 && selectedStaff && selectedMonth && (
          <Card style={{ borderColor: '#e4e4e4' }}>
            <CardContent className="py-12 text-center">
              <FileText className="h-12 w-12 mx-auto text-gray-400 mb-3" />
              <p className="text-gray-500">No closed tickets found for the selected month</p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}