<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>GST Invoice {{ $invoice->invoice_id }}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: Arial, sans-serif;
            font-size: 11px;
            line-height: 1.4;
            color: #333;
            padding: 30px;
        }
        .invoice-container {
            width: 100%;
            border: 2px solid #000;
        }

        /* Header Section */
        .header {
            display: table;
            width: 100%;
            /*border-bottom: 2px solid #000;*/
        }
        .header-left {
            display: table-cell;
            width: 50%;
            padding: 15px;
            vertical-align: top;
            /*border-right: 1px solid #000;*/
        }
        .header-right {
            display: table-cell;
            width: 50%;
            padding: 15px;
            vertical-align: top;
        }
        .logo-section {
            margin-bottom: 10px;
        }
        .company-name {
            font-size: 16px;
            font-weight: bold;
            margin-bottom: 5px;
            color: #000;
        }
        .company-details {
            font-size: 9px;
            line-height: 1.5;
        }
        .company-details div {
            margin-bottom: 2px;
        }
        .invoice-title {
            font-size: 18px;
            font-weight: bold;
            text-align: center;
            margin-bottom: 10px;
            padding: 8px;
            background-color: #c4c4c4;
            /*border-bottom: 2px solid #000;*/
        }
        .invoice-details {
            font-size: 9px;
            line-height: 1.6;
        }
        .invoice-details div {
            margin-bottom: 3px;
        }
        .detail-label {
            font-weight: bold;
            display: inline-block;
            width: 100px;
        }

        /* Bill To Section */
        .bill-to-section {
            display: table;
            width: 100%;
            /*border-bottom: 1px solid #e4e4e4;*/
        }
        .bill-to {
            display: table-cell;
            width: 50%;
            padding: 10px 15px;
            vertical-align: top;
            /*border-right: 1px solid #e4e4e4;*/
        }
        .ship-to {
            display: table-cell;
            width: 50%;
            padding: 10px 15px;
            vertical-align: top;
        }
        .section-heading {
            font-weight: bold;
            font-size: 10px;
            margin-bottom: 5px;
            text-decoration: underline;
        }
        .customer-info {
            font-size: 9px;
            line-height: 1.5;
        }
        .customer-info div {
            margin-bottom: 2px;
        }

        /* Items Table */
        table.items-table {
            width: 100%;
            border-collapse: collapse;
        }
        table.items-table th {
            background-color: #f0f0f0;
            border: 1px solid #afafaf;
            padding: 6px 4px;
            text-align: center;
            font-size: 9px;
            font-weight: bold;
        }
        table.items-table td {
            border: 1px solid #afafaf;
            padding: 5px 4px;
            font-size: 9px;
            vertical-align: top;
        }
        .text-center {
            text-align: center;
        }
        .text-right {
            text-align: right;
        }
        .text-left {
            text-align: left;
        }

        /* Tax Summary */
        .tax-summary {
            display: table;
            width: 100%;
        }
        .tax-summary-left {
            display: table-cell;
            width: 50%;
            padding: 10px 15px;
            vertical-align: top;
            border-right: 1px solid #afafaf;
        }
        .tax-summary-right {
            display: table-cell;
            width: 50%;
            padding: 10px 15px;
            vertical-align: top;
        }
        .amount-words {
            font-size: 9px;
            font-weight: bold;
            margin-bottom: 10px;
        }
        .bank-details {
            font-size: 9px;
            line-height: 1.5;
        }
        .bank-details div {
            margin-bottom: 2px;
        }
        .total-table {
            width: 100%;
        }
        .total-table td {
            padding: 4px 8px;
            font-size: 9px;
        }
        .total-row {
            font-weight: bold;
        }
        .grand-total {
            background-color: #f0f0f0;
            font-weight: bold;
            font-size: 10px;
        }

        /* Terms and Footer */
        .terms-section {
            padding: 10px 15px;
            border-top: 1px solid #afafaf;
            font-size: 9px;
        }
        .terms-title {
            font-weight: bold;
            margin-bottom: 5px;
        }
        .terms-list {
            line-height: 1.6;
        }
        .signature-section {
            display: table;
            width: 100%;
            border-top: 1px solid #afafaf;
            padding: 15px;
        }
        .signature-left {
            display: table-cell;
            width: 50%;
            vertical-align: bottom;
        }
        .signature-right {
            display: table-cell;
            width: 50%;
            text-align: right;
            vertical-align: bottom;
        }
        .signature-line {
            border-top: 1px solid #333;
            width: 150px;
            margin-top: 40px;
            padding-top: 5px;
            font-size: 9px;
            text-align: center;
            margin-left: auto;
        }
        .fs-14
        {
            font-size:14px !important;
            font-weight:600 !important;
        }

        .fs-16
        {
            font-size:16px !important;
            font-weight:600 !important;
        }

    </style>
</head>
<body>

@php
$logo = \App\Models\Company::pluck('logo')->first();
@endphp

<!--class="invoice-container"-->
<div>
    <!-- Invoice Title -->
    <div class="invoice-title">TAX INVOICE</div>

    <!-- Header Section -->
    <div class="header">
        <!-- Left Side: Logo and Company Details -->
        <div class="header-left">
            <div class="logo-section">
                @if($logo && extension_loaded('gd'))
                    <img src="{{$logo}}" style="width:120px; height:auto;">
                @else
                    <div style="padding: 15px; border: 1px solid #ccc; display: inline-block; text-align: center;">
                        <strong>COMPANY LOGO</strong>
                    </div>
                @endif
            </div>

            <!-- Company Information -->
            @if($user->role_id == 1)
                <!-- Admin: Show Company Info -->
                <div class="company-name">
                    {{ $company ? $company->company_name : 'GETLEAD ANALYTICS PVT.LTD' }}
                </div>
                @if($company && $company->address)
                <div class="company-details">
                    <div><strong>Address:</strong> {{ $company->address }}</div>
                    @if($company->gstin)
                    <div><strong>GSTIN:</strong> {{ $company->gstin }}</div>
                    @endif
                    @if($company->phone)
                    <div><strong>Phone:</strong> {{ $company->phone }}</div>
                    @endif
                    @if($company->email)
                    <div><strong>Email:</strong> {{ $company->email }}</div>
                    @endif
                </div>
                @endif
            @else
                <!-- Non-Admin: Show Branch Info -->
                @if($branch)
                <div class="company-name">
                    {{ $branch->branch_name }}
                </div>
                @if($branch->address)
                <div class="company-details">
                    <div><strong>Address:</strong> {{ $branch->address }}</div>
                    @if($branch->gstin)
                    <div><strong>GSTIN:</strong> {{ $branch->gstin }}</div>
                    @endif
                    @if($branch->phone)
                    <div><strong>Phone:</strong> {{ $branch->phone }}</div>
                    @endif
                    @if($branch->email)
                    <div><strong>Email:</strong> {{ $branch->email }}</div>
                    @endif
                </div>
                @endif
                @else
                <div class="company-name">
                    {{ $company ? $company->company_name : 'GETLEAD ANALYTICS PVT.LTD' }}
                </div>
                @endif
            @endif
        </div>

        <!-- Right Side: Invoice Details and Customer Info -->
        <div class="header-right">
            <div class="invoice-details">
                <div><span class="detail-label">Invoice No:</span> {{ $invoice->invoice_id }}</div>
                <div><span class="detail-label">Invoice Date:</span> {{ \Carbon\Carbon::parse($invoice->invoice_date)->format('d-m-Y') }}</div>
                <div><span class="detail-label">Ticket ID:</span> {{ $invoice->ticket_id }}</div>
                @if($invoice->ticket && $invoice->ticket->tracking_number)
                <div><span class="detail-label">Tracking No:</span> {{ $invoice->ticket->tracking_number }}</div>
                @endif
            </div>

            <div style="margin-top: 15px;">
                <div class="section-heading">BILL TO:</div>
                <div class="customer-info">
                    <div><strong>{{ $invoice->customer->name ?? 'N/A' }}</strong></div>
                    @if($invoice->customer->company_name)
                    <div>{{ $invoice->customer->company_name }}</div>
                    @endif
                    @if($invoice->customer->address)
                    <div>{{ $invoice->customer->address }}</div>
                    @endif
                    @if($invoice->customer->gstin)
                    <div><strong>GSTIN:</strong> {{ $invoice->customer->gstin }}</div>
                    @endif
                    <div><strong>Mobile:</strong> {{ ($invoice->customer->country_code ?? '') }} {{ $invoice->customer->mobile ?? $invoice->customer->phone ?? 'N/A' }}</div>
                    @if($invoice->customer->email)
                    <div><strong>Email:</strong> {{ $invoice->customer->email }}</div>
                    @endif
                </div>
            </div>
        </div>
    </div>

    <!-- Items Table -->
    <table class="items-table">
        <thead>

            <tr>
                <th colspan=7 style="font-size:15px;font-weight:600;text-align:left;"> Parts Invoices</th>
            </tr>
            <tr>
                <th width="5%">S.No</th>
                <th width="30%">Description of Goods/Services</th>
                <th width="10%">HSN/SAC</th>
                <th width="8%">Qty</th>
                <th width="10%">Rate</th>
                <th width="12%">Taxable Amount</th>
                <th width="12%">Total</th>
            </tr>
        </thead>
        <tbody>
            @php
            $srNo = 1;
            // Calculate spare parts totals
            $sparePartsTaxableTotal = 0;
            $sparePartsCgstTotal = 0;
            $sparePartsSgstTotal = 0;
            $sparePartsGrandTotal = 0;

            if($spareParts && count($spareParts) > 0) {
                foreach($spareParts as $part) {
                    $sparePartsTaxableTotal += $part['taxable_amount'];
                    $sparePartsCgstTotal += $part['cgst_amount'];
                    $sparePartsSgstTotal += $part['sgst_amount'];
                    $sparePartsGrandTotal += $part['total_with_gst'];
                }
            }
            @endphp

            <!-- Spare Parts Section -->
            @if($spareParts && count($spareParts) > 0)
                @foreach($spareParts as $part)
                <tr>
                    <td class="text-center">{{ $srNo++ }}</td>
                    <td>{{ $part['product_name'] }}
                        @if($part['product_code'])
                        <br><small>Code: {{ $part['product_code'] }}</small>
                        @endif
                        @if($part['brand'])
                        <br><small>Brand: {{ $part['brand'] }}</small>
                        @endif
                    </td>
                    <td class="text-center">{{ $part['hsn_code'] ?? '-' }}</td>
                    <td class="text-center">{{ $part['quantity'] }}</td>
                    <td class="text-right">{{ number_format($part['unit_price'], 2) }}</td>
                    <td class="text-right">{{ number_format($part['taxable_amount'], 2) }}</td>
                    <td class="text-right">{{ number_format($part['total_with_gst'], 2) }}</td>
                </tr>
                @endforeach

                <!-- Spare Parts Total -->
                <tr class="total-row" style="background-color: #f9fafb;">
                    <td colspan="5" class="text-right"><strong>Spare Parts Total:</strong></td>
                    <td class="text-right"><strong>{{ number_format($sparePartsTaxableTotal, 2) }}</strong></td>
                    <td class="text-right"><strong>{{ number_format($sparePartsGrandTotal, 2) }}</strong></td>
                </tr>
            @endif

            <!-- Service Charge Section -->
            @if($serviceCharge > 0)

            <tr>
                <td colspan=7 style="font-size:15px;font-weight:600;"> Labour / Services Invoices</th>
            </tr>

            <tr>
                <td class="text-center">{{ $srNo++ }}</td>
                <td><strong>Labour / Service Charge</strong></td>
                <td class="text-center">{{ $serviceHsnCode ?? '998314' }}</td>
                <td class="text-center">1</td>
                <td class="text-right">{{ number_format($serviceTaxableAmount, 2) }}</td>
                <td class="text-right">{{ number_format($serviceTaxableAmount, 2) }}</td>
                <td class="text-right">{{ number_format($serviceWithGst, 2) }}</td>
            </tr>
            @endif

            <!-- Overall Totals Row -->
            <tr class="total-row" style="background-color: #e5e7eb;">
                <td colspan="5" class="text-right"><strong>Total:</strong></td>
                <td class="text-right"><strong>{{ number_format($totalTaxableAmount, 2) }}</strong></td>
                <td class="text-right"><strong>{{ number_format($totalAmount, 2) }}</strong></td>
            </tr>

            @if($discount > 0)
            <tr>
                <td colspan="6" class="text-right"><strong>Discount:</strong></td>
                <td class="text-right"><strong>-{{ number_format($discount, 2) }}</strong></td>
            </tr>
            @endif

            <tr class="grand-total">
                <td colspan="6" class="text-right"><strong>GST TOTAL:</strong></td>
                <td class="text-right"><strong>₹ {{ number_format($totalCgstAmount + $totalSgstAmount, 2) }}</strong></td>
            </tr>
            <tr class="grand-total">
                <td colspan="6" class="text-right"><strong>GRAND TOTAL:</strong></td>
                <td class="text-right"><strong>₹ {{ number_format($netAmount, 2) }}</strong></td>
            </tr>
        </tbody>
    </table>

    <!-- Tax Summary and Bank Details -->
    <div class="tax-summary">
        <div class="tax-summary-left">
            <div class="amount-words">
                Amount in Words: {{ ucfirst($amountInWords) }} Only
            </div>

            <div class="bank-details">
                <div class="terms-title">Bank Details:</div>
                <div><strong>Bank Name:</strong> {{ $company->bank_name ?? 'N/A' }}</div>
                <div><strong>Account No:</strong> {{ $company->account_number ?? 'N/A' }}</div>
                <div><strong>IFSC Code:</strong> {{ $company->ifsc_code ?? 'N/A' }}</div>
                <div><strong>Branch:</strong> {{ $company->bank_branch ?? 'N/A' }}</div>
            </div>
        </div>

        <div class="tax-summary-right">
            <table class="total-table">
                <tr>
                    <td><strong>Taxable Amount:</strong></td>
                    <td class="text-right fs-14">{{ number_format($totalTaxableAmount, 2) }}</td>
                </tr>
                <tr>
                    <td><strong>CGST @ {{ number_format($cgstRate, 2) }}%:</strong></td>
                    <td class="text-right fs-14">{{ number_format($totalCgstAmount, 2) }}</td>
                </tr>
                <tr>
                    <td><strong>SGST @ {{ number_format($sgstRate, 2) }}%:</strong></td>
                    <td class="text-right fs-14">{{ number_format($totalSgstAmount, 2) }}</td>
                </tr>
                <tr>
                    <td><strong>Total Tax:</strong></td>
                    <td class="text-right fs-14">{{ number_format($totalCgstAmount + $totalSgstAmount, 2) }}</td>
                </tr>
                @if($discount > 0)
                <tr>
                    <td><strong>Discount:</strong></td>
                    <td class="text-right fs-14">{{ number_format($discount, 2) }}</td>
                </tr>
                @endif
                <tr class="grand-total">
                    <td><strong>Net Amount:</strong></td>
                    <td class="text-right fs-16"><strong>₹ {{ number_format($netAmount, 2) }}</strong></td>
                </tr>
            </table>
        </div>
    </div>

    <!-- Terms and Conditions -->
    <div class="terms-section">
        <div class="terms-title">Terms & Conditions:</div>
        <div class="terms-list">
            1. Payment is due within 30 days from the invoice date.<br>
            2. Goods once sold will not be taken back.<br>
            3. All disputes are subject to local jurisdiction only.<br>
            4. Interest @ 18% per annum will be charged on delayed payments.
        </div>
    </div>

    <!-- Signature Section -->
    <div class="signature-section">
        <div class="signature-left">
            <div style="font-size: 9px;">
                <strong>Customer Signature</strong>
            </div>
        </div>
        <div class="signature-right">
            <div style="font-size: 9px; margin-bottom: 5px;">
                <strong>For {{ $company ? $company->company_name : 'GETLEAD ANALYTICS PVT.LTD' }}</strong>
            </div>
            <div class="signature-line">
                Authorized Signatory
            </div>
        </div>
    </div>
</div>

</body>
</html>
