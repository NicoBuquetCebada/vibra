// api.ts
// Utilidades para peticiones autenticadas a la API

// Obtener la URL de la API desde variables de entorno con fallback
const API_URL = import.meta.env.VITE_API_URL || 'http://vibra';

// Log para debugging en desarrollo
if (import.meta.env.DEV) {
  console.log('🌐 API_URL configurada:', API_URL);
}

export const fetchWithAuth = async (endpoint: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('token');
  
  // Log para debugging
  if (import.meta.env.DEV) {
    console.log('🔒 Token encontrado:', !!token);
    console.log('📡 Endpoint:', `${API_URL}${endpoint}`);
  }
  
  const headers = {
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
  
  try {
    const response = await fetch(`${API_URL}${endpoint}`, { ...options, headers });
    
    // Log de respuesta para debugging
    if (import.meta.env.DEV) {
      console.log(`📊 Respuesta ${response.status} para ${endpoint}`);
    }
    
    if (response.status === 401) {
      console.error('🚫 Token inválido o expirado');
      localStorage.removeItem('token');
      window.location.href = '/login';
      return Promise.reject(new Error('Unauthorized'));
    }
    
    return response;
  } catch (error) {
    console.error('🔥 Error en fetch:', error);
    throw error;
  }
};

// -------- HOME --------
export const getHome = async () => {
  const res = await fetchWithAuth('/api/home');
  if (!res.ok) throw new Error('Error al obtener el feed');
  return res.json();
};

export const getPostMetrics = async (postId: number) => {
  const res = await fetchWithAuth(`/api/home/${postId}`);
  if (!res.ok) throw new Error('Error al obtener métricas');
  return res.json();
};

export const searchHome = async (search: string) => {
  const res = await fetchWithAuth(`/api/home/search/${encodeURIComponent(search)}`);
  if (!res.ok) throw new Error('Error en la búsqueda');
  return res.json();
};

// -------- METRICS --------
export const ratePost = async (postId: number, rate: number) => {
  const res = await fetchWithAuth('/api/metrics/rate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ rate, postId }),
  });
  if (!res.ok) throw new Error('Error al valorar el post');
};

export const updateRate = async (postId: number, rate: number) => {
  const res = await fetchWithAuth('/api/metrics/rate', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ rate, postId }),
  });
  if (!res.ok) throw new Error('Error al actualizar el rate');
};

export const savePost = async (postId: number) => {
  const res = await fetchWithAuth('/api/metrics/save', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(postId),
  });
  if (!res.ok) throw new Error('Error al guardar el post');
};

export const deleteSave = async (postId: number) => {
  const res = await fetchWithAuth(`/api/metrics/save/${postId}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(postId),
  });
  if (!res.ok) throw new Error('Error al eliminar el guardado');
};

export const repostPost = async (postId: number) => {
  const res = await fetchWithAuth('/api/metrics/repost', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(postId),
  });
  if (!res.ok) throw new Error('Error al repostear el post');
};

export const deleteRepost = async (postId: number) => {
  const res = await fetchWithAuth(`/api/metrics/repost/${postId}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(postId),
  });
  if (!res.ok) throw new Error('Error al eliminar el repost');
};

// Obtener todos los posts guardados del usuario autenticado
export const getSavedPosts = async () => {
  // Simulación: GET /api/metrics/saves
  const res = await fetchWithAuth('/api/metrics/saves');
  if (!res.ok) throw new Error('Error al obtener posts guardados');
  return res.json();
};

// Obtener todos los reposts de un usuario (puede ser el autenticado o cualquier otro)
export const getUserReposts = async () => {
  const res = await fetchWithAuth('/api/users/reposts');
  if (!res.ok) throw new Error('Error al obtener los reposts del usuario');
  return res.json();
};

// Obtener todos los reposts de otro usuario por su nombre
export const getOtherUserReposts = async (userName: string) => {
  const res = await fetchWithAuth(`/api/users/reposts/${userName}`);
  if (!res.ok) throw new Error('Error al obtener los reposts de otro usuario');
  return res.json();
};

// -------- USERS --------
// Obtener información del usuario (nombre, imagen de perfil y correo)
export const getUserInfo = async () => {
  const res = await fetchWithAuth('/api/users/info');
  if (!res.ok) throw new Error('Error al obtener información del usuario');
  return res.json();
};

export const login = async (identifier: string, pass: string) => {
  const res = await fetchWithAuth('/api/users/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier, pass }),
  });
  if (!res.ok) throw new Error('Error al iniciar sesión');
  return res.json();
};

export const register = async (user: {
  name: string;
  mail: string;
  firstName: string;
  surname: string;
  pass: string;
}) => {
  const res = await fetchWithAuth('/api/users/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(user),
  });
  if (!res.ok) throw new Error('Error al registrar usuario');
};

export const getUserPage = async () => {
  const res = await fetchWithAuth('/api/users/page');
  if (!res.ok) throw new Error('Error al obtener datos de usuario');
  return res.json();
};

export const getOtherUserPage = async (userName: string) => {
  const res = await fetchWithAuth(`/api/users/page/${userName}`);
  if (!res.ok) throw new Error('Error al obtener datos de otro usuario');
  return res.json();
};

export const getUserPosts = async () => {
  const res = await fetchWithAuth('/api/users/posts');
  if (!res.ok) throw new Error('Error al obtener posts del usuario');
  return res.json();
};

export const getOtherUserPosts = async (userName: string) => {
  const res = await fetchWithAuth(`/api/users/posts/${userName}`);
  if (!res.ok) throw new Error('Error al obtener posts de otro usuario');
  return res.json();
};

export const updateUserField = async (field: string, value: string) => {
  const res = await fetchWithAuth(`/api/users/update/${field}/${value}`, {
    method: 'PATCH',
  });
  if (!res.ok) throw new Error('Error al actualizar el campo');
};

export const updateUserPassword = async (oldPass: string, newPass: string) => {
  const res = await fetchWithAuth('/api/users/update/password', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ oldPass, newPass }),
  });
  if (!res.ok) throw new Error('Error al actualizar la contraseña');
};

export const deleteUser = async (userName: string) => {
  const res = await fetchWithAuth(`/api/users/${userName}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Error al borrar el usuario');
};

// -------- FOLLOWS --------

// Seguir a un usuario
export const followUser = async (userName: string) => {
  const res = await fetchWithAuth(`/api/follows/follow/${userName}`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error('Error al seguir al usuario');
  return res;
};

// Dejar de seguir a un usuario
export const unfollowUser = async (userName: string) => {
  const res = await fetchWithAuth(`/api/follows/unfollow/${userName}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Error al dejar de seguir al usuario');
  return res;
};

export const getFollowed = async () => {
  const res = await fetchWithAuth('/api/follows/followed');
  if (!res.ok) throw new Error('Error al obtener seguidos');
  return res.json();
};

export const getOtherUserFollowed = async (userName: string) => {
  const res = await fetchWithAuth(`/api/follows/followed/${userName}`);
  if (!res.ok) throw new Error('Error al obtener seguidos de otro usuario');
  return res.json();
};

export const getFollowers = async () => {
  const res = await fetchWithAuth('/api/follows/followers');
  if (!res.ok) throw new Error('Error al obtener seguidores');
  return res.json();
};

export const getOtherUserFollowers = async (userName: string) => {
  const res = await fetchWithAuth(`/api/follows/followers/${userName}`);
  if (!res.ok) throw new Error('Error al obtener seguidores de otro usuario');
  return res.json();
};

// -------- SONGS --------
export const getSong = async (id: number) => {
  const res = await fetchWithAuth(`/api/songs/${id}`);
  if (!res.ok) throw new Error('Error al obtener la canción');
  return res.json();
};

export const getSongsByAlbum = async (albumId: number) => {
  const res = await fetchWithAuth(`/api/songs/albums/${albumId}`);
  if (!res.ok) throw new Error('Error al obtener canciones del álbum');
  return res.json();
};

// -------- POSTS --------
export const addSongPost = async (songName: string, coverImg: string, audio: string) => {
  const res = await fetchWithAuth('/api/posts/song', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ songName, coverImg, audio }),
  });
  if (!res.ok) throw new Error('Error al crear post de canción');
};

export const addAlbumPost = async (albumName: string, coverImg: string, songs: { name: string; audio: string }[]) => {
  const res = await fetchWithAuth('/api/posts/album', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ albumName, coverImg, songs }),
  });
  if (!res.ok) throw new Error('Error al crear post de álbum');
};

// -------- MEDIA --------
export const uploadFile = async (formData: FormData) => {
  const res = await fetchWithAuth('/api/media/upload', {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) throw new Error('Error al subir el archivo');
  return res.json();
};

export const uploadMultipleFiles = async (files: File[]) => {
  const formData = new FormData();
  files.forEach(file => formData.append('file', file));
  const res = await fetchWithAuth('/api/media/upload/multi', {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) throw new Error('Error al subir archivos');
  return res.json();
};

// -------- NOTIFICATIONS --------
export const getNotifications = async () => {
  const res = await fetchWithAuth('/api/notifications');
  if (!res.ok) throw new Error('Error al obtener notificaciones');
  return res.json();
};

// Obtener todos los rates del usuario autenticado
export const getUserRates = async () => {
  const res = await fetchWithAuth('/api/users/rates');
  if (!res.ok) throw new Error('Error al obtener rates del usuario');
  return res.json();
};

// Obtener todos los saves del usuario autenticado
export const getUserSaves = async () => {
  const res = await fetchWithAuth('/api/users/saves');
  if (!res.ok) throw new Error('Error al obtener los guardados del usuario');
  return res.json();
};

export const getPostById = async (postId: number) => {
  const res = await fetchWithAuth(`/api/posts/${postId}`);
  if (!res.ok) throw new Error('Error al obtener el post');
  return res.json();
};

export const deletePost = async (postId: number): Promise<void> => {
  const response = await fetchWithAuth(`/api/posts/${postId}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    throw new Error('Error al eliminar el post');
  }
};

// -------- DEBUGGING UTILS --------
export const checkApiConnection = async () => {
  try {
    console.log('🔍 Verificando conexión con API...');
    console.log('🌐 URL configurada:', API_URL);
    console.log('🔒 Token almacenado:', !!localStorage.getItem('token'));
    
    // Intenta una petición simple al backend
    const response = await fetch(`${API_URL}/api/users`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    console.log('📡 Estado de respuesta:', response.status);
    console.log('✅ Conexión con API establecida');
    return true;
  } catch (error) {
    console.error('❌ Error de conexión con API:', error);
    console.error('🔍 Posibles causas:');
    console.error('  - Backend no está corriendo');
    console.error('  - URL incorrecta:', API_URL);
    console.error('  - Problemas de CORS');
    console.error('  - Problemas de red/DNS');
    return false;
  }
};

// Función para debugging localStorage
export const debugLocalStorage = () => {
  console.log('🗃️ Estado de localStorage:');
  console.log('  - Token existe:', !!localStorage.getItem('token'));
  console.log('  - Token length:', localStorage.getItem('token')?.length || 0);
  console.log('  - Token preview:', localStorage.getItem('token')?.substring(0, 20) + '...');
};
