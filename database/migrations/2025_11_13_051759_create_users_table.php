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
        Schema::create('users', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->string('name', 191);
            $table->string('country_code', 191)->nullable();
            $table->string('mobile', 50)->nullable();
            $table->string('email', 191)->nullable();
            $table->string('password', 191)->nullable();
            $table->integer('role_id')->nullable();
            $table->integer('department_id')->nullable();
            $table->bigInteger('branch_id')->nullable();
            $table->integer('status')->default(1);
            $table->timestamps();
            $table->integer('parent_id')->nullable();
            $table->string('firebase_id', 191)->nullable();
            $table->string('image', 191)->nullable();
            $table->integer('designation_id')->nullable();
            $table->dateTime('password_validity')->nullable();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};
