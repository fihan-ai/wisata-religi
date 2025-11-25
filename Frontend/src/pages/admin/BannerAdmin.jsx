import { useMemo, useState, useEffect } from "react";
import api from "../../api/axios";

// fallback image
const LOCAL_FALLBACK_IMAGE = "/mnt/data/4e716d68-85b0-46d9-b905-b87c44690966.png";

function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold">{title}</h3>
          <button onClick={onClose} className="p-2 rounded hover:bg-gray-100">✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

export default function BannerAdmin() {
  const [items, setItems] = useState([]);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 6;

  const empty = { id: null, title: "", description: "", image: "" };
  const [form, setForm] = useState(empty);
  const [open, setOpen] = useState(false);
  const [errors, setErrors] = useState({});

  function normalize(res) {
    return res?.data?.data ?? res?.data ?? res;
  }

  function dataUrlToFile(dataUrl, filename = "banner.png") {
    const arr = dataUrl.split(",");
    const mime = (arr[0].match(/:(.*?);/) || [])[1] || "image/png";
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) u8arr[n] = bstr.charCodeAt(n);
    return new File([u8arr], filename, { type: mime });
  }

  // Fetch banners from backend
  useEffect(() => {
    async function fetchBanners() {
      try {
        const res = await api.get("/banner");
        const data = normalize(res);
        const mapped = Array.isArray(data)
          ? data.map((b) => ({
              id: b.id,
              title: b.title || (b.foto ? b.foto.split('/').pop() : "Banner"),
              description: b.description || "",
              image: b.foto || "",
            }))
          : [];
        setItems(mapped);
      } catch (e) {
        console.error("Failed to load banners:", e);
      }
    }
    fetchBanners();
  }, []);

  // Search/filter
  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return items.filter((x) => x.title.toLowerCase().includes(q));
  }, [items, query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageData = filtered.slice((page - 1) * pageSize, page * pageSize);
  useEffect(() => setPage(1), [query]);

  // Convert file → dataURL
  const handleFile = (file) => {
    if (!file) {
      setForm((f) => ({ ...f, image: "" }));
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      setForm((f) => ({ ...f, image: ev.target.result }));
    };
    reader.readAsDataURL(file);
  };

  // Save to backend
  const saveToServer = async (f) => {
    try {
      // If image is a dataURL → send as FormData with file under 'foto'
      if (f.image && typeof f.image === "string" && f.image.startsWith("data:")) {
        const fd = new FormData();
        fd.append("foto", dataUrlToFile(f.image, `banner-${Date.now()}.png`));
        // Add title to FormData
        if (f.title) {
          fd.append("title", f.title);
        }
        // Add description to FormData
        if (f.description) {
          fd.append("description", f.description);
        }

        if (!f.id) {
          const res = await api.post("/banner", fd);
          return normalize(res);
        } else {
          fd.append("_method", "PUT");
          const res = await api.post(`/banner/${f.id}`, fd);
          return normalize(res);
        }
      } else {
        // No file; send JSON with foto as string path or empty
        const payload = {
          foto: (f.image && typeof f.image === "string") ? f.image : "",
        };
        // Add title to payload
        if (f.title) {
          payload.title = f.title;
        }
        // Add description to payload
        if (f.description) {
          payload.description = f.description;
        }

        if (!f.id) {
          const res = await api.post("/banner", payload);
          return normalize(res);
        } else {
          const res = await api.put(`/banner/${f.id}`, payload);
          return normalize(res);
        }
      }
    } catch (err) {
      throw err;
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    
    // Simple validation
    if (!form.image) {
      alert("Upload gambar banner wajib!");
      return;
    }

    try {
      const saved = await saveToServer(form);
      const row = {
        id: saved.id ?? form.id ?? Date.now(),
        title: saved.title || (saved.foto ? saved.foto.split('/').pop() : "Banner"),
        description: saved.description || "",
        image: saved.foto || "",
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
      description: row.description || "",
      image: row.image,
    });
    setOpen(true);
    setErrors({});
  };

  const onDelete = async (id) => {
    if (!confirm("Hapus banner ini?")) return;
    try {
      await api.delete(`/banner/${id}`);
      setItems((p) => p.filter((x) => x.id !== id));
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Hapus gagal. Periksa console.");
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-blue-700">Kelola Banner</h1>
          <p className="text-gray-600">Kelola banner homepage, upload dari perangkat.</p>
        </div>

        <div className="flex gap-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari banner…"
            className="px-3 py-2 border rounded-xl bg-white w-64"
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

      {/* TABLE */}
      <div className="overflow-x-auto bg-white rounded-2xl shadow-sm border">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="text-left p-3">Banner</th>
              <th className="text-left p-3">Title</th>
              <th className="text-left p-3">Aksi</th>
            </tr>
          </thead>

          <tbody>
            {pageData.length === 0 ? (
              <tr>
                <td colSpan={3} className="p-6 text-center text-gray-500">
                  Tidak ada banner
                </td>
              </tr>
            ) : (
              pageData.map((row) => (
                <tr key={row.id} className="border-t hover:bg-gray-50">
                  <td className="p-3">
                    <div className="w-32 h-16 rounded overflow-hidden border">
                      <img
                        src={row.image || LOCAL_FALLBACK_IMAGE}
                        alt="banner"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </td>
                  <td className="p-3 font-medium">{row.title}</td>
                  <td className="p-3">
                    <div className="flex gap-2">
                      <button onClick={() => onEdit(row)} className="px-3 py-1 border rounded-lg">
                        Edit
                      </button>
                      <button
                        onClick={() => onDelete(row.id)}
                        className="px-3 py-1 border rounded-lg text-red-600"
                      >
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

      {/* PAGINATION */}
      {filtered.length > pageSize && (
        <div className="flex justify-center items-center gap-2 mt-4">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className="px-3 py-2 border rounded-lg bg-white disabled:opacity-40"
          >
            Prev
          </button>
          <span className="px-3 py-2 border rounded-lg bg-white">
            {page} / {totalPages}
          </span>
          <button
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="px-3 py-2 border rounded-lg bg-white disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}

      {/* MODAL */}
      <Modal
        open={open}
        onClose={() => {
          setForm(empty);
          setOpen(false);
        }}
        title={form.id ? "Edit Banner" : "Tambah Banner"}
      >
        <form onSubmit={onSubmit} className="space-y-4">
          {/* Title Input */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Title <span className="text-gray-500">(opsional)</span>
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="Masukkan title banner"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.title && (
              <p className="text-red-500 text-sm mt-1">{errors.title}</p>
            )}
          </div>

          {/* Description Input */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Description <span className="text-gray-500">(opsional)</span>
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="Masukkan deskripsi banner"
              rows={3}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
            {errors.description && (
              <p className="text-red-500 text-sm mt-1">{errors.description}</p>
            )}
          </div>

          {/* Upload */}
          <div>
            <label className="block text-sm font-medium mb-1">Upload Banner</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleFile(e.target.files?.[0])}
            />
            <div className="w-48 h-28 mt-3 rounded overflow-hidden border">
              <img
                src={form.image || LOCAL_FALLBACK_IMAGE}
                alt="preview"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                setForm(empty);
                setOpen(false);
              }}
              className="px-4 py-2 border rounded-xl"
            >
              Batal
            </button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-xl">
              Simpan
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
