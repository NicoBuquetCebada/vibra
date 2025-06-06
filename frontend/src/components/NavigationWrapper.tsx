import { useState } from 'react';
import { Box, IconButton, Tooltip, Drawer, List, ListItem, ListItemIcon, ListItemText, Divider, useMediaQuery, SxProps, Theme } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import NotificationsIcon from '@mui/icons-material/Notifications';
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import Logo from '../assets/basic_logo.png';
import BottomNav from './bottom-navigation';
import { useNavigate } from 'react-router-dom';


interface NavigationWrapperProps {
  children: React.ReactNode;
  sx?: SxProps<Theme>;
  logoButtonSx?: SxProps<Theme>; // Añadido para el botón
}

const NavigationWrapper: React.FC<NavigationWrapperProps> = ({ children, logoButtonSx }) => {
  const isMobile = useMediaQuery('(max-width:900px)');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const navigate = useNavigate();

  const handleDrawerOpen = () => setDrawerOpen(true);
  const handleDrawerClose = () => setDrawerOpen(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    handleDrawerClose();
  };

  return (
    <>
      {/* Drawer lateral solo en desktop */}
      {!isMobile && (
        <>
          <Tooltip title="Menú" arrow placement="bottom">
            <IconButton
              onClick={handleDrawerOpen}
              sx={{
                position: 'fixed',
                top: 19,
                left: 16,
                zIndex: 2000,
                boxShadow: '0 2px 8px rgba(48,124,190,0.18)',
                background: 'rgba(255,255,255,0.8)',
                padding: '6px',
                '&:hover': { background: 'rgba(255,255,255,0.9)' },
                ...logoButtonSx,
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

          <Drawer
            anchor="left"
            open={drawerOpen}
            onClose={handleDrawerClose}
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
                  sx={{ width: 40, height: 40, objectFit: 'cover' }}
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
            </List>
            <Box sx={{ flexGrow: 1 }} />
            <List sx={{paddingBottom: 0}}>
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
        </>
      )}

      {/* Barra de navegación solo en móvil */}
      {isMobile && <BottomNav handleNavigation={handleNavigation} />}

      {/* Contenido de la página */}
      {children}
    </>
  );
};

export default NavigationWrapper;