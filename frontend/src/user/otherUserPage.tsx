import React, { useEffect, useState } from 'react';
import { Container, Box, Avatar, Typography, Paper } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import MusicPlayer from '../home/components/musicPlayer';
import BottomNav from '../components/bottom-navigation';
import { fetchWithAuth } from '../api';
import SongCard from '../home/components/songCard';

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

const OtherUserPage: React.FC = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [posts, setPosts] = useState<UserPagePost[]>([]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetchWithAuth(`/api/users/${username}`);
        if (!response.ok) throw new Error('Error al obtener datos del usuario');
        const data = await response.json();
        setUserData(data);
      } catch (error) {
        console.error('Error:', error);
      }
    };

    const fetchUserPosts = async () => {
      try {
        const response = await fetchWithAuth(`/api/users/posts`);
        if (!response.ok) throw new Error('Error al obtener posts');
        const data = await response.json();
        setPosts(data);
      } catch (error) {
        console.error('Error:', error);
      }
    };

    if (username) {
      fetchUserData();
      fetchUserPosts();
    }
  }, [username]);

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
        }}
      >
        {/* Perfil del usuario */}
        <Paper
          elevation={3}
          sx={{
            padding: '24px',
            borderRadius: '16px',
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            display: 'flex',
            alignItems: 'center',
            gap: '24px',
          }}
        >
          {/* Avatar del usuario */}
          <Avatar
            src={userData?.profile_img}
            sx={{
              width: { xs: 100, md: 120 },
              height: { xs: 100, md: 120 },
              border: '4px solid #307cbe',
            }}
          />

          {/* Información del usuario */}
          <Box sx={{ flex: 1 }}>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 600,
                color: '#307cbe',
                marginBottom: '16px',
              }}
            >
              {userData?.name || 'Cargando...'}
            </Typography>

            {/* Contadores */}
            <Box
              sx={{
                display: 'flex',
                gap: '32px',
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
        </Paper>

        {/* Publicaciones */}


        <Box sx={{ mt: 4 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
            Publicaciones
        </Typography>
        {posts.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
            No hay publicaciones.
            </Typography>
        ) : (
            posts.map((post) => (
            <Box key={post.id} sx={{ my: 2, display: 'flex', justifyContent: 'center' }}>
                <SongCard song={{
                id: post.id,
                title: post.name,
                audioSrc: '', // Añade aquí la URL si la tienes en el post
                profilePic: userData?.profile_img || '',
                username: post.userName,
                coverImg: post.coverImg,
                postId: post.id
                }} />
            </Box>
            ))
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

      <BottomNav handleNavigation={navigate} />
    </Container>
  );
};

export default OtherUserPage;