import Logo from "../assets/react.svg";

export const mockSongs = Array.from({ length: 50 }, (_, index) => ({
  id: index + 1,
  title: index % 2 === 0 ? `Canción 2` : `Canción`, // Alterna entre "Canción 2" y "Canción"
  audioSrc: index % 2 === 0 ? "/cancion.mp3" : "/cancion2.mp3", // Alterna entre dos archivos de audio
  username: `Usuario ${index + 1}`,
  profilePic: `/images/user${(index % 5) + 1}.jpg`, // Alternando imágenes de perfil
  coverImg: Logo, // Solo algunas canciones tienen portada
  description: `Descripción de la canción ${index + 1}.`,
  likes: Math.floor(Math.random() * 500),
  comments: Math.floor(Math.random() * 200),
  shares: Math.floor(Math.random() * 100),
}));
