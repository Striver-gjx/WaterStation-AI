import axios from 'axios';

function getApiBase(): string {
  const envBase = import.meta.env.VITE_API_BASE;
  if (envBase) return envBase;

  // In Electron (file:// protocol), the backend runs on localhost:18080
  if (typeof window !== 'undefined' && window.location.protocol === 'file:') {
    return 'http://127.0.0.1:18080';
  }

  return '';
}

const API_BASE = getApiBase();

const request = axios.create({
  baseURL: `${API_BASE}/api/v1`,
  timeout: 5000,
});

request.interceptors.response.use(
  (response) => {
    const { data } = response;
    if (data.code === 200) {
      return data;
    }
    return Promise.reject(new Error(data.message || '请求失败'));
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default request;
