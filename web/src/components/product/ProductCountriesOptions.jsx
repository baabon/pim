import React, { useState, useCallback } from 'react';
import {
  Accordion, AccordionSummary, AccordionDetails, Typography, Box,
  Tabs, Tab, TextField, Autocomplete, Chip, Select, MenuItem,
  FormControl, InputLabel, FormLabel, Link, Tooltip
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PublicIcon from '@mui/icons-material/Public';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

import {
  FLAG_ICONS, CATEGORY_OPTIONS, AVAILABLE_PRODUCTS, COUNTRIES_ORDER, WEBSITE_BASE_URL, getCountryDisplayName,
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
  countrySettings: editableCountrySettings,
  savedCountrySettings,
  handleUpdateCountrySetting,
  url,
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

  const parseProductList = useCallback((str) => str ? str.split(',').map(s => s.trim()).filter(Boolean).map(sku => AVAILABLE_PRODUCTS.find(p => p.sku === sku)).filter(Boolean) : [], []);

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
                const currentEditableData = editableCountrySettings.find(cs => cs.country_code === country) || {};
                const currentSavedData = savedCountrySettings.find(cs => cs.country_code === country) || {};

                const productUrl = currentSavedData.enabled && url
                    ? `${WEBSITE_BASE_URL}${country.toLowerCase()}/${url}`
                    : '';

                const formData = {
                    published: currentEditableData.enabled ?? false,
                    sellable: currentEditableData.sellable ?? false,
                    categoryCode: currentEditableData.category_code ?? '',
                    relatedProducts: parseProductList(currentEditableData.related),
                    substituteProducts: parseProductList(currentEditableData.substitute),
                };

                return (
                  <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {productUrl && (
                        <Box sx={{
                            mb: 2,
                            display: 'flex',
                            alignItems: 'center',
                            bgcolor: '#eaf4ff',
                            p: 1.5,
                            borderRadius: '8px',
                            border: '1px solid #cce0ff'
                        }}>
                            <Typography variant="body2" sx={{ color: '#3f51b5', mr: 1 }}>
                                URL del producto para {getCountryDisplayName(country)}:
                            </Typography>
                            <Tooltip title="Abrir en una nueva pestaña">
                                <Link
                                    href={productUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        color: '#3f51b5',
                                        textDecoration: 'underline',
                                        fontSize: '0.9rem',
                                        wordBreak: 'break-all',
                                        '&:hover': {
                                            color: '#2c3e91',
                                            textDecoration: 'underline'
                                        }
                                    }}
                                >
                                    Abrir
                                    <OpenInNewIcon sx={{ ml: 0.5, fontSize: '1rem' }} />
                                </Link>
                            </Tooltip>
                        </Box>
                    )}

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
                              bgcolor: formData.published ? '#21E0B2' : (isReadOnly ? '#f0f0f0' : 'transparent'),
                              color: formData.published ? '#fff' : (isReadOnly ? '#888' : '#546a7b'),
                              border: `1px solid ${formData.published ? '#21E0B2' : (isReadOnly ? '#d0d7de' : '#d0d7de')}`,
                              '&:hover': {
                                bgcolor: isReadOnly ? '#f0f0f0' : (formData.published ? '#1cb08e' : '#f0f0f0'),
                                color: isReadOnly ? '#888' : (formData.published ? '#fff' : '#333'),
                                borderColor: isReadOnly ? '#d0d7de' : (formData.published ? '#1cb08e' : '#aebcd0'),
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
                              bgcolor: !formData.published ? '#ff6b6b' : (isReadOnly ? '#f0f0f0' : 'transparent'),
                              color: !formData.published ? '#fff' : (isReadOnly ? '#888' : '#546a7b'),
                              border: `1px solid ${!formData.published ? '#ff6b6b' : (isReadOnly ? '#d0d7de' : '#d0d7de')}`,
                              '&:hover': {
                                bgcolor: isReadOnly ? '#f0f0f0' : (!formData.published ? '#e65a5a' : '#f0f0f0'),
                                color: isReadOnly ? '#888' : (!formData.published ? '#fff' : '#333'),
                                borderColor: isReadOnly ? '#d0d7de' : (!formData.published ? '#e65a5a' : '#aebcd0'),
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
                              bgcolor: formData.sellable ? '#21E0B2' : (isReadOnly ? '#f0f0f0' : 'transparent'),
                              color: formData.sellable ? '#fff' : (isReadOnly ? '#888' : '#546a7b'),
                              border: `1px solid ${formData.sellable ? '#21E0B2' : (isReadOnly ? '#d0d7de' : '#d0d7de')}`,
                              '&:hover': {
                                bgcolor: isReadOnly ? '#f0f0f0' : (formData.sellable ? '#1cb08e' : '#f0f0f0'),
                                color: isReadOnly ? '#888' : (formData.sellable ? '#fff' : '#333'),
                                borderColor: isReadOnly ? '#d0d7de' : (formData.sellable ? '#1cb08e' : '#aebcd0'),
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
                              bgcolor: !formData.sellable ? '#ff6b6b' : (isReadOnly ? '#f0f0f0' : 'transparent'),
                              color: !formData.sellable ? '#fff' : (isReadOnly ? '#888' : '#546a7b'),
                              border: `1px solid ${!formData.sellable ? '#ff6b6b' : (isReadOnly ? '#d0d7de' : '#d0d7de')}`,
                              '&:hover': {
                                bgcolor: isReadOnly ? '#f0f0f0' : (!formData.sellable ? '#e65a5a' : '#f0f0f0'),
                                color: isReadOnly ? '#888' : (!formData.sellable ? '#fff' : '#333'),
                                borderColor: isReadOnly ? '#d0d7de' : (!formData.sellable ? '#e65a5a' : '#aebcd0'),
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
                        value={formData.categoryCode}
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
                      value={formData.relatedProducts}
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
                      value={formData.substituteProducts}
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