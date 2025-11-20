<?php

namespace App\Http\Controllers;

use App\Models\Artikel;
use Illuminate\Http\Request;

class ArtikelController extends Controller
{
    public function index()
    {
        return response()->json(Artikel::all());
    }

    public function store(Request $request)
    {
        $request->validate([
            'judul' => 'required|string|max:255',
            'isi' => 'required',
            'tanggal_publish' => 'required|date',
            'gambar' => 'nullable|image|mimes:jpg,jpeg,png|max:2048'
        ]);

        $data = $request->all();

        //upload gambar
        if($request->hasFile('gambar')){
            $file = $request->file('gambar');
            $path = $file->store('artikel','public');
            $data['gambar']= $path;
        }

        $artikel = Artikel::create($data);
        return response()->json($artikel, 201);
    }

    public function show($id)
    {
        $artikel = Artikel::findOrFail($id);
        return response()->json($artikel);
    }

    public function update(Request $request, $id)
    {
        $artikel = Artikel::findOrFail($id);
        $artikel->update($request->all());
        return response()->json($artikel);
    }

    public function destroy($id)
    {
        Artikel::destroy($id);
        return response()->json(['message' => 'Artikel deleted successfully']);
    }
}
