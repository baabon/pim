import {
    INITIAL_PRODUCT_GALLERY_DATA,
    INITIAL_PRODUCT_DOCUMENTATION_DATA
} from '../utils/constants';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

// --- FUNCIONES DE PRODUCTO ---
export const getProducts = async (fetchWithRefresh) => {
    const response = await fetchWithRefresh(`${API_BASE_URL}/v1/products/`);
    if (!response.ok) throw new Error('Error al obtener la lista de productos');
    return response.json();
};

export const getProductDetails = async (productId, fetchWithRefresh) => {
    const response = await fetchWithRefresh(`${API_BASE_URL}/v1/products/${productId}/`);
    if (!response.ok) throw new Error('Error al obtener detalles del producto');
    return response.json();
};

export const getProductHistory = async (productId, fetchWithRefresh) => {
    const response = await fetchWithRefresh(`${API_BASE_URL}/v1/products/${productId}/history/`);
    if (!response.ok) throw new Error('Error al obtener el historial del producto');
    return response.json();
};

export const saveProduct = async (productId, productData, fetchWithRefresh) => {
    const response = await fetchWithRefresh(`${API_BASE_URL}/v1/products/${productId}/`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData),
    });
    if (!response.ok) throw new Error(`Error al guardar el producto: ${await response.text()}`);
    return response.json();
};

export const updateProductStatus = async (productId, statusPayload, fetchWithRefresh) => {
    const response = await fetchWithRefresh(`${API_BASE_URL}/v1/products/${productId}/status/update/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(statusPayload),
    });
    if (!response.ok) throw new Error(`Error al actualizar el estado: ${await response.text()}`);
    return response.json();
};

// --- FUNCIONES DE VIDEOS (SIMPLIFICADAS) ---
export const getProductVideos = async (productId, fetchWithRefresh) => {
    const response = await fetchWithRefresh(`${API_BASE_URL}/v1/products/${productId}/videos/`);
    if (!response.ok) throw new Error('Error al obtener los videos');
    return response.json();
};

export const saveProductVideos = async (productId, videos, fetchWithRefresh) => {
    const payload = videos.map((video) => ({
        youtube_url: video.url,
    }));
    const response = await fetchWithRefresh(`${API_BASE_URL}/v1/products/${productId}/videos/`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error(`Error al guardar los videos: ${await response.text()}`);
    return response.json();
};

// --- MOCKS PARA GALERÍA Y DOCUMENTACIÓN ---
export const getProductGallery = async (productId) => {
    console.log(`(MOCK) Obteniendo galería para el producto ${productId}`);
    return Promise.resolve(INITIAL_PRODUCT_GALLERY_DATA);
};

export const getProductDocumentation = async (productId) => {
    console.log(`(MOCK) Obteniendo documentación para el producto ${productId}`);
    return Promise.resolve(INITIAL_PRODUCT_DOCUMENTATION_DATA);
};