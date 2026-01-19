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
        Schema::create('product_tickets', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->enum('source_type', ['Shop', 'Outsource'])->nullable();
            $table->integer('product_id');
            $table->integer('ticket_id');
            $table->double('price');
            $table->integer('quantity');
            $table->double('total_price');
            $table->timestamps();
            $table->integer('created_by');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('product_tickets');
    }
};
