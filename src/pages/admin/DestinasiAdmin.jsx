import { useMemo, useState, useEffect } from "react";

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
    { id: 1, name: "Masjid Agung Kubah Timah", slug: "masjid-agung-kubah-timah", alamat: "Pangkalpinang", deskripsi: "Ikon wisata religi kota.", gambar: "" },
    { id: 2, name: "Makam Tua Belinyu", slug: "makam-tua-belinyu", alamat: "Belinyu", deskripsi: "Situs ziarah bersejarah.", gambar: "" },
  ]);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 6;

  const empty = { id: null, name: "", slug: "", alamat: "", deskripsi: "", gambar: "" };
  const [form, setForm] = useState(empty);
  const [open, setOpen] = useState(false);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return items.filter(x => x.name.toLowerCase().includes(q) || x.alamat.toLowerCase().includes(q));
  }, [items, query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageData = filtered.slice((page - 1) * pageSize, page * pageSize);
  useEffect(() => setPage(1), [query]);

  const onSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.slug.trim()) return;
    if (form.id == null) setItems(prev => [{ ...form, id: Date.now() }, ...prev]);
    else setItems(prev => prev.map(x => (x.id === form.id ? form : x)));
    setOpen(false); setForm(empty);
  };
  const onEdit = (row) => { setForm(row); setOpen(true); };
  const onDelete = (id) => { if (confirm("Hapus destinasi ini?")) setItems(p => p.filter(x => x.id !== id)); };

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-blue-700">Kelola Destinasi</h1>
          <p className="text-gray-600">Tambah, ubah, dan hapus destinasi.</p>
        </div>
        <div className="flex gap-2">
          <input value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="Cari destinasi…" className="px-3 py-2 border rounded-xl bg-white w-64" />
          <button onClick={()=>{setForm(empty); setOpen(true);}} className="px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700">+ Tambah</button>
        </div>
      </header>

      <div className="overflow-x-auto bg-white rounded-2xl shadow-sm border">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="text-left p-3">Nama</th>
              <th className="text-left p-3">Slug</th>
              <th className="text-left p-3">Alamat</th>
              <th className="text-left p-3">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {pageData.length === 0 ? (
              <tr><td colSpan={4} className="p-6 text-center text-gray-500">Belum ada data</td></tr>
            ) : pageData.map(row => (
              <tr key={row.id} className="border-t hover:bg-gray-50">
                <td className="p-3 font-medium">{row.name}</td>
                <td className="p-3 text-gray-500">{row.slug}</td>
                <td className="p-3">{row.alamat}</td>
                <td className="p-3">
                  <div className="flex gap-2">
                    <button onClick={()=>onEdit(row)} className="px-3 py-1 rounded-lg border">Edit</button>
                    <button onClick={()=>onDelete(row.id)} className="px-3 py-1 rounded-lg border text-red-600">Hapus</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filtered.length > pageSize && (
        <div className="flex items-center justify-center gap-2">
          <button className="px-3 py-2 border rounded-lg bg-white disabled:opacity-40" disabled={page===1} onClick={()=>setPage(p=>Math.max(1,p-1))}>Prev</button>
          <div className="px-3 py-2 border rounded-lg bg-white">Halaman {page} / {totalPages}</div>
          <button className="px-3 py-2 border rounded-lg bg-white disabled:opacity-40" disabled={page===totalPages} onClick={()=>setPage(p=>Math.min(totalPages,p+1))}>Next</button>
        </div>
      )}

      <Modal open={open} onClose={()=>{setOpen(false); setForm(empty);}} title={form.id ? "Edit Destinasi" : "Tambah Destinasi"}>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nama</label>
              <input className="w-full border rounded-xl px-3 py-2" value={form.name} onChange={(e)=>setForm({...form,name:e.target.value})} required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Slug</label>
              <input className="w-full border rounded-xl px-3 py-2" value={form.slug} onChange={(e)=>setForm({...form,slug:e.target.value})} required placeholder="masjid-agung-kubah-timah" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Alamat</label>
              <input className="w-full border rounded-xl px-3 py-2" value={form.alamat} onChange={(e)=>setForm({...form,alamat:e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Gambar (URL)</label>
              <input className="w-full border rounded-xl px-3 py-2" value={form.gambar} onChange={(e)=>setForm({...form,gambar:e.target.value})} placeholder="https://…" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Deskripsi</label>
            <textarea className="w-full border rounded-xl px-3 py-2 min-h-[100px]" value={form.deskripsi} onChange={(e)=>setForm({...form,deskripsi:e.target.value})} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={()=>{setOpen(false); setForm(empty);}} className="px-4 py-2 rounded-xl border">Batal</button>
            <button type="submit" className="px-4 py-2 rounded-xl bg-blue-600 text-white">Simpan</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
