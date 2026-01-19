<?php

namespace App\Http\Controllers;

use App\Models\Ticket;
use App\Models\User;
use App\Models\Invoice;
use App\Models\ProductTicket;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use Symfony\Component\HttpFoundation\Response;

class StaffReportController extends Controller
{
    /**
     * Get staff tickets summary report
     */
    public function getStaffTicketsReport(Request $request)
    {
        $request->validate([
            'staff_id' => 'required|exists:users,id',
            'month' => 'nullable|date_format:Y-m',
            'start_date' => 'nullable|date|required_with:end_date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
        ]);

        try {
            $staffId = $request->staff_id;

            // Build query for closed tickets assigned to staff
            $query = Ticket::with(['customer', 'invoice'])
                ->whereHas('agent', function ($q) use ($staffId) {
                    $q->where('users.id', $staffId);
                })
                ->where('status', 3); // Closed status

            // Apply date filters
            if ($request->month) {
                $date = Carbon::parse($request->month);
                $query->whereYear('closed_at', $date->year)
                      ->whereMonth('closed_at', $date->month);
            } elseif ($request->start_date && $request->end_date) {
                $query->whereBetween('closed_at', [$request->start_date, $request->end_date]);
            }

            $tickets = $query->orderBy('closed_at', 'desc')->get();

            // Format tickets data
            $formattedTickets = $tickets->map(function ($ticket) {
                $invoice = $ticket->invoice;
                $serviceCharge = $invoice ? (float)$invoice->service_charge : 0;
                $partsCost = $invoice ? (float)$invoice->item_cost : 0;
                $totalAmount = $serviceCharge + $partsCost;

                // Calculate resolution time
                $createdAt = Carbon::parse($ticket->created_at);
                $closedAt = $ticket->closed_at ? Carbon::parse($ticket->closed_at) : $createdAt;
                $resolutionHours = $createdAt->diffInHours($closedAt);
                $resolutionTime = $resolutionHours < 24
                    ? "{$resolutionHours} hours"
                    : round($resolutionHours / 24, 1) . " days";

                return [
                    'id' => $ticket->id,
                    'tracking_number' => $ticket->tracking_number,
                    'issue' => $ticket->issue,
                    'customer_name' => $ticket->customer ? $ticket->customer->name : 'N/A',
                    'status' => 'Closed',
                    'priority' => $this->getPriorityLabel($ticket->priority),
                    'created_at' => $ticket->created_at,
                    'closed_at' => $ticket->closed_at,
                    'resolution_time' => $resolutionTime,
                    'service_charge' => $serviceCharge,
                    'parts_cost' => $partsCost,
                    'total_amount' => $totalAmount,
                ];
            });

            // Calculate summary
            $summary = [
                'totalTickets' => $formattedTickets->count(),
                'totalServiceCharge' => $formattedTickets->sum('service_charge'),
                'totalPartsCost' => $formattedTickets->sum('parts_cost'),
                'grandTotal' => $formattedTickets->sum('total_amount'),
                'avgResolutionTime' => $this->calculateAvgResolution($tickets),
            ];

            return response()->json([
                'success' => true,
                'tickets' => $formattedTickets,
                'summary' => $summary,
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to generate report: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get staff monthly split-ups detailed report
     */
    public function getStaffMonthlySplitups(Request $request)
    {
        $request->validate([
            'staff_id' => 'required|exists:users,id',
            'month' => 'required|date_format:Y-m',
        ]);

        try {
            $staffId = $request->staff_id;
            $date = Carbon::parse($request->month);

            // Get closed tickets for the staff in the selected month
            $tickets = Ticket::with(['customer', 'invoice', 'products'])
                ->whereHas('agent', function ($q) use ($staffId) {
                    $q->where('users.id', $staffId);
                })
                ->where('status', 3) // Closed status
                ->whereYear('closed_at', $date->year)
                ->whereMonth('closed_at', $date->month)
                ->orderBy('closed_at', 'desc')
                ->get();

            // Format tickets with detailed product information
            $formattedTickets = $tickets->map(function ($ticket) {
                // Get products used in this ticket
                $productTickets = ProductTicket::with('product')
                    ->where('ticket_id', $ticket->id)
                    ->get();

                $products = $productTickets->map(function ($pt) {
                    $unitPrice = $pt->price ?? ($pt->product ? $pt->product->cost : 0);
                    $quantity = $pt->quantity ?? 1;
                    $totalPrice = $pt->total_price ?? ($unitPrice * $quantity);

                    return [
                        'id' => $pt->id,
                        'product_name' => $pt->product ? $pt->product->name : 'N/A',
                        'product_code' => $pt->product ? $pt->product->code : 'N/A',
                        'quantity' => $quantity,
                        'unit_price' => $unitPrice,
                        'total_price' => $totalPrice,
                    ];
                });

                $invoice = $ticket->invoice;
                $serviceCharge = $invoice ? (float)$invoice->service_charge : 0;
                $partsTotal = (float)$products->sum('total_price');
                $totalAmount = $serviceCharge + $partsTotal;

                return [
                    'id' => $ticket->id,
                    'tracking_number' => $ticket->tracking_number,
                    'issue' => $ticket->issue,
                    'customer_name' => $ticket->customer ? $ticket->customer->name : 'N/A',
                    'customer_mobile' => $ticket->customer ?
                        ($ticket->customer->country_code . $ticket->customer->mobile) : 'N/A',
                    'created_at' => $ticket->created_at,
                    'closed_at' => $ticket->closed_at,
                    'products' => $products,
                    'service_charge' => $serviceCharge,
                    'parts_total' => $partsTotal,
                    'total_amount' => $totalAmount,
                ];
            });

            // Calculate summary
            $totalProducts = 0;
            foreach ($formattedTickets as $ticket) {
                $totalProducts += count($ticket['products']);
            }

            $summary = [
                'totalTickets' => $formattedTickets->count(),
                'totalServiceCharge' => $formattedTickets->sum('service_charge'),
                'totalPartsAmount' => $formattedTickets->sum('parts_total'),
                'grandTotal' => $formattedTickets->sum('total_amount'),
                'totalProducts' => $totalProducts,
            ];

            return response()->json([
                'success' => true,
                'tickets' => $formattedTickets,
                'summary' => $summary,
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to generate report: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get priority label
     */
    private function getPriorityLabel($priority)
    {
        $priorities = [
            1 => 'Low',
            2 => 'Medium',
            3 => 'High',
        ];

        return $priorities[$priority] ?? 'Low';
    }

    /**
     * Generate Excel/CSV report for staff tickets
     */
    public function generateStaffTicketsExcel(Request $request)
    {
        $request->validate([
            'staff_id' => 'required|exists:users,id',
            'staff_name' => 'required|string',
            'month' => 'nullable|date_format:Y-m',
            'start_date' => 'nullable|date|required_with:end_date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'filter_description' => 'nullable|string',
        ]);

        try {
            $staffId = $request->staff_id;
            $staffName = $request->staff_name;
            $filterDescription = $request->filter_description ?? '';

            // Build query for closed tickets assigned to staff
            $query = Ticket::with(['customer', 'invoice'])
                ->whereHas('agent', function ($q) use ($staffId) {
                    $q->where('users.id', $staffId);
                })
                ->where('status', 3); // Closed status

            // Apply date filters
            if ($request->month) {
                $date = Carbon::parse($request->month);
                $query->whereYear('closed_at', $date->year)
                      ->whereMonth('closed_at', $date->month);
            } elseif ($request->start_date && $request->end_date) {
                $query->whereBetween('closed_at', [$request->start_date, $request->end_date]);
            }

            $tickets = $query->orderBy('closed_at', 'desc')->get();

            // Format tickets data
            $formattedTickets = $tickets->map(function ($ticket) {
                $invoice = $ticket->invoice;
                $serviceCharge = $invoice ? (float)$invoice->service_charge : 0;
                $partsCost = $invoice ? (float)$invoice->item_cost : 0;
                $totalAmount = $serviceCharge + $partsCost;

                // Calculate resolution time
                $createdAt = Carbon::parse($ticket->created_at);
                $closedAt = $ticket->closed_at ? Carbon::parse($ticket->closed_at) : $createdAt;
                $resolutionHours = $createdAt->diffInHours($closedAt);
                $resolutionTime = $resolutionHours < 24
                    ? "{$resolutionHours} hours"
                    : round($resolutionHours / 24, 1) . " days";

                return [
                    'tracking_number' => $ticket->tracking_number,
                    'issue' => $ticket->issue,
                    'customer_name' => $ticket->customer ? $ticket->customer->name : 'N/A',
                    'priority' => $this->getPriorityLabel($ticket->priority),
                    'created_at' => Carbon::parse($ticket->created_at)->format('d/m/Y'),
                    'closed_at' => $ticket->closed_at ? Carbon::parse($ticket->closed_at)->format('d/m/Y') : '-',
                    'resolution_time' => $resolutionTime,
                    'service_charge' => $serviceCharge,
                    'parts_cost' => $partsCost,
                    'total_amount' => $totalAmount,
                ];
            });

            // Calculate summary
            $summary = [
                'totalTickets' => $formattedTickets->count(),
                'totalServiceCharge' => $formattedTickets->sum('service_charge'),
                'totalPartsCost' => $formattedTickets->sum('parts_cost'),
                'grandTotal' => $formattedTickets->sum('total_amount'),
                'avgResolutionTime' => $this->calculateAvgResolution($tickets),
            ];

            // Create CSV content
            $csvContent = $this->generateCSVContent($formattedTickets, $summary, $staffName, $filterDescription);

            // Generate filename
            $filename = 'staff_tickets_report_' . str_replace(' ', '_', $staffName) . '_' . date('Ymd') . '.csv';

            // Return CSV download
            return response($csvContent, 200, [
                'Content-Type' => 'text/csv',
                'Content-Disposition' => 'attachment; filename="' . $filename . '"',
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to generate report: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Generate CSV content for the report
     */
    private function generateCSVContent($tickets, $summary, $staffName, $filterDescription)
    {
        $output = fopen('php://temp', 'r+');

        // Add report header information
        fputcsv($output, ['STAFF TICKETS REPORT']);
        fputcsv($output, []);
        fputcsv($output, ['Staff Member:', $staffName]);
        fputcsv($output, ['Report Period:', $filterDescription]);
        fputcsv($output, ['Generated On:', now()->format('d/m/Y H:i')]);
        fputcsv($output, []);

        // Add summary section
        fputcsv($output, ['SUMMARY']);
        fputcsv($output, ['Total Tickets:', $summary['totalTickets']]);
        fputcsv($output, ['Total Service Charge:', '₹' . number_format($summary['totalServiceCharge'], 2)]);
        fputcsv($output, ['Total Parts Cost:', '₹' . number_format($summary['totalPartsCost'], 2)]);
        fputcsv($output, ['Grand Total:', '₹' . number_format($summary['grandTotal'], 2)]);
        fputcsv($output, ['Average Resolution Time:', $summary['avgResolutionTime']]);
        fputcsv($output, []);

        // Add headers
        fputcsv($output, [
            'Sr No',
            'Tracking ID',
            'Issue',
            'Customer',
            'Priority',
            'Created Date',
            'Closed Date',
            'Resolution Time',
            'Service Charge (₹)',
            'Parts Cost (₹)',
            'Total Amount (₹)'
        ]);

        // Add data rows
        $index = 1;
        foreach ($tickets as $ticket) {
            fputcsv($output, [
                $index++,
                $ticket['tracking_number'],
                $ticket['issue'],
                $ticket['customer_name'],
                $ticket['priority'],
                $ticket['created_at'],
                $ticket['closed_at'],
                $ticket['resolution_time'],
                number_format($ticket['service_charge'], 2),
                number_format($ticket['parts_cost'], 2),
                number_format($ticket['total_amount'], 2)
            ]);
        }

        // Add totals row
        fputcsv($output, []);
        fputcsv($output, [
            '',
            '',
            '',
            '',
            '',
            '',
            '',
            'TOTAL:',
            number_format($summary['totalServiceCharge'], 2),
            number_format($summary['totalPartsCost'], 2),
            number_format($summary['grandTotal'], 2)
        ]);

        rewind($output);
        $csv = stream_get_contents($output);
        fclose($output);

        // Add UTF-8 BOM for Excel compatibility
        return "\xEF\xBB\xBF" . $csv;
    }

    /**
     * Generate Excel report for staff monthly splitups
     */
    public function exportMonthlySplitupsExcel(Request $request)
    {
        $request->validate([
            'staff_id' => 'required|exists:users,id',
            'month' => 'required|date_format:Y-m',
        ]);

        try {
            $staffId = $request->staff_id;
            $date = Carbon::parse($request->month);

            // Get staff details
            $staff = User::find($staffId);
            $staffName = $staff ? $staff->name : 'Unknown';
            $monthYear = $date->format('F Y');

            // Get closed tickets for the staff in the selected month
            $tickets = Ticket::with(['customer', 'invoice'])
                ->whereHas('agent', function ($q) use ($staffId) {
                    $q->where('users.id', $staffId);
                })
                ->where('status', 3) // Closed status
                ->whereYear('closed_at', $date->year)
                ->whereMonth('closed_at', $date->month)
                ->orderBy('closed_at', 'desc')
                ->get();

            // Create CSV content for Excel
            $csvContent = $this->generateMonthlySplitupsCSV($tickets, $staffName, $monthYear);

            // Generate filename
            $filename = 'staff_monthly_splitups_' . str_replace(' ', '_', $staffName) . '_' . $date->format('Y_m') . '.csv';

            // Return CSV file that can be opened in Excel
            return response($csvContent, 200, [
                'Content-Type' => 'text/csv; charset=UTF-8',
                'Content-Disposition' => 'attachment; filename="' . $filename . '"',
                'Cache-Control' => 'no-cache, no-store, must-revalidate',
                'Pragma' => 'no-cache',
                'Expires' => '0'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to generate Excel report: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Generate CSV content for monthly splitups
     */
    private function generateMonthlySplitupsCSV($tickets, $staffName, $monthYear)
    {
        $output = fopen('php://temp', 'r+');

        // Add report header
        fputcsv($output, ['STAFF MONTHLY SPLIT-UPS REPORT']);
        fputcsv($output, []);
        fputcsv($output, ['Staff Member:', $staffName]);
        fputcsv($output, ['Month:', $monthYear]);
        fputcsv($output, ['Generated On:', now()->format('d/m/Y H:i')]);
        fputcsv($output, []);

        // Initialize totals
        $totalTickets = 0;
        $totalServiceCharge = 0;
        $totalPartsAmount = 0;
        $grandTotal = 0;

        // Process each ticket
        foreach ($tickets as $ticket) {
            $totalTickets++;

            // Get invoice details
            $invoice = $ticket->invoice;
            $serviceCharge = $invoice ? (float)$invoice->service_charge : 0;

            // Get products for this ticket
            $productTickets = ProductTicket::with('product')
                ->where('ticket_id', $ticket->id)
                ->get();

            $ticketPartsTotal = 0;

            // Add ticket header
            fputcsv($output, ['TICKET DETAILS']);
            fputcsv($output, ['Tracking No:', $ticket->tracking_number]);
            fputcsv($output, ['Issue:', $ticket->issue]);
            fputcsv($output, ['Customer:', $ticket->customer ? $ticket->customer->name : 'N/A']);
            fputcsv($output, ['Mobile:', $ticket->customer ? ($ticket->customer->country_code . $ticket->customer->mobile) : 'N/A']);
            fputcsv($output, ['Created:', $ticket->created_at ? Carbon::parse($ticket->created_at)->format('d/m/Y H:i') : 'N/A']);
            fputcsv($output, ['Closed:', $ticket->closed_at ? Carbon::parse($ticket->closed_at)->format('d/m/Y H:i') : 'N/A']);
            fputcsv($output, []);

            // Add products header and details
            if ($productTickets->count() > 0) {
                fputcsv($output, ['SPARE PARTS USED:']);
                fputcsv($output, ['S.No', 'Product Name', 'Product Code', 'Quantity', 'Unit Price', 'Total']);

                $productIndex = 1;
                foreach ($productTickets as $pt) {
                    $product = $pt->product;
                    $unitPrice = $pt->price ?? ($product ? $product->cost : 0);
                    $quantity = $pt->quantity ?? 1;
                    $totalPrice = $pt->total_price ?? ($unitPrice * $quantity);

                    fputcsv($output, [
                        $productIndex++,
                        $product ? $product->name : 'N/A',
                        $product ? $product->code : 'N/A',
                        $quantity,
                        '₹' . number_format($unitPrice, 2),
                        '₹' . number_format($totalPrice, 2)
                    ]);

                    $ticketPartsTotal += $totalPrice;
                }
                fputcsv($output, ['', '', '', '', 'Parts Subtotal:', '₹' . number_format($ticketPartsTotal, 2)]);
            } else {
                fputcsv($output, ['No spare parts used for this ticket']);
            }

            // Add ticket summary
            fputcsv($output, []);
            fputcsv($output, ['TICKET SUMMARY:']);
            fputcsv($output, ['Service Charge:', '₹' . number_format($serviceCharge, 2)]);
            fputcsv($output, ['Parts Total:', '₹' . number_format($ticketPartsTotal, 2)]);
            $ticketTotal = $serviceCharge + $ticketPartsTotal;
            fputcsv($output, ['Ticket Total:', '₹' . number_format($ticketTotal, 2)]);
            fputcsv($output, []);
            fputcsv($output, ['========================================']);
            fputcsv($output, []);

            // Update totals
            $totalServiceCharge += $serviceCharge;
            $totalPartsAmount += $ticketPartsTotal;
            $grandTotal += $ticketTotal;
        }

        // Add grand summary
        fputcsv($output, ['GRAND SUMMARY']);
        fputcsv($output, ['Total Tickets:', $totalTickets]);
        fputcsv($output, ['Total Service Charge:', '₹' . number_format($totalServiceCharge, 2)]);
        fputcsv($output, ['Total Parts Amount:', '₹' . number_format($totalPartsAmount, 2)]);
        fputcsv($output, ['Grand Total:', '₹' . number_format($grandTotal, 2)]);

        rewind($output);
        $csv = stream_get_contents($output);
        fclose($output);

        // Add UTF-8 BOM for Excel compatibility
        return "\xEF\xBB\xBF" . $csv;
    }

    /**
     * Calculate average resolution time
     */
    private function calculateAvgResolution($tickets)
    {
        if ($tickets->count() === 0) {
            return '0 hours';
        }

        $totalHours = 0;
        foreach ($tickets as $ticket) {
            if ($ticket->closed_at) {
                $createdAt = Carbon::parse($ticket->created_at);
                $closedAt = Carbon::parse($ticket->closed_at);
                $totalHours += $createdAt->diffInHours($closedAt);
            }
        }

        $avgHours = $totalHours / $tickets->count();

        if ($avgHours < 24) {
            return round($avgHours, 1) . ' hours';
        } else {
            return round($avgHours / 24, 1) . ' days';
        }
    }
}