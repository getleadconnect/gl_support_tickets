import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Mail, Phone, MapPin, Briefcase, Building2, Loader2 } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId?: number;
}

interface UserData {
  id: number;
  name: string;
  email: string;
  mobile: string;
  country_code: string;
  address: string;
  location: string;
  image: string;
  role: string;
  role_id: number;
  department_id?: number;
  designation_id?: number;
  department?: {
    id: number;
    department_name: string;
  };
  designation?: {
    id: number;
    designation_name: string;
  };
}

interface Department {
  id: number;
  department_name: string;
}

interface Designation {
  id: number;
  designation_name: string;
}

export function UserProfileModal({ isOpen, onClose, userId }: UserProfileModalProps) {
  const { user: authUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [designations, setDesignations] = useState<Designation[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    country_code: '',
    address: '',
    location: '',
    department_id: 'none',
    designation_id: 'none',
  });

  useEffect(() => {
    if (isOpen) {
      if (userId) {
        fetchUserData(userId);
        fetchDepartments();
        fetchDesignations();
      } else {
        toast.error('Unable to load user profile: User ID not found');
      }
    }
  }, [isOpen, userId]);

  const fetchUserData = async (id: number) => {
    setLoading(true);
    try {
      const response = await axios.get(`/users/${id}`);
      const user = response.data;
      
      if (!user) {
        throw new Error('No user data returned from API');
      }
      
      setUserData(user);
      setFormData({
        name: user.name || '',
        email: user.email || '',
        mobile: user.mobile || '',
        country_code: user.country_code || '',
        address: user.address || '',
        location: user.location || '',
        department_id: user.department_id ? user.department_id.toString() : 'none',
        designation_id: user.designation_id ? user.designation_id.toString() : 'none',
      });
    } catch (error: any) {
      if (error.response?.status === 404) {
        toast.error('User not found');
      } else if (error.response?.status === 401) {
        toast.error('Not authorized to view this profile');
      } else {
        toast.error('Failed to load user profile');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await axios.get('/departments');
      setDepartments(response.data.data || response.data || []);
    } catch (error) {
      console.error('Failed to fetch departments:', error);
    }
  };

  const fetchDesignations = async () => {
    try {
      const response = await axios.get('/designations');
      setDesignations(response.data.data || response.data || []);
    } catch (error) {
      console.error('Failed to fetch designations:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      if (!userId) {
        toast.error('User ID not found');
        setSaving(false);
        return;
      }
      
      const dataToSend = {
        ...formData,
        department_id: formData.department_id === 'none' ? null : parseInt(formData.department_id),
        designation_id: formData.designation_id === 'none' ? null : parseInt(formData.designation_id),
      };
      
      const response = await axios.put(`/users/${userId}`, dataToSend);
      toast.success('Profile updated successfully');
      
      // Update the userData state with new values
      if (userData) {
        setUserData({
          ...userData,
          ...formData
        });
      }
      
      // Refresh the page to update user data throughout the app
      setTimeout(() => {
        window.location.reload();
      }, 1000);
      
      onClose();
    } catch (error: any) {
      if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        const firstError = Object.values(errors)[0];
        toast.error(Array.isArray(firstError) ? firstError[0] : 'Failed to update profile');
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Failed to update profile');
      }
    } finally {
      setSaving(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">User Profile</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              {/* Avatar Section */}
              <div className="flex items-center justify-center">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={userData?.image} alt={userData?.name} />
                  <AvatarFallback className="text-2xl bg-purple-100 text-purple-700">
                    {formData.name ? getInitials(formData.name) : 'U'}
                  </AvatarFallback>
                </Avatar>
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Name */}
                <div className="space-y-2">
                  <Label htmlFor="name" className="flex items-center gap-2">
                    <User className="h-4 w-4 text-slate-500" />
                    Full Name
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter your full name"
                    required
                  />
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-slate-500" />
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter your email"
                    required
                  />
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <Label htmlFor="mobile" className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-slate-500" />
                    Phone Number
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      name="country_code"
                      value={formData.country_code}
                      onChange={handleInputChange}
                      className="w-20"
                      placeholder="+1"
                    />
                    <Input
                      id="mobile"
                      name="mobile"
                      value={formData.mobile}
                      onChange={handleInputChange}
                      placeholder="Enter phone number"
                      className="flex-1"
                    />
                  </div>
                </div>

                {/* Location */}
                <div className="space-y-2">
                  <Label htmlFor="location" className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-slate-500" />
                    Location
                  </Label>
                  <Input
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="City, Country"
                  />
                </div>

                {/* Department Dropdown */}
                <div className="space-y-2">
                  <Label htmlFor="department_id" className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-slate-500" />
                    Department
                  </Label>
                  <Select
                    value={formData.department_id}
                    onValueChange={(value) => handleSelectChange('department_id', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {departments.map((dept) => (
                        <SelectItem key={dept.id} value={dept.id.toString()}>
                          {dept.department_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Designation Dropdown */}
                <div className="space-y-2">
                  <Label htmlFor="designation_id" className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-slate-500" />
                    Designation
                  </Label>
                  <Select
                    value={formData.designation_id}
                    onValueChange={(value) => handleSelectChange('designation_id', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select designation" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {designations.map((desig) => (
                        <SelectItem key={desig.id} value={desig.id.toString()}>
                          {desig.designation_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Address */}
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="address" className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-slate-500" />
                    Address
                  </Label>
                  <Textarea
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Enter your full address"
                    rows={3}
                  />
                </div>
              </div>

            </div>

            <DialogFooter className="mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-purple-600 hover:bg-purple-700"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}