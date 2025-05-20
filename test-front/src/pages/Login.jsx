import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { setToken } from '../auth';

const API_URL = 'http://localhost:8080/api/users/login';

export default function Login() {
  const [identifier, setIdentifier] = useState('');
  const [pass, setPass] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, pass })
      });
      if (!res.ok) throw new Error('Credenciales incorrectas');
      const data = await res.json();
      setToken(data.token);
      // Forzar refresh para asegurar que el token esté disponible y rutas protegidas funcionen
      window.location.href = '/home';
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit} className="login-form">
        <h2>Iniciar sesión</h2>
        <input
          type="text"
          placeholder="Correo o usuario"
          value={identifier}
          onChange={e => setIdentifier(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={pass}
          onChange={e => setPass(e.target.value)}
          required
        />
        <button type="submit">Entrar</button>
        {error && <div className="error">{error}</div>}
      </form>
    </div>
  );
}
