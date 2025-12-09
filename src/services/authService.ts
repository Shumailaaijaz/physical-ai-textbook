import { USE_MOCK_API, getApiBaseUrl } from '@/config';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  preferences?: {
    experienceLevel?: 'Novice' | 'Professional';
    language?: 'English' | 'Urdu';
  };
}

export interface AuthResponse {
  user: User;
  token: string;
}

// --- Mock Implementation ---

const MOCK_USER_STORAGE_KEY = 'physical_ai_mock_user';

const mockLogin = async (email: string, password: string): Promise<AuthResponse> => {
  await new Promise((resolve) => setTimeout(resolve, 800)); // Simulate network delay
  
  if (password === 'error') throw new Error('Invalid credentials');

  const user: User = {
    id: 'mock-user-123',
    email,
    name: email.split('@')[0],
    avatar: 'https://i.pravatar.cc/150?u=mock-user-123',
  };

  localStorage.setItem(MOCK_USER_STORAGE_KEY, JSON.stringify(user));
  return { user, token: 'mock-jwt-token' };
};

const mockSignup = async (email: string, password: string, name: string): Promise<AuthResponse> => {
  await new Promise((resolve) => setTimeout(resolve, 800));
  
  const user: User = {
    id: 'mock-user-' + Date.now(),
    email,
    name,
    avatar: `https://i.pravatar.cc/150?u=${email}`,
  };

  localStorage.setItem(MOCK_USER_STORAGE_KEY, JSON.stringify(user));
  return { user, token: 'mock-jwt-token' };
};

const mockGetSession = async (): Promise<User | null> => {
  await new Promise((resolve) => setTimeout(resolve, 200));
  const stored = localStorage.getItem(MOCK_USER_STORAGE_KEY);
  return stored ? JSON.parse(stored) : null;
};

const mockLogout = async (): Promise<void> => {
  localStorage.removeItem(MOCK_USER_STORAGE_KEY);
};

// --- Real Implementation (Fetch) ---

const realLogin = async (email: string, password: string): Promise<AuthResponse> => {
  const res = await fetch(`${getApiBaseUrl()}/api/auth/sign-in/email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error('Login failed');
  const data = await res.json();
  localStorage.setItem('auth_token', data.token);
  localStorage.setItem('auth_user', JSON.stringify(data.user));
  return data;
};

const realSignup = async (email: string, password: string, name: string): Promise<AuthResponse> => {
  const res = await fetch(`${getApiBaseUrl()}/api/auth/sign-up/email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, name }),
  });
  if (!res.ok) throw new Error('Signup failed');
  const data = await res.json();
  localStorage.setItem('auth_token', data.token);
  localStorage.setItem('auth_user', JSON.stringify(data.user));
  return data;
};

const realGetSession = async (): Promise<User | null> => {
  const token = localStorage.getItem('auth_token');
  const userStr = localStorage.getItem('auth_user');
  if (token && userStr) {
    return JSON.parse(userStr);
  }
  return null;
};

const realLogout = async (): Promise<void> => {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('auth_user');
};

// --- Exported Service ---

export const AuthService = {
  login: USE_MOCK_API ? mockLogin : realLogin,
  signup: USE_MOCK_API ? mockSignup : realSignup,
  getSession: USE_MOCK_API ? mockGetSession : realGetSession,
  logout: USE_MOCK_API ? mockLogout : realLogout,
};