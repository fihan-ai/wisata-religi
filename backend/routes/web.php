<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\File;

Route::get('/', function () {
    return view('welcome');
});

Route::get('/dashboard', function () {
    return view('dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

Route::get('/{any}', function () {
    // dev: use sibling Frontend
    $frontendPath = realpath(__DIR__ . '/../../Frontend/index.html');
    
    if (!$frontendPath || !File::exists($frontendPath)) {
        abort(404, "Frontend index.html not found at: {$frontendPath}");
    }

    return File::get($frontendPath);
})->where('any', '^(?!api|sanctum|_ignition|telescope).*$');
require __DIR__.'/auth.php';
