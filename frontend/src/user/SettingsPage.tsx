import React, { useEffect, useState } from 'react';
import { Container, Typography, Box, Paper, TextField, Button, Alert, Stack } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { fetchWithAuth } from '../api';
import BottomNav from '../components/bottom-navigation';

const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    mail: '',
    firstName: '',
    surname: '',
    pass: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetchWithAuth('/api/users/page');
        const data = await res.json();
        setForm({
          name: data.name || '',
          mail: data.mail || '',
          firstName: data.firstName || '',
          surname: data.surname || '',
          pass: '',
        });
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (e) {
        setError('No se pudieron cargar los datos del usuario');
      }
    };
    fetchUser();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetchWithAuth('/api/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setSuccess('Datos actualizados correctamente');
        setTimeout(() => {
          navigate('/profile');
        }, 1200);
      } else {
        setError('Error al actualizar los datos');
      }
    } catch {
      setError('Error de red');
    }
    setLoading(false);
  };

  const handleDelete = async () => {
    if (!window.confirm('¿Seguro que quieres borrar tu usuario? Esta acción no se puede deshacer.')) return;
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetchWithAuth('/api/users', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name }),
      });
      if (res.ok) {
        setSuccess('Usuario borrado correctamente');
        navigate('/login');
      } else {
        setError('Error al borrar el usuario');
      }
    } catch {
      setError('Error de red');
    }
    setLoading(false);
  };

  return (
    <Container
      maxWidth="sm"
      disableGutters
      sx={{
        mt: { xs: 0, sm: 6 },
        px: { xs: 0, sm: 2 },
        pb: { xs: 9, sm: 10 },
        minHeight: { xs: '100vh', sm: 'auto' },
        background: { xs: '#e8e8e8', sm: 'transparent' },
        display: 'flex',
        flexDirection: 'column',
        // Solo centrado vertical en escritorio
        justifyContent: { xs: 'flex-start', sm: 'center' },
      }}
    >
      <Paper
        sx={{
          p: { xs: 2, sm: 3 },
          borderRadius: { xs: 0, sm: 3 },
          minHeight: { xs: '100vh', sm: 'auto' },
          height: { xs: '100vh', sm: 'auto' }, // Ocupa toda la altura en móvil
          width: { xs: '100vw', sm: 'auto' },  // Ocupa todo el ancho en móvil
          boxShadow: { xs: 0, sm: 3 },
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-start', // Arriba en móvil
        }}
      >
        <Typography variant="h5" gutterBottom sx={{ mt: { xs: 2, sm: 0 }, textAlign: 'center' }}>
          Configuración de perfil
        </Typography>
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            mt: 2,
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            width: '100%',
            maxWidth: { xs: '100%', sm: 480 },
            mx: { xs: 0, sm: 'auto' }, // No centrado en móvil
            flex: 1,
          }}
        >
          <TextField
            label="Nombre de usuario"
            name="name"
            value={form.name}
            onChange={handleChange}
            fullWidth
            required
          />
          <TextField
            label="Correo electrónico"
            name="mail"
            value={form.mail}
            onChange={handleChange}
            fullWidth
            required
          />
          <TextField
            label="Nombre"
            name="firstName"
            value={form.firstName}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            label="Apellidos"
            name="surname"
            value={form.surname}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            label="Contraseña"
            name="pass"
            value={form.pass}
            onChange={handleChange}
            type="password"
            fullWidth
            required
          />
          <Stack direction="row" spacing={2} justifyContent="center">
            <Button type="submit" variant="contained" color="primary" disabled={loading}>
              Guardar cambios
            </Button>
            <Button
              variant="outlined"
              color="error"
              onClick={handleDelete}
              disabled={loading}
            >
              Borrar usuario
            </Button>
          </Stack>
          {success && <Alert severity="success">{success}</Alert>}
          {error && <Alert severity="error">{error}</Alert>}
        </Box>
      </Paper>
      <BottomNav handleNavigation={navigate} />
    </Container>
  );
};

export default SettingsPage;