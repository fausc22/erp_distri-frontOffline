export function ModalConfirmacionPedido({ 
  mostrar, 
  cliente, 
  totalProductos, 
  total, 
  onConfirmar, 
  onCancelar,
  loading = false,
  isPWA = false,
  isOnline = true
}) {
  if (!mostrar) return null;

  // ✅ FUNCIÓN PARA OBTENER MENSAJE SEGÚN MODO
  const getMensajeConfirmacion = () => {
    if (!isPWA) {
      return `¿Deseas confirmar el pedido para el cliente ${cliente?.nombre} con una cantidad de ${totalProductos} productos y un total de $${Number(total).toFixed(2)}?`;
    }
    
    if (isOnline) {
      return `¿Deseas confirmar el pedido para el cliente ${cliente?.nombre} con una cantidad de ${totalProductos} productos y un total de $${Number(total).toFixed(2)}?`;
    } else {
      return `¿Deseas guardar offline el pedido para el cliente ${cliente?.nombre} con una cantidad de ${totalProductos} productos y un total de $${Number(total).toFixed(2)}? Se subirá cuando haya conexión.`;
    }
  };

  // ✅ FUNCIÓN PARA OBTENER ESTILO DEL MODAL
  const getModalStyle = () => {
    if (!isPWA) return '';
    return isOnline ? 'border-l-4 border-green-500' : 'border-l-4 border-orange-500';
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className={`bg-white rounded-lg p-6 max-w-md w-full mx-4 ${getModalStyle()}`}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-center">
            {isPWA && !isOnline ? 'Guardar Pedido Offline' : 'Confirmar Pedido'}
          </h3>
          
          {/* ✅ INDICADOR DE MODO PWA */}
          {isPWA && (
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-green-500' : 'bg-orange-500'}`}></div>
              <span className={`text-sm font-medium ${isOnline ? 'text-green-700' : 'text-orange-700'}`}>
                {isOnline ? 'ONLINE' : 'OFFLINE'}
              </span>
            </div>
          )}
        </div>
        
        <div className="text-center mb-6">
          <p className="mb-2">{getMensajeConfirmacion()}</p>
          
          {/* ✅ INFORMACIÓN ADICIONAL PARA PWA OFFLINE */}
          {isPWA && !isOnline && (
            <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="text-sm text-orange-800">
                <strong>📱 Modo Offline:</strong> El pedido se guardará localmente y se sincronizará automáticamente cuando se recupere la conexión a internet.
              </div>
            </div>
          )}
        </div>
        
        {/* ✅ INDICADOR DE PROCESAMIENTO MEJORADO */}
        {loading && (
          <div className={`mb-4 p-3 border rounded-lg ${
            isPWA && !isOnline 
              ? 'bg-orange-50 border-orange-200' 
              : 'bg-blue-50 border-blue-200'
          }`}>
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 mr-3 border-current"></div>
              <span className={`font-medium ${
                isPWA && !isOnline ? 'text-orange-700' : 'text-blue-700'
              }`}>
                {isPWA && !isOnline ? 'Guardando offline...' : 'Procesando pedido...'}
              </span>
            </div>
          </div>
        )}
        
        <div className="flex justify-center gap-4">
          <button
            onClick={onConfirmar}
            disabled={loading}
            className={`px-6 py-2 rounded font-semibold transition-colors flex items-center gap-2 ${
              loading
                ? 'bg-gray-400 cursor-not-allowed text-gray-700'
                : isPWA && !isOnline
                  ? 'bg-orange-600 hover:bg-orange-700 text-white'
                  : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
          >
            {loading && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            )}
            {loading ? (
              isPWA && !isOnline ? 'Guardando...' : 'Procesando...'
            ) : (
              isPWA && !isOnline ? '📱 Sí, Guardar Offline' : 'Sí, Confirmar'
            )}
          </button>
          <button
            onClick={onCancelar}
            disabled={loading}
            className="bg-gray-500 hover:bg-gray-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-6 py-2 rounded font-semibold transition-colors"
          >
            No, Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
export function ModalConfirmacionSalidaPedidos({ mostrar, onConfirmar, onCancelar }) {
  if (!mostrar) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h3 className="text-xl font-bold mb-4 text-center">
          ¿Estás seguro que deseas salir?
        </h3>
        <div className="text-center mb-6">
          <p className="mb-2">Se cerrará el historial de pedidos.</p>
        </div>
        <div className="flex justify-center gap-4">
          <button
            onClick={onConfirmar}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded font-semibold"
          >
            Sí, Salir
          </button>
          <button
            onClick={onCancelar}
            className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded font-semibold"
          >
            No, Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}

export function ModalConfirmacionCambioEstado({ 
  mostrar, 
  pedidosSeleccionados, 
  nuevoEstado, 
  onConfirmar, 
  onCancelar,
  loading = false 
}) {
  if (!mostrar) return null;

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'Exportado': return 'text-yellow-600';
      case 'Facturado': return 'text-green-600';
      case 'Anulado': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h3 className="text-xl font-bold mb-4 text-center">Confirmar Cambio de Estado</h3>
        <div className="text-center mb-6">
          <p className="mb-2">
            ¿Deseas cambiar el estado de{' '}
            <span className="font-bold">{pedidosSeleccionados}</span> pedido(s) a{' '}
            <span className={`font-bold ${getEstadoColor(nuevoEstado)}`}>{nuevoEstado}</span>?
          </p>
          <p className="text-sm text-gray-600">Esta acción se aplicará a todos los pedidos seleccionados.</p>
        </div>
        <div className="flex justify-center gap-4">
          <button
            onClick={onConfirmar}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded font-semibold disabled:opacity-50"
          >
            {loading ? 'Procesando...' : 'Sí, Cambiar'}
          </button>
          <button
            onClick={onCancelar}
            disabled={loading}
            className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded font-semibold disabled:opacity-50"
          >
            No, Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}

export function ModalConfirmacionEliminarMultiple({ 
  mostrar, 
  pedidosSeleccionados, 
  onConfirmar, 
  onCancelar,
  loading = false 
}) {
  if (!mostrar) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h3 className="text-xl font-bold mb-4 text-center text-red-600">⚠️ Confirmar Eliminación</h3>
        <div className="text-center mb-6">
          <p className="mb-2">
            ¿Estás seguro de eliminar{' '}
            <span className="font-bold text-red-600">{pedidosSeleccionados}</span> pedido(s)?
          </p>
          <p className="text-sm text-red-600 font-medium">
            Esta acción es IRREVERSIBLE y eliminará los pedidos y todos sus productos.
          </p>
        </div>
        <div className="flex justify-center gap-4">
          <button
            onClick={onConfirmar}
            disabled={loading}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded font-semibold disabled:opacity-50"
          >
            {loading ? 'Eliminando...' : 'Sí, Eliminar'}
          </button>
          <button
            onClick={onCancelar}
            disabled={loading}
            className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded font-semibold disabled:opacity-50"
          >
            No, Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}

export function ModalConfirmacionAnularPedidoIndividual({ 
  mostrar, 
  pedido, 
  productos = [],
  onConfirmar, 
  onCancelar,
  loading = false 
}) {
  if (!mostrar || !pedido) return null;

  // Calcular totales
  const totalProductos = productos.reduce((acc, prod) => acc + (Number(prod.cantidad) || 0), 0);
  const subtotal = productos.reduce((acc, prod) => acc + (Number(prod.subtotal) || 0), 0);
  const ivaTotal = productos.reduce((acc, prod) => acc + (Number(prod.iva) || 0), 0);
  const total = subtotal + ivaTotal;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-[60] p-4">
      <div className="bg-white rounded-lg max-w-md w-full mx-4">
        <div className="p-6">
          <h3 className="text-xl font-bold mb-4 text-center text-red-600">
            ⚠️ CONFIRMAR ANULACIÓN DE PEDIDO
          </h3>
          
          <div className="text-center mb-6 space-y-3">
            <p className="text-lg font-semibold">
              ¿Estás seguro que deseas anular el pedido #{pedido.id}?
            </p>
            
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 text-left">
              <h4 className="font-semibold text-yellow-800 mb-2">Detalles del pedido:</h4>
              <div className="space-y-1 text-sm text-yellow-700">
                <p><strong>Cliente:</strong> {pedido.cliente_nombre}</p>
                <p><strong>Cantidad de productos:</strong> {totalProductos} unidades</p>
                <p><strong>Total del pedido:</strong> ${total.toFixed(2)}</p>
                <p><strong>Fecha:</strong> {pedido.fecha}</p>
              </div>
            </div>
            
            <div className="bg-red-50 border-l-4 border-red-400 p-4 text-left">
              <h4 className="font-semibold text-red-800 mb-2">⚠️ Importante:</h4>
              <div className="space-y-1 text-sm text-red-700">
                <p>• Se reestablecerá el STOCK de todos los productos del pedido</p>
                <p>• Esta acción cambiará el estado del pedido a &quot;Anulado&quot;</p>
                <p>• Los productos volverán a estar disponibles en el inventario</p>
              </div>
            </div>
            
            <p className="text-red-600 font-medium text-sm">
              Esta acción afectará el inventario y los reportes.
            </p>
          </div>
          
          <div className="flex justify-center gap-4">
            <button
              onClick={onConfirmar}
              disabled={loading}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Anulando...
                </div>
              ) : (
                'SÍ, ANULAR PEDIDO'
              )}
            </button>
            <button
              onClick={onCancelar}
              disabled={loading}
              className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded font-semibold disabled:opacity-50 transition-colors"
            >
              NO, CANCELAR
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}