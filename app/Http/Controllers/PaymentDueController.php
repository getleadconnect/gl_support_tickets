<?php

namespace App\Http\Controllers;

use App\Models\PaymentDue;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PaymentDueController extends Controller
{
    public function index(Request $request)
    {
        try {
            $user = auth()->user();
            $perPage = $request->per_page ?? 10;
            $page = $request->page ?? 1;
            $offset = ($page - 1) * $perPage;
            $search = $request->search ?? '';
            $startDate = $request->start_date ?? '';
            $endDate = $request->end_date ?? '';
            $customerId = $request->customer_id ?? '';

            // First, let's test if basic query works
            $testQuery = DB::table('payment_dues')->where('status', 'Pending')->count();
            
            if ($testQuery === 0) {
                return response()->json([
                    'data' => [],
                    'current_page' => 1,
                    'last_page' => 1,
                    'per_page' => $perPage,
                    'total' => 0,
                    'total_balance_due' => 0
                ]);
            }

            // Build the main query with joins
            $query = DB::table('payment_dues as pd')
                ->leftJoin('customers as c', 'pd.customer_id', '=', 'c.id')
                ->leftJoin('branches as b', 'c.branch_id', '=', 'b.id')
                ->select([
                    'pd.customer_id',
                    DB::raw('MAX(c.name) as customer_name'),
                    DB::raw('MAX(c.email) as customer_email'),
                    DB::raw('MAX(c.mobile) as customer_mobile'),
                    DB::raw('MAX(c.country_code) as customer_country_code'),
                    DB::raw('MAX(c.company_name) as customer_company_name'),
                    DB::raw('MAX(b.branch_name) as branch_name'),
                    DB::raw('SUM(pd.balance_due) as total_balance_due'),
                    DB::raw('COUNT(*) as dues_count'),
                    DB::raw('MAX(pd.created_at) as created_at')
                ])
                ->where('pd.status', 'Pending')
                ->groupBy('pd.customer_id');

        // Apply role-based filtering
        if ($user->role_id == 2) {
            $query->where('pd.created_by', $user->id);
        } elseif ($user->role_id == 3) {
            $assignedAgentIds = DB::table('assign_agents')
                ->where('user_id', $user->id)
                ->pluck('agent_id')->toArray();
            
            if (!empty($assignedAgentIds)) {
                $query->whereIn('pd.created_by', $assignedAgentIds);
            } else {
                $query->whereRaw('1 = 0');
            }
        } elseif ($user->role_id == 4 && $user->branch_id) {
            $query->where('pd.branch_id', $user->branch_id);
        }

        // Apply search filter
        if (!empty($search)) {
            $query->where(function($q) use ($search) {
                $q->where('c.name', 'like', "%{$search}%")
                  ->orWhere('c.mobile', 'like', "%{$search}%");
            });
        }

        // Apply date range filter
              
            if (!empty($startDate) && !empty($endDate)) {
                $query->where('pd.created_at', '>=', $startDate . ' 00:00:00')->where('pd.created_at', '<=', $endDate . ' 23:59:59');
            }
       

        // Apply customer filter
        if (!empty($customerId)) {
            $query->where('pd.customer_id', $customerId);
        }

        // Clone query for total count and balance calculation
        $countQuery = clone $query;
        $balanceQuery = clone $query;

        // Get total count for pagination
        $totalCount = $countQuery->get()->count();

        // Calculate total balance due - need to sum the grouped results
        $balanceResults = $balanceQuery->get();
        $totalBalance = $balanceResults->sum('total_balance_due');

        // Get paginated results
        $paymentDues = $query->orderBy('total_balance_due', 'desc')
            ->offset($offset)
            ->limit($perPage)
            ->get()
            ->map(function($item) {
                // Transform the flat result into the expected structure
                return (object)[
                    'customer_id' => $item->customer_id,
                    'total_balance_due' => (float)$item->total_balance_due,
                    'dues_count' => (int)$item->dues_count,
                    'created_at' => $item->created_at,
                    'customer' => (object)[
                        'id' => $item->customer_id,
                        'name' => $item->customer_name,
                        'email' => $item->customer_email,
                        'mobile' => $item->customer_mobile,
                        'country_code' => $item->customer_country_code,
                        'company_name' => $item->customer_company_name,
                        'branch' => $item->branch_name ? (object)[
                            'branch_name' => $item->branch_name
                        ] : null
                    ]
                ];
            });

            return response()->json([
                'data' => $paymentDues,
                'current_page' => $page,
                'last_page' => ceil($totalCount / $perPage),
                'per_page' => $perPage,
                'total' => $totalCount,
                'total_balance_due' => $totalBalance
            ]);
        } catch (\Exception $e) {
            \Log::error('PaymentDue index error: ' . $e->getMessage());
            return response()->json([
                'error' => 'Failed to fetch payment dues: ' . $e->getMessage()
            ], 500);
        }
    }

    public function show($id)
    {
        $user = auth()->user();
        
        $query = PaymentDue::with(['customer', 'invoice', 'ticket', 'branch', 'createdBy'])
            ->where('id', $id);

        // Apply same role-based filtering
        if ($user->role_id == 2) {
            $query->where('created_by', $user->id);
        } elseif ($user->role_id == 3) {
            $assignedAgentIds = DB::table('assign_agents')
                ->where('user_id', $user->id)
                ->pluck('agent_id')->toArray();
            
            if (!empty($assignedAgentIds)) {
                $query->whereIn('created_by', $assignedAgentIds);
            } else {
                return response()->json(['message' => 'Not authorized'], 403);
            }
        } elseif ($user->role_id == 4 && $user->branch_id) {
            $query->where('branch_id', $user->branch_id);
        }

        $paymentDue = $query->first();

        if (!$paymentDue) {
            return response()->json(['message' => 'Payment due not found'], 404);
        }

        return response()->json($paymentDue);
    }

    public function getCustomerPaymentDues(Request $request, $customerId)
    {
        $user = auth()->user();

        // Get filter parameters
        $startDate = $request->start_date ?? '';
        $endDate = $request->end_date ?? '';
        $branchId = $request->branch_id ?? '';

        try {
            // Use direct DB query for better control over invoice_id display
            $query = DB::table('payment_dues as pd')
                ->leftJoin('tickets as t', 'pd.ticket_id', '=', 't.id')
                ->leftJoin('invoices as i', 'pd.invoice_id', '=', 'i.id')
                ->leftJoin('users as u', 'pd.created_by', '=', 'u.id')
                ->select([
                    'pd.id',
                    'pd.invoice_id',
                    'pd.ticket_id',
                    'pd.balance_due',
                    'pd.created_at',
                    't.tracking_number as ticket_tracking_number',
                    't.issue as ticket_issue',
                    'i.invoice_id as invoice_number', // This is the actual invoice number
                    'i.status as invoice_status',
                    'u.name as created_by_name'
                ])
                ->where('pd.customer_id', $customerId)
                ->where('pd.status', 'Pending');

            // Apply date range filter
            if (!empty($startDate)) {
                $query->where('pd.created_at', '>=', $startDate . ' 00:00:00');
            }
            if (!empty($endDate)) {
                $query->where('pd.created_at', '<=', $endDate . ' 23:59:59');
            }

            // Apply branch filter (only for Super Admin)
            if (!empty($branchId) && $user->role_id == 1) {
                $query->where('pd.branch_id', $branchId);
            }

            // Apply same role-based filtering
            if ($user->role_id == 2) {
                $query->where('pd.created_by', $user->id);
            } elseif ($user->role_id == 3) {
                $assignedAgentIds = DB::table('assign_agents')
                    ->where('user_id', $user->id)
                    ->pluck('agent_id')->toArray();

                if (!empty($assignedAgentIds)) {
                    $query->whereIn('pd.created_by', $assignedAgentIds);
                } else {
                    return response()->json(['message' => 'Not authorized'], 403);
                }
            } elseif ($user->role_id == 4 && $user->branch_id) {
                $query->where('pd.branch_id', $user->branch_id);
            }

            $paymentDues = $query->orderBy('pd.created_at', 'desc')->get();
            
            // Transform the results to match expected structure
            $transformedDues = $paymentDues->map(function($item) {
                return [
                    'id' => $item->id,
                    'invoice_id' => $item->invoice_id,
                    'ticket_id' => $item->ticket_id,
                    'balance_due' => (float)$item->balance_due,
                    'created_at' => $item->created_at,
                    'ticket' => [
                        'tracking_number' => $item->ticket_tracking_number,
                        'issue' => $item->ticket_issue
                    ],
                    'invoice' => [
                        'id' => $item->invoice_id,
                        'invoice_id' => $item->invoice_number, // Show the actual invoice number
                        'status' => $item->invoice_status
                    ],
                    'created_by_user' => [
                        'name' => $item->created_by_name
                    ]
                ];
            });

            $totalAmount = $paymentDues->sum('balance_due');

            // Get customer details
            $customer = \App\Models\Customer::find($customerId);

            return response()->json([
                'customer' => $customer,
                'payment_dues' => $transformedDues,
                'total_amount' => $totalAmount
            ]);
        } catch (\Exception $e) {
            \Log::error('PaymentDue getCustomerPaymentDues error: ' . $e->getMessage());
            return response()->json([
                'error' => 'Failed to fetch customer payment dues: ' . $e->getMessage()
            ], 500);
        }
    }

    public function getCustomerPaymentHistory(Request $request, $customerId)
    {
        $user = auth()->user();

        // Get filter parameters
        $startDate = $request->start_date ?? '';
        $endDate = $request->end_date ?? '';
        $branchId = $request->branch_id ?? '';

        $query = \App\Models\Payment::with(['invoice', 'ticket', 'customer'])
            ->where('customer_id', $customerId);

        // Apply date range filter
        if (!empty($startDate)) {
            $query->where('created_at', '>=', $startDate . ' 00:00:00');
        }
        if (!empty($endDate)) {
            $query->where('created_at', '<=', $endDate . ' 23:59:59');
        }

        // Apply branch filter (only for Super Admin)
        if (!empty($branchId) && $user->role_id == 1) {
            $query->where('branch_id', $branchId);
        }

        // Apply role-based filtering
        if ($user->role_id == 2) {
            // Agent - see only their own payments
            $query->where('created_by', $user->id);
        } elseif ($user->role_id == 3) {
            // Manager - see payments created by their assigned agents
            $assignedAgentIds = DB::table('assign_agents')
                ->where('user_id', $user->id)
                ->pluck('agent_id')->toArray();

            if (!empty($assignedAgentIds)) {
                $query->whereIn('created_by', $assignedAgentIds);
            } else {
                $query->whereRaw('1 = 0'); // No access
            }
        } elseif ($user->role_id == 4 && $user->branch_id) {
            // Branch Admin - see payments from their branch
            $query->where('branch_id', $user->branch_id);
        }
        // Admin (role_id = 1) - see all payments (no additional filter)

        $payments = $query->orderBy('created_at', 'desc')->get()->map(function($payment) {
            // Add calculated fields for frontend display
            $payment->paid_amount = $payment->net_amount; // Amount actually paid
            $payment->balance_due = 0; // Payments are recorded when fully paid
            return $payment;
        });
        $totalPaid = $payments->sum('net_amount');

        // Get customer details
        $customer = \App\Models\Customer::find($customerId);

        return response()->json([
            'customer' => $customer,
            'payments' => $payments,
            'total_paid' => $totalPaid
        ]);
    }

    public function getPaidPaymentDues(Request $request)
    {
        try {
            $user = auth()->user();
            $perPage = $request->per_page ?? 10;
            $page = $request->page ?? 1;
            $offset = ($page - 1) * $perPage;
            $search = $request->search ?? '';
            $startDate = $request->start_date ?? '';
            $endDate = $request->end_date ?? '';
            $customerId = $request->customer_id ?? '';

            // Build the main query with joins for paid payment dues
            $query = DB::table('payment_dues as pd')
                ->leftJoin('customers as c', 'pd.customer_id', '=', 'c.id')
                ->leftJoin('branches as b', 'c.branch_id', '=', 'b.id')
                ->leftJoin('payments as p', 'pd.payment_id', '=', 'p.id')
                ->select([
                    'pd.customer_id',
                    'pd.payment_id',
                    DB::raw('MAX(c.name) as customer_name'),
                    DB::raw('MAX(c.email) as customer_email'),
                    DB::raw('MAX(c.mobile) as customer_mobile'),
                    DB::raw('MAX(c.country_code) as customer_country_code'),
                    DB::raw('MAX(c.company_name) as customer_company_name'),
                    DB::raw('MAX(b.branch_name) as branch_name'),
                    DB::raw('SUM(pd.balance_due) as total_balance_due'),
                    DB::raw('COUNT(*) as dues_count'),
                    DB::raw('MAX(p.created_at) as payment_date'),
                    DB::raw('MAX(p.payment_mode) as payment_mode'),
                    DB::raw('MAX(pd.updated_at) as updated_at')
                ])
                ->where('pd.status', 'Paid')
                ->groupBy('pd.customer_id', 'pd.payment_id');

            // Apply role-based filtering (same as index method)
            if ($user->role_id == 2) {
                $query->where('pd.created_by', $user->id);
            } elseif ($user->role_id == 3) {
                $assignedAgentIds = DB::table('assign_agents')
                    ->where('user_id', $user->id)
                    ->pluck('agent_id')->toArray();
                
                if (!empty($assignedAgentIds)) {
                    $query->whereIn('pd.created_by', $assignedAgentIds);
                } else {
                    $query->whereRaw('1 = 0');
                }
            } elseif ($user->role_id == 4 && $user->branch_id) {
                $query->where('pd.branch_id', $user->branch_id);
            }

            // Apply search filter
            if (!empty($search)) {
                $query->where(function($q) use ($search) {
                    $q->where('c.name', 'like', "%{$search}%")
                      ->orWhere('c.mobile', 'like', "%{$search}%");
                });
            }

            // Apply date range filter (based on payment date)
            // If no dates provided, default to last 3 months
            if (empty($startDate) && empty($endDate)) {
                $threeMonthsAgo = date('Y-m-d', strtotime('-3 months'));
                $today = date('Y-m-d');
                $query->where('p.created_at', '>=', $threeMonthsAgo . ' 00:00:00');
                $query->where('p.created_at', '<=', $today . ' 23:59:59');
            } else {
                // Use provided date filters
                if (!empty($startDate)) {
                    $query->where('p.created_at', '>=', $startDate . ' 00:00:00');
                }
                if (!empty($endDate)) {
                    $query->where('p.created_at', '<=', $endDate . ' 23:59:59');
                }
            }

            // Apply customer filter
            if (!empty($customerId)) {
                $query->where('pd.customer_id', $customerId);
            }

            // Clone query for total count and balance calculation
            $countQuery = clone $query;
            $balanceQuery = clone $query;

            // Get total count for pagination
            $totalCount = $countQuery->get()->count();

            // Calculate total balance due - need to sum the grouped results
            $balanceResults = $balanceQuery->get();
            $totalBalance = $balanceResults->sum('total_balance_due');

            // Get paginated results
            $paymentDues = $query->orderBy('payment_date', 'desc')
                ->offset($offset)
                ->limit($perPage)
                ->get()
                ->map(function($item) {
                    // Transform the flat result into the expected structure
                    return (object)[
                        'customer_id' => $item->customer_id,
                        'payment_id' => $item->payment_id,
                        'total_balance_due' => (float)$item->total_balance_due,
                        'dues_count' => (int)$item->dues_count,
                        'payment_date' => $item->payment_date,
                        'payment_mode' => $item->payment_mode,
                        'updated_at' => $item->updated_at,
                        'customer' => (object)[
                            'id' => $item->customer_id,
                            'name' => $item->customer_name,
                            'email' => $item->customer_email,
                            'mobile' => $item->customer_mobile,
                            'country_code' => $item->customer_country_code,
                            'company_name' => $item->customer_company_name,
                            'branch' => $item->branch_name ? (object)[
                                'branch_name' => $item->branch_name
                            ] : null
                        ]
                    ];
                });

            return response()->json([
                'data' => $paymentDues,
                'current_page' => $page,
                'last_page' => ceil($totalCount / $perPage),
                'per_page' => $perPage,
                'total' => $totalCount,
                'total_balance_due' => $totalBalance
            ]);
        } catch (\Exception $e) {
            \Log::error('PaymentDue getPaidPaymentDues error: ' . $e->getMessage());
            return response()->json([
                'error' => 'Failed to fetch paid payment dues: ' . $e->getMessage()
            ], 500);
        }
    }

    public function createPaymentDuesInvoice(Request $request, $customerId)
    {
        $user = auth()->user();
        
        try {
            DB::beginTransaction();

            // Get all pending payment dues for the customer
            $paymentDues = PaymentDue::where('customer_id', $customerId)
                ->where('status', 'Pending')
                ->with(['ticket', 'invoice'])
                ->get();

            if ($paymentDues->isEmpty()) {
                return response()->json(['error' => 'No pending dues found for this customer'], 404);
            }

            $totalAmount = $paymentDues->sum('balance_due');
            
            // Get customer details
            $customer = \App\Models\Customer::with('branch')->find($customerId);
            
            if (!$customer) {
                return response()->json(['error' => 'Customer not found'], 404);
            }

            // Create payment record (no invoice creation)
            $payment = \App\Models\Payment::create([
                'invoice_id' => null,
                'ticket_id' => null,
                'customer_id' => $customerId,
                'branch_id' => $customer->branch_id,
                'service_charge' => $totalAmount,
                'item_amount' => 0,
                'total_amount' => $totalAmount,
                'discount' => 0,
                'net_amount' => $totalAmount,
                'paid_amount' => $totalAmount,
                'balance_due' => 0,
                'payment_mode' => $request->payment_mode ?? 'Cash',
                'description'=>"Previous balance amount",
                'created_by' => $user->id,
            ]);

            // Update all payment dues to paid status
            PaymentDue::where('customer_id', $customerId)
                ->where('status', 'Pending')
                ->update(['status' => 'Paid','payment_id'=>$payment->id]);

            DB::commit();

            // Generate signed URL for PDF access
            $token = hash('sha256', $customerId . config('app.key'));
            $pdfUrl = route('payment-dues.pdf', ['customerId' => $customerId, 'token' => $token]);

            return response()->json([
                'message' => 'Payment dues processed successfully',
                'payment' => $payment,
                'total_amount' => $totalAmount,
                'pdf_url' => $pdfUrl
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('PaymentDue createInvoice error: ' . $e->getMessage());
            return response()->json([
                'error' => 'Failed to create payment dues invoice: ' . $e->getMessage()
            ], 500);
        }
    }

    public function generateSignedPaymentDuesPDF($customerId, $token)
    {
        // Verify token
        $expectedToken = hash('sha256', $customerId . config('app.key'));
        if (!hash_equals($expectedToken, $token)) {
            abort(403, 'Invalid token');
        }

        return $this->generatePaymentDuesPDF($customerId);
    }

    public function generateSignedUrlForView($customerId)
    {
        try {
            $user = auth()->user();

            // Check if customer has paid payment dues
            $customer = \App\Models\Customer::find($customerId);
            if (!$customer) {
                return response()->json(['error' => 'Customer not found'], 404);
            }

            // Check if customer has any paid payment dues
            $hasPaidDues = PaymentDue::where('customer_id', $customerId)
                ->where('status', 'Paid')
                ->exists();

            if (!$hasPaidDues) {
                return response()->json(['error' => 'No paid payment dues found for this customer'], 404);
            }

            // Generate signed URL for PDF access
            $token = hash('sha256', $customerId . config('app.key'));
            $pdfUrl = route('payment-dues.pdf', ['customerId' => $customerId, 'token' => $token]);

            return response()->json([
                'pdf_url' => $pdfUrl,
                'customer_id' => $customerId
            ]);

        } catch (\Exception $e) {
            \Log::error('PaymentDue generateSignedUrlForView error: ' . $e->getMessage());
            return response()->json([
                'error' => 'Failed to generate signed URL: ' . $e->getMessage()
            ], 500);
        }
    }

    public function generatePaymentDuesPDF($customerId)
    {
        try {
            // Get customer details
            $customer = \App\Models\Customer::with('branch')->find($customerId);
            if (!$customer) {
                return response()->json(['error' => 'Customer not found'], 404);
            }

            // Get the latest payment for this customer (payment dues payment)
            $payment = \App\Models\Payment::where('customer_id', $customerId)
                ->where('description', 'Previous balance amount')
                ->orderBy('id', 'desc')
                ->first();

            if (!$payment) {
                return response()->json(['error' => 'Payment not found'], 404);
            }

            // Get company info
            $company = \App\Models\Company::first();

            // Get payment dues details
            $paymentDues = \App\Models\PaymentDue::where('customer_id', $customerId)
                ->where('status', 'Paid')
                ->with(['ticket', 'invoice'])
                ->get();

            // Generate invoice ID for display (not stored)
            $invoiceId = 'PDI-' . str_pad($payment->id, 6, '0', STR_PAD_LEFT);

            // Create mock invoice object for PDF template
            $mockInvoice = (object)[
                'invoice_id' => $invoiceId,
                'invoice_date' => $payment->created_at->format('Y-m-d'),
                'customer' => $customer,
                'branch' => $customer->branch,
                'net_amount' => $payment->net_amount,
                'discount' => $payment->discount ?? 0,
                'description' => 'Payment for pending dues - Multiple tickets'
            ];

            $data = [
                'invoice' => $mockInvoice,
                'company' => $company,
                'paymentDues' => $paymentDues,
                'totalAmount' => $payment->net_amount,
                'amountInWords' => $this->convertNumberToWords($payment->net_amount)
            ];

            // Generate PDF
            $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('invoices.payment_dues_pdf', $data);
            $pdf->setPaper('A4', 'portrait');

            return response($pdf->output())
                ->header('Content-Type', 'application/pdf')
                ->header('Content-Disposition', 'inline; filename="payment-dues-invoice-' . $invoiceId . '.pdf"');

        } catch (\Exception $e) {
            \Log::error('Payment Dues PDF generation error: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to generate PDF: ' . $e->getMessage()], 500);
        }
    }

    private function convertNumberToWords($number)
    {
        $words = array(
            '0' => '', '1' => 'one', '2' => 'two', '3' => 'three', '4' => 'four', '5' => 'five',
            '6' => 'six', '7' => 'seven', '8' => 'eight', '9' => 'nine', '10' => 'ten',
            '11' => 'eleven', '12' => 'twelve', '13' => 'thirteen', '14' => 'fourteen',
            '15' => 'fifteen', '16' => 'sixteen', '17' => 'seventeen', '18' => 'eighteen',
            '19' => 'nineteen', '20' => 'twenty', '30' => 'thirty', '40' => 'forty',
            '50' => 'fifty', '60' => 'sixty', '70' => 'seventy', '80' => 'eighty',
            '90' => 'ninety'
        );

        if ($number == 0) return 'zero';

        $num = number_format($number, 2);
        list($rupees, $paisa) = explode('.', $num);
        
        $rupees_words = $this->convertToWords((int)$rupees);
        $paisa_words = $this->convertToWords((int)$paisa);
        
        $result = '';
        if ($rupees > 0) {
            $result .= ucfirst($rupees_words) . ' Rupees';
        }
        if ($paisa > 0) {
            if ($rupees > 0) $result .= ' and ';
            $result .= ucfirst($paisa_words) . ' Paisa';
        }
        if ($result == '') $result = 'Zero Rupees';
        
        return $result . ' Only';
    }

    private function convertToWords($number)
    {
        if ($number == 0) return '';
        
        $words = array(
            '', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine',
            'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen',
            'seventeen', 'eighteen', 'nineteen'
        );
        
        $tens = array(
            '', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'
        );
        
        if ($number < 20) {
            return $words[$number];
        } elseif ($number < 100) {
            return $tens[intval($number / 10)] . ' ' . $words[$number % 10];
        } elseif ($number < 1000) {
            return $words[intval($number / 100)] . ' hundred ' . $this->convertToWords($number % 100);
        } elseif ($number < 100000) {
            return $this->convertToWords(intval($number / 1000)) . ' thousand ' . $this->convertToWords($number % 1000);
        } else {
            return $this->convertToWords(intval($number / 100000)) . ' lakh ' . $this->convertToWords($number % 100000);
        }
    }
}