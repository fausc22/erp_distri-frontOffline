// pages/offline-pedidos.jsx - Página dedicada para registrar pedidos offline
import { useState, useEffect } from 'react';
import Head from 'next/head';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/router';
import useAuth from '../hooks/useAuth';

import { PedidosProvider, usePedidosContext } from '../context/PedidosContext';
import { usePedidosHybrid } from '../hooks/pedidos/usePedidosHybrid';
import { getAppMode, offlineManager } from '../utils/offlineManager';

import ClienteSelectorHybrid from '../components/pedidos/SelectorClientesHybrid';
import ProductoSelectorHybrid from '../components/pedidos/SelectorProductosHybrid';
import ProductosCarrito from '../components/pedidos/ProductosCarrito';
import ObservacionesPedido from '../components/pedidos/ObservacionesPedido';
import { 
  ModalConfirmacionPedido 
} from '../components/pedidos/ModalesConfirmacion';

function OfflinePedidosContent() {
  const { 
    cliente, 
    productos, 
    observaciones,
    total, 
    totalProductos,
    clearPedido,
    getDatosPedido 
  } = usePedidosContext();
 
  const { registrarPedido, loading } = usePedidosHybrid();
  const { user } = useAuth();
  const router = useRouter();

  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
  const [isOnline, setIsOnline] = useState(false);
  const [catalogoStats, setCatalogoStats] = useState(null);

  // ✅ MONITOREAR ESTADO DE CONEXIÓN
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    setIsOnline(navigator.onLine);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // ✅ CARGAR ESTADÍSTICAS DEL CATÁLOGO OFFLINE
  useEffect(() => {
    const stats = offlineManager.getStorageStats();
    setCatalogoStats(stats);
  }, []);

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
    
    console.log('📱 Registrando pedido en modo offline...');
    
    const resultado = await registrarPedido(datosCompletos);
    
    if (resultado.success) {
      clearPedido();
      setMostrarConfirmacion(false);
      
      if (resultado.offline) {
        toast.success('📱 Pedido guardado offline - Se subirá cuando haya conexión');
      } else {
        toast.success('✅ Pedido registrado exitosamente');
      }
    }
  };

  const handleVolverAlMenu = () => {
    if (cliente || productos.length > 0 || observaciones.trim()) {
      if (confirm('¿Está seguro que desea salir? Se perderán los datos del pedido actual.')) {
        router.push('/');
      }
    } else {
      router.push('/');
    }
  };

  const handleConectarseOnline = () => {
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <Head>
        <title>VERTIMAR | PEDIDOS OFFLINE</title>
        <meta name="description" content="Registro de pedidos sin conexión" />
      </Head>
      
      <div className="max-w-6xl mx-auto">
        {/* ✅ HEADER OFFLINE ESPECIAL */}
        <div className="bg-orange-600 text-white rounded-lg p-6 mb-6 border-l-4 border-orange-400">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center">
            <div className="mb-4 lg:mb-0">
              <h1 className="text-2xl font-bold mb-2">
                📱 MODO OFFLINE - SOLO PEDIDOS
              </h1>
              <p className="text-orange-100">
                Sin conexión a internet. Los pedidos se guardarán localmente.
              </p>
            </div>
            
            {/* ✅ INDICADORES DE ESTADO */}
            <div className="flex flex-col items-start lg:items-end space-y-2">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-green-400' : 'bg-red-400'}`}></div>
                <span className="font-medium">
                  {isOnline ? 'ONLINE (Se puede conectar)' : 'OFFLINE'}
                </span>
              </div>
              
              {catalogoStats && (
                <div className="text-orange-100 text-sm">
                  📦 Catálogo: {catalogoStats.clientes} clientes, {catalogoStats.productos} productos
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ✅ BOTONES DE ACCIÓN SUPERIOR */}
        <div className="flex flex-wrap gap-3 mb-6">
          <button 
            onClick={handleVolverAlMenu}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded font-medium transition-colors"
          >
            ← Volver al Menú
          </button>
          
          {isOnline && (
            <button 
              onClick={handleConectarseOnline}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded font-medium transition-colors"
            >
              🌐 Conectarse Online
            </button>
          )}
        </div>

        {/* ✅ CONTENIDO PRINCIPAL - IGUAL QUE REGISTRAR PEDIDO NORMAL */}
        <div className="bg-white shadow-lg rounded-lg p-6">
          <div className="flex flex-col md:flex-row gap-6 mb-6">
            <ClienteSelectorHybrid />
            <ProductoSelectorHybrid />
          </div>

          <ProductosCarrito />
          
          <ObservacionesPedido />
          
          {/* ✅ RESUMEN Y BOTONES */}
          <div className="mt-6 p-4 bg-orange-50 rounded-lg border border-orange-200">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
              <div className="text-lg font-semibold text-gray-800">
                <p>Total de productos: <span className="text-blue-600">{totalProductos}</span></p>
                <p>Total del pedido: <span className="text-green-600">${total.toFixed(2)}</span></p>
                <p className="text-sm text-orange-700 mt-1">
                  📱 Se guardará offline hasta tener conexión
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
                    Guardando...
                  </div>
                ) : (
                  '📱 Guardar Pedido Offline'
                )}
              </button>
            </div>
          </div>
        </div>

        {/* ✅ INFORMACIÓN ADICIONAL OFFLINE */}
        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-semibold text-yellow-800 mb-2">ℹ️ Información del Modo Offline</h3>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• Los pedidos se guardan en tu dispositivo</li>
            <li>• Se enviarán automáticamente cuando recuperes la conexión</li>
            <li>• Puedes seguir trabajando sin internet</li>
            <li>• El stock se actualizará cuando se sincronicen los pedidos</li>
          </ul>
        </div>
      </div>
      
      {/* ✅ MODAL DE CONFIRMACIÓN ESPECÍFICO PARA OFFLINE */}
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
        isOnline={isOnline}
      />
    </div>
  );
}

export default function OfflinePedidos() {
  return (
    <PedidosProvider>
      <OfflinePedidosContent />
    </PedidosProvider>
  );
}

// ✅ NO USAR LAYOUT PARA ESTA PÁGINA (EXPERIENCIA FULLSCREEN)
OfflinePedidos.getLayout = (page) => page;