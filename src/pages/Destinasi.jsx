import { Link } from "react-router-dom";
import { Star } from "lucide-react"; // icon rating

export default function Destinasi() {
  const destinasiList = [
    {
      id: 1,
      nama: "Masjid Jami Pangkalpinang",
      lokasi: "Pangkalpinang, Bangka Belitung",
      deskripsi:
        "Masjid tertua di Pangkalpinang yang menjadi pusat kegiatan keagamaan dan simbol sejarah Islam di Pulau Bangka.",
      gambar: "https://placehold.co/600x400/png?text=Masjid+Jami",
      rating: 4.8,
      ulasan: 125,
      slug: "masjid-jami-pangkalpinang",
    },
    {
      id: 2,
      nama: "Klenteng Dewi Laut",
      lokasi: "Pangkalpinang, Bangka",
      deskripsi:
        "Tempat ibadah umat Konghucu yang berusia ratusan tahun, terkenal dengan arsitektur indah dan sejarah toleransi.",
      gambar: "https://placehold.co/600x400/png?text=Klenteng+Dewi+Laut",
      rating: 4.6,
      ulasan: 89,
      slug: "klenteng-dewi-laut",
    },
    {
      id: 3,
      nama: "Gereja St. Yosef",
      lokasi: "Pangkalpinang",
      deskripsi:
        "Gereja Katolik bersejarah yang menjadi pusat peribadatan dan persaudaraan antarumat di Bangka Belitung.",
      gambar: "https://placehold.co/600x400/png?text=Gereja+St+Yosef",
      rating: 4.9,
      ulasan: 65,
      slug: "gereja-st-yosef",
    },
  ];

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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {destinasiList.map((item) => (
            <Link
              key={item.id}
              to={`/destinasi/${item.slug}`}
              className="group bg-white rounded-2xl shadow-md hover:shadow-xl overflow-hidden transition-all duration-300"
            >
              <div className="relative h-56 overflow-hidden">
                <img
                  src={item.gambar}
                  alt={item.nama}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
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
      </div>
    </section>
  );
}
