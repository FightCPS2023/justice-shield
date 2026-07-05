// API URL from environment - Emergent sets this during deployment
const API_URL = process.env.REACT_APP_BACKEND_URL || '';

// API Helper with mobile-friendly token handling
const api = {
  getToken() {
    return null;
  },
  
  async request(endpoint, options = {}, retryCount = 0) {
    const { timeoutMs, retryable = true, ...fetchOptions } = options;
    const headers = {
      'Content-Type': 'application/json',
      ...fetchOptions.headers,
    };
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs || 60000);
    
    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        ...fetchOptions,
        headers,
        credentials: 'include',
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (response.status === 401) {
        throw new Error('Session expired. Please log in again.');
      }
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: 'Request failed' }));
        throw new Error(error.detail || `Request failed (${response.status})`);
      }
      
      return response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (retryable && retryCount < 2 && (error.name === 'AbortError' || error.message === 'Failed to fetch' || error.message.includes('NetworkError'))) {
        console.log(`Retrying request (attempt ${retryCount + 2})...`);
        await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
        return this.request(endpoint, options, retryCount + 1);
      }
      
      if (error.name === 'AbortError') {
        throw new Error('Request timed out. Please check your connection and try again.');
      }
      if (error.message === 'Failed to fetch' || error.message.includes('NetworkError') || error.message.includes('network')) {
        console.error('Network error details:', error);
        throw new Error('Connection error. Please check your internet and try again.');
      }
      throw error;
    }
  },
  
  get: (endpoint) => api.request(endpoint),
  post: (endpoint, data) => api.request(endpoint, { method: 'POST', body: JSON.stringify(data) }),
  put: (endpoint, data) => api.request(endpoint, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (endpoint) => api.request(endpoint, { method: 'DELETE' }),
};

export { API_URL, api };
export default api;
