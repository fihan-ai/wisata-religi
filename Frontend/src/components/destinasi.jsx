// src/pages/Destinasi.jsx
import React, { useEffect, useState } from 'react';
import api from '../api/axios';

function DestinasiPage() {
  const [data, setData] = useState([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await api.get('/destinasi'); // memanggil http://localhost:8000/api/destinasi
        setData(res.data.data ?? res.data); // tergantung response shape
      } catch (err) {
        console.error(err);
      }
    }
    fetchData();
  }, []);

  return (
    <div>
      <h1>Destinasi</h1>
      <ul>
        {data.map(d => <li key={d.id}>{d.nama}</li>)}
      </ul>
    </div>
  );
}
export default DestinasiPage;
