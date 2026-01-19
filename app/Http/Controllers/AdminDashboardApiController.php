<?php

namespace App\Http\Controllers;

use App\Models\Ticket;
use App\Models\Payment;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class AdminDashboardApiController extends Controller
{
    /**
     * Get ticket counts for admin dashboard
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getDashboardStats(Request $request)
    {
        // Get all tickets
        $tickets = Ticket::all();

        // Total tickets count
        $totalTickets = $tickets->count();

        // Count tickets by status
        $openTickets = $tickets->where('status', 1)->count();
        $inProgressTickets = $tickets->where('status', 2)->count();
        $closedTickets = $tickets->where('status', 3)->count();
        $completedTickets = $tickets->where('status', 4)->count();

        // Count overdue tickets (tickets with due_date passed and not closed/completed)
        $today = Carbon::today();
        $overdueTickets = $tickets->filter(function ($ticket) use ($today) {
            return $ticket->status != 3 && $ticket->status != 4 &&
                   $ticket->due_date && Carbon::parse($ticket->due_date)->lt($today);
        })->count();

        // Get current week's daily tickets (Added vs Solved)
        $startOfWeek = Carbon::now()->startOfWeek(Carbon::MONDAY);
        $weeklyTickets = [];
        $dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

        for ($i = 0; $i < 7; $i++) {
            $date = $startOfWeek->copy()->addDays($i);

            // Count tickets added on this day
            $addedCount = Ticket::whereDate('created_at', $date)->count();

            // Count tickets solved/closed on this day (status 3 = closed, status 4 = completed)
            $solvedCount = Ticket::whereDate('updated_at', $date)
                ->whereIn('status', [3, 4])
                ->count();

            $weeklyTickets[] = [
                'day' => $dayNames[$i],
                'date' => $date->format('Y-m-d'),
                'added' => $addedCount,
                'solved' => $solvedCount
            ];
        }

        return response()->json([
            'success' => true,
            'data' => [
                'total_tickets' => $totalTickets,
                'overdue_tickets' => $overdueTickets,
                'completed_tickets' => $completedTickets,
                'open_tickets' => $openTickets,
                'inprogress_tickets' => $inProgressTickets,
                'closed_tickets' => $closedTickets,
                'weekly_tickets' => $weeklyTickets
            ],
            'generated_at' => now()->format('Y-m-d H:i:s')
        ]);
    }

    /**
     * Get quick summary stats (lightweight version)
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getQuickStats(Request $request)
    {
        // Get all tickets
        $tickets = Ticket::all();

        // Total tickets count
        $totalTickets = $tickets->count();

        // Count tickets by status
        $openTickets = $tickets->where('status', 1)->count();
        $inProgressTickets = $tickets->where('status', 2)->count();
        $closedTickets = $tickets->where('status', 3)->count();
        $completedTickets = $tickets->where('status', 4)->count();

        // Count overdue tickets (tickets with due_date passed and not closed/completed)
        $today = Carbon::today();
        $overdueTickets = $tickets->filter(function ($ticket) use ($today) {
            return $ticket->status != 3 && $ticket->status != 4 &&
                   $ticket->due_date && Carbon::parse($ticket->due_date)->lt($today);
        })->count();

        return response()->json([
            'success' => true,
            'data' => [
                'total_tickets' => $totalTickets,
                'overdue_tickets' => $overdueTickets,
                'completed_tickets' => $completedTickets,
                'open_tickets' => $openTickets,
                'inprogress_tickets' => $inProgressTickets,
                'closed_tickets' => $closedTickets
            ],
            'generated_at' => now()->format('Y-m-d H:i:s')
        ]);
    }

    /**
     * Get top technicians by revenue for a specific month (grouped by branch)
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getTopTechnicians(Request $request)
    {
        // Get filters from request
        $branchId = $request->input('branch_id');
        $month = 12; //$request->input('month', now()->format('m'));
        $year = 2025; //$request->input('year', now()->format('Y'));

        // If branch_id is not provided or is 'all', default to branch_id = 1
        if (!$branchId || $branchId === 'all') {
            $branchId = 1;
        }

        // Get all technicians with revenue data using proper table relationships
        // Start from agent_ticket pivot table to get agent assignments
        $query = DB::table('agent_ticket')
            ->select(
                'users.id',
                'users.name',
                'users.email',
                'users.branch_id',
                DB::raw('SUM(payments.paid_amount) as total_revenue'),
                DB::raw('COUNT(DISTINCT agent_ticket.ticket_id) as tickets_count')
            )
            ->join('users', 'agent_ticket.agent_id', '=', 'users.id')
            ->join('tickets', 'agent_ticket.ticket_id', '=', 'tickets.id')
            ->join('payments', 'tickets.id', '=', 'payments.ticket_id')
            ->whereMonth('payments.created_at', $month)
            ->whereYear('payments.created_at', $year)
            ->where('users.branch_id', $branchId)
            ->groupBy('users.id', 'users.name', 'users.email', 'users.branch_id');

        // Get all technicians with their revenue
        $allTechnicians = $query->orderBy('total_revenue', 'DESC')->get();

        // Group by branch and get top 3 for each branch
        $techniciansByBranch = $allTechnicians->groupBy('branch_id');

        $results = [];
        foreach ($techniciansByBranch as $branchId => $technicians) {
            // Get top 3 for this branch
            $topThree = $technicians->take(3);

            foreach ($topThree as $technician) {
                // Get branch name
                $branch = DB::table('branches')->where('id', $branchId)->first();

                $results[] = [
                    'id' => $technician->id,
                    'name' => $technician->name,
                    'email' => $technician->email,
                    'branch_id' => $technician->branch_id,
                    'branch_name' => $branch ? $branch->branch_name : 'N/A',
                    'total_revenue' => (float) $technician->total_revenue,
                    'tickets_count' => (int) $technician->tickets_count
                ];
            }
        }

        // Group results by branch for frontend
        $groupedResults = collect($results)->groupBy('branch_name')->map(function ($technicians) {
            return $technicians->values()->all();
        })->all();

        return response()->json([
            'success' => true,
            'data' => $groupedResults,
            'filters' => [
                'month' => $month,
                'year' => $year,
                'branch_id' => $request->input('branch_id')
            ],
            'generated_at' => now()->format('Y-m-d H:i:s')
        ]);
    }
}
