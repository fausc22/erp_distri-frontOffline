// hooks/gastos/useRegistrarGasto.js
import { useState } from 'react';
import { axiosAuth } from '../../utils/apiClient';
import { toast } from 'react-hot-toast';

export const useRegistrarGasto = () => {
  const [loading, setLoading] = useState(false);

  const registrarGasto = async (formData, archivo = null) => {
    setLoading(true);
    
    try {
      // Validación adicional antes de procesar
      if (!formData || typeof formData !== 'object') {
        toast.error('Datos del formulario inválidos');
        return false;
      }

      // Preparar datos del gasto para el backend
      const gastoData = {
        descripcion: (formData.descripcion || '').trim(),
        monto: obtenerMontoNumerico(formData.monto),
        forma_pago: (formData.formaPago || '').trim(),
        observaciones: formData.observaciones ? (formData.observaciones || '').trim() : null
      };

      // Validar que los campos requeridos no estén vacíos
      if (!gastoData.descripcion || !gastoData.forma_pago || gastoData.monto <= 0) {
        toast.error('Por favor complete todos los campos obligatorios correctamente');
        return false;
      }

      console.log('📝 Registrando gasto:', gastoData);

      // 1. REGISTRAR EL GASTO
      const response = await axiosAuth.post('/compras/nuevo-gasto', gastoData);
      
      console.log('✅ Respuesta del servidor:', response.data);
      
      if (!response.data.success) {
        toast.error(response.data.message || 'Error al registrar el gasto');
        return false;
      }

      const gastoId = response.data.data?.id;
      console.log('ID: ' + gastoId);
      
      if (!gastoId) {
        console.error('❌ No se recibió ID del gasto creado');
        toast.error('Error: No se pudo obtener el ID del gasto creado');
        return false;
      }

      console.log('✅ Gasto creado con ID:', gastoId);
      
      // 2. SUBIR COMPROBANTE SI EXISTE
      if (archivo) {
        console.log('📁 Subiendo comprobante para gasto ID:', gastoId);
        console.log('📋 Archivo a subir:', {
          name: archivo.name,
          size: archivo.size,
          type: archivo.type
        });
        
        try {
          const comprobanteSubido = await subirComprobanteDirecto(gastoId, archivo);
          
          if (comprobanteSubido) {
            toast.success('Gasto registrado exitosamente con comprobante');
          } else {
            toast.success('Gasto registrado exitosamente, pero hubo un error al subir el comprobante');
          }
        } catch (comprobanteError) {
          console.error('❌ Error subiendo comprobante:', comprobanteError);
          toast.success('Gasto registrado exitosamente, pero hubo un error al subir el comprobante');
        }
      } else {
        console.log('ℹ️ No hay comprobante para subir');
        toast.success('Gasto registrado exitosamente');
      }
      
      return true;
      
    } catch (error) {
      console.error('💥 Error al registrar gasto:', error);
      
      if (error.response?.status === 401) {
        toast.error('Sesión expirada. Por favor, inicia sesión nuevamente');
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else if (error.response?.status === 500) {
        toast.error('Error interno del servidor');
      } else {
        toast.error('Error al registrar el gasto. Verifique su conexión');
      }
      
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Función para subir comprobante directamente
  const subirComprobanteDirecto = async (gastoId, archivo) => {
    try {
      // Validar archivo
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (archivo.size > maxSize) {
        throw new Error('El archivo es demasiado grande. Máximo 10MB permitido.');
      }
      
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(archivo.type)) {
        throw new Error('Tipo de archivo no válido. Solo se permiten: JPG, PNG, PDF, DOC, DOCX');
      }

      // Crear FormData
      const formData = new FormData();
      formData.append("comprobante", archivo);

      console.log('📤 Enviando comprobante al servidor...');
      
      // Subir comprobante usando el endpoint correcto
      const response = await axiosAuth.post(`/comprobantes/subir/gasto/${gastoId}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        timeout: 30000 // 30 segundos timeout
      });

      console.log('📥 Respuesta de subida de comprobante:', response.data);

      if (response.data.success) {
        console.log('✅ Comprobante subido exitosamente');
        return true;
      } else {
        console.error('❌ Error en respuesta:', response.data.message);
        return false;
      }
      
    } catch (error) {
      console.error('💥 Error en subirComprobanteDirecto:', error);
      
      if (error.response?.data?.message) {
        console.error('📋 Mensaje del servidor:', error.response.data.message);
      }
      
      throw error;
    }
  };

  // Función helper para obtener monto numérico
  const obtenerMontoNumerico = (montoFormateado) => {
    if (!montoFormateado) return 0;
    
    // Remover separadores de miles (puntos) y convertir coma decimal a punto
    let cleanValue = montoFormateado.toString();
    
    // Si tiene formato argentino (puntos como separadores de miles y coma como decimal)
    if (cleanValue.includes(',')) {
      // Remover puntos (separadores de miles) y cambiar coma por punto
      cleanValue = cleanValue.replace(/\./g, '').replace(',', '.');
    } else {
      // Si solo tiene puntos, verificar si es separador de miles o decimal
      const parts = cleanValue.split('.');
      if (parts.length === 2 && parts[1].length <= 2) {
        // Es decimal (ej: 1234.50)
        // No hacer nada, ya está bien
      } else if (parts.length > 2 || (parts.length === 2 && parts[1].length > 2)) {
        // Son separadores de miles (ej: 1.234.567)
        cleanValue = cleanValue.replace(/\./g, '');
      }
    }
    
    const numericValue = parseFloat(cleanValue);
    return isNaN(numericValue) ? 0 : numericValue;
  };

  return {
    registrarGasto,
    loading,
    subirComprobanteDirecto,
    obtenerMontoNumerico
  };
};