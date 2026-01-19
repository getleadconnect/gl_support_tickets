<?php

namespace App\Http\Controllers;

use App\Models\Payment;
use App\Models\Invoice;
use App\Models\Customer;
use App\Models\Ticket;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use App\Services\WhatsappApiService;
use Log;


class PaymentController extends Controller
{
    use WhatsappApiService;

    public function index(Request $request)
    {
        try {
            $user = auth()->user();

            // Build base query for filtering (without eager loading for sum calculation)
            $baseQuery = Payment::query();

            // Apply branch filter for non-admin users
            if ($user->role_id != 1 && $user->branch_id) {
                $baseQuery->where('branch_id', $user->branch_id);
            }

            // Search functionality
            if ($request->has('search') && $request->search != '') {
                $search = $request->search;
                $baseQuery->where(function($q) use ($search) {
                    $q->where('id', 'like', "%{$search}%")
                      ->orWhere('payment_mode', 'like', "%{$search}%")
                      ->orWhereHas('customer', function($q) use ($search) {
                        $q->where('name', 'like', "%{$search}%");
                      })
                      ->orWhereHas('invoice', function($q) use ($search) {
                        $q->where('invoice_id', 'like', "%{$search}%");
                      });
                });
            }

            // Date range filter
            if ($request->has('start_date') && $request->start_date != '') {
                $baseQuery->whereDate('created_at', '>=', $request->start_date);
            }

            if ($request->has('end_date') && $request->end_date != '') {
                $baseQuery->whereDate('created_at', '<=', $request->end_date);
            }

            // Customer filter
            if ($request->has('customer_id') && $request->customer_id != '' && $request->customer_id != 'all') {
                $baseQuery->where('customer_id', $request->customer_id);
            }

            // Payment mode filter
            if ($request->has('payment_mode') && $request->payment_mode != '' && $request->payment_mode != 'all') {
                $paymentMode = str_replace('_', ' ', $request->payment_mode);
                $baseQuery->where('payment_mode', 'like', "%{$paymentMode}%");
            }

            // Calculate total paid amount using a clone of the query
            $totalPaidAmount = (clone $baseQuery)->sum('paid_amount');

            // Add eager loading and ordering for the main query
            $query = $baseQuery->with(['invoice', 'ticket', 'customer', 'createdBy'])
                               ->orderBy('id', 'desc');

            // Pagination
            $perPage = $request->get('per_page', 50);
            $payments = $query->paginate($perPage);

            // Add total paid amount to the response
            $response = $payments->toArray();
            $response['total_paid_amount'] = $totalPaidAmount;

            return response()->json($response, 200);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to fetch payments',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function recordPayment(Request $request, $invoiceId)
    {
        $validated = $request->validate([
            'payment_mode' => 'required|string',
            'discount' => 'nullable|numeric|min:0',
        ]);

        try {
            DB::beginTransaction();

            // Get the invoice
            $invoice = Invoice::findOrFail($invoiceId);

            // Calculate net amount
            $discount = $validated['discount'] ?? 0;

            // Validate discount does not exceed service charge
            if ($discount > $invoice->service_charge) {
                return response()->json([
                    'message' => 'Discount cannot exceed service charge'
                ], 422);
            }

            $netAmount = $invoice->total_amount - $discount;

            // Get user for branch_id
            $user = auth()->user();
            
            // Create payment record
            $payment = Payment::create([
                'invoice_id' => $invoice->id,
                'ticket_id' => $invoice->ticket_id,
                'customer_id' => $invoice->customer_id,
                'branch_id' => $user->branch_id ?? $invoice->branch_id ?? null,
                'service_charge' => $invoice->service_charge,
                'item_amount' => $invoice->item_cost,
                'total_amount' => $invoice->total_amount,
                'discount' => $discount,
                'net_amount' => $netAmount,
                'payment_mode' => $validated['payment_mode'],
                'created_by' => Auth::id() ?? 1,
            ]);

            // Update invoice with discount, net_amount, status and payment method
            $invoice->update([
                'status' => 'paid',
                'payment_method' => $validated['payment_mode'],
                'discount' => $discount,
                'net_amount' => $netAmount
            ]);


            // Update status and closed at in tickets
            $tkt=Ticket::where('id',$invoice->ticket_id)->first();
            $oldStatus=$tkt->status;
            
            $tkt->status=3;
            $tkt->closed_at=now();
            $ticket=$tkt->save();
            
            if($oldStatus!=3 && $ticket==true)
            {

               // ---- To send whatsapp message ----- delivered message --close ticket------- 
                try
                    {
                        $customer=Customer::where('id',$tkt->customer_id)->first();
                        $data=[
                            "customer_name"=>$customer->name,
                            "user_mobile"=>$customer->country_code.$customer->mobile,
                            "tracking_id"=>$tkt->tracking_number,
                            "template_id"=>"259187", //wabis id
                            "delivered_date"=>date('d-m-Y'),
                            "delivery_text"=>"Your device/service request with *ID: ".$tkt->tracking_number
                        ];

                        $send_response=$this->sendServiceMessages($data);
                        \Log::info($send_response);
                    }
                    catch (\Exception $e) {
                        \Log::info($e->getMessage());
                    }
                //-------------------------------------------------------------------
            }
            

            DB::commit();

            return response()->json([
                'message' => 'Payment recorded successfully',
                'payment' => $payment,
                'invoice' => $invoice
            ], 200);

        } catch (\Exception $e) {
            DB::rollBack();
            \Log::info($e->getMessage());
            return response()->json([
                'message' => 'Failed to record payment',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
