import React, { useEffect, useState } from 'react';
import { Container, Typography, List, ListItem, ListItemAvatar, Avatar, ListItemText, CircularProgress, Box } from '@mui/material';
import ListItemButton from '@mui/material/ListItemButton';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
// import BottomNav from '../components/bottom-navigation';
import { fetchWithAuth } from '../api';

interface SimpleUser {
  name: string;
  profile_img?: string;
}

const UserListPage: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const isFollowers = location.pathname.includes('followers');
  const [users, setUsers] = useState<SimpleUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const endpoint = isFollowers
          ? `/api/users/${username}/followers`
          : `/api/users/${username}/followed`;
        const res = await fetchWithAuth(endpoint);
        const data = await res.json();
        setUsers(data);
      } catch {
        setUsers([]);
      }
      setLoading(false);
    };
    if (username) fetchUsers();
  }, [isFollowers, username]);

  return (
    <Container maxWidth="sm" sx={{ pt: 4, pb: 10 }}>
      <Typography variant="h5" sx={{ mb: 3, textAlign: 'center' }}>
        {isFollowers ? 'Seguidores' : 'Seguidos'}
      </Typography>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : users.length === 0 ? (
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mt: 4 }}>
          No se encontraron usuarios.
        </Typography>
      ) : (
        <List>
          {users.map((user, idx) => (
            <ListItem key={idx} disablePadding>
              <ListItemButton onClick={() => navigate(`/profile/${user.name}`)}>
                <ListItemAvatar>
                  <Avatar src={user.profile_img || undefined}>
                    {!user.profile_img && user.name[0]?.toUpperCase()}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText primary={user.name} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      )}
      {/* <BottomNav handleNavigation={navigate} /> */}
    </Container>
  );
};

export default UserListPage;