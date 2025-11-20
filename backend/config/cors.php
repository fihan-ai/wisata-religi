<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Laravel CORS Configuration
    |--------------------------------------------------------------------------
    |
    | Anda dapat menyesuaikan origins frontend, metode HTTP yang diizinkan, 
    | dan pengaturan header untuk memastikan React dapat mengakses API Laravel.
    |
    */

    'paths' => [
        'api/*',
        'sanctum/csrf-cookie', // jika memakai Sanctum atau session-based auth
    ],

    'allowed_methods' => ['*'],

    // FRONTEND YANG DIIZINKAN AKSES API
    'allowed_origins' => [
        'http://localhost:5173',   // React Vite dev
        'http://127.0.0.1:5173',
        'http://localhost:8000',   // (opsional — kalau Anda pakai port 3000)
        'http://127.0.0.1:8000',
        // Tambahkan domain produksi Anda di sini nanti
        // 'https://domain Anda.com',
    ],

'allowed_headers' => ['*'],
    // SET TRUE jika memakai cookie-based auth / Sanctum
    'supports_credentials' => true,
];
