import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { DashboardLayout } from '@/components/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Package,
  Settings,
  Cog
} from 'lucide-react';

interface Accessory {
  id: number;
  name: string;
  created_by: number;
  created_at: string;
  updated_at: string;
  creator?: {
    id: number;
    name: string;
  };
}

export default function GeneralOptions() {
  // Active tab state
  const [activeTab, setActiveTab] = useState('accessories');

  // Accessories state
  const [accessories, setAccessories] = useState<Accessory[]>([]);
  const [loadingAccessories, setLoadingAccessories] = useState(false);
  const [errorAccessories, setErrorAccessories] = useState<string | null>(null);
  const [currentPageAccessories, setCurrentPageAccessories] = useState(1);
  const [perPageAccessories, setPerPageAccessories] = useState(10);
  const [searchTermAccessories, setSearchTermAccessories] = useState('');
  const [totalPagesAccessories, setTotalPagesAccessories] = useState(1);
  const [totalAccessories, setTotalAccessories] = useState(0);
  const [savingAccessory, setSavingAccessory] = useState(false);
  const [accessoryFormData, setAccessoryFormData] = useState({
    name: ''
  });
  const [editAccessoryModalOpen, setEditAccessoryModalOpen] = useState(false);
  const [deleteAccessoryModalOpen, setDeleteAccessoryModalOpen] = useState(false);
  const [editingAccessory, setEditingAccessory] = useState<Accessory | null>(null);
  const [deletingAccessory, setDeletingAccessory] = useState<Accessory | null>(null);

  useEffect(() => {
    fetchAccessories();
  }, [currentPageAccessories, perPageAccessories, searchTermAccessories]);

  // Accessories Functions
  const fetchAccessories = async () => {
    setLoadingAccessories(true);
    setErrorAccessories(null);
    try {
      const response = await axios.get('/accessories', {
        params: {
          page: currentPageAccessories,
          per_page: perPageAccessories,
          search: searchTermAccessories
        }
      });
      
      if (response.data) {
        setAccessories(response.data.data);
        setTotalPagesAccessories(response.data.last_page);
        setTotalAccessories(response.data.total);
      }
    } catch (error) {
      console.error('Error fetching accessories:', error);
      setErrorAccessories('Failed to load accessories');
      toast.error('Failed to load accessories');
    } finally {
      setLoadingAccessories(false);
    }
  };

  const handleAccessoryFormChange = (field: string, value: any) => {
    setAccessoryFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddAccessory = async () => {
    if (!accessoryFormData.name.trim()) {
      toast.error('Please enter accessory name');
      return;
    }

    setSavingAccessory(true);
    try {
      const response = await axios.post('/accessories', {
        name: accessoryFormData.name.trim()
      });

      if (response.data) {
        await fetchAccessories();
        setAccessoryFormData({ name: '' });
        toast.success('Accessory added successfully!');
      }
    } catch (error: any) {
      console.error('Error adding accessory:', error);
      if (error.response?.data?.errors?.name) {
        toast.error(error.response.data.errors.name[0]);
      } else {
        toast.error('Failed to add accessory');
      }
    } finally {
      setSavingAccessory(false);
    }
  };

  const handleEditAccessory = (accessory: Accessory) => {
    setEditingAccessory(accessory);
    setAccessoryFormData({
      name: accessory.name
    });
    setEditAccessoryModalOpen(true);
  };

  const handleUpdateAccessory = async () => {
    if (!editingAccessory) return;

    setSavingAccessory(true);
    try {
      const response = await axios.put(`/accessories/${editingAccessory.id}`, {
        name: accessoryFormData.name.trim()
      });

      if (response.data) {
        await fetchAccessories();
        setEditAccessoryModalOpen(false);
        setEditingAccessory(null);
        setAccessoryFormData({ name: '' });
        toast.success('Accessory updated successfully!');
      }
    } catch (error: any) {
      console.error('Error updating accessory:', error);
      if (error.response?.data?.errors?.name) {
        toast.error(error.response.data.errors.name[0]);
      } else {
        toast.error('Failed to update accessory');
      }
    } finally {
      setSavingAccessory(false);
    }
  };

  const handleDeleteAccessory = (accessory: Accessory) => {
    setDeletingAccessory(accessory);
    setDeleteAccessoryModalOpen(true);
  };

  const confirmDeleteAccessory = async () => {
    if (!deletingAccessory) return;

    try {
      await axios.delete(`/accessories/${deletingAccessory.id}`);
      await fetchAccessories();
      setDeleteAccessoryModalOpen(false);
      setDeletingAccessory(null);
      toast.success('Accessory deleted successfully!');
    } catch (error) {
      console.error('Error deleting accessory:', error);
      toast.error('Failed to delete accessory');
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">General Options</h1>
          <p className="text-gray-500 text-sm mt-1">Manage general application options and settings</p>
        </div>

        <div className="flex min-h-screen bg-white">
          {/* Left Sidebar - Vertical Tabs */}
          <div className="w-64 bg-gray-50 border-r border-gray-200 flex-shrink-0">
            <div className="p-4">
              <nav className="space-y-2">
                <button
                  onClick={() => setActiveTab('accessories')}
                  className={`w-full justify-start text-sm px-3 py-2 flex items-center gap-2 rounded-md transition-colors ${
                    activeTab === 'accessories'
                      ? 'bg-purple-100 text-purple-900 shadow-sm'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <Package className="h-4 w-4" />
                  Accessories
                </button>
                <button
                  onClick={() => setActiveTab('option-1')}
                  className={`w-full justify-start text-sm px-3 py-2 flex items-center gap-2 rounded-md transition-colors ${
                    activeTab === 'option-1'
                      ? 'bg-purple-100 text-purple-900 shadow-sm'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <Settings className="h-4 w-4" />
                  Option-1
                </button>
                <button
                  onClick={() => setActiveTab('option-2')}
                  className={`w-full justify-start text-sm px-3 py-2 flex items-center gap-2 rounded-md transition-colors ${
                    activeTab === 'option-2'
                      ? 'bg-purple-100 text-purple-900 shadow-sm'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <Cog className="h-4 w-4" />
                  Option-2
                </button>
              </nav>
            </div>
          </div>

          {/* Right Content Area */}
          <div className="flex-1 p-6">
            {/* Accessories Tab Content */}
            {activeTab === 'accessories' && (
            <div className="space-y-4">
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900" style={{fontSize: '22px'}}>Accessories Management</h3>
                <p className="text-sm text-gray-500 mt-1">Manage accessories details in your system. Create, edit, or delete accessories for organizing purpose.</p>
              </div>
              
              {/* Two-column layout */}
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                
                {/* Left Column - Add Accessory Form (25% width) */}
                <div className="lg:col-span-1">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="accessory-name" className="text-sm font-medium">Accessory Name</Label>
                      <Input
                        id="accessory-name"
                        type="text"
                        placeholder="Enter accessory name"
                        value={accessoryFormData.name}
                        onChange={(e) => handleAccessoryFormChange('name', e.target.value)}
                        className="mt-1"
                      />
                    </div>

                    <Button
                      onClick={handleAddAccessory}
                      disabled={savingAccessory || !accessoryFormData.name.trim()}
                      className="w-full bg-gray-800 hover:bg-gray-900"
                    >
                      {savingAccessory ? 'Adding...' : 'Add Accessory'}
                    </Button>
                  </div>
                </div>

                {/* Right Column - Accessories Table (75% width) */}
                <div className="lg:col-span-3">
                  {/* Controls */}
                  <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">Rows per page:</span>
                      <Select
                        value={perPageAccessories.toString()}
                        onValueChange={(value) => {
                          setPerPageAccessories(Number(value));
                          setCurrentPageAccessories(1);
                        }}
                      >
                        <SelectTrigger className="w-20">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="5">5</SelectItem>
                          <SelectItem value="10">10</SelectItem>
                          <SelectItem value="20">20</SelectItem>
                          <SelectItem value="50">50</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-4 w-4 text-gray-400" />
                      </div>
                      <Input
                        type="text"
                        placeholder="Search accessories..."
                        className="pl-10 w-72"
                        value={searchTermAccessories}
                        onChange={(e) => setSearchTermAccessories(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Table */}
                  {loadingAccessories ? (
                    <div className="h-48 flex items-center justify-center">
                      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                    </div>
                  ) : errorAccessories ? (
                    <div className="h-48 flex items-center justify-center">
                      <div className="text-center">
                        <p className="text-red-500 mb-2">{errorAccessories}</p>
                        <Button onClick={fetchAccessories} variant="outline">
                          Try Again
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div style={{border: '1px solid #e4e4e4', borderRadius: '6px', overflow: 'hidden'}}>
                      <Table>
                        <TableHeader className="bg-gray-50">
                          <TableRow style={{borderBottom: '1px solid #e4e4e4'}}>
                            <TableHead className="font-medium text-gray-600 px-4 py-3" style={{fontSize: '14px'}}>S.No</TableHead>
                            <TableHead className="font-medium text-gray-600 px-4 py-3" style={{fontSize: '14px'}}>Accessory Name</TableHead>
                            <TableHead className="font-medium text-gray-600 px-4 py-3" style={{fontSize: '14px'}}>Created By</TableHead>
                            <TableHead className="font-medium text-gray-600 px-4 py-3 text-right" style={{fontSize: '14px'}}>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {accessories.length === 0 ? (
                            <TableRow style={{borderBottom: '1px solid #e4e4e4'}}>
                              <TableCell colSpan={4} className="text-center py-8 text-gray-500" style={{fontSize: '14px'}}>
                                No accessories found
                              </TableCell>
                            </TableRow>
                          ) : (
                            accessories.map((accessory, index) => (
                              <TableRow key={accessory.id} className="hover:bg-gray-50" style={{borderBottom: '1px solid #e4e4e4'}}>
                                <TableCell className="px-4 py-3 text-gray-600" style={{fontSize: '14px'}}>
                                  {((currentPageAccessories - 1) * perPageAccessories) + index + 1}
                                </TableCell>
                                <TableCell className="px-4 py-3 text-gray-900" style={{fontSize: '14px'}}>
                                  {accessory.name}
                                </TableCell>
                                <TableCell className="px-4 py-3 text-gray-600" style={{fontSize: '14px'}}>
                                  {accessory.creator?.name || '-'}
                                </TableCell>
                                <TableCell className="px-4 py-3 text-right">
                                  <div className="flex items-center justify-end space-x-2">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleEditAccessory(accessory)}
                                      className="h-7 w-7 p-0"
                                    >
                                      <Edit className="h-3 w-3" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleDeleteAccessory(accessory)}
                                      className="h-7 w-7 p-0 text-red-500 hover:text-red-700"
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  )}

                  {/* Pagination */}
                  {accessories.length > 0 && (
                    <div className="flex items-center justify-between pt-4">
                      <div className="text-sm text-gray-600">
                        Showing {((currentPageAccessories - 1) * perPageAccessories) + 1} to {Math.min(currentPageAccessories * perPageAccessories, totalAccessories)} of {totalAccessories} entries
                      </div>
                      
                      <div className="flex items-center space-x-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPageAccessories(1)}
                          disabled={currentPageAccessories === 1}
                          className="h-8 w-8 p-0"
                        >
                          <ChevronsLeft className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPageAccessories(Math.max(1, currentPageAccessories - 1))}
                          disabled={currentPageAccessories === 1}
                          className="h-8 w-8 p-0"
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        
                        <div className="flex items-center gap-1">
                          {Array.from({ length: Math.min(5, totalPagesAccessories) }, (_, i) => {
                            const page = i + 1;
                            return (
                              <Button
                                key={page}
                                variant={currentPageAccessories === page ? "default" : "outline"}
                                size="sm"
                                onClick={() => setCurrentPageAccessories(page)}
                                className="h-8 w-8 p-0"
                              >
                                {page}
                              </Button>
                            );
                          })}
                        </div>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPageAccessories(Math.min(totalPagesAccessories, currentPageAccessories + 1))}
                          disabled={currentPageAccessories === totalPagesAccessories}
                          className="h-8 w-8 p-0"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPageAccessories(totalPagesAccessories)}
                          disabled={currentPageAccessories === totalPagesAccessories}
                          className="h-8 w-8 p-0"
                        >
                          <ChevronsRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            )}

            {/* Option-1 Tab Content */}
            {activeTab === 'option-1' && (
            <div className="space-y-4">
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Option-1</h3>
                <p className="text-sm text-gray-500 mt-1">Option-1 functionality coming soon...</p>
              </div>
              
              <div className="h-48 flex items-center justify-center border-2 border-dashed border-gray-200 rounded-lg">
                <div className="text-center">
                  <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-lg text-gray-500">Option-1 Content</p>
                  <p className="text-sm text-gray-400">This section is under development</p>
                </div>
              </div>
            </div>
            )}

            {/* Option-2 Tab Content */}
            {activeTab === 'option-2' && (
            <div className="space-y-4">
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Option-2</h3>
                <p className="text-sm text-gray-500 mt-1">Option-2 functionality coming soon...</p>
              </div>
              
              <div className="h-48 flex items-center justify-center border-2 border-dashed border-gray-200 rounded-lg">
                <div className="text-center">
                  <Cog className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-lg text-gray-500">Option-2 Content</p>
                  <p className="text-sm text-gray-400">This section is under development</p>
                </div>
              </div>
            </div>
            )}
          </div>
        </div>

        {/* Edit Accessory Modal */}
        <Dialog open={editAccessoryModalOpen} onOpenChange={setEditAccessoryModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Accessory</DialogTitle>
              <DialogDescription>
                Update the accessory information
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-accessory-name" className="text-sm font-medium">Accessory Name</Label>
                <Input
                  id="edit-accessory-name"
                  type="text"
                  placeholder="Enter accessory name"
                  value={accessoryFormData.name}
                  onChange={(e) => handleAccessoryFormChange('name', e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditAccessoryModalOpen(false)} disabled={savingAccessory}>
                Cancel
              </Button>
              <Button onClick={handleUpdateAccessory} disabled={savingAccessory || !accessoryFormData.name.trim()}>
                {savingAccessory ? 'Updating...' : 'Update Accessory'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Accessory Confirmation Modal */}
        <AlertDialog open={deleteAccessoryModalOpen} onOpenChange={setDeleteAccessoryModalOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Accessory</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete the accessory "{deletingAccessory?.name}"? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDeleteAccessory} className="bg-red-600 hover:bg-red-700">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
}