import { useState, useCallback } from 'react';
import {
  MAX_VIDEOS_TOTAL,
  getYouTubeVideoId,
  getYouTubeThumbnail,
  INITIAL_PRODUCT_VIDEOS_DATA
} from '../utils/constants.js';

export const useProductVideoData = (initialVideos = []) => {
  const [videoLinks, setVideoLinks] = useState(() => {
    const videosToUse = (initialVideos && initialVideos.length > 0)
      ? initialVideos
      : INITIAL_PRODUCT_VIDEOS_DATA;

    return videosToUse.map(url => ({
      id: url + '_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
      url: url,
      videoId: getYouTubeVideoId(url),
    }));
  });
  const [newVideoUrl, setNewVideoUrl] = useState('');
  const [activeVideoDragId, setActiveVideoDragId] = useState(null);

  // Snackbars para notificaciones (si se manejan localmente en el hook)
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('info');

  const showSnackbar = useCallback((message, severity = 'info') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  }, []);

  const handleSnackbarClose = useCallback((event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  }, []);

  // --- Video Management Handlers ---
  const handleVideoUrlChange = useCallback((event) => {
    setNewVideoUrl(event.target.value);
  }, []);

  const handleAddVideo = useCallback(() => {
    if (!newVideoUrl.trim()) {
      showSnackbar("Por favor, ingrese un enlace de video.", 'warning');
      return;
    }

    const videoId = getYouTubeVideoId(newVideoUrl);
    if (!videoId) {
      showSnackbar("Por favor, ingrese un enlace de YouTube válido.", 'error');
      setNewVideoUrl('');
      return;
    }

    if (videoLinks.length >= MAX_VIDEOS_TOTAL) {
      showSnackbar(`Máximo ${MAX_VIDEOS_TOTAL} videos permitidos.`, 'warning');
      setNewVideoUrl('');
      return;
    }

    // Verificar si el video ya existe por su videoId
    if (videoLinks.some(item => item.videoId === videoId)) {
      showSnackbar("Este video ya ha sido añadido.", 'info');
      setNewVideoUrl('');
      return;
    }

    const newVideoItem = {
      id: newVideoUrl + '_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
      url: newVideoUrl,
      videoId: videoId,
    };

    setVideoLinks((prev) => [...prev, newVideoItem]);
    setNewVideoUrl('');
    showSnackbar('Video añadido exitosamente.', 'success');
  }, [newVideoUrl, videoLinks, showSnackbar]);

  const handleDeleteVideo = useCallback((idToDelete) => {
    setVideoLinks((prev) => prev.filter((video) => video.id !== idToDelete));
    showSnackbar('Video eliminado.', 'info');
  }, [showSnackbar]);

  const handleVideoDragStart = useCallback((event) => {
    setActiveVideoDragId(event.active.id);
  }, []);

  const handleVideoDragEnd = useCallback((event) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      if (active.id !== 'add-video-button' && over.id !== 'add-video-button') {
        setVideoLinks((items) => {
          const oldIndex = items.findIndex(item => item.id === active.id);
          const newIndex = items.findIndex(item => item.id === over.id);

          if (oldIndex !== -1 && newIndex !== -1) {
            const newItems = Array.from(items);
            const [removed] = newItems.splice(oldIndex, 1);
            newItems.splice(newIndex, 0, removed);
            return newItems;
          }
          return items;
        });
      }
    }
    setActiveVideoDragId(null);
  }, []);

  const handleVideoDragCancel = useCallback(() => {
    setActiveVideoDragId(null);
  }, []);

  return {
    videoLinks,
    setVideoLinks,
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
  };
};