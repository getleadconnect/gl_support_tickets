<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('invoices', function (Blueprint $table) {
            $table->decimal('gst_rate', 5, 2)->default(0)->after('invoice_type')->comment('GST rate percentage');
            $table->decimal('taxable_amount', 10, 2)->default(0)->after('gst_rate')->comment('Total taxable amount before GST');
            $table->decimal('cgst_amount', 10, 2)->default(0)->after('taxable_amount')->comment('CGST amount');
            $table->decimal('sgst_amount', 10, 2)->default(0)->after('cgst_amount')->comment('SGST amount');
            $table->decimal('gst_amount', 10, 2)->default(0)->after('sgst_amount')->comment('Total GST amount (CGST + SGST)');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('invoices', function (Blueprint $table) {
            $table->dropColumn(['gst_rate', 'taxable_amount', 'cgst_amount', 'sgst_amount', 'gst_amount']);
        });
    }
};
