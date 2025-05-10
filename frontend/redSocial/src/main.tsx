
import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/global.scss';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import AppRouter from './routes/appRouter';
import {AuthProvider}  from './context/auth-context';

// Definimos el tema de MUI
const theme = createTheme({
  palette: {
    primary: {
      main: '#4CAF50', // Color primario (verde amigable)
    },
    secondary: {
      main: '#81C784', // Color secundario (verde claro)
    },
    background: {
      default: '#E8F5E9', // Fondo (verde pálido)
    },
    text: {
      primary: '#424242', // Texto principal
      secondary: '#9E9E9E', // Texto secundario
    },
  },
});

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <AuthProvider>
    <ThemeProvider theme={theme}>
      <AppRouter />
    </ThemeProvider>
    </AuthProvider>
  </React.StrictMode>
);