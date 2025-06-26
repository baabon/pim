import React from 'react';
import {
  Accordion, AccordionSummary, AccordionDetails,
  Typography, Box, TextField,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

export default function ProductDescription({
  shortDescription,
  onShortDescriptionChange,
  description,
  onDescriptionChange,
  specifications,
  onSpecificationsChange,
  applications,
  onApplicationsChange,
  status,
  userRole,
  userEmail,
  users
}) {
  const renderEditableSection = (title, value, handleChange, maxLength = null) => {
    const displayValue = value === null || value === undefined ? '' : String(value);
    const currentLength = displayValue.length;
    const isReadOnly = (status === 'pending_approval' || status === 'published') ||
                       (userRole === 'default_user') ||
                       (userRole === 'product_manager' && !users.some(user => user.email === userEmail));

    const isLengthError = maxLength && currentLength > maxLength;

    return (
      <Accordion defaultExpanded={true} sx={{ borderRadius: '8px !important', boxShadow: 'none', border: '1px solid #eee' }}>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon sx={{ color: '#546a7b' }} />}
          aria-controls={`panel-${title.toLowerCase().replace(/\s/g, '-')}-content`}
          id={`panel-${title.toLowerCase().replace(/\s/g, '-')}-header`}
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
            {title}
          </Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ p: { xs: 2, sm: 3 } }}>
          {isReadOnly ? (
            <Typography sx={{ color: '#444', lineHeight: 1.6, fontSize: '14px', whiteSpace: 'pre-wrap' }}>
              {displayValue}
            </Typography>
          ) : (
            <Box>
              {title === "Descripción Corta" && (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontStyle: 'italic', fontSize: '0.9rem' }}>
                  Máximo 193 carácteres permitidos.
                </Typography>
              )}
              <TextField
                fullWidth
                multiline
                minRows={3}
                variant="outlined"
                value={displayValue}
                onChange={handleChange}
                inputProps={maxLength ? { maxLength: maxLength } : {}}
                helperText={maxLength ? `${currentLength}/${maxLength} caracteres` : ''}
                error={isLengthError}
                FormHelperTextProps={{
                  sx: { textAlign: 'right', mt: 0.5, color: isLengthError ? 'error.main' : 'text.secondary' }
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: '#ccc',
                    },
                    '&:hover fieldset': {
                      borderColor: '#999',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#21E0B2',
                    },
                  },
                  '& .MuiInputBase-input': {
                    color: '#444',
                    lineHeight: 1.6,
                    fontSize: '14px',
                  },
                }}
              />
            </Box>
          )}
        </AccordionDetails>
      </Accordion>
    );
  };

  return (
    <Box>
      {shortDescription !== null && renderEditableSection("Descripción Corta", shortDescription, onShortDescriptionChange, 193)}
      {description !== null && renderEditableSection("Descripción Larga", description, onDescriptionChange)}
      {specifications !== null && renderEditableSection("Especificaciones", specifications, onSpecificationsChange)}
      {applications !== null && renderEditableSection("Aplicaciones", applications, onApplicationsChange)}
    </Box>
  );
}