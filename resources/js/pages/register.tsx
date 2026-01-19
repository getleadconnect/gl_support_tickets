import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { CountryCodePicker } from '@/components/CountryCodePicker';
import { AlertCircle, CheckCircle, Loader2, UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';

export function Register() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [branchId, setBranchId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [dueDate, setDueDate] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    countryCode: '+91',
    mobile: '',
    email: '',
    companyName: '',
    issue: ''
  });

  const [errors, setErrors] = useState({
    name: '',
    mobile: '',
    email: '',
    issue: ''
  });

  // Get branch_id from URL query parameter
  useEffect(() => {
    const branch = searchParams.get('branch_id');
    if (branch) {
      setBranchId(branch);
    }
  }, [searchParams]);

  const validateForm = () => {
    const newErrors = {
      name: '',
      mobile: '',
      email: '',
      issue: ''
    };

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    // Mobile validation (optional but if provided, should be valid)
    if (formData.mobile && !/^\d{10}$/.test(formData.mobile)) {
      newErrors.mobile = 'Please enter a valid 10-digit whatsapp number';
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Issue validation
    if (!formData.issue.trim()) {
      newErrors.issue = 'Please describe your issue';
    } else if (formData.issue.trim().length < 10) {
      newErrors.issue = 'Please provide more details about your issue (minimum 10 characters)';
    }

    setErrors(newErrors);
    return !Object.values(newErrors).some(error => error !== '');
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error for the field being edited
    if (errors[field as keyof typeof errors]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        country_code:formData.countryCode ? formData.countryCode : null,
        contact_number: formData.mobile ? formData.mobile : null,
        company_name: formData.companyName.trim() || null,
        issue: formData.issue.trim(),
        branch_id: branchId // Include branch_id from URL
      };

      const response = await axios.post('/register-customer', payload);
      
      if (response.data.success) {
        setIsSuccess(true);
        setTrackingNumber(response.data.tracking_number);
        
        // Calculate and format due date (day after tomorrow at 5:30 PM)
        const dueDateObj = new Date();
        dueDateObj.setDate(dueDateObj.getDate() + 2);
        dueDateObj.setHours(17, 30, 0, 0);
        const formattedDueDate = dueDateObj.toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }) + ' at 5:30 PM';
        setDueDate(formattedDueDate);
        
        toast.success('Registration successful! Your ticket has been created.');
        
        // Don't reset form automatically - keep showing success message
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      toast.error(error.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center">
          <div className="mb-6">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Registration Successful!</h2>
            <p className="text-gray-600 mb-4">
              Thank you for registering. Your support ticket has been created.
            </p>
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <p className="text-sm text-gray-600 mb-2">Your tracking number:</p>
              <p className="text-xl font-mono font-bold text-purple-600">{trackingNumber}</p>
              <p className="text-xs text-gray-500 mt-2">Please save this number for future reference</p>
            </div>
            
            <div className="bg-blue-50 rounded-lg p-4 mb-6 border border-blue-200">
              <p className="text-sm text-gray-600 mb-1">Expected resolution by:</p>
              <p className="text-base font-semibold text-blue-700">{dueDate}</p>
              <p className="text-xs text-gray-500 mt-2">We'll work on your issue and resolve it by the due date</p>
            </div>
            <Button 
              onClick={() => {
                setIsSuccess(false);
                setTrackingNumber('');
                setDueDate('');
                setFormData({
                  name: '',
                  countryCode: '+91',
                  mobile: '',
                  email: '',
                  companyName: '',
                  issue: ''
                });
              }}
              className="w-full"
            >
              Register Another Issue
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full shadow-xl">
        <div className="p-6 sm:p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-purple-100 rounded-full mb-4">
              <UserPlus className="h-7 w-7 text-purple-600" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              Customer Registration
            </h1>
            <p className="text-gray-600">
              Register your details and submit your issue. We'll create a support ticket for you.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Field */}
            <div className="space-y-2">
              <Label htmlFor="name">
                Full Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className={errors.name ? 'border-red-500' : ''}
                disabled={isSubmitting}
              />
              {errors.name && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.name}
                </p>
              )}
            </div>

            {/* Mobile Field with Country Code */}
            <div className="space-y-2">
              <Label htmlFor="mobile">Whatsapp Number</Label>
              <div className="flex items-center gap-2">
                <CountryCodePicker
                  value={formData.countryCode}
                  onChange={(value) => handleChange('countryCode', value)}
                  className="w-28"
                />
                <Input
                  id="mobile"
                  type="tel"
                  placeholder="Enter whatsapp number"
                  value={formData.mobile}
                  onChange={(e) => {
                    // Only allow numbers
                    const value = e.target.value.replace(/\D/g, '');
                    handleChange('mobile', value);
                  }}
                  maxLength={15}
                  className={`flex-1 ${errors.mobile ? 'border-red-500' : ''}`}
                  disabled={isSubmitting}
                />
              </div>
              {errors.mobile && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.mobile}
                </p>
              )}
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email">
                Email Address <span className="text-red-500">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email address"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className={errors.email ? 'border-red-500' : ''}
                disabled={isSubmitting}
              />
              {errors.email && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.email}
                </p>
              )}
            </div>

            {/* Company Name Field */}
            <div className="space-y-2">
              <Label htmlFor="companyName">
                Company Name <span className="text-gray-400 text-xs">(Optional)</span>
              </Label>
              <Input
                id="companyName"
                type="text"
                placeholder="Enter your company name"
                value={formData.companyName}
                onChange={(e) => handleChange('companyName', e.target.value)}
                disabled={isSubmitting}
              />
            </div>

            {/* Issue Description */}
            <div className="space-y-2">
              <Label htmlFor="issue">
                Describe Your Issue <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="issue"
                placeholder="Please describe your issue in detail..."
                value={formData.issue}
                onChange={(e) => handleChange('issue', e.target.value)}
                className={`min-h-[120px] ${errors.issue ? 'border-red-500' : ''}`}
                disabled={isSubmitting}
              />
              {errors.issue && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.issue}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit Registration'
                )}
              </Button>
            </div>
          </form>

          {/* Footer Note */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              By registering, you agree to our terms of service and privacy policy.
              A support ticket will be automatically created for your issue.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}