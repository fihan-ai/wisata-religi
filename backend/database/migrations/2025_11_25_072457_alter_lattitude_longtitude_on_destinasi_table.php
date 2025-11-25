<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('destinasi', function (Blueprint $table) {
            $table->decimal('lattitude', 10, 8)->nullable()->change();
            $table->decimal('longitude', 11, 8)->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('destinasi', function (Blueprint $table) {
            $table->decimal('lattitude', 50, 0)->nullable()->change();
            $table->decimal('longitude', 50, 0)->nullable()->change();
        });
    }
};