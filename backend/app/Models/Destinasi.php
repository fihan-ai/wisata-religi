<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Destinasi extends Model
{
    use HasFactory;

    protected $table = 'destinasi';
    protected $primaryKey = 'id_destinasi';
    public $timestamps = true;
    protected $fillable = [
        'id_kategori',
        'nama_destinasi',
        'deskripsi',
        'alamat',
        'kota',
        'lattitude',
        'longitude',
        'foto'
    ];

    public function kategori()
    {
        return $this->belongsTo(Kategori::class, 'id_kategori');
    }
}
