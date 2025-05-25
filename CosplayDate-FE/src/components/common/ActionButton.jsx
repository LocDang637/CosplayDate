import React from 'react';
import { Button, CircularProgress } from '@mui/material';

const ActionButton = ({ children, onClick, loading = false, disabled = false, ...props }) => {
  return (
    <Button
      fullWidth
      variant="contained"
      size="large"
      onClick={onClick}
      disabled={loading || disabled}
      sx={{
        background: 'linear-gradient(45deg, #E91E63, #9C27B0)',
        color: 'white',
        fontSize: '16px',
        fontWeight: 600,
        py: 1.5,
        position: 'relative',
        '&:hover': {
          background: 'linear-gradient(45deg, #AD1457, #7B1FA2)',
        },
        '&:disabled': {
          background: 'rgba(233, 30, 99, 0.3)',
          color: 'rgba(255, 255, 255, 0.7)',
        },
      }}
      {...props}
    >
      {loading && (
        <CircularProgress
          size={20}
          sx={{
            color: 'white',
            position: 'absolute',
            left: '50%',
            top: '50%',
            marginLeft: '-10px',
            marginTop: '-10px',
          }}
        />
      )}
      <span style={{ opacity: loading ? 0 : 1 }}>
        {children}
      </span>
    </Button>
  );
};

export default ActionButton;