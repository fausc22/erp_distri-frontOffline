// pages/offline.jsx - Página dedicada para modo offline
import { useState, useEffect } from 'react';
import Head from 'next/head';
import { toast } from 'react-hot-toast';
import useAuth from '../hooks/useAuth';

import { PedidosProvider, usePedidosContext } from '../context/PedidosContext';
import { usePedidosHybrid } from '../hooks/pedidos/usePedidosHybrid';
import { getAppMode, offlineManager } from '../utils/offlineManager';
import { useConnection } from '../utils/ConnectionManager';
import { usePedidosFormPersistence } from '../hooks/useFormPersistence';

import ClienteSelectorHybrid from '../components/pedidos/SelectorClientesHybrid';
import ProductoSelectorHybrid from '../components/pedidos/SelectorProductosHybrid';
import ProductosCarrito from '../components/pedidos/ProductosCarrito';
import ObservacionesPedido from '../components/pedidos/ObservacionesPedido';
import { 
  ModalConfirmacionPedido 
} from '../components/pedidos/ModalesConfirmacion';

function OfflinePageContent() {
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
  const [catalogStats, setCatalogStats] = useState(null);
  const [showReconnectButton, setShowReconnectButton] = useState(false);

  // ✅ CONNECTION MANAGER - Solo para detectar conexión, NO para redirecciones
  const { isOnline, eventType } = useConnection();

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

  // ✅ CARGAR ESTADÍSTICAS DEL CATÁLOGO OFFLINE
  useEffect(() => {
    const stats = offlineManager.getStorageStats();
    setCatalogStats(stats);
    console.log('📊 Estadísticas del catálogo offline en página dedicada:', stats);
  }, []);

  // ✅ DETECTAR CUANDO SE RECUPERA CONEXIÓN - MOSTRAR BOTÓN
  useEffect(() => {
    if (isOnline && !showReconnectButton) {
      setShowReconnectButton(true);
      toast.success('🌐 Conexión detectada - Puedes reconectarte cuando quieras', {
        duration: 4000,
        icon: '🔄'
      });
    }
  }, [isOnline, showReconnectButton]);

  // ✅ AUTO-RESTORE DE BACKUP SI EXISTE
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
    
    console.log('🔄 Registrando pedido en modo offline...');
    
    const resultado = await registrarPedido(datosCompletos);
    
    if (resultado.success) {
      clearSavedForm();
      clearPedido();
      setMostrarConfirmacion(false);
      
      // Actualizar estadísticas
      const newStats = offlineManager.getStorageStats();
      setCatalogStats(newStats);
      
      toast.success('📱 Pedido guardado offline - Se subirá cuando reconectes', {
        duration: 4000,
        icon: '📱'
      });
    } else {
      console.error('❌ Error registrando pedido offline:', resultado.error);
    }
  };

  // ✅ FUNCIÓN PARA RECONECTAR
  const handleReconnect = () => {
    console.log('🔄 Reconectando al sistema completo...');
    
    // Guardar formulario actual antes de salir
    if (cliente || productos.length > 0 || observaciones.trim()) {
      saveForm();
    }
    
    // Redirigir al sistema completo
    window.location.href = '/inicio';
  };

  return (
    <div className="min-h-screen bg-orange-50">
      <Head>
        <title>VERTIMAR | MODO OFFLINE</title>
        <meta name="description" content="Sistema de registro de pedidos offline" />
      </Head>
      
      {/* ✅ BOTÓN DE RECONEXIÓN PROMINENTE */}
      {showReconnectButton && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-green-600 text-white p-4 shadow-lg">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-green-300 rounded-full animate-pulse"></div>
              <div>
                <span className="font-semibold">🌐 Conexión restaurada</span>
                <div className="text-sm text-green-100">
                  Puedes volver al sistema completo cuando quieras
                </div>
              </div>
            </div>
            <button
              onClick={handleReconnect}
              className="bg-white text-green-600 px-6 py-3 rounded-lg font-bold hover:bg-green-50 transition-colors"
            >
              RECONECTAR AL SISTEMA
            </button>
          </div>
        </div>
      )}
      
      <div className={`flex flex-col items-center justify-center min-h-screen p-4 ${showReconnectButton ? 'pt-24' : ''}`}>
        <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-6xl border-l-4 border-orange-500">
          
          {/* ✅ HEADER DE MODO OFFLINE */}
          <div className="bg-orange-500 text-white rounded-lg p-6 mb-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold mb-2 flex items-center gap-3">
                  📱 MODO OFFLINE - REGISTRO DE PEDIDOS
                </h1>
                <p className="text-orange-100">
                  Sistema independiente para registro sin conexión
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <div className="w-3 h-3 bg-orange-300 rounded-full animate-pulse"></div>
                  <span className="text-orange-100 text-sm font-medium">
                    Trabajando offline - Pedidos se guardan localmente
                  </span>
                </div>
              </div>
              
              <div className="mt-4 md:mt-0 text-right">
                <p className="text-orange-100 text-sm">
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

          {/* ✅ INFORMACIÓN DEL CATÁLOGO OFFLINE */}
          {catalogStats && (
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
          
          {/* ✅ SELECTORES DE CLIENTE Y PRODUCTO */}
          <div className="flex flex-col md:flex-row gap-6">
            <ClienteSelectorHybrid />
            <ProductoSelectorHybrid />
          </div>

          {/* ✅ CARRITO DE PRODUCTOS */}
          <ProductosCarrito />

          {/* ✅ OBSERVACIONES */}
          <ObservacionesPedido />
          
          {/* ✅ RESUMEN Y BOTONES */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
              <div className="text-lg font-semibold text-gray-800">
                <p>Total de productos: <span className="text-blue-600">{totalProductos}</span></p>
                <p>Total del pedido: <span className="text-green-600">${total.toFixed(2)}</span></p>
                <p className="text-sm text-gray-600 mt-1">
                  Modo: <span className="font-medium text-orange-600">
                    📱 Offline (se sincronizará al reconectar)
                  </span>
                </p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row justify-end gap-4">
              <button 
                className={`px-6 py-3 rounded text-white font-semibold transition-colors ${
                  loading 
                    ? 'bg-gray-500 cursor-not-allowed' 
                    : 'bg-orange-600 hover:bg-orange-700'
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
                    Guardando offline...
                  </div>
                ) : (
                  '📱 Guardar Pedido Offline'
                )}
              </button>
            </div>
          </div>

          {/* ✅ INFORMACIÓN ADICIONAL */}
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
        </div>
        
        {/* ✅ MODAL DE CONFIRMACIÓN OFFLINE */}
        <ModalConfirmacionPedido
          mostrar={mostrarConfirmacion}
          cliente={cliente}
          totalProductos={totalProductos}
          total={total}
          observaciones={observaciones}
          onConfirmar={handleRegistrarPedido}
          onCancelar={() => setMostrarConfirmacion(false)}
          loading={loading}
          isPWA={true}
          isOnline={false}
        />
      </div>
    </div>
  );
}

export default function OfflinePage() {
  return (
    <PedidosProvider>
      <OfflinePageContent />
    </PedidosProvider>
  );
}

// ✅ Sin layout para esta página
OfflinePage.getLayout = (page) => page;