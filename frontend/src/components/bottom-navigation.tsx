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
        backgroundColor: '#145a96',
        paddingTop: '8px',
        paddingBottom: '8px',
      }}
    >
      <BottomNavigationAction icon={<HomeIcon sx={{ color: '#fff' }} />} onClick={() => handleNavigation('/home')} />
      <BottomNavigationAction icon={<SearchIcon sx={{ color: '#fff' }} />} onClick={() => handleNavigation('/search')} />
      <BottomNavigationAction icon={<AddCircleIcon sx={{ fontSize: '2rem', color: '#fff' }} />} onClick={() => handleNavigation('/upload')} />
      <BottomNavigationAction icon={<NotificationsIcon sx={{ color: '#fff' }} />} onClick={() => handleNavigation('/notifications')} />
      <BottomNavigationAction icon={<PersonIcon sx={{ color: '#fff' }} />} onClick={() => handleNavigation('/profile')} />
    </BottomNavigation>
  );
};

export default BottomNav;
