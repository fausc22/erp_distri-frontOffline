// hooks/useEmpleados.js
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import useAuth from './useAuth';

import { axiosAuth, fetchAuth } from '../utils/apiClient';

export const useEmpleados = () => {
  const [loading, setLoading] = useState(false);
  
  // Usar tu hook de autenticación
  const { user, logout, isManager } = useAuth();

  // Obtener token para las requests
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json'
      }
    };
  };

  // Verificar permisos antes de cualquier operación
  const checkPermissions = (action = 'gestionar empleados') => {
    if (!user) {
      toast.error('Debes estar autenticado para realizar esta acción');
      logout();
      return false;
    }

    if (!isManager()) {
      toast.error('Solo los gerentes pueden gestionar empleados');
      console.log('🔍 Debug permisos:');
      console.log('Usuario actual:', user);
      console.log('Rol del usuario:', user.rol);
      console.log('Es gerente:', isManager());
      return false;
    }

    return true;
  };

  // Crear empleado
  const crearEmpleado = async (empleadoData) => {
    // Verificar permisos antes de crear
    if (!checkPermissions('crear empleados')) {
      return { success: false, error: 'Sin permisos suficientes' };
    }

    setLoading(true);
    try {
      console.log('🚀 Creando empleado...');
      console.log('Datos:', empleadoData);
      console.log('Usuario logueado:', user);
      console.log('Endpoint:', `/empleados/crear-empleado`);
      
      const headers = getAuthHeaders();
      console.log('Headers:', headers);

      const response = await axiosAuth.post(
        `/empleados/crear-empleado`,
        empleadoData,
        headers
      );

      console.log('✅ Empleado creado exitosamente:', response.data);
      toast.success('Empleado creado exitosamente');
      return { success: true, data: response.data };

    } catch (error) {
      console.error('❌ Error al crear empleado:', error);
      console.log('Error response:', error.response);
      console.log('Error status:', error.response?.status);
      console.log('Error data:', error.response?.data);
      
      let message = 'Error al crear empleado';
      
      if (error.response) {
        switch (error.response.status) {
          case 401:
            message = 'Sesión expirada. Inicia sesión nuevamente.';
            console.log('🔑 Error 401 - Token inválido o expirado');
            logout();
            break;
          case 403:
            message = 'No tienes permisos para crear empleados. Verifica tu rol de gerente.';
            console.log('🚫 Error 403 - Sin permisos');
            console.log('Rol actual:', user?.rol);
            console.log('Token actual:', localStorage.getItem('token')?.substring(0, 20) + '...');
            break;
          case 422:
            message = error.response.data?.message || 'Datos inválidos. Verifica la información.';
            console.log('📝 Error 422 - Datos inválidos:', error.response.data);
            break;
          case 500:
            message = 'Error interno del servidor. Intenta nuevamente.';
            console.log('🔥 Error 500 - Error del servidor');
            break;
          default:
            message = error.response.data?.message || 'Error al crear empleado';
            console.log(`⚠️ Error ${error.response.status}:`, error.response.data);
        }
      } else {
        console.log('🌐 Error de red:', error.message);
        message = 'Error de conexión. Verifica tu red.';
      }
      
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  // Actualizar empleado
  const actualizarEmpleado = async (empleadoData) => {
    if (!checkPermissions('actualizar empleados')) {
      return { success: false, error: 'Sin permisos suficientes' };
    }

    setLoading(true);
    try {
      // Si la contraseña está vacía en modo edición, no la enviarla
      const dataToSend = { ...empleadoData };
      if (!dataToSend.password || dataToSend.password.trim() === '') {
        delete dataToSend.password;
      }

      console.log('🔄 Actualizando empleado:', dataToSend);

      const response = await axiosAuth.put(
        `/empleados/actualizar-empleado`,
        dataToSend,
        getAuthHeaders()
      );

      console.log('✅ Empleado actualizado exitosamente');
      toast.success('Empleado actualizado exitosamente');
      return { success: true, data: response.data };

    } catch (error) {
      console.error('❌ Error al actualizar empleado:', error);
      
      let message = 'Error al actualizar empleado';
      
      if (error.response) {
        switch (error.response.status) {
          case 401:
            message = 'Sesión expirada. Inicia sesión nuevamente.';
            logout();
            break;
          case 403:
            message = 'No tienes permisos para actualizar empleados.';
            break;
          default:
            message = error.response.data?.message || 'Error al actualizar empleado';
        }
      }
      
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  // Buscar empleados
  const buscarEmpleados = async (query) => {
    if (!query || query.trim().length < 1) {
      return [];
    }

    if (!checkPermissions('buscar empleados')) {
      return [];
    }

    setLoading(true);
    try {
      console.log('🔍 Buscando empleados:', query);
      
      const response = await axiosAuth.get(
        `/empleados/buscar-empleado?q=${encodeURIComponent(query)}`,
        getAuthHeaders()
      );

      console.log('✅ Empleados encontrados:', response.data);
      return response.data;

    } catch (error) {
      console.error('❌ Error al buscar empleados:', error);
      
      let message = 'Error al buscar empleados';
      if (error.response?.status === 401) {
        message = 'Sesión expirada. Inicia sesión nuevamente.';
        logout();
      } else if (error.response?.data?.message) {
        message = error.response.data.message;
      }
      
      toast.error(message);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Listar todos los empleados
  const listarEmpleados = async () => {
    if (!checkPermissions('listar empleados')) {
      return { success: false, error: 'Sin permisos suficientes' };
    }

    setLoading(true);
    try {
      const response = await axiosAuth.get(
        `/empleados/listar`,
        getAuthHeaders()
      );

      return { success: true, data: response.data };

    } catch (error) {
      const message = error.response?.data?.message || 'Error al listar empleados';
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  // Obtener empleado por ID
  const obtenerEmpleado = async (id) => {
    if (!checkPermissions('obtener empleado')) {
      return { success: false, error: 'Sin permisos suficientes' };
    }

    setLoading(true);
    try {
      const response = await axiosAuth.get(
        `/empleados/${id}`,
        getAuthHeaders()
      );

      return { success: true, data: response.data };

    } catch (error) {
      const message = error.response?.data?.message || 'Error al obtener empleado';
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  // Desactivar empleado
  const desactivarEmpleado = async (id) => {
    if (!checkPermissions('desactivar empleados')) {
      return { success: false, error: 'Sin permisos suficientes' };
    }

    setLoading(true);
    try {
      const response = await axiosAuth.delete(
        `/empleados/${id}`,
        getAuthHeaders()
      );

      toast.success('Empleado desactivado exitosamente');
      return { success: true, data: response.data };

    } catch (error) {
      const message = error.response?.data?.message || 'Error al desactivar empleado';
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  // Validaciones específicas para empleados
  const validarDatosEmpleado = (datos, esEdicion = false) => {
    const errores = [];

    // Validaciones básicas obligatorias
    if (!datos.nombre?.trim()) errores.push('El nombre es obligatorio');
    if (!datos.apellido?.trim()) errores.push('El apellido es obligatorio');
    if (!datos.usuario?.trim()) errores.push('El usuario es obligatorio');
    if (!datos.rol) errores.push('El rol es obligatorio');

    // En creación, la contraseña es obligatoria
    if (!esEdicion && (!datos.password || datos.password.length < 6)) {
      errores.push('La contraseña debe tener al menos 6 caracteres');
    }

    // En edición, validar contraseña solo si se proporcionó
    if (esEdicion && datos.password && datos.password.length > 0 && datos.password.length < 6) {
      errores.push('La contraseña debe tener al menos 6 caracteres');
    }

    // Validaciones opcionales (solo si tienen valor)
    if (datos.usuario && datos.usuario.length > 0) {
      if (datos.usuario.length < 3 || datos.usuario.length > 20) {
        errores.push('El usuario debe tener entre 3-20 caracteres');
      }
      if (!/^[a-zA-Z0-9_]+$/.test(datos.usuario)) {
        errores.push('El usuario solo puede contener letras, números y guión bajo');
      }
    }

    if (datos.email && datos.email.length > 0 && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(datos.email)) {
      errores.push('El formato del email no es válido');
    }

    if (datos.dni && datos.dni.length > 0 && !/^\d+$/.test(datos.dni)) {
      errores.push('El DNI debe contener solo números');
    }

    if (datos.telefono && datos.telefono.length > 0 && !/^\d+$/.test(datos.telefono)) {
      errores.push('El teléfono debe contener solo números');
    }

    return errores;
  };

  return {
    loading,
    user,
    isManager,
    crearEmpleado,
    actualizarEmpleado,
    buscarEmpleados,
    listarEmpleados,
    obtenerEmpleado,
    desactivarEmpleado,
    validarDatosEmpleado,
    checkPermissions
  };
};