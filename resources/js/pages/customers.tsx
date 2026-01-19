import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { DashboardLayout } from '@/components/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, UserPlus, Edit, Upload, Download, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AddTicketModal } from '@/components/AddTicketModal';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
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
import { Label } from '@/components/ui/label';
import toast from 'react-hot-toast';
import { CountryCodePicker } from '@/components/CountryCodePicker';

interface Ticket {
  id: number;
  issue: string;
  status: number;
  ticket_status?: {
    id: number;
    status: string;
    color_code?: string;
  };
}

interface Customer {
  id: number;
  name: string;
  email: string | null;
  country_code: string | null;
  mobile: string | null;
  company_name: string | null;
  branch_id?: number | null;
  branch?: {
    id: number;
    branch_name: string;
  };
  created_at: string;
  updated_at: string;
  tickets_count?: number;
  tickets?: Ticket[];
}

interface Branch {
  id: number;
  branch_name: string;
}

export default function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [perPage, setPerPage] = useState('10');
  const [searchTerm, setSearchTerm] = useState('');
  const [addTicketModalOpen, setAddTicketModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [addCustomerModalOpen, setAddCustomerModalOpen] = useState(false);
  const [editCustomerModalOpen, setEditCustomerModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [customerFormData, setCustomerFormData] = useState({
    name: '',
    countryCode: '+91',
    mobile: '',
    email: '',
    companyName: '',
    branchId: ''
  });
  const [savingCustomer, setSavingCustomer] = useState(false);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [hoveredCustomerId, setHoveredCustomerId] = useState<number | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);
  const [deleting, setDeleting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchBranches();
    fetchCurrentUser();
  }, []);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchCustomers();
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [currentPage, perPage, searchTerm]);

  const fetchBranches = async () => {
    try {
      const response = await axios.get('/branches');
      console.log('Branches response:', response.data);
      // The response is directly an array, not wrapped in a data property
      const branchData = Array.isArray(response.data) ? response.data : [];
      console.log('Branches data:', branchData);
      setBranches(branchData);
    } catch (error) {
      console.error('Error fetching branches:', error);
      setBranches([]);
    }
  };

  const fetchCurrentUser = async () => {
    try {
      const response = await axios.get('/user');
      console.log('Current user response:', response.data.user);
      setCurrentUser(response.data.user);
      
      // If user is not admin, set their branch automatically
      if (response.data.user && response.data.user.role_id !== 1 && response.data.user.branch_id) {
        const branchId = response.data.user.branch_id.toString();
        console.log('Setting branch ID for non-admin user:', branchId);
        setCustomerFormData(prev => ({
          ...prev,
          branchId: branchId
        }));
      }
    } catch (error) {
      console.error('Error fetching current user:', error);
    }
  };

  const fetchCustomers = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get('/customers-with-tickets', {
        params: {
          page: currentPage,
          per_page: perPage,
          search: searchTerm,
        },
      });
      console.log('Customers response:', response.data);
      const data = response.data;
      setCustomers(data.data || []);
      setTotalPages(data.last_page || 1);
      setTotalItems(data.total || 0);
      setCurrentPage(data.current_page || 1);
    } catch (err: any) {
      console.error('Error fetching customers:', err);
      setError(err.response?.data?.message || 'Failed to fetch customers');
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name: string) => {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const getCircleColor = (index: number) => {
    // All avatars with white background and black text
    return 'bg-white text-black border border-gray-300';
  };

  const getStatusBadgeStyle = (status?: string) => {
    if (!status) return 'bg-gray-100 text-gray-800';
    
    const statusLower = status.toLowerCase();
    if (statusLower === 'open') {
      return 'bg-green-100 text-black'; // Light green with black text
    } else if (statusLower === 'in progress' || statusLower === 'in_progress') {
      return 'bg-yellow-100 text-black'; // Light yellow with black text  
    } else if (statusLower === 'closed') {
      return 'bg-red-100 text-black'; // Light red with black text
    } else if (statusLower === 'resolved') {
      return 'bg-blue-100 text-black'; // Light blue with black text
    }
    return 'bg-gray-100 text-gray-800';
  };

  const handleAddTicket = (customer: Customer) => {
    setSelectedCustomer(customer);
    setAddTicketModalOpen(true);
  };

  const handleTicketCreated = () => {
    // Refresh customers to update ticket counts
    fetchCustomers();
  };

  const handleCustomerClick = (customer: Customer) => {
    // Navigate to customer details page
    navigate(`/customers/${customer.id}`);
  };

  const handlePerPageChange = (value: string) => {
    setPerPage(value);
    setCurrentPage(1);
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleAddCustomer = () => {
    const branchId = currentUser?.role_id !== 1 && currentUser?.branch_id 
      ? currentUser.branch_id.toString() 
      : '';
    
    console.log('Opening Add Customer Modal:', {
      currentUser: currentUser,
      userRole: currentUser?.role_id,
      userBranch: currentUser?.branch_id,
      settingBranchId: branchId
    });
    
    setAddCustomerModalOpen(true);
    setCustomerFormData({
      name: '',
      countryCode: '+91',
      mobile: '',
      email: '',
      companyName: '',
      branchId: branchId
    });
  };

  const handleCustomerFormChange = (field: string, value: string) => {
    setCustomerFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleEditCustomer = (customer: Customer) => {
    setEditingCustomer(customer);
    
    // Parse phone number to separate country code and mobile
    let countryCode = '+91';
    let mobile = '';
    
    if (customer.mobile) {
      // Check if mobile starts with country code
      if (customer.mobile.startsWith('+91')) {
        countryCode = '+91';
        mobile = customer.mobile.substring(3);
      } else if (customer.mobile.startsWith('+')) {
        // Extract other country codes
        const match = customer.mobile.match(/^(\+\d{1,3})(.*)$/);
        if (match) {
          countryCode = match[1];
          mobile = match[2];
        }
      } else {
        mobile = customer.mobile;
      }
    } else if (customer.country_code) {
      countryCode = customer.country_code.startsWith('+') ? customer.country_code : '+' + customer.country_code;
    }
    
    setCustomerFormData({
      name: customer.name || '',
      countryCode: countryCode,
      mobile: mobile,
      email: customer.email || '',
      companyName: customer.company_name || '',
      branchId: customer.branch_id?.toString() || (currentUser?.role_id !== 1 ? currentUser?.branch_id?.toString() : '') || ''
    });
    
    setEditCustomerModalOpen(true);
  };

  const handleSaveCustomer = async () => {
    // Validate required fields
    if (!customerFormData.name.trim()) {
      toast.error('Name is required');
      return;
    }

    setSavingCustomer(true);
    
    try {
      const payload: any = {
        name: customerFormData.name.trim(),
        email: customerFormData.email.trim() || null,
        country_code: customerFormData.countryCode || '+91',
        contact_number: customerFormData.mobile || null,
        company_name: customerFormData.companyName.trim() || null
      };
      
      // Add branch_id 
      if (customerFormData.branchId) {
        payload.branch_id = parseInt(customerFormData.branchId);
      } else if (currentUser?.role_id !== 1 && currentUser?.branch_id) {
        // For non-admin users, use their branch_id
        payload.branch_id = parseInt(currentUser.branch_id);
      }

      const response = await axios.post('/customers', payload);
      
      if (response.data) {
        toast.success('Customer added successfully');
        setAddCustomerModalOpen(false);
        fetchCustomers(); // Refresh the customer list
        
        // Reset form
        setCustomerFormData({
          name: '',
          countryCode: '+91',
          mobile: '',
          email: '',
          companyName: '',
          branchId: currentUser?.role_id !== 1 ? currentUser?.branch_id?.toString() || '' : ''
        });
      }
    } catch (error: any) {
      console.error('Error creating customer:', error);
      toast.error(error.response?.data?.message || 'Failed to add customer');
    } finally {
      setSavingCustomer(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validTypes = ['text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'text/plain'];
      const validExtensions = ['.csv', '.xls', '.xlsx'];
      const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();

      if (!validTypes.includes(file.type) && !validExtensions.includes(fileExtension)) {
        toast.error('Please select a valid CSV or Excel file');
        return;
      }
      setImportFile(file);
    }
  };

  const handleDeleteClick = (customer: Customer) => {
    setCustomerToDelete(customer);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteCustomer = async () => {
    if (!customerToDelete) return;

    setDeleting(true);
    try {
      const response = await axios.delete(`/customers/${customerToDelete.id}`);

      if (response.data.success) {
        toast.success('Customer deleted successfully');
        fetchCustomers(); // Refresh the list
        setDeleteConfirmOpen(false);
        setCustomerToDelete(null);
      }
    } catch (error: any) {
      console.error('Error deleting customer:', error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Failed to delete customer');
      }
    } finally {
      setDeleting(false);
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const response = await axios.get('/customers/download-template', {
        responseType: 'blob'
      });

      // Create a download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'customer_sample.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success('Template downloaded successfully');
    } catch (error) {
      console.error('Error downloading template:', error);
      toast.error('Failed to download template');
    }
  };

  const handleImportCustomers = async () => {
    if (!importFile) {
      toast.error('Please select a file to import');
      return;
    }

    setImporting(true);
    const formData = new FormData();
    formData.append('file', importFile);

    // Add branch_id for non-admin users
    if (currentUser?.role_id !== 1 && currentUser?.branch_id) {
      formData.append('branch_id', currentUser.branch_id.toString());
    }

    try {
      const response = await axios.post('/customers/import', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        toast.success(`Successfully imported ${response.data.imported_count} customers`);
        setImportModalOpen(false);
        setImportFile(null);
        fetchCustomers(); // Refresh the customer list

        // Reset file input
        const fileInput = document.getElementById('import-file') as HTMLInputElement;
        if (fileInput) {
          fileInput.value = '';
        }
      }
    } catch (error: any) {
      console.error('Import error:', error);
      if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        Object.keys(errors).forEach(key => {
          toast.error(`Row ${key}: ${errors[key].join(', ')}`);
        });
      } else {
        toast.error(error.response?.data?.message || 'Failed to import customers');
      }
    } finally {
      setImporting(false);
    }
  };

  const handleUpdateCustomer = async () => {
    // Validate required fields
    if (!customerFormData.name.trim()) {
      toast.error('Name is required');
      return;
    }

    if (!editingCustomer) return;

    setSavingCustomer(true);

    try {
      const payload: any = {
        name: customerFormData.name.trim(),
        email: customerFormData.email.trim() || null,
        country_code: customerFormData.countryCode || '+91',
        contact_number: customerFormData.mobile || null,
        company_name: customerFormData.companyName.trim() || null
      };

      // Add branch_id
      if (customerFormData.branchId) {
        payload.branch_id = parseInt(customerFormData.branchId);
      } else if (currentUser?.role_id !== 1 && currentUser?.branch_id) {
        // For non-admin users, use their branch_id
        payload.branch_id = parseInt(currentUser.branch_id);
      }

      const response = await axios.put(`/customers/${editingCustomer.id}`, payload);
      
      if (response.data) {
        toast.success('Customer updated successfully');
        setEditCustomerModalOpen(false);
        setEditingCustomer(null);
        fetchCustomers(); // Refresh the customer list
        
        // Reset form
        setCustomerFormData({
          name: '',
          countryCode: '+91',
          mobile: '',
          email: '',
          companyName: '',
          branchId: currentUser?.role_id !== 1 ? currentUser?.branch_id?.toString() || '' : ''
        });
      }
    } catch (error: any) {
      console.error('Error updating customer:', error);
      toast.error(error.response?.data?.message || 'Failed to update customer');
    } finally {
      setSavingCustomer(false);
    }
  };

  return (
    <DashboardLayout title="Customers">
      <div>
        <div className="bg-white rounded-lg shadow-sm">
          {/* Header */}
          <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="flex items-center justify-between w-full">
                <h1 className="text-xl sm:text-2xl font-semibold text-black">Customers</h1>
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => setImportModalOpen(true)}
                    className="flex items-center gap-1"
                    size="sm"
                    variant="outline"
                  >
                    <Upload className="h-4 w-4" />
                    Import
                  </Button>
                  <Button
                    onClick={handleAddCustomer}
                    className="flex items-center gap-1"
                    size="sm"
                  >
                    <UserPlus className="h-4 w-4" />
                    Add Customer
                  </Button>
                </div>
              </div>
            </div>
            <span className="text-xs sm:text-sm text-blue-600 mt-2 block">* Click on customer name to display details</span>
          </div>

          {/* Search and Rows per page */}
          <div className="px-4 sm:px-6 pb-4" style={{marginTop: '15px'}}>
            <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-xs sm:text-sm text-gray-600">Rows per page:</span>
                <Select value={perPage} onValueChange={handlePerPageChange}>
                  <SelectTrigger className="w-[70px] h-8">
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
                  placeholder="Search customers..."
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-9 pr-3 h-9 w-full sm:w-[300px]"
                />
              </div>
            </div>
          </div>

          {/* Customer List */}
          <div className="px-4 sm:px-6 pb-6">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-gray-500">Loading customers...</div>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-red-500">Error: {error}</div>
              </div>
            ) : customers.length === 0 ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-gray-500">No customers found</div>
              </div>
            ) : (
              <div className="space-y-4">
                {customers.map((customer, index) => (
                  <div
                    key={customer.id}
                    className="group flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 border border-gray-200 rounded-lg hover:shadow-md transition-all gap-4"
                    onMouseEnter={() => setHoveredCustomerId(customer.id)}
                    onMouseLeave={() => setHoveredCustomerId(null)}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                      {/* Mobile: Row layout, Desktop: Original layout */}
                      <div className="flex items-center gap-3 sm:gap-4">
                        {/* Initial Circle */}
                        <div
                          className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full ${getCircleColor(index)} flex items-center justify-center font-semibold text-base sm:text-lg flex-shrink-0`}
                        >
                          {getInitials(customer.name)}
                        </div>
                        
                        {/* Customer Name - Always visible on mobile */}
                        <button
                          onClick={() => handleCustomerClick(customer)}
                          className="text-blue-600 hover:text-blue-700 font-medium text-sm sm:text-base transition-colors"
                        >
                          {customer.name}
                        </button>
                      </div>
                      
                      {/* Customer Info - Stack on mobile */}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 ml-0 sm:ml-0">
                        {/* Phone */}
                        {(customer.country_code || customer.mobile) && (
                          <div className="text-gray-600 text-xs sm:text-sm">
                            <span>
                              {(() => {
                                // Handle country code display
                                const countryCode = customer.country_code ? 
                                  (customer.country_code.startsWith('+') ? customer.country_code : `+${customer.country_code}`) : '';
                                
                                // Handle mobile number display - remove country code if it's included
                                let mobileNumber = customer.mobile || '';
                                if (mobileNumber && countryCode) {
                                  // Remove country code from mobile if it starts with it
                                  const codeWithoutPlus = countryCode.replace('+', '');
                                  if (mobileNumber.startsWith(countryCode)) {
                                    mobileNumber = mobileNumber.substring(countryCode.length);
                                  } else if (mobileNumber.startsWith(codeWithoutPlus)) {
                                    mobileNumber = mobileNumber.substring(codeWithoutPlus.length);
                                  } else if (mobileNumber.startsWith('+' + codeWithoutPlus)) {
                                    mobileNumber = mobileNumber.substring(codeWithoutPlus.length + 1);
                                  }
                                }
                                
                                return countryCode + (countryCode && mobileNumber ? ' ' : '') + mobileNumber;
                              })()}
                            </span>
                          </div>
                        )}
                        
                        {/* Email */}
                        {customer.email && (
                          <div className="text-gray-600 text-xs sm:text-sm break-all">
                            <span>{customer.email}</span>
                          </div>
                        )}
                        
                        {/* Company */}
                        {customer.company_name && (
                          <div className="text-gray-600 text-xs sm:text-sm">
                            <span>{customer.company_name}</span>
                          </div>
                        )}
                        
                        {/* Tickets Count Badge */}
                        <div className="flex items-center">
                          <Badge 
                            variant={customer.tickets_count && customer.tickets_count > 0 ? "default" : "secondary"}
                            className={`${
                              customer.tickets_count && customer.tickets_count > 0 
                                ? 'bg-purple-100 text-purple-800 hover:bg-purple-200' 
                                : 'bg-gray-100 text-gray-600'
                            } font-semibold`}
                          >
                            {customer.tickets_count || 0} {customer.tickets_count === 1 ? 'Ticket' : 'Tickets'}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons - Always visible on mobile, hover on desktop */}
                    <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                      <Button
                        onClick={() => handleAddTicket(customer)}
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-1 w-full sm:w-auto opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-xs sm:text-sm"
                      >
                        Add Ticket
                        <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                      </Button>
                      <Button
                        onClick={() => handleEditCustomer(customer)}
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-1 w-full sm:w-auto opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-xs sm:text-sm"
                      >
                        Edit
                        <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                      </Button>
                      <Button
                        onClick={() => handleDeleteClick(customer)}
                        variant="outline"
                        size="sm"
                        className="opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-red-600 hover:text-red-700 hover:bg-red-50 p-2"
                        title="Delete Customer"
                      >
                        <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {/* Pagination */}
            {!loading && customers.length > 0 && (
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-6 pt-4 border-t border-gray-200 gap-4">
                <div className="text-xs sm:text-sm text-gray-600 text-center sm:text-left">
                  Showing {((currentPage - 1) * parseInt(perPage)) + 1} to{' '}
                  {Math.min(currentPage * parseInt(perPage), totalItems)} of {totalItems} customers
                </div>
                
                <div className="flex items-center justify-center sm:justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="text-xs sm:text-sm"
                  >
                    Previous
                  </Button>
                  
                  {/* Page numbers - Show fewer on mobile */}
                  <div className="hidden sm:flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      
                      return (
                        <Button
                          key={pageNum}
                          variant={currentPage === pageNum ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(pageNum)}
                          className="min-w-[40px]"
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                  </div>
                  
                  {/* Mobile page indicator */}
                  <div className="flex sm:hidden items-center px-3 text-xs">
                    Page {currentPage} of {totalPages}
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="text-xs sm:text-sm"
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Ticket Modal */}
      <AddTicketModal
        open={addTicketModalOpen}
        onOpenChange={setAddTicketModalOpen}
        customerId={selectedCustomer?.id}
        customerName={selectedCustomer?.name}
        onTicketCreated={handleTicketCreated}
      />

      {/* Add Customer Modal */}
      <Dialog open={addCustomerModalOpen} onOpenChange={setAddCustomerModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Customer</DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            {/* Name Field */}
            <div className="grid gap-2">
              <Label htmlFor="name">
                Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                placeholder="Enter customer name"
                value={customerFormData.name}
                onChange={(e) => handleCustomerFormChange('name', e.target.value)}
              />
            </div>

            {/* Mobile Field with Country Code */}
            <div className="grid gap-2">
              <Label htmlFor="mobile">Whatsapp Number</Label>
              <div className="flex gap-2">
                <CountryCodePicker
                  value={customerFormData.countryCode}
                  onChange={(value) => handleCustomerFormChange('countryCode', value)}
                  className="w-28"
                />
                <Input
                  id="mobile"
                  placeholder="Enter whatsapp number"
                  value={customerFormData.mobile}
                  onChange={(e) => handleCustomerFormChange('mobile', e.target.value)}
                  className="flex-1"
                />
              </div>
            </div>

            {/* Email Field */}
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter email address"
                value={customerFormData.email}
                onChange={(e) => handleCustomerFormChange('email', e.target.value)}
              />
            </div>

            {/* Company Name Field */}
            <div className="grid gap-2">
              <Label htmlFor="companyName">Company Name</Label>
              <Input
                id="companyName"
                placeholder="Enter company name"
                value={customerFormData.companyName}
                onChange={(e) => handleCustomerFormChange('companyName', e.target.value)}
              />
            </div>

            {/* Branch Field */}
            <div className="grid gap-2">
              <Label htmlFor="branch">Branch</Label>
              <Select
                value={customerFormData.branchId || (currentUser?.role_id !== 1 ? currentUser?.branch_id?.toString() : '')}
                onValueChange={(value) => handleCustomerFormChange('branchId', value)}
                disabled={currentUser?.role_id !== 1}
              >
                <SelectTrigger disabled={currentUser?.role_id !== 1}>
                  <SelectValue placeholder="Select branch" />
                </SelectTrigger>
                <SelectContent>
                  {branches.map((branch) => {
                    // For admin users (role_id=1): show all branches
                    // For non-admin users: only show the branch that matches their branch_id
                    if (currentUser?.role_id === 1 || 
                        branch.id === Number(currentUser?.branch_id) || 
                        branch.id.toString() === currentUser?.branch_id?.toString()) {
                      return (
                        <SelectItem key={branch.id} value={branch.id.toString()}>
                          {branch.branch_name}
                        </SelectItem>
                      );
                    }
                    return null;
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setAddCustomerModalOpen(false)}
              disabled={savingCustomer}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveCustomer}
              disabled={savingCustomer || !customerFormData.name.trim()}
            >
              {savingCustomer ? 'Saving...' : 'Save Customer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Customer Modal */}
      <Dialog open={editCustomerModalOpen} onOpenChange={setEditCustomerModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Customer</DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            {/* Name Field */}
            <div className="grid gap-2">
              <Label htmlFor="edit-name">
                Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="edit-name"
                placeholder="Enter customer name"
                value={customerFormData.name}
                onChange={(e) => handleCustomerFormChange('name', e.target.value)}
              />
            </div>

            {/* Mobile Field with Country Code */}
            <div className="grid gap-2">
              <Label htmlFor="edit-mobile">Whatsapp Number</Label>
              <div className="flex gap-2">
                <CountryCodePicker
                  value={customerFormData.countryCode}
                  onChange={(value) => handleCustomerFormChange('countryCode', value)}
                  className="w-28"
                />
                <Input
                  id="edit-mobile"
                  placeholder="Enter whatsapp number"
                  value={customerFormData.mobile}
                  onChange={(e) => handleCustomerFormChange('mobile', e.target.value)}
                  className="flex-1"
                />
              </div>
            </div>

            {/* Email Field */}
            <div className="grid gap-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                placeholder="Enter email address"
                value={customerFormData.email}
                onChange={(e) => handleCustomerFormChange('email', e.target.value)}
              />
            </div>

            {/* Company Name Field */}
            <div className="grid gap-2">
              <Label htmlFor="edit-companyName">Company Name</Label>
              <Input
                id="edit-companyName"
                placeholder="Enter company name"
                value={customerFormData.companyName}
                onChange={(e) => handleCustomerFormChange('companyName', e.target.value)}
              />
            </div>

            {/* Branch Field */}
            <div className="grid gap-2">
              <Label htmlFor="edit-branch">Branch</Label>
              <Select
                value={customerFormData.branchId || (currentUser?.role_id !== 1 ? currentUser?.branch_id?.toString() : '')}
                onValueChange={(value) => handleCustomerFormChange('branchId', value)}
                disabled={currentUser?.role_id !== 1}
              >
                <SelectTrigger disabled={currentUser?.role_id !== 1}>
                  <SelectValue placeholder="Select branch" />
                </SelectTrigger>
                <SelectContent>
                  {branches.map((branch) => {
                    // For admin users (role_id=1): show all branches
                    // For non-admin users: only show the branch that matches their branch_id
                    if (currentUser?.role_id === 1 || 
                        branch.id === Number(currentUser?.branch_id) || 
                        branch.id.toString() === currentUser?.branch_id?.toString()) {
                      return (
                        <SelectItem key={branch.id} value={branch.id.toString()}>
                          {branch.branch_name}
                        </SelectItem>
                      );
                    }
                    return null;
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setEditCustomerModalOpen(false);
                setEditingCustomer(null);
              }}
              disabled={savingCustomer}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateCustomer}
              disabled={savingCustomer || !customerFormData.name.trim()}
            >
              {savingCustomer ? 'Updating...' : 'Update Customer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Import Customers Modal */}
      <Dialog open={importModalOpen} onOpenChange={setImportModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Import Customers</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <div className="flex items-center justify-between mb-2">
                <Label htmlFor="import-file">Select File</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadTemplate}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download Template
                </Button>
              </div>
              <Input
                id="import-file"
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileChange}
                className="cursor-pointer"
              />
              <p className="text-sm text-gray-500">
                Upload a CSV or Excel file with the following columns:
              </p>
              <div className="bg-gray-50 p-3 rounded-md">
                <p className="text-xs font-mono">
                  name, email, country_code, mobile, company_name
                </p>
              </div>
              <div className="mt-2 space-y-1">
                <p className="text-xs text-gray-600">• Column headers must match exactly (case-insensitive)</p>
                <p className="text-xs text-gray-600">• Name field is required</p>
                <p className="text-xs text-gray-600">• Country code should include + (e.g., +91)</p>
                <p className="text-xs text-gray-600">• Email should be valid format</p>
              </div>
            </div>
            {importFile && (
              <div className="bg-blue-50 p-3 rounded-md">
                <p className="text-sm text-blue-700">
                  Selected file: <span className="font-medium">{importFile.name}</span>
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setImportModalOpen(false);
                setImportFile(null);
              }}
              disabled={importing}
            >
              Cancel
            </Button>
            <Button
              onClick={handleImportCustomers}
              disabled={!importFile || importing}
            >
              {importing ? 'Importing...' : 'Import Customers'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this customer?</AlertDialogTitle>
            <AlertDialogDescription>
              {customerToDelete && (
                <div className="space-y-2">
                  <p>
                    You are about to delete customer: <strong>{customerToDelete.name}</strong>
                  </p>
                  {customerToDelete.tickets_count && customerToDelete.tickets_count > 0 ? (
                    <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
                      <p className="text-red-700 font-semibold">
                        Cannot delete this customer!
                      </p>
                      <p className="text-red-600 text-sm mt-1">
                        This customer has {customerToDelete.tickets_count} ticket{customerToDelete.tickets_count > 1 ? 's' : ''} associated with them.
                        Please resolve or reassign all tickets before deleting the customer.
                      </p>
                    </div>
                  ) : (
                    <p className="text-gray-600">
                      This action cannot be undone. This will permanently delete the customer and all their information.
                    </p>
                  )}
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setDeleteConfirmOpen(false);
                setCustomerToDelete(null);
              }}
              disabled={deleting}
            >
              Cancel
            </AlertDialogCancel>
            {(!customerToDelete?.tickets_count || customerToDelete.tickets_count === 0) && (
              <AlertDialogAction
                onClick={handleDeleteCustomer}
                disabled={deleting}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {deleting ? 'Deleting...' : 'Delete Customer'}
              </AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}