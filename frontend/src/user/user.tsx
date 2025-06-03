import React, { useEffect, useState } from 'react';
import { Container, Box, Avatar, Typography, Paper, Tabs, Tab, CircularProgress, Button, List, ListItem, ListItemAvatar, ListItemText, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Fab, Tooltip } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import MusicPlayer from '../home/components/musicPlayer';
import BottomNav from '../components/bottom-navigation';
import { fetchWithAuth, getFollowers, getFollowed, getUserSaves, getUserReposts, getUserRates, getSong, getSongsByAlbum } from '../api';
import SongCard from '../home/components/songCard';
import TuneIcon from '@mui/icons-material/Tune';
import PersonIcon from '@mui/icons-material/Person';

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

export function userPagePostToSongCard(
  post: UserPagePost,
  userData: UserData,
  index: number
) {
  // Si es post de canción
  if (post.type === 'song' && post.song) {
    return {
      id: index,
      title: post.song.name,
      audioSrc: post.song.audio, // <-- Aquí debe estar la URL
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
      audioSrc: post.album.songs[0].audio, // <-- Aquí debe estar la URL de la primera canción
      profilePic: userData.profile_img,
      username: post.userName,
      coverImg: post.coverImg,
      postId: post.id,
      albumSongs: post.album.songs, // <-- Añade las canciones del álbum
      type: post.type, // Añade el tipo de post
    };
  }
  // Fallback
  return {
    id: index,
    title: post.name,
    audioSrc: '',
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
  const [reposts, setReposts] = useState<UserPagePost[]>([]);
  const [saves, setSaves] = useState<UserPagePost[]>([]);
  const [rates, setRates] = useState<UserPagePost[]>([]);
  const [tab, setTab] = useState(0);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [loadingReposts, setLoadingReposts] = useState(true);
  const [loadingSaves, setLoadingSaves] = useState(true);
  const [loadingRates, setLoadingRates] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogTitle, setDialogTitle] = useState('');
  const [userList, setUserList] = useState<{ name: string; profile_img?: string }[]>([]);
  const [loadingList, setLoadingList] = useState(false);

  // Mueve estas funciones AQUÍ, fuera del useEffect:
  const fetchReposts = async () => {
    setLoadingReposts(true);
    try {
      const data = await getUserReposts();
      const repostsWithAudio = await Promise.all(
        data.map(async (post: UserPagePost) => {
          if (post.type === 'song') {
            const songData = await getSong(post.contentId);
            return { ...post, song: { name: post.name, audio: songData.audio } };
          } else if (post.type === 'album') {
            const albumSongs = await getSongsByAlbum(post.contentId);
            return { ...post, album: { name: post.name, songs: albumSongs } };
          }
          return post;
        })
      );
      setReposts(repostsWithAudio);
    } catch {
      setReposts([]);
    }
    setLoadingReposts(false);
  };

  const fetchSaves = async () => {
    setLoadingSaves(true);
    try {
      const data = await getUserSaves();
      const savesWithAudio = await Promise.all(
        data.map(async (save: UserPagePost) => {
          if (save.type === 'song') {
            const songData = await getSong(save.contentId);
            return { ...save, song: { name: save.name, audio: songData.audio } };
          } else if (save.type === 'album') {
            const albumSongs = await getSongsByAlbum(save.contentId);
            return { ...save, album: { name: save.name, songs: albumSongs } };
          }
          return save;
        })
      );
      setSaves(savesWithAudio);
    } catch {
      setSaves([]);
    }
    setLoadingSaves(false);
  };

  const fetchRates = async () => {
    setLoadingRates(true);
    try {
      const rates = await getUserRates();
      const ratesWithAudio = await Promise.all(
        rates.map(async (rate: UserPagePost) => {
          if (rate.type === 'song') {
            const songData = await getSong(rate.contentId);
            return { ...rate, song: { name: rate.name, audio: songData.audio } };
          } else if (rate.type === 'album') {
            const albumSongs = await getSongsByAlbum(rate.contentId);
            return { ...rate, album: { name: rate.name, songs: albumSongs } };
          }
          return rate;
        })
      );
      setRates(ratesWithAudio);
    } catch {
      setRates([]);
    }
    setLoadingRates(false);
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetchWithAuth('/api/users/page');
        if (!response.ok) throw new Error('Error al obtener datos del usuario');
        const data = await response.json();
        setUserData(data);
      } catch (error) {
        console.error('Error:', error);
      }
    };

    const fetchUserPosts = async () => {
      setLoadingPosts(true);
      try {
        const response = await fetchWithAuth('/api/users/posts');
        if (!response.ok) throw new Error('Error al obtener posts');
        const data = await response.json();
        setPosts(data);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        setPosts([]);
      }
      setLoadingPosts(false);
    };

    fetchUserData();
    fetchUserPosts();
    // Ya no llames a fetchReposts ni fetchSaves aquí
  }, []);

  useEffect(() => {
    if (userData) {
      fetchReposts();
      fetchRates();
      fetchSaves();
    }
  }, [userData]);

  const handleOpenList = async (type: 'followers' | 'followed') => {
    setDialogTitle(type === 'followers' ? 'Seguidores' : 'Seguidos');
    setOpenDialog(true);
    setLoadingList(true);
    try {
      const data = type === 'followers' ? await getFollowers() : await getFollowed();
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

  // Nueva función para obtener posts con audio
  const fetchUserPostsWithAudio = async () => {
    setLoadingPosts(true);
    try {
      const response = await fetchWithAuth('/api/users/posts');
      if (!response.ok) throw new Error('Error al obtener posts');
      const posts = await response.json();

      // Para cada post, pide el audio si es song o las canciones si es album
      const postsWithAudio = await Promise.all(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        posts.map(async (post: any) => {
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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      setPosts([]);
    }
    setLoadingPosts(false);
  };

  // Llama a la nueva función en el useEffect
  useEffect(() => {
    fetchUserPostsWithAudio();
  }, []);

  // Renderizado de pestañas
  const renderTabContent = () => {
    if (!userData) {
      return (
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      );
    }

    if (tab === 0) {
      if (loadingPosts) return <Box sx={{ textAlign: 'center', mt: 4 }}><CircularProgress /></Box>;
      return posts.length === 0 ? (
        <Typography variant="body2" color="text.secondary">No hay publicaciones.</Typography>
      ) : (
        posts.map((post, idx) => {
          const songCardData = userPagePostToSongCard(post, userData, idx);
          return (
            <Box key={post.id} sx={{ my: 2, display: 'flex', justifyContent: 'center' }}>
              <SongCard song={songCardData} onUserClick={() => navigate('/profile')} onSaveChange={fetchSaves} onRateChange={fetchRates}/>
            </Box>
          );
        })
      );
    }
    if (tab === 1) {
      if (loadingReposts) return <Box sx={{ textAlign: 'center', mt: 4 }}><CircularProgress /></Box>;
      return reposts.length === 0 ? (
        <Typography variant="body2" color="text.secondary">No hay reposts.</Typography>
      ) : (
        reposts.map((post, idx) => {
          const songCardData = userPagePostToSongCard(post, userData, idx);
          return (
            <Box key={post.id} sx={{ my: 2, display: 'flex', justifyContent: 'center' }}>
              <SongCard song={songCardData} onUserClick={() => navigate('/profile')} onSaveChange={fetchSaves} onRateChange={fetchRates}/>
            </Box>
          );
        })
      );
    }
    if (tab === 2) {
      if (loadingRates) return <Box sx={{ textAlign: 'center', mt: 4 }}><CircularProgress /></Box>;
      return rates.length === 0 ? (
        <Typography variant="body2" color="text.secondary">No hay rates.</Typography>
      ) : (
        rates.map((post, idx) => {
          const songCardData = userPagePostToSongCard(post, userData, idx);
          return (
            <Box key={post.id} sx={{ my: 2, display: 'flex', justifyContent: 'center' }}>
              <SongCard song={songCardData} onUserClick={() => navigate('/profile')} onSaveChange={fetchSaves} onRateChange={fetchRates}/>
            </Box>
          );
        })
      );
    }
    if (tab === 3) {
      if (loadingSaves) return <Box sx={{ textAlign: 'center', mt: 4 }}><CircularProgress /></Box>;
      return saves.length === 0 ? (
        <Typography variant="body2" color="text.secondary">No hay guardados.</Typography>
      ) : (
        saves.map((post, idx) => {
          const songCardData = userPagePostToSongCard(post, userData, idx);
          return (
            <Box key={post.id} sx={{ my: 2, display: 'flex', justifyContent: 'center' }}>
              <SongCard song={songCardData} onUserClick={() => navigate('/profile')} onSaveChange={fetchSaves} onRateChange={fetchRates}/>
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
        backgroundColor: 'transparent', // Fondo transparente para ver partículas
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
                sx={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
                onClick={() => handleOpenList('followed')}
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
                sx={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
                onClick={() => handleOpenList('followers')}
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

        {/* Pestañas de Posts, Reposts y Guardados */}
        <Box sx={{ mt: 4 }}>
          <Tabs value={tab} onChange={(_, v) => setTab(v)} centered>
            <Tab label="Posts" />
            <Tab label="Reposts" />
            <Tab label="Rates" />
            {userData && /* lógica para saber si es tu perfil */ true && (
              <Tab label="Guardados" />
            )}
          </Tabs>
          <Box sx={{ mt: 2 }}>
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

      <BottomNav handleNavigation={navigate}  />

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
                          if (userData && item.name === userData.name) {
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

export default UserPage;