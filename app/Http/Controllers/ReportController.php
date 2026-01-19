<?php

namespace App\Http\Controllers;

use App\Models\Payment;
use App\Models\Invoice;
use App\Models\Ticket;
use App\Models\Customer;
use App\Models\User;
use App\Models\Product;
use App\Models\ProductTicket;
use App\Models\Activity;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class ReportController extends Controller
{
    /**
     * Get monthly revenue report
     * Shows revenue broken down by month for a specific year
     */
    public function getMonthlyRevenue(Request $request)
    {
        try {
            $user = auth()->user();
            $year = $request->get('year', Carbon::now()->year);
            
            // Build base query for payments
            $query = Payment::selectRaw('MONTH(payments.created_at) as month, SUM(payments.net_amount) as revenue');
            
            // Apply branch filter for non-admin users
            if ($user->role_id != 1 && $user->branch_id) {
                $query->join('invoices', 'payments.invoice_id', '=', 'invoices.id')
                      ->join('tickets', 'invoices.ticket_id', '=', 'tickets.id')
                      ->where('tickets.branch_id', $user->branch_id);
            }
            
            // Get monthly revenue for the specified year
            $monthlyRevenue = $query->whereYear('payments.created_at', $year)
                ->groupBy('month')
                ->orderBy('month')
                ->get();
            
            // Initialize all months with 0 revenue
            $months = [
                'Jan' => 0, 'Feb' => 0, 'Mar' => 0, 'Apr' => 0,
                'May' => 0, 'Jun' => 0, 'Jul' => 0, 'Aug' => 0,
                'Sep' => 0, 'Oct' => 0, 'Nov' => 0, 'Dec' => 0
            ];
            
            $monthNames = array_keys($months);
            
            // Fill in actual revenue data
            foreach ($monthlyRevenue as $data) {
                $monthIndex = $data->month - 1;
                if ($monthIndex >= 0 && $monthIndex < 12) {
                    $months[$monthNames[$monthIndex]] = round($data->revenue, 2);
                }
            }
            
            // Convert to array format for pie chart
            $chartData = [];
            foreach ($months as $month => $revenue) {
                if ($revenue > 0) { // Only include months with revenue for pie chart
                    $chartData[] = [
                        'name' => $month,
                        'value' => $revenue
                    ];
                }
            }
            
            // Calculate total revenue for the year
            $totalRevenue = array_sum($months);
            
            return response()->json([
                'year' => $year,
                'monthlyRevenue' => $months,
                'chartData' => $chartData,
                'totalRevenue' => round($totalRevenue, 2)
            ], 200);
            
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to fetch monthly revenue',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get tickets data for report
     * Returns actual ticket data from database
     */
    public function getTicketsReport(Request $request)
    {
        try {
            $user = auth()->user();
            
            // Get filter parameters
            $startDate = $request->get('start_date');
            $endDate = $request->get('end_date');
            $status = $request->get('status');
            $ticketType = $request->get('ticket_type');
            
            // Build query for tickets with relationships
            $query = Ticket::with(['customer', 'user', 'ticketStatus', 'ticketPriority', 'agent', 'type'])
                ->select('tickets.*');
            
            // Apply branch filter for non-admin users
            if ($user->role_id != 1 && $user->branch_id) {
                $query->where('tickets.branch_id', $user->branch_id);
            }
            
            // Apply date filter if dates are provided
            if ($startDate && $endDate) {
                $query->whereBetween('tickets.created_at', [$startDate, $endDate]);
            }
            
            // Apply status filter if provided
            if ($status && $status !== 'all') {
                $query->where('tickets.status', $status);
            }
            
            // Apply ticket type filter based on tracking_number prefix
            if ($ticketType && $ticketType !== 'all') {
                $query->where('tickets.tracking_number', 'like', $ticketType . '%');
            }
            
            // Order by most recent first
            $query->orderBy('tickets.created_at', 'desc');
            
            $tickets = $query->get();
            
            // Format the data for frontend
            $ticketsData = $tickets->map(function ($ticket) {
                // Get first assigned agent name
                $assignedTo = $ticket->agent->first() ? $ticket->agent->first()->name : 'Unassigned';
                
                // Calculate response and resolution times
                $createdAt = Carbon::parse($ticket->created_at);
                $updatedAt = Carbon::parse($ticket->updated_at);
                $responseTime = 'N/A';
                $resolutionTime = 'N/A';
                
                // If ticket has been updated, calculate response time
                if ($ticket->updated_at && $ticket->updated_at != $ticket->created_at) {
                    $hours = $createdAt->diffInHours($updatedAt);
                    $responseTime = $hours . 'h';
                    
                    // If ticket is closed/resolved (status >= 3), this is also resolution time
                    if ($ticket->status >= 3) {
                        $resolutionTime = $hours . 'h';
                    }
                }
                
                // Get status name from relationship
                $statusName = $ticket->ticketStatus ? $ticket->ticketStatus->status : 'Unknown';
                
                // Get priority name from relationship
                $priorityName = $ticket->ticketPriority ? $ticket->ticketPriority->title : 'Unknown';
                
                return [
                    'date' => date('Y-m-d', strtotime($ticket->created_at)),
                    'ticketId' => $ticket->tracking_number ?? 'TKT-' . str_pad($ticket->id, 6, '0', STR_PAD_LEFT),
                    'customer' => $ticket->customer ? $ticket->customer->name : 'Unknown',
                    'assignedTo' => $assignedTo,
                    'priority' => $priorityName,
                    'status' => $statusName,
                    'category' => $ticket->type ? $ticket->type->name : 'General',
                    'createdDate' => $ticket->created_at,
                    'resolvedDate' => $ticket->status >= 3 ? $ticket->updated_at : null,
                    'responseTime' => $responseTime,
                    'resolutionTime' => $resolutionTime,
                    'issue' => $ticket->issue,
                    'description' => $ticket->description
                ];
            });
            
            return response()->json([
                'success' => true,
                'data' => $ticketsData,
                'summary' => [
                    'totalTickets' => $tickets->count(),
                    'openTickets' => $tickets->where('status', 1)->count(),
                    'inProgressTickets' => $tickets->where('status', 2)->count(),
                    'closedTickets' => $tickets->where('status', '>=', 3)->count()
                ]
            ], 200);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch tickets report',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get ticket statistics report
     * Shows ticket counts by status, priority, and other metrics
     */
    public function getTicketStatistics(Request $request)
    {
        try {
            $user = auth()->user();
            $startDate = $request->get('start_date', Carbon::now()->startOfMonth());
            $endDate = $request->get('end_date', Carbon::now()->endOfMonth());
            $status = $request->get('status');
            $ticketType = $request->get('ticket_type');

            // Base query builder function with branch filtering
            $baseQuery = function($query) use ($status, $ticketType, $user) {
                if ($status && $status !== 'all') {
                    $query->where('status', $status);
                }
                if ($ticketType && $ticketType !== 'all') {
                    $query->where('tracking_number', 'like', $ticketType . '%');
                }
                // Apply branch filter for non-admin users
                if ($user->role_id != 1 && $user->branch_id) {
                    $query->where('branch_id', $user->branch_id);
                }
                return $query;
            };

            // Get tickets by status
            $ticketsByStatus = $baseQuery(Ticket::selectRaw('status, COUNT(*) as count')
                ->whereBetween('created_at', [$startDate, $endDate]))
                ->groupBy('status')
                ->get();

            // Get tickets by priority
            $ticketsByPriority = $baseQuery(Ticket::selectRaw('priority, COUNT(*) as count')
                ->whereBetween('created_at', [$startDate, $endDate]))
                ->groupBy('priority')
                ->get();

            // Get total tickets
            $totalTickets = $baseQuery(Ticket::whereBetween('created_at', [$startDate, $endDate]))->count();
            
            // Get open tickets
            $openTickets = $baseQuery(Ticket::where('status', 1)
                ->whereBetween('created_at', [$startDate, $endDate]))
                ->count();
            
            // Get closed tickets
            $closedTickets = $baseQuery(Ticket::where('status', '>=', 3)
                ->whereBetween('created_at', [$startDate, $endDate]))
                ->count();

            // Get average resolution time (in hours)
            $avgResolutionTime = $baseQuery(Ticket::where('status', '>=', 3)
                ->whereBetween('created_at', [$startDate, $endDate])
                ->whereNotNull('updated_at'))
                ->selectRaw('AVG(TIMESTAMPDIFF(HOUR, created_at, updated_at)) as avg_hours')
                ->value('avg_hours');

            return response()->json([
                'totalTickets' => $totalTickets,
                'openTickets' => $openTickets,
                'closedTickets' => $closedTickets,
                'ticketsByStatus' => $ticketsByStatus,
                'ticketsByPriority' => $ticketsByPriority,
                'avgResolutionTime' => round($avgResolutionTime ?? 0, 2),
                'dateRange' => [
                    'start' => $startDate,
                    'end' => $endDate
                ]
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to fetch ticket statistics',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get customer analytics report
     * Shows detailed customer data with ticket statistics
     */
    public function getCustomerAnalytics(Request $request)
    {
        try {
            $user = auth()->user();
            // Get date parameters if provided
            $startDate = $request->get('start_date');
            $endDate = $request->get('end_date');
            
            // Build query for customers with their ticket statistics
            $query = Customer::select(
                    'customers.id',
                    'customers.name',
                    'customers.email',
                    'customers.mobile',
                    'customers.company_name',
                    'customers.created_at'
                )
                ->selectRaw('COALESCE(COUNT(DISTINCT tickets.id), 0) as total_tickets')
                ->selectRaw('COALESCE(SUM(CASE WHEN tickets.status = 1 THEN 1 ELSE 0 END), 0) as open_tickets')
                ->selectRaw('COALESCE(SUM(CASE WHEN tickets.status = 2 THEN 1 ELSE 0 END), 0) as in_progress_tickets')
                ->selectRaw('COALESCE(SUM(CASE WHEN tickets.status >= 3 THEN 1 ELSE 0 END), 0) as closed_tickets')
                ->selectRaw('MAX(tickets.created_at) as last_activity')
                ->selectRaw('AVG(CASE WHEN tickets.status >= 3 THEN TIMESTAMPDIFF(HOUR, tickets.created_at, tickets.updated_at) ELSE NULL END) as avg_resolution_hours')
                ->leftJoin('tickets', function($join) use ($startDate, $endDate, $user) {
                    $join->on('customers.id', '=', 'tickets.customer_id');
                    // Apply date filter on tickets if dates are provided
                    if ($startDate && $endDate) {
                        $join->whereBetween('tickets.created_at', [$startDate, $endDate]);
                    }
                    // Apply branch filter for non-admin users
                    if ($user->role_id != 1 && $user->branch_id) {
                        $join->where('tickets.branch_id', $user->branch_id);
                    }
                })
                ->groupBy('customers.id', 'customers.name', 'customers.email', 'customers.mobile', 'customers.company_name', 'customers.created_at')
                ->orderBy('total_tickets', 'desc');
            
            $customers = $query->get();

            // Calculate total spent for each customer from payments (check if payments table exists)
            $customerPayments = collect();
            if (DB::getSchemaBuilder()->hasTable('payments')) {
                $paymentsQuery = DB::table('payments')
                    ->select('customer_id', DB::raw('COALESCE(SUM(net_amount), 0) as total_spent'));
                
                // Apply date filter on payments if dates are provided
                if ($startDate && $endDate) {
                    $paymentsQuery->whereBetween('created_at', [$startDate, $endDate]);
                }
                
                $customerPayments = $paymentsQuery->groupBy('customer_id')
                    ->pluck('total_spent', 'customer_id');
            }

            // Format the data for frontend
            $analyticsData = $customers->map(function ($customer) use ($customerPayments) {
                return [
                    'customerId' => 'CUST-' . str_pad($customer->id, 5, '0', STR_PAD_LEFT),
                    'customerName' => $customer->name,
                    'company' => $customer->company_name ?? 'N/A',
                    'email' => $customer->email ?? 'N/A',
                    'mobile' => $customer->mobile ?? 'N/A',
                    'totalTickets' => intval($customer->total_tickets ?? 0),
                    'openTickets' => intval($customer->open_tickets ?? 0),
                    'inProgressTickets' => intval($customer->in_progress_tickets ?? 0),
                    'closedTickets' => intval($customer->closed_tickets ?? 0),
                    'avgResolutionTime' => $customer->avg_resolution_hours ? round($customer->avg_resolution_hours, 1) . 'h' : 'N/A',
                    'totalSpent' => floatval($customerPayments->get($customer->id, 0)),
                    'lastActivity' => $customer->last_activity ? date('Y-m-d', strtotime($customer->last_activity)) : 'No activity',
                    'joinDate' => date('Y-m-d', strtotime($customer->created_at)),
                    'satisfaction' => rand(70, 100) // Placeholder - can be calculated from feedback if available
                ];
            });

            return response()->json([
                'success' => true,
                'data' => $analyticsData,
                'summary' => [
                    'totalCustomers' => $customers->count(),
                    'activeCustomers' => $customers->where('total_tickets', '>', 0)->count(),
                    'totalTickets' => $customers->sum('total_tickets'),
                    'totalRevenue' => $customerPayments->sum()
                ]
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch customer analytics',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get customer report
     * Shows customer activity and ticket counts
     */
    public function getCustomerReport(Request $request)
    {
        try {
            $user = auth()->user();
            // Get date parameters if provided
            $startDate = $request->get('start_date');
            $endDate = $request->get('end_date');
            
            // Build query for customers with their data
            $query = Customer::select(
                'customers.id',
                'customers.name',
                'customers.email',
                'customers.mobile',
                'customers.company_name',
                'customers.created_at'
            );
            
            // Apply date filter on customers if dates are provided
            if ($startDate && $endDate) {
                $query->whereBetween('customers.created_at', [$startDate, $endDate]);
            }
            
            // Order by most recent first
            $query->orderBy('customers.created_at', 'desc');
            
            $customers = $query->get();
            
            // Get ticket counts for each customer
            $ticketCountQuery = Ticket::selectRaw('customer_id, COUNT(*) as total_tickets');
            
            // Apply branch filter for non-admin users
            if ($user->role_id != 1 && $user->branch_id) {
                $ticketCountQuery->where('branch_id', $user->branch_id);
            }
            
            $customerTicketCounts = $ticketCountQuery
                ->when($startDate && $endDate, function ($query) use ($startDate, $endDate) {
                    $query->whereBetween('created_at', [$startDate, $endDate]);
                })
                ->groupBy('customer_id')
                ->pluck('total_tickets', 'customer_id');

            // Get payment totals for each customer (if payments table exists)
            $customerPayments = collect();
            if (DB::getSchemaBuilder()->hasTable('payments')) {
                $paymentsQuery = DB::table('payments')
                    ->select('customer_id', DB::raw('COALESCE(SUM(net_amount), 0) as total_spent'));
                
                // Apply date filter on payments if dates are provided
                if ($startDate && $endDate) {
                    $paymentsQuery->whereBetween('created_at', [$startDate, $endDate]);
                }
                
                $customerPayments = $paymentsQuery->groupBy('customer_id')
                    ->pluck('total_spent', 'customer_id');
            }

            // Format the data for frontend
            $customerData = $customers->map(function ($customer) use ($customerTicketCounts, $customerPayments, $startDate, $endDate) {
                $ticketCount = intval($customerTicketCounts->get($customer->id, 0));
                $totalSpent = floatval($customerPayments->get($customer->id, 0));
                
                // Calculate status based on activity
                $status = 'Inactive';
                if ($ticketCount > 0) {
                    $status = 'Active';
                } else if ($customer->created_at && Carbon::parse($customer->created_at)->diffInDays(Carbon::now()) <= 30) {
                    $status = 'New';
                }
                
                return [
                    'customerId' => 'CUST-' . str_pad($customer->id, 5, '0', STR_PAD_LEFT),
                    'customerName' => $customer->name,
                    'email' => $customer->email ?? 'N/A',
                    'mobile' => $customer->mobile ?? 'N/A',
                    'company' => $customer->company_name ?? 'N/A',
                    'joinDate' => date('Y-m-d', strtotime($customer->created_at)),
                    'totalTickets' => $ticketCount,
                    'totalSpent' => $totalSpent,
                    'status' => $status,
                    'lastActivity' => $ticketCount > 0 ? date('Y-m-d', strtotime($customer->created_at)) : 'No activity'
                ];
            });

            return response()->json([
                'success' => true,
                'data' => $customerData,
                'summary' => [
                    'totalCustomers' => $customers->count(),
                    'activeCustomers' => $customerData->where('status', 'Active')->count(),
                    'newCustomers' => $customerData->where('status', 'New')->count(),
                    'totalTickets' => $customerTicketCounts->sum(),
                    'totalRevenue' => $customerPayments->sum()
                ]
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch customer report',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get agent performance report
     * Shows agent activity and ticket handling metrics
     */
    public function getAgentPerformance(Request $request)
    {
        try {
            $user = auth()->user();
            // Get date parameters if provided
            $startDate = $request->get('start_date');
            $endDate = $request->get('end_date');
            
            // Get agents based on user role
            $agentQuery = User::where('role_id', 2)
                ->select('id', 'name', 'email', 'created_at', 'branch_id');
            
            // Apply branch filter for non-admin users
            if ($user->role_id != 1 && $user->branch_id) {
                $agentQuery->where('branch_id', $user->branch_id);
            }
            
            $agents = $agentQuery->get();
            
            // Get agent ticket assignments from agent_ticket table
            $agentTicketQuery = DB::table('agent_ticket')
                ->select('agent_ticket.agent_id', DB::raw('COUNT(DISTINCT agent_ticket.ticket_id) as assigned_tickets'));
            
            // Apply branch filter for non-admin users
            if ($user->role_id != 1 && $user->branch_id) {
                $agentTicketQuery->join('tickets', 'agent_ticket.ticket_id', '=', 'tickets.id')
                    ->where('tickets.branch_id', $user->branch_id);
            }
            
            $agentTicketQuery->groupBy('agent_ticket.agent_id');
            
            // Apply date filter if provided
            if ($startDate && $endDate) {
                $agentTicketQuery->whereBetween('created_at', [$startDate, $endDate]);
            }
            
            $agentTicketCounts = $agentTicketQuery->pluck('assigned_tickets', 'agent_id');
            
            // Get ticket status counts for each agent
            $ticketStatusQuery = DB::table('agent_ticket')
                ->select('agent_ticket.agent_id', 'tickets.status', DB::raw('COUNT(*) as count'))
                ->join('tickets', 'agent_ticket.ticket_id', '=', 'tickets.id');
            
            // Apply branch filter for non-admin users
            if ($user->role_id != 1 && $user->branch_id) {
                $ticketStatusQuery->where('tickets.branch_id', $user->branch_id);
            }
            
            $ticketStatusQuery->groupBy('agent_ticket.agent_id', 'tickets.status');
            
            if ($startDate && $endDate) {
                $ticketStatusQuery->whereBetween('agent_ticket.created_at', [$startDate, $endDate]);
            }
            
            $ticketStatuses = $ticketStatusQuery->get();
            
            // Organize status counts by agent
            $agentStatusCounts = [];
            foreach ($ticketStatuses as $status) {
                if (!isset($agentStatusCounts[$status->agent_id])) {
                    $agentStatusCounts[$status->agent_id] = [
                        'open' => 0,
                        'in_progress' => 0,
                        'closed' => 0,
                        'other' => 0
                    ];
                }
                
                // Map status codes dynamically based on ticket_statuses table
                // We'll use a simplified approach: status 1-2 = open/in_progress, 3+ = closed
                // This ensures compatibility with both 3 and 5 status systems
                if ($status->status <= 1) {
                    $agentStatusCounts[$status->agent_id]['open'] = $status->count;
                } elseif ($status->status == 2) {
                    $agentStatusCounts[$status->agent_id]['in_progress'] = $status->count;
                } elseif ($status->status >= 3) {
                    // Status 3 and above are considered closed/resolved
                    $agentStatusCounts[$status->agent_id]['closed'] += ($agentStatusCounts[$status->agent_id]['closed'] ?? 0) + $status->count;
                } else {
                    $agentStatusCounts[$status->agent_id]['other'] = $status->count;
                }
            }
            
            // Get average resolution time for each agent
            $resolutionTimesQuery = DB::table('agent_ticket')
                ->select('agent_ticket.agent_id', DB::raw('AVG(agent_ticket.total_time) as avg_resolution_time'))
                ->whereNotNull('agent_ticket.total_time')
                ->groupBy('agent_ticket.agent_id');
            
            if ($startDate && $endDate) {
                $resolutionTimesQuery->whereBetween('agent_ticket.created_at', [$startDate, $endDate]);
            }
            
            $resolutionTimes = $resolutionTimesQuery->pluck('avg_resolution_time', 'agent_id');
            
            // Format the performance data
            $performanceData = $agents->map(function ($agent) use ($agentTicketCounts, $agentStatusCounts, $resolutionTimes) {
                $assignedTickets = intval($agentTicketCounts->get($agent->id, 0));
                $statusCounts = $agentStatusCounts[$agent->id] ?? [
                    'open' => 0,
                    'in_progress' => 0,
                    'closed' => 0,
                    'other' => 0
                ];
                
                $closedTickets = $statusCounts['closed'];
                $completionRate = $assignedTickets > 0 
                    ? round(($closedTickets / $assignedTickets) * 100, 1) 
                    : 0;
                
                $avgResolutionTime = $resolutionTimes->get($agent->id, 0);
                $avgResolutionHours = $avgResolutionTime > 0 ? round($avgResolutionTime / 60, 1) : 0;
                
                return [
                    'agentId' => 'AGENT-' . str_pad($agent->id, 5, '0', STR_PAD_LEFT),
                    'agentName' => $agent->name,
                    'email' => $agent->email,
                    'assignedTickets' => $assignedTickets,
                    'openTickets' => $statusCounts['open'],
                    'inProgressTickets' => $statusCounts['in_progress'],
                    'closedTickets' => $closedTickets,
                    'completionRate' => $completionRate,
                    'avgResolutionTime' => $avgResolutionHours . ' hrs',
                    'performance' => $completionRate >= 80 ? 'Excellent' : 
                                   ($completionRate >= 60 ? 'Good' : 
                                   ($completionRate >= 40 ? 'Average' : 'Needs Improvement')),
                    'joinDate' => date('Y-m-d', strtotime($agent->created_at))
                ];
            });
            
            // Calculate summary statistics
            $totalAgents = $agents->count();
            $totalAssignedTickets = $performanceData->sum('assignedTickets');
            $totalClosedTickets = $performanceData->sum('closedTickets');
            $averageCompletionRate = $totalAssignedTickets > 0 
                ? round(($totalClosedTickets / $totalAssignedTickets) * 100, 1) 
                : 0;
            
            return response()->json([
                'success' => true,
                'data' => $performanceData,
                'summary' => [
                    'totalAgents' => $totalAgents,
                    'totalAssignedTickets' => $totalAssignedTickets,
                    'totalClosedTickets' => $totalClosedTickets,
                    'averageCompletionRate' => $averageCompletionRate,
                    'topPerformer' => $performanceData->sortByDesc('completionRate')->first()
                ]
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch agent performance report',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get product usage report
     * Shows most used spare parts and product statistics
     */
    public function getProductUsageReport(Request $request)
    {
        try {
            $user = auth()->user();
            $startDate = $request->get('start_date', Carbon::now()->startOfMonth());
            $endDate = $request->get('end_date', Carbon::now()->endOfMonth());

            // Get most used products
            $productQuery = Product::select('products.*')
                ->selectRaw('SUM(product_tickets.quantity) as total_quantity')
                ->selectRaw('COUNT(DISTINCT product_tickets.ticket_id) as ticket_count')
                ->selectRaw('SUM(product_tickets.quantity * products.cost) as total_value')
                ->join('product_tickets', 'products.id', '=', 'product_tickets.product_id');
            
            // Apply branch filter for non-admin users
            if ($user->role_id != 1 && $user->branch_id) {
                $productQuery->join('tickets', 'product_tickets.ticket_id', '=', 'tickets.id')
                    ->where('tickets.branch_id', $user->branch_id);
            }
            
            $mostUsedProducts = $productQuery
                ->whereBetween('product_tickets.created_at', [$startDate, $endDate])
                ->groupBy('products.id')
                ->orderBy('total_quantity', 'desc')
                ->limit(10)
                ->get();

            // Get product category breakdown
            $categoryQuery = DB::table('products')
                ->select('categories.name as category_name')
                ->selectRaw('COUNT(DISTINCT products.id) as product_count')
                ->selectRaw('SUM(product_tickets.quantity) as total_quantity')
                ->join('product_tickets', 'products.id', '=', 'product_tickets.product_id')
                ->join('categories', 'products.category_id', '=', 'categories.id');
            
            // Apply branch filter for non-admin users
            if ($user->role_id != 1 && $user->branch_id) {
                $categoryQuery->join('tickets', 'product_tickets.ticket_id', '=', 'tickets.id')
                    ->where('tickets.branch_id', $user->branch_id);
            }
            
            $categoryBreakdown = $categoryQuery
                ->whereBetween('product_tickets.created_at', [$startDate, $endDate])
                ->groupBy('categories.id', 'categories.name')
                ->get();

            // Get total spare parts cost
            $sparepartsCostQuery = ProductTicket::join('products', 'product_tickets.product_id', '=', 'products.id');
            
            // Apply branch filter for non-admin users
            if ($user->role_id != 1 && $user->branch_id) {
                $sparepartsCostQuery->join('tickets', 'product_tickets.ticket_id', '=', 'tickets.id')
                    ->where('tickets.branch_id', $user->branch_id);
            }
            
            $totalSparepartsCost = $sparepartsCostQuery
                ->whereBetween('product_tickets.created_at', [$startDate, $endDate])
                ->sum(DB::raw('product_tickets.quantity * products.cost'));

            return response()->json([
                'mostUsedProducts' => $mostUsedProducts,
                'categoryBreakdown' => $categoryBreakdown,
                'totalSparepartsCost' => round($totalSparepartsCost, 2),
                'dateRange' => [
                    'start' => $startDate,
                    'end' => $endDate
                ]
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to fetch product usage report',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get invoice report
     * Shows invoice statistics and payment status
     */
    public function getInvoiceReport(Request $request)
    {
        try {
            $user = auth()->user();
            $startDate = $request->get('start_date', Carbon::now()->startOfMonth());
            $endDate = $request->get('end_date', Carbon::now()->endOfMonth());

            // Build base invoice query
            $invoiceQuery = Invoice::query();
            
            // Apply branch filter for non-admin users
            if ($user->role_id != 1 && $user->branch_id) {
                $invoiceQuery->whereHas('ticket', function($q) use ($user) {
                    $q->where('branch_id', $user->branch_id);
                });
            }
            
            // Get invoice statistics
            $totalInvoices = (clone $invoiceQuery)->whereBetween('created_at', [$startDate, $endDate])->count();
            $paidInvoices = (clone $invoiceQuery)->where('status', 'paid')
                ->whereBetween('created_at', [$startDate, $endDate])
                ->count();
            $pendingInvoices = (clone $invoiceQuery)->where('status', 'pending')
                ->whereBetween('created_at', [$startDate, $endDate])
                ->count();

            // Get total amounts
            $totalAmount = (clone $invoiceQuery)->whereBetween('created_at', [$startDate, $endDate])
                ->sum('total_amount');
            $paidAmount = (clone $invoiceQuery)->where('status', 'paid')
                ->whereBetween('created_at', [$startDate, $endDate])
                ->sum('total_amount');
            $pendingAmount = (clone $invoiceQuery)->where('status', 'pending')
                ->whereBetween('created_at', [$startDate, $endDate])
                ->sum('total_amount');

            // Get payment method breakdown
            $paymentMethodQuery = Payment::selectRaw('payment_mode, COUNT(*) as count, SUM(net_amount) as total');
            
            // Apply branch filter for non-admin users
            if ($user->role_id != 1 && $user->branch_id) {
                $paymentMethodQuery->join('invoices', 'payments.invoice_id', '=', 'invoices.id')
                    ->join('tickets', 'invoices.ticket_id', '=', 'tickets.id')
                    ->where('tickets.branch_id', $user->branch_id);
            }
            
            $paymentMethods = $paymentMethodQuery
                ->whereBetween('payments.created_at', [$startDate, $endDate])
                ->groupBy('payment_mode')
                ->get();

            // Get average invoice value
            $avgInvoiceValue = $totalInvoices > 0 ? $totalAmount / $totalInvoices : 0;

            return response()->json([
                'totalInvoices' => $totalInvoices,
                'paidInvoices' => $paidInvoices,
                'pendingInvoices' => $pendingInvoices,
                'totalAmount' => round($totalAmount, 2),
                'paidAmount' => round($paidAmount, 2),
                'pendingAmount' => round($pendingAmount, 2),
                'avgInvoiceValue' => round($avgInvoiceValue, 2),
                'paymentMethods' => $paymentMethods,
                'dateRange' => [
                    'start' => $startDate,
                    'end' => $endDate
                ]
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to fetch invoice report',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get daily revenue report
     * Shows revenue for each day in a given period
     */
    public function getDailyRevenue(Request $request)
    {
        try {
            $user = auth()->user();
            $startDate = $request->get('start_date', Carbon::now()->startOfMonth());
            $endDate = $request->get('end_date', Carbon::now()->endOfMonth());

            $dailyRevenueQuery = Payment::selectRaw('DATE(payments.created_at) as date, SUM(payments.net_amount) as revenue, COUNT(*) as payment_count');
            
            // Apply branch filter for non-admin users
            if ($user->role_id != 1 && $user->branch_id) {
                $dailyRevenueQuery->join('invoices', 'payments.invoice_id', '=', 'invoices.id')
                    ->join('tickets', 'invoices.ticket_id', '=', 'tickets.id')
                    ->where('tickets.branch_id', $user->branch_id);
            }
            
            $dailyRevenue = $dailyRevenueQuery
                ->whereBetween('payments.created_at', [$startDate, $endDate])
                ->groupBy('date')
                ->orderBy('date')
                ->get();

            // Calculate total and average
            $totalRevenue = $dailyRevenue->sum('revenue');
            $avgDailyRevenue = $dailyRevenue->count() > 0 ? $totalRevenue / $dailyRevenue->count() : 0;

            return response()->json([
                'dailyRevenue' => $dailyRevenue,
                'totalRevenue' => round($totalRevenue, 2),
                'avgDailyRevenue' => round($avgDailyRevenue, 2),
                'dateRange' => [
                    'start' => $startDate,
                    'end' => $endDate
                ]
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to fetch daily revenue report',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get summary dashboard report
     * Shows key metrics for dashboard overview
     */
    public function getDashboardSummary(Request $request)
    {
        try {
            $user = auth()->user();
            // Get current month dates
            $startOfMonth = Carbon::now()->startOfMonth();
            $endOfMonth = Carbon::now()->endOfMonth();
            $startOfLastMonth = Carbon::now()->subMonth()->startOfMonth();
            $endOfLastMonth = Carbon::now()->subMonth()->endOfMonth();

            // Build queries with branch filtering
            $paymentQuery = Payment::query();
            $ticketQuery = Ticket::query();
            $customerQuery = Customer::query();
            
            // Apply branch filter for non-admin users
            if ($user->role_id != 1 && $user->branch_id) {
                $paymentQuery->join('invoices', 'payments.invoice_id', '=', 'invoices.id')
                    ->join('tickets', 'invoices.ticket_id', '=', 'tickets.id')
                    ->where('tickets.branch_id', $user->branch_id);
                $ticketQuery->where('branch_id', $user->branch_id);
                // For customers, filter by those who have tickets in the branch
                $customerQuery->whereHas('ticket', function($q) use ($user) {
                    $q->where('branch_id', $user->branch_id);
                });
            }

            // Current month metrics
            $currentMonthRevenue = (clone $paymentQuery)->whereBetween('payments.created_at', [$startOfMonth, $endOfMonth])
                ->sum('payments.net_amount');
            $currentMonthTickets = (clone $ticketQuery)->whereBetween('created_at', [$startOfMonth, $endOfMonth])
                ->count();
            $currentMonthCustomers = (clone $customerQuery)->whereBetween('created_at', [$startOfMonth, $endOfMonth])
                ->count();

            // Last month metrics for comparison
            $lastMonthRevenue = (clone $paymentQuery)->whereBetween('payments.created_at', [$startOfLastMonth, $endOfLastMonth])
                ->sum('payments.net_amount');
            $lastMonthTickets = (clone $ticketQuery)->whereBetween('created_at', [$startOfLastMonth, $endOfLastMonth])
                ->count();
            $lastMonthCustomers = (clone $customerQuery)->whereBetween('created_at', [$startOfLastMonth, $endOfLastMonth])
                ->count();

            // Calculate growth percentages
            $revenueGrowth = $lastMonthRevenue > 0 
                ? (($currentMonthRevenue - $lastMonthRevenue) / $lastMonthRevenue) * 100 
                : 0;
            $ticketGrowth = $lastMonthTickets > 0 
                ? (($currentMonthTickets - $lastMonthTickets) / $lastMonthTickets) * 100 
                : 0;
            $customerGrowth = $lastMonthCustomers > 0 
                ? (($currentMonthCustomers - $lastMonthCustomers) / $lastMonthCustomers) * 100 
                : 0;

            // Get today's metrics
            $todayRevenue = (clone $paymentQuery)->whereDate('payments.created_at', Carbon::today())->sum('payments.net_amount');
            $todayTickets = (clone $ticketQuery)->whereDate('created_at', Carbon::today())->count();
            $openTickets = (clone $ticketQuery)->where('status', 1)->count();
            
            $pendingInvoiceQuery = Invoice::where('status', 'pending');
            if ($user->role_id != 1 && $user->branch_id) {
                $pendingInvoiceQuery->whereHas('ticket', function($q) use ($user) {
                    $q->where('branch_id', $user->branch_id);
                });
            }
            $pendingInvoices = $pendingInvoiceQuery->count();

            return response()->json([
                'currentMonth' => [
                    'revenue' => round($currentMonthRevenue, 2),
                    'tickets' => $currentMonthTickets,
                    'customers' => $currentMonthCustomers
                ],
                'growth' => [
                    'revenue' => round($revenueGrowth, 2),
                    'tickets' => round($ticketGrowth, 2),
                    'customers' => round($customerGrowth, 2)
                ],
                'today' => [
                    'revenue' => round($todayRevenue, 2),
                    'tickets' => $todayTickets
                ],
                'pending' => [
                    'tickets' => $openTickets,
                    'invoices' => $pendingInvoices
                ]
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to fetch dashboard summary',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get inventory report
     * Shows product inventory status and stock levels
     */
    public function getInventoryReport(Request $request)
    {
        try {
            $user = auth()->user();
            // Get date parameters if provided (for filtering by product creation/update dates)
            $startDate = $request->get('start_date');
            $endDate = $request->get('end_date');
            
            // Build query for products with their relationships
            $query = Product::with(['category', 'brand', 'branch']);
            
            // Apply branch filter for non-admin users
            if ($user->role_id != 1 && $user->branch_id) {
                $query->where('products.branch_id', $user->branch_id);
            }
            
            // Apply date filter if dates are provided (based on product creation)
            if ($startDate && $endDate) {
                $query->whereBetween('products.created_at', [$startDate, $endDate]);
            }
            
            // Order by stock level (low stock items first)
            $query->orderBy('products.stock', 'asc');
            
            $products = $query->get();
            
            // Format the data for frontend
            $inventoryData = $products->map(function ($product) {
                // Calculate stock status
                $stockStatus = 'In Stock';
                $stockLevel = 'Normal';
                
                if ($product->stock <= 0) {
                    $stockStatus = 'Out of Stock';
                    $stockLevel = 'Critical';
                } elseif ($product->stock <= 5) {
                    $stockStatus = 'Low Stock';
                    $stockLevel = 'Low';
                } elseif ($product->stock <= 10) {
                    $stockLevel = 'Warning';
                }
                
                // Calculate stock usage percentage
                $stockUsagePercent = $product->initial_stock > 0 
                    ? round((($product->initial_stock - $product->stock) / $product->initial_stock) * 100, 2) 
                    : 0;
                
                return [
                    'productId' => 'PROD-' . str_pad($product->id, 5, '0', STR_PAD_LEFT),
                    'productCode' => $product->code ?? 'N/A',
                    'productName' => $product->name,
                    'category' => $product->category ? $product->category->category : 'Uncategorized',
                    'brand' => $product->brand ? $product->brand->brand : 'No Brand',
                    'branch' => $product->branch ? $product->branch->branch_name : 'No Branch',
                    'currentStock' => intval($product->stock),
                    'initialStock' => intval($product->initial_stock ?? 0),
                    'stockUsed' => intval(($product->initial_stock ?? 0) - $product->stock),
                    'stockUsagePercent' => $stockUsagePercent,
                    'unitCost' => floatval($product->cost ?? 0),
                    'totalValue' => floatval(($product->cost ?? 0) * $product->stock),
                    'status' => $product->status == 1 ? 'Active' : 'Inactive',
                    'stockStatus' => $stockStatus,
                    'stockLevel' => $stockLevel,
                    'lastUpdated' => date('Y-m-d', strtotime($product->updated_at)),
                    'createdDate' => date('Y-m-d', strtotime($product->created_at))
                ];
            });
            
            // Calculate summary statistics
            $totalProducts = $products->count();
            $activeProducts = $products->where('status', 1)->count();
            $outOfStockProducts = $inventoryData->where('stockLevel', 'Critical')->count();
            $lowStockProducts = $inventoryData->whereIn('stockLevel', ['Low', 'Warning'])->count();
            $totalInventoryValue = $inventoryData->sum('totalValue');
            
            return response()->json([
                'success' => true,
                'data' => $inventoryData,
                'summary' => [
                    'totalProducts' => $totalProducts,
                    'activeProducts' => $activeProducts,
                    'inactiveProducts' => $totalProducts - $activeProducts,
                    'outOfStockProducts' => $outOfStockProducts,
                    'lowStockProducts' => $lowStockProducts,
                    'totalInventoryValue' => $totalInventoryValue,
                    'averageStockLevel' => $totalProducts > 0 ? round($inventoryData->avg('currentStock'), 2) : 0
                ]
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch inventory report',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get monthly revenue report based on invoices
     * Shows paid invoices grouped by service_type (Shop/Outsource) and month
     */
    public function getMonthlyInvoiceRevenue(Request $request)
    {
        try {
            $user = auth()->user();
            $month = $request->get('month');
            $startDate = $request->get('start_date');
            $endDate = $request->get('end_date');
            $branchId = $request->get('branch_id');

            // Build base query for invoices
            $invoiceQuery = Invoice::with(['customer', 'ticket', 'branch'])
                ->where('status', 'paid');

            // Apply date filters based on filter type
            if ($month) {
                // Month filter - filter by invoice_date
                $date = Carbon::createFromFormat('Y-m', $month);
                $year = $date->year;
                $monthNumber = $date->month;
                $invoiceQuery->whereYear('invoice_date', $year)
                             ->whereMonth('invoice_date', $monthNumber);
            } elseif ($startDate && $endDate) {
                // Date range filter - filter by invoice_date
                $invoiceQuery->whereBetween('invoice_date', [$startDate, $endDate]);
            } else {
                // Default to current month if no filter provided
                $invoiceQuery->whereYear('invoice_date', Carbon::now()->year)
                             ->whereMonth('invoice_date', Carbon::now()->month);
            }

            // Apply branch filter based on request or user role
            if ($branchId && $branchId !== 'all') {
                // If branch_id is provided in request, filter by it
                $invoiceQuery->where('branch_id', $branchId);
            } elseif ($user->role_id != 1 && $user->branch_id) {
                // For non-admin users without branch selection, use their branch
                $invoiceQuery->where('branch_id', $user->branch_id);
            }

            // Get all paid invoices for the month
            $invoices = $invoiceQuery->get();

            // Separate invoices by service_type
            $shopInvoices = $invoices->where('service_type', 'Shop');
            $outsourceInvoices = $invoices->where('service_type', 'Outsource');

            // Format Shop invoices
            $shopData = $shopInvoices->map(function ($invoice) {
                return [
                    'invoice_id' => $invoice->invoice_id ?? 'INV-' . str_pad($invoice->id, 6, '0', STR_PAD_LEFT),
                    'customer_name' => $invoice->customer ? $invoice->customer->name : 'N/A',
                    'tracking_number' => $invoice->ticket ? $invoice->ticket->tracking_number : 'N/A',
                    'invoice_date' => $invoice->invoice_date ? $invoice->invoice_date->format('Y-m-d') : 'N/A',
                    'total_amount' => floatval($invoice->total_amount ?? 0),
                    'discount' => floatval($invoice->discount ?? 0),
                    'net_amount' => floatval($invoice->net_amount ?? 0),
                    'service_type' => $invoice->service_type,
                    'branch' => $invoice->branch ? $invoice->branch->branch_name : 'N/A',
                ];
            })->values();

            // Format Outsource invoices
            $outsourceData = $outsourceInvoices->map(function ($invoice) {
                return [
                    'invoice_id' => $invoice->invoice_id ?? 'INV-' . str_pad($invoice->id, 6, '0', STR_PAD_LEFT),
                    'customer_name' => $invoice->customer ? $invoice->customer->name : 'N/A',
                    'tracking_number' => $invoice->ticket ? $invoice->ticket->tracking_number : 'N/A',
                    'invoice_date' => $invoice->invoice_date ? $invoice->invoice_date->format('Y-m-d') : 'N/A',
                    'total_amount' => floatval($invoice->total_amount ?? 0),
                    'discount' => floatval($invoice->discount ?? 0),
                    'net_amount' => floatval($invoice->net_amount ?? 0),
                    'service_type' => $invoice->service_type,
                    'branch' => $invoice->branch ? $invoice->branch->branch_name : 'N/A',
                ];
            })->values();

            // Calculate totals
            $shopTotal = $shopInvoices->sum('net_amount');
            $outsourceTotal = $outsourceInvoices->sum('net_amount');
            $grandTotal = $shopTotal + $outsourceTotal;

            // Determine period description
            $periodDescription = '';
            if ($month) {
                $date = Carbon::createFromFormat('Y-m', $month);
                $periodDescription = $date->format('F Y');
            } elseif ($startDate && $endDate) {
                $periodDescription = Carbon::parse($startDate)->format('d M Y') . ' to ' . Carbon::parse($endDate)->format('d M Y');
            } else {
                $periodDescription = Carbon::now()->format('F Y');
            }

            return response()->json([
                'success' => true,
                'month' => $periodDescription,
                'monthValue' => $month ?? null,
                'shopInvoices' => $shopData,
                'shopTotal' => round($shopTotal, 2),
                'outsourceInvoices' => $outsourceData,
                'outsourceTotal' => round($outsourceTotal, 2),
                'grandTotal' => round($grandTotal, 2),
                'summary' => [
                    'totalInvoices' => $invoices->count(),
                    'shopCount' => $shopInvoices->count(),
                    'outsourceCount' => $outsourceInvoices->count(),
                ]
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch monthly revenue report',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Export monthly invoice revenue report to Excel (CSV format)
     */
    public function exportMonthlyInvoiceRevenue(Request $request)
    {
        try {
            $user = auth()->user();
            $month = $request->get('month');
            $startDate = $request->get('start_date');
            $endDate = $request->get('end_date');
            $branchId = $request->get('branch_id');

            // Build base query for invoices
            $invoiceQuery = Invoice::with(['customer', 'ticket', 'branch'])
                ->where('status', 'paid');

            // Apply date filters based on filter type
            $periodDescription = '';
            if ($month) {
                // Month filter - filter by invoice_date
                $date = Carbon::createFromFormat('Y-m', $month);
                $year = $date->year;
                $monthNumber = $date->month;
                $invoiceQuery->whereYear('invoice_date', $year)
                             ->whereMonth('invoice_date', $monthNumber);
                $periodDescription = $date->format('F Y');
            } elseif ($startDate && $endDate) {
                // Date range filter - filter by invoice_date
                $invoiceQuery->whereBetween('invoice_date', [$startDate, $endDate]);
                $periodDescription = Carbon::parse($startDate)->format('d M Y') . ' to ' . Carbon::parse($endDate)->format('d M Y');
            } else {
                // Default to current month
                $invoiceQuery->whereYear('invoice_date', Carbon::now()->year)
                             ->whereMonth('invoice_date', Carbon::now()->month);
                $periodDescription = Carbon::now()->format('F Y');
            }

            // Apply branch filter based on request or user role
            if ($branchId && $branchId !== 'all') {
                $invoiceQuery->where('branch_id', $branchId);
            } elseif ($user->role_id != 1 && $user->branch_id) {
                $invoiceQuery->where('branch_id', $user->branch_id);
            }

            // Get all paid invoices for the month
            $invoices = $invoiceQuery->get();

            // Separate invoices by service_type
            $shopInvoices = $invoices->where('service_type', 'Shop');
            $outsourceInvoices = $invoices->where('service_type', 'Outsource');

            // Calculate totals
            $shopTotal = $shopInvoices->sum('net_amount');
            $outsourceTotal = $outsourceInvoices->sum('net_amount');
            $grandTotal = $shopTotal + $outsourceTotal;

            // Generate CSV content
            $csvContent = $this->generateMonthlyRevenueCsv(
                $shopInvoices,
                $outsourceInvoices,
                $shopTotal,
                $outsourceTotal,
                $grandTotal,
                $periodDescription
            );

            // Generate filename based on filter type
            if ($month) {
                $filename = 'monthly_revenue_report_' . str_replace('-', '_', $month) . '.csv';
            } elseif ($startDate && $endDate) {
                $filename = 'revenue_report_' . str_replace('-', '_', $startDate) . '_to_' . str_replace('-', '_', $endDate) . '.csv';
            } else {
                $filename = 'revenue_report_' . Carbon::now()->format('Y_m') . '.csv';
            }

            // Return CSV file that can be opened in Excel
            return response($csvContent, 200, [
                'Content-Type' => 'text/csv; charset=UTF-8',
                'Content-Disposition' => 'attachment; filename="' . $filename . '"',
                'Cache-Control' => 'no-cache, no-store, must-revalidate',
                'Pragma' => 'no-cache',
                'Expires' => '0'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to export report: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Generate CSV content for monthly revenue report
     */
    private function generateMonthlyRevenueCsv($shopInvoices, $outsourceInvoices, $shopTotal, $outsourceTotal, $grandTotal, $period)
    {
        $output = fopen('php://temp', 'r+');

        // Add report header
        fputcsv($output, ['REVENUE REPORT']);
        fputcsv($output, []);
        fputcsv($output, ['Period:', $period]);
        fputcsv($output, ['Generated On:', now()->format('d/m/Y H:i')]);
        fputcsv($output, []);

        // Add summary section
        fputcsv($output, ['SUMMARY']);
        fputcsv($output, ['Total Invoices:', $shopInvoices->count() + $outsourceInvoices->count()]);
        fputcsv($output, ['Shop Invoices:', $shopInvoices->count()]);
        fputcsv($output, ['Outsource Invoices:', $outsourceInvoices->count()]);
        fputcsv($output, ['Grand Total:', '₹' . number_format($grandTotal, 2)]);
        fputcsv($output, []);
        fputcsv($output, ['========================================']);
        fputcsv($output, []);

        // SHOP INVOICES SECTION
        fputcsv($output, ['SHOP INVOICES']);
        fputcsv($output, []);

        if ($shopInvoices->count() > 0) {
            // Shop invoices headers
            fputcsv($output, [
                'Sr No',
                'Invoice ID',
                'Customer Name',
                'Tracking Number',
                'Invoice Date',
                'Total Amount (₹)',
                'Discount (₹)',
                'Net Amount (₹)',
                'Branch'
            ]);

            // Shop invoices data
            $index = 1;
            foreach ($shopInvoices as $invoice) {
                fputcsv($output, [
                    $index++,
                    $invoice->invoice_id ?? 'INV-' . str_pad($invoice->id, 6, '0', STR_PAD_LEFT),
                    $invoice->customer ? $invoice->customer->name : 'N/A',
                    $invoice->ticket ? $invoice->ticket->tracking_number : 'N/A',
                    $invoice->invoice_date ? Carbon::parse($invoice->invoice_date)->format('d/m/Y') : 'N/A',
                    number_format($invoice->total_amount ?? 0, 2),
                    number_format($invoice->discount ?? 0, 2),
                    number_format($invoice->net_amount ?? 0, 2),
                    $invoice->branch ? $invoice->branch->branch_name : 'N/A',
                ]);
            }

            // Shop total row
            fputcsv($output, []);
            fputcsv($output, [
                '',
                '',
                '',
                '',
                '',
                '',
                'SHOP TOTAL:',
                '₹' . number_format($shopTotal, 2),
                ''
            ]);
        } else {
            fputcsv($output, ['No shop invoices found for this month']);
        }

        fputcsv($output, []);
        fputcsv($output, ['========================================']);
        fputcsv($output, []);

        // OUTSOURCE INVOICES SECTION
        fputcsv($output, ['OUTSOURCE INVOICES']);
        fputcsv($output, []);

        if ($outsourceInvoices->count() > 0) {
            // Outsource invoices headers
            fputcsv($output, [
                'Sr No',
                'Invoice ID',
                'Customer Name',
                'Tracking Number',
                'Invoice Date',
                'Total Amount (₹)',
                'Discount (₹)',
                'Net Amount (₹)',
                'Branch'
            ]);

            // Outsource invoices data
            $index = 1;
            foreach ($outsourceInvoices as $invoice) {
                fputcsv($output, [
                    $index++,
                    $invoice->invoice_id ?? 'INV-' . str_pad($invoice->id, 6, '0', STR_PAD_LEFT),
                    $invoice->customer ? $invoice->customer->name : 'N/A',
                    $invoice->ticket ? $invoice->ticket->tracking_number : 'N/A',
                    $invoice->invoice_date ? Carbon::parse($invoice->invoice_date)->format('d/m/Y') : 'N/A',
                    number_format($invoice->total_amount ?? 0, 2),
                    number_format($invoice->discount ?? 0, 2),
                    number_format($invoice->net_amount ?? 0, 2),
                    $invoice->branch ? $invoice->branch->branch_name : 'N/A',
                ]);
            }

            // Outsource total row
            fputcsv($output, []);
            fputcsv($output, [
                '',
                '',
                '',
                '',
                '',
                '',
                'OUTSOURCE TOTAL:',
                '₹' . number_format($outsourceTotal, 2),
                ''
            ]);
        } else {
            fputcsv($output, ['No outsource invoices found for this month']);
        }

        fputcsv($output, []);
        fputcsv($output, ['========================================']);
        fputcsv($output, []);

        // GRAND TOTAL SECTION
        fputcsv($output, ['GRAND TOTAL']);
        fputcsv($output, ['Period:', $period]);
        fputcsv($output, ['Shop Total:', '₹' . number_format($shopTotal, 2)]);
        fputcsv($output, ['Outsource Total:', '₹' . number_format($outsourceTotal, 2)]);
        fputcsv($output, ['GRAND TOTAL:', '₹' . number_format($grandTotal, 2)]);

        rewind($output);
        $csv = stream_get_contents($output);
        fclose($output);

        // Add UTF-8 BOM for Excel compatibility
        return "\xEF\xBB\xBF" . $csv;
    }

    /**
     * Get quick stats for reports page
     * Shows total revenue, total tickets, active customers, completion rate
     */
    public function getQuickStats(Request $request)
    {
        try {
            $user = auth()->user();
            
            // Build queries with branch filtering
            $paymentQuery = Payment::query();
            $ticketQuery = Ticket::query();
            $customerQuery = Customer::query();
            
            // Apply branch filter for non-admin users
            if ($user->role_id != 1 && $user->branch_id) {
                $paymentQuery->join('invoices', 'payments.invoice_id', '=', 'invoices.id')
                    ->join('tickets', 'invoices.ticket_id', '=', 'tickets.id')
                    ->where('tickets.branch_id', $user->branch_id);
                $ticketQuery->where('branch_id', $user->branch_id);
                $customerQuery->whereHas('ticket', function($q) use ($user) {
                    $q->where('branch_id', $user->branch_id);
                });
            }
            
            // Get total revenue from payments table
            $totalRevenue = 0;
            if (DB::getSchemaBuilder()->hasTable('payments')) {
                $totalRevenue = $paymentQuery->sum('payments.net_amount') ?? 0;
            }

            // Get total tickets from tickets table
            $totalTickets = $ticketQuery->count();

            // Get active customers (customers with at least one ticket)
            $activeCustomers = (clone $customerQuery)->whereHas('ticket')->count();

            // Get completion rate from tickets table (closed/resolved status >= 3)
            $closedTickets = (clone $ticketQuery)->where('status', '>=', 3)->count();
            $completionRate = $totalTickets > 0 ? round(($closedTickets / $totalTickets) * 100, 1) : 0;

            return response()->json([
                'success' => true,
                'data' => [
                    'totalRevenue' => $totalRevenue,
                    'totalTickets' => $totalTickets,
                    'activeCustomers' => $activeCustomers,
                    'completionRate' => $completionRate,
                    'closedTickets' => $closedTickets,
                    'totalCustomers' => $customerQuery->count()
                ]
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch quick stats',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get monthly summary report
     * Shows comprehensive monthly business overview using payments and other data
     */
    public function getMonthlySummary(Request $request)
    {
        try {
            $user = auth()->user();
            // Get month and year parameters (default to current month)
            $month = $request->get('month', date('m'));
            $year = $request->get('year', date('Y'));
            
            // Calculate date range for the selected month
            $startDate = Carbon::create($year, $month, 1)->startOfMonth();
            $endDate = Carbon::create($year, $month, 1)->endOfMonth();
            
            // Build payment query with branch filtering
            $paymentQuery = Payment::query();
            if ($user->role_id != 1 && $user->branch_id) {
                $paymentQuery->join('invoices', 'payments.invoice_id', '=', 'invoices.id')
                    ->join('tickets', 'invoices.ticket_id', '=', 'tickets.id')
                    ->where('tickets.branch_id', $user->branch_id);
            }
            
            // Get payments data for the month
            $monthlyPayments = (clone $paymentQuery)->whereBetween('payments.created_at', [$startDate, $endDate])
                ->selectRaw('
                    COUNT(*) as total_payments,
                    SUM(payments.net_amount) as total_revenue,
                    SUM(payments.service_charge) as total_service_charge,
                    SUM(payments.discount) as total_discount,
                    AVG(payments.net_amount) as avg_payment,
                    MAX(payments.net_amount) as max_payment,
                    MIN(payments.net_amount) as min_payment
                ')
                ->first();
            
            // Get daily revenue breakdown for the month
            $dailyRevenue = (clone $paymentQuery)->whereBetween('payments.created_at', [$startDate, $endDate])
                ->selectRaw('DATE(payments.created_at) as date, SUM(payments.net_amount) as revenue, COUNT(*) as payment_count')
                ->groupBy('date')
                ->orderBy('date')
                ->get();
            
            // Get payment mode breakdown
            $paymentModes = (clone $paymentQuery)->whereBetween('payments.created_at', [$startDate, $endDate])
                ->selectRaw('payments.payment_mode, COUNT(*) as count, SUM(payments.net_amount) as total')
                ->groupBy('payments.payment_mode')
                ->get();
            
            // Get top paying customers for the month
            $topCustomerQuery = Payment::query();
            
            if ($user->role_id != 1 && $user->branch_id) {
                $topCustomerQuery->join('invoices', 'payments.invoice_id', '=', 'invoices.id')
                    ->join('tickets', 'invoices.ticket_id', '=', 'tickets.id')
                    ->where('tickets.branch_id', $user->branch_id);
            }
            
            $topCustomers = $topCustomerQuery->whereBetween('payments.created_at', [$startDate, $endDate])
                ->join('customers', 'payments.customer_id', '=', 'customers.id')
                ->selectRaw('customers.id, customers.name, COUNT(DISTINCT payments.id) as payment_count, SUM(payments.net_amount) as total_paid')
                ->groupBy('customers.id', 'customers.name')
                ->orderByDesc('total_paid')
                ->limit(5)
                ->get();
            
            // Get ticket statistics for the month
            $ticketStatsQuery = Ticket::query();
            if ($user->role_id != 1 && $user->branch_id) {
                $ticketStatsQuery->where('branch_id', $user->branch_id);
            }
            
            $ticketStats = $ticketStatsQuery->whereBetween('created_at', [$startDate, $endDate])
                ->selectRaw('
                    COUNT(*) as total_tickets,
                    SUM(CASE WHEN status = 1 THEN 1 ELSE 0 END) as open_tickets,
                    SUM(CASE WHEN status = 2 THEN 1 ELSE 0 END) as in_progress_tickets,
                    SUM(CASE WHEN status >= 3 THEN 1 ELSE 0 END) as closed_tickets
                ')
                ->first();
            
            // Get new customers for the month
            $newCustomerQuery = Customer::query();
            if ($user->role_id != 1 && $user->branch_id) {
                // For branch users, count only customers who created tickets in their branch
                $newCustomerQuery->whereHas('ticket', function($q) use ($user, $startDate, $endDate) {
                    $q->where('branch_id', $user->branch_id)
                      ->whereBetween('created_at', [$startDate, $endDate]);
                });
            }
            
            $newCustomers = $newCustomerQuery->whereBetween('created_at', [$startDate, $endDate])
                ->count();
            
            // Compare with previous month
            $prevStartDate = Carbon::create($year, $month, 1)->subMonth()->startOfMonth();
            $prevEndDate = Carbon::create($year, $month, 1)->subMonth()->endOfMonth();
            
            $prevMonthRevenue = (clone $paymentQuery)->whereBetween('payments.created_at', [$prevStartDate, $prevEndDate])
                ->sum('payments.net_amount');
            
            $prevMonthTicketQuery = Ticket::query();
            if ($user->role_id != 1 && $user->branch_id) {
                $prevMonthTicketQuery->where('branch_id', $user->branch_id);
            }
            
            $prevMonthTickets = $prevMonthTicketQuery->whereBetween('created_at', [$prevStartDate, $prevEndDate])
                ->count();
            
            // Calculate growth percentages
            $revenueGrowth = $prevMonthRevenue > 0 
                ? round((($monthlyPayments->total_revenue - $prevMonthRevenue) / $prevMonthRevenue) * 100, 1)
                : 0;
            
            $ticketGrowth = $prevMonthTickets > 0
                ? round((($ticketStats->total_tickets - $prevMonthTickets) / $prevMonthTickets) * 100, 1)
                : 0;
            
            // Format daily revenue data for chart
            $dailyRevenueData = [];
            $currentDate = $startDate->copy();
            while ($currentDate <= $endDate) {
                $dateStr = $currentDate->format('Y-m-d');
                $dayData = $dailyRevenue->firstWhere('date', $dateStr);
                
                $dailyRevenueData[] = [
                    'date' => $dateStr,
                    'day' => $currentDate->format('d'),
                    'dayName' => $currentDate->format('D'),
                    'revenue' => $dayData ? floatval($dayData->revenue) : 0,
                    'payments' => $dayData ? intval($dayData->payment_count) : 0
                ];
                
                $currentDate->addDay();
            }
            
            // Calculate average closure time for tickets
            $closedTicketsQuery = Ticket::whereBetween('created_at', [$startDate, $endDate])
                ->where('status', '>=', 3);
            
            if ($user->role_id != 1 && $user->branch_id) {
                $closedTicketsQuery->where('branch_id', $user->branch_id);
            }
            
            $closedTicketsData = $closedTicketsQuery
                ->selectRaw('AVG(TIMESTAMPDIFF(HOUR, created_at, updated_at)) as avg_hours')
                ->first();
            
            $avgClosureHours = $closedTicketsData->avg_hours ?? 0;
            $avgClosureTime = $avgClosureHours > 0 ? round($avgClosureHours) . ' hours' : '0 hours';
            
            // Process payment modes into the expected format
            $paymentModesFormatted = [
                'cash' => 0,
                'online' => 0,
                'card' => 0,
                'cheque' => 0,
                'other' => 0
            ];
            
            foreach ($paymentModes as $mode) {
                $modeName = strtolower($mode->payment_mode ?? 'other');
                if (isset($paymentModesFormatted[$modeName])) {
                    $paymentModesFormatted[$modeName] = floatval($mode->total);
                } else {
                    $paymentModesFormatted['other'] += floatval($mode->total);
                }
            }
            
            // Format the response data to match frontend expectations
            $summaryData = [
                'month' => $startDate->format('F'),
                'year' => intval($year),
                'totalRevenue' => floatval($monthlyPayments->total_revenue ?? 0),
                'totalPayments' => intval($monthlyPayments->total_payments ?? 0),
                'averagePaymentAmount' => floatval($monthlyPayments->avg_payment ?? 0),
                'paymentModes' => $paymentModesFormatted,
                'topCustomers' => $topCustomers->map(function($customer) {
                    return [
                        'customerId' => 'CUST-' . str_pad($customer->id, 5, '0', STR_PAD_LEFT),
                        'customerName' => $customer->name,
                        'totalPaid' => floatval($customer->total_paid),
                        'paymentCount' => intval($customer->payment_count)
                    ];
                })->toArray(),
                'dailyRevenue' => array_map(function($day) {
                    return [
                        'date' => $day['date'],
                        'revenue' => floatval($day['revenue']),
                        'paymentCount' => intval($day['payments'])
                    ];
                }, $dailyRevenueData),
                'ticketStats' => [
                    'totalTickets' => intval($ticketStats->total_tickets ?? 0),
                    'closedTickets' => intval($ticketStats->closed_tickets ?? 0),
                    'averageClosureTime' => $avgClosureTime
                ],
                'growthPercentage' => floatval($revenueGrowth),
                'previousMonthRevenue' => floatval($prevMonthRevenue),
                'newCustomers' => intval($newCustomers)
            ];
            
            return response()->json([
                'success' => true,
                'data' => $summaryData, // Return data directly, not wrapped in array
                'summary' => [
                    'month' => $startDate->format('F'),
                    'year' => $year,
                    'daysInMonth' => $startDate->daysInMonth,
                    'totalRevenue' => floatval($monthlyPayments->total_revenue ?? 0),
                    'previousMonthRevenue' => floatval($prevMonthRevenue)
                ]
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch monthly summary report',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}