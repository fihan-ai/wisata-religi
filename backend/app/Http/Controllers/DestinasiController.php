<?php

namespace App\Http\Controllers;

use App\Models\Destinasi;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class DestinasiController extends Controller
{
    public function index()
    {
        return response()->json(Destinasi::with('kategori')->get());
    }

    public function store(Request $request)
{
    // 1) Validasi (tetap seperti semula)
    $validated = $request->validate([
        'id_kategori' => 'required|exists:kategori,id_kategori',
        'nama_destinasi' => 'required|string|max:100',
        'deskripsi' => 'required|string|max:100',
        'alamat' => 'required|string|max:100',
        'kota' => 'required|string|max:50',
        'lattitude' => 'required|numeric',
        'longitude' => 'required|numeric',
        'foto' => 'nullable|image|mimes:jpg,jpeg,png|max:2048'
    ]);

    // 2) Ambil hanya field yang kita mau (hindari all())
    $data = collect($validated)->only([
        'id_kategori','nama_destinasi','deskripsi','alamat','kota','lattitude','longitude'
    ])->toArray();

    // 3) Upload foto (jika ada)
    if ($request->hasFile('foto')) {
        try {
            $data['foto'] = $request->file('foto')->store('destinasi', 'public');
        } catch (\Exception $e) {
            Log::error('Debug upload error: '.$e->getMessage());
            return response()->json(['ok'=>false,'step'=>'upload','error'=>$e->getMessage()], 500);
        }
    }

    // 4) Aktifkan query log sebelum create
    DB::enableQueryLog();

    try {
        $dest = \App\Models\Destinasi::create($data);
    } catch (\Exception $e) {
        // kalau terjadi error, log dan kembalikan detail
        Log::error('Debug create error: '.$e->getMessage());
        return response()->json([
            'ok' => false,
            'step' => 'create',
            'error' => $e->getMessage(),
            'data_sent' => $data
        ], 500);
    }

    // 5) Ambil query yang dijalankan dan info DB
    $queries = DB::getQueryLog();
    $dbName = DB::connection()->getDatabaseName();

    // 6) Informasi lengkap kembali ke client (sementara)
    return response()->json([
        'ok' => true,
        'saved' => (bool) ($dest && $dest->exists),
        'model' => $dest ? $dest->toArray() : null,
        'queries' => $queries,
        'database' => $dbName,
        'data_sent' => $data
    ], 200);
}

    public function show($id)
    {
        $destinasi = Destinasi::with('kategori')->findOrFail($id);
        return response()->json($destinasi);
    }

    public function update(Request $request, $id)
{
    $dest = Destinasi::findOrFail($id);

    $validated = $request->validate([
        'id_kategori'    => 'sometimes|exists:kategori,id_kategori',
        'nama_destinasi' => 'sometimes|string|max:100',
        'deskripsi'      => 'sometimes|string|max:100',
        'alamat'         => 'sometimes|string|max:100',
        'kota'           => 'sometimes|string|max:50',
        'lattitude'      => 'sometimes|numeric',
        'longitude'      => 'sometimes|numeric',
        'foto'           => 'nullable|image|mimes:jpg,jpeg,png|max:2048'
    ]);

    $data = collect($validated)->only([
        'id_kategori','nama_destinasi','deskripsi','alamat','kota','lattitude','longitude'
    ])->toArray();

    if ($request->hasFile('foto')) {
        // opsional: hapus file lama jika ada
        if ($dest->foto && \Storage::disk('public')->exists($dest->foto)) {
            \Storage::disk('public')->delete($dest->foto);
        }
        $data['foto'] = $request->file('foto')->store('destinasi', 'public');
    }

    try {
        $dest->update($data);
        return response()->json($dest, 200);
    } catch (\Exception $e) {
        \Log::error('Update destinasi error: '.$e->getMessage());
        return response()->json(['message'=>'Gagal update'], 500);
    }
}

    public function destroy($id)
{
    $dest = Destinasi::findOrFail($id);

    try {
        // jika pakai file: hapus gambar di storage
        if ($dest->foto && \Storage::disk('public')->exists($dest->foto)) {
            \Storage::disk('public')->delete($dest->foto);
        }
        $dest->delete(); // ini menghapus baris, kalau pakai SoftDeletes akan soft-delete
        return response()->json(['message'=>'Destinasi deleted successfully'], 200);
    } catch (\Exception $e) {
        \Log::error('Delete destinasi error: '.$e->getMessage());
        return response()->json(['message'=>'Gagal delete'], 500);
    }
}
}
