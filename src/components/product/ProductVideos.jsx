import React, { useRef } from 'react';
import {
  Accordion, AccordionSummary, AccordionDetails, Typography, Box,
  Grid, Paper, TextField, Button, IconButton,
  Snackbar,
  Alert,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';


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

import { useProductVideoData } from '../../hooks/useProductVideoData.js';


function SortableVideo({ videoItem, id, index, onDelete, sku, getYouTubeThumbnailFunc, isReadOnly }) {
  const { url, videoId } = videoItem;
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
  };

  const thumbnailUrl = videoId && getYouTubeThumbnailFunc ? getYouTubeThumbnailFunc(videoId) : null;

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
          width: '100%',
          '@media (min-width: 768px)': {
              width: '150px',
          },
          position: 'relative',
        }}
      >
        <Box
          sx={{
            width: '100%',
            height: '100px',
            bgcolor: '#000',
            borderRadius: '4px',
            marginBottom: '8px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            overflow: 'hidden',
            position: 'relative',
            cursor: isReadOnly ? 'default' : 'grab',
            touchAction: isReadOnly ? 'none' : 'auto',
          }}
          {...(isReadOnly ? {} : attributes)}
          {...(isReadOnly ? {} : listeners)}
        >
          {thumbnailUrl ? (
            <img
              src={thumbnailUrl}
              alt={`${sku}_${index + 1}`}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
          ) : (
            <PlayCircleOutlineIcon sx={{ fontSize: 50, color: 'rgba(255,255,255,0.7)' }} />
          )}
           <IconButton
            aria-label="view video"
            onClick={() => window.open(url, '_blank')}
            sx={{
              position: 'absolute',
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
              },
              color: 'white',
              padding: '8px',
              zIndex: 2,
            }}
          >
            <PlayCircleOutlineIcon sx={{ fontSize: 30 }} />
          </IconButton>
        </Box>
        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, overflowWrap: 'break-word', flexGrow: 1 }}>
          {`${sku}_${index + 1}`}
        </Typography>
        <Button
          variant="contained"
          size="small"
          onClick={() => window.open(url, '_blank')}
          sx={{ mt: 1, backgroundColor: '#0a1a28', '&:hover': { backgroundColor: '#21E0B2' }, transition: 'all 0.3s ease-in-out', textTransform: 'none' }}
        >
          Ver Video
        </Button>
        {!isReadOnly && (
          <IconButton
            aria-label="delete video"
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

function DraggableItemOverlay({ activeId, videoLinks, sku, getYouTubeThumbnailFunc }) {
  const activeVideo = videoLinks.find(item => item.id === activeId);

  if (!activeVideo) return null;

  const thumbnailUrl = activeVideo.videoId && getYouTubeThumbnailFunc ? getYouTubeThumbnailFunc(activeVideo.videoId) : null;
  const activeIndex = videoLinks.indexOf(activeVideo);

  return (
    <Paper
      sx={{
        p: 1,
        textAlign: 'center',
        boxShadow: '0 8px 25px rgba(0,0,0,0.2)',
        borderRadius: '8px',
        width: '150px',
        '@media (max-width: 767px)': {
            width: 'calc(100% - 16px)',
        },
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'center',
        bgcolor: 'background.paper',
        cursor: 'grabbing',
      }}
    >
      <Box sx={{
        width: '100%',
        height: '100px',
        bgcolor: '#000',
        borderRadius: '4px',
        marginBottom: '8px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        position: 'relative',
      }}>
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt="Video Preview"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        ) : (
          <PlayCircleOutlineIcon sx={{ fontSize: 50, color: 'rgba(255,255,255,0.7)' }} />
        )}
      </Box>
      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
        {`${sku}_${activeIndex + 1}`}
      </Typography>
    </Paper>
  );
}


function ProductVideos({ 
  sku, 
  status, 
  userRole,
  userEmail,
  users,
  productVideos: initialProductVideos = [] 
}) {
  const isReadOnly = (status === 'pending_approval' || status === 'published') ||
                     (userRole === 'default_user') ||
                     (userRole === 'product_manager' && !users.some(user => user.email === userEmail));

  const {
    videoLinks,
    newVideoUrl,
    setNewVideoUrl,
    activeVideoDragId,
    handleVideoUrlChange,
    handleAddVideo,
    handleDeleteVideo,
    handleVideoDragStart,
    handleVideoDragEnd,
    handleVideoDragCancel,
    snackbarOpen,
    snackbarMessage,
    snackbarSeverity,
    handleSnackbarClose,
    MAX_VIDEOS_TOTAL,
    getYouTubeThumbnail,
  } = useProductVideoData(initialProductVideos);

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

  const sortableVideoIds = videoLinks.map(v => v.id);

  return (
    <Accordion defaultExpanded={true} sx={{ borderRadius: '8px !important', boxShadow: 'none', border: '1px solid #eee' }}>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon sx={{ color: '#546a7b' }} />}
        aria-controls="panel-videos-content"
        id="panel-videos-header"
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
          Videos
        </Typography>
      </AccordionSummary>
      <AccordionDetails sx={{ p: { xs: 2, sm: 3 } }}>
        {isReadOnly ? (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontStyle: 'italic', fontSize: '0.9rem' }}>
            Los videos no se pueden modificar cuando el producto está en este estado o es posible que no tengas los permisos suficientes.
          </Typography>
        ) : (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontStyle: 'italic', fontSize: '0.9rem' }}>
            Agregue enlaces de videos de YouTube para este producto. Los videos se pueden reordenar arrastrándolos. Máximo {MAX_VIDEOS_TOTAL} videos.
          </Typography>
        )}

        {!isReadOnly && (
          <Box sx={{ display: 'flex', gap: 1, mb: 3, flexDirection: { xs: 'column', sm: 'row' } }}>
            <TextField
              label="Enlace de YouTube"
              variant="outlined"
              size="small"
              fullWidth
              value={newVideoUrl}
              onChange={handleVideoUrlChange}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleAddVideo()
                }
              }}
            />
            <Button
              variant="contained"
              onClick={handleAddVideo}
              startIcon={<AddCircleOutlineIcon />}
              disabled={videoLinks.length >= MAX_VIDEOS_TOTAL}
              sx={{
                backgroundColor: '#0a1a28',
                '&:hover': { backgroundColor: '#21E0B2' },
                textTransform: 'none',
                whiteSpace: 'nowrap',
                flexShrink: 0,
                width: { xs: '100%', sm: 'auto' },
              }}
            >
              Agregar Video
            </Button>
          </Box>
        )}

        {videoLinks.length === 0 && (
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', my: 2 }}>
            No hay videos agregados.
          </Typography>
        )}

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={isReadOnly ? null : handleVideoDragStart}
          onDragEnd={isReadOnly ? null : handleVideoDragEnd}
          onDragCancel={isReadOnly ? null : handleVideoDragCancel}
        >
          <SortableContext
            items={sortableVideoIds}
            strategy={rectSortingStrategy}
            disabled={isReadOnly}
          >
            <Grid container spacing={2}>
              {videoLinks.map((videoItem, index) => (
                <SortableVideo
                  key={videoItem.id}
                  id={videoItem.id}
                  videoItem={videoItem}
                  index={index}
                  onDelete={handleDeleteVideo}
                  sku={sku}
                  getYouTubeThumbnailFunc={getYouTubeThumbnail}
                  isReadOnly={isReadOnly}
                />
              ))}
            </Grid>
          </SortableContext>

          <DragOverlay>
            {activeVideoDragId && !isReadOnly ? (
              <DraggableItemOverlay
                activeId={activeVideoDragId}
                videoLinks={videoLinks}
                sku={sku}
                getYouTubeThumbnailFunc={getYouTubeThumbnail}
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

export default ProductVideos;