import React from 'react';
import {
  Typography,
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

function ProductGeneral({ product }) {
  return (
    <>
      {product && (
        <Accordion defaultExpanded={true} sx={{ borderRadius: '8px !important', boxShadow: 'none', border: '1px solid #eee' }}>
            <AccordionSummary
            expandIcon={<ExpandMoreIcon sx={{ color: '#546a7b' }} />}
            aria-controls="panel1a-content"
            id="panel1a-header"
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
                Datos Generales
            </Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ p: { xs: 2, sm: 3 } }}>
            <Box sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                gap: 2
            }}>
                <Typography variant="body1" sx={{ color: '#444', fontSize: '14px' }}>
                <Box component="span" sx={{ fontWeight: 600, color: '#0a1a28' }}>Marca:</Box> {product.brand}
                </Typography>
                <Typography variant="body1" sx={{ color: '#444', fontSize: '14px' }}>
                <Box component="span" sx={{ fontWeight: 600, color: '#0a1a28' }}>Área:</Box> {product.area}
                </Typography>
                <Typography variant="body1" sx={{ color: '#444', fontSize: '14px' }}>
                <Box component="span" sx={{ fontWeight: 600, color: '#0a1a28' }}>Familia:</Box> {product.family}
                </Typography>
                <Typography variant="body1" sx={{ color: '#444', fontSize: '14px' }}>
                <Box component="span" sx={{ fontWeight: 600, color: '#0a1a28' }}>Subfamilia:</Box> {product.subfamily}
                </Typography>
            </Box>
            </AccordionDetails>
        </Accordion>
      )}
    </>
  );
}

export default ProductGeneral;