import React, { useState, useEffect } from 'react';
import { Box, IconButton, Tooltip } from '@mui/material';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import { getPostMetrics, ratePost, updateRate } from '../../api';

interface RateProps {
  postId: number;
  value?: number;
  onRate?: (rate: number) => void;
}

const Rate: React.FC<RateProps> = ({ postId, onRate }) => {
  const [rating, setRating] = useState(0);
  const [hasRating, setHasRating] = useState(false);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const metrics = await getPostMetrics(postId);
        setRating(metrics.rate);
        setHasRating(metrics.rate > 0);
      } catch (error) {
        if (error instanceof Error) {
          console.error('Error al obtener métricas:', error.message);
        }
      }
    };
    fetchMetrics();
  }, [postId]);

  const handleRating = async (value: number) => {
    // Permitir cambio solo si es diferente al rating actual
    if (value === rating) return;

    try {
      if (hasRating) {
        // Solo actualiza el rate, no refresques la lista
        await updateRate(postId, value);
        setRating(value);
        // NO llames a onRateChange aquí
      } else {
        // Es un nuevo rate, refresca la lista
        await ratePost(postId, value);
        setHasRating(true);
        setRating(value);
        if (onRate) onRate(value);
      }
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
    <Tooltip title="Calificar" arrow placement="top">
      <Box sx={{ display: 'flex', gap: 0 }} onClick={(e) => e.stopPropagation()}>
        {[...Array(5)].map((_, i) => (
          <IconButton
            key={i}
            onClick={(e) => {
              e.stopPropagation();
              handleRating(i + 1);
            }}
            sx={{
              padding: 0,
            }}
          >
            <MusicNoteIcon
              sx={{
                color: rating > i ? '#307cbe' : 'rgba(61, 61, 61, 0.3)',
                transition: 'color 0.2s ease',
              }}
            />
          </IconButton>
        ))}
      </Box>
    </Tooltip>
  );
};

export default Rate;
