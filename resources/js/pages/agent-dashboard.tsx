import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/dashboard-layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Ticket, 
  Clock,
  CheckCircle,
  AlertCircle,
  Timer,
  FileText,
  Users,
  Plus,
  Eye,
  Calendar,
  TrendingUp,
  ArrowRight,
  BarChart3,
  AlertTriangle
} from 'lucide-react';
import toast from 'react-hot-toast';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  color?: string;
  subtext?: string;
  onClick?: () => void;
}

function StatsCard({ title, value, icon: Icon, color = "primary", subtext, onClick }: StatsCardProps) {
  const bgColor = {
    primary: 'bg-gradient-to-br from-purple-500 to-purple-600',
    success: 'bg-gradient-to-br from-emerald-500 to-emerald-600',
    warning: 'bg-gradient-to-br from-amber-500 to-amber-600',
    danger: 'bg-gradient-to-br from-rose-500 to-rose-600',
    info: 'bg-gradient-to-br from-blue-500 to-blue-600',
  }[color] || 'bg-gradient-to-br from-slate-500 to-slate-600';

  const cardClasses = `relative overflow-hidden border border-[#e4e4e4] shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ${onClick ? 'cursor-pointer' : ''}`;

  return (
    <Card className={cardClasses} onClick={onClick}>
      <div className={`absolute inset-0 ${bgColor} opacity-5`}></div>
      <div className="p-3 sm:p-4 lg:p-5">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className={`p-1.5 sm:p-2 lg:p-2.5 ${bgColor} rounded-xl shadow-lg flex-shrink-0`}>
            <Icon className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-white" />
          </div>
          <div className="flex-1 flex items-center justify-between">
            <p className="text-xs sm:text-sm lg:text-base font-medium text-slate-600">{title}</p>
            <p className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-900">{value}</p>
          </div>
        </div>
      </div>
    </Card>
  );
}

interface QuickLinkProps {
  icon: React.ElementType;
  label: string;
  description: string;
  onClick: () => void;
  color?: string;
}

function QuickLink({ icon: Icon, label, description, onClick, color = "primary" }: QuickLinkProps) {
  const styles = {
    primary: 'bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-200',
    success: 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 hover:bg-amber-100 text-amber-700 border-amber-200',
    danger: 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200',
    info: 'bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200',
  }[color] || 'bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-200';

  return (
    <button
      onClick={onClick}
      className={`w-full p-2 sm:p-3 lg:p-4 ${styles} border rounded-xl transition-all duration-200 hover:scale-105 shadow-sm hover:shadow-md text-left group`}
    >
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="p-1 sm:p-1.5 lg:p-2 bg-white rounded-lg shadow-sm flex-shrink-0">
          <Icon className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-xs sm:text-sm lg:text-base truncate">{label}</h3>
        </div>
        <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
      </div>
    </button>
  );
}

export function AgentDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalAssigned: 0,
    openTickets: 0,
    inProgressTickets: 0,
    completedToday: 0,
    dueToday: 0,
    overdue: 0
  });
  const [recentTickets, setRecentTickets] = useState<any[]>([]);

  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      try {
        await Promise.all([fetchAgentStats(), fetchRecentTickets()]);
      } finally {
        setLoading(false);
      }
    };
    loadDashboardData();
  }, []);

  const fetchAgentStats = async () => {
    try {
      const token = localStorage.getItem('auth_token');

      // Use fetch API with full URL (this is what works)
      const response = await fetch('http://localhost:8000/api/agent-dashboard-stats', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        }
      });

      if (!response.ok) {
        // If 404 or empty data, just set default stats without error
        if (response.status === 404 || response.status === 500) {
          const defaultStats = {
            totalAssigned: 0,
            openTickets: 0,
            inProgressTickets: 0,
            completedToday: 0,
            dueToday: 0,
            overdue: 0
          };
          setStats(defaultStats);
          return defaultStats;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data) {
        const newStats = {
          totalAssigned: data.totalAssigned || 0,
          openTickets: data.openTickets || 0,
          inProgressTickets: data.inProgressTickets || 0,
          completedToday: data.completedToday || 0,
          dueToday: data.dueToday || 0,
          overdue: data.overdue || 0
        };
        setStats(newStats);
        return newStats;
      }
    } catch (error: any) {
      console.error('Error fetching agent stats:', error);
      // Set default stats instead of showing error toast
      const defaultStats = {
        totalAssigned: 0,
        openTickets: 0,
        inProgressTickets: 0,
        completedToday: 0,
        dueToday: 0,
        overdue: 0
      };
      setStats(defaultStats);
      return defaultStats;
    }
  };

  const fetchRecentTickets = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const params = new URLSearchParams({
        per_page: '5',
        sort_by: 'created_at',
        sort_order: 'desc',
        assigned_to_me: 'true'
      });

      const response = await fetch(`http://localhost:8000/api/tickets?${params}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        }
      });

      if (!response.ok) {
        // If 404 or empty data, just set empty array without error
        if (response.status === 404 || response.status === 500) {
          setRecentTickets([]);
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setRecentTickets(data.data || []);
    } catch (error: any) {
      console.error('Error fetching recent tickets:', error);
      // Set empty array instead of showing error toast
      setRecentTickets([]);
    }
  };

  const getStatusBadge = (status: number) => {
    const statusConfig = {
      1: { label: 'Open', className: 'bg-emerald-100 text-emerald-700' },
      2: { label: 'In Progress', className: 'bg-amber-100 text-amber-700' },
      3: { label: 'Closed', className: 'bg-slate-100 text-slate-700' }
    };
    const config = statusConfig[status] || { label: 'Unknown', className: 'bg-gray-100 text-gray-700' };
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.className}`}>
        {config.label}
      </span>
    );
  };

  const getPriorityBadge = (priority: number) => {
    const priorityConfig = {
      1: { label: 'Low', className: 'bg-blue-100 text-blue-700' },
      2: { label: 'Medium', className: 'bg-yellow-100 text-yellow-700' },
      3: { label: 'High', className: 'bg-orange-100 text-orange-700' },
      4: { label: 'Urgent', className: 'bg-red-100 text-red-700' }
    };
    const config = priorityConfig[priority] || { label: 'Normal', className: 'bg-gray-100 text-gray-700' };
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.className}`}>
        {config.label}
      </span>
    );
  };

  if (loading) {
    return (
      <DashboardLayout title="Agent Dashboard">
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Agent Dashboard">
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-white rounded-xl p-3 sm:p-4 lg:p-6 shadow-lg border border-[#e4e4e4]">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
            <div className="flex-1">
              <h1 className="font-bold mb-1 sm:mb-2 text-gray-800 text-lg sm:text-xl lg:text-[22px]">🎯 AGENT DASHBOARD</h1>
              <p className="text-gray-600 text-sm sm:text-base lg:text-[16px]">Welcome back, Agent! Here's your ticket overview for today</p>
            </div>
            <Button 
              onClick={async () => {
                setLoading(true);
                try {
                  await Promise.all([fetchAgentStats(), fetchRecentTickets()]);
                  toast.success('Dashboard refreshed successfully');
                } finally {
                  setLoading(false);
                }
              }}
              size="sm"
              className="bg-purple-600 hover:bg-purple-700 w-full sm:w-auto"
            >
              Refresh
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          <StatsCard
            title="Total Assigned"
            value={stats.totalAssigned}
            icon={Ticket}
            color="primary"
            onClick={() => navigate('/tickets')}
          />
          <StatsCard
            title="Open Tickets"
            value={stats.openTickets}
            icon={AlertCircle}
            color="success"
            onClick={() => navigate('/tickets?status=1')}
          />
          <StatsCard
            title="In Progress"
            value={stats.inProgressTickets}
            icon={Clock}
            color="warning"
            onClick={() => navigate('/tickets?status=2')}
          />
          <StatsCard
            title="Completed Today"
            value={stats.completedToday} 
            icon={CheckCircle}
            color="info"
            onClick={() => navigate('/closed-tickets')}
          />
          <StatsCard
            title="Overdue"
            value={stats.overdue}
            icon={AlertTriangle}
            color="danger"
            onClick={() => navigate('/overdue-tickets')}
          />
        </div>

        {/* Quick Links Section */}
        <Card className="p-4 sm:p-6 border border-[#e4e4e4]">
          <h2 className="text-base sm:text-lg font-semibold mb-4 flex items-center gap-2">
            <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3 lg:gap-4">
            <QuickLink
              icon={Eye}
              label="View My Tickets"
              description="See all tickets assigned to you"
              onClick={() => navigate('/tickets')}
              color="primary"
            />
            <QuickLink
              icon={Clock}
              label="In Progress Tickets"
              description="Continue working on active tickets"
              onClick={() => navigate('/tickets?status=2')}
              color="warning"
            />
            <QuickLink
              icon={AlertCircle}
              label="Open Tickets"
              description="Start working on new tickets"
              onClick={() => navigate('/tickets?status=1')}
              color="success"
            />
            <QuickLink
              icon={Calendar}
              label="Due Today"
              description="Tickets with today's deadline"
              onClick={() => navigate('/tickets?due=today')}
              color="danger"
            />
            <QuickLink
              icon={CheckCircle}
              label="Recently Closed"
              description="View completed tickets"
              onClick={() => navigate('/closed-tickets')}
              color="info"
            />
          </div>
        </Card>

        {/* Recent Tickets Table */}
        <Card className="p-4 sm:p-6 border border-[#e4e4e4]">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4">
            <h2 className="text-base sm:text-lg font-semibold flex items-center gap-2">
              <Ticket className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
              <span className="hidden sm:inline">Recent Tickets Assigned to You</span>
              <span className="sm:hidden">Recent Tickets</span>
            </h2>
            <Button
              onClick={() => navigate('/tickets')}
              size="sm"
              className="bg-purple-600 hover:bg-purple-700 w-full sm:w-auto"
            >
              View All
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
          
          {recentTickets.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#e4e4e4]">
                    <th className="text-left py-2 px-2 text-xs sm:text-sm font-medium text-slate-600">Ticket #</th>
                    <th className="text-left py-2 px-2 text-xs sm:text-sm font-medium text-slate-600 hidden sm:table-cell">Customer</th>
                    <th className="text-left py-2 px-2 text-xs sm:text-sm font-medium text-slate-600">Issue</th>
                    <th className="text-left py-2 px-2 text-xs sm:text-sm font-medium text-slate-600">Status</th>
                    <th className="text-left py-2 px-2 text-xs sm:text-sm font-medium text-slate-600 hidden md:table-cell">Priority</th>
                    <th className="text-left py-2 px-2 text-xs sm:text-sm font-medium text-slate-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {recentTickets.map((ticket) => (
                    <tr key={ticket.id} className="border-b border-[#e4e4e4] hover:bg-slate-50">
                      <td className="py-2 sm:py-3 px-1 sm:px-2 text-xs sm:text-sm font-medium text-purple-600">
                        {ticket.tracking_number}
                      </td>
                      <td className="py-2 sm:py-3 px-1 sm:px-2 text-xs sm:text-sm hidden sm:table-cell">
                        {ticket.customer?.name || 'N/A'}
                      </td>
                      <td className="py-2 sm:py-3 px-1 sm:px-2 text-xs sm:text-sm max-w-[100px] sm:max-w-xs truncate">
                        {ticket.issue}
                      </td>
                      <td className="py-2 sm:py-3 px-1 sm:px-2">
                        {getStatusBadge(ticket.status)}
                      </td>
                      <td className="py-2 sm:py-3 px-1 sm:px-2 hidden md:table-cell">
                        {getPriorityBadge(ticket.priority)}
                      </td>
                      <td className="py-2 sm:py-3 px-1 sm:px-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => navigate(`/tickets?id=${ticket.id}`)}
                          className="text-purple-600 hover:text-purple-700 p-1 sm:p-2"
                        >
                          <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500">
              <Ticket className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No tickets assigned to you yet</p>
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}

export default AgentDashboard;