import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";

/** Expected backend shape (nanti ganti fetchWisataBySlug dgn API kamu):
 * {
 *  nama, lokasi, updatedAt, coverUrl, lat, lng,
 *  paragraf: string[],
 *  info?: { jam?: string, tiket?: string, fasilitas?: string[] },
 *  rating?: { avg: number, total: number }
 * }
 */

// Dummy fetch — ganti dgn API kamu
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
          },
          rating: { avg: 4.6, total: 120 },
        }),
      450
    )
  );
}

/* ===== Skeleton rapi ===== */
function SkeletonDetail() {
  return (
    <main className="pt-28 pb-16 bg-gray-50">
      <div className="container mx-auto px-6 md:px-10">
        <div className="h-6 w-48 bg-gray-200 rounded animate-pulse mb-4" />
        <div className="h-72 md:h-[420px] w-full bg-gray-200 rounded-2xl animate-pulse" />
        <div className="mt-6 h-8 w-3/4 bg-gray-200 rounded animate-pulse" />
        <div className="mt-2 h-4 w-1/2 bg-gray-200 rounded animate-pulse" />
        <div className="mt-8 grid lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-3">
            <div className="h-4 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 bg-gray-200 rounded animate-pulse" />
            <div className="h-28 bg-gray-200 rounded animate-pulse mt-4" />
          </div>
          <div className="h-80 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>
    </main>
  );
}

/* ===== Rating box profesional (UI-only) ===== */
function RatingBoxInlinePro({ slug, initialAvg = 0, initialTotal = 0 }) {
  const [selected, setSelected] = useState(0);
  const [locked, setLocked] = useState(false);
  const liveRef = useRef(null);

  useEffect(() => {
    setLocked(localStorage.getItem(`rated:${slug}`) === "1");
  }, [slug]);

  const display = useMemo(() => {
    if (!selected) return { avg: initialAvg, total: initialTotal };
    const newTotal = initialTotal + 1;
    const newAvg = (initialAvg * initialTotal + selected) / newTotal;
    return { avg: newAvg, total: newTotal };
  }, [selected, initialAvg, initialTotal]);

  const handleRate = async (v) => {
    if (locked) return;
    setSelected(v);
    localStorage.setItem(`rated:${slug}`, "1");
    setLocked(true);
    // NANTI: kirim ke API di sini (CAPTCHA optional)
    // await fetch("/api/rate", { method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify({ slug, value:v }) });
    if (liveRef.current) liveRef.current.textContent = `Terima kasih! Rating ${v} bintang tersimpan.`;
  };

  // keyboard navigation
  const onKey = (e) => {
    if (locked) return;
    const keys = ["1", "2", "3", "4", "5", "ArrowLeft", "ArrowRight"];
    if (!keys.includes(e.key)) return;
    e.preventDefault();
    if (e.key === "ArrowLeft") setSelected((p) => Math.max(1, (p || 1) - 1));
    else if (e.key === "ArrowRight") setSelected((p) => Math.min(5, (p || 0) + 1));
    else handleRate(Number(e.key));
  };

  const starBtn = (n) =>
    `w-8 h-8 rounded-md border flex items-center justify-center text-base transition
     ${locked ? "cursor-not-allowed border-gray-200" : "cursor-pointer border-gray-300 hover:bg-yellow-50"}
     ${(selected || 0) >= n ? "text-yellow-500" : "text-gray-400"}`;

  return (
    <div className="bg-white rounded-xl shadow p-4 border border-gray-200 mt-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm text-gray-500">Beri penilaian destinasi ini</p>
          <p className="text-lg font-semibold text-gray-900">
            {display.avg.toFixed(1)} <span className="text-sm text-gray-500">({display.total})</span>
          </p>
        </div>

        <div
          className="flex items-center gap-1"
          role="radiogroup"
          aria-label="Pilih rating"
          tabIndex={0}
          onKeyDown={onKey}
        >
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => handleRate(n)}
              disabled={locked}
              role="radio"
              aria-checked={selected === n}
              aria-label={`${n} bintang`}
              className={starBtn(n)}
            >
              ★
            </button>
          ))}
        </div>
      </div>
      <p
        ref={liveRef}
        className={`mt-2 text-xs ${locked ? "text-green-600" : "text-gray-500"}`}
        aria-live="polite"
      >
        {locked
          ? "Terima kasih! Penilaianmu tersimpan di perangkat ini."
          : "Tanpa login. 1x per perangkat (sementara)."}
      </p>
    </div>
  );
}

/* ===== Tombol Share (copy link) ===== */
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
    <div className="mt-3 flex items-center gap-3 text-sm">
      <button
        onClick={copy}
        className="px-3 py-1.5 rounded-lg border border-gray-300 hover:bg-gray-50"
        aria-label="Salin tautan halaman"
      >
        {copied ? "Tautan Disalin ✓" : "Salin Tautan"}
      </button>
      <a
        className="px-3 py-1.5 rounded-lg border border-gray-300 hover:bg-gray-50"
        href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(window.location.href)}`}
        target="_blank" rel="noreferrer"
      >
        Bagikan
      </a>
    </div>
  );
}

export default function DetailWisata() {
  const { slug } = useParams();
  const [data, setData] = useState(null);
  const [imgErr, setImgErr] = useState(false);

  useEffect(() => {
    let on = true;
    (async () => {
      const res = await fetchWisataBySlug(slug);
      if (on) setData(res);
    })();
    return () => {
      on = false;
    };
  }, [slug]);

  if (!data) return <SkeletonDetail />;

  const initialAvg = data?.rating?.avg ?? 0;
  const initialTotal = data?.rating?.total ?? 0;

  return (
    <main className="pt-28 pb-16 bg-gray-50 min-h-screen">
      <div className="container mx-auto px-6 md:px-10">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-500 mb-4" aria-label="Breadcrumb">
          <Link to="/" className="hover:text-blue-600">Beranda</Link>
          <span className="mx-2">›</span>
          <Link to="/destinasi" className="hover:text-blue-600">Destinasi</Link>
          <span className="mx-2">›</span>
          <span className="text-gray-700">Detail</span>
        </nav>

        {/* Hero dengan overlay halus */}
        <div className="relative rounded-2xl overflow-hidden shadow">
          <img
            src={imgErr ? "https://placehold.co/1400x700?text=Gambar+tidak+tersedia" : data.coverUrl}
            onError={() => setImgErr(true)}
            alt={data.nama}
            className="w-full max-h-[440px] object-cover"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/30 via-black/0 to-transparent" />
        </div>

        {/* Judul + meta + share + rating */}
        <header className="max-w-4xl mt-8">
          <h1 className="font-serif text-[30px] md:text-[40px] leading-tight text-gray-900">
            {data.nama}
          </h1>
          <div className="mt-2 text-sm text-gray-600 flex flex-wrap items-center gap-2">
            <span>{data.lokasi}</span>
            <span aria-hidden className="w-[6px] h-[6px] bg-gray-300 rounded-full" />
            <time>{data.updatedAt}</time>
          </div>
          <ShareBar title={data.nama} />
          <RatingBoxInlinePro slug={slug} initialAvg={initialAvg} initialTotal={initialTotal} />
        </header>

        {/* Grid konten + sidebar */}
        <section className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Konten utama */}
          <article className="lg:col-span-2">
            <div className="space-y-4 text-gray-800 leading-relaxed">
              {data.paragraf?.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>

            {/* Info ringkas */}
            {data.info && (
              <div className="mt-6 bg-white rounded-xl shadow p-5 border border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900 mb-3">Informasi Kunjungan</h2>
                <dl className="grid sm:grid-cols-3 gap-4 text-sm">
                  <div>
                    <dt className="text-gray-500">Jam Operasional</dt>
                    <dd className="text-gray-900">{data.info.jam || "-"}</dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">Tiket / Retribusi</dt>
                    <dd className="text-gray-900">{data.info.tiket || "-"}</dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">Fasilitas</dt>
                    <dd className="text-gray-900">{data.info.fasilitas?.join(", ") || "-"}</dd>
                  </div>
                </dl>
              </div>
            )}
          </article>

          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <div className="lg:sticky lg:top-28 space-y-4">
              {/* Peta (iframe) */}
              {data.lat && data.lng && (
                <div className="bg-white rounded-xl shadow overflow-hidden">
                  <div className="px-4 pt-4">
                    <h3 className="font-semibold text-gray-900">Lokasi</h3>
                    <p className="text-sm text-gray-500">{data.lokasi}</p>
                  </div>
                  <div className="h-64">
                    <iframe
                      title="Peta Lokasi"
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      loading="lazy"
                      allowFullScreen
                      src={`https://www.google.com/maps?q=${data.lat},${data.lng}&z=16&output=embed`}
                    />
                  </div>
                  <div className="p-4 pt-3">
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${data.lat},${data.lng}`}
                      target="_blank"
                      rel="noreferrer"
                      className="block text-center px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                    >
                      Buka di Google Maps
                    </a>
                  </div>
                </div>
              )}

              {/* CTA kembali & kontak singkat */}
              <Link
                to="/destinasi"
                className="block text-center bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-3 rounded-xl shadow"
              >
                ← Kembali ke Daftar Destinasi
              </Link>
              <a
                href="mailto:info@wisatareligi.id?subject=Perbaikan%20Data%20Destinasi"
                className="block text-center bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-3 rounded-xl shadow"
              >
                Laporkan Pembaruan Data
              </a>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}
