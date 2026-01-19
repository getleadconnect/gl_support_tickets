import './bootstrap';
import React, { lazy, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Toaster } from 'react-hot-toast';

// Eager load only critical components
import { Login } from './pages/login';
import { Register } from './pages/register';
import PublicTrackingTicket from './pages/public-tracking-ticket';

// Lazy load all other pages
const DashboardRouter = lazy(() => import('./components/DashboardRouter'));
const Tickets = lazy(() => import('./pages/tickets'));
const VerifyTickets = lazy(() => import('./pages/verify-tickets'));
const ClosedTickets = lazy(() => import('./pages/closed-tickets'));
const OverdueTickets = lazy(() => import('./pages/overdue-tickets'));
const DeletedTickets = lazy(() => import('./pages/deleted-tickets'));
const DeliveredTicketDetails = lazy(() => import('./pages/delivered-ticket-details'));
const Customers = lazy(() => import('./pages/customers'));
const CustomerDetails = lazy(() => import('./pages/customer-details'));
const Tasks = lazy(() => import('./pages/tasks'));
const GeneralOptions = lazy(() => import('./pages/general-options'));
const Settings = lazy(() => import('./pages/settings'));
const HelpSupport = lazy(() => import('./pages/help-support'));
const Products = lazy(() => import('./pages/products'));
const Invoices = lazy(() => import('./pages/invoices'));
const Payments = lazy(() => import('./pages/payments'));
const PaymentDues = lazy(() => import('./pages/payment-dues'));
const PaymentHistory = lazy(() => import('./pages/payment-history'));
const Reports = lazy(() => import('./pages/reports'));
const ReportPreview = lazy(() => import('./pages/report-preview'));
const StaffTicketsReport = lazy(() => import('./pages/staff-tickets-report'));
const StaffMonthlySplitups = lazy(() => import('./pages/staff-monthly-splitups'));
const MonthlyRevenueReport = lazy(() => import('./pages/monthly-revenue-report'));
const ScheduledPickups = lazy(() => import('./pages/scheduled-pickups'));
const TicketsReport = lazy(() => import('./pages/tickets-report'));
const Estimates = lazy(() => import('./pages/estimates'));

// Loading component
function PageLoader() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-purple-50">
            <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 mb-4">
                    <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
                </div>
                <p className="text-lg text-slate-600">Loading...</p>
            </div>
        </div>
    );
}

function ProtectedRoute({ children }) {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return <PageLoader />;
    }

    return isAuthenticated ? (
        <Suspense fallback={<PageLoader />}>
            {children}
        </Suspense>
    ) : (
        <Navigate to="/login" replace />
    );
}

function PublicRoute({ children }) {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return <PageLoader />;
    }

    return !isAuthenticated ? children : <Navigate to="/" replace />;
}

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Toaster
                    position="top-right"
                    toastOptions={{
                        duration: 4000,
                        style: {
                            background: '#363636',
                            color: '#fff',
                        },
                        success: {
                            duration: 3000,
                            style: {
                                background: '#10b981',
                            },
                        },
                        error: {
                            duration: 4000,
                            style: {
                                background: '#ef4444',
                            },
                        },
                    }}
                />
                <Routes>
                    <Route path="/login" element={
                        <PublicRoute>
                            <Login />
                        </PublicRoute>
                    } />
                    <Route path="/register" element={
                        <Register />
                    } />
                    <Route path="/tracking-ticket" element={
                        <PublicTrackingTicket />
                    } />
                    <Route path="/" element={
                        <ProtectedRoute>
                            <DashboardRouter />
                        </ProtectedRoute>
                    } />
                    <Route path="/tickets" element={
                        <ProtectedRoute>
                            <Tickets />
                        </ProtectedRoute>
                    } />
                    <Route path="/verify-tickets" element={
                        <ProtectedRoute>
                            <VerifyTickets />
                        </ProtectedRoute>
                    } />
                    <Route path="/closed-tickets" element={
                        <ProtectedRoute>
                            <ClosedTickets />
                        </ProtectedRoute>
                    } />
                    <Route path="/overdue-tickets" element={
                        <ProtectedRoute>
                            <OverdueTickets />
                        </ProtectedRoute>
                    } />
                    <Route path="/delivered-ticket/:id" element={
                        <ProtectedRoute>
                            <DeliveredTicketDetails />
                        </ProtectedRoute>
                    } />
                    <Route path="/deleted-tickets" element={
                        <ProtectedRoute>
                            <DeletedTickets />
                        </ProtectedRoute>
                    } />
                    <Route path="/customers" element={
                        <ProtectedRoute>
                            <Customers />
                        </ProtectedRoute>
                    } />
                    <Route path="/customers/:id" element={
                        <ProtectedRoute>
                            <CustomerDetails />
                        </ProtectedRoute>
                    } />
                    <Route path="/scheduled-pickups" element={
                        <ProtectedRoute>
                            <ScheduledPickups />
                        </ProtectedRoute>
                    } />
                    <Route path="/tasks" element={
                        <ProtectedRoute>
                            <Tasks />
                        </ProtectedRoute>
                    } />
                    <Route path="/products" element={
                        <ProtectedRoute>
                            <Products />
                        </ProtectedRoute>
                    } />
                    <Route path="/product-list" element={
                        <ProtectedRoute>
                            <Products />
                        </ProtectedRoute>
                    } />
                    <Route path="/orders" element={
                        <ProtectedRoute>
                            <div className="min-h-screen flex items-center justify-center">
                                <div className="text-lg">Orders Page (Coming Soon)</div>
                            </div>
                        </ProtectedRoute>
                    } />
                    <Route path="/invoices" element={
                        <ProtectedRoute>
                            <Invoices />
                        </ProtectedRoute>
                    } />
                    <Route path="/payments" element={
                        <ProtectedRoute>
                            <Payments />
                        </ProtectedRoute>
                    } />
                    <Route path="/payment-dues" element={
                        <ProtectedRoute>
                            <PaymentDues />
                        </ProtectedRoute>
                    } />
                    <Route path="/payment-history" element={
                        <ProtectedRoute>
                            <PaymentHistory />
                        </ProtectedRoute>
                    } />
                    <Route path="/reports" element={
                        <ProtectedRoute>
                            <Reports />
                        </ProtectedRoute>
                    } />
                    <Route path="/tickets-report" element={
                        <ProtectedRoute>
                            <TicketsReport />
                        </ProtectedRoute>
                    } />
                    <Route path="/staff-tickets-report" element={
                        <ProtectedRoute>
                            <React.Suspense fallback={<div>Loading...</div>}>
                                <StaffTicketsReport />
                            </React.Suspense>
                        </ProtectedRoute>
                    } />
                    <Route path="/staff-monthly-splitups" element={
                        <ProtectedRoute>
                            <React.Suspense fallback={<div>Loading...</div>}>
                                <StaffMonthlySplitups />
                            </React.Suspense>
                        </ProtectedRoute>
                    } />
                    <Route path="/monthly-revenue-report" element={
                        <ProtectedRoute>
                            <React.Suspense fallback={<div>Loading...</div>}>
                                <MonthlyRevenueReport />
                            </React.Suspense>
                        </ProtectedRoute>
                    } />
                    <Route path="/report-preview" element={
                        <ProtectedRoute>
                            <ReportPreview />
                        </ProtectedRoute>
                    } />
                    <Route path="/departments" element={
                        <ProtectedRoute>
                            <div className="min-h-screen flex items-center justify-center">
                                <div className="text-lg">Departments Page (Coming Soon)</div>
                            </div>
                        </ProtectedRoute>
                    } />
                    <Route path="/users" element={
                        <ProtectedRoute>
                            <div className="min-h-screen flex items-center justify-center">
                                <div className="text-lg">Users Page (Coming Soon)</div>
                            </div>
                        </ProtectedRoute>
                    } />
                    <Route path="/general-options" element={
                        <ProtectedRoute>
                            <GeneralOptions />
                        </ProtectedRoute>
                    } />
                    <Route path="/estimates" element={
                        <ProtectedRoute>
                            <Estimates />
                        </ProtectedRoute>
                    } />
                    <Route path="/settings" element={
                        <ProtectedRoute>
                            <Settings />
                        </ProtectedRoute>
                    } />
                    <Route path="/help-support" element={
                        <ProtectedRoute>
                            <HelpSupport />
                        </ProtectedRoute>
                    } />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

const container = document.getElementById('app');
if (container) {
    const root = createRoot(container);
    root.render(<App />);
}