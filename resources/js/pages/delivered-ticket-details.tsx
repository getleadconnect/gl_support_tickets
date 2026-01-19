import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  ArrowLeft,
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  Building,
  Tag,
  Package,
  MessageSquare,
  Paperclip,
  FileText,
  CheckCircle
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

interface Ticket {
  id: number;
  tracking_number: string;
  issue: string;
  description: string | null;
  status: number;
  priority: number;
  due_date: string | null;
  closed_time: string | null;
  closed_at: string | null;
  created_at: string;
  updated_at: string;
  customer: {
    id: number;
    name: string;
    email?: string;
    mobile?: string;
    country_code?: string;
  };
  user?: {
    id: number;
    name: string;
  };
  ticketStatus?: {
    id: number;
    status: string;
    color_code?: string;
  };
  ticketPriority?: {
    id: number;
    title: string;
    color?: string;
  };
  branch?: {
    id: number;
    branch_name: string;
  };
  agent?: Array<{
    id: number;
    name: string;
  }>;
  notify_to?: Array<{
    id: number;
    name: string;
  }>;
  ticket_label?: Array<{
    id: number;
    label_name: string;
    color: string;
  }>;
  accessories?: Array<{
    id: number;
    name: string;
  }>;
  activity?: Array<{
    id: number;
    type: string;
    note: string;
    created_at: string;
    user: {
      id: number;
      name: string;
    };
  }>;
}

interface LogNote {
  id: number;
  description: string;
  created_at: string;
  user?: {
    id: number;
    name: string;
  };
}

interface Task {
  id: number;
  task_name: string;
  description?: string;
  status?: string;
  created_at: string;
  user?: {
    id: number;
    name: string;
  };
  assigned_agents?: Array<{
    id: number;
    name: string;
  }>;
}

interface Attachment {
  id: number;
  name: string;
  file_path: string;
  file_size?: number;
  created_at: string;
}

interface CustomerNote {
  id: number;
  note: string;
  created_at: string;
  updated_at: string;
  user?: {
    id: number;
    name: string;
  };
}

interface SparePart {
  id: number;
  quantity: number;
  price: number;
  total_price: number;
  product?: {
    id: number;
    name: string;
    cost?: number;
  };
}

export default function DeliveredTicketDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [logNotes, setLogNotes] = useState<LogNote[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [spareParts, setSpareParts] = useState<SparePart[]>([]);
  const [customerNotes, setCustomerNotes] = useState<CustomerNote[]>([]);

  useEffect(() => {
    if (id) {
      fetchTicketDetails();
      fetchLogNotes();
      fetchTasks();
      fetchAttachments();
      fetchSpareParts();
      fetchCustomerNotes();
    }
  }, [id]);

  const fetchTicketDetails = async () => {
    try {
      const response = await axios.get(`/tickets/${id}`);
      setTicket(response.data);
    } catch (error) {
      console.error('Error fetching ticket details:', error);
      toast.error('Failed to load ticket details');
      navigate('/closed-tickets');
    } finally {
      setLoading(false);
    }
  };

  const fetchLogNotes = async () => {
    try {
      const response = await axios.get(`/tickets/${id}/log-notes`);
      const notes = Array.isArray(response.data) ? response.data : (response.data?.data || []);
      setLogNotes(notes);
    } catch (error) {
      console.error('Error fetching log notes:', error);
    }
  };

  const fetchTasks = async () => {
    try {
      const response = await axios.get(`/tickets/${id}/tasks`);
      const tasksList = Array.isArray(response.data) ? response.data : (response.data?.data || []);
      setTasks(tasksList);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  const fetchAttachments = async () => {
    try {
      const response = await axios.get(`/tickets/${id}/attachments`);
      const attachmentsList = Array.isArray(response.data) ? response.data : (response.data?.data || []);
      setAttachments(attachmentsList);
    } catch (error) {
      console.error('Error fetching attachments:', error);
    }
  };

  const fetchSpareParts = async () => {
    try {
      const response = await axios.get(`/tickets/${id}/spare-parts`);
      const sparePartsList = Array.isArray(response.data) ? response.data : (response.data?.data || []);
      setSpareParts(sparePartsList);
    } catch (error) {
      console.error('Error fetching spare parts:', error);
    }
  };

  const fetchCustomerNotes = async () => {
    try {
      const response = await axios.get(`/tickets/${id}/customer-notes`);
      const customerNotesList = Array.isArray(response.data) ? response.data : (response.data?.data || []);
      setCustomerNotes(customerNotesList);
    } catch (error) {
      console.error('Error fetching customer notes:', error);
    }
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <DashboardLayout title="Delivered Ticket Details">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading ticket details...</div>
        </div>
      </DashboardLayout>
    );
  }

  if (!ticket) {
    return (
      <DashboardLayout title="Delivered Ticket Details">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Ticket not found</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Delivered Ticket Details">
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white px-4 sm:px-6 py-4" style={{ borderBottom: '1px solid #c4c4c4' }}>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl sm:text-2xl font-semibold">
                Ticket #{ticket.id}
              </h1>
              <p className="text-gray-600">{ticket.issue}</p>
            </div>
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={() => navigate('/closed-tickets')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Tickets
              </Button>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Ticket Information (30%) */}
            <div className="lg:col-span-1">
              <Card style={{ border: '1px solid #e4e4e4' }}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Ticket Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Customer Info */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Customer Details</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-500" />
                        <span>{ticket.customer?.name || 'N/A'}</span>
                      </div>
                      {ticket.customer?.email && (
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-gray-500" />
                          <span>{ticket.customer.email}</span>
                        </div>
                      )}
                      {ticket.customer?.mobile && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-gray-500" />
                          <span>{ticket.customer.country_code} {ticket.customer.mobile}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Ticket Details */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Ticket Details</h4>
                    <div className="space-y-2 text-sm">

                      <div className="flex justify-between">
                        <span className="text-gray-500">Tracking Id:</span>
                          <Badge variant="secondary" style={{color:'#4343a5',fontWeight:'600'}}>
                          {ticket.tracking_number}
                        </Badge>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-gray-500">Status:</span>
                          <Badge variant="secondary" className="bg-green-100 text-green-800">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Delivered
                        </Badge>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-gray-500">Branch:</span>
                        <span className="font-medium" style={{paddingRight:'10px'}}>{ticket.branch?.branch_name || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Created:</span>
                        <span className="font-medium" style={{paddingRight:'10px'}}>{formatDateTime(ticket.created_at)}</span>
                      </div>
                      {(ticket.closed_at || ticket.closed_time) && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">Delivered:</span>
                          <span className="font-medium" style={{paddingRight:'10px'}}>{formatDateTime(ticket.closed_at || ticket.closed_time)}</span>
                        </div>
                      )}

                    </div>
                  </div>

                  {/* Assigned Agents */}
                  {ticket.agent && ticket.agent.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Assigned Agents</h4>
                      <div className="flex flex-wrap gap-2">
                        {ticket.agent.map((agent) => (
                          <Badge key={agent.id} variant="outline">
                            {agent.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Ticket Labels */}
                  {ticket.ticket_label && ticket.ticket_label.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Labels</h4>
                      <div className="flex flex-wrap gap-2">
                        {ticket.ticket_label.map((label) => (
                          <Badge
                            key={label.id}
                            style={{ backgroundColor: label.color || '#5a4b81', color: '#5c6f84' }}
                          >
                            <Tag className="h-3 w-3 mr-1" />
                            {label.label_name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Accessories */}
                  {ticket.accessories && ticket.accessories.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Accessories</h4>
                      <div className="flex flex-wrap gap-2">
                        {ticket.accessories.map((accessory) => (
                          <Badge key={accessory.id} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                            <Package className="h-3 w-3 mr-1" />
                            {accessory.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Description */}
                  {ticket.description && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Description</h4>
                      <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
                        {ticket.description}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Tabs Content (70%) */}
            <div className="lg:col-span-2">
              <Tabs defaultValue="activity" className="w-full">
                <TabsList className="w-auto flex justify-start">
                  <TabsTrigger value="activity" style={{ width: '120px' }}>Activity</TabsTrigger>
                  <TabsTrigger value="notes" style={{ width: '120px' }}>Notes</TabsTrigger>
                  <TabsTrigger value="customer-notes" style={{ width: '120px' }}>Customer Notes</TabsTrigger>
                  <TabsTrigger value="tasks" style={{ width: '120px' }}>Tasks</TabsTrigger>
                  <TabsTrigger value="attachments" style={{ width: '120px' }}>Files</TabsTrigger>
                  <TabsTrigger value="spare-parts" style={{ width: '120px' }}>Spare Parts</TabsTrigger>
                </TabsList>

                {/* Activity Tab */}
                <TabsContent value="activity">
                  <Card style={{ height: '650px', overflow: 'auto', border: '1px solid #e4e4e4' }}>
                    <CardHeader>
                      <CardTitle style={{ fontSize: '20px', marginTop: '10px' }}>Activity Timeline</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {ticket.activity && ticket.activity.length > 0 ? (
                        <div className="space-y-4">
                          {ticket.activity.map((activity) => (
                            <div key={activity.id} className="flex gap-3 p-3 rounded-lg bg-gray-50">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback>
                                  {activity.user?.name?.charAt(0) || 'U'}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <span className="font-medium text-sm">
                                    {activity.user?.name || 'System'}
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    {formatDateTime(activity.created_at)}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-600 mt-1">
                                  <strong>{activity.type}:</strong> {activity.note}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-center py-8">No activity found</p>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Notes Tab */}
                <TabsContent value="notes">
                  <Card style={{ height: '650px', overflow: 'auto', border: '1px solid #e4e4e4' }}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2" style={{ fontSize: '20px', marginTop: '10px' }}>
                        <MessageSquare className="h-5 w-5" />
                        Log Notes
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {logNotes.length > 0 ? (
                        <div className="space-y-4">
                          {logNotes.map((note) => (
                            <div key={note.id} className="p-3 rounded-lg bg-gray-50">
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-medium text-sm">
                                  {note.user?.name || 'System'}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {formatDateTime(note.created_at)}
                                </span>
                              </div>
                              <p className="text-sm text-gray-700">{note.description}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-center py-8">No notes found</p>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Customer Notes Tab */}
                <TabsContent value="customer-notes">
                  <Card style={{ height: '650px', overflow: 'auto', border: '1px solid #e4e4e4' }}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2" style={{ fontSize: '20px', marginTop: '10px' }}>
                        <User className="h-5 w-5" />
                        Notes For Customer
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {customerNotes.length > 0 ? (
                        <div className="space-y-4">
                          {customerNotes.map((note) => (
                            <div key={note.id} className="p-3 rounded-lg bg-gray-50">
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-medium text-sm">
                                  {note.user?.name || 'System'}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {formatDateTime(note.created_at)}
                                </span>
                              </div>
                              <p className="text-sm text-gray-700 whitespace-pre-wrap">{note.note}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-center py-8">No customer notes found</p>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Tasks Tab */}
                <TabsContent value="tasks">
                  <Card style={{ height: '650px', overflow: 'auto', border: '1px solid #e4e4e4' }}>
                    <CardHeader>
                      <CardTitle style={{ fontSize: '20px', marginTop: '10px' }}>Related Tasks</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {tasks.length > 0 ? (
                        <div className="space-y-4">
                          {tasks.map((task) => (
                            <div key={task.id} className="p-3 rounded-lg border">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="font-medium">{task.task_name}</h4>
                                <Badge variant="outline">{task.status || 'N/A'}</Badge>
                              </div>
                              {task.description && (
                                <p className="text-sm text-gray-600 mb-2">{task.description}</p>
                              )}
                              {task.assigned_agents && task.assigned_agents.length > 0 && (
                                <div className="flex flex-wrap gap-1 mb-2">
                                  {task.assigned_agents.map((agent) => (
                                    <Badge key={agent.id} variant="secondary" className="text-xs">
                                      {agent.name}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                              <p className="text-xs text-gray-500">
                                Created: {formatDateTime(task.created_at)} by {task.user?.name || 'System'}
                              </p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-center py-8">No tasks found</p>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Attachments Tab */}
                <TabsContent value="attachments">
                  <Card style={{ height: '650px', overflow: 'auto', border: '1px solid #e4e4e4' }}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2" style={{ fontSize: '20px', marginTop: '10px' }}>
                        <Paperclip className="h-5 w-5" />
                        Attachments
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {attachments.length > 0 ? (
                        <div className="space-y-3">
                          {attachments.map((attachment) => (
                            <div key={attachment.id} className="flex items-center gap-3 p-3 rounded-lg border">
                              <FileText className="h-8 w-8 text-gray-500" />
                              <div className="flex-1">
                                <p className="font-medium text-sm">{attachment.name}</p>
                                <div className="flex items-center gap-4 text-xs text-gray-500">
                                  <span>{attachment.file_size ? formatFileSize(attachment.file_size) : 'Unknown size'}</span>
                                  <span>{formatDateTime(attachment.created_at)}</span>
                                </div>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => window.open(attachment.file_path, '_blank')}
                              >
                                Download
                              </Button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-center py-8">No attachments found</p>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Spare Parts Tab */}
                <TabsContent value="spare-parts">
                  <Card style={{ height: '650px', overflow: 'auto', border: '1px solid #e4e4e4' }}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2" style={{ fontSize: '20px', marginTop: '10px' }}>
                        <Package className="h-5 w-5" />
                        Spare Parts
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {spareParts.length > 0 ? (
                        <div className="space-y-3">
                          {spareParts.map((part) => (
                            <div key={part.id} className="flex items-center justify-between p-3 rounded-lg border">
                              <div>
                                <p className="font-medium">{part.product?.name || 'Unknown Product'}</p>
                                <p className="text-sm text-gray-600">
                                  Quantity: {part.quantity} × ₹{part.price}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="font-semibold">₹{part.total_price}</p>
                              </div>
                            </div>
                          ))}
                          <div className="border-t pt-3">
                            <div className="flex justify-between font-semibold">
                              <span>Total:</span>
                              <span>₹{spareParts.reduce((sum, part) => sum + part.total_price, 0)}</span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <p className="text-gray-500 text-center py-8">No spare parts found</p>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}