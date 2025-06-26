import { useState, useCallback, useRef } from 'react';
import {
  MAX_DOCUMENT_FILE_SIZE_MB,
  MAX_DOCUMENTS_TOTAL,
  MAX_DOCUMENT_FILE_SIZE_BYTES,
  INITIAL_PRODUCT_DOCUMENTATION_DATA
} from '../utils/constants.js';

+document.addEventListener('dragover', (event) => {
  event.preventDefault();
  event.stopPropagation();
});

document.addEventListener('drop', (event) => {
  event.preventDefault();
  event.stopPropagation();
});

export const useProductDocumentationData = (initialDocumentationFiles) => {
  const [documentationFiles, setDocumentationFiles] = useState(() => {
    return (initialDocumentationFiles && initialDocumentationFiles.length > 0)
      ? initialDocumentationFiles
      : INITIAL_PRODUCT_DOCUMENTATION_DATA;
  });
  const [activeDocumentDragId, setActiveDocumentDragId] = useState(null);
  const fileInputRef = useRef(null);
  const [isDragOver, setIsDragOver] = useState(false);

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
  const handleDocumentDragStart = useCallback((event) => {
    setActiveDocumentDragId(event.active.id);
  }, []);

  const handleDocumentDragEnd = useCallback((event) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      setDocumentationFiles((items) => {
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
    setActiveDocumentDragId(null);
  }, []);

  const handleDocumentDragCancel = useCallback(() => {
    setActiveDocumentDragId(null);
  }, []);

  const handleUploadClick = useCallback(() => {
    fileInputRef.current.click();
  }, []);

  const processFiles = useCallback((files) => {
    const newValidPdfFiles = [];
    for (const file of files) {
      if (file.type !== 'application/pdf') {
        showSnackbar(`"${file.name}" no es un PDF. Solo se permiten archivos PDF.`, 'error');
        continue;
      }
      if (file.size > MAX_DOCUMENT_FILE_SIZE_BYTES) {
        showSnackbar(`"${file.name}" supera el tamaño máximo de ${MAX_DOCUMENT_FILE_SIZE_MB} MB.`, 'error');
        continue;
      }
      if (documentationFiles.length + newValidPdfFiles.length >= MAX_DOCUMENTS_TOTAL) {
        showSnackbar(`Has alcanzado el límite máximo de ${MAX_DOCUMENTS_TOTAL} documentos.`, 'warning');
        break;
      }
      const fileUrl = URL.createObjectURL(file);
      newValidPdfFiles.push(fileUrl);
    }

    if (newValidPdfFiles.length > 0) {
      setDocumentationFiles(prev => [...prev, ...newValidPdfFiles]);
      showSnackbar(`Se han añadido ${newValidPdfFiles.length} documento(s).`, 'success');
    } else if (files.length > 0) {
      showSnackbar('No se pudieron añadir los documentos. Revisa los requisitos.', 'info');
    }
  }, [documentationFiles, showSnackbar]);

  const handleFileChange = useCallback((e) => {
    if (e.target.files) {
      processFiles(Array.from(e.target.files));
      e.target.value = null;
    }
  }, [processFiles]);

  const handleContainerDrop = useCallback((event) => {
    event.preventDefault();
    setIsDragOver(false);
    const files = Array.from(event.dataTransfer.files);
    processFiles(files);
  }, [processFiles]);

  const handleDeleteDocument = useCallback((idToDelete) => {
    setDocumentationFiles((prev) => {
      const updatedFiles = prev.filter((docUrl) => docUrl !== idToDelete);
      if (idToDelete.startsWith('blob:')) {
        URL.revokeObjectURL(idToDelete);
      }
      return updatedFiles;
    });
    showSnackbar('Documento eliminado.', 'info');
  }, [showSnackbar]);

  return {
    documentationFiles,
    setDocumentationFiles,
    activeDocumentDragId,
    fileInputRef,
    isDragOver,
    setIsDragOver,
    snackbarOpen,
    snackbarMessage,
    snackbarSeverity,
    showSnackbar,
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
  };
};