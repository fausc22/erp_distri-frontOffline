// hooks/useFormPersistence.js - Sistema de persistencia mejorado y robusto
import { useCallback } from 'react';

const STORAGE_KEYS = {
  PEDIDO_ESTADO_COMPLETO: 'vertimar_pedido_estado_completo',
  PEDIDO_BACKUP: 'vertimar_pedido_backup',
  PEDIDO_METADATA: 'vertimar_pedido_metadata'
};

export function usePedidosFormPersistence(datosFormulario) {
  // ✅ GUARDAR ESTADO COMPLETO CON METADATOS
  const saveForm = useCallback(() => {
    try {
      const estadoCompleto = {
        ...datosFormulario,
        timestamp: Date.now(),
        route: '/ventas/RegistrarPedido',
        version: '2.0',
        userAgent: navigator.userAgent,
        sessionId: getOrCreateSessionId()
      };
      
      // ✅ Guardar en múltiples claves para redundancia
      localStorage.setItem(STORAGE_KEYS.PEDIDO_ESTADO_COMPLETO, JSON.stringify(estadoCompleto));
      localStorage.setItem(STORAGE_KEYS.PEDIDO_BACKUP, JSON.stringify(estadoCompleto));
      
      // ✅ Metadatos separados para verificación rápida
      const metadata = {
        hasCliente: !!datosFormulario.cliente,
        productosCount: datosFormulario.productos?.length || 0,
        observacionesLength: datosFormulario.observaciones?.length || 0,
        total: datosFormulario.total || 0,
        lastSaved: Date.now()
      };
      
      localStorage.setItem(STORAGE_KEYS.PEDIDO_METADATA, JSON.stringify(metadata));
      
      console.log('💾 [FormPersistence] Estado guardado con redundancia');
      return true;
    } catch (error) {
      console.error('❌ [FormPersistence] Error guardando formulario:', error);
      return false;
    }
  }, [datosFormulario]);

  // ✅ RESTAURAR ESTADO CON VALIDACIÓN
  const restoreForm = useCallback(() => {
    try {
      // ✅ Intentar con estado completo primero
      let estadoGuardado = localStorage.getItem(STORAGE_KEYS.PEDIDO_ESTADO_COMPLETO);
      
      if (!estadoGuardado) {
        // ✅ Fallback al backup
        estadoGuardado = localStorage.getItem(STORAGE_KEYS.PEDIDO_BACKUP);
        console.log('🔄 [FormPersistence] Usando backup para restaurar');
      }
      
      if (!estadoGuardado) {
        console.log('ℹ️ [FormPersistence] No hay estado guardado para restaurar');
        return null;
      }
      
      const estado = JSON.parse(estadoGuardado);
      
      // ✅ Validar que el estado no sea muy antiguo (más de 24 horas)
      const horasTranscurridas = (Date.now() - estado.timestamp) / (1000 * 60 * 60);
      if (horasTranscurridas > 24) {
        console.log('⏰ [FormPersistence] Estado muy antiguo, descartando');
        clearSavedForm();
        return null;
      }
      
      // ✅ Validar integridad del estado
      if (!validateEstado(estado)) {
        console.log('⚠️ [FormPersistence] Estado corrupto, descartando');
        clearSavedForm();
        return null;
      }
      
      console.log('✅ [FormPersistence] Estado restaurado exitosamente');
      return estado;
      
    } catch (error) {
      console.error('❌ [FormPersistence] Error restaurando formulario:', error);
      
      // ✅ Intentar limpiar datos corruptos
      try {
        clearSavedForm();
      } catch (cleanupError) {
        console.error('❌ [FormPersistence] Error limpiando datos corruptos:', cleanupError);
      }
      
      return null;
    }
  }, []);

  // ✅ VERIFICAR SI HAY FORMULARIO GUARDADO
  const hasSavedForm = useCallback(() => {
    try {
      const metadata = localStorage.getItem(STORAGE_KEYS.PEDIDO_METADATA);
      if (!metadata) return false;
      
      const meta = JSON.parse(metadata);
      
      // ✅ Verificar que hay contenido significativo
      const tieneContenido = meta.hasCliente || meta.productosCount > 0 || meta.observacionesLength > 0;
      
      // ✅ Verificar que no sea muy antiguo
      const horasTranscurridas = (Date.now() - meta.lastSaved) / (1000 * 60 * 60);
      const noMuyAntiguo = horasTranscurridas <= 24;
      
      return tieneContenido && noMuyAntiguo;
    } catch (error) {
      console.error('❌ [FormPersistence] Error verificando formulario guardado:', error);
      return false;
    }
  }, []);

  // ✅ OBTENER INFORMACIÓN DEL FORMULARIO GUARDADO
  const getSavedFormInfo = useCallback(() => {
    try {
      const metadata = localStorage.getItem(STORAGE_KEYS.PEDIDO_METADATA);
      if (!metadata) return null;
      
      const meta = JSON.parse(metadata);
      
      return {
        hasCliente: meta.hasCliente,
        productosCount: meta.productosCount,
        observacionesLength: meta.observacionesLength,
        total: meta.total,
        lastSaved: new Date(meta.lastSaved),
        antigüedadHoras: (Date.now() - meta.lastSaved) / (1000 * 60 * 60)
      };
    } catch (error) {
      console.error('❌ [FormPersistence] Error obteniendo info del formulario:', error);
      return null;
    }
  }, []);

  // ✅ LIMPIAR FORMULARIO GUARDADO
  const clearSavedForm = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEYS.PEDIDO_ESTADO_COMPLETO);
      localStorage.removeItem(STORAGE_KEYS.PEDIDO_BACKUP);
      localStorage.removeItem(STORAGE_KEYS.PEDIDO_METADATA);
      console.log('🧹 [FormPersistence] Formulario guardado limpiado');
      return true;
    } catch (error) {
      console.error('❌ [FormPersistence] Error limpiando formulario:', error);
      return false;
    }
  }, []);

  // ✅ FORZAR GUARDADO INMEDIATO
  const forceSave = useCallback(() => {
    console.log('⚡ [FormPersistence] Guardado forzado inmediato');
    return saveForm();
  }, [saveForm]);

  // ✅ VERIFICAR INTEGRIDAD DEL STORAGE
  const checkStorageIntegrity = useCallback(() => {
    try {
      const estadoCompleto = localStorage.getItem(STORAGE_KEYS.PEDIDO_ESTADO_COMPLETO);
      const backup = localStorage.getItem(STORAGE_KEYS.PEDIDO_BACKUP);
      const metadata = localStorage.getItem(STORAGE_KEYS.PEDIDO_METADATA);
      
      const integrity = {
        hasEstadoCompleto: !!estadoCompleto,
        hasBackup: !!backup,
        hasMetadata: !!metadata,
        estadoValidCompleto: estadoCompleto ? validateJSON(estadoCompleto) : false,
        backupValidCompleto: backup ? validateJSON(backup) : false,
        metadataValidCompleto: metadata ? validateJSON(metadata) : false
      };
      
      integrity.isHealthy = integrity.hasEstadoCompleto && integrity.estadoValidCompleto;
      integrity.hasValidBackup = integrity.hasBackup && integrity.backupValidCompleto;
      
      return integrity;
    } catch (error) {
      console.error('❌ [FormPersistence] Error verificando integridad:', error);
      return { isHealthy: false, error: error.message };
    }
  }, []);

  return {
    // ✅ Funciones principales
    saveForm,
    restoreForm,
    clearSavedForm,
    hasSavedForm,
    getSavedFormInfo,
    
    // ✅ Funciones avanzadas
    forceSave,
    checkStorageIntegrity,
    
    // ✅ Información de debug
    getDebugInfo: () => ({
      storageKeys: STORAGE_KEYS,
      hasData: hasSavedForm(),
      integrity: checkStorageIntegrity(),
      formData: datosFormulario
    })
  };
}

// ✅ FUNCIONES HELPER PRIVADAS

function validateEstado(estado) {
  try {
    // ✅ Verificar estructura básica
    if (!estado || typeof estado !== 'object') return false;
    
    // ✅ Verificar que tenga timestamp
    if (!estado.timestamp || typeof estado.timestamp !== 'number') return false;
    
    // ✅ Verificar que tenga al menos uno de los campos principales
    const tieneCliente = estado.cliente && typeof estado.cliente === 'object';
    const tieneProductos = Array.isArray(estado.productos) && estado.productos.length > 0;
    const tieneObservaciones = estado.observaciones && estado.observaciones.length > 0;
    
    if (!tieneCliente && !tieneProductos && !tieneObservaciones) return false;
    
    // ✅ Validar estructura de productos si existen
    if (tieneProductos) {
      const productosValidos = estado.productos.every(producto => 
        producto.id && 
        producto.nombre && 
        typeof producto.cantidad === 'number' && 
        typeof producto.precio === 'number'
      );
      if (!productosValidos) return false;
    }
    
    // ✅ Validar estructura de cliente si existe
    if (tieneCliente) {
      if (!estado.cliente.nombre || !estado.cliente.id) return false;
    }
    
    return true;
  } catch (error) {
    console.error('❌ [FormPersistence] Error validando estado:', error);
    return false;
  }
}

function validateJSON(jsonString) {
  try {
    JSON.parse(jsonString);
    return true;
  } catch (error) {
    return false;
  }
}

function getOrCreateSessionId() {
  try {
    let sessionId = sessionStorage.getItem('vertimar_session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('vertimar_session_id', sessionId);
    }
    return sessionId;
  } catch (error) {
    return `fallback_${Date.now()}`;
  }
}