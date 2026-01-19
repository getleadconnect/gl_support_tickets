<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithTitle;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithColumnWidths;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Style\Border;

class StaffMonthlySplitupsExport implements FromCollection, WithHeadings, WithMapping, WithTitle, WithStyles, WithColumnWidths
{
    protected $tickets;
    protected $summary;
    protected $staffName;
    protected $monthYear;
    protected $rowNumber = 0;

    public function __construct($tickets, $summary, $staffName, $monthYear)
    {
        $this->tickets = $tickets;
        $this->summary = $summary;
        $this->staffName = $staffName;
        $this->monthYear = $monthYear;
    }

    public function collection()
    {
        $data = collect();

        foreach ($this->tickets as $ticket) {
            // Add ticket header row
            $data->push([
                'type' => 'ticket_header',
                'tracking_number' => $ticket['tracking_number'],
                'issue' => $ticket['issue'],
                'customer_name' => $ticket['customer_name'],
                'customer_mobile' => $ticket['customer_mobile'],
                'created_at' => $ticket['created_at'],
                'closed_at' => $ticket['closed_at'],
                'service_charge' => $ticket['service_charge'],
                'parts_total' => $ticket['parts_total'],
                'total_amount' => $ticket['total_amount'],
            ]);

            // Add product rows
            if (count($ticket['products']) > 0) {
                foreach ($ticket['products'] as $index => $product) {
                    $data->push([
                        'type' => 'product',
                        'index' => $index + 1,
                        'product_name' => $product['product_name'],
                        'product_code' => $product['product_code'],
                        'quantity' => $product['quantity'],
                        'unit_price' => $product['unit_price'],
                        'total_price' => $product['total_price'],
                    ]);
                }
            } else {
                $data->push([
                    'type' => 'no_products',
                    'message' => 'No spare parts used',
                ]);
            }

            // Add empty row for spacing
            $data->push(['type' => 'spacer']);
        }

        // Add summary row
        $data->push([
            'type' => 'summary',
            'totalTickets' => $this->summary['totalTickets'],
            'totalServiceCharge' => $this->summary['totalServiceCharge'],
            'totalPartsAmount' => $this->summary['totalPartsAmount'],
            'grandTotal' => $this->summary['grandTotal'],
        ]);

        return $data;
    }

    public function headings(): array
    {
        return [
            ['STAFF MONTHLY SPLIT-UPS REPORT'],
            ['Staff Member: ' . $this->staffName],
            ['Month: ' . $this->monthYear],
            ['Generated On: ' . now()->format('d/m/Y H:i')],
            [],
            ['Tracking No', 'Issue', 'Customer', 'Mobile', 'Created', 'Closed', 'Service Charge', 'Parts Total', 'Total Amount'],
        ];
    }

    public function map($row): array
    {
        $this->rowNumber++;

        if ($row['type'] === 'ticket_header') {
            return [
                $row['tracking_number'],
                $row['issue'],
                $row['customer_name'],
                $row['customer_mobile'],
                $row['created_at'],
                $row['closed_at'],
                '₹' . number_format($row['service_charge'], 2),
                '₹' . number_format($row['parts_total'], 2),
                '₹' . number_format($row['total_amount'], 2),
            ];
        } elseif ($row['type'] === 'product') {
            return [
                '',
                '  → ' . $row['product_name'],
                $row['product_code'],
                'Qty: ' . $row['quantity'],
                '',
                '',
                '₹' . number_format($row['unit_price'], 2),
                '',
                '₹' . number_format($row['total_price'], 2),
            ];
        } elseif ($row['type'] === 'no_products') {
            return [
                '',
                '  → ' . $row['message'],
                '',
                '',
                '',
                '',
                '',
                '',
                '',
            ];
        } elseif ($row['type'] === 'spacer') {
            return ['', '', '', '', '', '', '', '', ''];
        } elseif ($row['type'] === 'summary') {
            return [
                'GRAND TOTAL',
                'Total Tickets: ' . $row['totalTickets'],
                '',
                '',
                '',
                '',
                '₹' . number_format($row['totalServiceCharge'], 2),
                '₹' . number_format($row['totalPartsAmount'], 2),
                '₹' . number_format($row['grandTotal'], 2),
            ];
        }

        return [];
    }

    public function title(): string
    {
        return 'Monthly Split-ups';
    }

    public function styles(Worksheet $sheet)
    {
        // Style the header rows
        $sheet->mergeCells('A1:I1');
        $sheet->getStyle('A1')->getFont()->setBold(true)->setSize(14);
        $sheet->getStyle('A1')->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);

        // Style info rows
        $sheet->getStyle('A2:A4')->getFont()->setBold(true);

        // Style column headers
        $sheet->getStyle('A6:I6')->getFont()->setBold(true);
        $sheet->getStyle('A6:I6')->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setARGB('FFE0E0E0');
        $sheet->getStyle('A6:I6')->getBorders()->getAllBorders()->setBorderStyle(Border::BORDER_THIN);

        // Style summary row (last row)
        $lastRow = $sheet->getHighestRow();
        $sheet->getStyle("A{$lastRow}:I{$lastRow}")->getFont()->setBold(true)->setSize(12);
        $sheet->getStyle("A{$lastRow}:I{$lastRow}")->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setARGB('FFD4E6F1');
        $sheet->getStyle("A{$lastRow}:I{$lastRow}")->getBorders()->getAllBorders()->setBorderStyle(Border::BORDER_THICK);

        return [];
    }

    public function columnWidths(): array
    {
        return [
            'A' => 15,  // Tracking No
            'B' => 30,  // Issue
            'C' => 20,  // Customer
            'D' => 15,  // Mobile
            'E' => 18,  // Created
            'F' => 18,  // Closed
            'G' => 15,  // Service Charge
            'H' => 15,  // Parts Total
            'I' => 15,  // Total Amount
        ];
    }
}