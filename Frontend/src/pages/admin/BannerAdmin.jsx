import { useMemo, useState, useEffect } from "react";

// fallback image (upload kamu)
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
  const [items, setItems] = useState(() => [
    { id: 1, title: "Promo Ziarah Akbar 2025", image: "", link: "#" },
    { id: 2, title: "Update Renovasi Masjid", image: "", link: "#" },
  ]);

  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 6;

  const empty = { id: null, title: "", link: "", image: "" };
  const [form, setForm] = useState(empty);
  const [open, setOpen] = useState(false);

  // Search
  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return items.filter(
      (x) => x.title.toLowerCase().includes(q) || (x.link || "").toLowerCase().includes(q)
    );
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

  const onSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim()) return alert("Judul banner wajib diisi!");

    if (form.id == null) {
      setItems((p) => [{ ...form, id: Date.now() }, ...p]);
    } else {
      setItems((p) => p.map((x) => (x.id === form.id ? form : x)));
    }
    setOpen(false);
    setForm(empty);
  };

  const onEdit = (row) => {
    setForm(row);
    setOpen(true);
  };

  const onDelete = (id) => {
    if (confirm("Hapus banner ini?"))
      setItems((p) => p.filter((x) => x.id !== id));
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
              <th className="text-left p-3">Judul</th>
              <th className="text-left p-3">Link</th>
              <th className="text-left p-3">Aksi</th>
            </tr>
          </thead>

          <tbody>
            {pageData.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-6 text-center text-gray-500">
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
                  <td className="p-3 text-blue-600">{row.link}</td>
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
          {/* Title */}
          <div>
            <label className="block text-sm font-medium mb-1">Judul Banner</label>
            <input
              className="w-full border rounded-xl px-3 py-2"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />
          </div>

          {/* Link */}
          <div>
            <label className="block text-sm font-medium mb-1">Link (opsional)</label>
            <input
              className="w-full border rounded-xl px-3 py-2"
              value={form.link}
              onChange={(e) => setForm({ ...form, link: e.target.value })}
              placeholder="https:// atau /halaman"
            />
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
