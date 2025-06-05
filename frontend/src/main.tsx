import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/global.scss';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import AppRouter from './routes/appRouter';
import {AuthProvider}  from './context/auth-context';
import { PlayerProvider } from './context/player-context';
import Particles from './components/Particles';
import './components/Particles.css';

// Definimos el tema de MUI
const theme = createTheme({
  palette: {
    primary: {
      main: '#307cbe', // Color primario (azul)
    },
    secondary: {
      main: '#145a96', // Color secundario (azul oscuro)
    },
    background: {
      default: '#000000', // Fondo principal
    },
    text: {
      primary: '#424242', // Texto principal
      secondary: '#9E9E9E', // Texto secundario
    },
  },
});

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <Particles
      particleColors={["#307cbe", "#307cbe"]}
      particleCount={300}
      particleSpread={10}
      speed={0.1}
      particleBaseSize={100}
      moveParticlesOnHover={true}
      alphaParticles={false}
      disableRotation={true}
    />
    <PlayerProvider>
    <AuthProvider>
        <ThemeProvider theme={theme}>
          <div style={{ position: 'relative', zIndex: 1, minHeight: '100vh' }}>
            <AppRouter />
          </div>
        </ThemeProvider>
        </AuthProvider>
      </PlayerProvider>
  </React.StrictMode>
);