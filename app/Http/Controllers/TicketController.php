<?php

namespace App\Http\Controllers;

use App\Models\Ticket;
use App\Models\Activity;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use App\Models\TicketLogNote;
use App\Models\TicketCustomerNote;
use App\Models\TicketLabel;
use App\Models\TicketStatus;
use App\Models\User;
use App\Models\Task;
use App\Models\AgentTask;
use App\Models\Product;
use App\Models\Branch;
use App\Models\ProductTicket;
use App\Models\Notification;
use App\Models\Customer;
use App\Models\TicketHistory;
use App\Models\TelegramNotificationSetting;
use Illuminate\Support\Facades\DB;
use Auth;
use App\Services\WhatsappApiService;
use App\Services\TelegramService;

use App\Services\SmsApiService;

use Log;


class TicketController extends Controller
{
    use WhatsappApiService, SmsApiService, TelegramService;
    
    /**
     * Display a listing of the resource.
     */
    

    public function index(Request $request)
    {
        $user = auth()->user();
        $query = Ticket::with(['customer', 'user', 'ticketStatus', 'ticketPriority', 'agent', 'notifyTo', 'ticketLabel', 'branch', 'activity.user', 'activity.status', 'activity.priority', 'invoice']);

        // Apply default 3-month filter if no date range is specified
        if (!$request->has('start_date') && !$request->has('end_date')) {
            $threeMonthsAgo = date('Y-m-d', strtotime('-3 months'));
            $today = date('Y-m-d');
            $query->whereDate('created_at', '>=', $threeMonthsAgo)
                  ->whereDate('created_at', '<=', $today);
        }

        // Filter tickets based on user role
        if ($user->role_id == 2) {
            // Agents (role_id = 2) see tickets from their branch that are either assigned to them OR notified to them
            $query->where(function($q) use ($user) {
                // Must be either assigned or notified to this agent
                $q->whereHas('agent', function($subQ) use ($user) {
                    $subQ->where('agent_id', $user->id);
                })->orWhereHas('notifyTo', function($subQ) use ($user) {
                    $subQ->where('agent_id', $user->id);
                });
            });

            // AND must be from their branch (or NULL branch for backwards compatibility)
            if ($user->branch_id) {
                $query->where(function($q) use ($user) {
                    $q->where('branch_id', $user->branch_id)
                      ->orWhereNull('branch_id');
                });
            }

        } elseif ($user->role_id == 3) {
            // Manager (role_id = 3) sees tickets assigned to their agents only
            $assignedAgentIds = \DB::table('assign_agents')
                ->where('user_id', $user->id)
                ->pluck('agent_id')
                ->toArray();

            if (!empty($assignedAgentIds)) {
                $query->whereHas('agent', function($q) use ($assignedAgentIds) {
                    $q->whereIn('agent_id', $assignedAgentIds);
                });
            } else {
                // If manager has no assigned agents, show no tickets
                $query->whereRaw('1 = 0');
            }

        } elseif ($user->role_id == 4) {
            // Branch Admin (role_id = 4) sees only tickets from their branch
            if ($user->branch_id) {
                $query->where('branch_id', $user->branch_id);
            }
        }
        
        // Admin users (role_id = 1) can see all tickets - no filter needed
        
        // Search functionality
        if ($request->has('search') && $request->search != '') {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('issue', 'like', '%' . $search . '%')
                  ->orWhere('description', 'like', '%' . $search . '%')
                  ->orWhere('tracking_number', 'like', '%' . $search . '%')
                  ->orWhereHas('customer', function($q) use ($search) {
                      $q->where('name', 'like', '%' . $search . '%');
                  });
            });
        }
        
        // Status filter

        
        if ($request->has('status') && $request->status != null && $request->status != 'all') {
            $query->where('status', $request->status);
        }
        
        // Customer filter
        if ($request->has('customer_id') && $request->customer_id != null && $request->customer_id != 'all') {
            $query->where('customer_id', $request->customer_id);
        }

        // Agent filter - filter tickets by assigned agent
        if ($request->has('agent_id') && $request->agent_id != null && $request->agent_id != 'all') {
            $query->whereHas('agent', function($q) use ($request) {
                $q->where('agent_id', $request->agent_id);
            });
        }

        // Branch filter - filter tickets by branch
        if ($request->has('branch_id') && $request->branch_id != null && $request->branch_id != 'all') {
            $query->where('branch_id', $request->branch_id);
        }

        // Date range filter
        if ($request->has('start_date') && $request->start_date != null) {
            $query->whereDate('created_at', '>=', $request->start_date);
        }
        if ($request->has('end_date') && $request->end_date != null) {
            $query->whereDate('created_at', '<=', $request->end_date);
        }
        
        // Ticket type filter (based on tracking_number prefix)
        if ($request->has('ticket_type') && $request->ticket_type != null && $request->ticket_type != 'all') {
            $prefix = $request->ticket_type;
            $query->where('tracking_number', 'like', $prefix . '%');
        }

        // Ticket label filter
        if ($request->has('label_id') && $request->label_id != null && $request->label_id != 'all') {
            $query->whereHas('ticketLabel', function($q) use ($request) {
                $q->where('ticket_labels.id', $request->label_id);
            });
        }

        // Due date filter - filter tickets due today
        if ($request->has('due') && $request->due == 'today') {
            \Log::info('Filtering tickets due today: ' . date('Y-m-d'));
            $query->whereDate('due_date', date('Y-m-d'));
        }

        // Sorting
        $sortField = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');

        // If filtering by due today, sort by due_date
        if ($request->has('due') && $request->due == 'today') {
            $sortField = 'due_date';
            $sortOrder = 'asc'; // Show earliest due time first
        }

        $query->orderBy($sortField, $sortOrder);
                
        // Pagination with custom per page
        $perPage = $request->get('per_page', 10);
        $tickets = $query->paginate($perPage);

        return response()->json($tickets);
    }

    /**
     * Display a listing of closed tickets only (status = 3).
     */
    public function closedTickets(Request $request)
    {
        $user = auth()->user();
        $query = Ticket::with(['customer', 'user', 'ticketStatus', 'ticketPriority', 'agent', 'notifyTo', 'ticketLabel', 'activity.user', 'activity.status', 'activity.priority'])
        ->where('status', 3); // Only closed tickets

        // Filter tickets based on user role
        if ($user->role_id == 2) {
            // Agents (role_id = 2) see tickets from their branch that are either assigned to them OR notified to them
            $query->where(function($q) use ($user) {
                // Must be either assigned or notified to this agent
                $q->whereHas('agent', function($subQ) use ($user) {
                    $subQ->where('agent_id', $user->id);
                })->orWhereHas('notifyTo', function($subQ) use ($user) {
                    $subQ->where('agent_id', $user->id);
                });
            });

            // AND must be from their branch (or NULL branch for backwards compatibility)
            if ($user->branch_id) {
                $query->where(function($q) use ($user) {
                    $q->where('branch_id', $user->branch_id)
                      ->orWhereNull('branch_id');
                });
            }

        } elseif ($user->role_id == 3) {
            // Manager (role_id = 3) sees tickets assigned to their agents only
            $assignedAgentIds = \DB::table('assign_agents')
                ->where('user_id', $user->id)
                ->pluck('agent_id')
                ->toArray();

            if (!empty($assignedAgentIds)) {
                $query->whereHas('agent', function($q) use ($assignedAgentIds) {
                    $q->whereIn('agent_id', $assignedAgentIds);
                });
            } else {
                // If manager has no assigned agents, show no tickets
                $query->whereRaw('1 = 0');
            }

        } elseif ($user->role_id == 4) {
            // Branch Admin (role_id = 4) sees only tickets from their branch
            if ($user->branch_id) {
                $query->where('branch_id', $user->branch_id);
            }
        }

        // Admin users (role_id = 1) can see all tickets - no filter needed

        // Search functionality
        if ($request->has('search') && $request->search != '') {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('issue', 'like', '%' . $search . '%')
                  ->orWhere('description', 'like', '%' . $search . '%')
                  ->orWhere('tracking_number', 'like', '%' . $search . '%')
                  ->orWhereHas('customer', function($q) use ($search) {
                      $q->where('name', 'like', '%' . $search . '%');
                  });
            });
        }

        // Customer filter
        if ($request->has('customer_id') && $request->customer_id != null && $request->customer_id != 'all') {
            $query->where('customer_id', $request->customer_id);
        }

        // Agent filter - filter tickets by assigned agent
        if ($request->has('agent_id') && $request->agent_id != null && $request->agent_id != 'all') {
            $query->whereHas('agent', function($q) use ($request) {
                $q->where('agent_id', $request->agent_id);
            });
        }

        // Date range filter
        if ($request->has('start_date') && $request->start_date != null) {
            $query->whereDate('created_at', '>=', $request->start_date);
        }
        if ($request->has('end_date') && $request->end_date != null) {
            $query->whereDate('created_at', '<=', $request->end_date);
        }

        // Ticket type filter (based on tracking_number prefix)
        if ($request->has('ticket_type') && $request->ticket_type != null && $request->ticket_type != 'all') {
            $prefix = $request->ticket_type;
            $query->where('tracking_number', 'like', $prefix . '%');
        }

        // Ticket label filter
        if ($request->has('label_id') && $request->label_id != null && $request->label_id != 'all') {
            $query->whereHas('ticketLabel', function($q) use ($request) {
                $q->where('ticket_labels.id', $request->label_id);
            });
        }

        // Priority filter
        if ($request->has('priority_id') && $request->priority_id != null && $request->priority_id != 'all') {
            $query->where('priority', $request->priority_id);
        }

        // Branch filter
        if ($request->has('branch_id') && $request->branch_id != null && $request->branch_id != 'all') {
            $query->where('branch_id', $request->branch_id);
        }

        // Sorting
        $sortField = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortField, $sortOrder);

        // Pagination with custom per page
        $perPage = $request->get('per_page', 10);
        $tickets = $query->paginate($perPage);

        return response()->json($tickets);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'issue' => 'required|string|max:255',
            'description' => 'nullable|string',
            'customer_id' => 'required|exists:customers,id',
            'priority' => 'required|numeric',
            'status' => 'required|numeric',
            'due_date' => 'nullable|date',
            'ticket_type' => 'required|in:In Shop,On Site',
            'branch_id' => 'nullable|integer|exists:branches,id',
            'service_id' => 'nullable|string',
            'assigned_users' => 'nullable|array',
            'assigned_users.*' => 'exists:users,id',
            'notify_users' => 'nullable|array',
            'notify_users.*' => 'exists:users,id',
            'accessories' => 'nullable|array',
            'accessories.*' => 'exists:accessories,id',
        ]);

        $validated['created_by'] = auth()->id();
        $newTicketStatus=$validated['status'];
        
        // Auto-assign branch_id based on user role
        $user = auth()->user();
        if ($user->role_id != 1) {
            // For non-admin users, use their branch_id
            $validated['branch_id'] = $user->branch_id;
        }
        // Admin users can specify branch_id or leave it null
        
        // Generate unique tracking number with TKT prefix
        $lastTicket = Ticket::withTrashed()->orderBy('id', 'desc')->first();
        $nextNumber = $lastTicket ? $lastTicket->id + 1 : 1;
        
        if($request->ticket_type=="In Shop")
            $validated['tracking_number'] = 'TKT' . str_pad($nextNumber, 7, '0', STR_PAD_LEFT);
        else
            $validated['tracking_number'] = 'ONS' . str_pad($nextNumber, 7, '0', STR_PAD_LEFT);  
        
        // Ensure uniqueness
        while (Ticket::withTrashed()->where('tracking_number', $validated['tracking_number'])->exists()) {
            $nextNumber++;

            if($request->ticket_type=="In Shop")
                $validated['tracking_number'] = 'TKT' . str_pad($nextNumber, 7, '0', STR_PAD_LEFT);
            else
                $validated['tracking_number'] = 'ONS' . str_pad($nextNumber, 7, '0', STR_PAD_LEFT);  

            }
        
        $validated['slug'] = Str::slug($validated['issue'] . '-' . time());

        // Extract agents, notify users, and accessories before creating ticket
        $assignedUsers = $validated['assigned_users'] ?? [];
        $notifyUsers = $validated['notify_users'] ?? [];
        $accessoryIds = $validated['accessories'] ?? [];
        unset($validated['assigned_users'], $validated['notify_users'], $validated['accessories']);
        
        // Process accessories data if provided
        if (!empty($accessoryIds)) {
            $accessories = \App\Models\Accessory::whereIn('id', $accessoryIds)->get(['id', 'name']);
            $validated['accessories'] = $accessories->toArray();
        }

        $ticket = Ticket::create($validated);

        // Attach assigned agents to agent_ticket table
        if (!empty($assignedUsers)) {
            $ticket->agent()->attach($assignedUsers);
        }

        // Attach notify users to notify_ticket table
        if (!empty($notifyUsers)) {
            $ticket->notifyTo()->attach($notifyUsers);
        }
        if($ticket)
        {
            $notMsg="Ticket:#".$ticket->id." ".$ticket->issue." created by ".Auth::user()->name;
            Notification::create([
                'type'=>1,
                'notifiable_type'=>1,
                'notifiable_id'=>1,
                'data'=>$notMsg
            ]);

            // Insert into ticket_histories table for new ticket creation
            TicketHistory::create([
                'ticket_id' => $ticket->id,
                'tracking_id' => $ticket->tracking_number,
                'customer_id' => $ticket->customer_id,
                'comment' => $this->getStatusComment($ticket->status, $ticket->tracking_number),
                'created_by' => auth()->id()
            ]);
        }

          $customer=Customer::where('id',$ticket->customer_id)->first();

        //---- To send whatsapp message ----- service request --------------
        
          $this->sendWhatsappServiceMessages($ticket,$newTicketStatus);

          //send SMS message --------------------------------------
          
          $this->sendSmsMessages($ticket,$customer,$newTicketStatus);
          //-------------------------------------------------------
          

        /* ---- To send Telegram notification for getlead ----- ticket created -------------- */

            // Check if new_ticket notification is enabled
            if (TelegramNotificationSetting::isEnabled('new_ticket'))
            {
                try
                {
                    // Load relationships for Telegram message
                    $ticket->load(['customer', 'user', 'ticketStatus', 'ticketPriority', 'agent', 'notifyTo', 'branch']);

                    // Get assigned agents names
                    $assignedAgentNames = $ticket->agent->pluck('name')->implode(', ');

                    // Get notified agents names
                    $notifiedAgentNames = $ticket->notifyTo->pluck('name')->implode(', ');

                    // Get branch name
                    $branchName = $ticket->branch ? $ticket->branch->branch_name : 'N/A';

                    // Get status name
                    $statusName = $ticket->ticketStatus ? $ticket->ticketStatus->status : 'N/A';

                    // Get priority name
                    $priorityName = $ticket->ticketPriority ? $ticket->ticketPriority->name : 'N/A';

                    $telegramData = [
                        "tracking_number" => $ticket->tracking_number,
                        "issue" => $ticket->issue,
                        "description" => $ticket->description ?? 'N/A',
                        "customer_name" => $customer->name ?? 'N/A',
                        "customer_mobile" => ($customer->country_code ?? '') . ($customer->mobile ?? ''),
                        "created_date" => $ticket->created_at->format('d-m-Y'),
                        "created_time" => $ticket->created_at->format('h:i A'),
                        "created_by" => Auth::user()->name,
                        "assigned_agents" => $assignedAgentNames ?: 'None',
                        "notified_agents" => $notifiedAgentNames ?: 'None',
                        "branch" => $branchName,
                        "priority" => $priorityName,
                        "status" => $statusName,
                        "due_date" => $ticket->due_date ? date('d-m-Y', strtotime($ticket->due_date)) : null
                    ];

                    $this->sendTelegramNotification($telegramData);
                }
                catch (\Exception $e) {
                    \Log::error("Telegram notification error: " . $e->getMessage());
                }
            }

        //-------------------------------------------------------------------

        return response()->json([
            'message' => 'Ticket created successfully',
            'ticket' => $ticket->load(['customer', 'user', 'ticketStatus', 'ticketPriority', 'agent', 'notifyTo', 'activity.user', 'activity.status', 'activity.priority']),
            'id' => $ticket->id
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Ticket $ticket)
    {
        return response()->json(
            $ticket->load(['customer', 'user', 'ticketStatus', 'ticketPriority', 'agent', 'notifyTo', 'ticketLabel', 'branch', 'activity.user', 'activity.status', 'activity.priority'])
        );
    }

    /**
     * Update ticket issue and description only.
     */
    public function updateIssueDescription(Request $request, Ticket $ticket)
    {
        $validated = $request->validate([
            'issue' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        // Store original values for comparison
        $originalIssue = $ticket->issue;
        $originalDescription = $ticket->description;

        // Update ticket
        $ticket->update([
            'issue' => $validated['issue'],
            'description' => $validated['description'],
        ]);

        // Build activity note with changes
        $changes = [];
        if ($originalIssue !== $validated['issue']) {
            $changes[] = "Issue updated";
        }
        if ($originalDescription !== $validated['description']) {
            $changes[] = "Description updated";
        }

        $noteText = !empty($changes) ? implode(' and ', $changes) : 'Ticket details updated';

        // Log activity
        Activity::create([
            'ticket_id' => $ticket->id,
            'type' => 'Ticket Updated',
            'note' => $noteText,
            'created_by' => auth()->id() ?? 1,
        ]);

        return response()->json([
            'message' => 'Ticket updated successfully',
            'ticket' => $ticket->load(['customer', 'user', 'ticketStatus', 'ticketPriority', 'agent', 'notifyTo', 'ticketLabel', 'activity.user', 'activity.status', 'activity.priority'])
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Ticket $ticket)
    {
        $validated = $request->validate([
            'issue' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'customer_id' => 'sometimes|required|exists:customers,id',
            'priority' => 'nullable|integer|exists:priorities,id',
            'status' => 'nullable|integer|exists:ticket_statuses,id',
            'due_date' => 'nullable|date',
            'due_time' => 'nullable|string',
            'closed_time' => 'nullable|string',
            'ticket_type' => 'nullable|in:In Shop,On Site',
            'branch_id' => 'nullable|integer|exists:branches,id',
            'service_id' => 'nullable|string',
            'branch' => 'nullable|string',
            'assigned_users' => 'nullable|array',
            'assigned_users.*' => 'exists:users,id',
            'notify_users' => 'nullable|array',
            'notify_users.*' => 'exists:users,id',
            'ticket_labels' => 'nullable|array',
            'ticket_labels.*' => 'exists:ticket_labels,id',
            'accessories' => 'nullable|array',
            'accessories.*' => 'exists:accessories,id',
        ]);

        // Store original values for comparison
        $originalStatus = $ticket->status;
        $originalPriority = $ticket->priority;
        $originalBranch = $ticket->branch_id;
        $originalDueDate = $ticket->due_date;
        $originalClosedTime = $ticket->closed_time;
        $newTicketStatus=$validated['status'];

        // Update ticket basic info

        $ticketData = $validated;

        if(isset($validated['status']) && $validated['status']==3)
        {
            $ticketData['closed_at'] = now();
        }

        unset($ticketData['assigned_users'], $ticketData['notify_users'], $ticketData['ticket_labels'], $ticketData['accessories']);
        $ticket->update($ticketData);

        // Log status change
        if (isset($validated['status']) && $originalStatus != $validated['status']) {

            $oldStatus = TicketStatus::find($originalStatus);
            $newStatus = TicketStatus::find($validated['status']);

            $this->createActivity(
                $ticket,
                'Ticket Status Changed',
                sprintf('Status changed from %s to %s',
                    $oldStatus ? $oldStatus->status : 'None',
                    $newStatus ? $newStatus->status : 'None'
                ),
                ['status_id' => $validated['status']]
            );

            // Insert into ticket_histories table with status comment
            TicketHistory::create([
                'ticket_id' => $ticket->id,
                'tracking_id' => $ticket->tracking_number,
                'customer_id' => $ticket->customer_id,
                'comment' => $this->getStatusComment($validated['status'], $ticket->tracking_number),
                'created_by' => auth()->id()
            ]);

            // Send Telegram notification for status change - For Getlead
            if (TelegramNotificationSetting::isEnabled('ticket_status_change'))
            {
                try
                {
                    // Load relationships for Telegram message
                    $ticket->load(['customer', 'user', 'ticketStatus', 'ticketPriority', 'agent', 'notifyTo', 'branch']);

                    $customer = Customer::find($ticket->customer_id);

                    // Get assigned agents names
                    $assignedAgentNames = $ticket->agent->pluck('name')->implode(', ');

                    // Get notified agents names
                    $notifiedAgentNames = $ticket->notifyTo->pluck('name')->implode(', ');

                    // Get branch name
                    $branchName = $ticket->branch ? $ticket->branch->branch_name : 'N/A';

                    // Get status names
                    $oldStatusName = $oldStatus ? $oldStatus->status : 'None';
                    $newStatusName = $newStatus ? $newStatus->status : 'None';

                    // Get priority name
                    $priorityName = $ticket->ticketPriority ? $ticket->ticketPriority->name : 'N/A';

                    $telegramData = [
                        "tracking_number" => $ticket->tracking_number,
                        "issue" => $ticket->issue,
                        "description" => $ticket->description ?? 'N/A',
                        "customer_name" => $customer->name ?? 'N/A',
                        "customer_mobile" => ($customer->country_code ?? '') . ($customer->mobile ?? ''),
                        "created_date" => $ticket->created_at->format('d-m-Y'),
                        "created_time" => $ticket->created_at->format('h:i A'),
                        "changed_by" => Auth::user()->name,
                        "assigned_agents" => $assignedAgentNames ?: 'None',
                        "notified_agents" => $notifiedAgentNames ?: 'None',
                        "branch" => $branchName,
                        "priority" => $priorityName,
                        "old_status" => $oldStatusName,
                        "new_status" => $newStatusName,
                        "status" => $newStatusName,
                        "due_date" => $ticket->due_date ? date('d-m-Y', strtotime($ticket->due_date)) : null,
                        "is_status_change" => true
                    ];

                    $this->sendTelegramNotification($telegramData);
                }
                catch (\Exception $e) {
                    \Log::error("Telegram status change notification error: " . $e->getMessage());
                }
            }

            //--- for sms/whatsapp message    
             $customer=Customer::where('id',$ticket->customer_id)->first();
            
                // ---- completed status ----------

                if ($validated['status']==4) {   

                    $this->sendWhatsappServiceMessages($ticket,$newTicketStatus);

                    //send SMS message --------------------------------------
                        $this->sendSmsMessages($ticket,$customer,$newTicketStatus);
                    //---------------------------------------------------

                }

                //----- closed/delivered status ------------

                if ( $validated['status']==3) {   
                    
                    // Update all related tasks to Closed status (status=4)
                    Task::where('ticket_id', $ticket->id)
                        ->update(['status' => 4]);

                    //---- send whatsapp message -------------------------------
                    $this->sendWhatsappServiceMessages($ticket,$newTicketStatus);

                    //---- send SMS message --------------------------------------
                    $this->sendSmsMessages($ticket,$customer,$newTicketStatus);

                }

        }

        // Log priority change
        if (isset($validated['priority']) && $originalPriority != $validated['priority']) {
            $oldPriority = $ticket->ticketPriority()->where('id', $originalPriority)->first();
            $newPriority = $ticket->ticketPriority()->where('id', $validated['priority'])->first();
            $this->createActivity(
                $ticket,
                'Ticket Priority Changed',
                sprintf('Priority changed to %s',
                    //$oldPriority ? $oldPriority->title : 'None',
                    $newPriority ? $newPriority->title : 'None'
                ),
                ['priority_id' => $validated['priority']]
            );
        }

        // Log branch change
        if (isset($validated['branch_id']) && $originalBranch != $validated['branch_id']) {
            $oldBranch = \App\Models\Branch::find($originalBranch);
            $newBranch = \App\Models\Branch::find($validated['branch_id']);
            $this->createActivity(
                $ticket,
                'Ticket Branch Changed',
                sprintf('Branch changed from %s to %s',
                    $oldBranch ? $oldBranch->branch_name : 'None',
                    $newBranch ? $newBranch->branch_name : 'None'
                ),
                ['branch_id' => $validated['branch_id']]
            );
        }

        // Log due date change
        if (isset($validated['due_date']) && $originalDueDate != $validated['due_date']) {
            $this->createActivity(
                $ticket,
                'Due Date Changed',
                sprintf('Due date changed from %s to %s',
                    $originalDueDate ? $originalDueDate : 'None',
                    $validated['due_date']
                )
            );
        }

        // Log closing time change
        if (isset($validated['closed_time']) && $originalClosedTime != $validated['closed_time']) {
            $this->createActivity(
                $ticket,
                'Closing Time Changed',
                sprintf('Closing time changed from %s to %s',
                    $originalClosedTime ? $originalClosedTime : 'None',
                    $validated['closed_time']
                )
            );
        }

        // Handle agent assignments
        if (isset($validated['assigned_users'])) {
            // Get current agent IDs
            $currentAgentIds = $ticket->agent->pluck('id')->toArray();
            
            // Find new agents to add (not in current list)
            $newAgentIds = array_diff($validated['assigned_users'], $currentAgentIds);
            
            // Only attach new agents (existing ones remain untouched)
            if (!empty($newAgentIds)) {
                $ticket->agent()->attach($newAgentIds);
                
                // Log agent additions
                $newAgents = \App\Models\User::whereIn('id', $newAgentIds)->get();
                $agentNames = $newAgents->pluck('name')->implode(', ');
                $this->createActivity(
                    $ticket,
                    'Agent Assigned',
                    sprintf('Assigned agent(s): %s', $agentNames),
                    ['agent_id' => implode(',', $newAgentIds)]
                );
            }
        }

        // Handle notify users assignments
        if (isset($validated['notify_users'])) {
            // Get current notify user IDs
            $currentNotifyIds = $ticket->notifyTo->pluck('id')->toArray();
            
            // Find new notify users to add (not in current list)
            $newNotifyIds = array_diff($validated['notify_users'], $currentNotifyIds);
            
            // Only attach new notify users (existing ones remain untouched)
            if (!empty($newNotifyIds)) {
                $ticket->notifyTo()->attach($newNotifyIds);
                
                // Log notify user additions
                $newUsers = \App\Models\User::whereIn('id', $newNotifyIds)->get();
                $userNames = $newUsers->pluck('name')->implode(', ');
                $this->createActivity(
                    $ticket,
                    'Notify User Added',
                    sprintf('Added notify user(s): %s', $userNames)
                );
            }
        }

        // Handle ticket labels assignments
        if (isset($validated['ticket_labels'])) {
            // Get current label IDs
            $currentLabelIds = $ticket->ticketLabel->pluck('id')->toArray();
            
            // Find new labels to add (not in current list)
            $newLabelIds = array_diff($validated['ticket_labels'], $currentLabelIds);
            
            // Only attach new labels (existing ones remain untouched)
            if (!empty($newLabelIds)) {
                $ticket->ticketLabel()->attach($newLabelIds);
                
                // Log label additions
                $newLabels = \App\Models\TicketLabel::whereIn('id', $newLabelIds)->get();
                $labelNames = $newLabels->pluck('label')->implode(', ');
                $this->createActivity(
                    $ticket,
                    'Label Added',
                    sprintf('Added label(s): %s', $labelNames)
                );
            }
        }

        // Handle accessories assignments
        if (isset($validated['accessories'])) {
            // Get current accessories
            $currentAccessories = $ticket->accessories ?: [];
            $currentAccessoryIds = collect($currentAccessories)->pluck('id')->toArray();
            
            // Check if accessories have changed
            if (array_diff($validated['accessories'], $currentAccessoryIds) || array_diff($currentAccessoryIds, $validated['accessories'])) {
                // Get accessories with names and update ticket
                if (!empty($validated['accessories'])) {
                    $accessories = \App\Models\Accessory::whereIn('id', $validated['accessories'])->get(['id', 'name']);
                    $ticket->update(['accessories' => $accessories->toArray()]);
                    
                    // Log activity
                    $accessoryNames = $accessories->pluck('name')->implode(', ');
                    $this->createActivity(
                        $ticket,
                        'Accessories Updated',
                        sprintf('Accessories updated: %s', $accessoryNames)
                    );
                } else {
                    // Clear accessories if empty array provided
                    $ticket->update(['accessories' => null]);
                    $this->createActivity(
                        $ticket,
                        'Accessories Cleared',
                        'All accessories removed from ticket'
                    );
                }
            }
        }

        return response()->json([
            'message' => 'Ticket updated successfully',
            'ticket' => $ticket->load(['customer', 'user', 'ticketStatus', 'ticketPriority', 'agent', 'notifyTo', 'ticketLabel', 'activity.user', 'activity.status', 'activity.priority'])
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Ticket $ticket)
    {
        $user = Auth::user();

        // Check authorization: Admin, Manager, or ticket creator can delete
        if($ticket->created_by === $user->id || $user->role_id === 1 || $user->role_id === 3)
        {
            $ticket->delete();

            return response()->json([
                'message' => 'Ticket deleted successfully'
            ], 200);
        }
        else
        {
            return response()->json([
                'message' => "You don't have permission to delete this ticket."
            ], 403);
        }
    }
    
    /**
     * Get all trashed (soft-deleted) tickets
     */
    public function trashed(Request $request)
    {
        $user = auth()->user();
        $query = Ticket::onlyTrashed()
            ->with(['customer', 'user', 'ticketStatus', 'ticketPriority', 'agent', 'notifyTo', 'ticketLabel', 'branch']);

        // Filter tickets based on user role
        if ($user->role_id == 2) {
            // Agents (role_id = 2) see only tickets assigned to them
            $query->whereHas('agent', function($q) use ($user) {
                $q->where('agent_id', $user->id);
            });
            // Also filter by branch if they have one
            if ($user->branch_id) {
                $query->where('branch_id', $user->branch_id);
            }
        } elseif ($user->role_id == 3) {
            // Manager (role_id = 3) sees tickets assigned to their agents only
            $assignedAgentIds = \DB::table('assign_agents')
                ->where('user_id', $user->id)
                ->pluck('agent_id')
                ->toArray();

            if (!empty($assignedAgentIds)) {
                $query->whereHas('agent', function($q) use ($assignedAgentIds) {
                    $q->whereIn('agent_id', $assignedAgentIds);
                });
            } else {
                // If manager has no assigned agents, show no tickets
                $query->whereRaw('1 = 0');
            }
        } elseif ($user->role_id == 4) {
            // Branch Admin (role_id = 4) sees only tickets from their branch
            if ($user->branch_id) {
                $query->where('branch_id', $user->branch_id);
            }
        }
        // Admin users (role_id = 1) can see all tickets - no filter needed
        
        // Search functionality
        if ($request->has('search') && $request->search != '') {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('issue', 'like', '%' . $search . '%')
                  ->orWhere('description', 'like', '%' . $search . '%')
                  ->orWhere('tracking_number', 'like', '%' . $search . '%')
                  ->orWhereHas('customer', function($q) use ($search) {
                      $q->where('name', 'like', '%' . $search . '%');
                  });
            });
        }
        
        // Filter by customer if provided
        if ($request->has('customer_id') && $request->customer_id != '') {
            $query->where('customer_id', $request->customer_id);
        }

        // Agent filter - filter tickets by assigned agent
        if ($request->has('agent_id') && $request->agent_id != null && $request->agent_id != 'all') {
            $query->whereHas('agent', function($q) use ($request) {
                $q->where('agent_id', $request->agent_id);
            });
        }

        // Sorting
        $sortField = $request->get('sort_by', 'deleted_at');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortField, $sortOrder);
        
        // Pagination with custom per page
        $perPage = $request->get('per_page', 1000);
        $tickets = $query->paginate($perPage);
        
        return response()->json($tickets);
    }
    
    /**
     * Restore a soft-deleted ticket
     */
    
    public function restore($id)
    {
        $ticket = Ticket::withTrashed()->findOrFail($id);
        
        // Restore the ticket (sets deleted_at to null)
        $ticket->restore();
        
        // Set status to 1 (Open)
        $ticket->status = 1;
        $ticket->save();
        
        // Log the restoration activity
        $this->createActivity(
            $ticket,
            'Ticket Restored',
            'Ticket was restored from trash and status set to Open'
        );
        
        return response()->json([
            'message' => 'Ticket restored successfully',
            'ticket' => $ticket->load(['customer', 'user', 'ticketStatus', 'ticketPriority', 'agent', 'notifyTo', 'ticketLabel'])
        ]);
    }

    /**
     * Add an agent to a ticket
     */
    public function addAgent(Request $request, Ticket $ticket)
    {
        $request->validate([
            'agent_id' => 'required|exists:users,id'
        ]);

        $agentId = $request->agent_id;
        
        // Check if agent is already assigned
        if ($ticket->agent()->where('agent_id', $agentId)->exists()) {
            return response()->json([
                'message' => 'Agent is already assigned to this ticket'
            ], 400);
        }
        
        // Get agent details
        $agent = User::find($agentId);
        
        // Attach the agent to the ticket
        $ticket->agent()->attach($agentId);
        
        // Log agent addition
        if ($agent) {
            $this->createActivity(
                $ticket,
                'Agent Added',
                sprintf('Added agent: %s', $agent->name),
                ['agent_id' => $agentId]
            );
        }

        return response()->json([
            'message' => 'Agent added successfully',
            'ticket' => $ticket->load(['customer', 'user', 'ticketStatus', 'ticketPriority', 'agent', 'activity.user', 'activity.status', 'activity.priority'])
        ]);
    }

    /**
     * Remove an agent from a ticket
     */
    public function removeAgent(Ticket $ticket, $agentId)
    {
        // Get agent details before removing
        $agent = User::find($agentId);
        
        $ticket->agent()->detach($agentId);
        
        // Log agent removal
        if ($agent) {
            $this->createActivity(
                $ticket,
                'Agent Removed',
                sprintf('Removed agent: %s', $agent->name),
                ['agent_id' => $agentId]
            );
        }

        return response()->json([
            'message' => 'Agent removed successfully',
            'ticket' => $ticket->load(['customer', 'user', 'ticketStatus', 'ticketPriority', 'agent', 'activity.user', 'activity.status', 'activity.priority'])
        ]);
    }

    /**
     * Remove a notify user from a ticket
     */
    public function removeNotifyUser(Ticket $ticket, $userId)
    {
        // Get user details before removing
        $user = User::find($userId);
        
        $ticket->notifyTo()->detach($userId);
        
        // Log notify user removal
        if ($user) {
            $this->createActivity(
                $ticket,
                'Notify User Removed',
                sprintf('Removed notify user: %s', $user->name)
            );
        }

        return response()->json([
            'message' => 'Notify user removed successfully',
            'ticket' => $ticket->load(['customer', 'user', 'ticketStatus', 'ticketPriority', 'agent', 'notifyTo', 'activity.user', 'activity.status', 'activity.priority'])
        ]);
    }

    /**
     * Add a label to a ticket
     */

    public function addLabel(Request $request, Ticket $ticket)
    {
        try {
            $validated = $request->validate([
                'label_id' => 'required|exists:ticket_labels,id'
            ]);

            // Check if label is already attached
            $exists = DB::table('label_ticket')
                ->where('ticket_id', $ticket->id)
                ->where('label_id', $validated['label_id'])
                ->exists();

            if (!$exists) {
                DB::table('label_ticket')->insert([
                    'ticket_id' => $ticket->id,
                    'label_id' => $validated['label_id'],
                    'created_at' => now(),
                    'updated_at' => now()
                ]);
            }

            return response()->json(['message' => 'Label added successfully']);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to add label'], 500);
        }
    }

    /**
     * Remove a label from a ticket
     */

    public function removeLabel(Ticket $ticket, $labelId)
    {
        // Get label details before removing
        $label = TicketLabel::find($labelId);
        
        $ticket->ticketLabel()->detach($labelId);
        
        // Log label removal
        if ($label) {
            $this->createActivity(
                $ticket,
                'Label Removed',
                sprintf('Removed label: %s', $label->label)
            );
        }

        return response()->json([
            'message' => 'Label removed successfully',
            'ticket' => $ticket->load(['customer', 'user', 'ticketStatus', 'ticketPriority', 'agent', 'notifyTo', 'ticketLabel', 'activity.user', 'activity.status', 'activity.priority'])
        ]);
    }

    /**
     * Get log notes for a ticket
     */
    public function getLogNotes(Ticket $ticket)
    {
        $logNotes = TicketLogNote::where('ticket_id', $ticket->id)
            ->leftJoin('users', 'ticket_log_notes.agent_id', '=', 'users.id')
            ->select('ticket_log_notes.*', 'users.name as user_name')
            ->orderBy('ticket_log_notes.created_at', 'desc')
            ->get()
            ->map(function ($note) {
                return [
                    'id' => $note->id,
                    'agent_id' => $note->agent_id,
                    'ticket_id' => $note->ticket_id,
                    'type_id' => $note->type_id,
                    'outcome_id' => $note->outcome_id,
                    'time' => $note->time,
                    'description' => $note->description,
                    'log' => $note->log,
                    'file_type' => $note->file_type,
                    'created_at' => $note->created_at,
                    'updated_at' => $note->updated_at,
                    'user' => $note->user_name ? [
                        'id' => $note->agent_id,
                        'name' => $note->user_name
                    ] : null
                ];
            });

        return response()->json($logNotes);
    }

    /**
     * Add a log note to a ticket
     */
    public function addLogNote(Request $request, Ticket $ticket)
    {
        $request->validate([
            'note' => 'required|string',
            'type_id' => 'integer'
        ]);

        $noteId = \Illuminate\Support\Facades\DB::table('ticket_log_notes')->insertGetId([
            'ticket_id' => $ticket->id,
            'agent_id' => auth()->id(),
            'description' => $request->note,
            'log' => $request->note,
            'type_id' => $request->type_id ?? 1,
            'time' => now(),
            'created_at' => now(),
            'updated_at' => now()
        ]);

        // Create activity log
        $this->createActivity(
            $ticket,
            'Log Note Added',
            'Added a log note to the ticket'
        );

        // Get the created note with user info
        $logNote = TicketLogNote::where('ticket_log_notes.id', $noteId)
            ->leftJoin('users', 'ticket_log_notes.agent_id', '=', 'users.id')
            ->select('ticket_log_notes.*', 'users.name as user_name')
            ->first();

        return response()->json([
            'message' => 'Log note added successfully',
            'logNote' => [
                'id' => $logNote->id,
                'agent_id' => $logNote->agent_id,
                'ticket_id' => $logNote->ticket_id,
                'type_id' => $logNote->type_id,
                'outcome_id' => $logNote->outcome_id,
                'time' => $logNote->time,
                'description' => $logNote->description,
                'log' => $logNote->log,
                'file_type' => $logNote->file_type,
                'created_at' => $logNote->created_at,
                'updated_at' => $logNote->updated_at,
                'user' => [
                    'id' => $logNote->agent_id,
                    'name' => $logNote->user_name
                ]
            ]
        ], 201);
    }

    /**
     * Get tasks for a ticket
     */
    public function getTasks(Ticket $ticket)
    {
        $tasks = Task::where('ticket_id', $ticket->id)
            ->with(['user:id,name', 'category', 'type'])
            ->orderBy('created_at', 'desc')
            ->get();

        // Add assigned agents for each task
        foreach ($tasks as $task) {
            $assignedAgents = \DB::table('agent_task')
                ->join('users', 'agent_task.agent_id', '=', 'users.id')
                ->where('agent_task.task_id', $task->id)
                ->select('users.id', 'users.name')
                ->get();
            
            $task->assigned_agents = $assignedAgents;
        }

        return response()->json($tasks);
    }

    /**
     * Add a task to a ticket
     */
    public function addTask(Request $request, Ticket $ticket)
    {
        $request->validate([
            'task_name' => 'required|string|max:191',
            'description' => 'nullable|string|max:191',
            'type_id' => 'nullable|integer',
            'category_id' => 'nullable|integer',
            'time' => 'nullable|date',
            'status' => 'nullable|integer|in:1,2,3',
            'assigned_users' => 'nullable|array',
            'assigned_users.*' => 'exists:users,id'
        ]);

        // Map numeric status to string values
        $statusMap = [
            1 => 'Open',
            2 => 'In Progress',
            3 => 'Closed'
        ];

        $task = Task::create([
            'ticket_id' => $ticket->id,
            'user_id' => auth()->id(), // Created by current user
            'task_name' => $request->task_name,
            'description' => $request->description ?? '',
            'type_id' => $request->type_id ?? 1,
            'category_id' => $request->category_id,
            'time' => ($request->date." ".$request->time) ?? now(),
            'status' => $request->status?? 1
        ]);

        // Add assigned users to agent_task table
        if (!empty($request->assigned_users)) {
            foreach ($request->assigned_users as $userId) {
                \DB::table('agent_task')->insert([
                    'agent_id' => $userId,
                    'task_id' => $task->id,
                    'created_at' => now(),
                    'updated_at' => now()
                ]);
            }
        }

        // Create activity log
        $this->createActivity(
            $ticket,
            'Task Added',
            sprintf('Added task: %s', $request->task_name)
        );

        // Load relationships and assigned agents
        $task->load(['user:id,name', 'category', 'type']);
        
        // Add assigned agents to the response
        $assignedAgents = AgentTask::join('users', 'agent_task.agent_id', '=', 'users.id')
            ->where('agent_task.task_id', $task->id)
            ->select('users.id', 'users.name')
            ->get();
        
        $task->assigned_agents = $assignedAgents;

        return response()->json([
            'message' => 'Task added successfully',
            'task' => $task
        ], 201);
    }

    /**
     * Get attachments for a ticket
     */
    public function getAttachments(Ticket $ticket)
    {
        $attachments = \DB::table('ticket_images')
            ->where('ticket_id', $ticket->id)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($attachment) {
                return [
                    'id' => $attachment->id,
                    'ticket_id' => $attachment->ticket_id,
                    'name' => $attachment->file_name,
                    'file_path' => $attachment->file_path,
                    'file_size' => $attachment->file_size ?? 0,
                    'created_at' => $attachment->created_at,
                    'updated_at' => $attachment->updated_at
                ];
            });

        return response()->json($attachments);
    }

    /**
     * Upload attachment for a ticket
     */
    public function uploadAttachment(Request $request, Ticket $ticket)
    {
        $request->validate([
            'file' => 'required|file|max:10240' // Max 10MB
        ]);

        $file = $request->file('file');
        $originalName = $file->getClientOriginalName();
        $fileSize = $file->getSize(); // Get size before moving
        $fileName = time() . '_' . $originalName;
        $filePath = 'uploads/ticket_image/' . $fileName;
        
        // Create directory if it doesn't exist
        $uploadPath = public_path('uploads/ticket_image');
        if (!file_exists($uploadPath)) {
            mkdir($uploadPath, 0777, true);
        }
        
        // Move the file
        $file->move($uploadPath, $fileName);
        
        // Save to database
        $attachmentId = \DB::table('ticket_images')->insertGetId([
            'ticket_id' => $ticket->id,
            'file_name' => $originalName,
            'file_path' => $filePath,
            'file_size' => $fileSize,
            'created_at' => now(),
            'updated_at' => now()
        ]);
        
        // Create activity log
        $this->createActivity(
            $ticket,
            'Attachment Added',
            sprintf('Added attachment: %s', $originalName)
        );
        
        // Get the created attachment
        $attachment = \DB::table('ticket_images')->where('id', $attachmentId)->first();
        
        return response()->json([
            'message' => 'File uploaded successfully',
            'attachment' => [
                'id' => $attachment->id,
                'ticket_id' => $attachment->ticket_id,
                'name' => $attachment->file_name,
                'file_path' => $attachment->file_path,
                'file_size' => $attachment->file_size,
                'created_at' => $attachment->created_at,
                'updated_at' => $attachment->updated_at
            ]
        ], 201);
    }

    /**
     * Delete attachment from a ticket
     */
    public function deleteAttachment(Ticket $ticket, $attachmentId)
    {
        // Get attachment details before deleting
        $attachment = \DB::table('ticket_images')
            ->where('id', $attachmentId)
            ->where('ticket_id', $ticket->id)
            ->first();
        
        if (!$attachment) {
            return response()->json(['message' => 'Attachment not found'], 404);
        }
        
        // Delete the file from storage
        $filePath = public_path($attachment->file_path);
        if (file_exists($filePath)) {
            unlink($filePath);
        }
        
        // Delete from database
        \DB::table('ticket_images')
            ->where('id', $attachmentId)
            ->where('ticket_id', $ticket->id)
            ->delete();
        
        // Create activity log
        $this->createActivity(
            $ticket,
            'Attachment Deleted',
            sprintf('Deleted attachment: %s', $attachment->file_name)
        );
        
        return response()->json(['message' => 'File deleted successfully']);
    }

    /**
     * Get spare parts for a ticket
     */
    public function getSpareParts(Ticket $ticket)
    {
        $spareParts = ProductTicket::join('products', 'product_tickets.product_id', '=', 'products.id')
            ->where('product_tickets.ticket_id', $ticket->id)
            ->select(
                'product_tickets.*',
                'products.name as product_name',
                'products.cost as product_cost'
            )
            ->orderBy('product_tickets.created_at', 'desc')
            ->get()
            ->map(function ($sparePart) {
                return [
                    'id' => $sparePart->id,
                    'ticket_id' => $sparePart->ticket_id,
                    'product_id' => $sparePart->product_id,
                    'quantity' => $sparePart->quantity,
                    'price' => $sparePart->price,
                    'total_price' => $sparePart->total_price,
                    'created_at' => $sparePart->created_at,
                    'updated_at' => $sparePart->updated_at,
                    'product' => [
                        'id' => $sparePart->product_id,
                        'name' => $sparePart->product_name,
                        'cost' => $sparePart->product_cost
                    ]
                ];
            });

        return response()->json($spareParts);
    }

    /**
     * Add spare part to a ticket
     */
    public function addSparePart(Request $request, Ticket $ticket)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'quantity' => 'required|integer|min:1'
        ]);

        // Get product details
        $product = Product::find($request->product_id);

        // Check if enough stock is available
        if ($product->stock < $request->quantity) {
            return response()->json([
                'message' => 'Insufficient stock. Available: ' . $product->stock . ', Requested: ' . $request->quantity
            ], 422);
        }

        $unitPrice = $product->cost ?? 0;
        $totalPrice = $unitPrice * $request->quantity;

        // Reduce stock from products table
        $product->reduceStock($request->quantity);

        // Save to product_tickets table
        $sparePartId = DB::table('product_tickets')->insertGetId([
            'ticket_id' => $ticket->id,
            'product_id' => $request->product_id,
            'quantity' => $request->quantity,
            'price' => $unitPrice,
            'total_price' => $totalPrice,
            'created_by' => Auth::user()->id,
            'created_at' => now(),
            'updated_at' => now()
        ]);

        // Create activity log
        $this->createActivity(
            $ticket,
            'Spare Part Added',
            sprintf('Added spare part: %s (Qty: %d)', $product->name, $request->quantity)
        );

        // Get the created spare part
        $sparePart = DB::table('product_tickets')
            ->where('id', $sparePartId)
            ->first();

        return response()->json([
            'message' => 'Spare part added successfully',
            'sparePart' => [
                'id' => $sparePart->id,
                'ticket_id' => $sparePart->ticket_id,
                'product_id' => $sparePart->product_id,
                'quantity' => $sparePart->quantity,
                'price' => $sparePart->price,
                'total_price' => $sparePart->total_price,
                'created_at' => $sparePart->created_at,
                'updated_at' => $sparePart->updated_at,
                'product' => [
                    'id' => $product->id,
                    'name' => $product->name,
                    'cost' => $product->cost
                ]
            ]
        ], 201);
    }

    /**
     * Delete spare part from a ticket
     */
    public function deleteSparePart(Ticket $ticket, $sparePartId)
    {
        // Get spare part details before deleting
        $sparePart = DB::table('product_tickets')
            ->join('products', 'product_tickets.product_id', '=', 'products.id')
            ->where('product_tickets.id', $sparePartId)
            ->where('product_tickets.ticket_id', $ticket->id)
            ->select('product_tickets.*', 'products.name as product_name')
            ->first();

        if (!$sparePart) {
            return response()->json(['message' => 'Spare part not found'], 404);
        }

        // Restore stock to products table
        $product = Product::find($sparePart->product_id);
        if ($product) {
            $product->increaseStock($sparePart->quantity);
        }

        // Delete from database
        DB::table('product_tickets')
            ->where('id', $sparePartId)
            ->where('ticket_id', $ticket->id)
            ->delete();

        // Create activity log
        $this->createActivity(
            $ticket,
            'Spare Part Removed',
            sprintf('Removed spare part: %s (Qty: %d)', $sparePart->product_name, $sparePart->quantity)
        );

        return response()->json(['message' => 'Spare part removed successfully']);
    }

    /**
     * Create an activity log entry
     */
    private function createActivity($ticket, $type, $note, $additionalData = [])
    {
        $activityData = array_merge([
            'ticket_id' => $ticket->id,
            'type' => $type,
            'note' => $note,
            'created_by' => auth()->id() ?? 1,
        ], $additionalData);

        Activity::create($activityData);
    }

    /**
     * Get status comment message for ticket history
     */
    private function getStatusComment($statusId, $trackingNumber)
    {
        $date = date('d-m-Y');

        switch ($statusId) {
            case 1:
                return "To create new tickets successfully with ID: {$trackingNumber} on {$date}";
            case 2:
                return "Your request with service Id: {$trackingNumber} work in progress, Dated {$date}";
            case 3:
                return "Your device/service request with ID: {$trackingNumber} has been successfully delivered on {$date}";
            case 4:
                return "Your device/service request with ID: {$trackingNumber} has been successfully completed and is now ready for delivery.";
            case 5:
                return "Your device/service request with ID: {$trackingNumber} has been successfully returned on {$date}.";
            default:
                return "Status updated for ticket {$trackingNumber} on {$date}";
        }
    }



public function getTicketStatus()
    {
        $statuses = \App\Models\TicketStatus::select('id', 'status', 'color_code')
            ->where('active', 1)
            ->orderBy('order', 'asc')
            ->orderBy('id', 'asc')
            ->get();
        
        return response()->json($statuses);
    }

public function getPriorities()
{
return response()->json(\App\Models\Priority::select('id', 'title', 'color')
            ->where('active', 1)
            ->where('title', '!=', 'Urgent')
            ->get());
}

public function getBranches()
{
    $user = auth()->user();
    
    // Get branches based on user role
    if ($user->role_id == 1) {
        // Admin (role_id = 1) can see all branches
        $branches = \App\Models\Branch::select('id', 'branch_name')->get();
    } else if ($user->role_id == 2 || $user->role_id == 4) {
        // Agent (role_id = 2) and Branch Admin (role_id = 4) can only see their assigned branch
        $branches = \App\Models\Branch::select('id', 'branch_name')
            ->where('id', $user->branch_id)
            ->get();
    } else {
        // Other roles get their assigned branch only
        $branches = \App\Models\Branch::select('id', 'branch_name')
            ->where('id', $user->branch_id)
            ->get();
    }
    
    return response()->json($branches);
}

public function getTicketLabels()
{
    return response()->json(\App\Models\TicketLabel::select('id', 'label_name', 'color', 'active')
            ->where('active', 1)
            ->orderBy('label_name')
            ->get());
}

    /**
     * Get additional fields for a ticket
     */
    public function getAdditionalFields(Ticket $ticket)
    {
        try {
            // Get all ticket additional fields with values for this ticket
            $ticketFields = DB::table('ticket_additional_fields')
                ->where('ticket_id', $ticket->id)
                ->select('additional_field_id', 'user_input')
                ->get();
            
            return response()->json($ticketFields);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to fetch additional fields'], 500);
        }
    }

    /**
     * Store or update additional field value for a ticket
     */
    public function storeAdditionalField(Request $request, Ticket $ticket)
    {
        try {
            $validated = $request->validate([
                'additional_field_id' => 'required|exists:additional_fields,id',
                'user_input' => 'nullable|string'
            ]);

            // Check if this field already has a value for this ticket
            $existingField = DB::table('ticket_additional_fields')
                ->where('ticket_id', $ticket->id)
                ->where('additional_field_id', $validated['additional_field_id'])
                ->first();

            if ($existingField) {
                // Update existing value
                DB::table('ticket_additional_fields')
                    ->where('ticket_id', $ticket->id)
                    ->where('additional_field_id', $validated['additional_field_id'])
                    ->update([
                        'user_input' => $validated['user_input'],
                        'updated_at' => now()
                    ]);
            } else {
                // Insert new value
                DB::table('ticket_additional_fields')->insert([
                    'ticket_id' => $ticket->id,
                    'additional_field_id' => $validated['additional_field_id'],
                    'user_input' => $validated['user_input'],
                    'created_at' => now(),
                    'updated_at' => now()
                ]);
            }

            // Create activity log
            $fieldInfo = DB::table('additional_fields')
                ->where('id', $validated['additional_field_id'])
                ->first();
            
            if ($fieldInfo) {
                $this->createActivity(
                    $ticket,
                    'Additional Field Updated',
                    sprintf('Updated %s: %s', $fieldInfo->title, $validated['user_input'] ?? '(empty)')
                );
            }

            return response()->json(['message' => 'Field updated successfully']);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to update field: ' . $e->getMessage()], 500);
        }
    }


/**
     * Verify a ticket with remarks
     */
    public function verifyTicket(Request $request, Ticket $ticket)
    {
        $validated = $request->validate([
            'remarks' => 'required|string',
            'verified_at' => 'required|date_format:Y-m-d H:i:s',
        ]);

        // Update ticket with verification details
        $ticket->update([
            'remarks' => $validated['remarks'],
            'verified_at' => $validated['verified_at'],
        ]);

        // Create activity log
        $this->createActivity(
            $ticket,
            'Ticket Verified',
            sprintf('Ticket verified with remarks: %s', $validated['remarks'])
        );

        // Create notification
        $notMsg = "Ticket:#" . $ticket->id . " " . $ticket->issue . " has been verified by " . Auth::user()->name;
        Notification::create([
            'type' => 'Ticket Verified',
            'notifiable_type' => 'App\Models\User',
            'notifiable_id' => $ticket->created_by,
            'data' => json_encode([
                'title' => 'Ticket Verified',
                'message' => $notMsg,
                'ticket_id' => $ticket->id
            ])
        ]);

        return response()->json([
            'message' => 'Ticket verified successfully',
            'ticket' => $ticket->fresh()->load(['customer', 'user', 'ticketStatus', 'ticketPriority'])
        ]);
    }


//for app only-----------------------------------------------------------------------------

public function getDashboardStats(Request $request)
{

    $user = auth()->user();
    
    $data=['totalTickets' => 0,'ticketsOpen' => 0,'ticketsOverdue'=> 0,'ticketProgress'=>0,'totalCustomers' => 0];

    if($user->role_id==1)
    {
        $data['totalTickets'] = Ticket::count();

        $data['ticketsOpen'] = Ticket::where('status',1)->count(); //open tickets
        $data['ticketsOverdue'] = $overdueTickets = Ticket::where('status', '!=', 3)
                        ->where('due_date', '<', now())
                        ->count(); //due tickets
        $data['ticketsProgress'] = Ticket::where('status',2)->count();
        $data['totalCustomers'] = Customer::count(); //due tickets
        $data['chartData'] = $this->getMonthlyTicketData(); 
    }
    elseif ($user->role_id==3)  //agent data counts
    {
        $tickets = Ticket::leftJoin('agent_ticket','tickets.id','agent_ticket.ticket_id')
                   ->leftJoin('assign_agents','agent_ticket.agent_id','assign_agents.agent_id')
                   ->where('assign_agents.user_id',$user->id)->get();

        $tot_open=$tot_progress=$tot_due=0;

        foreach($tickets as $tkt)
        {
            if($tkt->status==1)
                $tot_open++;
            elseif($tkt->status!=3)
                $tot_progress++;
            if(($tkt->status!=3) and ($tkt->due_date<date('Y-m-d')))
                $tot_due++;
        }

        $data['totalTickets']=$tickets->count();
        $data['ticketsOpen'] = $tot_open;
        $data['ticketsOverdue'] = $tot_due;
        $data['ticketsProgress'] = $tot_progress;
        $data['totalCustomers'] = Customer::count(); //due tickets
        $data['chartData'] = $this->getMonthlyTicketData(); 
    }

    return response()->json(['stats' => $data ], 200);

}


private function getMonthlyTicketData()
    {
        $data = [];
        $currentDate = \Carbon\Carbon::now();
        
        for ($i = 11; $i >= 0; $i--) {
            $date = $currentDate->copy()->subMonths($i);
            $monthName = $date->format('M');
            
            // Get ticket count for this month
            $ticketCount = Ticket::whereYear('created_at', $date->year)
                ->whereMonth('created_at', $date->month)
                ->count();
            
            // Calculate trend (simple moving average)
            $trend = $this->calculateTrend($date);
            
            $data[] = [
                'month' => $monthName,
                'tickets' => $ticketCount,
                'trend' => $trend
            ];
        }
        
        return $data;
    }
    
    private function calculateTrend($date)
    {
        // Simple 3-month moving average for trend
        $sum = 0;
        $count = 0;
        
        for ($i = 0; $i < 3; $i++) {
            $monthDate = $date->copy()->subMonths($i);
            $tickets = Ticket::whereYear('created_at', $monthDate->year)
                ->whereMonth('created_at', $monthDate->month)
                ->count();
            $sum += $tickets;
            $count++;
        }
        
        return $count > 0 ? round($sum / $count) : 0;
    }

//-----------------------------------------------------------------------------------------------

    /**
     * Track ticket by tracking number
     */
    public function trackTicket(Request $request)
    {
        $validated = $request->validate([
            'tracking_number' => 'required|string'
        ]);

        // Find ticket by tracking number (including soft deleted)
        $ticket = Ticket::withTrashed()
            ->with(['ticketStatus:id,status,color_code', 'agent:id,name', 'customer:id,name,mobile,country_code,company_name'])
            ->where('tracking_number', $validated['tracking_number'])
            ->first();

        if (!$ticket) {
            return response()->json([
                'success' => false,
                'message' => 'Ticket not found with this tracking number'
            ], 404);
        }

        // Get ticket histories
        $histories = TicketHistory::where('ticket_id', $ticket->id)
            ->orderBy('created_at', 'asc')
            ->get();

        // Get spare parts used
        $spareParts = ProductTicket::where('ticket_id', $ticket->id)
            ->with('product:id,name')
            ->get()
            ->pluck('product.name')
            ->filter()
            ->values();

        // Get customer notes from ticket_customer_notes table
        $customerNotes = \DB::table('ticket_customer_notes')
            ->where('ticket_id', $ticket->id)
            ->leftJoin('users', 'ticket_customer_notes.agent_id', '=', 'users.id')
            ->leftJoin('customers', 'ticket_customer_notes.customer_id', '=', 'customers.id')
            ->select(
                'ticket_customer_notes.id',
                'ticket_customer_notes.note as description',
                'ticket_customer_notes.created_at',
                'users.name as agent_name',
                'customers.name as customer_name'
            )
            ->orderBy('ticket_customer_notes.created_at', 'ASC')
            ->get()
            ->map(function ($note) {
                return [
                    'id' => $note->id,
                    'description' => $note->description,
                    'time' => null, // No time field in customer notes table
                    'created_at' => $note->created_at,
                    'agent_name' => $note->agent_name,
                    'customer_name' => $note->customer_name
                ];
            });

        // Get assigned agents
        $agents = $ticket->agent->map(function ($agent) {
            return [
                'id' => $agent->id,
                'name' => $agent->name
            ];
        });

        return response()->json([
            'success' => true,
            'data' => [
                'tracking_number' => $ticket->tracking_number,
                'issue' => $ticket->issue,
                'description' => $ticket->description,
                'customer_id' => $ticket->customer_id,
                'customer' => $ticket->customer ? [
                    'id' => $ticket->customer->id,
                    'name' => $ticket->customer->name,
                    'mobile' => $ticket->customer->mobile,
                    'country_code' => $ticket->customer->country_code
                ] : null,
                'status' => $ticket->ticketStatus ? [
                    'id' => $ticket->ticketStatus->id,
                    'name' => $ticket->ticketStatus->status,
                    'color' => $ticket->ticketStatus->color_code
                ] : null,
                'histories' => $histories,
                'spare_parts' => $spareParts,
                'customer_notes' => $customerNotes,
                'agents' => $agents
            ]
        ], 200);
    }

    /**
     * Get customer notes for a ticket
     */
    public function getCustomerNotes($id)
    {
        $ticket = Ticket::findOrFail($id);
        
        // Read from ticket_customer_notes table using Eloquent
        $customerNotes = TicketCustomerNote::where('ticket_id', $ticket->id)
            ->with(['agent:id,name', 'customer:id,name'])
            ->orderBy('created_at', 'ASC')
            ->get()
            ->map(function ($note) {
                return [
                    'id' => $note->id,
                    'note' => $note->note,
                    'created_at' => $note->created_at,
                    'updated_at' => $note->updated_at,
                    'user' => $note->agent ? [
                        'id' => $note->agent->id,
                        'name' => $note->agent->name
                    ] : null,
                    'customer' => $note->customer ? [
                        'id' => $note->customer->id,
                        'name' => $note->customer->name
                    ] : null
                ];
            });

        return response()->json($customerNotes);
    }

    /**
     * Add a customer note to a ticket
     */
    public function addCustomerNote(Request $request, $id)
    {
        $ticket = Ticket::findOrFail($id);
        
        $validated = $request->validate([
            'note' => 'required|string'
        ]);

        // Insert customer note using Eloquent
        $customerNote = TicketCustomerNote::create([
            'ticket_id' => $ticket->id,
            'agent_id' => auth()->id(),
            'note' => $validated['note']
        ]);

        // Create activity log
        $this->createActivity(
            $ticket,
            'Customer Note Added',
            'Customer note added: ' . $validated['note']
        );

        // Load the user and customer relationships
        $customerNote->load(['agent:id,name', 'customer:id,name']);

        return response()->json([
            'message' => 'Customer note added successfully',
            'customerNote' => [
                'id' => $customerNote->id,
                'note' => $customerNote->note,
                'created_at' => $customerNote->created_at,
                'updated_at' => $customerNote->updated_at,
                'user' => $customerNote->agent ? [
                    'id' => $customerNote->agent->id,
                    'name' => $customerNote->agent->name
                ] : null,
                'customer' => $customerNote->customer ? [
                    'id' => $customerNote->customer->id,
                    'name' => $customerNote->customer->name
                ] : null
            ]
        ], 201);
    }

    /**
     * Add a customer note to a ticket from public tracking page
     */
    public function addPublicCustomerNote(Request $request, $tracking_number)
    {
        $validated = $request->validate([
            'note' => 'required|string',
            'customer_id' => 'required|integer'
        ]);

        // Find ticket by tracking number (including soft deleted)
        $ticket = Ticket::withTrashed()
            ->where('tracking_number', $tracking_number)
            ->first();

        if (!$ticket) {
            return response()->json([
                'success' => false,
                'message' => 'Ticket not found with this tracking number'
            ], 404);
        }

        // Verify customer_id matches the ticket's customer
        if ($ticket->customer_id != $validated['customer_id']) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid customer for this ticket'
            ], 403);
        }

        // Insert customer note using Eloquent - no agent_id for customer notes from public
        $customerNote = TicketCustomerNote::create([
            'ticket_id' => $ticket->id,
            'customer_id' => $validated['customer_id'],
            'note' => $validated['note']
        ]);

        // Create activity log
        $this->createActivity(
            $ticket,
            'Customer Note Added',
            'Customer note added: ' . $validated['note']
        );

        // Get customer name
        $customer = Customer::find($validated['customer_id']);

        // Create notification for agents
        $notificationData = [
            'ticket_id' => $ticket->id,
            'tracking_number' => $ticket->tracking_number,
            'customer_name' => $customer ? $customer->name : 'Customer',
            'note' => $validated['note'],
            'message' => 'Customer added a note to ticket #' . $ticket->tracking_number
        ];

        // Get all users who should be notified (admins and agents assigned to this ticket)
        $notifiableUsers = collect();
        
        // Add admins (role_id = 1)
        $admins = \App\Models\User::where('role_id', 1)->get();
        $notifiableUsers = $notifiableUsers->merge($admins);
        
        // Add agents assigned to this ticket
        $assignedAgents = $ticket->agent()->get();
        $notifiableUsers = $notifiableUsers->merge($assignedAgents);
        
        // Remove duplicates
        $notifiableUsers = $notifiableUsers->unique('id');

        // Create notifications for each user
        foreach ($notifiableUsers as $user) {
            \App\Models\Notification::create([
                'type' => 'customer_note_added',
                'notifiable_type' => 'App\Models\User',
                'notifiable_id' => $user->id,
                'data' => json_encode($notificationData),
                'created_at' => now(),
                'updated_at' => now()
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Customer note added successfully',
            'note' => [
                'id' => $customerNote->id,
                'description' => $customerNote->note,
                'created_at' => $customerNote->created_at,
                'agent_name' => null,
                'customer_name' => $customer ? $customer->name : 'Customer'
            ]
        ], 201);
    }

    /**
     * Display completed tickets (status = 4) for verification
     */
    public function completedTickets(Request $request)
    {
        $user = auth()->user();
        $query = Ticket::with(['customer', 'user', 'ticketStatus', 'ticketPriority', 'agent', 'notifyTo', 'ticketLabel', 'branch', 'activity.user', 'activity.status', 'activity.priority'])
            ->where('status', 4) // Only completed tickets
            ->whereNull('verified_at'); // Only unverified tickets

        // Filter tickets based on user role (same logic as main index)
        if ($user->role_id == 2) {
            // Agents (role_id = 2) see tickets from their branch that are either assigned to them OR notified to them
            $query->where(function($q) use ($user) {
                // Must be either assigned or notified to this agent
                $q->whereHas('agent', function($subQ) use ($user) {
                    $subQ->where('agent_id', $user->id);
                })->orWhereHas('notifyTo', function($subQ) use ($user) {
                    $subQ->where('agent_id', $user->id);
                });
            });

            // AND must be from their branch (or NULL branch for backwards compatibility)
            if ($user->branch_id) {
                $query->where(function($q) use ($user) {
                    $q->where('branch_id', $user->branch_id)
                      ->orWhereNull('branch_id');
                });
            }

        } elseif ($user->role_id == 3) {
            // Manager (role_id = 3) sees tickets assigned to their agents only
            $assignedAgentIds = \DB::table('assign_agents')
                ->where('user_id', $user->id)
                ->pluck('agent_id')
                ->toArray();

            if (!empty($assignedAgentIds)) {
                $query->whereHas('agent', function($q) use ($assignedAgentIds) {
                    $q->whereIn('agent_id', $assignedAgentIds);
                });
            } else {
                // If manager has no assigned agents, show no tickets
                $query->whereRaw('1 = 0');
            }

        } elseif ($user->role_id == 4) {
            // Branch Admin (role_id = 4) sees only tickets from their branch
            if ($user->branch_id) {
                $query->where('branch_id', $user->branch_id);
            }
        }

        // Admin users (role_id = 1) can see all tickets - no filter needed

        // Search functionality
        if ($request->has('search') && $request->search != '') {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('issue', 'like', '%' . $search . '%')
                  ->orWhere('description', 'like', '%' . $search . '%')
                  ->orWhere('tracking_number', 'like', '%' . $search . '%')
                  ->orWhereHas('customer', function($q) use ($search) {
                      $q->where('name', 'like', '%' . $search . '%');
                  });
            });
        }

        // Customer filter
        if ($request->has('customer_id') && $request->customer_id) {
            $query->where('customer_id', $request->customer_id);
        }

        // Agent filter
        if ($request->has('agent_id') && $request->agent_id) {
            $query->whereHas('agent', function($q) use ($request) {
                $q->where('agent_id', $request->agent_id);
            });
        }

        // Date range filter
        if ($request->has('start_date') && $request->start_date) {
            $query->whereDate('created_at', '>=', $request->start_date);
        }

        if ($request->has('end_date') && $request->end_date) {
            $query->whereDate('created_at', '<=', $request->end_date);
        }

        // Order by creation date (newest first)
        $query->orderBy('created_at', 'desc');

        // Paginate results
        $perPage = $request->get('per_page', 10);
        $tickets = $query->paginate($perPage);

        return response()->json($tickets);
    }

    /**
     * Get verified tickets for invoice creation dropdown
     */
    public function getVerifiedTickets(Request $request)
    {
        $user = auth()->user();
        $query = Ticket::with(['customer:id,name,mobile,country_code'])
            ->where('status', 4) // Only completed tickets
            ->whereNotNull('verified_at') // Only verified tickets
            ->select('id', 'tracking_number', 'issue', 'customer_id'); // Only needed fields

        // Apply same role-based filtering as other ticket methods
        if ($user->role_id == 2) {
            // Agents see tickets assigned to them or notified to them
            $query->where(function($q) use ($user) {
                $q->whereHas('agent', function($subQ) use ($user) {
                    $subQ->where('agent_id', $user->id);
                })->orWhereHas('notifyTo', function($subQ) use ($user) {
                    $subQ->where('agent_id', $user->id);
                });
            });

            if ($user->branch_id) {
                $query->where(function($q) use ($user) {
                    $q->where('branch_id', $user->branch_id)
                      ->orWhereNull('branch_id');
                });
            }

        } elseif ($user->role_id == 3) {
            // Manager sees tickets assigned to their agents
            $assignedAgentIds = \DB::table('assign_agents')
                ->where('user_id', $user->id)
                ->pluck('agent_id')
                ->toArray();

            if (!empty($assignedAgentIds)) {
                $query->whereHas('agent', function($q) use ($assignedAgentIds) {
                    $q->whereIn('agent_id', $assignedAgentIds);
                });
            } else {
                $query->whereRaw('1 = 0');
            }

        } elseif ($user->role_id == 4) {
            // Branch Admin sees tickets from their branch
            if ($user->branch_id) {
                $query->where('branch_id', $user->branch_id);
            }
        }

        // Order by most recent first
        $query->orderBy('created_at', 'desc');

        $tickets = $query->get();

        return response()->json($tickets);
    }

    /**
     * Get overdue tickets - tickets where due_date is past and status is not Completed (4) or Closed (3)
     */
    public function getOverdueTickets(Request $request)
    {
        $user = auth()->user();
        $query = Ticket::with(['customer', 'user', 'ticketStatus', 'ticketPriority', 'agent', 'notifyTo', 'ticketLabel', 'branch', 'activity.user', 'activity.status', 'activity.priority', 'invoice'])
            ->whereNotNull('due_date') // Must have a due date
            ->where('due_date', '<', now()) // Due date is in the past
            ->whereNotIn('status', [3, 4]); // Not Closed (3) or Completed (4)

        // Filter tickets based on user role
        if ($user->role_id == 2) {
            // Agents (role_id = 2) see tickets from their branch that are either assigned to them OR notified to them
            $query->where(function($q) use ($user) {
                // Must be either assigned or notified to this agent
                $q->whereHas('agent', function($subQ) use ($user) {
                    $subQ->where('agent_id', $user->id);
                })->orWhereHas('notifyTo', function($subQ) use ($user) {
                    $subQ->where('agent_id', $user->id);
                });
            });

            // AND must be from their branch (or NULL branch for backwards compatibility)
            if ($user->branch_id) {
                $query->where(function($q) use ($user) {
                    $q->where('branch_id', $user->branch_id)
                      ->orWhereNull('branch_id');
                });
            }

        } elseif ($user->role_id == 3) {
            // Manager (role_id = 3) sees tickets assigned to their agents only
            $assignedAgentIds = \DB::table('assign_agents')
                ->where('user_id', $user->id)
                ->pluck('agent_id')
                ->toArray();

            if (!empty($assignedAgentIds)) {
                $query->whereHas('agent', function($q) use ($assignedAgentIds) {
                    $q->whereIn('agent_id', $assignedAgentIds);
                });
            } else {
                // If manager has no assigned agents, show no tickets
                $query->whereRaw('1 = 0');
            }

        } elseif ($user->role_id == 4) {
            // Branch Admin (role_id = 4) sees only tickets from their branch
            if ($user->branch_id) {
                $query->where('branch_id', $user->branch_id);
            }
        }

        // Admin users (role_id = 1) can see all tickets - no filter needed

        // Search functionality
        if ($request->has('search') && $request->search != '') {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('issue', 'like', '%' . $search . '%')
                  ->orWhere('description', 'like', '%' . $search . '%')
                  ->orWhere('tracking_number', 'like', '%' . $search . '%')
                  ->orWhereHas('customer', function($q) use ($search) {
                      $q->where('name', 'like', '%' . $search . '%');
                  });
            });
        }

        // Status filter
        if ($request->has('status') && $request->status != null && $request->status != 'all') {
            $query->where('status', $request->status);
        }

        // Customer filter
        if ($request->has('customer_id') && $request->customer_id != null && $request->customer_id != 'all') {
            $query->where('customer_id', $request->customer_id);
        }

        // Agent filter - filter tickets by assigned agent
        if ($request->has('agent_id') && $request->agent_id != null && $request->agent_id != 'all') {
            $query->whereHas('agent', function($q) use ($request) {
                $q->where('agent_id', $request->agent_id);
            });
        }

        // Branch filter - filter tickets by branch
        if ($request->has('branch_id') && $request->branch_id != null && $request->branch_id != 'all') {
            $query->where('branch_id', $request->branch_id);
        }

        // Date range filter (for due_date)
        if ($request->has('start_date') && $request->start_date != null) {
            $query->whereDate('due_date', '>=', $request->start_date);
        }
        if ($request->has('end_date') && $request->end_date != null) {
            $query->whereDate('due_date', '<=', $request->end_date);
        }

        // Priority filter
        if ($request->has('priority') && $request->priority != null && $request->priority != 'all') {
            $query->where('priority', $request->priority);
        }

        // Sorting
        $sortBy = $request->get('sort_by', 'due_date'); // Default sort by due_date for overdue
        $sortOrder = $request->get('sort_order', 'desc'); // Default ascending (most overdue first)

        $query->orderBy('due_date','desc');  //$sortBy, $sortOrder);

        // Pagination
        $perPage = $request->get('per_page', 10);
        $tickets = $query->paginate($perPage);

        return response()->json($tickets);
    }

}