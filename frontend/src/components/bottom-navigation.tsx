import React from 'react';
import { BottomNavigation, BottomNavigationAction } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import SearchIcon from '@mui/icons-material/Search';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import NotificationsIcon from '@mui/icons-material/Notifications';
import PersonIcon from '@mui/icons-material/Person';

interface BottomNavProps {
  handleNavigation: (path: string) => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ handleNavigation }) => {
  return (
    <BottomNavigation
      sx={{
        mt: 2,
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        width: '100%',
        zIndex: 1000,
        background: 'linear-gradient(90deg, #f7f7f7 0%, #e3e6ea 100%)', // Fondo gris neutro
        boxShadow: '0 -2px 16px 0 rgba(48,124,190,0.10)',
        borderTop: '1.5px solid #e0e7ef',
        paddingTop: '8px',
        paddingBottom: '8px',
        backdropFilter: 'blur(6px)',
      }}
    >
      <BottomNavigationAction icon={<HomeIcon sx={{ color: '#307cbe', transition: 'color 0.2s, transform 0.2s', '&:hover': { color: '#145a96', transform: 'scale(1.13) rotate(-8deg)' } }} />} onClick={() => handleNavigation('/home')} />
      <BottomNavigationAction icon={<SearchIcon sx={{ color: '#307cbe', transition: 'color 0.2s, transform 0.2s', '&:hover': { color: '#145a96', transform: 'scale(1.13) rotate(-8deg)' } }} />} onClick={() => handleNavigation('/search')} />
      <BottomNavigationAction icon={<AddCircleIcon sx={{ color: '#307cbe', transition: 'color 0.2s, transform 0.2s', '&:hover': { color: '#145a96', transform: 'scale(1.13) rotate(-8deg)' } }} />} onClick={() => handleNavigation('/upload')} />
      <BottomNavigationAction icon={<NotificationsIcon sx={{ color: '#307cbe', transition: 'color 0.2s, transform 0.2s', '&:hover': { color: '#145a96', transform: 'scale(1.13) rotate(-8deg)' } }} />} onClick={() => handleNavigation('/notifications')} />
      <BottomNavigationAction icon={<PersonIcon sx={{ color: '#307cbe', transition: 'color 0.2s, transform 0.2s', '&:hover': { color: '#145a96', transform: 'scale(1.13) rotate(-8deg)' } }} />} onClick={() => handleNavigation('/profile')} />
    </BottomNavigation>
  );
};

export default BottomNav;
