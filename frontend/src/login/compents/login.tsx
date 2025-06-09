import React, { useState, useContext } from 'react';
import '../../styles/global.scss';
import { TextField, Button, IconButton, InputAdornment, Box, Typography } from '@mui/material';
import { AuthContext } from '../../context/auth-context';
import { useNavigate } from 'react-router-dom';
import Logo from '../../assets/logo.png'
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

const Login: React.FC = () => {
  const authContext = useContext(AuthContext);

  if (!authContext) {
    throw new Error('AuthContext debe ser utilizado dentro de un AuthProvider');
  }

  const { login, completeLogin } = authContext; // ✅ AGREGAR completeLogin
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const navigate = useNavigate();

  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showWelcomeScreen, setShowWelcomeScreen] = useState(false);
  const [fadeOutWelcome, setFadeOutWelcome] = useState(false); // Nuevo estado

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };

  // ✅ MODIFICAR: handleSubmit con pantalla de bienvenida
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(false);

    const success = await login(emailOrUsername, password);
    setLoading(false);

    if (success) {
      setShowWelcomeScreen(true);

      setTimeout(async () => {
        // Inicia el fade out
        setFadeOutWelcome(true);
        // Espera la animación antes de completar el login y desmontar la pantalla
        setTimeout(async () => {
          await completeLogin();
          setShowWelcomeScreen(false);
          setFadeOutWelcome(false);
        }, 600); // 600ms = duración del fade out
      }, 2500); // 2 segundos total
    } else {
      setError(true);
    }
  };

  // Pantalla de bienvenida con efecto de expansión circular
  const WelcomeScreen = () => (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: 'linear-gradient(135deg, #307cbe 0%, #1e5a96 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        animation: fadeOutWelcome
          ? 'fadeOut 0.6s ease-in forwards'
          : 'fadeIn 0.3s ease-out',
        '@keyframes fadeIn': {
          from: { opacity: 0 },
          to: { opacity: 1 }
        },
        '@keyframes fadeOut': {
          from: { opacity: 1 },
          to: { opacity: 0 }
        }
      }}
    >
      {/* Mensaje de bienvenida */}
      <Typography
        variant="h4"
        sx={{
          color: 'white',
          fontWeight: 'bold',
          textAlign: 'center',
          mb: 6,
          opacity: 0,
          animation: 'textSlideUp 0.6s ease-out 0.3s forwards',
          '@keyframes textSlideUp': {
            from: {
              opacity: 0,
              transform: 'translateY(20px)'
            },
            to: {
              opacity: 1,
              transform: 'translateY(0)'
            }
          }
        }}
      >
        ¡Bienvenido a Vibra!
      </Typography>

      {/* Contenedor del efecto de expansión */}
      <Box
        sx={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Círculo que se expande para cubrir la pantalla */}
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: 100,
            height: 100,
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '50%',
            transform: 'translate(-50%, -50%)',
            opacity: 0,
            animation: fadeOutWelcome 
              ? 'expandToFullScreen 0.6s ease-in-out forwards'
              : 'logoAppear 0.8s ease-out 0.8s forwards',
            '@keyframes logoAppear': {
              '0%': {
                transform: 'translate(-50%, -50%) scale(0)',
                opacity: 0
              },
              '30%': {
                transform: 'translate(-50%, -50%) scale(1.1)',
                opacity: 0.9
              },
              '100%': {
                transform: 'translate(-50%, -50%) scale(1)',
                opacity: 0.95
              }
            },
            '@keyframes expandToFullScreen': {
              '0%': {
                transform: 'translate(-50%, -50%) scale(1)',
                opacity: 0.95
              },
              '100%': {
                transform: 'translate(-50%, -50%) scale(30)',
                opacity: 1
              }
            }
          }}
        />

        {/* Logo central */}
        <Box
          sx={{
            position: 'relative',
            zIndex: 2,
            opacity: 0,
            animation: fadeOutWelcome 
              ? 'logoFadeOut 0.3s ease-out forwards'
              : 'logoFadeIn 0.5s ease-out 1.2s forwards',
            '@keyframes logoFadeIn': {
              from: { 
                opacity: 0,
                transform: 'scale(0.8)'
              },
              to: { 
                opacity: 1,
                transform: 'scale(1)'
              }
            },
            '@keyframes logoFadeOut': {
              from: { 
                opacity: 1,
                transform: 'scale(1)'
              },
              to: { 
                opacity: 0,
                transform: 'scale(1.1)'
              }
            }
          }}
        >
          <img
            src={Logo}
            alt="Logo Vibra"
            style={{
              width: 60,
              height: 60,
              objectFit: 'contain',
              borderRadius: '50%',
            }}
          />
        </Box>
      </Box>

      {/* Mensaje de carga */}
      <Typography
        variant="body2"
        sx={{
          color: 'rgba(255, 255, 255, 0.8)',
          textAlign: 'center',
          mt: 6,
          opacity: 0,
          animation: fadeOutWelcome 
            ? 'textFadeOut 0.2s ease-out forwards'
            : 'textFadeIn 0.4s ease-out 1.5s forwards',
          '@keyframes textFadeIn': {
            from: { opacity: 0 },
            to: { opacity: 1 }
          },
          '@keyframes textFadeOut': {
            from: { opacity: 1 },
            to: { opacity: 0 }
          }
        }}
      >
        Preparando tu feed personalizado...
      </Typography>
    </Box>
  );

  // ✅ MODIFICAR: El return principal
  return (
    <>
      {/* ✅ Mostrar pantalla de bienvenida si está activada */}
      {showWelcomeScreen && <WelcomeScreen />}
      
      {/* ✅ Login form original (se oculta cuando showWelcomeScreen es true) */}
      <div className="container" style={{ 
        display: showWelcomeScreen ? 'none' : 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh'
      }}>
        <div className="login-card">
          <img src={Logo} alt="Logo Vibra" className="logo-img" />
          <h1>Inicia Sesión</h1>
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
              disabled={loading}
            />
            <TextField
              label="Contraseña"
              type={showPassword ? 'text' : 'password'}
              variant="outlined"
              fullWidth
              margin="normal"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={error}
              disabled={loading}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleClickShowPassword}
                      onMouseDown={handleMouseDownPassword}
                      edge="end"
                      sx={{ 
                        bgcolor: 'transparent !important',
                        '&:hover': { 
                          bgcolor: 'transparent !important',
                          color: 'primary.main'
                        },
                        '&.MuiIconButton-root': {
                          bgcolor: 'transparent !important'
                        },
                        color: showPassword ? 'primary.main' : 'grey.600'
                      }}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <Button variant="contained" fullWidth className="btn" type="submit" disabled={loading}>
              {loading ? 'Entrando...' : 'Entrar'} 
            </Button>
          </form>
          <div className="footer">
            <p>
              ¿No tienes cuenta? 
              <span
                style={{ color: '#307cbe', cursor: 'pointer', textDecoration: 'underline' }}
                onClick={() => navigate('/signup')}
              >
                Regístrate aquí
              </span>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
