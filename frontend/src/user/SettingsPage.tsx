import React, { useEffect, useState } from 'react';
import { Container, Typography, Box, Paper, TextField, Button, Alert, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, IconButton, Avatar } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { getUserPage, updateUserField, updateUserPassword, deleteUser } from '../api';
import BottomNav from '../components/bottom-navigation';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PhotoCamera from '@mui/icons-material/PhotoCamera';

const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState<{
    mail: string;
    pass: string;
    img: string | File;
    name: string;
  }>({
    mail: '',
    pass: '',
    img: '',
    name: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [previewImg, setPreviewImg] = useState<string>('');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await getUserPage();
        setForm({
          mail: data.mail || '',
          pass: '',
          img: data.img || '',
          name: data.name || '',
        });
        setPreviewImg(data.img || '');
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

  // Manejar cambio de imagen
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setForm({ ...form, img: file });
      setPreviewImg(URL.createObjectURL(file));
    }
  };

  // Cambiar correo
  const handleMailUpdate = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await updateUserField('mail', form.mail);
      setSuccess('Correo actualizado correctamente');
    } catch {
      setError('Error al actualizar el correo');
    }
    setLoading(false);
  };

  // Cambiar contraseña
  const handlePassUpdate = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await updateUserPassword('', form.pass); // Si necesitas oldPass, añade un campo para ello
      setSuccess('Contraseña actualizada correctamente');
    } catch {
      setError('Error al actualizar la contraseña');
    }
    setLoading(false);
  };

  // Cambiar imagen de perfil
  const handleImgUpdate = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      if (form.img && typeof form.img !== 'string') {
        // Convertir el archivo a base64
        const toBase64 = (file: File) =>
          new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = error => reject(error);
          });

        const base64Img = await toBase64(form.img);
        await updateUserField('img', base64Img); // Ahora sí, envías un string
        setSuccess('Imagen de perfil actualizada correctamente');
      } else {
        setError('Selecciona una imagen nueva');
      }
    } catch {
      setError('Error al actualizar la imagen');
    }
    setLoading(false);
  };

  const handleOpenDialog = () => setOpenDialog(true);
  const handleCloseDialog = () => setOpenDialog(false);

  // Borrar usuario
  const handleDelete = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await deleteUser(form.name);
      setSuccess('Usuario borrado correctamente');
      navigate('/login');
    } catch {
      setError('Error al borrar el usuario');
    }
    setLoading(false);
    setOpenDialog(false);
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
        justifyContent: { xs: 'flex-start', sm: 'center' },
      }}
    >
      <Paper
        sx={{
          p: { xs: 2, sm: 3 },
          borderRadius: { xs: 0, sm: 3 },
          minHeight: { xs: '100vh', sm: 'auto' },
          height: { xs: '100vh', sm: 'auto' },
          width: { xs: '100vw', sm: 'auto' },
          boxShadow: { xs: 0, sm: 3 },
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-start',
        }}
      >
        {/* Botón de navegación hacia atrás */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <IconButton onClick={() => navigate(-1)} color="primary">
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h5" sx={{ ml: 1 }}>
            Configuración de perfil
          </Typography>
        </Box>
        {/* Imagen de perfil y botón para cambiarla */}
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
          <Avatar
            src={previewImg}
            alt="Imagen de perfil"
            sx={{ width: 90, height: 90, mb: 1 }}
          />
          <label htmlFor="profile-img-upload">
            <input
              accept="image/*"
              id="profile-img-upload"
              type="file"
              style={{ display: 'none' }}
              onChange={handleImageChange}
            />
            <Button
              variant="outlined"
              component="span"
              startIcon={<PhotoCamera />}
              sx={{ mt: 1 }}
            >
              Cambiar imagen
            </Button>
          </label>
          <Button
            variant="contained"
            color="primary"
            sx={{ mt: 1 }}
            onClick={handleImgUpdate}
            disabled={loading}
          >
            Guardar imagen
          </Button>
        </Box>
        <Box
          sx={{
            mt: 2,
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            width: '100%',
            maxWidth: { xs: '100%', sm: 480 },
            mx: { xs: 0, sm: 'auto' },
            flex: 1,
          }}
        >
          <TextField
            label="Correo electrónico"
            name="mail"
            value={form.mail}
            onChange={handleChange}
            fullWidth
            required
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleMailUpdate}
            disabled={loading}
          >
            Guardar correo
          </Button>
          <TextField
            label="Contraseña nueva"
            name="pass"
            value={form.pass}
            onChange={handleChange}
            type="password"
            fullWidth
            required
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handlePassUpdate}
            disabled={loading}
          >
            Guardar contraseña
          </Button>
          <Button
            variant="outlined"
            color="error"
            onClick={handleOpenDialog}
            disabled={loading}
            sx={{ mt: 2 }}
          >
            Borrar usuario
          </Button>
          {success && <Alert severity="success">{success}</Alert>}
          {error && <Alert severity="error">{error}</Alert>}
        </Box>
      </Paper>

      {/* Diálogo de confirmación */}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Confirmar borrado</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Seguro que quieres borrar tu usuario? Esta acción no se puede deshacer.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            Cancelar
          </Button>
          <Button onClick={handleDelete} color="error" variant="contained" disabled={loading}>
            Confirmar borrado
          </Button>
        </DialogActions>
      </Dialog>

      <BottomNav handleNavigation={navigate} />
    </Container>
  );
};

export default SettingsPage;