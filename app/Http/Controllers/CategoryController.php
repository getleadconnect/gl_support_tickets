<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class CategoryController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        try {
            $query = Category::with('brand')->orderBy('created_at', 'desc');
            
            // Filter by brand_id if provided
            if ($request->has('brand_id') && $request->brand_id) {
                $query->where('brand_id', $request->brand_id);
            }
            
            $categories = $query->get();
            return response()->json($categories);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to fetch categories'], 500);
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'category' => 'required|string|max:255',
                'brand_id' => 'required|integer|exists:brands,id',
            ]);

            // Check if category already exists for this brand
            $existingCategory = Category::where('category', $validated['category'])
                ->where('brand_id', $validated['brand_id'])
                ->first();

            if ($existingCategory) {
                return response()->json([
                    'message' => 'Category already exists for this brand'
                ], 422);
            }

            $category = Category::create([
                'category' => $validated['category'],
                'brand_id' => $validated['brand_id'],
                'created_by' => Auth::id(),
            ]);

            // Load the brand relationship
            $category->load('brand');

            return response()->json($category, 201);

        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to create category'
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Category $category)
    {
        try {
            $category->load('brand');
            return response()->json($category);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Category not found'], 404);
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Category $category)
    {
        try {
            $validated = $request->validate([
                'category' => 'required|string|max:255',
                'brand_id' => 'required|integer|exists:brands,id',
            ]);

            // Check if category already exists for this brand (excluding current category)
            $existingCategory = Category::where('category', $validated['category'])
                ->where('brand_id', $validated['brand_id'])
                ->where('id', '!=', $category->id)
                ->first();

            if ($existingCategory) {
                return response()->json([
                    'message' => 'Category already exists for this brand'
                ], 422);
            }

            $category->update([
                'category' => $validated['category'],
                'brand_id' => $validated['brand_id'],
            ]);

            // Load the brand relationship
            $category->load('brand');

            return response()->json($category);

        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to update category'
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Category $category)
    {
        try {
            // Check if category is being used by products
            $productCount = $category->products()->count();
            
            if ($productCount > 0) {
                return response()->json([
                    'message' => "Cannot delete category. It is being used by {$productCount} product(s)."
                ], 422);
            }

            $category->delete();

            return response()->json(['message' => 'Category deleted successfully']);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to delete category'
            ], 500);
        }
    }
}