// hooks/useCRUD.js
import { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import useAuth from './useAuth';

export function useEntityCRUD(config) {
  const [formData, setFormData] = useState(config.initialData);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  
  // Usar tu hook de autenticación
  const { user, logout } = useAuth();

  // Función para obtener headers de autenticación
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json'
      }
    };
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    
    // Validaciones en tiempo real MUY PERMISIVAS
    if (config.liveValidations && config.liveValidations[name]) {
      if (!config.liveValidations[name](value)) {
        return;
      }
    }
    
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
     console.log('🔍 Hook CRUD - Validando:', formData);
  
  // SOLO validar campos obligatorios (muy permisivo)
  if (config.fields) {
    config.fields.forEach(field => {
      if (field.required && (!formData[field.name] || formData[field.name].toString().trim() === '')) {
        newErrors[field.name] = `${field.label} es obligatorio`;
      }
    });
  }
  
  console.log('🚨 Hook CRUD - Errores:', newErrors);
  
  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
  };

  const resetForm = () => {
    setFormData(config.initialData);
    setErrors({});
  };

  const saveEntity = async () => {
    if (!validateForm()) {
      toast.error('Por favor corrige los errores del formulario');
      return false;
    }

    if (!user) {
      toast.error('Debes estar autenticado para realizar esta acción');
      logout();
      return false;
    }

    setLoading(true);
    
    try {
      let dataToSend = { ...formData };
      const authHeaders = getAuthHeaders();
      
      console.log(`🚀 Guardando ${config.entityName}:`, dataToSend);
      console.log('Headers:', authHeaders);
      
      if (formData.id) {
        // Actualizar entidad existente
        const endpoint = config.endpoints.update.includes('${formData.id}') 
          ? config.endpoints.update.replace('${formData.id}', formData.id)
          : `${config.endpoints.update}/${formData.id}`;
          
        await axios.put(endpoint, dataToSend, authHeaders);
        toast.success(config.messages.updateSuccess);
      } else {
        // Crear nueva entidad
        await axios.post(config.endpoints.create, dataToSend, authHeaders);
        toast.success(config.messages.createSuccess);
      }
      
      resetForm();
      return true;
    } catch (error) {
      console.error(`❌ Error al guardar ${config.entityName}:`, error);
      
      let errorMessage = config.messages.saveError;
      
      if (error.response) {
        switch (error.response.status) {
          case 401:
            errorMessage = 'Acceso denegado. Tu sesión ha expirado.';
            logout();
            break;
          case 403:
            errorMessage = 'No tienes permisos para realizar esta acción.';
            break;
          case 422:
            errorMessage = error.response.data?.message || 'Datos inválidos. Verifica la información.';
            break;
          case 500:
            errorMessage = 'Error interno del servidor. Intenta nuevamente.';
            break;
          default:
            errorMessage = error.response.data?.message || config.messages.saveError;
        }
      }
      
      toast.error(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    formData,
    setFormData,
    loading,
    errors,
    user,
    handleInputChange,
    resetForm,
    saveEntity,
    validateForm
  };
}

export function useEntitySearch(config) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const { user, logout } = useAuth();

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json'
      }
    };
  };

  const handleSearch = async () => {
    if (searchQuery.length < 2) {
      toast.error('Ingrese al menos 2 caracteres para buscar');
      return;
    }

    if (!user) {
      toast.error('Debes estar autenticado para realizar búsquedas');
      logout();
      return;
    }

    setLoading(true);
    try {
      const authHeaders = getAuthHeaders();
      const response = await axios.get(
        `${config.searchEndpoint}?search=${encodeURIComponent(searchQuery)}`, 
        authHeaders
      );
      setSearchResults(response.data.data || response.data);
      setModalIsOpen(true);
    } catch (error) {
      console.error(`Error al buscar ${config.entityName}:`, error);
      
      let errorMessage = `Error al buscar ${config.entityName}`;
      if (error.response?.status === 401) {
        errorMessage = 'Sesión expirada. Inicia sesión nuevamente.';
        logout();
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleResultClick = (item, onSelect) => {
    onSelect(item);
    setSearchQuery('');
    setModalIsOpen(false);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setModalIsOpen(false);
  };

  return {
    searchQuery,
    setSearchQuery,
    searchResults,
    modalIsOpen,
    setModalIsOpen,
    loading,
    user,
    handleSearch,
    handleResultClick,
    clearSearch
  };
}

export function useFormMode() {
  const [selectedOption, setSelectedOption] = useState(null);

  const setMode = (mode) => {
    setSelectedOption(mode);
  };

  const clearMode = () => {
    setSelectedOption(null);
  };

  return {
    selectedOption,
    setMode,
    clearMode,
    isNewMode: selectedOption === 'new',
    isEditMode: selectedOption === 'edit'
  };
}