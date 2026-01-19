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
        Schema::create('payments', function (Blueprint $table) {
            $table->integer('id', true);
            $table->bigInteger('invoice_id');
            $table->bigInteger('ticket_id');
            $table->bigInteger('branch_id')->nullable();
            $table->integer('customer_id');
            $table->integer('service_charge')->nullable();
            $table->integer('item_amount')->nullable();
            $table->integer('total_amount')->nullable();
            $table->integer('discount')->nullable()->default(0);
            $table->integer('net_amount')->nullable();
            $table->string('payment_mode', 20)->nullable();
            $table->integer('created_by')->nullable();
            $table->dateTime('created_at')->useCurrent();
            $table->dateTime('updated_at')->useCurrent();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
