import Hero from "../components/Hero";
import CardWisata from "../components/CardWisata";
import wisataData from "../data/wisataData";
import CardBerita from "../components/CardBerita";
import beritaData from "../data/beritaData";

export default function Home() {
  return (
    <div className="pt-0"> {/* Jangan beri padding-top, biar Hero full */}
      <Hero />

      {/* ===== Section Wisata ===== */}
      <section className="container mx-auto px-6 py-12">
        <h2 className="text-3xl font-bold text-center mb-8 text-blue-700">
          Destinasi Wisata Religi
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {wisataData.map((wisata) => (
            <CardWisata key={wisata.id} {...wisata} />
          ))}
        </div>
      </section>

      {/* ===== Section Berita ===== */}
      <section className="container mx-auto px-6 py-12 bg-gray-50 rounded-xl">
        <h2 className="text-3xl font-bold text-center mb-8 text-blue-700">
          Berita Terbaru
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {beritaData.map((berita) => (
            <CardBerita key={berita.id} {...berita} />
          ))}
        </div>
      </section>
    </div>
  );
}
