import { projectId, publicAnonKey } from './supabase/info';

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-a24eaa40`;

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

export const api = {
  // Auth endpoints
  async signup(email: string, password: string, name: string) {
    try {
      console.log('Attempting signup to:', `${API_BASE}/auth/signup`);
      console.log('Signup data:', { email, name, passwordLength: password.length });
      
      const response = await fetch(`${API_BASE}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, name }),
      });

      console.log('Signup response status:', response.status);
      
      let data;
      try {
        data = await response.json();
        console.log('Signup response data:', data);
      } catch (parseError) {
        console.error('Failed to parse response:', parseError);
        throw new Error('Invalid response from server');
      }
      
      if (!response.ok) {
        throw new Error(data.error || `Server error: ${response.status}`);
      }
      
      return data;
    } catch (error: any) {
      console.error('API signup error:', error);
      // Check if it's a network error
      if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
        throw new Error('Network error: Unable to connect to server. Please check your internet connection.');
      }
      throw new Error(error.message || 'Failed to sign up');
    }
  },

  async login(email: string, password: string) {
    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to login');
      }
      
      return data;
    } catch (error: any) {
      console.error('API login error:', error);
      throw new Error(error.message || 'Failed to login');
    }
  },

  // Data endpoints (require auth token)
  async saveData(accessToken: string, caseData: any) {
    try {
      const response = await fetch(`${API_BASE}/data/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(caseData),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to save data');
      }
      
      return data;
    } catch (error: any) {
      console.error('API save error:', error);
      throw new Error(error.message || 'Failed to save data');
    }
  },

  async loadData(accessToken: string) {
    try {
      const response = await fetch(`${API_BASE}/data/load`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to load data');
      }
      
      return data;
    } catch (error: any) {
      console.error('API load error:', error);
      throw new Error(error.message || 'Failed to load data');
    }
  },
};