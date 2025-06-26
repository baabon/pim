import { useEffect, useState } from 'react';
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
import { useAuth } from '../contexts/AuthContext';
import UserEditDialog from './UserEditDialog';

const rolesMap = [
  { id: 1, name: "Administrator" },
  { id: 2, name: "Product Manager" },
  { id: 3, name: "Default User" },
];

const roles = rolesMap.map(r => r.name);

export default function Users() {
  const { user, fetchWithRefresh } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [open, setOpen] = useState(false);

  const [filters, setFilters] = useState({
    is_active: '',
    role: '',
  });

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetchWithRefresh(`${import.meta.env.VITE_API_URL}/v1/users/`, {
          headers: {
            Authorization: `Bearer ${user.access}`,
            'Content-Type': 'application/json',
          },
        });
        if (response.ok) {
          const data = await response.json();
          const withIds = data.map((item) => ({
            ...item,
            is_active: item.is_active,
            role: item.role?.name ?? '-',
          }));
          setUsers(withIds);
          setFiltered(withIds);
        } else {
          console.error('Error al traer los usuarios');
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [user]);

  const normalizeText = (text) =>
    text?.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase() || '';

  useEffect(() => {
    const normalizedSearch = normalizeText(search);

    const result = users.filter((u) => {
      const matchesSearch = ['full_name', 'email'].some((field) =>
        normalizeText(u[field] || '').includes(normalizedSearch)
      );

      const matchesActive = filters.is_active !== ''
        ? u.is_active === filters.is_active
        : true;

      const matchesRole = filters.role
        ? u.role === filters.role
        : true;

      return matchesSearch && matchesActive && matchesRole;
    });

    setFiltered(result);
  }, [search, users, filters]);

  const columns = [
    {
      field: 'picture',
      headerName: '',
      width: 60,
      display: 'flex',
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
    {
      field: 'full_name',
      headerName: 'Nombre completo',
      flex: 1,
    },
    {
      field: 'email',
      headerName: 'Email',
      flex: 1,
    },
    {
      field: 'is_active',
      headerName: 'Estado',
      flex: 1,
      filterable: true,
      type: 'boolean',
      headerAlign: 'left',
      align: 'left',
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
      filterable: true,
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

  const handleSave = async (data, assignments = []) => {
    if (!selectedUser) return;

    const payloadUser = {};

    if (data.is_active !== selectedUser.is_active) {
      payloadUser.is_active = data.is_active;
    }

    const selectedRole = rolesMap.find(r => r.name === data.role);
    const currentRole = rolesMap.find(r => r.name === selectedUser.role);

    if (selectedRole && selectedRole.id !== currentRole?.id) {
      payloadUser.role_id = selectedRole.id;
    }

    let userUpdatedFromBackend = null;

    try {
      if (Object.keys(payloadUser).length > 0) {
        const responseUser = await fetchWithRefresh(`${import.meta.env.VITE_API_URL}/v1/users/${selectedUser.id}/`, {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${user.access}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payloadUser),
        });

        if (!responseUser.ok) {
          console.error('Error al actualizar usuario:', await responseUser.text());
          return;
        }
        userUpdatedFromBackend = await responseUser.json();
      } else {
        userUpdatedFromBackend = { ...selectedUser };
      }

      const payloadFamilies = assignments.map(a => ({
        area_id: a.area_id,
        family_id: a.family_id,
        subfamily_id: a.subfamily_id,
      }));

      const responseFamily = await fetchWithRefresh(
        `${import.meta.env.VITE_API_URL}/v1/users/${selectedUser.id}/families/assign`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${user.access}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payloadFamilies),
        }
      );

      if (!responseFamily.ok) {
        console.error('Error al actualizar asignación de familia:', await responseFamily.text());
      }

      const updatedFullUser = await fetchWithRefresh(`${import.meta.env.VITE_API_URL}/v1/users/${selectedUser.id}/`, {
        headers: {
          Authorization: `Bearer ${user.access}`,
          'Content-Type': 'application/json',
        },
      });
      const updatedUserData = updatedFullUser.ok ? await updatedFullUser.json() : null;


      if (updatedUserData) {
        const finalUpdatedUser = {
            ...updatedUserData,
            is_active: updatedUserData.is_active,
            role: updatedUserData.role?.name ?? '-',
            family_assignments: updatedUserData.family_assignments || []
        };

        setUsers((prevUsers) =>
          prevUsers.map((u) => (u.id === finalUpdatedUser.id ? finalUpdatedUser : u))
        );
        setFiltered((prevFiltered) =>
          prevFiltered.map((u) => (u.id === finalUpdatedUser.id ? finalUpdatedUser : u))
        );
        setSelectedUser(finalUpdatedUser);
      } else {
        console.error('No se pudo re-obtener el usuario actualizado.');
      }

      setOpen(false);
    } catch (error) {
      console.error('Error general al guardar:', error);
    }
  };


  return (
    <div>
      <h2 className="module-title">Usuarios</h2>

      {loading ? (
        <CircularProgress sx={{ color: '#0a1a28' }} />
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
              rows={filtered}
              columns={columns}
              pageSizeOptions={[5, 10, 25, 50]}
              pagination
              disableRowSelectionOnClick
              filterMode="client"
              localeText={esES.components.MuiDataGrid.defaultProps.localeText}
              onFilterModelChange={handleFilterChange}
              onRowClick={(params) => {
                setSelectedUser(params.row);
                setOpen(true);
              }}
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

      <UserEditDialog
        open={open}
        onClose={() => setOpen(false)}
        user={selectedUser}
        onSave={handleSave}
      />
    </div>
  );
}