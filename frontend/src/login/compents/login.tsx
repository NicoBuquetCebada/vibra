import React, { useState, useContext } from 'react';
import '../../styles/global.scss';
import { TextField, Button } from '@mui/material';
import { AuthContext } from '../../context/auth-context'; // Importamos el contexto
import { useNavigate } from 'react-router-dom'; // Para redirigir al home
import Logo from '../../assets/logo.png'

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
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(false);

    // Usamos la función de login asíncrona
    const success = await login(emailOrUsername, password);

    setLoading(false);

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
        <img src={Logo} alt="Logo Vibra" className="logo-img" />
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
            disabled={loading} // Deshabilitar campo si está cargando
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
            disabled={loading} // Deshabilitar campo si está cargando
          />
          <Button variant="contained" fullWidth className="btn" type="submit" disabled={loading}>
            {loading ? 'Entrando...' : 'Entrar'} 
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
