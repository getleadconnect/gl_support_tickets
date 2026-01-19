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
        Schema::create('tasks', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->string('task_name', 191);
            $table->unsignedBigInteger('user_id')->index('tasks_user_id_foreign');
            $table->unsignedBigInteger('ticket_id')->nullable()->index('tasks_ticket_id_foreign');
            $table->integer('type_id')->nullable();
            $table->bigInteger('branch_id')->nullable();
            $table->dateTime('time');
            $table->text('description')->nullable();
            $table->timestamp('created_at')->nullable()->useCurrent();
            $table->timestamp('updated_at')->nullable()->useCurrent();
            $table->unsignedBigInteger('category_id')->nullable();
            $table->tinyInteger('status')->nullable()->default(1);
            $table->dateTime('closed_time')->nullable();
            $table->integer('closed_by')->nullable();
            $table->text('closing_comment')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tasks');
    }
};
