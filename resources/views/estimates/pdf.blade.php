<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Estimate {{ $estimate->estimate_number }}</title>
    <style>
        body {
            font-family: 'DejaVu Sans', Arial, sans-serif;
            margin: 0;
            padding: 15px;
            font-size: 12px;
            line-height: 1.4;
            color: #333;
        }
        
        .header {
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #ddd;
        }
        
        .header-table {
            width: 100%;
            table-layout: fixed;
        }
        
        .header-table td {
            width: 50%;
            vertical-align: top;
        }
        
        .company-info {
            width: 100%;
        }
        
        .company-name {
            font-size: 16px;
            font-weight: bold;
            color: #2563eb;
            margin-bottom: 8px;
        }
        
        .company-address {
            margin-bottom: 4px;
            color: #666;
        }
        
        .logo-section {
            text-align: right;
            width: 100%;
        }
        
        .logo {
            max-width: 150px;
            max-height: 80px;
        }
        
        .logo-placeholder {
            width: 150px;
            height: 80px;
            background: linear-gradient(45deg, #10b981, #3b82f6, #ef4444);
            color: white;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            font-size: 16px;
            font-weight: bold;
            border-radius: 4px;
        }
        
        .estimate-title {
            text-align: center;
            font-size: 24px;
            font-weight: bold;
            color: #2563eb;
            margin: 30px 0;
            text-transform: uppercase;
            letter-spacing: 2px;
        }
        
        .details-section {
            margin-bottom: 30px;
        }
        
        .details-table-layout {
            width: 100%;
            table-layout: fixed;
        }
        
        .details-table-layout td {
            width: 50%;
            vertical-align: top;
            padding-right: 20px;
        }
        
        .details-table-layout td:last-child {
            padding-right: 0;
        }
        
        .bill-to {
            width: 100%;
        }
        
        .estimate-details {
            width: 100%;
            text-align: right;
        }
        
        .estimate-details .details-table {
            margin-left: auto;
            width: auto;
        }
        
        .description-row {
            padding-top: 15px;
        }
        
        .description-title {
            font-size: 14px;
            font-weight: bold;
            color: #2563eb;
            margin-bottom: 8px;
        }
        
        .description-content {
            color: #666;
            line-height: 1.6;
        }
        
        .section-title {
            font-size: 14px;
            font-weight: bold;
            color: #2563eb;
            margin-bottom: 8px;
        }
        
        .details-table {
            width: 100%;
        }
        
        .details-table td {
            padding: 4px 0;
            vertical-align: top;
        }
        
        .details-table .label {
            font-weight: bold;
            width: 100px;
            color: #666;
        }
        
        .details-table .colon {
            width: 10px;
            text-align: center;
        }
        
        .items-table {
            width: 100%;
            border-collapse: collapse;
            margin: 30px 0;
        }
        
        .items-table th {
            background-color: #2563eb;
            color: white;
            padding: 12px 8px;
            text-align: left;
            font-weight: bold;
            font-size: 13px;
        }
        
        .items-table td {
            padding: 10px 8px;
            border-bottom: 1px solid #e5e7eb;
        }
        
        .items-table .text-center {
            text-align: center;
        }
        
        .items-table .text-right {
            text-align: right;
        }
        
        .items-table tbody tr:nth-child(even) {
            background-color: #f9fafb;
        }
        
        .totals-section {
            display: flex;
            justify-content: space-between;
            margin-top: 30px;
        }
        
        .payment-instructions {
            flex: 1;
            margin-right: 40px;
        }
        
        .totals {
            flex: 0 0 250px;
        }
        
        .payment-box {
            background-color: #f8fafc;
            padding: 15px;
            border-radius: 4px;
            border: 1px solid #e2e8f0;
        }
        
        .totals-table {
            width: 100%;
        }
        
        .totals-table td {
            padding: 8px 0;
            border-bottom: 1px solid #e5e7eb;
        }
        
        .totals-table .label {
            font-weight: bold;
            color: #666;
        }
        
        .totals-table .amount {
            text-align: right;
            font-weight: bold;
        }
        
        .totals-table .total-row {
            border-top: 2px solid #2563eb;
            border-bottom: 2px solid #2563eb;
            font-size: 14px;
        }
        
        .signature-section {
            margin-top: 50px;
        }
        
        .signature-table {
            width: 100%;
            table-layout: fixed;
        }
        
        .signature-table td {
            width: 50%;
            vertical-align: top;
            padding: 20px 10px;
        }
        
        .thank-you-section {
            margin-top:15px;
            text-align: left;
        }
        
        .thank-you-text {
            font-weight: bold;
            font-size: 16px;
            color: #2563eb;
            margin-bottom: 8px;
        }
        
        .current-date {
            color: #666;
            font-size: 12px;
        }
        
        .authorized-section {
            text-align: right;
        }
        
        .signature-line {
            border-bottom: 2px solid #333;
            width: 200px;
            margin: 0 0 10px auto;
            height: 40px;
        }
        
        .authorized-text {
            font-weight: bold;
            color: #666;
        }
        
        .currency {
            font-weight: normal;
            font-family: Arial, sans-serif;
        }
    </style>
</head>
<body>
    <!-- Header Section -->
    <div class="header">
        <table class="header-table">
            <tr>
                <td>
                    <div class="company-info">
                        <div class="company-name">{{ $company->company_name ?? 'Company Name' }}</div>
                        @if($addressToShow)
                            @foreach(explode("\n", $addressToShow) as $line)
                                <div class="company-address">{{ trim($line) }}</div>
                            @endforeach
                        @else
                            <div class="company-address">Business Address Line 1</div>
                            <div class="company-address">Business Address Line 2</div>
                            <div class="company-address">City, State - PIN Code</div>
                        @endif
                        
                        @if($mobileToShow)
                            <div class="company-address">Mobile: {{ $mobileToShow }}</div>
                        @endif
                        
                        @if($company && $company->email)
                            <div class="company-address">Email: {{ $company->email }}</div>
                        @endif
                    </div>
                </td>
                <td>
                    <div class="logo-section">
                        @if($logo)
                            <img src="{{ public_path($logo) }}" alt="Company Logo" class="logo">
                        @else
                            <div class="logo-placeholder">Logo</div>
                        @endif
                    </div>
                </td>
            </tr>
        </table>
    </div>

    <!-- Estimate Title -->
    <div class="estimate-title">Estimate</div>

    <!-- Details Section -->
    <div class="details-section">
        <table class="details-table-layout">
            <tr>
                <td>
                    <div class="bill-to">
                        <div class="section-title">Bill To</div>
                        <div style="font-weight: bold; margin-bottom: 4px;">{{ $estimate->customer_name }}</div>
                        @foreach(explode("\n", $estimate->address) as $line)
                            <div>{{ trim($line) }}</div>
                        @endforeach
                        @if($estimate->phone_number)
                            <div style="margin-top: 8px;">{{ $estimate->phone_number }}</div>
                        @endif
                    </div>
                </td>
                <td>
                    <div class="estimate-details">
                        <table class="details-table">
                            <tr>
                                <td class="label">Estimate No</td>
                                <td class="colon">:</td>
                                <td style="font-weight: bold;">{{ $estimate->estimate_number }}</td>
                            </tr>
                            <tr>
                                <td class="label">Estimate Date</td>
                                <td class="colon">:</td>
                                <td>{{ date('M d, Y', strtotime($estimate->estimate_date)) }}</td>
                            </tr>
                            <tr>
                                <td class="label">Valid Upto</td>
                                <td class="colon">:</td>
                                <td>{{ $estimate->valid_upto ? date('M d, Y', strtotime($estimate->valid_upto)) : 'N/A' }}</td>
                            </tr>
                        </table>
                    </div>
                </td>
            </tr>
            @if($estimate->description)
            <tr>
                <td colspan="2" class="description-row">
                    <div class="description-title">Description</div>
                    <div class="description-content">{{ $estimate->description }}</div>
                </td>
            </tr>
            @endif
        </table>
    </div>

    <!-- Items Table -->
    <table class="items-table">
        <thead>
            <tr>
                <th style="width: 8%;">Sl.</th>
                <th style="width: 52%;">Description</th>
                <th style="width: 12%; text-align: center;">Qty</th>
                <th style="width: 14%; text-align: right;">Rate</th>
                <th style="width: 14%; text-align: right;">Amount</th>
            </tr>
        </thead>
        <tbody>
            @foreach($estimate->items as $index => $item)
            <tr>
                <td class="text-center">{{ $index + 1 }}</td>
                <td>{{ $item->product->name ?? 'Product' }}</td>
                <td class="text-center">{{ $item->quantity }}</td>
                <td class="text-right">&#8377; {{ number_format($item->price, 2) }}</td>
                <td class="text-right">&#8377; {{ number_format($item->total_price, 2) }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>

    <!-- Totals Section -->
    <div class="totals-section">
                
        <div class="totals">
            <table class="totals-table">
                @php
                    // Calculate amounts without GST
                    $itemsTotal = $estimate->items->sum('total_price');
                    $gstAmount = $estimate->gst ?? 0;
                    $grandTotal = $itemsTotal + $gstAmount;
                @endphp
                <tr>
                    <td class="label">Subtotal</td>
                    <td class="amount">&#8377; {{ number_format($itemsTotal, 2) }}</td>
                </tr>
                @if($gstAmount > 0)
                <tr>
                    <td class="label">GST (18%)</td>
                    <td class="amount">&#8377; {{ number_format($gstAmount, 2) }}</td>
                </tr>
                @endif
                <tr class="total-row">
                    <td class="label">Grand Total</td>
                    <td class="amount">&#8377; {{ number_format($grandTotal, 2) }}</td>
                </tr>

                <tr style="border-bottom: 2px solid #2563eb;">
                    <td class="label">Amount Payable</td>
                    <td class="amount" style="font-size:16px !important;">&#8377; {{ number_format($grandTotal, 2) }}</td>
                </tr>
            </table>
        </div>
    </div>

    <!-- Signature Section -->
    <div class="signature-section">
        <table class="signature-table">
            <tr>
                <td>
                    <div class="thank-you-section">
                        <div class="thank-you-text">Thank You</div>
                        <div class="current-date">Date:&nbsp;{{ date('M d, Y') }}</div>
                    </div>
                </td>
                <td>
                    <div class="authorized-section">
                        <div class="signature-line"></div>
                        <div class="authorized-text">Authorized Signatory</div>
                    </div>
                </td>
            </tr>
        </table>
    </div>
</body>
</html>