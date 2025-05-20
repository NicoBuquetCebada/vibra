import React, { useState } from 'react';
import { IconButton } from '@mui/material';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import BookmarkIcon from '@mui/icons-material/Bookmark';

const SaveButton: React.FC = () => {
  const [saved, setSaved] = useState(false);

  return (
    <IconButton
      onClick={() => setSaved(!saved)}

    >
      {saved ? (
        <BookmarkIcon sx={{ color: '#FFD700' }} />
      ) : (
        <BookmarkBorderIcon sx={{ color: 'rgba(61, 61, 61, 0.3)' }} />
      )}
    </IconButton>
  );
};

export default SaveButton;
