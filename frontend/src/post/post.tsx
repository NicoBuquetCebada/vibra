import React, { useState } from 'react';
import { Box, Button, TextField, Typography, Container, Alert, IconButton, CircularProgress, Card } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import AudiotrackIcon from '@mui/icons-material/Audiotrack';
import { useNavigate, useLocation } from 'react-router-dom';
import NavigationWrapper from '../components/NavigationWrapper';
import AudioPreview from '../components/AudioPreview';
import Logo from '../assets/logo.png';
import { fetchWithAuth, addSongPost, addAlbumPost } from '../api';

interface Song {
  name: string;
  image: File | null;
  audio: File | null;
}

const CreatePost: React.FC = () => {
  const [isAlbum, setIsAlbum] = useState(false);
  const [songData, setSongData] = useState<Song>({ name: '', image: null, audio: null });
  const [albumName, setAlbumName] = useState<string>('');
  const [albumCover, setAlbumCover] = useState<File | null>(null);
  const [albumSongs, setAlbumSongs] = useState<Song[]>([]);
  const [error, setError] = useState<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleSongChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = event.target;
    if (files && files[0]) {
      setSongData(prev => ({ ...prev, [name]: files[0] }));
      setSuccessMessage(`Archivo ${name === 'image' ? 'de imagen' : 'de audio'} cargado correctamente.`);
    }
  };

  const handleAlbumCoverChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = event.target;
    if (files && files[0]) {
      setAlbumCover(files[0]);
      setSuccessMessage('Imagen de portada cargada correctamente.');
    }
  };

  const handleAddNewSong = () => {
    setAlbumSongs(prev => [...prev, { name: '', image: null, audio: null }]);
  };

  const handleAlbumSongChange = <K extends keyof Song>(index: number, field: K, value: Song[K]) => {
    setAlbumSongs(prev => prev.map((song, i) =>
      i === index ? { ...song, [field]: value } : song
    ));
  };

  const handleRemoveSong = (index: number) => {
    setAlbumSongs(prev => prev.filter((_, i) => i !== index));
  };

  const handleToggle = (isAlbumSelected: boolean) => {
    setIsAlbum(isAlbumSelected);
    setSongData({ name: '', image: null, audio: null });
    setAlbumSongs([]);
    setAlbumCover(null);
    setAlbumName('');
    setError(null);
    setSuccessMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (!isAlbum) {
        if (!songData.name || !songData.audio) {
          setError('El nombre de la canción y el archivo de audio son obligatorios.');
          setLoading(false);
          return;
        }

        let coverImgUrl = "";
        let audioUrl = "";

        if (songData.image) {
          const formData = new FormData();
          formData.append('file', songData.image);
          formData.append('file', songData.audio);

          const uploadRes = await fetchWithAuth('/api/media/upload/multi', {
            method: 'POST',
            body: formData,
          });

          if (!uploadRes.ok) throw new Error('Error al subir archivos');
          const uploadData = await uploadRes.json();
          [coverImgUrl, audioUrl] = uploadData.urls;
        } else {
          const formData = new FormData();
          formData.append('file', songData.audio);

          const uploadRes = await fetchWithAuth('/api/media/upload/multi', {
            method: 'POST',
            body: formData,
          });

          if (!uploadRes.ok) throw new Error('Error al subir archivos');
          const uploadData = await uploadRes.json();
          audioUrl = uploadData.urls[0];
          coverImgUrl = "";
        }

        await addSongPost(songData.name, coverImgUrl, audioUrl);

        setSuccessMessage('Canción publicada con éxito');
        setTimeout(() => navigate('/home', { state: { successMessage: isAlbum ? 'Álbum publicado con éxito' : 'Canción publicada con éxito' } }), 1200);
      } else {
        if (!albumName || albumSongs.length === 0) {
          setError('El nombre del álbum y al menos una canción son obligatorios.');
          setLoading(false);
          return;
        }

        if (albumSongs.some(song => !song.name || !song.audio)) {
          setError('Todas las canciones deben tener nombre y archivo de audio.');
          setLoading(false);
          return;
        }

        let coverImgUrl = "";
        let audioUrls: string[] = [];

        if (albumCover) {
          const formData = new FormData();
          formData.append('file', albumCover);
          albumSongs.forEach(song => {
            if (song.audio) formData.append('file', song.audio);
          });

          const uploadRes = await fetchWithAuth('/api/media/upload/multi', {
            method: 'POST',
            body: formData,
          });

          if (!uploadRes.ok) throw new Error('Error al subir archivos');
          const uploadData = await uploadRes.json();
          [coverImgUrl, ...audioUrls] = uploadData.urls;
        } else {
          const formData = new FormData();
          albumSongs.forEach(song => {
            if (song.audio) formData.append('file', song.audio);
          });

          const uploadRes = await fetchWithAuth('/api/media/upload/multi', {
            method: 'POST',
            body: formData,
          });

          if (!uploadRes.ok) throw new Error('Error al subir archivos');
          const uploadData = await uploadRes.json();
          coverImgUrl = "";
          audioUrls = uploadData.urls;
        }

        await addAlbumPost(
          albumName,
          coverImgUrl,
          albumSongs.map((song, index) => ({
            name: song.name,
            audio: audioUrls[index]
          }))
        );

        setSuccessMessage('Álbum publicado con éxito');
        setTimeout(() => navigate('/home', { state: { successMessage: isAlbum ? 'Álbum publicado con éxito' : 'Canción publicada con éxito' } }), 1200);
      }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      setError('Error al subir. Inténtalo de nuevo.');
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (location.state?.successMessage) {
      setSuccessMessage(location.state.successMessage);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  return (
    <NavigationWrapper logoButtonSx={{ marginTop: '18px' }}>
      <Box
        sx={{
          minHeight: '100vh',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          pt: 4,
          pb: 10,
        }}
      >
        <Container
          maxWidth="sm"
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
            mb: 4,
          }}
        >
          
          <Card
            elevation={6}
            sx={{
              width: '100%',
              borderRadius: 3,
              padding: { xs: 3, sm: 4 },
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(48, 124, 190, 0.1)',
              // boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 4,
              }}
            >
              {/* Logo */}
              <Box
                component="img"
                src={Logo}
                alt="Vibra Logo"
                sx={{
                  width: '120px',
                  height: 'auto',
                  margin: '0 auto',
                }}
              />

              {/* Botones de toggle */}
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  gap: 2,
                  '.MuiButton-root': {
                    px: 4,
                    py: 1,
                    borderRadius: '20px',
                  }
                }}
              >
                <Button
                  variant={!isAlbum ? 'contained' : 'outlined'}
                  onClick={() => handleToggle(false)}
                  sx={{
                    boxShadow: !isAlbum ? 2 : 0,
                  }}
                >
                  Canción
                </Button>
                <Button
                  variant={isAlbum ? 'contained' : 'outlined'}
                  onClick={() => handleToggle(true)}
                  sx={{
                    boxShadow: isAlbum ? 2 : 0,
                  }}
                >
                  Álbum
                </Button>
              </Box>

              {/* Alert de error */}
              {error && (
                <Alert 
                  severity="error"
                  sx={{
                    borderRadius: 2,
                    boxShadow: 1,
                  }}
                >
                  {error}
                </Alert>
              )}

              {/* Alert de éxito */}
              {successMessage && (
                <Alert 
                  severity="success"
                  sx={{
                    borderRadius: 2,
                    boxShadow: 1,
                  }}
                >
                  {successMessage}
                </Alert>
              )}

              {/* Contenido principal */}
              {!isAlbum ? (
               
                <Card
                  elevation={2}
                  sx={{
                    p: 3,
                    borderRadius: 2,
                    backgroundColor: 'rgba(248, 250, 252, 0.8)',
                    border: '1px solid rgba(48, 124, 190, 0.08)',
                    boxShadow: 'none'
                  }}
                >
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <TextField
                      name="name"
                      label="Nombre de la canción"
                      variant="outlined"
                      fullWidth
                      value={songData.name}
                      onChange={(e) => setSongData({ ...songData, name: e.target.value })}
                      sx={{
                        backgroundColor: '#fff',
                        borderRadius: 1,
                        width: { xs: '100%', sm: '420px' },
                        alignSelf: 'center',
                        '& .MuiOutlinedInput-root': {
                          '&:hover fieldset': {
                            borderColor: '#307cbe',
                          },
                        },
                      }}
                    />
                    
                    {/* Imagen de portada */}
                    <Card
                      elevation={1}
                      sx={{
                        width: { xs: '100%', sm: '320px' },
                        aspectRatio: '1/1',
                        mx: 'auto',
                        borderRadius: 2,
                        overflow: 'hidden',
                      }}
                    >
                      <Box
                        sx={{
                          width: '100%',
                          height: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: '#fff',
                        }}
                      >
                        {!songData.image ? (
                          <Button
                            component="label"
                            sx={{
                              width: '100%',
                              height: '100%',
                              border: '2px dashed #307cbe',
                              borderRadius: 0,
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#307cbe',
                              gap: 1,
                              '&:hover': {
                                backgroundColor: 'rgba(48, 124, 190, 0.05)',
                              },
                            }}
                          >
                            <AddIcon sx={{ fontSize: 40 }} />
                            <Typography variant="body2" sx={{ textAlign: 'center', px: 2 }}>
                              IMAGEN DE PORTADA
                            </Typography>
                            <input
                              type="file"
                              name="image"
                              accept="image/*"
                              hidden
                              onChange={handleSongChange}
                            />
                          </Button>
                        ) : (
                          <img
                            src={URL.createObjectURL(songData.image)}
                            alt="Portada"
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                            }}
                          />
                        )}
                      </Box>
                    </Card>

                    {/* Audio */}
                    <Box sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 2,
                      width: { xs: '100%', sm: '420px' },
                      alignSelf: 'center',
                    }}>
                      <Button
                        variant={songData.audio ? 'contained' : 'outlined'}
                        component="label"
                        fullWidth
                        sx={{
                          py: 1.5,
                          px: 4,
                          borderRadius: '20px',
                          backgroundColor: songData.audio ? '#307cbe' : '#fff',
                          color: songData.audio ? '#fff' : '#307cbe',
                          boxShadow: songData.audio ? 2 : 0,
                          '&:hover': {
                            backgroundColor: songData.audio ? '#145a96' : '#f5f5f5',
                            boxShadow: songData.audio ? 3 : 1,
                          }
                        }}
                        startIcon={<AudiotrackIcon />}
                      >
                        {songData.audio ? 'Audio Cargado' : 'Cargar Archivo de Audio'}
                        <input
                          type="file"
                          name="audio"
                          accept="audio/*"
                          hidden
                          onChange={handleSongChange}
                        />
                      </Button>

                      {songData.audio && (
                        <AudioPreview audioFile={songData.audio} />
                      )}
                    </Box>

                    <Button
                      variant="contained"
                      color="primary"
                      fullWidth
                      onClick={handleSubmit}
                      disabled={!songData.name || !songData.audio || loading}
                      sx={{
                        py: 1.5,
                        borderRadius: '20px',
                        boxShadow: 3,
                        width: { xs: '100%', sm: '420px' },
                        alignSelf: 'center',
                        '&:hover': {
                          boxShadow: 4,
                        },
                      }}
                    >
                      {loading ? <CircularProgress size={24} color="inherit" /> : 'Publicar'}
                    </Button>
                  </Box>
                </Card>
              ) : (
               
                <Card
                  elevation={2}
                  sx={{
                    p: 3,
                    borderRadius: 2,
                    backgroundColor: 'rgba(248, 250, 252, 0.8)',
                    border: '1px solid rgba(48, 124, 190, 0.08)',
                    boxShadow: 'none'
                  }}
                >
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <TextField
                      name="albumName"
                      label="Nombre del álbum"
                      variant="outlined"
                      fullWidth
                      value={albumName}
                      onChange={(e) => setAlbumName(e.target.value)}
                      sx={{
                        backgroundColor: '#fff',
                        borderRadius: 1,
                        width: { xs: '100%', sm: '420px' },
                        alignSelf: 'center',
                        '& .MuiOutlinedInput-root': {
                          '&:hover fieldset': {
                            borderColor: '#307cbe',
                          },
                        },
                      }}
                    />

                    {/* Portada del álbum - igual que la canción pero envuelta en Card */}
                    <Card
                      elevation={1}
                      sx={{
                        width: { xs: '100%', sm: '320px' },
                        aspectRatio: '1/1',
                        mx: 'auto',
                        borderRadius: 2,
                        overflow: 'hidden',
                      }}
                    >
                      <Box
                        sx={{
                          width: '100%',
                          height: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: '#fff',
                        }}
                      >
                        {!albumCover ? (
                          <Button
                            component="label"
                            sx={{
                              width: '100%',
                              height: '100%',
                              border: '2px dashed #307cbe',
                              borderRadius: 0,
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#307cbe',
                              gap: 1,
                              '&:hover': {
                                backgroundColor: 'rgba(48, 124, 190, 0.05)',
                              },
                            }}
                          >
                            <AddIcon sx={{ fontSize: 40 }} />
                            <Typography variant="body2" sx={{ textAlign: 'center', px: 2 }}>
                              IMAGEN DE PORTADA
                            </Typography>
                            <input
                              type="file"
                              accept="image/*"
                              hidden
                              onChange={handleAlbumCoverChange}
                            />
                          </Button>
                        ) : (
                          <img
                            src={URL.createObjectURL(albumCover)}
                            alt="Portada del álbum"
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                            }}
                          />
                        )}
                      </Box>
                    </Card>

                    {/* Lista de canciones */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      {albumSongs.map((song, index) => (
                        <Card
                          key={index}
                          elevation={2}
                          sx={{
                            borderRadius: 2,
                            p: 2,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 2,
                            width: { xs: '100%', sm: '420px' },
                            alignSelf: 'center',
                            backgroundColor: '#fff',
                            border: '1px solid rgba(48, 124, 190, 0.1)',
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                              {index + 1}.
                            </Typography>
                            <TextField
                              fullWidth
                              size="small"
                              label="Nombre de la canción"
                              value={song.name}
                              onChange={(e) => handleAlbumSongChange(index, 'name', e.target.value)}
                              sx={{
                                width: { xs: '100%', sm: '340px' },
                              }}
                            />
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleRemoveSong(index)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Box>
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%' }}>
                            <Button
                              variant={song.audio ? 'contained' : 'outlined'}
                              component="label"
                              fullWidth
                              sx={{
                                py: 1,
                                px: 3,
                                borderRadius: '20px',
                                backgroundColor: song.audio ? '#307cbe' : '#fff',
                                color: song.audio ? '#fff' : '#307cbe',
                                '&:hover': {
                                  backgroundColor: song.audio ? '#145a96' : '#f5f5f5',
                                }
                              }}
                              startIcon={<AudiotrackIcon />}
                            >
                              {song.audio ? 'Audio Cargado' : 'Cargar Audio'}
                              <input
                                type="file"
                                accept="audio/*"
                                hidden
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) handleAlbumSongChange(index, 'audio', file);
                                }}
                              />
                            </Button>

                            {song.audio && (
                              <AudioPreview audioFile={song.audio} />
                            )}
                          </Box>
                        </Card>
                      ))}
                    </Box>

                    {/* Resto de botones con mejores estilos */}
                    <Button
                      onClick={handleAddNewSong}
                      startIcon={<AddIcon />}
                      variant="outlined"
                      fullWidth
                      sx={{
                        py: 1.5,
                        px: 4,
                        borderRadius: '20px',
                        backgroundColor: '#fff',
                        color: '#307cbe',
                        border: '1px solid #307cbe',
                        boxShadow: 'none',
                        '&:hover': {
                          backgroundColor: '#f5f5f5',
                          borderColor: '#307cbe',
                          boxShadow: 'none',
                        },
                        width: { xs: '100%', sm: '420px' },
                        alignSelf: 'center',
                      }}
                    >
                      Añadir Canción
                    </Button>

                    <Button
                      variant="contained"
                      color="primary"
                      fullWidth
                      onClick={handleSubmit}
                      disabled={!albumName || albumSongs.length === 0 || loading}
                      sx={{
                        py: 1.5,
                        borderRadius: '20px',
                        boxShadow: 3,
                        width: { xs: '100%', sm: '420px' },
                        alignSelf: 'center',
                        '&:hover': {
                          boxShadow: 4,
                        },
                      }}
                    >
                      {loading ? <CircularProgress size={24} color="inherit" /> : 'Publicar Álbum'}
                    </Button>
                  </Box>
                </Card>
              )}
            </Box>
          </Card>

          {loading && (
            <Box
              sx={{
                position: 'fixed',
                top: 0, left: 0, width: '100vw', height: '100vh',
                bgcolor: 'transparent',
                backdropFilter: 'blur(4px)',
                zIndex: 2000,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Card
                elevation={8}
                sx={{
                  p: 4,
                  borderRadius: 3,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 2,
                }}
              >
                <CircularProgress size={50} color="primary" />
                <Typography variant="body1" color="text.secondary">
                  {isAlbum ? 'Publicando álbum...' : 'Publicando canción...'}
                </Typography>
              </Card>
            </Box>
          )}
        </Container>
      </Box>
    </NavigationWrapper>
  );
};

export default CreatePost;
