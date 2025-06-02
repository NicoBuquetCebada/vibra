import { useState, useEffect, useRef, useCallback, useContext } from 'react';
import { Container, Box, Typography, CircularProgress, IconButton, Avatar, Tooltip } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SearchIcon from '@mui/icons-material/Search';
import { useNavigate, useLocation } from 'react-router-dom';
import SongCard from './components/songCard';
import MusicPlayer from './components/musicPlayer';
import BottomNav from '../components/bottom-navigation';
import { fetchWithAuth } from '../api';
import { AuthContext } from '../context/auth-context';
import { usePlayer } from '../context/player-context';
import Logo from '../assets/basic_logo.png';
import Snackbar from '@mui/material/Snackbar';


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
export function postToSongCard(post: PostApi, index: number) {
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

interface SearchResult {
  name: string;
  id: number | null;
  type: 'user' | 'song' | 'album';
  img?: string;  // Campo opcional para la imagen del resultado
}

function MusicHome() {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [isSearchBarVisible, setIsSearchBarVisible] = useState(true);
  const lastScrollTop = useRef(0);
  const [posts, setPosts] = useState<PostApi[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [lastLoadedPage, setLastLoadedPage] = useState(-1);
  const observerRef = useRef<HTMLDivElement | null>(null);
  const searchContainerRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();
  const authContext = useContext(AuthContext);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const location = useLocation();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [activePostIndex, setActivePostIndex] = useState<number | null>(null);
  // CORREGIDO: usar usePlayer como hook
  const { setPlaylist, setPlaylistIndex } = usePlayer();

  // Función para manejar clics fuera del buscador
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Efecto para controlar la visibilidad del buscador según el scroll
  useEffect(() => {
    const container = document.querySelector('.scrollable-container');
    if (!container) return;

    const handleScroll = () => {
      const currentScrollTop = container.scrollTop;
      
      // Mostrar la barra cuando estamos en la parte superior
      if (currentScrollTop <= 10) {
        setIsSearchBarVisible(true);
        return;
      }

      // Determinar la dirección del scroll y actualizar la visibilidad
      if (currentScrollTop > lastScrollTop.current) {
        // Scrolling hacia abajo
        setIsSearchBarVisible(false);
        setShowResults(false); // Ocultar resultados al scrollear
      } else {
        // Scrolling hacia arriba
        setIsSearchBarVisible(true);
      }

      lastScrollTop.current = currentScrollTop;
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

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

  const handleSearch = async (query: string) => {
    setSearchTerm(query);
    
    if (query.trim() === '') {
      setShowResults(false);
      setSearchResults([]);
      return;
    }

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Set new timeout for debounce
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const response = await fetchWithAuth(`/api/home/search/${encodeURIComponent(query)}`);
        if (!response.ok) throw new Error('Error en la búsqueda');
        
        const results: SearchResult[] = await response.json();
        setSearchResults(results.slice(0, 5)); // Limitar a 5 resultados
        setShowResults(true);
      } catch (error) {
        console.error('Error al buscar:', error);
        setSearchResults([]);
      }
    }, 300); // 300ms de debounce
  };

  // Limpiar timeout al desmontar
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  // Manejo del mensaje de éxito
  useEffect(() => {
    if (location.state?.successMessage) {
      setSuccessMessage(location.state.successMessage);
      // Limpia el estado para que no se repita al refrescar
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // --- NUEVO: función para reproducir publicación por índice ---
  const playPublication = (postIdx: number) => {
    const post = posts[postIdx];
    if (!post) return;
    setActivePostIndex(postIdx);
    // Adaptar a SongCard
    const songCardData = postToSongCard(post, postIdx);
    setPlaylist([songCardData]);
    setPlaylistIndex(0);
  };

  // --- NUEVO: callbacks para MusicPlayer ---
  const handlePrevPublication = () => {
    if (activePostIndex !== null && activePostIndex > 0) {
      playPublication(activePostIndex - 1);
    }
  };
  const handleNextPublication = () => {
    if (activePostIndex !== null && activePostIndex < posts.length - 1) {
      playPublication(activePostIndex + 1);
    }
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
          backgroundColor: 'transparent', // Fondo transparente para ver partículas
          position: 'relative',
        }}
      >
        {/* Logo que funciona como botón de logout */}
        <Tooltip title="Cerrar sesión" arrow placement="bottom">
          <IconButton 
            onClick={handleLogout} 
            sx={{ 
              position: 'fixed', 
              top: 19, 
              left: 16, 
              zIndex: 2000,
              background: 'rgba(255,255,255,0.8)',
              padding: '6px',
              '&:hover': {
                background: 'rgba(255,255,255,0.9)',
              }
            }}
          >
            <Box
              component="img"
              src={Logo}
              alt="Logo"
              sx={{
                width: '40px',
                height: '40px',
                objectFit: 'contain'
              }}
            />
          </IconButton>
        </Tooltip>

        {/* Barra de búsqueda */}
        <Box
          ref={searchContainerRef}
          sx={{
            position: 'fixed',
            top: isSearchBarVisible ? 16 : -80,
            width: '60%',
            transform: 'translateX(7%)',
            zIndex: 1999,
            transition: 'top 0.3s ease',
          }}
        >
          {/* Barra de búsqueda */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              borderRadius: showResults ? '32px 32px 0 0' : '32px',
              padding: '0 24px',
              boxShadow: showResults ? '0 2px 0 rgba(0,0,0,0.1)' : '0 2px 8px rgba(0,0,0,0.1)',
              height: '56px',
              transition: 'all 0.3s ease',
            }}
          >
            <SearchIcon sx={{ color: '#307cbe', fontSize: '28px' }} />
            <input
              type="text"
              value={searchTerm}
              placeholder="Buscar canciones, álbumes o artistas..."
              style={{
                width: '100%',
                height: '100%',
                border: 'none',
                outline: 'none',
                backgroundColor: 'transparent',
                fontSize: '1.1rem',
                color: '#424242',
                fontFamily: 'inherit',
                padding: '0 12px',
              }}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </Box>

          {/* Resultados de búsqueda */}
          {showResults && searchResults.length > 0 && (
            <Box
              sx={{
                width: '100%',
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                borderRadius: '0 0 16px 16px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                maxHeight: '300px',
                overflowY: 'auto',
                '&::-webkit-scrollbar': {
                  width: '8px',
                },
                '&::-webkit-scrollbar-thumb': {
                  backgroundColor: 'rgba(0,0,0,0.2)',
                  borderRadius: '4px',
                },
              }}
            >
              {searchResults.map((result, index) => (
                <Box
                  key={index}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '12px 24px',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s',
                    '&:hover': {
                      backgroundColor: 'rgba(48, 124, 190, 0.1)',
                    },
                    borderBottom: index < searchResults.length - 1 ? '1px solid rgba(0,0,0,0.1)' : 'none',
                  }}
                  onClick={() => {
                    if (result.type === 'user') {
                      navigate(`/profile/${result.name}`);
                    } else if ((result.type === 'song' || result.type === 'album' || result.type === 'post') && result.id) {
                      navigate(`/post/${result.id}`);
                    }
                    setShowResults(false);
                  }}
                >
                  {/* Mostrar imagen si existe, sino mostrar icono por defecto */}
                  {result.img ? (
                    result.type === 'user' ? (
                      <Avatar 
                        src={result.img}
                        sx={{ 
                          width: 40, 
                          height: 40, 
                          mr: 2,
                        }}
                      />
                    ) : (
                      <Box
                        component="img"
                        src={result.img}
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: 1,
                          mr: 2,
                          objectFit: 'cover'
                        }}
                      />
                    )
                  ) : (
                    result.type === 'user' ? (
                      <Avatar 
                        sx={{ 
                          width: 40, 
                          height: 40, 
                          mr: 2,
                          backgroundColor: '#307cbe' 
                        }}
                      />
                    ) : (
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: 1,
                          backgroundColor: '#307cbe',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mr: 2,
                          color: 'white',
                          fontSize: '1.5rem',
                        }}
                      >
                        {result.type === 'song' ? '♪' : '♫'}
                      </Box>
                    )
                  )}
                  
                  {/* Nombre y tipo */}
                  <Box>
                    <Typography 
                      variant="body1" 
                      sx={{ 
                        fontWeight: 500,
                        color: '#424242'
                      }}
                    >
                      {result.name}
                    </Typography>
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        color: 'text.secondary',
                        textTransform: 'capitalize'
                      }}
                    >
                      {result.type === 'user' ? 'Usuario' : result.type === 'song' ? 'Canción' : 'Álbum'}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          )}
          {/* Mensaje cuando no hay resultados */}
          {showResults && searchResults.length === 0 && (
            <Box
              sx={{
                width: '100%',
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                borderRadius: '0 0 16px 16px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                p: 3,
                textAlign: 'center',
                color: '#307cbe',
                fontWeight: 500,
              }}
            >
              No se han encontrado resultados.
            </Box>
          )}
        </Box>

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
          {posts.map((post, index) => {
            const songCardData = postToSongCard(post, index);

            // Añade este console.log:
            console.log(
              `[Home] Post: ${songCardData.title} | Tipo: ${post.content} | audioSrc:`,
              songCardData.audioSrc,
              songCardData
            );

            // Función para navegación inteligente
            const handleUserClick = (username: string) => {
              console.log('Navigating to user:', username);
              console.log('Current user:', authContext?.user?.name);
              if (username === authContext?.user?.name) {
                navigate('/profile');
              } else {
                navigate(`/profile/${username}`);
              }
            };

            // Para repostUser (si existe)
            const handleRepostUserClick = (repostUser?: { name: string }) => {
              if (!repostUser) return;
              if (repostUser.name === authContext?.user?.name) {
                navigate('/profile');
              } else {
                navigate(`/profile/${repostUser.name}`);
              }
            };

            return (
              <SongCard
                key={index}
                song={songCardData}
                isRepost={post.type === 'repost'}
                repostUser={post.type === 'repost' ? post.repostUser : undefined}
                onUserClick={() => handleUserClick(songCardData.username)}
                onRepostUserClick={
                  post.type === 'repost' && post.repostUser
                    ? () => handleRepostUserClick(post.repostUser)
                    : undefined
                }
                ref={index === posts.length - 1 ? observerRef : null}
                // --- NUEVO: al hacer play, reproducir publicación y actualizar índice ---
                onPlay={() => playPublication(index)}
              />
            );
          })}
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
          <MusicPlayer 
            onPrevPublication={handlePrevPublication}
            onNextPublication={handleNextPublication}
          />
        </Box>
        <BottomNav handleNavigation={handleNavigation} />

        {/* Snackbar para mensajes de éxito */}
        <Snackbar
          open={!!successMessage}
          autoHideDuration={3000}
          onClose={() => setSuccessMessage(null)}
          message={successMessage}
        />
      </Container>
  );
}

export default MusicHome;
