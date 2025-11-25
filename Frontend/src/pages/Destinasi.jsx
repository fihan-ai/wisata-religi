import { Link } from "react-router-dom";
import { Star } from "lucide-react"; // icon rating
import { useEffect, useState } from "react";
import { getAllDestinasi } from "../api/destinasiService";

export default function Destinasi() {
  const [destinasiList, setDestinasiList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Helper function to get image URL
  const getImageUrl = (foto) => {
    if (!foto) {
      return "https://placehold.co/600x400/png?text=Gambar+Tidak+Tersedia";
    }
    // If it's already a full URL, return as is
    if (foto.startsWith("http://") || foto.startsWith("https://")) {
      return foto;
    }
    // If it's a storage path, construct the full URL
    const baseUrl = import.meta.env.VITE_API_URL
      ? import.meta.env.VITE_API_URL.replace("/api", "")
      : "http://127.0.0.1:8000";
    return `${baseUrl}/storage/${foto}`;
  };

  useEffect(() => {
    async function fetchDestinasi() {
      try {
        setLoading(true);
        setError(null);
        const data = await getAllDestinasi();

        // Handle different response shapes
        let items = [];
        if (Array.isArray(data)) {
          items = data;
        } else if (data && Array.isArray(data.data)) {
          items = data.data;
        } else {
          items = [];
        }

        // Map backend data to frontend format
        const mappedData = items.map((item) => ({
          id: item.id_destinasi ?? item.id, // <-- pakai id_destinasi
          nama: item.nama_destinasi ?? item.nama ?? "",
          lokasi:
            item.alamat && item.kota
              ? `${item.alamat}, ${item.kota}`
              : item.alamat || item.kota || "Lokasi tidak tersedia",
          deskripsi: item.deskripsi || "Deskripsi tidak tersedia",
          gambar: getImageUrl(item.foto),
          rating: 4.5, // Default rating (not in database yet)
          ulasan: 0, // Default ulasan (not in database yet)
        }));

        setDestinasiList(mappedData);
      } catch (err) {
        console.error("Error fetching destinasi:", err);
        setError("Gagal memuat data destinasi. Silakan coba lagi.");
      } finally {
        setLoading(false);
      }
    }

    fetchDestinasi();
  }, []);

  if (loading) {
    return (
      <section className="pt-32 pb-20 bg-gray-50 min-h-screen">
        <div className="container mx-auto px-6 md:px-12">
          <h1 className="text-3xl md:text-4xl font-bold text-center text-blue-700 mb-10">
            Daftar Destinasi Wisata Religi
          </h1>
          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
              <p className="text-gray-600">Memuat data destinasi...</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="pt-32 pb-20 bg-gray-50 min-h-screen">
        <div className="container mx-auto px-6 md:px-12">
          <h1 className="text-3xl md:text-4xl font-bold text-center text-blue-700 mb-10">
            Daftar Destinasi Wisata Religi
          </h1>
          <div className="flex justify-center items-center py-20">
            <div className="text-center bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
              <p className="text-red-600 mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Muat Ulang
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="pt-32 pb-20 bg-gray-50 min-h-screen">
      <div className="container mx-auto px-6 md:px-12">
        <h1 className="text-3xl md:text-4xl font-bold text-center text-blue-700 mb-10">
          Daftar Destinasi Wisata Religi
        </h1>
        <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
          Temukan keindahan spiritual dan nilai toleransi di berbagai tempat
          ibadah bersejarah di Bangka Belitung.
        </p>

        {destinasiList.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-600 text-lg">
              Belum ada destinasi yang tersedia.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {destinasiList.map((item) => (
              <Link
                key={item.id}
                to={`/destinasi/${item.id}`} // <-- kirim ID ke URL
                className="group bg-white rounded-2xl shadow-md hover:shadow-xl overflow-hidden transition-all duration-300"
              >
                <div className="relative h-56 overflow-hidden">
                  <img
                    src={item.gambar}
                    alt={item.nama}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    onError={(e) => {
                      e.target.src =
                        "https://placehold.co/600x400/png?text=Gambar+Tidak+Tersedia";
                    }}
                  />
                </div>

                <div className="p-5">
                  <h3 className="text-lg font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                    {item.nama}
                  </h3>
                  <p className="text-sm text-gray-500 mb-3">{item.lokasi}</p>

                  <div className="flex items-center gap-1 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.round(item.rating)
                            ? "text-yellow-400 fill-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                    <span className="text-sm text-gray-600 ml-1">
                      {item.rating} ({item.ulasan} ulasan)
                    </span>
                  </div>

                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {item.deskripsi}
                  </p>

                  <span className="inline-block bg-blue-600 text-white text-sm px-4 py-2 rounded-full hover:bg-blue-700 transition">
                    Lihat Detail →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
