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

// ✅ MODAL DE RECONEXIÓN
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
  
  // ✅ ESTADOS DE CONTROL ESTRICTO
  const [mostrarModalReconexion, setMostrarModalReconexion] = useState(false);
  const [modoForzadoOffline, setModoForzadoOffline] = useState(false);
  const [loadingConexion, setLoadingConexion] = useState(false);
  const [interfazLocked, setInterfazLocked] = useState(false); // Nueva: evitar cambios automáticos

  // ✅ CONNECTION MANAGER - Solo para estado, NO para cambios automáticos
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

  // ✅ DETECTAR MODO INICIAL Y LOCKEAR INTERFAZ
  useEffect(() => {
    if (isPWA && !isOnline) {
      console.log('📱 [RegistrarPedido] Página cargada OFFLINE - Activando modo offline estable PERMANENTE');
      setModoForzadoOffline(true);
      setInterfazLocked(true); // ✅ NUEVO: Bloquear cambios automáticos
    } else if (isPWA && isOnline) {
      console.log('🌐 [RegistrarPedido] Página cargada ONLINE - Modo online inicial');
      setModoForzadoOffline(false);
      setInterfazLocked(false);
    }
  }, []); // ✅ Solo ejecutar UNA VEZ al cargar

  // ✅ CARGAR ESTADÍSTICAS PWA
  useEffect(() => {
    if (isPWA) {
      const stats = offlineManager.getStorageStats();
      setCatalogStats(stats);
      console.log('📊 [RegistrarPedido] Estadísticas del catálogo:', stats);
    }
  }, [isPWA]);

  // ✅ MANEJO DE EVENTOS DE CONECTIVIDAD - SOLO LOGGING, NUNCA CAMBIOS AUTOMÁTICOS
  useEffect(() => {
    if (!eventType) return;

    // ✅ SI LA INTERFAZ ESTÁ BLOQUEADA, NO HACER NADA
    if (interfazLocked) {
      console.log(`🔒 [RegistrarPedido] Evento ${eventType} ignorado - Interfaz bloqueada en modo estable`);
      return;
    }

    switch (eventType) {
      case 'connection_lost':
        console.log('📴 [RegistrarPedido] Conexión perdida detectada - SOLO LOGGING, SIN CAMBIOS');
        // ✅ SOLO actualizar estadísticas
        if (isPWA) {
          const stats = offlineManager.getStorageStats();
          setCatalogStats(stats);
        }
        break;
        
      case 'connection_restored':
        console.log('🌐 [RegistrarPedido] Conexión restaurada detectada - SOLO LOGGING, SIN CAMBIOS');
        // ✅ SOLO actualizar estadísticas
        if (isPWA) {
          const stats = offlineManager.getStorageStats();
          setCatalogStats(stats);
        }
        break;
        
      default:
        break;
    }
  }, [eventType, isPWA, interfazLocked]);

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

  // ✅ REGISTRAR PEDIDO CON VERIFICACIÓN POST-GUARDADO
  const handleRegistrarPedido = async () => {
    const datosPedido = getDatosPedido();
    const datosCompletos = {
      ...datosPedido,
      empleado: user
    };
    
    console.log(`🔄 [RegistrarPedido] Registrando pedido - Modo forzado offline: ${modoForzadoOffline}`);
    
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
      
      // ✅ LÓGICA PRINCIPAL: Verificar conexión solo después de guardar offline
      if (resultado.offline || modoForzadoOffline) {
        console.log('📱 [RegistrarPedido] Pedido guardado offline - Verificando conexión disponible...');
        
        // ✅ Verificar conexión bajo demanda
        const hayConexion = await checkOnDemand();
        
        if (hayConexion && !modoForzadoOffline) {
          // ✅ HAY CONEXIÓN pero no estamos en modo forzado: Mostrar modal
          console.log('🌐 [RegistrarPedido] Conexión disponible - Mostrando modal de reconexión');
          setMostrarModalReconexion(true);
        } else if (hayConexion && modoForzadoOffline) {
          // ✅ HAY CONEXIÓN pero estamos en modo forzado: Solo toast offline
          console.log('🔒 [RegistrarPedido] Conexión disponible pero modo forzado - Solo toast offline');
          toast.success('📱 Pedido guardado offline - Se subirá cuando vayas al menú', {
            duration: 4000,
            icon: '📱'
          });
        } else {
          // ✅ SIN CONEXIÓN: Toast normal de offline
          console.log('📴 [RegistrarPedido] Sin conexión - Toast offline normal');
          toast.success('📱 Pedido guardado offline - Se subirá cuando haya conexión', {
            duration: 4000,
            icon: '📱'
          });
        }
      } else {
        // ✅ PEDIDO ONLINE: Toast normal
        console.log('🌐 [RegistrarPedido] Pedido registrado online');
        toast.success('✅ Pedido registrado exitosamente');
      }
    } else {
      console.error('❌ [RegistrarPedido] Error registrando pedido:', resultado.error);
    }
  };

  // ✅ MANEJAR "IR A MENÚ" DEL MODAL DE RECONEXIÓN
  const handleIrAMenuDesdeModal = async () => {
    setLoadingConexion(true);
    
    console.log('🔍 [RegistrarPedido] Verificando conexión para ir al menú desde modal...');
    
    // Verificar conexión antes de ir al menú
    const hayConexion = await checkOnDemand();
    
    if (hayConexion) {
      console.log('🌐 [RegistrarPedido] Conexión confirmada desde modal - Redirigiendo al menú');
      setMostrarModalReconexion(false);
      
      // Guardar formulario antes de salir
      if (cliente || productos.length > 0 || observaciones.trim()) {
        saveForm();
      }
      
      window.location.href = '/inicio';
    } else {
      console.log('📴 [RegistrarPedido] Sin conexión desde modal - No se puede ir al menú');
      setLoadingConexion(false);
      setMostrarModalReconexion(false);
      
      toast.error('📴 Sin conexión - No se puede acceder al menú', {
        duration: 3000,
        icon: '📴'
      });
    }
  };

  // ✅ MANEJAR "SEGUIR REGISTRANDO" DEL MODAL DE RECONEXIÓN
  const handleSeguirRegistrandoDesdeModal = () => {
    console.log('📱 [RegistrarPedido] Usuario eligió seguir registrando - Activando modo offline estable');
    setModoForzadoOffline(true);
    setInterfazLocked(true); // ✅ BLOQUEAR interfaz automáticamente
    setMostrarModalReconexion(false);
    
    toast.success('📱 Modo offline estable activado - Sin interrupciones automáticas', {
      duration: 4000,
      icon: '🔒'
    });
  };

  // ✅ MANEJAR "VOLVER AL INICIO" CON VERIFICACIÓN
  const handleConfirmarSalida = () => {
    if (cliente || productos.length > 0 || observaciones.trim()) {
      setMostrarConfirmacionSalida(true);
    } else {
      handleSalirConVerificacion();
    }
  };

  // ✅ SALIR CON VERIFICACIÓN DE CONEXIÓN
  const handleSalirConVerificacion = async () => {
    console.log('🚪 [RegistrarPedido] Intentando salir - Verificando conexión...');
    
    setLoadingConexion(true);
    
    // Verificar conexión antes de salir
    const hayConexion = await checkOnDemand();
    
    if (hayConexion) {
      console.log('🌐 [RegistrarPedido] Conexión confirmada para salir - Redirigiendo al menú');
      
      // Guardar formulario antes de salir
      if (cliente || productos.length > 0 || observaciones.trim()) {
        saveForm();
      }
      
      window.location.href = '/inicio';
    } else {
      console.log('📴 [RegistrarPedido] Sin conexión para salir - Manteniendo en formulario offline');
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

  // ✅ DETERMINAR ESTADO DE INTERFAZ (con bloqueo)
  const getInterfaceState = () => {
    if (modoForzadoOffline || interfazLocked) {
      return {
        isOffline: true,
        showAsOffline: true,
        canGoOnline: false,
        locked: true
      };
    }
    
    return {
      isOffline: !isOnline,
      showAsOffline: !isOnline,
      canGoOnline: isOnline,
      locked: false
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
      return '🔒 NUEVO PEDIDO (MODO OFFLINE ESTABLE)';
    }
    
    return interfaceState.showAsOffline 
      ? '📱 NUEVO PEDIDO (OFFLINE)'
      : '🌐 NUEVO PEDIDO (ONLINE)';
  };

  const getHeaderSubtitle = () => {
    if (!isPWA) return 'Sistema de gestión de pedidos';
    
    if (modoForzadoOffline) {
      return 'Modo offline estable - Sin interrupciones por reconexión automática';
    }
    
    return interfaceState.showAsOffline
      ? 'Sistema independiente para registro sin conexión'
      : 'Sistema de gestión de pedidos';
  };

  return (
    <div className={`flex flex-col items-center justify-center min-h-screen ${getPageTheme()} p-4`}>
      <Head>
        <title>VERTIMAR | REGISTRAR PEDIDO</title>
        <meta name="description" content="Sistema ultra estable de registro de pedidos online/offline" />
      </Head>
      
      <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-6xl">
        
        {/* ✅ HEADER ULTRA ESTABLE */}
        <div className={`bg-gradient-to-r ${getHeaderTheme()} text-white rounded-lg p-6 mb-6`}>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold mb-2">
                {getHeaderTitle()}
              </h1>
              <p className={interfaceState.showAsOffline ? 'text-orange-100' : 'text-blue-100'}>
                {getHeaderSubtitle()}
              </p>
              
              {/* ✅ INDICADOR DE ESTADO ULTRA DETALLADO */}
              {isPWA && (
                <div className="flex items-center gap-2 mt-2">
                  <div className={`w-3 h-3 rounded-full ${
                    interfaceState.showAsOffline ? 'bg-orange-300 animate-pulse' : 'bg-green-300 animate-pulse'
                  }`}></div>
                  <span className={`text-sm font-medium ${
                    interfaceState.showAsOffline ? 'text-orange-200' : 'text-green-200'
                  }`}>
                    {modoForzadoOffline 
                      ? '🔒 Modo offline estable - Bloqueado contra cambios automáticos'
                      : interfaceState.showAsOffline 
                        ? '📴 Sin conexión - Guardado local'
                        : '🌐 Conectado - Guardado directo'
                    }
                  </span>
                </div>
              )}
            </div>
            
            <div className="mt-4 md:mt-0 text-right">
              {/* ✅ BOTÓN PARA DESBLOQUEAR MODO (solo si hay conexión disponible) */}
              {isPWA && modoForzadoOffline && isOnline && (
                <button
                  onClick={() => {
                    console.log('🔓 [RegistrarPedido] Usuario desbloqueó modo offline manualmente');
                    setModoForzadoOffline(false);
                    setInterfazLocked(false);
                    toast.success('🌐 Modo online reactivado manualmente', { duration: 3000 });
                  }}
                  className="mb-2 bg-white bg-opacity-20 hover:bg-opacity-30 px-3 py-1 rounded text-sm transition-colors"
                >
                  🔓 Desbloquear Modo Online
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

        {/* ✅ INFORMACIÓN PWA OFFLINE ULTRA DETALLADA */}
        {isPWA && interfaceState.showAsOffline && catalogStats && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-orange-800 mb-2 flex items-center gap-2">
              📦 Catálogo Offline Disponible
              {modoForzadoOffline && (
                <span className="bg-orange-200 text-orange-800 px-2 py-1 rounded text-xs font-medium">
                  🔒 MODO ESTABLE ACTIVO
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
              <div className="mt-2 text-sm text-orange-700 font-medium bg-orange-100 p-2 rounded">
                🔒 <strong>Modo estable activado:</strong> La interfaz permanecerá offline aunque se recupere la conexión. 
                Los cambios automáticos están bloqueados para garantizar estabilidad total.
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
        
        {/* ✅ RESUMEN Y BOTONES ULTRA ESTABLES */}
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
                    ? '🔒 PWA Offline Estable Bloqueado (se sincronizará en menú)'
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

        {/* ✅ INFORMACIÓN ADICIONAL ULTRA DETALLADA */}
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
                  <p>• <strong>🔒 Modo estable activado:</strong> La interfaz no cambiará automáticamente aunque haya conexión</p>
                  <p>• <strong>Reconexiones ignoradas:</strong> Los cambios automáticos están completamente bloqueados</p>
                  <p>• <strong>Sincronización:</strong> Los pedidos se sincronizarán cuando vayas al menú principal manualmente</p>
                  <p>• <strong>Control total:</strong> Solo tú decides cuándo cambiar al modo online usando el botón de desbloqueo</p>
                </>
              ) : (
                <p>• Al reconectarte, podrás elegir si continuar offline o ir al menú principal</p>
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

      {/* ✅ MODAL DE RECONEXIÓN ULTRA ESTABLE */}
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