import { Link } from "react-router-dom";
import { useState, useEffect, useRef } from "react"; // Tambahkan useRef
import { motion, AnimatePresence } from "framer-motion";
// Hapus: import CarouselNavigation from "./CarouselNavigation";

// --- KOMPONEN NAVIGASI KITA PINDAHKAN KE SINI ---
function CarouselNavigation({ items, activeIndex, onItemClick }) {
  const scrollRef = useRef(null);

  // Efek untuk auto-scroll ke item yang aktif
  useEffect(() => {
    if (scrollRef.current) {
      const activeElement = scrollRef.current.children[activeIndex];
      if (activeElement) {
        const parent = scrollRef.current;
        const childLeft = activeElement.offsetLeft;
        const childWidth = activeElement.clientWidth;
        const parentWidth = parent.clientWidth;
        
        // Kalkulasi untuk menengahkan item aktif
        const scrollAmount = childLeft - (parentWidth / 2) + (childWidth / 2);
        parent.scrollTo({ left: scrollAmount, behavior: 'smooth' });
      }
    }
  }, [activeIndex]);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const { current } = scrollRef;
      const scrollAmount = 200; // Sesuaikan jarak scroll
      if (direction === 'left') {
        current.scrollLeft -= scrollAmount;
      } else {
        current.scrollLeft += scrollAmount;
      }
    }
  };

  return (
    <div className="relative w-full max-w-lg md:max-w-2xl mx-auto px-12">
      
      {/* Garis horizontal */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[1px] bg-white/30 w-3/4"></div>

      {/* Tombol Panah Kiri */}
      <button 
        onClick={() => scroll('left')}
        className="absolute left-0 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white rounded-full p-2 backdrop-blur-sm transition z-10"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
      </button>

      {/* Area Scrollable Menu */}
      <div 
        ref={scrollRef}
        className="flex items-center gap-6 md:gap-8 overflow-x-auto no-scrollbar py-6 scroll-smooth snap-x"
      >
        {items.map((item, index) => {
          const isActive = index === activeIndex;
          return (
            <button
              key={item.title} // Menggunakan title sebagai key unik
              onClick={() => onItemClick(index)}
              className={`whitespace-nowrap flex-shrink-0 text-center transition-all duration-300 snap-center
                ${isActive 
                  ? 'text-white text-xl md:text-2xl font-bold scale-110' 
                  : 'text-white/60 text-base md:text-lg hover:text-white/80'}`}
            >
              {/* Segitiga penunjuk */}
              {isActive && (
                 <div className="w-0 h-0 mx-auto mb-2 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-white"></div>
              )}
              {item.title} {/* Menggunakan item.title */}
            </button>
          );
        })}
      </div>

      {/* Tombol Panah Kanan */}
      <button 
        onClick={() => scroll('right')}
        className="absolute right-0 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white rounded-full p-2 backdrop-blur-sm transition z-10"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
      </button>
    </div>
  );
}
// --- AKHIR DARI KOMPONEN NAVIGASI ---


const slides = [
  {
    image: "/masjid-jamik-pangkalpinang.jpg",
    title: "Masjid Jami", 
    desc: "Menikmati keindahan dan sejarah salah satu masjid tertua di Bangka Belitung.",
  },
  {
    image: "/klentengdewi.jpg",
    title: "Klenteng Dewi Laut",
    desc: "Tempat ibadah dan ziarah yang kaya akan budaya dan toleransi umat.",
  },
  {
    image: "/gereja-st-yosef.jpg",
    title: "Gereja St. Yosef",
    desc: "Simbol keharmonisan antar umat beragama di Kota Pangkalpinang.",
  },
];

// Efek teks jatuh (tetap sama)
const container = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
};
const drop = {
  hidden: { y: -50, opacity: 0 },
  visible: {
    y: 0, opacity: 1,
    transition: { type: "spring", damping: 12, stiffness: 200 },
  },
};

export default function Hero() {
  const [current, setCurrent] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 7000);
    return () => clearInterval(timer);
  }, []);

  const splitText = (text) =>
    text.split("").map((char, i) => (
      <motion.span key={i} variants={drop} className="inline-block">
        {char === " " ? "\u00A0" : char}
      </motion.span>
    ));

  return (
    <section className="relative h-screen w-full overflow-hidden">
      <AnimatePresence>
        <motion.div
          key={current}
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${slides[current].image})` }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5 }}
        >
          <div className="absolute inset-0 bg-black/40"></div>

          {/* Konten tengah (tetap sama) */}
          <div className="relative z-10 flex flex-col items-center justify-center text-center text-white h-full px-6">
            <motion.h1
              className="text-4xl md:text-5xl font-bold mb-4 leading-tight"
              variants={container}
              initial="hidden"
              animate="visible"
            >
              {splitText(slides[current].title)}
            </motion.h1>

            <motion.p
              className="text-lg md:text-xl mb-6 max-w-2xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2, duration: 1 }}
            >
              {slides[current].desc}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.8, duration: 0.5 }}
            >
              <Link
                to="/destinasi"
                className="bg-yellow-400 text-black px-6 py-3 rounded-full font-semibold hover:bg-yellow-500 transition"
              >
                Jelajahi Sekarang
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigasi dipanggil langsung dari fungsi di atas */}
      <div className="absolute bottom-6 left-0 right-0 z-20">
        <CarouselNavigation 
          items={slides}
          activeIndex={current}
          onItemClick={setCurrent}
        />
      </div>
      
    </section>
  );
}