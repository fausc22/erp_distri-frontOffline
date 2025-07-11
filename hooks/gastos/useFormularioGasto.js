// hooks/gastos/useFormularioGasto.js - VERSIÓN ACTUALIZADA
import { useGasto } from '../../context/GastosContext';

export const useFormularioGasto = () => {
  const {
    formData,
    handleInputChange,
    isValidForm,
    hasUnsavedData,
    getMontoNumerico,
    prepararDatosParaBackend
  } = useGasto();

  // Opciones predefinidas para el formulario
  const opcionesDescripcion = [
    'Combustible',
    'Mantenimiento de vehículos',
    'Servicios públicos (luz, gas, agua)',
    'Internet y telefonía',
    'Material de oficina',
    'Limpieza y mantenimiento',
    'Seguros',
    'Impuestos y tasas',
    'Publicidad y marketing',
    'Capacitación y cursos',
    'Herramientas y equipos',
    'Reparaciones menores',
    'Viáticos y comidas',
    'Alquiler de equipos',
    'Honorarios profesionales',
    'Gastos bancarios',
    'Otros gastos operativos'
  ];

  const opcionesFormaPago = [
    'Efectivo',
    'Transferencia',
    'Cheque',
    'Tarjeta de débito',
    'Tarjeta de crédito'
  ];

  // Validaciones específicas (usando las funciones del contexto)
  const esFormularioValido = () => {
    return isValidForm();
  };

  const hayDatosNoGuardados = () => {
    return hasUnsavedData();
  };

  // Validar campo específico
  const validarCampo = (campo) => {
    const valor = formData[campo];
    
    switch (campo) {
      case 'descripcion':
        return valor && (valor || '').trim() !== '';
      
      case 'monto':
        const monto = getMontoNumerico();
        return monto > 0 && monto <= 99999999.99; // Máximo 8 dígitos + 2 decimales
      
      case 'formaPago':
        return valor && (valor || '').trim() !== '';
      
      default:
        return true;
    }
  };

  // Obtener mensaje de error para un campo
  const obtenerMensajeError = (campo) => {
    if (validarCampo(campo)) return '';
    
    const valor = formData[campo];
    
    switch (campo) {
      case 'descripcion':
        return 'La descripción es obligatoria';
      
      case 'monto':
        if (!valor) {
          return 'El monto es obligatorio';
        }
        const monto = getMontoNumerico();
        if (monto <= 0) {
          return 'El monto debe ser mayor a 0';
        }
        if (monto > 99999999.99) {
          return 'El monto no puede exceder $99.999.999,99';
        }
        return '';
      
      case 'formaPago':
        return 'Debe seleccionar una forma de pago';
      
      default:
        return '';
    }
  };

  // Obtener resumen del gasto para confirmación
  const obtenerResumen = () => {
    const montoNumerico = getMontoNumerico();
    
    return {
      descripcion: formData.descripcion,
      monto: montoNumerico,
      montoFormateado: new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(montoNumerico),
      formaPago: formData.formaPago,
      observaciones: formData.observaciones
    };
  };

  // Validar rangos específicos
  const validarRangoMonto = () => {
    const monto = getMontoNumerico();
    
    if (monto <= 0) {
      return { valido: false, mensaje: 'El monto debe ser mayor a cero' };
    }
    
    if (monto > 99999999.99) {
      return { valido: false, mensaje: 'El monto no puede exceder $99.999.999,99' };
    }
    
    return { valido: true, mensaje: '' };
  };

  // Formatear monto para mostrar en la interfaz
  const formatearMontoParaVisualizacion = (valor) => {
    if (!valor) return '';
    
    const numerico = getMontoNumerico();
    return new Intl.NumberFormat('es-AR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(numerico);
  };

  return {
    // Datos del formulario
    formData,
    
    // Opciones
    opcionesDescripcion,
    opcionesFormaPago,
    
    // Funciones de manejo
    handleInputChange,
    
    // Validaciones
    esFormularioValido,
    hayDatosNoGuardados,
    validarCampo,
    obtenerMensajeError,
    validarRangoMonto,
    
    // Utilidades
    prepararDatosParaBackend,
    obtenerResumen,
    getMontoNumerico,
    formatearMontoParaVisualizacion
  };
};