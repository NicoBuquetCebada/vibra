import React, { useState, useEffect } from 'react';
import { IconButton } from '@mui/material';
import RepeatIcon from '@mui/icons-material/Repeat';
import { getPostMetrics, repostPost, deleteRepost } from '../../api';

interface RepostButtonProps {
  postId: number;
  isReposted?: boolean;
  onRepost?: () => void;
}

const RepostButton: React.FC<RepostButtonProps> = ({ postId, isReposted, onRepost }) => {
  const [reposted, setReposted] = useState(isReposted || false);

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
        console.log(`Llamando a deleteRepost para el postId: ${postId}`);
        await deleteRepost(postId);
        setReposted(false);
      } else {
        console.log(`Llamando a repostPost para el postId: ${postId}`);
        await repostPost(postId);
        setReposted(true);
      }
      if (onRepost) {
        onRepost();
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
