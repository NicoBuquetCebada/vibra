import React, { useRef, forwardRef, useState, useEffect } from 'react';
import { Card, IconButton, Box, Typography, Avatar } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import Rate from './rate';
import RepostButton from './repost';
import SaveButton from './save';
import Logo from '../../login/compents/utiles/LogoConOndasSinFondo.png';
import { usePlayer } from '../../context/player-context';

interface Song {
  id: number;
  title: string;
  audioSrc: string;
  profilePic: string;
  username: string;
  coverImg?: string;
}

interface SongCardProps {
  song: Song;
}

const SongCard = forwardRef<HTMLDivElement, SongCardProps>(({ song }, ref) => {
  const { setCurrentSong } = usePlayer(); // Accede al contexto del reproductor
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [hover, setHover] = useState(false);

  useEffect(() => {
    console.log(`Canción ID ${song.id}:`, song);
  }, [song]);

  const handlePlay = () => {
    // eslint-disable-next-line no-debugger
    console.log(`Reproduciendo canción desde SongCard: ${song.title} (${song.audioSrc})`);
    setCurrentSong(song); // Actualiza la canción actual en el contexto
  };

  return (
    <Card
      ref={ref}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      sx={{
        width: { xs: '90vw', sm: '90%', md: '90%', }, // En móviles ocupa todo el ancho de la pantalla
        height: { xs: '85vh', md: '600px' }, // En móviles ocupa toda la altura de la pantalla
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '10px',
        boxShadow: 3,
        borderRadius: { xs: 0, md: 3 }, // Sin bordes en móviles
        position: 'relative',
        overflow: 'hidden',
        cursor: 'pointer',
        margin: { xs: 0, md: '0 auto' }, // Sin margen en móviles
      }}
    >
      {/* Parte superior izquierda (Artista y título) */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
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
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          width: '100%',
          height: { xs: '70%', md: '250px' }, // En móviles ocupa el 70% de la pantalla
        }}
      >
        <Box
          component="img"
          src={song.coverImg || Logo}
          alt="Portada de la canción"
          sx={{
            width: '100%',
            height: '100%',
            objectFit: 'cover', // Ajusta la imagen para que se vea bien
            borderRadius: { xs: 0, md: 2 }, // Sin bordes en móviles
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
        <Rate />
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
            width: '100%',
            gap: 0,
          }}
        >
          <RepostButton />
          <SaveButton />
        </Box>
      </Box>

      {/* Audio */}
      <audio ref={audioRef} src={song.audioSrc} preload="metadata" />
    </Card>
  );
});

export default SongCard;