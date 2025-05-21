import React, { useEffect, useState, useRef, useCallback } from 'react';
import { getToken, removeToken } from '../auth';
import PostModal from '../components/PostModal';
import AudioPlayer from '../components/AudioPlayer';

const API_URL = 'http://localhost:8080/api/home';

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [audio, setAudio] = useState(null);
  const scrollRef = useRef();

  const fetchPosts = useCallback(async (pageNum) => {
    setLoading(true);
    try {
      const token = getToken();
      const url = `${API_URL}?page=${pageNum}`;
      console.log('[API] GET', url);
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.status === 401) {
        removeToken();
        window.location.href = '/';
        return;
      }
      const data = await res.json();
      setPosts(prev => pageNum === 0 ? data : [...prev, ...data]);
      setHasMore(data.length === 6);
    } catch (e) {
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts(page);
  }, [page, fetchPosts]);

  // Scroll infinito
  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el || loading || !hasMore) return;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 10) {
      setPage(p => p + 1);
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden', background: '#23242b', position: 'relative' }}>
      <button
        style={{
          position: 'fixed', top: 20, left: 12, zIndex: 2000,
          background: '#3a7bd5', color: '#fff', border: 'none', borderRadius: 6,
          padding: '0.5em 1.2em', cursor: 'pointer', fontWeight: 'bold',
          boxShadow: '0 2px 8px #0002', letterSpacing: 1
        }}
        onClick={() => {
          removeToken();
          window.location.href = '/';
        }}
      >
        Cerrar sesión
      </button>
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        style={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          height: '100vh',
          paddingRight: 20,
          background: '#262c36',
          boxShadow: 'none',
          position: 'relative'
        }}
      >
        {posts.map((post, i) => (
          <PostModal key={i} post={post} onPlay={setAudio} />
        ))}
        {loading && <div style={{ color: '#bbb' }}>Cargando...</div>}
        {!hasMore && <div style={{ color: '#888' }}>No hay más publicaciones.</div>}
      </div>
      <AudioPlayer audio={audio} />
      {/* Barra de navegación inferior global */}
      <nav style={{
        position: 'fixed',
        left: 0,
        right: 0,
        bottom: 0,
        height: 70,
        background: 'rgba(42, 51, 66, 0.98)',
        borderTop: '1.5px solid #2a3342',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
      }}>
        <button
          onClick={() => window.location.href = '/upload'}
          style={{
            width: 54,
            height: 54,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #3a7bd5 60%, #60a5fa 100%)',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 12px #0005',
            cursor: 'pointer',
            transition: 'transform 0.15s',
          }}
          title="Subir publicación"
        >
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="16" cy="16" r="16" fill="rgba(255,255,255,0.13)" />
            <rect x="14" y="8" width="4" height="16" rx="2" fill="#fff" />
            <rect x="8" y="14" width="16" height="4" rx="2" fill="#fff" />
          </svg>
        </button>
      </nav>
    </div>
  );
}
