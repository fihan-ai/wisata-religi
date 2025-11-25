export default function Kontak() {
  return (
    <div className="bg-gray-50 pt-32 pb-20 px-6">
      <div className="max-w-5xl mx-auto bg-white shadow-md rounded-2xl p-8 md:p-12">
        
        {/* Judul */}
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-blue-700 mb-4">
            Hubungi Kami
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Apabila Anda memiliki pertanyaan, saran, atau membutuhkan informasi lebih lanjut 
            seputar destinasi wisata religi di Kota Pangkalpinang, silakan hubungi kami melalui data berikut.
          </p>
        </div>

        {/* Grid Konten */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          
          {/* Informasi Kontak */}
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Informasi Kontak
            </h2>
            <ul className="space-y-4 text-gray-700">
              <li>
                <span className="font-semibold">Alamat:</span> <br />
                Dinas Pariwisata Kota Pangkalpinang <br />
                Jl. Merdeka No. 45, Pangkalpinang, Kepulauan Bangka Belitung
              </li>

              <li>
                <span className="font-semibold">Telepon:</span> <br />
                (0717) 123456
              </li>

              <li>
                <span className="font-semibold">Email:</span> <br />
                info@wisatareligi-pangkalpinang.go.id
              </li>

              <li>
                <span className="font-semibold">Jam Layanan:</span> <br />
                Senin – Jumat, 08.00 – 16.00 WIB
              </li>
            </ul>
          </div>

          {/* Form Kontak */}
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Kirim Pesan
            </h2>

            <form className="space-y-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  placeholder="Masukkan nama lengkap"
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="Masukkan email aktif"
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Subjek
                </label>
                <input
                  type="text"
                  placeholder="Masukkan subjek pesan"
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Pesan
                </label>
                <textarea
                  rows="4"
                  placeholder="Tulis pesan Anda di sini..."
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
              >
                Kirim Pesan
              </button>
            </form>
          </div>

        </div>

        {/* Catatan tambahan */}
        <div className="mt-10 text-center text-sm text-gray-500 italic">
          Kami akan merespons pesan Anda secepat mungkin pada jam operasional.
        </div>
      </div>
    </div>
  );
}
