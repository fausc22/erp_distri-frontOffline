// components/pedidos/SelectorProductosHybrid.jsx - Selector Híbrido PWA/Web para Productos
import { MdSearch } from "react-icons/md";
import { toast } from 'react-hot-toast';
import { usePedidosContext } from '../../context/PedidosContext';
import { useProductoSearchHybrid } from '../../hooks/useProductSearchHybrid';

function ControlCantidad({ cantidad, onCantidadChange, stockDisponible, className = "" }) {
  const handleCantidadChange = (nuevaCantidad) => {
    const cantidadValida = Math.min(Math.max(1, nuevaCantidad), stockDisponible);
    onCantidadChange(cantidadValida);
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <button 
        className="bg-gray-300 hover:bg-gray-400 text-black w-8 h-8 rounded flex items-center justify-center font-bold"
        onClick={() => handleCantidadChange(cantidad - 1)}
      >
        -
      </button>
      <input
        type="number"
        value={cantidad}
        onChange={(e) => handleCantidadChange(Number(e.target.value))}
        min="1"
        max={stockDisponible}
        className="w-16 p-2 rounded text-black border border-gray-300 text-center"
      />
      <button 
        className="bg-gray-300 hover:bg-gray-400 text-black w-8 h-8 rounded flex items-center justify-center font-bold"
        onClick={() => handleCantidadChange(cantidad + 1)}
      >
        +
      </button>
    </div>
  );
}

function DetallesProducto({ producto, cantidad, subtotal, onCantidadChange, onAgregar, isPWA, isOnline }) {
  if (!producto) return null;

  const stockInsuficiente = cantidad > producto.stock_actual;

  return (
    <div className="mt-4">
      <div className={`mb-2 text-xl font-bold ${producto.stock_actual > 0 ? 'text-green-700' : 'text-red-600'}`}>
        STOCK DISPONIBLE: {producto.stock_actual}
        {/* ✅ INDICADOR DE ORIGEN DEL DATO */}
        {isPWA && (
          <span className={`ml-2 text-xs px-2 py-1 rounded ${
            isOnline ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
          }`}>
            {isOnline ? 'Online' : 'Offline'}
          </span>
        )}
      </div>
      <div className="mb-2 text-black">
        Precio unitario: ${producto.precio}
      </div>
      
      <div className="flex items-center gap-4 mb-4">
        <label htmlFor="cantidad" className="text-black">Cantidad:</label>
        <ControlCantidad 
          cantidad={cantidad}
          onCantidadChange={onCantidadChange}
          stockDisponible={producto.stock_actual}
        />
      </div>

      {stockInsuficiente && (
        <div className="text-red-600 font-semibold mb-2">
          ⚠️ Stock insuficiente. Máximo disponible: {producto.stock_actual}
        </div>
      )}

      <div className="text-black font-semibold mb-4">
        Subtotal: ${Number(subtotal).toFixed(2)}
      </div>

      <button
        onClick={onAgregar}
        disabled={stockInsuficiente || producto.stock_actual === 0}
        className={`px-6 py-2 rounded font-semibold ${
          stockInsuficiente || producto.stock_actual === 0
            ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
            : 'bg-green-600 hover:bg-green-800 text-white'
        }`}
      >
        {producto.stock_actual === 0 ? 'Sin Stock' : 'Agregar Producto'}
      </button>
    </div>
  );
}

function ModalProductos({ 
  resultados, 
  productoSeleccionado, 
  cantidad,
  subtotal,
  onSeleccionar, 
  onCantidadChange,
  onAgregar,
  onCerrar, 
  loading,
  isPWA,
  isOnline
}) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
      <div className="bg-white rounded-lg p-4 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-black">Seleccionar Producto</h3>
          {/* ✅ INDICADOR DE MODO */}
          {isPWA && (
            <div className="flex items-center gap-2 text-sm">
              <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-orange-500'}`}></div>
              <span className={isOnline ? 'text-green-600' : 'text-orange-600'}>
                {isOnline ? 'Online' : 'Offline'}
              </span>
            </div>
          )}
        </div>
        
        <ul className="max-h-60 overflow-y-auto">
          {loading ? (
            <li className="text-gray-500 text-center py-4">
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                Buscando{isPWA && !isOnline ? ' offline' : ''}...
              </div>
            </li>
          ) : resultados.length > 0 ? (
            resultados.map((producto, idx) => (
              <li
                key={idx}
                className={`p-2 border-b cursor-pointer text-black transition-colors ${
                  producto.stock_actual > 0 
                    ? 'hover:bg-gray-100' 
                    : 'bg-red-50 text-red-600'
                }`}
                onClick={() => onSeleccionar(producto)}
              >
                <div className="flex justify-between items-center">
                  <span>{producto.nombre} - ${producto.precio}</span>
                  <div className="text-right">
                    <span className={`text-sm ${
                      producto.stock_actual > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      Stock: {producto.stock_actual}
                    </span>
                    {/* ✅ BADGE DE ORIGEN PARA CADA PRODUCTO */}
                    
                  </div>
                </div>
              </li>
            ))
          ) : (
            <li className="text-gray-500 text-center py-4">
              {isPWA && !isOnline 
                ? "No se encontraron productos en datos offline." 
                : "No se encontraron resultados."
              }
            </li>
          )}
        </ul>

        <DetallesProducto
          producto={productoSeleccionado}
          cantidad={cantidad}
          subtotal={subtotal}
          onCantidadChange={onCantidadChange}
          onAgregar={onAgregar}
          isPWA={isPWA}
          isOnline={isOnline}
        />

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

export default function ProductoSelectorHybrid() {
  const { addProducto } = usePedidosContext();
  const {
    busqueda,
    setBusqueda,
    resultados,
    productoSeleccionado,
    cantidad,
    subtotal,
    loading,
    mostrarModal,
    setMostrarModal,
    buscarProducto,
    seleccionarProducto,
    actualizarCantidad,
    limpiarSeleccion,
    isPWA,
    isOnline
  } = useProductoSearchHybrid();

  const handleAgregarProducto = () => {
    if (!productoSeleccionado || cantidad <= 0) return;
    
    if (cantidad > productoSeleccionado.stock_actual) {
      toast.error(`NO HAY STOCK DISPONIBLE PARA ${productoSeleccionado.nombre.toUpperCase()}.`);
      return;
    }
    
    if (productoSeleccionado.stock_actual === 0) {
      toast.error(`NO HAY STOCK DISPONIBLE PARA ${productoSeleccionado.nombre.toUpperCase()}.`);
      return;
    }
    
    addProducto(productoSeleccionado, cantidad, subtotal);
    limpiarSeleccion();
    
    // ✅ MENSAJE DIFERENCIADO POR MODO
    if (isPWA && !isOnline) {
      toast.success(`📱 ${productoSeleccionado.nombre} agregado (offline)`);
    } else {
      toast.success(`${productoSeleccionado.nombre} agregado al pedido`);
    }
  };

  // ✅ FUNCIÓN PARA OBTENER PLACEHOLDER DINÁMICO
  const getPlaceholder = () => {
    if (!isPWA) return "Buscar producto";
    return isOnline ? "Buscar producto (online)" : "Buscar producto (offline)";
  };

  // ✅ FUNCIÓN PARA OBTENER CLASE DEL CONTENEDOR
  const getContainerClass = () => {
    const baseClass = "bg-blue-500 p-6 rounded-lg flex-1 text-white";
    if (!isPWA) return baseClass;
    
    const borderClass = isOnline ? "border-l-4 border-green-400" : "border-l-4 border-orange-400";
    return `${baseClass} ${borderClass}`;
  };

  return (
    <div className={getContainerClass()}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">Productos</h2>
        
        {/* ✅ INDICADOR DE ESTADO PARA PWA */}
        {isPWA && (
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-green-400' : 'bg-orange-400'}`}></div>
            <span className={`text-sm font-medium ${isOnline ? 'text-green-200' : 'text-orange-200'}`}>
              {isOnline ? 'ONLINE' : 'OFFLINE'}
            </span>
          </div>
        )}
      </div>

      <div className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder={getPlaceholder()}
          className={`flex-1 p-2 rounded text-black ${
            isPWA && !isOnline ? 'bg-orange-50 border-orange-300' : ''
          }`}
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
        <button
          onClick={buscarProducto}
          disabled={loading}
          className={`p-2 rounded transition ${
            loading
              ? 'bg-gray-400 cursor-not-allowed text-gray-600'
              : isOnline 
                ? 'bg-white text-blue-900 hover:bg-sky-300'
                : 'bg-orange-200 text-orange-800 hover:bg-orange-300'
          }`}
          title={
            isPWA 
              ? isOnline 
                ? "Buscar producto online" 
                : "Buscar producto en datos offline"
              : "Buscar producto"
          }
        >
          {loading ? (
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-current"></div>
          ) : (
            <MdSearch size={24} />
          )}
        </button>
      </div>

      

      {mostrarModal && (
        <ModalProductos
          resultados={resultados}
          productoSeleccionado={productoSeleccionado}
          cantidad={cantidad}
          subtotal={subtotal}
          onSeleccionar={seleccionarProducto}
          onCantidadChange={actualizarCantidad}
          onAgregar={handleAgregarProducto}
          onCerrar={() => setMostrarModal(false)}
          loading={loading}
          isPWA={isPWA}
          isOnline={isOnline}
        />
      )}
    </div>
  );
}