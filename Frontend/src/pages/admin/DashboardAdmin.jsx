import { useEffect, useState } from "react";
import { MapPin, FileText } from "lucide-react";
import { getAllDestinasi } from "../../api/destinasiService";
import { getAllArtikel } from "../../api/artikelService";

export default function DashboardAdmin() {
  const [totalDestinasi, setTotalDestinasi] = useState(0);
  const [totalBerita, setTotalBerita] = useState(0);
  const [loading, setLoading] = useState(true);

  // Ambil nama admin dari localStorage
  const adminName = localStorage.getItem("admin_name") || "Admin";

  useEffect(() => {
    async function fetchCounts() {
      try {
        setLoading(true);

        const [destRaw, artRaw] = await Promise.all([
          getAllDestinasi(),
          getAllArtikel(),
        ]);

        // Normalisasi respons destinasi
        let destItems = [];
        if (Array.isArray(destRaw)) destItems = destRaw;
        else if (destRaw && Array.isArray(destRaw.data)) destItems = destRaw.data;

        // Normalisasi respons berita
        let artItems = [];
        if (Array.isArray(artRaw)) artItems = artRaw;
        else if (artRaw && Array.isArray(artRaw.data)) artItems = artRaw.data;

        setTotalDestinasi(destItems.length);
        setTotalBerita(artItems.length);
      } catch (err) {
        console.error("Gagal memuat data dashboard:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchCounts();
  }, []);

  const cards = [
    {
      icon: <MapPin size={24} />,
      label: "Total Destinasi",
      value: loading ? "…" : totalDestinasi,
    },
    {
      icon: <FileText size={24} />,
      label: "Total Berita",
      value: loading ? "…" : totalBerita,
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">
        Selamat Datang, {adminName} 👋
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((c, i) => (
          <div
            key={i}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col items-start hover:shadow-md transition"
          >
            <div className="text-blue-600 mb-3">{c.icon}</div>
            <p className="text-sm text-gray-500">{c.label}</p>
            <h2 className="text-2xl font-bold text-gray-800 mt-1">{c.value}</h2>
          </div>
        ))}
      </div>
    </div>
  );
}
