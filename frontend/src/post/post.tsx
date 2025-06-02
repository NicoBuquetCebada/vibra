import React, { useState } from 'react';
import { Box, Button, TextField, Typography, Container, Alert, IconButton, CircularProgress } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import AudiotrackIcon from '@mui/icons-material/Audiotrack';
import { useNavigate, useLocation } from 'react-router-dom';
import BottomNav from '../components/bottom-navigation';
import Logo from '../assets/logo.png';
import { fetchWithAuth, addSongPost, addAlbumPost } from '../api'; // <-- importa los métodos

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
          return;
        }

        let coverImgUrl = "";
        let audioUrl = "";

        if (songData.image) {
          // Si hay imagen, sube imagen y audio
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
          // Solo sube el audio
          const formData = new FormData();
          formData.append('file', songData.audio);

          const uploadRes = await fetchWithAuth('/api/media/upload/multi', {
            method: 'POST',
            body: formData,
          });

          if (!uploadRes.ok) throw new Error('Error al subir archivos');
          const uploadData = await uploadRes.json();
          audioUrl = uploadData.urls[0];
          coverImgUrl = ""; // Imagen vacía
        }

        await addSongPost(songData.name, coverImgUrl, audioUrl);

        setSuccessMessage('Canción publicada con éxito');
        setTimeout(() => navigate('/home', { state: { successMessage: isAlbum ? 'Álbum publicado con éxito' : 'Canción publicada con éxito' } }), 1200);
      } else {
        if (!albumName || albumSongs.length === 0) {
          setError('El nombre del álbum y al menos una canción son obligatorios.');
          return;
        }

        if (albumSongs.some(song => !song.name || !song.audio)) {
          setError('Todas las canciones deben tener nombre y archivo de audio.');
          return;
        }

        let coverImgUrl = "";
        let audioUrls: string[] = [];

        if (albumCover) {
          // Si hay portada, sube portada y audios
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
          // Solo sube los audios
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
          coverImgUrl = ""; // Portada vacía
          audioUrls = uploadData.urls;
        }

        // Usa el método de la API
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
      setLoading(false); // Solo aquí
    }
  };

  React.useEffect(() => {
    if (location.state?.successMessage) {
      setSuccessMessage(location.state.successMessage);
      // Limpia el estado para que no se repita al refrescar
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  return (
    <Box 
      sx={{
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        pt: 4,
        pb: 10,
        backgroundColor: '#f5f5f5',
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
        <Box
          sx={{
            width: '100%',
            backgroundColor: 'transparent',
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
          }}
        >
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
            >
              Canción
            </Button>
            <Button
              variant={isAlbum ? 'contained' : 'outlined'}
              onClick={() => handleToggle(true)}
            >
              Álbum
            </Button>
          </Box>

          {error && <Alert severity="error">{error}</Alert>}

          {!isAlbum ? (
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
                }}
              />
              
              <Box 
                sx={{ 
                  width: '60%',
                  aspectRatio: '1/1',
                  mx: 'auto',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  borderRadius: 2,
                  backgroundColor: '#fff',
                  boxShadow: songData.image ? 'none' : 1,
                }}
              >
                {!songData.image ? (
                  <Button
                    component="label"
                    sx={{
                      width: '100%',
                      height: '100%',
                      border: '2px dashed #307cbe',
                      borderRadius: 2,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#307cbe',
                      gap: 1,
                    }}
                  >
                    <AddIcon sx={{ fontSize: 40 }} />
                    <Typography variant="body2" sx={{ textAlign: 'center', px: 2 }}>
                      Añadir imagen de portada
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

              <Box sx={{ 
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
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
                    '&:hover': {
                      backgroundColor: songData.audio ? '#145a96' : '#f5f5f5',
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
                  <audio
                    controls
                    src={URL.createObjectURL(songData.audio)}
                    style={{ 
                      width: '100%', 
                      borderRadius: '10px',
                      backgroundColor: '#f5f5f5'
                    }}
                  />
                )}
              </Box>

              <Button 
                variant="contained" 
                color="primary" 
                fullWidth 
                onClick={handleSubmit}
                disabled={!songData.name || !songData.audio}
                sx={{
                  py: 1.5,
                  borderRadius: '20px',
                  boxShadow: 2,
                }}
              >
                Publicar
              </Button>
            </Box>
          ) : (
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
                }}
              />
              
              <Box 
                sx={{ 
                  width: '60%',
                  aspectRatio: '1/1',
                  mx: 'auto',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  borderRadius: 2,
                  backgroundColor: '#fff',
                  boxShadow: albumCover ? 'none' : 1,
                }}
              >
                {!albumCover ? (
                  <Button
                    component="label"
                    sx={{
                      width: '100%',
                      height: '100%',
                      border: '2px dashed #307cbe',
                      borderRadius: 2,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#307cbe',
                      gap: 1,
                    }}
                  >
                    <AddIcon sx={{ fontSize: 40 }} />
                    <Typography variant="body2" sx={{ textAlign: 'center', px: 2 }}>
                      Añadir portada del álbum
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

              {/* Lista de canciones */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {albumSongs.map((song, index) => (
                  <Box
                    key={index}
                    sx={{
                      backgroundColor: '#fff',
                      borderRadius: 2,
                      p: 2,
                      boxShadow: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 2,
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
                      />
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleRemoveSong(index)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
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
                        <audio
                          controls
                          src={URL.createObjectURL(song.audio)}
                          style={{ 
                            width: '100%',
                            borderRadius: '8px',
                            backgroundColor: '#f5f5f5'
                          }}
                        />
                      )}
                    </Box>
                  </Box>
                ))}
              </Box>

              {/* Botón para añadir nueva canción */}
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
                  '&:hover': {
                    backgroundColor: '#f5f5f5',
                    borderColor: '#307cbe'
                  }
                }}
              >
                Añadir Canción
              </Button>

              <Button 
                variant="contained" 
                color="primary" 
                fullWidth 
                onClick={handleSubmit}
                disabled={!albumName || albumSongs.length === 0}
                sx={{
                  py: 1.5,
                  borderRadius: '20px',
                  boxShadow: 2,
                }}
              >
                Publicar Álbum
              </Button>
            </Box>
          )}
        </Box>
      </Container>

      <BottomNav handleNavigation={navigate} />

      {loading && (
        <Box
          sx={{
            position: 'fixed',
            top: 0, left: 0, width: '100vw', height: '100vh',
            bgcolor: 'rgba(255,255,255,0.6)',
            zIndex: 2000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <CircularProgress size={70} color="primary" />
        </Box>
      )}
    </Box>
  );
};

export default CreatePost;
