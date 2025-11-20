import { MapPin, Users, Star, Eye } from "lucide-react";

export default function DashboardAdmin() {
  const cards = [
    { icon: <MapPin size={24} />, label: "Total Destinasi", value: 34 },
    { icon: <Users size={24} />, label: "Pengunjung Aktif", value: 1200 },
    { icon: <Star size={24} />, label: "Rata-rata Rating", value: "4.6" },
    { icon: <Eye size={24} />, label: "Total View", value: 7521 },
  ];

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">Selamat Datang, Admin 👋</h1>

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
