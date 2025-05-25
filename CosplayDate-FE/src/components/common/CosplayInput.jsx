import React from 'react';
import { TextField, InputAdornment, IconButton } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';

const CosplayInput = ({ 
  label, 
  type = "text", 
  value, 
  onChange, 
  error, 
  helperText, 
  required = false,
  icon,
  showPassword,
  onTogglePassword,
  onKeyPress,
  ...props 
}) => {
  return (
    <TextField
      fullWidth
      label={label}
      type={type}
      value={value}
      onChange={onChange}
      onKeyPress={onKeyPress}
      error={!!error}
      helperText={error || helperText}
      required={required}
      InputProps={{
        startAdornment: icon && (
          <InputAdornment position="start">
            {icon}
          </InputAdornment>
        ),
        endAdornment: type === 'password' && (
          <InputAdornment position="end">
            <IconButton
              aria-label="toggle password visibility"
              onClick={onTogglePassword}
              edge="end"
              sx={{ color: 'text.secondary' }}
            >
              {showPassword ? <VisibilityOff /> : <Visibility />}
            </IconButton>
          </InputAdornment>
        ),
      }}
      {...props}
    />
  );
};

export default CosplayInput;