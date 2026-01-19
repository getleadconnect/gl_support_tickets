import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { DashboardLayout } from '@/components/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Plus, Search, Edit2, Trash2 } from 'lucide-react';
import { ProductModal } from '@/components/ProductModal';
import toast from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';
import jQuery from 'jquery';
import select2Factory from 'select2';
import 'select2/dist/css/select2.min.css';

// Initialize select2 on jQuery
select2Factory(jQuery);

// Make jQuery available globally
(window as any).jQuery = jQuery;
(window as any).$ = jQuery;

const $ = jQuery;

interface Product {
  id: number;
  name: string;
  code?: string;
  cost?: number;
  stock: number;
  initial_stock?: number;
  category_id?: number;
  brand_id?: number;
  branch_id?: number;
  category?: {
    id: number;
    category: string;
    brand_id?: number;
  };
  brand?: {
    id: number;
    brand: string;
  };
  branch?: {
    id: number;
    branch_name: string;
  };
  status?: string | number;
  created_by?: number;
  created_at: string;
  updated_at: string;
}

interface Branch {
  id: number;
  branch_name: string;
}

interface Brand {
  id: number;
  brand: string;
}

interface Category {
  id: number;
  category: string;
}

export default function Products() {
  const { user: currentUser } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  // Filter states
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [selectedBranch, setSelectedBranch] = useState<string | undefined>(undefined);
  const [selectedBrand, setSelectedBrand] = useState<string | undefined>(undefined);
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);

  // Filter data
  const [branches, setBranches] = useState<Branch[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  // Refs for Select2
  const brandSelectRef = useRef<HTMLSelectElement>(null);
  const categorySelectRef = useRef<HTMLSelectElement>(null);

  // Fetch filter data on mount
  useEffect(() => {
    fetchBranches();
    fetchBrands();
    fetchCategories();
  }, []);

  // Debounce search term - delay API call by 500ms after user stops typing
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts();
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch data immediately when pagination changes
  useEffect(() => {
    fetchProducts();
  }, [currentPage, perPage]);

  const fetchBranches = async () => {
    try {
      const response = await axios.get('/branches');
      setBranches(response.data || []);
    } catch (error) {
      console.error('Error fetching branches:', error);
    }
  };

  const fetchBrands = async () => {
    try {
      const response = await axios.get('/brands');
      setBrands(response.data || []);
    } catch (error) {
      console.error('Error fetching brands:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get('/categories');
      setCategories(response.data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  // Initialize Select2 for Brand dropdown
  useEffect(() => {
    if (!brandSelectRef.current || brands.length === 0) {
      return;
    }

    const $select = $(brandSelectRef.current);

    // Check if select2 is available
    if (typeof $.fn.select2 !== 'function') {
      console.error('Select2 is not available on jQuery');
      return;
    }

    // Destroy existing instance if any
    if ($select.data('select2')) {
      $select.select2('destroy');
    }

    // Initialize Select2
    const timeoutId = setTimeout(() => {
      $select.select2({
        placeholder: 'All Brands',
        allowClear: true,
        width: '100%',
        minimumResultsForSearch: 0,
      });

      // Set initial value
      if (selectedBrand) {
        $select.val(selectedBrand).trigger('change.select2');
      }

      // Handle change event
      $select.on('change', function() {
        const value = $(this).val() as string;
        setSelectedBrand(value || undefined);
      });

      // Handle dropdown open event to style items
      $select.on('select2:open', function() {
        setTimeout(() => {
          $('.select2-results__option').css({
            'font-size': '14px'
          });
          $('.select2-search__field').css({
            'font-size': '14px'
          });
        }, 10);
      });

      // Styling
      const $container = $select.next('.select2-container');
      $container.find('.select2-selection--single').css({
        'height': '36px',
        'display': 'flex',
        'align-items': 'center',
        'font-size': '14px'
      });
      $container.find('.select2-selection__rendered').css({
        'font-size': '14px'
      });
      $container.find('.select2-selection__clear').css({
        'padding-left': '8px'
      });
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      try {
        if ($select.data('select2')) {
          $select.off('change');
          $select.select2('destroy');
        }
      } catch (error) {
        // Silently fail
      }
    };
  }, [brands, selectedBrand]);

  // Initialize Select2 for Category dropdown
  useEffect(() => {
    if (!categorySelectRef.current || categories.length === 0) {
      return;
    }

    const $select = $(categorySelectRef.current);

    // Check if select2 is available
    if (typeof $.fn.select2 !== 'function') {
      console.error('Select2 is not available on jQuery');
      return;
    }

    // Destroy existing instance if any
    if ($select.data('select2')) {
      $select.select2('destroy');
    }

    // Initialize Select2
    const timeoutId = setTimeout(() => {
      $select.select2({
        placeholder: 'All Categories',
        allowClear: true,
        width: '100%',
        minimumResultsForSearch: 0,
      });

      // Set initial value
      if (selectedCategory) {
        $select.val(selectedCategory).trigger('change.select2');
      }

      // Handle change event
      $select.on('change', function() {
        const value = $(this).val() as string;
        setSelectedCategory(value || undefined);
      });

      // Handle dropdown open event to style items
      $select.on('select2:open', function() {
        setTimeout(() => {
          $('.select2-results__option').css({
            'font-size': '14px'
          });
          $('.select2-search__field').css({
            'font-size': '14px'
          });
        }, 10);
      });

      // Styling
      const $container = $select.next('.select2-container');
      $container.find('.select2-selection--single').css({
        'height': '36px',
        'display': 'flex',
        'align-items': 'center',
        'font-size': '14px'
      });
      $container.find('.select2-selection__rendered').css({
        'font-size': '14px'
      });
      $container.find('.select2-selection__clear').css({
        'padding-left': '8px'
      });
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      try {
        if ($select.data('select2')) {
          $select.off('change');
          $select.select2('destroy');
        }
      } catch (error) {
        // Silently fail
      }
    };
  }, [categories, selectedCategory]);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Build query parameters for server-side filtering and pagination
      const params: any = {
        page: currentPage,
        per_page: perPage
      };

      // Add search term
      if (searchTerm) {
        params.search = searchTerm;
      }

      // Add filter parameters
      if (fromDate) {
        params.from_date = fromDate;
      }
      if (toDate) {
        params.to_date = toDate;
      }
      if (selectedBranch) {
        params.branch_id = selectedBranch;
      }
      if (selectedBrand) {
        params.brand_id = selectedBrand;
      }
      if (selectedCategory) {
        params.category_id = selectedCategory;
      }

      const response = await axios.get('/product-list', { params });
      console.log('API response:', response.data);

      // Handle paginated response
      if (response.data && response.data.data && Array.isArray(response.data.data)) {
        setProducts(response.data.data);
        setTotalRecords(response.data.total || 0);
        setTotalPages(response.data.last_page || 0);
      } else if (Array.isArray(response.data)) {
        // Fallback for non-paginated response
        setProducts(response.data);
        setTotalRecords(response.data.length);
        setTotalPages(1);
      } else {
        setProducts([]);
        setTotalRecords(0);
        setTotalPages(0);
      }
    } catch (err: any) {
      console.error('Error fetching products:', err);
      setError(err.response?.data?.message || err.message || 'Failed to fetch products');
      setProducts([]);
      setTotalRecords(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  }, [currentPage, perPage, searchTerm, fromDate, toDate, selectedBranch, selectedBrand, selectedCategory]);

  const handlePerPageChange = (value: string) => {
    setPerPage(parseInt(value));
    setCurrentPage(1);
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleFilter = () => {
    setCurrentPage(1);
    fetchProducts();
  };

  const handleClearFilters = async () => {
    // Clear Select2 values first
    if (brandSelectRef.current) {
      $(brandSelectRef.current).val('').trigger('change');
    }
    if (categorySelectRef.current) {
      $(categorySelectRef.current).val('').trigger('change');
    }

    // Clear all state
    setFromDate('');
    setToDate('');
    setSelectedBranch(undefined);
    setSelectedBrand(undefined);
    setSelectedCategory(undefined);
    setCurrentPage(1);

    // Fetch all products immediately
    try {
      setLoading(true);
      const params: any = {
        page: 1,
        per_page: perPage
      };
      const response = await axios.get('/product-list', { params });

      if (response.data && response.data.data && Array.isArray(response.data.data)) {
        setProducts(response.data.data);
        setTotalRecords(response.data.total || 0);
        setTotalPages(response.data.last_page || 0);
      } else if (Array.isArray(response.data)) {
        setProducts(response.data);
        setTotalRecords(response.data.length);
        setTotalPages(1);
      }
    } catch (err: any) {
      console.error('Error fetching products:', err);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const handleAddProduct = () => {
    setModalMode('add');
    setSelectedProduct(null);
    setModalOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    setModalMode('edit');
    setSelectedProduct(product);
    setModalOpen(true);
  };

  const handleProductSaved = () => {
    // Refresh the product list
    fetchProducts();
    setSelectedProduct(null);
  };

  const handleDeleteProduct = (product: Product) => {
    setProductToDelete(product);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!productToDelete) return;

    try {
      const response = await axios.delete(`/products/${productToDelete.id}`);
      
      if (response.data) {
        toast.success('Product deleted successfully!');
        
        // Refresh the product list
        fetchProducts();
        
        // Close dialog and reset state
        setDeleteDialogOpen(false);
        setProductToDelete(null);
      }
    } catch (error: any) {
      console.error('Error deleting product:', error);
      
      if (error.response?.data?.message) {
        toast.error(`Error: ${error.response.data.message}`);
      } else {
        toast.error('Failed to delete product. Please try again.');
      }
    }
  };

  // Calculate display indices for pagination info
  const startIndex = (currentPage - 1) * perPage;
  const endIndex = Math.min(startIndex + perPage, totalRecords);

  const getStatusDisplay = (status: string | number | undefined) => {
    if (status === 1 || status === 'active' || status === 'Active') {
      return 'Active';
    }
    return 'Inactive';
  };

  return (
    <DashboardLayout title="Product Management">
      <div>
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Product Management</h1>
                <p className="text-xs sm:text-sm text-gray-500 mt-1">Manage product inventory and information</p>
              </div>
              <Button 
                onClick={handleAddProduct}
                className="bg-gray-900 hover:bg-gray-800 text-white w-full sm:w-auto"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </Button>
            </div>
          </div>

          {/* Filter Section */}
          <div className="px-4 sm:px-6 py-4 bg-gray-50 border-b border-gray-200">
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">Filter By:</span>
              </div>
              <div className="flex flex-col lg:flex-row gap-3 lg:items-center">
                <Input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="h-9 w-full lg:w-auto"
                  placeholder="From Date"
                />
                <Input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="h-9 w-full lg:w-auto"
                  placeholder="To Date"
                />
                {currentUser?.role_id === 1 && (
                  <Select value={selectedBranch} onValueChange={(value) => setSelectedBranch(value)}>
                    <SelectTrigger className="h-9 w-full lg:w-[180px]">
                      <SelectValue placeholder="All Branches" />
                    </SelectTrigger>
                    <SelectContent>
                      {branches.map((branch) => (
                        <SelectItem key={branch.id} value={branch.id.toString()}>
                          {branch.branch_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                <div className="w-full lg:w-[180px]">
                  <select
                    ref={brandSelectRef}
                    className="h-9 w-full"
                    value={selectedBrand || ''}
                    onChange={(e) => setSelectedBrand(e.target.value || undefined)}
                  >
                    <option value="">All Brands</option>
                    {brands.map((brand) => (
                      <option key={brand.id} value={brand.id.toString()}>
                        {brand.brand}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="w-full lg:w-[180px]">
                  <select
                    ref={categorySelectRef}
                    className="h-9 w-full"
                    value={selectedCategory || ''}
                    onChange={(e) => setSelectedCategory(e.target.value || undefined)}
                  >
                    <option value="">All Categories</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id.toString()}>
                        {category.category}
                      </option>
                    ))}
                  </select>
                </div>
                <Button
                  onClick={handleFilter}
                  className="h-9 bg-black hover:bg-gray-800 text-white w-full lg:w-auto px-6"
                >
                  Filter
                </Button>
                <Button
                  onClick={handleClearFilters}
                  variant="outline"
                  className="h-9 w-full lg:w-auto px-6"
                >
                  Clear
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
                  placeholder="Search products..."
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
                    Product Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product Code
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Branch
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Brand
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cost
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created Date
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={11} className="px-6 py-8 text-center text-gray-500">
                      Loading products...
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={11} className="px-6 py-8 text-center text-red-500">
                      Error: {error}
                    </td>
                  </tr>
                ) : products.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="px-6 py-8 text-center text-gray-500">
                      No products found
                    </td>
                  </tr>
                ) : (
                  products.map((product, index) => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {startIndex + index + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {product.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {product.code || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {product.category?.category || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {product.branch?.branch_name || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {product.brand?.brand || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {formatCurrency(product.cost || 0)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className={`${product.stock < 10 ? 'text-red-600 font-medium' : ''}`}>
                          {product.stock}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          getStatusDisplay(product.status) === 'Active'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {getStatusDisplay(product.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(product.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: '2-digit',
                          year: 'numeric'
                        })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditProduct(product)}
                            className="p-1 h-7 w-7"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteProduct(product)}
                            className="p-1 h-7 w-7 text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="lg:hidden px-4 sm:px-6 py-4">
            {loading ? (
              <div className="text-center py-8 text-gray-500">
                Loading products...
              </div>
            ) : error ? (
              <div className="text-center py-8 text-red-500">
                Error: {error}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No products found
              </div>
            ) : (
              <div className="space-y-4">
                {products.map((product, index) => (
                  <div key={product.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs text-gray-500">#{startIndex + index + 1}</span>
                          <h3 className="font-medium text-sm text-gray-900">{product.name}</h3>
                        </div>
                        {product.code && (
                          <p className="text-xs text-gray-500">Code: {product.code}</p>
                        )}
                      </div>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        getStatusDisplay(product.status) === 'Active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {getStatusDisplay(product.status)}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
                      <div>
                        <span className="text-gray-500">Category:</span>
                        <p className="font-medium text-gray-900">{product.category?.category || '-'}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Branch:</span>
                        <p className="font-medium text-gray-900">{product.branch?.branch_name || '-'}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Brand:</span>
                        <p className="font-medium text-gray-900">{product.brand?.brand || '-'}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Cost:</span>
                        <p className="font-medium text-gray-900">{formatCurrency(product.cost || 0)}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Stock:</span>
                        <p className={`font-medium ${product.stock < 10 ? 'text-red-600' : 'text-gray-900'}`}>
                          {product.stock}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <span className="text-xs text-gray-500">
                        {new Date(product.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: '2-digit',
                          year: 'numeric'
                        })}
                      </span>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditProduct(product)}
                          className="p-1 h-8 w-8"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteProduct(product)}
                          className="p-1 h-8 w-8 text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {!loading && products.length > 0 && (
            <div className="px-4 sm:px-6 py-4 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="text-xs sm:text-sm text-gray-700 text-center sm:text-left">
                  Showing {startIndex + 1} to {endIndex} of {totalRecords} entries
                </div>
                
                <div className="flex items-center justify-center sm:justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1 || loading}
                    className="text-gray-700 text-xs sm:text-sm"
                  >
                    Previous
                  </Button>

                  {/* Desktop page numbers */}
                  <div className="hidden sm:flex items-center gap-1">
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
                            className="w-9 h-9 p-0 text-gray-700"
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
                            className={`w-9 h-9 p-0 ${
                              currentPage === i
                                ? 'bg-blue-600 text-white hover:bg-blue-700'
                                : 'text-gray-700'
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
                            className="w-9 h-9 p-0 text-gray-700"
                          >
                            {totalPages}
                          </Button>
                        );
                      }

                      return pages;
                    })()}
                  </div>

                  {/* Mobile page indicator */}
                  <div className="flex sm:hidden items-center px-3 text-xs">
                    Page {currentPage} of {totalPages}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages || loading}
                    className="text-gray-700 text-xs sm:text-sm"
                  >
                    Next
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <ProductModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onProductSaved={handleProductSaved}
        product={selectedProduct}
        mode={modalMode}
      />
      
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{productToDelete?.name}"? 
              This action cannot be undone and will permanently remove the product from your inventory.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setDeleteDialogOpen(false);
              setProductToDelete(null);
            }}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              Delete Product
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}