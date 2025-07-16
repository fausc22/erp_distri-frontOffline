import { useState, useEffect } from 'react';
import Head from 'next/head';
import { toast } from 'react-hot-toast';
import useAuth from '../../hooks/useAuth';

import { PedidosProvider, usePedidosContext } from '../../context/PedidosContext';
import { usePedidosHybrid } from '../../hooks/pedidos/usePedidosHybrid';
import { useConnection } from '../../utils/ConnectionManager';
import { getAppMode, offlineManager } from '../../utils/offlineManager';
import { usePedidosFormPersistence } from '../../hooks/useFormPersistence';

// ✅ COMPONENTES HÍBRIDOS (ya configurados para funcionar online/offline)
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
    setObservaciones,
    addMultipleProductos
  } = usePedidosContext();
 
  const { registrarPedido, loading } = usePedidosHybrid();
  const { user } = useAuth();

  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
  const [mostrarConfirmacionSalida, setMostrarConfirmacionSalida] = useState(false);
  const [catalogStats, setCatalogStats] = useState(null);

  // ✅ CONNECTION MANAGER (solo para indicadores, no redirecciones)
  const { isOnline, eventType } = useConnection();
  const isPWA = getAppMode() === 'pwa';

  // ✅ FORM PERSISTENCE UNIVERSAL
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

  // ✅ CARGAR ESTADÍSTICAS PWA
  useEffect(() => {
    if (isPWA) {
      const stats = offlineManager.getStorageStats();
      setCatalogStats(stats);
      console.log('📊 Estadísticas del catálogo:', stats);
    }
  }, [isPWA]);

  // ✅ MANEJO DE EVENTOS DE CONECTIVIDAD (solo UI)
  useEffect(() => {
    if (!eventType) return;

    switch (eventType) {
      case 'connection_lost':
        console.log('📴 Modo offline activado en RegistrarPedido');
        // Solo actualizar estadísticas
        if (isPWA) {
          const stats = offlineManager.getStorageStats();
          setCatalogStats(stats);
        }
        break;
        
      case 'connection_restored':
        console.log('🌐 Modo online activado en RegistrarPedido');
        // Solo actualizar estadísticas
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

  const handleRegistrarPedido = async () => {
    const datosPedido = getDatosPedido();
    const datosCompletos = {
      ...datosPedido,
      empleado: user
    };
    
    console.log(`🔄 Registrando pedido en modo ${isOnline ? 'online' : 'offline'}...`);
    
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
      
      if (resultado.offline) {
        toast.success('📱 Pedido guardado offline - Se subirá cuando haya conexión', {
          duration: 4000,
          icon: '📱'
        });
      } else {
        toast.success('✅ Pedido registrado exitosamente');
      }
    } else {
      console.error('❌ Error registrando pedido:', resultado.error);
    }
  };

  const handleConfirmarSalida = () => {
    if (cliente || productos.length > 0 || observaciones.trim()) {
      setMostrarConfirmacionSalida(true);
    } else {
      window.location.href = '/inicio';
    }
  };

  const handleSalir = () => {
    // Guardar formulario antes de salir
    if (cliente || productos.length > 0 || observaciones.trim()) {
      saveForm();
    }
    window.location.href = '/inicio';
  };

  // ✅ OBTENER TEMA SEGÚN CONECTIVIDAD
  const getPageTheme = () => {
    if (!isPWA) return 'bg-gray-100'; // Web normal
    return isOnline ? 'bg-gray-100' : 'bg-orange-50'; // PWA: gris online, naranja offline
  };

  const getHeaderTheme = () => {
    if (!isPWA) return 'from-blue-500 to-blue-600'; // Web normal
    return isOnline 
      ? 'from-blue-500 to-blue-600'    // PWA online: azul
      : 'from-orange-500 to-orange-600'; // PWA offline: naranja
  };

  const getHeaderTitle = () => {
    if (!isPWA) return 'NUEVO PEDIDO';
    return isOnline 
      ? '🌐 NUEVO PEDIDO (ONLINE)'
      : '📱 NUEVO PEDIDO (OFFLINE)';
  };

  return (
    <div className={`flex flex-col items-center justify-center min-h-screen ${getPageTheme()} p-4`}>
      <Head>
        <title>VERTIMAR | REGISTRAR PEDIDO</title>
        <meta name="description" content="Sistema universal de registro de pedidos online/offline" />
      </Head>
      
      <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-6xl">
        
        {/* ✅ HEADER UNIVERSAL */}
        <div className={`bg-gradient-to-r ${getHeaderTheme()} text-white rounded-lg p-6 mb-6`}>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold mb-2">
                {getHeaderTitle()}
              </h1>
              <p className={isPWA && !isOnline ? 'text-orange-100' : 'text-blue-100'}>
                {isPWA && !isOnline 
                  ? 'Sistema independiente para registro sin conexión'
                  : 'Sistema de gestión de pedidos'
                }
              </p>
              
              {/* ✅ INDICADOR DE ESTADO PWA */}
              {isPWA && (
                <div className="flex items-center gap-2 mt-2">
                  <div className={`w-3 h-3 rounded-full ${
                    isOnline ? 'bg-green-300 animate-pulse' : 'bg-orange-300 animate-pulse'
                  }`}></div>
                  <span className={`text-sm font-medium ${
                    isOnline ? 'text-green-200' : 'text-orange-200'
                  }`}>
                    {isOnline ? 'Conectado - Guardado directo' : 'Sin conexión - Guardado local'}
                  </span>
                </div>
              )}
            </div>
            
            <div className="mt-4 md:mt-0 text-right">
              <p className={isPWA && !isOnline ? 'text-orange-100' : 'text-blue-100'}>
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

        {/* ✅ INFORMACIÓN PWA OFFLINE */}
        {isPWA && !isOnline && catalogStats && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-orange-800 mb-2 flex items-center gap-2">
              📦 Catálogo Offline Disponible
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
                💡 Los pedidos pendientes se sincronizarán automáticamente cuando reconectes
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
        
        {/* ✅ RESUMEN Y BOTONES UNIVERSALES */}
        <div className={`mt-6 p-4 rounded-lg border ${
          isPWA && !isOnline ? 'bg-orange-50 border-orange-200' : 'bg-gray-50 border-gray-200'
        }`}>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
            <div className="text-lg font-semibold text-gray-800">
              <p>Total de productos: <span className="text-blue-600">{totalProductos}</span></p>
              <p>Total del pedido: <span className="text-green-600">${total.toFixed(2)}</span></p>
              <p className="text-sm text-gray-600 mt-1">
                Modo: <span className={`font-medium ${
                  isPWA 
                    ? isOnline 
                      ? 'text-blue-600' 
                      : 'text-orange-600'
                    : 'text-blue-600'
                }`}>
                  {isPWA 
                    ? isOnline 
                      ? '🌐 PWA Online (directo al servidor)' 
                      : '📱 PWA Offline (se sincronizará)'
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
                  : isPWA && !isOnline
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
                  {isPWA && !isOnline ? 'Guardando offline...' : 'Procesando...'}
                </div>
              ) : (
                isPWA && !isOnline 
                  ? '📱 Guardar Pedido Offline'
                  : 'Confirmar Pedido'
              )}
            </button>
            
            <button 
              className="bg-red-600 hover:bg-red-700 px-6 py-3 rounded text-white font-semibold transition-colors"
              onClick={handleConfirmarSalida}
              disabled={loading}
            >
              Volver al Inicio
            </button>
          </div>
        </div>

        {/* ✅ INFORMACIÓN ADICIONAL PARA PWA OFFLINE */}
        {isPWA && !isOnline && (
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h4 className="font-semibold text-yellow-800 mb-2">ℹ️ Información del Modo Offline</h4>
            <div className="text-yellow-700 text-sm space-y-1">
              <p>• Los pedidos se guardan en tu dispositivo automáticamente</p>
              <p>• Puedes registrar múltiples pedidos sin conexión</p>
              <p>• Al reconectarte, todos los pedidos se sincronizarán automáticamente</p>
              <p>• El catálogo completo está disponible offline</p>
              <p>• Tus datos se guardan automáticamente cada minuto</p>
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
        isOnline={isOnline}
      />

      <ModalConfirmacionSalidaPedidos
        mostrar={mostrarConfirmacionSalida}
        onConfirmar={handleSalir}
        onCancelar={() => setMostrarConfirmacionSalida(false)}
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
