import React, { useState, useEffect } from 'react';
import { IconButton } from '@mui/material';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import { getPostMetrics, savePost } from '../../api';

interface SaveButtonProps {
  postId: number;
}

const SaveButton: React.FC<SaveButtonProps> = ({ postId }) => {
  const [saved, setSaved] = useState(false);
  const [isInitialSave, setIsInitialSave] = useState(false);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const metrics = await getPostMetrics(postId);
        setSaved(metrics.saved);
        setIsInitialSave(metrics.saved);
      } catch (error) {
        console.error('Error fetching metrics:', error);
      }
    };
    fetchMetrics();
  }, [postId]);

  const handleSave = async () => {
    if (isInitialSave) return; // No permitir cambios si ya está guardado inicialmente

    try {
      await savePost(postId);
      setSaved(true);
      setIsInitialSave(true);
    } catch (error) {
      console.error('Error:', error);
      // Revertir el estado local si falla la llamada API
      const metrics = await getPostMetrics(postId);
      setSaved(metrics.saved);
    }
  };

  return (
    <IconButton
      onClick={handleSave}
      sx={{
        color: saved ? '#307cbe' : 'rgba(61, 61, 61, 0.3)',
      }}
    >
      {saved ? <BookmarkIcon /> : <BookmarkBorderIcon />}
    </IconButton>
  );
};

export default SaveButton;
