import { useState, useEffect, useRef, useCallback, useContext } from 'react';
import { Container, Box, Typography, CircularProgress, IconButton } from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useNavigate } from 'react-router-dom';
import SongCard from './components/songCard';
import MusicPlayer from './components/musicPlayer';
import BottomNav from '../components/bottom-navigation';
import { fetchWithAuth } from '../api';
import { AuthContext } from '../context/auth-context';

// Tipos para los objetos de la API
interface User {
  name: string;
  profileImg: string;
}
interface SongObj {
  name: string;
  audio: string;
}
interface AlbumObj {
  name: string;
  songs: SongObj[];
}
export interface PostApi {
  type: 'post' | 'repost';
  createdAt: string;
  user: User;
  repostUser?: User;
  content: string;
  song?: SongObj;
  album?: AlbumObj;
  coverImg: string;
  postId: number;
}

// Adaptador para transformar PostApi a Song (para SongCard)
function postToSongCard(post: PostApi, index: number) {
  // Si es post de canción
  if (post.content === 'song' && post.song) {
    return {
      id: index,
      title: post.song.name,
      audioSrc: post.song.audio,
      profilePic: post.user.profileImg,
      username: post.user.name,
      coverImg: post.coverImg,
      postId: post.postId,
    };
  }
  // Si es post de álbum
  if (post.content === 'album' && post.album) {
    return {
      id: index,
      title: post.album.name,
      audioSrc: post.album.songs[0]?.audio || '',
      profilePic: post.user.profileImg,
      username: post.user.name,
      coverImg: post.coverImg,
      postId: post.postId,
    };
  }
  // Si es repost
  if (post.type === 'repost' && post.song) {
    return {
      id: index,
      title: post.song.name,
      audioSrc: post.song.audio,
      profilePic: post.user.profileImg, // user original
      username: post.user.name,
      coverImg: post.coverImg,
      postId: post.postId,
    };
  }
  // Fallback
  return {
    id: index,
    title: 'Publicación',
    audioSrc: '',
    profilePic: post.user.profileImg,
    username: post.user.name,
    coverImg: post.coverImg,
    postId: post.postId,
  };
}

function MusicHome() {
  const [posts, setPosts] = useState<PostApi[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [lastLoadedPage, setLastLoadedPage] = useState(-1);
  const observerRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();
  const authContext = useContext(AuthContext);

  // Cargar posts de la API
  const fetchPosts = useCallback(async (pageNum: number) => {
    setLoading(true);
    try {
      const res = await fetchWithAuth(`/api/home?page=${pageNum}`);
      if (!res.ok) throw new Error('Error al obtener publicaciones');
      const data: PostApi[] = await res.json();
      
      // No hay más posts si recibimos menos de 2
      if (data.length < 2) {
        setHasMore(false);
      }
      
      setPosts(prev => {
        if (pageNum === 0) {
          return data;
        }
        // Evitar duplicados comparando por createdAt
        const newPosts = data.filter(newPost => 
          !prev.some(existingPost => existingPost.createdAt === newPost.createdAt)
        );
        return [...prev, ...newPosts];
      });
      
      setLastLoadedPage(pageNum);      } catch (e) {
        setHasMore(false);
        if (e instanceof Error) {
          console.error('Error al obtener publicaciones:', e.message);
        }
      } finally {
        setLoading(false);
      }
  }, []);

  // Inicialización: carga de las dos primeras páginas
  useEffect(() => {
    const initialLoad = async () => {
      setLoading(true);
      try {
        // Cargamos las páginas 0 y 1 en paralelo
        const [page0Res, page1Res] = await Promise.all([
          fetchWithAuth('/api/home?page=0'),
          fetchWithAuth('/api/home?page=1')
        ]);
        
        if (!page0Res.ok || !page1Res.ok) throw new Error('Error en la carga inicial');
        
        const page0Data: PostApi[] = await page0Res.json();
        const page1Data: PostApi[] = await page1Res.json();
        
        // Combinamos los resultados
        const allPosts = [...page0Data, ...page1Data];
        setPosts(allPosts);
        setLastLoadedPage(1);
        
        // Si alguna página tiene menos de 2 posts, no hay más
        if (page0Data.length < 2 || page1Data.length < 2) {
          setHasMore(false);
        }
      } catch (e) {
        console.error('Error en la carga inicial:', e);
        setHasMore(false);
      } finally {
        setLoading(false);
      }
    };
    
    if (authContext?.token) {
      initialLoad();
    }
  }, [authContext?.token]);

  // Scroll infinito con IntersectionObserver
  useEffect(() => {
    if (!observerRef.current || !hasMore || loading) return;
    
    const handleObserver = async (entries: IntersectionObserverEntry[]) => {
      const target = entries[0];
      if (target.isIntersecting && !loading && hasMore) {
        // Cargar las siguientes dos páginas
        const nextPage = lastLoadedPage + 1;
        const nextNextPage = lastLoadedPage + 2;
        
        setLoading(true);
        try {
          const [page1Res, page2Res] = await Promise.all([
            fetchWithAuth(`/api/home?page=${nextPage}`),
            fetchWithAuth(`/api/home?page=${nextNextPage}`)
          ]);
          
          if (!page1Res.ok || !page2Res.ok) throw new Error('Error cargando más posts');
          
          const page1Data: PostApi[] = await page1Res.json();
          const page2Data: PostApi[] = await page2Res.json();
          
          setPosts(prev => {
            const newPosts = [...page1Data, ...page2Data].filter(newPost => 
              !prev.some(existingPost => existingPost.createdAt === newPost.createdAt)
            );
            return [...prev, ...newPosts];
          });
          
          setLastLoadedPage(nextNextPage);
          
          // Si alguna página tiene menos de 2 posts, no hay más
          if (page1Data.length < 2 || page2Data.length < 2) {
            setHasMore(false);
          }
        } catch (e) {
          console.error('Error cargando más posts:', e);
          setHasMore(false);
        } finally {
          setLoading(false);
        }
      }
    };
    
    const observer = new IntersectionObserver(handleObserver, {
      root: null,
      rootMargin: '20px',
      threshold: 1.0
    });
    
    observer.observe(observerRef.current);
    return () => observer.disconnect();
  }, [observerRef, loading, hasMore, lastLoadedPage, fetchPosts]);

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  return (      <Container
      sx={{
        display: 'flex',
        flexDirection: 'row',
        minWidth: '100vw',
        maxHeight: '100vh',
        overflowY: 'auto',
        paddingTop: { xs: '80px', md: '20px' },
        paddingBottom: '70px',
        backgroundColor: '#e8e8e8',
        position: 'relative',
      }}
    >
      {/* Botón de logout global arriba a la izquierda */}
      <IconButton onClick={handleLogout} sx={{ position: 'fixed', top: 16, left: 16, zIndex: 2000, background: 'rgba(255,255,255,0.8)' }}>
        <LogoutIcon fontSize="medium" />
      </IconButton>
      <Box
        sx={{
          flex: 1,
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: 2,
          maxWidth: '65%',
          paddingTop: { xs: '0px', md: '0px' },
          justifyItems: 'center',
        }}
      >
        {posts.map((post, index) => (
          <SongCard
            key={index}
            song={postToSongCard(post, index)}
            isRepost={post.type === 'repost'}
            repostUser={post.type === 'repost' ? post.repostUser : undefined}
            ref={index === posts.length - 1 ? observerRef : null}
          />
        ))}
        {loading && (
          <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', py: 2 }}>
            <CircularProgress sx={{ color: '307cbe' }} />
            <Typography variant="caption" sx={{ marginTop: 1, color: 'gray' }}>
              Cargando más publicaciones...
            </Typography>
          </Box>
        )}
        {!hasMore && posts.length > 0 && (
          <Box 
            sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              py: 4,
              pb: { xs: 16, md: 12 }, // Padding bottom más grande para móviles
              visibility: 'hidden', // Inicialmente oculto
              animation: 'showEndMessage 0.5s ease-in-out forwards',
              '@keyframes showEndMessage': {
                '0%': {
                  visibility: 'visible',
                  opacity: 0,
                  transform: 'translateY(20px)'
                },
                '100%': {
                  visibility: 'visible',
                  opacity: 1,
                  transform: 'translateY(0)'
                }
              }
            }}
          >
            <CheckCircleIcon 
              sx={{ 
                fontSize: 60,
                color: '#307cbe',
                opacity: 0,
                animation: 'checkAnimation 0.5s ease-in-out 0.3s forwards',
                '@keyframes checkAnimation': {
                  '0%': {
                    transform: 'scale(0) rotate(-180deg)',
                    opacity: 0
                  },
                  '70%': {
                    transform: 'scale(1.2) rotate(0deg)',
                  },
                  '100%': {
                    transform: 'scale(1) rotate(0deg)',
                    opacity: 1
                  }
                }
              }} 
            />
            <Typography 
              variant="body1" 
              sx={{ 
                mt: 2,
                color: '#307cbe',
                fontWeight: 500,
                opacity: 0,
                animation: 'fadeIn 0.5s ease-in-out 0.8s forwards',
                '@keyframes fadeIn': {
                  from: {
                    opacity: 0,
                    transform: 'translateY(10px)'
                  },
                  to: {
                    opacity: 1,
                    transform: 'translateY(0)'
                  }
                }
              }}
            >
              ¡Estás al día!
            </Typography>
          </Box>
        )}
      </Box>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'center',
          width: '30%',
          position: 'fixed',
          top: 0,
          right: 0,
          height: 'calc(100vh - 12px)', // Reducir altura para dejar margen abajo
          backgroundColor: '#f5f5f5',
          margin: '0 0 12px 12px', // Margen izquierdo y inferior
          padding: 0,
          boxShadow: '-8px 8px 12px rgba(0, 0, 0, 0.15)', // Sombra más pronunciada
          overflow: 'hidden',
          borderRadius: '0 0 0 12px', // Esquina inferior izquierda redondeada
        }}
      >
        {/* El reproductor obtiene la canción actual del contexto, no necesita prop song */}
        <MusicPlayer />
      </Box>
      <BottomNav handleNavigation={handleNavigation} />
    </Container>
  );
}

export default MusicHome;
