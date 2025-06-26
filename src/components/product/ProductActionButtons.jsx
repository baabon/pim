import React from 'react';
import { Button, Box } from '@mui/material';

export default function ProductActionButtons({
  status,
  showProgressBar,
  handleSave,
  handleReject,
  handleUnpublish,
  handleRequestApproval,
  handlePublish,
  handleReturnToEdit,
  hasBeenPublished,
  isCompact = false,
  userRole,
  userEmail,
  users = []
}) {
  const canEdit = !(
    userRole === 'default_user' ||
    (userRole === 'product_manager' && !users.some(user => user.email === userEmail))
  );

  const isAdmin = userRole === 'administrator';

  const baseButtonStyles = {
    textTransform: 'none',
    borderRadius: '8px',
    transition: 'all 0.3s ease-in-out',
    '&:hover': {
      transform: 'translateY(-2px)',
    },
  };

  const compactButtonStyles = {
    minWidth: 'auto',
    padding: '4px 8px',
    fontSize: '0.75rem',
    height: '30px',
  };

  return (
    <Box sx={{
      display: 'flex',
      width: isCompact ? 'auto' : { xs: '100%', sm: 'auto' },
      justifyContent: isCompact ? 'flex-end' : { xs: 'space-between', sm: 'flex-end' },
      flexWrap: isCompact ? 'wrap' : 'nowrap',
      gap: isCompact ? { xs: 0.5, sm: 1 } : 1,
    }}>
      {/* Botón "Guardar" */}
      {status !== 'pending_approval' && status !== 'published' && canEdit && (
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={showProgressBar}
          sx={{
            ...baseButtonStyles,
            backgroundColor: '#0a1a28',
            color: '#fff',
            '&:hover': {
              backgroundColor: '#1e384d',
            },
            flexGrow: isCompact ? 0 : { xs: 1, sm: 0 },
            ...(isCompact && compactButtonStyles),
          }}
        >
          Guardar
        </Button>
      )}

      {/* Botón "Despublicar" - solo si usuario es administrador y published es true */}
      {hasBeenPublished && isAdmin && (
        <Button
          variant="contained"
          onClick={handleUnpublish}
          disabled={showProgressBar}
          sx={{
            ...baseButtonStyles,
            backgroundColor: '#9a9a9a',
            color: '#fff',
            '&:hover': {
              backgroundColor: '#7a7a7a',
            },
            ...(isCompact && compactButtonStyles),
          }}
        >
          Despublicar
        </Button>
      )}

      {/* Botón "Rechazar" - solo se muestra si usuario es administrador y está pendiente de aprobación */}
      {status === 'pending_approval' && isAdmin && (
        <Button
          variant="contained"
          onClick={handleReject}
          disabled={showProgressBar}
          sx={{
            ...baseButtonStyles,
            backgroundColor: '#dc3545',
            color: '#fff',
            '&:hover': {
              backgroundColor: '#c82333',
            },
            flexGrow: isCompact ? 0 : { xs: 1, sm: 0 },
            ...(isCompact && compactButtonStyles),
          }}
        >
          Rechazar
        </Button>
      )}

      {/* Botón "Solicitar aprobación" - no se debe mostrar si userRole es default_user o si (es product_manager y userEmail no está en la lista de emails) o si el usuario es administrador. */}
      { (status === 'draft' || status === 'editing' || status === 'deactivated') && canEdit && !isAdmin && (
        <Button
          variant="contained"
          onClick={handleRequestApproval}
          disabled={showProgressBar}
          sx={{
            ...baseButtonStyles,
            backgroundColor: '#0a1a28',
            color: '#fff',
            '&:hover': { backgroundColor: '#21E0B2' },
            width: isCompact ? 'auto' : { xs: 1, sm: 'auto' },
            ...(isCompact && compactButtonStyles),
          }}
        >
          Solicitar aprobación
        </Button>
      )}

      {/* Botón "Publicar" - solo se muestra si usuario es administrador y si tiene status draft, editing o deactivated */}
        {isAdmin && (status === 'pending_approval' || status === 'draft' || status === 'editing' || status === 'deactivated') && (
        <Button
          variant="contained"
          onClick={handlePublish}
          disabled={showProgressBar}
          sx={{
            ...baseButtonStyles,
            backgroundColor: '#21E0B2',
            color: '#fff',
            '&:hover': { backgroundColor: '#1aab8a' },
            width: isCompact ? 'auto' : { xs: 1, sm: 'auto' },
            ...(isCompact && compactButtonStyles),
          }}
        >
          Publicar
        </Button>
      )}

      {/* Botón "Volver a edición" - no se debe mostrar si userRole es default_user o si (es product_manager y userEmail no está en la lista de emails) */}
      {status === 'published' && canEdit && (
        <Button
          variant="contained"
          onClick={handleReturnToEdit}
          disabled={showProgressBar}
          sx={{
            ...baseButtonStyles,
            backgroundColor: '#0a1a28',
            color: '#fff',
            '&:hover': { backgroundColor: '#1e384d' },
            width: isCompact ? 'auto' : { xs: 1, sm: 'auto' },
            ...(isCompact && compactButtonStyles),
          }}
        >
          Volver a edición
        </Button>
      )}
    </Box>
  );
}