// context/GastosContext.jsx - VERSIÓN ACTUALIZADA
import { createContext, useContext, useReducer } from 'react';

// Estado inicial
const initialState = {
  descripcion: '',
  monto: '',
  formaPago: '',
  observaciones: '',
  // Estados para archivos
  archivo: null,
  archivoPreview: null
};

// Tipos de acciones
const actionTypes = {
  SET_FIELD: 'SET_FIELD',
  RESET_FORM: 'RESET_FORM',
  SET_FORM_DATA: 'SET_FORM_DATA',
  SET_ARCHIVO: 'SET_ARCHIVO',
  SET_ARCHIVO_PREVIEW: 'SET_ARCHIVO_PREVIEW',
  LIMPIAR_ARCHIVO: 'LIMPIAR_ARCHIVO'
};

// Reducer
const gastosReducer = (state, action) => {
  switch (action.type) {
    case actionTypes.SET_FIELD:
      return {
        ...state,
        [action.field]: action.value
      };
    
    case actionTypes.RESET_FORM:
      return { ...initialState };
    
    case actionTypes.SET_FORM_DATA:
      return {
        ...state,
        ...action.data
      };

    case actionTypes.SET_ARCHIVO:
      return {
        ...state,
        archivo: action.archivo
      };

    case actionTypes.SET_ARCHIVO_PREVIEW:
      return {
        ...state,
        archivoPreview: action.preview
      };

    case actionTypes.LIMPIAR_ARCHIVO:
      return {
        ...state,
        archivo: null,
        archivoPreview: null
      };
    
    default:
      return state;
  }
};

// Contexto
const GastoContext = createContext();

// Provider
export const GastoProvider = ({ children }) => {
  const [formData, dispatch] = useReducer(gastosReducer, initialState);

  // Funciones del contexto existentes
  const setField = (field, value) => {
    dispatch({
      type: actionTypes.SET_FIELD,
      field,
      value
    });
  };

  const resetForm = () => {
    console.log('🗑️ Limpiando formulario completo (datos + archivo)');
    dispatch({
      type: actionTypes.RESET_FORM
    });
  };

  const setFormData = (data) => {
    dispatch({
      type: actionTypes.SET_FORM_DATA,
      data
    });
  };

  // NUEVAS FUNCIONES PARA MANEJO DE ARCHIVOS
  const setArchivo = (archivo) => {
    console.log('📁 Guardando archivo en contexto:', archivo ? archivo.name : 'null');
    dispatch({
      type: actionTypes.SET_ARCHIVO,
      archivo
    });
  };

  const setArchivoPreview = (preview) => {
    dispatch({
      type: actionTypes.SET_ARCHIVO_PREVIEW,
      preview
    });
  };

  const limpiarArchivo = () => {
    console.log('🗑️ Limpiando archivo del contexto');
    dispatch({
      type: actionTypes.LIMPIAR_ARCHIVO
    });
  };

  // Validar archivo
  const validarArchivo = (file) => {
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return { valido: false, mensaje: 'El archivo es demasiado grande. Máximo 10MB permitido.' };
    }
    
    const allowedTypes = [
      'image/jpeg', 
      'image/jpg', 
      'image/png', 
      'application/pdf', 
      'application/msword', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    if (!allowedTypes.includes(file.type)) {
      return { valido: false, mensaje: 'Tipo de archivo no válido. Solo se permiten: JPG, PNG, PDF, DOC, DOCX' };
    }
    
    return { valido: true, mensaje: '' };
  };

  // Manejar cambio de archivo
  const handleArchivoChange = (e) => {
    const file = e.target.files?.[0];
    
    if (!file) {
      limpiarArchivo();
      return;
    }
    
    console.log('📁 Archivo seleccionado:', {
      name: file.name,
      size: file.size,
      type: file.type
    });
    
    const validacion = validarArchivo(file);
    
    if (!validacion.valido) {
      console.error('❌ Archivo no válido:', validacion.mensaje);
      alert(validacion.mensaje);
      limpiarArchivo();
      return;
    }
    
    setArchivo(file);
    
    // Generar preview si es una imagen
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setArchivoPreview(e.target.result);
        console.log('🖼️ Preview generado para imagen');
      };
      reader.readAsDataURL(file);
    } else {
      setArchivoPreview(null);
      console.log('📄 Archivo no es imagen, sin preview');
    }
  };

  // Obtener archivo (para usar en registro)
  const obtenerArchivo = () => {
    console.log('📋 Obteniendo archivo del contexto:', formData.archivo ? formData.archivo.name : 'sin archivo');
    return formData.archivo;
  };

  // Verificar si hay archivo
  const hayArchivo = () => {
    return !!formData.archivo;
  };

  // Obtener información del archivo
  const getArchivoInfo = () => {
    if (!formData.archivo) return null;
    
    return {
      nombre: formData.archivo.name,
      tamaño: (formData.archivo.size / (1024 * 1024)).toFixed(2) + ' MB',
      tipo: formData.archivo.type,
      preview: formData.archivoPreview
    };
  };

  // Funciones de utilidad para monto (sin cambios)
  const formatMonto = (value) => {
    if (!value) return '';
    
    let numericString = value.toString().replace(/[^\d]/g, '');
    
    if (!numericString) return '';
    
    if (numericString.length > 10) {
      numericString = numericString.substring(0, 10);
    }
    
    let numero = parseInt(numericString, 10);
    
    if (numero > 9999999999) {
      numero = 9999999999;
      numericString = numero.toString();
    }
    
    let formattedValue;
    if (numericString.length > 2) {
      const enteros = numericString.slice(0, -2);
      const decimales = numericString.slice(-2);
      
      const enterosFormateados = parseInt(enteros, 10).toLocaleString('es-AR');
      formattedValue = `${enterosFormateados},${decimales}`;
    } else if (numericString.length === 2) {
      formattedValue = `0,${numericString}`;
    } else if (numericString.length === 1) {
      formattedValue = `0,0${numericString}`;
    } else {
      formattedValue = '';
    }
    
    return formattedValue;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    console.log(`Campo ${name} cambiado a:`, value);
    
    if (name === 'monto') {
      if (value === '') {
        setField(name, '');
      } else {
        const formattedValue = formatMonto(value);
        setField(name, formattedValue);
      }
    } else {
      setField(name, value);
    }
  };

  // Validaciones (sin cambios)
  const isValidForm = () => {
    const requiredFields = ['descripcion', 'monto', 'formaPago'];
    return requiredFields.every(field => {
      const value = formData[field];
      if (field === 'monto') {
        return value && getMontoNumerico() > 0;
      }
      return value && (value || '').toString().trim() !== '';
    });
  };

  const hasUnsavedData = () => {
    // Incluir archivo en la verificación de datos no guardados
    const hasFormData = Object.keys(initialState).some(key => {
      if (key === 'archivo' || key === 'archivoPreview') return false; // Los manejamos por separado
      const value = formData[key];
      return value && (value || '').toString().trim() !== '';
    });
    
    const hasArchivo = hayArchivo();
    
    return hasFormData || hasArchivo;
  };

  // Obtener monto como número (sin cambios)
  const getMontoNumerico = () => {
    if (!formData.monto) return 0;
    
    const cleanValue = formData.monto
      .replace(/\./g, '')
      .replace(',', '.');
    
    const numericValue = parseFloat(cleanValue);
    return isNaN(numericValue) ? 0 : numericValue;
  };

  // Preparar datos para envío al backend
  const prepararDatosParaBackend = () => {
    return {
      descripcion: (formData.descripcion || '').trim(),
      monto: getMontoNumerico(),
      forma_pago: (formData.formaPago || '').trim(),
      observaciones: formData.observaciones ? (formData.observaciones || '').trim() : null
    };
  };

  const setMontoDesdeNumero = (numero) => {
    if (typeof numero === 'number' && numero >= 0) {
      const centavos = Math.round(numero * 100);
      const formattedValue = formatMonto(centavos.toString());
      setField('monto', formattedValue);
    }
  };

  const value = {
    // Estado
    formData,
    
    // Funciones de manipulación de formulario
    setField,
    resetForm,
    setFormData,
    handleInputChange,
    setMontoDesdeNumero,
    
    // Funciones de archivos
    handleArchivoChange,
    obtenerArchivo,
    hayArchivo,
    limpiarArchivo,
    getArchivoInfo,
    validarArchivo,
    
    // Utilidades
    formatMonto,
    isValidForm,
    hasUnsavedData,
    getMontoNumerico,
    prepararDatosParaBackend
  };

  return (
    <GastoContext.Provider value={value}>
      {children}
    </GastoContext.Provider>
  );
};

// Hook para usar el contexto
export const useGasto = () => {
  const context = useContext(GastoContext);
  
  if (!context) {
    throw new Error('useGasto debe ser usado dentro de un GastoProvider');
  }
  
  return context;
};