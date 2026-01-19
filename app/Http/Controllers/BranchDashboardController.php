<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Ticket;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class BranchDashboardController extends Controller
{
    public function getStats(Request $request)
    {
        $user = auth()->user();
        
        // Only allow Branch Admin (role_id = 4) to access this dashboard
        if ($user->role_id != 4) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }
        
        $branchId = $user->branch_id;
        
        // Get total tickets for this branch
        $totalTickets = Ticket::where('branch_id', $branchId)->count();
        
        // Get overdue tickets (status != 3 which is closed, with due date passed)
        $overdueTickets = Ticket::where('branch_id', $branchId)
            ->where('status', '!=', 3)
            ->where('due_date', '<', now()->format('Y-m-d'))
            ->count();
        
        // Get open tickets (status != 3 which is closed)
        $openTickets = Ticket::where('branch_id', $branchId)
            ->where('status', '!=', 3)
            ->count();
        
        // Get closed tickets (status = 3)
        $closedTickets = Ticket::where('branch_id', $branchId)
            ->where('status', 3)
            ->count();
        
        // Get monthly data for the last 12 months
        $monthlyData = $this->getMonthlyTicketData($branchId);
        
        return response()->json([
            'totalTickets' => $totalTickets,
            'overdueTickets' => $overdueTickets,
            'openTickets' => $openTickets,
            'closedTickets' => $closedTickets,
            'monthlyData' => $monthlyData
        ]);
    }
    
    
    private function getMonthlyTicketData($branchId)
    {
        $data = [];
        $currentDate = Carbon::now();
        
        for ($i = 11; $i >= 0; $i--) {
            $date = $currentDate->copy()->subMonths($i);
            $monthName = $date->format('M');
            
            // Get ticket count for this month
            $ticketCount = Ticket::where('branch_id', $branchId)
                ->whereYear('created_at', $date->year)
                ->whereMonth('created_at', $date->month)
                ->count();
            
            // Calculate trend (simple moving average)
            $trend = $this->calculateTrend($branchId, $date);
            
            $data[] = [
                'month' => $monthName,
                'tickets' => $ticketCount,
                'trend' => $trend
            ];
        }
        
        return $data;
    }
    
    private function calculateTrend($branchId, $date)
    {
        // Simple 3-month moving average for trend
        $sum = 0;
        $count = 0;
        
        for ($i = 0; $i < 3; $i++) {
            $monthDate = $date->copy()->subMonths($i);
            $tickets = Ticket::where('branch_id', $branchId)
                ->whereYear('created_at', $monthDate->year)
                ->whereMonth('created_at', $monthDate->month)
                ->count();
            $sum += $tickets;
            $count++;
        }
        
        return $count > 0 ? round($sum / $count) : 0;
    }
}