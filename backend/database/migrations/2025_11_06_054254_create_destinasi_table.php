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
        Schema::create('destinasi', function (Blueprint $table) {
    $table->id('id_destinasi');
    $table->unsignedBigInteger('id_kategori');
    $table->string('nama_destinasi', 100);
    $table->string('deskripsi', 100);
    $table->string('alamat', 100);
    $table->string('kota', 50);
    $table->decimal('lattitude', 50, 0);
    $table->decimal('longitude', 50, 0);
    $table->string('foto', 255);
    $table->timestamps();

    $table ->foreign('id_kategori')->references('id_kategori')->on('kategori')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('destinasis');
    }
};
