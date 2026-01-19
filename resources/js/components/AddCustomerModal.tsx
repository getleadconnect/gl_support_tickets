import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X } from 'lucide-react';
import { CountryCodePicker } from '@/components/CountryCodePicker';

interface AddCustomerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCustomerAdded?: (customer: any) => void;
}

export function AddCustomerModal({
  open,
  onOpenChange,
  onCustomerAdded
}: AddCustomerModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    country_code: '+91',
    contact_number: '',
    email: '',
    company_name: ''
  });

  const handleFormChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.name) {
      toast.error('Please enter customer name');
      return;
    }

    // Validate email if provided
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('/customers', formData);
      
      toast.success('Customer added successfully');
      
      // Call the callback with the new customer
      if (onCustomerAdded) {
        onCustomerAdded(response.data.customer || response.data);
      }
      
      // Reset form
      setFormData({
        name: '',
        country_code: '+91',
        contact_number: '',
        email: '',
        company_name: ''
      });
      
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error creating customer:', error);
      if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        const firstError = Object.values(errors)[0];
        toast.error(Array.isArray(firstError) ? firstError[0] : firstError);
      } else {
        toast.error(error.response?.data?.message || 'Failed to create customer');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    // Reset form when closing
    setFormData({
      name: '',
      country_code: '+91',
      contact_number: '',
      email: '',
      company_name: ''
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle>New Customer</DialogTitle>
          <button
            onClick={handleClose}
            className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          >
            <X className="h-4 w-4" />
          </button>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleFormChange('name', e.target.value)}
              placeholder="Enter Name"
              autoFocus
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="contact_number">Whatsapp Number</Label>
            <div className="flex items-center gap-2">
              <CountryCodePicker
                value={formData.country_code}
                onChange={(value) => handleFormChange('country_code', value)}
                className="w-28"
              />
              <Input
                id="contact_number"
                value={formData.contact_number}
                onChange={(e) => {
                  // Only allow numbers
                  const value = e.target.value.replace(/\D/g, '');
                  handleFormChange('contact_number', value);
                }}
                placeholder="9876543210"
                maxLength={15}
                className="flex-1"
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleFormChange('email', e.target.value)}
              placeholder="email"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="company_name">Company Name</Label>
            <Input
              id="company_name"
              value={formData.company_name}
              onChange={(e) => handleFormChange('company_name', e.target.value)}
              placeholder="Company Name"
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={loading}
            className="bg-red-500 text-white hover:bg-red-600 border-red-500"
          >
            Close
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={loading || !formData.name}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {loading ? 'Saving...' : 'Save changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}