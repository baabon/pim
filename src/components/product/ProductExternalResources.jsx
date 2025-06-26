import React from 'react';
import { Accordion, AccordionSummary, AccordionDetails, Typography, Box, Button } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

function ProductExternalResources({ url }) {
  return (
    <>
      <Accordion defaultExpanded={true} sx={{ borderRadius: '8px !important', boxShadow: 'none', border: '1px solid #eee' }}>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon sx={{ color: '#546a7b' }} />}
          aria-controls="panel7a-content"
          id="panel7a-header"
          sx={{
            bgcolor: '#fcfcfc',
            borderBottom: '1px solid #eee',
            minHeight: '60px',
            '&.Mui-expanded': { minHeight: '60px' },
            '& .MuiAccordionSummary-content': { my: 1 },
            borderRadius: '8px 8px 0 0 !important',
            '&:hover': {
              backgroundColor: '#fcfcfc',
            },
            '& .MuiButtonBase-root': {
              outline: 'none !important',
              boxShadow: 'none !important',
            },
            '&.Mui-focused': {
              backgroundColor: '#fcfcfc',
              outline: 'none !important',
              boxShadow: 'none !important',
            },
            '&.Mui-focusVisible': {
              outline: 'none !important',
              boxShadow: 'none !important',
            },
            border: 'none',
          }}
        >
          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              fontSize: '18px',
              color: '#555',
              display: 'flex',
              alignItems: 'center',
              '&::before': {
                content: '""',
                display: 'block',
                width: '12px',
                height: '3px',
                bgcolor: '#21E0B2',
                borderRadius: '2px',
                mr: 1,
              }
            }}
          >
            Recursos Externos
          </Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ p: { xs: 2, sm: 3 } }}>
          {url ? (
          <Button
            variant="contained"
            href={`https://precision.tech/${url}`}
            target="_blank"
            rel="noopener noreferrer"
            sx={{
              backgroundColor: '#0a1a28',
              textTransform: 'none',
              borderRadius: '8px',
              '&:hover': {
                backgroundColor: '#21E0B2',
                transform: 'translateY(-2px)',
              },
              transition: 'all 0.3s ease-in-out',
              fontSize: '14px'
            }}
          >
            Ir a la página del producto
          </Button>
          ) : (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontStyle: 'italic', fontSize: '0.9rem' }}>
                Este producto no tiene url disponible, ya que no ha sido o no ha estado publicado en la web.
            </Typography>
          )}
        </AccordionDetails>
      </Accordion>
    </>
  );
}

export default ProductExternalResources;
