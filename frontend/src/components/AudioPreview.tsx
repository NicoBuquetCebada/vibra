import React, { useState, useRef, useEffect } from 'react';
import { Box, IconButton, Slider } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';

interface AudioPreviewProps {
  audioFile: File;
}

const AudioPreview: React.FC<AudioPreviewProps> = ({ audioFile }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string>();
  const audioRef = useRef<HTMLAudioElement>(null);

  // Crear URL del archivo y limpiarla cuando cambie
  useEffect(() => {
    const url = URL.createObjectURL(audioFile);
    setAudioUrl(url);
    
    // Reset states cuando cambia el archivo
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [audioFile]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !audioUrl) return;

    const handleLoadedMetadata = () => {
      setDuration(audio.duration || 0);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    const handlePause = () => {
      setIsPlaying(false);
    };

    const handlePlay = () => {
      setIsPlaying(true);
    };

    const handleError = () => {
      setIsPlaying(false);
    };

    const handleCanPlay = () => {
      // Audio is ready to play
    };

    // Add all event listeners
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('error', handleError);
    audio.addEventListener('canplay', handleCanPlay);

    // Force load the audio
    audio.load();

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('canplay', handleCanPlay);
    };
  }, [audioUrl]);

  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }

    try {
      if (isPlaying) {
        audio.pause();
      } else {
        // Ensure audio is ready
        if (audio.readyState < 3) {
          audio.load();
          await new Promise(resolve => {
            audio.addEventListener('canplay', resolve, { once: true });
          });
        }
        
        const playPromise = audio.play();
        if (playPromise !== undefined) {
          await playPromise;
        }
      }
    } catch (error) {
      setIsPlaying(false);
    }
  };

  const handleSliderChange = (_: Event, newValue: number | number[]) => {
    const audio = audioRef.current;
    if (!audio) return;

    const time = Array.isArray(newValue) ? newValue[0] : newValue;
    audio.currentTime = time;
    setCurrentTime(time);
  };

  const formatTime = (time: number) => {
    if (!time || !isFinite(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        backgroundColor: '#fff',
        borderRadius: 2,
        padding: 2,
        border: '1px solid rgba(48, 124, 190, 0.1)',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
      }}
    >
      <audio
        ref={audioRef}
        src={audioUrl}
        preload="metadata"
        style={{ display: 'none' }}
      />
      
      <IconButton
        onClick={togglePlay}
        disabled={!audioUrl}
        sx={{
          backgroundColor: '#307cbe',
          color: 'white',
          width: 40,
          height: 40,
          '&:hover': {
            backgroundColor: '#145a96',
          },
          '&:disabled': {
            backgroundColor: '#ccc',
            color: '#666',
          },
        }}
      >
        {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
      </IconButton>

      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
        <Slider
          value={currentTime}
          max={duration || 100}
          onChange={handleSliderChange}
          disabled={!duration}
          sx={{
            height: 6,
            '& .MuiSlider-track': {
              backgroundColor: '#307cbe',
              border: 'none',
            },
            '& .MuiSlider-rail': {
              backgroundColor: 'rgba(48, 124, 190, 0.2)',
            },
            '& .MuiSlider-thumb': {
              backgroundColor: '#307cbe',
              width: 16,
              height: 16,
              '&:hover': {
                boxShadow: '0 0 0 8px rgba(48, 124, 190, 0.16)',
              },
            },
          }}
        />
        
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '0.75rem',
            color: 'text.secondary',
          }}
        >
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </Box>
      </Box>
    </Box>
  );
};

export default AudioPreview;