import React, { useRef, useState, useEffect } from 'react';
import { Box, Typography, IconButton, Slider, useMediaQuery } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import SkipPreviousIcon from '@mui/icons-material/SkipPrevious';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import { usePlayer } from '../../context/player-context';
import Logo from '../../assets/logo.png';

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

interface MusicPlayerProps {
  song?: Song;
  onPrevPublication?: () => void;
  onNextPublication?: () => void;
}

const MusicPlayer: React.FC<MusicPlayerProps> = ({ onPrevPublication, onNextPublication }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { playlist, playlistIndex, setPlaylistIndex, isPlaying, setIsPlaying } = usePlayer();
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(50);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const currentSong = playlist[playlistIndex];
  const isSmallScreen = useMediaQuery('(max-width: 600px)');

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
    if (audioRef.current && duration && !isNaN(duration)) {
      const seekTime = Math.min((newValue as number / 100) * duration, duration - 0.1); // Evita saltar al final exacto
      audioRef.current.currentTime = seekTime;
      setProgress(newValue as number);
      // Si estaba reproduciendo, sigue reproduciendo
      if (isPlaying) {
        audioRef.current.play();
      }
    }
  };

  const handleVolumeChange = (event: Event, newValue: number | number[]) => {
    if (audioRef.current) {
      const volumeValue = (newValue as number) / 100;
      audioRef.current.volume = volumeValue;
      setVolume(newValue as number);
    }
  };

  // Cambia de publicación (no solo de canción en la playlist)
  const handlePrev = () => {
    if (playlistIndex > 0) {
      setPlaylistIndex(playlistIndex - 1);
      const prevSong = playlist[playlistIndex - 1];
      audioRef.current.src = prevSong.audioSrc;
      audioRef.current.currentTime = 0;

      // Esperar a que el archivo esté listo antes de reproducir
      audioRef.current.addEventListener('canplay', () => {
        setIsPlaying(true);
        audioRef.current.play();
      }, { once: true });

      console.log('Anterior canción en el reproductor:', prevSong);
    } else if (onPrevPublication) {
      onPrevPublication();
      console.log('Pasando a la publicación anterior');
    }
  };

  const handleNext = () => {
    if (playlistIndex < playlist.length - 1) {
      setPlaylistIndex(playlistIndex + 1);
      const nextSong = playlist[playlistIndex + 1];
      audioRef.current.src = nextSong.audioSrc;
      audioRef.current.currentTime = 0;

      // Esperar a que el archivo esté listo antes de reproducir
      audioRef.current.addEventListener('canplay', () => {
        setIsPlaying(true);
        audioRef.current.play();
      }, { once: true });

      console.log('Siguiente canción en el reproductor:', nextSong);
    } else if (onNextPublication) {
      onNextPublication();
      console.log('Pasando a la siguiente publicación');
    }
  };

  useEffect(() => {
    if (audioRef.current && currentSong) {
      audioRef.current.src = currentSong.audioSrc;
      audioRef.current.currentTime = 0;
      setProgress(0);
      setCurrentTime(0);

      // Esperar a que el archivo esté listo antes de reproducir
      audioRef.current.addEventListener('canplay', () => {
        setIsPlaying(true);
        audioRef.current.play();
      }, { once: true });

      console.log('Cargando nueva canción en el reproductor:', currentSong);
    }
  }, [currentSong]);

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play();
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      setProgress((audio.currentTime / (audio.duration || 1)) * 100);
    };

    const handleEnded = () => {
      if (onNextPublication) {
        onNextPublication();
      } else {
        setIsPlaying(false);
      }
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [audioRef, currentSong, onNextPublication]);

  const formatTime = (secs: number) => {
    const minutes = Math.floor(secs / 60);
    const seconds = Math.floor(secs % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  useEffect(() => {
    setProgress(0);
    setCurrentTime(0);
  }, [currentSong]);

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
      <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#307cbe' }}>
        {currentSong ? currentSong.title : 'Ninguna canción cargada'}
      </Typography>
      <Typography variant="subtitle1" sx={{ color: '#307cbe' }}>
        {currentSong ? currentSong.username : ''}
      </Typography>
      <Box 
        component="img" 
        src={currentSong.coverImg || Logo} 
        alt="Portada"
        sx={{ 
          width: '100%',
          aspectRatio: '1/1',
          objectFit: 'cover',
          marginTop: '10px',
          marginX: '-20px',
          maxWidth: 'calc(100% + 40px)',
        }} />
      <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '80%' }}>
        <Typography variant="caption">{formatTime(currentTime)}</Typography>
        <Typography variant="caption">{formatTime(duration)}</Typography>
      </Box>
      <Slider
        value={progress}
        onChange={handleSeek}
        aria-label="Duración"
        sx={{ width: '80%', marginTop: '10px', color: 'white' }}
        disabled={!duration || isNaN(duration)}
      />
      <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 2 } }}>
        <IconButton onClick={handlePrev} sx={{ color: 'white' }}>
          <SkipPreviousIcon fontSize="large" />
        </IconButton>
        <IconButton onClick={handlePlayPause} sx={{ color: 'white' }}>
          {isPlaying ? <PauseIcon fontSize="large" /> : <PlayArrowIcon fontSize="large" />}
        </IconButton>
        <IconButton onClick={handleNext} sx={{ color: 'white' }}>
          <SkipNextIcon fontSize="large" />
        </IconButton>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', width: '80%', marginTop: '10px' }}>
        <VolumeUpIcon />
        <Slider value={volume} onChange={handleVolumeChange} aria-label="Volumen" sx={{ color: 'white' }} />
      </Box>
      <audio ref={audioRef} preload="metadata" />
    </Box>
  );
};

export default MusicPlayer;
