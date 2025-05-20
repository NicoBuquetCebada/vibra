import React from 'react';

export default function AudioPlayer({ audio }) {
  // Si audio es un objeto, puede tener: name, audio, album, coverImg, user
  const coverImg = audio && typeof audio === 'object' && audio.coverImg;
  const user = audio && typeof audio === 'object' && audio.user;
  return (
    <div
      style={{
        position: 'fixed',
        right: 0,
        top: 0,
        width: '30vw',
        height: '100vh',
        background: 'linear-gradient(135deg, #3a3b47 60%, #23242b 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        boxShadow: 'none',
        zIndex: 1000,
        borderLeft: '2px solid #444',
        paddingTop: 36,
        gap: 0,
      }}
    >
      {audio && typeof audio === 'object' && (
        <div style={{ width: '90%', display: 'flex', alignItems: 'center', marginBottom: 18, gap: 16 }}>
          {user && (
            <img src={user.profileImg} alt="user" style={{ width: 44, height: 44, borderRadius: '50%' }} />
          )}
          <span style={{ fontWeight: 'bold', fontSize: 18 }}>{user?.name}</span>
        </div>
      )}
      {audio && typeof audio === 'object' && coverImg && (
        <img src={coverImg} alt="cover" style={{ width: '90%', aspectRatio: '1/1', objectFit: 'cover', borderRadius: 12, marginBottom: 18 }} />
      )}
      {audio ? (
        <>
          <audio src={typeof audio === 'string' ? audio : audio.audio} controls autoPlay style={{ width: '90%', background: '#23242b', borderRadius: 8, marginBottom: 18 }} />
          {typeof audio === 'object' && (
            <div style={{ color: '#fff', marginTop: 0, background: '#2d2e36', borderRadius: 8, padding: 12, boxShadow: '0 2px 8px #0003', width: '90%', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
              <div style={{ fontWeight: 'bold', fontSize: 18, textAlign: 'left', width: '100%' }}>{audio.name}</div>
              {audio.album && <div style={{ color: '#b0b0ff', fontSize: 15, textAlign: 'left', width: '100%' }}>Álbum: {audio.album}</div>}
            </div>
          )}
        </>
      ) : (
        <div style={{ color: '#aaa', width: '90%' }}>Selecciona una canción</div>
      )}
    </div>
  );
}
