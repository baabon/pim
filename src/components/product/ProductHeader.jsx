import React, { useRef, useEffect } from 'react';
import {
  Paper,
  Typography,
  Box,
  Chip,
  Button,
  IconButton,
  Tooltip,
  TextField,
  LinearProgress,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';

import ProductActionButtons from './ProductActionButtons.jsx';
import {
  PLACEHOLDER_IMAGE,
  ESTADO_COLORS,
  ESTADO_DISPLAY_NAMES,
  PRODUCT_TYPE_COLORS,
  INITIAL_PRODUCT_GALLERY_DATA
} from '../../utils/constants.js';

export default function ProductHeader({
  currentProduct,
  onBack,
  isEditingName,
  editableProductName,
  setEditableProductName,
  handleEditNameClick,
  status,
  mainScrollRef,
  showProgressBar,
  loadingAction,
  handleSave,
  handleReject,
  handleUnpublish,
  handleRequestApproval,
  handlePublish,
  handleReturnToEdit,
  userRole,
  userEmail,
  users
}) {
  const [isHeaderCompact, setIsHeaderCompact] = React.useState(false);
  const headerRef = useRef(null);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    const scrollElement = mainScrollRef.current;
    if (!scrollElement) return;

    const handleScroll = () => {
      setIsHeaderCompact(scrollElement.scrollTop > 100);
    };

    scrollElement.addEventListener('scroll', handleScroll);
    return () => scrollElement.removeEventListener('scroll', handleScroll);
  }, [mainScrollRef]);

  const getProgressBarMessage = () => {
    switch (loadingAction) {
      case 'publish': return 'Publicando producto...';
      case 'unpublish': return 'Despublicando producto...';
      case 'save': return 'Guardando datos...';
      case 'request_approval': return 'Enviando solicitud de aprobación...';
      case 'return_to_edit': return 'Regresando a edición...';
      case 'reject': return 'Rechazando producto...';
      default: return 'Procesando...';
    }
  };

  const productImageSrc =
    (currentProduct?.gallery && currentProduct.gallery.length > 0 && currentProduct.gallery[0]?.image_path)
      ? currentProduct.gallery[0].image_path
      : (INITIAL_PRODUCT_GALLERY_DATA.length > 0
          ? INITIAL_PRODUCT_GALLERY_DATA[0]
          : PLACEHOLDER_IMAGE);

  return (
    <>
      {/* Sección superior: Botón de volver y botones de acción (cuando el header NO es compacto) */}
      {!isHeaderCompact && (
        <Box sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: { xs: 2, sm: 3 },
          flexDirection: { xs: 'column', sm: 'row' },
          gap: { xs: 2, sm: 0 },
        }}>
          <Button
            variant="outlined"
            onClick={onBack}
            startIcon={<ArrowBackIcon />}
            sx={{
              color: '#546a7b',
              borderColor: '#d0d7de',
              textTransform: 'none',
              borderRadius: '8px',
              '&:hover': {
                borderColor: '#21E0B2',
                color: '#21E0B2',
                backgroundColor: 'rgba(33, 224, 178, 0.05)',
                transform: 'translateX(-5px)',
              },
              transition: 'all 0.3s ease-in-out',
              width: { xs: '100%', sm: 'auto' },
            }}
          >
            Volver a la lista de productos
          </Button>

          <ProductActionButtons
            status={status}
            showProgressBar={showProgressBar}
            handleSave={handleSave}
            handleReject={handleReject}
            handleUnpublish={handleUnpublish}
            handleRequestApproval={handleRequestApproval}
            handlePublish={handlePublish}
            hasBeenPublished={currentProduct?.published}
            handleReturnToEdit={handleReturnToEdit}
            isCompact={false}
            userRole={userRole}
            userEmail={userEmail}
            users={users}
          />
        </Box>
      )}

      <Paper
        ref={headerRef}
        sx={{
          p: isHeaderCompact ? { xs: 1.5, sm: 2 } : { xs: 3, sm: 4, md: 5 },
          borderRadius: '12px',
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.08)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: isHeaderCompact ? 'space-between' : 'flex-start',
          gap: { xs: 1, sm: 2 },
          position: 'sticky',
          top: 0,
          zIndex: 1000,
          bgcolor: '#fff',
          transition: 'padding 0.3s ease-in-out, box-shadow 0.3s ease-in-out, margin-bottom 0.3s ease-in-out, border-bottom 0.3s ease-in-out',
          borderBottom: isHeaderCompact ? '1px solid #eee' : 'none',
          marginBottom: isHeaderCompact ? '20px' : '0',
          flexWrap: isHeaderCompact ? 'wrap' : 'nowrap',
        }}
      >
        {isHeaderCompact && (
          <Box sx={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            gap: { xs: 1, sm: 2 },
            flexGrow: 1,
            justifyContent: 'flex-start',
            flexBasis: { xs: '100%', sm: 'auto' },
            order: 1,
            width: '100%',
            flexWrap: 'wrap',
          }}>
            <Button
              variant="outlined"
              onClick={onBack}
              startIcon={<ArrowBackIcon />}
              sx={{
                color: '#546a7b',
                borderColor: '#d0d7de',
                textTransform: 'none',
                borderRadius: '8px',
                '&:hover': {
                  borderColor: '#21E0B2',
                  color: '#21E0B2',
                  backgroundColor: 'rgba(33, 224, 178, 0.05)',
                  transform: 'translateX(-5px)',
                },
                transition: 'all 0.3s ease-in-out',
                fontSize: '0.75rem',
                padding: '4px 8px',
                flexShrink: 0,
              }}
            >
              Volver
            </Button>
            <Box sx={{ ml: 'auto', display: 'flex', gap: 1, flexShrink: 0 }}>
              <ProductActionButtons
                status={status}
                showProgressBar={showProgressBar}
                handleSave={handleSave}
                handleReject={handleReject}
                handleUnpublish={handleUnpublish}
                handleRequestApproval={handleRequestApproval}
                handlePublish={handlePublish}
                hasBeenPublished={currentProduct?.published}
                isCompact={true}
                handleReturnToEdit={handleReturnToEdit}
                userRole={userRole}
                userEmail={userEmail}
                users={users}
              />
            </Box>
          </Box>
        )}

        {/* Sección de Detalles del Producto (Imagen, Nombre, SKU, Chips) */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: isMobile ? (isHeaderCompact ? 'row' : 'column') : 'row',
            alignItems: 'flex-start',
            gap: { xs: 1, sm: 3 },
            width: isHeaderCompact ? 'auto' : '100%',
            flexGrow: isHeaderCompact ? 1 : 0,
            minWidth: 0,
            order: isHeaderCompact ? 2 : 0,
            mt: isHeaderCompact ? { xs: 1, sm: 0 } : 0,
            ml: isHeaderCompact ? { sm: 2 } : 0,
          }}>
          <Box sx={{ position: 'relative', flexShrink: 0 }}>
            {(currentProduct?.published) && (
              <Tooltip title="Este producto está publicado y visible en la página web" placement="right" disableFocusListener disableHoverListener={isMobile} disableTouchListener={false} enterTouchDelay={0} leaveTouchDelay={1500}>
                <Box sx={{ position: 'absolute', top: -4, left: -4, width: 16, height: 16, bgcolor: '#21E0B2', borderRadius: '50%', border: '2px solid #fff', boxShadow: '0 0 0 2px rgba(33, 224, 178, 0.5)', cursor: 'pointer' }} />
              </Tooltip>
            )}
            <img src={productImageSrc} alt={currentProduct?.sku || 'Product image'} style={{ width: isHeaderCompact ? 60 : 120, height: isHeaderCompact ? 60 : 120, objectFit: 'cover', borderRadius: '10px', boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)', transition: 'width 0.3s ease-in-out, height 0.3s ease-in-out' }} />
          </Box>
          
          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
              
              {isEditingName ? (
                <TextField
                  value={editableProductName}
                  onChange={(e) => setEditableProductName(e.target.value)}
                  variant="standard"
                  autoFocus
                  fullWidth
                  sx={{
                    '& .MuiInput-underline:before': { borderBottom: '2px solid #21E0B2' },
                    '& .MuiInput-input': { p: 1, fontSize: isHeaderCompact ? '1.2rem' : '1.6rem', fontWeight: 700, color: '#333', height: 'auto' },
                    flexGrow: 1,
                    transition: 'font-size 0.3s ease-in-out',
                  }}
                />
              ) : (
                <>
                  <Typography
                    variant="h4"
                    component="h1"
                    gutterBottom
                    sx={{
                      fontWeight: 700,
                      color: '#333',
                      fontSize: isHeaderCompact ? '1.2rem' : '1.6rem',
                      mb: { xs: 0.5, sm: 1 },
                      flexGrow: 1,
                      maxWidth: 'max-content',
                    }}
                  >
                    {currentProduct?.name || 'Cargando...'}
                  </Typography>
                  <IconButton onClick={handleEditNameClick} sx={{ mb: { xs: 0.5, sm: 1.2 }, flexShrink: 0, padding: isHeaderCompact ? '4px' : '8px', transition: 'padding 0.3s ease-in-out' }}>
                    <EditIcon sx={{ color: '#546a7b', fontSize: isHeaderCompact ? '1rem' : '1.25rem', transition: 'font-size 0.3s ease-in-out' }} />
                  </IconButton>
                </>
              )}
            </Box>

            <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 500, fontSize: isHeaderCompact ? '0.7rem' : '0.8rem', transition: 'font-size 0.3s ease-in-out' }}>
              SKU: <Box component="span" sx={{ color: '#0a1a28', fontWeight: 600, fontSize: isHeaderCompact ? '0.7rem' : '0.8rem', transition: 'font-size 0.3s ease-in-out' }}>
                {currentProduct?.sku || 'N/A'}
              </Box>
            </Typography>
            <Box sx={{ display: 'flex', gap: '8px', mt: '10px' }}>
              <Chip label={`Producto ${currentProduct?.product_type?.name || 'Tipo Desconocido'}`} color={PRODUCT_TYPE_COLORS[currentProduct?.product_type?.code] || 'default'} sx={{ fontWeight: 600, fontSize: isHeaderCompact ? '0.7rem' : '0.8rem', height: isHeaderCompact ? '20px' : '24px', '& .MuiChip-label': { paddingLeft: isHeaderCompact ? '6px' : '12px', paddingRight: isHeaderCompact ? '6px' : '12px', transition: 'padding 0.3s ease-in-out' }, transition: 'font-size 0.3s ease-in-out, height 0.3s ease-in-out' }} />
              <Chip label={ESTADO_DISPLAY_NAMES[status] || 'Estado Desconocido'} color={ESTADO_COLORS[status] || 'default'} sx={{ fontWeight: 600, fontSize: isHeaderCompact ? '0.7rem' : '0.8rem', height: isHeaderCompact ? '20px' : '24px', '& .MuiChip-label': { paddingLeft: isHeaderCompact ? '6px' : '12px', paddingRight: isHeaderCompact ? '6px' : '12px', transition: 'padding 0.3s ease-in-out' }, transition: 'font-size 0.3s ease-in-out, height 0.3s ease-in-out' }} />
            </Box>
          </Box>
        </Box>
        {showProgressBar && (
          <Box sx={{ width: '100%', mt: isHeaderCompact ? 1 : 2, mb: isHeaderCompact ? 0 : 2 }}>
            <LinearProgress sx={{ height: 10, borderRadius: 5, bgcolor: '#e0e0e0', '& .MuiLinearProgress-bar': { bgcolor: '#21E0B2' } }} />
            <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 1, fontSize: isHeaderCompact ? '0.7rem' : '0.8rem' }}>
              {getProgressBarMessage()} Por favor, espere.
            </Typography>
          </Box>
        )}
      </Paper>
    </>
  );
}