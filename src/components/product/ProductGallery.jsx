import React from 'react';
import {
  Paper,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Grid,
  IconButton,
  Snackbar,
  Alert,
  Box,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { useProductGalleryData } from '../../hooks/useProductGalleryData.js';


function SortableImage({ imagePath, id, index, sku, onDelete, isReadOnly }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: id, disabled: isReadOnly });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
    zIndex: isDragging ? 10 : 'auto',
    cursor: isReadOnly ? 'default' : (isDragging ? 'grabbing' : 'grab'),
    position: 'relative',
    width: '165px',
    height: '100%',
  };

  const handleDeleteClick = () => {
    if (!isReadOnly) {
      onDelete(id);
    }
  };

  return (
    <Grid
      item
      xs={12}
      sm={4}
      md={3}
      ref={setNodeRef}
      style={style}
      sx={{
        '@media (max-width: 767px)': {
          width: '100%',
          flexBasis: '100%',
          maxWidth: '100%',
        },
      }}
    >
      <Paper
        sx={{
          p: 1,
          textAlign: 'center',
          boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
          borderRadius: '8px',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'relative',
        }}
      >
        <img
          src={imagePath}
          alt={`${sku}_${index + 1}`}
          style={{
            width: '150px',
            height: '150px',
            objectFit: 'contain',
            borderRadius: '4px',
            marginBottom: '8px',
            touchAction: isReadOnly ? 'none' : 'auto',
          }}
          draggable="false"
          {...(isReadOnly ? {} : attributes)}
          {...(isReadOnly ? {} : listeners)}
        />
        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
          {`${sku}_${index + 1}`}
        </Typography>
        {!isReadOnly && (
          <IconButton
            aria-label="delete image"
            onClick={handleDeleteClick}
            sx={{
              position: 'absolute',
              top: -10,
              right: -10,
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 1)',
              },
              color: 'error.main',
              padding: '4px',
              fontSize: '28px',
              zIndex: 11,
            }}
          >
            <CancelOutlinedIcon sx={{ fontSize: 'inherit' }} />
          </IconButton>
        )}
      </Paper>
    </Grid>
  );
}

function DraggableItemOverlay({ activeId, galleryImages, sku }) {
  const activeImage = galleryImages.find(imagePath => imagePath === activeId);

  if (!activeImage) {
    return null;
  }

  const activeIndex = galleryImages.indexOf(activeImage);

  return (
    <Paper
      sx={{
        p: 1,
        textAlign: 'center',
        boxShadow: '0 8px 25px rgba(0,0,0,0.2)',
        borderRadius: '8px',
        width: '165px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'center',
        bgcolor: 'background.paper',
        cursor: 'grabbing',
        '@media (max-width: 767px)': {
          width: 'calc(100% - 16px)',
        },
      }}
    >
      <img
        src={activeImage}
        alt={`${sku}_${activeIndex + 1}`}
        style={{
          width: '150px',
          height: '150px',
          objectFit: 'contain',
          borderRadius: '4px',
          marginBottom: '8px',
        }}
        draggable="false"
      />
      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
        {`${sku}_${activeIndex + 1}`}
      </Typography>
    </Paper>
  );
}

function ProductGallery({ 
  sku, 
  status, 
  userRole,
  userEmail,
  users,
  productGallery: initialProductGallery = [] 
}) {
  const isReadOnly = (status === 'pending_approval' || status === 'published') ||
                     (userRole === 'default_user') ||
                     (userRole === 'product_manager' && !users.some(user => user.email === userEmail));

  const {
    galleryImages,
    activeImageDragId,
    fileInputRef,
    isDragOver,
    setIsDragOver,
    snackbarOpen,
    snackbarMessage,
    snackbarSeverity,
    handleSnackbarClose,
    handleImageDragStart,
    handleImageDragEnd,
    handleImageDragCancel,
    handleUploadClick,
    handleFileChange,
    handleDeleteImage,
    handleContainerDragOver,
    handleContainerDragLeave,
    handleContainerDrop,
    MAX_GALLERY_IMAGES_TOTAL,
    MAX_GALLERY_IMAGE_SIZE_KB,
    REQUIRED_GALLERY_IMAGE_WIDTH,
    REQUIRED_GALLERY_IMAGE_HEIGHT,
  } = useProductGalleryData(initialProductGallery);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 2,
        delay: 50,
        tolerance: 5,
      },
      disabled: isReadOnly,
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
      disabled: isReadOnly,
    })
  );

  const sortableImageIds = galleryImages;

  return (
    <Accordion defaultExpanded={true} sx={{ borderRadius: '8px !important', boxShadow: 'none', border: '1px solid #eee' }}>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon sx={{ color: '#546a7b' }} />}
        aria-controls="panel6a-content"
        id="panel6a-header"
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
          Galería
        </Typography>
      </AccordionSummary>
      <AccordionDetails
        sx={{
          p: { xs: 2, sm: 3 },
          border: isReadOnly ? '2px dashed transparent' : (isDragOver ? '2px dashed #21E0B2' : '2px dashed transparent'),
          bgcolor: isReadOnly ? 'inherit' : (isDragOver ? '#e0fff0' : 'inherit'),
          transition: 'all 0.3s ease-in-out',
        }}
        onDragOver={isReadOnly ? null : handleContainerDragOver}
        onDragLeave={isReadOnly ? null : handleContainerDragLeave}
        onDrop={isReadOnly ? null : handleContainerDrop}
      >
        {isReadOnly ? (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontStyle: 'italic', fontSize: '0.9rem' }}>
            La galería de imágenes no se puede modificar cuando el producto está en este estado o es posible que no tengas los permisos suficientes.
          </Typography>
        ) : (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontStyle: 'italic', fontSize: '0.9rem' }}>
            Para cambiar el orden, arrastre una imagen y suéltela en la nueva posición. Puede arrastrar archivos JPG/JPEG aquí o hacer clic en el botón para subir.
          </Typography>
        )}

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={isReadOnly ? null : handleImageDragStart}
          onDragEnd={isReadOnly ? null : handleImageDragEnd}
          onDragCancel={isReadOnly ? null : handleImageDragCancel}
        >
          <SortableContext
            items={sortableImageIds}
            strategy={rectSortingStrategy}
            disabled={isReadOnly}
          >
            <Grid container spacing={2}>
              {galleryImages.map((imagePath, index) => (
                <SortableImage
                  key={imagePath}
                  id={imagePath}
                  imagePath={imagePath}
                  index={index}
                  sku={sku}
                  onDelete={handleDeleteImage}
                  isReadOnly={isReadOnly}
                />
              ))}
              {!isReadOnly && (
                <Grid
                  item
                  xs={12}
                  sm={4}
                  md={3}
                  sx={{
                    '@media (max-width: 767px)': {
                      width: '100%',
                      flexBasis: '100%',
                      maxWidth: '100%',
                    },
                  }}
                >
                  <Paper
                    sx={{
                      p: 1,
                      textAlign: 'center',
                      boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
                      borderRadius: '8px',
                      height: '100%',
                      minHeight: '200px',
                      width: '165px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      alignItems: 'center',
                      border: '2px dashed #e0e0e0',
                      bgcolor: '#f9f9f9',
                      cursor: 'pointer',
                      '&:hover': {
                        borderColor: '#21E0B2',
                        bgcolor: '#f0fff8',
                      },
                      transition: 'all 0.3s ease-in-out',
                      position: 'relative',
                      '@media (max-width: 767px)': {
                        width: '100%',
                      },
                    }}
                    onClick={handleUploadClick}
                  >
                    <input
                      type="file"
                      multiple
                      accept="image/jpeg,image/jpg"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      style={{ display: 'none' }}
                    />
                    <IconButton
                      color="primary"
                      sx={{
                        fontSize: 80,
                        color: '#21E0B2',
                        transition: 'all 0.3s ease-in-out',
                      }}
                    >
                      <AddCircleOutlineIcon sx={{ fontSize: 'inherit' }} />
                    </IconButton>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      Cargar imágenes
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem', mt: 0.5 }}>
                      Máx. {MAX_GALLERY_IMAGE_SIZE_KB} KB por archivo, {REQUIRED_GALLERY_IMAGE_WIDTH}x{REQUIRED_GALLERY_IMAGE_HEIGHT} px, {MAX_GALLERY_IMAGES_TOTAL} en total.
                    </Typography>
                  </Paper>
                </Grid>
              )}
            </Grid>
          </SortableContext>

          <DragOverlay>
            {activeImageDragId && !isReadOnly ? (
              <DraggableItemOverlay
                activeId={activeImageDragId}
                galleryImages={galleryImages}
                sku={sku}
              />
            ) : null}
          </DragOverlay>
        </DndContext>
      </AccordionDetails>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={5000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Accordion>
  );
}

export default ProductGallery;