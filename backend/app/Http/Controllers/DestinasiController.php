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
    // accept either file upload or string (base64/URL). Do not require "string"
    $validated = $request->validate([
        'id_kategori'    => 'nullable|integer|exists:kategori,id_kategori',
        'nama_destinasi' => 'nullable|string|max:100',
        'deskripsi'      => 'nullable|string',
        'alamat'         => 'nullable|string',
        'kota'           => 'nullable|string|max:50',
        'lattitude'      => 'nullable|numeric',
        'longitude'      => 'nullable|numeric',
        'foto'           => 'nullable' // allow file OR string, validate later in code
    ]);

    $data = collect($validated)->only([
        'id_kategori','nama_destinasi','deskripsi','alamat','kota','lattitude','longitude'
    ])->toArray();

    // Handle foto: prefer real uploaded file, else accept base64 or URL string
    if ($request->hasFile('foto')) {
        $data['foto'] = $request->file('foto')->store('destinasi', 'public');
    } elseif ($request->filled('foto')) {
        $foto = $request->input('foto');
        if (is_string($foto) && strpos($foto, 'data:') === 0) {
            // decode base64
            $parts = explode(',', $foto);
            if (count($parts) === 2 && ($decoded = base64_decode($parts[1], true)) !== false) {
                $filename = 'destinasi/' . uniqid() . '.png';
                \Storage::disk('public')->put($filename, $decoded);
                $data['foto'] = $filename;
            } else {
                return response()->json(['message' => 'Invalid base64 foto'], 422);
            }
        } else {
            // treat as URL or existing path string
            $data['foto'] = $foto;
        }
    }

    $dest = Destinasi::create($data);
    return response()->json($dest, 201);
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
            'id_kategori'    => 'nullable|integer|exists:kategori,id_kategori',
            'nama_destinasi' => 'nullable|string|max:100',
            'deskripsi'      => 'nullable|string',
            'alamat'         => 'nullable|string|max:100',
            'kota'           => 'nullable|string|max:50',
            'lattitude'      => 'nullable|numeric',
            'longitude'      => 'nullable|numeric',
            'foto'           => 'nullable'
        ]);

        $data = collect($validated)->only([
            'id_kategori','nama_destinasi','deskripsi','alamat','kota','lattitude','longitude'
        ])->toArray();

        if ($request->hasFile('foto')) {
            if ($dest->foto && \Storage::disk('public')->exists($dest->foto)) {
                \Storage::disk('public')->delete($dest->foto);
            }
            $data['foto'] = $request->file('foto')->store('destinasi', 'public');
        } elseif ($request->filled('foto')) {
            $foto = $request->input('foto');
            if (is_string($foto) && strpos($foto, 'data:') === 0) {
                $parts = explode(',', $foto);
                if (count($parts) === 2 && ($decoded = base64_decode($parts[1], true)) !== false) {
                    if ($dest->foto && \Storage::disk('public')->exists($dest->foto)) {
                        \Storage::disk('public')->delete($dest->foto);
                    }
                    $filename = 'destinasi/' . uniqid() . '.png';
                    \Storage::disk('public')->put($filename, $decoded);
                    $data['foto'] = $filename;
                } else {
                    return response()->json(['message' => 'Invalid base64 foto'], 422);
                }
            } else {
                // keep URL or path string
                $data['foto'] = $foto;
            }
        }

        $dest->update($data);
        return response()->json($dest, 200);
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
