<?php

namespace App\Imports;

use App\Models\Customer;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithValidation;
use Maatwebsite\Excel\Concerns\SkipsEmptyRows;
use Maatwebsite\Excel\Concerns\SkipsOnFailure;
use Maatwebsite\Excel\Concerns\SkipsFailures;
use Illuminate\Support\Facades\Auth;

class CustomersImport implements ToModel, WithHeadingRow, WithValidation, SkipsEmptyRows, SkipsOnFailure
{
    use SkipsFailures;

    protected $branchId;
    protected $importedCount = 0;

    public function __construct($branchId = null)
    {
        $this->branchId = $branchId;
    }

    /**
     * @param array $row
     *
     * @return \Illuminate\Database\Eloquent\Model|null
     */
    public function model(array $row)
    {
        // Skip if name is empty
        if (empty($row['name'])) {
            return null;
        }

        $user = Auth::user();

        // Prepare data
        $data = [
            'name' => trim($row['name']),
            'email' => !empty($row['email']) ? trim($row['email']) : null,
            'country_code' => !empty($row['country_code']) ? $this->formatCountryCode($row['country_code']) : null,
            'mobile' => !empty($row['mobile']) ? trim($row['mobile']) : null,
            'company_name' => !empty($row['company_name']) ? trim($row['company_name']) : null,
        ];

        // Add branch_id
        if ($this->branchId) {
            $data['branch_id'] = $this->branchId;
        } elseif ($user && $user->role_id != 1 && $user->branch_id) {
            $data['branch_id'] = $user->branch_id;
        }

        // Check if customer already exists
        $existingCustomer = Customer::query();

        if ($data['email']) {
            $existingCustomer->where('email', $data['email']);
        } else {
            $existingCustomer->where('name', $data['name']);
            if ($data['mobile']) {
                $existingCustomer->where('mobile', $data['mobile']);
            }
        }

        // Apply branch filter for non-admin users
        if ($user && $user->role_id != 1 && $user->branch_id) {
            $existingCustomer->where('branch_id', $user->branch_id);
        }

        // Only create if customer doesn't exist
        if (!$existingCustomer->exists()) {
            $this->importedCount++;
            return new Customer($data);
        }

        return null;
    }

    /**
     * Format country code to include + prefix
     */
    private function formatCountryCode($countryCode)
    {
        $countryCode = trim($countryCode);
        if (!empty($countryCode) && !str_starts_with($countryCode, '+')) {
            return '+' . $countryCode;
        }
        return $countryCode;
    }

    /**
     * Validation rules
     */
    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'email' => 'nullable|email|max:255',
            'country_code' => 'nullable|string|max:10',
            'mobile' => 'nullable|string|max:20',
            'company_name' => 'nullable|string|max:255',
        ];
    }

    /**
     * Get the count of imported customers
     */
    public function getImportedCount(): int
    {
        return $this->importedCount;
    }
}