/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useEffect, useContext } from 'react';
import { Container, Box, Typography, CircularProgress, useMediaQuery, IconButton, Tooltip, Drawer, List, ListItem, ListItemIcon, ListItemText, Divider } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import SongCard from '../home/components/songCard';
import MusicPlayer from '../home/components/musicPlayer';
import SearchBar from '../components/SearchBar';
import HomeIcon from '@mui/icons-material/Home';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import NotificationsIcon from '@mui/icons-material/Notifications';
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import Logo from '../assets/basic_logo.png';
import { getHome, fetchWithAuth } from '../api'; // ✅ AGREGAR fetchWithAuth
import { AuthContext } from '../context/auth-context';
import { postToSongCard, PostApi } from '../home/home';

const PostPage: React.FC = () => {
  const { postId } = useParams<{ postId: string }>();
  const [post, setPost] = useState<PostApi | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null); // ✅ AGREGAR estado de error
  const [drawerOpen, setDrawerOpen] = useState(false);
  //const [loadingStage/* , setLoadingStage */] = useState<'initial' | 'searching' | 'loading-all' | 'complete'>('initial');
  //const [currentPage/* , setCurrentPage */] = useState(0);
  //const [totalPagesLoaded/* , setTotalPagesLoaded */] = useState(0);
  const isMobile = useMediaQuery('(max-width:900px)');
  const navigate = useNavigate();
  const authContext = useContext(AuthContext);

  // ✅ NUEVA FUNCIÓN: Cargar todas las páginas disponibles
  const loadAllPosts = async (): Promise<PostApi[]> => {
    console.log('🔄 PostPage: Cargando todas las páginas...');
    
    const allPosts: PostApi[] = [];
    let currentPageNum = 0;
    let hasMorePages = true;
    
    try {
      while (hasMorePages) {
        console.log(`📄 PostPage: Cargando página ${currentPageNum}...`);
        
        const response = await fetchWithAuth(`/api/home?page=${currentPageNum}`);
        if (!response.ok) break;
        
        const pageData: PostApi[] = await response.json();
        console.log(`📄 PostPage: Página ${currentPageNum}: ${pageData.length} posts`);
        
        if (pageData.length === 0) {
          hasMorePages = false;
        } else {
          const newPosts = pageData.filter(newPost =>
            !allPosts.some(existingPost => existingPost.createdAt === newPost.createdAt)
          );
          allPosts.push(...newPosts);
          currentPageNum++;
        }
        
        if (currentPageNum > 50) {
          console.warn('⚠️ PostPage: Limite de páginas alcanzado (50)');
          break;
        }
      }
      
      console.log(`✅ PostPage: Carga completa: ${allPosts.length} posts totales`);
      return allPosts;
    } catch (error) {
      console.error('❌ PostPage: Error cargando todas las páginas:', error);
      return allPosts;
    }
  };

  // ✅ SIMPLIFICAR: useEffect sin los estados de loading stage
  useEffect(() => {
    const fetchPost = async () => {
      if (!postId) {
        setError('ID de post no válido');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      
      try {
        console.log('🔍 PostPage: Buscando post ID:', postId);
        
        // ✅ ESTRATEGIA 1: Intentar con la primera página (rápido)
        console.log('⚡ PostPage: Intentando búsqueda rápida...');
        const firstPagePosts = await getHome();
        console.log('📋 PostPage: Posts de primera página:', firstPagePosts.length);
        
        let filteredPost = firstPagePosts.find((p: PostApi) => p.postId === Number(postId));
        console.log('🎯 PostPage: Post encontrado en primera página:', !!filteredPost);
        
        // ✅ ESTRATEGIA 2: Si no se encuentra, cargar todas las páginas
        if (!filteredPost) {
          console.log('🔍 PostPage: No encontrado en primera página, cargando todas...');
          const allPosts = await loadAllPosts();
          console.log('📚 PostPage: Posts totales cargados:', allPosts.length);
          
          filteredPost = allPosts.find((p: PostApi) => p.postId === Number(postId));
          console.log('🎯 PostPage: Post encontrado en todas las páginas:', !!filteredPost);
        }
        
        if (filteredPost) {
          console.log('✅ PostPage: Post cargado exitosamente:', filteredPost.postId);
          setPost(filteredPost);
        } else {
          console.log('❌ PostPage: Post no encontrado en ninguna página');
          setError('Publicación no encontrada');
        }
      } catch (e) {
        console.error('❌ PostPage: Error general:', e);
        setError(e instanceof Error ? e.message : 'Error desconocido');
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
        overflow: 'hidden', // ✅ Deshabilitar scroll
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

      {/* Barra de búsqueda fija */}
      <SearchBar 
        isFixed={true}
        top={16}
        width={isMobile ? '94%' : '60%'}
        left={isMobile ? '3%' : '7%'}
        zIndex={1999}
      />

      {/* Publicación centrada */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          paddingTop: { xs: '80px', md: '60px' }, // ✅ Reducido: era 100px/80px, ahora 80px/60px
          paddingLeft: { xs: '0', md: '0' },
          paddingRight: { xs: '0', md: '30%' }, // Espacio para el reproductor (vuelve al 30%)
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
        ) : error ? (
          // ✅ MEJORAR: Mejor manejo de errores
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h6" color="error" sx={{ mb: 2 }}>
              ❌ {error}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              {error.includes('no encontrada') 
                ? 'La publicación que buscas no existe, ha sido eliminada, o no tienes permisos para verla.' 
                : 'Hubo un problema al cargar la publicación. Inténtalo de nuevo.'}
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
              <button 
                onClick={() => navigate('/home')}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#307cbe',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontFamily: 'inherit'
                }}
              >
                🏠 Volver al inicio
              </button>
              <button 
                onClick={() => window.location.reload()}
                style={{
                  padding: '12px 24px',
                  backgroundColor: 'transparent',
                  color: '#307cbe',
                  border: '2px solid #307cbe',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontFamily: 'inherit'
                }}
              >
                🔄 Reintentar
              </button>
            </Box>
          </Box>
        ) : post ? (
          <SongCard
            song={{
              ...postToSongCard(post, 0),
              username: post.user.name || 'Sistema',
            }}
            isRepost={false}
            mediumSize={true} // ✅ Usar tamaño medio (menos grande)
          />
        ) : (
          <Typography variant="body1" color="error" sx={{ mt: 4 }}>
            No se encontró la publicación.
          </Typography>
        )}
      </Box>

      {/* Reproductor fijo a la derecha (tamaño original) */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'center',
          width: '30%',
          position: 'fixed',
          top: 0,
          right: 0,
          height: 'calc(100vh - 24px)',
          backgroundColor: '#f5f5f5',
          margin: '12px 18px 0 12px',
          padding: 0,
          boxShadow: '-8px 8px 12px rgba(0, 0, 0, 0.15)',
          overflow: 'hidden',
          zIndex: 1000, // ✅ Z-index menor que la barra de búsqueda
        }}
      >
        <MusicPlayer />
      </Box>
    </Container>
  );
};

export default PostPage;