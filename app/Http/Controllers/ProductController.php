<?php

namespace App\Http\Controllers;

use App\Models\Product;

use Illuminate\Http\Request;

class ProductController extends Controller
{
    /**
     * Display a listing of the products.
     */
    public function index(Request $request)
    {
        try {
            $user = auth()->user();
            $query = Product::with(['category', 'brand', 'branch']);

            // Filter products based on user role
            if ($user->role_id != 1) {
                // For non-admin users, show only products from their branch
                if ($user->branch_id) {
                    $query->where('branch_id', $user->branch_id);
                }
            }
            // Admin users (role_id = 1) can see all products

            // Date range filter
            if ($request->has('from_date') && !empty($request->from_date)) {
                $query->whereDate('created_at', '>=', $request->from_date);
            }
            if ($request->has('to_date') && !empty($request->to_date)) {
                $query->whereDate('created_at', '<=', $request->to_date);
            }

            // Branch filter (only for admin users)
            if ($request->has('branch_id') && !empty($request->branch_id) && $user->role_id == 1) {
                $query->where('branch_id', $request->branch_id);
            }

            // Brand filter
            if ($request->has('brand_id') && !empty($request->brand_id)) {
                $query->where('brand_id', $request->brand_id);
            }

            // Category filter
            if ($request->has('category_id') && !empty($request->category_id)) {
                $query->where('category_id', $request->category_id);
            }

            // Search functionality
            if ($request->has('search') && !empty($request->search)) {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('code', 'like', "%{$search}%");
                });
            }

            // Pagination
            $perPage = $request->input('per_page', 10);
            $page = $request->input('page', 1);

            $products = $query->paginate($perPage, ['*'], 'page', $page);

            \Log::info('ProductController@index called');
            \Log::info('Per page: ' . $perPage . ', Current page: ' . $page);
            \Log::info('Total products: ' . $products->total());
            \Log::info('Products on this page: ' . $products->count());

            // Return paginated response
            return response()->json($products);
        } catch (\Exception $e) {
            \Log::error('Error fetching products in index: ' . $e->getMessage());
            \Log::error('Stack trace: ' . $e->getTraceAsString());
            return response()->json(['error' => 'Failed to fetch products', 'message' => $e->getMessage()], 500);
        }
    }


public function getProducts(Request $request)
    {
        try {
            $user = auth()->user();
            $query = Product::with(['category', 'brand', 'branch']);
            
            // Filter products based on user role
            if ($user->role_id != 1) {
                // For non-admin users, show only products from their branch
                if ($user->branch_id) {
                    $query->where('branch_id', $user->branch_id);
                }
            }
            
            // Search functionality
            if ($request->has('search') && !empty($request->search)) {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('sku', 'like', "%{$search}%")
                      ->orWhere('description', 'like', "%{$search}%");
                });
            }
            
            // Pagination
            $perPage = $request->input('per_page', 10);
            $products = $query->paginate($perPage);
            
            return response()->json($products);
        } catch (\Exception $e) {
            \Log::error('Error fetching products: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to fetch products'], 500);
        }
    }

    /**
     * Store a newly created product.
     */
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'code' => 'required|string|max:50|unique:products,code',
                'category_id' => 'required|exists:categories,id',
                'brand_id' => 'required|exists:brands,id',
                'branch_id' => 'nullable|exists:branches,id',
                'cost' => 'required|numeric|min:0',
                'stock' => 'required|integer|min:0'
            ]);
            
            $user = auth()->user();
            
            // Handle branch_id assignment
            if ($user->role_id != 1) {
                // For non-admin users, use their branch_id
                $validated['branch_id'] = $user->branch_id;
            }
            // Admin users can specify branch_id or it will be from request
            
            // Add the authenticated user as created_by
            $validated['created_by'] = auth()->id() ?? 1;
            // Set initial_stock same as stock for new products
            $validated['initial_stock'] = $validated['stock'];
            // Set status as active by default for new products
            $validated['status'] = 1;
            
            $product = Product::create($validated);
            
            // Load relationships
            $product->load(['category', 'brand']);
            
            \Log::info('Product created: ' . json_encode($product->toArray()));
            
            return response()->json([
                'message' => 'Product created successfully',
                'product' => $product
            ], 201);
            
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            \Log::error('Error creating product: ' . $e->getMessage());
            return response()->json([
                'error' => 'Failed to create product',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get all categories.
     */
    public function getCategories(Request $request)
    {
        try {
            $query = \App\Models\Category::query();
            
            // Filter by brand if brand_id is provided
            if ($request->has('brand_id') && $request->brand_id) {
                $query->where('brand_id', $request->brand_id);
            }
            
            $categories = $query->get();
            return response()->json($categories);
        } catch (\Exception $e) {
            \Log::error('Error fetching categories: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to fetch categories'], 500);
        }
    }

    /**
     * Get all brands.
     */
    public function getBrands()
    {
        try {
            $brands = \App\Models\Brand::all();
            return response()->json($brands);
        } catch (\Exception $e) {
            \Log::error('Error fetching brands: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to fetch brands'], 500);
        }
    }

    /**
     * Update the specified product.
     */
    public function update(Request $request, $id)
    {
        try {
            $product = Product::findOrFail($id);
            
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'code' => 'required|string|max:50|unique:products,code,' . $id,
                'category_id' => 'required|exists:categories,id',
                'brand_id' => 'required|exists:brands,id',
                'cost' => 'required|numeric|min:0',
                'stock' => 'required|integer|min:0'
            ]);
            
            // For updates, don't change initial_stock - it should remain as originally set
            // Only update the fields that are being changed
            
            $product->update($validated);
            
            // Load relationships
            $product->load(['category', 'brand']);
            
            \Log::info('Product updated: ' . json_encode($product->toArray()));
            
            return response()->json([
                'message' => 'Product updated successfully',
                'product' => $product
            ]);
            
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'error' => 'Product not found'
            ], 404);
        } catch (\Exception $e) {
            \Log::error('Error updating product: ' . $e->getMessage());
            return response()->json([
                'error' => 'Failed to update product',
                'message' => $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Delete the specified product.
     */
    public function destroy($id)
    {
        try {
            $product = Product::findOrFail($id);
            
            // Store product info for logging
            $productInfo = $product->name . ' (Code: ' . $product->code . ')';
            
            $product->delete();
            
            \Log::info('Product deleted: ' . $productInfo . ' (ID: ' . $id . ')');
            
            return response()->json([
                'message' => 'Product deleted successfully'
            ]);
            
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'error' => 'Product not found'
            ], 404);
        } catch (\Exception $e) {
            \Log::error('Error deleting product: ' . $e->getMessage());
            return response()->json([
                'error' => 'Failed to delete product',
                'message' => $e->getMessage()
            ], 500);
        }
    }
    
}