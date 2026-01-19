<?php

namespace App\Http\Controllers;

use App\Models\Estimate;
use App\Models\EstimateItem;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class EstimateController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $user = auth()->user();
            $query = Estimate::with(['creator', 'items.product', 'branch']);

            // Apply role and branch-based filtering
            if ($user->role_id == 1) {
                // Admin (role_id = 1) - see all estimates
                // No additional filtering
            } else {
                // All other users - filter by their branch_id
                if ($user->branch_id) {
                    $query->where('branch_id', $user->branch_id);
                } else {
                    // User has no branch assigned - show nothing
                    $query->whereRaw('1 = 0');
                }
            }

            // Apply search filter
            if ($request->filled('search')) {
                $search = $request->get('search');
                $query->where(function ($q) use ($search) {
                    $q->where('estimate_number', 'like', "%{$search}%")
                      ->orWhere('customer_name', 'like', "%{$search}%")
                      ->orWhere('phone_number', 'like', "%{$search}%")
                      ->orWhere('status', 'like', "%{$search}%")
                      ->orWhereHas('creator', function($q) use ($search) {
                          $q->where('name', 'like', "%{$search}%");
                      });
                });
            }

            // Apply status filter if provided
            if ($request->filled('status')) {
                $query->where('status', $request->get('status'));
            }

            // Apply date range filter if provided
            if ($request->filled('date_from')) {
                $query->whereDate('estimate_date', '>=', $request->get('date_from'));
            }
            if ($request->filled('date_to')) {
                $query->whereDate('estimate_date', '<=', $request->get('date_to'));
            }

            // Apply branch filter if provided (only for admin users)
            if ($request->filled('branch_id') && $user->role_id == 1) {
                $query->where('branch_id', $request->get('branch_id'));
            }

            // Order by latest first
            $query->orderBy('created_at', 'desc');

            // Paginate results
            $perPage = $request->get('per_page', 10);
            $estimates = $query->paginate($perPage);

            return response()->json($estimates);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error fetching estimates',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'customer_name' => 'required|string|max:255',
            'address' => 'required|string',
            'phone_number' => 'required|string|max:20',
            'estimate_date' => 'required|date',
            'valid_upto' => 'nullable|date|after_or_equal:estimate_date',
            'description' => 'nullable|string',
            'gst_type' => 'nullable|string|in:gst,without_gst',
            'gst' => 'nullable|numeric|min:0',
            'cgst' => 'nullable|numeric|min:0',
            'sgst' => 'nullable|numeric|min:0',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.price' => 'required|numeric|min:0',
        ]);

        try {

            $user = auth()->user();
            
            // Set branch_id based on user role: Admin (role_id=1) gets null, others get their branch_id
            $branchId = ($user->role_id == 1) ? null : $user->branch_id;
            
            DB::beginTransaction();

            // Generate estimate number
            $estimateNumber = Estimate::generateEstimateNumber();

            // Create estimate
            $estimate = Estimate::create([
                'branch_id' => $branchId,
                'customer_name' => $request->customer_name,
                'address' => $request->address,
                'phone_number' => $request->phone_number,
                'estimate_number' => $estimateNumber,
                'estimate_date' => $request->estimate_date,
                'valid_upto' => $request->valid_upto,
                'description' => $request->description,
                'gst' => $request->gst ?? 0,
                'cgst' => $request->cgst ?? 0,
                'sgst' => $request->sgst ?? 0,
                'created_by' => auth()->id(),
                'total_amount' => $request->total_amount ?? 0,
            ]);

            // Create estimate items
            foreach ($request->items as $item) {
                $totalPrice = $item['quantity'] * $item['price'];

                EstimateItem::create([
                    'estimate_id' => $estimate->id,
                    'product_id' => $item['product_id'],
                    'quantity' => $item['quantity'],
                    'price' => $item['price'],
                    'total_price' => $totalPrice,
                ]);
            }

            DB::commit();

            // Load relationships for response
            $estimate->load(['creator', 'items.product', 'branch']);

            return response()->json([
                'message' => 'Estimate created successfully',
                'estimate' => $estimate
            ], 201);

        } catch (\Exception $e) {
            DB::rollback();
            return response()->json([
                'message' => 'Error creating estimate',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Estimate $estimate): JsonResponse
    {
        try {
            $estimate->load(['creator', 'items.product', 'branch']);
            return response()->json($estimate);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error fetching estimate',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Estimate $estimate): JsonResponse
    {
        $request->validate([
            'customer_name' => 'required|string|max:255',
            'address' => 'required|string',
            'phone_number' => 'required|string|max:20',
            'estimate_date' => 'required|date',
            'valid_upto' => 'nullable|date|after_or_equal:estimate_date',
            'description' => 'nullable|string',
            'status' => 'nullable|in:draft,sent,approved,rejected',
            'gst_type' => 'nullable|string|in:gst,without_gst',
            'gst' => 'nullable|numeric|min:0',
            'cgst' => 'nullable|numeric|min:0',
            'sgst' => 'nullable|numeric|min:0',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.price' => 'required|numeric|min:0',
        ]);

        try {
            DB::beginTransaction();

            // Update estimate
            $estimate->update([
                'customer_name' => $request->customer_name,
                'address' => $request->address,
                'phone_number' => $request->phone_number,
                'estimate_date' => $request->estimate_date,
                'valid_upto' => $request->valid_upto,
                'description' => $request->description,
                'status' => $request->status ?? $estimate->status,
                'gst' => $request->gst ?? 0,
                'cgst' => $request->cgst ?? 0,
                'sgst' => $request->sgst ?? 0,
                'total_amount' => $request->total_amount ?? $estimate->total_amount,
            ]);

            // Delete existing items
            $estimate->items()->delete();

            // Create new items
            foreach ($request->items as $item) {
                $totalPrice = $item['quantity'] * $item['price'];

                EstimateItem::create([
                    'estimate_id' => $estimate->id,
                    'product_id' => $item['product_id'],
                    'quantity' => $item['quantity'],
                    'price' => $item['price'],
                    'total_price' => $totalPrice,
                ]);
            }

            DB::commit();

            // Load relationships for response
            $estimate->load(['creator', 'items.product', 'branch']);

            return response()->json([
                'message' => 'Estimate updated successfully',
                'estimate' => $estimate
            ]);

        } catch (\Exception $e) {
            DB::rollback();
            return response()->json([
                'message' => 'Error updating estimate',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Estimate $estimate): JsonResponse
    {
        try {
            $estimate->delete();
            return response()->json(['message' => 'Estimate deleted successfully']);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error deleting estimate',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Download estimate as PDF
     */
    public function download(Estimate $estimate)
    {
        try {
            // Load estimate with relationships
            $estimate->load(['creator', 'items.product', 'branch']);
            
            // Get company information for the PDF
            $company = \App\Models\Company::first();
            $activeLogo = \App\Models\CompanyLogo::where('is_active', true)->first();
            
            // Get logged user to determine address source
            $user = auth()->user();
            $addressToShow = '';
            $mobileToShow = '';
            
            if ($user->role_id == 1) {
                // Admin user - check if estimate has branch_id
                if ($estimate->branch_id != null && $estimate->branch) {
                    // Admin with estimate having branch - use branch address and mobile
                    $addressToShow = $estimate->branch->address ?: ($company ? $company->address : '');
                    if ($estimate->branch->customer_care_number) {
                        $mobileToShow = ($estimate->branch->country_code ?: '') . ' ' . $estimate->branch->customer_care_number;
                        $mobileToShow = trim($mobileToShow);
                    } else {
                        $mobileToShow = $company ? $company->mobile : '';
                    }
                } else {
                    // Admin with no branch in estimate - use company address and mobile
                    $addressToShow = $company ? $company->address : '';
                    $mobileToShow = $company ? $company->mobile : '';
                }
            } else {
                // Non-admin user - use branch address and mobile
                if ($estimate->branch) {
                    $addressToShow = $estimate->branch->address ?: ($company ? $company->address : '');
                    if ($estimate->branch->customer_care_number) {
                        $mobileToShow = ($estimate->branch->country_code ?: '') . ' ' . $estimate->branch->customer_care_number;
                        $mobileToShow = trim($mobileToShow);
                    } else {
                        $mobileToShow = $company ? $company->mobile : '';
                    }
                } else {
                    // Fallback to company data if branch not available
                    $addressToShow = $company ? $company->address : '';
                    $mobileToShow = $company ? $company->mobile : '';
                }
            }
            
            // Prepare data for PDF view
            $data = [
                'estimate' => $estimate,
                'company' => $company,
                'addressToShow' => $addressToShow,
                'mobileToShow' => $mobileToShow,
                'logo' => $activeLogo ? $activeLogo->logo_image : null,
            ];
            
            // Generate PDF using DomPDF
            $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('estimates.pdf', $data);
            $pdf->setPaper('A4', 'portrait');
            
            // Return PDF as response
            return $pdf->download("estimate-{$estimate->estimate_number}.pdf");
            
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error generating PDF',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
