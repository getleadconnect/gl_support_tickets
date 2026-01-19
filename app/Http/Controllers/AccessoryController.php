<?php

namespace App\Http\Controllers;

use App\Models\Accessory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class AccessoryController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Accessory::with('creator');
        
        // Search functionality
        if ($request->has('search') && $request->search != '') {
            $search = $request->search;
            $query->where('name', 'like', '%' . $search . '%');
        }
        
        // Check if request wants all accessories (for dropdown)
        if ($request->has('all') && $request->all === 'true') {
            $accessories = $query->orderBy('name', 'asc')->get(['id', 'name']);
            return response()->json($accessories);
        }
        
        $perPage = $request->get('per_page', 10);
        $accessories = $query->orderBy('created_at', 'desc')->paginate($perPage);
        
        return response()->json($accessories);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255|unique:accessories,name',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $accessory = Accessory::create([
                'name' => $request->name,
                'created_by' => auth()->id()
            ]);

            $accessory->load('creator');

            return response()->json([
                'message' => 'Accessory created successfully',
                'data' => $accessory
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error creating accessory',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Accessory $accessory)
    {
        $accessory->load('creator');
        return response()->json($accessory);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Accessory $accessory)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255|unique:accessories,name,' . $accessory->id,
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $accessory->update([
                'name' => $request->name,
            ]);

            $accessory->load('creator');

            return response()->json([
                'message' => 'Accessory updated successfully',
                'data' => $accessory
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error updating accessory',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Accessory $accessory)
    {
        try {
            $accessory->delete();

            return response()->json([
                'message' => 'Accessory deleted successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error deleting accessory',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}