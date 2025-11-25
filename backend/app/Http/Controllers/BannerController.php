<?php

namespace App\Http\Controllers;

use App\Models\Banner;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class BannerController extends Controller
{
    public function index()
    {
        $banners = Banner::all()->map(function ($banner) {
            // If foto exists and is not already a full URL, convert to full URL
            if ($banner->foto && !filter_var($banner->foto, FILTER_VALIDATE_URL)) {
                // Use url() helper to get absolute URL from storage path
                $banner->foto = url(Storage::url($banner->foto));
            }
            return $banner;
        });
        
        return response()->json($banners, 200);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'foto' => 'nullable',
            'title' => 'nullable|string|max:255',
            'description' => 'nullable|string'
        ]);

        $data = [];
        
        // Add title if provided
        if ($request->filled('title')) {
            $data['title'] = $request->input('title');
        }
        
        // Add description if provided
        if ($request->filled('description')) {
            $data['description'] = $request->input('description');
        }

        // Handle foto: file upload OR string (base64/URL)
        if ($request->hasFile('foto')) {
            $data['foto'] = $request->file('foto')->store('banner', 'public');
        } elseif ($request->filled('foto')) {
            $foto = $request->input('foto');
            
            if (is_string($foto) && strpos($foto, 'data:') === 0) {
                try {
                    $parts = explode(',', $foto);
                    if (count($parts) === 2 && ($decoded = base64_decode($parts[1], true)) !== false) {
                        $filename = 'banner/' . uniqid() . '.png';
                        \Storage::disk('public')->put($filename, $decoded);
                        $data['foto'] = $filename;
                    }
                } catch (\Exception $e) {
                    \Log::error('Base64 decode error: ' . $e->getMessage());
                    return response()->json(['message' => 'Invalid foto data'], 422);
                }
            } elseif (filter_var($foto, FILTER_VALIDATE_URL)) {
                $data['foto'] = $foto;
            }
        }

        $banner = Banner::create($data);
        
        // Convert foto to full URL if it's a storage path
        if ($banner->foto && !filter_var($banner->foto, FILTER_VALIDATE_URL)) {
            $banner->foto = url(Storage::url($banner->foto));
        }
        
        return response()->json($banner, 201);
    }

    public function show($id)
    {
        $banner = Banner::findOrFail($id);
        
        // Convert foto to full URL if it's a storage path
        if ($banner->foto && !filter_var($banner->foto, FILTER_VALIDATE_URL)) {
            $banner->foto = url(Storage::url($banner->foto));
        }
        
        return response()->json($banner, 200);
    }

    public function update(Request $request, $id)
    {
        $banner = Banner::findOrFail($id);

        $validated = $request->validate([
            'foto' => 'nullable',
            'title' => 'nullable|string|max:255',
            'description' => 'nullable|string'
        ]);

        $data = [];
        
        // Add title if provided
        if ($request->filled('title')) {
            $data['title'] = $request->input('title');
        }
        
        // Add description if provided
        if ($request->filled('description')) {
            $data['description'] = $request->input('description');
        }

        if ($request->hasFile('foto')) {
            if ($banner->foto && \Storage::disk('public')->exists($banner->foto)) {
                \Storage::disk('public')->delete($banner->foto);
            }
            $data['foto'] = $request->file('foto')->store('banner', 'public');
        } elseif ($request->filled('foto')) {
            $foto = $request->input('foto');
            
            if (is_string($foto) && strpos($foto, 'data:') === 0) {
                try {
                    $parts = explode(',', $foto);
                    if (count($parts) === 2 && ($decoded = base64_decode($parts[1], true)) !== false) {
                        if ($banner->foto && \Storage::disk('public')->exists($banner->foto)) {
                            \Storage::disk('public')->delete($banner->foto);
                        }
                        $filename = 'banner/' . uniqid() . '.png';
                        \Storage::disk('public')->put($filename, $decoded);
                        $data['foto'] = $filename;
                    }
                } catch (\Exception $e) {
                    \Log::error('Base64 decode error: ' . $e->getMessage());
                    return response()->json(['message' => 'Invalid foto data'], 422);
                }
            } elseif (filter_var($foto, FILTER_VALIDATE_URL)) {
                $data['foto'] = $foto;
            }
        }

        $banner->update($data);
        
        // Convert foto to full URL if it's a storage path
        if ($banner->foto && !filter_var($banner->foto, FILTER_VALIDATE_URL)) {
            $banner->foto = url(Storage::url($banner->foto));
        }
        
        return response()->json($banner, 200);
    }

    public function destroy($id)
    {
        $banner = Banner::findOrFail($id);
        
        if ($banner->foto && \Storage::disk('public')->exists($banner->foto)) {
            \Storage::disk('public')->delete($banner->foto);
        }
        
        $banner->delete();
        return response()->json(['message' => 'Banner deleted'], 200);
    }
}