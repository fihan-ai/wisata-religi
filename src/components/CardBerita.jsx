

import React from "react";

// Menerima props dari beritaData
export default function CardBerita({
  title,
  excerpt,
  imageUrl,
  date,
  category,
  slug,
}) {
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col transform transition-transform duration-300 hover:scale-105">
      {/* Gambar Artikel */}
      <img src={imageUrl} alt={title} className="w-full h-48 object-cover" />

      {/* Konten Teks */}
      <div className="p-6 flex-grow">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs font-semibold text-blue-600 uppercase">
            {category}
          </span>
          <span className="text-xs text-gray-500">{date}</span>
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
          {title}
        </h3>
        <p className="text-gray-700 text-sm mb-4 line-clamp-3">{excerpt}</p>
      </div>

      {/* Tombol "Baca Selengkapnya" */}
      <div className="p-6 pt-0">
        {/* Asumsikan link Anda akan menuju /berita/[slug] atau /berita/[id] */}
        <a
          href={`/berita/${slug}`}
          className="text-blue-700 font-semibold hover:text-blue-900 transition-colors"
        >
          Baca Selengkapnya &rarr;
        </a>
      </div>
    </div>
  );
}