import React, { useRef, forwardRef, useState, useContext } from 'react';
import { Card, IconButton, Box, Typography, Avatar } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import Rate from './rate';
import RepostButton from './repost';
import SaveButton from './save';
import Logo from '../../assets/logo.png';
import { usePlayer } from '../../context/player-context';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/auth-context'; // Importa el contexto

interface Song {
  id: number;
  title: string;
  audioSrc: string;
  profilePic: string;
  username: string;
  coverImg?: string;
  postId: number;
  type?: string; // 'song' o 'album'
  albumSongs?: { name: string; audio: string }[]; // <-- Añade esto
}

export interface SongCardProps {
  song: Song; // o el tipo que uses
  onUserClick?: () => void;
  isRepost?: boolean;
  repostUser?: { name: string; profileImg: string };
  onRepostUserClick?: () => void;
  onPlay?: () => void; // NUEVO: callback para play externo
}

const SongCard = forwardRef<HTMLDivElement, SongCardProps>(
  ({ song, repostUser, isRepost, onPlay }, ref) => {
    const {setPlaylist, setPlaylistIndex } = usePlayer();
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [hover, setHover] = useState(false);
    const navigate = useNavigate();
    const authContext = useContext(AuthContext);

    // Usuario autenticado
    const authenticatedUser = authContext?.user?.name;

    // Handler para el usuario del post
    const handleUserClick = () => {
      if (authenticatedUser && song.username === authenticatedUser) {
        navigate('/profile');
      } else {
        navigate(`/profile/${song.username}`);
      }
    };

    // Handler para el usuario del repost
    const handleRepostUserClick = () => {
      if (authenticatedUser && repostUser && repostUser.name === authenticatedUser) {
        navigate('/profile');
      } else if (repostUser) {
        navigate(`/profile/${repostUser.name}`);
      }
    };

    const handlePlay = () => {
      if (onPlay) {
        onPlay(); // Si viene de Home, controla el flujo global
        return;
      }
      if (song.type === 'album' && Array.isArray(song.albumSongs) && song.albumSongs.length > 0) {
        // Mapea las canciones del álbum al formato Song
          console.log('[SongCard AlbumSongs]', song.albumSongs);

        const playlist = song.albumSongs.map((track, idx) => ({
          id: idx,
          title: track.name,
          audioSrc: track.audio,
          profilePic: song.profilePic,
          username: song.username,
          coverImg: song.coverImg,
          postId: song.postId,
          type: 'album'
        }));
        setPlaylist(playlist);      // <-- solo el array
        setPlaylistIndex(0);        // <-- selecciona la primera canción
      } else {
        setPlaylist([song]);        // <-- playlist de una sola canción
        setPlaylistIndex(0);
      }
    };

    return (
      <Card
        ref={ref}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        sx={{
          width: { xs: '95vw', sm: '400px', md: '400px' },
          height: { xs: '85vh', md: '540px' },
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '10px',
          boxShadow: 3,
          borderRadius: { xs: 0, md: 3 },
          position: 'relative',
          overflow: 'hidden',
          cursor: 'pointer',
          margin: { xs: 0, md: '0 auto' },
        }}
      >
        {/* Si es repost, mostrar el repostUser encima del user */}
        {isRepost && repostUser && (
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Avatar
              src={repostUser.profileImg}
              sx={{ width: 28, height: 28, mr: 1, cursor: 'pointer' }}
              // onClick={handleRepostUserClick}
            />
            <Typography
              variant="caption"
              sx={{ color: '#307cbe', cursor: 'pointer', fontWeight: 500 }}
              onClick={handleRepostUserClick}
            >
              {repostUser.name} ha hecho repost
            </Typography>
          </Box>
        )}

        {/* Parte superior izquierda (Artista y título) */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 0, mb: 0, position: 'relative' }}>
          {/* Tipo de publicación en la esquina superior derecha */}
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              right: 0,
              background: song.audioSrc && song.audioSrc !== '' && song.title ? '#307cbe' : '#aaa',
              color: 'white',
              px: 1.5,
              py: 0.5,
              borderRadius: '0 0 0 8px',
              fontSize: 12,
              fontWeight: 600,
              zIndex: 20,
            }}
          >
            {song.audioSrc && song.audioSrc !== '' && song.title?.toLowerCase().includes('album')
              ? 'Álbum'
              : 'Canción'}
          </Box>
          <Avatar
            src={song.profilePic}
            sx={{ cursor: 'pointer' }}
            // onClick={handleUserClick}
          />
          <Typography
            variant="subtitle2"
            sx={{ cursor: 'pointer', color: '#307cbe' }}
            onClick={handleUserClick}
          >
            {song.username}
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <Typography variant="body2" color="text.secondary">
              {song.title}
            </Typography>
          </Box>
        </Box>

        {/* Imagen de portada */}
        <Box
          sx={{
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            my: 1,
          }}
        >
          <Box
            component="img"
            src={song.coverImg || Logo}
            alt="Portada de la canción"
            sx={{
              width: '100%',
              maxWidth: '350px',
              aspectRatio: '1/1',
              objectFit: 'cover',
              borderRadius: { xs: 0, md: 2 },
              boxShadow: 2,
            }}
          />
        </Box>

        {/* Parte inferior derecha (Botón de play e impresiones) */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            gap: 1,
            transition: 'margin-bottom 0.4s ease-in-out',
            marginBottom: hover ? '60px' : '0px',
          }}
        >
          <IconButton
            onClick={handlePlay}
            sx={{
              padding: 0,
              width: '45px',
              height: '45px',
              "&:hover": { 
                background: "#145a96", 
                color: "white" 
              },
              zIndex: 10, // Siempre visible en móviles
            }}
          >
            <PlayArrowIcon fontSize="large" />
          </IconButton>
          <Typography variant="caption" color="white">
            Impresiones: 1234
          </Typography>
        </Box>

        {/* Caja interactiva que aparece desde abajo en hover */}
        <Box
          sx={{
            position: { xs: 'relative', md: 'absolute' }, // En móviles, posición relativa para que siempre sea visible
            bottom: { xs: '0px', md: hover ? '10px' : '-70px' }, // En móviles, siempre visible en la parte inferior
            left: '10px',
            right: '10px',
            borderRadius: 2,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '8px',
            transition: { xs: 'none', md: 'bottom 0.4s ease-in-out, opacity 0.4s ease-in-out' }, // Sin transición en móviles
            opacity: { xs: 1, md: hover ? 1 : 0 },
            zIndex: 10 // Siempre visible en móviles
          }}
        >
          <Rate postId={song.postId} />
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'flex-end',
              alignItems: 'center',
              width: '100%',
              gap: 0,
            }}
          >
            <RepostButton postId={song.postId} />
            <SaveButton postId={song.postId} />
          </Box>
        </Box>

        {/* Audio */}
        <audio ref={audioRef} src={song.audioSrc} preload="metadata" />
      </Card>
    );
  }
);

export default SongCard;

// En tu función de mapeo para SongCard:
