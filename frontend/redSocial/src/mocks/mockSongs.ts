export const mockSongs = Array.from({ length: 50 }, (_, index) => ({
    id: index + 1,
    title: `Canción ${index + 1}`,
    audioSrc: "/cancion.mp3",
    username: `Usuario ${index + 1}`,
    profilePic: `/images/user${(index % 5) + 1}.jpg`, // Alternando imágenes de perfil
    description: `Descripción de la canción ${index + 1}.`,
    likes: Math.floor(Math.random() * 500),
    comments: Math.floor(Math.random() * 200),
    shares: Math.floor(Math.random() * 100),
  }));
  