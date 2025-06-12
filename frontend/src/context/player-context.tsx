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

  useEffect(() => {
    if (!globalAudioRef.current) {
      const audio = new Audio();
      audio.preload = 'metadata';
      audio.volume = volume / 100;
      globalAudioRef.current = audio;
      
      const handleLoadedMetadata = () => {
        setDuration(audio.duration || 0);
      };

      const handleTimeUpdate = () => {
        const current = audio.currentTime || 0;
        const total = audio.duration || 1;
        setCurrentTime(current);
        setProgress((current / total) * 100);
      };

      const handleEnded = () => {
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
      };

      const handleError = (e: Event) => {
        console.error('Error de audio:', e);
        setIsPlaying(false);
      };

      audio.addEventListener('loadedmetadata', handleLoadedMetadata);
      audio.addEventListener('timeupdate', handleTimeUpdate);
      audio.addEventListener('ended', handleEnded);
      audio.addEventListener('canplay', handleCanPlay);
      audio.addEventListener('error', handleError);
    }
    
   
    return undefined;
  }, []);

 
  useEffect(() => {
    if (globalAudioRef.current && playlist[playlistIndex]) {
      const currentSong = playlist[playlistIndex];
      const audio = globalAudioRef.current;
      
      const songChanged = audio.src !== currentSong.audioSrc;
      
      if (songChanged) {
       
        setCurrentTime(0);
        setDuration(0);
        setProgress(0);
        
       
        audio.src = currentSong.audioSrc;
        audio.currentTime = 0;
        
       
        setIsPlaying(true);
        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
            })
            .catch(error => {
              console.error('Error al reproducir nueva canción:', error);
              setIsPlaying(false);
            });
        }
      }
    }
  }, [playlistIndex, playlist]);

  useEffect(() => {
    if (globalAudioRef.current && playlist.length > 0) {
      const audio = globalAudioRef.current;
      
      if (isPlaying) {
       
        if (audio.paused) {
          const playPromise = audio.play();
          if (playPromise !== undefined) {
            playPromise
              .then(() => {
              })
              .catch(error => {
                console.error('Error al reproducir:', error);
                setIsPlaying(false);
              });
          }
        }
      } else {
        audio.pause();
      }
    }
  }, [isPlaying]);

 
  useEffect(() => {
    return () => {
      if (globalAudioRef.current) {
        const audio = globalAudioRef.current;
        audio.pause();
        audio.src = '';
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