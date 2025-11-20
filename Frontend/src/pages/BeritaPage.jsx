import { useMemo, useState, useEffect } from "react";
import { Link } from "react-router-dom";

// ======= Data dummy (ganti dengan fetch API jika ada endpoint) =======
const DUMMY_NEWS = [
  {
    id: 1,
    title: "Peresmian Kawasan Wisata Religi Baru di Pangkalpinang",
    summary:
      "Pemerintah kota meresmikan kawasan wisata religi dengan berbagai fasilitas pendukung untuk pengunjung.",
    category: "Event",
    image: "https://images.unsplash.com/photo-1491553895911-0055eca6402d?q=80&w=1470&auto=format&fit=crop",
    date: "2025-02-10",
    readTime: 4,
  },
  {
    id: 2,
    title: "Agenda Ziarah Akbar dan Pengaturan Lalu Lintas",
    summary:
      "Dinas Perhubungan menyiapkan rekayasa lalu lintas selama kegiatan ziarah akbar berlangsung.",
    category: "Pengumuman",
    image: "https://images.unsplash.com/photo-1519996529931-28324d5a630e?q=80&w=1470&auto=format&fit=crop",
    date: "2025-02-06",
    readTime: 3,
  },
  {
    id: 3,
    title: "Kuliner Halal di Sekitar Destinasi Populer",
    summary:
      "Rekomendasi kuliner halal dan ramah keluarga yang mudah dijangkau dari destinasi utama.",
    category: "Panduan",
    image: "https://images.unsplash.com/photo-1526318472351-c75fcf070305?q=80&w=1470&auto=format&fit=crop",
    date: "2025-01-30",
    readTime: 5,
  },
  {
    id: 4,
    title: "Tips Etiquette Berkunjung ke Situs Religi",
    summary:
      "Panduan singkat mengenai pakaian, kebersihan, dan etika selama berkunjung.",
    category: "Panduan",
    image: "https://images.unsplash.com/photo-1520975930722-114c3eb2c5be?q=80&w=1470&auto=format&fit=crop",
    date: "2025-01-22",
    readTime: 6,
  },
  {
    id: 5,
    title: "Peningkatan Fasilitas Toilet dan Ruang Laktasi",
    summary:
      "Beberapa titik destinasi mendapatkan renovasi ringan untuk meningkatkan kenyamanan pengunjung.",
    category: "Update Fasilitas",
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1470&auto=format&fit=crop",
    date: "2025-01-10",
    readTime: 3,
  },
  {
    id: 6,
    title: "Program Pelatihan Guide Lokal",
    summary:
      "Pelatihan pemandu wisata difokuskan pada narasi sejarah dan layanan ramah difabel.",
    category: "Komunitas",
    image: "https://images.unsplash.com/photo-1504386106331-3e4e71712b38?q=80&w=1470&auto=format&fit=crop",
    date: "2024-12-28",
    readTime: 4,
  },
];

const CATEGORIES = ["Semua", "Event", "Pengumuman", "Panduan", "Update Fasilitas", "Komunitas"];

export default function BeritaPage() {
  // UI state
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Semua");
  const [sort, setSort] = useState("terbaru");
  const [page, setPage] = useState(1);
  const pageSize = 6;

  // Simulasi fetch (ganti dengan fetch real bila perlu)
  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => {
      setData(DUMMY_NEWS);
      setLoading(false);
    }, 500);
    return () => clearTimeout(t);
  }, []);

  // Filter + sort
  const filtered = useMemo(() => {
    let result = [...data];
    if (category !== "Semua") result = result.filter((n) => n.category === category);
    if (query.trim()) {
      const q = query.toLowerCase();
      result = result.filter(
        (n) => n.title.toLowerCase().includes(q) || n.summary.toLowerCase().includes(q)
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
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50/40 pt-24 pb-16">
      <div className="container mx-auto px-4 md:px-8">
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-blue-700">Berita</h1>
            <p className="text-gray-600 mt-2 max-w-2xl">
              Kabar terbaru seputar wisata religi, acara, dan pembaruan fasilitas.
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
              />
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg>
            </div>

            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="px-3 py-2 rounded-xl border border-gray-300 bg-white/90 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="px-3 py-2 rounded-xl border border-gray-300 bg-white/90 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="terbaru">Terbaru</option>
              <option value="terlama">Terlama</option>
              <option value="judul">Judul A-Z</option>
            </select>
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="overflow-hidden rounded-2xl shadow-sm bg-white">
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
                <svg className="mx-auto h-10 w-10 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m6-6H6"/></svg>
                Tidak ada berita yang cocok dengan filter.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {pageData.map((item) => (
                  <article key={item.id} className="group overflow-hidden rounded-2xl shadow-sm hover:shadow-lg transition-shadow bg-white">
                    <div className="relative h-44">
                      <img src={item.image} alt={item.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                    <div className="p-5">
                      <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                        <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3M3 11h18M5 19h14a2 2 0 002-2v-8H3v8a2 2 0 002 2z"/></svg>
                        <span>{new Date(item.date).toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" })}</span>
                        <span>•</span>
                        <span>{item.readTime} menit baca</span>
                      </div>

                      <h3 className="text-lg font-bold leading-snug line-clamp-2">{item.title}</h3>
                      <p className="text-sm text-gray-600 mt-2 line-clamp-3">{item.summary}</p>

                      <div className="flex items-center justify-between mt-4">
                        <span className="inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                          {item.category}
                        </span>
                        <Link to="#" className="inline-flex items-center text-blue-700 font-medium group">
                          Baca selengkapnya
                          <svg className="h-4 w-4 ml-1 transition-transform group-hover:translate-x-0.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3"/></svg>
                        </Link>
                      </div>
                    </div>
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
                  Halaman <span className="font-semibold">{page}</span> dari {totalPages}
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
