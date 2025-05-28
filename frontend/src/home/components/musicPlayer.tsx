import React, { useEffect } from 'react';
import { Box, Typography, useMediaQuery } from '@mui/material';
import AudioPlayer from 'react-h5-audio-player';
import 'react-h5-audio-player/lib/styles.css';
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
}

const MusicPlayer: React.FC<MusicPlayerProps> = () => {
  const {
    currentSong,
    playlist,
    playlistIndex,
    setPlaylistIndex,
    setCurrentSong,
  } = usePlayer();

  const isSmallScreen = useMediaQuery('(max-width: 600px)');

  // Cambia la canción cuando cambia el índice de la playlist
  useEffect(() => {
    if (playlist.length > 0 && playlist[playlistIndex]) {
      setCurrentSong(playlist[playlistIndex]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playlistIndex]);

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
            textAlign: 'center',
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
            opacity: 0.8,
          }}
        />
        <Typography
          variant="body1"
          sx={{
            color: '#307cbe',
            textAlign: 'center',
            maxWidth: '80%',
            lineHeight: 1.6,
          }}
        >
          Pulse el botón de play en una publicación para reproducir música!
        </Typography>
      </Box>
    );
  }

  // Handlers para siguiente/anterior
  const handleClickNext = () => {
    if (playlist.length > 0 && playlistIndex < playlist.length - 1) {
      setPlaylistIndex(playlistIndex + 1);
    }
  };

  const handleClickPrevious = () => {
    if (playlist.length > 0 && playlistIndex > 0) {
      setPlaylistIndex(playlistIndex - 1);
    }
  };

  return (
    <Box
      sx={{
        width: { xs: '100%', sm: '100%' },
        backgroundColor: '#f5f5f5',
        color: '#307cbe',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '20px',
      }}
    >
      <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#307cbe' }}>
        {currentSong.title}
      </Typography>
      <Typography variant="subtitle1" sx={{ color: '#307cbe' }}>
        {currentSong.username}
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
        }}
      />
      <Box sx={{ width: '100%', mt: 2 }}>
        <AudioPlayer
          src={currentSong.audioSrc}
          showSkipControls={playlist.length > 0}
          showJumpControls={false}
          onClickPrevious={handleClickPrevious}
          onClickNext={handleClickNext}
          onEnded={handleClickNext}
          autoPlayAfterSrcChange={true}
          style={{
            background: '#f5f5f5',
            color: '#307cbe',
            borderRadius: 8,
            boxShadow: 'none',
          }}
          customAdditionalControls={[]}
          customVolumeControls={[]}
        />
      </Box>
    </Box>
  );
};

export default MusicPlayer;
