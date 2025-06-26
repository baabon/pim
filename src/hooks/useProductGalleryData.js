import { useState, useCallback, useRef } from 'react';
import {
  MAX_GALLERY_IMAGES_TOTAL,
  MAX_GALLERY_IMAGE_SIZE_KB,
  MAX_GALLERY_IMAGE_SIZE_BYTES,
  REQUIRED_GALLERY_IMAGE_WIDTH,
  REQUIRED_GALLERY_IMAGE_HEIGHT,
  ALLOWED_GALLERY_MIME_TYPES,
  INITIAL_PRODUCT_GALLERY_DATA
} from '../utils/constants.js';

document.addEventListener('dragover', (event) => {
  event.preventDefault();
  event.stopPropagation();
});

document.addEventListener('drop', (event) => {
  event.preventDefault();
  event.stopPropagation();
});

export const useProductGalleryData = (initialGalleryImages = []) => {
  const [galleryImages, setGalleryImages] = useState(() => {
    return (initialGalleryImages && initialGalleryImages.length > 0)
      ? initialGalleryImages
      : INITIAL_PRODUCT_GALLERY_DATA;
  });
  const [activeImageDragId, setActiveImageDragId] = useState(null);
  const fileInputRef = useRef(null);
  const [isDragOver, setIsDragOver] = useState(false);

  // Snackbars para notificaciones
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

  // --- Drag and Drop Handlers ---
  const handleImageDragStart = useCallback((event) => {
    setActiveImageDragId(event.active.id);
  }, []);

  const handleImageDragEnd = useCallback((event) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      setGalleryImages((items) => {
        const oldIndex = items.indexOf(active.id);
        const newIndex = items.indexOf(over.id);

        if (oldIndex !== -1 && newIndex !== -1) {
          const newItems = Array.from(items);
          const [removed] = newItems.splice(oldIndex, 1);
          newItems.splice(newIndex, 0, removed);
          return newItems;
        }
        return items;
      });
    }
    setActiveImageDragId(null);
  }, [showSnackbar]);

  const handleImageDragCancel = useCallback(() => {
    setActiveImageDragId(null);
  }, []);

  // --- File Upload Logic ---
  const handleUploadClick = useCallback(() => {
    fileInputRef.current.click();
  }, []);

  const processFiles = useCallback(async (filesToProcess) => {
    const newValidImageUrls = [];
    let maxImagesAlertShown = false;
    let anyFileFailed = false;

    for (const file of filesToProcess) {
      if (galleryImages.length + newValidImageUrls.length >= MAX_GALLERY_IMAGES_TOTAL) {
        if (!maxImagesAlertShown) {
          showSnackbar(`Máximo ${MAX_GALLERY_IMAGES_TOTAL} imágenes permitidas.`, 'warning');
          maxImagesAlertShown = true;
        }
        anyFileFailed = true;
        continue;
      }

      if (!ALLOWED_GALLERY_MIME_TYPES.includes(file.type)) {
        showSnackbar(`"${file.name}" no es una imagen JPG o JPEG. Solo formatos JPG/JPEG son permitidos.`, 'error');
        anyFileFailed = true;
        continue;
      }

      if (file.size > MAX_GALLERY_IMAGE_SIZE_BYTES) {
        showSnackbar(`"${file.name}" supera el tamaño máximo de ${MAX_GALLERY_IMAGE_SIZE_KB} KB.`, 'error');
        anyFileFailed = true;
        continue;
      }

      const img = new Image();
      const imageUrl = URL.createObjectURL(file);
      img.src = imageUrl;

      const dimensionsValid = await new Promise(resolve => {
        img.onload = () => {
          if (img.width !== REQUIRED_GALLERY_IMAGE_WIDTH || img.height !== REQUIRED_GALLERY_IMAGE_HEIGHT) {
            showSnackbar(`"${file.name}" debe ser exactamente ${REQUIRED_GALLERY_IMAGE_WIDTH}x${REQUIRED_GALLERY_IMAGE_HEIGHT} píxeles.`, 'error');
            URL.revokeObjectURL(imageUrl);
            resolve(false);
          } else {
            resolve(true);
          }
        };
        img.onerror = () => {
          showSnackbar(`No se pudo cargar "${file.name}" para validar las dimensiones.`, 'error');
          URL.revokeObjectURL(imageUrl);
          resolve(false);
        };
      });

      if (dimensionsValid) {
        newValidImageUrls.push(imageUrl);
      } else {
        anyFileFailed = true;
      }
    }

    if (newValidImageUrls.length > 0) {
      setGalleryImages(prevImages => [...prevImages, ...newValidImageUrls]);
      showSnackbar(`Se han añadido ${newValidImageUrls.length} imagen(es) a la galería.`, 'success');
    } else if (anyFileFailed) {
      showSnackbar('Algunos archivos no pudieron ser añadidos. Revisa los requisitos.', 'info');
    } else {
      showSnackbar('No se detectaron nuevos archivos válidos para añadir.', 'info');
    }
  }, [galleryImages, showSnackbar]);

  const handleFileChange = useCallback((event) => {
    const files = Array.from(event.target.files);
    processFiles(files);
    event.target.value = null;
  }, [processFiles]);

  const handleDeleteImage = useCallback((idToDelete) => {
    setGalleryImages(prevImages => {
      const updatedImages = prevImages.filter(imagePath => imagePath !== idToDelete);
      if (idToDelete.startsWith('blob:')) {
        URL.revokeObjectURL(idToDelete);
      }
      return updatedImages;
    });
    showSnackbar('Imagen eliminada de la galería.', 'info');
  }, [showSnackbar]);

  const handleContainerDragOver = useCallback((event) => {
    event.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleContainerDragLeave = useCallback(() => {
    setIsDragOver(false);
  }, []);

  const handleContainerDrop = useCallback((event) => {
    event.preventDefault();
    setIsDragOver(false);

    const files = Array.from(event.dataTransfer.files);
    if (files.length > 0) {
      processFiles(files);
    } else {
      if (event.dataTransfer.items) {
        const items = Array.from(event.dataTransfer.items)
          .filter(item => item.kind === 'file')
          .map(item => item.getAsFile());

        const validItemsAsFiles = items.filter(file => file !== null);

        if (validItemsAsFiles.length > 0) {
          processFiles(validItemsAsFiles);
        }
      }
    }
  }, [processFiles]);

  return {
    galleryImages,
    setGalleryImages,
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
  };
};