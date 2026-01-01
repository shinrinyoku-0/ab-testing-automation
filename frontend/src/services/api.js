import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors. request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const register = async (userData) => {
  const response = await api.post('/users/register', userData);
  return response.data;
};

export const login = async (username, password) => {
  const formData = new FormData();
  formData.append('username', username);
  formData.append('password', password);
  
  const response = await api.post('/users/token', formData);
  return response.data;
};

export const getUploadOptions = async () => {
  const response = await api.get('/files/options');
  return response.data;
};

export const uploadFiles = async (jsonFile, csvFiles, selectedOption) => {
  const formData = new FormData();
  formData.append('json_file', jsonFile);
  csvFiles.forEach((file) => {
    formData.append('csv_files', file);
  });
  formData.append('selected_option', selectedOption);
  
  const response = await api. post('/files/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export default api;
