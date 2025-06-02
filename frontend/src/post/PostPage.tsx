import { useState, useEffect, useContext } from 'react';
import { Container, Box, Typography, CircularProgress } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import SongCard from '../home/components/songCard';
import MusicPlayer from '../home/components/musicPlayer';
import BottomNav from '../components/bottom-navigation';
import { fetchWithAuth } from '../api';
import { AuthContext } from '../context/auth-context';
import { postToSongCard, PostApi } from '../home/home';

const PostPage: React.FC = () => {
  const { postId } = useParams<{ postId: string }>();
  const [post, setPost] = useState<PostApi | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const authContext = useContext(AuthContext);

  useEffect(() => {
    const fetchPost = async () => {
      setLoading(true);
      try {
        const res = await fetchWithAuth(`/api/posts/${postId}`);
        if (!res.ok) throw new Error('No se pudo cargar la publicación');
        const data: PostApi = await res.json();
        setPost(data);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (e) {
        setPost(null);
      } finally {
        setLoading(false);
      }
    };
    if (authContext?.token && postId) {
      fetchPost();
    }
  }, [authContext?.token, postId]);

  const handleNavigation = (path: string) => {
    navigate(path);
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
        paddingTop: { xs: '100px', md: '100px' },
        paddingBottom: '70px',
        backgroundColor: '#e8e8e8',
        position: 'relative',
      }}
    >
      {/* Publicación */}
      <Box
        sx={{
          flex: 1,
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: { xs: 4, md: 6 },
          maxWidth: '65%',
          paddingTop: { xs: '20px', md: '20px' },
          justifyItems: 'center',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {loading ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', py: 2 }}>
            <CircularProgress sx={{ color: '#307cbe' }} />
            <Typography variant="caption" sx={{ marginTop: 1, color: 'gray' }}>
              Cargando publicación...
            </Typography>
          </Box>
        ) : post ? (
          <SongCard
            song={postToSongCard(post, 0)}
            isRepost={post.type === 'repost'}
            repostUser={post.type === 'repost' ? post.repostUser : undefined}
          />
        ) : (
          <Typography variant="body1" color="error" sx={{ mt: 4 }}>
            No se encontró la publicación.
          </Typography>
        )}
      </Box>

      {/* Reproductor fijo a la derecha */}
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
      <BottomNav handleNavigation={handleNavigation} />
    </Container>
  );
};

export default PostPage;