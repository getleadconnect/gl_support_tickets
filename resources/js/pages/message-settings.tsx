import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { DashboardLayout } from '@/components/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { Badge } from '@/components/ui/badge';
import toast from 'react-hot-toast';
import {
  Plus,
  Edit,
  Trash2,
  Search,
  MessageCircle,
  Key,
  FileText,
  Power,
  Eye,
  EyeOff,
  Copy,
  Check,
  RefreshCw,
  Filter,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface MessageSetting {
  id: number;
  message_type: string;
  whatsapp_api: string | null;
  token: string | null;
  phone_number_id: string | null;
  secret_key: string | null;
  template_name: string | null;
  template_text: string | null;
  status: boolean;
  created_by: number | null;
  created_at: string;
  updated_at: string;
  masked_token?: string;
  masked_secret_key?: string;
  created_by_user?: {
    id: number;
    name: string;
  };
}

export function MessageSettings() {
  const [messageSettings, setMessageSettings] = useState<MessageSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [editingMessage, setEditingMessage] = useState<MessageSetting | null>(null);
  const [deletingMessage, setDeletingMessage] = useState<MessageSetting | null>(null);
  const [viewingMessage, setViewingMessage] = useState<MessageSetting | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [messageTypeFilter, setMessageTypeFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [showSecrets, setShowSecrets] = useState<{ [key: number]: boolean }>({});
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    message_type: '',
    whatsapp_api: '',
    token: '',
    phone_number_id: '',
    secret_key: '',
    template_name: '',
    template_text: '',
    status: true,
  });

  const [errors, setErrors] = useState<any>({});

  // Predefined message types
  const messageTypes = [
    { value: 'ticket_confirmation', label: 'Ticket Confirmation' },
    { value: 'issue_completed', label: 'Issue Completed' },
    { value: 'item_delivered', label: 'Item Delivered' },
    { value: 'payment_confirmation', label: 'Payment Confirmation' },
  ];

  useEffect(() => {
    fetchMessageSettings();
  }, [currentPage, perPage, searchTerm, statusFilter, messageTypeFilter]);

  const fetchMessageSettings = async () => {
    setLoading(true);
    try {
      const params: any = {
        page: currentPage,
        per_page: perPage,
      };

      if (searchTerm) {
        params.search = searchTerm;
      }

      if (statusFilter !== 'all') {
        params.status = statusFilter === 'active' ? 1 : 0;
      }

      if (messageTypeFilter !== 'all') {
        params.message_type = messageTypeFilter;
      }

      const response = await axios.get('/message-settings', { params });
      setMessageSettings(response.data.data || []);
      setTotalPages(response.data.last_page || 1);
    } catch (error) {
      console.error('Error fetching message settings:', error);
      toast.error('Failed to fetch message settings');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (message?: MessageSetting) => {
    if (message) {
      setEditingMessage(message);
      setFormData({
        message_type: message.message_type,
        whatsapp_api: message.whatsapp_api || '',
        token: '', // Don't populate for security
        phone_number_id: message.phone_number_id || '',
        secret_key: '', // Don't populate for security
        template_name: message.template_name || '',
        template_text: message.template_text || '',
        status: message.status,
      });
    } else {
      setEditingMessage(null);
      setFormData({
        message_type: '',
        whatsapp_api: '',
        token: '',
        phone_number_id: '',
        secret_key: '',
        template_name: '',
        template_text: '',
        status: true,
      });
    }
    setErrors({});
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingMessage(null);
    setFormData({
      message_type: '',
      whatsapp_api: '',
      token: '',
      phone_number_id: '',
      secret_key: '',
      template_name: '',
      template_text: '',
      status: true,
    });
    setErrors({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    try {
      const dataToSubmit: any = { ...formData };
      
      // Only include token and secret_key if they have values
      if (!dataToSubmit.token) {
        delete dataToSubmit.token;
      }
      if (!dataToSubmit.secret_key) {
        delete dataToSubmit.secret_key;
      }

      if (editingMessage) {
        await axios.put(`/message-settings/${editingMessage.id}`, dataToSubmit);
        toast.success('Message setting updated successfully');
      } else {
        await axios.post('/message-settings', dataToSubmit);
        toast.success('Message setting created successfully');
      }
      
      handleCloseModal();
      fetchMessageSettings();
    } catch (error: any) {
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        toast.error(error.response?.data?.message || 'Failed to save message setting');
      }
    }
  };

  const handleDelete = async () => {
    if (!deletingMessage) return;

    try {
      await axios.delete(`/message-settings/${deletingMessage.id}`);
      toast.success('Message setting deleted successfully');
      setIsDeleteModalOpen(false);
      setDeletingMessage(null);
      fetchMessageSettings();
    } catch (error) {
      toast.error('Failed to delete message setting');
    }
  };

  const handleToggleStatus = async (id: number) => {
    try {
      await axios.put(`/message-settings/${id}/toggle-status`);
      toast.success('Status updated successfully');
      fetchMessageSettings();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleView = async (message: MessageSetting) => {
    try {
      const response = await axios.get(`/message-settings/${message.id}`);
      setViewingMessage(response.data);
      setIsViewModalOpen(true);
    } catch (error) {
      toast.error('Failed to fetch message details');
    }
  };

  const toggleSecretVisibility = (id: number) => {
    setShowSecrets(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
      toast.success('Copied to clipboard');
    } catch (error) {
      toast.error('Failed to copy');
    }
  };

  return (
    <DashboardLayout title="Message Settings">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Message Settings</h1>
            <p className="text-sm text-gray-600 mt-1">Manage your messaging templates and API configurations</p>
          </div>
          <Button onClick={() => handleOpenModal()} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Message Setting
          </Button>
        </div>

        {/* Filters */}
        <Card className="p-4" style={{ borderColor: '#e4e4e4' }}>
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search settings..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={messageTypeFilter} onValueChange={setMessageTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {messageTypes.map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm('');
                setMessageTypeFilter('all');
                setStatusFilter('all');
                setCurrentPage(1);
              }}
              style={{ width: '120px' }}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Reset
            </Button>
            {/* Two empty columns for spacing */}
            <div></div>
            <div></div>
          </div>
        </Card>

        {/* Table */}
        <Card style={{ borderColor: '#e4e4e4' }}>
          <Table>
            <TableHeader>
              <TableRow style={{ borderBottomColor: '#e4e4e4' }}>
                <TableHead>Message Type</TableHead>
                <TableHead>Template Name</TableHead>
                <TableHead>WhatsApp API</TableHead>
                <TableHead>Token</TableHead>
                <TableHead>Phone Number ID</TableHead>
                <TableHead>Template Text</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created By</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow style={{ borderBottomColor: '#e4e4e4' }}>
                  <TableCell colSpan={9} className="text-center py-8">
                    <div className="flex justify-center">
                      <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
                    </div>
                  </TableCell>
                </TableRow>
              ) : messageSettings.length === 0 ? (
                <TableRow style={{ borderBottomColor: '#e4e4e4' }}>
                  <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                    No message settings found
                  </TableCell>
                </TableRow>
              ) : (
                messageSettings.map((message) => (
                  <TableRow key={message.id} style={{ borderBottomColor: '#e4e4e4' }}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <MessageCircle className="h-4 w-4 text-gray-400" />
                        <span className="font-medium capitalize">
                          {message.message_type.replace('_', ' ')}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{message.template_name || '-'}</TableCell>
                    <TableCell>
                      {message.whatsapp_api ? (
                        <div className="flex items-center gap-1">
                          <span className="text-sm truncate max-w-[150px]">
                            {message.whatsapp_api}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => copyToClipboard(message.whatsapp_api!, 'api')}
                          >
                            {copiedField === 'api' ? (
                              <Check className="h-3 w-3 text-green-600" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </Button>
                        </div>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell>
                      {message.masked_token ? (
                        <div className="flex items-center gap-1">
                          <span className="text-sm font-mono">
                            {showSecrets[message.id] ? message.token : message.masked_token}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => toggleSecretVisibility(message.id)}
                          >
                            {showSecrets[message.id] ? (
                              <EyeOff className="h-3 w-3" />
                            ) : (
                              <Eye className="h-3 w-3" />
                            )}
                          </Button>
                        </div>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell>
                      {message.phone_number_id ? (
                        <div className="flex items-center gap-1">
                          <span className="text-sm font-mono truncate max-w-[120px]">
                            {message.phone_number_id}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => copyToClipboard(message.phone_number_id!, 'phone_id')}
                          >
                            {copiedField === 'phone_id' ? (
                              <Check className="h-3 w-3 text-green-600" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </Button>
                        </div>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell>
                      {message.template_text ? (
                        <div className="max-w-[200px]">
                          <p className="text-sm text-gray-600 truncate" title={message.template_text}>
                            {message.template_text}
                          </p>
                        </div>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className="cursor-pointer"
                        onClick={() => handleToggleStatus(message.id)}
                        style={{
                          backgroundColor: message.status ? '#10b981' : '#ef4444',
                          color: 'white',
                          borderColor: message.status ? '#10b981' : '#ef4444'
                        }}
                      >
                        <Power className="h-3 w-3 mr-1" />
                        {message.status ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {message.created_by_user?.name || 'System'}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleView(message)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenModal(message)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setDeletingMessage(message);
                            setIsDeleteModalOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t" style={{ borderTopColor: '#e4e4e4' }}>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">
                  Page {currentPage} of {totalPages}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </Card>

        {/* Add/Edit Modal */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingMessage ? 'Edit Message Setting' : 'Add Message Setting'}
              </DialogTitle>
              <DialogDescription>
                Configure your messaging templates and API settings
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="message_type">Message Type *</Label>
                  <Select
                    value={formData.message_type}
                    onValueChange={(value) => setFormData({ ...formData, message_type: value })}
                  >
                    <SelectTrigger id="message_type">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {messageTypes.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.message_type && (
                    <p className="text-sm text-red-600">{errors.message_type[0]}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="template_name">Template Name</Label>
                  <Input
                    id="template_name"
                    value={formData.template_name}
                    onChange={(e) => setFormData({ ...formData, template_name: e.target.value })}
                    placeholder="Enter template name"
                  />
                  {errors.template_name && (
                    <p className="text-sm text-red-600">{errors.template_name[0]}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="whatsapp_api">WhatsApp API URL</Label>
                <Textarea
                  id="whatsapp_api"
                  value={formData.whatsapp_api}
                  onChange={(e) => setFormData({ ...formData, whatsapp_api: e.target.value })}
                  placeholder="Enter WhatsApp API URL"
                  rows={2}
                />
                {errors.whatsapp_api && (
                  <p className="text-sm text-red-600">{errors.whatsapp_api[0]}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="token">API Token</Label>
                <Textarea
                  id="token"
                  value={formData.token}
                  onChange={(e) => setFormData({ ...formData, token: e.target.value })}
                  placeholder={editingMessage ? "Leave empty to keep existing token" : "Enter API token"}
                  rows={2}
                />
                {errors.token && (
                  <p className="text-sm text-red-600">{errors.token[0]}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone_number_id">Phone Number ID</Label>
                <Input
                  id="phone_number_id"
                  value={formData.phone_number_id}
                  onChange={(e) => setFormData({ ...formData, phone_number_id: e.target.value })}
                  placeholder="Enter phone number ID"
                />
                {errors.phone_number_id && (
                  <p className="text-sm text-red-600">{errors.phone_number_id[0]}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="secret_key">Secret Key</Label>
                <Textarea
                  id="secret_key"
                  value={formData.secret_key}
                  onChange={(e) => setFormData({ ...formData, secret_key: e.target.value })}
                  placeholder={editingMessage ? "Leave empty to keep existing secret" : "Enter secret key"}
                  rows={2}
                />
                {errors.secret_key && (
                  <p className="text-sm text-red-600">{errors.secret_key[0]}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="template_text">Template Text</Label>
                <Textarea
                  id="template_text"
                  value={formData.template_text}
                  onChange={(e) => setFormData({ ...formData, template_text: e.target.value })}
                  placeholder="Enter template text with variables like {{name}}, {{ticket_id}}"
                  rows={4}
                />
                {errors.template_text && (
                  <p className="text-sm text-red-600">{errors.template_text[0]}</p>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="status"
                  checked={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.checked })}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="status">Active</Label>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleCloseModal}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingMessage ? 'Update' : 'Create'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* View Modal */}
        <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Message Setting Details</DialogTitle>
            </DialogHeader>
            {viewingMessage && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm text-gray-600">Message Type</Label>
                    <p className="font-medium capitalize">
                      {viewingMessage.message_type.replace('_', ' ')}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-600">Status</Label>
                    <Badge 
                      style={{
                        backgroundColor: viewingMessage.status ? '#10b981' : '#ef4444',
                        color: 'white',
                        borderColor: viewingMessage.status ? '#10b981' : '#ef4444'
                      }}
                    >
                      {viewingMessage.status ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>

                {viewingMessage.template_name && (
                  <div>
                    <Label className="text-sm text-gray-600">Template Name</Label>
                    <p className="font-medium">{viewingMessage.template_name}</p>
                  </div>
                )}

                {viewingMessage.whatsapp_api && (
                  <div>
                    <Label className="text-sm text-gray-600">WhatsApp API</Label>
                    <div className="flex items-center gap-2">
                      <p className="font-mono text-sm bg-gray-100 p-2 rounded flex-1 break-all">
                        {viewingMessage.whatsapp_api}
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(viewingMessage.whatsapp_api!, 'view_api')}
                      >
                        {copiedField === 'view_api' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                )}

                {viewingMessage.token && (
                  <div>
                    <Label className="text-sm text-gray-600">API Token</Label>
                    <div className="flex items-center gap-2">
                      <p className="font-mono text-sm bg-gray-100 p-2 rounded flex-1 break-all">
                        {viewingMessage.token}
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(viewingMessage.token!, 'view_token')}
                      >
                        {copiedField === 'view_token' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                )}

                {viewingMessage.phone_number_id && (
                  <div>
                    <Label className="text-sm text-gray-600">Phone Number ID</Label>
                    <div className="flex items-center gap-2">
                      <p className="font-mono text-sm bg-gray-100 p-2 rounded flex-1 break-all">
                        {viewingMessage.phone_number_id}
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(viewingMessage.phone_number_id!, 'view_phone_id')}
                      >
                        {copiedField === 'view_phone_id' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                )}

                {viewingMessage.secret_key && (
                  <div>
                    <Label className="text-sm text-gray-600">Secret Key</Label>
                    <div className="flex items-center gap-2">
                      <p className="font-mono text-sm bg-gray-100 p-2 rounded flex-1 break-all">
                        {viewingMessage.secret_key}
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(viewingMessage.secret_key!, 'view_secret')}
                      >
                        {copiedField === 'view_secret' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                )}

                {viewingMessage.template_text && (
                  <div>
                    <Label className="text-sm text-gray-600">Template Text</Label>
                    <div className="bg-gray-100 p-3 rounded">
                      <pre className="whitespace-pre-wrap text-sm">{viewingMessage.template_text}</pre>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 pt-4 border-t" style={{ borderTopColor: '#e4e4e4' }}>
                  <div>
                    <Label className="text-sm text-gray-600">Created At</Label>
                    <p className="text-sm">
                      {new Date(viewingMessage.created_at).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-600">Updated At</Label>
                    <p className="text-sm">
                      {new Date(viewingMessage.updated_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsViewModalOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Modal */}
        <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Message Setting</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this message setting? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDelete}>
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}