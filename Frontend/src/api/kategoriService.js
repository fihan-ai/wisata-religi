import api from './axios';

function normalize(res) {
  return res?.data?.data ?? res?.data ?? res;
}

export const getAllKategori = () => api.get('/kategori').then(normalize);

export default {
  getAllKategori,
};