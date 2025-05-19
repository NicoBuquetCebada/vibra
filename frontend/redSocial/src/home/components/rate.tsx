import React, { useState } from 'react';
import { Box, IconButton } from '@mui/material';
import MusicNoteIcon from '@mui/icons-material/MusicNote';

const Rate: React.FC = () => {
  const [rating, setRating] = useState(0);

  const handleRating = (value: number) => {
    setRating(prev => (prev === value ? 0 : value)); // ✅ Si hace clic en la misma nota, resetea la selección
  };

  return (
    <Box sx={{ display: 'flex', gap: 0 }}>
      {[...Array(5)].map((_, i) => (
        <IconButton
          key={i}
          onClick={() => handleRating(i + 1)}
          sx={{
            padding: 0,}}
        >
          <MusicNoteIcon
            sx={{
              color: (rating) > i ? '#307cbe' : 'rgba(61, 61, 61, 0.3)',
            }}
          />
        </IconButton>
      ))}
    </Box>
  );
};

export default Rate;
