<?php

namespace App\Http\Controllers;

use App\Models\Brand;
use Illuminate\Http\Request;

class BrandController extends Controller
{
    /**
     * Display a listing of brands.
     */
    public function index()
    {
        try {
            $brands = Brand::orderBy('brand', 'DESC')->get();
            return response()->json($brands);
        } catch (\Exception $e) {
            \Log::error('Error fetching brands: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to fetch brands'], 500);
        }
    }

    /**
     * Store a newly created brand.
     */
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'brand' => 'required|string|max:255|unique:brands,brand',
            ]);
            
            // Add the authenticated user as created_by
            $validated['created_by'] = auth()->id() ?? 1;
            
            $brand = Brand::create($validated);
            
            \Log::info('Brand created: ' . json_encode($brand->toArray()));
            
            return response()->json([
                'message' => 'Brand created successfully',
                'brand' => $brand
            ], 201);
            
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            \Log::error('Error creating brand: ' . $e->getMessage());
            return response()->json([
                'error' => 'Failed to create brand',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update the specified brand.
     */
    public function update(Request $request, $id)
    {
        try {
            $brand = Brand::findOrFail($id);
            
            $validated = $request->validate([
                'brand' => 'required|string|max:255|unique:brands,brand,' . $id,
            ]);
            
            $brand->update($validated);
            
            \Log::info('Brand updated: ' . json_encode($brand->toArray()));
            
            return response()->json([
                'message' => 'Brand updated successfully',
                'brand' => $brand
            ]);
            
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'error' => 'Brand not found'
            ], 404);
        } catch (\Exception $e) {
            \Log::error('Error updating brand: ' . $e->getMessage());
            return response()->json([
                'error' => 'Failed to update brand',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified brand.
     */
    public function destroy($id)
    {
        try {
            $brand = Brand::findOrFail($id);
            
            // Store brand info for logging
            $brandInfo = $brand->brand;
            
            $brand->delete();
            
            \Log::info('Brand deleted: ' . $brandInfo . ' (ID: ' . $id . ')');
            
            return response()->json([
                'message' => 'Brand deleted successfully'
            ]);
            
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'error' => 'Brand not found'
            ], 404);
        } catch (\Exception $e) {
            \Log::error('Error deleting brand: ' . $e->getMessage());
            return response()->json([
                'error' => 'Failed to delete brand',
                'message' => $e->getMessage()
            ], 500);
        }
    }
}