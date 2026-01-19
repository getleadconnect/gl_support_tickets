<?php

namespace App\Http\Controllers;

use App\Models\TicketLabel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class TicketLabelController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        try {
            $query = TicketLabel::with('creator')->orderBy('created_at', 'desc');
            
            // Add search functionality if needed
            if ($request->has('search') && $request->search) {
                $query->where('label_name', 'like', '%' . $request->search . '%');
            }
            
            $labels = $query->get();
            return response()->json($labels);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to fetch ticket labels'], 500);
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'label' => 'required|string|max:255|unique:ticket_labels,label_name',
                'color' => 'required|string|max:7', // Expecting hex color like #FF5733
            ]);

            $ticketLabel = TicketLabel::create([
                'label_name' => $validated['label'],
                'color' => $validated['color'],
                'active' => 1,
                'created_by' => Auth::id(),
            ]);

            $ticketLabel->load('creator');

            return response()->json($ticketLabel, 201);

        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to create ticket label'
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(TicketLabel $ticketLabel)
    {
        try {
            $ticketLabel->load('creator');
            return response()->json($ticketLabel);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Ticket label not found'], 404);
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, TicketLabel $ticketLabel)
    {
        try {
            $validated = $request->validate([
                'label' => 'required|string|max:255|unique:ticket_labels,label_name,' . $ticketLabel->id,
                'color' => 'required|string|max:7',
                'active' => 'boolean',
            ]);

            $ticketLabel->update([
                'label_name' => $validated['label'],
                'color' => $validated['color'],
                'active' => isset($validated['active']) ? ($validated['active'] ? 1 : 0) : $ticketLabel->active,
            ]);

            $ticketLabel->load('creator');

            return response()->json($ticketLabel);

        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to update ticket label'
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(TicketLabel $ticketLabel)
    {
        try {
            // Check if label is being used by tickets
            $ticketCount = $ticketLabel->tickets()->count();
            
            if ($ticketCount > 0) {
                return response()->json([
                    'message' => "Cannot delete label. It is being used by {$ticketCount} ticket(s)."
                ], 422);
            }

            $ticketLabel->delete();

            return response()->json(['message' => 'Ticket label deleted successfully']);

        } catch (\Exception $e) {
            \Log::error('Failed to delete ticket label: ' . $e->getMessage());
            return response()->json([
                'message' => 'Failed to delete ticket label: ' . $e->getMessage()
            ], 500);
        }
    }
}