import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE || '';

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
