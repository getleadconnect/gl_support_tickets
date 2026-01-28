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
        Schema::table('company', function (Blueprint $table) {
            $table->string('gstin', 20)->nullable()->after('address');
            $table->string('phone', 20)->nullable()->after('gstin');
            $table->string('email', 100)->nullable()->after('phone');
            $table->string('bank_name', 100)->nullable()->after('logo');
            $table->string('account_number', 30)->nullable()->after('bank_name');
            $table->string('ifsc_code', 15)->nullable()->after('account_number');
            $table->string('bank_branch', 100)->nullable()->after('ifsc_code');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('company', function (Blueprint $table) {
            $table->dropColumn(['gstin', 'phone', 'email', 'bank_name', 'account_number', 'ifsc_code', 'bank_branch']);
        });
    }
};
