import React, { useEffect, useState } from 'react';
import { Container, Box, Avatar, Typography, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import MusicPlayer from '../home/components/musicPlayer';
import BottomNav from '../components/bottom-navigation';
import { fetchWithAuth } from '../api';
import SongCard from '../home/components/songCard';
import Fab from '@mui/material/Fab';
import TuneIcon from '@mui/icons-material/Tune';
import PersonIcon from '@mui/icons-material/Person';
import Tooltip from '@mui/material/Tooltip';


interface UserData {
  name: string;
  profile_img: string;
  posts: number;
  followed: number;
  followers: number;
}

export interface UserPagePost {
  id: number;
  userName: string;
  createdAt: string;
  type: string;
  contentId: number;
  name: string;
  coverImg?: string;
}

export function userPagePostToSongCard(
  post: UserPagePost,
  userData: UserData,
  index: number
) {
  return {
    id: index,
    title: post.name,
    audioSrc:
      post.type === 'song'
        ? post.name // Cambia esto por la URL real si la tienes, aquí solo es el nombre
        : post.type === 'album'
        ? '' // No tienes info de canciones en el álbum, pon la URL si la tienes
        : '',
    profilePic: userData.profile_img,
    username: post.userName,
    coverImg: post.coverImg,
    postId: post.id,
  };
}

const UserPage: React.FC = () => {
  const navigate = useNavigate();

  const [userData, setUserData] = useState<UserData | null>(null);
  const [posts, setPosts] = useState<UserPagePost[]>([]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetchWithAuth('/api/users/page');
        if (!response.ok) throw new Error('Error al obtener datos del usuario');
        const data = await response.json();
        console.log('Datos de usuario:', data); // <-- Aquí ves la respuesta completa
        setUserData(data);
      } catch (error) {
        console.error('Error:', error);
      }
    };

    const fetchUserPosts = async () => {
      try {
        const response = await fetchWithAuth('/api/users/posts');
        if (!response.ok) throw new Error('Error al obtener posts');
        const data = await response.json();
        console.log('Posts del usuario:', data); // <-- Aquí ves la respuesta completa
        setPosts(data);
      } catch (error) {
        console.error('Error:', error);
      }
    };

    fetchUserData();
    fetchUserPosts();
  }, []);

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
        backgroundColor: '#e8e8e8',
        position: 'relative',
      }}
    >
      {/* Contenido principal */}
      <Box
        sx={{
          flex: 1,
          maxWidth: '65%',
          paddingX: { xs: '16px', md: '32px' },
          minHeight: 'max-content',
        }}
      >
        {/* Perfil del usuario */}
        <Paper
          elevation={3}
          sx={{
            padding: '12px 16px',
            borderRadius: '10px',
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            position: 'relative', // Para posicionar el botón dentro
          }}
        >
          {/* Avatar del usuario */}
          <Avatar
            src={userData?.profile_img || undefined}
            sx={{
              width: { xs: 56, md: 72 },
              height: { xs: 56, md: 72 },
              border: '2px solid #307cbe',
            }}
          >
            {!userData?.profile_img && <PersonIcon sx={{ fontSize: 40, color: '#307cbe' }} />}
          </Avatar>

          {/* Información del usuario */}
          <Box sx={{ flex: 1 }}>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 600,
                color: '#307cbe',
                mb: 1
              }}
            >
              {userData?.name || 'Cargando...'}
            </Typography>

            {/* Contadores */}
            <Box
              sx={{
                display: 'flex',
                gap: '18px',
              }}
            >
              {/* Posts */}
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}
              >
                <Typography
                  variant="h5"
                  sx={{ fontWeight: 600, color: '#307cbe' }}
                >
                  {userData?.posts || 0}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: 'text.secondary' }}
                >
                  Posts
                </Typography>
              </Box>

              {/* Followed */}
              <Box
                sx={{ cursor: 'pointer',display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center', }}
                onClick={() => navigate(`/profile/${userData?.name}/followed`)}
              >
                <Typography
                  variant="h5"
                  sx={{ fontWeight: 600, color: '#307cbe' }}
                >
                  {userData?.followed || 0}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: 'text.secondary' }}
                >
                  Seguidos
                </Typography>
              </Box>

              {/* Followers */}
              <Box
                sx={{ cursor: 'pointer',display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center', }}
                onClick={() => navigate(`/profile/${userData?.name}/followers`)}
              >
                <Typography
                  variant="h5"
                  sx={{ fontWeight: 600, color: '#307cbe' }}
                >
                  {userData?.followers || 0}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: 'text.secondary' }}
                >
                  Seguidores
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Botón de configuración arriba a la derecha */}
          <Tooltip title="Ajustes de perfil" arrow placement="bottom">
            <Fab
              color="primary"
              aria-label="configuración"
              size="small"
              sx={{
                position: 'absolute',
                top: 12,
                right: 12,
                zIndex: 2,
                boxShadow: 2,
              }}
              onClick={() => navigate('/settings')}
            >
              <TuneIcon />
            </Fab>
          </Tooltip>
        </Paper>

        {/* Publicaciones */}
        <Box sx={{ mt: 4 }}>
          {(!userData || posts.length === 0) ? (
            <Typography variant="body2" color="text.secondary">
              {!userData ? 'Cargando usuario...' : 'No hay publicaciones.'}
            </Typography>
          ) : (
            posts.map((post, idx) => {
              const songCardData = userPagePostToSongCard(post, userData, idx);

              // Función para navegar al perfil correcto
              const handleUserClick = (username: string) => {
                if (username === userData?.name) {
                  navigate('/profile');
                } else {
                  navigate(`/profile/${username}`);
                }
              };

              return (
                <Box key={post.id} sx={{ my: 2, display: 'flex', justifyContent: 'center' }}>
                  <SongCard
                    song={songCardData}
                    // Si SongCard tiene avatar/nombre clicable, pásale la función:
                    onUserClick={() => handleUserClick(songCardData.username)}
                  />
                </Box>
              );
            })
          )}
        </Box>
      </Box>

      {/* Reproductor lateral */}
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
          boxShadow: '-8px 8px 12px rgba(0,0,0,0.15)',
          overflow: 'hidden',
          borderRadius: '0 0 0 12px',
        }}
      >
        <MusicPlayer />
      </Box>

      <BottomNav handleNavigation={navigate}  />

      
    </Container>
  );
};

export default UserPage;