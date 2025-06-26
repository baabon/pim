import React, { useState } from 'react';
import {
  Accordion, AccordionSummary, AccordionDetails, Typography, Box,
  Tabs, Tab, TextField, Autocomplete, Chip, Select, MenuItem,
  FormControl, InputLabel, FormLabel,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PublicIcon from '@mui/icons-material/Public';

import {
  FLAG_ICONS, CATEGORY_OPTIONS, AVAILABLE_PRODUCTS, COUNTRIES_ORDER, getCountryDisplayName,
} from '../../utils/constants.js';

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box>
          {children}
        </Box>
      )}
    </div>
  );
}

export default function ProductCountriesOptions({
  countrySettings,
  handleUpdateCountrySetting,
  getCurrentCountryData,
  status,
  userRole,
  userEmail,
  users
}) {
  const isReadOnly = (status === 'pending_approval' || status === 'published') ||
                     (userRole === 'default_user') ||
                     (userRole === 'product_manager' && !users.some(user => user.email === userEmail));

  const [activeCountryTab, setActiveCountryTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setActiveCountryTab(newValue);
  };

  const handleBooleanToggle = (countryCode, field, value) => () => {
    if (!isReadOnly) {
      handleUpdateCountrySetting(countryCode, field, value);
    }
  };

  const handleCategoryChange = (countryCode) => (event) => {
    if (!isReadOnly) {
      handleUpdateCountrySetting(countryCode, 'category', event.target.value);
    }
  };

  const handleRelatedProductsChange = (countryCode) => (event, newValue) => {
    if (!isReadOnly) {
      handleUpdateCountrySetting(countryCode, 'relatedProducts', newValue);
    }
  };

  const handleSubstituteProductsChange = (countryCode) => (event, newValue) => {
    if (!isReadOnly) {
      handleUpdateCountrySetting(countryCode, 'substituteProducts', newValue);
    }
  };

  return (
    <Accordion defaultExpanded={true} sx={{ borderRadius: '8px !important', boxShadow: 'none', border: '1px solid #eee' }}>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon sx={{ color: '#546a7b' }} />}
        aria-controls="panel-country-options-content"
        id="panel-country-options-header"
        sx={{
          bgcolor: '#fcfcfc', borderBottom: '1px solid #eee', minHeight: '60px',
          '&.Mui-expanded': { minHeight: '60px' }, '& .MuiAccordionSummary-content': { my: 1 },
          borderRadius: '8px 8px 0 0 !important',
          '&:hover': { backgroundColor: '#fcfcfc' },
          '& .MuiButtonBase-root': { outline: 'none !important', boxShadow: 'none !important' },
          '&.Mui-focused': { backgroundColor: '#fcfcfc', outline: 'none !important', boxShadow: 'none !important' },
          '&.Mui-focusVisible': { outline: 'none !important', boxShadow: 'none !important' },
          border: 'none',
        }}
      >
        <Typography
          variant="h6"
          sx={{
            fontWeight: 600, fontSize: '18px', color: '#555', display: 'flex', alignItems: 'center',
            '&::before': {
              content: '""', display: 'block', width: '12px', height: '3px',
              bgcolor: '#21E0B2', borderRadius: '2px', mr: 1,
            }
          }}
        >
          Datos Regionales
        </Typography>
      </AccordionSummary>
      <AccordionDetails sx={{ p: 0 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={activeCountryTab}
            onChange={handleTabChange}
            aria-label="country options tabs"
            variant="scrollable"
            scrollButtons="auto"
          >
            {COUNTRIES_ORDER.map((country, index) => (
              <Tab
                key={country}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', fontWeight: 600 }}>
                    {FLAG_ICONS[country] ? ( <Typography component="span" sx={{ mr: 1, fontSize: '20px' }}> {FLAG_ICONS[country]} </Typography> ) : ( <PublicIcon sx={{ mr: 1, color: '#555' }} /> )}
                    {getCountryDisplayName(country)}
                  </Box>
                }
              />
            ))}
          </Tabs>
        </Box>
        {COUNTRIES_ORDER.map((country, index) => (
          <TabPanel value={activeCountryTab} index={index} key={country}>
            {(() => {
                if (typeof getCurrentCountryData !== 'function') {
                    console.error('ProductCountriesOptions: getCurrentCountryData no es una función al renderizar formulario para', country, '. Valor:', getCurrentCountryData);
                    return <Typography color="error" sx={{p: 2}}>Error: No se pudo cargar la configuración de país para {getCountryDisplayName(country)}. Función de datos no disponible.</Typography>;
                }

                const data = getCurrentCountryData(country);

                if (!data || typeof data !== 'object') {
                    console.error('ProductCountriesOptions: Datos de país inválidos para', country, '. Valor:', data);
                    return <Typography color="error" sx={{p: 2}}>Error: Datos de configuración de país incompletos o inválidos para {getCountryDisplayName(country)}.</Typography>;
                }

                return (
                  <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box sx={{ display: 'flex', gap: { xs: 3, sm: 5 }, flexWrap: 'wrap', mb: 1 }}>
                      <FormControl component="fieldset" variant="outlined" sx={{ border: '1px solid #d0d7de', borderRadius: '8px', p: 2 }}>
                        <FormLabel component="legend" sx={{ color: '#546a7b', fontWeight: 600, mb: 1, fontSize: '0.8rem', marginBottom: 0 }}>Publicar</FormLabel>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                          <Typography
                            component="span"
                            onClick={handleBooleanToggle(country, 'published', true)}
                            sx={{
                              px: 2, py: 1, borderRadius: '6px', display: 'flex', alignItems: 'center',
                              cursor: isReadOnly ? 'not-allowed' : 'pointer',
                              transition: 'background-color 0.3s, color 0.3s, border-color 0.3s',
                              bgcolor: data.published ? '#21E0B2' : (isReadOnly ? '#f0f0f0' : 'transparent'),
                              color: data.published ? '#fff' : (isReadOnly ? '#888' : '#546a7b'),
                              border: `1px solid ${data.published ? '#21E0B2' : (isReadOnly ? '#d0d7de' : '#d0d7de')}`,
                              '&:hover': {
                                bgcolor: isReadOnly ? '#f0f0f0' : (data.published ? '#1cb08e' : '#f0f0f0'),
                                color: isReadOnly ? '#888' : (data.published ? '#fff' : '#333'),
                                borderColor: isReadOnly ? '#d0d7de' : (data.published ? '#1cb08e' : '#aebcd0'),
                              },
                              opacity: isReadOnly ? 0.7 : 1,
                              pointerEvents: isReadOnly ? 'none' : 'auto',
                            }}
                          > Sí </Typography>
                          <Typography
                            component="span"
                            onClick={handleBooleanToggle(country, 'published', false)}
                            sx={{
                              px: 2, py: 1, borderRadius: '6px', display: 'flex', alignItems: 'center',
                              cursor: isReadOnly ? 'not-allowed' : 'pointer',
                              transition: 'background-color 0.3s, color 0.3s, border-color 0.3s',
                              bgcolor: !data.published ? '#ff6b6b' : (isReadOnly ? '#f0f0f0' : 'transparent'),
                              color: !data.published ? '#fff' : (isReadOnly ? '#888' : '#546a7b'),
                              border: `1px solid ${!data.published ? '#ff6b6b' : (isReadOnly ? '#d0d7de' : '#d0d7de')}`,
                              '&:hover': {
                                bgcolor: isReadOnly ? '#f0f0f0' : (!data.published ? '#e65a5a' : '#f0f0f0'),
                                color: isReadOnly ? '#888' : (!data.published ? '#fff' : '#333'),
                                borderColor: isReadOnly ? '#d0d7de' : (!data.published ? '#e65a5a' : '#aebcd0'),
                              },
                              opacity: isReadOnly ? 0.7 : 1,
                              pointerEvents: isReadOnly ? 'none' : 'auto',
                            }}
                          > No </Typography>
                        </Box>
                      </FormControl>

                      <FormControl component="fieldset" variant="outlined" sx={{ border: '1px solid #d0d7de', borderRadius: '8px', p: 2 }}>
                        <FormLabel component="legend" sx={{ color: '#546a7b', fontWeight: 600, mb: 1, fontSize: '0.8rem', marginBottom: 0 }}>Vendible</FormLabel>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                          <Typography
                            component="span"
                            onClick={handleBooleanToggle(country, 'sellable', true)}
                            sx={{
                              px: 2, py: 1, borderRadius: '6px', display: 'flex', alignItems: 'center',
                              cursor: isReadOnly ? 'not-allowed' : 'pointer',
                              transition: 'background-color 0.3s, color 0.3s, border-color 0.3s',
                              bgcolor: data.sellable ? '#21E0B2' : (isReadOnly ? '#f0f0f0' : 'transparent'),
                              color: data.sellable ? '#fff' : (isReadOnly ? '#888' : '#546a7b'),
                              border: `1px solid ${data.sellable ? '#21E0B2' : (isReadOnly ? '#d0d7de' : '#d0d7de')}`,
                              '&:hover': {
                                bgcolor: isReadOnly ? '#f0f0f0' : (data.sellable ? '#1cb08e' : '#f0f0f0'),
                                color: isReadOnly ? '#888' : (data.sellable ? '#fff' : '#333'),
                                borderColor: isReadOnly ? '#d0d7de' : (data.sellable ? '#1cb08e' : '#aebcd0'),
                              },
                              opacity: isReadOnly ? 0.7 : 1,
                              pointerEvents: isReadOnly ? 'none' : 'auto',
                            }}
                          > Sí </Typography>
                          <Typography
                            component="span"
                            onClick={handleBooleanToggle(country, 'sellable', false)}
                            sx={{
                              px: 2, py: 1, borderRadius: '6px', display: 'flex', alignItems: 'center',
                              cursor: isReadOnly ? 'not-allowed' : 'pointer',
                              transition: 'background-color 0.3s, color 0.3s, border-color 0.3s',
                              bgcolor: !data.sellable ? '#ff6b6b' : (isReadOnly ? '#f0f0f0' : 'transparent'),
                              color: !data.sellable ? '#fff' : (isReadOnly ? '#888' : '#546a7b'),
                              border: `1px solid ${!data.sellable ? '#ff6b6b' : (isReadOnly ? '#d0d7de' : '#d0d7de')}`,
                              '&:hover': {
                                bgcolor: isReadOnly ? '#f0f0f0' : (!data.sellable ? '#e65a5a' : '#f0f0f0'),
                                color: isReadOnly ? '#888' : (!data.sellable ? '#fff' : '#333'),
                                borderColor: isReadOnly ? '#d0d7de' : (!data.sellable ? '#e65a5a' : '#aebcd0'),
                              },
                              opacity: isReadOnly ? 0.7 : 1,
                              pointerEvents: isReadOnly ? 'none' : 'auto',
                            }}
                          > No </Typography>
                        </Box>
                      </FormControl>
                    </Box>

                    <FormControl
                      fullWidth
                      variant="outlined"
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
                      disabled={isReadOnly}
                    >
                      <InputLabel id={`${country}-category-label`}>Categoría</InputLabel>
                      <Select
                        labelId={`${country}-category-label`}
                        id={`${country}-category-select`}
                        value={data.categoryCode}
                        label="Categoría"
                        onChange={handleCategoryChange(country)}
                        disabled={isReadOnly}
                      >
                        {CATEGORY_OPTIONS.map((option) => ( <MenuItem key={option.value} value={option.value}> {option.label} </MenuItem> ))}
                      </Select>
                    </FormControl>

                    <Autocomplete
                      multiple
                      id={`${country}-related-products`}
                      options={AVAILABLE_PRODUCTS}
                      getOptionLabel={(option) => option.name}
                      isOptionEqualToValue={(option, value) => option.id === value.id}
                      value={data.relatedProducts}
                      onChange={handleRelatedProductsChange(country)}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          variant="outlined"
                          label="Productos Relacionados"
                          placeholder="Seleccionar productos"
                          sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
                        />
                      )}
                      renderTags={(value, getTagProps) => value.map((option, index) => {
                        const { key, onDelete, ...chipProps } = getTagProps({ index });
                        return (
                          <Chip
                            key={option.id}
                            variant="outlined"
                            label={option.name}
                            {...chipProps}
                            onDelete={isReadOnly ? undefined : onDelete}
                            sx={{
                                opacity: isReadOnly ? 0.7 : 1,
                                cursor: isReadOnly ? 'not-allowed' : 'default'
                            }}
                          />
                        );
                      })}
                      disableCloseOnSelect
                      disabled={isReadOnly}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
                    />
                    <Autocomplete
                      multiple
                      id={`${country}-substitute-products`}
                      options={AVAILABLE_PRODUCTS}
                      getOptionLabel={(option) => option.name}
                      isOptionEqualToValue={(option, value) => option.id === value.id}
                      value={data.substituteProducts}
                      onChange={handleSubstituteProductsChange(country)}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          variant="outlined"
                          label="Productos Sustitutos"
                          placeholder="Seleccionar productos"
                          sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
                        />
                      )}
                      renderTags={(value, getTagProps) => value.map((option, index) => {
                        const { key, onDelete, ...chipProps } = getTagProps({ index });
                        return (
                          <Chip
                            key={option.id}
                            variant="outlined"
                            label={option.name}
                            {...chipProps}
                            onDelete={isReadOnly ? undefined : onDelete}
                            sx={{
                                opacity: isReadOnly ? 0.7 : 1,
                                cursor: isReadOnly ? 'not-allowed' : 'default'
                            }}
                          />
                        );
                      })}
                      disableCloseOnSelect
                      disabled={isReadOnly}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
                    />
                  </Box>
                );
            })()}
          </TabPanel>
        ))}
      </AccordionDetails>
    </Accordion>
  );
}