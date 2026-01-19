<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\Ticket;
use App\Models\Company;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use Illuminate\Support\Facades\Validator;
use App\Services\SimpleXLSXParser;
use App\Services\WhatsappApiService;
use Log;

class CustomerController extends Controller
{
    use  WhatsappApiService;

    /**
     * Display a listing of the customers.
     */
    public function index(Request $request)
    {
        $user = auth()->user();
        $query = Customer::with('branch');

        // Filter by branch_id parameter if provided (for dropdowns)
        $branchId = $request->branch_id ?? '';
        if (!empty($branchId)) {
            $query->where('branch_id', $branchId);
        } else {
            // Filter by branch for non-admin users
            if ($user->role_id != 1) {
                // For non-admin users, show only customers from their branch
                if ($user->branch_id) {
                    $query->where('branch_id', $user->branch_id);
                }
            }
            // Admin users (role_id = 1) can see all customers
        }

        $customers = $query->orderBy('id', 'ASC')->get();

        return response()->json($customers);
    }

    /**
     * Get customers with ticket counts for listing
     */
    public function customersWithTickets(Request $request)
    {
        $user = auth()->user();
        $query = Customer::with('branch')->withCount('ticket');
        
        // Filter by branch for non-admin users
        if ($user->role_id != 1) {
            // For non-admin users, show only customers from their branch
            if ($user->branch_id) {
                $query->where('branch_id', $user->branch_id);
            }
        }
        // Admin users (role_id = 1) can see all customers
        
        // Handle search
        if ($search = $request->get('search')) {
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('mobile', 'like', "%{$search}%")
                  ->orWhere('company_name', 'like', "%{$search}%");
            });
        }
        
        $perPage = $request->get('per_page', 10);
        $customers = $query->orderBy('created_at', 'desc')->paginate($perPage);
        
        // Transform the data to rename ticket_count to tickets_count for consistency
        $customers->getCollection()->transform(function ($customer) {
            $customer->tickets_count = $customer->ticket_count;
            unset($customer->ticket_count);
            return $customer;
        });
        
        return response()->json($customers);
    }

    /**
     * Store a newly created customer.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'nullable|email|max:255',
            'country_code' => 'nullable|string|max:10',
            'contact_number' => 'nullable|string|max:20',
            'company_name' => 'nullable|string|max:255',
            'branch_id' => 'nullable|exists:branches,id',
        ]);

        // Set default country code if not provided
        if (!isset($validated['country_code']) || empty($validated['country_code'])) {
            $validated['country_code'] = '+91';
        }

        // Map contact_number to mobile field
        if (isset($validated['contact_number']) && !empty($validated['contact_number'])) {
            $validated['mobile'] = $validated['contact_number'];
        } else {
            $validated['mobile'] = null;
        }

        // Remove contact_number from validated array as we use mobile field
        if (isset($validated['contact_number'])) {
            unset($validated['contact_number']);
        }

        // Set created_by to the authenticated user
        $validated['created_by'] = auth()->id() ?? 1;

        // Handle branch_id assignment
        $user = auth()->user();
        if ($user->role_id != 1) {
            // For non-admin users, use their branch_id
            $validated['branch_id'] = $user->branch_id;
        }
        // Admin users can specify branch_id or it will be from request

        $customer = Customer::create($validated);
        
        // Load branch relationship
        $customer->load('branch');

        return response()->json([
            'message' => 'Customer created successfully',
            'customer' => $customer
        ], 201);
    }

    /**
     * Update the specified customer in storage.
     */
    public function update(Request $request, $id)
    {
        $customer = Customer::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'nullable|email|max:255',
            'country_code' => 'nullable|string|max:10',
            'contact_number' => 'nullable|string|max:20',
            'company_name' => 'nullable|string|max:255',
            'branch_id' => 'nullable|exists:branches,id',
        ]);

        // Handle mobile number
        if (!empty($validated['contact_number'])) {
            // Use country_code from request if provided, otherwise default to +91
            if (!isset($validated['country_code']) || empty($validated['country_code'])) {
                $validated['country_code'] = '+91';
            }
            $validated['mobile'] = $validated['contact_number'];
            unset($validated['contact_number']);
        } else {
            $validated['mobile'] = null;
            if (!isset($validated['country_code'])) {
                $validated['country_code'] = null;
            }
        }

        $customer->update($validated);
        
        // Load branch relationship
        $customer->load('branch');

        return response()->json([
            'message' => 'Customer updated successfully',
            'customer' => $customer
        ]);
    }

    /**
     * Get customer details with tickets
     */
    public function customerDetails($customerId)
    {
        $customer = Customer::with('branch')->findOrFail($customerId);
        
        // Get tickets with relationships
        $tickets = Ticket::where('customer_id', $customer->id)
            ->with(['ticketStatus', 'ticketPriority', 'user:id,name', 'agent:id,name'])
            ->orderBy('created_at', 'desc')
            ->get();
        
        // Calculate stats
        $stats = [
            'total_tickets' => $tickets->count(),
            'open_tickets' => $tickets->filter(function($t) {
                return $t->ticketStatus && strtolower($t->ticketStatus->status) === 'open';
            })->count(),
            'in_progress_tickets' => $tickets->filter(function($t) {
                return $t->ticketStatus && str_contains(strtolower($t->ticketStatus->status), 'progress');
            })->count(),
            'closed_tickets' => $tickets->filter(function($t) {
                return $t->ticketStatus && strtolower($t->ticketStatus->status) === 'closed';
            })->count(),
        ];
        
        return response()->json([
            'customer' => $customer,
            'tickets' => $tickets,
            'stats' => $stats
        ]);
    }



    public function getTicketStatus()
    {
        return response()->json(\App\Models\TicketStatus::select('id', 'status', 'color_code')->where('active', 1)->get());
    }

public function getPriorities()
{
return response()->json(\App\Models\Priority::select('id', 'title', 'color')
            ->where('active', 1)
            ->where('title', '!=', 'Urgent')
            ->get());
}

public function getBranches()
{
return response()->json(\App\Models\Branch::select('id', 'branch')->get());
}

public function getTicketLabels()
{
    return response()->json(\App\Models\TicketLabel::select('id', 'label', 'color')
            ->where('active', 1)
            ->get());
}

    /**
     * Register a new customer with an issue (creates customer and ticket)
     */
    public function registerCustomer(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'country_code' => 'nullable|string|max:20',
            'contact_number' => 'nullable|string|max:20',
            'company_name' => 'nullable|string|max:255',
            'issue' => 'required|string|min:10',
            'branch_id' => 'nullable|exists:branches,id',
        ]);

        try {
            DB::beginTransaction();

            // Check if customer with same email already exists
            $existingCustomer = Customer::where('email', $validated['email'])->first();
            
            if ($existingCustomer) {
                // Use existing customer
                $customer = $existingCustomer;
                
                // Update customer info if provided
                if (!empty($validated['contact_number']) && empty($customer->mobile)) {

                    $customer->country_code = substr($validated['country_code'],1);
                    $customer->mobile = $validated['contact_number'];

                }
                if (!empty($validated['company_name']) && empty($customer->company_name)) {
                    $customer->company_name = $validated['company_name'];
                }
                // Update branch_id if provided and customer doesn't have one
                if (!empty($validated['branch_id']) && empty($customer->branch_id)) {
                    $customer->branch_id = $validated['branch_id'];
                }
                $customer->save();
            } else {
                // Create new customer
                $customerData = [
                    'name' => $validated['name'],
                    'email' => $validated['email'],
                    'country_code'=>substr($validated['country_code'],1),
                    'mobile'=>$validated['contact_number'],
                    'company_name' => $validated['company_name'] ?? null,
                    'branch_id' => $validated['branch_id'] ?? (auth()->user()->branch_id ?? null),
                    'created_by' => 1, // System user
                ];

                $customer = Customer::create($customerData);
            }

            // Set due date to day after tomorrow at 5:30 PM
            $dueDate = now()->addDays(2)->setTime(17, 30, 0)->format('Y-m-d H:i:s');
            
            $ticket = Ticket::create([
                'issue' => $validated['issue'],
                'description' => 'Issue submitted through customer registration form',
                'customer_id' => $customer->id,
                'created_by' => 1, // System user
                'tracking_number' => 0,
                'slug' => Str::slug($validated['issue'] . '-' . time()),
                'priority' => 2, // Normal priority
                'branch_id' => $validated['branch_id'] ?? null, // Add branch_id from registration
                'status' => 1, // Open status
                'due_date' => $dueDate,
                'closed_time' => Carbon::parse('01-01-2025 5:30:00 PM')->format('h:i:s'),
            ]);

            // Generate unique tracking number with ONS prefix
            $lastTicket = $ticket->id;
            $trackingNumber = 'ONS' . str_pad($lastTicket, 7, '0', STR_PAD_LEFT);
            $ticket->tracking_number=$trackingNumber;
            $ticket->save();
            
            DB::commit();

          /* ---- To send whatsapp message ----- service request -------------- */
           try
            {
                $data=[
                    "customer_name"=>$customer->name,
                    "user_mobile"=>$customer->country_code.$customer->mobile,
                    "tracking_id"=>$trackingNumber,
                    "template_id"=>"259094", //wabis id
                    "delivered_date"=>null,
                    "delivery_text"=>null,
                    "branch_id"=>$validated['branch_id']
                ];

                $send_response=$this->sendServiceMessages($data);
                \Log::info($send_response);
            }
            catch (\Exception $e) {
                \Log::info($e->getMessage());
            }
        
          //-------------------------------------------------------------------

            return response()->json([
                'success' => true,
                'message' => 'Registration successful. Your ticket has been created.',
                'tracking_number' => $trackingNumber,
                'customer_id' => $customer->id,
                'ticket_id' => $ticket->id,
                'due_date' => $dueDate
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            
            return response()->json([
                'success' => false,
                'message' => 'Registration failed. Please try again.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Import customers from CSV or XLSX file
     */
    public function importCustomers(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:csv,txt,xlsx,xls|max:10240', // Max 10MB
        ]);

        try {
            $user = auth()->user();
            $file = $request->file('file');
            $extension = strtolower($file->getClientOriginalExtension());

            $rows = [];

            if ($extension === 'xlsx' || $extension === 'xls') {
                // Parse Excel file
                try {
                    $rows = SimpleXLSXParser::parse($file->getPathname());
                } catch (\Exception $e) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Failed to parse Excel file: ' . $e->getMessage()
                    ], 400);
                }
            } else {
                // Read CSV file
                if (($handle = fopen($file->getPathname(), 'r')) !== FALSE) {
                    // Read all rows
                    while (($data = fgetcsv($handle, 1000, ',')) !== FALSE) {
                        $rows[] = $data;
                    }
                    fclose($handle);
                }
            }

            if (empty($rows)) {
                return response()->json([
                    'success' => false,
                    'message' => 'The file is empty'
                ], 400);
            }

            // Debug: Log row count
            $totalRows = count($rows);

            // Get headers from first row and normalize them
            $headers = array_map(function($header) {
                return strtolower(trim(str_replace(' ', '_', $header)));
            }, $rows[0]);

            // Find column indexes
            $nameIndex = array_search('name', $headers);
            $emailIndex = array_search('email', $headers);
            $countryCodeIndex = array_search('country_code', $headers);
            $mobileIndex = array_search('mobile', $headers);
            $companyNameIndex = array_search('company_name', $headers);

            // Check if name column exists (required)
            if ($nameIndex === false) {
                return response()->json([
                    'success' => false,
                    'message' => 'Name column is required in the CSV file'
                ], 400);
            }

            $imported = 0;
            $skipped = 0;
            $errors = [];

            // Process each row (skip header row)
            for ($i = 1; $i < count($rows); $i++) {
                $row = $rows[$i];

                // Skip empty rows
                if (empty(array_filter($row))) {
                    continue;
                }

                try {
                    // Extract data from row
                    $name = isset($row[$nameIndex]) ? trim($row[$nameIndex]) : '';

                    // Skip if name is empty
                    if (empty($name)) {
                        continue;
                    }

                    $email = $emailIndex !== false && isset($row[$emailIndex]) ? trim($row[$emailIndex]) : null;
                    $countryCode = $countryCodeIndex !== false && isset($row[$countryCodeIndex]) ? trim($row[$countryCodeIndex]) : null;
                    $mobile = $mobileIndex !== false && isset($row[$mobileIndex]) ? trim($row[$mobileIndex]) : null;
                    $companyName = $companyNameIndex !== false && isset($row[$companyNameIndex]) ? trim($row[$companyNameIndex]) : null;

                    // Validate email if provided
                    if ($email && !filter_var($email, FILTER_VALIDATE_EMAIL)) {
                        $errors[$i + 1] = ['Invalid email format: ' . $email];
                        continue;
                    }

                    // Format country code
                    if ($countryCode && !str_starts_with($countryCode, '+')) {
                        $countryCode = '+' . $countryCode;
                    }

                    // Prepare customer data
                    $customerData = [
                        'name' => $name,
                        'email' => $email,
                        'country_code' => $countryCode,
                        'mobile' => $mobile,
                        'company_name' => $companyName,
                        'created_by' => $user->id ?? 1,  // Add created_by field
                    ];

                    // Add branch_id based on user role
                    if ($request->has('branch_id')) {
                        $customerData['branch_id'] = $request->branch_id;
                    } elseif ($user->role_id != 1 && $user->branch_id) {
                        $customerData['branch_id'] = $user->branch_id;
                    }

                    // Check if customer already exists
                    $existingCustomer = Customer::query();

                    $checkDuplicate = false;

                    if ($email) {
                        $existingCustomer->where('email', $email);
                        $checkDuplicate = true;
                    } elseif ($mobile) {
                        // If no email, check by mobile only
                        $existingCustomer->where('mobile', $mobile);
                        $checkDuplicate = true;
                    } else {
                        // If neither email nor mobile, check by name only
                        $existingCustomer->where('name', $name);
                        $checkDuplicate = true;
                    }

                    // Apply branch filter for non-admin users when checking duplicates
                    if ($checkDuplicate && $user->role_id != 1 && $user->branch_id) {
                        $existingCustomer->where('branch_id', $user->branch_id);
                    }

                    // Create customer if doesn't exist
                    if (!$checkDuplicate || !$existingCustomer->exists()) {
                        Customer::create($customerData);
                        $imported++;
                    } else {
                        $skipped++;
                    }

                } catch (\Exception $e) {
                    $errors[$i + 1] = ['Error: ' . $e->getMessage()];
                }
            }

            $response = [
                'success' => true,
                'imported_count' => $imported,
                'skipped_count' => $skipped,
                'total_rows' => $totalRows - 1, // Excluding header
                'message' => "$imported customers imported successfully"
            ];

            if ($skipped > 0) {
                $response['message'] .= ", $skipped customers skipped (duplicates)";
            }

            if (!empty($errors)) {
                $response['errors'] = $errors;
                $response['message'] .= '. Some rows had errors.';
            }

            return response()->json($response);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to process the file: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete a customer
     */
    public function destroy($id)
    {
        try {
            $customer = Customer::findOrFail($id);

            // Check if customer has any tickets
            $ticketCount = Ticket::where('customer_id', $customer->id)->count();

            if ($ticketCount > 0) {
                return response()->json([
                    'success' => false,
                    'message' => "Cannot delete customer. This customer has {$ticketCount} ticket(s) associated with them.",
                    'ticket_count' => $ticketCount
                ], 400);
            }

            // Delete the customer
            $customer->delete();

            return response()->json([
                'success' => true,
                'message' => 'Customer deleted successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete customer: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Download customer import template
     */
    public function downloadTemplate()
    {
        try {
            // Create a simple Excel-compatible CSV template
            $headers = ['name', 'email', 'country_code', 'mobile', 'company_name'];
            $sampleData = [
                ['John Doe', 'john.doe@example.com', '+91', '9876543210', 'ABC Corporation'],
                ['Jane Smith', 'jane.smith@example.com', '+1', '5551234567', 'XYZ Industries'],
                ['Robert Johnson', 'robert.j@example.com', '+44', '7700900123', 'Tech Solutions Ltd']
            ];

            // Create CSV content
            $csvContent = implode(',', $headers) . "\n";
            foreach ($sampleData as $row) {
                $csvContent .= implode(',', $row) . "\n";
            }

            // Return as downloadable file
            return response($csvContent, 200)
                ->header('Content-Type', 'text/csv')
                ->header('Content-Disposition', 'attachment; filename="customer_sample.csv"')
                ->header('Cache-Control', 'no-cache, no-store, must-revalidate')
                ->header('Pragma', 'no-cache')
                ->header('Expires', '0');

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to generate template: ' . $e->getMessage()
            ], 500);
        }
    }

}