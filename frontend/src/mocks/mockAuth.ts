
// Interfaz para tipar los datos del usuario
interface UserData {
  id: number;
  username: string;
}

// Mock de usuarios
export const mockUsers = [
  {
    id: 1,
    email: 'user1@example.com',
    username: 'jorgelm',
    password: 'Octubre1997*',
  },
  {
    id: 2,
    email: 'user2@example.com',
    username: 'user2',
    password: 'Password456!',
  },
];

// Función para generar un token JWT simulado (mock)
export const generateToken = (userData: UserData): string => {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' })); // Simula el header
  const payload = btoa(JSON.stringify(userData)); // Simula el payload
  const signature = 'mock_signature'; // Simula una firma (no real)
  return `${header}.${payload}.${signature}`; // Devuelve un "token" con tres partes
};

// Función para validar y decodificar el token
export const validateToken = (token: string): UserData | null => {
  try {
    const [header, payload, signature] = token.split('.'); // Divide el token en tres partes

    if (!header || !payload || !signature) {
      throw new Error('Token inválido: faltan partes');
    }

    const decoded = JSON.parse(atob(payload)); // Decodifica el payload
    console.log('Token válido:', decoded);
    return decoded; // Devuelve los datos del token si es válido
  } catch (error) {
    // Manejar error de manera segura
    if (error instanceof Error) {
      console.error('Error al decodificar el token:', error.message);
    } else {
      console.error('Error desconocido al decodificar el token.');
    }
    return null;
  }
};
