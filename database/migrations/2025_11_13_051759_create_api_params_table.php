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
        Schema::create('api_params', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->integer('api_id');
            $table->string('param', 191);
            $table->string('type', 191);
            $table->string('position', 191);
            $table->integer('required');
            $table->string('description', 191);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('api_params');
    }
};
