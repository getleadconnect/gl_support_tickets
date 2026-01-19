import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { DashboardLayout } from '@/components/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Plus,
  Trash2,
  Edit,
  Eye,
  Calculator,
  Save,
  RefreshCw,
  Search,
  FileText,
  Printer,
  X
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface Product {
  id: number;
  name: string;
  price: string;
  cost?: string;
  category?: string;
  brand?: string;
}

interface EstimateItem {
  id?: number;
  product_id: number;
  product?: Product;
  quantity: number;
  price: number;
  total_price: number;
}

interface Estimate {
  id: number;
  branch_id?: number;
  customer_name: string;
  address: string;
  phone_number: string;
  estimate_number: string;
  estimate_date: string;
  valid_upto?: string;
  description: string | null;
  total_amount: string;
  gst_type?: string;
  gst?: number;
  cgst?: number;
  sgst?: number;
  status: string;
  created_by: number;
  creator?: {
    name: string;
  };
  branch?: {
    id: number;
    branch_name: string;
  };
  items: EstimateItem[];
  created_at: string;
  updated_at: string;
}

export default function Estimates() {
  const [estimates, setEstimates] = useState<Estimate[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  
  // Modal states
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editingEstimate, setEditingEstimate] = useState<Estimate | null>(null);
  const [viewingEstimate, setViewingEstimate] = useState<Estimate | null>(null);
  const [pdfModalOpen, setPdfModalOpen] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string>('');
  const [loadingPdf, setLoadingPdf] = useState(false);

  // Filter states
  const [filters, setFilters] = useState({
    date_from: '',
    date_to: '',
    status: '',
    search: '',
    branch_id: ''
  });

  // Branches for dropdown
  const [branches, setBranches] = useState<any[]>([]);

  // Form data
  const [formData, setFormData] = useState({
    customer_name: '',
    address: '',
    phone_number: '',
    estimate_date: new Date().toISOString().split('T')[0],
    valid_upto: '',
    description: '',
    gst_type: 'without_gst', // 'gst' or 'without_gst'
    items: [] as EstimateItem[]
  });

  // Current item being added
  const [currentItem, setCurrentItem] = useState({
    product_id: 0,
    quantity: 1,
    unit_cost: 0,
    price: 0
  });

  // Fetch estimates with pagination
  const fetchEstimates = useCallback(async (searchFilters = {}) => {
    try {
      setLoading(true);

      // Ensure axios has the auth token
      const token = localStorage.getItem('auth_token');
      if (token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      }

      // Build query params from filters
      const params = new URLSearchParams();
      const mergedFilters = { ...filters, ...searchFilters };

      // Add pagination params
      params.append('page', currentPage.toString());
      params.append('per_page', perPage.toString());

      // Add filter params
      if (mergedFilters.search) params.append('search', mergedFilters.search);
      if (mergedFilters.status) params.append('status', mergedFilters.status);
      if (mergedFilters.date_from) params.append('date_from', mergedFilters.date_from);
      if (mergedFilters.date_to) params.append('date_to', mergedFilters.date_to);
      if (mergedFilters.branch_id) params.append('branch_id', mergedFilters.branch_id);

      const url = '/estimates' + (params.toString() ? '?' + params.toString() : '');
      const response = await axios.get(url);
      const data = response.data;

      // Handle paginated response
      if (data.data && Array.isArray(data.data)) {
        setEstimates(data.data);
        setTotalRecords(data.total || 0);
        setTotalPages(data.last_page || 0);
      } else if (Array.isArray(data)) {
        // Fallback for non-paginated response
        setEstimates(data);
        setTotalRecords(data.length);
        setTotalPages(1);
      } else {
        console.error('Unexpected data structure:', data);
        setEstimates([]);
        setTotalRecords(0);
        setTotalPages(0);
        toast.error('Unexpected data format received');
      }
    } catch (error) {
      console.error('Error fetching estimates:', error);
      if (error.response?.status === 401) {
        toast.error('Authentication required. Please log in.');
        // Redirect to login if no valid token
        if (!localStorage.getItem('auth_token')) {
          window.location.href = '/login';
        }
      } else {
        toast.error('Failed to load estimates');
      }
      setEstimates([]);
      setTotalRecords(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  }, [currentPage, perPage, filters]);

  // Fetch branches
  const fetchBranches = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await axios.get('/branches-filter');
      const data = response.data;
      
      if (Array.isArray(data)) {
        setBranches(data);
      } else if (data.data && Array.isArray(data.data)) {
        setBranches(data.data);
      } else {
        console.error('Unexpected branches data structure:', data);
        setBranches([]);
      }
    } catch (error) {
      console.error('Error fetching branches:', error);
      setBranches([]);
    }
  };

  // Fetch products
  const fetchProducts = async () => {
    try {
      // Ensure axios has the auth token
      const token = localStorage.getItem('auth_token');
      if (token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await axios.get('/products');
      const data = response.data;
      
      // Handle both direct array and paginated response
      if (Array.isArray(data)) {
        setProducts(data);
      } else if (data.data && Array.isArray(data.data)) {
        setProducts(data.data);
      } else {
        console.error('Unexpected products data structure:', data);
        setProducts([]);
        toast.error('Failed to load products data');
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load products');
      setProducts([]);
    }
  };

  // Filter handling functions
  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleApplyFilters = () => {
    fetchEstimates();
  };

  const handleClearFilters = () => {
    const clearedFilters = {
      date_from: '',
      date_to: '',
      status: '',
      search: '',
      branch_id: ''
    };
    setFilters(clearedFilters);
    fetchEstimates(clearedFilters);
  };

  // Load products and branches on mount
  useEffect(() => {
    fetchProducts();
    fetchBranches();
  }, []);

  // Fetch estimates when pagination or filters change
  useEffect(() => {
    fetchEstimates();
  }, [fetchEstimates]);

  // Handle form field changes
  const handleFormChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle current item changes
  const handleCurrentItemChange = (field: string, value: any) => {
    setCurrentItem(prev => {
      const updated = {
        ...prev,
        [field]: value
      };
      
      // Only auto-calculate price when unit_cost changes (product selection)
      // Do NOT auto-calculate when quantity changes
      if (field === 'unit_cost') {
        updated.price = Number(updated.quantity) * Number(updated.unit_cost);
      }
      
      return updated;
    });
  };

  // Add item to estimate
  const addItem = () => {
    if (!currentItem.product_id || currentItem.quantity <= 0 || currentItem.price <= 0) {
      toast.error('Please fill all item fields correctly');
      return;
    }

    const product = products.find(p => p.id === currentItem.product_id);
    if (!product) {
      toast.error('Product not found');
      return;
    }

    const newItem: EstimateItem = {
      product_id: currentItem.product_id,
      product: product,
      quantity: Number(currentItem.quantity),
      price: Number(currentItem.price),
      total_price: Number(currentItem.quantity) * Number(currentItem.price)
    };

    setFormData(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }));

    // Reset current item
    setCurrentItem({
      product_id: 0,
      quantity: 1,
      unit_cost: 0,
      price: 0
    });
  };

  // Remove item from estimate
  const removeItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  // Calculate total amount
  const calculateTotal = () => {
    return formData.items.reduce((sum, item) => sum + Number(item.total_price || 0), 0);
  };

  // Calculate GST amounts
  const calculateGST = () => {
    const subtotal = calculateTotal();
    if (formData.gst_type === 'gst' && subtotal > 0) {
      const gstAmount = (subtotal * 18) / 100;
      const cgstAmount = gstAmount / 2;
      const sgstAmount = gstAmount / 2;
      const grandTotal = subtotal + gstAmount;
      
      return {
        subtotal,
        gstAmount,
        cgstAmount,
        sgstAmount,
        grandTotal
      };
    }
    
    return {
      subtotal,
      gstAmount: 0,
      cgstAmount: 0,
      sgstAmount: 0,
      grandTotal: subtotal
    };
  };

  // Handle add estimate
  const handleAdd = () => {
    setFormData({
      customer_name: '',
      address: '',
      phone_number: '',
      estimate_date: new Date().toISOString().split('T')[0],
      valid_upto: '',
      description: '',
      gst_type: 'without_gst',
      items: []
    });
    setCurrentItem({
      product_id: 0,
      quantity: 1,
      unit_cost: 0,
      price: 0
    });
    setAddModalOpen(true);
  };

  // Handle edit estimate
  const handleEdit = (estimate: Estimate) => {
    setEditingEstimate(estimate);
    
    // Format dates for input fields (YYYY-MM-DD)
    const formatDateForInput = (dateString: string) => {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toISOString().split('T')[0];
    };
    
    setFormData({
      customer_name: estimate.customer_name,
      address: estimate.address,
      phone_number: estimate.phone_number,
      estimate_date: formatDateForInput(estimate.estimate_date),
      valid_upto: formatDateForInput(estimate.valid_upto || ''),
      description: estimate.description || '',
      gst_type: estimate.gst_type || 'gst',
      items: estimate.items.map(item => ({
        ...item,
        total_price: Number(item.quantity) * Number(item.price)
      }))
    });
    setCurrentItem({
      product_id: 0,
      quantity: 1,
      unit_cost: 0,
      price: 0
    });
    setEditModalOpen(true);
  };

  // Handle view estimate
  const handleView = (estimate: Estimate) => {
    setViewingEstimate(estimate);
    setViewModalOpen(true);
  };

  // Save estimate (add or edit)
  const handleSave = async () => {
    if (!formData.customer_name.trim() || !formData.address.trim() || !formData.phone_number.trim()) {
      toast.error('Please fill all required fields');
      return;
    }

    if (formData.items.length === 0) {
      toast.error('Please add at least one item');
      return;
    }

    setSaving(true);
    try {
      // Ensure axios has the auth token
      const token = localStorage.getItem('auth_token');
      if (token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      }

      const gstCalculations = calculateGST();
      
      const data = {
        ...formData,
        gst: gstCalculations.gstAmount,
        cgst: gstCalculations.cgstAmount,
        sgst: gstCalculations.sgstAmount,
        total_amount: gstCalculations.grandTotal,
        items: formData.items.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity,
          price: item.price
        }))
      };

      if (editingEstimate) {
        await axios.put(`/estimates/${editingEstimate.id}`, data);
        toast.success('Estimate updated successfully');
        setEditModalOpen(false);
        setEditingEstimate(null);
      } else {
        await axios.post('/estimates', data);
        toast.success('Estimate created successfully');
        setAddModalOpen(false);
      }

      fetchEstimates();
    } catch (error: any) {
      console.error('Error saving estimate:', error);
      if (error.response?.status === 401) {
        toast.error('Authentication required. Please log in.');
      } else if (error.response?.data?.message) {
        toast.error(`Error: ${error.response.data.message}`);
      } else {
        toast.error('Failed to save estimate. Please try again.');
      }
    } finally {
      setSaving(false);
    }
  };

  // Delete estimate
  const handleDelete = async (estimate: Estimate) => {
    if (!confirm(`Are you sure you want to delete estimate ${estimate.estimate_number}?`)) {
      return;
    }

    try {
      // Ensure axios has the auth token
      const token = localStorage.getItem('auth_token');
      if (token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      }

      await axios.delete(`/estimates/${estimate.id}`);
      toast.success('Estimate deleted successfully');
      fetchEstimates();
    } catch (error: any) {
      console.error('Error deleting estimate:', error);
      if (error.response?.status === 401) {
        toast.error('Authentication required. Please log in.');
      } else {
        toast.error('Failed to delete estimate');
      }
    }
  };

  // Print/Download estimate PDF
  const handlePrint = async (estimate: Estimate) => {
    try {
      setLoadingPdf(true);
      setPdfModalOpen(true);
      
      // Ensure axios has the auth token
      const token = localStorage.getItem('auth_token');
      if (token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      }

      const response = await axios.get(`/estimates/${estimate.id}/download`, {
        responseType: 'blob'
      });

      // Create blob URL for iframe
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      setPdfUrl(url);
      setLoadingPdf(false);
    } catch (error: any) {
      console.error('Error loading estimate PDF:', error);
      setLoadingPdf(false);
      setPdfModalOpen(false);
      if (error.response?.status === 401) {
        toast.error('Authentication required. Please log in.');
      } else {
        toast.error('Failed to load estimate PDF');
      }
    }
  };

  // Download PDF from preview modal
  const handleDownloadPdf = () => {
    if (pdfUrl) {
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.setAttribute('download', 'estimate.pdf');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Estimate PDF downloaded successfully');
    }
  };

  // Close PDF modal and cleanup
  const closePdfModal = () => {
    if (pdfUrl) {
      window.URL.revokeObjectURL(pdfUrl);
    }
    setPdfUrl('');
    setPdfModalOpen(false);
    setLoadingPdf(false);
  };

  // Check if estimate is expired based on valid_upto date
  const getEstimateStatus = (estimate: Estimate) => {
    if (estimate.valid_upto) {
      const today = new Date();
      const validUptoDate = new Date(estimate.valid_upto);
      
      // Set time to start of day for accurate comparison
      today.setHours(0, 0, 0, 0);
      validUptoDate.setHours(0, 0, 0, 0);
      
      if (validUptoDate < today) {
        return 'Expired';
      }
    }
    return 'Active';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Expired': return 'bg-red-100 text-red-800';
      case 'Active': return 'bg-green-100 text-green-800';
      default: return 'bg-green-100 text-green-800'; // Default to Active
    }
  };

  return (
    <DashboardLayout title="Estimates">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Estimates</h1>
            <p className="text-gray-500">Manage customer estimates and quotations</p>
          </div>
          <Button onClick={handleAdd}>
            <Plus className="w-4 h-4 mr-2" />
            New Estimate
          </Button>
        </div>

        {/* Filter Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex flex-wrap items-center gap-4">
            <span className="text-sm font-medium text-gray-700">Filter By:</span>
            
            {/* Date From */}
            <div className="flex flex-col">
              <Input
                type="date"
                value={filters.date_from}
                onChange={(e) => handleFilterChange('date_from', e.target.value)}
                className="w-40 h-9"
                placeholder="dd/mm/yyyy"
              />
            </div>

            {/* Date To */}
            <div className="flex flex-col">
              <Input
                type="date"
                value={filters.date_to}
                onChange={(e) => handleFilterChange('date_to', e.target.value)}
                className="w-40 h-9"
                placeholder="dd/mm/yyyy"
              />
            </div>

            {/* Status Filter */}
            <div className="flex flex-col">
              <Select value={filters.status || "all"} onValueChange={(value) => handleFilterChange('status', value === 'all' ? '' : value)}>
                <SelectTrigger className="w-40 h-9">
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Branch Filter */}
            <div className="flex flex-col">
              <Select value={filters.branch_id || "all"} onValueChange={(value) => handleFilterChange('branch_id', value === 'all' ? '' : value)}>
                <SelectTrigger className="w-48 h-9">
                  <SelectValue placeholder="Select Branch" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Branches</SelectItem>
                  {branches.map((branch) => (
                    <SelectItem key={branch.id} value={branch.id.toString()}>
                      {branch.branch_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Filter Button */}
            <Button 
              onClick={handleApplyFilters}
              className="bg-gray-900 hover:bg-gray-800 text-white h-9 px-6"
            >
              Filter
            </Button>

            {/* Clear Filter Button */}
            <Button 
              onClick={handleClearFilters}
              variant="outline"
              className="h-9 px-4"
            >
              Clear
            </Button>
          </div>
        </div>

        {/* DataTable Controls */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="flex justify-between items-center p-4 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Rows per page:</span>
              <Select value="10" onValueChange={() => {}}>
                <SelectTrigger className="w-20 h-8">
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

            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search estimates..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleApplyFilters()}
                className="pl-10 w-64 h-8"
              />
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2">Loading estimates...</span>
            </div>
          ) : estimates.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-lg text-gray-500">No estimates found</p>
              <p className="text-gray-400">Create your first estimate to get started</p>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-white border-b border-gray-200">
                    <tr>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700" style={{fontSize: '14px'}}>Sl No</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700" style={{fontSize: '14px'}}>Estimate #</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700" style={{fontSize: '14px'}}>Branch Name</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700" style={{fontSize: '14px'}}>Customer Name</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700" style={{fontSize: '14px'}}>Phone Number</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700" style={{fontSize: '14px'}}>Validity Date</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700" style={{fontSize: '14px'}}>Description</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700" style={{fontSize: '14px'}}>Total Amount</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700" style={{fontSize: '14px'}}>GST</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700" style={{fontSize: '14px'}}>Status</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-700" style={{fontSize: '14px'}}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {estimates.map((estimate, index) => (
                      <tr key={estimate.id} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                        <td className="py-3 px-4" style={{fontSize: '14px'}}>
                          <span className="font-medium text-gray-900">{index + 1}</span>
                        </td>
                        <td className="py-3 px-4" style={{fontSize: '14px'}}>
                          <span className="font-medium text-blue-600">{estimate.estimate_number}</span>
                        </td>
                        <td className="py-3 px-4 text-gray-900" style={{fontSize: '14px'}}>{estimate.branch?.branch_name || '-'}</td>
                        <td className="py-3 px-4 text-gray-900" style={{fontSize: '14px'}}>{estimate.customer_name}</td>
                        <td className="py-3 px-4 text-gray-600" style={{fontSize: '14px'}}>{estimate.phone_number}</td>
                        <td className="py-3 px-4 text-gray-600" style={{fontSize: '14px'}}>
                          {new Date(estimate.estimate_date).toLocaleDateString()} {'=>'}
                          {estimate.valid_upto ? new Date(estimate.valid_upto).toLocaleDateString() : '-'}
                        </td>
                        
                        <td className="py-3 px-4 text-gray-600" style={{fontSize: '14px'}}>
                          {estimate.description ? estimate.description.substring(0, 50) + (estimate.description.length > 50 ? '...' : '') : '-'}
                        </td>
                        <td className="py-3 px-4 font-medium" style={{fontSize: '14px'}}>₹{parseFloat(estimate.total_amount).toLocaleString()}</td>
                        <td className="py-3 px-4 text-gray-600" style={{fontSize: '14px'}}>₹{estimate.gst ? parseFloat(estimate.gst.toString()).toLocaleString() : '0'}</td>
                        <td className="py-3 px-4" style={{fontSize: '14px'}}>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(getEstimateStatus(estimate))}`}>
                            {getEstimateStatus(estimate)}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right" style={{fontSize: '14px'}}>
                          <div className="flex items-center justify-end space-x-2">
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="h-7 w-7 p-0" 
                              onClick={() => handleView(estimate)}
                              title="View"
                            >
                              <Eye className="h-3 w-3" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="h-7 w-7 p-0" 
                              onClick={() => handleEdit(estimate)}
                              title="Edit"
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="h-7 w-7 p-0 text-blue-600 hover:text-blue-700" 
                              onClick={() => handlePrint(estimate)}
                              title="Print PDF"
                            >
                              <Printer className="h-3 w-3" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="h-7 w-7 p-0 text-red-600 hover:text-red-700"
                              onClick={() => handleDelete(estimate)}
                              title="Delete"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

                {/* Mobile Cards */}
                <div className="md:hidden space-y-4 p-4">
                  {estimates.map((estimate, index) => (
                    <Card key={estimate.id}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <div className="text-sm text-gray-500">#{index + 1}</div>
                            <div className="font-medium text-blue-600">{estimate.estimate_number}</div>
                          </div>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(getEstimateStatus(estimate))}`}>
                            {getEstimateStatus(estimate)}
                          </span>
                        </div>
                        <div className="space-y-1 text-sm">
                          <div><span className="font-medium">Branch:</span> {estimate.branch?.branch_name || '-'}</div>
                          <div><span className="font-medium">Customer:</span> {estimate.customer_name}</div>
                          <div><span className="font-medium">Phone:</span> {estimate.phone_number}</div>
                          <div><span className="font-medium">Description:</span> {estimate.description ? estimate.description.substring(0, 30) + (estimate.description.length > 30 ? '...' : '') : '-'}</div>
                          <div><span className="font-medium">Amount:</span> ₹{parseFloat(estimate.total_amount).toLocaleString()}</div>
                          <div><span className="font-medium">GST:</span> ₹{estimate.gst ? parseFloat(estimate.gst.toString()).toLocaleString() : '0'}</div>
                          <div><span className="font-medium">Date:</span> {new Date(estimate.estimate_date).toLocaleDateString()}</div>
                          <div><span className="font-medium">Valid Upto:</span> {estimate.valid_upto ? new Date(estimate.valid_upto).toLocaleDateString() : '-'}</div>
                        </div>
                        <div className="flex justify-end space-x-2 mt-4">
                          <Button size="sm" variant="outline" className="h-8 w-8 p-0" onClick={() => handleView(estimate)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline" className="h-8 w-8 p-0" onClick={() => handleEdit(estimate)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700" 
                            onClick={() => handlePrint(estimate)}
                          >
                            <Printer className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                            onClick={() => handleDelete(estimate)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

              {/* Pagination */}
              {!loading && totalPages > 0 && (
                <div className="flex flex-col sm:flex-row items-center justify-between px-4 py-3 border-t border-gray-200 gap-3">
                  <div className="text-sm text-gray-600">
                    Showing {((currentPage - 1) * perPage) + 1} to {Math.min(currentPage * perPage, totalRecords)} of {totalRecords} entries
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1 || loading}
                      className="px-3 py-1 text-sm"
                    >
                      Previous
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
                              onClick={() => setCurrentPage(1)}
                              disabled={loading}
                              className="w-9 h-9 p-0 text-sm"
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
                              onClick={() => setCurrentPage(i)}
                              disabled={loading}
                              className={`w-9 h-9 p-0 text-sm ${
                                currentPage === i
                                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                                  : ''
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
                              onClick={() => setCurrentPage(totalPages)}
                              disabled={loading}
                              className="w-9 h-9 p-0 text-sm"
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
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages || loading}
                      className="px-3 py-1 text-sm"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
              </>
            )}
        </div>

        {/* Add Estimate Modal */}
        <Dialog open={addModalOpen} onOpenChange={setAddModalOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Create New Estimate
              </DialogTitle>
              <DialogDescription>
                Create a new estimate with customer details and items
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Customer Details */}
              <div className="space-y-4">
                {/* Row 1: Customer Name & Phone Number */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="add-customer-name">Customer Name <span className="text-red-500">*</span></Label>
                    <Input
                      id="add-customer-name"
                      value={formData.customer_name}
                      onChange={(e) => handleFormChange('customer_name', e.target.value)}
                      placeholder="Enter customer name"
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="add-phone">Phone Number <span className="text-red-500">*</span></Label>
                    <Input
                      id="add-phone"
                      value={formData.phone_number}
                      onChange={(e) => handleFormChange('phone_number', e.target.value)}
                      placeholder="Enter phone number"
                      className="mt-1"
                    />
                  </div>
                </div>

                {/* Row 2: Address (50%) + Dates (50%) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="add-address">Address <span className="text-red-500">*</span></Label>
                    <Textarea
                      id="add-address"
                      value={formData.address}
                      onChange={(e) => handleFormChange('address', e.target.value)}
                      placeholder="Enter customer address"
                      className="mt-1"
                      rows={2}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="add-date">Estimate Date <span className="text-red-500">*</span></Label>
                      <Input
                        id="add-date"
                        type="date"
                        value={formData.estimate_date}
                        onChange={(e) => handleFormChange('estimate_date', e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="add-valid-upto">Valid Upto</Label>
                      <Input
                        id="add-valid-upto"
                        type="date"
                        value={formData.valid_upto}
                        onChange={(e) => handleFormChange('valid_upto', e.target.value)}
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>

                {/* Row 3: GST Type and Description */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="add-gst-type">GST Type</Label>
                    <Select
                      value={formData.gst_type}
                      onValueChange={(value) => handleFormChange('gst_type', value)}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select GST type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="gst">Include GST</SelectItem>
                        <SelectItem value="without_gst">Without GST</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="add-description">Description</Label>
                    <Textarea
                      id="add-description"
                      value={formData.description}
                      onChange={(e) => handleFormChange('description', e.target.value)}
                      placeholder="Optional description"
                      className="mt-1"
                      rows={2}
                    />
                  </div>
                </div>
              </div>

              {/* Add Items Section */}
              <div className="border-t pt-4">
                <h3 className="text-lg font-medium mb-4">Add Items</h3>
                
                <div className="flex gap-4 mb-4 items-end">
                  <div className="flex-1 min-w-0">
                    <Label>Product</Label>
                    <Select
                      value={currentItem.product_id.toString()}
                      onValueChange={(value) => {
                        const productId = parseInt(value);
                        const product = products.find(p => p.id === productId);
                        handleCurrentItemChange('product_id', productId);
                        if (product) {
                          // Use cost field if available, otherwise fall back to price
                          const unitCost = parseFloat(product.cost || product.price);
                          handleCurrentItemChange('unit_cost', unitCost);
                          // Auto-calculate total price = quantity × unit_cost
                          handleCurrentItemChange('price', currentItem.quantity * unitCost);
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select product" />
                      </SelectTrigger>
                      <SelectContent>
                        {products.map(product => (
                          <SelectItem key={product.id} value={product.id.toString()}>
                            {product.name} (₹{product.cost || product.price})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                 
                  <div style={{ width: '130px' }}>
                    <Label>Price</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={currentItem.price}
                      readOnly
                      className="bg-gray-50"
                      placeholder="Auto-calculated"
                    />
                  </div>

                  <div style={{ width: '130px' }}>
                    <Label>Quantity</Label>
                    <Input
                      type="number"
                      min="1"
                      value={currentItem.quantity}
                      onChange={(e) => handleCurrentItemChange('quantity', parseInt(e.target.value) || 1)}
                    />
                  </div>
                  
                  <div style={{ width: '130px' }}>
                    <Button
                      type="button"
                      onClick={addItem}
                      className="w-full"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Item
                    </Button>
                  </div>
                </div>

                {/* Items List */}
                {formData.items.length > 0 && (
                  <div className="border rounded-lg p-4">
                    <h4 className="font-medium mb-2">Items Added:</h4>
                    <div className="space-y-2">
                      {formData.items.map((item, index) => (
                        <div key={index} className="flex items-center justify-between bg-gray-50 rounded pl-2">
                          <div className="flex-1">
                            <span className="font-medium">{item.product?.name}</span>
                            <span className="text-sm text-gray-600 ml-2">
                              Qty: {item.quantity} × ₹{item.price} = ₹{item.total_price}
                            </span>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeItem(index)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      <div className="border-t pt-2 mt-2">
                        {(() => {
                          const calculations = calculateGST();
                          return (
                            <div className="text-right space-y-1">
                              <div className="text-sm">
                                Subtotal: ₹{calculations.subtotal.toLocaleString()}
                              </div>
                              {formData.gst_type === 'gst' && calculations.subtotal > 0 && (
                                <>
                                  <div className="text-sm text-gray-600">
                                    CGST (9%): ₹{calculations.cgstAmount.toLocaleString()}
                                  </div>
                                  <div className="text-sm text-gray-600">
                                    SGST (9%): ₹{calculations.sgstAmount.toLocaleString()}
                                  </div>
                                  <div className="text-sm text-gray-600">
                                    Total GST (18%): ₹{calculations.gstAmount.toLocaleString()}
                                  </div>
                                </>
                              )}
                              <div className="font-bold border-t pt-1">
                                Grand Total: ₹{calculations.grandTotal.toLocaleString()}
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setAddModalOpen(false)}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleSave}
                disabled={saving || !formData.customer_name.trim() || formData.items.length === 0}
                className="bg-black hover:bg-gray-800 text-white"
              >
                {saving ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Create Estimate
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Modal - Similar to Add Modal */}
        <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Edit className="h-5 w-5" />
                Edit Estimate
              </DialogTitle>
              <DialogDescription>
                Update estimate details and items
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Customer Details - Same structure as Add Modal */}
              <div className="space-y-4">
                {/* Row 1: Customer Name & Phone Number */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-customer-name">Customer Name <span className="text-red-500">*</span></Label>
                    <Input
                      id="edit-customer-name"
                      value={formData.customer_name}
                      onChange={(e) => handleFormChange('customer_name', e.target.value)}
                      placeholder="Enter customer name"
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="edit-phone">Phone Number <span className="text-red-500">*</span></Label>
                    <Input
                      id="edit-phone"
                      value={formData.phone_number}
                      onChange={(e) => handleFormChange('phone_number', e.target.value)}
                      placeholder="Enter phone number"
                      className="mt-1"
                    />
                  </div>
                </div>

                {/* Row 2: Address (50%) + Dates (50%) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-address">Address <span className="text-red-500">*</span></Label>
                    <Textarea
                      id="edit-address"
                      value={formData.address}
                      onChange={(e) => handleFormChange('address', e.target.value)}
                      placeholder="Enter customer address"
                      className="mt-1"
                      rows={2}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="edit-date">Estimate Date <span className="text-red-500">*</span></Label>
                      <Input
                        id="edit-date"
                        type="date"
                        value={formData.estimate_date}
                        onChange={(e) => handleFormChange('estimate_date', e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="edit-valid-upto">Valid Upto</Label>
                      <Input
                        id="edit-valid-upto"
                        type="date"
                        value={formData.valid_upto}
                        onChange={(e) => handleFormChange('valid_upto', e.target.value)}
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>

                {/* Row 3: GST Type and Description */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-gst-type">GST Type</Label>
                    <Select
                      value={formData.gst_type}
                      onValueChange={(value) => handleFormChange('gst_type', value)}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select GST type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="gst">GST Estimate</SelectItem>
                        <SelectItem value="without_gst">Without GST</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="edit-description">Description</Label>
                    <Textarea
                      id="edit-description"
                      value={formData.description}
                      onChange={(e) => handleFormChange('description', e.target.value)}
                      placeholder="Optional description"
                      className="mt-1"
                      rows={2}
                    />
                  </div>
                </div>
              </div>

              {/* Add Items Section - Same as Add Modal */}
              <div className="border-t pt-4">
                <h3 className="text-lg font-medium mb-4">Modify Items</h3>
                
                <div className="flex gap-4 mb-4 items-end">
                  <div className="flex-1 min-w-0">
                    <Label>Product</Label>
                    <Select
                      value={currentItem.product_id.toString()}
                      onValueChange={(value) => {
                        const productId = parseInt(value);
                        const product = products.find(p => p.id === productId);
                        handleCurrentItemChange('product_id', productId);
                        if (product) {
                          // Use cost field if available, otherwise fall back to price
                          const unitCost = parseFloat(product.cost || product.price);
                          handleCurrentItemChange('unit_cost', unitCost);
                          // Auto-calculate total price = quantity × unit_cost
                          handleCurrentItemChange('price', currentItem.quantity * unitCost);
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select product" />
                      </SelectTrigger>
                      <SelectContent>
                        {products.map(product => (
                          <SelectItem key={product.id} value={product.id.toString()}>
                            {product.name} (₹{product.cost || product.price})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div style={{ width: '130px' }}>
                    <Label>Price</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={currentItem.price}
                      readOnly
                      className="bg-gray-50"
                      placeholder="Auto-calculated"
                    />
                  </div>

                  <div style={{ width: '130px' }}>
                    <Label>Quantity</Label>
                    <Input
                      type="number"
                      min="1"
                      value={currentItem.quantity}
                      onChange={(e) => handleCurrentItemChange('quantity', parseInt(e.target.value) || 1)}
                    />
                  </div>

                  
                  <div style={{ width: '130px' }}>
                    <Button
                      type="button"
                      onClick={addItem}
                      className="w-full"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Item
                    </Button>
                  </div>
                </div>

                {/* Items List */}
                {formData.items.length > 0 && (
                  <div className="border rounded-lg p-4">
                    <h4 className="font-medium mb-2">Items:</h4>
                    <div className="space-y-2">
                      {formData.items.map((item, index) => (
                        <div key={index} className="flex items-center justify-between bg-gray-50 pl-2 rounded">
                          <div className="flex-1">
                            <span className="font-medium">{item.product?.name}</span>
                            <span className="text-sm text-gray-600 ml-2">
                              Qty: {item.quantity} × ₹{item.price} = ₹{item.total_price}
                            </span>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeItem(index)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      <div className="border-t pt-2 mt-2">
                        {(() => {
                          const calculations = calculateGST();
                          return (
                            <div className="text-right space-y-1">
                              <div className="text-sm">
                                Subtotal: ₹{calculations.subtotal.toLocaleString()}
                              </div>
                              {formData.gst_type === 'gst' && calculations.subtotal > 0 && (
                                <>
                                  <div className="text-sm text-gray-600">
                                    CGST (9%): ₹{calculations.cgstAmount.toLocaleString()}
                                  </div>
                                  <div className="text-sm text-gray-600">
                                    SGST (9%): ₹{calculations.sgstAmount.toLocaleString()}
                                  </div>
                                  <div className="text-sm text-gray-600">
                                    Total GST (18%): ₹{calculations.gstAmount.toLocaleString()}
                                  </div>
                                </>
                              )}
                              <div className="font-bold border-t pt-1">
                                Grand Total: ₹{calculations.grandTotal.toLocaleString()}
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setEditModalOpen(false);
                  setEditingEstimate(null);
                }}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleSave}
                disabled={saving || !formData.customer_name.trim() || formData.items.length === 0}
                className="bg-black hover:bg-gray-800 text-white"
              >
                {saving ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Update Estimate
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* View Modal */}
        <Dialog open={viewModalOpen} onOpenChange={setViewModalOpen}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                View Estimate
              </DialogTitle>
            </DialogHeader>
            
            {viewingEstimate && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Estimate Number</Label>
                    <p className="text-lg font-bold">{viewingEstimate.estimate_number}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Date</Label>
                    <p>{new Date(viewingEstimate.estimate_date).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Valid Upto</Label>
                    <p>{viewingEstimate.valid_upto ? new Date(viewingEstimate.valid_upto).toLocaleDateString() : 'Not specified'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Customer Name</Label>
                    <p>{viewingEstimate.customer_name}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Phone Number</Label>
                    <p>{viewingEstimate.phone_number}</p>
                  </div>
                  <div className="col-span-2">
                    <Label className="text-sm font-medium text-gray-600">Address</Label>
                    <p>{viewingEstimate.address}</p>
                  </div>
                  {viewingEstimate.description && (
                    <div className="col-span-2">
                      <Label className="text-sm font-medium text-gray-600">Description</Label>
                      <p>{viewingEstimate.description}</p>
                    </div>
                  )}
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-600 mb-3 block">Items</Label>
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Product</TableHead>
                          <TableHead>Quantity</TableHead>
                          <TableHead>Price</TableHead>
                          <TableHead>Total</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {viewingEstimate.items.map((item, index) => (
                          <TableRow key={index}>
                            <TableCell>{item.product?.name}</TableCell>
                            <TableCell>{item.quantity}</TableCell>
                            <TableCell>₹{parseFloat(item.price.toString()).toLocaleString()}</TableCell>
                            <TableCell className="font-medium">₹{parseFloat(item.total_price.toString()).toLocaleString()}</TableCell>
                          </TableRow>
                        ))}
                        <TableRow className="bg-gray-50 font-bold">
                          <TableCell colSpan={3} className="text-right">Total Amount:</TableCell>
                          <TableCell>₹{parseFloat(viewingEstimate.total_amount).toLocaleString()}</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button
                type="button"
                onClick={() => {
                  setViewModalOpen(false);
                  setViewingEstimate(null);
                }}
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* PDF Preview Modal */}
        <Dialog open={pdfModalOpen} onOpenChange={closePdfModal}>
          <DialogContent className="max-w-5xl h-[90vh] p-0 overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-4 border-b flex-shrink-0" style={{ height: '50px' }}>
              <DialogTitle>Estimate PDF Preview</DialogTitle>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={handleDownloadPdf}
                  variant="default"
                >
                  <Printer className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
              </div>
            </div>
            
            <div className="flex-1 overflow-hidden">
              {loadingPdf ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading PDF...</p>
                  </div>
                </div>
              ) : (
                pdfUrl && (
                  <iframe
                    src={pdfUrl}
                    className="w-full h-full"
                    style={{ border: 'none' }}
                    title="Estimate PDF"
                  />
                )
              )}
            </div>
            
            <div className="flex justify-end items-center p-4 border-t flex-shrink-0" style={{ height: '60px' }}>
              <Button
                onClick={closePdfModal}
                variant="default"
                className="px-6"
              >
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}