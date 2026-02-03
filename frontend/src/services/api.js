import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

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

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      // token is expired or invalid
      localStorage.removeItem('token');
      
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(token => {
            originalRequest.headers['Authorization'] = 'Bearer ' + token;
            return api(originalRequest);
          })
          .catch(err => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem('refresh_token');

      if (!refreshToken) {
        // No refresh token available, redirect to login
        isRefreshing = false;
        localStorage.clear();
        if (!window.location.pathname.includes('/login') && 
            !window.location.pathname.includes('/register')) {
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }

      try {
        // Request new access token
        const response = await axios.post(
          `${API_BASE_URL}/users/refresh`,
          { refresh_token: refreshToken }
        );

        const newAccessToken = response.data.access_token;
        localStorage.setItem('token', newAccessToken);

        // Process queued requests
        processQueue(null, newAccessToken);

        // Retry original request
        originalRequest.headers['Authorization'] = 'Bearer ' + newAccessToken;
        return api(originalRequest);

      } catch (refreshError) {
        // Refresh failed, logout user
        processQueue(refreshError, null);
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

export const register = async (userData) => {
  const response = await api.post('/users/register', userData);
  return response.data;
};

export const login = async (username, password) => {
  const formData = new FormData();
  formData.append('username', username);
  formData.append('password', password);
  const response = await api.post('/users/token', formData);
  localStorage.setItem('token', response.data.access_token);
  localStorage.setItem('refresh_token', response.data.refresh_token);
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

const fetchSampleFile = async (filename) => {
  const response = await fetch(`/sample_data/${filename}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${filename}`);
  }
  const blob = await response.blob();
  
  // Determine MIME type
  let mimeType = 'text/csv';
  if (filename.endsWith('.json')) {
    mimeType = 'application/json';
  }
  
  return new File([blob], filename, { type: mimeType });
};

export const loadSampleData = async () => {

  try  {    
    const [jsonFile, exposuresFile, eventsFile, usersFile] = await Promise.all([
      fetchSampleFile('metric_definition.json'),
      fetchSampleFile('exposure_events.csv'),
      fetchSampleFile('user_events_conversion.csv'),
      fetchSampleFile('user_info.csv'),
    ]);

    return {
      jsonFile,
      exposuresFile,
      eventsFile,
      usersFile,
      experimentName: 'Homepage Redesign Test',
      experimentId: '0',
    };
  } catch (e) {
    console.error('Error loading sample data:', e);
    throw e;
  }
};


export const downloadSampleFiles = async () => {
  const response = await fetch('/sample_data/ab-testing-sample-data.zip');
  
  if (!response.ok) {
    throw new Error('Failed to download sample files');
  }
  
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'ab-testing-sample-data.zip';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
};

export default api;
