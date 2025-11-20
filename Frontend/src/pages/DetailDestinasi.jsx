import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";

// Dummy API (ganti dengan API backend kamu)
async function fetchWisataBySlug(slug) {
  return new Promise((r) =>
    setTimeout(
      () =>
        r({
          nama: "Judul Destinasi dari Database",
          lokasi: "Alamat/Kota, Provinsi",
          updatedAt: "Mei 2025",
          coverUrl: "https://placehold.co/1400x700/png?text=Foto+Destinasi",
          lat: -2.1312,
          lng: 106.1165,
          paragraf: [
            "Paragraf pembuka tentang destinasi. Singkat, informatif, 2–3 kalimat.",
            "Paragraf kedua menjelaskan daya tarik utama dan nilai sejarah/budaya.",
          ],
          info: {
            jam: "Setiap hari 05.00–21.00",
            tiket: "Gratis",
            fasilitas: ["Parkir", "Toilet", "Area wudhu / ruang doa"],
          }
        }),
      450
    )
  );
}

/* ===== Skeleton lebih profesional ===== */
function SkeletonDetail() {
  return (
    <main className="pt-28 pb-16 bg-gray-50">
      <div className="container mx-auto px-6 md:px-10">
        <div className="h-8 w-56 bg-gray-200 rounded animate-pulse mb-4" />
        <div className="h-[400px] w-full bg-gray-200 rounded-2xl animate-pulse" />
        <div className="mt-6 h-8 w-2/3 bg-gray-200 rounded animate-pulse" />
        <div className="mt-2 h-4 w-1/2 bg-gray-200 rounded animate-pulse" />
        <div className="mt-8 grid lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-4 bg-gray-200 rounded animate-pulse" />
            ))}
          </div>
          <div className="h-72 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>
    </main>
  );
}

/* ===== Tombol Share ===== */
function ShareBar({ title }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  return (
    <div className="mt-4 flex items-center gap-3 text-sm">
      <button
        onClick={copy}
        className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 transition"
      >
        {copied ? "Tautan Disalin ✓" : "Salin Tautan"}
      </button>

      <a
        className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 transition"
        href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(window.location.href)}`}
        target="_blank"
        rel="noreferrer"
      >
        Bagikan
      </a>
    </div>
  );
}

/* ===== MAIN COMPONENT ===== */
export default function DetailWisata() {
  const { slug } = useParams();
  const [data, setData] = useState(null);
  const [imgErr, setImgErr] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      const res = await fetchWisataBySlug(slug);
      if (active) setData(res);
    })();
    return () => (active = false);
  }, [slug]);

  if (!data) return <SkeletonDetail />;

  return (
    <main className="pt-28 pb-20 bg-gray-50 min-h-screen">
      <div className="container mx-auto px-6 md:px-10">
        
        {/* BREADCRUMB */}
        <nav className="text-sm text-gray-500 mb-4">
          <Link to="/" className="hover:text-blue-600">Beranda</Link>
          <span className="mx-2">/</span>
          <Link to="/destinasi" className="hover:text-blue-600">Destinasi</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-700">Detail</span>
        </nav>

        {/* HERO */}
        <div className="relative rounded-2xl overflow-hidden shadow-lg">
          <img
            src={imgErr ? "https://placehold.co/1400x700?text=Gambar+Tidak+Tersedia" : data.coverUrl}
            onError={() => setImgErr(true)}
            alt={data.nama}
            className="w-full max-h-[450px] object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />
        </div>

        {/* TITLE SECTION */}
        <header className="max-w-4xl mt-8">
          <h1 className="font-serif text-[34px] md:text-[42px] leading-tight text-gray-900">
            {data.nama}
          </h1>

          <div className="mt-3 text-sm text-gray-600 flex items-center flex-wrap gap-2">
            <span className="font-medium">{data.lokasi}</span>
            <span className="w-1 h-1 rounded-full bg-gray-400" />
            <time>Diperbarui {data.updatedAt}</time>
          </div>

          <ShareBar title={data.nama} />
        </header>

        {/* CONTENT GRID */}
        <section className="mt-10 grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          {/* MAIN CONTENT */}
          <article className="lg:col-span-2">
            <div className="space-y-5 text-gray-800 leading-relaxed text-[15.5px]">
              {data.paragraf?.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>

            {/* INFO BOX */}
            {data.info && (
              <div className="mt-10 bg-white rounded-xl shadow border border-gray-100 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Informasi Kunjungan</h2>

                <dl className="grid sm:grid-cols-3 gap-6 text-sm">
                  <div>
                    <dt className="text-gray-500">Jam Operasional</dt>
                    <dd className="text-gray-900">{data.info.jam}</dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">Tiket Masuk</dt>
                    <dd className="text-gray-900">{data.info.tiket}</dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">Fasilitas</dt>
                    <dd className="text-gray-900">{data.info.fasilitas?.join(", ")}</dd>
                  </div>
                </dl>
              </div>
            )}
          </article>

          {/* SIDEBAR */}
          <aside>
            <div className="lg:sticky lg:top-28 space-y-5">
              
              {/* MAP */}
              <div className="bg-white rounded-xl shadow border overflow-hidden">
                <div className="px-4 pt-4">
                  <h3 className="font-semibold text-gray-900">Lokasi</h3>
                  <p className="text-sm text-gray-500">{data.lokasi}</p>
                </div>

                <div className="h-64">
                  <iframe
                    title="Peta Lokasi"
                    width="100%"
                    height="100%"
                    loading="lazy"
                    style={{ border: 0 }}
                    src={`https://www.google.com/maps?q=${data.lat},${data.lng}&z=15&output=embed`}
                  />
                </div>

                <div className="p-4 pt-3">
                  <a
                    target="_blank"
                    rel="noreferrer"
                    href={`https://www.google.com/maps/dir/?api=1&destination=${data.lat},${data.lng}`}
                    className="block text-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
                  >
                    Buka di Google Maps
                  </a>
                </div>
              </div>

              {/* CTA */}
              <Link
                to="/destinasi"
                className="block text-center bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-3 rounded-xl transition shadow"
              >
                ← Kembali ke Daftar Destinasi
              </Link>

              <a
                href="mailto:info@wisatareligi.id?subject=Perbaikan%20Data%20Destinasi"
                className="block text-center bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-3 rounded-xl shadow"
              >
                Laporkan Perbaikan Data
              </a>
            </div>
          </aside>

        </section>
      </div>
    </main>
  );
}
