import React from 'react';
import { Paper, Typography, Box, Button, Accordion, AccordionSummary, AccordionDetails, Grid, IconButton, useTheme, useMediaQuery } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragOverlay } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, rectSortingStrategy, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { MAX_DOCUMENTS_TOTAL, MAX_DOCUMENT_FILE_SIZE_MB } from '../../utils/constants';

function SortableDocument({ document, id, index, sku, onDelete, isReadOnly, isMobile }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id, disabled: isReadOnly });
    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.3 : 1,
        zIndex: isDragging ? 10 : 'auto',
        cursor: isReadOnly ? 'default' : 'grab',
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
    };

    if (isMobile) {
        return (
            <Grid item xs={12} ref={setNodeRef} style={style}>
                <Paper sx={{ p: 1, display: 'flex', alignItems: 'center', width: '100%', mb: 1, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
                    <Box component="div" sx={{ display: 'flex', alignItems: 'center', cursor: 'inherit', touchAction: 'none' }} {...(isReadOnly ? {} : listeners)} {...attributes}>
                        <DragIndicatorIcon sx={{ color: 'text.disabled', mr: 1 }} />
                        <PictureAsPdfIcon sx={{ fontSize: 40, color: '#B80000' }} />
                    </Box>
                    <Typography variant="body2" sx={{ flexGrow: 1, textAlign: 'left', ml: 2 }}>{`${sku}_${index + 1}`}</Typography>
                    <Button size="small" onClick={() => window.open(document.url, '_blank')} sx={{ mr: 1 }}>Ver</Button>
                    {!isReadOnly && <IconButton aria-label="delete document" onClick={() => onDelete(id)} sx={{ color: 'error.main' }}><CancelOutlinedIcon /></IconButton>}
                </Paper>
            </Grid>
        );
    }

    return (
        <Grid item xs="auto" ref={setNodeRef} style={{...style, width: 'auto'}}>
            <Paper sx={{ p: 1, textAlign: 'center', borderRadius: '8px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center', position: 'relative', width: '165px', minHeight: '200px' }}>
                <Box sx={{ width: '100%', flexGrow: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'inherit', touchAction: 'none' }} {...(isReadOnly ? {} : listeners)} {...attributes}>
                    <PictureAsPdfIcon sx={{ fontSize: 100, color: '#B80000' }} />
                </Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, overflowWrap: 'break-word', my: 1 }}>{`${sku}_${index + 1}`}</Typography>
                <Button variant="contained" size="small" onClick={() => window.open(document.url, '_blank')} sx={{ width: '100%', backgroundColor: '#0a1a28', '&:hover': { backgroundColor: '#21E0B2' }, textTransform: 'none' }}>Visualizar</Button>
                {!isReadOnly && <IconButton onClick={() => onDelete(id)} sx={{ position: 'absolute', top: -10, right: -10, backgroundColor: 'rgba(255,255,255,0.9)', '&:hover': { backgroundColor: 'rgba(255,255,255,1)' }, color: 'error.main', padding: 0.5, zIndex: 11 }}><CancelOutlinedIcon sx={{ fontSize: 28 }} /></IconButton>}
            </Paper>
        </Grid>
    );
}
function DraggableItemOverlayDesktop({ activeId, items, sku }) {
    const activeItem = items.find(item => item.id === activeId);
    if (!activeItem) return null;
    const activeIndex = items.indexOf(activeItem);
    return (
        <Paper sx={{ p: 1, textAlign: 'center', boxShadow: '0 8px 25px rgba(0,0,0,0.2)', borderRadius: '8px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center', width: '165px', minHeight: '200px', cursor: 'grabbing' }}>
            <Box sx={{ width: '100%', flexGrow: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}><PictureAsPdfIcon sx={{ fontSize: 100, color: '#B80000' }} /></Box>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, my: 1 }}>{`${sku}_${activeIndex + 1}`}</Typography>
            <Button variant="contained" size="small" sx={{ width: '100%' }}>Visualizar</Button>
        </Paper>
    );
}
function DraggableItemOverlayMobile({ activeId, items, sku }) {
    const activeItem = items.find(item => item.id === activeId);
    if (!activeItem) return null;
    const activeIndex = items.indexOf(activeItem);
    
    return (
        <Paper sx={{ p: 1, display: 'flex', alignItems: 'center', width: '100%', mb: 1, boxShadow: '0 5px 15px rgba(0,0,0,0.2)', cursor: 'grabbing' }}>
            <DragIndicatorIcon sx={{ color: 'text.disabled', mr: 1 }} />
            <PictureAsPdfIcon sx={{ fontSize: 40, color: '#B80000' }} />
            <Typography variant="body2" sx={{ flexGrow: 1, textAlign: 'left', ml: 2 }}>{`${sku}_${activeIndex + 1}`}</Typography>
            <Button size="small" sx={{ mr: 1 }}>Ver</Button>
            <IconButton sx={{ color: 'error.main', visibility: 'hidden' }}><CancelOutlinedIcon /></IconButton>
        </Paper>
    );
}

export default function ProductDocumentation({ sku, status, userRole, userEmail, users, documentationFiles, activeDocumentDragId, isDragOver, fileInputRef, onDeleteDocument, onDocumentDragStart, onDocumentDragEnd, onDocumentDragCancel, onUploadClick, onFileChange, onContainerDragOver, onContainerDragLeave, onContainerDrop }) {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isReadOnly = (status === 'pending_approval' || status === 'published') || (userRole === 'default_user') || (userRole === 'product_manager' && !users.some(user => user.email === userEmail));
    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 2, delay: 50, tolerance: 5 }, disabled: isReadOnly }), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates, disabled: isReadOnly }));

    const AddButton = () => {
        if (isMobile) {
            return (
                <Grid item xs={12}>
                    <Paper
                        onClick={onUploadClick}
                        sx={{
                            p: 2,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2,
                            width: '100%',
                            border: '2px dashed',
                            borderColor: 'grey.300',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease-in-out',
                            '&:hover': { borderColor: '#21E0B2', bgcolor: 'rgba(33, 224, 178, 0.05)' },
                        }}
                    >
                        <input type="file" multiple accept="application/pdf" ref={fileInputRef} onChange={onFileChange} style={{ display: 'none' }} />
                        <AddCircleOutlineIcon sx={{ fontSize: 40, color: '#21E0B2' }} />
                        <Box>
                            <Typography variant="body1" sx={{ fontWeight: 500 }}>Cargar documentos</Typography>
                            <Typography variant="caption" color="text.secondary">Máx. {MAX_DOCUMENT_FILE_SIZE_MB} MB, {MAX_DOCUMENTS_TOTAL} en total. PDF</Typography>
                        </Box>
                    </Paper>
                </Grid>
            );
        }

        return (
            <Grid item xs="auto">
                <Paper onClick={onUploadClick} sx={{ p: 1, textAlign: 'center', borderRadius: '8px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', border: '2px dashed #e0e0e0', bgcolor: '#f9f9f9', cursor: 'pointer', '&:hover': { borderColor: '#21E0B2', bgcolor: '#f0fff8' }, transition: 'all 0.3s ease-in-out', width: '165px', minHeight: '200px' }}>
                    <input type="file" multiple accept="application/pdf" ref={fileInputRef} onChange={onFileChange} style={{ display: 'none' }} />
                    <IconButton sx={{ fontSize: 80, color: '#21E0B2' }}><AddCircleOutlineIcon sx={{ fontSize: 'inherit' }} /></IconButton>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>Cargar documentos</Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem', mt: 0.5, px: 1 }}>Máx. {MAX_DOCUMENT_FILE_SIZE_MB} MB, PDF</Typography>
                </Paper>
            </Grid>
        );
    };

    return (
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
                <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '18px', color: '#555', display: 'flex', alignItems: 'center' }}><Box component="span" sx={{ width: '12px', height: '3px', bgcolor: '#21E0B2', borderRadius: '2px', mr: 1 }} />Documentación</Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ p: { xs: 2, sm: 3 }, border: isReadOnly ? '2px dashed transparent' : (isDragOver ? '2px dashed #21E0B2' : '2px dashed transparent'), bgcolor: isReadOnly ? 'inherit' : (isDragOver ? '#e0fff0' : 'inherit'), transition: 'all 0.3s ease-in-out' }} onDragOver={isReadOnly ? undefined : onContainerDragOver} onDragLeave={isReadOnly ? undefined : onContainerDragLeave} onDrop={isReadOnly ? undefined : onContainerDrop}>
                {!isReadOnly ? (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mb: 2, fontStyle: "italic", fontSize: "0.9rem" }}
          >
            Arrastre un elemento para cambiar el orden o arrastre archivos aquí.
          </Typography>
        ) : (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mb: 2, fontStyle: "italic", fontSize: "0.9rem" }}
          >
            La documentación no se puede modificar en este estado o no tienes
            los permisos necesarios.
          </Typography>
        )}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={onDocumentDragStart}
          onDragEnd={onDocumentDragEnd}
          onDragCancel={onDocumentDragCancel}
        >
          <SortableContext
            items={documentationFiles.map((d) => d.id)}
            strategy={
              isMobile ? verticalListSortingStrategy : rectSortingStrategy
            }
            disabled={isReadOnly}
          >
            <Grid
              container
              spacing={2}
              direction={isMobile ? "column" : "row"}
              alignItems="stretch"
            >
              {documentationFiles.map((doc, i) => (
                <SortableDocument
                  key={doc.id}
                  id={doc.id}
                  document={doc}
                  index={i}
                  sku={sku}
                  onDelete={onDeleteDocument}
                  isReadOnly={isReadOnly}
                  isMobile={isMobile}
                />
              ))}
              {!isReadOnly &&
                documentationFiles.length < MAX_DOCUMENTS_TOTAL && (
                  <AddButton />
                )}
            </Grid>
          </SortableContext>
          <DragOverlay>
            {activeDocumentDragId ? (
              isMobile ? (
                <DraggableItemOverlayMobile
                  activeId={activeDocumentDragId}
                  items={documentationFiles}
                  sku={sku}
                />
              ) : (
                <DraggableItemOverlayDesktop
                  activeId={activeDocumentDragId}
                  items={documentationFiles}
                  sku={sku}
                />
              )
            ) : null}
          </DragOverlay>
        </DndContext>
            </AccordionDetails>
        </Accordion>
    );
}