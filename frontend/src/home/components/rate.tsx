import React, { useState, useEffect } from 'react';
import { Box, IconButton } from '@mui/material';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import { getPostMetrics, ratePost } from '../../api';

interface RateProps {
  postId: number;
}

const Rate: React.FC<RateProps> = ({ postId }) => {
  const [rating, setRating] = useState(0);
  const [isInitialRating, setIsInitialRating] = useState(false);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const metrics = await getPostMetrics(postId);
        setRating(metrics.rate);
        setIsInitialRating(metrics.rate > 0);    } catch (error) {
      if (error instanceof Error) {
        console.error('Error al obtener métricas:', error.message);
      }
    }
    };
    fetchMetrics();
  }, [postId]);

  const handleRating = async (value: number) => {
    if (isInitialRating) return; // No permitir cambios si ya hay un rating inicial

    try {
      await ratePost(postId, value);
      setRating(value);
      setIsInitialRating(true);
    } catch (error) {
      if (error instanceof Error) {
        console.error('Error al calificar post:', error.message);
      }
      // Revertir el estado local si falla la llamada API
      const metrics = await getPostMetrics(postId);
      setRating(metrics.rate);
    }
  };

  return (
    <Box sx={{ display: 'flex', gap: 0 }}>
      {[...Array(5)].map((_, i) => (
        <IconButton
          key={i}
          onClick={() => handleRating(i + 1)}
          sx={{
            padding: 0,
          }}
        >
          <MusicNoteIcon
            sx={{
              color: rating > i ? '#307cbe' : 'rgba(61, 61, 61, 0.3)',
            }}
          />
        </IconButton>
      ))}
    </Box>
  );
};

export default Rate;
