import axios from 'axios';

const request = axios.create({
  baseURL: '/api/v1',
  timeout: 3000,
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
