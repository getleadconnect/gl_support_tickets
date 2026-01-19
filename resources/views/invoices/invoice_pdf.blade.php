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
            font-family: Arial, sans-serif;
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
        .logo-placeholder {
            width: 50px;
            height: 30px;
            border: 1px solid #ccc;
            display: inline-block;
            text-align: center;
            line-height: 30px;
            color: #666;
            font-size: 8px;
            margin-bottom: 3px;
        }
        .company-name {
            font-size: 12px;
            font-weight: bold;
            color: #333;
        }
        .invoice-title {
            font-size: 12px;
            font-weight: bold;
        }
        .order-info {
            margin-bottom: 10px;
        }
        .order-info div {
            margin-bottom: 2px;
        }
        .label {
            font-weight: bold;
            display: inline-block;
            width: 80px;
        }
        .customer-section {
            border: 1px solid #ccc;
            padding: 8px;
            margin-bottom: 10px;
            background-color: #f8f8f8;
        }
        .customer-title {
            font-weight: bold;
            margin-bottom: 5px;
            text-decoration: underline;
            font-size: 10px;
        }
        .customer-row {
            margin-bottom: 2px;
            font-size: 9px;
        }
        .customer-label {
            font-weight: bold;
            display: inline-block;
            width: 80px;
        }
        .section-title {
            font-weight: bold;
            margin: 10px 0 5px 0;
            font-size: 10px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 10px;
        }
        th, td {
            border: 1px solid #333;
            padding: 3px 5px;
            text-align: left;
            font-size: 9px;
        }
        th {
            background-color: #f0f0f0;
            font-weight: bold;
        }
        .text-right {
            text-align: right;
        }
        .text-center {
            text-align: center;
        }
        .service-charge-table {
            margin-bottom: 8px;
        }
        .service-charge-table td {
            font-weight: bold;
            padding: 4px 5px;
        }
        .totals-section {
            float: right;
            width: 150px;
            margin-top: 5px;
            clear: right;
        }
        .total-row {
            text-align: right;
            margin-bottom: 2px;
            font-size: 9px;
            font-weight: bold;
        }
        .net-amount {
            border-top: 1px solid #333;
            padding-top: 2px;
            margin-top: 3px;
        }
        .amount-words {
            clear: both;
            margin-top: 15px;
            font-style: italic;
            font-size: 9px;
        }
        .footer {
            margin-top: 20px;
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
            text-align: center;
            vertical-align: bottom;
        }
        .signature-line {
            border-top: 1px solid #333;
            margin-top: 20px;
            padding-top: 3px;
            width: 120px;
            margin-left: auto;
            margin-right: auto;
            font-size: 9px;
        }
        .page-break {
            page-break-inside: avoid;
        }
    </style>
</head>
<body>

@php
$logo=\App\Models\Company::pluck('logo')->first();
@endphp

    <div class="container">
        <!-- Header -->
        <div class="header">
            <div class="header-left">
                <div class="logo-placeholder">
                    @if($logo && extension_loaded('gd'))
                        <img src="{{$logo}}" style="margin-left:50px;width:100px !important;">
                    @else
                        <div style="margin-left:200px; padding: 20px; border: 1px solid #ccc; display: inline-block;">
                            <strong>LOGO</strong>
                        </div>
                    @endif
                </div>
                <div class="company-name" style="margin-top:10px;">{{ $company ? $company->company_name : 'GETLEAD ANALYTICS PVT.LTD' }}</div>
            </div>
            <div class="header-right">
                <div class="invoice-title">Invoice/Bill for purchase</div>
            </div>
        </div>

        <!-- Order Information -->
        <div class="order-info">
            <div ><span class="label"  style="width:300px;">Invoice Number: {{ $invoice->invoice_id }}</span></div>
            <div><span class="label" style="width:300px;">Invoice Date: {{ \Carbon\Carbon::parse($invoice->invoice_date)->format('d-m-Y') }}</span></div>
        </div>

        <!-- Customer Details -->
        <div class="customer-section">
            <div class="customer-title">Customer Details:</div>
            <div class="customer-row">
                <span class="customer-label">Name:</span> {{ $invoice->customer->name ?? 'N/A' }}
            </div>
            <div class="customer-row">
                <span class="customer-label">Email:</span> {{ $invoice->customer->email ?? 'N/A' }}
            </div>
            <div class="customer-row">
                <span class="customer-label">Contact:</span> {{ $invoice->customer->phone ?? $invoice->customer->mobile ?? 'N/A' }}
            </div>
            <div class="customer-row">
                <span class="customer-label">Company Name:</span> {{ $invoice->customer->company_name ?? '' }}
            </div>
        </div>

        <!-- Ticket Details -->
        <div class="section-title">Ticket Details</div>
        <table class="page-break">
            <thead>
                <tr>
                    <th width="20%">#</th>
                    <th width="80%">Details</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td><strong>Service Id</strong></td>
                    <td>{{ $invoice->invoice_id }}</td>
                </tr>
                <tr>
                    <td><strong>Issue</strong></td>
                    <td>{{ $invoice->ticket->issue ?? 'N/A' }}</td>
                </tr>
                <tr>
                    <td><strong>Description</strong></td>
                    <td>{{ $invoice->ticket->description ?? 'N/A' }}</td>
                </tr>
            </tbody>
        </table>

        <!-- Service Charge -->
        <table class="service-charge-table">
            <tr>
                <td width="70%"><strong>Service Charge</strong></td>
                <td width="30%" class="text-right"><strong>{{ number_format($invoice->service_charge, 0) }}</strong></td>
            </tr>
        </table>


        <!-- Totals -->
        <div class="totals-section">
            <div class="total-row">Service Charge: {{ number_format($invoice->service_charge, 3) }}</div>
            @if($discount > 0)
            <div class="total-row">Discount: {{ number_format($discount, 3) }}</div>
            @endif
            <div class="total-row net-amount">Net Amount: {{ number_format($netAmount, 3) }}</div>
        </div>

        <!-- Amount in Words -->
        <div class="amount-words">
            <strong>Rupees:</strong> {{ ucfirst($amountInWords) }}
        </div>

        <!-- Footer -->
        <div class="footer">
            <div class="footer-left">
                <div>Date: {{ \Carbon\Carbon::parse($invoice->invoice_date)->format('d-m-Y') }}</div>
            </div>
            <div class="footer-right">
                <div>For {{ $company ? $company->company_name : 'GETLEAD ANALYTICS PVT.LTD' }}:</div>
                <div class="signature-line">Authorized Signature</div>
            </div>
        </div>
    </div>
</body>
</html>