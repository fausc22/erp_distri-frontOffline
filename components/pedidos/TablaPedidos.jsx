// components/pedidos/TablaPedidos.jsx
import { useState } from 'react';


// Función helper para formatear fechas
const formatearFecha = (fecha) => {
  if (!fecha) return 'Fecha no disponible';
  
  return new Date(fecha).toLocaleString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });
};

// Componente para tabla en escritorio
function TablaEscritorio({
  pedidos,
  selectedPedidos,
  onSelectPedido,
  onSelectAll,
  onRowDoubleClick,
  sortField,
  sortDirection,
  onSort,
  mostrarPermisos = false,
  verificarPermisos = () => true
}) {
  const getSortIcon = (field) => {
    if (sortField !== field) return '↕️';
    return sortDirection === 'asc' ? '↑' : '↓';
  };

  const getEstadoStyle = (estado) => {
    switch (estado) {
      case 'Exportado':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Facturado':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Anulado':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="hidden lg:block overflow-x-auto bg-white rounded-lg shadow">
      <table className="w-full">
        <thead className="bg-gray-200">
          <tr>
            <th className="p-3 text-center">
              <input
                type="checkbox"
                checked={selectedPedidos.length === pedidos.length && pedidos.length > 0}
                onChange={() => onSelectAll()}
                className="w-4 h-4"
              />
            </th>
            <th 
              className="p-3 text-left cursor-pointer hover:bg-gray-300 transition-colors"
              onClick={() => onSort('id')}
            >
              ID {getSortIcon('id')}
            </th>
            <th 
              className="p-3 text-left cursor-pointer hover:bg-gray-300 transition-colors"
              onClick={() => onSort('fecha')}
            >
              Fecha {getSortIcon('fecha')}
            </th>
            <th 
              className="p-3 text-left cursor-pointer hover:bg-gray-300 transition-colors"
              onClick={() => onSort('cliente_nombre')}
            >
              Cliente {getSortIcon('cliente_nombre')}
            </th>
            <th 
              className="p-3 text-right cursor-pointer hover:bg-gray-300 transition-colors"
              onClick={() => onSort('total')}
            >
              Total {getSortIcon('total')}
            </th>
            <th 
              className="p-3 text-center cursor-pointer hover:bg-gray-300 transition-colors"
              onClick={() => onSort('estado')}
            >
              Estado {getSortIcon('estado')}
            </th>
            <th 
              className="p-3 text-left cursor-pointer hover:bg-gray-300 transition-colors"
              onClick={() => onSort('empleado_nombre')}
            >
              Usuario {getSortIcon('empleado_nombre')}
            </th>
          </tr>
        </thead>
        <tbody>
          {pedidos.map((pedido) => (
            <tr
              key={pedido.id}
              className={`border-b hover:bg-gray-50 cursor-pointer transition-colors ${
                selectedPedidos.includes(pedido.id) ? 'bg-blue-50' : ''
              }`}
              onDoubleClick={() => onRowDoubleClick(pedido)}
            >
              <td className="p-3 text-center">
                <input
                  type="checkbox"
                  checked={selectedPedidos.includes(pedido.id)}
                  onChange={() => onSelectPedido(pedido.id)}
                  className="w-4 h-4"
                  onClick={(e) => e.stopPropagation()}
                />
              </td>
              <td className="p-3 font-mono text-sm font-semibold text-blue-600">
                #{pedido.id}
              </td>
              <td className="p-3 text-sm">
                {formatearFecha(pedido.fecha)}
              </td>
              <td className="p-3 font-medium">
                <div>
                  <div className="font-semibold">{pedido.cliente_nombre || 'Cliente no especificado'}</div>
                  {pedido.cliente_ciudad && (
                    <div className="text-xs text-gray-500">{pedido.cliente_ciudad}</div>
                  )}
                </div>
              </td>
              <td className="p-3 text-right">
                <div className="font-semibold text-green-600">
                  ${Number(pedido.total || 0).toFixed(2)}
                </div>
                {pedido.subtotal && (
                  <div className="text-xs text-gray-500">
                    Subtotal: ${Number(pedido.subtotal || 0).toFixed(2)}
                  </div>
                )}
              </td>
              <td className="p-3 text-center">
                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getEstadoStyle(pedido.estado)}`}>
                  {pedido.estado || 'Sin estado'}
                </span>
              </td>
              <td className="p-3">
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">
                  {pedido.empleado_nombre || 'No especificado'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Componente para tarjetas en móvil
function TarjetasMovil({
  pedidos,
  selectedPedidos,
  onSelectPedido,
  onSelectAll,
  onRowDoubleClick,
  mostrarPermisos = false,
  verificarPermisos = () => true
}) {
  const getEstadoStyle = (estado) => {
    switch (estado) {
      case 'Exportado':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'Facturado':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'Anulado':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getEstadoIcon = (estado) => {
    switch (estado) {
      case 'Exportado': return '📤';
      case 'Facturado': return '✅';
      case 'Anulado': return '❌';
      default: return '📋';
    }
  };

  const handleCardDoubleClick = (pedido) => {
    console.log('📱 Doble click en tarjeta móvil, pedido:', pedido.id); // Debug
    onRowDoubleClick(pedido);
  };

  const handleCardClick = (pedido) => {
    console.log('📱 Click simple en tarjeta móvil, pedido:', pedido.id); // Debug
    onRowDoubleClick(pedido); // En móvil, un solo toque abre el modal
  };

  return (
    <div className="lg:hidden">
      {/* Header con seleccionar todos */}
      <div className="bg-gray-100 p-3 rounded-t-lg flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={selectedPedidos.length === pedidos.length && pedidos.length > 0}
            onChange={() => onSelectAll()}
            className="w-4 h-4"
          />
          <span className="text-sm font-medium text-gray-700">
            Seleccionar todos ({pedidos.length})
          </span>
        </div>
        {selectedPedidos.length > 0 && (
          <span className="text-sm font-medium text-blue-600">
            {selectedPedidos.length} seleccionados
          </span>
        )}
      </div>

      {/* Tarjetas de pedidos */}
      <div className="space-y-3">
        {pedidos.map((pedido) => (
          <div
            key={pedido.id}
            className={`bg-white rounded-lg border-2 p-4 transition-all duration-200 cursor-pointer relative ${
              selectedPedidos.includes(pedido.id) 
                ? 'border-blue-300 bg-blue-50 shadow-md' 
                : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
            } ${!verificarPermisos(pedido) ? 'opacity-75' : ''}`}
            onClick={() => handleCardClick(pedido)}
            onDoubleClick={() => handleCardDoubleClick(pedido)}
          >
            {/* Indicador de permisos */}
            {mostrarPermisos && !verificarPermisos(pedido) && (
              <div className="absolute top-2 right-2 bg-red-100 text-red-600 px-2 py-1 rounded-full text-xs font-medium">
                🔒 Sin editar
              </div>
            )}
            {/* Header de la tarjeta */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={selectedPedidos.includes(pedido.id)}
                  onChange={() => onSelectPedido(pedido.id)}
                  className="w-4 h-4 mt-1"
                  onClick={(e) => e.stopPropagation()}
                />
                <div>
                  <h3 className="text-lg font-bold text-blue-600">#{pedido.id}</h3>
                  <p className="text-xs text-gray-500">
                    {formatearFecha(pedido.fecha)}
                  </p>
                </div>
              </div>
              
              {/* Estado */}
              <div className="flex items-center gap-1">
                <span className="text-lg">{getEstadoIcon(pedido.estado)}</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getEstadoStyle(pedido.estado)}`}>
                  {pedido.estado || 'Sin estado'}
                </span>
              </div>
            </div>

            {/* Información del cliente */}
            <div className="mb-3 p-3 bg-gray-50 rounded-lg">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-semibold text-gray-800">
                    👤 {pedido.cliente_nombre || 'Cliente no especificado'}
                  </h4>
                  {pedido.cliente_ciudad && (
                    <p className="text-sm text-gray-600">
                      📍 {pedido.cliente_ciudad}
                      {pedido.cliente_provincia && `, ${pedido.cliente_provincia}`}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Información financiera */}
            <div className="grid grid-cols-2 gap-4 mb-3">
              <div className="text-center p-2 bg-green-50 rounded">
                <div className="text-lg font-bold text-green-600">
                  ${Number(pedido.total || 0).toFixed(2)}
                </div>
                <div className="text-xs text-green-800">Total</div>
                {pedido.subtotal && (
                  <div className="text-xs text-gray-500">
                    Subtotal: ${Number(pedido.subtotal || 0).toFixed(2)}
                  </div>
                )}
              </div>
              <div className="text-center p-2 bg-blue-50 rounded">
                <div className="text-lg font-bold text-blue-600">
                  {pedido.empleado_nombre || 'No especificado'}
                </div>
                <div className="text-xs text-blue-800">Usuario</div>
              </div>
            </div>

            {/* Indicador de observaciones */}
            {pedido.observaciones && pedido.observaciones !== 'sin observaciones' && (
              <div className="text-xs text-gray-600 bg-yellow-50 p-2 rounded border-l-4 border-yellow-400">
                💬 {pedido.observaciones.length > 50 
                  ? `${pedido.observaciones.substring(0, 50)}...` 
                  : pedido.observaciones}
              </div>
            )}

            {/* Footer con acción */}
            <div className="mt-3 pt-3 border-t border-gray-200 text-center">
              {verificarPermisos(pedido) ? (
                <p className="text-xs text-gray-500">
                  💡 Toca para ver detalles
                </p>
              ) : (
                <p className="text-xs text-red-500">
                  👁️ Solo lectura
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Componente principal
export default function TablaPedidos({
  pedidos,
  selectedPedidos,
  onSelectPedido,
  onSelectAll,
  onRowDoubleClick,
  loading,
  mostrarPermisos = false,
  verificarPermisos = () => true
}) {
  const [sortField, setSortField] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedPedidos = [...pedidos].sort((a, b) => {
    if (!sortField) return 0;
    
    let aValue = a[sortField];
    let bValue = b[sortField];
    
    // Manejar campos numéricos
    if (sortField === 'id' || sortField === 'total') {
      aValue = Number(aValue) || 0;
      bValue = Number(bValue) || 0;
    }
    
    // Manejar fechas
    if (sortField === 'fecha') {
      aValue = new Date(aValue);
      bValue = new Date(bValue);
    }
    
    // Manejar texto
    if (typeof aValue === 'string') {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }
    
    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-lg">Cargando pedidos...</span>
      </div>
    );
  }

  if (pedidos.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
        <div className="text-4xl mb-4">📋</div>
        <div className="text-lg font-medium mb-2">No hay pedidos registrados</div>
        <div className="text-sm">Los pedidos aparecerán aquí cuando se registren</div>
      </div>
    );
  }

  return (
    <div>
      {/* Tabla para escritorio */}
      <TablaEscritorio
        pedidos={sortedPedidos}
        selectedPedidos={selectedPedidos}
        onSelectPedido={onSelectPedido}
        onSelectAll={onSelectAll}
        onRowDoubleClick={onRowDoubleClick}
        sortField={sortField}
        sortDirection={sortDirection}
        onSort={handleSort}
        mostrarPermisos={mostrarPermisos}
        verificarPermisos={verificarPermisos}
      />

      {/* Tarjetas para móvil */}
      <TarjetasMovil
        pedidos={sortedPedidos}
        selectedPedidos={selectedPedidos}
        onSelectPedido={onSelectPedido}
        onSelectAll={onSelectAll}
        onRowDoubleClick={onRowDoubleClick}
        mostrarPermisos={mostrarPermisos}
        verificarPermisos={verificarPermisos}
      />
      
      {/* Footer con estadísticas */}
      <div className="bg-gray-50 px-4 py-3 border-t rounded-b-lg mt-4">
        <div className="flex flex-col sm:flex-row justify-between items-center text-sm text-gray-600 gap-2">
          <span>
            {selectedPedidos.length > 0 && (
              <span className="font-medium text-blue-600">
                {selectedPedidos.length} de {pedidos.length} seleccionados
              </span>
            )}
          </span>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
            <span>
              Total de pedidos: <span className="font-medium">{pedidos.length}</span>
            </span>
            <span>
              Monto total: <span className="font-medium text-green-600">
                ${pedidos.reduce((acc, p) => acc + Number(p.total || 0), 0).toFixed(2)}
              </span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}