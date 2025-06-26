import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import * as userApi from '../services/userApi';
import { ROLES_MAP } from '../../utils/constants';

const normalizeText = (text) =>
  text?.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase() || '';

export const useUsers = () => {
  const { user, fetchWithRefresh } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [filters, setFilters] = useState({ is_active: '', role: '' });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  const showSnackbar = (message, severity = 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await userApi.getUsers(fetchWithRefresh);
      const withIds = data.map((item) => ({
        ...item,
        is_active: item.is_active,
        role: item.role?.name ?? '-',
      }));
      setUsers(withIds);
    } catch (error) {
      console.error(error);
      showSnackbar('Error al cargar los usuarios', 'error');
    } finally {
      setLoading(false);
    }
  }, [fetchWithRefresh]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const filteredUsers = useMemo(() => {
    const normalizedSearch = normalizeText(search);
    return users.filter((u) => {
      const matchesSearch = ['full_name', 'email'].some((field) =>
        normalizeText(u[field] || '').includes(normalizedSearch)
      );
      const matchesActive = filters.is_active !== '' ? u.is_active === filters.is_active : true;
      const matchesRole = filters.role ? u.role === filters.role : true;
      return matchesSearch && matchesActive && matchesRole;
    });
  }, [search, users, filters]);

  const handleOpenDialog = (user) => {
    setSelectedUser(user);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setSelectedUser(null);
    setIsDialogOpen(false);
  };

  const handleSaveUser = async (formData, assignments = []) => {
    if (!selectedUser) return;
    setLoading(true);

    try {
        const payloadUser = {};
        if (formData.is_active !== selectedUser.is_active) {
            payloadUser.is_active = formData.is_active;
        }
        
        const selectedRole = ROLES_MAP.find(r => r.name === formData.role);
        const currentRole = ROLES_MAP.find(r => r.name === selectedUser.role);
        if (selectedRole && selectedRole.id !== currentRole?.id) {
            payloadUser.role_id = selectedRole.id;
        }
        
        if (Object.keys(payloadUser).length > 0) {
            await userApi.updateUser(selectedUser.id, payloadUser, fetchWithRefresh);
        }

        await userApi.assignFamiliesToUser(selectedUser.id, assignments, fetchWithRefresh);

        await fetchUsers();
        
        showSnackbar('Usuario guardado exitosamente', 'success');
        handleCloseDialog();
    } catch (error) {
        console.error('Error al guardar:', error);
        showSnackbar(`Error al guardar: ${error.message}`, 'error');
    } finally {
        setLoading(false);
    }
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') return;
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  return {
    users,
    loading,
    search,
    setSearch,
    filters,
    setFilters,
    filteredUsers,
    selectedUser,
    isDialogOpen,
    handleOpenDialog,
    handleCloseDialog,
    handleSaveUser,
    snackbar,
    handleSnackbarClose
  };
};