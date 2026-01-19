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
        Schema::create('logs', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedBigInteger('agent_id')->index('logs_agent_id_foreign');
            $table->unsignedBigInteger('ticket_id')->index('logs_ticket_id_foreign');
            $table->integer('type_id');
            $table->integer('outcome_id')->nullable();
            $table->dateTime('time')->nullable();
            $table->string('description', 191);
            $table->timestamps();
            $table->string('log', 191)->nullable();
            $table->string('file_type', 191)->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('logs');
    }
};
