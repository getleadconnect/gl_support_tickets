<?php

namespace App\Http\Controllers;

use App\Models\SmsSetting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class SmsSettingController extends Controller
{
    /**
     * Display a listing of the SMS settings.
     */
    public function index(Request $request)
    {
        $query = SmsSetting::select('sms_settings.*');

        // Search functionality
        if ($request->has('search') && $request->search != '') {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('vendor_name', 'like', '%' . $search . '%')
                  ->orWhere('sms_api', 'like', '%' . $search . '%')
                  ->orWhere('sender_id', 'like', '%' . $search . '%');
            });
        }

        // Filter by status
        if ($request->has('status') && $request->status !== '') {
            $query->where('status', $request->status);
        }

        // Sorting
        $sortField = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortField, $sortOrder);

        // Pagination
        $perPage = $request->get('per_page', 10);
        $smsSettings = $query->paginate($perPage);

        return response()->json($smsSettings);
    }

    /**
     * Store a newly created SMS setting.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'vendor_name' => 'required|string|max:100',
            'sms_api' => 'required|string',
            'api_token' => 'nullable|string|max:100',
            'sender_id' => 'nullable|string|max:50',
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

        $smsSetting = SmsSetting::create($validated);

        return response()->json([
            'message' => 'SMS setting created successfully',
            'data' => $smsSetting
        ], 201);
    }

    /**
     * Display the specified SMS setting.
     */
    public function show($id)
    {
        $smsSetting = SmsSetting::with('createdBy:id,name')->find($id);

        if (!$smsSetting) {
            return response()->json([
                'message' => 'SMS setting not found'
            ], 404);
        }

        // For show method, we'll return the actual values (not masked)
        $data = $smsSetting->toArray();
        $data['api_token'] = $smsSetting->getRawOriginal('api_token');

        return response()->json($data);
    }

    /**
     * Update the specified SMS setting.
     */
    public function update(Request $request, $id)
    {
        $smsSetting = SmsSetting::find($id);

        if (!$smsSetting) {
            return response()->json([
                'message' => 'SMS setting not found'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'vendor_name' => 'sometimes|required|string|max:100',
            'sms_api' => 'sometimes|required|string',
            'api_token' => 'nullable|string|max:100',
            'sender_id' => 'nullable|string|max:50',
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
        $smsSetting->update($validated);

        // Load the relationship for response
        $smsSetting->load('createdBy:id,name');

        return response()->json([
            'message' => 'SMS setting updated successfully',
            'data' => $smsSetting
        ]);
    }

    /**
     * Remove the specified SMS setting.
     */
    public function destroy($id)
    {
        $smsSetting = SmsSetting::find($id);

        if (!$smsSetting) {
            return response()->json([
                'message' => 'SMS setting not found'
            ], 404);
        }

        $smsSetting->delete();

        return response()->json([
            'message' => 'SMS setting deleted successfully'
        ]);
    }

    /**
     * Toggle the status of an SMS setting.
     */
    public function toggleStatus($id)
    {
        $smsSetting = SmsSetting::find($id);

        if (!$smsSetting) {
            return response()->json([
                'message' => 'SMS setting not found'
            ], 404);
        }

        $smsSetting->status = !$smsSetting->status;
        $smsSetting->save();

        return response()->json([
            'message' => 'Status updated successfully',
            'status' => $smsSetting->status
        ]);
    }
}
