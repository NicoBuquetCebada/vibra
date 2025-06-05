import React, { useState, useEffect } from 'react';
import { IconButton, Tooltip, CircularProgress } from '@mui/material';
import RepeatIcon from '@mui/icons-material/Repeat';
import { getPostMetrics, repostPost, deleteRepost } from '../../api';

interface RepostButtonProps {
  postId: number;
  isReposted?: boolean;
  onRepost?: () => void;
}

const RepostButton: React.FC<RepostButtonProps> = ({ postId, isReposted, onRepost }) => {
  const [reposted, setReposted] = useState(isReposted || false);
  const [loading, setLoading] = useState(false);

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
    setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  return (
    <Tooltip title={reposted ? "Quitar repost" : "Hacer repost"} arrow placement="top">
      <IconButton
        onClick={handleRepost}
        disabled={loading}
        sx={{
          color: reposted ? 'rgb(0, 255, 81)' : '#757575',
          transition: 'all 0.2s ease-in-out',
        }}
      >
        {loading ? (
          <CircularProgress size={24} />
        ) : (
          <RepeatIcon />
        )}
      </IconButton>
    </Tooltip>
  );
};

export default RepostButton;
