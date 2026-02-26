// API configuration utility
export const getApiUrl = () => {
  // In development, use relative path (handled by Vite proxy)
  // In production/external API, use full URL
  if (import.meta.env.MODE === 'development') {
    return '';  // Use relative path with Vite proxy
  }
  return import.meta.env.VITE_API_URL || 'http://localhost:5000';
};

export const getFileUrl = (path) => {
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  return `${baseUrl}${path}`;
};
