import React, { useEffect, useState, useContext } from 'react';
import { Container, Box, Avatar, Typography, Paper, Alert, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, List, ListItem, ListItemAvatar, ListItemText, CircularProgress, Tabs, Tab } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import MusicPlayer from '../home/components/musicPlayer';
import BottomNav from '../components/bottom-navigation';
import { getOtherUserPage, getOtherUserPosts, getOtherUserFollowers, getOtherUserFollowed, followUser, unfollowUser, fetchWithAuth, getFollowed, getOtherUserReposts } from '../api';
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
  song?: SongObj;   // <-- Añade esto
  album?: AlbumObj; // <-- Y esto
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
        // Para cada post, pide el audio si es song o las canciones si es album
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

    fetchUserData();
    fetchUserPosts();
  }, [username]);

  // Traer los reposts del usuario visitado
  useEffect(() => {
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

  // Comprobar si el usuario actual sigue al usuario visitado
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

  // Manejar seguir/dejar de seguir
  const handleFollowToggle = async () => {
    if (!username) return;
    try {
      if (isFollowing) {
        console.log('DELETE unfollow:', `/api/follows/follow/${username}`);
        await unfollowUser(username);
        setIsFollowing(false);
      } else {
        console.log('POST follow:', `/api/follows/follow/${username}`);
        await followUser(username);
        setIsFollowing(true);
      }
    } catch (error) {
      console.error('Error en follow/unfollow:', error);
    }
  };

  // Renderizado de pestañas
  const renderTabContent = () => {
    if (tab === 0) {
      return posts.length === 0 && !error ? (
        <Typography variant="body2" color="text.secondary">
          No hay publicaciones.
        </Typography>
      ) : (
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        posts.map((post, idx) => {
          // Mapeo igual que en userPagePostToSongCard
          let audioSrc = '';
          if (post.song && post.song.audio) {
            audioSrc = post.song.audio;
          } else if (post.album && post.album.songs && post.album.songs.length > 0) {
            audioSrc = post.album.songs[0].audio;
          }
          return (
            <Box key={post.id} sx={{ my: 2, display: 'flex', justifyContent: 'center' }}>
              <SongCard song={{
                id: post.id,
                title: post.song?.name || post.album?.name || post.name,
                audioSrc,
                profilePic: userData?.profile_img || '',
                username: post.userName,
                coverImg: post.coverImg,
                postId: post.id
              }} />
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
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        reposts.map((post, idx) => {
          let audioSrc = '';
          if (post.song && post.song.audio) {
            audioSrc = post.song.audio;
          } else if (post.album && post.album.songs && post.album.songs.length > 0) {
            audioSrc = post.album.songs[0].audio;
          }
          return (
            <Box key={post.id} sx={{ my: 2, display: 'flex', justifyContent: 'center' }}>
              <SongCard song={{
                id: post.id,
                title: post.song?.name || post.album?.name || post.name,
                audioSrc,
                profilePic: userData?.profile_img || '',
                username: post.userName,
                coverImg: post.coverImg,
                postId: post.id
              }} />
            </Box>
          );
        })
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