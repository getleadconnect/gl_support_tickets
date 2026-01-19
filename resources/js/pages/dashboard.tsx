import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/dashboard-layout';
import BranchAdminDashboard from './branch-admin-dashboard';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line, Area, AreaChart, Tooltip, PieChart, Pie, Cell } from 'recharts';
import {
  Ticket,
  Users,
  Package,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  AlertCircle,
  Activity,
  User,
  FileText,
  MessageSquare,
  ShoppingCart,
  ArrowUp,
  ArrowDown,
  MoreVertical,
  Filter,
  Download,
  RefreshCw,
  ChevronRight,
  Zap,
  Target,
  Award,
  AlertTriangle,
  Timer,
  UserCheck,
  CreditCard,
  IndianRupee,
  Eye,
  BarChart3,
  Settings
} from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ElementType;
  trend?: 'up' | 'down' | 'neutral';
  color?: string;
  subtext?: string;
  onClick?: () => void;
}

function StatsCard({ title, value, change, icon: Icon, trend = 'neutral', color = "primary", subtext, onClick }: StatsCardProps) {
  const bgColor = {
    primary: 'bg-gradient-to-br from-purple-500 to-purple-600',
    success: 'bg-gradient-to-br from-emerald-500 to-emerald-600',
    warning: 'bg-gradient-to-br from-amber-500 to-amber-600',
    danger: 'bg-gradient-to-br from-rose-500 to-rose-600',
    info: 'bg-gradient-to-br from-blue-500 to-blue-600',
  }[color] || 'bg-gradient-to-br from-slate-500 to-slate-600';

  const cardClasses = `relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ${onClick ? 'cursor-pointer' : ''}`;

  return (
    <Card className={cardClasses} onClick={onClick}>
      <div className={`absolute inset-0 ${bgColor} opacity-5`}></div>
      <div className="p-4 sm:p-5">
        <div className="flex items-center gap-3">
          <div className={`p-2 sm:p-2.5 ${bgColor} rounded-xl shadow-lg flex-shrink-0`}>
            <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
          </div>
          <div className="flex-1 flex items-center justify-between">
            <p className="text-sm sm:text-base font-medium text-slate-600">{title}</p>
            <p className="text-xl sm:text-2xl font-bold text-slate-900">{value}</p>
          </div>
        </div>
      </div>
    </Card>
  );
}

interface QuickActionProps {
  icon: React.ElementType;
  label: string;
  onClick: () => void;
  color?: string;
}

function QuickAction({ icon: Icon, label, onClick, color = "primary" }: QuickActionProps) {
  const styles = {
    primary: 'bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200',
    success: 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200',
    warning: 'bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200',
    danger: 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200',
  }[color] || 'bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200';

  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 sm:gap-3 p-3 sm:p-4 ${styles} rounded-xl transition-all duration-200 hover:scale-105 shadow-sm hover:shadow-md w-full`}
    >
      <Icon className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
      <span className="text-xs sm:text-sm font-medium text-left">{label}</span>
    </button>
  );
}

export function Dashboard() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userLoading, setUserLoading] = useState(true);
  const [totalTickets, setTotalTickets] = useState<number>(0);
  const [totalCustomers, setTotalCustomers] = useState<number>(0);
  const [totalProducts, setTotalProducts] = useState<number>(0);
  const [ticketStatusData, setTicketStatusData] = useState<any[]>([]);
  const [monthlyTicketsData, setMonthlyTicketsData] = useState<any[]>([]);
  const [recentTicketsData, setRecentTicketsData] = useState<any[]>([]);
  const [totalOpenTickets, setTotalOpenTickets] = useState<number>(0);
  const [totalInProgress, setTotalInProgress] = useState<number>(0);
  const [totalCompleted, setTotalCompleted] = useState<number>(0);
  const [dueTicketsCount, setDueTicketsCount] = useState<number>(0);
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [performanceData, setPerformanceData] = useState<any[]>([]);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [allTicketsData, setAllTicketsData] = useState<any[]>([]);
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  const [resolutionRate, setResolutionRate] = useState<number>(0);
  const [avgResolutionDays, setAvgResolutionDays] = useState<number>(0);
  const [totalAgents, setTotalAgents] = useState<number>(0);
  const [completionRate, setCompletionRate] = useState<number>(0);
  const [branches, setBranches] = useState<any[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<string>('1');
  const [branchRevenue, setBranchRevenue] = useState<any[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1); // 1-12
  const [selectedRevenueYear, setSelectedRevenueYear] = useState<number>(new Date().getFullYear());
  const [dashboardRevenue, setDashboardRevenue] = useState<any>({ shop_revenue: 0, outsource_revenue: 0, total_revenue: 0 });
  const [topTechnicians, setTopTechnicians] = useState<any>({});

  // Modern color palette
  const CHART_COLORS = ['#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899'];
  const STATUS_COLORS = {
    'Open': '#10b981',
    'In Progress': '#f59e0b', 
    'Closed': '#6b7280',
  };


  // Month names
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  useEffect(() => {
    fetchCurrentUser();
    fetchBranches();
    fetchDashboardData();
    fetchBranchRevenue();
    fetchDashboardRevenue();
    fetchTopTechnicians();
  }, []);

  // Set branch to user's branch for Branch Admin (role_id = 4)
  useEffect(() => {
    if (currentUser && currentUser.role_id === 4 && currentUser.branch_id) {
      setSelectedBranch(currentUser.branch_id.toString());
    }
  }, [currentUser]);

  // Fetch dashboard data when branch changes
  useEffect(() => {
    if (branches.length > 0) {
      fetchDashboardData();
      fetchDashboardRevenue();
      fetchTopTechnicians();
    }
  }, [selectedBranch]);

  // Fetch branch revenue when month or year changes
  useEffect(() => {
    fetchBranchRevenue();
    fetchDashboardRevenue();
    fetchTopTechnicians();
  }, [selectedMonth, selectedRevenueYear]);

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
    } finally {
      setUserLoading(false);
    }
  };

  // Update monthly data when year changes
  useEffect(() => {
    if (allTicketsData.length > 0) {
      const monthlyData = Array(12).fill(0);
      
      allTicketsData.forEach((ticket: any) => {
        const ticketDate = new Date(ticket.created_at);
        if (ticketDate.getFullYear() === selectedYear) {
          const month = ticketDate.getMonth();
          monthlyData[month]++;
        }
      });

      const monthlyChartData = MONTHS.map((month, index) => ({
        month,
        tickets: monthlyData[index]
      }));

      setMonthlyTicketsData(monthlyChartData);
    }
  }, [selectedYear, allTicketsData]);

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d ago`;
    const months = Math.floor(days / 30);
    return `${months}mo ago`;
  };

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch all tickets to get status distribution
      const ticketsResponse = await axios.get('/tickets', {
        params: {
          per_page: 1000,
          branch_id: selectedBranch !== 'all' ? selectedBranch : null
        }
      });
      
      const tickets = ticketsResponse.data.data || [];
      setTotalTickets(ticketsResponse.data.total || 0);
      setAllTicketsData(tickets); // Store all tickets for year filtering
      
      // Extract unique years from tickets
      const years = new Set<number>();
      const currentYear = new Date().getFullYear();
      tickets.forEach((ticket: any) => {
        const year = new Date(ticket.created_at).getFullYear();
        if (!isNaN(year) && year >= 2020 && year <= currentYear + 1) {
          years.add(year);
        }
      });
      // Always include current year and sort in descending order
      years.add(currentYear);
      const sortedYears = Array.from(years).sort((a, b) => b - a);
      setAvailableYears(sortedYears);

      // Count tickets by status and due tickets
      const statusCounts = {
        'Open': 0,
        'In Progress': 0,
        'Closed': 0,
      };

      let dueCount = 0;
      let openTickets = 0;
      const currentDate = new Date();
      currentDate.setHours(0, 0, 0, 0);

      tickets.forEach((ticket: any) => {
        // Count by status
        if (ticket.status === 1 || ticket.ticket_status?.name?.toLowerCase() === 'open') {
          statusCounts['Open']++;
          openTickets++;
        } else if (ticket.status === 2 || ticket.ticket_status?.name?.toLowerCase().includes('progress')) {
          statusCounts['In Progress']++;
        } else if (ticket.status === 3 || ticket.ticket_status?.name?.toLowerCase() === 'closed') {
          statusCounts['Closed']++;
        }

        // Count due tickets
        const ticketDate = new Date(ticket.created_at);
        if (ticketDate < currentDate && ticket.status !== 3) {
          dueCount++;
        }
      });

      setDueTicketsCount(dueCount);
      setTotalOpenTickets(openTickets);
      setTotalInProgress(statusCounts['In Progress']);
      setTotalCompleted(statusCounts['Closed']);

      // Calculate performance metrics
      const closedTickets = statusCounts['Closed'];
      const totalTicketCount = statusCounts['Open'] + statusCounts['In Progress'] + statusCounts['Closed'];
      
      // Resolution Rate: (Closed Tickets / Total Tickets) * 100
      const resRate = totalTicketCount > 0 ? Math.round((closedTickets / totalTicketCount) * 100) : 0;
      setResolutionRate(resRate);
      
      // Calculate average resolution time in days for closed tickets
      let totalDays = 0;
      let closedCount = 0;
      tickets.forEach((ticket: any) => {
        if (ticket.status === 3 && ticket.updated_at) {
          const createdDate = new Date(ticket.created_at);
          const closedDate = new Date(ticket.updated_at);
          const daysDiff = Math.ceil((closedDate.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
          if (daysDiff >= 0 && daysDiff < 365) { // Sanity check
            totalDays += daysDiff;
            closedCount++;
          }
        }
      });
      const avgDays = closedCount > 0 ? (totalDays / closedCount).toFixed(1) : '0';
      setAvgResolutionDays(parseFloat(avgDays));

      // Format data for pie chart
      const chartData = Object.entries(statusCounts).map(([name, value]) => ({
        name,
        value,
        color: STATUS_COLORS[name as keyof typeof STATUS_COLORS]
      }));

      setTicketStatusData(chartData);

      // Process monthly tickets for selected year
      const monthlyData = Array(12).fill(0);
      
      tickets.forEach((ticket: any) => {
        const ticketDate = new Date(ticket.created_at);
        if (ticketDate.getFullYear() === selectedYear) {
          const month = ticketDate.getMonth();
          monthlyData[month]++;
        }
      });

      // Format monthly data for bar chart
      const monthlyChartData = MONTHS.map((month, index) => ({
        month,
        tickets: monthlyData[index]
      }));

      setMonthlyTicketsData(monthlyChartData);

      // Get recent tickets
      const sortedTickets = [...tickets].sort((a: any, b: any) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      const recentFiveTickets = sortedTickets.slice(0, 5);
      setRecentTicketsData(recentFiveTickets);

      // Fetch customers count
      const customersResponse = await axios.get('/customers', {
        params: {
          branch_id: selectedBranch !== 'all' ? selectedBranch : null
        }
      });
      const customersData = customersResponse.data.data || customersResponse.data || [];
      setTotalCustomers(Array.isArray(customersData) ? customersData.length : 0);

      // Fetch products count
      const productsResponse = await axios.get('/products');
      const productsData = productsResponse.data.data || productsResponse.data || [];
      setTotalProducts(Array.isArray(productsData) ? productsData.length : 0);

      // Revenue data removed - no longer fetching monthly revenue

      // Fetch latest activities
      const activitiesResponse = await axios.get('/activities/latest?limit=8');
      if (activitiesResponse.data) {
        setActivities(activitiesResponse.data);
      }
      
      // Fetch agent users (role_id = 2) count
      const agentResponse = await axios.get('/agent-users');
      if (agentResponse.data) {
        const agents = agentResponse.data;
        setTotalAgents(agents.length);
        
        // Calculate completion rate based on assigned vs closed tickets
        let assignedTickets = 0;
        let completedByAgents = 0;
        
        tickets.forEach((ticket: any) => {
          if (ticket.agents && ticket.agents.length > 0) {
            assignedTickets++;
            if (ticket.status === 3) { // Closed
              completedByAgents++;
            }
          }
        });
        
        const compRate = assignedTickets > 0 ? Math.round((completedByAgents / assignedTickets) * 100) : 0;
        setCompletionRate(compRate);
      }

      // Generate mock performance data
      const perfData = MONTHS.slice(0, 6).map((month) => ({
        month,
        resolved: Math.floor(Math.random() * 100) + 50,
        pending: Math.floor(Math.random() * 50) + 20,
        new: Math.floor(Math.random() * 30) + 10,
      }));
      setPerformanceData(perfData);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBranches = async () => {
    try {
      const response = await axios.get('/branches');
      setBranches(response.data || []);
    } catch (error) {
      console.error('Error fetching branches:', error);
    }
  };

  const fetchBranchRevenue = async () => {
    try {
      const response = await axios.get('/branch-monthly-revenue', {
        params: {
          year: selectedRevenueYear,
          month: selectedMonth
        }
      });
      setBranchRevenue(response.data || []);
    } catch (error) {
      console.error('Error fetching branch revenue:', error);
    }
  };

  const fetchDashboardRevenue = async () => {
    try {
      const response = await axios.get('/branch-monthly-revenue', {
        params: {
          year: selectedRevenueYear,
          month: selectedMonth
        }
      });
      const allBranches = response.data || [];

      // If a specific branch is selected, filter to that branch only
      let filteredBranches = allBranches;
      if (selectedBranch !== 'all') {
        filteredBranches = allBranches.filter((b: any) => String(b.id) === selectedBranch);
      }

      // Calculate totals
      const totals = filteredBranches.reduce((acc: any, branch: any) => {
        acc.shop_revenue += parseFloat(branch.shop_revenue || 0);
        acc.outsource_revenue += parseFloat(branch.outsource_revenue || 0);
        acc.total_revenue += parseFloat(branch.total_revenue || 0);
        return acc;
      }, { shop_revenue: 0, outsource_revenue: 0, total_revenue: 0 });

      setDashboardRevenue(totals);
    } catch (error) {
      console.error('Error fetching dashboard revenue:', error);
    }
  };

  const fetchTopTechnicians = async () => {
    try {
      const response = await axios.get('/admin-dashboard/top-technicians', {
        params: {
          branch_id: selectedBranch,
          month: selectedMonth,
          year: selectedRevenueYear
        }
      });
      if (response.data.success) {
        setTopTechnicians(response.data.data || {});
      }
    } catch (error) {
      console.error('Error fetching top technicians:', error);
      setTopTechnicians({});
    }
  };

  const handleRefresh = () => {
    fetchDashboardData();
    fetchBranchRevenue();
    fetchDashboardRevenue();
    fetchTopTechnicians();
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-slate-200">
          <p className="text-sm font-semibold text-slate-700">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Show loading state while fetching user
  if (userLoading) {
    return (
      <DashboardLayout title="Dashboard">
        <div className="flex items-center justify-center h-screen">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      </DashboardLayout>
    );
  }

  // Show Branch Admin Dashboard for role_id=4
  if (currentUser && currentUser.role_id === 4) {
    return (
      <DashboardLayout title="Branch Admin Dashboard">
        <BranchAdminDashboard />
      </DashboardLayout>
    );
  }

  // Show regular dashboard for other roles
  return (
    <DashboardLayout title="">
      <div className="space-y-4 sm:space-y-6 p-2 sm:p-4 lg:p-6 bg-gradient-to-br from-slate-50 via-white to-purple-50 min-h-screen">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3 sm:gap-4">
          <div className="w-full lg:w-auto">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 mb-1 sm:mb-2">
              Dashboard Overview
            </h1>
            {selectedBranch !== 'all' && (
              <p className="text-sm sm:text-base font-medium mt-1" style={{ color: '#4f46e5' }}>
                {branches.find(b => String(b.id) === selectedBranch)?.branch_name}
              </p>
            )}
            <p className="text-xs sm:text-sm lg:text-base text-slate-600 mt-1">Welcome back! Here's what's happening with your tickets today.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
            <Select value={selectedBranch} onValueChange={setSelectedBranch}>
              <SelectTrigger className="h-8 sm:h-9 w-full sm:w-36 lg:w-44 text-xs sm:text-sm border-slate-300">
                <SelectValue placeholder="All Branches" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Branches</SelectItem>
                {branches.map((branch) => (
                  <SelectItem key={branch.id} value={String(branch.id)}>
                    {branch.branch_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              className="border-slate-300 hover:border-slate-400 text-xs sm:text-sm w-full sm:w-auto"
            >
              <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span>Refresh</span>
            </Button>
          </div>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3 lg:gap-4">
          <StatsCard
            title="Tickets"
            value={totalTickets}
            change={8.2}
            trend="up"
            icon={Ticket}
            color="primary"
            subtext="All time"
            onClick={() => navigate('/tickets')}
          />
          <StatsCard
            title="Customers"
            value={totalCustomers.toLocaleString()}
            change={5.4}
            trend="up"
            icon={Users}
            color="info"
            subtext="Registered users"
            onClick={() => navigate('/customers')}
          />
          <StatsCard
            title="Open"
            value={totalOpenTickets}
            change={totalOpenTickets > 0 ? 10.5 : 0}
            trend={totalOpenTickets > 10 ? "up" : "neutral"}
            icon={AlertCircle}
            color="success"
            subtext="Active tickets"
            onClick={() => navigate('/tickets?status=1')}
          />
          <StatsCard
            title="In Progress"
            value={totalInProgress}
            change={totalInProgress > 0 ? 8.5 : 0}
            trend={totalInProgress > 5 ? "up" : "neutral"}
            icon={Clock}
            color="warning"
            subtext="Being worked on"
            onClick={() => navigate('/tickets?status=2')}
          />
          <StatsCard
            title="Completed"
            value={totalCompleted}
            change={totalCompleted > 0 ? 12.3 : 0}
            trend="up"
            icon={CheckCircle}
            color="success"
            subtext="Closed tickets"
            onClick={() => navigate('/closed-tickets')}
          />
          <StatsCard
            title="Overdue"
            value={dueTicketsCount}
            change={dueTicketsCount > 0 ? 15.3 : 0}
            trend={dueTicketsCount > 0 ? "down" : "neutral"}
            icon={AlertTriangle}
            color="danger"
            subtext="Need action"
            onClick={() => navigate('/overdue-tickets')}
          />
        </div>

        {/* Quick Actions */}
       {/*} <Card className="p-3 sm:p-4 lg:p-6 border-0 shadow-lg bg-white/80 backdrop-blur">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h2 className="text-base sm:text-lg lg:text-xl font-semibold text-slate-900">Quick Actions</h2>
            <Zap className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-3 lg:gap-4">
            <QuickAction icon={Ticket} label="New Ticket" onClick={() => navigate('/tickets')} color="primary" />
            <QuickAction icon={UserCheck} label="Add Customer" onClick={() => navigate('/customers')} color="success" />
            <QuickAction icon={Package} label="Add Product" onClick={() => navigate('/products')} color="warning" />
            <QuickAction icon={FileText} label="Reports" onClick={() => navigate('/reports')} color="primary" />
            <QuickAction icon={CreditCard} label="Invoice" onClick={() => navigate('/invoices')} color="success" />
            <QuickAction icon={Settings} label="Settings" onClick={() => navigate('/settings')} color="danger" />
          </div>
        </Card>*/}

        {/* Top 3 Technicians Widget - Branch-wise (Side by Side Cards) */}
        <Card className="p-3 sm:p-4 lg:p-6 border-0 shadow-lg bg-white">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4 mb-4">
            <h3 className="text-base sm:text-lg font-semibold text-slate-900">
              Top 3 Technicians in <span style={{fontWeight:'800'}}>{branches.find(b => b.id.toString() === selectedBranch)?.branch_name || 'Branch'}</span>
            </h3>

            {/* Filter Controls - Branch and Month Selection */}
            <div className="flex items-center gap-3">
              {/* Branch Dropdown - Hide for Branch Admin (role_id = 4) */}
              {currentUser?.role_id !== 4 && (
              <Select value={selectedBranch} onValueChange={setSelectedBranch}>
                <SelectTrigger className="w-[180px] h-9">
                  <SelectValue placeholder="Branch Name" />
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

              {/* Month Dropdown */}
              <Select value={selectedMonth.toString()} onValueChange={(value) => setSelectedMonth(parseInt(value))}>
                <SelectTrigger className="w-[120px] h-9">
                  <SelectValue placeholder="Month" />
                </SelectTrigger>
                <SelectContent>
                  {MONTHS.map((month, index) => (
                    <SelectItem key={index + 1} value={(index + 1).toString()}>
                      {month}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Year Dropdown */}
              <Select value={selectedRevenueYear.toString()} onValueChange={(value) => setSelectedRevenueYear(parseInt(value))}>
                <SelectTrigger className="w-[100px] h-9">
                  <SelectValue placeholder="Year" />
                </SelectTrigger>
                <SelectContent>
                  {[2024, 2025, 2026].map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center" style={{height:'115px'}}>
              <div className="animate-pulse text-slate-400">Loading...</div>
            </div>
          ) : Object.keys(topTechnicians).length === 0 ? (
            <div className="flex items-center justify-center " style={{height:'115px'}}>
              <p className="text-slate-500">No data available for the selected filters</p>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(topTechnicians).map(([branchName, technicians]: [string, any]) => (
                <div key={branchName}>
                  
                  {/* Three Cards Side by Side */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {technicians.map((tech: any, index: number) => {
                      const rankIcons = ['🥇', '🥈', '🥉'];
                      const rankColors = ['text-yellow-600', 'text-gray-400', 'text-orange-600'];
                      const borderColors = ['border-yellow-200', 'border-gray-200', 'border-orange-200'];
                      const bgColors = ['bg-yellow-50', 'bg-gray-50', 'bg-orange-50'];

                      return (
                        <div
                          key={tech.id}
                          className={`border-2 ${borderColors[index]} ${bgColors[index]} rounded-lg p-4 hover:shadow-md transition-shadow`}
                        >
                          {/* Rank Badge , and name & email*/}
                          <div className="flex justify-between items-start gap-4">
                            {/* Left Side - Name and Email */}

                            <div className="flex items-center gap-2 mb-3">
                            <span className="text-2xl">{rankIcons[index]}</span>
                            <span className={`text-lg font-bold ${rankColors[index]}`}>Rank #{index + 1}</span>
                          </div>

                            {/* Right Side - Revenue and Tickets */}
                            <div className="text-right">
                               <div className="flex-1">
                              <h5 className="text-base font-semibold text-gray-900">{tech.name}</h5>
                              <p className="text-xs text-gray-500">{tech.email}</p>
                            </div>

                            </div>
                          </div>

                          {/* Name/Email on Left, Revenue/Tickets on Right */}
                          <div className="flex justify-between items-start gap-4">
                            {/* Left Side - Name and Email */}
                            <div className="flex-1">
                              <div className="text-lg font-bold text-green-600 pt-2">
                                ₹{tech.total_revenue.toLocaleString('en-IN')}
                              </div>
                            </div>

                            {/* Right Side - Revenue and Tickets */}
                            <div className="text-right">
                              <div className="text-sm text-gray-600 pt-3">
                                <span className="font-semibold text-gray-900">{tech.tickets_count}</span> Tickets
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Charts Section - Three Column Layout with equal spacing */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
          {/* Column 1: Ticket Status Distribution - Pie Chart */}
          <Card className="p-3 sm:p-4 lg:p-6 border-0 shadow-lg bg-white/80 backdrop-blur overflow-hidden">
            <div className="flex items-center justify-between mb-3 sm:mb-4 lg:mb-6">
              <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-slate-900">Ticket Status</h3>
            </div>
            {loading ? (
              <div className="flex items-center justify-center h-48 sm:h-56 lg:h-64">
                <div className="animate-pulse text-slate-400">Loading...</div>
              </div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie
                      data={ticketStatusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={70}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {ticketStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-3 sm:mt-4 space-y-1.5 sm:space-y-2">
                  {ticketStatusData.map((item) => (
                    <div key={item.name} className="flex items-center justify-between text-xs sm:text-sm">
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                        <span className="text-slate-600">{item.name}</span>
                      </div>
                      <span className="font-semibold text-slate-900">{item.value}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </Card>

          {/* Column 2: Monthly Tickets - Bar Chart */}
          <Card className="p-3 sm:p-4 lg:p-6 border-0 shadow-lg bg-white/80 backdrop-blur overflow-hidden">
            <div className="flex items-center justify-between mb-3 sm:mb-4 lg:mb-6">
              <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-slate-900">Monthly Tickets</h3>
              <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
            </div>
            {loading ? (
              <div className="flex items-center justify-center h-48 sm:h-56 lg:h-64">
                <div className="animate-pulse text-slate-400">Loading...</div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={monthlyTicketsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="month" stroke="#64748b" fontSize={10} />
                  <YAxis stroke="#64748b" fontSize={10} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="tickets" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </Card>

          {/* Column 3: Ticket Trend Analysis - Line Chart */}
          <Card className="p-3 sm:p-4 lg:p-6 border-0 shadow-lg bg-white/80 backdrop-blur overflow-hidden">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4 mb-3 sm:mb-4 lg:mb-6">
              <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-slate-900">Ticket Trend Analysis</h3>
              <div className="flex items-center gap-2">
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="px-2 py-1 text-xs sm:text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-purple-500 bg-white cursor-pointer hover:border-purple-400 transition-colors"
                >
                  {availableYears.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
            </div>
            <div style={{ width: '100%', overflowX: 'hidden' }}>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={monthlyTicketsData} margin={{ left: -10, right: 10, top: 5, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="month" stroke="#64748b" fontSize={10} />
                  <YAxis stroke="#64748b" fontSize={10} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="tickets"
                    stroke="#8b5cf6"
                    strokeWidth={2}
                    dot={{ fill: '#8b5cf6', r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Performance Metrics */}
        <Card className="p-3 sm:p-4 lg:p-6 border-0 shadow-lg bg-white/80 backdrop-blur">
          <div className="flex items-center justify-between mb-3 sm:mb-4 lg:mb-6">
            <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-slate-900">Performance Overview</h3>
            <Target className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 lg:gap-6">
            <div className="text-center p-2 sm:p-3 lg:p-4 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg sm:rounded-xl">
              <div className="inline-flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-emerald-500 text-white rounded-lg sm:rounded-xl mb-1 sm:mb-2 lg:mb-3">
                <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6" />
              </div>
              <p className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-900">{resolutionRate}%</p>
              <p className="text-xs sm:text-sm text-slate-600">Resolution Rate</p>
              <p className="text-xs text-emerald-600 mt-0.5 sm:mt-1">Closed tickets</p>
            </div>
            <div className="text-center p-2 sm:p-3 lg:p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg sm:rounded-xl">
              <div className="inline-flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-blue-500 text-white rounded-lg sm:rounded-xl mb-1 sm:mb-2 lg:mb-3">
                <Timer className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6" />
              </div>
              <p className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-900">
                {avgResolutionDays > 0 ? `${avgResolutionDays}d` : 'N/A'}
              </p>
              <p className="text-xs sm:text-sm text-slate-600">Avg Resolution</p>
              <p className="text-xs text-blue-600 mt-0.5 sm:mt-1">Days to close</p>
            </div>
            <div className="text-center p-2 sm:p-3 lg:p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg sm:rounded-xl">
              <div className="inline-flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-purple-500 text-white rounded-lg sm:rounded-xl mb-1 sm:mb-2 lg:mb-3">
                <Award className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6" />
              </div>
              <p className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-900">{completionRate}%</p>
              <p className="text-xs sm:text-sm text-slate-600">Completion Rate</p>
              <p className="text-xs text-purple-600 mt-0.5 sm:mt-1">By agents</p>
            </div>
            <div className="text-center p-2 sm:p-3 lg:p-4 bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg sm:rounded-xl">
              <div className="inline-flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-amber-500 text-white rounded-lg sm:rounded-xl mb-1 sm:mb-2 lg:mb-3">
                <Users className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6" />
              </div>
              <p className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-900">{totalAgents}</p>
              <p className="text-xs sm:text-sm text-slate-600">Total Agents</p>
              <p className="text-xs text-amber-600 mt-0.5 sm:mt-1">Support team</p>
            </div>
          </div>
        </Card>

        {/* Recent Tickets and Activity Feed - Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Left Column - Revenue and Recent Tickets */}
          <div className="space-y-4 sm:space-y-6">
            {/* Revenue Card */}
            <Card className="p-3 sm:p-4 lg:p-6 border-0 shadow-lg bg-white/80 backdrop-blur">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4 mb-3 sm:mb-4">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-slate-900">Monthly Revenue</h3>
                  {selectedBranch !== 'all' && (
                    <span className="text-xs sm:text-sm font-medium px-2 py-1 rounded-md" style={{ color: '#4f46e5'}}>
                     - {branches.find(b => String(b.id) === selectedBranch)?.branch_name}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <Select value={String(selectedMonth)} onValueChange={(value) => setSelectedMonth(Number(value))}>
                    <SelectTrigger className="h-8 w-full sm:w-28 text-xs border-slate-300">
                      <SelectValue placeholder="Select Month" />
                    </SelectTrigger>
                    <SelectContent>
                      {MONTHS.map((month, index) => (
                        <SelectItem key={index + 1} value={String(index + 1)}>
                          {month}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
                <div className="text-center p-2.5 sm:p-3 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200">
                  <p className="text-xs text-slate-600 mb-1">Shop</p>
                  <p className="text-xs sm:text-sm lg:text-base font-bold text-green-700 break-all">
                    ₹{parseFloat(dashboardRevenue.shop_revenue || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="text-center p-2.5 sm:p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                  <p className="text-xs text-slate-600 mb-1">Outsource</p>
                  <p className="text-xs sm:text-sm lg:text-base font-bold text-blue-700 break-all">
                    ₹{parseFloat(dashboardRevenue.outsource_revenue || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="text-center p-2.5 sm:p-3 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200">
                  <p className="text-xs text-slate-600 mb-1">Total</p>
                  <p className="text-xs sm:text-sm lg:text-base font-bold text-purple-700 break-all">
                    ₹{parseFloat(dashboardRevenue.total_revenue || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            </Card>

            {/* Recent Tickets Card */}
            <Card className="p-3 sm:p-4 lg:p-6 border-0 shadow-lg bg-white/80 backdrop-blur">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4 mb-3 sm:mb-4 lg:mb-6">
              <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-slate-900">Recent Tickets</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.location.href = '/tickets'}
                className="text-purple-600 hover:text-purple-700 text-xs sm:text-sm"
              >
                View All
                <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 ml-1" />
              </Button>
            </div>
              {loading ? (
                <div className="space-y-2 sm:space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-14 sm:h-16 bg-slate-200 rounded-lg"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {recentTicketsData.map((ticket: any) => (
                    <div key={ticket.id} className="p-2 sm:p-3 lg:p-4 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5 sm:gap-2 mb-1">
                            <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1">
                              <span className="text-xs sm:text-sm font-semibold text-slate-900 whitespace-nowrap">#{ticket.id}</span>
                              <span className="text-xs sm:text-sm text-slate-700 truncate">{ticket.issue}</span>
                            </div>
                            <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                              <span className={`px-1.5 sm:px-2 py-0.5 text-xs font-medium rounded-full ${
                                ticket.status === 1 ? 'bg-emerald-100 text-emerald-700' :
                                ticket.status === 2 ? 'bg-amber-100 text-amber-700' :
                                'bg-slate-100 text-slate-700'
                              }`}>
                                {ticket.status === 1 ? 'Open' : ticket.status === 2 ? 'In Progress' : 'Closed'}
                              </span>
                              <span className={`px-1.5 sm:px-2 py-0.5 text-xs font-medium rounded-full ${
                                ticket.priority === 3 ? 'bg-rose-100 text-rose-700' :
                                ticket.priority === 2 ? 'bg-amber-100 text-amber-700' :
                                'bg-blue-100 text-blue-700'
                              }`}>
                                {ticket.priority === 3 ? 'High' : ticket.priority === 2 ? 'Medium' : 'Low'}
                              </span>
                            </div>
                          </div>
                          <p className="text-xs text-slate-500">
                            {ticket.customer?.name || 'Unknown'} • {getTimeAgo(ticket.created_at)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

          {/* Activity Feed Card */}
          <Card className="p-3 sm:p-4 lg:p-6 border-0 shadow-lg bg-white/80 backdrop-blur">
            <div className="flex items-center justify-between mb-3 sm:mb-4 lg:mb-6">
              <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-slate-900">Activity Feed</h3>
              <Activity className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
            </div>
              {loading ? (
                <div className="space-y-2 sm:space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-10 sm:h-12 bg-slate-200 rounded-lg"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {activities.slice(0, 8).map((activity: any) => (
                    <div key={activity.id} className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 hover:bg-slate-50 rounded-lg transition-colors">
                      <div className={`p-1.5 sm:p-2 rounded-lg flex-shrink-0 ${
                        activity.type?.includes('ticket') ? 'bg-purple-100' :
                        activity.type?.includes('comment') ? 'bg-blue-100' :
                        activity.type?.includes('status') ? 'bg-emerald-100' :
                        'bg-slate-100'
                      }`}>
                        {activity.type?.includes('ticket') ? <Ticket className="h-3 w-3 sm:h-4 sm:w-4 text-purple-600" /> :
                         activity.type?.includes('comment') ? <MessageSquare className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" /> :
                         activity.type?.includes('status') ? <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-emerald-600" /> :
                         <Activity className="h-3 w-3 sm:h-4 sm:w-4 text-slate-600" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm text-slate-700 break-words">{activity.message}</p>
                        <p className="text-xs text-slate-500 mt-0.5 sm:mt-1">{activity.time_ago}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}