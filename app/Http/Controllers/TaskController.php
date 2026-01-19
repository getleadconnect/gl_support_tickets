<?php

namespace App\Http\Controllers;

use App\Models\Task;
use App\Models\TaskType;
use App\Models\TaskCategory;
use App\Models\TaskStatus;
use App\Models\User;
use App\Models\Activity;
use App\Models\TaskNotes;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use App\Services\WhatsappApiService;

class TaskController extends Controller
{

    use WhatsappApiService;

    /* To send ticket issue - contirm message to customer */

    public function sendMessage()
    {
        //------send partner to crm-----
        $data=[
            "user_mobile"=>"919995338385",
            "ticket_id"=>"TKT345678",
            "branch_mobile"=>"919876543210"
        ];
		$send_response=$this->sendServiceRequestConfirmMessage($data);
        return response()->json($send_response);
        //------------------------------
    }


    /**
     * Display a listing of tasks with filters and pagination
     */
    public function index(Request $request)
    {
        $query = Task::with(['user', 'ticket', 'type', 'category', 'agent', 'branch', 'taskStatus']);

        // Filter by date range (using time column which is the due date)
        if ($request->has('start_date') && $request->start_date) {
            $query->whereDate('time', '>=', $request->start_date);
        }

        if ($request->has('end_date') && $request->end_date) {
            $query->whereDate('time', '<=', $request->end_date);
        }

        // Filter by agent (users with role_id = 2)
        if ($request->has('agent_id') && $request->agent_id) {
            $query->whereHas('agent', function ($q) use ($request) {
                $q->where('users.id', $request->agent_id);
            });
        }

        // Filter by task type
        if ($request->has('type_id') && $request->type_id) {
            $query->where('status', $request->type_id);
        }

        // Filter by task category
        if ($request->has('category_id') && $request->category_id) {
            $query->where('category_id', $request->category_id);
        }

        // Filter by status
        if ($request->has('status') && $request->status) {
            $query->where('status', $request->status);
        }

        // Search by task name or description
        if ($request->has('search') && $request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('task_name', 'like', '%' . $request->search . '%')
                  ->orWhere('description', 'like', '%' . $request->search . '%');
            });
        }

        // Role-based filtering
        $user = auth()->user();
        if ($user->role_id == 1) {
            // Admin - Show all tasks (no filtering)
        } elseif ($user->role_id == 2) {
            // Agent - Show only tasks assigned to the logged-in user
            $query->whereHas('agent', function ($q) use ($user) {
                $q->where('users.id', $user->id);
            });
        } elseif ($user->role_id == 3) {
            // Manager - Show tasks assigned to agents that are assigned to this manager
            $assignedAgentIds = DB::table('assign_agents')
                ->where('user_id', $user->id)
                ->pluck('agent_id')
                ->toArray();

            if (!empty($assignedAgentIds)) {
                $query->whereHas('agent', function ($q) use ($assignedAgentIds) {
                    $q->whereIn('users.id', $assignedAgentIds);
                });
            } else {
                // If manager has no assigned agents, show no tasks
                $query->whereRaw('1 = 0');
            }
        } elseif ($user->role_id == 4) {
            // Branch Admin - Show tasks assigned to agents in the same branch
            $query->whereHas('agent', function ($q) use ($user) {
                $q->where('users.branch_id', $user->branch_id);
            });
        }
        // If no role matched or undefined role, show all tasks (fallback for admin-like behavior)

        // Order by latest first
        $query->orderBy('created_at', 'desc');

        // Paginate results
        $perPage = $request->get('per_page', 15);
        $tasks = $query->paginate($perPage);

        return response()->json($tasks);
    }

    /**
     * Store a newly created task
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'task_name' => 'required|string|max:191',
            'ticket_id' => 'nullable|exists:tickets,id',
            'type_id' => 'nullable|exists:task_types,id',
            'category_id' => 'nullable|exists:task_categories,id',
            'time' => 'required|date',
            'description' => 'required|string',
            'status' => 'nullable|string',
            'agent_ids' => 'nullable|array',
            'agent_ids.*' => 'exists:users,id',
            'closing_comment' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            DB::beginTransaction();

            // Get logged user's branch_id
            $branchId = auth()->user()->branch_id ?? null;

            $taskData = [
                'task_name' => $request->task_name,
                'user_id' => auth()->id(),
                'ticket_id' => $request->ticket_id,
                'type_id' => $request->type_id,
                'category_id' => $request->category_id,
                'time' => $request->time,
                'description' => $request->description,
                'status' => $request->status ?? '1',
                'branch_id' => $branchId,
            ];

            // If status is closed (4), add closing details
            if ($request->status == '4') {
                $taskData['closing_comment'] = $request->closing_comment;
                $taskData['closed_time'] = now();
                $taskData['closed_by'] = auth()->id();
            }

            $task = Task::create($taskData);

            // Attach agents if provided
            if ($request->has('agent_ids') && is_array($request->agent_ids)) {
                $task->agent()->attach($request->agent_ids);
            }

            // If closing comment is provided and status is closed, add it to task_notes table
            if ($request->status == '4' && $request->has('closing_comment') && !empty($request->closing_comment)) {
                TaskNotes::create([
                    'task_id' => $task->id,
                    'task_status' => 4,
                    'comment' => $request->closing_comment,
                    'created_by' => auth()->id(),
                ]);
            }

            // Log activity
            Activity::create([
                'task_id' => $task->id,
                'ticket_id' => $task->ticket_id,
                'type' => 'Task Created',
                'note' => 'Task "' . $task->task_name . '" was created',
                'created_by' => auth()->id() ?? 1,
            ]);

            DB::commit();

            // Load relationships
            $task->load(['user', 'ticket', 'type', 'category', 'agent', 'branch', 'taskStatus']);

            return response()->json([
                'message' => 'Task created successfully',
                'task' => $task
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Failed to create task',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified task
     */
    public function show($id)
    {
        $task = Task::with(['user', 'ticket', 'type', 'category', 'agent', 'branch', 'taskStatus'])
            ->find($id);

        if (!$task) {
            return response()->json([
                'message' => 'Task not found'
            ], 404);
        }

        // Check authorization
        $user = auth()->user();
        if ($user->role_id == 2) {
            // Agent - Can only view tasks assigned to them
            $isAssigned = $task->agent()->where('users.id', $user->id)->exists();
            if (!$isAssigned) {
                return response()->json([
                    'message' => 'Unauthorized access'
                ], 403);
            }
        } elseif ($user->role_id == 3) {
            // Manager - Can only view tasks of assigned agents
            $assignedAgentIds = DB::table('assign_agents')
                ->where('user_id', $user->id)
                ->pluck('agent_id')
                ->toArray();

            $hasAssignedAgent = $task->agent()
                ->whereIn('users.id', $assignedAgentIds)
                ->exists();

            if (!$hasAssignedAgent) {
                return response()->json([
                    'message' => 'Unauthorized access'
                ], 403);
            }
        } elseif ($user->role_id == 4) {
            // Branch Admin - Can only view tasks assigned to agents in their branch
            $hasAgentInSameBranch = $task->agent()
                ->where('users.branch_id', $user->branch_id)
                ->exists();

            if (!$hasAgentInSameBranch) {
                return response()->json([
                    'message' => 'Unauthorized access'
                ], 403);
            }
        }

        return response()->json($task);
    }

    /**
     * Update the specified task
     */
    public function update(Request $request, $id)
    {
        $task = Task::find($id);

        if (!$task) {
            return response()->json([
                'message' => 'Task not found'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'task_name' => 'sometimes|required|string|max:191',
            'ticket_id' => 'nullable|exists:tickets,id',
            'type_id' => 'nullable|exists:task_types,id',
            'category_id' => 'nullable|exists:task_categories,id',
            'time' => 'sometimes|required|date',
            'description' => 'sometimes|required|string',
            'status' => 'nullable|string',
            'agent_ids' => 'nullable|array',
            'agent_ids.*' => 'exists:users,id',
            'closing_comment' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            DB::beginTransaction();

            // Track changes for activity log
            $changes = [];
            $originalStatus = $task->status;

            // Update task fields
            $task->update($request->only([
                'task_name',
                'ticket_id',
                'type_id',
                'category_id',
                'time',
                'description',
                'status',
                'closing_comment'
            ]));

            // Track status change
            if ($request->has('status') && $originalStatus != $request->status) {
                $statusLabels = ['1' => 'open', '2' => 'pending', '3' => 'In Progress', '4' => 'closed'];
                $changes[] = 'status changed from ' . ($statusLabels[$originalStatus] ?? 'Unknown') . ' to ' . ($statusLabels[$request->status] ?? 'Unknown');
            }

            // If status is being set to closed (4), record closure details
            if ($request->has('status') && $request->status == '4') {
                $task->update([
                    'closed_time' => now(),
                    'closed_by' => auth()->id(),
                ]);

                // If closing comment is provided, add it to task_notes table
                if ($request->has('closing_comment') && !empty($request->closing_comment)) {
                    TaskNotes::create([
                        'task_id' => $task->id,
                        'task_status' => 4, // Closed status
                        'comment' => $request->closing_comment,
                        'created_by' => auth()->id(),
                    ]);
                }
            }

            // Update agents if provided
            if ($request->has('agent_ids')) {
                $task->agent()->sync($request->agent_ids);
            }

            // Log activity
            $noteText = !empty($changes) ? 'Task "' . $task->task_name . '" updated: ' . implode(', ', $changes) : 'Task "' . $task->task_name . '" was updated';

            Activity::create([
                'task_id' => $task->id,
                'ticket_id' => $task->ticket_id,
                'type' => 'Task Updated',
                'note' => $noteText,
                'created_by' => auth()->id() ?? 1,
            ]);

            DB::commit();

            // Load relationships
            $task->load(['user', 'ticket', 'type', 'category', 'agent', 'taskStatus']);

            return response()->json([
                'message' => 'Task updated successfully',
                'task' => $task
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Failed to update task',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified task
     */
    public function destroy($id)
    {
        $task = Task::find($id);

        if (!$task) {
            return response()->json([
                'message' => 'Task not found'
            ], 404);
        }

        // Check if user has permission to delete
        $user = auth()->user();
        if ($user->role_id != 1 && $task->user_id != $user->id) {
            return response()->json([
                'message' => 'Unauthorized to delete this task'
            ], 403);
        }

        try {
            DB::beginTransaction();

            // Log activity before deletion
            Activity::create([
                'task_id' => $task->id,
                'ticket_id' => $task->ticket_id,
                'type' => 'Task Deleted',
                'note' => 'Task "' . $task->task_name . '" was deleted',
                'created_by' => auth()->id() ?? 1,
            ]);

            // Detach all agents
            $task->agent()->detach();

            // Delete task
            $task->delete();

            DB::commit();

            return response()->json([
                'message' => 'Task deleted successfully'
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Failed to delete task',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get all task types
     */
    public function getTaskTypes()
    {
        $taskTypes = TaskType::orderBy('type')->get();
        return response()->json($taskTypes);
    }

    /**
     * Get all task categories
     */
    public function getTaskCategories()
    {
        $taskCategories = TaskCategory::orderBy('category')->get();
        return response()->json($taskCategories);
    }

    /**
     * Get all task statuses
     */
    public function getTaskStatuses()
    {
        $taskStatuses = TaskStatus::orderBy('id')->get();
        return response()->json($taskStatuses);
    }

    /**
     * Get all agents (users with role_id = 2)
     */
    public function getAgents()
    {
        $user = auth()->user();
        $query = User::where('role_id', 2)->select('id', 'name', 'email');

        if ($user->role_id == 1) {
            // Admin - Show all agents
            // No additional filtering needed
        } elseif ($user->role_id == 2) {
            // Agent - Show only the current logged user
            $query->where('id', $user->id);
        } elseif ($user->role_id == 3) {
            // Manager - Show only assigned agents
            $assignedAgentIds = DB::table('assign_agents')
                ->where('user_id', $user->id)
                ->pluck('agent_id')
                ->toArray();

            if (!empty($assignedAgentIds)) {
                $query->whereIn('id', $assignedAgentIds);
            } else {
                // If manager has no assigned agents, return empty
                $query->whereRaw('1 = 0');
            }
        } elseif ($user->role_id == 4) {
            // Branch Admin - Show agents from the same branch
            $query->where('branch_id', $user->branch_id);
        }

        $agents = $query->orderBy('name')->get();

        return response()->json($agents);
    }

    /**
     * Get ticket details by tracking number
     */
    public function getTicketByTrackingNumber($trackingNumber)
    {
        $ticket = \App\Models\Ticket::withTrashed()
            ->with(['ticketStatus', 'ticketPriority'])
            ->where('tracking_number', $trackingNumber)
            ->first();

        if (!$ticket) {
            return response()->json([
                'message' => 'Ticket not found'
            ], 404);
        }

        return response()->json([
            'id' => $ticket->id,
            'tracking_number' => $ticket->tracking_number,
            'issue' => $ticket->issue,
            'description' => $ticket->description,
            'due_date' => $ticket->due_date,
            'status' => $ticket->ticketStatus ? $ticket->ticketStatus->status : null,
            'status_id' => $ticket->status,
            'priority' => $ticket->ticketPriority ? $ticket->ticketPriority->priority : null,
            'priority_id' => $ticket->priority,
        ]);
    }

    /**
     * Get activities for a specific task
     */
    public function getTaskActivities($id)
    {
        $activities = Activity::where('task_id', $id)
            ->with('user:id,name')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($activities);
    }

    /**
     * Get notes for a specific task
     */
    public function getTaskNotes($id)
    {
        $notes = TaskNotes::where('task_id', $id)
            ->with('user:id,name')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($notes);
    }

    /**
     * Add a note to a task
     */
    public function addTaskNote(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'comment' => 'required|string',
            'task_status' => 'required|integer|in:1,2,3,4',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            DB::beginTransaction();

            // Find the task
            $task = Task::find($id);

            if (!$task) {
                return response()->json([
                    'message' => 'Task not found'
                ], 404);
            }

            $oldStatus = $task->status;

            // Update task status
            $task->update([
                'status' => $request->task_status
            ]);

            // If status is being set to closed (4), record closure details
            if ($request->task_status == 4 && $oldStatus != 4) {
                $task->update([
                    'closed_time' => now(),
                    'closed_by' => auth()->id(),
                ]);
            }

            // Create note
            $note = TaskNotes::create([
                'task_id' => $id,
                'task_status' => $request->task_status,
                'comment' => $request->comment,
                'created_by' => auth()->id(),
            ]);

            // Load the user relationship
            $note->load('user:id,name');

            // Get the authenticated user
            $user = auth()->user();
            $userName = $user ? $user->name : 'Unknown User';

            // Log activity for note addition
            Activity::create([
                'task_id' => $task->id,
                'ticket_id' => $task->ticket_id,
                'type' => 'Note Added',
                'note' => 'Note added by ' . $userName,
                'created_by' => auth()->id() ?? 1,
            ]);

            // Log activity if status changed
            if ($oldStatus != $request->task_status) {
                $statusLabels = ['1' => 'open', '2' => 'pending', '3' => 'In Progress', '4' => 'closed'];
                Activity::create([
                    'task_id' => $task->id,
                    'ticket_id' => $task->ticket_id,
                    'type' => 'Task Status Updated',
                    'note' => 'Task status changed from ' . ($statusLabels[$oldStatus] ?? 'Unknown') . ' to ' . ($statusLabels[$request->task_status] ?? 'Unknown') . ' by ' . $userName,
                    'created_by' => auth()->id() ?? 1,
                ]);
            }

            DB::commit();

            // Load task relationships
            $task->load(['user', 'ticket', 'type', 'category', 'agent', 'taskStatus']);

            return response()->json([
                'message' => 'Note added successfully',
                'note' => $note,
                'task' => $task
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Failed to add note',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
