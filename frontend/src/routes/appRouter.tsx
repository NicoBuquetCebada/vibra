import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext } from '../context/auth-context'; // Importa el AuthContext
import Login from '../login/compents/login'; // Importa tu componente Login
import Signup from '../login/compents/signup'; // Importa tu componente Signup
import MusicHome from '../home/home'; // Importa tu componente MusicHome
import CreatePost from '../post/post';
import UserPage from '../user/user';
import OtherUserPage from '../user/otherUserPage'; // Importa tu componente OtherUserPage
import SettingsPage from '../user/SettingsPage'; // Importa tu componente SettingsPage
import PostPage from '../post/PostPage';
import UserListPage from '../user/UserListPage';
import NotificationList from '../notifications/NotificationList'; // Importa el componente

const AppRouter: React.FC = () => {
  const authContext = useContext(AuthContext);

  if (!authContext) {
    throw new Error('AuthContext must be used within an AuthProvider');
  }

  const { isLoggedIn } = authContext;

  return (
    <Router>
      <Routes>
        {/* Ruta por defecto que redirige al login o home según estado */}
        <Route path="/" element={isLoggedIn ? <Navigate to="/home" /> : <Navigate to="/login" />} />
        <Route path="/login" element={!isLoggedIn ? <Login /> : <Navigate to="/home" />} />
        <Route path="/signup" element={<Signup />} />
        {/* Protege la ruta /home para usuarios autenticados */}
        <Route path="/home" element={isLoggedIn ? <MusicHome /> : <Navigate to="/login" />} />
        <Route path="/upload" element={isLoggedIn ? <CreatePost /> : <Navigate to="/login" />} />
        <Route path="/profile" element={isLoggedIn ? <UserPage /> : <Navigate to="/login" />} />
        <Route path="/profile/:username" element={isLoggedIn ? <OtherUserPage /> : <Navigate to="/login" />} />
        <Route path="/settings" element={isLoggedIn ? <SettingsPage /> : <Navigate to="/login" />} />
        <Route path="/post/:postId" element={isLoggedIn ? <PostPage /> : <Navigate to="/login" />} />
        <Route path="/profile/:username/followers" element={<UserListPage />} />
        <Route path="/profile/:username/followed" element={<UserListPage />} />
        <Route path="/notifications" element={isLoggedIn ? <NotificationList /> : <Navigate to="/login" />} />
      </Routes>
    </Router>
  );
};

export default AppRouter;
