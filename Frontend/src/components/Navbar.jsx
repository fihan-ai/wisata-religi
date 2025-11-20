import { Link, useLocation } from "react-router-dom";
import { useState, useEffect, useRef } from "react";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === "/";

  useEffect(() => {
    closeDropdown();
    if (!isHome) { setScrolled(true); return; }
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isHome, location.pathname]);

  useEffect(() => {
    if (activeDropdown) setIsDropdownVisible(true);
    else {
      const t = setTimeout(() => setIsDropdownVisible(false), 300);
      return () => clearTimeout(t);
    }
  }, [activeDropdown]);

  const textColorClass = scrolled || activeDropdown ? "text-gray-700" : "text-white";
  const navBgClass = scrolled || activeDropdown ? "bg-white shadow-md" : "bg-transparent";

  const handleDropdownToggle = (menuName) => {
    setActiveDropdown(prev => (prev === menuName ? null : menuName));
  };
  const closeDropdown = () => setActiveDropdown(null);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${navBgClass}`}>
      <div className="container mx-auto px-4 md:px-8 flex items-center justify-between py-4 lg:py-6 relative z-20 bg-inherit">

        <div className="flex-shrink-0">
          <Link to="/" onClick={closeDropdown}
            className={`text-2xl md:text-3xl font-extrabold tracking-wide transition-colors ${scrolled || activeDropdown ? "text-blue-700" : "text-white"}`}>
            WisataReligi
          </Link>
        </div>

        <ul className={`hidden md:flex items-center gap-8 text-base lg:text-[17px] font-medium transition-colors ${textColorClass}`}>
          <li><Link to="/" onClick={closeDropdown} className="hover:text-blue-500 transition-colors">Beranda</Link></li>
          <li><Link to="/tentang" onClick={closeDropdown} className="hover:text-blue-500 transition-colors">Tentang</Link></li>

          <li>
            <button
              onClick={() => handleDropdownToggle('infoPariwisata')}
              aria-expanded={activeDropdown === 'infoPariwisata'}
              className={`hover:text-blue-500 transition-colors focus:outline-none ${activeDropdown === 'infoPariwisata' ? 'text-blue-600 font-bold border-b-2 border-blue-600' : ''}`}
            >
              Informasi Pariwisata
            </button>
          </li>

          <li><Link to="/kontak" onClick={closeDropdown} className="hover:text-blue-500 transition-colors">Kontak</Link></li>
        </ul>

        <div className={`flex items-center gap-4 transition-colors ${textColorClass}`}>
          <button aria-label="Search" className="hover:text-blue-500">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Mega menu */}
      <div
        className={`absolute top-full left-0 w-full border-t border-gray-100 overflow-hidden transition-all duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] z-10
          ${activeDropdown === 'infoPariwisata'
            ? 'opacity-100 translate-y-0 visible bg-white/90 backdrop-blur-md shadow-xl'
            : 'opacity-0 -translate-y-8 invisible bg-white/0 backdrop-blur-none pointer-events-none'}`}
      >
        <div className="container mx-auto px-8 py-8 relative">
          <button onClick={closeDropdown} className="absolute top-6 right-6 text-gray-400 hover:text-gray-800">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <h3 className="text-2xl font-bold text-gray-800 mb-6">Informasi Pariwisata</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* === DIGANTI: menuju daftar destinasi === */}
            <Link to="/destinasi" onClick={closeDropdown} className="group">
              <div className="relative overflow-hidden rounded-xl h-48 bg-gray-200">
                <img
                  src="https://placehold.co/600x400/png?text=Daftar+Destinasi"
                  alt="Daftar Destinasi Wisata Religi"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-4">
                  <span className="text-white text-xl font-bold">Daftar Destinasi</span>
                </div>
              </div>
            </Link>

            {/* Kartu lain tetap */}
            <Link to="/berita" onClick={closeDropdown} className="group">
              <div className="relative overflow-hidden rounded-xl h-48 bg-gray-200">
                <img
                  src="https://placehold.co/600x400/png?text=Berita+Terbaru"
                  alt="Berita Terbaru"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-4">
                  <span className="text-white text-xl font-bold">Berita Terbaru Indonesia</span>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
