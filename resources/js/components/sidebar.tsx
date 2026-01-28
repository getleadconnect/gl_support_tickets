import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import axios from 'axios';
import {
  LayoutDashboard,
  Ticket,
  Users,
  Package,
  FileText,
  Settings,
  BarChart3,
  ShoppingCart,
  Building2,
  User,
  ChevronDown,
  ChevronRight,
  XCircle,
  CheckCircle,
  Trash2,
  CreditCard,
  Sparkles,
  MessageCircle,
  HelpCircle,
  Calendar,
  ListTodo,
  Search,
  FileText as Template,
  Plus,
  Eye,
  List,
  Calculator,
  AlertCircle,
  Clock
} from 'lucide-react';

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

interface NavItem {
  title: string;
  href?: string;
  icon: React.ElementType;
  badge?: string;
  children?: {
    title: string;
    href: string;
    icon?: React.ElementType;
  }[];
}

const navigationItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/',
    icon: LayoutDashboard,
  },
  {
    title: 'Tickets',
    icon: Ticket,
    children: [
      {
        title: 'Tickets',
        href: '/tickets',
        icon: Ticket,
      },
      {
        title: 'Verify Tickets',
        href: '/verify-tickets',
        icon: CheckCircle,
      },
      {
        title: 'Closed Tickets',
        href: '/closed-tickets',
        icon: CheckCircle,
      },
      {
        title: 'Overdue Tickets',
        href: '/overdue-tickets',
        icon: Clock,
      },
      {
        title: 'Deleted Tickets',
        href: '/deleted-tickets',
        icon: Trash2,
      },
      {
        title: 'Tracking Ticket',
        href: '/tracking-ticket',
        icon: Search,
      },
    ],
  },
  {
    title: 'Customers',
    href: '/customers',
    icon: Users,
  },
  {
    title: 'Scheduled Pickups',
    href: '/scheduled-pickups',
    icon: Calendar,
  },
  {
    title: 'Tasks',
    href: '/tasks',
    icon: ListTodo,
  },
  {
    title: 'Products',
    href: '/product-list',
    icon: Package,
  },
  {
    title: 'Estimates',
    href: '/estimates',
    icon: Calculator,
  },

  {
    title: 'Invoices',
    href: '/invoices',
    icon: FileText,
  },
  {
    title: 'Payments',
    icon: CreditCard,
    children: [
      {
        title: 'Payments List',
        href: '/payments',
        icon: CreditCard,
      },
      {
        title: 'Payment Dues',
        href: '/payment-dues',
        icon: AlertCircle,
      },
      {
        title: 'Payment History',
        href: '/payment-history',
        icon: List,
      },
    ],
  },
  {
    title: 'Reports',
    icon: BarChart3,
    children: [
      {
        title: 'Tickets Report',
        href: '/tickets-report',
        icon: Ticket,
      },
      {
        title: 'GST Report',
        href: '/gst-report',
        icon: FileText,
      },
      {
        title: 'General Report',
        href: '/reports',
        icon: FileText,
      },
      {
        title: 'Monthly Revenue',
        href: '/monthly-revenue-report',
        icon: CreditCard,
      },
      {
        title: 'Staff Tickets',
        href: '/staff-tickets-report',
        icon: Users,
      },
      {
        title: 'Staff Monthly Split-ups',
        href: '/staff-monthly-splitups',
        icon: Calendar,
      },
    ],
  },
  {
    title: 'General Options',
    href: '/general-options',
    icon: Settings,
  },
  {
    title: 'Settings',
    href: '/settings',
    icon: Settings,
  },
  {
    title: 'Help & Support',
    href: '/help-support',
    icon: HelpCircle,
  },
];

export function Sidebar({ className, ...props }: SidebarProps) {
  const location = useLocation();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [activeLogo, setActiveLogo] = useState<any>(null);

  // Auto-expand Tickets menu if any ticket-related page is active
  const ticketsMenuPaths = ['/tickets', '/verify-tickets', '/closed-tickets', '/overdue-tickets', '/deleted-tickets', '/tracking-ticket'];
  const isTicketsActive = ticketsMenuPaths.includes(location.pathname);

  // Auto-expand Reports menu if any report-related page is active
  const reportsMenuPaths = ['/reports', '/monthly-revenue-report', '/staff-tickets-report', '/staff-monthly-splitups'];
  const isReportsActive = reportsMenuPaths.includes(location.pathname);

  // Auto-expand Payments menu if any payment-related page is active
  const paymentsMenuPaths = ['/payments', '/payment-dues', '/payment-history'];
  const isPaymentsActive = paymentsMenuPaths.includes(location.pathname);

  const [expandedItems, setExpandedItems] = useState<string[]>([
    ...(isTicketsActive ? ['Tickets'] : []),
    ...(isReportsActive ? ['Reports'] : []),
    ...(isPaymentsActive ? ['Payments'] : [])
  ]);
  
  const toggleExpanded = (title: string) => {
    setExpandedItems(prev => 
      prev.includes(title) 
        ? prev.filter(item => item !== title)
        : [...prev, title]
    );
  };
  
  // Fetch current user and company info on component mount
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await fetch('/api/user', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          setCurrentUser(data.user);
        }
      } catch (err) {
        console.error('Error fetching current user:', err);
      }
    };

    const fetchActiveLogo = async () => {
      try {
        const response = await axios.get('/company-logo/active');
        
        if (response.data && response.data.success && response.data.logo) {
          setActiveLogo(response.data.logo);
        }
      } catch (err) {
        console.error('Error fetching active logo:', err);
      }
    };

    fetchCurrentUser();
    fetchActiveLogo();
  }, []);
  
  // Auto-expand Tickets menu when navigating to ticket-related pages
  useEffect(() => {
    const ticketPaths = ['/tickets', '/verify-tickets', '/closed-tickets', '/overdue-tickets', '/deleted-tickets', '/tracking-ticket'];
    const reportPaths = ['/reports', '/monthly-revenue-report', '/staff-tickets-report', '/staff-monthly-splitups'];
    const paymentPaths = ['/payments', '/payment-dues', '/payment-history'];

    if (ticketPaths.includes(location.pathname)) {
      if (!expandedItems.includes('Tickets')) {
        setExpandedItems(prev => [...prev, 'Tickets']);
      }
    }

    if (reportPaths.includes(location.pathname)) {
      if (!expandedItems.includes('Reports')) {
        setExpandedItems(prev => [...prev, 'Reports']);
      }
    }

    if (paymentPaths.includes(location.pathname)) {
      if (!expandedItems.includes('Payments')) {
        setExpandedItems(prev => [...prev, 'Payments']);
      }
    }
  }, [location.pathname]);
  
  return (
    <div className={cn("h-full bg-gradient-to-b from-white to-slate-50", className)} {...props}>
      <div className="flex flex-col h-full">
        {/* Logo Section */}
        <div className="px-2 py-2 border-b border-slate-200" style={{height:'65px'}}>
          <div className="flex flex-col items-center justify-center gap-2">
            {activeLogo && activeLogo.logo_image ? (
              <div className="flex flex-col items-center gap-2" style={{height:'48px'}}>
                <img
                  src={`/${activeLogo.logo_image}`}
                  alt={activeLogo.name || 'Company Logo'}
                  className="w-auto object-contain"
                  style={{ maxWidth: '105px' }}
                />
                {/*<p className="text-xs text-slate-600 text-center font-medium">Ticket Management System</p>*/}
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2" style={{height:'110px'}}>
                {/*<p className="text-xs text-slate-600 text-center font-medium">Ticket Management System</p>*/}
              </div>
            )}
          </div>
        </div>

        {/* Navigation Section */}
        <div className="flex-1 overflow-y-auto px-3 py-4">
          <nav className="space-y-1">
            {navigationItems.filter((item) => {
              // For agents (role_id = 2), only show Dashboard, Tickets, and Tasks
              if (currentUser && currentUser.role_id === 2) {
                return item.title === 'Dashboard' || item.title === 'Tickets' || item.title === 'Tasks';
              }
              // Hide Settings menu for role_id=3 (Manager)
              if (item.title === 'Settings' && currentUser && currentUser.role_id === 3) {
                return false;
              }
              return true;
            }).map((item) => {
              const Icon = item.icon;
              const hasChildren = item.children && item.children.length > 0;
              const isExpanded = expandedItems.includes(item.title);
              const isActive = item.href ? (location.pathname === item.href ||
                (item.href === '/product-list' && location.pathname === '/products')) : false;
              const isChildActive = hasChildren && item.children.some(child =>
                location.pathname === child.href
              );

              // Add separator line above Help & Support
              const showSeparator = item.title === 'Help & Support';
              
              if (hasChildren) {
                return (
                  <div key={item.title} className="space-y-1">
                    {showSeparator && <div className="border-t border-gray-200 my-2"></div>}
                    <button
                      onClick={() => toggleExpanded(item.title)}
                      className={cn(
                        "w-full group flex items-center rounded-xl px-3 py-1.5 text-sm font-medium transition-all duration-200",
                        isChildActive 
                          ? "bg-purple-100 text-purple-900 shadow-sm" 
                          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                      )}
                    >
                      <div className={cn(
                        "p-1.5 rounded-lg mr-3 transition-all duration-200",
                        isChildActive 
                          ? "bg-purple-200 text-purple-700" 
                          : "bg-slate-100 text-slate-600 group-hover:bg-slate-200 group-hover:text-slate-700"
                      )}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <span className="flex-1 text-left">{item.title}</span>
                      {item.badge && (
                        <span className="mr-2 px-2 py-1 text-xs rounded-full bg-red-100 text-red-600 font-semibold">
                          {item.badge}
                        </span>
                      )}
                      <div className={cn(
                        "transition-transform duration-200",
                        isExpanded ? "rotate-180" : ""
                      )}>
                        <ChevronDown className="h-4 w-4 text-slate-400" />
                      </div>
                    </button>
                    
                    {/* Submenu with smooth animation */}
                    <div className={cn(
                      "overflow-hidden transition-all duration-300 ease-in-out",
                      isExpanded ? "max-h-96" : "max-h-0"
                    )}>
                      <div className="ml-4 pl-3 border-l-2 border-slate-200 space-y-1 py-1">
                        {item.children.filter((child) => {
                          // Show "Verify Tickets" only for Admin (role_id=1) and Branch Admin (role_id=4)
                          if (child.title === 'Verify Tickets' && currentUser &&
                              currentUser.role_id !== 1 && currentUser.role_id !== 4) {
                            return false;
                          }
                          return true;
                        }).map((child) => {
                          const ChildIcon = child.icon || Ticket;
                          const isChildItemActive = location.pathname === child.href;

                          // Render Tracking Ticket as external link in new tab
                          if (child.title === 'Tracking Ticket') {
                            return (
                              <a
                                key={child.href}
                                href={child.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={cn(
                                  "group flex items-center rounded-lg px-3 py-2 text-sm transition-all duration-200",
                                  "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                                )}
                              >
                                <ChildIcon className={cn(
                                  "mr-3 h-3.5 w-3.5 transition-transform duration-200 group-hover:scale-110",
                                  "text-slate-500"
                                )} />
                                <span className="font-medium">{child.title}</span>
                              </a>
                            );
                          }

                          return (
                            <Link
                              key={child.href}
                              to={child.href}
                              className={cn(
                                "group flex items-center rounded-lg px-3 py-2 text-sm transition-all duration-200",
                                isChildItemActive
                                  ? "bg-purple-100 text-purple-900 shadow-sm"
                                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                              )}
                            >
                              <ChildIcon className={cn(
                                "mr-3 h-3.5 w-3.5 transition-transform duration-200 group-hover:scale-110",
                                isChildItemActive ? "text-purple-700" : "text-slate-500"
                              )} />
                              <span className="font-medium">{child.title}</span>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              }
              
              return (
                <div key={item.href}>
                  {showSeparator && <div className="border-t border-gray-200 my-2"></div>}
                  <Link
                    to={item.href || '/'}
                    className={cn(
                    "group flex items-center rounded-xl px-3 py-1.5 text-sm font-medium transition-all duration-200",
                    isActive 
                      ? "bg-purple-100 text-purple-900 shadow-sm" 
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  )}
                >
                  <div className={cn(
                    "p-1.5 rounded-lg mr-3 transition-all duration-200",
                    isActive 
                      ? "bg-purple-200 text-purple-700" 
                      : "bg-slate-100 text-slate-600 group-hover:bg-slate-200 group-hover:text-slate-700 group-hover:scale-110"
                  )}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className="flex-1">{item.title}</span>
                  {item.badge && (
                    <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-600 font-semibold">
                      {item.badge}
                    </span>
                  )}
                  </Link>
                </div>
              );
            })}
          </nav>
        </div>

        {/* Footer Section */}
        <div className="p-4 border-t border-slate-200">
          <div className="px-3 py-2 bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <p className="text-xs text-slate-600">System Online</p>
            </div>
            <p className="text-xs text-slate-500 mt-1">Version 2.0.1</p>
          </div>
        </div>
      </div>
    </div>
  );
}