<?php

namespace App\Http\Controllers;

use App\Models\SchedulePickup;
use App\Models\Ticket;
use Illuminate\Http\Request;

class SchedulePickupController extends Controller
{
    /**
     * Get schedule pickups for a ticket by tracking number
     */
    public function getByTrackingNumber($trackingNumber)
    {
        // Find ticket by tracking number
        $ticket = Ticket::withTrashed()
            ->where('tracking_number', $trackingNumber)
            ->first();

        if (!$ticket) {
            return response()->json([
                'success' => false,
                'message' => 'Ticket not found'
            ], 404);
        }

        $schedulePickups = SchedulePickup::where('ticket_id', $ticket->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $schedulePickups
        ]);
    }

    /**
     * Store a new schedule pickup for public tracking
     */
    public function storeByTrackingNumber(Request $request, $trackingNumber)
    {
        $validated = $request->validate([
            'address' => 'required|string|max:255',
            'landmark' => 'nullable|string|max:255',
            'schedule_date' => 'required|date',
            'time_slot' => 'required|string|max:255',
            'contact_person' => 'required|string|max:255',
            'mobile' => 'required|string|max:15'
        ]);

        // Find ticket by tracking number
        $ticket = Ticket::withTrashed()
            ->where('tracking_number', $trackingNumber)
            ->first();

        if (!$ticket) {
            return response()->json([
                'success' => false,
                'message' => 'Ticket not found'
            ], 404);
        }

        $schedulePickup = SchedulePickup::create([
            'ticket_id' => $ticket->id,
            'branch_id' => $ticket->branch_id,
            'address' => $validated['address'],
            'landmark' => $validated['landmark'],
            'schedule_date' => $validated['schedule_date'],
            'time_slot' => $validated['time_slot'],
            'contact_person' => $validated['contact_person'],
            'mobile' => $validated['mobile'],
            'status' => 'No' // Default status for new pickups
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Schedule pickup created successfully',
            'data' => $schedulePickup
        ], 201);
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = SchedulePickup::with([
            'ticket:id,tracking_number,issue,customer_id,branch_id', 
            'ticket.customer:id,name,mobile,country_code',
            'branch:id,branch_name'
        ]);

        // Role-based filtering
        $user = auth()->user();
        if ($user->role_id != 1) {
            // For non-admin users, only show pickups from their branch
            $query->where('branch_id', $user->branch_id);
        }
        // Admin users (role_id = 1) can see all records, so no additional filtering

        if ($request->has('ticket_id')) {
            $query->where('ticket_id', $request->ticket_id);
        }

        // Date range filtering
        if ($request->filled('start_date')) {
            $query->whereDate('schedule_date', '>=', $request->start_date);
        }

        if ($request->filled('end_date')) {
            $query->whereDate('schedule_date', '<=', $request->end_date);
        }

        // Status filtering
        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        // Branch filtering
        if ($request->filled('branch_id') && $request->branch_id !== 'all') {
            $query->where('branch_id', $request->branch_id);
        }

        // Search filtering
        if ($request->filled('search')) {
            $searchTerm = $request->search;
            $query->where(function($q) use ($searchTerm) {
                $q->where('contact_person', 'LIKE', "%{$searchTerm}%")
                  ->orWhere('mobile', 'LIKE', "%{$searchTerm}%")
                  ->orWhere('address', 'LIKE', "%{$searchTerm}%")
                  ->orWhereHas('ticket', function($ticketQuery) use ($searchTerm) {
                      $ticketQuery->where('tracking_number', 'LIKE', "%{$searchTerm}%")
                                 ->orWhere('issue', 'LIKE', "%{$searchTerm}%");
                  });
            });
        }

        $perPage = $request->get('per_page', 10);
        $schedulePickups = $query->orderBy('schedule_date', 'desc')
                                ->orderBy('created_at', 'desc')
                                ->paginate($perPage);

        return response()->json($schedulePickups);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'ticket_id' => 'required|exists:tickets,id',
            'address' => 'required|string|max:255',
            'landmark' => 'nullable|string|max:255',
            'schedule_date' => 'required|date',
            'time_slot' => 'required|string|max:255',
            'contact_person' => 'required|string|max:255',
            'mobile' => 'required|string|max:15'
        ]);

        // Set default status to 'No' for new pickups
        $validated['status'] = 'No';

        $ticket=Ticket::where('id',$request->ticket_id)->first();
        $branch_id=($ticket)?$ticket->branch_id:null;
        $validated['branch_id']=$branch_id;

        $schedulePickup = SchedulePickup::create($validated);

        return response()->json([
            'message' => 'Schedule pickup created successfully',
            'data' => $schedulePickup
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(SchedulePickup $schedulePickup)
    {
        return response()->json([
            'data' => $schedulePickup->load('ticket')
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, SchedulePickup $schedulePickup)
    {
        $validated = $request->validate([
            'address' => 'sometimes|required|string|max:255',
            'landmark' => 'nullable|string|max:255',
            'schedule_date' => 'sometimes|required|date',
            'time_slot' => 'sometimes|required|string|max:255',
            'contact_person' => 'sometimes|required|string|max:255',
            'mobile' => 'sometimes|required|string|max:15',
            'status' => 'sometimes|required|string|in:No,Collected'
        ]);

        // Get branch_id from the existing schedule pickup's ticket
        $ticket = Ticket::find($schedulePickup->ticket_id);
        if ($ticket) {
            $validated['branch_id'] = $ticket->branch_id;
        }

        $schedulePickup->update($validated);

        return response()->json([
            'message' => 'Schedule pickup updated successfully',
            'data' => $schedulePickup
        ]);
    }

    /**
     * Export schedule pickups to CSV
     */
    public function export(Request $request)
    {
        $query = SchedulePickup::with([
            'ticket:id,tracking_number,issue,customer_id,branch_id', 
            'ticket.customer:id,name,mobile,country_code',
            'branch:id,branch_name'
        ]);

        // Role-based filtering - same as index method
        $user = auth()->user();
        if ($user->role_id != 1) {
            // For non-admin users, only export pickups from their branch
            $query->where('branch_id', $user->branch_id);
        }
        // Admin users (role_id = 1) can export all records

        // Apply same filters as index method
        if ($request->has('ticket_id')) {
            $query->where('ticket_id', $request->ticket_id);
        }

        // Date range filtering
        if ($request->filled('start_date')) {
            $query->whereDate('schedule_date', '>=', $request->start_date);
        }

        if ($request->filled('end_date')) {
            $query->whereDate('schedule_date', '<=', $request->end_date);
        }

        // Status filtering
        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        // Branch filtering
        if ($request->filled('branch_id') && $request->branch_id !== 'all') {
            $query->where('branch_id', $request->branch_id);
        }

        // Search filtering
        if ($request->filled('search')) {
            $searchTerm = $request->search;
            $query->where(function($q) use ($searchTerm) {
                $q->where('contact_person', 'LIKE', "%{$searchTerm}%")
                  ->orWhere('mobile', 'LIKE', "%{$searchTerm}%")
                  ->orWhere('address', 'LIKE', "%{$searchTerm}%")
                  ->orWhereHas('ticket', function($ticketQuery) use ($searchTerm) {
                      $ticketQuery->where('tracking_number', 'LIKE', "%{$searchTerm}%")
                                 ->orWhere('issue', 'LIKE', "%{$searchTerm}%");
                  });
            });
        }

        $schedulePickups = $query->orderBy('schedule_date', 'desc')
                                ->orderBy('created_at', 'desc')
                                ->get();

        // Create CSV content
        $csvData = [];
        $csvData[] = [
            'S.No',
            'Ticket ID',
            'Issue',
            'Branch',
            'Customer Name',
            'Customer Mobile',
            'Pickup Address',
            'Landmark',
            'Schedule Date',
            'Time Slot',
            'Contact Person',
            'Contact Mobile',
            'Status',
            'Created At'
        ];

        foreach ($schedulePickups as $index => $pickup) {
            $csvData[] = [
                $index + 1,
                $pickup->ticket->tracking_number ?? "#" . $pickup->ticket_id,
                $pickup->ticket->issue ?? '-',
                $pickup->branch->branch_name ?? '-',
                $pickup->ticket->customer->name ?? '-',
                ($pickup->ticket->customer->country_code ?? '') . ' ' . ($pickup->ticket->customer->mobile ?? ''),
                $pickup->address,
                $pickup->landmark ?? '-',
                $pickup->schedule_date,
                $pickup->time_slot,
                $pickup->contact_person,
                $pickup->mobile,
                $pickup->status,
                $pickup->created_at->format('Y-m-d H:i:s')
            ];
        }

        // Convert to CSV string
        $output = fopen('php://temp', 'r+');
        foreach ($csvData as $row) {
            fputcsv($output, $row);
        }
        rewind($output);
        $csv = stream_get_contents($output);
        fclose($output);

        // Return CSV response
        return response($csv)
            ->header('Content-Type', 'text/csv')
            ->header('Content-Disposition', 'attachment; filename="scheduled-pickups-' . date('Y-m-d') . '.csv"');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(SchedulePickup $schedulePickup)
    {
        $schedulePickup->delete();

        return response()->json([
            'message' => 'Schedule pickup deleted successfully'
        ]);
    }
}