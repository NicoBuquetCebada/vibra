import React, { useEffect, useState } from 'react';
import { Container, List, ListItem, ListItemAvatar, Avatar, ListItemText, Typography, CircularProgress, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { getNotifications } from '../api'; // Importa la función real
import BottomNav from '../components/bottom-navigation';
import MusicPlayer from '../home/components/musicPlayer';

interface NotificationApi {
  actionUserName: string;
  contentId: number;
  contentUserName: string;
  createdAt: string;
  profileImg: string;
  type: 'post' | 'repost' | 'rate' | 'follow';
  rateValue?: number;
}

const NotificationList: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationApi[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchNotifications = async () => {
      setLoading(true);
      try {
        const data = await getNotifications();
        console.log('Notificaciones recibidas:', data); // <-- Aquí imprimes la respuesta

        setNotifications(data);
      } catch {
        setNotifications([]);
      }
      setLoading(false);
    };
    fetchNotifications();
  }, []);

  // Función para renderizar el mensaje según el tipo
  const renderNotificationText = (notif: NotificationApi) => {
    if (notif.type === 'post') {
      return (
        <span>
          <b>{notif.actionUserName}</b> ha publicado algo nuevo
        </span>
      );
    }
    if (notif.type === 'repost') {
      return (
        <span>
          <b>{notif.actionUserName}</b> ha hecho repost de una publicación de <b>{notif.contentUserName}</b>
        </span>
      );
    }
    if (notif.type === 'rate') {
      return (
        <span>
          <b>{notif.actionUserName}</b> ha valorado una publicación de <b>{notif.contentUserName}</b> con <b>{notif.rateValue} ⭐</b>
        </span>
      );
    }
    if (notif.type === 'follow') {
      return (
        <span>
          <b>{notif.actionUserName}</b> ha comenzado a seguirte
        </span>
      );
    }
    
    return null;
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
        backgroundColor: 'transparent', // Fondo transparente para ver partículas
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
            {notifications
              .filter((notif) => notif.actionUserName)
              .map((notif) => (
                <Box
                  key={notif.contentId}
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
                    onClick={() => navigate(`/profile/${notif.actionUserName}`)}
                    disableGutters
                  >
                    <ListItemAvatar>
                      <Avatar src={notif.profileImg || undefined}>
                        {!notif.profileImg && notif.actionUserName[0]?.toUpperCase()}
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