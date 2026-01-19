import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Ticket, 
  Users, 
  FileText, 
  Plus,
  TrendingUp,
  Clock,
  AlertCircle,
  CheckCircle,
  Package
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';

interface DashboardStats {
  totalTickets: number;
  overdueTickets: number;
  openTickets: number;
  closedTickets: number;
  monthlyData: Array<{
    month: string;
    tickets: number;
    trend: number;
  }>;
}

export default function BranchAdminDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalTickets: 0,
    overdueTickets: 0,
    openTickets: 0,
    closedTickets: 0,
    monthlyData: []
  });
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    fetchCurrentUser();
    fetchDashboardStats();
  }, []);

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

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/branch-dashboard-stats', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  // Generate sample data for charts (replace with actual API data)
  const monthlyData = stats.monthlyData.length > 0 ? stats.monthlyData : [
    { month: 'Jan', tickets: 45, trend: 42 },
    { month: 'Feb', tickets: 52, trend: 48 },
    { month: 'Mar', tickets: 48, trend: 50 },
    { month: 'Apr', tickets: 61, trend: 55 },
    { month: 'May', tickets: 55, trend: 58 },
    { month: 'Jun', tickets: 67, trend: 62 },
    { month: 'Jul', tickets: 72, trend: 68 },
    { month: 'Aug', tickets: 65, trend: 70 },
    { month: 'Sep', tickets: 78, trend: 72 },
    { month: 'Oct', tickets: 82, trend: 75 },
    { month: 'Nov', tickets: 75, trend: 78 },
    { month: 'Dec', tickets: 88, trend: 80 },
  ];

  const quickActions = [
    {
      title: 'Add Ticket',
      icon: Ticket,
      color: 'bg-blue-50 hover:bg-blue-100 text-blue-700',
      iconColor: 'text-blue-500',
      onClick: () => navigate('/tickets?action=new')
    },
    {
      title: 'Add Customer',
      icon: Users,
      color: 'bg-green-50 hover:bg-green-100 text-green-700',
      iconColor: 'text-green-500',
      onClick: () => navigate('/customers?action=new')
    },
    {
      title: 'Products',
      icon: Package,
      color: 'bg-orange-50 hover:bg-orange-100 text-orange-700',
      iconColor: 'text-orange-500',
      onClick: () => navigate('/products')
    },
    {
      title: 'Add Invoice',
      icon: FileText,
      color: 'bg-purple-50 hover:bg-purple-100 text-purple-700',
      iconColor: 'text-purple-500',
      onClick: () => navigate('/invoices?action=new')
    }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {currentUser?.name || 'Branch Admin'}!
        </h1>
        <p className="text-gray-600 mt-1">
          Branch: {currentUser?.branch?.branch_name || 'Loading...'}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card
          className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-blue-100 cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
          onClick={() => navigate('/tickets')}
        >
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-blue-600 mt-1 mb-2" style={{fontSize:'16px'}}>Total Tickets</p>
                <p className="text-3xl font-bold text-blue-900">
                  {loading ? '...' : stats.totalTickets}
                </p>
              </div>
              <div className="p-3 bg-blue-200 rounded-full">
                <Ticket className="h-6 w-6 text-blue-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          className="border-0 shadow-sm bg-gradient-to-br from-red-50 to-orange-100 cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
          onClick={() => navigate('/overdue-tickets')}
        >
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-red-600 mt-1 mb-2" style={{fontSize:'16px'}}>Overdue Tickets</p>
                <p className="text-3xl font-bold text-red-900">
                  {loading ? '...' : stats.overdueTickets}
                </p>
              </div>
              <div className="p-3 bg-red-200 rounded-full">
                <AlertCircle className="h-6 w-6 text-red-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          className="border-0 shadow-sm bg-gradient-to-br from-green-50 to-emerald-100 cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
          onClick={() => navigate('/tickets')}
        >
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-green-600 mt-1 mb-2" style={{fontSize:'16px'}}>Open Tickets</p>
                <p className="text-3xl font-bold text-green-900">
                  {loading ? '...' : stats.openTickets}
                </p>
              </div>
              <div className="p-3 bg-green-200 rounded-full">
                <CheckCircle className="h-6 w-6 text-green-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          className="border-0 shadow-sm bg-gradient-to-br from-purple-50 to-purple-100 cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
          onClick={() => navigate('/closed-tickets')}
        >
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-purple-600 mt-1 mb-2" style={{fontSize:'16px'}}>Delivered tickets</p>
                <p className="text-3xl font-bold text-purple-900">
                  {loading ? '...' : stats.closedTickets}
                </p>
              </div>
              <div className="p-3 bg-purple-200 rounded-full">
                <CheckCircle className="h-6 w-6 text-purple-700" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <Button
                  key={index}
                  onClick={action.onClick}
                  className={`h-auto py-4 px-6 justify-start ${action.color} border-0 shadow-sm`}
                  variant="outline"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 bg-white rounded-lg ${action.iconColor}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold">{action.title}</p>
                      <p className="text-xs opacity-70">Click to {action.title.toLowerCase()}</p>
                    </div>
                  </div>
                  <Plus className="h-4 w-4 ml-auto opacity-50" />
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Tickets Bar Chart */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Monthly Tickets</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="month" 
                  tick={{ fontSize: 12 }}
                  stroke="#888"
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  stroke="#888"
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white',
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px'
                  }}
                />
                <Bar 
                  dataKey="tickets" 
                  fill="#93c5fd"
                  radius={[8, 8, 0, 0]}
                  name="Tickets"
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Trend Analysis Line Chart */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Trend Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={monthlyData}>
                <defs>
                  <linearGradient id="colorTrend" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a78bfa" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#a78bfa" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="month" 
                  tick={{ fontSize: 12 }}
                  stroke="#888"
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  stroke="#888"
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white',
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="trend"
                  stroke="#a78bfa"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorTrend)"
                  name="Trend"
                />
                <Line 
                  type="monotone" 
                  dataKey="tickets" 
                  stroke="#60a5fa" 
                  strokeWidth={2}
                  dot={{ fill: '#60a5fa', r: 4 }}
                  name="Actual"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}