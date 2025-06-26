export const PLACEHOLDER_IMAGE = '/placeholder.jpg';
export const APP_BAR_HEIGHT = 64;

export const ESTADO_COLORS = {
  'draft': 'default',
  'editing': 'info',
  'pending_approval': 'warning',
  'published': 'success',
  'deactivated': 'error',
};

export const ESTADO_DISPLAY_NAMES = {
  'draft': 'Borrador',
  'editing': 'En edición',
  'pending_approval': 'Pendiente de aprobación',
  'published': 'Publicado',
  'deactivated': 'Desactivado',
};

export const PRODUCT_TYPE_COLORS = {
  'simple': 'secondary',
  'configurable': 'primary',
  'virtual': 'default',
};

export const PRODUCT_TYPE_DISPLAY_NAMES = {
  'simple': 'Simple',
  'configurable': 'Configurable',
  'virtual': 'Virtual',
};

export const FLAG_ICONS = {
  cl: '🇨🇱',
  pe: '🇵🇪',
  ec: '🇪🇨',
  bo: '🇧🇴',
};

export const CATEGORY_OPTIONS = [
  { value: '', label: '--- Seleccionar Categoría ---' },
  { value: 'A', label: 'A - Planificados' },
  { value: 'B', label: 'B - Iniciativa Comercial' },
  { value: 'C', label: 'C - A Pedido' },
  { value: 'I', label: 'I - Pedido' },
  { value: 'O', label: 'O - Obsoleto' },
  { value: 'Z', label: 'Z - Primario en Fase de salida' },
];

export const AVAILABLE_PRODUCTS = [
  { id: 'prod-A', sku: '12345', name: 'Producto A (SKU: 12345)' },
  { id: 'prod-B', sku: '67890', name: 'Producto B (SKU: 67890)' },
  { id: 'prod-C', sku: '11223', name: 'Producto C (SKU: 11223)' },
  { id: 'prod-D', sku: '44556', name: 'Producto D (SKU: 44556)' },
  { id: 'prod-E', sku: '77889', name: 'Producto E (SKU: 77889)' },
];

export const COUNTRIES_ORDER = ['cl', 'pe', 'ec', 'bo'];

export const getCountryDisplayName = (code) => {
  switch (code) {
    case 'cl': return 'Chile';
    case 'pe': return 'Perú';
    case 'ec': return 'Ecuador';
    case 'bo': return 'Bolivia';
    default: return code.charAt(0).toUpperCase() + code.slice(1);
  }
};

// Gallery
export const MAX_GALLERY_IMAGES_TOTAL = 10;
export const MAX_GALLERY_IMAGE_SIZE_KB = 200;
export const MAX_GALLERY_IMAGE_SIZE_BYTES = MAX_GALLERY_IMAGE_SIZE_KB * 1024;
export const REQUIRED_GALLERY_IMAGE_WIDTH = 500;
export const REQUIRED_GALLERY_IMAGE_HEIGHT = 500;
export const ALLOWED_GALLERY_MIME_TYPES = ['image/jpeg', 'image/jpg'];

export const INITIAL_PRODUCT_GALLERY_DATA = [
  "/product/gallery/4667_3043.jpg",
  "/product/gallery/4668_3043.jpg",
  "/product/gallery/4669_3043.jpg",
];

// Documentation
export const MAX_DOCUMENT_FILE_SIZE_MB = 5;
export const MAX_DOCUMENTS_TOTAL = 10;
export const MAX_DOCUMENT_FILE_SIZE_BYTES = MAX_DOCUMENT_FILE_SIZE_MB * 1024 * 1024;

export const INITIAL_PRODUCT_DOCUMENTATION_DATA = [
  "/product/documentation/4550_3043_4.pdf",
  "/product/documentation/4551_3043_4.pdf",
];

// Videos
export const MAX_VIDEOS_TOTAL = 3;
export const YOUTUBE_THUMBNAIL_BASE_URL = 'https://img.youtube.com/vi/';

export const INITIAL_PRODUCT_VIDEOS_DATA = [
  "https://www.youtube.com/watch?v=slciq1LkXFw",
  "https://www.youtube.com/watch?v=tKD85iQYhwE",
];

export function getYouTubeVideoId(url) {
  const regExp = /(?:https?:\/\/)?(?:www\.)?(?:m\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=|embed\/|v\/|)([\w-]{11})(?:\S+)?/i;
  const match = url.match(regExp);
  return match && match[1] ? match[1] : null;
}

export function getYouTubeThumbnail(videoId) {
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`; 
}