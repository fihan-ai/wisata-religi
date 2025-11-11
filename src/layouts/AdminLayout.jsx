import { Link } from "react-router-dom";

export default function AdminLayout({ children }) {
  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-blue-700 text-white flex flex-col">
        <div className="p-4 text-2xl font-bold border-b border-blue-500">
          Admin Panel
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <Link
            to="/admin"
            className="block py-2 px-3 rounded hover:bg-blue-600 transition"
          >
            Dashboard
          </Link>
          <Link
            to="/admin/berita"
            className="block py-2 px-3 rounded hover:bg-blue-600 transition"
          >
            Kelola Berita
          </Link>
          <Link
            to="/admin/destinasi"
            className="block py-2 px-3 rounded hover:bg-blue-600 transition"
          >
            Kelola Destinasi
          </Link>
        </nav>

        <div className="p-4 border-t border-blue-500 text-sm text-center">
          © 2025 Admin
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8 overflow-y-auto">{children}</main>
    </div>
  );
}
