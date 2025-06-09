import React, { useState, useRef, useEffect } from 'react';
import { Box, Typography, Avatar } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useNavigate } from 'react-router-dom';
import { fetchWithAuth } from '../api';

interface SearchResult {
  name: string;
  id: number | null;
  type: 'user' | 'song' | 'album';
  img?: string;
}

interface SearchBarProps {
  isFixed?: boolean;
  top?: number | string;
  width?: string;
  left?: string;
  zIndex?: number;
}

const SearchBar: React.FC<SearchBarProps> = ({
  isFixed = false,
  top = 16,
  width = '60%',
  left = '7%',
  zIndex = 1999,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement | null>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const navigate = useNavigate();

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
        const response = await fetchWithAuth(`/api/home/search/${encodeURIComponent(query)}`);
        if (!response.ok) throw new Error('Error en la búsqueda');
        const results: SearchResult[] = await response.json();
        console.log('📊 Resultados encontrados:', results.length);
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

  return (
    <Box
      ref={searchContainerRef}
      sx={{
        position: isFixed ? 'fixed' : 'relative',
        top: isFixed ? top : 'auto',
        width,
        left: isFixed ? left : 'auto',
        zIndex,
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
                    sx={{ width: 40, height: 40, mr: 2 }}
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
                    sx={{ width: 40, height: 40, mr: 2, backgroundColor: '#307cbe' }}
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
                  sx={{ fontWeight: 500, color: '#424242' }}
                >
                  {result.name}
                </Typography>
                <Typography 
                  variant="caption" 
                  sx={{ color: 'text.secondary', textTransform: 'capitalize' }}
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
  );
};

export default SearchBar;
