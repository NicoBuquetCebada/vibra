import { useState, useEffect, useContext } from 'react';
import { Container, Box, Typography, CircularProgress, useMediaQuery, IconButton, Tooltip, Drawer, List, ListItem, ListItemIcon, ListItemText, Divider } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import SongCard from '../home/components/songCard';
import MusicPlayer from '../home/components/musicPlayer';
import HomeIcon from '@mui/icons-material/Home';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import NotificationsIcon from '@mui/icons-material/Notifications';
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import Logo from '../assets/basic_logo.png';
import { fetchWithAuth } from '../api';
import { AuthContext } from '../context/auth-context';
import { postToSongCard, PostApi } from '../home/home';

const PostPage: React.FC = () => {
  const { postId } = useParams<{ postId: string }>();
  const [post, setPost] = useState<PostApi | null>(null);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const isMobile = useMediaQuery('(max-width:900px)');
  const navigate = useNavigate();
  const authContext = useContext(AuthContext);

  useEffect(() => {
    const fetchPost = async () => {
      setLoading(true);
      try {
        const res = await fetchWithAuth(`/api/posts/${postId}`);
        if (!res.ok) throw new Error('No se pudo cargar la publicación');
        const data: PostApi = await res.json();
        setPost(data);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (e) {
        setPost(null);
      } finally {
        setLoading(false);
      }
    };
    if (authContext?.token && postId) {
      fetchPost();
    }
  }, [authContext?.token, postId]);

  const handleNavigation = (path: string) => {
    navigate(path);
    setDrawerOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  return (
    <Container
      sx={{
        display: 'flex',
        flexDirection: 'row',
        minWidth: '100vw',
        height: '100vh',
        overflowY: 'auto',
        paddingTop: { xs: '32px', md: '32px' },
        paddingBottom: '70px',
        backgroundColor: 'transparent',
        position: 'relative',
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
          <List>
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

      {/* Publicación */}
      <Box
        sx={{
          flex: 1,
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: { xs: 4, md: 6 },
          maxWidth: '65%',
          paddingTop: { xs: '20px', md: '20px' },
          justifyItems: 'center',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {loading ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', py: 2 }}>
            <CircularProgress sx={{ color: '#307cbe' }} />
            <Typography variant="caption" sx={{ marginTop: 1, color: 'gray' }}>
              Cargando publicación...
            </Typography>
          </Box>
        ) : post ? (
          <SongCard
            song={postToSongCard(post, 0)}
            isRepost={post.type === 'repost'}
            repostUser={post.type === 'repost' ? post.repostUser : undefined}
          />
        ) : (
          <Typography variant="body1" color="error" sx={{ mt: 4 }}>
            No se encontró la publicación.
          </Typography>
        )}
      </Box>

      {/* Reproductor fijo a la derecha */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'center',
          width: '30%',
          position: 'fixed',
          top: 0,
          right: 0,
          height: 'calc(100vh - 12px)',
          backgroundColor: '#f5f5f5',
          margin: '0 0 12px 12px',
          padding: 0,
          boxShadow: '-8px 8px 12px rgba(0, 0, 0, 0.15)',
          overflow: 'hidden',
          borderRadius: '0 0 0 12px',
        }}
      >
        <MusicPlayer />
      </Box>
    </Container>
  );
};

export default PostPage;