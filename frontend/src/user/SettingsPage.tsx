import React, { useEffect, useState, useContext } from 'react';
import { Container, Typography, Box, Paper, TextField, Button, Alert, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, IconButton, Avatar, Tooltip, Drawer, List, ListItem, ListItemIcon, ListItemText, Divider, useMediaQuery } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { getUserPage, updateUserField, updateUserPassword, deleteUser } from '../api';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import HomeIcon from '@mui/icons-material/Home';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import NotificationsIcon from '@mui/icons-material/Notifications';
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import Logo from '../assets/basic_logo.png';
import { AuthContext } from '../context/auth-context';

const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const auth = useContext(AuthContext);
const [form, setForm] = useState<{
  mail: string;
  pass: string;
  img: string | File; // <-- acepta string o File
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
  const [openLogoutDialog, setOpenLogoutDialog] = useState(false);
  const [previewImg, setPreviewImg] = useState<string>('');
  const isMobile = useMediaQuery('(max-width:900px)');
  const [drawerOpen, setDrawerOpen] = useState(false);

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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setForm({ ...form, img: file });
      setPreviewImg(URL.createObjectURL(file));
    }
  };

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

  const handlePassUpdate = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await updateUserPassword('', form.pass);
      setSuccess('Contraseña actualizada correctamente');
    } catch {
      setError('Error al actualizar la contraseña');
    }
    setLoading(false);
  };

  const handleImgUpdate = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      if (form.img && typeof form.img !== 'string') {
        const toBase64 = (file: File) =>
          new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = error => reject(error);
          });

        const base64Img = await toBase64(form.img);
        await updateUserField('img', base64Img);
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

  const handleLogout = () => {
    if (auth?.logout) auth.logout();
    navigate('/login');
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    setDrawerOpen(false);
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
        flexDirection: 'row', // Cambiado para drawer
        justifyContent: { xs: 'flex-start', sm: 'center' },
      }}
    >
      {/* Botón menú solo en desktop */}
      {!isMobile && (
        <Tooltip title="Menú" arrow placement="bottom">
          <IconButton
            onClick={() => setDrawerOpen(true)}
            sx={{
              position: 'fixed',
              top: 19,
              left: 16,
              zIndex: 2000,
              boxShadow: '0 2px 8px rgba(48,124,190,0.18)',
              background: 'rgba(255,255,255,0.8)',
              padding: '6px',
              '&:hover': { background: 'rgba(255,255,255,0.9)' },
            }}
          >
            <Box
              component="img"
              src={Logo}
              alt="Logo"
              sx={{ width: '40px', height: '40px', objectFit: 'contain' }}
            />
          </IconButton>
        </Tooltip>
      )}

      {/* Drawer lateral solo en desktop */}
      {!isMobile && (
        <Drawer
          anchor="left"
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          PaperProps={{
            sx: {
              width: '340px',
              background: '#f7fafd',
              boxShadow: '8px 0 24px rgba(48,124,190,0.10)',
              display: 'flex',
              flexDirection: 'column',
              height: '100%',
            }
          }}
        >
          <Box
            sx={{
              width: '100%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              py: 3,
              borderBottom: '1px solid #e3e6ea',
              mb: 1,
            }}
          >
            <Box
              component="img"
              src={Logo}
              alt="Logo Vibra"
              sx={{ width: 80, height: 80, objectFit: 'contain' }}
            />
          </Box>
          <List>
            <ListItem
              sx={{
                backgroundColor: '#f7fafd',
                border: 'none',
                cursor: 'pointer',
                transition: 'background 0.2s',
                '&:hover': { backgroundColor: '#e3e6ea' },
              }}
              component="button"
              onClick={() => handleNavigation('/home')}
            >
              <ListItemIcon><HomeIcon sx={{ color: '#307cbe' }} /></ListItemIcon>
              <ListItemText primary="Inicio" />
            </ListItem>
            <Divider />
            <ListItem
              sx={{
                backgroundColor: '#f7fafd',
                border: 'none',
                cursor: 'pointer',
                transition: 'background 0.2s',
                '&:hover': { backgroundColor: '#e3e6ea' },
              }}
              component="button"
              onClick={() => handleNavigation('/upload')}
            >
              <ListItemIcon><AddCircleIcon sx={{ color: '#307cbe' }} /></ListItemIcon>
              <ListItemText primary="Subir" />
            </ListItem>
            <Divider />
            <ListItem
              sx={{
                backgroundColor: '#f7fafd',
                border: 'none',
                cursor: 'pointer',
                transition: 'background 0.2s',
                '&:hover': { backgroundColor: '#e3e6ea' },
              }}
              component="button"
              onClick={() => handleNavigation('/notifications')}
            >
              <ListItemIcon><NotificationsIcon sx={{ color: '#307cbe' }} /></ListItemIcon>
              <ListItemText primary="Notificaciones" />
            </ListItem>
            <Divider />
            <ListItem
              sx={{
                backgroundColor: '#f7fafd',
                border: 'none',
                cursor: 'pointer',
                transition: 'background 0.2s',
                '&:hover': { backgroundColor: '#e3e6ea' },
              }}
              component="button"
              onClick={() => handleNavigation('/profile')}
            >
              <ListItemIcon><PersonIcon sx={{ color: '#307cbe' }} /></ListItemIcon>
              <ListItemText primary="Perfil" />
            </ListItem>
            <Divider />
          </List>
          <Box sx={{ flexGrow: 1 }} />
          <List sx={{paddingBottom: '0px'}}>
            <ListItem
              sx={{
                border: 'none',
                cursor: 'pointer',
                transition: 'background 0.2s',
                '&:hover': { backgroundColor: '#ffeaea' },
              }}
              component="button"
              onClick={handleLogout}
            >
              <ListItemIcon><LogoutIcon sx={{ color: '#e53935' }} /></ListItemIcon>
              <ListItemText primary="Cerrar sesión" />
            </ListItem>
          </List>
        </Drawer>
      )}

      {/* Contenido principal */}
      <Box sx={{ flex: 1 }}>
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
            <Box
              sx={{
                mt: 2,
                display: 'flex',
                flexDirection: 'row',
                gap: 2,
                width: '100%',
                maxWidth: { xs: '100%', sm: 480 },
                mx: { xs: 0, sm: 'auto' },
                flex: 1,
                justifyContent: 'flex-end',
              }}
            >
              <Button
                variant="outlined"
                color="secondary"
                onClick={() => setOpenLogoutDialog(true)}
                disabled={loading}
              >
                Cerrar sesión
              </Button>
              <Button
                variant="outlined"
                color="error"
                onClick={handleOpenDialog}
                disabled={loading}
              >
                Borrar usuario
              </Button>
            </Box>
            {success && <Alert severity="success">{success}</Alert>}
            {error && <Alert severity="error">{error}</Alert>}
          </Box>
        </Paper>
      </Box>

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

      {/* Diálogo de confirmación de logout */}
      <Dialog open={openLogoutDialog} onClose={() => setOpenLogoutDialog(false)}>
        <DialogTitle>¿Cerrar sesión?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Seguro que quieres cerrar sesión?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenLogoutDialog(false)} color="primary">
            Cancelar
          </Button>
          <Button onClick={handleLogout} color="error" variant="contained">
            Cerrar sesión
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default SettingsPage;