import React, { createContext, useContext, useState } from 'react';

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
}

const PlayerContext = createContext<PlayerContextProps | undefined>(undefined);

export const PlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [playlist, setPlaylistState] = useState<Song[]>([]);
  const [playlistIndex, setPlaylistIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const setPlaylist = (songs: Song[]) => {
    console.log('Configurando playlist:', songs);
    setPlaylistState(songs);
  };

  return (
    <PlayerContext.Provider
      value={{
        playlist,
        setPlaylist,
        playlistIndex,
        setPlaylistIndex,
        isPlaying,
        setIsPlaying,
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