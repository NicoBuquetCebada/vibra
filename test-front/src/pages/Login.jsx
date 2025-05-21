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
      console.log('[API] POST', API_URL, { identifier, pass });
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, pass })
      });
      if (!res.ok) throw new Error('Credenciales incorrectas');
      const data = await res.json();
      setToken(data.token);
      setTimeout(() => {
        window.location.href = '/home';
      }, 100);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit} className="login-form" style={{ background: '#31384a' }}>
        <h2>Iniciar sesión</h2>
        <input
          type="text"
          placeholder="Correo o usuario"
          value={identifier}
          onChange={e => setIdentifier(e.target.value)}
          required
          style={{ background: '#262c36' }}
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={pass}
          onChange={e => setPass(e.target.value)}
          required
          style={{ background: '#262c36' }}
        />
        <button type="submit" style={{ background: '#3a7bd5' }}>Entrar</button>
        {error && <div className="error">{error}</div>}
      </form>
    </div>
  );
}
