import React, { createContext, useContext, useState } from 'react';

interface Song {
  id: number;
  title: string;
  audioSrc: string;
  profilePic: string;
  username: string;
  coverImg?: string;
  postId: number;
  type?: string;
}

interface PlayerContextProps {
  currentSong: Song | null;
  setCurrentSong: (song: Song) => void;
  playlist: Song[];
  setPlaylist: (songs: Song[], startIndex?: number) => void;
  playlistIndex: number;
  setPlaylistIndex: (idx: number) => void;
}

const PlayerContext = createContext<PlayerContextProps | undefined>(undefined);

export const PlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [playlist, setPlaylistState] = useState<Song[]>([]);
  const [playlistIndex, setPlaylistIndex] = useState(0);

  const setPlaylist = (songs: Song[], startIndex = 0) => {
    setPlaylistState(songs);
    setPlaylistIndex(startIndex);
    setCurrentSong(songs[startIndex]);
  };

  return (
    <PlayerContext.Provider value={{
      currentSong,
      setCurrentSong,
      playlist,
      setPlaylist,
      playlistIndex,
      setPlaylistIndex
    }}>
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayer = () => {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error('usePlayer must be used within PlayerProvider');
  return ctx;
};