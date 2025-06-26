import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../auth/contexts/AuthContext';
import * as productApi from '../services/productApi';
import {
    getYouTubeVideoId,
    MAX_VIDEOS_TOTAL,
    MAX_GALLERY_IMAGES_TOTAL,
    MAX_GALLERY_IMAGE_SIZE_BYTES,
    MAX_GALLERY_IMAGE_SIZE_KB,
    REQUIRED_GALLERY_IMAGE_WIDTH,
    REQUIRED_GALLERY_IMAGE_HEIGHT,
    ALLOWED_GALLERY_MIME_TYPES,
    MAX_DOCUMENTS_TOTAL,
    MAX_DOCUMENT_FILE_SIZE_BYTES,
    MAX_DOCUMENT_FILE_SIZE_MB,
    CATEGORY_OPTIONS,
    AVAILABLE_PRODUCTS
} from '../utils/constants.js';
import { arrayMove } from '@dnd-kit/sortable';

export const useProductDetailData = (productProp) => {
    const { user, fetchWithRefresh } = useAuth();
    const productId = productProp?.id;

    // --- Estados Centralizados ---
    const [currentProduct, setCurrentProduct] = useState(productProp);
    const [videos, setVideos] = useState([]);
    const [galleryImages, setGalleryImages] = useState([]);
    const [documentationFiles, setDocumentationFiles] = useState([]);
    const [history, setHistory] = useState([]);
    const [countrySettings, setCountrySettings] = useState(productProp?.country_settings || []);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [loadingAction, setLoadingAction] = useState(null);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
    const [productStatus, setProductStatus] = useState(productProp?.status?.code || 'draft');
    const [openRequestConfirm, setOpenRequestConfirm] = useState(false);
    const [openPublishConfirm, setOpenPublishConfirm] = useState(false);
    const [openRejectConfirm, setOpenRejectConfirm] = useState(false);
    const [openRejectCommentDialog, setOpenRejectCommentDialog] = useState(false);
    const [openUnpublishConfirm, setOpenUnpublishConfirm] = useState(false);
    const [rejectComment, setRejectComment] = useState('');
    const galleryFileInputRef = useRef(null);
    const docFileInputRef = useRef(null);
    const [newVideoUrl, setNewVideoUrl] = useState('');
    const [activeVideoDragId, setActiveVideoDragId] = useState(null);
    const [activeImageDragId, setActiveImageDragId] = useState(null);
    const [isImageDragOver, setIsImageDragOver] = useState(false);
    const [activeDocDragId, setActiveDocDragId] = useState(null);
    const [isDocDragOver, setIsDocDragOver] = useState(false);
    
    // --- Estados para la edición del nombre ---
    const [isEditingName, setIsEditingName] = useState(false);
    const [editableProductName, setEditableProductName] = useState(productProp?.name || '');


    // --- Snackbar ---
    const showSnackbar = useCallback((message, severity = 'info') => {
        setSnackbar({ open: true, message, severity });
    }, []);

    const handleSnackbarClose = useCallback((_, reason) => {
        if (reason === 'clickaway') return;
        setSnackbar(prev => ({ ...prev, open: false }));
    }, []);

    // --- Carga de Datos ---
    const fetchAllData = useCallback(async () => {
        if (!productId) {
            setLoading(false);
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const [productData, videoData, galleryData, docData, historyData] = await Promise.all([
                productApi.getProductDetails(productId, fetchWithRefresh), // Obtenemos el producto principal también
                productApi.getProductVideos(productId, fetchWithRefresh),
                productApi.getProductGallery(productId),
                productApi.getProductDocumentation(productId),
                productApi.getProductHistory(productId, fetchWithRefresh),
            ]);
            setCurrentProduct(productData);
            setEditableProductName(productData.name);
            setVideos(videoData.map(v => ({ id: v.id.toString(), url: v.youtube_url, videoId: getYouTubeVideoId(v.youtube_url) })));
            setGalleryImages(galleryData.map((url, i) => ({ id: `gallery-${i}-${url}`, url })));
            setDocumentationFiles(docData.map((url, i) => ({ id: `doc-${i}-${url}`, url })));
            setHistory(historyData);
        } catch (err) {
            setError(err.message);
            showSnackbar(`Error al cargar datos: ${err.message}`, 'error');
        } finally {
            setLoading(false);
        }
    }, [productId, fetchWithRefresh, showSnackbar]);

    useEffect(() => {
        setCurrentProduct(productProp);
        setEditableProductName(productProp?.name || '');
        setProductStatus(productProp?.status?.code || 'draft');
        setCountrySettings(productProp?.country_settings || []);
        fetchAllData();
    }, [productProp, fetchAllData]);

    
    // --- Handlers de Campos y Nombre ---
    const handleFieldChange = useCallback((field) => (event) => {
        setCurrentProduct(prev => ({ ...prev, [field]: event.target.value }));
    }, []);
    
    const handleEditNameClick = useCallback(() => {
        setEditableProductName(currentProduct.name);
        setIsEditingName(true);
    }, [currentProduct.name]);

    // --- Lógica de Países ---
    const parseProductList = useCallback((str) => str ? str.split(',').map(s => s.trim()).filter(Boolean).map(sku => AVAILABLE_PRODUCTS.find(p => p.sku === sku)).filter(Boolean) : [], []);
    const formatProductListForBackend = useCallback((arr) => arr.map(p => p.sku).join(','), []);
    const getCurrentCountryData = useCallback((code) => {
        const setting = countrySettings.find(cs => cs.country_code === code) || {};
        return {
            published: setting.enabled ?? false,
            sellable: setting.sellable ?? false,
            categoryCode: setting.category_code ?? '',
            relatedProducts: parseProductList(setting.related),
            substituteProducts: parseProductList(setting.substitute),
        };
    }, [countrySettings, parseProductList]);
    const handleUpdateCountrySetting = useCallback((countryCode, field, value) => {
        setCountrySettings(prev => {
            const newSettings = JSON.parse(JSON.stringify(prev));
            let setting = newSettings.find(cs => cs.country_code === countryCode);
            if (!setting) {
                setting = { country_code: countryCode };
                newSettings.push(setting);
            }
            if (field === 'published') setting.enabled = value;
            else if (field === 'sellable') setting.sellable = value;
            else if (field === 'category') {
                const option = CATEGORY_OPTIONS.find(opt => opt.value === value);
                setting.category_code = option?.value || null;
                setting.category = option?.label === '--- Seleccionar Categoría ---' ? null : option?.label;
            } else if (field === 'relatedProducts') setting.related = formatProductListForBackend(value);
            else if (field === 'substituteProducts') setting.substitute = formatProductListForBackend(value);
            return newSettings;
        });
    }, [formatProductListForBackend]);

    // --- Guardado y Acciones de Estado ---
    const handleSave = useCallback(async () => {
        if (editableProductName.trim() === '') {
            showSnackbar('El nombre del producto no puede estar vacío.', 'error');
            return;
        }

        if (!productId) return;
        setLoadingAction('save');
        try {
            const productPayload = { 
                ...currentProduct, 
                name: editableProductName, 
                country_settings: countrySettings 
            };
            
            delete productPayload.videos;
            delete productPayload.gallery;
            delete productPayload.documentation;

            await Promise.all([
                productApi.saveProduct(productId, productPayload, fetchWithRefresh),
                productApi.saveProductVideos(productId, videos, fetchWithRefresh),
            ]);
            
            showSnackbar('Producto guardado exitosamente!', 'success');
            setIsEditingName(false);
            await fetchAllData();
        } catch (err) {
            showSnackbar(`Error al guardar: ${err.message}`, 'error');
        } finally {
            setLoadingAction(null);
        }
    }, [productId, currentProduct, editableProductName, countrySettings, videos, fetchWithRefresh, showSnackbar, fetchAllData, galleryImages, documentationFiles]);

    // --- Lógica de cambio de estado del producto ---
    const performStatusUpdate = useCallback(async (action, newStatusCode, newPublishedState, message = null) => {
        if (!productId) return;
        setLoadingAction(action);
        try {
            const payload = { status_code: String(newStatusCode) };
            if (newPublishedState !== undefined) payload.published = newPublishedState;
            if (message) payload.message = message;
            const updatedProduct = await productApi.updateProductStatus(productId, payload, fetchWithRefresh);
            setCurrentProduct(updatedProduct);
            setProductStatus(updatedProduct.status.code);
            const updatedHistory = await productApi.getProductHistory(productId, fetchWithRefresh);
            setHistory(updatedHistory);
            showSnackbar('Estado actualizado correctamente.', 'success');
            setOpenRequestConfirm(false); setOpenPublishConfirm(false); setOpenUnpublishConfirm(false); setOpenRejectConfirm(false); setOpenRejectCommentDialog(false);
        } catch (err) {
            showSnackbar(`Error al actualizar estado: ${err.message}`, 'error');
        } finally {
            setLoadingAction(null);
        }
    }, [productId, fetchWithRefresh, showSnackbar]);

    const handleRequestApproval = () => setOpenRequestConfirm(true);
    const handlePublish = () => setOpenPublishConfirm(true);
    const handleUnpublish = () => setOpenUnpublishConfirm(true);
    const handleReject = () => setOpenRejectConfirm(true);
    const handleConfirmRequestApproval = () => performStatusUpdate('request_approval', 'pending_approval');
    const handleConfirmPublish = () => performStatusUpdate('publish', 'published', true);
    const handleConfirmUnpublish = () => performStatusUpdate('unpublish', 'deactivated', false);
    const handleReturnToEdit = () => performਸਟatusUpdate('return_to_edit', 'editing');
    const handleSendRejectWithComment = () => performStatusUpdate('reject', 'editing', undefined, rejectComment);
    const handleConfirmReject = () => { setOpenRejectConfirm(false); setOpenRejectCommentDialog(true); };

    // --- Videos ---
    const handleVideoUrlChange = useCallback(e => setNewVideoUrl(e.target.value), []);
    const handleAddVideo = useCallback(() => {
        if (!newVideoUrl.trim()) { showSnackbar("Por favor, ingrese un enlace de video.", 'warning'); return; }
        const videoId = getYouTubeVideoId(newVideoUrl);
        if (!videoId) { showSnackbar("Por favor, ingrese un enlace de YouTube válido.", 'error'); setNewVideoUrl(''); return; }
        if (videos.length >= MAX_VIDEOS_TOTAL) { showSnackbar(`Máximo ${MAX_VIDEOS_TOTAL} videos permitidos.`, 'warning'); setNewVideoUrl(''); return; }
        if (videos.some(v => v.videoId === videoId)) { showSnackbar("Este video ya ha sido añadido.", 'info'); setNewVideoUrl(''); return; }
        setVideos(prev => [...prev, { id: `temp-video-${Date.now()}`, url: newVideoUrl, videoId }]);
        setNewVideoUrl('');
        showSnackbar('Video añadido. Recuerda guardar los cambios.', 'success');
    }, [newVideoUrl, videos, showSnackbar]);
    const handleDeleteVideo = useCallback(id => { setVideos(p => p.filter(v => v.id !== id)); showSnackbar('Video eliminado. Guarda los cambios.', 'info'); }, [showSnackbar]);
    const handleVideoDragStart = useCallback(e => setActiveVideoDragId(e.active.id), []);
    const handleVideoDragEnd = useCallback(({ active, over }) => { setActiveVideoDragId(null); if (over && active.id !== over.id) { setVideos(items => arrayMove(items, items.findIndex(i => i.id === active.id), items.findIndex(i => i.id === over.id))); } }, []);
    const handleVideoDragCancel = useCallback(() => setActiveVideoDragId(null), []);

    // --- Galería con Validaciones ---
    const processGalleryFiles = useCallback(async (files) => {
        const newImages = [];
        for (const file of Array.from(files)) {
            if (galleryImages.length + newImages.length >= MAX_GALLERY_IMAGES_TOTAL) { showSnackbar(`Máximo ${MAX_GALLERY_IMAGES_TOTAL} imágenes.`, 'warning'); break; }
            if (!ALLOWED_GALLERY_MIME_TYPES.includes(file.type)) { showSnackbar(`"${file.name}" no es JPG/JPEG.`, 'error'); continue; }
            if (file.size > MAX_GALLERY_IMAGE_SIZE_BYTES) { showSnackbar(`"${file.name}" supera los ${MAX_GALLERY_IMAGE_SIZE_KB} KB.`, 'error'); continue; }
            const img = new Image(); const imageUrl = URL.createObjectURL(file);
            const isValid = await new Promise(r => { img.onload = () => r(img.width === REQUIRED_GALLERY_IMAGE_WIDTH && img.height === REQUIRED_GALLERY_IMAGE_HEIGHT); img.onerror = () => r(false); img.src = imageUrl; });
            if (isValid) { newImages.push({ id: `temp-gallery-${file.name}-${Date.now()}`, url: imageUrl }); }
            else { showSnackbar(`"${file.name}" debe ser ${REQUIRED_GALLERY_IMAGE_WIDTH}x${REQUIRED_GALLERY_IMAGE_HEIGHT}px.`, 'error'); URL.revokeObjectURL(imageUrl); }
        }
        if (newImages.length > 0) { setGalleryImages(p => [...p, ...newImages]); showSnackbar(`${newImages.length} imagen(es) añadidas. Guarda los cambios.`, 'success'); }
    }, [galleryImages, showSnackbar]);
    const handleImageFileChange = useCallback(e => { if (e.target.files) processGalleryFiles(e.target.files); if (e.target) e.target.value = null; }, [processGalleryFiles]);
    const handleImageContainerDrop = useCallback(e => { e.preventDefault(); setIsImageDragOver(false); if (e.dataTransfer.files) processGalleryFiles(e.dataTransfer.files); }, [processGalleryFiles]);
    const handleDeleteImage = useCallback(id => { setGalleryImages(p => p.filter(img => { if (img.id === id && img.url.startsWith('blob:')) URL.revokeObjectURL(img.url); return img.id !== id; })); showSnackbar('Imagen eliminada. Guarda los cambios.', 'info'); }, [showSnackbar]);
    const handleImageDragStart = useCallback(e => setActiveImageDragId(e.active.id), []);
    const handleImageDragEnd = useCallback(({ active, over }) => { setActiveImageDragId(null); if (over && active.id !== over.id) { setGalleryImages(items => arrayMove(items, items.findIndex(i => i.id === active.id), items.findIndex(i => i.id === over.id))); } }, []);
    const handleImageDragCancel = useCallback(() => setActiveImageDragId(null), []);
    const handleImageUploadClick = useCallback(() => galleryFileInputRef.current.click(), []);
    const handleImageContainerDragOver = useCallback(e => { e.preventDefault(); setIsImageDragOver(true); }, []);
    const handleImageContainerDragLeave = useCallback(() => setIsImageDragOver(false), []);

    // --- Documentación con Validaciones ---
    const processDocFiles = useCallback(files => {
        const newDocs = [];
        for (const file of Array.from(files)) {
            if (documentationFiles.length + newDocs.length >= MAX_DOCUMENTS_TOTAL) { showSnackbar(`Máximo ${MAX_DOCUMENTS_TOTAL} documentos.`, 'warning'); break; }
            if (file.type !== 'application/pdf') { showSnackbar(`"${file.name}" no es un PDF.`, 'error'); continue; }
            if (file.size > MAX_DOCUMENT_FILE_SIZE_BYTES) { showSnackbar(`"${file.name}" supera los ${MAX_DOCUMENT_FILE_SIZE_MB} MB.`, 'error'); continue; }
            newDocs.push({ id: `temp-doc-${file.name}-${Date.now()}`, url: URL.createObjectURL(file) });
        }
        if (newDocs.length > 0) { setDocumentationFiles(p => [...p, ...newDocs]); showSnackbar(`${newDocs.length} documento(s) añadidos. Guarda los cambios.`, 'success'); }
    }, [documentationFiles, showSnackbar]);
    const handleDocFileChange = useCallback(e => { if (e.target.files) processDocFiles(e.target.files); if (e.target) e.target.value = null; }, [processDocFiles]);
    const handleDocContainerDrop = useCallback(e => { e.preventDefault(); setIsDocDragOver(false); if (e.dataTransfer.files) processDocFiles(e.dataTransfer.files); }, [processDocFiles]);
    const handleDeleteDocument = useCallback(id => { setDocumentationFiles(p => p.filter(doc => { if (doc.id === id && doc.url.startsWith('blob:')) URL.revokeObjectURL(doc.url); return doc.id !== id; })); showSnackbar('Documento eliminado. Guarda los cambios.', 'info'); }, [showSnackbar]);
    const handleDocDragStart = useCallback(e => setActiveDocDragId(e.active.id), []);
    const handleDocDragEnd = useCallback(({ active, over }) => { setActiveDocDragId(null); if (over && active.id !== over.id) { setDocumentationFiles(items => arrayMove(items, items.findIndex(i => i.id === active.id), items.findIndex(i => i.id === over.id))); } }, []);
    const handleDocDragCancel = useCallback(() => setActiveDocDragId(null), []);
    const handleDocUploadClick = useCallback(() => docFileInputRef.current.click(), []);
    const handleDocContainerDragOver = useCallback(e => { e.preventDefault(); setIsDocDragOver(true); }, []);
    const handleDocContainerDragLeave = useCallback(() => setIsDocDragOver(false), []);

    return {
        currentProduct,
        videos,
        galleryImages,
        documentationFiles,
        history,
        countrySettings,
        productStatus,
        loading,
        error,
        loadingAction,
        snackbar,
        isEditingName,
        editableProductName,
        setEditableProductName,
        newVideoUrl,
        activeVideoDragId,
        activeImageDragId,
        isImageDragOver,
        galleryFileInputRef,
        isDocDragOver,
        docFileInputRef,
        activeDocDragId,
        handleSnackbarClose,
        handleFieldChange,
        handleEditNameClick,
        handleSave,
        handleRequestApproval,
        handlePublish,
        handleUnpublish,
        handleReject,
        handleReturnToEdit,
        handleUpdateCountrySetting,
        getCurrentCountryData,
        openRequestConfirm,
        setOpenRequestConfirm,
        openPublishConfirm,
        setOpenPublishConfirm,
        openUnpublishConfirm,
        setOpenUnpublishConfirm,
        openRejectConfirm,
        setOpenRejectConfirm,
        openRejectCommentDialog,
        setOpenRejectCommentDialog,
        rejectComment,
        setRejectComment,
        handleConfirmRequestApproval,
        handleConfirmPublish,
        handleConfirmUnpublish,
        handleConfirmReject,
        handleSendRejectWithComment,
        handleVideoUrlChange,
        handleAddVideo,
        handleDeleteVideo,
        handleVideoDragStart,
        handleVideoDragEnd,
        handleVideoDragCancel,
        handleDeleteImage,
        handleImageDragStart,
        handleImageDragEnd,
        handleImageDragCancel,
        handleImageUploadClick,
        handleImageFileChange,
        handleImageContainerDragOver,
        handleImageContainerDragLeave,
        handleImageContainerDrop,
        handleDeleteDocument,
        handleDocDragStart,
        handleDocDragEnd,
        handleDocDragCancel,
        handleDocUploadClick,
        handleDocFileChange,
        handleDocContainerDragOver,
        handleDocContainerDragLeave,
        handleDocContainerDrop
    };
};