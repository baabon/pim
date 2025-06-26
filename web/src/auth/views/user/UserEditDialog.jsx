import React, { useState, useEffect } from 'react';
import {
  Avatar, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle,
  FormControl, InputLabel, Select, MenuItem, Switch, FormControlLabel,
  Autocomplete, TextField, Typography, Box, Snackbar, Alert,
} from '@mui/material';
import { ROLES_MAP, AREAS_MAP, FAMILIES_MAP, SUBFAMILIES_MAP } from '../../../utils/constants';

const roles = ROLES_MAP.map(r => r.name);

export default function UserEditDialog({ open, onClose, user, onSave }) {
  const [form, setForm] = useState({ is_active: false, role: '', area: '', family: '', subfamily: '' });
  const [assignments, setAssignments] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  useEffect(() => {
    if (user) {
      setForm({
        is_active: user.is_active ?? false,
        role: user.role || '',
        area: '',
        family: '',
        subfamily: '',
      });
      setAssignments(user.family_assignments || []);
    }
  }, [user]);

  const showSnackbar = (message, severity = 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const handleChange = (field, value) => {
    const newForm = { ...form, [field]: value };
    if (field === 'area') { newForm.family = ''; newForm.subfamily = ''; }
    if (field === 'family') { newForm.subfamily = ''; }
    setForm(newForm);
  };

  const addAssignment = () => {
    if (!form.area || !form.family || !form.subfamily) {
      showSnackbar('Debes seleccionar Área, Familia y Subfamilia para agregar la asignación.', 'warning');
      return;
    }
    const newAssignment = { area_id: form.area, family_id: form.family, subfamily_id: form.subfamily };
    if (assignments.some(a => a.subfamily_id === newAssignment.subfamily_id)) {
      showSnackbar('Esta asignación ya fue agregada.', 'info');
      return;
    }
    setAssignments([...assignments, newAssignment]);
    setForm(prev => ({ ...prev, family: '', subfamily: '' }));
    showSnackbar('Asignación agregada exitosamente.', 'success');
  };

  const removeAssignment = (index) => {
    setAssignments(assignments.filter((_, i) => i !== index));
    showSnackbar('Asignación eliminada.', 'info');
  };

  const handleSaveClick = () => {
    onSave(form, assignments);
  };

  const availableFamilies = form.area ? FAMILIES_MAP.filter(f => f.areaId === form.area) : [];
  const availableSubfamilies = form.family ? SUBFAMILIES_MAP.filter(s => s.familyId === form.family) : [];

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Editar usuario</DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: { xs: 'flex-start', sm: 'center' },
            justifyContent: { xs: 'flex-start', sm: 'space-between' },
            mb: 2,
            gap: { xs: 2, sm: 0 },
          }}
        >
          <Box display="flex" alignItems="center" gap={2}>
            <Avatar src={user?.picture} alt={user?.full_name} sx={{ width: 56, height: 56 }} />
            <Box>
              <Typography variant="subtitle1" fontWeight="bold">
                {user?.full_name || '-'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {user?.email || '-'}
              </Typography>
            </Box>
          </Box>
          <FormControlLabel
            control={
              <Box
                sx={{
                  display: 'inline-block',
                  borderRadius: 16,
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.25)',
                  padding: '2px',
                  transition: 'box-shadow 0.3s ease',
                }}
              >
                <Switch
                  checked={form.is_active}
                  onChange={(e) => handleChange('is_active', e.target.checked)}
                  sx={{
                    width: { xs: 100, sm: 120 },
                    height: 40,
                    padding: 0,
                    '& .MuiSwitch-switchBase': {
                      padding: 0,
                      margin: 0,
                      transitionDuration: '300ms',
                      '&.Mui-checked': {
                        color: '#D2D2D2',
                        transform: { xs: 'translateX(60px)', sm: 'translateX(80px)' },
                        '& + .MuiSwitch-track': {
                          backgroundColor: '#fff',
                          opacity: 1,
                          borderRadius: 16,
                        },
                      },
                      '&:not(.Mui-checked)': {
                        transform: 'translateX(0)',
                      },
                    },
                    '& .MuiSwitch-thumb': {
                      boxShadow: '0 2px 4px rgb(0 35 11 / 20%)',
                      width: 34,
                      height: 34,
                      borderRadius: 13,
                      transition: 'all 300ms',
                      position: 'absolute',
                      top: '20px',
                      left: 3,
                      transform: 'translateY(-50%)',
                      zIndex: 1,
                      background: 'linear-gradient(135deg, #F76B4F 0%, #F9A278 100%)',
                    },
                    '& .MuiSwitch-switchBase.Mui-checked .MuiSwitch-thumb': {
                      background: 'linear-gradient(135deg, #6FDB92 0%, #94F4B5 100%)',
                    },
                    '& .MuiSwitch-track': {
                      borderRadius: 16,
                      backgroundColor: '#fff',
                      opacity: 1,
                      transition: 'background-color 300ms',
                      position: 'relative',
                      '&:before, &:after': {
                        position: 'absolute',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        fontWeight: 'bold',
                        color: '#bbb',
                        userSelect: 'none',
                      },
                      '&:before': {
                        content: '"Desactivado"',
                        right: { xs: 4, sm: 8 },
                        fontSize: { xs: 10, sm: 12 },
                        opacity: 1,
                        transition: 'opacity 300ms',
                      },
                      '&:after': {
                        content: '"Activo"',
                        left: { xs: 18, sm: 30 },
                        fontSize: { xs: 10, sm: 12 },
                        opacity: 0,
                        transition: 'opacity 300ms',
                      },
                    },
                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track:before': {
                      opacity: 0,
                    },
                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track:after': {
                      opacity: 1,
                    },
                  }}
                />
              </Box>
            }
            label=""
            sx={{
              margin: { xs: '0', sm: '0 0 0 auto' },
              width: { xs: '100%', sm: 'auto' },
              display: 'flex',
              justifyContent: { xs: 'flex-start', sm: 'flex-end' },
            }}
          />
        </Box>

        <FormControl fullWidth>
          <InputLabel>Rol</InputLabel>
          <Select
            value={form.role}
            label="Rol"
            onChange={(e) => handleChange('role', e.target.value)}
          >
            {roles.map((r) => (
              <MenuItem key={r} value={r}>{r}</MenuItem>
            ))}
          </Select>
        </FormControl>

        {form.role === 'Product Manager' && (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
            }}
          >
            <FormControl fullWidth>
              <Autocomplete
                options={AREAS_MAP}
                getOptionLabel={(option) => option.name}
                value={AREAS_MAP.find((a) => a.id === form.area) || null}
                onChange={(_, newValue) => handleChange('area', newValue?.id || '')}
                renderInput={(params) => <TextField {...params} label="Área" fullWidth />}
              />
            </FormControl>
            <FormControl fullWidth disabled={!form.area}>
              <Autocomplete
                options={availableFamilies}
                getOptionLabel={(option) => option.name}
                value={availableFamilies.find((f) => f.id === form.family) || null}
                onChange={(_, newValue) => handleChange('family', newValue?.id || '')}
                renderInput={(params) => (
                  <TextField {...params} label="Familia" fullWidth disabled={!form.area} />
                )}
              />
            </FormControl>
            <FormControl fullWidth disabled={!form.family}>
              <Autocomplete
                options={availableSubfamilies}
                getOptionLabel={(option) => option.name}
                value={availableSubfamilies.find((s) => s.id === form.subfamily) || null}
                onChange={(_, newValue) => handleChange('subfamily', newValue?.id || '')}
                renderInput={(params) => (
                  <TextField {...params} label="Subfamilia" fullWidth disabled={!form.family} />
                )}
              />
            </FormControl>
            {assignments.length > 0 && (
              <Box
                sx={{
                  maxHeight: 150,
                  overflowY: 'auto',
                  border: '1px solid #ddd',
                  borderRadius: 2,
                  p: 1,
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 1,
                  mt: 1,
                }}
              >
                {assignments.map((a, index) => {
                  const areaName = AREAS_MAP.find((x) => x.id === a.area_id)?.name || 'Área';
                  const familyName = FAMILIES_MAP.find((x) => x.id === a.family_id)?.name || 'Familia';
                  const subfamilyName = SUBFAMILIES_MAP.find((x) => x.id === a.subfamily_id)?.name || 'Subfamilia';

                  return (
                    <Chip
                      key={index}
                      label={`${areaName} / ${familyName} / ${subfamilyName}`}
                      onDelete={() => removeAssignment(index)}
                      variant="outlined"
                      sx={{
                        fontSize: '10px',
                        height: 24,
                        padding: '0 6px',
                      }}
                    />
                  );
                })}
              </Box>
            )}
            <Button
              variant="outlined"
              onClick={addAssignment}
              sx={{
                color: '#fff',
                backgroundColor: '#546a7b',
                border: 0
              }}
            >
              Agregar asignación
            </Button>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button
          onClick={handleSaveClick}
          variant="contained"
          sx={{
            backgroundColor: '#0a1a28',
            transition: 'all .5s ease',
            '&:hover': {
              backgroundColor: '#21E0B2'
            }
          }}
        >
          Guardar
        </Button>
      </DialogActions>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Dialog>
  );
}