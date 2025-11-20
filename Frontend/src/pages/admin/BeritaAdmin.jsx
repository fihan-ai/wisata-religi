import { useState, useMemo, useEffect } from "react";

// Modal Inline
function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold">{title}</h3>
          <button onClick={onClose} className="p-2 rounded hover:bg-gray-100">✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

export default function DestinasiAdmin() {
  const [items, setItems] = useState(() => [
    { id: 1, nama: "Masjid Agung Pangkalpinang", kategori: "Religi", lokasi: "Pangkalpinang", image: "", ringkasan: "Masjid bersejarah..." },
    { id: 2, nama: "Candi XYZ", kategori: "Sejarah", lokasi: "Kabupaten A", image: "", ringkasan: "Candi kuno..." },
  ]);

  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 6;

  const empty = { id: null, nama: "", kategori: "Religi", lokasi: "", image: "", ringkasan: "" };
  const [form, setForm] = useState(empty);
  const [open, setOpen] = useState(false);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return items.filter(
      x =>
        x.nama.toLowerCase().includes(q) ||
        x.lokasi.toLowerCase().includes(q) ||
        x.ringkasan.toLowerCase().includes(q)
    );
  }, [items, query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageData = filtered.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => setPage(1), [query]);

  const onSubmit = (e) => {
    e.preventDefault();
    if (!form.nama.trim()) return;

    if (form.id == null) {
      setItems(prev => [{ ...form, id: Date.now() }, ...prev]);
    } else {
      setItems(prev => prev.map(x => (x.id === form.id ? form : x)));
    }

    setOpen(false);
    setForm(empty);
  };

  const onEdit = (row) => {
    setForm(row);
    setOpen(true);
  };

  const onDelete = (id) => {
    if (confirm("Hapus destinasi ini?")) {
      setItems(prev => prev.filter(x => x.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-blue-700">Kelola Destinasi</h1>
          <p className="text-gray-600">Tambah, ubah, dan hapus destinasi wisata.</p>
        </div>

        <div className="flex gap-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari destinasi…"
            className="px-3 py-2 border rounded-xl bg-white w-64"
          />
          <button
            onClick={() => { setForm(empty); setOpen(true); }}
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
              <th className="text-left p-3">Nama</th>
              <th className="text-left p-3">Kategori</th>
              <th className="text-left p-3">Lokasi</th>
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
                  <td className="p-3 font-medium">{row.nama}</td>
                  <td className="p-3">{row.kategori}</td>
                  <td className="p-3">{row.lokasi}</td>
                  <td className="p-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => onEdit(row)}
                        className="px-3 py-1 rounded-lg border"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => onDelete(row.id)}
                        className="px-3 py-1 rounded-lg border text-red-600"
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

      {/* Pagination */}
      {filtered.length > pageSize && (
        <div className="flex items-center justify-center gap-2">
          <button
            className="px-3 py-2 border rounded-lg bg-white disabled:opacity-40"
            disabled={page === 1}
            onClick={() => setPage(p => p - 1)}
          >
            Prev
          </button>
          <div className="px-3 py-2 border rounded-lg bg-white">
            Halaman {page} / {totalPages}
          </div>
          <button
            className="px-3 py-2 border rounded-lg bg-white disabled:opacity-40"
            disabled={page === totalPages}
            onClick={() => setPage(p => p + 1)}
          >
            Next
          </button>
        </div>
      )}

      {/* Modal */}
      <Modal
        open={open}
        onClose={() => { setOpen(false); setForm(empty); }}
        title={form.id ? "Edit Destinasi" : "Tambah Destinasi"}
      >
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            <div>
              <label className="block text-sm font-medium mb-1">Nama</label>
              <input
                className="w-full border rounded-xl px-3 py-2"
                value={form.nama}
                onChange={(e) => setForm({ ...form, nama: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Kategori</label>
              <select
                className="w-full border rounded-xl px-3 py-2"
                value={form.kategori}
                onChange={(e) => setForm({ ...form, kategori: e.target.value })}
              >
                <option>Religi</option>
                <option>Sejarah</option>
                <option>Alam</option>
                <option>Kuliner</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Lokasi</label>
              <input
                className="w-full border rounded-xl px-3 py-2"
                value={form.lokasi}
                onChange={(e) => setForm({ ...form, lokasi: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Gambar (URL)</label>
              <input
                className="w-full border rounded-xl px-3 py-2"
                value={form.image}
                onChange={(e) => setForm({ ...form, image: e.target.value })}
                placeholder="https://…"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Ringkasan</label>
            <textarea
              className="w-full border rounded-xl px-3 py-2 min-h-[100px]"
              value={form.ringkasan}
              onChange={(e) => setForm({ ...form, ringkasan: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => { setOpen(false); setForm(empty); }}
              className="px-4 py-2 rounded-xl border"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-blue-600 text-white"
            >
              Simpan
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
