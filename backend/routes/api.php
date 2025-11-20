<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;
use App\Http\Controllers\KategoriController;
use App\Http\Controllers\DestinasiController;
use App\Http\Controllers\ArtikelController;


/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Semua route di file ini otomatis menggunakan prefix "/api".
| Jadi kalau kamu tulis Route::get('kategori'), alamat sebenarnya adalah:
| http://127.0.0.1:8000/api/kategori
|
*/

// API untuk tabel kategori
Route::apiResource('kategori', KategoriController::class);

// API untuk tabel destinasi
Route::apiResource('destinasi', DestinasiController::class);

// API untuk tabel artikel
Route::apiResource('artikel', ArtikelController::class);

Route::get('/', function (Request $request) {
    return response()->json([
        'status' => 'ok',
        'message' => 'API root — backend is up'
    ]);
});