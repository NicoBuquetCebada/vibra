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
      const res = await fetch(`${API_URL}?page=${pageNum}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.status === 401) {
        removeToken();
        window.location.href = '/';
        return;
      }
      const data = await res.json();
      setPosts(prev => [...prev, ...data]);
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
          background: '#ff6b81', color: '#fff', border: 'none', borderRadius: 6,
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
          background: '#23242b',
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
    </div>
  );
}
