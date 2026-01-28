<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Invoice {{ $invoice->invoice_id }}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: 'DejaVu Sans', Arial, sans-serif;
            font-size: 13px;
            line-height: 1.7;
            color: #333;
            padding: 50px;
        }
        .container {
            width: 100%;
            padding: 0;
        }
        .header {
            width: 100%;
            margin-bottom: 15px;
            display: table;
        }
        .header-left {
            display: table-cell;
            width: 50%;
            vertical-align: top;
        }
        .header-right {
            display: table-cell;
            width: 50%;
            text-align: right;
            vertical-align: top;
            padding-top: 5px;
        }
        .logo {
            width: 80px;
            height: auto;
            margin-bottom: 10px;
        }
        .company-name {
            font-weight: bold;
            color: #f39c12;
            font-size: 16px;
            margin-bottom: 5px;
        }
        .company-details {
            font-size: 11px;
            line-height: 1.4;
            color: #666;
        }
        .invoice-title {
            font-size: 16px;
            font-weight: bold;
            color: #333;
            margin-bottom: 8px;
        }
        .invoice-details {
            font-size: 11px;
            line-height: 1.6;
        }
        .customer-section {
            margin: 20px 0;
            background: #f8f9fa;
            padding: 15px;
            border: 1px solid #e9ecef;
        }
        .customer-title {
            font-weight: bold;
            font-size: 12px;
            color: #333;
            margin-bottom: 8px;
            border-bottom: 1px solid #ddd;
            padding-bottom: 3px;
        }
        .customer-details {
            display: table;
            width: 100%;
        }
        .customer-left, .customer-right {
            display: table-cell;
            width: 50%;
            vertical-align: top;
            font-size: 11px;
            line-height: 1.6;
        }
        .dues-section {
            margin: 20px 0;
        }
        .section-title {
            font-weight: bold;
            font-size: 12px;
            color: #333;
            margin-bottom: 10px;
            border-bottom: 1px solid #ddd;
            padding-bottom: 3px;
        }
        .dues-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 15px;
            font-size: 11px;
        }
        .dues-table th,
        .dues-table td {
            padding: 8px;
            text-align: left;
            border: 1px solid #ddd;
        }
        .dues-table th {
            background-color: #f1f1f1;
            font-weight: bold;
            font-size: 10px;
            text-transform: uppercase;
        }
        .dues-table tbody tr:nth-child(even) {
            background-color: #f9f9f9;
        }
        .amount {
            text-align: right;
            font-weight: bold;
        }
        .total-row {
            background-color: #fff3cd !important;
            font-weight: bold;
        }
        .total-section {
            width: 50%;
            margin-left: auto;
            margin-top: 15px;
        }
        .total-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 12px;
        }
        .total-table td {
            padding: 5px 10px;
            border: 1px solid #ddd;
        }
        .total-table .label {
            background-color: #f8f9fa;
            font-weight: bold;
            text-align: right;
        }
        .total-table .amount {
            text-align: right;
            font-weight: bold;
        }
        .total-table .grand-total {
            background-color: #d4edda;
            font-weight: bold;
            font-size: 14px;
        }
        .amount-words {
            margin: 20px 0;
            font-style: italic;
            font-size: 11px;
            background: #f8f9fa;
            padding: 10px;
            border-left: 4px solid #007bff;
        }
        .footer {
            margin-top: 30px;
            display: table;
            width: 100%;
        }
        .footer-left {
            display: table-cell;
            width: 50%;
            vertical-align: bottom;
        }
        .footer-right {
            display: table-cell;
            width: 50%;
            text-align: right;
            vertical-align: bottom;
        }
        .signature {
            font-size: 11px;
            text-align: center;
        }
        .date {
            font-size: 11px;
            color: #666;
        }
        .currency {
            font-weight: normal;
            font-family: 'DejaVu Sans', Arial, sans-serif;
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            <div class="header-left">
                @if($company && $company->logo)
                    <img src="{{ public_path($company->logo) }}" alt="{{ $company->name ?? 'Company Logo' }}" class="logo">
                @else
                    <div class="company-name">matrix</div>
                @endif
                <div class="company-details">
                    <strong>{{ $company->name ?? 'MATRIX IT WORLD' }}</strong><br>
                    @if($company && $company->address)
                        {{ $company->address }}<br>
                    @endif
                    @if($company && $company->phone)
                        Phone: {{ $company->phone }}<br>
                    @endif
                    @if($company && $company->email)
                        Email: {{ $company->email }}
                    @endif
                </div>
            </div>
            <div class="header-right">
                <div class="invoice-title">Invoice/Bill for purchase</div>
                <div class="invoice-details">
                    <strong>Invoice Number:</strong> {{ $invoice->invoice_id }}<br>
                    <strong>Invoice Date:</strong> {{ \Carbon\Carbon::parse($invoice->invoice_date)->format('d-m-Y') }}
                </div>
            </div>
        </div>

        <!-- Customer Details -->
        <div class="customer-section">
            <div class="customer-title">Customer Details:</div>
            <div class="customer-details">
                <div class="customer-left">
                    <strong>Name:</strong> {{ $invoice->customer->name ?? 'N/A' }}<br>
                    <strong>Email:</strong> {{ $invoice->customer->email ?? 'N/A' }}<br>
                    <strong>Contact:</strong> {{ ($invoice->customer->country_code ?? '') . ' ' . ($invoice->customer->mobile ?? 'N/A') }}<br>
                </div>
                <div class="customer-right">
                    <strong>Company Name:</strong> {{ $invoice->customer->company_name ?? 'N/A' }}<br>
                    <strong>Branch:</strong> {{ $invoice->branch->branch_name ?? 'N/A' }}
                </div>
            </div>
        </div>

        <!-- Payment Dues Details -->
        <div class="dues-section">
            <div class="section-title">Payment Dues Details:</div>
            <table class="dues-table">
                <thead>
                    <tr>
                        <th style="width: 8%">#</th>
                        <th style="width: 30%">Ticket</th>
                        <th style="width: 25%">Details</th>
                        <th style="width: 20%">Description</th>
                        <th style="width: 17%" class="amount">Amount</th>
                    </tr>
                </thead>
                <tbody>
                    @if($paymentDues && $paymentDues->count() > 0)
                        @foreach($paymentDues as $index => $due)
                            <tr>
                                <td>{{ $index + 1 }}</td>
                                <td>
                                    <strong>{{ $due->ticket->tracking_number ?? 'N/A' }}</strong><br>
                                    <small style="color: #666;">{{ Str::limit($due->ticket->issue ?? 'No description', 50) }}</small>
                                </td>
                                <td>
                                    <strong>Invoice:</strong> {{ $due->invoice->invoice_id ?? 'N/A' }}<br>
                                    <small style="color: #666;">{{ \Carbon\Carbon::parse($due->created_at)->format('d M Y') }}</small>
                                </td>
                                <td>DELL / LATITUDE E7470 / HDC0NG2</td>
                                <td class="amount">&#8377; {{ number_format($due->balance_due, 2) }}</td>
                            </tr>
                        @endforeach
                    @else
                        <tr>
                            <td>1</td>
                            <td>
                                <strong>{{ $invoice->ticket->tracking_number ?? 'Multiple Tickets' }}</strong><br>
                                <small style="color: #666;">Payment for pending dues</small>
                            </td>
                            <td>
                                <strong>Service Charge</strong><br>
                                <small style="color: #666;">{{ \Carbon\Carbon::parse($invoice->invoice_date)->format('d M Y') }}</small>
                            </td>
                            <td>Payment for multiple pending dues</td>
                            <td class="amount">&#8377; {{ number_format($totalAmount, 2) }}</td>
                        </tr>
                    @endif
                </tbody>
            </table>
        </div>

        <!-- Totals -->
        <div class="total-section">
            <table class="total-table">
                <tr>
                    <td class="label">Service Charge:</td>
                    <td class="amount">&#8377; {{ number_format($totalAmount, 2) }}</td>
                </tr>
                <tr>
                    <td class="label">Discount:</td>
                    <td class="amount">&#8377; {{ number_format($invoice->discount ?? 0, 2) }}</td>
                </tr>
                <tr class="grand-total">
                    <td class="label">Net Amount:</td>
                    <td class="amount">&#8377; {{ number_format($totalAmount, 2) }}</td>
                </tr>
            </table>
        </div>

        
        <!-- Footer -->
        <div class="footer">
            <div class="footer-left">
                <div class="date">Date: {{ \Carbon\Carbon::parse($invoice->invoice_date)->format('d-m-Y') }}</div>
            </div>
            <div class="footer-right">
                <div class="signature">
                    <strong>For {{ $company->name ?? 'MATRIX IT WORLD' }}:</strong><br><br><br>
                    <div style="border-top: 1px solid #333; width: 150px; margin: 0 auto;">Authorised Signature</div>
                </div>
            </div>
        </div>
    </div>
</body>
</html>