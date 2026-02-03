export const isTokenExpired = () => {
  const token = localStorage.getItem('token');
  if (!token) return true;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const expiry = payload.exp * 1000; // Convert to milliseconds
    return Date.now() >= expiry;
  } catch (e) {
    return true;
  }
};

export const getTokenTimeRemaining = () => {
  const token = localStorage.getItem('token');
  if (!token) return 0;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const expiry = payload.exp * 1000;
    return Math.max(0, expiry - Date.now());
  } catch (e) {
    return 0;
  }
};

export const clearAuthData = () => {
  localStorage.removeItem('token');
};
