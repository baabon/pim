import React from 'react';
import {
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Box,
  Chip,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

function ProductPermissions({ users }) {
  const usersToDisplay = Array.isArray(users) ? users : [];
  const hasUsers = usersToDisplay.length > 0;

  return (
    <>
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
                Permisos
            </Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ p: { xs: 2, sm: 3 } }}>
                {hasUsers ? (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontStyle: 'italic', fontSize: '0.9rem' }}>
                        Los siguientes usuarios tienen acceso a editar este producto al estar asignados a su subfamilia:
                    </Typography>
                ) : (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontStyle: 'italic', fontSize: '0.9rem' }}>
                        No se encontraron usuarios relacionados a la subfamilia de este producto.
                    </Typography>
                )}
                
                <Box
                    sx={{
                        p: 1,
                        display: 'flex',
                        padding: 0,
                        flexWrap: 'wrap',
                        gap: 1,
                        mt: 1,
                    }}
                >
                    {usersToDisplay.map((user, index) => (
                        <Chip
                            key={index}
                            label={user.email}
                            variant="outlined"
                            size="small"
                            sx={{
                                fontSize: '0.8rem',
                                height: 24,
                                padding: '6px 14px',
                            }}
                        />
                    ))}
                </Box>
            </AccordionDetails>
        </Accordion>
    </>
  );
}

export default ProductPermissions;