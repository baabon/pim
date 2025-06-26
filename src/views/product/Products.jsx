import React, { useEffect, useState, useCallback } from 'react';
import {
  CircularProgress,
  Paper,
  TextField,
  Chip,
  Box,
  Fade,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { esES } from '@mui/x-data-grid/locales';
import { useAuth } from '../../auth/contexts/AuthContext';
import ProductDetailView from './ProductDetailView';

const PLACEHOLDER_IMAGE = '/placeholder.jpg';

const productGallery = [
  "/product/gallery/4667_3043.jpg",
  "/product/gallery/4668_3043.jpg",
  "/product/gallery/4669_3043.jpg",
];

const estadoDisplayNames = {
  'draft': 'Borrador',
  'editing': 'En edición',
  'pending_approval': 'Pendiente de aprobación',
  'published': 'Publicado',
  'deactivated': 'Desactivado',
};

const productTypeDisplayNames = {
  'simple': 'Simple',
  'configurable': 'Configurable',
  'virtual': 'Virtual',
};

const estadoColors = {
  'draft': 'default',
  'editing': 'info',
  'pending_approval': 'warning',
  'published': 'success',
  'deactivated': 'error',
};

const productTypeColors = {
  'simple': 'secondary',
  'configurable': 'primary',
  'virtual': 'default',
};

const statusFilterOptions = Object.keys(estadoDisplayNames).map(code => ({
  value: code,
  label: estadoDisplayNames[code],
}));

const productTypeFilterOptions = Object.keys(productTypeDisplayNames).map(code => ({
  value: code,
  label: productTypeDisplayNames[code],
}));

export default function Products({ mainScrollRef }) {
  const { user, fetchWithRefresh } = useAuth();
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showDetail, setShowDetail] = useState(false);

  const [filters, setFilters] = useState({
    product_type: '',
    status: '',
    published: '',
  });

  const fetchProductsData = useCallback(async () => {
    setLoadingProducts(true);
    try {
      const response = await fetchWithRefresh(`${import.meta.env.VITE_API_URL}/v1/products/`, {
        headers: {
          Authorization: `Bearer ${user.access}`,
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        const data = await response.json();
        const withIds = data.map((item) => ({
          ...item,
          id: item.id.toString(),
          product_type_code: item.product_type.code,
          product_type_name: item.product_type.name,
          product_type: item.product_type,
          status: item.status,
          status_code: item.status.code,
          status_name: item.status.name,
          published: item.published,
          published_str: item.published ? 'Sí' : 'No', 
        }));
        setProducts(withIds);
        setFiltered(withIds);
      } else {
        console.error('Error al traer los productos');
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoadingProducts(false);
    }
  }, [user, fetchWithRefresh]);

  useEffect(() => {
    fetchProductsData();
  }, [fetchProductsData]);

  const normalizeText = (text) =>
    text?.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase() || '';

  useEffect(() => {
    const normalizedSearch = normalizeText(search);

    const result = products.filter((p) => {
      const matchesSearch = ['name', 'sku', 'brand', 'area', 'family', 'subfamily'].some((field) =>
        normalizeText(p[field] || '').includes(normalizedSearch)
      );

      const matchesProductType = filters.product_type
        ? p.product_type_code === filters.product_type 
        : true;

      const matchesStatus = filters.status
        ? p.status_code === filters.status 
        : true;

      const matchesPublished = filters.published
        ? p.published_str === filters.published
        : true;

      return matchesSearch && matchesProductType && matchesStatus && matchesPublished;
    });

    setFiltered(result);
  }, [search, products, filters]);

  const columns = [
    {
      field: 'photo',
      headerName: '',
      width: 60,
      display: 'flex',
      sortable: false,
      filterable: false,
      resizable: false,
      renderCell: (params) => (
        <img
          src={productGallery.length > 0 ? productGallery[0] : PLACEHOLDER_IMAGE}
          alt={params.row.sku}
          style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 4 }}
        />
      ),
    },
    {
      field: 'sku',
      headerName: 'SKU',
      flex: 1
    },
    {
      field: 'name',
      headerName: 'Nombre',
      flex: 2
    },
    {
      field: 'brand',
      headerName: 'Marca',
      flex: 1
    },
    {
      field: 'area',
      headerName: 'Área',
      flex: 1
    },
    {
      field: 'family',
      headerName: 'Familia',
      flex: 1
    },
    {
      field: 'subfamily',
      headerName: 'Subfamilia',
      flex: 1
    },
    {
      field: 'product_type_code', 
      headerName: 'Tipo',
      flex: 1,
      filterable: true,
      type: 'singleSelect',
      valueOptions: productTypeFilterOptions,
      renderCell: (params) => {
        const color = productTypeColors[params.row.product_type.code] || 'default';
        return <Chip label={`Producto ${params.row.product_type.name}`} color={color} size="small" sx={{ fontWeight: 600 }} />;
      },
    },
    {
      field: 'status_code', 
      headerName: 'Estado',
      flex: 1,
      filterable: true,
      type: 'singleSelect',
      valueOptions: statusFilterOptions,
      renderCell: (params) => {
        const color = estadoColors[params.row.status.code] || 'default';
        return <Chip label={params.row.status.name} color={color} size="small" sx={{ fontWeight: 600 }} />;
      },
    },
    {
      field: 'published_str',
      headerName: 'Publicado',
      flex: 1,
      filterable: true,
      type: 'singleSelect',
      valueOptions: ['Sí', 'No'],
      renderCell: (params) => (
        <Chip
          label={params.value}
          color={params.value === 'Sí' ? 'success' : 'default'}
          size="small"
          sx={{ fontWeight: 600 }}
        />
      ),
    },
  ];

  const handleFilterChange = (filterModel) => {
    const newFilters = { product_type: '', status: '', published: '' };
    filterModel.items.forEach((filter) => {
      if (filter.value) {
        if (filter.columnField === 'product_type_code') {
          newFilters.product_type = filter.value;
        } else if (filter.columnField === 'status_code') {
          newFilters.status = filter.value;
        } else if (filter.columnField === 'published_str') {
          newFilters.published = filter.value;
        }
        else {
          newFilters[filter.columnField] = filter.value;
        }
      }
    });
    setFilters(newFilters);
  };

  const handleRowClick = async (params) => {
    setLoadingDetail(true);
    try {
      const response = await fetchWithRefresh(`${import.meta.env.VITE_API_URL}/v1/products/${params.row.id}/`, {
        headers: {
          Authorization: `Bearer ${user.access}`,
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        const data = await response.json();
        setSelectedProduct({
          ...data,
          id: data.id.toString(),
          product_type: data.product_type,
          status: data.status,
          published: data.published,
        });
        setShowDetail(true);
      }
    } catch (error) {
      console.error('Error al cargar detalle:', error);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleBackToList = () => {
    setShowDetail(false);
    fetchProductsData();
  };

  return (
    <div>
      {!showDetail && (
        <Fade in={!showDetail} timeout={500}>
          <div>
            <h2 className="module-title">Productos</h2>
            {loadingProducts ? (
              <Box display="flex" justifyContent="center" alignItems="center" height="calc(100vh - 64px)">
                <CircularProgress sx={{ color: '#0a1a28' }} />
              </Box>
            ) : (
              <Paper sx={{ p: 2 }}>
                <TextField
                  label="Buscar producto"
                  variant="outlined"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  fullWidth
                  sx={{ mb: 2 }}
                />

                <Box sx={{ height: 600, width: '100%' }}>
                  <DataGrid
                    rows={filtered}
                    columns={columns}
                    pageSizeOptions={[5, 10, 25, 50]}
                    pagination
                    disableRowSelectionOnClick
                    filterMode="client"
                    localeText={esES.components.MuiDataGrid.defaultProps.localeText}
                    onFilterModelChange={handleFilterChange}
                    onRowClick={handleRowClick}
                    sx={{
                      border: 0,
                      '& .MuiDataGrid-row:hover': {
                        cursor: 'pointer',
                      },
                      '& .MuiDataGrid-row:focus, & .MuiDataGrid-cell:focus, & .MuiDataGrid-columnHeader:focus': {
                        outline: 'none',
                        boxShadow: 'none',
                        backgroundColor: 'inherit',
                      },
                    }}
                    initialState={{
                      pagination: {
                        paginationModel: { pageSize: 10, page: 0 },
                      },
                      filter: {
                        filterModel: {
                          items: [],
                        },
                      },
                    }}
                  />
                </Box>
              </Paper>
            )}
          </div>
        </Fade>
      )}

      {selectedProduct && showDetail && (
        <Fade in={showDetail} timeout={500}>
          <div>
            <ProductDetailView
              product={selectedProduct}
              onBack={handleBackToList}
              isLoading={loadingDetail}
              mainScrollRef={mainScrollRef}
              onProductUpdated={fetchProductsData}
            />
          </div>
        </Fade>
      )}
    </div>
  );
}