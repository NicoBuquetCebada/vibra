/* eslint-disable react-refresh/only-export-components */
import { useState, useEffect, useRef, useCallback, useContext } from 'react';
import { Container, Box, Typography, CircularProgress, Snackbar } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
// import SearchIcon from '@mui/icons-material/Search';
import { useNavigate, useLocation } from 'react-router-dom';
import SongCard from './components/songCard';
import MusicPlayer from './components/musicPlayer';
import { fetchWithAuth } from '../api';
import { AuthContext } from '../context/auth-context';
import { usePlayer } from '../context/player-context';
import { useHome } from '../context/home-context'; // ✅ AGREGAR
import NavigationWrapper from '../components/NavigationWrapper';
// import BottomNav from '../components/bottom-navigation';
import SearchBar from '../components/SearchBar';

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
  id: number;
}

// Adaptador para transformar PostApi a Song (para SongCard)
export function postToSongCard(post: PostApi, index: number, profileImgOverride?: string) {
  const profilePic = profileImgOverride || post.user?.profileImg || '';

  let title = 'Publicación';
  let audioSrc = '';
  let albumSongs = undefined;

  if (post.content === 'song' && post.song) {
    title = post.song.name;
    audioSrc = post.song.audio;
  } else if (post.content === 'album' && post.album) {
    title = post.album.name;
    audioSrc = post.album.songs[0]?.audio || '';
    albumSongs = post.album.songs.map((track, idx) => ({
      id: idx,
      title: track.name,
      audioSrc: track.audio,
      profilePic,
      username: post.user?.name || '',
      coverImg: post.coverImg,
      postId: post.postId,
      type: 'album',
    }));
  } else if (post.type === 'repost' && post.song) {
    title = post.song.name;
    audioSrc = post.song.audio;
  }

  return {
    id: index,
    title,
    audioSrc,
    profilePic,
    username: post.user?.name || '',
    coverImg: post.coverImg,
    postId: post.postId,
    type: post.content,
    albumSongs, // Incluye las canciones del álbum
  };
}

interface SearchResult {
  name: string;
  id: number | null;
  type: 'user' | 'song' | 'album';
  img?: string;
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
  const { setPlaylist, setPlaylistIndex } = usePlayer();
  const { shouldRefresh, resetRefresh } = useHome(); // ✅ AGREGAR

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
      if (currentScrollTop <= 10) {
        setIsSearchBarVisible(true);
        return;
      }
      if (currentScrollTop > lastScrollTop.current) {
        setIsSearchBarVisible(false);
        setShowResults(false);
      } else {
        setIsSearchBarVisible(true);
      }
      lastScrollTop.current = currentScrollTop;
    };
    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  // Cargar posts de la API
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  /* const fetchPosts = useCallback(async (pageNum: number) => {
    setLoading(true);
    try {
      const res = await fetchWithAuth(`/api/home?page=${pageNum}`);
      if (!res.ok) throw new Error('Error al obtener publicaciones');
      const data: PostApi[] = await res.json();
      
      // ✅ CAMBIAR: Solo parar si NO hay posts (array vacío)
      if (data.length === 0) setHasMore(false);
      
      setPosts(prev => {
        if (pageNum === 0) return data;
        const newPosts = data.filter(newPost =>
          !prev.some(existingPost => existingPost.createdAt === newPost.createdAt)
        );
        return [...prev, ...newPosts];
      });
      setLastLoadedPage(pageNum);
    } catch (e) {
      setHasMore(false);
      if (e instanceof Error) {
        console.error('Error al obtener publicaciones:', e.message);
      }
    } finally {
      setLoading(false);
    }
  }, []); */

  // ✅ MODIFICAR: Función para refrescar completamente el home
  const refreshHome = useCallback(async () => {
    console.log('🔄 Refrescando home...');
    setPosts([]); // Limpiar posts actuales
    setLastLoadedPage(-1);
    setHasMore(true);
    
    try {
      const [page0Res, page1Res] = await Promise.all([
        fetchWithAuth('/api/home?page=0'),
        fetchWithAuth('/api/home?page=1')
      ]);
      
      if (!page0Res.ok || !page1Res.ok) throw new Error('Error en la carga inicial');
      
      const page0Data: PostApi[] = await page0Res.json();
      const page1Data: PostApi[] = await page1Res.json();
      const allPosts = [...page0Data, ...page1Data];
      
      console.log('✅ Home refrescado, nuevas publicaciones:', allPosts.length);
      setPosts(allPosts);
      setLastLoadedPage(1);
      
      // ✅ CAMBIAR: Solo parar si AMBAS páginas están vacías
      if (page0Data.length === 0 && page1Data.length === 0) {
        setHasMore(false);
      }
    } catch (e) {
      console.error('Error al refrescar home:', e);
      setHasMore(false);
    }
  }, []);

  // ✅ AGREGAR: Escuchar cambios para refrescar
  useEffect(() => {
    if (shouldRefresh) {
      refreshHome();
      resetRefresh();
    }
  }, [shouldRefresh, refreshHome, resetRefresh]);

  // Inicialización: carga solo la primera página
  useEffect(() => {
    const initialLoad = async () => {
      setLoading(true);
      try {
        const [page0Res, page1Res] = await Promise.all([
          fetchWithAuth('/api/home?page=0'),
          fetchWithAuth('/api/home?page=1')
        ]);
        if (!page0Res.ok || !page1Res.ok) throw new Error('Error en la carga inicial');
        const page0Data: PostApi[] = await page0Res.json();
        const page1Data: PostApi[] = await page1Res.json();
        const allPosts = [...page0Data, ...page1Data];
        
        console.log('Publicaciones cargadas:', allPosts);
        console.log('Página 0:', page0Data.length, 'posts');
        console.log('Página 1:', page1Data.length, 'posts');
        
        setPosts(allPosts);
        setLastLoadedPage(1);
        
        // ✅ CAMBIAR: Solo parar si AMBAS páginas están vacías
        if (page0Data.length === 0 && page1Data.length === 0) {
          setHasMore(false);
        }
      } catch (e) {
        console.error('Error en la carga inicial:', e);
        setHasMore(false);
      } finally {
        setLoading(false);
      }
    };
    
    // ✅ Solo cargar si no hay posts y hay token
    if (authContext?.token && posts.length === 0) {
      initialLoad();
    }
  }, [authContext?.token, posts.length]); // ✅ Cambiar dependencias

  // Scroll infinito con IntersectionObserver
  useEffect(() => {
    if (!observerRef.current || !hasMore || loading) return;
    
    const handleObserver = async (entries: IntersectionObserverEntry[]) => {
      const target = entries[0];
      if (target.isIntersecting && !loading && hasMore) {
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
          
          console.log(`Página ${nextPage}:`, page1Data.length, 'posts');
          console.log(`Página ${nextNextPage}:`, page2Data.length, 'posts');
          
          setPosts(prev => {
            const newPosts = [...page1Data, ...page2Data].filter(newPost =>
              !prev.some(existingPost => existingPost.createdAt === newPost.createdAt)
            );
            return [...prev, ...newPosts];
          });
          
          setLastLoadedPage(nextNextPage);
          
          // ✅ CAMBIAR: Solo parar si AMBAS páginas están vacías
          if (page1Data.length === 0 && page2Data.length === 0) {
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
  }, [observerRef, loading, hasMore, lastLoadedPage]);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  /* const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  }; */

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleNavigation = (path: string) => {
    navigate(path);
  };

  const handleSearch = async (query: string) => {
    setSearchTerm(query);
    if (query.trim() === '') {
      setShowResults(false);
      setSearchResults([]);
      return;
    }
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        console.log('🔍 Buscando:', query);
        console.log('👤 Usuario autenticado:', authContext?.user?.name);
        const response = await fetchWithAuth(`/api/home/search/${encodeURIComponent(query)}`);
        if (!response.ok) throw new Error('Error en la búsqueda');
        const results: SearchResult[] = await response.json();
        console.log('📊 Resultados encontrados:', results.length);
        console.log('📋 Resultados completos:', results);
        setSearchResults(results.slice(0, 5));
        setShowResults(true);
      } catch (error) {
        console.error('Error al buscar:', error);
        setSearchResults([]);
      }
    }, 300);
  };

  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (location.state?.successMessage) {
      setSuccessMessage(location.state.successMessage);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const playPublication = (postIdx: number) => {
    const post = posts[postIdx];
    if (!post) return;
    setActivePostIndex(postIdx);

    const songCardData = postToSongCard(post, postIdx);

    if (songCardData.type === 'album' && Array.isArray(songCardData.albumSongs)) {
      // Si es un álbum, configura el playlist con todas las canciones del álbum
      setPlaylist(songCardData.albumSongs);
    } else {
      // Si es una canción, configura el playlist con una sola canción
      setPlaylist([songCardData]);
    }

    setPlaylistIndex(0);

    // Log para verificar qué se carga en el reproductor
    console.log('Cargando en el reproductor:', songCardData.type === 'album' ? songCardData.albumSongs : songCardData);
  };

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

  // Detectar si es móvil (puedes ajustar el breakpoint si lo deseas)
  // const isMobile = window.innerWidth < 900;
  const isMobile = false;

  return (
    <NavigationWrapper>
      <Container
        className="scrollable-container"
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          minWidth: '100vw',
          height: '100vh',
          overflowY: 'auto',
          paddingTop: { xs: '16px', md: '32px' },
          paddingBottom: { xs: '80px', md: '70px' },
          backgroundColor: 'transparent',
          position: 'relative',
        }}
      >
        {/* Barra de búsqueda SOLO en escritorio */}
        <SearchBar
          isFixed={true}
          width={{ xs: '95%', md: '60%' }}
          left={{ xs: '2.5%', md: '7%' }}
          top={isSearchBarVisible ? 16 : -80}
          zIndex={1999}
        />

        {/* Contenido principal */}
        <Box
          sx={{
            flex: 1,
            maxWidth: { xs: '100vw', md: '65%' },
            paddingX: { xs: 1, md: '32px' },
            minHeight: 'max-content',
            width: '100%',
            paddingBottom: { xs: '250px', md: 0 },
          }}
        >
          {posts.map((post, index) => {
            const songCardData = postToSongCard(post, index);
            return (
              <Box
                key={index}
                sx={{
                  my: 2,
                  display: 'flex',
                  justifyContent: 'center',
                  width: { xs: '100%', md: 'auto' },
                }}
              >
                <SongCard
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
                  onPlay={() => playPublication(index)}
                />
              </Box>
            );
          })}
          {loading && (
            <Box sx={{ textAlign: 'center', mt: 4 }}>
              <CircularProgress />
            </Box>
          )}
          {!hasMore && posts.length > 0 && (
            <Box sx={{ textAlign: 'center', mt: 4 }}>
              <CheckCircleIcon sx={{ fontSize: 60, color: '#307cbe' }} />
              <Typography variant="body1" sx={{ mt: 2, color: '#307cbe', fontWeight: 500 }}>
                ¡Estás al día!
              </Typography>
            </Box>
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
            margin: { md: '12px 18px 24px 12px' },
            padding: 0,
            boxShadow: '-8px 8px 12px rgba(0, 0, 0, 0.15)',
            overflow: 'hidden',
            zIndex: 1200,
          }}
        >
          <MusicPlayer 
            onPrevPublication={handlePrevPublication}
            onNextPublication={handleNextPublication}
          />
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
          <MusicPlayer 
            onPrevPublication={handlePrevPublication}
            onNextPublication={handleNextPublication}
          />
        </Box>

        <Snackbar
          open={!!successMessage}
          autoHideDuration={3000}
          onClose={() => setSuccessMessage(null)}
          message={successMessage}
        />
      </Container>
      {/* Barra de navegación inferior solo en móvil */}
      {/* {isMobile && (
        <BottomNav handleNavigation={handleNavigation} />
      )} */}
    </NavigationWrapper>
  );
}

export default MusicHome;
