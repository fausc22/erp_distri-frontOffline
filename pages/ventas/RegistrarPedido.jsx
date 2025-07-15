import { useState, useEffect } from 'react';
import Head from 'next/head';
import { toast } from 'react-hot-toast';
import useAuth from '../../hooks/useAuth';

import { PedidosProvider, usePedidosContext } from '../../context/PedidosContext';
import { usePedidosHybrid } from '../../hooks/pedidos/usePedidosHybrid';
import { getAppMode } from '../../utils/offlineManager';
import { useConnection, connectionManager } from '../../utils/ConnectionManager';
import { usePedidosFormPersistence } from '../../hooks/useFormPersistence';

import ClienteSelectorHybrid from '../../components/pedidos/SelectorClientesHybrid';
import ProductoSelectorHybrid from '../../components/pedidos/SelectorProductosHybrid';
import ProductosCarrito from '../../components/pedidos/ProductosCarrito';
import ObservacionesPedido from '../../components/pedidos/ObservacionesPedido';
import { 
  ModalConfirmacionPedido, 
  ModalConfirmacionSalidaPedidos 
} from '../../components/pedidos/ModalesConfirmacion';

function RegistrarPedidoContent() {
  const { 
    cliente, 
    productos, 
    observaciones,
    total, 
    totalProductos,
    clearPedido,
    getDatosPedido,
    setCliente,
    // ✅ Nuevas funciones para restaurar datos
    setObservaciones
  } = usePedidosContext();
 
  const { registrarPedido, loading, appMode, isPWA } = usePedidosHybrid();
  const { user } = useAuth();

  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
  const [mostrarConfirmacionSalida, setMostrarConfirmacionSalida] = useState(false);

  // ✅ CONNECTION MANAGER
  const { isOnline, eventType, setUserWorkingState } = useConnection();

  // ✅ FORM PERSISTENCE
  const {
    saveForm,
    restoreForm,
    clearSavedForm,
    hasSavedForm,
    getSavedFormInfo,
    saveOnConnectivityChange
  } = usePedidosFormPersistence({
    cliente,
    productos,
    observaciones,
    subtotal: total - (total - total * 0.79), // Aproximación del subtotal
    totalIva: total - (total * 0.79), // Aproximación del IVA
    total,
    totalProductos
  });

  // ✅ ESTADO DE UI ADAPTATIVA
  const [uiTheme, setUiTheme] = useState('online');
  const [showConnectionChange, setShowConnectionChange] = useState(false);
  const [showBackupButton, setShowBackupButton] = useState(false); // ✅ CONTROL INTELIGENTE DEL BACKUP

  // ✅ NOTIFICAR AL CONNECTION MANAGER QUE ESTAMOS TRABAJANDO
  useEffect(() => {
    setUserWorkingState('registering_order');
    
    return () => {
      setUserWorkingState('idle');
    };
  }, [setUserWorkingState]);

  // ✅ MANEJO DE EVENTOS DE CONECTIVIDAD
  useEffect(() => {
    if (!eventType) return;

    switch (eventType) {
      case 'connection_lost_working':
        // Cambiar UI a offline pero NO redirigir
        console.log('📴 Cambio a UI offline (manteniendo trabajo)');
        setUiTheme('offline');
        setShowConnectionChange(true);
        
        // Guardar formulario inmediatamente
        saveOnConnectivityChange();
        
        setTimeout(() => setShowConnectionChange(false), 3000);
        break;
        
      case 'connection_restored_working':
        // Cambiar UI a online pero NO redirigir
        console.log('🌐 Cambio a UI online (manteniendo trabajo)');
        setUiTheme('online');
        setShowConnectionChange(true);
        
        // ✅ MOSTRAR BACKUP SOLO EN ESTA TRANSICIÓN ESPECÍFICA
        if (hasSavedForm()) {
          setShowBackupButton(true);
        }
        
        setTimeout(() => setShowConnectionChange(false), 3000);
        break;
        
      default:
        break;
    }
  }, [eventType, saveOnConnectivityChange]);

  // ✅ RESTAURAR BACKUP Y LIMPIAR BOTÓN
  const handleRestoreBackup = () => {
    const savedData = restoreForm();
    
    if (savedData) {
      // Restaurar datos al contexto silenciosamente
      if (savedData.cliente) {
        setCliente(savedData.cliente);
      }
      
      if (savedData.observaciones) {
        setObservaciones(savedData.observaciones);
      }
      
      console.log('🔄 Backup restaurado silenciosamente');
    }
    
    // Ocultar botón después de usar
    setShowBackupButton(false);
  };
  useEffect(() => {
    const checkAndRestoreForm = async () => {
      if (hasSavedForm()) {
        const savedInfo = getSavedFormInfo();
        console.log('🔄 Backup encontrado:', savedInfo);
        
        // Solo restaurar si el formulario actual está vacío
        const isCurrentFormEmpty = !cliente && productos.length === 0 && !observaciones.trim();
        
        if (isCurrentFormEmpty) {
          const savedData = restoreForm();
          
          if (savedData) {
            // Restaurar datos al contexto
            if (savedData.cliente) {
              setCliente(savedData.cliente);
            }
            
            if (savedData.observaciones) {
              setObservaciones(savedData.observaciones);
            }
            
            // Los productos son más complejos de restaurar, 
            // por ahora solo notificar al usuario
            if (savedData.productos?.length > 0) {
              toast.success(`📄 Formulario restaurado: ${savedData.productos.length} productos`, {
                duration: 4000
              });
            }
          }
        }
      }
    };
    
    // Pequeño delay para que el contexto se inicialice
    setTimeout(checkAndRestoreForm, 1000);
  }, []);

  // ✅ AUTO-SAVE PERIÓDICO
  useEffect(() => {
    if (cliente || productos.length > 0 || observaciones.trim()) {
      const autoSaveInterval = setInterval(() => {
        saveForm();
      }, 60000); // 1 minuto

      return () => clearInterval(autoSaveInterval);
    }
  }, [cliente, productos, observaciones, saveForm]);

  const handleConfirmarPedido = () => {
    if (!cliente) {
      toast.error('Debe seleccionar un cliente.');
      return;
    }
    
    if (productos.length === 0) {
      toast.error('Debe agregar al menos un producto.');
      return;
    }
    
    setMostrarConfirmacion(true);
  };

  const handleRegistrarPedido = async () => {
    const datosPedido = getDatosPedido();
    const datosCompletos = {
      ...datosPedido,
      empleado: user
    };
    
    console.log(`🔄 Registrando pedido en modo ${appMode}...`);
    
    const resultado = await registrarPedido(datosCompletos);
    
    if (resultado.success) {
      // ✅ LIMPIAR BACKUP Y BOTÓN AL REGISTRAR EXITOSAMENTE
      clearSavedForm();
      setShowBackupButton(false);
      
      clearPedido();
      setMostrarConfirmacion(false);
      
      // Mensajes diferenciados por modo
      if (resultado.offline) {
        toast.success('📱 Pedido guardado offline - Se subirá cuando haya conexión', {
          duration: 4000,
          icon: '📱'
        });
      } else {
        toast.success('✅ Pedido registrado exitosamente', {
          duration: 3000
        });
        
        // ✅ En modo online, actualizar catálogo después del pedido
        if (isOnline && isPWA) {
          console.log('🔄 Actualizando catálogo después de registrar pedido...');
          // Esto lo maneja automáticamente el hook usePedidosHybrid
        }
      }
      
      // ✅ RESET DEL ESTADO DE TRABAJO
      setUserWorkingState('idle');
      
      // Si hay más pedidos por hacer, volver a working state
      setTimeout(() => {
        setUserWorkingState('registering_order');
      }, 2000);
      
    } else {
      console.error('❌ Error registrando pedido:', resultado.error);
    }
  };

  const handleConfirmarSalida = () => {
    if (cliente || productos.length > 0 || observaciones.trim()) {
      setMostrarConfirmacionSalida(true);
    } else {
      handleSalir();
    }
  };

  const handleSalir = () => {
    // ✅ GUARDAR ANTES DE SALIR (SI HAY DATOS) - SILENCIOSO
    if (cliente || productos.length > 0 || observaciones.trim()) {
      saveForm();
      console.log('📄 Formulario guardado antes de salir');
    }
    
    setUserWorkingState('idle');
    // ✅ NAVEGACIÓN ROBUSTA PARA SAFARI
    window.location.href = '/';
  };

  // ✅ FUNCIONES PARA OBTENER ESTILOS ADAPTATIVOS
  const getTitulo = () => {
    if (isPWA) {
      if (uiTheme === 'offline') {
        return 'NUEVO PEDIDO - OFFLINE';
      } else {
        return isOnline ? 'NUEVO PEDIDO - ONLINE' : 'NUEVO PEDIDO - OFFLINE';
      }
    }
    return 'NUEVO PEDIDO';
  };

  const getStatusClass = () => {
    if (!isPWA) return '';
    
    if (uiTheme === 'offline') {
      return 'border-l-4 border-orange-500 bg-orange-50';
    } else {
      return isOnline ? 'border-l-4 border-green-500 bg-green-50' : 'border-l-4 border-orange-500 bg-orange-50';
    }
  };

  const getButtonClass = () => {
    if (loading) return 'bg-gray-500 cursor-not-allowed';
    
    if (uiTheme === 'offline' || (!isOnline && isPWA)) {
      return 'bg-orange-600 hover:bg-orange-700';
    }
    
    return 'bg-green-600 hover:bg-green-700';
  };

  const getButtonText = () => {
    if (loading) {
      return uiTheme === 'offline' || (!isOnline && isPWA) ? 'Guardando offline...' : 'Guardando...';
    }
    
    if (uiTheme === 'offline' || (!isOnline && isPWA)) {
      return '📱 Guardar Offline';
    }
    
    return '✅ Confirmar Pedido';
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <Head>
        <title>VERTIMAR | NUEVO PEDIDO</title>
        <meta name="description" content="Sistema de registro de ventas híbrido" />
      </Head>
      
      {/* ✅ NOTIFICACIÓN DE CAMBIO DE CONECTIVIDAD */}
      {showConnectionChange && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg transition-all duration-300 ${
          uiTheme === 'offline' 
            ? 'bg-orange-500 text-white' 
            : 'bg-green-500 text-white'
        }`}>
          <div className="flex items-center gap-2">
            {uiTheme === 'offline' ? '📴' : '🌐'}
            <span className="font-medium">
              {uiTheme === 'offline' 
                ? 'Sin conexión - Modo offline' 
                : 'Conexión restaurada'
              }
            </span>
          </div>
          <div className="text-sm mt-1">
            {uiTheme === 'offline' 
              ? 'Puedes seguir trabajando sin interrupciones' 
              : 'Termina tu pedido para sincronizar'
            }
          </div>
        </div>
      )}
      
      <div className={`bg-white shadow-lg rounded-lg p-6 w-full max-w-6xl transition-all duration-300 ${getStatusClass()}`}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
          <h1 className="text-2xl font-bold text-center text-gray-800">
            {getTitulo()}
          </h1>
          
          {/* ✅ INDICADOR DE ESTADO MEJORADO */}
          {isPWA && (
            <div className="flex items-center gap-2 mt-2 sm:mt-0">
              <div className={`w-3 h-3 rounded-full transition-colors ${
                (uiTheme === 'offline' || !isOnline) ? 'bg-orange-500 animate-pulse' : 'bg-green-500'
              }`}></div>
              <span className={`text-sm font-medium ${
                (uiTheme === 'offline' || !isOnline) ? 'text-orange-700' : 'text-green-700'
              }`}>
                {(uiTheme === 'offline' || !isOnline) ? 'OFFLINE' : 'ONLINE'}
              </span>
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                📱 PWA
              </span>
            </div>
          )}
        </div>

        {/* ✅ MENSAJE INFORMATIVO DINÁMICO */}
        {isPWA && (uiTheme === 'offline' || !isOnline) && (
          <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
            <div className="flex items-center">
              <div className="text-orange-600 mr-2">📱</div>
              <div className="text-sm text-orange-800">
                <strong>Modo Offline:</strong> Los pedidos se guardarán localmente y se subirán cuando se recupere la conexión.
              </div>
            </div>
          </div>
        )}

        {/* ✅ BOTÓN DE BACKUP INTELIGENTE (Solo en transición específica) */}
        {showBackupButton && hasSavedForm() && (
          <div className="mb-4 flex justify-center">
            <button
              onClick={handleRestoreBackup}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              📄 RESTAURAR VENTA ANTERIOR PENDIENTE
            </button>
          </div>
        )}
        
        <div className="flex flex-col md:flex-row gap-6">
          <ClienteSelectorHybrid />
          <ProductoSelectorHybrid />
        </div>

        <ProductosCarrito />

        <ObservacionesPedido />
        
        {/* ✅ RESUMEN Y BOTONES ADAPTATIVOS */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
            <div className="text-lg font-semibold text-gray-800">
              <p>Total de productos: <span className="text-blue-600">{totalProductos}</span></p>
              <p>Total del pedido: <span className="text-green-600">${total.toFixed(2)}</span></p>
              
              {/* ✅ INFORMACIÓN DEL MODO ACTUAL */}
              {isPWA && (
                <p className="text-sm text-gray-600 mt-1">
                  Modo: <span className="font-medium">
                    {(uiTheme === 'offline' || !isOnline) 
                      ? 'Offline (se sincronizará después)' 
                      : 'Online (se guardará inmediatamente)'
                    }
                  </span>
                </p>
              )}
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row justify-end gap-4">
            <button 
              className={`px-6 py-3 rounded text-white font-semibold transition-colors ${getButtonClass()}`}
              onClick={handleConfirmarPedido}
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {getButtonText()}
                </div>
              ) : (
                getButtonText()
              )}
            </button>
            
            <button 
              className="bg-red-600 hover:bg-red-700 px-6 py-3 rounded text-white font-semibold transition-colors"
              onClick={handleConfirmarSalida}
              disabled={loading}
            >
              Volver al Menú
            </button>
          </div>
        </div>
      </div>
      
      {/* ✅ MODAL DE CONFIRMACIÓN ADAPTATIVO */}
      <ModalConfirmacionPedido
        mostrar={mostrarConfirmacion}
        cliente={cliente}
        totalProductos={totalProductos}
        total={total}
        observaciones={observaciones}
        onConfirmar={handleRegistrarPedido}
        onCancelar={() => setMostrarConfirmacion(false)}
        loading={loading}
        isPWA={isPWA}
        isOnline={uiTheme === 'online' && isOnline}
      />

      <ModalConfirmacionSalidaPedidos
        mostrar={mostrarConfirmacionSalida}
        onConfirmar={handleSalir}
        onCancelar={() => setMostrarConfirmacionSalida(false)}
      />
    </div>
  );
}

export default function RegistrarPedidoUnificado() {
  return (
    <PedidosProvider>
      <RegistrarPedidoContent />
    </PedidosProvider>
  );
}