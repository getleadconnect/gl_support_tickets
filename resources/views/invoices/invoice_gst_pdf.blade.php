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
            font-family: DejaVu Sans, Arial, sans-serif;
            font-size: 12px;
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
            font-size: 13px;
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
            font-size: 13px;
            line-height: 1.6;
        }
        .invoice-details div {
            margin-bottom: 3px;
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
            font-size: 12px;
            margin-bottom: 5px;
            text-decoration: underline;
        }
        .customer-info {
            font-size: 13px;
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
            font-size: 12px;
            font-weight: bold;
        }
        table.items-table td {
            border: 1px solid #afafaf;
            padding: 5px 4px;
            font-size: 12px;
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
            padding: 10px 5px 10px 5px;
            vertical-align: top;
        }
        .amount-words {
            font-size: 12px;
            font-weight: bold;
            margin-bottom: 10px;
        }
        .bank-details {
            font-size: 12px;
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
            font-size: 12px;
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
            font-size: 12px;
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
            font-size: 12px;
            text-align: center;
            margin-left: auto;
        }
        .fs-13
        {
            font-size:13px !important;
            font-weight:600 !important;
        }

        .fs-12
        {
            font-size:12px !important;
        }
        .fs-15
        {
            font-size:15px !important;
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
    <div class="header" style="border-bottom:1px solid #afafaf;"> 
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
                    {{ $company ? $company->company_name : 'MATRIX IT WORLD' }}
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
                    {{ $company ? $company->company_name : 'MATRIX IT WORLD' }}
                </div>
                @endif
            @endif
        </div>

        <!-- Right Side: Invoice Details and Customer Info -->
        <div class="header-right">
            <div style="margin-top: 15px;text-align:right !important;"">
                <div class="section-heading">BILL TO:</div>
                <div class="customer-info" >
                    <div>{{ $invoice->customer->name ?? 'N/A' }}</div>
                    @if($invoice->customer->company_name)
                    <div>{{ $invoice->customer->company_name }}</div>
                    @endif
                    @if($invoice->customer->address)
                    <div>{{ $invoice->customer->address }}</div>
                    @endif
                    @if($invoice->customer->gstin)
                    <div>GSTIN: {{ $invoice->customer->gstin }}</div>
                    @endif
                    <div>Mob: {{ ($invoice->customer->country_code ?? '') }} {{ $invoice->customer->mobile ?? $invoice->customer->phone ?? 'N/A' }}</div>
                    @if($invoice->customer->email)
                    <div>Email: {{ $invoice->customer->email }}</div>
                    @endif
                </div>
            </div>
        </div>
    </div>

        <div class="invoice-details" style="margin-top:15px;">
                <table style="width:100%;border:none;">
                <tr><td>Invoice Date :&nbsp;&nbsp;{{ \Carbon\Carbon::parse($invoice->invoice_date)->format('d-m-Y') }}</td>    
                <td style="text-align:center;">Invoice No :&nbsp;{{ $invoice->invoice_id }}</td>
                @if($invoice->ticket && $invoice->ticket->tracking_number)
                    <td style="text-align:right;">Tracking No : &nbsp;&nbsp;{{ $invoice->ticket->tracking_number }}</td>
                @endif
                </tr>
                </table>
        </div>


    <!-- Items Table -->
    <table class="items-table" style="margin-top:15px;">
        <thead>

            <tr>
                <th colspan=6 style="font-size:18px;font-weight:600;text-align:left;">&nbsp;&nbsp;Parts Invoices</th>
            </tr>
            <tr>
                <th width="5%">S.No</th>
                <th width="40%">Description of Goods/Services</th>
                <th width="15%">HSN/SAC</th>
                <th width="14%">Rate</th>
                <th width="12%">Qty</th>
                <th width="14%">Total</th>
            </tr>
        </thead>
        <tbody>
            @php
            $srNo = 1;
            // Calculate spare parts totals
            $sparePartsTaxableTotal = 0;
            $sparePartsCgstTotal = 0;
            $sparePartsSgstTotal = 0;
            $sparePartsGstTotal = 0;
            $sparePartsGrandTotal = 0;

            if($spareParts && count($spareParts) > 0) {
                foreach($spareParts as $part) {
                    $sparePartsTaxableTotal += $part['taxable_amount'];
                    $sparePartsCgstTotal += $part['cgst_amount'];
                    $sparePartsSgstTotal += $part['sgst_amount'];
                    $sparePartsGstTotal +=  ($part['cgst_amount']+$part['sgst_amount']);
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
                        <small>Code: {{ $part['product_code'] }}</small>
                        @endif
                        @if($part['brand'])
                        <small>Brand: {{ $part['brand'] }}</small>
                        @endif
                    </td>
                    <td class="text-center">{{ $part['hsn_code'] ?? '-' }}</td>
                    <td class="text-right">{{ number_format($part['unit_price'], 2) }}</td>
                     <td class="text-center">{{ $part['quantity'] }}</td>
                    <td class="text-right">{{ number_format($part['unit_price'], 2) }}</td>
                </tr>
                @endforeach

                <!-- Spare Parts Total -->
                <tr class="total-row" style="background-color: #f9fafb;">
                    <td colspan="5" class="text-right"><strong>Spare Parts Total:</strong></td>
                    <td class="text-right"><strong>{{ number_format($sparePartsGrandTotal, 2) }}</strong></td>
                </tr>

                <!-- Spare Parts GST Total -->
                <tr style="background-color: #ffffff;">
                    <td colspan="5" class="text-right"><strong>Parts GST Total :</strong></td>
                    <td class="text-right"><strong>{{ number_format($sparePartsGstTotal, 2) }}</strong></td>
                </tr>

            @endif

            <!-- Service Charge Section -->
            @if($serviceCharge > 0)

            <tr>
                <td colspan=6 style="font-size:18px;font-weight:600;">&nbsp;&nbsp;Labour / Services Invoices</th>
            </tr>

            <tr>
                <td class="text-center">{{ $srNo++ }}</td>
                <td><strong>Labour / Service Charge</strong></td>
                <td class="text-center">{{ $serviceHsnCode ?? '998314' }}</td>
                <td class="text-center">1</td>
                <td class="text-right">{{ number_format($serviceTaxableAmount, 2) }}</td>
                <td class="text-right">{{ number_format($serviceTaxableAmount, 2) }}</td>
            </tr>

            <!-- Service GST Total -->
            <tr style="background-color: #ffffff;">
                <td colspan="5" class="text-right"><strong>Service GST Total:</strong></td>
                <td class="text-right"><strong>{{ number_format($serviceGstAmount, 2) }}</strong></td>
            </tr>
            @endif

            <!-- Overall Totals Row -->
            <tr class="total-row" style="background-color: #e5e7eb;">
                <td colspan="5" class="text-right"><strong>Total:</strong></td>
                <td class="text-right"><strong>{{ number_format($totalAmount, 2) }}</strong></td>
            </tr>

            <tr class="grand-total">
                <td colspan="5" class="text-right"><strong>GST TOTAL:</strong></td>
                <td class="text-right"><strong>&#x20B9; {{ number_format($serviceGstAmount + $sparePartsGstTotal, 2) }}</strong></td>
            </tr>
            <tr class="grand-total">
                <td colspan="5" class="text-right"><strong>GRAND TOTAL:</strong></td>
                <td class="text-right"><strong>&#x20B9; {{ number_format($netAmount+$discount, 2) }}</strong></td>
            </tr>
        </tbody>
    </table>

    <!-- Tax Summary and Bank Details -->
    <div class="tax-summary">
        <div class="tax-summary-left">
            <div class="amount-words">
                Amount in Words: <br><p>{{ ucfirst($amountInWords) }} Only </p>
            </div>

            <!--<div class="bank-details">
                <div class="terms-title">Bank Details:</div>
                <div><strong>Bank Name:</strong> {{ $company->bank_name ?? 'N/A' }}</div>
                <div><strong>Account No:</strong> {{ $company->account_number ?? 'N/A' }}</div>
                <div><strong>IFSC Code:</strong> {{ $company->ifsc_code ?? 'N/A' }}</div>
                <div><strong>Branch:</strong> {{ $company->bank_branch ?? 'N/A' }}</div>
            </div>-->
        </div>


        <div class="tax-summary-right">
            <table style="width:100%;">
                <tr>
                    <td >Taxable Amount:</td>
                    <td class="text-right fs-13">{{ number_format($totalTaxableAmount, 2) }}</td>
                </tr>
                <tr>
                    <td class="fs-12">CGST@ {{ number_format($cgstRate, 2) }}% On Part Value of {{ number_format($sparePartsGrandTotal, 2) }}</td>
                    <td class="text-right fs-13" style="width:100px;">{{ number_format($sparePartsCgstTotal,2) }}</td>
                </tr>
                <tr>
                    <td class="fs-12">SGST/UGST@ {{ number_format($sgstRate, 2) }}% ON Part Value of {{ number_format($sparePartsGrandTotal, 2) }}</td>
                    <td class="text-right fs-13">{{ number_format($sparePartsSgstTotal, 2) }}</td>
                </tr>

                <tr>
                    <td class="fs-12">CGST/SGST ON Labour Charge of {{ number_format($serviceTaxableAmount, 2) }}</td>
                    <td class="text-right fs-13">{{ number_format($serviceGstAmount, 2) }}</td>
                </tr>
                 <tr class="grand-total">
                    <td colspan=2 ><hr style="width:100px;float:right;height:0px;"></td>
                </tr>
                <tr>
                    <td class="fs-12">Total Amount</td>
                    <td class="text-right fs-13">{{ number_format($netAmount+$discount, 2) }}</td>
                </tr>

                @if($discount > 0)
                <tr>
                    <td>Discount:</td>
                    <td class="text-right fs-13">{{ number_format($discount, 2) }}</td>
                </tr>
                @endif
                <tr class="grand-total">
                    <td colspan=2 ><hr style="width:100px;float:right;height:0px;"></td>
                </tr>
                <tr class="grand-total">
                    <td class="fs-15" colspan=2><strong>Net Amount:</strong>
                    <span class="text-right fs-15" style="float:right !important;"><strong>&#x20B9; {{ number_format($netAmount, 2) }}</strong><span></td>
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
            <div style="font-size: 13px;">
                <strong>Customer Signature</strong>
            </div>
        </div>
        <div class="signature-right">
            <div style="font-size: 13px; margin-bottom: 5px;">
                <strong>For {{ $company ? $company->company_name : 'Matrix It World' }}</strong>
            </div>
            <div class="signature-line">
                Authorized Signatory
            </div>
        </div>
    </div>
</div>

</body>
</html>
