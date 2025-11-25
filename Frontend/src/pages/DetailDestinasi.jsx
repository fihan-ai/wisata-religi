import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

/* ========= Helper: bikin URL gambar dari storage Laravel ========= */
function buildImageUrl(path) {
  if (!path) {
    return "https://placehold.co/1400x700/png?text=Foto+Destinasi";
  }

  // kalau sudah full URL
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  // asumsi VITE_API_URL = http://127.0.0.1:8000/api
  const baseApi = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";
  const baseApp = baseApi.replace("/api", "");
  return `${baseApp}/storage/${path}`;
}

/* ========= Ambil 1 destinasi dari backend berdasarkan ID ========= */
async function fetchDestinasiById(id) {
  const baseApi = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";

  const res = await fetch(`${baseApi}/destinasi/${id}`);
  if (!res.ok) {
    throw new Error("Gagal mengambil detail destinasi");
  }

  const raw = await res.json();

  // ===== MAPPING PAS DENGAN TABEL KAMU =====
  const nama = raw.nama_destinasi || "Nama destinasi belum tersedia";

  const lokasi = [raw.alamat, raw.kota].filter(Boolean).join(", ") || "Lokasi belum tersedia";

  // format updated_at -> "Mei 2025"
  let updatedAt = "Belum diketahui";
  if (raw.updated_at) {
    try {
      const d = new Date(raw.updated_at);
      updatedAt = d.toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });
    } catch {
      updatedAt = raw.updated_at;
    }
  }

  const coverUrl = buildImageUrl(raw.foto);

  const deskripsi = raw.deskripsi || "";
  const paragraf = deskripsi
    .split(/\n+/)
    .map((p) => p.trim())
    .filter(Boolean);

  // kolom di DB: lattitude & longtitude (penulisannya seperti di screenshot)
  const latRaw = Number(raw.lattitude);
  const lngRaw = Number(raw.longtitude);
  const lat = Number.isFinite(latRaw) ? latRaw : -2.1312; // fallback Bangka Belitung
  const lng = Number.isFinite(lngRaw) ? lngRaw : 106.1165;

  return {
    nama,
    lokasi,
    updatedAt,
    coverUrl,
    paragraf,
    lat,
    lng,
  };
}

/* ========= Skeleton loading ========= */
function SkeletonDetail() {
  return (
    <main className="pt-28 pb-16 bg-gray-50 min-h-screen">
      <div className="container mx-auto px-6 md:px-10">
        <div className="h-4 w-40 bg-gray-200 rounded animate-pulse mb-4" />
        <div className="h-[260px] md:h-[360px] w-full bg-gray-200 rounded-2xl animate-pulse" />
        <div className="mt-6 h-8 w-2/3 bg-gray-200 rounded animate-pulse" />
        <div className="mt-2 h-4 w-1/2 bg-gray-200 rounded animate-pulse" />
        <div className="mt-8 grid lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-4 bg-gray-200 rounded animate-pulse" />
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>
    </main>
  );
}

/* ========= MAIN COMPONENT ========= */
export default function DetailDestinasi() {
  const { id } = useParams(); // /destinasi/:id
  console.log("ID dari URL", id);
  const [data, setData] = useState(null);
  const [imgErr, setImgErr] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        setError("");
        const result = await fetchDestinasiById(id);
        if (active) setData(result);
      } catch (err) {
        console.error(err);
        if (active) setError("Gagal memuat detail destinasi.");
      }
    })();

    return () => {
      active = false;
    };
  }, [id]);

  if (!data && !error) return <SkeletonDetail />;

  if (error) {
    return (
      <main className="pt-28 pb-16 bg-gray-50 min-h-screen">
        <div className="container mx-auto px-6 md:px-10 text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Link
            to="/destinasi"
            className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Kembali ke daftar destinasi
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="pt-28 pb-20 bg-gray-50 min-h-screen">
      <div className="container mx-auto px-6 md:px-10">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-500 mb-4">
          <Link to="/" className="hover:text-blue-600">
            Beranda
          </Link>
          <span className="mx-2">/</span>
          <Link to="/destinasi" className="hover:text-blue-600">
            Destinasi
          </Link>
          <span className="mx-2">/</span>
          <span className="text-gray-700">{data.nama}</span>
        </nav>

        {/* Gambar utama */}
        <div className="relative rounded-2xl overflow-hidden shadow-lg">
          <img
            src={
              imgErr
                ? "https://placehold.co/1400x700?text=Gambar+Tidak+Tersedia"
                : data.coverUrl
            }
            onError={() => setImgErr(true)}
            alt={data.nama}
            className="w-full max-h-[420px] object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />
        </div>

        {/* Judul + info singkat */}
        <header className="max-w-4xl mt-8">
          <h1 className="font-serif text-[30px] md:text-[38px] leading-tight text-gray-900">
            {data.nama}
          </h1>

          <div className="mt-3 text-sm text-gray-600 flex items-center flex-wrap gap-2">
            <span className="font-medium">{data.lokasi}</span>
            <span className="w-1 h-1 rounded-full bg-gray-400" />
            <time>Diperbarui {data.updatedAt}</time>
          </div>
        </header>

        {/* Konten + map */}
        <section className="mt-10 grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Deskripsi */}
          <article className="lg:col-span-2">
            <div className="space-y-5 text-gray-800 leading-relaxed text-[15.5px]">
              {data.paragraf.length ? (
                data.paragraf.map((p, i) => <p key={i}>{p}</p>)
              ) : (
                <p>Belum ada deskripsi untuk destinasi ini.</p>
              )}
            </div>
          </article>

          {/* Sidebar: Map & tombol kembali */}
          <aside>
            <div className="lg:sticky lg:top-28 space-y-5">
              {/* Map */}
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

              {/* Tombol kembali */}
              <Link
                to="/destinasi"
                className="block text-center bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-3 rounded-xl transition shadow"
              >
                ← Kembali ke Daftar Destinasi
              </Link>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}
