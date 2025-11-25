import api from './axios';

function normalize(res) {
  return res?.data?.data ?? res?.data ?? res;
}

// Ensure all string fields are strings, never null/undefined
function toPlainPayload(f) {
  return {
    id_kategori: f.id_kategori ?? null,  // Add back
    nama_destinasi: String(f.name || f.nama_destinasi || '').trim(),
    deskripsi: String(f.deskripsi || '').trim(),
    alamat: String(f.alamat || '').trim(),
    kota: String(f.kota || '').trim(),
    lattitude: f.lattitude ? parseFloat(f.lattitude) : null,
    longitude: f.longitude ? parseFloat(f.longitude) : null,
    foto: f.foto ?? f.gambar ?? '',
  };
}

function isDataUrl(s) {
  return typeof s === 'string' && s.startsWith('data:');
}

function dataUrlToFile(dataUrl, filename = 'upload.png') {
  const arr = dataUrl.split(',');
  const mime = (arr[0].match(/:(.*?);/) || [])[1] || 'image/png';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) u8arr[n] = bstr.charCodeAt(n);
  return new File([u8arr], filename, { type: mime });
}

// Always use FormData for consistency (multipart/form-data)
function buildFormData(payload) {
  const fd = new FormData();
  const plain = toPlainPayload(payload);
  
  // Append all fields EXCEPT foto
  Object.entries(plain).forEach(([k, v]) => {
    if (k !== 'foto') {
      // Always append id_kategori (even if null, backend will handle)
      if (k === 'id_kategori') {
        fd.append(k, v ?? '');
      } else if (v !== undefined && v !== null && v !== '') {
        fd.append(k, v);
      }
    }
  });

  // Handle foto: File, dataURL, or URL string — only if it has a value
  const img = payload.foto ?? payload.gambar ?? null;
  if (img) {
    if (img instanceof File) {
      fd.append('foto', img);
    } else if (isDataUrl(img)) {
      fd.append('foto', dataUrlToFile(img, `${plain.nama_destinasi || 'image'}.png`));
    } else if (typeof img === 'string' && img.length > 0 && img.startsWith('http')) {
      fd.append('foto', img);
    }
  }
  // If foto is empty, don't append it (backend allows nullable)

  return fd;
}

export const getAllDestinasi = () => api.get('/destinasi').then(normalize);
export const getDestinasi = (id) => api.get(`/destinasi/${id}`).then(normalize);

// Always send FormData for create & update (consistent Content-Type)
export const createDestinasi = (payload) => {
  const fd = buildFormData(payload);
  return api.post('/destinasi', fd).then(normalize);
};

export const updateDestinasi = (id, payload) => {
  const fd = buildFormData(payload);
  fd.append('_method', 'PUT');
  return api.post(`/destinasi/${id}`, fd).then(normalize);
};

export const deleteDestinasi = (id) => api.delete(`/destinasi/${id}`).then(normalize);

export default {
  getAllDestinasi,
  getDestinasi,
  createDestinasi,
  updateDestinasi,
  deleteDestinasi,
};