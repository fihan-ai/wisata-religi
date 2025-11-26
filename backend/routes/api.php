<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;
use App\Http\Controllers\KategoriController;
use App\Http\Controllers\DestinasiController;
use App\Http\Controllers\ArtikelController;
use App\Http\Controllers\BannerController;
use App\Http\Controllers\AuthController;

/** AUTH ADMIN */
Route::post('/auth/login', [AuthController::class, 'login']);

/** ROUTE PUBLIK (bisa diakses tanpa login) */
Route::apiResource('kategori', KategoriController::class)->only(['index', 'show']);
Route::apiResource('destinasi', DestinasiController::class)->only(['index', 'show']);
Route::apiResource('artikel',   ArtikelController::class)->only(['index', 'show']);
Route::apiResource('banner',    BannerController::class)->only(['index', 'show']);

/** ROUTE ADMIN (butuh token admin) */
Route::middleware(['auth:sanctum', 'is_admin'])->group(function () {
    Route::post('/auth/logout', [AuthController::class, 'logout']);

    Route::apiResource('kategori', KategoriController::class)->except(['index', 'show']);
    Route::apiResource('destinasi', DestinasiController::class)->except(['index', 'show']);
    Route::apiResource('artikel',   ArtikelController::class)->except(['index', 'show']);
    Route::apiResource('banner',    BannerController::class)->except(['index', 'show']);
});

/** TEST ROOT API */
Route::get('/', function (Request $request) {
    return response()->json([
        'status'  => 'ok',
        'message' => 'API root — backend is up',
    ]);
});
