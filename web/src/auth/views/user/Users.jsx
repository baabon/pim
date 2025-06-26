import {
  Avatar,
  CircularProgress,
  Paper,
  TextField,
  Chip,
  Box,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { esES } from '@mui/x-data-grid/locales';
import { useUsers } from '../../hooks/useUsers';
import UserEditDialog from './UserEditDialog';
import { ROLES_MAP } from '../../../utils/constants';

const roles = ROLES_MAP.map(r => r.name);

export default function Users() {
  const {
    loading,
    search,
    setSearch,
    setFilters,
    filteredUsers,
    selectedUser,
    isDialogOpen,
    handleOpenDialog,
    handleCloseDialog,
    handleSaveUser
  } = useUsers();

  const columns = [
    {
      field: 'picture',
      headerName: '',
      width: 60,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Avatar
          src={params.value}
          alt={params.row.full_name}
          style={{ width: 40, height: 40, objectFit: 'cover' }}
        />
      ),
    },
    { field: 'full_name', headerName: 'Nombre completo', flex: 1 },
    { field: 'email', headerName: 'Email', flex: 1 },
    {
      field: 'is_active',
      headerName: 'Estado',
      flex: 1,
      type: 'boolean',
      renderCell: (params) => (
        <Chip
          label={params.value ? 'Activo' : 'Desactivado'}
          color={params.value ? 'success' : 'default'}
          size="small"
        />
      ),
    },
    {
      field: 'role',
      headerName: 'Rol',
      flex: 1,
      type: 'singleSelect',
      valueOptions: roles,
      valueGetter: (params) => params || '',
    },
  ];

  const handleFilterChange = (filterModel) => {
    const newFilters = { is_active: '', role: '' };
    filterModel.items.forEach((filter) => {
      if (filter.value !== undefined) {
        newFilters[filter.columnField] = filter.value;
      }
    });
    setFilters(newFilters);
  };

  return (
    <div>
      <h2 className="module-title">Usuarios</h2>
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" height="calc(100vh - 200px)">
          <CircularProgress sx={{ color: '#0a1a28' }} />
        </Box>
      ) : (
        <Paper sx={{ p: 2 }}>
          <TextField
            label="Buscar usuario"
            variant="outlined"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
          />
          <Box sx={{ height: 600, width: '100%' }}>
            <DataGrid
              rows={filteredUsers}
              columns={columns}
              pageSizeOptions={[5, 10, 25, 50]}
              pagination
              disableRowSelectionOnClick
              filterMode="client"
              localeText={esES.components.MuiDataGrid.defaultProps.localeText}
              onFilterModelChange={handleFilterChange}
              onRowClick={(params) => handleOpenDialog(params.row)}
              sx={{
                border: 0,
                '& .MuiDataGrid-row:hover': { cursor: 'pointer' },
                '& .MuiDataGrid-row:focus, & .MuiDataGrid-cell:focus, & .MuiDataGrid-columnHeader:focus': {
                  outline: 'none',
                  boxShadow: 'none',
                  backgroundColor: 'inherit',
                },
              }}
              initialState={{
                pagination: { paginationModel: { pageSize: 10, page: 0 } },
              }}
            />
          </Box>
        </Paper>
      )}
      <UserEditDialog
        open={isDialogOpen}
        onClose={handleCloseDialog}
        user={selectedUser}
        onSave={handleSaveUser}
      />
    </div>
  );
}