import { useState, useEffect } from 'react';
import Head from 'next/head';
import { toast } from 'react-hot-toast';
import useAuth from '../../hooks/useAuth';

import { PedidosProvider, usePedidosContext } from '../../context/PedidosContext';
import { usePedidosHybrid } from '../../hooks/pedidos/usePedidosHybrid';
import { getAppMode } from '../../utils/offlineManager';

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
    getDatosPedido 
  } = usePedidosContext();
 
  const { registrarPedido, loading, appMode, isPWA } = usePedidosHybrid();
  const { user } = useAuth();

  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
  const [mostrarConfirmacionSalida, setMostrarConfirmacionSalida] = useState(false);

  // ✅ ESTADO PARA TRACKING DE MODO OFFLINE
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    // Monitorear estado de conexión solo en PWA
    if (isPWA) {
      const handleOnline = () => setIsOnline(true);
      const handleOffline = () => setIsOnline(false);
      
      setIsOnline(navigator.onLine);
      
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
      
      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }
  }, [isPWA]);

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
      clearPedido();
      setMostrarConfirmacion(false);
      
      // ✅ MENSAJES DIFERENCIADOS POR MODO
      if (resultado.offline) {
        toast.success('📱 Pedido guardado offline - Se subirá cuando haya conexión');
      } else {
        toast.success('✅ Pedido registrado exitosamente');
      }
    } else {
      // El error ya se muestra en el hook
      console.error('❌ Error registrando pedido:', resultado.error);
    }
  };

  const handleConfirmarSalida = () => {
    if (cliente || productos.length > 0 || observaciones.trim()) {
      setMostrarConfirmacionSalida(true);
    } else {
      window.location.href = '/';
    }
  };

  const handleSalir = () => {
    window.location.href = '/';
  };

  // ✅ FUNCIÓN PARA OBTENER TÍTULO DINÁMICO
  const getTitulo = () => {
    if (isPWA) {
      return isOnline ? 'NUEVO PEDIDO - PWA (ONLINE)' : 'NUEVO PEDIDO - PWA (OFFLINE)';
    }
    return 'NUEVO PEDIDO';
  };

  // ✅ FUNCIÓN PARA OBTENER CLASE DE ESTADO
  const getStatusClass = () => {
    if (!isPWA) return '';
    return isOnline ? 'border-l-4 border-green-500' : 'border-l-4 border-orange-500';
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <Head>
        <title>VERTIMAR | NUEVO PEDIDO</title>
        <meta name="description" content="Sistema de registro de ventas" />
      </Head>
      
      <div className={`bg-white shadow-lg rounded-lg p-6 w-full max-w-6xl ${getStatusClass()}`}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
          <h1 className="text-2xl font-bold text-center text-gray-800">
            {getTitulo()}
          </h1>
          
          {/* ✅ INDICADOR DE ESTADO PARA PWA */}
          {isPWA && (
            <div className="flex items-center gap-2 mt-2 sm:mt-0">
              <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-green-500' : 'bg-orange-500'}`}></div>
              <span className={`text-sm font-medium ${isOnline ? 'text-green-700' : 'text-orange-700'}`}>
                {isOnline ? 'ONLINE' : 'OFFLINE'}
              </span>
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                📱 PWA
              </span>
            </div>
          )}
        </div>

        {/* ✅ MENSAJE INFORMATIVO PARA PWA OFFLINE */}
        {isPWA && !isOnline && (
          <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
            <div className="flex items-center">
              <div className="text-orange-600 mr-2">📡</div>
              <div className="text-sm text-orange-800">
                <strong>Modo Offline:</strong> Los pedidos se guardarán localmente y se subirán cuando se recupere la conexión.
              </div>
            </div>
          </div>
        )}
        
        <div className="flex flex-col md:flex-row gap-6">
          <ClienteSelectorHybrid />
          <ProductoSelectorHybrid />
        </div>

        <ProductosCarrito />

        <ObservacionesPedido />
        
        {/* Resumen y botones */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
            <div className="text-lg font-semibold text-gray-800">
              <p>Total de productos: <span className="text-blue-600">{totalProductos}</span></p>
              <p>Total del pedido: <span className="text-green-600">${total.toFixed(2)}</span></p>
              
              {/* ✅ INFORMACIÓN ADICIONAL PARA PWA */}
              {isPWA && (
                <p className="text-sm text-gray-600 mt-1">
                  Modo: <span className="font-medium">{isOnline ? 'Online (se guardará inmediatamente)' : 'Offline (se sincronizará después)'}</span>
                </p>
              )}
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row justify-end gap-4">
            <button 
              className={`px-6 py-3 rounded text-white font-semibold transition-colors ${
                loading
                  ? 'bg-gray-500 cursor-not-allowed'
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
                  {isPWA && !isOnline ? 'Guardando offline...' : 'Guardando...'}
                </div>
              ) : (
                <>
                  {isPWA && !isOnline ? '📱 Guardar Offline' : '✅ Confirmar Pedido'}
                </>
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

export default function RegistrarPedidoHybrid() {
  return (
    <PedidosProvider>
      <RegistrarPedidoContent />
    </PedidosProvider>
  );
}