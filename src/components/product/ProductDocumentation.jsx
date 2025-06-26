import React from 'react';
import {
  Paper,
  Typography,
  Box,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Grid,
  IconButton,
  Snackbar,
  Alert,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
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

import { useProductDocumentationData } from '../../hooks/useProductDocumentationData.js';


function SortableDocument({ documentUrl, id, index, sku, onDelete, isReadOnly }) { // Pass isReadOnly prop
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id, disabled: isReadOnly });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
    zIndex: isDragging ? 10 : 'auto',
    cursor: isReadOnly ? 'default' : (isDragging ? 'grabbing' : 'grab'),
    position: 'relative',
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
      <Paper sx={{
        p: 1,
        textAlign: 'center',
        borderRadius: '8px',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        '@media (min-width: 768px)': {
            width: '165px',
        },
        position: 'relative',
      }}>
        <Box
          sx={{
            width: '100%',
            height: 150,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#fff',
            borderRadius: '4px',
            marginBottom: 1,
            cursor: isReadOnly ? 'default' : 'grab',
            touchAction: isReadOnly ? 'none' : 'auto',
          }}
          {...(isReadOnly ? {} : attributes)}
          {...(isReadOnly ? {} : listeners)}
        >
          <PictureAsPdfIcon sx={{ fontSize: 100, color: '#B80000' }} />
        </Box>
        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, overflowWrap: 'break-word' }}>{`${sku}_${index + 1}`}</Typography>
        <Button variant="contained" size="small" onClick={() => window.open(documentUrl, '_blank')} sx={{ mt: 1, backgroundColor: '#0a1a28', '&:hover': { backgroundColor: '#21E0B2' }, transition: 'all 0.3s ease-in-out', textTransform: 'none' }}>
          Visualizar PDF
        </Button>
        {!isReadOnly && (
          <IconButton onClick={handleDeleteClick} sx={{
            position: 'absolute',
            top: -10,
            right: -10,
            backgroundColor: 'rgba(255,255,255,0.9)',
            '&:hover': { backgroundColor: 'rgba(255,255,255,1)' },
            color: 'error.main',
            padding: 0.5,
            fontSize: 28,
            zIndex: 11,
          }}>
            <CancelOutlinedIcon sx={{ fontSize: 'inherit' }} />
          </IconButton>
        )}
      </Paper>
    </Grid>
  );
}

function DraggableItemOverlay({ activeId, documentationFiles, sku }) {
  const index = documentationFiles.indexOf(activeId);
  if (index === -1) return null;

  return (
    <Paper sx={{
      p: 1,
      textAlign: 'center',
      boxShadow: '0 8px 25px rgba(0,0,0,0.2)',
      borderRadius: '8px',
      width: '165px',
      '@media (max-width: 767px)': {
          width: 'calc(100% - 16px)',
      },
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      alignItems: 'center',
      bgcolor: 'background.paper',
      cursor: 'grabbing'
    }}>
      <Box sx={{
          width: '100%',
          height: 150,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#fff',
          borderRadius: '4px',
          marginBottom: 1,
        }}>
        <PictureAsPdfIcon sx={{ fontSize: 100, color: '#B80000' }} />
      </Box>
      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>{`${sku}_${index + 1}`}</Typography>
    </Paper>
  );
}

function ProductDocumentation({ 
  sku, 
  status, 
  userRole,
  userEmail,
  users,
  productDocumentation: initialProductDocumentation = [] 
}) {
  const isReadOnly = (status === 'pending_approval' || status === 'published') ||
                     (userRole === 'default_user') ||
                     (userRole === 'product_manager' && !users.some(user => user.email === userEmail));

  const {
    documentationFiles,
    activeDocumentDragId,
    fileInputRef,
    isDragOver,
    setIsDragOver,
    snackbarOpen,
    snackbarMessage,
    snackbarSeverity,
    handleSnackbarClose,
    handleDocumentDragStart,
    handleDocumentDragEnd,
    handleDocumentDragCancel,
    handleUploadClick,
    handleFileChange,
    handleContainerDrop,
    handleDeleteDocument,
    MAX_DOCUMENT_FILE_SIZE_MB,
    MAX_DOCUMENTS_TOTAL,
  } = useProductDocumentationData(initialProductDocumentation);

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

  const sortableDocumentIds = documentationFiles;

  return (
    <Accordion defaultExpanded sx={{ borderRadius: '8px !important', border: '1px solid #eee' }}>
      <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: '#546a7b' }} />}>
        <Typography variant="h6" sx={{ fontWeight: 600, fontSize: 18, color: '#555' }}>
          <Box component="span" sx={{ display: 'inline-block', width: 12, height: 3, bgcolor: '#21E0B2', borderRadius: 2, mr: 1 }} />
          Documentación
        </Typography>
      </AccordionSummary>
      <AccordionDetails
        onDragOver={isReadOnly ? null : (e) => { e.preventDefault(); setIsDragOver(true); }}
        onDragLeave={isReadOnly ? null : () => setIsDragOver(false)}
        onDrop={isReadOnly ? null : handleContainerDrop}
        sx={{
          p: { xs: 2, sm: 3 },
          border: isReadOnly ? '2px dashed transparent' : (isDragOver ? '2px dashed #21E0B2' : '2px dashed transparent'),
          bgcolor: isReadOnly ? 'inherit' : (isDragOver ? '#e0fff0' : 'inherit'),
          transition: 'all 0.3s ease-in-out',
        }}
      >
        {isReadOnly ? (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontStyle: 'italic', fontSize: '0.9rem' }}>
            La documentación no se puede modificar cuando el producto está en este estado o es posible que no tengas los permisos suficientes.
          </Typography>
        ) : (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontStyle: 'italic', fontSize: '0.9rem' }}>
            Para cambiar el orden, arrastre un documento y suéltelo en la nueva posición. Puede arrastrar archivos PDF aquí o hacer clic en el botón para subir.
          </Typography>
        )}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={isReadOnly ? null : handleDocumentDragStart}
          onDragEnd={isReadOnly ? null : handleDocumentDragEnd}
          onDragCancel={isReadOnly ? null : handleDocumentDragCancel}
        >
          <SortableContext
            items={sortableDocumentIds}
            strategy={rectSortingStrategy}
            disabled={isReadOnly}
          >
            <Grid container spacing={2}>
              {documentationFiles.map((docUrl, i) => (
                <SortableDocument
                  key={docUrl}
                  id={docUrl}
                  documentUrl={docUrl}
                  index={i}
                  sku={sku}
                  onDelete={handleDeleteDocument}
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
                    onClick={handleUploadClick}
                    sx={{
                      p: 1,
                      textAlign: 'center',
                      borderRadius: '8px',
                      height: '100%',
                      minHeight: 200,
                      width: '100%',
                      '@media (min-width: 768px)': {
                          width: '165px',
                      },
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      alignItems: 'center',
                      border: '2px dashed #e0e0e0',
                      bgcolor: '#f9f9f9',
                      cursor: 'pointer',
                      '&:hover': { borderColor: '#21E0B2', bgcolor: '#f0fff8' },
                      transition: 'all 0.3s ease-in-out'
                    }}
                  >
                    <input type="file" multiple accept="application/pdf" ref={fileInputRef} onChange={handleFileChange} style={{ display: 'none' }} />
                    <IconButton sx={{ fontSize: 80, color: '#21E0B2', transition: 'all 0.3s ease-in-out' }}>
                      <AddCircleOutlineIcon sx={{ fontSize: 'inherit' }} />
                    </IconButton>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      Cargar documentos
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem', mt: 0.5 }}>
                      Máx. {MAX_DOCUMENT_FILE_SIZE_MB} MB por archivo, {MAX_DOCUMENTS_TOTAL} en total.
                    </Typography>
                  </Paper>
                </Grid>
              )}
            </Grid>
          </SortableContext>
          <DragOverlay>
            {activeDocumentDragId && !isReadOnly ? (
              <DraggableItemOverlay activeId={activeDocumentDragId} documentationFiles={documentationFiles} sku={sku} />
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

export default ProductDocumentation;