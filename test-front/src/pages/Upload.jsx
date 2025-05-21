import React, { useState } from 'react';
import { getToken } from '../auth';
import { useNavigate } from 'react-router-dom';

export default function Upload() {
  const [tab, setTab] = useState('song');
  return (
    <div style={{ minHeight: '100vh', background: '#262c36', color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', paddingTop: 40 }}>
      <h2 style={{ marginBottom: 24 }}>Subir publicación</h2>
      <div style={{ display: 'flex', gap: 18, marginBottom: 32 }}>
        <button
          style={{ background: tab === 'song' ? '#3a7bd5' : '#31384a', color: '#fff', border: 'none', borderRadius: 8, padding: '0.7em 1.5em', fontWeight: 'bold', fontSize: 18, cursor: 'pointer' }}
          onClick={() => setTab('song')}
        >
          Subir canción
        </button>
        <button
          style={{ background: tab === 'album' ? '#3a7bd5' : '#31384a', color: '#fff', border: 'none', borderRadius: 8, padding: '0.7em 1.5em', fontWeight: 'bold', fontSize: 18, cursor: 'pointer' }}
          onClick={() => setTab('album')}
        >
          Subir álbum
        </button>
      </div>
      {tab === 'song' && <SongUploadForm />}
      {tab === 'album' && <AlbumUploadForm />}
    </div>
  );
}

function SongUploadForm() {
  const [songName, setSongName] = useState('');
  const [coverFile, setCoverFile] = useState(null);
  const [audioFile, setAudioFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const [audioPreview, setAudioPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!songName || !coverFile || !audioFile) {
      setError('Rellena todos los campos.');
      return;
    }
    setLoading(true);
    try {
      // Subir archivos
      const formData = new FormData();
      formData.append('file', coverFile);
      formData.append('file', audioFile);
      // Mostrar archivos en consola
      console.log('[API] POST /api/media/upload/multi', {
        files: [coverFile, audioFile],
        formData: Array.from(formData.entries())
      });
      const uploadRes = await fetch('http://localhost:8080/api/media/upload/multi', {
        method: 'POST',
        headers: { Authorization: `Bearer ${getToken()}` },
        body: formData
      });
      // Mostrar respuesta completa
      const uploadResClone = uploadRes.clone();
      let uploadResBody = null;
      try { uploadResBody = await uploadResClone.json(); } catch {}
      console.log('[API][RESPUESTA] /api/media/upload/multi', uploadRes, uploadResBody);
      if (!uploadRes.ok) throw new Error('Error subiendo archivos');
      const uploadData = uploadResBody;
      if (!uploadData.urls || uploadData.urls.length < 2) throw new Error('Respuesta inesperada del servidor');
      // Crear post
      const postBody = {
        songName,
        coverImg: uploadData.urls[0],
        audio: uploadData.urls[1]
      };
      console.log('[API] POST /api/posts/song', postBody);
      const postRes = await fetch('http://localhost:8080/api/posts/song', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`
        },
        body: JSON.stringify(postBody)
      });
      // Mostrar respuesta completa
      const postResClone = postRes.clone();
      let postResBody = null;
      try { postResBody = await postResClone.json(); } catch {}
      console.log('[API][RESPUESTA] /api/posts/song', postRes, postResBody);
      if (postRes.status === 201) {
        setSuccess('¡Canción publicada!');
        setTimeout(() => navigate('/home'), 1200);
      } else {
        throw new Error('Error creando la publicación');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 24, minWidth: 380, maxWidth: 520, width: '100%', background: '#31384a', padding: 36, borderRadius: 12, boxShadow: '0 2px 12px #0005', alignItems: 'stretch', margin: '0 auto' }}>
      <label style={{ fontWeight: 'bold', fontSize: 17, textAlign: 'left', marginLeft: 2 }}>Nombre de la canción</label>
      <input
        type="text"
        value={songName}
        onChange={e => setSongName(e.target.value)}
        style={{ padding: '0.7em 1em', borderRadius: 6, border: 'none', fontSize: 18, background: '#262c36', color: '#fff', textAlign: 'left', marginLeft: 2 }}
        required
      />
      <div style={{ borderTop: '1.2px solid #2a3342', opacity: 0.35, margin: '18px 0 0 0' }} />
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 10, marginLeft: 2, width: '100%' }}>
        <input
          type="file"
          accept="image/*"
          onChange={e => {
            setCoverFile(e.target.files[0]);
            setCoverPreview(e.target.files[0] ? URL.createObjectURL(e.target.files[0]) : null);
          }}
          style={{ display: 'none' }}
          id="cover-upload"
          required
        />
        <button
          type="button"
          onClick={() => document.getElementById('cover-upload').click()}
          style={{ background: '#2a3342', color: '#fff', border: 'none', borderRadius: 8, padding: '0.7em 1.5em', fontWeight: 'bold', fontSize: 17, cursor: 'pointer', marginBottom: 0, marginLeft: 0, minWidth: 260, maxWidth: 260, width: 260, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', borderColor: '#3a7bd5' }}
        >
          {coverFile ? 'Portada seleccionada' : 'Seleccionar portada'}
        </button>
        {coverPreview && (
          <img src={coverPreview} alt="preview" style={{ marginTop: 8, width: 140, height: 140, objectFit: 'cover', borderRadius: 8, border: '1.5px solid #3a7bd5', marginLeft: 0 }} />
        )}
      </div>
      <div style={{ borderTop: '1.2px solid #2a3342', opacity: 0.35, margin: '18px 0 0 0' }} />
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 10, marginLeft: 2, width: '100%' }}>
        <input
          type="file"
          accept="audio/*"
          onChange={e => {
            setAudioFile(e.target.files[0]);
            setAudioPreview(e.target.files[0] ? URL.createObjectURL(e.target.files[0]) : null);
          }}
          style={{ display: 'none' }}
          id="audio-upload"
          required
        />
        <button
          type="button"
          onClick={() => document.getElementById('audio-upload').click()}
          style={{ background: '#2a3342', color: '#fff', border: 'none', borderRadius: 8, padding: '0.7em 1.5em', fontWeight: 'bold', fontSize: 17, cursor: 'pointer', marginBottom: 0, marginLeft: 0, minWidth: 260, maxWidth: 260, width: 260, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', borderColor: '#3a7bd5' }}
        >
          {audioFile ? 'Archivo de audio' : 'Archivo de audio'}
        </button>
        {audioPreview && (
          <audio src={audioPreview} controls style={{ marginTop: 8, width: '100%', background: '#262c36', borderRadius: 8, marginLeft: 0 }} />
        )}
      </div>
      <div style={{ borderTop: '1.2px solid #2a3342', opacity: 0.35, margin: '18px 0 0 0' }} />
      <button type="submit" disabled={loading} style={{ background: '#3a7bd5', color: '#fff', border: 'none', borderRadius: 8, padding: '0.8em 2em', fontWeight: 'bold', fontSize: 19, cursor: 'pointer', marginTop: 22, marginLeft: 'auto', marginRight: 'auto', maxWidth: 260, display: 'block', textAlign: 'center' }}>
        {loading ? 'Subiendo...' : 'Publicar canción'}
      </button>
      {error && <div style={{ color: '#ff4d4f', fontWeight: 'bold', textAlign: 'left', marginLeft: 2 }}>{error}</div>}
      {success && <div style={{ color: '#4fff8f', fontWeight: 'bold', textAlign: 'left', marginLeft: 2 }}>{success}</div>}
    </form>
  );
}

function AlbumUploadForm() {
  const [albumName, setAlbumName] = useState('');
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const [songs, setSongs] = useState([{ name: '', audioFile: null, audioPreview: null }]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleSongChange = (idx, field, value) => {
    setSongs(songs => songs.map((s, i) => i === idx ? { ...s, [field]: value } : s));
  };

  const handleAddSong = () => {
    setSongs(songs => [...songs, { name: '', audioFile: null, audioPreview: null }]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!albumName || !coverFile || songs.some(s => !s.name || !s.audioFile)) {
      setError('Rellena todos los campos y añade al menos una canción.');
      return;
    }
    setLoading(true);
    try {
      // Subir archivos: portada + todos los audios
      const formData = new FormData();
      formData.append('file', coverFile);
      songs.forEach(s => formData.append('file', s.audioFile));
      console.log('[API] POST /api/media/upload/multi', {
        files: [coverFile, ...songs.map(s => s.audioFile)],
        formData: Array.from(formData.entries())
      });
      const uploadRes = await fetch('http://localhost:8080/api/media/upload/multi', {
        method: 'POST',
        headers: { Authorization: `Bearer ${getToken()}` },
        body: formData
      });
      const uploadResClone = uploadRes.clone();
      let uploadResBody = null;
      try { uploadResBody = await uploadResClone.json(); } catch {}
      console.log('[API][RESPUESTA] /api/media/upload/multi', uploadRes, uploadResBody);
      if (!uploadRes.ok) throw new Error('Error subiendo archivos');
      const uploadData = uploadResBody;
      if (!uploadData.urls || uploadData.urls.length < songs.length + 1) throw new Error('Respuesta inesperada del servidor');
      // Crear post álbum
      const postBody = {
        albumName,
        coverImg: uploadData.urls[0],
        songs: songs.map((s, i) => ({ name: s.name, audio: uploadData.urls[i + 1] }))
      };
      console.log('[API] POST /api/posts/song', postBody);
      const postRes = await fetch('http://localhost:8080/api/posts/album', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`
        },
        body: JSON.stringify(postBody)
      });
      const postResClone = postRes.clone();
      let postResBody = null;
      try { postResBody = await postResClone.json(); } catch {}
      console.log('[API][RESPUESTA] /api/posts/song', postRes, postResBody);
      if (postRes.status === 201) {
        setSuccess('¡Álbum publicado!');
        setTimeout(() => navigate('/home'), 1200);
      } else {
        throw new Error('Error creando la publicación');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 24, minWidth: 380, maxWidth: 520, width: '100%', background: '#31384a', padding: 36, borderRadius: 12, boxShadow: '0 2px 12px #0005', alignItems: 'stretch', margin: '0 auto' }}>
      <label style={{ fontWeight: 'bold', fontSize: 17, textAlign: 'left', marginLeft: 2 }}>Nombre del álbum</label>
      <input
        type="text"
        value={albumName}
        onChange={e => setAlbumName(e.target.value)}
        style={{ padding: '0.7em 1em', borderRadius: 6, border: 'none', fontSize: 18, background: '#262c36', color: '#fff', textAlign: 'left', marginLeft: 2 }}
        required
      />
      <div style={{ borderTop: '1.2px solid #2a3342', opacity: 0.35, margin: '18px 0 0 0' }} />
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 10, marginLeft: 2, width: '100%' }}>
        <input
          type="file"
          accept="image/*"
          onChange={e => {
            setCoverFile(e.target.files[0]);
            setCoverPreview(e.target.files[0] ? URL.createObjectURL(e.target.files[0]) : null);
          }}
          style={{ display: 'none' }}
          id="album-cover-upload"
          required
        />
        <button
          type="button"
          onClick={() => document.getElementById('album-cover-upload').click()}
          style={{ background: '#31384a', color: '#fff', border: 'none', borderRadius: 8, padding: '0.7em 1.5em', fontWeight: 'bold', fontSize: 17, cursor: 'pointer', marginBottom: 0, marginLeft: 0, minWidth: 260, maxWidth: 260, width: 260, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          {coverFile ? 'Portada seleccionada' : 'Seleccionar portada'}
        </button>
        {coverPreview && (
          <img src={coverPreview} alt="preview" style={{ marginTop: 8, width: 140, height: 140, objectFit: 'cover', borderRadius: 8, border: '1.5px solid #3a7bd5', marginLeft: 0 }} />
        )}
      </div>
      <div style={{ borderTop: '1.2px solid #2a3342', opacity: 0.35, margin: '18px 0 0 0' }} />
      {songs.map((song, idx) => (
        <div key={idx} style={{ background: 'none', width: '100%', marginBottom: 8 }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 8 }}>
            <input
              type="text"
              value={song.name}
              onChange={e => handleSongChange(idx, 'name', e.target.value)}
              placeholder={`Nombre de la canción ${idx + 1}`}
              style={{ padding: '0.7em 1em', borderRadius: 6, border: 'none', fontSize: 16, background: '#262c36', color: '#fff', textAlign: 'left', flex: 1 }}
              required
            />
            <input
              type="file"
              accept="audio/*"
              onChange={e => {
                handleSongChange(idx, 'audioFile', e.target.files[0]);
                handleSongChange(idx, 'audioPreview', e.target.files[0] ? URL.createObjectURL(e.target.files[0]) : null);
              }}
              style={{ display: 'none' }}
              id={`album-audio-upload-${idx}`}
              required
            />
            <button
              type="button"
              onClick={() => document.getElementById(`album-audio-upload-${idx}`).click()}
              style={{ background: '#31384a', color: '#fff', border: 'none', borderRadius: 8, padding: '0.7em 1.5em', fontWeight: 'bold', fontSize: 15, cursor: 'pointer', minWidth: 160, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              {song.audioFile ? 'Archivo de audio' : 'Seleccionar audio'}
            </button>
          </div>
          {song.audioPreview && (
            <audio src={song.audioPreview} controls style={{ marginTop: 4, width: '100%', background: '#23242b', borderRadius: 8 }} />
          )}
          {/* Botón para añadir otra canción solo en el último */}
          {idx === songs.length - 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 10 }}>
              <button type="button" onClick={handleAddSong} style={{ width: 44, height: 44, borderRadius: '50%', background: '#3a7bd5', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px #0003', cursor: 'pointer' }}>
                <svg width="26" height="26" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="13" cy="13" r="13" fill="rgba(255,255,255,0.13)" />
                  <rect x="12" y="6" width="2" height="14" rx="1" fill="#fff" />
                  <rect x="6" y="12" width="14" height="2" rx="1" fill="#fff" />
                </svg>
              </button>
            </div>
          )}
        </div>
      ))}
      <div style={{ borderTop: '1.2px solid #2a3342', opacity: 0.35, margin: '18px 0 0 0' }} />
      <button type="submit" disabled={loading} style={{ background: '#3a7bd5', color: '#fff', border: 'none', borderRadius: 8, padding: '0.8em 2em', fontWeight: 'bold', fontSize: 19, cursor: 'pointer', marginTop: 22, marginLeft: 'auto', marginRight: 'auto', maxWidth: 260, display: 'block', textAlign: 'center' }}>
        {loading ? 'Subiendo...' : 'Publicar álbum'}
      </button>
      {error && <div style={{ color: '#ff4d4f', fontWeight: 'bold', textAlign: 'left', marginLeft: 2 }}>{error}</div>}
      {success && <div style={{ color: '#4fff8f', fontWeight: 'bold', textAlign: 'left', marginLeft: 2 }}>{success}</div>}
    </form>
  );
}
