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
        Schema::create('ticket_log_notes', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedBigInteger('agent_id')->index('log_notes_agent_id_foreign');
            $table->unsignedBigInteger('ticket_id')->index('log_notes_ticket_id_foreign');
            $table->integer('type_id');
            $table->integer('outcome_id')->nullable();
            $table->dateTime('time')->nullable();
            $table->mediumText('description');
            $table->timestamps();
            $table->mediumText('log')->nullable();
            $table->string('file_type', 191)->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ticket_log_notes');
    }
};
