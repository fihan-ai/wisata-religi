import { useParams, Link, useNavigate } from "react-router-dom";
import { useMemo } from "react";

/**
 * DetailBerita.jsx
 * - simpan file ini di src/pages/
 * - tambahkan route: <Route path="/berita/:slug" element={<UserLayout><DetailBerita/></UserLayout>} />
 *
 * NOTE: default image uses uploaded file path:
 * '/mnt/data/7da1793f-e331-430a-ab7a-9e1f8bcc92c2.png'
 */

const sampleArticles = [
  {
    id: 1,
    title: "Peresmian Kawasan Wisata Religi Baru di Pangkalpinang",
    category: "Event",
    date: "2025-02-10",
    image: "/mnt/data/7da1793f-e331-430a-ab7a-9e1f8bcc92c2.png",
    summary: "Pemerintah kota meresmikan kawasan wisata religi dengan berbagai fasilitas pendukung untuk pengunjung.",
    content:
      "<p>Pada tanggal 10 Februari 2025, wali kota meresmikan kawasan wisata religi baru yang dilengkapi fasilitas parkir, jalan setapak, dan papan informasi sejarah. Acara peresmian dihadiri oleh tokoh masyarakat, pemuka agama, dan ratusan warga. Pemerintah berharap lokasi ini akan menjadi destinasi edukasi dan ziarah yang nyaman.</p><p>Penataan lingkungan juga melibatkan restorasi situs-situs bersejarah di area sekitar, serta penambahan fasilitas ramah difabel.</p>",
    tags: ["Event", "Pengembangan"],
  },
  {
    id: 2,
    title: "Agenda Ziarah Akbar dan Pengaturan Lalu Lintas",
    category: "Pengumuman",
    date: "2025-02-06",
    image: "",
    summary: "Dinas Perhubungan menyiapkan rekayasa lalu lintas selama kegiatan ziarah akbar berlangsung.",
    content:
      "<p>Dinas Perhubungan mengumumkan pengalihan arus dan penambahan rute shuttle untuk memudahkan akses pengunjung. Disarankan bagi peserta untuk menggunakan transportasi umum atau park & ride agar kemacetan dapat dikurangi.</p>",
    tags: ["Pengumuman"],
  },
  {
    id: 3,
    title: "Kuliner Halal di Sekitar Destinasi Populer",
    category: "Panduan",
    date: "2025-01-30",
    image: "",
    summary: "Rekomendasi kuliner halal dan ramah keluarga yang mudah dijangkau dari destinasi utama.",
    content:
      "<p>Berbagai pilihan kuliner halal tersedia dekat dengan titik-titik wisata utama. Kami merangkum beberapa kedai keluarga dan restoran bersertifikat halal yang direkomendasikan untuk wisatawan.</p>",
    tags: ["Panduan", "Kuliner"],
  },
];

function formatDate(d) {
  try {
    const dt = new Date(d);
    return dt.toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" });
  } catch {
    return d;
  }
}

function slugify(s) {
  return s
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function DetailBerita() {
  const { slug } = useParams();
  const navigate = useNavigate();

  // build lookup by slug from sampleArticles
  const { article, related } = useMemo(() => {
    const list = sampleArticles.map(a => ({ ...a, slug: slugify(a.title) }));
    const found = list.find(a => a.slug === slug) || null;

    // related: same category or other recent (exclude current)
    const relatedList = list
      .filter(a => !found || a.id !== found.id)
      .filter(a => found ? a.category === found.category : true)
      .slice(0, 3);

    return { article: found, related: relatedList };
  }, [slug]);

  if (!article) {
    return (
      <div className="max-w-4xl mx-auto pt-32 pb-10 px-4">
        <div className="bg-white rounded-2xl shadow p-8 text-center">
          <h2 className="text-2xl font-semibold mb-2">Berita tidak ditemukan</h2>
          <p className="text-gray-600 mb-6">Maaf, berita yang kamu cari tidak tersedia atau sudah dihapus.</p>
          <div className="flex justify-center gap-3">
            <button onClick={() => navigate(-1)} className="px-4 py-2 rounded-xl border">Kembali</button>
            <Link to="/berita" className="px-4 py-2 rounded-xl bg-blue-600 text-white">Ke daftar berita</Link>
          </div>
        </div>
      </div>
    );
  }

  // estimate reading time (simple): words / 200
  const plainText = (article.content || "").replace(/<[^>]+>/g, "");
  const words = plainText.trim().split(/\s+/).filter(Boolean).length || 0;
  const readMinutes = Math.max(1, Math.round(words / 200));

  return (
    // tambahkan top padding agar tidak tertutup navbar yang fixed
    <div className="max-w-5xl mx-auto pt-32 pb-10 px-4">
      <article className="bg-white rounded-2xl shadow p-6">
        <header className="mb-6">
          <div className="flex items-center gap-3 text-sm text-gray-500 mb-3">
            <span>🗓️ {formatDate(article.date)}</span>
            <span>•</span>
            <span>{readMinutes} menit baca</span>
            <span>•</span>
            <span className="px-2 py-1 bg-gray-100 rounded-full text-xs">{article.category}</span>
          </div>

          <h1 className="text-3xl font-bold mb-4 article-title">{article.title}</h1>
          <p className="text-gray-700 mb-4">{article.summary}</p>

          <div className="w-full rounded-lg overflow-hidden mb-4">
            <img
              src={article.image || "/mnt/data/7da1793f-e331-430a-ab7a-9e1f8bcc92c2.png"}
              alt={article.title}
              className="w-full object-cover max-h-96"
            />
          </div>
        </header>

        <section
          className="prose max-w-none mb-6"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />

        <footer className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="text-sm text-gray-600 mb-2">Tags:</div>
            <div className="flex gap-2 flex-wrap">
              {article.tags?.map(tag => (
                <span key={tag} className="px-3 py-1 bg-gray-100 rounded-full text-sm">{tag}</span>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <button onClick={() => navigator.share ? navigator.share({ title: article.title, text: article.summary, url: window.location.href }) : alert("Fitur share tidak tersedia di browser ini")} className="px-4 py-2 rounded-xl border">Share</button>
            <Link to="/berita" className="px-4 py-2 rounded-xl bg-blue-600 text-white">Kembali ke Berita</Link>
          </div>
        </footer>
      </article>

      {/* Related */}
      {related.length > 0 && (
        <aside className="mt-8">
          <h3 className="text-xl font-semibold mb-4">Berita Terkait</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {related.map(r => (
              <Link key={r.id} to={`/berita/${r.slug}`} className="block bg-white rounded-xl shadow p-4 hover:shadow-md">
                <div className="h-36 w-full rounded overflow-hidden mb-3">
                  <img src={r.image || "/mnt/data/7da1793f-e331-430a-ab7a-9e1f8bcc92c2.png"} alt={r.title} className="w-full h-full object-cover" />
                </div>
                <div className="text-sm text-gray-500">{formatDate(r.date)}</div>
                <h4 className="font-medium mt-1">{r.title}</h4>
                <p className="text-gray-600 text-sm mt-2">{r.summary}</p>
              </Link>
            ))}
          </div>
        </aside>
      )}
    </div>
  );
}
