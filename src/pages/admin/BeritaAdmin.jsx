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

export default function BeritaAdmin() {
  const [items, setItems] = useState(() => [
    { id: 1, title: "Peresmian Kawasan Wisata Religi", category: "Event", date: "2025-02-10", image: "", summary: "Pemerintah meresmikan kawasan wisata religi." },
    { id: 2, title: "Agenda Ziarah Akbar", category: "Pengumuman", date: "2025-02-02", image: "", summary: "Jadwal kegiatan ziarah akbar tahunan." },
  ]);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 6;

  const empty = { id: null, title: "", category: "Event", date: "", image: "", summary: "" };
  const [form, setForm] = useState(empty);
  const [open, setOpen] = useState(false);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return items.filter(x => x.title.toLowerCase().includes(q) || x.summary.toLowerCase().includes(q));
  }, [items, query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageData = filtered.slice((page - 1) * pageSize, page * pageSize);
  useEffect(() => setPage(1), [query]);

  const onSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    if (form.id == null) setItems(prev => [{ ...form, id: Date.now() }, ...prev]);
    else setItems(prev => prev.map(x => (x.id === form.id ? form : x)));
    setOpen(false); setForm(empty);
  };
  const onEdit = (row) => { setForm(row); setOpen(true); };
  const onDelete = (id) => { if (confirm("Hapus berita ini?")) setItems(prev => prev.filter(x => x.id !== id)); };

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-blue-700">Kelola Berita</h1>
          <p className="text-gray-600">Tambah, ubah, dan hapus berita.</p>
        </div>
        <div className="flex gap-2">
          <input value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="Cari berita…" className="px-3 py-2 border rounded-xl bg-white w-64" />
          <button onClick={()=>{setForm(empty); setOpen(true);}} className="px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700">+ Tambah</button>
        </div>
      </header>

      <div className="overflow-x-auto bg-white rounded-2xl shadow-sm border">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="text-left p-3">Judul</th>
              <th className="text-left p-3">Kategori</th>
              <th className="text-left p-3">Tanggal</th>
              <th className="text-left p-3">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {pageData.length === 0 ? (
              <tr><td colSpan={4} className="p-6 text-center text-gray-500">Belum ada data</td></tr>
            ) : pageData.map(row => (
              <tr key={row.id} className="border-t hover:bg-gray-50">
                <td className="p-3 font-medium">{row.title}</td>
                <td className="p-3">{row.category}</td>
                <td className="p-3">{row.date}</td>
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

      <Modal open={open} onClose={()=>{setOpen(false); setForm(empty);}} title={form.id ? "Edit Berita" : "Tambah Berita"}>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Judul</label>
              <input className="w-full border rounded-xl px-3 py-2" value={form.title} onChange={(e)=>setForm({...form,title:e.target.value})} required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Kategori</label>
              <select className="w-full border rounded-xl px-3 py-2" value={form.category} onChange={(e)=>setForm({...form,category:e.target.value})}>
                <option>Event</option><option>Pengumuman</option><option>Panduan</option>
                <option>Update Fasilitas</option><option>Komunitas</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Tanggal</label>
              <input type="date" className="w-full border rounded-xl px-3 py-2" value={form.date} onChange={(e)=>setForm({...form,date:e.target.value})} required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Gambar (URL)</label>
              <input className="w-full border rounded-xl px-3 py-2" value={form.image} onChange={(e)=>setForm({...form,image:e.target.value})} placeholder="https://…" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Ringkasan</label>
            <textarea className="w-full border rounded-xl px-3 py-2 min-h-[100px]" value={form.summary} onChange={(e)=>setForm({...form,summary:e.target.value})} />
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
