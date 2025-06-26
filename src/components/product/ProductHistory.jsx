import React from 'react';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Avatar,
  Chip,
  Grid
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

import { ESTADO_COLORS } from '../../utils/constants.js';

function ProductHistory({ history, loadingHistory, errorHistory }) {
  const [expanded, setExpanded] = React.useState(false);

  const handleChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded);
  };

  return (
    <>
      <Accordion expanded={expanded} onChange={handleChange('panel7a')} sx={{ borderRadius: '8px !important', boxShadow: 'none', border: '1px solid #eee' }}>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon sx={{ color: '#546a7b' }} />}
          aria-controls="panel7a-content"
          id="panel7a-header"
          sx={{
            bgcolor: '#fcfcfc',
            borderBottom: expanded ? '1px solid #eee' : 'none',
            minHeight: '60px',
            '&.Mui-expanded': { minHeight: '60px' },
            '& .MuiAccordionSummary-content': { my: 1, display: 'flex', alignItems: 'center' },
            borderRadius: expanded ? '8px 8px 0 0 !important' : '8px !important', 
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
              flexGrow: 1,
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
            Historial
          </Typography>
          {!expanded && (
            <Typography variant="caption" color="text.secondary" sx={{ ml: 2, fontStyle: 'italic', fontSize: '0.8rem' }}>
              Expanda esta sección para ver el historial de cambios de estado.
            </Typography>
          )}
        </AccordionSummary>
        <AccordionDetails sx={{ p: { xs: 2, sm: 3 } }}>
          {loadingHistory && (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', my: 2 }}>
              <CircularProgress size={24} />
            </Box>
          )}

          {errorHistory && (
            <Alert severity="error" sx={{ mb: 2 }}>
              Error al cargar el historial: {errorHistory}
            </Alert>
          )}

          {!loadingHistory && !errorHistory && history.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontStyle: 'italic', fontSize: '0.9rem' }}>
                No hay registro histórico de cambios para este producto.
            </Typography>
          ) : (
            <Box>
              {history.map((entry, index) => (
                <Box
                  key={entry.id || index}
                  sx={{
                    mb: 2, pb: 2, borderBottom: '1px solid #eee',
                    '&:last-child': { borderBottom: 'none' },
                    display: 'flex', flexDirection: 'column', gap: 1
                  }}
                >
                  <Grid container spacing={5} alignItems="start">
                    <Grid item xs={12} sm={4}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar
                          alt={entry.user?.full_name || entry.user?.email || 'Usuario'}
                          src={entry.user?.picture || ''}
                          sx={{ width: 40, height: 40, border: '1px solid #ddd' }}
                        >
                          {!entry.user?.picture && (entry.user?.full_name?.[0] || entry.user?.email?.[0] || '?').toUpperCase()}
                        </Avatar>
                        <Box>
                          <Typography variant="body1" sx={{ fontWeight: 600, color: '#333' }}>
                            {entry.user?.full_name}
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 400, color: '#333', fontSize: '12px' }}>
                            {entry.user?.email}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {entry.created_at ? format(new Date(entry.created_at), 'dd MMM HH:mm', { locale: es }) : 'Fecha desconocida'}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>

                    <Grid item xs={12} sm={8}>
                      <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                        <Chip
                          label={entry.old_status?.name || 'Estado Inicial'}
                          size="small"
                          color={ESTADO_COLORS[entry.old_status?.code] || 'default'}
                          sx={{ fontWeight: 'bold' }}
                        />
                        <Typography variant="body2" sx={{ mx: 0.5, color: '#666', fontWeight: 'bold' }}>
                          →
                        </Typography>
                        <Chip
                          label={entry.new_status?.name || 'Estado Final'}
                          size="small"
                          color={ESTADO_COLORS[entry.new_status?.code] || 'default'}
                          sx={{ fontWeight: 'bold' }}
                        />
                      </Box>
                    </Grid>
                  </Grid>

                  {entry.message && (
                    <Box sx={{ mt: 1, p: 1.5, bgcolor: '#fff0f0', borderLeft: '4px solid #f44336', borderRadius: '4px' }}>
                      <Typography variant="body2" sx={{ color: '#c00', fontStyle: 'italic', fontSize: '0.85rem' }}>
                        Comentario de Rechazo: "{entry.message}"
                      </Typography>
                    </Box>
                  )}
                </Box>
              ))}
            </Box>
          )}
        </AccordionDetails>
      </Accordion>
    </>
  );
}

export default ProductHistory;