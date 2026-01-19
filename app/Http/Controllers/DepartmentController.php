<?php

namespace App\Http\Controllers;

use App\Models\Department;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class DepartmentController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        try {
            $query = Department::with('creator')->orderBy('created_at', 'desc');
            
            // Add search functionality if needed
            if ($request->has('search') && $request->search) {
                $query->where('department_name', 'like', '%' . $request->search . '%');
            }
            
            $departments = $query->get();
            return response()->json($departments);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to fetch departments'], 500);
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'department_name' => 'required|string|max:255|unique:departments,department_name',
            ]);

            $department = Department::create([
                'department_name' => $validated['department_name'],
                'created_by' => Auth::id(),
            ]);

            return response()->json($department, 201);

        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to create department'
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Department $department)
    {
        try {
            return response()->json($department);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Department not found'], 404);
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Department $department)
    {
        try {
            $validated = $request->validate([
                'department_name' => 'required|string|max:255|unique:departments,department_name,' . $department->id,
            ]);

            $department->update([
                'department_name' => $validated['department_name'],
            ]);

            return response()->json($department);

        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to update department'
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Department $department)
    {
        try {
            // Check if department has agents assigned
            $agentCount = $department->agent()->count();
            
            if ($agentCount > 0) {
                return response()->json([
                    'message' => "Cannot delete department. It has {$agentCount} agent(s) assigned."
                ], 422);
            }

            $department->delete();

            return response()->json(['message' => 'Department deleted successfully']);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to delete department'
            ], 500);
        }
    }
}