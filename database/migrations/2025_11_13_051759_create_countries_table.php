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
        Schema::create('countries', function (Blueprint $table) {
            $table->unsignedInteger('id');
            $table->string('name', 191)->nullable();
            $table->string('country_code', 191)->nullable();
            $table->integer('tax')->nullable();
            $table->string('code', 191)->nullable();
            $table->string('currency', 191)->nullable();
            $table->string('currency_code', 191)->nullable();
            $table->string('flags', 191)->nullable();
            $table->softDeletes();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('countries');
    }
};
