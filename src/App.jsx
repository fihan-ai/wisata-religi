// src/App.jsx
import { Routes, Route, Navigate } from "react-router-dom";

// Layouts (sesuai folder mu)
import UserLayout from "./layouts/UserLayout";
import AdminLayout from "./layouts/AdminLayout";

// Halaman user
import Home from "./pages/Home";
import Tentang from "./pages/Tentang";
import Galeri from "./pages/Galeri";
import Kontak from "./pages/Kontak";
import BeritaPage from "./pages/BeritaPage";
import Destinasi from "./pages/Destinasi";
import DetailDestinasi from "./pages/DetailDestinasi";

// Halaman admin (sesuai folder mu)
import DashboardAdmin from "./pages/admin/DashboardAdmin";

function App() {
  return (
    <Routes>
      {/* --- USER AREA --- */}
      <Route
        path="/"
        element={
          <UserLayout>
            <Home />
          </UserLayout>
        }
      />
      <Route
        path="/tentang"
        element={
          <UserLayout>
            <Tentang />
          </UserLayout>
        }
      />
      <Route
        path="/galeri"
        element={
          <UserLayout>
            <Galeri />
          </UserLayout>
        }
      />
      <Route
        path="/berita"
        element={
          <UserLayout>
            <BeritaPage />
          </UserLayout>
        }
      />
      <Route
        path="/kontak"
        element={
          <UserLayout>
            <Kontak />
          </UserLayout>
        }
      />
      <Route
        path="/destinasi"
        element={
          <UserLayout>
            <Destinasi />
          </UserLayout>
        }
      />
      <Route
        path="/destinasi/:slug"
        element={
          <UserLayout>
            <DetailDestinasi />
          </UserLayout>
        }
      />

      {/* --- ADMIN AREA --- */}
      <Route
        path="/admin"
        element={
          <AdminLayout>
            <DashboardAdmin />
          </AdminLayout>
        }
      />

      {/* Fallbacks */}
      <Route path="/Berita" element={<Navigate to="/berita" replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
