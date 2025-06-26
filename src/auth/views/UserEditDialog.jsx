import React, { useState, useEffect } from 'react';
import {
  Avatar,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Autocomplete,
  TextField,
  Typography,
  Box,
  Snackbar,
  Alert,
} from '@mui/material';

const rolesMap = [
  { id: 1, name: "Administrator" },
  { id: 2, name: "Product Manager" },
  { id: 3, name: "Default User" },
];

const roles = rolesMap.map(r => r.name);

const areas = [
  { id: 157, name: 'ELÉCTRICA' },
  { id: 158, name: 'INDUSTRIAL' },
];

const families = [
  { id: 157015, name: 'INSTRUMENTOS DE MEDIDA', areaId: 157 },
  { id: 158012, name: 'TERMINALES DE PESO', areaId: 158 },
];

const subfamilies = [
  { id: 157015006, name: 'COMPROBACIÓN ELÉCTRICA', familyId: 157015 },
  { id: 157015010, name: 'HERRAMIENTAS DE CALIBRACIÓN', familyId: 157015 },
  { id: 158012012, name: 'TERMINALES BÁSICOS', familyId: 158012 },
];


export default function UserEditDialog({ open, onClose, user, onSave }) {
  const [form, setForm] = useState({
    is_active: user?.is_active ?? false,
    role: user?.role || '',
    area: '',
    family: '',
    subfamily: '',
  });

  const [assignments, setAssignments] = useState(user?.family_assignments || []);

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('info');

  useEffect(() => {
    if (user) {
      setForm({
        is_active: user?.is_active ?? false,
        role: user?.role || '',
        area: '',
        family: '',
        subfamily: '',
      });
      setAssignments(user.family_assignments || []);
    }
  }, [user]);

  const showSnackbar = (message, severity = 'info') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
      ...(field === 'area' ? { family: '', subfamily: '' } : {}),
      ...(field === 'family' ? { subfamily: '' } : {}),
    }));
  };

  const availableFamilies = families.filter(f => f.areaId === form.area);
  const availableSubfamilies = subfamilies.filter(s => s.familyId === form.family);

  const addAssignment = () => {
    if (!form.area || !form.family || !form.subfamily) {
      showSnackbar('Debes seleccionar Área, Familia y Subfamilia para agregar la asignación.', 'warning');
      return;
    }
    const exists = assignments.some(
      (a) => a.area_id === form.area && a.family_id === form.family && a.subfamily_id === form.subfamily
    );
    if (exists) {
      showSnackbar('Esta asignación ya fue agregada.', 'info');
      return;
    }
    setAssignments([...assignments, {
      area_id: form.area,
      family_id: form.family,
      subfamily_id: form.subfamily,
    }]);
    setForm((prev) => ({ ...prev, family: '', subfamily: '' }));
    showSnackbar('Asignación agregada exitosamente.', 'success');
  };

  const removeAssignment = (index) => {
    setAssignments(assignments.filter((_, i) => i !== index));
    showSnackbar('Asignación eliminada.', 'info');
  };

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

        { form.role === 'Product Manager' && (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
          }}
        >
          <FormControl fullWidth>
            <Autocomplete
              options={areas}
              getOptionLabel={(option) => option.name}
              value={areas.find((a) => a.id === form.area) || null}
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
                const areaName = areas.find((x) => x.id === a.area_id)?.name || 'Área';
                const familyName = families.find((x) => x.id === a.family_id)?.name || 'Familia';
                const subfamilyName = subfamilies.find((x) => x.id === a.subfamily_id)?.name || 'Subfamilia';

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
        </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button
          onClick={() => onSave(form, assignments)}
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
        open={snackbarOpen}
        autoHideDuration={5000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Dialog>
  );
}