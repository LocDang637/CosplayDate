import React from 'react';
import { Container, Paper, Fade } from '@mui/material';
import FormHeader from './FormHeader';

const FormContainer = ({ children, title, subtitle, maxWidth = "sm" }) => {
  return (
    <Container maxWidth={maxWidth}>
      <Fade in timeout={800}>
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, sm: 4, md: 5 },
            borderRadius: '24px',
            background: 'linear-gradient(145deg, #FFFFFF 0%, #FEFEFE 100%)',
            border: '1px solid rgba(233, 30, 99, 0.08)',
            boxShadow: '0 20px 40px rgba(233, 30, 99, 0.1)',
            backdropFilter: 'blur(10px)',
            maxWidth: maxWidth === "sm" ? '500px' : 'auto',
          }}
        >
          <FormHeader title={title} subtitle={subtitle} />
          {children}
        </Paper>
      </Fade>
    </Container>
  );
};

export default FormContainer;