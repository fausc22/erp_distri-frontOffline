// hooks/useFormPersistence.js - Hook para persistir formularios entre cambios de conectividad
import { useEffect, useRef, useCallback } from 'react';
import { toast } from 'react-hot-toast';

const STORAGE_KEY = 'vertimar_form_backup';
const AUTO_SAVE_INTERVAL = 60000; // 60 segundos

export function useFormPersistence(formKey, formData, options = {}) {
  const {
    enabled = true,
    autoSaveInterval = AUTO_SAVE_INTERVAL,
    onRestore = null,
    onSave = null,
    showToasts = false // ✅ TOASTS DESHABILITADOS POR DEFECTO
  } = options;

  const autoSaveRef = useRef(null);
  const lastSaveRef = useRef(null);
  const isRestoringRef = useRef(false);

  // ✅ CLAVE ÚNICA PARA ESTE FORMULARIO
  const storageKey = `${STORAGE_KEY}_${formKey}`;

  // ✅ GUARDAR FORMULARIO EN LOCALSTORAGE
  const saveForm = useCallback((data = formData, showToast = false) => {
    if (!enabled || isRestoringRef.current) return;

    try {
      const formBackup = {
        data,
        timestamp: Date.now(),
        formKey,
        version: '1.0'
      };

      localStorage.setItem(storageKey, JSON.stringify(formBackup));
      lastSaveRef.current = Date.now();

      // ✅ TOASTS ELIMINADOS - Auto-save silencioso
      console.log(`💾 Formulario ${formKey} guardado automáticamente`);
      
      // Callback personalizado
      if (onSave) {
        onSave(data, formBackup);
      }

    } catch (error) {
      console.error('❌ Error guardando formulario:', error);
      // ✅ TOASTS ELIMINADOS - Errores silenciosos
    }
  }, [formData, enabled, formKey, storageKey, onSave, showToasts]);

  // ✅ RESTAURAR FORMULARIO DESDE LOCALSTORAGE
  const restoreForm = useCallback(() => {
    if (!enabled) return null;

    try {
      const saved = localStorage.getItem(storageKey);
      
      if (!saved) {
        console.log(`📄 No hay backup para formulario ${formKey}`);
        return null;
      }

      const formBackup = JSON.parse(saved);
      
      // Verificar que no sea muy antiguo (máximo 24 horas)
      const twentyFourHours = 24 * 60 * 60 * 1000;
      const isOld = (Date.now() - formBackup.timestamp) > twentyFourHours;
      
      if (isOld) {
        console.log(`📄 Backup de formulario ${formKey} muy antiguo, eliminando`);
        clearSavedForm();
        return null;
      }

      console.log(`🔄 Restaurando formulario ${formKey} desde backup`);
      
      // ✅ TOASTS ELIMINADOS - Restauración silenciosa
      
      // Callback personalizado
      if (onRestore) {
        onRestore(formBackup.data, formBackup);
      }

      return formBackup.data;

    } catch (error) {
      console.error('❌ Error restaurando formulario:', error);
      clearSavedForm();
      return null;
    }
  }, [enabled, formKey, storageKey, onRestore, showToasts]);

  // ✅ LIMPIAR FORMULARIO GUARDADO
  const clearSavedForm = useCallback(() => {
    try {
      localStorage.removeItem(storageKey);
      console.log(`🧹 Backup de formulario ${formKey} eliminado`);
    } catch (error) {
      console.error('❌ Error limpiando formulario guardado:', error);
    }
  }, [storageKey, formKey]);

  // ✅ VERIFICAR SI HAY BACKUP DISPONIBLE
  const hasSavedForm = useCallback(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (!saved) return false;

      const formBackup = JSON.parse(saved);
      const twentyFourHours = 24 * 60 * 60 * 1000;
      const isOld = (Date.now() - formBackup.timestamp) > twentyFourHours;

      return !isOld;
    } catch {
      return false;
    }
  }, [storageKey]);

  // ✅ OBTENER INFORMACIÓN DEL BACKUP
  const getSavedFormInfo = useCallback(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (!saved) return null;

      const formBackup = JSON.parse(saved);
      
      return {
        timestamp: formBackup.timestamp,
        age: Date.now() - formBackup.timestamp,
        formattedAge: formatAge(Date.now() - formBackup.timestamp),
        isValid: (Date.now() - formBackup.timestamp) < (24 * 60 * 60 * 1000)
      };
    } catch {
      return null;
    }
  }, [storageKey]);

  // ✅ AUTO-SAVE INTELIGENTE
  useEffect(() => {
    if (!enabled || !formData) return;

    // Limpiar intervalo anterior
    if (autoSaveRef.current) {
      clearInterval(autoSaveRef.current);
    }

    // Configurar auto-save solo si hay datos significativos
    const hasSignificantData = checkSignificantData(formData);
    
    if (hasSignificantData) {
      autoSaveRef.current = setInterval(() => {
        // Solo guardar si han pasado al menos 30 segundos desde el último save
        const timeSinceLastSave = Date.now() - (lastSaveRef.current || 0);
        if (timeSinceLastSave >= 30000) {
          saveForm(formData, false); // Sin toast para auto-save
        }
      }, autoSaveInterval);

      console.log(`⏰ Auto-save configurado para formulario ${formKey} (cada ${autoSaveInterval/1000}s)`);
    }

    return () => {
      if (autoSaveRef.current) {
        clearInterval(autoSaveRef.current);
      }
    };
  }, [enabled, formData, autoSaveInterval, formKey, saveForm]);

  // ✅ SAVE MANUAL AL CAMBIAR CONECTIVIDAD
  const saveOnConnectivityChange = useCallback(() => {
    if (enabled && formData && checkSignificantData(formData)) {
      saveForm(formData, true); // Con toast para saves manuales
    }
  }, [enabled, formData, saveForm]);

  // ✅ RESTORE AUTOMÁTICO AL MONTAR COMPONENTE
  useEffect(() => {
    if (enabled) {
      isRestoringRef.current = true;
      
      setTimeout(() => {
        isRestoringRef.current = false;
      }, 1000);
    }
  }, [enabled]);

  // ✅ CLEANUP AL DESMONTAR
  useEffect(() => {
    return () => {
      if (autoSaveRef.current) {
        clearInterval(autoSaveRef.current);
      }
    };
  }, []);

  return {
    saveForm,
    restoreForm,
    clearSavedForm,
    hasSavedForm,
    getSavedFormInfo,
    saveOnConnectivityChange,
    
    // Información de estado
    isAutoSaveActive: !!autoSaveRef.current,
    lastSaveTime: lastSaveRef.current,
    storageKey
  };
}

// ✅ FUNCIONES HELPER
function checkSignificantData(formData) {
  if (!formData || typeof formData !== 'object') return false;

  // Verificar si hay datos significativos
  const hasCliente = formData.cliente && formData.cliente.id;
  const hasProductos = formData.productos && formData.productos.length > 0;
  const hasObservaciones = formData.observaciones && formData.observaciones.trim().length > 0;

  return hasCliente || hasProductos || hasObservaciones;
}

function formatAge(ms) {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  } else if (minutes > 0) {
    return `${minutes}m`;
  } else {
    return `${seconds}s`;
  }
}

// ✅ HOOK SIMPLIFICADO PARA PEDIDOS (SIN TOASTS)
export function usePedidosFormPersistence(pedidosContextData) {
  const formData = {
    cliente: pedidosContextData.cliente,
    productos: pedidosContextData.productos,
    observaciones: pedidosContextData.observaciones,
    subtotal: pedidosContextData.subtotal,
    totalIva: pedidosContextData.totalIva,
    total: pedidosContextData.total,
    totalProductos: pedidosContextData.totalProductos
  };

  return useFormPersistence('registrar_pedido', formData, {
    enabled: true,
    autoSaveInterval: 60000, // 1 minuto
    showToasts: false, // ✅ TOASTS COMPLETAMENTE DESHABILITADOS
    onRestore: (data) => {
      console.log('🔄 Datos de pedido restaurados silenciosamente:', data);
    },
    onSave: (data) => {
      console.log('💾 Datos de pedido guardados silenciosamente:', {
        cliente: data.cliente?.nombre,
        productos: data.productos?.length,
        total: data.total
      });
    }
  });
}

// ✅ UTILIDAD PARA LIMPIAR TODOS LOS BACKUPS
export function clearAllFormBackups() {
  try {
    const keys = Object.keys(localStorage);
    const backupKeys = keys.filter(key => key.startsWith(STORAGE_KEY));
    
    backupKeys.forEach(key => {
      localStorage.removeItem(key);
    });
    
    console.log(`🧹 Eliminados ${backupKeys.length} backups de formularios`);
    
    return backupKeys.length;
  } catch (error) {
    console.error('❌ Error limpiando backups:', error);
    return 0;
  }
}

// ✅ UTILIDAD PARA OBTENER INFORMACIÓN DE TODOS LOS BACKUPS
export function getAllFormBackupsInfo() {
  try {
    const keys = Object.keys(localStorage);
    const backupKeys = keys.filter(key => key.startsWith(STORAGE_KEY));
    
    return backupKeys.map(key => {
      try {
        const data = JSON.parse(localStorage.getItem(key));
        return {
          key,
          formKey: data.formKey,
          timestamp: data.timestamp,
          age: Date.now() - data.timestamp,
          formattedAge: formatAge(Date.now() - data.timestamp),
          isValid: (Date.now() - data.timestamp) < (24 * 60 * 60 * 1000),
          size: JSON.stringify(data).length
        };
      } catch {
        return {
          key,
          error: 'Datos corruptos'
        };
      }
    });
  } catch (error) {
    console.error('❌ Error obteniendo info de backups:', error);
    return [];
  }
}