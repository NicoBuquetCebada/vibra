import React, { useEffect, useState, useContext } from 'react';
import { Container, Box, Avatar, Typography, Paper, Alert, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, List, ListItem, ListItemAvatar, ListItemText, CircularProgress, Tabs, Tab, Tooltip, IconButton, Drawer, ListItemIcon, Divider, useMediaQuery } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import MusicPlayer from '../home/components/musicPlayer';
import { getOtherUserPage, getOtherUserPosts, getOtherUserFollowers, getOtherUserFollowed, followUser, unfollowUser, fetchWithAuth, getFollowed, getOtherUserReposts } from '../api';
import SongCard from '../home/components/songCard';
import PersonIcon from '@mui/icons-material/Person';
import HomeIcon from '@mui/icons-material/Home';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import NotificationsIcon from '@mui/icons-material/Notifications';
import LogoutIcon from '@mui/icons-material/Logout';
import Logo from '../assets/basic_logo.png';
import { AuthContext } from '../context/auth-context';
import { usePlayer } from '../context/player-context';

interface UserData {
  name: string;
  profile_img: string;
  posts: number;
  followed: number;
  followers: number;
}

interface SongObj {
  name: string;
  audio: string;
}

interface AlbumObj {
  name: string;
  songs: SongObj[];
}

export interface UserPagePost {
  id: number;
  userName: string;
  createdAt: string;
  type: string;
  contentId: number;
  name: string;
  coverImg?: string;
  song?: SongObj;
  album?: AlbumObj;
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
  const [tab, setTab] = useState(0);
  const [reposts, setReposts] = useState<UserPagePost[]>([]);
  const [loadingReposts, setLoadingReposts] = useState(true);
  const auth  = useContext(AuthContext);
  const user = auth?.user;

  const isMobile = useMediaQuery('(max-width:900px)');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { playlist, setPlaylist, playlistIndex, setPlaylistIndex } = usePlayer();
  const [activePostIndex, setActivePostIndex] = useState<number | null>(null);

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
        const postsWithAudio = await Promise.all(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          data.map(async (post: any) => {
            if (post.type === 'song') {
              const songRes = await fetchWithAuth(`/api/songs/${post.contentId}`);
              const songData = await songRes.json();
              return { ...post, song: { name: post.name, audio: songData.audio } };
            } else if (post.type === 'album') {
              const albumRes = await fetchWithAuth(`/api/songs/albums/${post.contentId}`);
              const albumSongs = await albumRes.json();
              return { ...post, album: { name: post.name, songs: albumSongs } };
            }
            return post;
          })
        );
        setPosts(postsWithAudio);
      } catch {
        setPosts([]);
      }
    };

    const fetchReposts = async () => {
      setLoadingReposts(true);
      try {
        if (username) {
          const data = await getOtherUserReposts(username);
          const repostsWithAudio = await Promise.all(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            data.map(async (post: any) => {
              if (post.type === 'song') {
                const songRes = await fetchWithAuth(`/api/songs/${post.contentId}`);
                const songData = await songRes.json();
                return { ...post, song: { name: post.name, audio: songData.audio } };
              } else if (post.type === 'album') {
                const albumRes = await fetchWithAuth(`/api/songs/albums/${post.contentId}`);
                const albumSongs = await albumRes.json();
                return { ...post, album: { name: post.name, songs: albumSongs } };
              }
              return post;
            })
          );
          setReposts(repostsWithAudio);
        } else {
          setReposts([]);
        }
      } catch {
        setReposts([]);
      }
      setLoadingReposts(false);
    };
    fetchUserData();
    fetchUserPosts();
    fetchReposts();
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

  useEffect(() => {
    const checkFollowing = async () => {
      if (!username || !user) return;
      try {
        const followed = await getFollowed();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const isUserFollowed = followed.some((u: any) => u.name === username);
        setIsFollowing(isUserFollowed);
      } catch {
        setIsFollowing(false);
      }
    };
    checkFollowing();
  }, [username, user]);

  const handleFollowToggle = async () => {
    if (!username) return;
    try {
      if (isFollowing) {
        await unfollowUser(username);
        setIsFollowing(false);
      } else {
        await followUser(username);
        setIsFollowing(true);
      }
    } catch (error) {
      console.error('Error en follow/unfollow:', error);
    }
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    setDrawerOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  const renderTabContent = () => {
    if (tab === 0) {
      return posts.length === 0 && !error ? (
        <Typography variant="body2" color="text.secondary">
          No hay publicaciones.
        </Typography>
      ) : (
        posts.map((post, idx) => {
          // Usar la función de transformación correcta
          const songCardData = otherUserPagePostToSongCard(post, userData!, idx);
          return (
            <Box key={post.id} sx={{ my: 2, display: 'flex', justifyContent: 'center' }}>
              <SongCard 
                song={songCardData} 
                onPlay={() => playPublication(idx)} 
              />
            </Box>
          );
        })
      );
    }
    if (tab === 1) {
      if (loadingReposts) return <Box sx={{ textAlign: 'center', mt: 4 }}><CircularProgress /></Box>;
      return reposts.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          No hay reposts.
        </Typography>
      ) : (
        reposts.map((post, idx) => {
          // Usar la función de transformación correcta
          const songCardData = otherUserPagePostToSongCard(post, userData!, idx);
          return (
            <Box key={post.id} sx={{ my: 2, display: 'flex', justifyContent: 'center' }}>
              <SongCard 
                song={songCardData} 
                onPlay={() => playPublication(idx)} 
              />
            </Box>
          );
        })
      );
    }
    return null;
  };

  const playPublication = (postIdx: number) => {
    const post = posts[postIdx];
    if (!post) return;

    // Usar la función correcta que definiste al final del archivo
    const songCardData = otherUserPagePostToSongCard(post, userData!, postIdx);

    if (songCardData.type === 'album' && Array.isArray(songCardData.albumSongs)) {
      // Si es un álbum, configura el playlist con todas las canciones del álbum
      setPlaylist(songCardData.albumSongs);
      console.log('Cargando álbum en el reproductor:', songCardData.albumSongs);
    } else {
      // Si es una canción, configura el playlist con una sola canción
      setPlaylist([songCardData]);
      console.log('Cargando canción en el reproductor:', songCardData);
    }

    setPlaylistIndex(0);
    setActivePostIndex(postIdx);
  };

  const handleNextPublication = () => {
    if (playlistIndex < playlist.length - 1) {
      setPlaylistIndex(playlistIndex + 1);
    } else if (activePostIndex !== null) {
      playPublication(activePostIndex + 1);
    }
  };

  const handlePrevPublication = () => {
    if (playlistIndex > 0) {
      setPlaylistIndex(playlistIndex - 1);

      // Log para verificar el botón "Anterior"
      console.log('Anterior canción/publicación:', playlist[playlistIndex - 1]);
    } else if (activePostIndex !== null && activePostIndex > 0) {
      playPublication(activePostIndex - 1);
    }
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
              marginTop: '18px',
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
            <Divider />
          </List>
          <Box sx={{ flexGrow: 1 }} />
          <List sx={{paddingBottom: '0px'}}>
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
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            position: 'relative',
            maxWidth: { xs: '100%', sm: '1000px' }, // Limita el ancho en desktop
            ml: { xs: 0, sm: 8 },                  // Añade margen izquierdo en desktop
            mt: { xs: 2, sm: 0 },                  // Un poco de margen arriba en móvil
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
          <Tabs value={tab} onChange={(_, v) => setTab(v)} centered>
            <Tab label="Posts" />
            <Tab label="Reposts" />
          </Tabs>
          <Box sx={{ mt: 2 }}>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            {renderTabContent()}
          </Box>
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
          height: 'calc(100vh - 24px)',
          backgroundColor: '#f5f5f5',
          margin: '12px 18px 0 12px',
          padding: 0,
          boxShadow: '-8px 8px 12px rgba(0,0,0,0.15)',
          overflow: 'hidden',
        }}
      >
        <MusicPlayer 
          onPrevPublication={handlePrevPublication}
          onNextPublication={handleNextPublication}
        />
      </Box>

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

export function otherUserPagePostToSongCard(
  post: UserPagePost,
  userData: UserData,
  index: number
) {
  // Si es post de canción
  if (post.type === 'song' && post.song) {
    return {
      id: index,
      title: post.song.name,
      audioSrc: post.song.audio,
      profilePic: userData.profile_img,
      username: post.userName,
      coverImg: post.coverImg,
      postId: post.id,
      type: post.type,
    };
  }

  // Si es post de álbum
  if (post.type === 'album' && post.album && post.album.songs.length > 0) {
    return {
      id: index,
      title: post.album.name,
      audioSrc: post.album.songs[0].audio, // Primera canción del álbum
      profilePic: userData.profile_img,
      username: post.userName,
      coverImg: post.coverImg,
      postId: post.id,
      type: post.type,
      albumSongs: post.album.songs.map((song, idx) => ({
        id: idx,
        title: song.name,
        audioSrc: song.audio,
        profilePic: userData.profile_img,
        username: post.userName,
        coverImg: post.coverImg,
        postId: post.id,
        type: 'album',
      })),
    };
  }

  // Fallback para otros tipos
  return {
    id: index,
    title: post.name,
    audioSrc: '',
    profilePic: userData.profile_img,
    username: post.userName,
    coverImg: post.coverImg,
    postId: post.id,
    type: post.type,
  };
}