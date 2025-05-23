import React, { useRef, useState, useEffect } from 'react';
import { Box, Typography, IconButton, Slider, useMediaQuery } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import SkipPreviousIcon from '@mui/icons-material/SkipPrevious';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import { usePlayer } from '../../context/player-context';
import Logo from '../../login/compents/utiles/LogoConOndasSinFondo.png';

interface Song {
  id: number;
  title: string;
  audioSrc: string;
  profilePic: string;
  username: string;
  coverImg?: string;
  description: string;
  likes: number;
  comments: number;
  shares: number;
}

// MusicPlayer espera una prop song, pero realmente usa el contexto. Vamos a hacerla opcional.
interface MusicPlayerProps {
  song?: Song; // Ahora es opcional
}

const MusicPlayer: React.FC<MusicPlayerProps> = ({ song }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(50);
  const { currentSong } = usePlayer(); // Accede a la canción actual desde el contexto

  const isSmallScreen = useMediaQuery('(max-width: 600px)'); // Detectar tamaño de pantalla

  const handlePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleSeek = (event: Event, newValue: number | number[]) => {
    if (audioRef.current) {
      const seekTime = (newValue as number / 100) * audioRef.current.duration; // Calcula el tiempo al que se debe mover
      audioRef.current.currentTime = seekTime; // Actualiza el tiempo actual del audio
      setProgress(newValue as number); // Actualiza el progreso en el estado
      console.log(`Progreso actualizado: ${newValue}%`);
    }
  };

  const handleVolumeChange = (event: Event, newValue: number | number[]) => {
    if (audioRef.current) {
      const volumeValue = (newValue as number) / 100; // Normaliza el volumen entre 0 y 1
      audioRef.current.volume = volumeValue; // Actualiza el volumen del audio
      setVolume(newValue as number); // Actualiza el volumen en el estado
      console.log(`Volumen actualizado: ${newValue}%`);
    }
  };

  useEffect(() => {
    if (audioRef.current && currentSong) {
        audioRef.current.src = currentSong.audioSrc; // Actualiza la fuente del audio
        console.log(`Canción cargada en el reproductor: ${currentSong.title} (${currentSong.audioSrc})`);
        if (isPlaying) {
          audioRef.current.play();
          setIsPlaying(true);
          console.log('Reproduciendo automáticamente la nueva canción');
        
      } else {
        console.log('No hay ninguna canción cargada en el reproductor');
      }
    }
  }, [song, isPlaying, currentSong]);

  useEffect(() => {
    // Efecto para manejar cambios en el estado de reproducción
  }, [song, isPlaying]);

  if (!currentSong) {
    return (
      <Box
        sx={{
          width: '100%',
          height: '100%',
          backgroundColor: '#f5f5f5',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 3,
          padding: '20px',
        }}
      >
        <Typography 
          variant="h5" 
          sx={{ 
            color: '#307cbe',
            fontWeight: 'bold',
            textAlign: 'center'
          }}
        >
          Reproductor
        </Typography>
        
        <Box
          component="img"
          src={Logo}
          alt="Logo Vibra"
          sx={{
            width: '50%',
            maxWidth: '200px',
            height: 'auto',
            opacity: 0.8
          }}
        />

        <Typography 
          variant="body1" 
          sx={{ 
            color: '#307cbe',
            textAlign: 'center',
            maxWidth: '80%',
            lineHeight: 1.6
          }}
        >
          Pulse el botón de play en una publicación para reproducir música!
        </Typography>
      </Box>
    );
  }

  return isSmallScreen ? (
    /* 🔹 Vista móvil: barra superior */
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        backgroundColor: '#145a96',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px',
        boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.3)',
        zIndex: 1000,
      }}
    >
      <Typography variant="subtitle1" fontWeight="bold">{currentSong ? currentSong.title : 'Ninguna canción cargada'}</Typography>
      <IconButton onClick={handlePlayPause} sx={{ color: 'white' }}>
        {isPlaying ? <PauseIcon fontSize="large" /> : <PlayArrowIcon fontSize="large" />}
      </IconButton>
      <audio ref={audioRef} preload="metadata" />
    </Box>
  ) : (
    /* 🔹 Vista escritorio: reproductor completo */
    <Box
      sx={{
        width: { xs: '100%', sm: '100%' },
        backgroundColor: '#f5f5f5',
        color: '#307cbe',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '20px',
        '& .MuiIconButton-root': {
          color: '#307cbe',
          '&:hover': {
            backgroundColor: 'rgba(48, 124, 190, 0.1)',
          }
        },
        '& .MuiSlider-root': {
          color: '#307cbe',
          '& .MuiSlider-thumb': {
            backgroundColor: '#307cbe',
            '&:hover': {
              backgroundColor: '#145a96'
            }
          },
          '& .MuiSlider-track': {
            backgroundColor: '#307cbe'
          },
          '& .MuiSlider-rail': {
            backgroundColor: 'rgba(48, 124, 190, 0.3)'
          }
        },
      }}
    >
      {/* 🔹 Información de la canción */}
      <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#307cbe' }}>
        {currentSong ? currentSong.title : 'Ninguna canción cargada'}
      </Typography>
      <Typography variant="subtitle1" sx={{ color: '#307cbe' }}>
        {song ? song.username : ''}
      </Typography>

      {/* 🔹 Imagen de portada */}
      <Box 
        component="img" 
        src={currentSong.coverImg || Logo} 
        alt="Portada"
        sx={{ 
          width: '100%',
          aspectRatio: '1/1',
          objectFit: 'cover',
          marginTop: '10px',
          marginX: '-20px', // Compensar el padding del contenedor
          maxWidth: 'calc(100% + 40px)', // Asegurar que llegue de lado a lado
        }} />

      {/* 🔹 Slider para duración */}
      <Slider value={progress} onChange={handleSeek} aria-label="Duración" sx={{ width: '80%', marginTop: '10px', color: 'white' }} />

      {/* 🔹 Controles de reproducción */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 2 } }}>
        <IconButton sx={{ color: 'white' }}><SkipPreviousIcon fontSize="large" /></IconButton>
        <IconButton onClick={handlePlayPause} sx={{ color: 'white' }}>
          {isPlaying ? <PauseIcon fontSize="large" /> : <PlayArrowIcon fontSize="large" />}
        </IconButton>
        <IconButton sx={{ color: 'white' }}><SkipNextIcon fontSize="large" /></IconButton>
      </Box>

      {/* 🔹 Slider para volumen */}
      <Box sx={{ display: 'flex', alignItems: 'center', width: '80%', marginTop: '10px' }}>
        <VolumeUpIcon />
        <Slider value={volume} onChange={handleVolumeChange} aria-label="Volumen" sx={{ color: 'white' }} />
      </Box>

      <audio ref={audioRef} preload="metadata" />
    </Box>
  );
};

export default MusicPlayer;
