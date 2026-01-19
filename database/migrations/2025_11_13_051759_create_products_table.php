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
        Schema::create('products', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->string('name', 191);
            $table->string('code', 191)->nullable();
            $table->integer('category_id')->nullable();
            $table->bigInteger('branch_id')->nullable();
            $table->integer('brand_id')->nullable();
            $table->integer('status')->default(0);
            $table->integer('stock')->default(0);
            $table->integer('initial_stock')->default(0);
            $table->double('cost')->default(0);
            $table->integer('created_by');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
