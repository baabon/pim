// src/hooks/useProductDetailData.js (Refactorizado)
import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../auth/contexts/AuthContext';
import * as productApi from '../services/productApi';
import {
  getYouTubeVideoId,
  // ... importa aquí TODAS las constantes que necesitas de `utils/constants.js`
} from '../utils/constants';

// --- El Hook Principal Refactorizado ---
export const useProductDetailData = (productId) => {
  const { user, fetchWithRefresh } = useAuth();

  // --- ESTADOS DE DATOS ---
  const [product, setProduct] = useState(null);
  const [videos, setVideos] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [documentation, setDocumentation] = useState([]);
  const [history, setHistory] = useState([]);
  
  // --- ESTADOS DE UI Y FORMULARIOS ---
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loadingAction, setLoadingAction] = useState(null); // Para 'save', 'publish', etc.
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  // (Aquí irían otros estados que tenías: dialogos, productName, etc.)
  // ...por simplicidad, los he omitido aquí, pero estarían en la versión final.

  // --- LÓGICA DE CARGA INICIAL ---
  const loadInitialData = useCallback(async () => {
    if (!productId) return;
    setLoading(true);
    setError(null);
    try {
      const [
        productData,
        videoData,
        galleryData,
        docData,
        historyData
      ] = await Promise.allSettled([
        productApi.getProductDetails(productId, fetchWithRefresh),
        productApi.getProductVideos(productId, fetchWithRefresh),
        productApi.getProductGallery(productId),
        productApi.getProductDocumentation(productId),
        productApi.getProductHistory(productId, fetchWithRefresh),
      ]);

      // Asignar datos o errores a cada estado
      if (productData.status === 'fulfilled') setProduct(productData.value); else throw productData.reason;
      if (videoData.status === 'fulfilled') {
          // Mapeamos la respuesta de la API a la estructura que usa la UI
          const formattedVideos = videoData.value.map(v => ({
              id: v.id, // ID real del backend
              url: v.youtube_url,
              videoId: getYouTubeVideoId(v.youtube_url)
          }));
          setVideos(formattedVideos);
      }
      if (galleryData.status === 'fulfilled') setGallery(galleryData.value);
      if (docData.status === 'fulfilled') setDocumentation(docData.value);
      if (historyData.status === 'fulfilled') setHistory(historyData.value);
      
    } catch (err) {
      console.error("Error cargando datos del producto:", err);
      setError(err.message || 'Ocurrió un error al cargar los datos.');
      showSnackbar(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [productId, fetchWithRefresh]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // --- MANEJADOR DE NOTIFICACIONES (SNACKBAR) CENTRALIZADO ---
  const showSnackbar = useCallback((message, severity = 'info') => {
    setSnackbar({ open: true, message, severity });
  }, []);

  // --- LÓGICA DE VIDEOS (Integrada desde useProductVideoData) ---
  const [newVideoUrl, setNewVideoUrl] = useState('');
  const handleAddVideo = useCallback(() => {
    // ... aquí va la lógica de tu `handleAddVideo` original ...
    // usará `setVideos` y `showSnackbar` de este hook.
    showSnackbar('Video añadido!', 'success');
  }, [newVideoUrl, videos]);

  const handleDeleteVideo = useCallback((videoIdToDelete) => {
    // ... aquí va la lógica de tu `handleDeleteVideo` ...
    setVideos(prev => prev.filter(v => v.id !== videoIdToDelete));
    showSnackbar('Video eliminado.', 'info');
  }, []);
  
  // (Aquí irían los manejadores de drag-and-drop para videos)

  // --- LÓGICA DE GALERÍA (Integrada desde useProductGalleryData) ---
  const galleryFileInputRef = useRef(null);
  const handleAddGalleryImages = useCallback((files) => {
    // ... aquí va la lógica de tu `processFiles` para imágenes ...
    showSnackbar('Imágenes añadidas!', 'success');
  }, [gallery]);

  // ... más handlers para galería ...

  // --- LÓGICA DE DOCUMENTACIÓN (Integrada desde useProductDocumentationData) ---
  const docFileInputRef = useRef(null);
  const handleAddDocuments = useCallback((files) => {
    // ... aquí va la lógica de tu `processFiles` para documentos ...
    showSnackbar('Documentos añadidos!', 'success');
  }, [documentation]);
  
  // ... más handlers para documentación ...
  
  
  // --- LÓGICA DE GUARDADO Y ACCIONES ---
  const handleSave = useCallback(async () => {
      // ... la lógica de tu `handleSave` original, pero ahora:
      // 1. Recopila los datos de los estados locales (videos, gallery, documentation).
      // 2. Llama a `productApi.saveProduct(...)`.
  }, [product, videos, gallery, documentation /* ...otros estados */]);


  // --- VALOR DE RETORNO DEL HOOK ---
  return {
    // Datos
    product, videos, gallery, documentation, history,
    // Estados de UI
    loading, error, loadingAction, snackbar,
    // Handlers
    handleSave,
    handleAddVideo, handleDeleteVideo,
    // ...todos los demás handlers que tu UI necesita
  };
};