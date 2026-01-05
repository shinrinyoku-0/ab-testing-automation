import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
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

export const uploadFiles = async (
  experimentName, experimentId, jsonFile, 
  exposuresFile, eventsFile, usersFile,
  selectedOption
) => {
  const formData = new FormData();
  formData.append('exp_name', experimentName);
  formData.append('experiment_id', experimentId);
  formData.append('exposures_file', exposuresFile);
  formData.append('events_file', eventsFile);
  formData.append('json_file', jsonFile);
  formData.append('selected_option', selectedOption);
  formData.append('experiment_name', experimentName);
  
  if (usersFile) {
    formData.append('users_file', usersFile);
  }

  const response = await api.post('/files/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const calculateSampleSize = async (data) => {
  const response = await api.post('/sample-size', data);
  return response.data;
};

export const getSampleSizeDefaults = async () => {
  const response = await api.get('/sample-size/defaults');
  return response.data;
};

export const recommendTest = async (data) => {
  const response = await api.post('/recommend-test', data);
  return response.data;
};

export const getTestOptions = async () => {
  const response = await api.get('/test-options');
  return response.data;
};

export default api;
