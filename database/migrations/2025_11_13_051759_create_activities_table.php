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
        Schema::create('activities', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->string('type', 191);
            $table->string('note', 191);
            $table->string('title', 191)->nullable();
            $table->integer('status_id')->nullable();
            $table->integer('branch_id')->nullable();
            $table->integer('priority_id')->nullable();
            $table->string('agent_id', 191)->nullable();
            $table->integer('ticket_id')->nullable();
            $table->integer('log_id')->nullable();
            $table->integer('created_by');
            $table->text('description')->nullable();
            $table->timestamps();
            $table->integer('task_id')->nullable();
            $table->dateTime('schedule_date')->nullable();
            $table->string('log_file', 191)->nullable();
            $table->integer('log_file_type')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('activities');
    }
};
