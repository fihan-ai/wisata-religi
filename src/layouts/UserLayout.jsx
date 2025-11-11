import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function LayoutUser({ children }) {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Navbar transparan (akan berubah putih saat scroll) */}
      <Navbar />

      {/* Konten utama (misalnya HeroSlider, dsb) */}
      <main className="flex-1 w-full overflow-hidden">
        {children}
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
