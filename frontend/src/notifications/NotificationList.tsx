import React, { useEffect, useState } from 'react';
import { Container, List, ListItem, ListItemAvatar, Avatar, ListItemText, Typography, CircularProgress, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { getNotifications } from '../api';
import MusicPlayer from '../home/components/musicPlayer';
import NavigationWrapper from '../components/NavigationWrapper';

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
    <NavigationWrapper logoButtonSx={{marginTop: '18px'}}>
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
        {/* Lista de notificaciones */}
        <Box
          sx={{
            flex: 1,
            maxWidth: { xs: '100vw', md: 'calc(70vw - 48px)' }, // Ocupa hasta el reproductor lateral
            paddingX: { xs: 0.5, md: 0 },
            minHeight: 'max-content',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            paddingBottom: { xs: '110px', md: 0 },
            ml: { xs: 0, md: 0 }, // Deja espacio para el botón menú lateral
          }}
        >
          <Box
            sx={{
              mb: 3,
              p: 2,
              backgroundColor: 'white',
              boxShadow: 2,
              textAlign: 'center',
              width: '85%',
              maxWidth: '1000px',
              ml: 0,
              
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
            <List sx={{ width: '85%', display: 'flex', flexDirection: 'column', alignItems: 'center', p: 0, marginLeft:0 }}>
              {notifications
                .filter((notif) => notif.actionUserName)
                .map((notif) => (
                  <Box
                    key={notif.contentId}
                    sx={{
                      mb: 1.2,
                      backgroundColor: 'white',
                      boxShadow: 1,
                      p: 1.2,
                      transition: 'box-shadow 0.2s, background-color 0.2s',
                      '&:hover': { boxShadow: 4, backgroundColor: '#f4f6fa' },
                      width: '100%',
                      maxWidth: '1000px',
                      ml: 0,
                      display: 'flex',
                      justifyContent: 'center',
                    }}
                  >
                    <ListItem
                      alignItems="flex-start"
                      sx={{
                        cursor: 'pointer',
                        p: 0.5,
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                      }}
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

        {/* Reproductor lateral solo escritorio */}
        <Box
          sx={{
            display: { xs: 'none', md: 'flex' },
            alignItems: 'flex-start',
            justifyContent: 'center',
            width: { md: '30%' },
            position: 'fixed',
            top: 0,
            right: 0,
            height: 'calc(100vh - 24px)',
            backgroundColor: '#f5f5f5',
            margin: { md: '12px 18px 0px 12px' },
            padding: 0,
            boxShadow: '-8px 8px 12px rgba(0, 0, 0, 0.15)',
            overflow: 'hidden',
            zIndex: 1200,
          }}
        >
          <MusicPlayer />
        </Box>

        {/* Reproductor flotante solo en móvil */}
        <Box
          sx={{
            display: { xs: 'flex', md: 'none' },
            position: 'fixed',
            left: 0,
            bottom: 0,
            width: '100vw',
            backgroundColor: '#f5f5f5',
            boxShadow: '0 -4px 12px rgba(0,0,0,0.12)',
            zIndex: 2000,
            pb: 1,
          }}
        >
          <MusicPlayer />
        </Box>
      </Container>
    </NavigationWrapper>
  );
};

export default NotificationList;