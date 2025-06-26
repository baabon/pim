// src/services/productApi.js

/**
 * NOTA: Asumo una URL base de la API en tus variables de entorno
 * y que la función `fetchWithRefresh` del contexto de Auth está disponible.
 */
const API_BASE_URL = import.meta.env.VITE_API_URL || '';

// --- FUNCIONES DE LECTURA (GET) ---

export const getProductDetails = async (productId, fetchWithRefresh) => {
  // Lógica extraída de tu hook principal original
  const response = await fetchWithRefresh(`${API_BASE_URL}/v1/products/${productId}/`);
  if (!response.ok) throw new Error('No se pudieron obtener los detalles del producto.');
  return response.json();
};

export const getProductVideos = async (productId, fetchWithRefresh) => {
  // Usando el nuevo endpoint de videos que solicitaste
  const response = await fetchWithRefresh(`${API_BASE_URL}/v1/products/${productId}/videos/`);
  if (!response.ok) throw new Error('No se pudieron obtener los videos del producto.');
  return response.json();
};

export const getProductHistory = async (productId, fetchWithRefresh) => {
  // Lógica extraída de tu hook principal original
  const response = await fetchWithRefresh(`${API_BASE_URL}/v1/products/${productId}/history/`);
  if (!response.ok) throw new Error('No se pudo obtener el historial del producto.');
  return response.json();
};

// --- FUNCIONES MOCK (Como solicitaste para galería y documentación) ---

export const getProductGallery = async (productId) => {
  console.log(`(MOCK) Obteniendo galería para el producto ${productId}`);
  const { MOCK_GALLERY } = await import('../utils/constants');
  return Promise.resolve(MOCK_GALLERY);
};

export const getProductDocumentation = async (productId) => {
  console.log(`(MOCK) Obteniendo documentación para el producto ${productId}`);
  const { MOCK_DOCUMENTATION } = await import('../utils/constants');
  return Promise.resolve(MOCK_DOCUMENTATION);
};


// --- FUNCIONES DE ESCRITURA (PUT, PATCH) ---

export const saveProduct = async (productId, productData, fetchWithRefresh) => {
  // Lógica extraída de tu `handleSave`
  const response = await fetchWithRefresh(`${API_BASE_URL}/v1/products/${productId}/`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(productData),
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Error al guardar el producto: ${errorText}`);
  }
  return response.json();
};

export const updateProductStatus = async (productId, statusPayload, fetchWithRefresh) => {
  // Lógica extraída de tu `updateProductStatusAndPublishedBackend`
  const response = await fetchWithRefresh(`${API_BASE_URL}/v1/products/${productId}/status/update/`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(statusPayload),
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Error al actualizar el estado: ${errorText}`);
  }
  return response.json();
};