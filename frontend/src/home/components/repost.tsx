import React, { useState, useEffect } from 'react';
import { IconButton } from '@mui/material';
import RepeatIcon from '@mui/icons-material/Repeat';
import { getPostMetrics, repostPost } from '../../api';

interface RepostButtonProps {
  postId: number;
}

const RepostButton: React.FC<RepostButtonProps> = ({ postId }) => {
  const [shared, setShared] = useState(false);
  const [isInitialRepost, setIsInitialRepost] = useState(false);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const metrics = await getPostMetrics(postId);
        setShared(metrics.reposted);
        setIsInitialRepost(metrics.reposted);
      } catch (error) {
        console.error('Error fetching metrics:', error);
      }
    };
    fetchMetrics();
  }, [postId]);

  const handleRepost = async () => {
    if (isInitialRepost) return; // No permitir cambios si ya está reposteado inicialmente

    try {
      await repostPost(postId);
      setShared(true);
      setIsInitialRepost(true);
    } catch (error) {
      console.error('Error:', error);
      // Revertir el estado local si falla la llamada API
      const metrics = await getPostMetrics(postId);
      setShared(metrics.reposted);
    }
  };

  return (
    <IconButton
      onClick={handleRepost}
      sx={{
        color: shared ? '#00bcd4' : 'rgba(61, 61, 61, 0.3)',
      }}
    >
      <RepeatIcon />
    </IconButton>
  );
};

export default RepostButton;
