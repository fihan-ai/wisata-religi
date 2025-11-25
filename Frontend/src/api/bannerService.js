import api from './axios';

function normalize(res) {
    return res?.data?.data ?? res?.data ?? res;
  }
  
  export const getAllBanner = () => api.get('/banner').then(normalize);
  export const getBanner = (id) => api.get(`/banner/${id}`).then(normalize);
  
  export default {
    getAllBanner,
    getBanner,
  };
