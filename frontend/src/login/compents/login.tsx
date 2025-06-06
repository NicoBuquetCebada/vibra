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
      }, 6400); // 5400ms + 600ms = 6000ms total como antes
    } else {
      setError(true);
    }
  };

  // Pantalla de bienvenida con fade out
  const WelcomeScreen = () => (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        background: 'linear-gradient(135deg, #307cbe 0%, #1e5a96 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        animation: fadeOutWelcome
          ? 'fadeOut 0.6s ease-in forwards'
          : 'fadeIn 0.5s ease-in-out',
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
          mb: 8, // ⬅️ Más espacio debajo (antes era 4)
          opacity: 0,
          animation: 'textSlideUp 0.8s ease-out 0.5s forwards',
          '@keyframes textSlideUp': {
            from: {
              opacity: 0,
              transform: 'translateY(30px)'
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

      {/* Eliminado el texto "Preparando tu experiencia musical..." */}

      {/* ✅ SOLO: Círculos de pulso concéntricos - EFECTO ONDAS PROGRESIVAS */}
      <Box
        sx={{
          position: 'relative',
          opacity: 1, // ✅ CAMBIO: Visible inmediatamente
          // ✅ ELIMINAR: animation: 'pulseCircles 0.5s ease-out 1.2s forwards',
        }}
      >
        {/* Círculos de ondas de agua - Aparecen uno por uno */}
        {[1, 2, 3, 4, 5, 6].map((circle) => (
          <Box
            key={circle}
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: 300 + (circle * 150),
              height: 300 + (circle * 150),
              border: `${5 - circle * 0.6}px solid rgba(255, 255, 255, ${0.7 - circle * 0.1})`,
              borderRadius: '50%',
              transform: 'translate(-50%, -50%) scale(0)',
              opacity: 0,
              // ⏩ HAZ QUE LAS ONDAS SALGAN MÁS RÁPIDO: duración 3s, delay menor
              animation: `waterRipple 3s ease-out ${0.5 + circle * 0.3}s infinite forwards`,
              '@keyframes waterRipple': {
                '0%': {
                  transform: 'translate(-50%, -50%) scale(0)',
                  opacity: 0,
                  borderWidth: '0px'
                },
                '10%': {
                  opacity: 0.9,
                  transform: 'translate(-50%, -50%) scale(0.1)',
                  borderWidth: '6px'
                },
                '15%': {
                  opacity: 0.8,
                  transform: 'translate(-50%, -50%) scale(0.3)',
                  borderWidth: '5px'
                },
                '25%': {
                  opacity: 0.7,
                  transform: 'translate(-50%, -50%) scale(0.5)',
                  borderWidth: '4px'
                },
                '40%': {
                  opacity: 0.5,
                  transform: 'translate(-50%, -50%) scale(0.8)',
                  borderWidth: '3px'
                },
                '60%': {
                  opacity: 0.3,
                  transform: 'translate(-50%, -50%) scale(1.2)',
                  borderWidth: '2px'
                },
                '80%': {
                  opacity: 0.1,
                  transform: 'translate(-50%, -50%) scale(1.8)',
                  borderWidth: '1px'
                },
                '100%': {
                  opacity: 0,
                  transform: 'translate(-50%, -50%) scale(2.2)',
                  borderWidth: '0.5px'
                }
              }
            }}
          />
        ))}

        {/* Ondas secundarias más rápidas */}
        {[1, 2, 3, 4].map((wave) => (
          <Box
            key={`wave-${wave}`}
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: 200 + (wave * 100),
              height: 200 + (wave * 100),
              border: '2px solid rgba(255, 255, 255, 0.25)',
              borderRadius: '50%',
              transform: 'translate(-50%, -50%) scale(0)',
              opacity: 0,
              // ⏩ Más rápidas: duración 2s, delay menor
              animation: `subtleWave 2s ease-out ${0.7 + wave * 0.2}s infinite forwards`,
              '@keyframes subtleWave': {
                '0%': {
                  transform: 'translate(-50%, -50%) scale(0)',
                  opacity: 0
                },
                '10%': {
                  transform: 'translate(-50%, -50%) scale(0.2)',
                  opacity: 0.6
                },
                '30%': {
                  transform: 'translate(-50%, -50%) scale(0.6)',
                  opacity: 0.4
                },
                '60%': {
                  transform: 'translate(-50%, -50%) scale(1.2)',
                  opacity: 0.2
                },
                '100%': {
                  transform: 'translate(-50%, -50%) scale(1.8)',
                  opacity: 0
                }
              }
            }}
          />
        ))}

        {/* ✅ MODIFICAR: Punto central aparece primero y late */}
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: 80, // Más grande
            height: 80,
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '50%',
            transform: 'translate(-50%, -50%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 32px 0 rgba(0,0,0,0.10)',
            animation: 'centerPulse 1.5s ease-in-out 1.2s infinite',
            '@keyframes centerPulse': {
              '0%': {
                transform: 'translate(-50%, -50%) scale(0)',
                opacity: 0
              },
              '10%': {
                transform: 'translate(-50%, -50%) scale(1)',
                opacity: 0.95
              },
              '50%': {
                transform: 'translate(-50%, -50%) scale(1.15)',
                opacity: 0.8
              },
              '100%': {
                transform: 'translate(-50%, -50%) scale(1)',
                opacity: 0.95
              }
            }
          }}
        >
          <img
            src={Logo}
            alt="Logo Vibra"
            style={{
              width: 48,
              height: 48,
              objectFit: 'contain',
              borderRadius: '50%',
            }}
          />
        </Box>
      </Box>

      {/* Mensaje adicional */}
      <Typography
        variant="body2"
        sx={{
          color: 'rgba(255, 255, 255, 0.7)',
          textAlign: 'center',
          mt: 8, // ⬅️ Más espacio arriba (antes era 4)
          opacity: 0,
          animation: 'textFadeIn 0.5s ease-out 1.8s forwards',
          '@keyframes textFadeIn': {
            from: { opacity: 0 },
            to: { opacity: 1 }
          }
        }}
      >
        Cargando tu feed personalizado...
      </Typography>
    </Box>
  );

  // ✅ MODIFICAR: El return principal
  return (
    <>
      {/* ✅ Mostrar pantalla de bienvenida si está activada */}
      {showWelcomeScreen && <WelcomeScreen />}
      
      {/* ✅ Login form original (se oculta cuando showWelcomeScreen es true) */}
      <div className="container" style={{ display: showWelcomeScreen ? 'none' : 'block' }}>
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
