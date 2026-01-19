<?php

namespace App\Http\Controllers;

use App\Models\Designation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class DesignationController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        try {
            $query = Designation::with('creator')->orderBy('created_at', 'desc');
            
            // Add search functionality if needed
            if ($request->has('search') && $request->search) {
                $query->where('designation_name', 'like', '%' . $request->search . '%');
            }
            
            $designations = $query->get();
            return response()->json($designations);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to fetch designations'], 500);
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'designation_name' => 'required|string|max:255|unique:designations,designation_name',
            ]);

            $designation = Designation::create([
                'designation_name' => $validated['designation_name'],
                'created_by' => Auth::id(),
            ]);

            return response()->json($designation, 201);

        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to create designation'
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Designation $designation)
    {
        try {
            return response()->json($designation);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Designation not found'], 404);
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Designation $designation)
    {
        try {
            $validated = $request->validate([
                'designation_name' => 'required|string|max:255|unique:designations,designation_name,' . $designation->id,
            ]);

            $designation->update([
                'designation_name' => $validated['designation_name'],
            ]);

            return response()->json($designation);

        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to update designation'
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Designation $designation)
    {
        try {
            $designation->delete();

            return response()->json(['message' => 'Designation deleted successfully']);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to delete designation'
            ], 500);
        }
    }
}