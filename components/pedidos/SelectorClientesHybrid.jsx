// components/pedidos/SelectorClientesHybrid.jsx - Selector Híbrido PWA/Web
import { useState, useEffect } from 'react';
import { MdSearch, MdDeleteForever, MdKeyboardArrowDown, MdKeyboardArrowUp, MdWifi, MdWifiOff } from "react-icons/md";
import { usePedidosContext } from '../../context/PedidosContext';
import { useClienteSearchHybrid } from '../../hooks/useBusquedaHybrid';

function ModalClientes({ resultados, onSeleccionar, onCerrar, loading, isPWA, isOnline }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
      <div className="bg-white rounded-lg p-4 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-black">Seleccionar Cliente</h3>
          {/* ✅ INDICADOR DE MODO */}
          {isPWA && (
            <div className="flex items-center gap-1 text-sm">
              {isOnline ? (
                <>
                  <MdWifi className="text-green-600" size={16} />
                  <span className="text-green-600">Online</span>
                </>
              ) : (
                <>
                  <MdWifiOff className="text-orange-600" size={16} />
                  <span className="text-orange-600">Offline</span>
                </>
              )}
            </div>
          )}
        </div>
        
        <ul className="max-h-60 overflow-y-auto">
          {loading ? (
            <li className="text-gray-500 text-center py-4">
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                Buscando...
              </div>
            </li>
          ) : resultados.length > 0 ? (
            resultados.map((cliente, idx) => (
              <li
                key={idx}
                className="p-3 border-b hover:bg-gray-100 cursor-pointer text-black transition-colors"
                onClick={() => onSeleccionar(cliente)}
              >
                <div className="font-medium">{cliente.nombre}</div>
                {cliente.ciudad && (
                  <div className="text-sm text-gray-600">{cliente.ciudad}</div>
                )}
                {cliente.telefono && (
                  <div className="text-xs text-gray-500">{cliente.telefono}</div>
                )}
              </li>
            ))
          ) : (
            <li className="text-gray-500 text-center py-4">
              {isPWA && !isOnline 
                ? "No se encontraron clientes en datos offline." 
                : "No se encontraron resultados."
              }
            </li>
          )}
        </ul>
        <button
          onClick={onCerrar}
          className="mt-4 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded transition-colors"
        >
          Cerrar
        </button>
      </div>
    </div>
  );
}

function DetallesClienteListaPrecios({ cliente, isPWA, isOnline }) {
  const [expandido, setExpandido] = useState(false);

  if (!cliente) return null;

  return (
    <div className="bg-blue-800 p-4 rounded mt-2 text-sm text-white">
      <div
        className="flex justify-between items-center cursor-pointer"
        onClick={() => setExpandido(!expandido)}
      >
        <div className="flex items-center gap-2">
          <p><strong>Cliente:</strong> {cliente.nombre || '-'}</p>
          
        </div>
        {expandido ? (
          <MdKeyboardArrowUp size={24} />
        ) : (
          <MdKeyboardArrowDown size={24} />
        )}
      </div>

      {expandido && (
        <div className="mt-2 space-y-1">
          <p><strong>Dirección:</strong> {cliente.direccion || '-'}</p>
          <p><strong>Ciudad:</strong> {cliente.ciudad || '-'}</p>
          <p><strong>Provincia:</strong> {cliente.provincia || '-'}</p>
          <p><strong>Teléfono:</strong> {cliente.telefono || '-'}</p>
          <p><strong>Email:</strong> {cliente.email || '-'}</p>
          <p><strong>CUIT:</strong> {cliente.cuit || '-'}</p>
          <p><strong>Condición IVA:</strong> {cliente.condicion_iva || '-'}</p>
          
          
        </div>
      )}
    </div>
  );
}

export default function ClienteSelectorHybrid() {
  const { cliente, setCliente, clearCliente } = usePedidosContext();
  const {
    busqueda,
    setBusqueda,
    resultados,
    loading,
    mostrarModal,
    setMostrarModal,
    buscarCliente,
    limpiarBusqueda,
    isPWA
  } = useClienteSearchHybrid();

  // ✅ ESTADO DE CONEXIÓN PARA PWA
  const [isOnline, setIsOnline] = useState(true);

  // ✅ MONITOREAR CONECTIVIDAD SOLO EN PWA
  useEffect(() => {
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

  const handleSeleccionarCliente = (clienteSeleccionado) => {
    setCliente(clienteSeleccionado);
    setMostrarModal(false);
    limpiarBusqueda();
  };

  const handleLimpiarCliente = () => {
    clearCliente();
    limpiarBusqueda();
  };

  // ✅ FUNCIÓN PARA OBTENER PLACEHOLDER DINÁMICO
  const getPlaceholder = () => {
    if (!isPWA) return "Nombre del cliente";
    return isOnline ? "Nombre del cliente (online)" : "Nombre del cliente (offline)";
  };

  // ✅ FUNCIÓN PARA OBTENER CLASE DEL CONTENEDOR
  const getContainerClass = () => {
    const baseClass = "bg-blue-900 text-white p-6 rounded-lg flex-1 min-w-[300px]";
    if (!isPWA) return baseClass;
    
    const borderClass = isOnline ? "border-l-4 border-green-500" : "border-l-4 border-orange-500";
    return `${baseClass} ${borderClass}`;
  };

  return (
    <div className={getContainerClass()}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">Cliente</h2>
        
        {/* ✅ INDICADOR DE ESTADO PWA */}
        {isPWA && (
          <div className="flex items-center gap-2">
            {isOnline ? (
              <>
                <MdWifi className="text-green-400" size={20} />
                <span className="text-green-400 text-sm">Online</span>
              </>
            ) : (
              <>
                <MdWifiOff className="text-orange-400" size={20} />
                <span className="text-orange-400 text-sm">Offline</span>
              </>
            )}
          </div>
        )}
      </div>
      
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder={getPlaceholder()}
            value={cliente ? cliente.nombre : busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            disabled={!!cliente}
            className={`w-full p-2 rounded text-black ${
              isPWA && !isOnline ? 'bg-orange-50 border-orange-300' : ''
            }`}
          />
          <button
            onClick={buscarCliente}
            disabled={!!cliente || loading}
            className={`p-2 rounded transition ${
              !!cliente || loading
                ? 'bg-gray-400 cursor-not-allowed text-gray-600'
                : isOnline 
                  ? 'bg-white text-blue-900 hover:bg-sky-300'
                  : 'bg-orange-200 text-orange-800 hover:bg-orange-300'
            }`}
            title={
              isPWA 
                ? isOnline 
                  ? "Buscar cliente online" 
                  : "Buscar cliente en datos offline"
                : "Buscar cliente"
            }
          >
            {loading ? (
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-current"></div>
            ) : (
              <MdSearch size={24} />
            )}
          </button>
          {cliente && (
            <button
              onClick={handleLimpiarCliente}
              className="p-2 rounded bg-white text-red-600 hover:bg-red-300 transition"
              title="Eliminar cliente"
            >
              <MdDeleteForever size={24} />
            </button>
          )}
        </div>

        
      </div>

      <DetallesClienteListaPrecios 
        cliente={cliente} 
        isPWA={isPWA}
        isOnline={isOnline}
      />

      {mostrarModal && (
        <ModalClientes
          resultados={resultados}
          onSeleccionar={handleSeleccionarCliente}
          onCerrar={() => setMostrarModal(false)}
          loading={loading}
          isPWA={isPWA}
          isOnline={isOnline}
        />
      )}
    </div>
  );
}