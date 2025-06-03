import React, { useState, useEffect } from 'react';
import { IconButton } from '@mui/material';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import { getPostMetrics, savePost, deleteSave } from '../../api';

interface SaveButtonProps {
  postId: number;
  isSaved?: boolean;
  onSave?: () => void;
}

const SaveButton: React.FC<SaveButtonProps> = ({ postId, isSaved, onSave }) => {
  const [saved, setSaved] = useState(isSaved || false);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const metrics = await getPostMetrics(postId);
        setSaved(metrics.saved);
      } catch (error) {
        console.error('Error fetching metrics:', error);
      }
    };
    fetchMetrics();
  }, [postId]);

  const handleSave = async () => {
    try {
      if (saved) {
        // Si ya está guardado, eliminarlo
        await deleteSave(postId);
        setSaved(false);
      } else {
        // Si no está guardado, guardarlo
        await savePost(postId);
        setSaved(true);
      }
      if (onSave) {
        onSave(); // Llama a la función pasada por prop para refrescar saves
      }
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
        transition: 'color 0.2s ease',
      }}
    >
      {saved ? <BookmarkIcon /> : <BookmarkBorderIcon />}
    </IconButton>
  );
};

export default SaveButton;
