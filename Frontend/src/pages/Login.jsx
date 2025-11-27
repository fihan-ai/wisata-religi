import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // base URL API (bisa pakai VITE_API_URL biar fleksibel)
  const baseApi =
    import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`${baseApi}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        Swal.fire({
          icon: "error",
          title: "Login Gagal",
          text: data.message || "Email atau password salah.",
        });
        return;
      }

      // data dari AuthController:
      // { message, token, user: { id, name, email, is_admin } }

      if (!data.user || !data.user.is_admin) {
        Swal.fire({
          icon: "warning",
          title: "Akses Ditolak",
          text: "Akun ini tidak memiliki hak akses admin.",
        });
        return;
      }

      // simpan token & data admin
      localStorage.setItem("admin_token", data.token);
      localStorage.setItem("admin_name", data.user.name);
      localStorage.setItem("admin_email", data.user.email);
      localStorage.setItem("admin_is_admin", data.user.is_admin ? "1" : "0");

      Swal.fire({
        icon: "success",
        title: "Login Berhasil",
        text: `Selamat datang, ${data.user.name}`,
        timer: 1800,
        showConfirmButton: false,
      });

      setTimeout(() => {
        navigate("/admin");
      }, 1800);
    } catch (err) {
      console.error("Login error:", err);
      Swal.fire({
        icon: "error",
        title: "Kesalahan Server",
        text: "Tidak dapat terhubung ke server. Coba lagi nanti.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-50">
      <div className="bg-white shadow-2xl rounded-2xl flex w-[850px] overflow-hidden">
        {/* Panel kiri (branding) */}
        <div className="w-1/2 bg-blue-600 flex flex-col justify-center items-center text-white p-8">
          <img
            src="/card/logompp.png"
            alt="Logo"
            className="w-20 h-20 mb-4 rounded-full bg-white p-2"
          />
          <h1 className="text-2xl font-bold text-center">
            Sistem Informasi <br /> Pariwisata Religi
          </h1>
          <p className="text-sm mt-2 opacity-90">Kota Pangkalpinang</p>
          <p className="text-xs mt-6 opacity-80 text-center">
            Halaman ini hanya diperuntukkan bagi admin untuk mengelola data
            destinasi, artikel, dan konten lainnya.
          </p>
        </div>

        {/* Panel kanan (form login) */}
        <div className="w-1/2 p-10 flex flex-col justify-center">
          <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
            Login Admin
          </h2>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-gray-700 text-sm mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-400 outline-none"
                placeholder="Masukkan email admin"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 text-sm mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-400 outline-none"
                placeholder="Masukkan password"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2 rounded text-white text-sm font-semibold transition ${
                loading
                  ? "bg-blue-300 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {loading ? "Memproses..." : "LOGIN"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
