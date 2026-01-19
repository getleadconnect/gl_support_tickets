<?php

namespace App\Http\Controllers;

use App\Models\Payment;
use App\Models\PaymentDue;
use App\Models\Customer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PaymentHistoryController extends Controller
{
    /**
     * Get payment history and dues for a specific customer
     *
     * @param int $customerId
     * @return \Illuminate\Http\JsonResponse
     */
    public function getCustomerPaymentData($customerId)
    {
        try {
            $user = auth()->user();

            // Fetch payment history
            $paymentHistory = $this->getCustomerPaymentHistory($customerId);

            // Fetch payment dues
            $paymentDues = $this->getCustomerPaymentDues($customerId);

            // Get customer details
            $customer = Customer::find($customerId);

            if (!$customer) {
                return response()->json([
                    'error' => 'Customer not found'
                ], 404);
            }

            return response()->json([
                'customer' => $customer,
                'payment_history' => $paymentHistory['payments'],
                'total_paid' => $paymentHistory['total_paid'],
                'payment_dues' => $paymentDues['payment_dues'],
                'total_due' => $paymentDues['total_amount']
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to fetch customer payment data',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get payment history for a specific customer
     *
     * @param int $customerId
     * @return array
     */
    private function getCustomerPaymentHistory($customerId)
    {
        $user = auth()->user();

        $query = Payment::with(['ticket', 'customer'])
            ->where('customer_id', $customerId);

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
            // Ensure paid_amount and balance_due are set
            if (!isset($payment->paid_amount)) {
                $payment->paid_amount = $payment->net_amount;
            }
            if (!isset($payment->balance_due)) {
                $payment->balance_due = 0;
            }
            return $payment;
        });

        $totalPaid = $payments->sum('net_amount');

        return [
            'payments' => $payments,
            'total_paid' => $totalPaid
        ];
    }

    /**
     * Get payment dues for a specific customer
     *
     * @param int $customerId
     * @return array
     */
    private function getCustomerPaymentDues($customerId)
    {
        $user = auth()->user();

        $query = PaymentDue::with(['invoice', 'ticket', 'createdByUser'])
            ->where('customer_id', $customerId)
            ->where('status', 'Pending');

        // Apply role-based filtering
        if ($user->role_id == 2) {
            // Agent - see only their own dues
            $query->where('created_by', $user->id);
        } elseif ($user->role_id == 3) {
            // Manager - see dues created by their assigned agents
            $assignedAgentIds = DB::table('assign_agents')
                ->where('user_id', $user->id)
                ->pluck('agent_id')->toArray();

            if (!empty($assignedAgentIds)) {
                $query->whereIn('created_by', $assignedAgentIds);
            } else {
                $query->whereRaw('1 = 0'); // No access
            }
        } elseif ($user->role_id == 4 && $user->branch_id) {
            // Branch Admin - see dues from their branch
            $query->where('branch_id', $user->branch_id);
        }
        // Admin (role_id = 1) - see all dues (no additional filter)

        $paymentDues = $query->orderBy('created_at', 'desc')->get();
        $totalAmount = $paymentDues->sum('balance_due');

        return [
            'payment_dues' => $paymentDues,
            'total_amount' => $totalAmount
        ];
    }

    /**
     * Get all customers with their payment summary
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getCustomersWithPaymentSummary(Request $request)
    {
        try {
            $user = auth()->user();
            $perPage = $request->per_page ?? 10;
            $search = $request->search ?? '';

            $query = Customer::with('branch');

            // Apply role-based filtering
            if ($user->role_id == 4 && $user->branch_id) {
                // Branch Admin - see only customers from their branch
                $query->where('branch_id', $user->branch_id);
            }

            // Search functionality
            if (!empty($search)) {
                $query->where(function($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('mobile', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%");
                });
            }

            $customers = $query->orderBy('name', 'asc')->paginate($perPage);

            // Add payment summary for each customer
            $customers->getCollection()->transform(function($customer) use ($user) {
                // Get total paid amount
                $paidQuery = Payment::where('customer_id', $customer->id);

                // Apply role-based filtering for payments
                if ($user->role_id == 2) {
                    $paidQuery->where('created_by', $user->id);
                } elseif ($user->role_id == 3) {
                    $assignedAgentIds = DB::table('assign_agents')
                        ->where('user_id', $user->id)
                        ->pluck('agent_id')->toArray();

                    if (!empty($assignedAgentIds)) {
                        $paidQuery->whereIn('created_by', $assignedAgentIds);
                    } else {
                        $paidQuery->whereRaw('1 = 0');
                    }
                } elseif ($user->role_id == 4 && $user->branch_id) {
                    $paidQuery->where('branch_id', $user->branch_id);
                }

                $customer->total_paid = $paidQuery->sum('net_amount');

                // Get total due amount
                $dueQuery = PaymentDue::where('customer_id', $customer->id)
                    ->where('status', 'Pending');

                // Apply role-based filtering for dues
                if ($user->role_id == 2) {
                    $dueQuery->where('created_by', $user->id);
                } elseif ($user->role_id == 3) {
                    $assignedAgentIds = DB::table('assign_agents')
                        ->where('user_id', $user->id)
                        ->pluck('agent_id')->toArray();

                    if (!empty($assignedAgentIds)) {
                        $dueQuery->whereIn('created_by', $assignedAgentIds);
                    } else {
                        $dueQuery->whereRaw('1 = 0');
                    }
                } elseif ($user->role_id == 4 && $user->branch_id) {
                    $dueQuery->where('branch_id', $user->branch_id);
                }

                $customer->total_due = $dueQuery->sum('balance_due');
                $customer->payment_count = $paidQuery->count();
                $customer->due_count = $dueQuery->count();

                return $customer;
            });

            return response()->json($customers);

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to fetch customers',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get payment statistics for a customer
     *
     * @param int $customerId
     * @return \Illuminate\Http\JsonResponse
     */
    public function getCustomerPaymentStats($customerId)
    {
        try {
            $user = auth()->user();

            $customer = Customer::find($customerId);

            if (!$customer) {
                return response()->json([
                    'error' => 'Customer not found'
                ], 404);
            }

            // Get payment history stats
            $paymentQuery = Payment::where('customer_id', $customerId);

            // Apply role-based filtering
            if ($user->role_id == 2) {
                $paymentQuery->where('created_by', $user->id);
            } elseif ($user->role_id == 3) {
                $assignedAgentIds = DB::table('assign_agents')
                    ->where('user_id', $user->id)
                    ->pluck('agent_id')->toArray();

                if (!empty($assignedAgentIds)) {
                    $paymentQuery->whereIn('created_by', $assignedAgentIds);
                } else {
                    $paymentQuery->whereRaw('1 = 0');
                }
            } elseif ($user->role_id == 4 && $user->branch_id) {
                $paymentQuery->where('branch_id', $user->branch_id);
            }

            $totalPaid = $paymentQuery->sum('net_amount');
            $paymentCount = $paymentQuery->count();
            $averagePayment = $paymentCount > 0 ? $totalPaid / $paymentCount : 0;

            // Get payment dues stats
            $dueQuery = PaymentDue::where('customer_id', $customerId)
                ->where('status', 'Pending');

            // Apply role-based filtering for dues
            if ($user->role_id == 2) {
                $dueQuery->where('created_by', $user->id);
            } elseif ($user->role_id == 3) {
                $assignedAgentIds = DB::table('assign_agents')
                    ->where('user_id', $user->id)
                    ->pluck('agent_id')->toArray();

                if (!empty($assignedAgentIds)) {
                    $dueQuery->whereIn('created_by', $assignedAgentIds);
                } else {
                    $dueQuery->whereRaw('1 = 0');
                }
            } elseif ($user->role_id == 4 && $user->branch_id) {
                $dueQuery->where('branch_id', $user->branch_id);
            }

            $totalDue = $dueQuery->sum('balance_due');
            $dueCount = $dueQuery->count();

            // Get last payment date
            $lastPayment = $paymentQuery->orderBy('created_at', 'desc')->first();
            $lastPaymentDate = $lastPayment ? $lastPayment->created_at : null;

            return response()->json([
                'customer' => $customer,
                'stats' => [
                    'total_paid' => $totalPaid,
                    'payment_count' => $paymentCount,
                    'average_payment' => $averagePayment,
                    'total_due' => $totalDue,
                    'due_count' => $dueCount,
                    'last_payment_date' => $lastPaymentDate,
                    'total_transactions' => $paymentCount + $dueCount
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to fetch payment statistics',
                'message' => $e->getMessage()
            ], 500);
        }
    }
}
