<?php

namespace App\Http\Controllers;

use App\Models\Company;
use Illuminate\Http\Request;

class CompanyController extends Controller
{
    /**
     * Get company information including logo
     */
    public function getCompanyInfo()
    {
        try {
            // Get the first company record (assuming single company setup)
            $company = Company::first();

            if (!$company) {
                return response()->json([
                    'message' => 'Company information not found',
                    'company' => null
                ], 404);
            }

            return response()->json([
                'company' => $company
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error fetching company information',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
