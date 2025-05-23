import React, { useRef, forwardRef, useState } from 'react';
import { Card, IconButton, Box, Typography, Avatar } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import Rate from './rate';
import RepostButton from './repost';
import SaveButton from './save';
import Logo from '../../login/compents/utiles/LogoConOndasSinFondo.png';
import { usePlayer } from '../../context/player-context';
import { useNavigate } from 'react-router-dom';

interface Song {
  id: number;
  title: string;
  audioSrc: string;
  profilePic: string;
  username: string;
  coverImg?: string;
  postId: number;
}

interface SongCardProps {
  song: Song;
  repostUser?: { name: string; profileImg: string };
  isRepost?: boolean;
}

const SongCard = forwardRef<HTMLDivElement, SongCardProps>(({ song, repostUser, isRepost }, ref) => {
  const { setCurrentSong } = usePlayer();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [hover, setHover] = useState(false);
  const navigate = useNavigate();

  const handlePlay = () => {
    setCurrentSong(song);
  };

  return (
    <Card
      ref={ref}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      sx={{
        width: { xs: '95vw', sm: '400px', md: '400px' }, // Modal más estrecha
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
      {/* Si es repost, mostrar el repostUser encima del user, casi sin separación */}
      {isRepost && repostUser && (
        <>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0, mt: 0 }}>
            <Avatar src={repostUser.profileImg} alt={repostUser.name} sx={{ width: 28, height: 28 }} />
            <Typography variant="caption" color="text.secondary">
              {repostUser.name} ha hecho repost
            </Typography>
          </Box>
          <Box sx={{ borderBottom: '1px solid #e0e0e0', width: '100%', mb: 0, mt: 0 }} />
        </>
      )}

      {/* Parte superior izquierda (Artista y título) */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 0, mb: 0 }}>
        <Avatar src={song.profilePic} alt={song.username} />
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <Typography variant="subtitle1" fontWeight="bold" color="text.primary">
            {song.username}
          </Typography>
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
            "&:hover": { background: "#145a96", color: "white" },
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
});

export default SongCard;