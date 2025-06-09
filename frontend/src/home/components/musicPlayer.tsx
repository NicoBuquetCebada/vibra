/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { } from 'react';
import { Box, Typography, IconButton, Slider } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import SkipPreviousIcon from '@mui/icons-material/SkipPrevious';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import { usePlayer } from '../../context/player-context';
import Logo from '../../assets/logo.png';

interface MusicPlayerProps {
  onPrevPublication?: () => void;
  onNextPublication?: () => void;
  mobileBar?: boolean; // Añadido para permitir el diseño móvil desde fuera
}

const MusicPlayer: React.FC<MusicPlayerProps> = ({
  onPrevPublication,
  onNextPublication,
  //mobileBar,
}) => {
  const {
    playlist,
    playlistIndex,
    setPlaylistIndex,
    isPlaying,
    setIsPlaying,
    globalAudioRef,
    currentTime,
    duration,
    progress,
    volume,
    setVolume,
  } = usePlayer();

  const currentSong = playlist[playlistIndex];

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (event: Event, newValue: number | number[]) => {
	event;
    if (globalAudioRef.current && duration && !isNaN(duration)) {
      const seekTime = Math.min((newValue as number / 100) * duration, duration - 0.1);
      globalAudioRef.current.currentTime = seekTime;
    }
  };

  const handleVolumeChange = (event: Event, newValue: number | number[]) => {
	event;
    setVolume(newValue as number);
  };

  const handlePrev = () => {
    // ✅ Si la canción lleva más de 2 segundos, reiniciar desde el principio
    if (currentTime > 2) {
      if (globalAudioRef.current) {
        globalAudioRef.current.currentTime = 0;
      }
    } else {
      // ✅ Si lleva menos de 2 segundos, ir a la canción anterior
      if (playlistIndex > 0) {
        setPlaylistIndex(playlistIndex - 1);
      } else if (onPrevPublication) {
        onPrevPublication();
      }
    }
  };

  const handleNext = () => {
    if (playlistIndex < playlist.length - 1) {
      setPlaylistIndex(playlistIndex + 1);
    } else if (onNextPublication) {
      onNextPublication();
    }
  };

  const formatTime = (secs: number) => {
    const minutes = Math.floor(secs / 60);
    const seconds = Math.floor(secs % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  if (!currentSong) {
    return (
      <Box
        sx={{
          width: '100%',
          backgroundColor: '#f5f5f5',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2,
          padding: { xs: '8px 4px', sm: '20px' },
          minHeight: { xs: 140, sm: 220 }, // Igual altura mínima que el reproductor con canción
          boxSizing: 'border-box',
        }}
      >
        <Typography 
          variant="h5" 
          sx={{ 
            color: '#307cbe',
            fontWeight: 'bold',
            textAlign: 'center',
            fontSize: { xs: 14, sm: 18 }
          }}
        >
          Reproductor
        </Typography>
        <Box
          component="img"
          src={Logo}
          alt="Logo Vibra"
          sx={{
            width: { xs: 48, sm: 80, md: '100%' },
            height: { xs: 48, sm: 80, md: 'auto' },
            aspectRatio: '1/1',
            objectFit: 'cover',
            opacity: 0.8,
            marginY: 1,
            maxWidth: { xs: 48, sm: 80, md: 'calc(100% + 40px)' },
            borderRadius: 2,
          }}
        />
        <Typography 
          variant="body1" 
          sx={{ 
            color: '#307cbe',
            textAlign: 'center',
            maxWidth: '80%',
            lineHeight: 1.6,
            fontSize: { xs: 12, sm: 14 }
          }}
        >
          ¡Pulse cualquier publicación para reproducir su música!
        </Typography>
      </Box>
    );
  }

  // Render siempre el reproductor grande, sin condicional por pantalla
  return (
    <Box
      sx={{
        width: { xs: '100%', sm: '100%' },
        backgroundColor: '#f5f5f5',
        color: '#307cbe',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: { xs: '8px 4px', sm: '20px' }, // Menos padding en móvil
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
      <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#307cbe', fontSize: { xs: 14, sm: 18 } }}>
        {currentSong.title}
      </Typography>
      <Typography variant="subtitle1" sx={{ color: '#307cbe', fontSize: { xs: 12, sm: 16 } }}>
        {currentSong.username}
      </Typography>
      <Box 
        component="img" 
        src={currentSong.coverImg || Logo} 
        alt="Portada"
        sx={{ 
          width: { xs: 48, sm: 80, md: '100%' }, // Más pequeño en móvil
          height: { xs: 48, sm: 80, md: 'auto' },
          aspectRatio: '1/1',
          objectFit: 'cover',
          marginTop: { xs: 0, md: '10px' },
          marginX: { xs: 0, md: '-20px' },
          maxWidth: { xs: 48, sm: 80, md: 'calc(100% + 40px)' },
          borderRadius: 2,
        }} 
      />
      <Box sx={{ display: 'flex', justifyContent: 'space-between', width: { xs: '90%', sm: '80%' } }}>
        <Typography variant="caption">{formatTime(currentTime)}</Typography>
        <Typography variant="caption">{formatTime(duration)}</Typography>
      </Box>
      <Slider
        value={progress}
        onChange={handleSeek}
        aria-label="Duración"
        sx={{ width: { xs: '90%', sm: '80%' }, marginTop: '10px', color: 'white' }}
        disabled={!duration || isNaN(duration)}
      />
      <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, sm: 2 } }}>
        <IconButton onClick={handlePrev} sx={{ color: 'white' }}>
          <SkipPreviousIcon fontSize="medium" />
        </IconButton>
        <IconButton onClick={handlePlayPause} sx={{ color: 'white' }}>
          {isPlaying ? <PauseIcon fontSize="medium" /> : <PlayArrowIcon fontSize="medium" />}
        </IconButton>
        <IconButton onClick={handleNext} sx={{ color: 'white' }}>
          <SkipNextIcon fontSize="medium" />
        </IconButton>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', width: { xs: '90%', sm: '80%' }, marginTop: '10px' }}>
        <VolumeUpIcon sx={{ fontSize: { xs: 18, sm: 24 } }} />
        <Slider value={volume} onChange={handleVolumeChange} aria-label="Volumen" sx={{ color: 'white' }} />
      </Box>
    </Box>
  );
};

export default MusicPlayer;
