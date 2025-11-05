import axios, { AxiosResponse, AxiosError } from 'axios';
import { 
  UserRegistration, 
  UserLogin, 
  User, 
  TokenResponse, 
  PostRequest, 
  Post, 
  FeedResponse, 
  UsersResponse,
  UserWithFollowStatus,
  ApiError 
} from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: string) => void;
  reject: (error: AxiosError) => void;
}> = [];

const processQueue = (error: AxiosError | null, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token!);
    }
  });
  
  failedQueue = [];
};

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as any;

    if (error.response?.status === 401 && !originalRequest._retry) {
      const isAuthEndpoint = originalRequest.url?.includes('/login') || 
                            originalRequest.url?.includes('/register') ||
                            originalRequest.url?.includes('/refresh-token');
      
      if (isAuthEndpoint) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem('refreshToken');
      
      if (!refreshToken) {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(error);
      }

      try {
        const response = await axios.post(`${API_BASE_URL}/refresh-token`, {
          refreshToken
        });

        const { token: newToken } = response.data;
        localStorage.setItem('token', newToken);
        
        processQueue(null, newToken);
        
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError as AxiosError, null);
        
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
        
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    if (error.response?.status === 401) {
      const currentPath = window.location.pathname;
      const isRegisterRequest = error.config?.url?.includes('/register');
      const isLoginRequest = error.config?.url?.includes('/login');
      
      if (!isRegisterRequest && !isLoginRequest) {
        if (currentPath !== '/login' && currentPath !== '/register') {
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          if (currentPath === '/dashboard' || currentPath.startsWith('/dashboard')) {
            window.location.href = '/login';
          }
        }
      }
    }
    
    if (!error.response) {
      (error as any).userMessage = 'Network error. Please check your connection and try again.';
    } else {
      const status = error.response.status;
      switch (status) {
        case 400:
          (error as any).userMessage = (error.response.data as any)?.error || 'Invalid request. Please check your input.';
          break;
        case 401:
          if (error.config?.url?.includes('/login') || error.config?.url?.includes('/register')) {
            (error as any).userMessage = (error.response.data as any)?.error || 'Invalid credentials. Please try again.';
          } else {
            (error as any).userMessage = 'Session expired. Please login again.';
          }
          break;
        case 403:
          (error as any).userMessage = 'Access denied. You don\'t have permission for this action.';
          break;
        case 404:
          (error as any).userMessage = 'Resource not found.';
          break;
        case 409:
          (error as any).userMessage = (error.response.data as any)?.error || 'Conflict occurred.';
          break;
        case 422:
          (error as any).userMessage = (error.response.data as any)?.error || 'Validation error.';
          break;
        case 500:
          (error as any).userMessage = 'Server error. Please try again later.';
          break;
        default:
          (error as any).userMessage = (error.response.data as any)?.error || 'An unexpected error occurred.';
      }
    }
    
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: async (userData: UserRegistration): Promise<User> => {
    const response: AxiosResponse<User> = await api.post('/register', userData);
    return response.data;
  },

  login: async (credentials: UserLogin): Promise<TokenResponse> => {
    const response: AxiosResponse<TokenResponse> = await api.post('/login', credentials);
    return response.data;
  },

  refreshToken: async (refreshToken: string): Promise<{ token: string; expiresIn: string }> => {
    const response: AxiosResponse<{ token: string; expiresIn: string }> = await api.post('/refresh-token', {
      refreshToken
    });
    return response.data;
  },

  logout: async (): Promise<{ message: string }> => {
    const response: AxiosResponse<{ message: string }> = await api.post('/logout');
    return response.data;
  },
};

export const postsAPI = {
  create: async (postData: PostRequest): Promise<Post> => {
    const response: AxiosResponse<Post> = await api.post('/posts', postData);
    return response.data;
  },
};

export const usersAPI = {
  getUsers: async (): Promise<UsersResponse> => {
    const response: AxiosResponse<UsersResponse> = await api.get('/users');
    return response.data;
  },

  getFollowing: async (): Promise<{ following: UserWithFollowStatus[] }> => {
    const response: AxiosResponse<{ following: UserWithFollowStatus[] }> = await api.get('/users/following');
    return response.data;
  },
};

export const followAPI = {
  follow: async (userId: number): Promise<{ message: string }> => {
    const response: AxiosResponse<{ message: string }> = await api.post(`/follow/${userId}`);
    return response.data;
  },

  unfollow: async (userId: number): Promise<{ message: string }> => {
    const response: AxiosResponse<{ message: string }> = await api.delete(`/follow/${userId}`);
    return response.data;
  },
};

export const feedAPI = {
  getFeed: async (page: number = 1, limit: number = 10): Promise<FeedResponse> => {
    const response: AxiosResponse<FeedResponse> = await api.get(`/feed?page=${page}&limit=${limit}`);
    return response.data;
  },
};

export { api };
export type { ApiError };