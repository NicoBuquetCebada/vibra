import React, { useEffect, useState } from 'react';
import { Container, List, ListItem, ListItemAvatar, Avatar, ListItemText, Typography, CircularProgress, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
// import { fetchWithAuth } from '../api';
import BottomNav from '../components/bottom-navigation';
import MusicPlayer from '../home/components/musicPlayer';

interface NotificationPost {
  id: number;
  createdAt: string;
  user: {
    name: string;
    profile_img?: string;
  };
  type: 'post' | 'repost' | 'rate';
  content: string;
  originalUser?: { name: string; profile_img?: string }; // solo para repost y rate
  rateValue?: number; // solo para rate
}

// Array estático de usuarios seguidos (simula lo que devolvería la API)
const staticNotifications: NotificationPost[] = [
  {
    id: 1,
    createdAt: new Date().toISOString(),
    user: { name: 'jorge', profile_img: '' },
    type: 'post',
    content: '¡Nuevo álbum disponible!',
  },
  {
    id: 2,
    createdAt: new Date(Date.now() - 3600 * 1000).toISOString(),
    user: { name: 'maria', profile_img: '' },
    type: 'post',
    content: 'He subido una nueva canción',
  },
  {
    id: 3,
    createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    user: { name: 'david', profile_img: '' },
    type: 'post',
    content: '¡Escucha mi último single!',
  },
  // Ejemplo de repost
  {
    id: 4,
    createdAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
    user: { name: 'lucia', profile_img: '' },
    type: 'repost',
    content: 'Ha hecho repost de una publicación',
    originalUser: { name: 'jorge', profile_img: '' },
  },
  // Ejemplo de rate
  {
    id: 5,
    createdAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
    user: { name: 'ana', profile_img: '' },
    type: 'rate',
    content: 'Ha valorado una publicación',
    originalUser: { name: 'maria', profile_img: '' },
    rateValue: 5,
  },
  // Más ejemplos
  {
    id: 6,
    createdAt: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
    user: { name: 'carlos', profile_img: '' },
    type: 'repost',
    content: 'Ha hecho repost de una publicación',
    originalUser: { name: 'david', profile_img: '' },
  },
  {
    id: 7,
    createdAt: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
    user: { name: 'sofia', profile_img: '' },
    type: 'rate',
    content: 'Ha valorado una publicación',
    originalUser: { name: 'lucia', profile_img: '' },
    rateValue: 4,
  },
  {
    id: 8,
    createdAt: new Date(Date.now() - 7 * 3600 * 1000).toISOString(),
    user: { name: 'alberto', profile_img: '' },
    type: 'post',
    content: '¡Nuevo single en camino!',
  },
];

const NotificationList: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [followedUsers, setFollowedUsers] = useState<string[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      // Filtra las notificaciones solo de usuarios seguidos
      const filtered = staticNotifications.filter(
        notif => followedUsers.includes(notif.user.name)
      );
      setNotifications(filtered);
      setLoading(false);
    }, 700);
  }, [followedUsers]);

  useEffect(() => {
    // Simulación de fetch
    const fetchFollowed = async () => {
      // const res = await fetchWithAuth('/api/users/followed');
      // const data = await res.json();
      // setFollowedUsers(data.map(u => u.name));
      setFollowedUsers(['jorge', 'lucia', 'sofia']); // temporal
    };
    fetchFollowed();
  }, []);

  // Función para renderizar el mensaje según el tipo
  const renderNotificationText = (notif: NotificationPost) => {
    if (notif.type === 'post') {
      return (
        <span>
          <b>{notif.user.name}</b> ha publicado algo nuevo
        </span>
      );
    }
    if (notif.type === 'repost') {
      return (
        <span>
          <b>{notif.user.name}</b> ha hecho repost de una publicación de <b>{notif.originalUser?.name}</b>
        </span>
      );
    }
    if (notif.type === 'rate') {
      return (
        <span>
          <b>{notif.user.name}</b> ha valorado una publicación de <b>{notif.originalUser?.name}</b> con <b>{notif.rateValue} ⭐</b>
        </span>
      );
    }
    return null;
  };

  return (
    <Container
      className="scrollable-container"
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
      {/* Lista de notificaciones */}
      <Box
        sx={{
          flex: 1,
          maxWidth: '65%',
          paddingX: { xs: '16px', md: '32px' },
          minHeight: 'max-content',
        }}
      >
        <Box
          sx={{
            mb: 3,
            p: 2,
            backgroundColor: 'white',
            borderRadius: 2,
            boxShadow: 2,
            textAlign: 'center',
          }}
        >
          <Typography variant="h5">
            Notificaciones
          </Typography>
        </Box>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <CircularProgress />
          </Box>
        ) : notifications.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mt: 4 }}>
            No hay notificaciones nuevas.
          </Typography>
        ) : (
          <List>
            {notifications.map((notif) => (
              <Box
                key={notif.id}
                sx={{
                  mb: 2,
                  backgroundColor: 'white',
                  borderRadius: 2,
                  boxShadow: 1,
                  p: 2,
                  transition: 'box-shadow 0.2s',
                  '&:hover': { boxShadow: 4, backgroundColor: '#f0f6ff' },
                }}
              >
                <ListItem alignItems="flex-start" sx={{ cursor: 'pointer', p: 0 }}
                  onClick={() => navigate(`/profile/${notif.user.name}`)}
                  disableGutters
                >
                  <ListItemAvatar>
                    <Avatar src={notif.user.profile_img || undefined}>
                      {!notif.user.profile_img && notif.user.name[0]?.toUpperCase()}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={renderNotificationText(notif)}
                    secondary={
                      <Typography variant="body2" color="text.secondary">
                        {new Date(notif.createdAt).toLocaleString()}
                      </Typography>
                    }
                  />
                </ListItem>
              </Box>
            ))}
          </List>
        )}
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
          boxShadow: '-8px 8px 12px rgba(0, 0, 0, 0.15)',
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

export default NotificationList;