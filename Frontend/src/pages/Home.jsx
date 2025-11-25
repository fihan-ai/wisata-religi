import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Hero from "../components/Hero";
import CardWisata from "../components/CardWisata";
import CardBerita from "../components/CardBerita";
import { getAllDestinasi } from "../api/destinasiService";
import { getAllArtikel } from "../api/artikelService";

export default function Home() {
  const navigate = useNavigate();
  const [wisataData, setWisataData] = useState([]);
  const [beritaData, setBeritaData] = useState([]);
  const [loadingWisata, setLoadingWisata] = useState(true);
  const [loadingBerita, setLoadingBerita] = useState(true);

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

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "Tanggal tidak tersedia";
    try {
      const date = new Date(dateString);
      const options = { year: "numeric", month: "long", day: "numeric" };
      return date.toLocaleDateString("id-ID", options);
    } catch {
      return dateString;
    }
  };

  // Truncate text for excerpt
  const truncateText = (text, maxLength = 120) => {
    if (!text) return "Tidak ada ringkasan tersedia";
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + "...";
  };

  // Fetch destinasi data
  useEffect(() => {
    async function fetchDestinasi() {
      try {
        setLoadingWisata(true);
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

        // Map backend data to frontend format (limit to 3 for home page)
        const mappedData = items.slice(0, 3).map((item) => ({
          id: item.id_destinasi ?? item.id, // <-- pakai ID destinasi
          name: item.nama_destinasi ?? item.nama ?? "",
          image: getImageUrl(item.foto),
          description: item.deskripsi || "Deskripsi tidak tersedia",
        }));

        setWisataData(mappedData);
      } catch (err) {
        console.error("Error fetching destinasi:", err);
        setWisataData([]);
      } finally {
        setLoadingWisata(false);
      }
    }

    fetchDestinasi();
  }, []);

  // Fetch artikel data
  useEffect(() => {
    async function fetchArtikel() {
      try {
        setLoadingBerita(true);
        const data = await getAllArtikel();

        // Handle different response shapes
        let items = [];
        if (Array.isArray(data)) {
          items = data;
        } else if (data && Array.isArray(data.data)) {
          items = data.data;
        } else {
          items = [];
        }

        // Sort by tanggal_publish (newest first) and limit to 3
        const sortedItems = items
          .sort((a, b) => {
            const dateA = new Date(a.tanggal_publish || 0);
            const dateB = new Date(b.tanggal_publish || 0);
            return dateB - dateA;
          })
          .slice(0, 3);

        // Map backend data to frontend format
        const mappedData = sortedItems.map((item) => ({
          id: item.id_artikel ?? item.id,
          title: item.judul || "Judul tidak tersedia",
          excerpt: truncateText(item.isi || ""),
          imageUrl: getImageUrl(item.gambar),
          date: formatDate(item.tanggal_publish),
          category: "Berita", // Default category (not in database)
          slug: String(item.id_artikel ?? item.id), // <-- slug = ID artikel
        }));

        setBeritaData(mappedData);
      } catch (err) {
        console.error("Error fetching artikel:", err);
        setBeritaData([]);
      } finally {
        setLoadingBerita(false);
      }
    }

    fetchArtikel();
  }, []);

  // Handle navigation for CardWisata
  const handleWisataClick = (id) => {
    // sekarang pakai ID, bukan slug nama
    navigate(`/destinasi/${id}`);
  };

  return (
    <div className="pt-0">
      {/* Jangan beri padding-top, biar Hero full */}
      <Hero />

      {/* ===== Section Wisata ===== */}
      <section className="container mx-auto px-6 py-12">
        <h2 className="text-3xl font-bold text-center mb-8 text-blue-700">
          Destinasi Wisata Religi
        </h2>
        {loadingWisata ? (
          <div className="flex justify-center items-center py-12">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
              <p className="text-gray-600 text-sm">Memuat destinasi...</p>
            </div>
          </div>
        ) : wisataData.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Belum ada destinasi yang tersedia.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {wisataData.map((wisata) => (
              <CardWisata
                key={wisata.id}
                {...wisata}
                onClick={() => handleWisataClick(wisata.id)} // <-- kirim ID
              />
            ))}
          </div>
        )}
      </section>

      {/* ===== Section Berita ===== */}
      <section className="container mx-auto px-6 py-12 bg-gray-50 rounded-xl">
        <h2 className="text-3xl font-bold text-center mb-8 text-blue-700">
          Berita Terbaru
        </h2>
        {loadingBerita ? (
          <div className="flex justify-center items-center py-12">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
              <p className="text-gray-600 text-sm">Memuat berita...</p>
            </div>
          </div>
        ) : beritaData.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Belum ada berita yang tersedia.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {beritaData.map((berita) => (
              <CardBerita key={berita.id} {...berita} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
