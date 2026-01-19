<?php

namespace App\Http\Controllers;

use App\Models\CompanyLogo;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class CompanyLogoController extends Controller
{
    /**
     * Get the active company logo (public endpoint)
     */
    public function getActiveLogo()
    {
        try {
            $activeLogo = CompanyLogo::getActiveLogo();
            
            if ($activeLogo) {
                return response()->json([
                    'success' => true,
                    'logo' => [
                        'id' => $activeLogo->id,
                        'name' => $activeLogo->name,
                        'type' => $activeLogo->type,
                        'logo_image' => $activeLogo->logo_image,
                        'is_active' => $activeLogo->is_active
                    ]
                ]);
            }
            
            return response()->json([
                'success' => true,
                'logo' => null
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error fetching active logo'
            ], 500);
        }
    }

    /**
     * Get the active favicon (public endpoint)
     */
    public function getActiveFavicon()
    {
        try {
            $activeFavicon = CompanyLogo::getActiveFavicon();
            
            if ($activeFavicon) {
                return response()->json([
                    'success' => true,
                    'favicon' => [
                        'id' => $activeFavicon->id,
                        'name' => $activeFavicon->name,
                        'type' => $activeFavicon->type,
                        'logo_image' => $activeFavicon->logo_image,
                        'is_active' => $activeFavicon->is_active
                    ]
                ]);
            }
            
            return response()->json([
                'success' => true,
                'favicon' => null
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error fetching active favicon'
            ], 500);
        }
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = CompanyLogo::with('creator');
        
        // Search functionality
        if ($request->has('search') && $request->search != '') {
            $search = $request->search;
            $query->where('name', 'like', '%' . $search . '%');
        }
        
        $perPage = $request->get('per_page', 10);
        $logos = $query->orderBy('created_at', 'desc')->paginate($perPage);
        
        return response()->json($logos);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'nullable|string|max:255',
            'type' => 'required|in:Logo,Favicon',
            'logo_image' => 'required|file|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
            'is_active' => 'nullable|in:true,false,1,0'
        ]);

        if ($validator->fails()) {
            \Log::error('Company logo validation failed', [
                'errors' => $validator->errors(),
                'request_data' => $request->except(['logo_image']),
                'has_file' => $request->hasFile('logo_image')
            ]);
            
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
                'debug' => [
                    'has_logo_file' => $request->hasFile('logo_image'),
                    'is_active_value' => $request->get('is_active'),
                    'name_value' => $request->get('name')
                ]
            ], 422);
        }

        try {
            $logoPath = null;
            
            if ($request->hasFile('logo_image')) {
                $image = $request->file('logo_image');
                $imageName = time() . '_' . Str::random(10) . '.' . $image->getClientOriginalExtension();
                
                // Create uploads/logo directory if it doesn't exist
                $logoDir = public_path('uploads/logo');
                if (!file_exists($logoDir)) {
                    mkdir($logoDir, 0755, true);
                }
                
                $image->move($logoDir, $imageName);
                $logoPath = 'uploads/logo/' . $imageName;
            }

            $logo = CompanyLogo::create([
                'name' => $request->name,
                'type' => $request->type,
                'logo_image' => $logoPath,
                'is_active' => filter_var($request->get('is_active', true), FILTER_VALIDATE_BOOLEAN),
                'created_by' => auth()->id()
            ]);

            $logo->load('creator');

            return response()->json([
                'message' => 'Company logo created successfully',
                'data' => $logo
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error creating company logo',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(CompanyLogo $companyLogo)
    {
        $companyLogo->load('creator');
        return response()->json($companyLogo);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, CompanyLogo $companyLogo)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'nullable|string|max:255',
            'type' => 'required|in:Logo,Favicon',
            'logo_image' => 'nullable|file|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
            'is_active' => 'nullable|in:true,false,1,0'
        ]);

        if ($validator->fails()) {
            \Log::error('Company logo validation failed', [
                'errors' => $validator->errors(),
                'request_data' => $request->except(['logo_image']),
                'has_file' => $request->hasFile('logo_image')
            ]);
            
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
                'debug' => [
                    'has_logo_file' => $request->hasFile('logo_image'),
                    'is_active_value' => $request->get('is_active'),
                    'name_value' => $request->get('name')
                ]
            ], 422);
        }

        try {
            $updateData = [
                'name' => $request->name,
                'type' => $request->type,
                'is_active' => filter_var($request->get('is_active', $companyLogo->is_active), FILTER_VALIDATE_BOOLEAN)
            ];

            // Handle logo image upload
            if ($request->hasFile('logo_image')) {
                // Delete old logo if exists
                if ($companyLogo->logo_image && file_exists(public_path($companyLogo->logo_image))) {
                    unlink(public_path($companyLogo->logo_image));
                }

                $image = $request->file('logo_image');
                $imageName = time() . '_' . Str::random(10) . '.' . $image->getClientOriginalExtension();
                
                // Create uploads/logo directory if it doesn't exist
                $logoDir = public_path('uploads/logo');
                if (!file_exists($logoDir)) {
                    mkdir($logoDir, 0755, true);
                }
                
                $image->move($logoDir, $imageName);
                $updateData['logo_image'] = 'uploads/logo/' . $imageName;
            }

            $companyLogo->update($updateData);
            $companyLogo->load('creator');

            return response()->json([
                'message' => 'Company logo updated successfully',
                'data' => $companyLogo
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error updating company logo',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(CompanyLogo $companyLogo)
    {
        try {
            // Delete logo file if exists
            if ($companyLogo->logo_image && file_exists(public_path($companyLogo->logo_image))) {
                unlink(public_path($companyLogo->logo_image));
            }

            $companyLogo->delete();

            return response()->json([
                'message' => 'Company logo deleted successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error deleting company logo',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
