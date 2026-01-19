<?php

namespace App\Http\Controllers;

use App\Models\Activity;
use Illuminate\Http\Request;

class ActivityController extends Controller
{
    public function getLatestActivities(Request $request)
    {
        try {
            $limit = $request->get('limit', 5);
            
            $activities = Activity::with(['ticket', 'user', 'status', 'priority'])
                ->orderBy('created_at', 'desc')
                ->orderBy('id', 'desc')
                ->limit($limit)
                ->get();
            
            // Format activities for display
            $formattedActivities = $activities->map(function($activity) {
                $formattedActivity = [
                    'id' => $activity->id,
                    'type' => $activity->type,
                    'title' => $activity->title,
                    'description' => $activity->description,
                    'note' => $activity->note,
                    'created_at' => $activity->created_at,
                    'time_ago' => $this->getTimeAgo($activity->created_at),
                    'user' => $activity->user ? $activity->user->name : 'System',
                    'ticket_id' => $activity->ticket_id,
                    'status' => $activity->status ? $activity->status->name : null,
                    'priority' => $activity->priority ? $activity->priority->name : null,
                ];

                // Generate activity message based on type
                $formattedActivity['message'] = $this->generateActivityMessage($activity);
                
                return $formattedActivity;
            });
            
            return response()->json($formattedActivities, 200);
            
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to fetch activities',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    private function getTimeAgo($dateString)
    {
        $date = new \DateTime($dateString);
        $now = new \DateTime();
        $interval = $now->diff($date);
        
        if ($interval->y > 0) {
            return $interval->y . ' year' . ($interval->y > 1 ? 's' : '') . ' ago';
        } elseif ($interval->m > 0) {
            return $interval->m . ' month' . ($interval->m > 1 ? 's' : '') . ' ago';
        } elseif ($interval->d > 0) {
            if ($interval->d == 1) {
                return 'yesterday';
            } elseif ($interval->d < 7) {
                return $interval->d . ' days ago';
            } else {
                $weeks = floor($interval->d / 7);
                return $weeks . ' week' . ($weeks > 1 ? 's' : '') . ' ago';
            }
        } elseif ($interval->h > 0) {
            return $interval->h . ' hour' . ($interval->h > 1 ? 's' : '') . ' ago';
        } elseif ($interval->i > 0) {
            return $interval->i . ' minute' . ($interval->i > 1 ? 's' : '') . ' ago';
        } else {
            return 'just now';
        }
    }
    
    private function generateActivityMessage($activity)
    {
        $user = $activity->user ? $activity->user->name : 'System';
        $type = strtolower($activity->type);
        
        if ($activity->ticket_id) {
            $ticketRef = "ticket #" . $activity->ticket_id;
            
            if ($type === 'ticket_created' || $type === 'create') {
                return $user . " created " . $ticketRef;
            } elseif ($type === 'ticket_updated' || $type === 'update') {
                return $user . " updated " . $ticketRef;
            } elseif ($type === 'ticket_closed' || $type === 'closed') {
                return $user . " closed " . $ticketRef;
            } elseif ($type === 'ticket_assigned' || $type === 'assigned') {
                return $user . " assigned " . $ticketRef;
            } elseif ($type === 'status_changed') {
                $status = $activity->status ? $activity->status->name : 'Unknown';
                return $user . " changed " . $ticketRef . " status to " . $status;
            } elseif ($type === 'priority_changed') {
                $priority = $activity->priority ? $activity->priority->name : 'Unknown';
                return $user . " changed " . $ticketRef . " priority to " . $priority;
            } elseif ($type === 'comment' || $type === 'note') {
                return $user . " added a note to " . $ticketRef;
            } elseif ($type === 'log') {
                return $user . " logged activity for " . $ticketRef;
            }
        }
        
        // Default message if type is not recognized
        if ($activity->title) {
            return $user . " - " . $activity->title;
        } elseif ($activity->description) {
            return $user . " - " . substr($activity->description, 0, 100);
        } else {
            return $user . " performed an action";
        }
    }
}