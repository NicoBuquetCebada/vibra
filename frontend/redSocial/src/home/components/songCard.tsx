import React, { useState, useRef, useEffect, forwardRef } from 'react';
import { Card, CardContent, IconButton, Box, Typography, Avatar, Slider } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import StopIcon from '@mui/icons-material/Stop';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import ShareIcon from '@mui/icons-material/Share';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';

interface Song {
  id: number;
  title: string;
  audioSrc: string;
  profilePic: string;
  username: string;
  description: string;
  likes: number;
  comments: number;
  shares: number;
}

const SongCard = forwardRef<HTMLDivElement, { song: Song }>(( { song }, ref) => {
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const setAudioDuration = () => {
        if (audio.duration && !isNaN(audio.duration)) {
          setDuration(audio.duration);
          console.log("Duración establecida:", audio.duration); // ✅ Depuración
        }
      };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', setAudioDuration);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', setAudioDuration);
    };
  }, []);

  const handleSeek = (_: any, value: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = value;
      setCurrentTime(value);
    }
  };

  const handlePlay = () => audioRef.current?.play();
  const handlePause = () => audioRef.current?.pause();
  const handleStop = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setCurrentTime(0);
    }
  };

  return (
    <Card sx={{ width: '98%', maxWidth: 'none', display: 'flex', flexDirection: 'column', padding: '10px' }} ref={ref}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Avatar src={song.profilePic} alt={song.username} />
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>{song.username}</Typography>
          <Typography variant="body2" sx={{ color: 'gray' }}>{song.description}</Typography>
        </Box>
      </Box>

      <CardContent sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 1 }}>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton onClick={handlePlay}><PlayArrowIcon /></IconButton>
          <IconButton onClick={handlePause}><PauseIcon /></IconButton>
          <IconButton onClick={handleStop}><StopIcon /></IconButton>
        </Box>
        <Typography variant="h6">{song.title}</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton><ChatBubbleOutlineIcon /><Typography variant="caption">{song.comments}</Typography></IconButton>
          <IconButton><ShareIcon /><Typography variant="caption">{song.shares}</Typography></IconButton>
          <IconButton><FavoriteBorderIcon /><Typography variant="caption">{song.likes}</Typography></IconButton>
        </Box>
      </CardContent>

      <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', gap: 1 }}>
        <audio ref={audioRef} src={song.audioSrc} preload="metadata" />
        <Typography variant="caption">{Math.floor(currentTime)}s</Typography>
        <Slider value={currentTime} min={0} max={duration} onChange={handleSeek} sx={{ flexGrow: 1 }} />
        <Typography variant="caption">{Math.floor(duration)}s</Typography>
      </Box>
    </Card>
  );
});

export default SongCard;
