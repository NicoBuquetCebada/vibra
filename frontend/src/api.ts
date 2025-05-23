// api.ts
// Utilidades para peticiones autenticadas a la API

const API_URL = 'http://localhost:8080';

export const fetchWithAuth = async (endpoint: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('token');
  const headers = {
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
  const response = await fetch(`${API_URL}${endpoint}`, { ...options, headers });
  if (response.status === 401) {
    localStorage.removeItem('token');
    window.location.href = '/login';
    return Promise.reject(new Error('Unauthorized'));
  }
  return response;
};

export interface PostMetrics {
  postId: number;
  rate: number;
  saved: boolean;
  reposted: boolean;
}

export const getPostMetrics = async (postId: number): Promise<PostMetrics> => {
  const response = await fetchWithAuth(`/api/home/${postId}`);
  if (!response.ok) throw new Error('Error obteniendo métricas');
  return response.json();
};

export const ratePost = async (postId: number, rating: number): Promise<void> => {
  const response = await fetchWithAuth('/api/metrics/rate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      postId,
      rate: rating
    }),
  });
  if (!response.ok) throw new Error('Error al calificar el post');
};

export const savePost = async (postId: number): Promise<void> => {
  const response = await fetchWithAuth('/api/metrics/save', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(postId),
  });
  if (!response.ok) throw new Error('Error al guardar el post');
};

export const repostPost = async (postId: number): Promise<void> => {
  const response = await fetchWithAuth('/api/metrics/repost', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(postId),
  });
  if (!response.ok) throw new Error('Error al repostear el post');
};
