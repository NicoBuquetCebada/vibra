/* eslint-disable @typescript-eslint/no-unused-vars */
import { useRef, forwardRef, useState, useContext } from 'react';
import { Card, IconButton, Box, Typography, Avatar, Chip, Badge, Tooltip, Stack } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import Rate from './rate';
import RepostButton from './repost';
import SaveButton from './save';
import Logo from '../../assets/logo.png';
import { usePlayer } from '../../context/player-context';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/auth-context';
import AlbumIcon from '@mui/icons-material/Album';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import DeleteIcon from '@mui/icons-material/Delete';

interface Song {
  id: number;
  title: string;
  audioSrc: string;
  profilePic: string;
  username: string;
  coverImg?: string;
  postId: number;
  type?: string;
  // ✅ CORREGIR: Usar la estructura real de los datos
  albumSongs?: {
    id: number;
    title: string; // Era 'name' pero en realidad es 'title'
    audioSrc: string; // Era 'audio' pero en realidad es 'audioSrc'
    profilePic: string;
    username: string;
    coverImg?: string;
    postId: number;
    type: string;
  }[];
}

export interface SongCardProps {
  song: Song;
  onUserClick?: () => void;
  isRepost?: boolean;
  repostUser?: { name: string; profileImg: string };
  onRepostUserClick?: () => void;
  onPlay?: () => void;
  onSaveChange?: () => void;
  onRateChange?: () => void;
  userRate?: number | null;
  isSaved?: boolean;
  isReposted?: boolean;
  onRate?: (rate: number) => void;
  onSave?: () => void;
  onRepost?: () => void;
  // ✅ Agregar props para borrar
  canDelete?: boolean;
  onDelete?: () => void;
}

const SongCard = forwardRef<HTMLDivElement, SongCardProps>(
  (
    {
      song,
      repostUser,
      isRepost,
      onPlay,
      //onSaveChange,
      //onRateChange,
      userRate,
      isSaved,
      isReposted,
      onRate,
      onSave,
      onRepost,
      canDelete, // ✅ Nueva prop
      onDelete,  // ✅ Nueva prop
    },
    ref
  ) => {
    const { setPlaylist, setPlaylistIndex } = usePlayer();
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [hover, setHover] = useState(false);
    const navigate = useNavigate();
    const authContext = useContext(AuthContext);

    const authenticatedUser = authContext?.user?.name;

    const handleUserClick = () => {
      if (authenticatedUser && song.username === authenticatedUser) {
        navigate('/profile');
      } else {
        navigate(`/profile/${song.username}`);
      }
    };

    const handleRepostUserClick = () => {
      if (authenticatedUser && repostUser && repostUser.name === authenticatedUser) {
        navigate('/profile');
      } else if (repostUser) {
        navigate(`/profile/${repostUser.name}`);
      }
    };

    const handlePlay = () => {
      if (onPlay) {
        onPlay();
        return;
      }
      if (song.type === 'album' && Array.isArray(song.albumSongs) && song.albumSongs.length > 0) {
        const playlist = song.albumSongs.map((track, idx) => ({
          id: idx,
          title: track.title,
          audioSrc: track.audioSrc,
          profilePic: song.profilePic,
          username: song.username,
          coverImg: song.coverImg,
          postId: song.postId,
          type: 'album'
        }));
        setPlaylist(playlist);
        setPlaylistIndex(0);
        console.log('Cargando álbum en el reproductor:', playlist);

      } else {
        setPlaylist([song]);
        setPlaylistIndex(0);
        console.log('Cargando canción en el reproductor:', song);

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
          margin: { xs: 0, md: '16px' },
        }}
      >
        {/* Si es repost, mostrar el repostUser encima del user */}
        {isRepost && repostUser && (
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Avatar
              src={repostUser.profileImg}
              sx={{ width: 28, height: 28, mr: 1, cursor: 'pointer' }}
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
          {/* Tipo de publicación con botón de borrar */}
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              right: 0,
              display: 'flex',
              alignItems: 'center',
              zIndex: 20,
            }}
          >
            {/* Chip del tipo de contenido */}
            <Chip
              icon={song.type === 'album' ? <AlbumIcon /> : <MusicNoteIcon />}
              label={song.type === 'album' ? 'Álbum' : 'Canción'}
              color={song.type === 'album' ? 'primary' : 'secondary'}
              size="small"
              sx={{
                fontWeight: 600,
                borderRadius: '0 0 0 -12px',
              }}
            />
            
            {/* Botón de borrar (solo si canDelete es true) */}
            {canDelete && (
              <Tooltip title="Eliminar post" arrow placement="top">
                <IconButton
                  onClick={(e) => {
                    e.stopPropagation(); // Evitar que se active el play
                    if (onDelete) onDelete();
                  }}
                  sx={{
                    backgroundColor: 'rgba(229, 57, 53, 0.9)',
                    color: 'white',
                    width: 32,
                    height: 32,
                    // borderRadius: '0 0 0 0',
                    '&:hover': {
                      backgroundColor: 'rgba(229, 57, 53, 1)',
                      transform: 'scale(1.05)',
                    },
                    transition: 'all 0.2s ease-in-out',
                    ml: 0.5, // Pequeño margen a la izquierda
                  }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Box>

          <Avatar
            src={song.profilePic}
            sx={{ cursor: 'pointer' }}
            onClick={handleUserClick}
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
            position: 'relative',
          }}
        >
          <Tooltip title={song.type === 'album' ? `${song.albumSongs?.length} canciones` : 'Canción individual'}>
            <Badge
              badgeContent={song.type === 'album' && song.albumSongs ? song.albumSongs.length : 0}
              color="primary"
              invisible={true}
              sx={{
                '& .MuiBadge-badge': {
                  zIndex: 15,
                }
              }}
            >
              {song.type === 'album' ? (
                // Efecto abanico para álbumes
                <Stack
                  direction="row"
                  sx={{
                    position: 'relative',
                    width: '350px',
                    height: '350px',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  {/* Imagen de fondo (más alejada) */}
                  <Box
                    component="img"
                    src={song.coverImg || Logo}
                    alt="Portada del álbum"
                    sx={{
                      position: 'absolute',
                      width: '320px',
                      height: '320px',
                      objectFit: 'cover',
                      borderRadius: 2,
                      boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                      transform: 'rotate(-8deg) translateX(-15px) translateY(5px)',
                      zIndex: 1,
                      opacity: hover ? 0.3 : 0.7,
                      transition: 'opacity 0.3s ease-in-out',
                    }}
                  />
                  
                  {/* Imagen del medio */}
                  <Box
                    component="img"
                    src={song.coverImg || Logo}
                    alt="Portada del álbum"
                    sx={{
                      position: 'absolute',
                      width: '330px',
                      height: '330px',
                      objectFit: 'cover',
                      borderRadius: 2,
                      boxShadow: '0 12px 28px rgba(0,0,0,0.2)',
                      transform: 'rotate(4deg) translateX(8px) translateY(-3px)',
                      zIndex: 2,
                      opacity: hover ? 0.4 : 0.85,
                      transition: 'opacity 0.3s ease-in-out',
                    }}
                  />
                  
                  {/* Imagen principal (al frente) */}
                  <Box
                    component="img"
                    src={song.coverImg || Logo}
                    alt="Portada del álbum"
                    sx={{
                      position: 'absolute',
                      width: '340px',
                      height: '340px',
                      objectFit: 'cover',
                      borderRadius: 2,
                      boxShadow: '0 16px 32px rgba(0,0,0,0.25)',
                      transform: 'rotate(-2deg)',
                      zIndex: 3,
                      opacity: hover ? 0.2 : 1,
                      transition: 'all 0.3s ease-in-out',
                      '&:hover': {
                        transform: 'rotate(0deg) scale(1.02)',
                      },
                    }}
                  />
                  
                  {/* Overlay oscuro para hover */}
                  {hover && (
                    <Box
                      sx={{
                        position: 'absolute',
                        width: '340px',
                        height: '340px',
                        borderRadius: 2,
                        background: 'rgba(0, 0, 0, 0.8)',
                        zIndex: 5,
                        transition: 'all 0.3s ease-in-out',
                      }}
                    />
                  )}
                  
                  {/* Lista de canciones que aparece en hover */}
                  {hover && song.albumSongs && (
                    <Box
                      sx={{
                        position: 'absolute',
                        zIndex: 6,
                        width: '300px',
                        height: '300px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        color: 'white',
                        padding: 2,
                        borderRadius: 2,
                        transition: 'all 0.3s ease-in-out',
                      }}
                    >
                      {/* Título del álbum */}
                      <Typography 
                        variant="h6" 
                        sx={{ 
                          mb: 2, 
                          textAlign: 'center', 
                          fontWeight: 600,
                          color: '#fff',
                          textShadow: '0 2px 4px rgba(0,0,0,0.5)'
                        }}
                      >
                        {song.title}
                      </Typography>
                      
                      {/* Lista de canciones */}
                      <Box
                        sx={{
                          maxHeight: '200px',
                          overflowY: 'auto',
                          width: '100%',
                          '&::-webkit-scrollbar': {
                            width: '4px',
                          },
                          '&::-webkit-scrollbar-track': {
                            background: 'rgba(255,255,255,0.1)',
                            borderRadius: '2px',
                          },
                          '&::-webkit-scrollbar-thumb': {
                            background: 'rgba(255,255,255,0.3)',
                            borderRadius: '2px',
                          },
                        }}
                      >
                        {song.albumSongs.map((track, idx) => (
                          <Box
                            key={idx} 
                            sx={{ 
                              display: 'flex',
                              alignItems: 'center',
                              mb: 1,
                              px: 1,
                              py: 0.5,
                              borderRadius: 1,
                              background: 'rgba(255,255,255,0.1)',
                              backdropFilter: 'blur(4px)',
                              fontSize: '13px',
                              fontWeight: 400,
                              color: '#fff',
                              textShadow: '0 1px 2px rgba(0,0,0,0.5)',
                              '&:hover': {
                                background: 'rgba(255,255,255,0.2)',
                              },
                              transition: 'all 0.2s ease-in-out',
                            }}
                          >
                            {/* Número de track */}
                            <Box
                              sx={{
                                width: '20px',
                                height: '20px',
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, #307cbe, #145a96)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                mr: 1,
                                fontSize: '10px',
                                fontWeight: 600,
                                flexShrink: 0,
                              }}
                            >
                              {idx + 1}
                            </Box>
                            
                            {/* Nombre de la canción */}
                            <Box sx={{ 
                              overflow: 'hidden', 
                              textOverflow: 'ellipsis', 
                              whiteSpace: 'nowrap',
                              flex: 1,
                              mr: 1
                            }}>
                              {track.title || `Track ${idx + 1}`}
                            </Box>
                            
                            {/* Botón de play individual */}
                            <Tooltip title={`Vibra con ${track.title || `Track ${idx + 1}`}`} arrow placement="left">
                              <IconButton
                                onClick={(e) => {
                                  e.stopPropagation(); // Evitar que se active el play del álbum completo
                                  
                                  // Crear playlist del álbum y empezar desde la canción seleccionada
                                  const playlist = song.albumSongs!.map((albumTrack, albumIdx) => ({
                                    id: albumIdx,
                                    title: albumTrack.title,
                                    audioSrc: albumTrack.audioSrc,
                                    profilePic: song.profilePic,
                                    username: song.username,
                                    coverImg: song.coverImg,
                                    postId: song.postId,
                                    type: 'album'
                                  }));
                                  
                                  setPlaylist(playlist);
                                  setPlaylistIndex(idx); // Empezar desde la canción clickeada
                                  console.log(`Reproduciendo canción ${idx + 1} del álbum:`, track.title);
                                }}
                                sx={{
                                  width: '24px',
                                  height: '24px',
                                  backgroundColor: 'rgba(48, 124, 190, 0.8)',
                                  color: 'white',
                                  '&:hover': {
                                    backgroundColor: 'rgba(48, 124, 190, 1)',
                                    transform: 'scale(1.1)',
                                  },
                                  transition: 'all 0.2s ease-in-out',
                                }}
                              >
                                <PlayArrowIcon sx={{ fontSize: '14px' }} />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        ))}
                      </Box>
                      
                      {/* Contador de canciones */}
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          mt: 2,
                          color: 'rgba(255,255,255,0.8)',
                          textAlign: 'center',
                          fontStyle: 'italic'
                        }}
                      >
                        {song.albumSongs.length} canción{song.albumSongs.length !== 1 ? 'es' : ''} en total
                      </Typography>
                    </Box>
                  )}
                  
                  {/* Overlay con efecto brillante para álbumes (solo cuando no hay hover) */}
                  {!hover && (
                    <Box
                      sx={{
                        position: 'absolute',
                        width: '340px',
                        height: '340px',
                        borderRadius: 2,
                        background: 'linear-gradient(135deg, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%)',
                        zIndex: 4,
                        pointerEvents: 'none',
                      }}
                    />
                  )}
                </Stack>
              ) : (
                // Imagen normal para canciones individuales
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
              )}
            </Badge>
          </Tooltip>
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
          <Tooltip title="Vibra" arrow placement="top">
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
              zIndex: 10,
            }}
          >
            <PlayArrowIcon fontSize="large" />
          </IconButton>
          </Tooltip>
          <Typography variant="caption" color="white">
            Impresiones: 1234
          </Typography>
        </Box>

        {/* Caja interactiva que aparece desde abajo en hover */}
        <Box
          sx={{
            position: { xs: 'relative', md: 'absolute' },
            bottom: { xs: '0px', md: hover ? '10px' : '-70px' },
            left: '10px',
            right: '10px',
            borderRadius: 2,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '8px',
            transition: { xs: 'none', md: 'bottom 0.4s ease-in-out, opacity 0.4s ease-in-out' },
            opacity: { xs: 1, md: hover ? 1 : 0 },
            zIndex: 10
          }}
        >
          <Rate
            postId={song.postId}
            value={typeof userRate === 'number' ? userRate : undefined}
            onRate={onRate}
          />
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'flex-end',
              alignItems: 'center',
              width: '100%',
              gap: 0,
            }}
          >
            <RepostButton
              postId={song.postId}
              isReposted={!!isReposted}
              onRepost={onRepost}
            />
            <SaveButton
              postId={song.postId}
              isSaved={!!isSaved}
              onSave={onSave}
            />
          </Box>
        </Box>

        {/* Audio */}
        <audio ref={audioRef} src={song.audioSrc} preload="metadata" />
      </Card>
    );
  }
);

export default SongCard;
