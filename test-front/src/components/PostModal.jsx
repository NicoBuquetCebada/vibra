import React from 'react';

function SongList({ songs, albumName, onPlay }) {
  return (
    <ul style={{ listStyle: 'none', padding: 0 }}>
      {songs.map((song, idx) => (
        <li key={idx} style={{ marginBottom: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ textAlign: 'left' }}>{song.name}</span>
          <button
            className="play-btn"
            onClick={() => onPlay({ ...song, album: albumName })}
            title="Reproducir"
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 32, marginLeft: 22 }}
          >
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <polygon points="8,5 28,16 8,27" fill="#fff" />
            </svg>
          </button>
        </li>
      ))}
    </ul>
  );
}

export default function PostModal({ post, onPlay }) {
  const isAlbum = post.content === 'album' && post.album;
  const isSong = post.content === 'song' && post.song;

  if (post.repostUser) {
    return (
      <div style={{
        background: post.repostUser ? '#31384a' : '#2a3342',
        color: '#fff',
        borderRadius: 16,
        margin: '36px 0',
        padding: '28px 20px 24px 20px',
        boxShadow: '0 2px 8px #0004',
        maxWidth: 420,
        width: 420,
        minHeight: 600,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
      }}>
        {/* Repost user arriba, más pequeño */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
          <img src={post.repostUser.profileImg} alt="repost-user" style={{ width: 28, height: 28, borderRadius: '50%', marginRight: 8 }} />
          <div style={{ fontSize: 14, color: '#bbb' }}>
            <span style={{ fontWeight: 500 }}>{post.repostUser.name}</span>
            <span style={{ color: '#aaa', marginLeft: 6 }}>ha reposteado</span>
          </div>
        </div>
        {/* Línea separadora */}
        <div style={{ borderTop: '1.5px solid #2a3342', margin: '10px 0 16px 0', width: '100%' }} />
        {/* User del post debajo, más grande */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
          <img src={post.user.profileImg} alt="user" style={{ width: 40, height: 40, borderRadius: '50%', marginRight: 10 }} />
          <span style={{ fontWeight: 'bold', fontSize: 18 }}>{post.user.name}</span>
          <span style={{ marginLeft: 'auto', fontSize: 12, color: '#bbb' }}>{new Date(post.createdAt).toLocaleString()}</span>
        </div>
        {post.coverImg && (
          <img src={post.coverImg} alt="cover" style={{ width: '100%', height: 320, objectFit: 'cover', borderRadius: 12, margin: '0 0 18px 0', display: 'block', border: '2px solid #3a7bd5' }} />
        )}
        {isSong && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontWeight: 'bold', textAlign: 'left' }}>{post.song.name}</div>
            <button
              className="play-btn"
              onClick={() => onPlay({ ...post.song, coverImg: post.coverImg, user: post.user })}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 36, marginLeft: 22 }}
              title="Reproducir"
            >
              <svg width="38" height="38" viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg">
                <polygon points="10,7 32,19 10,31" fill="#fff" />
              </svg>
            </button>
          </div>
        )}
        {isAlbum && (
          <div>
            <div style={{ fontWeight: 'bold', marginBottom: 8 }}>{post.album.name}</div>
            <SongList songs={post.album.songs} albumName={post.album.name} onPlay={onPlay} />
          </div>
        )}
      </div>
    );
  }

  // Post normal
  return (
    <div style={{
      background: '#353646',
      color: '#fff',
      borderRadius: 16,
      margin: '36px 0',
      padding: '28px 20px 24px 20px',
      boxShadow: '0 2px 8px #0004',
      maxWidth: 420,
      width: 420,
      minHeight: 600,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'stretch',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
        <img src={post.user.profileImg} alt="user" style={{ width: 40, height: 40, borderRadius: '50%', marginRight: 10 }} />
        <span style={{ fontWeight: 'bold', fontSize: 18 }}>{post.user.name}</span>
        <span style={{ marginLeft: 'auto', fontSize: 12, color: '#bbb' }}>{new Date(post.createdAt).toLocaleString()}</span>
      </div>
      {post.coverImg && (
        <img src={post.coverImg} alt="cover" style={{ width: '100%', height: 320, objectFit: 'cover', borderRadius: 12, margin: '0 0 18px 0', display: 'block', border: '2px solid #3a7bd5' }} />
      )}
      {isSong && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontWeight: 'bold', textAlign: 'left' }}>{post.song.name}</div>
          <button
            className="play-btn"
            onClick={() => onPlay({ ...post.song, coverImg: post.coverImg, user: post.user })}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 36, marginLeft: 22 }}
            title="Reproducir"
          >
            <svg width="38" height="38" viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg">
              <polygon points="10,7 32,19 10,31" fill="#fff" />
            </svg>
          </button>
        </div>
      )}
      {isAlbum && (
        <div>
          <div style={{ fontWeight: 'bold', marginBottom: 8 }}>{post.album.name}</div>
          <SongList songs={post.album.songs.map(song => ({ ...song, coverImg: post.coverImg, user: post.user }))} albumName={post.album.name} onPlay={onPlay} />
        </div>
      )}
    </div>
  );
}
