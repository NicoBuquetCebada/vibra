import React, { useState, useContext } from 'react';
import '../../styles/global.scss';
import { TextField, Button } from '@mui/material';
import { AuthContext } from '../../context/auth-context'; // Importamos el contexto
import { useNavigate } from 'react-router-dom'; // Para redirigir al home

const Login: React.FC = () => {
  const authContext = useContext(AuthContext);

  if (!authContext) {
    throw new Error('AuthContext debe ser utilizado dentro de un AuthProvider');
  }

  const { login } = authContext;
  const navigate = useNavigate();

  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validamos las credenciales
    const success = login(emailOrUsername, password);

    if (success) {
      // Si las credenciales son correctas, redirige al home
      navigate('/home');
    } else {
      // Muestra un error si las credenciales son incorrectas
      setError(true);
    }
  };

  return (
    <div className="container">
      <div className="login-card">
        <h1 className="title">BeatConnect</h1>
        <h1>Iniciar Sesión</h1>
        <p className="description">¡Conéctate a tu red social musical favorita!</p>
        <form onSubmit={handleSubmit}>
          <TextField
            label="Correo Electrónico o Usuario"
            variant="outlined"
            fullWidth
            margin="normal"
            value={emailOrUsername}
            onChange={(e) => setEmailOrUsername(e.target.value)}
            error={error}
            helperText={error ? 'Credenciales incorrectas' : ''}
          />
          <TextField
            label="Contraseña"
            type="password"
            variant="outlined"
            fullWidth
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={error}
          />
          <Button variant="contained" fullWidth className="btn" type="submit">
            Entrar
          </Button>
        </form>
        <div className="footer">
          <p>
            ¿No tienes cuenta? <a href="/signup">Regístrate aquí</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
