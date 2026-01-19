import React, { useState, useEffect } from 'react';
import { Bell, Menu, User, LogOut, Clock, Plus, Ticket, Users, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';
import { UserProfileModal } from './UserProfileModal';
import { AddTicketModal } from './AddTicketModal';
import { AddCustomerModal } from './AddCustomerModal';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { formatDistanceToNow } from 'date-fns';

interface TopbarProps {
  title: string;
  onMenuClick?: () => void;
}

interface Notification {
  id: number;
  type: string;
  data: string;
  read_at: string | null;
  created_at: string;
}

export function Topbar({ title, onMenuClick }: TopbarProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [addTicketModalOpen, setAddTicketModalOpen] = useState(false);
  const [addCustomerModalOpen, setAddCustomerModalOpen] = useState(false);
  
  useEffect(() => {
    fetchNotifications();
    // Fetch notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await axios.get('/notifications');
      setNotifications(response.data.notifications || []);
      setUnreadCount(response.data.unread_count || 0);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  const markAsRead = async (notificationId: number) => {
    try {
      await axios.put(`/notifications/${notificationId}/mark-as-read`);
      fetchNotifications();
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await axios.put('/notifications/mark-all-as-read');
      fetchNotifications();
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    try {
      // Call the notification click handler endpoint
      const response = await axios.post(`/notifications/${notification.id}/click`);
      
      if (response.data.ticket) {
        // Navigate to tickets page (the specific ticket will be highlighted there)
        navigate('/tickets', { 
          state: { 
            highlightTicket: response.data.ticket.tracking_number,
            ticketId: response.data.ticket.id 
          }
        });
      } else {
        // Fallback to general tickets page
        navigate('/tickets');
      }
      
      // Refresh notifications to update the list
      fetchNotifications();
      setNotificationsOpen(false);
      
    } catch (error) {
      console.error('Failed to handle notification click:', error);
      // Fallback - just mark as read and navigate
      markAsRead(notification.id);
      navigate('/tickets');
      setNotificationsOpen(false);
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
    <div className="bg-background border-b border-gray-200">
      <div className="flex h-16 items-center px-6">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={onMenuClick}
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
        
        <div className="flex items-center space-x-4 ml-4 md:ml-0">
          <h1 className="text-lg font-semibold">{title}</h1>
        </div>

        <div className="ml-auto flex items-center space-x-4">
          {/* Add Dropdown - Hide for agent users (role_id==2) */}
          {user?.role_id !== 2 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center gap-1">
                  <Plus className="h-4 w-4" />
                  <span>Add</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-48" align="end">
                <DropdownMenuItem
                  onClick={() => navigate('/tickets')}
                  className="cursor-pointer hover:bg-purple-50 hover:text-purple-700 transition-colors"
                >
                  <Ticket className="mr-2 h-4 w-4" />
                  Tickets
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => navigate('/customers')}
                  className="cursor-pointer hover:bg-purple-50 hover:text-purple-700 transition-colors"
                >
                  <Users className="mr-2 h-4 w-4" />
                  Customers
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => navigate('/products')}
                  className="cursor-pointer hover:bg-purple-50 hover:text-purple-700 transition-colors"
                >
                  <Package className="mr-2 h-4 w-4" />
                  Products
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Notifications */}
          <DropdownMenu open={notificationsOpen} onOpenChange={setNotificationsOpen}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-xs text-white flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
                <span className="sr-only">Notifications</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-80 border-[#e4e4e4]" align="end">
              <DropdownMenuLabel className="flex items-center justify-between">
                <span>Notifications</span>
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs hover:text-purple-600"
                    onClick={(e) => {
                      e.preventDefault();
                      markAllAsRead();
                    }}
                  >
                    Mark all as read
                  </Button>
                )}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {notifications.length === 0 ? (
                <div className="px-4 py-8 text-center text-sm text-gray-500">
                  No unread notifications
                </div>
              ) : (
                <div className="max-h-[400px] overflow-y-auto">
                  {notifications.map((notification) => (
                    <DropdownMenuItem
                      key={notification.id}
                      className="px-4 py-3 cursor-pointer hover:bg-gray-50 bg-purple-50 border-b border-[#e4e4e4] last:border-b-0"
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex items-start gap-3 w-full">
                        <div className="mt-1 p-1 rounded-full bg-purple-100">
                          <Bell className="h-3 w-3 text-purple-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">
                            {(() => {
                              try {
                                const data = JSON.parse(notification.data);
                                return data.message || notification.data;
                              } catch {
                                return notification.data;
                              }
                            })()}
                          </p>
                          <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                    </DropdownMenuItem>
                  ))}
                </div>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-auto px-2 py-1 rounded-full hover:bg-gray-100">
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-purple-100 text-purple-700 font-semibold">
                      {user ? getInitials(user.name) : 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden md:block text-sm font-medium text-gray-700">
                    {user?.name}
                  </span>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user?.name}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email}
                  </p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {user?.role || 'User'}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => setProfileModalOpen(true)}
                className="cursor-pointer hover:bg-purple-50 hover:text-purple-700 transition-colors"
              >
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => logout()}
                className="cursor-pointer hover:bg-red-50 hover:text-red-600 transition-colors"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      {/* User Profile Modal */}
      <UserProfileModal 
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        userId={user?.id}
      />
      
      {/* Add Ticket Modal */}
      <AddTicketModal
        isOpen={addTicketModalOpen}
        onClose={() => setAddTicketModalOpen(false)}
        onSuccess={() => {
          setAddTicketModalOpen(false);
          // Optionally refresh or navigate to tickets page
          navigate('/tickets');
        }}
      />
      
      {/* Add Customer Modal */}
      <AddCustomerModal
        isOpen={addCustomerModalOpen}
        onClose={() => setAddCustomerModalOpen(false)}
        onSuccess={() => {
          setAddCustomerModalOpen(false);
          // Optionally refresh or navigate to customers page
        }}
      />
    </div>
  );
}