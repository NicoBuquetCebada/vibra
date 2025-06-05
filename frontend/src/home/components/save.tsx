import React, { useState, useEffect } from 'react';
import { IconButton, Tooltip, CircularProgress } from '@mui/material';
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
  const [loading, setLoading] = useState(false);

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
    setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  return (
    <Tooltip title={saved ? "Quitar de guardados" : "Guardar post"} arrow placement="top">
      <IconButton
        onClick={handleSave}
        disabled={loading}
        sx={{
          color: saved ? 'rgb(255, 230, 2)' : '#757575',
          transition: 'all 0.2s ease-in-out',
        }}
      >
        {loading ? (
          <CircularProgress size={24} />
        ) : saved ? (
          <BookmarkIcon />
        ) : (
          <BookmarkBorderIcon />
        )}
      </IconButton>
    </Tooltip>
  );
};

export default SaveButton;
