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
        Schema::create('invoices', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->string('invoice_id', 191)->nullable();
            $table->integer('ticket_id');
            $table->integer('customer_id');
            $table->bigInteger('branch_id')->nullable();
            $table->dateTime('invoice_date');
            $table->string('payment_method', 20);
            $table->string('status', 20)->default('pending');
            $table->double('service_charge');
            $table->enum('service_type', ['Shop', 'Outsource']);
            $table->text('description')->nullable();
            $table->double('item_cost')->default(0);
            $table->double('total_amount')->default(0);
            $table->decimal('discount', 10)->default(0);
            $table->decimal('net_amount', 10)->default(0);
            $table->integer('created_by');
            $table->timestamps();
            $table->string('pdf_file_name', 191)->nullable();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('invoices');
    }
};
