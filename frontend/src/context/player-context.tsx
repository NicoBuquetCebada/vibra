import React, { createContext, useContext, useState } from 'react';

interface Song {
  id: number;
  title: string;
  audioSrc: string;
  profilePic: string;
  username: string;
  coverImg?: string;
}

interface PlayerContextProps {
  currentSong: Song | null;
  setCurrentSong: (song: Song) => void;
}

const PlayerContext = createContext<PlayerContextProps | undefined>(undefined);

export const PlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentSong, setCurrentSong] = useState<Song | null>(null);

  return (
    <PlayerContext.Provider value={{ currentSong, setCurrentSong }}>
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
};