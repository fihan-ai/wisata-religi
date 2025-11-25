// src/pages/BeritaPage.jsx
import { useMemo, useState, useEffect } from "react";
import { Link } from "react-router-dom";

// Dropdown kategori – tabel artikel belum punya kolom kategori,
// jadi sementara pakai satu kategori umum: "Berita"
const CATEGORIES = ["Semua", "Berita"];

// fallback image (kalau tidak ada gambar)
const LOCAL_FALLBACK_IMAGE =
  "https://placehold.co/800x500/png?text=Gambar+Berita+Tidak+Tersedia";

function slugify(s) {
  return s
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// helper untuk URL gambar dari storage Laravel
function buildImageUrl(path) {
  if (!path) return LOCAL_FALLBACK_IMAGE;

  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  const baseApi = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";
  const baseApp = baseApi.replace("/api", "");

  return `${baseApp}/storage/${path}`;
}

export default function BeritaPage() {
  // UI state
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Semua");
  const [sort, setSort] = useState("terbaru");
  const [page, setPage] = useState(1);
  const pageSize = 6;

  // ==== Fetch data dari API Laravel (/api/artikel) ====
  useEffect(() => {
    async function fetchBerita() {
      try {
        setLoading(true);
        setError("");

        const baseApi =
          import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";

        const res = await fetch(`${baseApi}/artikel`);
        if (!res.ok) {
          throw new Error("Gagal mengambil data berita");
        }

        const raw = await res.json();

        const items = Array.isArray(raw)
          ? raw
          : Array.isArray(raw.data)
          ? raw.data
          : [];

        const mapped = items.map((item) => {
          const id = item.id_artikel ?? item.id;

          // ringkasan diambil dari isi (potong ±160 karakter)
          const isi = item.isi || "";
          const cleanIsi = isi.replace(/\s+/g, " ").trim();
          const summary =
            cleanIsi.length > 160
              ? cleanIsi.slice(0, 157) + "..."
              : cleanIsi || "Belum ada ringkasan.";

          // estimasi read time (200 kata ≈ 1 menit)
          const wordCount = cleanIsi ? cleanIsi.split(" ").length : 0;
          const readTime = Math.max(1, Math.round(wordCount / 200));

          return {
            id,
            title: item.judul || "Tanpa judul",
            summary,
            category: "Berita", // karena tabel belum punya kolom kategori
            image: buildImageUrl(item.gambar),
            date: item.tanggal_publish || item.created_at,
            readTime,
            // di route kamu: /berita/:slug → di sini slug = id artikel,
            // nanti DetailBerita bisa pakai ini sebagai id.
            slug: String(id),
          };
        });

        setData(mapped);
      } catch (err) {
        console.error("Error fetching berita:", err);
        setError("Gagal memuat data berita. Silakan coba lagi.");
      } finally {
        setLoading(false);
      }
    }

    fetchBerita();
  }, []);

  // Filter + sort
  const filtered = useMemo(() => {
    let result = [...data];

    if (category !== "Semua") {
      result = result.filter((n) => n.category === category);
    }

    if (query.trim()) {
      const q = query.toLowerCase();
      result = result.filter(
        (n) =>
          n.title.toLowerCase().includes(q) ||
          n.summary.toLowerCase().includes(q)
      );
    }

    result.sort((a, b) => {
      if (sort === "terbaru") return new Date(b.date) - new Date(a.date);
      if (sort === "terlama") return new Date(a.date) - new Date(b.date);
      return a.title.localeCompare(b.title);
    });

    return result;
  }, [data, query, category, sort]);

  useEffect(() => setPage(1), [query, category, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageData = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50/40 pt-24 md:pt-28 pb-16">
      <div className="container mx-auto px-4 md:px-8">
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-blue-700">
              Berita
            </h1>
            <p className="text-gray-600 mt-2 max-w-2xl">
              Kabar terbaru seputar wisata religi, acara, dan pembaruan
              fasilitas.
            </p>
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Cari berita..."
                className="pl-10 pr-3 py-2 w-full sm:w-64 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/90"
                aria-label="Cari berita"
              />
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2"
                stroke="currentColor"
                aria-hidden
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                />
              </svg>
            </div>

            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="px-3 py-2 rounded-xl border border-gray-300 bg-white/90 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Filter kategori"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="px-3 py-2 rounded-xl border border-gray-300 bg-white/90 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Sortir"
            >
              <option value="terbaru">Terbaru</option>
              <option value="terlama">Terlama</option>
              <option value="judul">Judul A-Z</option>
            </select>
          </div>
        </div>

        {/* Error state */}
        {error && !loading && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="overflow-hidden rounded-2xl shadow-sm bg-white"
              >
                <div className="h-44 bg-gray-200 animate-pulse" />
                <div className="p-5 space-y-3">
                  <div className="h-6 w-3/4 bg-gray-200 animate-pulse rounded" />
                  <div className="h-4 w-full bg-gray-200 animate-pulse rounded" />
                  <div className="h-4 w-5/6 bg-gray-200 animate-pulse rounded" />
                  <div className="flex gap-2 pt-2">
                    <div className="h-6 w-20 bg-gray-200 animate-pulse rounded-full" />
                    <div className="h-6 w-24 bg-gray-200 animate-pulse rounded-full" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {pageData.length === 0 ? (
              <div className="text-center py-24 text-gray-600">
                <svg
                  className="mx-auto h-10 w-10 text-gray-400"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  aria-hidden
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 6v12m6-6H6"
                  />
                </svg>
                Tidak ada berita yang cocok dengan filter.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {pageData.map((item) => (
                  <article
                    key={item.id}
                    className="group overflow-hidden rounded-2xl shadow-sm hover:shadow-lg transition-shadow bg-white"
                  >
                    <Link to={`/berita/${item.slug}`} className="block">
                      <div className="relative h-44">
                        <img
                          src={item.image || LOCAL_FALLBACK_IMAGE}
                          alt={item.title}
                          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                      <div className="p-5">
                        {/* Title */}
                        <h3 className="text-lg font-bold leading-snug line-clamp-2">
                          {item.title}
                        </h3>

                        {/* Summary */}
                        <p className="text-sm text-gray-600 mt-2 line-clamp-3">
                          {item.summary}
                        </p>

                        {/* Meta */}
                        <div className="flex items-center gap-2 text-xs text-gray-500 mt-3">
                          <svg
                            className="h-4 w-4"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="2"
                            stroke="currentColor"
                            aria-hidden
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M8 7V3m8 4V3M3 11h18M5 19h14a2 2 0 002-2v-8H3v8a2 2 0 002 2z"
                            />
                          </svg>
                          <span>
                            {item.date
                              ? new Date(item.date).toLocaleDateString("id-ID", {
                                  day: "2-digit",
                                  month: "long",
                                  year: "numeric",
                                })
                              : "Tanggal tidak diketahui"}
                          </span>
                          <span>•</span>
                          <span>{item.readTime} menit baca</span>
                        </div>

                        <div className="flex items-center justify-between mt-4">
                          <span className="inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                            {item.category}
                          </span>
                          <span className="inline-flex items-center text-blue-700 font-medium group-hover:underline">
                            Baca selengkapnya
                            <svg
                              className="h-4 w-4 ml-1 transition-transform group-hover:translate-x-0.5"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth="2"
                              stroke="currentColor"
                              aria-hidden
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3"
                              />
                            </svg>
                          </span>
                        </div>
                      </div>
                    </Link>
                  </article>
                ))}
              </div>
            )}

            {/* Pagination */}
            {filtered.length > pageSize && (
              <div className="flex items-center justify-center gap-2 mt-10">
                <button
                  className="px-4 py-2 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-40"
                  disabled={page === 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Sebelumnya
                </button>
                <div className="px-3 py-2 text-sm text-gray-600 rounded-xl bg-white border border-gray-200 shadow-sm">
                  Halaman <span className="font-semibold">{page}</span> dari{" "}
                  {totalPages}
                </div>
                <button
                  className="px-4 py-2 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-40"
                  disabled={page === totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  Berikutnya
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
