import React, { createContext, useContext, useState, useRef, useEffect } from 'react';

export interface Song {
  id: number;
  title: string;
  audioSrc: string;
  profilePic: string;
  username: string;
  coverImg?: string;
  description?: string;
  likes?: number;
  comments?: number;
  shares?: number;
  postId?: number;
}

interface PlayerContextProps {
  playlist: Song[];
  setPlaylist: (songs: Song[]) => void;
  playlistIndex: number;
  setPlaylistIndex: (idx: number) => void;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  globalAudioRef: React.RefObject<HTMLAudioElement | null>;
  currentTime: number;
  duration: number;
  progress: number;
  volume: number;
  setVolume: (volume: number) => void;
}

const PlayerContext = createContext<PlayerContextProps | undefined>(undefined);

export const PlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [playlist, setPlaylistState] = useState<Song[]>([]);
  const [playlistIndex, setPlaylistIndexState] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [progress, setProgress] = useState(0);
  const [volume, setVolumeState] = useState(50);
  
  const globalAudioRef = useRef<HTMLAudioElement | null>(null);

  const setPlaylist = (songs: Song[]) => {
    console.log('Configurando playlist:', songs);
    setPlaylistState(songs);
  };

  const setPlaylistIndex = (idx: number) => {
    setPlaylistIndexState(idx);
  };

  const setVolume = (newVolume: number) => {
    setVolumeState(newVolume);
    if (globalAudioRef.current) {
      globalAudioRef.current.volume = newVolume / 100;
    }
  };

  // ✅ CORREGIR: Inicialización del audio UNA SOLA VEZ
  useEffect(() => {
    if (!globalAudioRef.current) {
      const audio = new Audio();
      audio.preload = 'metadata';
      audio.volume = volume / 100;
      globalAudioRef.current = audio;
      
      // ✅ Event listeners PERSISTENTES con referencias actualizadas
      const handleLoadedMetadata = () => {
        console.log('Audio cargado, duración:', audio.duration);
        setDuration(audio.duration || 0);
      };

      const handleTimeUpdate = () => {
        const current = audio.currentTime || 0;
        const total = audio.duration || 1;
        setCurrentTime(current);
        setProgress((current / total) * 100);
      };

      const handleEnded = () => {
        console.log('Canción terminada');
        // Usar una función que acceda al estado actual
        setPlaylistIndexState(prevIndex => {
          setPlaylistState(prevPlaylist => {
            if (prevIndex < prevPlaylist.length - 1) {
              return prevPlaylist; // No cambiar la playlist
            }
            setIsPlaying(false);
            return prevPlaylist;
          });
          return prevIndex < playlist.length - 1 ? prevIndex + 1 : prevIndex;
        });
      };

      const handleCanPlay = () => {
        console.log('Audio listo para reproducir');
        // Solo reproducir si el estado dice que debería estar reproduciéndose
      };

      const handleError = (e: Event) => {
        console.error('Error de audio:', e);
        setIsPlaying(false);
      };

      // ✅ Agregar más eventos para debugging
      audio.addEventListener('loadstart', () => console.log('Iniciando carga de audio'));
      audio.addEventListener('loadedmetadata', handleLoadedMetadata);
      audio.addEventListener('timeupdate', handleTimeUpdate);
      audio.addEventListener('ended', handleEnded);
      audio.addEventListener('canplay', handleCanPlay);
      audio.addEventListener('error', handleError);

      console.log('Audio global inicializado con event listeners');
    }
    
    // ✅ NO retornar cleanup aquí, solo al desmontar el provider
    return undefined;
  }, []); // ✅ Array vacío para que solo se ejecute UNA vez

  // ✅ Cambiar canción cuando cambia el índice o la playlist
  useEffect(() => {
    if (globalAudioRef.current && playlist[playlistIndex]) {
      const currentSong = playlist[playlistIndex];
      const audio = globalAudioRef.current;
      
      console.log('Cambiando a canción:', currentSong.title, 'Audio src:', currentSong.audioSrc);
      
      // ✅ Solo resetear si la canción realmente cambió
      const songChanged = audio.src !== currentSong.audioSrc;
      
      if (songChanged) {
        // ✅ Resetear estados solo cuando cambia la canción
        setCurrentTime(0);
        setDuration(0);
        setProgress(0);
        
        // ✅ Cambiar la fuente del audio
        audio.src = currentSong.audioSrc;
        audio.currentTime = 0;
        
        // ✅ Cuando cambia la canción, siempre reproducir automáticamente
        setIsPlaying(true);
        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              console.log('Nueva canción reproduciéndose automáticamente');
            })
            .catch(error => {
              console.error('Error al reproducir nueva canción:', error);
              setIsPlaying(false);
            });
        }
      }
    }
  }, [playlistIndex, playlist]); // ✅ Remover isPlaying de las dependencias

  // ✅ Manejar play/pause
  useEffect(() => {
    if (globalAudioRef.current && playlist.length > 0) {
      const audio = globalAudioRef.current;
      
      if (isPlaying) {
        // ✅ Solo reproducir si no está ya reproduciéndose
        if (audio.paused) {
          const playPromise = audio.play();
          if (playPromise !== undefined) {
            playPromise
              .then(() => {
                console.log('Reproducción iniciada');
              })
              .catch(error => {
                console.error('Error al reproducir:', error);
                setIsPlaying(false);
              });
          }
        }
      } else {
        audio.pause();
        console.log('Reproducción pausada');
      }
    }
  }, [isPlaying]); // ✅ Remover playlist.length para evitar conflictos

  // ✅ Cleanup al desmontar el provider
  useEffect(() => {
    return () => {
      if (globalAudioRef.current) {
        const audio = globalAudioRef.current;
        audio.pause();
        audio.src = '';
        console.log('Audio limpiado al desmontar provider');
      }
    };
  }, []);

  return (
    <PlayerContext.Provider
      value={{
        playlist,
        setPlaylist,
        playlistIndex,
        setPlaylistIndex,
        isPlaying,
        setIsPlaying,
        globalAudioRef,
        currentTime,
        duration,
        progress,
        volume,
        setVolume,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayer = () => {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error('usePlayer debe usarse dentro de PlayerProvider');
  return ctx;
};