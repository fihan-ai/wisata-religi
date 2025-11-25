// src/pages/admin/DestinasiAdmin.jsx
import { useMemo, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  getAllDestinasi,
  createDestinasi,
  updateDestinasi,
  deleteDestinasi,
} from "../../api/destinasiService";
import { getAllKategori } from "../../api/kategoriService";

/**
 * DestinasiAdmin (updated)
 * - shows kota, lattitude, longitude, deskripsi in the table
 * - fetchList now accepts either array or { data: [...] } responses
 * - logs response to console for debugging
 */

const LOCAL_FALLBACK_IMAGE = "/mnt/data/4e716d68-85b0-46d9-b905-b87c44690966.png";

function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold">{title}</h3>
          <button onClick={onClose} className="p-2 rounded hover:bg-gray-100">
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export default function DestinasiAdmin() {
  const [items, setItems] = useState([]);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 6;

  // form fields mapped to backend later
  const empty = {
    id: null,
    name: "",
    alamat: "",
    deskripsi: "",
    gambar: "",
    kota: "",
    lattitude: "",
    longitude: "",
    id_kategori: null,
  };
  const [form, setForm] = useState(empty);
  const [open, setOpen] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [kategoriList, setKategoriList] = useState([]);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return items.filter(
      (x) =>
        (x.name || "").toLowerCase().includes(q) ||
        (x.alamat || "").toLowerCase().includes(q) ||
        (x.kota || "").toLowerCase().includes(q)
    );
  }, [items, query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageData = filtered.slice((page - 1) * pageSize, page * pageSize);
  useEffect(() => setPage(1), [query]);

  const validate = (f) => {
    const e = {};
    if (!f.name || !f.name.trim()) e.name = "Nama wajib diisi";
    return e;
  };

  // file -> dataURL
  const handleFileChange = (file) => {
    if (!file) {
      setForm((f) => ({ ...f, gambar: "" }));
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target.result;
      setForm((f) => ({ ...f, gambar: dataUrl }));
    };
    reader.readAsDataURL(file);
  };

  // map backend -> UI
  const mapFromServer = (it) => ({
    id: it.id_destinasi ?? it.id,
    name: it.nama_destinasi ?? it.nama ?? it.name ?? "",
    alamat: it.alamat ?? "",
    deskripsi: it.deskripsi ?? "",
    gambar: it.foto ?? it.gambar ?? "",
    kota: it.kota ?? "",
    lattitude: it.lattitude ?? it.latitude ?? "",
    longitude: it.longitude ?? it.long ?? "",
    id_kategori: it.id_kategori ?? null,
  });

  // UI -> backend payload
  const mapToServerPayload = (f) => ({
    nama_destinasi: f.name,
    deskripsi: f.deskripsi,
    alamat: f.alamat,
    kota: f.kota,
    lattitude: f.lattitude || null,
    longitude: f.longitude || null,
    foto: f.gambar || "",
    id_kategori: f.id_kategori ?? null,
  });

  // load list: accept array or { data: [...] } (common Laravel Resource response)
  async function fetchList() {
    try {
      setLoading(true);
      const raw = await getAllDestinasi();
      // debug: log raw response so you can inspect fields in network/console
      console.debug("getAllDestinasi response:", raw);

      // Accept several shapes:
      // - array of items (raw)
      // - { data: [...] } (Laravel ResourceCollection)
      // - axios response wrapper (if destinasiService returns response object)
      let arr = [];
      if (Array.isArray(raw)) arr = raw;
      else if (raw && Array.isArray(raw.data)) arr = raw.data;
      else if (raw && raw.data && raw.data.data && Array.isArray(raw.data.data)) arr = raw.data.data;
      else {
        // fallback: try raw.data (single object) -> wrap
        if (raw && typeof raw === "object" && Object.keys(raw).length) {
          // if single object, show it as single-entry array
          arr = Array.isArray(raw) ? raw : [raw];
        } else arr = [];
      }

      setItems(arr.map(mapFromServer));
    } catch (err) {
      console.error("Failed to load destinasi:", err);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    async function fetchKategori() {
      try {
        const data = await getAllKategori();
        setKategoriList(Array.isArray(data) ? data : data.data || []);
      } catch (err) {
        console.error("Failed to load kategori:", err);
      }
    }
    fetchKategori();
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    const v = validate(form);
    setErrors(v);
    if (Object.keys(v).length) return;

    try {
      if (form.id == null) {
        const created = await createDestinasi(mapToServerPayload(form));
        setItems((prev) => [mapFromServer(created), ...prev]);
      } else {
        const updated = await updateDestinasi(form.id, mapToServerPayload(form));
        setItems((prev) => prev.map((x) => (x.id === form.id ? mapFromServer(updated) : x)));
      }
      setOpen(false);
      setForm(empty);
      setErrors({});
    } catch (err) {
      console.error("Save failed:", err);
      alert("Simpan gagal. Periksa console untuk detail.");
    }
  };

  const onEdit = (row) => {
    setForm({
      id: row.id,
      name: row.name,
      alamat: row.alamat,
      deskripsi: row.deskripsi,
      gambar: row.gambar,
      kota: row.kota,
      lattitude: row.lattitude,
      longitude: row.longitude,
      id_kategori: row.id_kategori,
    });
    setOpen(true);
    setErrors({});
  };

  const onDelete = async (id) => {
    if (!confirm("Hapus destinasi ini?")) return;
    try {
      await deleteDestinasi(id);
      setItems((p) => p.filter((x) => x.id !== id));
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Hapus gagal. Periksa console untuk detail.");
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-blue-700">Kelola Destinasi</h1>
          <p className="text-gray-600">Tambah, ubah, dan hapus destinasi. Gambar diupload dari device.</p>
        </div>
        <div className="flex gap-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari destinasi / alamat / kota…"
            className="px-3 py-2 border rounded-xl bg-white w-64"
            aria-label="Cari destinasi"
          />
          <button onClick={() => { setForm(empty); setOpen(true); }} className="px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700">+ Tambah</button>
        </div>
      </header>

      <div className="overflow-x-auto bg-white rounded-2xl shadow-sm border">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="text-left p-3">Nama</th>
              <th className="text-left p-3">Kota</th>
              <th className="text-left p-3">Alamat</th>
              <th className="text-left p-3">Deskripsi</th>
              <th className="text-left p-3">Lat</th>
              <th className="text-left p-3">Lng</th>
              <th className="text-left p-3">Gambar</th>
              <th className="text-left p-3">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} className="p-6 text-center text-gray-500">Loading...</td></tr>
            ) : pageData.length === 0 ? (
              <tr><td colSpan={8} className="p-6 text-center text-gray-500">Belum ada data</td></tr>
            ) : pageData.map((row) => (
              <tr key={row.id} className="border-t hover:bg-gray-50">
                <td className="p-3 font-medium"><Link to={`/destinasi/${row.id}`} className="text-blue-700 hover:underline">{row.name}</Link></td>
                <td className="p-3 text-gray-500">{row.kota}</td>
                <td className="p-3">{row.alamat}</td>
                <td className="p-3 text-sm text-gray-600 line-clamp-2">{row.deskripsi}</td>
                <td className="p-3">{row.lattitude}</td>
                <td className="p-3">{row.longitude}</td>
                <td className="p-3">
                  <div className="w-20 h-12 rounded overflow-hidden border">
                    <img src={row.gambar || LOCAL_FALLBACK_IMAGE} alt={row.name} className="w-full h-full object-cover" />
                  </div>
                </td>
                <td className="p-3">
                  <div className="flex gap-2">
                    <button onClick={() => onEdit(row)} className="px-3 py-1 rounded-lg border">Edit</button>
                    <button onClick={() => onDelete(row.id)} className="px-3 py-1 rounded-lg border text-red-600">Hapus</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filtered.length > pageSize && (
        <div className="flex items-center justify-center gap-2">
          <button className="px-3 py-2 border rounded-lg bg-white disabled:opacity-40" disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Prev</button>
          <div className="px-3 py-2 border rounded-lg bg-white">Halaman {page} / {totalPages}</div>
          <button className="px-3 py-2 border rounded-lg bg-white disabled:opacity-40" disabled={page === totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>Next</button>
        </div>
      )}

      <Modal open={open} onClose={() => { setOpen(false); setForm(empty); setErrors({}); }} title={form.id ? "Edit Destinasi" : "Tambah Destinasi"}>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nama</label>
              <input className={`w-full border rounded-xl px-3 py-2 ${errors.name ? "border-red-400" : ""}`} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Kota</label>
              <input className="w-full border rounded-xl px-3 py-2" value={form.kota} onChange={(e) => setForm({ ...form, kota: e.target.value })} />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Alamat</label>
              <input className="w-full border rounded-xl px-3 py-2" value={form.alamat} onChange={(e) => setForm({ ...form, alamat: e.target.value })} />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Gambar (unggah dari perangkat)</label>
              <input type="file" accept="image/*" onChange={(e) => { const file = e.target.files && e.target.files[0]; handleFileChange(file); }} className="w-full text-sm" />
              <div className="flex items-center gap-2 mt-2">
                <button type="button" onClick={() => { setForm((f) => ({ ...f, gambar: "" })); }} className="px-3 py-1 rounded-lg border text-sm">Hapus Gambar</button>
                <p className="text-xs text-gray-500">Preview akan muncul di bawah. Jika kosong, fallback akan dipakai.</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Kategori</label>
              <select
                className="w-full border rounded-xl px-3 py-2"
                value={form.id_kategori ?? ""}
                onChange={(e) => setForm({ ...form, id_kategori: e.target.value ? parseInt(e.target.value) : null })}
              >
                <option value="">-- Pilih Kategori --</option>
                {kategoriList.map((k) => (
                  <option key={k.id_kategori} value={k.id_kategori}>
                    {k.nama_kategori}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Deskripsi</label>
            <textarea className="w-full border rounded-xl px-3 py-2 min-h-[100px]" value={form.deskripsi} onChange={(e) => setForm({ ...form, deskripsi: e.target.value })} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Lattitude</label>
              <input className="w-full border rounded-xl px-3 py-2" value={form.lattitude} onChange={(e) => setForm({ ...form, lattitude: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Longitude</label>
              <input className="w-full border rounded-xl px-3 py-2" value={form.longitude} onChange={(e) => setForm({ ...form, longitude: e.target.value })} />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-28 h-20 rounded overflow-hidden border">
              <img src={form.gambar || LOCAL_FALLBACK_IMAGE} alt="preview" className="w-full h-full object-cover" />
            </div>
            <div className="text-sm text-gray-600">Preview gambar (data disimpan sebagai dataURL pada state).</div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => { setOpen(false); setForm(empty); setErrors({}); }} className="px-4 py-2 rounded-xl border">Batal</button>
            <button type="submit" className="px-4 py-2 rounded-xl bg-blue-600 text-white">Simpan</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
