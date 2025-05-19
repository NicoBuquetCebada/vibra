import React, { useState } from 'react';
import { IconButton } from '@mui/material';
import RepeatIcon from '@mui/icons-material/Repeat';

const RepostButton: React.FC = () => {
  const [shared, setShared] = useState(false);

  return (
    <IconButton
      onClick={() => setShared(!shared)}

    >
      <RepeatIcon sx={{ color: shared ? '#32CD32' : 'rgba(61, 61, 61, 0.3)' }} />
    </IconButton>
  );
};

export default RepostButton;
