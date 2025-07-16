import { useState, useEffect } from 'react';
import Head from 'next/head';
import { toast } from 'react-hot-toast';
import useAuth from '../../hooks/useAuth';

import { PedidosProvider, usePedidosContext } from '../../context/PedidosContext';
import { usePedidosHybrid } from '../../hooks/pedidos/usePedidosHybrid';
import { useConnection } from '../../utils/ConnectionManager';
import { getAppMode, offlineManager } from '../../utils/offlineManager';
import { usePedidosFormPersistence } from '../../hooks/useFormPersistence';

// ✅ COMPONENTES HÍBRIDOS
import ClienteSelectorHybrid from '../../components/pedidos/SelectorClientesHybrid';
import ProductoSelectorHybrid from '../../components/pedidos/SelectorProductosHybrid';
import ProductosCarrito from '../../components/pedidos/ProductosCarrito';
import ObservacionesPedido from '../../components/pedidos/ObservacionesPedido';
import { 
  ModalConfirmacionPedido, 
  ModalConfirmacionSalidaPedidos 
} from '../../components/pedidos/ModalesConfirmacion';

// ✅ NUEVO MODAL
import ModalConexionRestablecida from '../../components/pedidos/ModalConexionRestablecida';

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
    setObservaciones,
    addMultipleProductos
  } = usePedidosContext();
 
  const { registrarPedido, loading } = usePedidosHybrid();
  const { user } = useAuth();

  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
  const [mostrarConfirmacionSalida, setMostrarConfirmacionSalida] = useState(false);
  const [catalogStats, setCatalogStats] = useState(null);
  
  // ✅ NUEVO ESTADO: Modal de reconexión y modo forzado offline
  const [mostrarModalReconexion, setMostrarModalReconexion] = useState(false);
  const [modoForzadoOffline, setModoForzadoOffline] = useState(false);
  const [loadingConexion, setLoadingConexion] = useState(false);

  // ✅ CONNECTION MANAGER - Sin redirecciones automáticas
  const { isOnline, eventType, checkOnDemand } = useConnection();
  const isPWA = getAppMode() === 'pwa';

  // ✅ FORM PERSISTENCE
  const {
    saveForm,
    restoreForm,
    clearSavedForm,
    hasSavedForm,
    getSavedFormInfo
  } = usePedidosFormPersistence({
    cliente,
    productos,
    observaciones,
    subtotal: total - (total - total * 0.79),
    totalIva: total - (total * 0.79),
    total,
    totalProductos
  });

  // ✅ DETECTAR MODO INICIAL (si la página carga sin conexión, forzar offline)
  useEffect(() => {
    if (isPWA && !isOnline) {
      console.log('📱 Página cargada sin conexión - Forzando modo offline estable');
      setModoForzadoOffline(true);
    }
  }, []);

  // ✅ CARGAR ESTADÍSTICAS PWA
  useEffect(() => {
    if (isPWA) {
      const stats = offlineManager.getStorageStats();
      setCatalogStats(stats);
      console.log('📊 Estadísticas del catálogo:', stats);
    }
  }, [isPWA]);

  // ✅ MANEJO DE EVENTOS DE CONECTIVIDAD - SOLO ACTUALIZACIONES DE UI
  useEffect(() => {
    if (!eventType) return;

    switch (eventType) {
      case 'connection_lost':
        console.log('📴 Conexión perdida detectada en RegistrarPedido');
        // Solo actualizar estadísticas - NO cambiar de página
        if (isPWA) {
          const stats = offlineManager.getStorageStats();
          setCatalogStats(stats);
        }
        break;
        
      case 'connection_restored':
        console.log('🌐 Conexión restaurada detectada en RegistrarPedido');
        // Solo actualizar estadísticas - NO cambiar de página ni mostrar modal automáticamente
        if (isPWA) {
          const stats = offlineManager.getStorageStats();
          setCatalogStats(stats);
        }
        break;
        
      default:
        break;
    }
  }, [eventType, isPWA]);

  // ✅ AUTO-RESTORE DE BACKUP
  useEffect(() => {
    if (hasSavedForm()) {
      const savedData = restoreForm();
      
      if (savedData) {
        let itemsRestored = [];
        
        if (savedData.cliente) {
          setCliente(savedData.cliente);
          itemsRestored.push('cliente');
        }
        
        if (savedData.observaciones) {
          setObservaciones(savedData.observaciones);
          itemsRestored.push('observaciones');
        }
        
        if (savedData.productos && savedData.productos.length > 0) {
          addMultipleProductos(savedData.productos);
          itemsRestored.push(`${savedData.productos.length} productos`);
        }
        
        if (itemsRestored.length > 0) {
          toast.success(`📄 Formulario restaurado: ${itemsRestored.join(', ')}`, {
            duration: 4000
          });
        }
        
        clearSavedForm();
      }
    }
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

  // ✅ NUEVA LÓGICA: Registrar pedido y verificar conexión después
  const handleRegistrarPedido = async () => {
    const datosPedido = getDatosPedido();
    const datosCompletos = {
      ...datosPedido,
      empleado: user
    };
    
    console.log(`🔄 Registrando pedido en modo ${isOnline && !modoForzadoOffline ? 'online' : 'offline'}...`);
    
    const resultado = await registrarPedido(datosCompletos);
    
    if (resultado.success) {
      clearSavedForm();
      clearPedido();
      setMostrarConfirmacion(false);
      
      // Actualizar estadísticas
      if (isPWA) {
        const newStats = offlineManager.getStorageStats();
        setCatalogStats(newStats);
      }
      
      // ✅ NUEVA LÓGICA: Si el pedido se guardó offline, verificar conexión
      if (resultado.offline || modoForzadoOffline) {
        console.log('📱 Pedido guardado offline, verificando si hay conexión disponible...');
        
        // Verificar conexión en demanda
        const hayConexion = await checkOnDemand();
        
        if (hayConexion && !modoForzadoOffline) {
          // ✅ HAY CONEXIÓN: Mostrar modal de reconexión
          console.log('🌐 Conexión disponible después de guardar offline - Mostrando modal');
          setMostrarModalReconexion(true);
        } else {
          // ✅ SIN CONEXIÓN: Toast normal de offline
          toast.success('📱 Pedido guardado offline - Se subirá cuando haya conexión', {
            duration: 4000,
            icon: '📱'
          });
        }
      } else {
        // ✅ PEDIDO ONLINE: Toast normal
        toast.success('✅ Pedido registrado exitosamente');
      }
    } else {
      console.error('❌ Error registrando pedido:', resultado.error);
    }
  };

  // ✅ NUEVA FUNCIÓN: Manejar "Ir a Menú" del modal de reconexión
  const handleIrAMenuDesdeModal = async () => {
    setLoadingConexion(true);
    
    // Verificar conexión antes de ir al menú
    const hayConexion = await checkOnDemand();
    
    if (hayConexion) {
      console.log('🌐 Conexión confirmada - Redirigiendo al menú');
      setMostrarModalReconexion(false);
      
      // Guardar formulario antes de salir
      if (cliente || productos.length > 0 || observaciones.trim()) {
        saveForm();
      }
      
      window.location.href = '/inicio';
    } else {
      console.log('📴 Sin conexión - No se puede ir al menú');
      setLoadingConexion(false);
      setMostrarModalReconexion(false);
      
      toast.error('📴 Sin conexión - No se puede acceder al menú', {
        duration: 3000,
        icon: '📴'
      });
    }
  };

  // ✅ NUEVA FUNCIÓN: Manejar "Seguir Registrando" del modal de reconexión
  const handleSeguirRegistrandoDesdeModal = () => {
    console.log('📱 Usuario eligió seguir registrando offline');
    setModoForzadoOffline(true); // Forzar modo offline estable
    setMostrarModalReconexion(false);
    
    toast.success('📱 Continuando en modo offline estable', {
      duration: 3000,
      icon: '📱'
    });
  };

  // ✅ MODIFICAR: Manejar "Volver al Inicio" con verificación de conexión
  const handleConfirmarSalida = () => {
    if (cliente || productos.length > 0 || observaciones.trim()) {
      setMostrarConfirmacionSalida(true);
    } else {
      handleSalirConVerificacion();
    }
  };

  // ✅ NUEVA FUNCIÓN: Salir con verificación de conexión
  const handleSalirConVerificacion = async () => {
    console.log('🚪 Intentando salir - Verificando conexión...');
    
    setLoadingConexion(true);
    
    // Verificar conexión antes de salir
    const hayConexion = await checkOnDemand();
    
    if (hayConexion) {
      console.log('🌐 Conexión confirmada - Redirigiendo al menú');
      
      // Guardar formulario antes de salir
      if (cliente || productos.length > 0 || observaciones.trim()) {
        saveForm();
      }
      
      window.location.href = '/inicio';
    } else {
      console.log('📴 Sin conexión - Manteniendo en formulario offline');
      setLoadingConexion(false);
      
      toast.error('📴 Sin conexión - No se puede acceder al menú. Continúa trabajando offline.', {
        duration: 4000,
        icon: '📴'
      });
    }
  };

  const handleSalir = () => {
    // Guardar formulario antes de salir
    if (cliente || productos.length > 0 || observaciones.trim()) {
      saveForm();
    }
    handleSalirConVerificacion();
  };

  // ✅ DETERMINAR ESTADO DE INTERFAZ (offline forzado o estado real)
  const getInterfaceState = () => {
    if (modoForzadoOffline) {
      return {
        isOffline: true,
        showAsOffline: true,
        canGoOnline: false
      };
    }
    
    return {
      isOffline: !isOnline,
      showAsOffline: !isOnline,
      canGoOnline: isOnline
    };
  };

  const interfaceState = getInterfaceState();

  // ✅ OBTENER TEMA SEGÚN ESTADO DE INTERFAZ
  const getPageTheme = () => {
    if (!isPWA) return 'bg-gray-100'; // Web normal
    return interfaceState.showAsOffline ? 'bg-orange-50' : 'bg-gray-100';
  };

  const getHeaderTheme = () => {
    if (!isPWA) return 'from-blue-500 to-blue-600'; // Web normal
    return interfaceState.showAsOffline 
      ? 'from-orange-500 to-orange-600'    // Offline
      : 'from-blue-500 to-blue-600';       // Online
  };

  const getHeaderTitle = () => {
    if (!isPWA) return 'NUEVO PEDIDO';
    
    if (modoForzadoOffline) {
      return '📱 NUEVO PEDIDO (MODO OFFLINE ESTABLE)';
    }
    
    return interfaceState.showAsOffline 
      ? '📱 NUEVO PEDIDO (OFFLINE)'
      : '🌐 NUEVO PEDIDO (ONLINE)';
  };

  const getHeaderSubtitle = () => {
    if (!isPWA) return 'Sistema de gestión de pedidos';
    
    if (modoForzadoOffline) {
      return 'Modo offline estable - Sin interrupciones por reconexión';
    }
    
    return interfaceState.showAsOffline
      ? 'Sistema independiente para registro sin conexión'
      : 'Sistema de gestión de pedidos';
  };

  return (
    <div className={`flex flex-col items-center justify-center min-h-screen ${getPageTheme()} p-4`}>
      <Head>
        <title>VERTIMAR | REGISTRAR PEDIDO</title>
        <meta name="description" content="Sistema universal de registro de pedidos online/offline" />
      </Head>
      
      <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-6xl">
        
        {/* ✅ HEADER MEJORADO */}
        <div className={`bg-gradient-to-r ${getHeaderTheme()} text-white rounded-lg p-6 mb-6`}>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold mb-2">
                {getHeaderTitle()}
              </h1>
              <p className={interfaceState.showAsOffline ? 'text-orange-100' : 'text-blue-100'}>
                {getHeaderSubtitle()}
              </p>
              
              {/* ✅ INDICADOR DE ESTADO MEJORADO */}
              {isPWA && (
                <div className="flex items-center gap-2 mt-2">
                  <div className={`w-3 h-3 rounded-full ${
                    interfaceState.showAsOffline ? 'bg-orange-300 animate-pulse' : 'bg-green-300 animate-pulse'
                  }`}></div>
                  <span className={`text-sm font-medium ${
                    interfaceState.showAsOffline ? 'text-orange-200' : 'text-green-200'
                  }`}>
                    {modoForzadoOffline 
                      ? 'Modo offline estable - Sin auto-reconexión'
                      : interfaceState.showAsOffline 
                        ? 'Sin conexión - Guardado local'
                        : 'Conectado - Guardado directo'
                    }
                  </span>
                </div>
              )}
            </div>
            
            <div className="mt-4 md:mt-0 text-right">
              {/* ✅ BOTÓN PARA CAMBIAR MODO (solo si hay conexión disponible) */}
              {isPWA && modoForzadoOffline && isOnline && (
                <button
                  onClick={() => {
                    setModoForzadoOffline(false);
                    toast.success('🌐 Modo online reactivado', { duration: 3000 });
                  }}
                  className="mb-2 bg-white bg-opacity-20 hover:bg-opacity-30 px-3 py-1 rounded text-sm transition-colors"
                >
                  🌐 Activar Modo Online
                </button>
              )}
              
              <p className={interfaceState.showAsOffline ? 'text-orange-100' : 'text-blue-100'}>
                {new Date().toLocaleDateString('es-AR', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          </div>
        </div>

        {/* ✅ INFORMACIÓN PWA OFFLINE MEJORADA */}
        {isPWA && interfaceState.showAsOffline && catalogStats && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-orange-800 mb-2 flex items-center gap-2">
              📦 Catálogo Offline Disponible
              {modoForzadoOffline && (
                <span className="bg-orange-200 text-orange-800 px-2 py-1 rounded text-xs font-medium">
                  MODO ESTABLE
                </span>
              )}
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-orange-600 font-medium">Clientes:</span>
                <div className="text-orange-800 font-bold">{catalogStats.clientes}</div>
              </div>
              <div>
                <span className="text-orange-600 font-medium">Productos:</span>
                <div className="text-orange-800 font-bold">{catalogStats.productos}</div>
              </div>
              <div>
                <span className="text-orange-600 font-medium">Pendientes:</span>
                <div className="text-orange-800 font-bold">{catalogStats.pedidosPendientes}</div>
              </div>
              <div>
                <span className="text-orange-600 font-medium">Storage:</span>
                <div className="text-orange-800 font-bold">{catalogStats.storageUsed?.mb}MB</div>
              </div>
            </div>
            
            {catalogStats.pedidosPendientes > 0 && (
              <div className="mt-2 text-sm text-orange-700">
                💡 Los pedidos pendientes se sincronizarán automáticamente cuando vayas al menú
              </div>
            )}
            
            {modoForzadoOffline && (
              <div className="mt-2 text-sm text-orange-700">
                🔒 Modo offline estable activado - La interfaz no cambiará automáticamente aunque haya conexión
              </div>
            )}
          </div>
        )}
        
        {/* ✅ SELECTORES HÍBRIDOS (funcionan online/offline automáticamente) */}
        <div className="flex flex-col md:flex-row gap-6">
          <ClienteSelectorHybrid />
          <ProductoSelectorHybrid />
        </div>

        {/* ✅ CARRITO HÍBRIDO */}
        <ProductosCarrito />

        {/* ✅ OBSERVACIONES */}
        <ObservacionesPedido />
        
        {/* ✅ RESUMEN Y BOTONES MEJORADOS */}
        <div className={`mt-6 p-4 rounded-lg border ${
          interfaceState.showAsOffline ? 'bg-orange-50 border-orange-200' : 'bg-gray-50 border-gray-200'
        }`}>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
            <div className="text-lg font-semibold text-gray-800">
              <p>Total de productos: <span className="text-blue-600">{totalProductos}</span></p>
              <p>Total del pedido: <span className="text-green-600">${total.toFixed(2)}</span></p>
              <p className="text-sm text-gray-600 mt-1">
                Modo: <span className={`font-medium ${
                  interfaceState.showAsOffline ? 'text-orange-600' : 'text-blue-600'
                }`}>
                  {modoForzadoOffline 
                    ? '🔒 PWA Offline Estable (se sincronizará en menú)'
                    : interfaceState.showAsOffline 
                      ? '📱 PWA Offline (se sincronizará)'
                      : isPWA
                        ? '🌐 PWA Online (directo al servidor)'
                        : '🌐 Web Online'
                  }
                </span>
              </p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row justify-end gap-4">
            <button 
              className={`px-6 py-3 rounded text-white font-semibold transition-colors ${
                loading 
                  ? 'bg-gray-500 cursor-not-allowed' 
                  : interfaceState.showAsOffline
                    ? 'bg-orange-600 hover:bg-orange-700'
                    : 'bg-green-600 hover:bg-green-700'
              }`}
              onClick={handleConfirmarPedido}
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {interfaceState.showAsOffline ? 'Guardando offline...' : 'Procesando...'}
                </div>
              ) : (
                interfaceState.showAsOffline 
                  ? '📱 Guardar Pedido Offline'
                  : 'Confirmar Pedido'
              )}
            </button>
            
            <button 
              className={`px-6 py-3 rounded text-white font-semibold transition-colors ${
                loadingConexion 
                  ? 'bg-gray-500 cursor-not-allowed'
                  : 'bg-red-600 hover:bg-red-700'
              }`}
              onClick={handleConfirmarSalida}
              disabled={loading || loadingConexion}
            >
              {loadingConexion ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Verificando conexión...
                </div>
              ) : (
                'Volver al Inicio'
              )}
            </button>
          </div>
        </div>

        {/* ✅ INFORMACIÓN ADICIONAL MEJORADA */}
        {isPWA && interfaceState.showAsOffline && (
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h4 className="font-semibold text-yellow-800 mb-2">
              ℹ️ Información del Modo Offline{modoForzadoOffline ? ' Estable' : ''}
            </h4>
            <div className="text-yellow-700 text-sm space-y-1">
              <p>• Los pedidos se guardan en tu dispositivo automáticamente</p>
              <p>• Puedes registrar múltiples pedidos sin conexión</p>
              <p>• Tus datos se guardan automáticamente cada minuto</p>
              {modoForzadoOffline ? (
                <>
                  <p>• <strong>Modo estable:</strong> La interfaz no cambiará aunque se reconecte</p>
                  <p>• Los pedidos se sincronizarán cuando vayas al menú principal</p>
                </>
              ) : (
                <p>• Al reconectarte, todos los pedidos se sincronizarán automáticamente</p>
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* ✅ MODAL DE CONFIRMACIÓN UNIVERSAL */}
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
        isOnline={!interfaceState.showAsOffline}
      />

      <ModalConfirmacionSalidaPedidos
        mostrar={mostrarConfirmacionSalida}
        onConfirmar={handleSalir}
        onCancelar={() => setMostrarConfirmacionSalida(false)}
      />

      {/* ✅ NUEVO MODAL DE RECONEXIÓN */}
      <ModalConexionRestablecida
        mostrar={mostrarModalReconexion}
        onIrAMenu={handleIrAMenuDesdeModal}
        onSeguirRegistrando={handleSeguirRegistrandoDesdeModal}
        loading={loadingConexion}
      />
    </div>
  );
}

export default function RegistrarPedido() {
  return (
    <PedidosProvider>
      <RegistrarPedidoContent />
    </PedidosProvider>
  );
}