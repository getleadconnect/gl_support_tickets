import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import axios from 'axios';
import toast from 'react-hot-toast';

interface ProductModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProductSaved: () => void;
  product?: Product | null;
  mode: 'add' | 'edit';
}

interface Product {
  id: number;
  name: string;
  code?: string;
  cost?: number;
  stock: number;
  category_id?: number;
  brand_id?: number;
  branch_id?: number;
  status?: string | number;
  created_by?: number;
  created_at: string;
  updated_at: string;
}

interface Category {
  id: number;
  category: string;
  brand_id: number;
}

interface Brand {
  id: number;
  brand: string;
}

interface Branch {
  id: number;
  branch_name: string;
}

export function ProductModal({ open, onOpenChange, onProductSaved, product, mode }: ProductModalProps) {
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    brand_id: '',
    category_id: '',
    branch_id: '',
    cost: '',
    stock: ''
  });
  const [errors, setErrors] = useState<any>({});

  useEffect(() => {
    if (open) {
      fetchBrands();
      fetchBranches();
      fetchCurrentUser();
      
      if (mode === 'edit' && product) {
        // Populate form with product data
        setFormData({
          name: product.name || '',
          code: product.code || '',
          brand_id: product.brand_id?.toString() || '',
          category_id: product.category_id?.toString() || '',
          branch_id: product.branch_id?.toString() || '',
          cost: product.cost?.toString() || '',
          stock: product.stock?.toString() || ''
        });
        
        // Fetch categories for the selected brand
        if (product.brand_id) {
          fetchCategoriesByBrand(product.brand_id.toString());
        }
      } else {
        // Reset form for add mode
        setFormData({
          name: '',
          code: '',
          brand_id: '',
          category_id: '',
          branch_id: '',
          cost: '',
          stock: ''
        });
        setCategories([]);
      }
    }
  }, [open, mode, product]);

  useEffect(() => {
    // When brand changes, fetch categories for that brand
    if (formData.brand_id && open) {
      fetchCategoriesByBrand(formData.brand_id);
    } else if (!formData.brand_id) {
      setCategories([]);
      // Clear category selection when brand changes (only in add mode or if category doesn't match)
      if (mode === 'add' || (mode === 'edit' && product?.brand_id?.toString() !== formData.brand_id)) {
        setFormData(prev => ({ ...prev, category_id: '' }));
      }
    }
  }, [formData.brand_id]);

  const fetchCurrentUser = async () => {
    try {
      const response = await axios.get('/user');
      setCurrentUser(response.data.user);
      
      // If user is not admin (role_id != 1), set their branch automatically
      if (response.data.user && response.data.user.role_id !== 1) {
        setFormData(prev => ({
          ...prev,
          branch_id: response.data.user.branch_id?.toString() || ''
        }));
      }
    } catch (error) {
      console.error('Error fetching current user:', error);
    }
  };

  const fetchBranches = async () => {
    try {
      const response = await axios.get('/branches');
      setBranches(response.data.data || response.data || []);
    } catch (error) {
      console.error('Error fetching branches:', error);
    }
  };

  const fetchBrands = async () => {
    try {
      const response = await axios.get('/brands');
      setBrands(response.data);
    } catch (error) {
      console.error('Error fetching brands:', error);
      toast.error('Failed to load brands');
    }
  };

  const fetchCategoriesByBrand = async (brandId: string) => {
    try {
      const response = await axios.get('/categories', {
        params: { brand_id: brandId }
      });
      setCategories(response.data);
      
      // Clear category selection if it's not in the new list (only in add mode)
      if (mode === 'add' && formData.category_id && !response.data.find((cat: Category) => cat.id.toString() === formData.category_id)) {
        setFormData(prev => ({ ...prev, category_id: '' }));
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to load categories');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev: any) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev: any) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors: any = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Product name is required';
    }
    
    if (!formData.code.trim()) {
      newErrors.code = 'Product code is required';
    }
    
    if (!formData.brand_id) {
      newErrors.brand_id = 'Brand is required';
    }
    
    if (!formData.category_id) {
      newErrors.category_id = 'Category is required';
    }
    
    if (currentUser?.role_id === 1 && !formData.branch_id) {
      newErrors.branch_id = 'Branch is required';
    }
    
    if (!formData.cost || parseFloat(formData.cost) <= 0) {
      newErrors.cost = 'Valid cost is required';
    }
    
    if (!formData.stock || parseInt(formData.stock) < 0) {
      newErrors.stock = 'Valid stock quantity is required';
    }
    
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      const dataToSend: any = {
        ...formData,
        category_id: parseInt(formData.category_id),
        brand_id: parseInt(formData.brand_id),
        cost: parseFloat(formData.cost),
        stock: parseInt(formData.stock)
      };
      
      // Include branch_id
      if (formData.branch_id) {
        dataToSend.branch_id = parseInt(formData.branch_id);
      } else if (currentUser?.branch_id) {
        dataToSend.branch_id = currentUser.branch_id;
      }
      
      let response;
      if (mode === 'edit' && product) {
        response = await axios.put(`/products/${product.id}`, dataToSend);
      } else {
        response = await axios.post('/add-product', dataToSend);
      }
      
      if (response.data) {
        toast.success(mode === 'edit' ? 'Product updated successfully!' : 'Product added successfully!');
        
        // Reset form
        setFormData({
          name: '',
          code: '',
          brand_id: '',
          category_id: '',
          branch_id: '',
          cost: '',
          stock: ''
        });
        setErrors({});
        setCategories([]);
        
        // Close modal and refresh list
        onOpenChange(false);
        onProductSaved();
      }
    } catch (error: any) {
      console.error(`Error ${mode === 'edit' ? 'updating' : 'adding'} product:`, error);
      
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error(`Failed to ${mode === 'edit' ? 'update' : 'add'} product. Please try again.`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      code: '',
      brand_id: '',
      category_id: '',
      branch_id: '',
      cost: '',
      stock: ''
    });
    setErrors({});
    setCategories([]);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{mode === 'edit' ? 'Edit Product' : 'Add New Product'}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* Product Name - Row 1 */}
          <div>
            <Label htmlFor="name">Product Name *</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter product name"
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name}</p>
            )}
          </div>
          
          {/* Product Code - Row 2 */}
          <div>
            <Label htmlFor="code">Product Code *</Label>
            <Input
              id="code"
              name="code"
              value={formData.code}
              onChange={handleInputChange}
              placeholder="Enter product code"
              className={errors.code ? 'border-red-500' : ''}
            />
            {errors.code && (
              <p className="text-red-500 text-sm mt-1">{errors.code}</p>
            )}
          </div>
          
          {/* Branch - Row 3 (Only for Admin, otherwise auto-assigned) */}
          {currentUser?.role_id === 1 ? (
            <div>
              <Label htmlFor="branch_id">Branch *</Label>
              <Select 
                value={formData.branch_id} 
                onValueChange={(value) => handleSelectChange('branch_id', value)}
              >
                <SelectTrigger className={errors.branch_id ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select branch" />
                </SelectTrigger>
                <SelectContent>
                  {branches.map((branch) => (
                    <SelectItem key={branch.id} value={branch.id.toString()}>
                      {branch.branch_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.branch_id && (
                <p className="text-red-500 text-sm mt-1">{errors.branch_id}</p>
              )}
            </div>
          ) : currentUser?.branch_id ? (
            <div>
              <Label>Branch</Label>
              <div className="px-3 py-2 border rounded-md bg-gray-50 text-sm">
                {branches.find(b => b.id === currentUser.branch_id)?.branch_name || 'Loading...'}
              </div>
            </div>
          ) : null}
          
          {/* Brand - Row 4 (Now after Branch) */}
          <div>
            <Label htmlFor="brand_id">Brand *</Label>
            <Select 
              value={formData.brand_id} 
              onValueChange={(value) => handleSelectChange('brand_id', value)}
            >
              <SelectTrigger className={errors.brand_id ? 'border-red-500' : ''}>
                <SelectValue placeholder="Select brand first" />
              </SelectTrigger>
              <SelectContent>
                {brands.map((brand) => (
                  <SelectItem key={brand.id} value={brand.id.toString()}>
                    {brand.brand}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.brand_id && (
              <p className="text-red-500 text-sm mt-1">{errors.brand_id}</p>
            )}
          </div>
          
          {/* Category - Row 5 (Now after Brand, filtered by selected brand) */}
          <div>
            <Label htmlFor="category_id">Category *</Label>
            <Select 
              value={formData.category_id} 
              onValueChange={(value) => handleSelectChange('category_id', value)}
              disabled={!formData.brand_id}
            >
              <SelectTrigger className={errors.category_id ? 'border-red-500' : ''}>
                <SelectValue placeholder={formData.brand_id ? "Select category" : "Select brand first"} />
              </SelectTrigger>
              <SelectContent>
                {categories.length > 0 ? (
                  categories.map((category) => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.category}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="no-categories" disabled>
                    {formData.brand_id ? "No categories for this brand" : "Select brand first"}
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
            {errors.category_id && (
              <p className="text-red-500 text-sm mt-1">{errors.category_id}</p>
            )}
          </div>
          
          {/* Cost and Number of Items - Row 6 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="cost">Cost *</Label>
              <Input
                id="cost"
                name="cost"
                type="number"
                step="0.01"
                value={formData.cost}
                onChange={handleInputChange}
                placeholder="Enter cost"
                className={errors.cost ? 'border-red-500' : ''}
              />
              {errors.cost && (
                <p className="text-red-500 text-sm mt-1">{errors.cost}</p>
              )}
            </div>
            
            <div>
              <Label htmlFor="stock">Number of Items *</Label>
              <Input
                id="stock"
                name="stock"
                type="number"
                value={formData.stock}
                onChange={handleInputChange}
                placeholder="Enter number of items"
                className={errors.stock ? 'border-red-500' : ''}
              />
              {errors.stock && (
                <p className="text-red-500 text-sm mt-1">{errors.stock}</p>
              )}
            </div>
          </div>
          
          {/* Buttons - Row 7 */}
          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (mode === 'edit' ? 'Updating...' : 'Adding...') : (mode === 'edit' ? 'Update Product' : 'Add Product')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}