import React, { useState, useEffect } from 'react';
import { IconButton } from '@mui/material';
import RepeatIcon from '@mui/icons-material/Repeat';
import { getPostMetrics, repostPost, deleteRepost } from '../../api';

interface RepostButtonProps {
  postId: number;
}

const RepostButton: React.FC<RepostButtonProps> = ({ postId }) => {
  const [reposted, setReposted] = useState(false);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const metrics = await getPostMetrics(postId);
        setReposted(metrics.reposted);
      } catch (error) {
        console.error('Error fetching metrics:', error);
      }
    };
    fetchMetrics();
  }, [postId]);

  const handleRepost = async () => {
    try {
      if (reposted) {
        // Si ya está reposteado, eliminarlo
        await deleteRepost(postId);
        setReposted(false);
      } else {
        // Si no está reposteado, repostearlo
        await repostPost(postId);
        setReposted(true);
      }
    } catch (error) {
      console.error('Error:', error);
      // Revertir el estado local si falla la llamada API
      const metrics = await getPostMetrics(postId);
      setReposted(metrics.reposted);
    }
  };

  return (
    <IconButton
      onClick={handleRepost}
      sx={{
        color: reposted ? '#00bcd4' : 'rgba(61, 61, 61, 0.3)',
        transition: 'color 0.2s ease',
      }}
    >
      <RepeatIcon />
    </IconButton>
  );
};

export default RepostButton;
