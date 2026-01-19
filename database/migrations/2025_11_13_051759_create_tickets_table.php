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
        Schema::create('tickets', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->string('issue', 191);
            $table->text('description');
            $table->unsignedBigInteger('customer_id')->index('tickets_customer_id_foreign');
            $table->integer('priority');
            $table->integer('status')->nullable();
            $table->string('ticket_type', 50)->nullable();
            $table->integer('ticket_label')->nullable();
            $table->json('notify_to')->nullable();
            $table->integer('branch_id')->nullable();
            $table->string('tracking_number', 50)->nullable();
            $table->dateTime('due_date');
            $table->softDeletes();
            $table->timestamp('created_at')->nullable()->useCurrent();
            $table->timestamp('updated_at')->nullable()->useCurrent();
            $table->integer('created_by')->nullable();
            $table->string('slug', 191)->nullable();
            $table->string('service_id', 191)->nullable();
            $table->enum('service_type', ['Shop', 'Outsource']);
            $table->time('closed_time')->nullable();
            $table->integer('closed_by')->nullable();
            $table->dateTime('closed_at')->nullable();
            $table->timestamp('verified_at')->nullable();
            $table->text('remarks')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tickets');
    }
};
