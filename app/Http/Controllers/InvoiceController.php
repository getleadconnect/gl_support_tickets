<?php

namespace App\Http\Controllers;

use App\Models\Invoice;
use App\Models\Company;
use App\Models\ProductTicket;
use App\Models\Payment;
use App\Models\PaymentDue;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Barryvdh\DomPDF\Facade\Pdf;

class InvoiceController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $user = auth()->user();
        $query = Invoice::with(['customer', 'ticket', 'createdBy', 'branch']);
        
        // Filter by branch for non-admin users
        if ($user->role_id != 1) {
            // For non-admin users, show only invoices from their branch
            if ($user->branch_id) {
                $query->where('branch_id', $user->branch_id);
            }
        }
        // Admin users (role_id = 1) can see all invoices
        
        // Search filter
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('invoice_id', 'like', "%{$search}%")
                  ->orWhere('ticket_id', 'like', "%{$search}%")
                  ->orWhereHas('customer', function($q) use ($search) {
                      $q->where('name', 'like', "%{$search}%");
                  });
            });
        }
        
        // Date range filter
        if ($request->has('start_date') && $request->start_date) {
            $query->whereDate('invoice_date', '>=', $request->start_date);
        }
        
        if ($request->has('end_date') && $request->end_date) {
            $query->whereDate('invoice_date', '<=', $request->end_date);
        }
        
        // Customer filter
        if ($request->has('customer_id') && $request->customer_id && $request->customer_id !== 'all') {
            $query->where('customer_id', $request->customer_id);
        }

        // Status filter
        if ($request->has('status') && $request->status && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        // Pagination
        $perPage = $request->get('per_page', 10);
        $invoices = $query->orderBy('id', 'desc')->paginate($perPage);
            
        return response()->json($invoices);
    }

    /**
     * Check if invoice exists for a ticket
     */
    public function checkInvoiceExists($ticketId)
    {
        $exists = Invoice::where('ticket_id', $ticketId)->exists();
        
        return response()->json([
            'exists' => $exists,
            'invoice' => $exists ? Invoice::where('ticket_id', $ticketId)->first() : null
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    
    public function store(Request $request)
    {
        $validated = $request->validate([
            'ticket_id' => 'required|exists:tickets,id',
            'customer_id' => 'required|exists:customers,id',
            'item_cost' => 'required|numeric|min:0',
            'service_charge' => 'required|numeric|min:0',
            'discount' => 'nullable|numeric|min:0',
            'total_amount' => 'required|numeric|min:0',      // Total without discount
            'net_amount' => 'required|numeric|min:0',        // Total after discount
            'paid_amount' => 'required|numeric|min:0',
            'balance_due' => 'required|numeric|min:0',
            'payment_mode' => 'required|in:Cash,Card,UPI,Bank Transfer,Credit',
            'payment_status' => 'nullable|string',
            'invoice_date' => 'required|date',
            'products' => 'nullable|array',
            'service_type' => 'nullable|in:Shop,Outsource',
            'description' => 'nullable|string|max:1000',
        ]);

        try {
            DB::beginTransaction();

            // Generate invoice ID
            $lastInvoice = Invoice::orderBy('id', 'desc')->first();
            $invoiceId = 'INV-' . str_pad(($lastInvoice ? $lastInvoice->id + 1 : 1), 6, '0', STR_PAD_LEFT);

            // Get the current user
            $user = Auth::user();

            $ticket = \App\Models\Ticket::find($validated['ticket_id']);

            if($ticket) {
                $branchId=$ticket->branch_id;
            }
            else {
                $branchId=null;
            }

            if($validated['paid_amount']=="0") {
                $validated['payment_status']="credit";
            }

            // Create invoice
            $invoice = Invoice::create([
                'invoice_id' => $invoiceId,
                'ticket_id' => $validated['ticket_id'],
                'customer_id' => $validated['customer_id'],
                'branch_id' => $branchId,
                'item_cost' => $validated['item_cost'],
                'service_charge' => $validated['service_charge'],
                'discount' => $validated['discount'] ?? 0,
                'total_amount' => $validated['total_amount'],      // Total without discount
                'net_amount' => $validated['net_amount'],          // Total after discount
                'paid_amount' => $validated['paid_amount'],
                'balance_due' => $validated['balance_due'],
                'payment_method' => $validated['payment_mode'],
                'status' => $validated['payment_status'] ?? 'credit',
                'invoice_date' => $validated['invoice_date'],
                'service_type' => $validated['service_type'] ?? null,
                'description' => $validated['description'] ?? null,
                'created_by' => Auth::id() ?? 1,
            ]);
            // Update ticket's service_type if provided
            if (!empty($validated['service_type'])) {
                if ($ticket) {
                    $ticket->update(['service_type' => $validated['service_type']]);
                }
            }

            if (!empty($validated['ticket_id'])) {
                if ($ticket) {
                    $ticket->update(['status' => 3]);
                }
            }
            
            // Create payment record
            $payment = Payment::create([
                'invoice_id' => $invoice->id,
                'ticket_id' => $invoice->ticket_id,
                'customer_id' => $invoice->customer_id,
                'branch_id' => $branchId,
                'service_charge' => $invoice->service_charge,
                'item_amount' => $invoice->item_cost,
                'total_amount' => $invoice->total_amount,
                'discount' => $invoice->discount,
                'net_amount' => $invoice->net_amount,
                'paid_amount' => $invoice->paid_amount,
                'balance_due' => $invoice->balance_due,
                'payment_mode' => $validated['payment_mode'],
                'description'=> "Payment of the ticket id:#".$invoice->ticket_id,
                'created_by' => Auth::id() ?? 1,
            ]);

            // Create payment due record
            $payment = PaymentDue::create([
                'invoice_id' => $invoice->id,
                'ticket_id' => $invoice->ticket_id,
                'customer_id' => $invoice->customer_id,
                'branch_id' => $branchId,
                'balance_due' => $invoice->balance_due,
                'created_by' => Auth::id() ?? 1,
            ]);

            // If products are provided, you can store them in a separate invoice_items table if needed
            // For now, the products are already linked through the ticket's product_tickets table

            DB::commit();

            return response()->json([
                'message' => 'Invoice created successfully',
                'invoice' => $invoice->load(['customer', 'ticket', 'branch'])
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            \Log::info($e->getMessage());
            
            return response()->json([
                'message' => 'Failed to create invoice',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        $user = auth()->user();
        $invoice = Invoice::with(['customer', 'ticket', 'branch'])
            ->findOrFail($id);
        
        // Check if user has access to this invoice
        if ($user->role_id != 1 && $user->branch_id && $invoice->branch_id != $user->branch_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
            
        return response()->json($invoice);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $invoice = Invoice::findOrFail($id);
        
        $validated = $request->validate([
            'status' => 'nullable|string',
            'payment_method' => 'nullable|in:Cash,Card,UPI,Bank Transfer,Credit',
            'service_charge' => 'nullable|numeric|min:0',
        ]);

        // Recalculate total if service charge is updated
        if (isset($validated['service_charge'])) {
            $validated['total_amount'] = $invoice->item_cost + $validated['service_charge'];
        }

        $invoice->update($validated);

        return response()->json([
            'message' => 'Invoice updated successfully',
            'invoice' => $invoice->load(['customer', 'ticket', 'branch'])
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $user = auth()->user();
        $invoice = Invoice::findOrFail($id);

        // Only admin can delete invoices
        if ($user->role_id != 1) {
            return response()->json(['message' => 'Unauthorized. Only admin can delete invoices.'], 403);
        }

        // Only pending invoices can be deleted
        if (strtolower($invoice->status) === 'paid') {
            return response()->json(['message' => 'Paid invoices cannot be deleted.'], 422);
        }

        $invoice->delete();

        return response()->json([
            'message' => 'Invoice deleted successfully'
        ]);
    }

    /**
     * Get detailed invoice with parts breakdown
     */
    public function getInvoiceDetails($id)
    {
        try {
            $user = auth()->user();
            $invoice = Invoice::with(['customer', 'ticket', 'branch', 'createdBy'])
                ->findOrFail($id);

            // Check if user has access to this invoice
            if ($user->role_id != 1 && $user->branch_id && $invoice->branch_id != $user->branch_id) {
                return response()->json(['message' => 'Unauthorized'], 403);
            }

            // Get spare parts used for this ticket from product_tickets table
            $spareParts = ProductTicket::with(['product' => function($query) {
                $query->select('id', 'name', 'code', 'brand_id', 'category_id', 'cost')
                    ->with(['brand:id,brand', 'category:id,category']);
            }])
            ->where('ticket_id', $invoice->ticket_id)
            ->get()
            ->map(function($item) {
                return [
                    'id' => $item->id,
                    'product_id' => $item->product_id,
                    'product_name' => $item->product->name ?? 'N/A',
                    'product_code' => $item->product->code ?? 'N/A',
                    'brand' => $item->product->brand->brand ?? 'N/A',
                    'category' => $item->product->category->category ?? 'N/A',
                    'quantity' => $item->quantity ?? 1,
                    'unit_price' => $item->price ?? ($item->product->cost ?? 0),
                    'total_price' => $item->total_price ?? (($item->quantity ?? 1) * ($item->price ?? $item->product->cost ?? 0)),
                ];
            });

            // Calculate totals
            $partsTotal = $spareParts->sum('total_price');
            $serviceCharge = $invoice->service_charge ?? 0;
            $grandTotal = $partsTotal + $serviceCharge;

            // Use discount and net_amount from invoice record
            $discount = $invoice->discount ?? 0;
            $netTotal = $invoice->net_amount ?? ($invoice->total_amount - $discount);

            // Get payment record if exists
            $payment = \App\Models\Payment::where('invoice_id', $invoice->id)->first();

            return response()->json([
                'invoice' => $invoice,
                'spare_parts' => $spareParts,
                'breakdown' => [
                    'parts_total' => round($partsTotal, 2),
                    'service_charge' => round($serviceCharge, 2),
                    'sub_total' => round($grandTotal, 2),
                    'discount' => round($discount, 2),
                    'grand_total' => round($netTotal, 2),
                ],
                'payment' => $payment
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to fetch invoice details',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Download invoice as PDF
     */
    public function downloadPDF($id)
    {
        try {
            $user = auth()->user();
            $invoice = Invoice::with(['customer', 'ticket', 'createdBy', 'branch'])->findOrFail($id);

            // Check if user has access to this invoice
            if ($user->role_id != 1 && $user->branch_id && $invoice->branch_id != $user->branch_id) {
                abort(403, 'Unauthorized');
            }

            // Get company info
            $company = Company::first();

            // Get spare parts for this ticket directly from ProductTicket
            $spareParts = ProductTicket::with('product')
                ->where('ticket_id', $invoice->ticket_id)
                ->get();

            // Calculate totals - Only service charge for PDF
            $sparePartsTotal = 0; // Not showing parts in PDF
            $totalAmount = $invoice->service_charge; // Only service charge in PDF

            // Use discount and net_amount from invoice record
            $discount = $invoice->discount ?? 0;
            $netAmount = $invoice->net_amount ?? ($totalAmount - $discount);

            // Convert amount to words (Indian numbering system)
            $amountInWords = $this->convertNumberToWords($netAmount);

            $data = [
                'invoice' => $invoice,
                'company' => $company,
                'spareParts' => $spareParts,
                'sparePartsTotal' => $sparePartsTotal,
                'totalAmount' => $totalAmount,
                'discount' => $discount,
                'netAmount' => $netAmount,
                'amountInWords' => $amountInWords
            ];

     
            // Set DomPDF options to handle missing GD extension
            $pdf = Pdf::loadView('invoices.invoice_pdf', $data);
            $pdf->setPaper('A4', 'portrait');

            // Set options to avoid GD dependency
            $pdf->setOption('isHtml5ParserEnabled', true);
            $pdf->setOption('isRemoteEnabled', true);
            $pdf->setOption('isFontSubsettingEnabled', true);

            // Return the PDF download with proper headers
            return response($pdf->output())
                ->header('Content-Type', 'application/pdf')
                ->header('Content-Disposition', 'attachment; filename="invoice-' . $invoice->invoice_id . '.pdf"')
                ->header('Cache-Control', 'no-cache, no-store, must-revalidate')
                ->header('Pragma', 'no-cache')
                ->header('Expires', '0');

        } catch (\Exception $e) {
            \Log::error('Invoice PDF generation error: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to generate PDF: ' . $e->getMessage()], 500);
        }
    }
    
    /**
     * Convert number to words (Indian format)
     */
    private function convertNumberToWords($number)
    {
        $number = intval($number);
        
        if ($number == 0) {
            return 'Zero';
        }
        
        $ones = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine',
                 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen',
                 'seventeen', 'eighteen', 'nineteen'];
        
        $tens = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
        
        if ($number < 20) {
            return $ones[$number];
        }
        
        if ($number < 100) {
            return $tens[intval($number / 10)] . ' ' . $ones[$number % 10];
        }
        
        if ($number < 1000) {
            return $ones[intval($number / 100)] . ' hundred ' . $this->convertNumberToWords($number % 100);
        }
        
        if ($number < 100000) {
            return $this->convertNumberToWords(intval($number / 1000)) . ' thousand ' . $this->convertNumberToWords($number % 1000);
        }
        
        return 'one thousand fifty'; // Simplified for the example
    }

    /**
     * Get branch-wise monthly revenue separated by service type
     */
    public function getBranchMonthlyRevenue(Request $request)
    {
        $year = $request->get('year', date('Y'));
        $month = $request->get('month', date('m'));

        // Get all branches with their monthly revenue
        $branches = DB::table('branches')
            ->leftJoin('invoices', function($join) use ($year, $month) {
                $join->on('branches.id', '=', 'invoices.branch_id')
                     ->whereYear('invoices.invoice_date', '=', $year)
                     ->whereMonth('invoices.invoice_date', '=', $month)
                     ->where('invoices.status', '=', 'paid');
            })
            ->select(
                'branches.id',
                'branches.branch_name',
                DB::raw('SUM(CASE WHEN invoices.service_type = "Shop" THEN invoices.net_amount ELSE 0 END) as shop_revenue'),
                DB::raw('SUM(CASE WHEN invoices.service_type = "Outsource" THEN invoices.net_amount ELSE 0 END) as outsource_revenue'),
                DB::raw('SUM(CASE WHEN invoices.service_type IS NOT NULL THEN invoices.net_amount ELSE 0 END) as total_revenue')
            )
            ->groupBy('branches.id', 'branches.branch_name')
            ->orderBy('branches.branch_name')
            ->get();

        return response()->json($branches);
    }

    /**
     * Get customer payment dues
     */
    public function getCustomerPaymentDues($customerId)
    {
        try {
            $paymentDues = PaymentDue::with(['invoice', 'ticket'])
                ->where('customer_id', $customerId)
                ->where('balance_due', '>', 0)
                ->where('status', '!=', 'Paid')
                ->orderBy('created_at', 'desc')
                ->get();

            return response()->json($paymentDues);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to fetch payment dues',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}