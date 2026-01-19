<?php

namespace App\Http\Controllers;

use App\Models\MessageSetting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class MessageSettingController extends Controller
{
    /**
     * Display a listing of the message settings.
     */
    public function index(Request $request)
    {
        $query = MessageSetting::select('message_settings.*');
        
        // Search functionality
        if ($request->has('search') && $request->search != '') {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('vendor_name', 'like', '%' . $search . '%')
                  ->orWhere('message_type', 'like', '%' . $search . '%')
                  ->orWhere('template_name', 'like', '%' . $search . '%')
                  ->orWhere('whatsapp_api', 'like', '%' . $search . '%');
            });
        }
        
        // Filter by status
        if ($request->has('status') && $request->status !== '') {
            $query->where('status', $request->status);
        }
        
        // Filter by message type
        if ($request->has('message_type') && $request->message_type !== '') {
            $query->where('message_type', $request->message_type);
        }
        
        // Sorting
        $sortField = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortField, $sortOrder);

        // Pagination
        $perPage = $request->get('per_page', 10);
        $messageSettings = $query->paginate($perPage);

        return response()->json($messageSettings);
    }

    /**
     * Store a newly created message setting.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'vendor_name' => 'required|string|max:255',
            'whatsapp_api' => 'required|string|max:500',
            'api_token' => 'nullable|string|max:500',
            'phone_number_id' => 'nullable|string|max:255',
            'status' => 'boolean'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $validated = $validator->validated();
        $validated['created_by'] = Auth::id();
        
        // Default status to true if not provided
        if (!isset($validated['status'])) {
            $validated['status'] = true;
        }

        $mset=MessageSetting::first();
        if(!empty($mset))
            $mset->delete();
        
        $messageSetting = MessageSetting::create($validated);

        // Load the relationship for response
        //$messageSetting->load('createdBy:id,name');

        return response()->json([
            'message' => 'Message setting created successfully',
            'data' => $messageSetting
        ], 201);
    }

    /**
     * Display the specified message setting.
     */
    public function show($id)
    {
        $messageSetting = MessageSetting::with('createdBy:id,name')->find($id);
        
        if (!$messageSetting) {
            return response()->json([
                'message' => 'Message setting not found'
            ], 404);
        }

        // For show method, we'll return the actual values (not masked)
        // but still exclude them from the default JSON response
        $data = $messageSetting->toArray();
        $data['api_token'] = $messageSetting->getRawOriginal('api_token');
        $data['secret_key'] = $messageSetting->getRawOriginal('secret_key');

        return response()->json($data);
    }

    /**
     * Update the specified message setting.
     */
    public function update(Request $request, $id)
    {
        $messageSetting = MessageSetting::find($id);
        
        if (!$messageSetting) {
            return response()->json([
                'message' => 'Message setting not found'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'vendor_name' => 'sometimes|required|string|max:255',
            'message_type' => 'nullable|string|max:50',
            'whatsapp_api' => 'sometimes|required|string|max:500',
            'api_token' => 'nullable|string|max:500',
            'phone_number_id' => 'nullable|string|max:255',
            'secret_key' => 'nullable|string|max:500',
            'template_name' => 'nullable|string|max:255',
            'template_text' => 'nullable|string',
            'status' => 'boolean'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $validated = $validator->validated();
        
        // Only update fields that are present in the request
        $messageSetting->update($validated);
        
        // Load the relationship for response
        $messageSetting->load('createdBy:id,name');

        return response()->json([
            'message' => 'Message setting updated successfully',
            'data' => $messageSetting
        ]);
    }

    /**
     * Remove the specified message setting.
     */
    public function destroy($id)
    {
        $messageSetting = MessageSetting::find($id);
        
        if (!$messageSetting) {
            return response()->json([
                'message' => 'Message setting not found'
            ], 404);
        }

        $messageSetting->delete();

        return response()->json([
            'message' => 'Message setting deleted successfully'
        ]);
    }

    /**
     * Toggle the status of a message setting.
     */
    public function toggleStatus($id)
    {
        $messageSetting = MessageSetting::find($id);
        
        if (!$messageSetting) {
            return response()->json([
                'message' => 'Message setting not found'
            ], 404);
        }

        $messageSetting->status = !$messageSetting->status;
        $messageSetting->save();

        return response()->json([
            'message' => 'Status updated successfully',
            'status' => $messageSetting->status
        ]);
    }

    /**
     * Get all message types for dropdown.
     */
    public function getMessageTypes()
    {
        $types = MessageSetting::distinct('message_type')
            ->pluck('message_type')
            ->map(function($type) {
                return [
                    'value' => $type,
                    'label' => ucfirst(str_replace('_', ' ', $type))
                ];
            });

        return response()->json($types);
    }
}