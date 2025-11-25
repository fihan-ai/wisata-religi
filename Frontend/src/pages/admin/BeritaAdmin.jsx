// src/pages/admin/BeritaAdmin.jsx
import { useMemo, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";

/**
 * Admin page to manage news (Berita)
 * - uses backend artikel table: judul, isi, tanggal_publish, gambar
 * - slug and kategori removed from UI
 */

// fallback image path
const LOCAL_FALLBACK_IMAGE = "/mnt/data/4e716d68-85b0-46d9-b905-b87c44690966.png";

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
  const [items, setItems] = useState([]);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 6;

  const empty = {
    id: null, // maps to id_artikel
    title: "",
    date: new Date().toISOString().slice(0, 10),
    image: "", // dataURL or existing path
    summary: "",
    content: "",
  };

  const [form, setForm] = useState(empty);
  const [open, setOpen] = useState(false);
  const [errors, setErrors] = useState({});

  function normalize(res) {
    return res?.data?.data ?? res?.data ?? res;
  }

  function dataUrlToFile(dataUrl, filename = "upload.png") {
    const arr = dataUrl.split(",");
    const mime = (arr[0].match(/:(.*?);/) || [])[1] || "image/png";
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) u8arr[n] = bstr.charCodeAt(n);
    return new File([u8arr], filename, { type: mime });
  }

  useEffect(() => {
    async function fetchArticles() {
      try {
        const res = await api.get("/artikel");
        const data = normalize(res);
        const mapped = Array.isArray(data)
          ? data.map((a) => ({
              id: a.id_artikel,
              title: a.judul || "",
              date: a.tanggal_publish ? a.tanggal_publish.slice(0, 10) : new Date().toISOString().slice(0, 10),
              image: a.gambar || "",
              summary: a.isi ? String(a.isi).slice(0, 120) : "",
              content: a.isi || "",
            }))
          : [];
        setItems(mapped);
      } catch (e) {
        console.error("Failed to load artikel:", e);
      }
    }
    fetchArticles();
  }, []);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return items.filter(
      (x) =>
        x.title.toLowerCase().includes(q) ||
        x.summary.toLowerCase().includes(q)
    );
  }, [items, query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageData = filtered.slice((page - 1) * pageSize, page * pageSize);
  useEffect(() => setPage(1), [query]);

  const validate = (f) => {
    const e = {};
    if (!f.title || !f.title.trim()) e.title = "Judul wajib diisi";
    if (!f.date) e.date = "Tanggal wajib diisi";
    return e;
  };

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

  const saveToServer = async (f) => {
    // Convert ISO date to MySQL datetime format (YYYY-MM-DD HH:MM:SS)
    const publishDate = f.date 
      ? new Date(f.date).toISOString().slice(0, 19).replace('T', ' ')
      : new Date().toISOString().slice(0, 19).replace('T', ' ');

    const payload = {
      judul: f.title || "",
      isi: f.content || "",
      tanggal_publish: publishDate, // now: "2025-11-25 00:00:00"
    };

    try {
      if (f.image && typeof f.image === "string" && f.image.startsWith("data:")) {
        const fd = new FormData();
        fd.append("judul", payload.judul);
        fd.append("isi", payload.isi);
        fd.append("tanggal_publish", payload.tanggal_publish);
        fd.append("gambar", dataUrlToFile(f.image, `image-${Date.now()}.png`));

        if (!f.id) {
          const res = await api.post("/artikel", fd);
          return normalize(res);
        } else {
          fd.append("_method", "PUT");
          const res = await api.post(`/artikel/${f.id}`, fd);
          return normalize(res);
        }
      } else {
        payload.gambar = (f.image && typeof f.image === "string") ? f.image : "";

        if (!f.id) {
          const res = await api.post("/artikel", payload);
          return normalize(res);
        } else {
          const res = await api.put(`/artikel/${f.id}`, payload);
          return normalize(res);
        }
      }
    } catch (err) {
      throw err;
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const v = validate(form);
    setErrors(v);
    if (Object.keys(v).length) return;

    try {
      const saved = await saveToServer(form);
      const row = {
        id: saved.id_artikel ?? saved.id ?? form.id ?? Date.now(),
        title: saved.judul ?? form.title,
        date: saved.tanggal_publish ? saved.tanggal_publish.slice(0, 10) : form.date,
        image: saved.gambar ?? (typeof form.image === "string" && form.image.startsWith("http") ? form.image : ""),
        summary: (saved.isi ?? form.content ?? "").slice(0, 120),
        content: saved.isi ?? form.content,
      };

      setItems((prev) => {
        if (!form.id) {
          return [row, ...prev];
        } else {
          return prev.map((it) => (it.id === form.id ? row : it));
        }
      });

      setOpen(false);
      setForm(empty);
      setErrors({});
    } catch (err) {
      console.error("Save failed:", err);
      const res = err?.response;
      if (res && res.status === 422) {
        const serverErrors = res.data?.errors ?? { message: res.data?.message ?? "Validation failed" };
        setErrors(serverErrors);
        return;
      }
      alert("Simpan gagal. Periksa console untuk detail.");
    }
  };

  const onEdit = (row) => {
    setForm({
      id: row.id,
      title: row.title,
      date: row.date,
      image: row.image,
      summary: row.summary,
      content: row.content,
    });
    setOpen(true);
    setErrors({});
  };

  const onDelete = async (id) => {
    if (!confirm("Hapus berita ini?")) return;
    try {
      await api.delete(`/artikel/${id}`);
      setItems((p) => p.filter((x) => x.id !== id));
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Hapus gagal. Periksa console.");
    }
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
            placeholder="Cari judul atau ringkasan…"
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
              <th className="text-left p-3">Tanggal</th>
              <th className="text-left p-3">Gambar</th>
              <th className="text-left p-3">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {pageData.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-6 text-center text-gray-500">
                  Belum ada data
                </td>
              </tr>
            ) : (
              pageData.map((row) => (
                <tr key={row.id} className="border-t hover:bg-gray-50">
                  <td className="p-3 font-medium">
                    <Link to={`/berita/${row.id}`} className="text-blue-700 hover:underline">
                      {row.title}
                    </Link>
                    <div className="text-xs text-gray-500 mt-1 line-clamp-1">{row.summary}</div>
                  </td>
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
