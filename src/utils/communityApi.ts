import { projectId, publicAnonKey } from './supabase/info';

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-a24eaa40/community`;

interface FetchOptions {
  method?: string;
  body?: any;
  headers?: Record<string, string>;
}

async function fetchAPI(endpoint: string, options: FetchOptions = {}) {
  const { method = 'GET', body, headers = {} } = options;

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`,
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Network error' }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    return response.json();
  } catch (error: any) {
    // Enhance error message for better debugging
    if (error.message === 'Failed to fetch') {
      throw new Error('Server not deployed yet');
    }
    throw error;
  }
}

// ===== ADVOCATES =====

export interface Advocate {
  id: string;
  type: 'advocate' | 'attorney';
  name: string;
  credentials: string;
  photo?: string;
  email: string;
  phone: string;
  website?: string;
  state: string;
  county?: string;
  cities: string[];
  specializations: string[];
  about: string;
  yearsExperience?: number;
  barNumber?: string;
  rates?: string;
  availability: 'available' | 'limited' | 'full';
  socialMedia?: {
    facebook?: string;
    twitter?: string;
    linkedin?: string;
    instagram?: string;
    youtube?: string;
  };
  rating?: number;
  reviewCount?: number;
  verified: boolean;
  joinedDate: string;
}

export interface AdvocateFilters {
  state?: string;
  type?: 'advocate' | 'attorney';
  availability?: 'available' | 'limited' | 'full';
}

export const advocateApi = {
  // Get all advocates with optional filters
  getAll: async (filters?: AdvocateFilters): Promise<Advocate[]> => {
    const params = new URLSearchParams();
    if (filters?.state) params.append('state', filters.state);
    if (filters?.type) params.append('type', filters.type);
    if (filters?.availability) params.append('availability', filters.availability);
    
    const query = params.toString() ? `?${params.toString()}` : '';
    const response = await fetchAPI(`/advocates${query}`);
    return response.data;
  },

  // Get single advocate by ID
  getById: async (id: string): Promise<Advocate> => {
    const response = await fetchAPI(`/advocates/${id}`);
    return response.data;
  },

  // Submit new advocate signup
  create: async (data: Partial<Advocate>): Promise<{ data: Advocate; message: string }> => {
    return fetchAPI('/advocates', { method: 'POST', body: data });
  },

  // Update advocate
  update: async (id: string, data: Partial<Advocate>): Promise<Advocate> => {
    const response = await fetchAPI(`/advocates/${id}`, { method: 'PUT', body: data });
    return response.data;
  },

  // Delete advocate
  delete: async (id: string): Promise<void> => {
    await fetchAPI(`/advocates/${id}`, { method: 'DELETE' });
  },
};

// ===== RESOURCE LINKS =====

export interface ResourceLink {
  id: string;
  title: string;
  url: string;
  description: string;
  category: 'legal-help' | 'advocacy' | 'education' | 'support';
  type: 'organization' | 'legal-resource' | 'educational' | 'support-group' | 'blog' | 'video' | 'document';
  state?: string;
  upvotes: number;
  submittedBy: string;
  dateAdded: string;
  verified: boolean;
  tags: string[];
}

export interface ResourceFilters {
  category?: string;
  type?: string;
  state?: string;
}

export const resourceApi = {
  // Get all resources with optional filters
  getAll: async (filters?: ResourceFilters): Promise<ResourceLink[]> => {
    const params = new URLSearchParams();
    if (filters?.category) params.append('category', filters.category);
    if (filters?.type) params.append('type', filters.type);
    if (filters?.state) params.append('state', filters.state);
    
    const query = params.toString() ? `?${params.toString()}` : '';
    const response = await fetchAPI(`/resources${query}`);
    return response.data;
  },

  // Get single resource by ID
  getById: async (id: string): Promise<ResourceLink> => {
    const response = await fetchAPI(`/resources/${id}`);
    return response.data;
  },

  // Submit new resource
  create: async (data: Partial<ResourceLink>): Promise<{ data: ResourceLink; message: string }> => {
    return fetchAPI('/resources', { method: 'POST', body: data });
  },

  // Upvote a resource
  upvote: async (id: string, userId: string): Promise<ResourceLink> => {
    const response = await fetchAPI(`/resources/${id}/upvote`, { 
      method: 'POST', 
      body: { userId } 
    });
    return response.data;
  },

  // Update resource
  update: async (id: string, data: Partial<ResourceLink>): Promise<ResourceLink> => {
    const response = await fetchAPI(`/resources/${id}`, { method: 'PUT', body: data });
    return response.data;
  },

  // Delete resource
  delete: async (id: string): Promise<void> => {
    await fetchAPI(`/resources/${id}`, { method: 'DELETE' });
  },
};

// ===== ADMIN =====

export const adminApi = {
  // Seed initial data
  seedData: async (): Promise<{ message: string; advocates: number; resources: number }> => {
    return fetchAPI('/admin/seed-data', { method: 'POST' });
  },

  // Get pending advocates
  getPendingAdvocates: async (): Promise<Advocate[]> => {
    const response = await fetchAPI('/admin/advocates/pending');
    return response.data;
  },

  // Approve advocate
  approveAdvocate: async (id: string): Promise<{ data: Advocate; message: string }> => {
    return fetchAPI(`/admin/advocates/${id}/approve`, { method: 'POST' });
  },

  // Get pending resources
  getPendingResources: async (): Promise<ResourceLink[]> => {
    const response = await fetchAPI('/admin/resources/pending');
    return response.data;
  },

  // Approve resource
  approveResource: async (id: string): Promise<{ data: ResourceLink; message: string }> => {
    return fetchAPI(`/admin/resources/${id}/approve`, { method: 'POST' });
  },
};