import api from './axios';

function normalize(res) {
  return res?.data?.data ?? res?.data ?? res;
}

export const getAllArtikel = () => api.get('/artikel').then(normalize);
export const getArtikel = (id) => api.get(`/artikel/${id}`).then(normalize);

export default {
  getAllArtikel,
  getArtikel,
};

