import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Dashboard } from '@/pages/dashboard';
import { Navigate } from 'react-router-dom';

// Import AgentDashboard directly
const AgentDashboard = React.lazy(() => import('@/pages/agent-dashboard'));

export function DashboardRouter() {
  const { user, loading } = useAuth();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-purple-50">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 mb-4">
            <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
          </div>
          <p className="text-lg text-slate-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Debug logging
  console.log('=== Dashboard Router Debug ===');
  console.log('Current user:', user);
  console.log('User role_id:', user.role_id);
  console.log('User role_id type:', typeof user.role_id);

  // Check if user is an agent (role_id = 2)
  const isAgent = user.role_id === 2 || user.role_id === '2' || parseInt(String(user.role_id)) === 2;
  
  console.log('Is user an agent?', isAgent);

  // Render Agent Dashboard for agents (role_id = 2)
  if (isAgent) {
    console.log('>>> RENDERING AGENT DASHBOARD <<<');
    return (
      <React.Suspense fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mb-4"></div>
            <p className="text-slate-600">Loading Agent Dashboard...</p>
          </div>
        </div>
      }>
        <AgentDashboard />
      </React.Suspense>
    );
  }

  // Render regular Dashboard for all other roles
  console.log('>>> RENDERING REGULAR DASHBOARD <<<');
  console.log('User role is:', user.role_id, '(not agent, showing regular dashboard)');
  return <Dashboard />;
}

export default DashboardRouter;