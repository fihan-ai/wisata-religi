// src/pages/admin/BeritaAdmin.jsx
import { useMemo, useState, useEffect } from "react";
import { Link } from "react-router-dom";

/**
 * Admin page to manage news (Berita)
 * - image upload from device (stored as dataURL in state for preview)
 * - slug auto-generation and uniqueness validation
 * - link to /berita/:slug
 *
 * NOTE: For production, replace dataURL storage with real upload to server/CDN.
 */

// fallback image path (file you uploaded)
const LOCAL_FALLBACK_IMAGE = "/mnt/data/4e716d68-85b0-46d9-b905-b87c44690966.png";

function slugify(s) {
  return s
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold">{title}</h3>
          <button onClick={onClose} className="p-2 rounded hover:bg-gray-100">✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

export default function BeritaAdmin() {
  const [items, setItems] = useState(() => [
    {
      id: 1,
      title: "Peresmian Kawasan Wisata Religi",
      slug: "peresmian-kawasan-wisata-religi",
      category: "Event",
      date: "2025-02-10",
      image: "",
      summary: "Pemerintah meresmikan kawasan wisata religi.",
      content: "<p>Detail acara peresmian...</p>",
    },
    {
      id: 2,
      title: "Agenda Ziarah Akbar",
      slug: "agenda-ziarah-akbar",
      category: "Pengumuman",
      date: "2025-02-02",
      image: "",
      summary: "Jadwal kegiatan ziarah akbar tahunan.",
      content: "<p>Pengaturan lalu lintas dan shuttle...</p>",
    },
  ]);

  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 6;

  const empty = {
    id: null,
    title: "",
    slug: "",
    category: "Event",
    date: new Date().toISOString().slice(0, 10),
    image: "", // dataURL or empty
    summary: "",
    content: "",
  };

  const [form, setForm] = useState(empty);
  const [open, setOpen] = useState(false);
  const [errors, setErrors] = useState({});

  // search/filter
  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return items.filter(
      (x) =>
        x.title.toLowerCase().includes(q) ||
        x.summary.toLowerCase().includes(q) ||
        (x.category || "").toLowerCase().includes(q)
    );
  }, [items, query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageData = filtered.slice((page - 1) * pageSize, page * pageSize);
  useEffect(() => setPage(1), [query]);

  // auto-generate slug from title if slug empty
  useEffect(() => {
    if (!form.title) return;
    if (!form.slug) {
      setForm((f) => ({ ...f, slug: slugify(form.title) }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.title]);

  const validate = (f) => {
    const e = {};
    if (!f.title || !f.title.trim()) e.title = "Judul wajib diisi";
    if (!f.slug || !f.slug.trim()) e.slug = "Slug wajib diisi";
    const exists = items.find((i) => i.slug === f.slug && i.id !== f.id);
    if (exists) e.slug = "Slug sudah digunakan, ubah menjadi unik";
    if (!f.date) e.date = "Tanggal wajib diisi";
    return e;
  };

  // file upload -> dataURL
  const handleFileChange = (file) => {
    if (!file) {
      setForm((f) => ({ ...f, image: "" }));
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target.result;
      setForm((f) => ({ ...f, image: dataUrl }));
    };
    reader.readAsDataURL(file);
  };

  const onSubmit = (e) => {
    e.preventDefault();
    const v = validate(form);
    setErrors(v);
    if (Object.keys(v).length) return;

    if (form.id == null) {
      setItems((prev) => [{ ...form, id: Date.now() }, ...prev]);
    } else {
      setItems((prev) => prev.map((x) => (x.id === form.id ? form : x)));
    }
    setOpen(false);
    setForm(empty);
    setErrors({});
  };

  const onEdit = (row) => {
    setForm(row);
    setOpen(true);
    setErrors({});
  };

  const onDelete = (id) => {
    if (confirm("Hapus berita ini?")) setItems((p) => p.filter((x) => x.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-blue-700">Kelola Berita</h1>
          <p className="text-gray-600">Tambah, ubah, dan hapus berita. Gambar diunggah dari perangkat.</p>
        </div>

        <div className="flex gap-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari judul, ringkasan, atau kategori…"
            className="px-3 py-2 border rounded-xl bg-white w-64"
            aria-label="Cari berita"
          />
          <button
            onClick={() => {
              setForm(empty);
              setOpen(true);
            }}
            className="px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700"
          >
            + Tambah
          </button>
        </div>
      </header>

      {/* Table */}
      <div className="overflow-x-auto bg-white rounded-2xl shadow-sm border">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="text-left p-3">Judul</th>
              <th className="text-left p-3">Kategori</th>
              <th className="text-left p-3">Tanggal</th>
              <th className="text-left p-3">Gambar</th>
              <th className="text-left p-3">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {pageData.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-6 text-center text-gray-500">
                  Belum ada data
                </td>
              </tr>
            ) : (
              pageData.map((row) => (
                <tr key={row.id} className="border-t hover:bg-gray-50">
                  <td className="p-3 font-medium">
                    <Link to={`/berita/${row.slug}`} className="text-blue-700 hover:underline">
                      {row.title}
                    </Link>
                    <div className="text-xs text-gray-500 mt-1 line-clamp-1">{row.summary}</div>
                  </td>
                  <td className="p-3">{row.category}</td>
                  <td className="p-3">{new Date(row.date).toLocaleDateString("id-ID")}</td>
                  <td className="p-3">
                    <div className="w-20 h-12 rounded overflow-hidden border">
                      <img
                        src={row.image || LOCAL_FALLBACK_IMAGE}
                        alt={row.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="flex gap-2">
                      <button onClick={() => onEdit(row)} className="px-3 py-1 rounded-lg border">
                        Edit
                      </button>
                      <button onClick={() => onDelete(row.id)} className="px-3 py-1 rounded-lg border text-red-600">
                        Hapus
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {filtered.length > pageSize && (
        <div className="flex items-center justify-center gap-2">
          <button
            className="px-3 py-2 border rounded-lg bg-white disabled:opacity-40"
            disabled={page === 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Prev
          </button>
          <div className="px-3 py-2 border rounded-lg bg-white">
            Halaman {page} / {totalPages}
          </div>
          <button
            className="px-3 py-2 border rounded-lg bg-white disabled:opacity-40"
            disabled={page === totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            Next
          </button>
        </div>
      )}

      {/* Modal */}
      <Modal
        open={open}
        onClose={() => {
          setOpen(false);
          setForm(empty);
          setErrors({});
        }}
        title={form.id ? "Edit Berita" : "Tambah Berita"}
      >
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Judul</label>
              <input
                className={`w-full border rounded-xl px-3 py-2 ${errors.title ? "border-red-400" : ""}`}
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
              />
              {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Kategori</label>
              <select
                className="w-full border rounded-xl px-3 py-2"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                <option>Event</option>
                <option>Pengumuman</option>
                <option>Panduan</option>
                <option>Update Fasilitas</option>
                <option>Komunitas</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Slug</label>
              <input
                className={`w-full border rounded-xl px-3 py-2 ${errors.slug ? "border-red-400" : ""}`}
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: slugify(e.target.value) })}
                required
                placeholder="peresmian-kawasan-wisata-religi"
              />
              {errors.slug && <p className="text-xs text-red-500 mt-1">{errors.slug}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Tanggal</label>
              <input
                type="date"
                className={`w-full border rounded-xl px-3 py-2 ${errors.date ? "border-red-400" : ""}`}
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
              />
              {errors.date && <p className="text-xs text-red-500 mt-1">{errors.date}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Ringkasan</label>
            <textarea
              className="w-full border rounded-xl px-3 py-2 min-h-[100px]"
              value={form.summary}
              onChange={(e) => setForm({ ...form, summary: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Konten (HTML sederhana)</label>
            <textarea
              className="w-full border rounded-xl px-3 py-2 min-h-[140px]"
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              placeholder="<p>Isi konten...</p>"
            />
            <p className="text-xs text-gray-500 mt-1">Saat produksi, gunakan rich text editor atau wysiwyg dan simpan HTML di backend.</p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Gambar (unggah dari perangkat)</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files && e.target.files[0];
                handleFileChange(file);
              }}
              className="w-full text-sm"
            />
            <div className="flex items-center gap-2 mt-2">
              <button
                type="button"
                onClick={() => setForm((f) => ({ ...f, image: "" }))}
                className="px-3 py-1 rounded-lg border text-sm"
              >
                Hapus Gambar
              </button>
              <p className="text-xs text-gray-500">Preview akan muncul di bawah. Jika kosong, fallback akan dipakai.</p>
            </div>

            {/* preview */}
            <div className="mt-3 flex items-center gap-4">
              <div className="w-40 h-24 rounded overflow-hidden border">
                <img src={form.image || LOCAL_FALLBACK_IMAGE} alt="preview" className="w-full h-full object-cover" />
              </div>
              <div className="text-sm text-gray-600">Preview gambar (data disimpan sementara di state sebagai dataURL).</div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                setForm(empty);
                setErrors({});
              }}
              className="px-4 py-2 rounded-xl border"
            >
              Batal
            </button>
            <button type="submit" className="px-4 py-2 rounded-xl bg-blue-600 text-white">
              Simpan
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
