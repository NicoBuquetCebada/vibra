import React, { useEffect, useState, useContext } from 'react';
import { Container, Box, Avatar, Typography, Paper, Alert, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, List, ListItem, ListItemAvatar, ListItemText, CircularProgress } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import MusicPlayer from '../home/components/musicPlayer';
import BottomNav from '../components/bottom-navigation';
import { getOtherUserPage, getOtherUserPosts, getOtherUserFollowers, getOtherUserFollowed } from '../api';
import SongCard from '../home/components/songCard';
import PersonIcon from '@mui/icons-material/Person';
import { AuthContext } from '../context/auth-context';

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
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogTitle, setDialogTitle] = useState('');
  const [userList, setUserList] = useState<{ name: string; profile_img?: string }[]>([]);
  const [loadingList, setLoadingList] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const auth  = useContext(AuthContext);
  const user = auth?.user;

  useEffect(() => {
    const fetchUserData = async () => {
      if (!username) {
        setError('Usuario no especificado');
        setUserData(null);
        return;
      }
      try {
        const data = await getOtherUserPage(username);
        setUserData(data);
        setError(null);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (err) {
        setError('No se pudo cargar el usuario');
        setUserData(null);
      }
    };

    const fetchUserPosts = async () => {
      if (!username) {
        setPosts([]);
        return;
      }
      try {
        const data = await getOtherUserPosts(username);
        setPosts(data);
      } catch {
        setPosts([]);
      }
    };

    fetchUserData();
    fetchUserPosts();
  }, [username]);

  const handleOpenList = async (type: 'followers' | 'followed') => {
    setDialogTitle(type === 'followers' ? 'Seguidores' : 'Seguidos');
    setOpenDialog(true);
    setLoadingList(true);
    try {
      const data = type === 'followers'
        ? await getOtherUserFollowers(username!)
        : await getOtherUserFollowed(username!);
      setUserList(data);
    } catch {
      setUserList([]);
    }
    setLoadingList(false);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setUserList([]);
  };

  // Simulación de follow/unfollow (ajusta con tu API real)
  const handleFollowToggle = () => {
    setIsFollowing((prev) => !prev);
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
            position: 'relative',
          }}
        >
          {/* Avatar del usuario */}
          <Avatar
            src={userData?.profile_img || undefined}
            sx={{
              width: { xs: 56, md: 72 },
              height: { xs: 56, md: 72 },
              border: '2px solid #307cbe',
            }}>
            {!userData?.profile_img && <PersonIcon sx={{ fontSize: 40, color: '#307cbe' }} />}
          </Avatar>

          {/* Información del usuario */}
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
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
              {user && userData?.name && user.name !== userData.name && (
                <Button
                  variant={isFollowing ? 'outlined' : 'contained'}
                  color="primary"
                  size="small"
                  onClick={handleFollowToggle}
                  sx={{ ml: 1 }}
                >
                  {isFollowing ? 'Dejar de seguir' : 'Seguir'}
                </Button>
              )}
            </Box>

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
                sx={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
                onClick={() => handleOpenList('followed')}
              >
                <Typography variant="h5" sx={{ fontWeight: 600, color: '#307cbe' }}>
                  {userData?.followed || 0}
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Seguidos
                </Typography>
              </Box>

              {/* Followers */}
              <Box
                sx={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
                onClick={() => handleOpenList('followers')}
              >
                <Typography variant="h5" sx={{ fontWeight: 600, color: '#307cbe' }}>
                  {userData?.followers || 0}
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
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
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          {posts.length === 0 && !error ? (
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

      {/* Diálogo de Seguidores y Seguidos */}
      <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth maxWidth="xs">
        <DialogTitle>{dialogTitle}</DialogTitle>
        <DialogContent>
          {loadingList ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
              <CircularProgress />
            </Box>
          ) : userList.length === 0 ? (
            <DialogContentText>No hay usuarios.</DialogContentText>
          ) : (
            <List>
              {userList.map((item) => (
                <ListItem key={item.name}>
                  <ListItemAvatar>
                    <Avatar src={item.profile_img || undefined} />
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Button
                        variant="text"
                        sx={{
                          textTransform: 'none',
                          color: '#307cbe',
                          fontWeight: 600,
                          fontSize: 16,
                          p: 0,
                          minWidth: 0,
                        }}
                        onClick={() => {
                          if (user && item.name === user.name) {
                            navigate('/profile');
                          } else {
                            navigate(`/profile/${item.name}`);
                          }
                          handleCloseDialog();
                        }}
                      >
                        {item.name}
                      </Button>
                    }
                  />
                </ListItem>
              ))}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default OtherUserPage;