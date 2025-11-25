import { useParams, Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

/* ===== Helper umum ===== */

function formatDate(d) {
  if (!d) return "Tanggal tidak diketahui";
  try {
    const dt = new Date(d);
    return dt.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  } catch {
    return d;
  }
}

const FALLBACK_IMAGE =
  "https://placehold.co/800x500/png?text=Gambar+Berita+Tidak+Tersedia";

function buildImageUrl(path) {
  if (!path) return FALLBACK_IMAGE;

  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  const baseApi = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";
  const baseApp = baseApi.replace("/api", "");
  return `${baseApp}/storage/${path}`;
}

/* ===== Mapping artikel dari backend ===== */

function mapArtikel(item) {
  const id = item.id_artikel ?? item.id;

  const isi = item.isi || "";
  const deskripsi = item.deskripsi || "";

  // Gabungkan untuk dasar perhitungan
  const baseTextRaw = isi || deskripsi || "";
  const cleanBase = baseTextRaw.replace(/\s+/g, " ").trim();

  // Ringkasan:
  // Prioritas: pakai deskripsi → kalau kosong baru potong dari isi
  const summary = deskripsi
    ? deskripsi
    : cleanBase.length > 160
    ? cleanBase.slice(0, 157) + "..."
    : cleanBase || "Belum ada ringkasan.";

  // Estimasi waktu baca
  const wordCount = cleanBase ? cleanBase.split(" ").length : 0;
  const readMinutes = Math.max(1, Math.round(wordCount / 200));

  return {
    id,
    title: item.judul || "Tanpa judul",
    category: "Berita",
    date: item.tanggal_publish || item.created_at,
    image: buildImageUrl(item.gambar),
    summary,
    // Kalau isi kosong, pakai deskripsi sebagai konten
    content: isi || deskripsi,
    tags: ["Berita"],
    readMinutes,
  };
}

/* ===== Komponen Utama ===== */

export default function DetailBerita() {
  const { slug } = useParams(); // di sini slug = id_artikel
  const navigate = useNavigate();

  const [article, setArticle] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function fetchData() {
      try {
        setLoading(true);
        setError("");

        const baseApi =
          import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";

        // 1) Ambil detail berita
        const detailRes = await fetch(`${baseApi}/artikel/${slug}`);

        if (!detailRes.ok) {
          throw new Error("Gagal mengambil detail berita");
        }

        const detailRaw = await detailRes.json();
        const mappedDetail = mapArtikel(detailRaw);

        // 2) Ambil semua berita untuk Related
        const listRes = await fetch(`${baseApi}/artikel`);
        const listRaw = listRes.ok ? await listRes.json() : [];

        const listItems = Array.isArray(listRaw)
          ? listRaw
          : Array.isArray(listRaw.data)
          ? listRaw.data
          : [];

        const mappedList = listItems.map(mapArtikel);

        const relatedArticles = mappedList
          .filter((a) => a.id !== mappedDetail.id)
          .slice(0, 3);

        if (!active) return;

        setArticle(mappedDetail);
        setRelated(relatedArticles);
      } catch (err) {
        console.error(err);
        if (active) {
          setError("Berita tidak ditemukan atau terjadi kesalahan server.");
          setArticle(null);
          setRelated([]);
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    fetchData();

    return () => {
      active = false;
    };
  }, [slug]);

  /* ===== STATE LOADING ===== */
  if (loading) {
    return (
      <div className="max-w-5xl mx-auto pt-32 pb-10 px-4">
        <div className="bg-white rounded-2xl shadow p-6 animate-pulse">
          <div className="h-4 w-40 bg-gray-200 rounded mb-4" />
          <div className="h-6 w-3/4 bg-gray-200 rounded mb-4" />
          <div className="h-64 w-full bg-gray-200 rounded mb-6" />
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-4 w-full bg-gray-200 rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  /* ===== STATE ERROR / NOT FOUND ===== */
  if (error || !article) {
    return (
      <div className="max-w-4xl mx-auto pt-32 pb-10 px-4">
        <div className="bg-white rounded-2xl shadow p-8 text-center">
          <h2 className="text-2xl font-semibold mb-2">
            Berita tidak ditemukan
          </h2>
          <p className="text-gray-600 mb-6">
            {error ||
              "Maaf, berita yang kamu cari tidak tersedia atau sudah dihapus."}
          </p>
          <div className="flex justify-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 rounded-xl border"
            >
              Kembali
            </button>
            <Link
              to="/berita"
              className="px-4 py-2 rounded-xl bg-blue-600 text-white"
            >
              Ke daftar berita
            </Link>
          </div>
        </div>
      </div>
    );
  }

  /* ===== RENDER UTAMA ===== */

  return (
    <div className="max-w-5xl mx-auto pt-32 pb-10 px-4">
      <article className="bg-white rounded-2xl shadow p-6">
        <header className="mb-6">
          <div className="flex items-center gap-3 text-sm text-gray-500 mb-3">
            <span>🗓️ {formatDate(article.date)}</span>
            <span>•</span>
            <span>{article.readMinutes} menit baca</span>
            <span>•</span>
            <span className="px-2 py-1 bg-gray-100 rounded-full text-xs">
              {article.category}
            </span>
          </div>

          <h1 className="text-3xl font-bold mb-4">
            {article.title}
          </h1>

          {/* DESKRIPSI DARI DATABASE */}
          <p className="text-gray-700 mb-4">
            {article.summary}
          </p>

          <div className="w-full rounded-lg overflow-hidden mb-4">
            <img
              src={article.image || FALLBACK_IMAGE}
              alt={article.title}
              className="w-full object-cover max-h-96"
            />
          </div>
        </header>

        {/* KONTEN BERITA */}
        <section
          className="prose max-w-none mb-6"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />

        <footer className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="text-sm text-gray-600 mb-2">Tags:</div>
            <div className="flex gap-2 flex-wrap">
              {article.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-gray-100 rounded-full text-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() =>
                navigator.share
                  ? navigator.share({
                      title: article.title,
                      text: article.summary,
                      url: window.location.href,
                    })
                  : alert("Fitur share tidak tersedia di browser ini")
              }
              className="px-4 py-2 rounded-xl border"
            >
              Share
            </button>
            <Link
              to="/berita"
              className="px-4 py-2 rounded-xl bg-blue-600 text-white"
            >
              Kembali ke Berita
            </Link>
          </div>
        </footer>
      </article>

      {/* ===== RELATED NEWS ===== */}
      {related.length > 0 && (
        <aside className="mt-8">
          <h3 className="text-xl font-semibold mb-4">
            Berita Terkait
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {related.map((r) => (
              <Link
                key={r.id}
                to={`/berita/${r.id}`}
                className="block bg-white rounded-xl shadow p-4 hover:shadow-md"
              >
                <div className="h-36 w-full rounded overflow-hidden mb-3">
                  <img
                    src={r.image || FALLBACK_IMAGE}
                    alt={r.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="text-sm text-gray-500">
                  {formatDate(r.date)}
                </div>
                <h4 className="font-medium mt-1">
                  {r.title}
                </h4>
                <p className="text-gray-600 text-sm mt-2">
                  {r.summary}
                </p>
              </Link>
            ))}
          </div>
        </aside>
      )}
    </div>
  );
}
