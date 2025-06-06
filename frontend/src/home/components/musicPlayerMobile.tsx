/* eslint-disable @typescript-eslint/no-unused-vars */
import React from 'react';
import { Box, Typography, IconButton, Slider, Avatar } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import SkipPreviousIcon from '@mui/icons-material/SkipPrevious';
import { usePlayer } from '../../context/player-context';
import Logo from '../../assets/logo.png';

interface MusicMobilePlayerProps {
  onPrevPublication?: () => void;
  onNextPublication?: () => void;
}

const MusicMobilePlayer: React.FC<MusicMobilePlayerProps> = ({
  onPrevPublication,
  onNextPublication,
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
    //progress,
    // Añade volume y setVolume para igualar la API del otro componente
    //volume,
    //setVolume,
  } = usePlayer();

  const currentSong = playlist[playlistIndex];

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (_: Event, newValue: number | number[]) => {
    if (globalAudioRef.current && duration && !isNaN(duration)) {
      const seekTime = Math.min((newValue as number / 100) * duration, duration - 0.1);
      globalAudioRef.current.currentTime = seekTime;
    }
  };

  const handlePrev = () => {
    if (playlistIndex > 0) {
      setPlaylistIndex(playlistIndex - 1);
    } else if (onPrevPublication) {
      onPrevPublication();
    }
  };

  const handleNext = () => {
    if (playlistIndex < playlist.length - 1) {
      setPlaylistIndex(playlistIndex + 1);
    } else if (onNextPublication) {
      onNextPublication();
    }
  };

  // Añade el control de volumen para igualar la API
  /* const handleVolumeChange = (_: Event, newValue: number | number[]) => {
    setVolume(newValue as number);
  }; */

  const formatTime = (secs: number) => {
    const minutes = Math.floor(secs / 60);
    const seconds = Math.floor(secs % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  if (!currentSong) {
    return null;
  }

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '64px',
        background: 'linear-gradient(90deg, #307cbe 0%, #1e5a96 100%)',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        px: 1.5,
        zIndex: 2100,
        boxShadow: '0 2px 12px rgba(0,0,0,0.10)',
      }}
    >
      <Avatar
        src={currentSong.coverImg || Logo}
        variant="rounded"
        sx={{ width: 44, height: 44, mr: 1.5, boxShadow: 2 }}
      />
      <Box sx={{ flex: 1, minWidth: 0, mr: 1 }}>
        <Typography
          variant="subtitle2"
          sx={{
            color: 'white',
            fontWeight: 600,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            fontSize: '1rem',
          }}
        >
          {currentSong.title}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
          <Typography variant="caption" sx={{ color: 'white', minWidth: 32 }}>
            {formatTime(currentTime)}
          </Typography>
          <Slider
            size="small"
            value={duration ? (currentTime / duration) * 100 : 0}
            onChange={handleSeek}
            sx={{
              mx: 1,
              color: 'white',
              '& .MuiSlider-thumb': { display: 'none' },
              flex: 1,
              height: 2,
            }}
          />
          <Typography variant="caption" sx={{ color: 'white', minWidth: 32 }}>
            {formatTime(duration)}
          </Typography>
        </Box>
      </Box>
      <IconButton onClick={handlePrev} sx={{ color: 'white' }}>
        <SkipPreviousIcon />
      </IconButton>
      <IconButton onClick={handlePlayPause} sx={{ color: 'white' }}>
        {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
      </IconButton>
      <IconButton onClick={handleNext} sx={{ color: 'white' }}>
        <SkipNextIcon />
      </IconButton>
    </Box>
  );
};

export default MusicMobilePlayer;