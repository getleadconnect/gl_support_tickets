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
        Schema::create('message_settings', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->string('whatsapp_api')->nullable();
            $table->string('api_token')->nullable();
            $table->string('vendor_name')->nullable();
            $table->string('phone_number_id', 100)->nullable();
            $table->boolean('status')->default(true)->index();
            $table->unsignedBigInteger('created_by')->nullable()->index('message_settings_created_by_foreign');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('message_settings');
    }
};
