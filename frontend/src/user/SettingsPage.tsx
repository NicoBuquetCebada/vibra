import React, { useEffect, useState, useContext } from 'react';
import { Container, Typography, Box, Paper, TextField, Button, Alert, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, IconButton, Avatar, Tooltip, Drawer, List, ListItem, ListItemIcon, ListItemText, Divider, useMediaQuery, Snackbar } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { getUserInfo, updateUserField, updateUserPassword, deleteUser, uploadFile, fetchWithAuth } from '../api';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import HomeIcon from '@mui/icons-material/Home';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import NotificationsIcon from '@mui/icons-material/Notifications';
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import Logo from '../assets/basic_logo.png';
import { AuthContext } from '../context/auth-context';

// Componente para la sección de actualización de correo
const MailUpdateSection: React.FC<{
  form: any;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleMailUpdate: () => void;
  loading: boolean;
}> = ({ form, handleChange, handleMailUpdate, loading }) => {
  const [showEmailField, setShowEmailField] = useState(false);

  return (
    <Box sx={{ width: '100%' }}>
      {!showEmailField ? (
        <Button
          variant="outlined"
          onClick={() => setShowEmailField(true)}
          size="large"
          fullWidth
          sx={{
            borderColor: '#307cbe',
            color: '#307cbe',
            py: 1.5,
            px: 3,
            '&:hover': {
              borderColor: '#245a8a',
              backgroundColor: 'rgba(48, 124, 190, 0.04)'
            }
          }}
        >
          Cambiar correo
        </Button>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            fullWidth
            label="Nuevo correo electrónico"
            name="mail"
            value={form.mail}
            onChange={handleChange}
            size="small"
            sx={{
              '& .MuiOutlinedInput-root': {
                '&.Mui-focused fieldset': {
                  borderColor: '#307cbe',
                }
              }
            }}
          />
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              onClick={() => setShowEmailField(false)}
              sx={{
                borderColor: '#ccc',
                color: '#666',
                '&:hover': {
                  borderColor: '#999',
                  backgroundColor: 'rgba(0,0,0,0.04)'
                }
              }}
            >
              Cancelar
            </Button>
            <Button
              variant="contained"
              onClick={handleMailUpdate}
              disabled={loading || !form.mail}
              sx={{
                backgroundColor: '#307cbe',
                '&:hover': { backgroundColor: '#245a8a' }
              }}
            >
              {loading ? 'Actualizando...' : 'Confirmar'}
            </Button>
          </Box>
        </Box>
      )}
    </Box>
  );
};

const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const auth = useContext(AuthContext);
  const [form, setForm] = useState<{
    mail: string;
    img: string | File;
    name: string;
    currentMail?: string; // Para mostrar el correo actual
  }>({
    mail: '',
    img: '',
    name: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [openLogoutDialog, setOpenLogoutDialog] = useState(false);
  const [openPasswordDialog, setOpenPasswordDialog] = useState(false);
  const [previewImg, setPreviewImg] = useState<string>('');
  const [passwordForm, setPasswordForm] = useState({
    oldPass: '',
    newPass: '',
  });
  const isMobile = useMediaQuery('(max-width:900px)');
  const [drawerOpen, setDrawerOpen] = useState(false);
  
  // Estados para las notificaciones tipo toast
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastSeverity, setToastSeverity] = useState<'success' | 'error'>('success');

  const fetchUserInfo = async () => {
    try {
      const data = await getUserInfo();
      setForm({
        mail: '', // Campo vacío para el nuevo correo
        img: data.profileImg || '',
        name: data.name || '',
        currentMail: data.mail || '', // Guardamos el correo actual
      });
      setPreviewImg(data.profileImg || '');
    } catch (e) {
      setError('No se pudieron cargar los datos del usuario');
    }
  };

  // Función para mostrar notificaciones tipo toast
  const showToast = (message: string, severity: 'success' | 'error' = 'success') => {
    setToastMessage(message);
    setToastSeverity(severity);
    setToastOpen(true);
  };

  useEffect(() => {
    fetchUserInfo();
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
      showToast('Correo actualizado correctamente');
      // Actualizar el correo actual en el estado
      setForm(prev => ({ ...prev, currentMail: form.mail, mail: '' }));
      // Redirigir al perfil después de 1.5 segundos
      setTimeout(() => {
        navigate('/profile');
      }, 1500);
    } catch {
      showToast('Error al actualizar el correo', 'error');
    }
    setLoading(false);
  };

  const handlePasswordDialogOpen = () => setOpenPasswordDialog(true);
  const handlePasswordDialogClose = () => {
    setOpenPasswordDialog(false);
    setPasswordForm({ oldPass: '', newPass: '' });
    setError(null);
    setSuccess(null);
  };

  const handlePasswordFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value });
  };

  const handlePasswordUpdate = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await updateUserPassword(passwordForm.oldPass, passwordForm.newPass);
      setSuccess('Contraseña actualizada correctamente. Redirigiendo...');
      setPasswordForm({ oldPass: '', newPass: '' }); // Limpiar el formulario
      setTimeout(() => {
        if (auth?.logout) auth.logout();
        navigate('/login');
      }, 1200);
    } catch {
      setError('Error al actualizar la contraseña. Verifica que la contraseña actual sea correcta.');
    }
    setLoading(false);
  };

  const handleImgUpdate = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      if (form.img && typeof form.img !== 'string') {
        // Crear FormData y usar uploadFile de api.ts
        const formData = new FormData();
        formData.append('file', form.img);
        const data = await uploadFile(formData);
        const ruta = data.url;
        // PATCH a /api/users/update/profileimg/{ruta} usando fetchWithAuth
        const patchRes = await fetchWithAuth(`/api/users/update/profileimg/${encodeURIComponent(ruta)}`, {
          method: 'PATCH',
        });
        if (!patchRes.ok) throw new Error('Error al actualizar la imagen de perfil');
        showToast('Imagen de perfil actualizada correctamente');
        setPreviewImg(ruta);
        setForm(f => ({ ...f, img: ruta }));
        // Redirigir al perfil después de 1.5 segundos
        setTimeout(() => {
          navigate('/profile');
        }, 1500);
      } else {
        showToast('Selecciona una imagen nueva', 'error');
      }
    } catch {
      showToast('Error al actualizar la imagen', 'error');
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
    <div
      style={{
        width: '100%',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        padding: '48px 0',
        margin: 0,
        boxSizing: 'border-box'
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
              mt: 1,
              mb: 1,
            }}
          >
            <Box
              component="img"
              src={Logo}
              alt="Logo Vibra"
              sx={{ width: 40, height: 40, objectFit: 'contain' }}
            />
          </Box>
          <List>
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
            p: 4,
            borderRadius: 3,
            width: '80%',
            minWidth: '880px',
            boxShadow: 3,
            background: 'linear-gradient(135deg, #f7fafd 0%, #ffffff 100%)',
            border: '1px solid rgba(48, 124, 190, 0.08)',
            mx: 'auto'
          }}
        >
          {/* Botón de navegación hacia atrás */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
            <IconButton onClick={() => navigate(-1)} color="primary">
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h5" sx={{ ml: 1 }}>
              Configuración de perfil
            </Typography>
          </Box>

          {/* Layout principal: Imagen/ajustes a la izquierda, resto a la derecha */}
          <Box sx={{ 
            display: 'flex', 
            gap: 4,
            alignItems: 'flex-start',
            mb: 4
          }}>
            {/* Sección izquierda: Imagen de perfil y contraseña */}
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center',
              width: '400px'
            }}>
              {/* Avatar */}
              <Avatar
                src={previewImg}
                alt="Imagen de perfil"
                sx={{ 
                  width: 200, 
                  height: 200, 
                  mb: 3,
                  border: '3px solid rgba(48, 124, 190, 0.1)',
                  boxShadow: '0 4px 12px rgba(48, 124, 190, 0.15)'
                }}
              />
              
              {/* Controles de imagen */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%', maxWidth: '320px', mb: 4 }}>
                <input
                  accept="image/*"
                  id="profile-img-upload"
                  type="file"
                  style={{ display: 'none' }}
                  onChange={handleImageChange}
                />
                <label htmlFor="profile-img-upload">
                  <Button
                    variant="outlined"
                    component="span"
                    startIcon={<PhotoCamera />}
                    fullWidth
                    size="large"
                    sx={{
                      borderColor: '#307cbe',
                      color: '#307cbe',
                      py: 1.5,
                      '&:hover': {
                        borderColor: '#245a8a',
                        backgroundColor: 'rgba(48, 124, 190, 0.04)'
                      }
                    }}
                  >
                    Editar imagen
                  </Button>
                </label>
                
                {form.img instanceof File && (
                  <Button
                    variant="contained"
                    onClick={handleImgUpdate}
                    disabled={loading}
                    fullWidth
                    size="large"
                    sx={{
                      backgroundColor: '#307cbe',
                      py: 1.5,
                      '&:hover': { backgroundColor: '#245a8a' }
                    }}
                  >
                    {loading ? 'Guardando...' : 'Confirmar imagen'}
                  </Button>
                )}
              </Box>

              {/* Sección de cambio de contraseña */}
              <Box sx={{ width: '100%', maxWidth: '320px' }}>
                <Typography variant="subtitle1" sx={{ 
                  color: '#307cbe', 
                  fontWeight: 600, 
                  mb: 2,
                  fontSize: '1.1rem',
                  textAlign: 'center'
                }}>
                  Contraseña
                </Typography>
                
                <Button
                  variant="outlined"
                  onClick={handlePasswordDialogOpen}
                  size="large"
                  fullWidth
                  sx={{
                    borderColor: '#307cbe',
                    color: '#307cbe',
                    py: 1.5,
                    px: 3,
                    '&:hover': {
                      borderColor: '#245a8a',
                      backgroundColor: 'rgba(48, 124, 190, 0.04)'
                    }
                  }}
                >
                  Cambiar contraseña
                </Button>
              </Box>
            </Box>

            {/* Sección derecha: Información del usuario y correo */}
            <Box sx={{ 
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              gap: 4,
              alignItems: 'flex-end',
              paddingLeft: 2,
              minHeight: '500px' // Altura mínima para igualar la sección izquierda
            }}>
              {/* Información del nombre */}
              <Box sx={{ 
                width: '100%',
                maxWidth: '350px'
              }}>
                <Typography variant="subtitle1" sx={{ 
                  color: '#307cbe', 
                  fontWeight: 600, 
                  mb: 2,
                  fontSize: '1.1rem'
                }}>
                  Nombre de usuario
                </Typography>
                <Typography variant="h6" sx={{ 
                  color: '#666', 
                  fontWeight: 500,
                  fontSize: '1.2rem'
                }}>
                  {form.name || 'Usuario'}
                </Typography>
              </Box>

              {/* Información del correo */}
              <Box sx={{ 
                width: '100%',
                maxWidth: '350px'
              }}>
                <Typography variant="subtitle1" sx={{ 
                  color: '#307cbe', 
                  fontWeight: 600, 
                  mb: 2,
                  fontSize: '1.1rem'
                }}>
                  Correo electrónico
                </Typography>
                
                <Box sx={{ 
                  backgroundColor: 'rgba(48, 124, 190, 0.04)',
                  borderRadius: 2,
                  border: '1px solid rgba(48, 124, 190, 0.1)',
                  p: 3,
                  mb: 3
                }}>
                  <Typography variant="h6" sx={{ 
                    color: '#666',
                    fontWeight: 500
                  }}>
                    {form.currentMail || 'No disponible'}
                  </Typography>
                </Box>
                
                <MailUpdateSection 
                  form={form}
                  handleChange={handleChange}
                  handleMailUpdate={handleMailUpdate}
                  loading={loading}
                />
              </Box>
            </Box>
          </Box>

          {/* Sección de botones de acción */}
          <Box
            sx={{
              mt: 2,
              pt: 4,
              borderTop: '1px solid rgba(48, 124, 190, 0.1)',
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              width: '100%',
              mx: 'auto',
            }}
          >
            <Button
              variant="outlined"
              color="secondary"
              onClick={() => setOpenLogoutDialog(true)}
              disabled={loading}
              size="large"
              sx={{ py: 1.5 }}
            >
              Cerrar sesión
            </Button>
            <Button
              variant="outlined"
              color="error"
              onClick={handleOpenDialog}
              disabled={loading}
              size="large"
              sx={{ py: 1.5 }}
            >
              Borrar usuario
            </Button>
            {success && <Alert severity="success">{success}</Alert>}
            {error && <Alert severity="error">{error}</Alert>}
          </Box>
        </Paper>
      </Box>

      {/* Diálogo de confirmación */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            minWidth: '450px'
          }
        }}
      >
        <DialogTitle sx={{ fontSize: '1.3rem', fontWeight: 600, color: '#e53935' }}>
          Confirmar borrado
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <DialogContentText sx={{ fontSize: '1rem' }}>
            ¿Seguro que quieres borrar tu usuario? Esta acción no se puede deshacer.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 2 }}>
          <Button onClick={handleCloseDialog} color="primary" size="large">
            Cancelar
          </Button>
          <Button onClick={handleDelete} color="error" variant="contained" disabled={loading} size="large">
            Confirmar borrado
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo de confirmación de logout */}
      <Dialog 
        open={openLogoutDialog} 
        onClose={() => setOpenLogoutDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            minWidth: '450px'
          }
        }}
      >
        <DialogTitle sx={{ fontSize: '1.3rem', fontWeight: 600 }}>
          ¿Cerrar sesión?
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <DialogContentText sx={{ fontSize: '1rem' }}>
            ¿Seguro que quieres cerrar sesión?
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 2 }}>
          <Button onClick={() => setOpenLogoutDialog(false)} color="primary" size="large">
            Cancelar
          </Button>
          <Button onClick={handleLogout} color="error" variant="contained" size="large">
            Cerrar sesión
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo para cambiar contraseña */}
      <Dialog 
        open={openPasswordDialog} 
        onClose={handlePasswordDialogClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            minWidth: '500px'
          }
        }}
      >
        <DialogTitle sx={{ fontSize: '1.3rem', fontWeight: 600 }}>
          Cambiar contraseña
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <DialogContentText sx={{ mb: 3 }}>
            Introduce tu contraseña actual y la nueva contraseña.
          </DialogContentText>
          <TextField
            fullWidth
            label="Contraseña actual"
            name="oldPass"
            type="password"
            value={passwordForm.oldPass}
            onChange={handlePasswordFormChange}
            sx={{ mb: 3 }}
          />
          <TextField
            fullWidth
            label="Nueva contraseña"
            name="newPass"
            type="password"
            value={passwordForm.newPass}
            onChange={handlePasswordFormChange}
          />
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 2 }}>
          <Button onClick={handlePasswordDialogClose} color="primary">
            Cancelar
          </Button>
          <Button 
            onClick={handlePasswordUpdate} 
            color="primary" 
            variant="contained" 
            disabled={loading || !passwordForm.oldPass || !passwordForm.newPass}
          >
            {loading ? 'Actualizando...' : 'Cambiar contraseña'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notificación tipo toast */}
      <Snackbar 
        open={toastOpen}
        autoHideDuration={3000}
        onClose={() => setToastOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setToastOpen(false)} 
          severity={toastSeverity}
          sx={{ 
            width: '100%',
            boxShadow: 3,
            borderRadius: 2 
          }}
        >
          {toastMessage}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default SettingsPage;