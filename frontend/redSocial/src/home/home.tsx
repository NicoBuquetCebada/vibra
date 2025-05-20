import { useState, useEffect, useRef } from 'react';
import { Container, Box, BottomNavigation, BottomNavigationAction, Typography, CircularProgress } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import SearchIcon from '@mui/icons-material/Search';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import NotificationsIcon from '@mui/icons-material/Notifications';
import PersonIcon from '@mui/icons-material/Person';
import { useNavigate } from 'react-router-dom';
import { mockSongs } from '../mocks/mockSongs';
import SongCard from './components/songCard';
import MusicPlayer from './components/musicPlayer'; // ✅ Importamos `SongCard`

function MusicHome() {
  const [visibleSongs, setVisibleSongs] = useState(mockSongs.slice(0, 10));
  const [loading, setLoading] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
  const [currentSong, setCurrentSong] = useState<null | any>(null); // ✅ Estado para la canción activa
  const navigate = useNavigate();
  const observerRef = useRef(null);

  // Función para cargar más canciones

  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
  const handlePlaySong = (song: any) => {
    setCurrentSong(song); // ✅ Actualizar la canción que se está reproduciendo
  };

  const loadMoreSongs = () => {
    const nextSongs = mockSongs.slice(visibleSongs.length, visibleSongs.length + 10);
    setVisibleSongs((prev) => [...prev, ...nextSongs]);
    setLoading(false);
  };

  // Configurar `IntersectionObserver`
  useEffect(() => {
    if (!observerRef.current) return;
    
    const observer = new IntersectionObserver((entries) => {
      const entry = entries[0];
      if (entry.isIntersecting && !loading && visibleSongs.length < mockSongs.length) {
        console.log("🔄 Elemento de carga visible, activando más canciones...");
        setLoading(true);
      }
    });

    observer.observe(observerRef.current);
    return () => observer.disconnect();
  }, [loading, visibleSongs]);

  useEffect(() => {
    if (loading) {
      setTimeout(loadMoreSongs, 5000);
    }
  }, [loading]);

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  return (
    <Container
      sx={{
        display: 'flex',
        flexDirection: 'row',
        minWidth: '100vw',
        maxHeight: '100vh',
        overflowY: 'auto',
        paddingTop: { xs: '80px', md: '20px' }, // Espacio superior dinámico: 80px en móviles, 20px en pantallas grandes
        paddingBottom: '70px', // Espacio inferior para la barra de navegación
      }}
    >
      <Box
        sx={{
          flex: 1,
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: 2,
          maxWidth: '70%',
          paddingTop: { xs: '0px', md: '20px' }, // Sin padding adicional en móviles
          justifyItems: 'center',
        }}
      >
        {visibleSongs.map((song, index) => (
          <SongCard
            key={song.id}
            song={song}
            ref={index === visibleSongs.length - 1 ? observerRef : null}
          />
        ))}

        {loading && (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              py: 2,
              animation: 'fadeInScale 0.6s ease-in-out',
              '@keyframes fadeInScale': {
                '0%': { opacity: 0, transform: 'scale(0.8)' },
                '100%': { opacity: 1, transform: 'scale(1)' },
              },
            }}
          >
            <CircularProgress
              sx={{
                color: '307cbe',
                animation: 'spin 1.5s linear infinite',
                '@keyframes spin': {
                  '0%': { transform: 'rotate(0deg)' },
                  '100%': { transform: 'rotate(360deg)' },
                },
              }}
            />
            <Typography
              variant="caption"
              sx={{
                position: 'absolute',
                bottom: '-20px',
                color: 'gray',
                animation: 'fadeInText 0.8s ease-in-out',
                '@keyframes fadeInText': {
                  '0%': { opacity: 0 },
                  '100%': { opacity: 1 },
                },
              }}
            >
              Cargando más canciones...
            </Typography>
          </Box>
        )}
      </Box>

      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'center',
          width: '30%',
          position: 'sticky',
          paddingTop: '20px',
          top: 0,
          height: '100vh',
          overflowY: 'auto',
        }}
      >
        <MusicPlayer song={currentSong} />
      </Box>

      <BottomNavigation
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          width: '100%',
          zIndex: 1000,
          backgroundColor: '#145a96',
          boxShadow: '0 -4px 10px rgba(0, 0, 0, 0.3)',
          paddingTop: '8px',
          paddingBottom: '8px',
        }}
      >
        <BottomNavigationAction
          icon={<HomeIcon sx={{ color: '#fff' }} />}
          onClick={() => handleNavigation('/home')}
        />
        <BottomNavigationAction
          icon={<SearchIcon sx={{ color: '#fff' }} />}
          onClick={() => handleNavigation('/search')}
        />
        <BottomNavigationAction
          icon={<AddCircleIcon sx={{ fontSize: '2rem', color: '#fff' }} />}
          onClick={() => handleNavigation('/upload')}
        />
        <BottomNavigationAction
          icon={<NotificationsIcon sx={{ color: '#fff' }} />}
          onClick={() => handleNavigation('/notifications')}
        />
        <BottomNavigationAction
          icon={<PersonIcon sx={{ color: '#fff' }} />}
          onClick={() => handleNavigation('/profile')}
        />
      </BottomNavigation>
    </Container>
  );
}

export default MusicHome;
