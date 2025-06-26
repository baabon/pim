import React from 'react';
import { Accordion, AccordionSummary, AccordionDetails, Typography, Box, Grid, Paper, TextField, Button, IconButton, useTheme, useMediaQuery } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import OndemandVideoIcon from '@mui/icons-material/OndemandVideo';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragOverlay } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, rectSortingStrategy, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { getYouTubeThumbnail, MAX_VIDEOS_TOTAL } from '../../utils/constants.js';

function SortableVideo({ videoItem, id, index, onDelete, sku, isReadOnly, isMobile }) {
    const { url, videoId } = videoItem;
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
    const thumbnailUrl = videoId ? getYouTubeThumbnail(videoId) : null;

    if (isMobile) {
        return (
            <Grid item xs={12} ref={setNodeRef} style={style}>
                <Paper sx={{ p: 1, display: 'flex', alignItems: 'center', width: '100%', mb: 1, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
                    <Box component="div" sx={{ display: 'flex', alignItems: 'center', cursor: 'inherit', touchAction: 'none' }} {...(isReadOnly ? {} : listeners)} {...attributes}>
                        <DragIndicatorIcon sx={{ color: 'text.disabled', mr: 1 }} />
                        <img src={thumbnailUrl} alt={`${sku}_${index + 1}`} style={{ width: '80px', height: '60px', objectFit: 'cover', borderRadius: '4px' }} draggable="false" />
                    </Box>
                    <Typography variant="body2" sx={{ flexGrow: 1, textAlign: 'left', ml: 2 }}>{`${sku}_${index + 1}`}</Typography>
                    <Button size="small" startIcon={<OndemandVideoIcon/>} onClick={() => window.open(url, '_blank')} sx={{ mr: 1 }}>Ver</Button>
                    {!isReadOnly && <IconButton aria-label="delete video" onClick={() => onDelete(id)} sx={{ color: 'error.main' }}><CancelOutlinedIcon /></IconButton>}
                </Paper>
            </Grid>
        );
    }
    
    return (
        <Grid item xs="auto" ref={setNodeRef} style={{...style, width: 'auto'}}>
            <Paper sx={{ p: 1, textAlign: 'center', borderRadius: '8px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center', position: 'relative', width: '165px', minHeight: '200px' }}>
                <Box sx={{ width: '100%', height: '100px', bgcolor: '#000', borderRadius: '4px', mb: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'hidden', cursor: 'inherit', touchAction: 'none' }} {...(isReadOnly ? {} : attributes)} {...listeners}>
                    {thumbnailUrl ? <img src={thumbnailUrl} alt={`${sku}_${index + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <OndemandVideoIcon sx={{ fontSize: 50, color: 'rgba(255,255,255,0.7)' }} />}
                </Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, overflowWrap: 'break-word', wordBreak: 'break-all', flexGrow: 1, my: 1 }}>{`${sku}_${index + 1}`}</Typography>
                <Button variant="contained" size="small" startIcon={<OndemandVideoIcon />} onClick={() => window.open(url, '_blank')} sx={{ width: '100%', backgroundColor: '#0a1a28', '&:hover': { backgroundColor: '#21E0B2' }, textTransform: 'none' }}>Ver Video</Button>
                {!isReadOnly && <IconButton aria-label="delete video" onClick={() => onDelete(id)} sx={{ position: 'absolute', top: -10, right: -10, backgroundColor: 'rgba(255, 255, 255, 0.9)', '&:hover': { backgroundColor: 'rgba(255, 255, 255, 1)' }, color: 'error.main', p: 0.5, zIndex: 11 }}><CancelOutlinedIcon sx={{ fontSize: 28 }} /></IconButton>}
            </Paper>
        </Grid>
    );
}

function DraggableItemOverlayDesktop({ activeId, items, sku }) {
    const activeItem = items.find(item => item.id === activeId);
    if (!activeItem) return null;
    const activeIndex = items.indexOf(activeItem);
    const thumbnailUrl = activeItem.videoId ? getYouTubeThumbnail(activeItem.videoId) : null;
    return (
        <Paper sx={{ p: 1, textAlign: 'center', boxShadow: '0 8px 25px rgba(0,0,0,0.2)', borderRadius: '8px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center', width: '165px', minHeight: '200px', cursor: 'grabbing' }}>
            <Box sx={{ width: '100%', height: '100px', bgcolor: '#000', borderRadius: '4px', mb: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' }}>
                {thumbnailUrl ? <img src={thumbnailUrl} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <OndemandVideoIcon sx={{ fontSize: 50, color: 'rgba(255,255,255,0.7)' }} />}
            </Box>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, my: 1, flexGrow: 1 }}>{`${sku}_${activeIndex + 1}`}</Typography>
            <Button variant="contained" size="small" startIcon={<OndemandVideoIcon />} sx={{ width: '100%' }}>Ver Video</Button>
        </Paper>
    );
}

function DraggableItemOverlayMobile({ activeId, items, sku }) {
    const activeItem = items.find(item => item.id === activeId);
    if (!activeItem) return null;
    const activeIndex = items.indexOf(activeItem);
    const thumbnailUrl = activeItem.videoId ? getYouTubeThumbnail(activeItem.videoId) : null;

    return (
        <Paper sx={{ p: 1, display: 'flex', alignItems: 'center', width: '100%', mb: 1, boxShadow: '0 5px 15px rgba(0,0,0,0.2)', cursor: 'grabbing' }}>
            <DragIndicatorIcon sx={{ color: 'text.disabled', mr: 1 }} />
            <img src={thumbnailUrl} alt="Preview" style={{ width: '80px', height: '60px', objectFit: 'cover', borderRadius: '4px' }} draggable="false" />
            <Typography variant="body2" sx={{ flexGrow: 1, textAlign: 'left', ml: 2 }}>{`${sku}_${activeIndex + 1}`}</Typography>
            <Button size="small" startIcon={<OndemandVideoIcon/>} sx={{ mr: 1 }}>Ver</Button>
            <IconButton sx={{ color: 'error.main', visibility: 'hidden' }}><CancelOutlinedIcon /></IconButton>
        </Paper>
    );
}

export default function ProductVideos({ sku, status, userRole, userEmail, users, videoLinks, newVideoUrl, activeVideoDragId, onNewVideoUrlChange, onAddVideo, onDeleteVideo, onVideoDragStart, onVideoDragEnd, onVideoDragCancel }) {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isReadOnly = (status === 'pending_approval' || status === 'published') || (userRole === 'default_user') || (userRole === 'product_manager' && !users.some(user => user.email === userEmail));
    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 2, delay: 50, tolerance: 5 }, disabled: isReadOnly }), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates, disabled: isReadOnly }));
    
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
                <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '18px', color: '#555', display: 'flex', alignItems: 'center' }}><Box component="span" sx={{ width: '12px', height: '3px', bgcolor: '#21E0B2', borderRadius: '2px', mr: 1 }} />Videos</Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ p: { xs: 2, sm: 3 } }}>
                {!isReadOnly ? (
          <>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mb: 2, fontStyle: "italic", fontSize: "0.9rem" }}
            >
              Agregue enlaces de YouTube. Máximo {MAX_VIDEOS_TOTAL} videos.
            </Typography>
            <Box
              sx={{
                display: "flex",
                gap: 1,
                mb: 3,
                flexDirection: { xs: "column", sm: "row" },
              }}
            >
              <TextField
                label="Enlace de YouTube"
                variant="outlined"
                size="small"
                fullWidth
                value={newVideoUrl}
                onChange={onNewVideoUrlChange}
                onKeyPress={(e) => e.key === "Enter" && onAddVideo()}
              />
              <Button
                variant="contained"
                onClick={onAddVideo}
                startIcon={<AddCircleOutlineIcon />}
                disabled={videoLinks.length >= MAX_VIDEOS_TOTAL}
                sx={{
                  backgroundColor: "#0a1a28",
                  "&:hover": { backgroundColor: "#21E0B2" },
                  textTransform: "none",
                  whiteSpace: "nowrap",
                }}
              >
                Agregar Video
              </Button>
            </Box>
          </>
        ) : (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mb: 2, fontStyle: "italic", fontSize: "0.9rem" }}
          >
            Los videos no se pueden modificar en este estado o no tienes los
            permisos necesarios.
          </Typography>
        )}
        {videoLinks.length === 0 && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ textAlign: "center", my: 2 }}
          >
            No hay videos agregados.
          </Typography>
        )}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={onVideoDragStart}
          onDragEnd={onVideoDragEnd}
          onDragCancel={onVideoDragCancel}
        >
          <SortableContext
            items={videoLinks.map((v) => v.id)}
            strategy={
              isMobile ? verticalListSortingStrategy : rectSortingStrategy
            }
            disabled={isReadOnly}
          >
            <Grid
              container
              spacing={2}
              direction={isMobile ? "column" : "row"}
              alignItems="flex-start"
            >
              {videoLinks.map((video, index) => (
                <SortableVideo
                  key={video.id}
                  id={video.id}
                  videoItem={video}
                  index={index}
                  onDelete={onDeleteVideo}
                  sku={sku}
                  isReadOnly={isReadOnly}
                  isMobile={isMobile}
                />
              ))}
            </Grid>
          </SortableContext>

          <DragOverlay>
            {activeVideoDragId ? (
              isMobile ? (
                <DraggableItemOverlayMobile
                  activeId={activeVideoDragId}
                  items={videoLinks}
                  sku={sku}
                />
              ) : (
                <DraggableItemOverlayDesktop
                  activeId={activeVideoDragId}
                  items={videoLinks}
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