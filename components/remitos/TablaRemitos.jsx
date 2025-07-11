// components/remitos/TablaRemitos.jsx - Versión responsiva con cards
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
  remitos,
  selectedRemitos,
  onSelectRemito,
  onSelectAll,
  onRowDoubleClick,
  sortField,
  sortDirection,
  onSort
}) {
  const getSortIcon = (field) => {
    if (sortField !== field) return '↕️';
    return sortDirection === 'asc' ? '↑' : '↓';
  };

  const getEstadoStyle = (estado) => {
    switch (estado) {
      case 'Activo':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Entregado':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Pendiente':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Cancelado':
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
                checked={selectedRemitos.length === remitos.length && remitos.length > 0}
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
            <th className="p-3 text-left">Ubicación</th>
            <th 
              className="p-3 text-center cursor-pointer hover:bg-gray-300 transition-colors"
              onClick={() => onSort('estado')}
            >
              Estado {getSortIcon('estado')}
            </th>
            <th className="p-3 text-left">Observaciones</th>
            <th 
              className="p-3 text-left cursor-pointer hover:bg-gray-300 transition-colors"
              onClick={() => onSort('empleado_nombre')}
            >
              Usuario {getSortIcon('empleado_nombre')}
            </th>
          </tr>
        </thead>
        <tbody>
          {remitos.map((remito) => (
            <tr
              key={remito.id}
              className={`border-b hover:bg-gray-50 cursor-pointer transition-colors ${
                selectedRemitos.includes(remito.id) ? 'bg-green-50' : ''
              }`}
              onDoubleClick={() => onRowDoubleClick(remito)}
            >
              <td className="p-3 text-center">
                <input
                  type="checkbox"
                  checked={selectedRemitos.includes(remito.id)}
                  onChange={() => onSelectRemito(remito.id)}
                  className="w-4 h-4"
                  onClick={(e) => e.stopPropagation()}
                />
              </td>
              <td className="p-3 font-mono text-sm font-semibold text-green-600">
                #{remito.id}
              </td>
              <td className="p-3 text-sm">
                {formatearFecha(remito.fecha)}
              </td>
              <td className="p-3 font-medium">
                <div>
                  <div className="font-semibold">{remito.cliente_nombre || 'Cliente no especificado'}</div>
                </div>
              </td>
              <td className="p-3 text-sm">
                <div>
                  <div>{remito.cliente_ciudad || 'No especificada'}</div>
                  {remito.cliente_provincia && (
                    <div className="text-xs text-gray-500">{remito.cliente_provincia}</div>
                  )}
                </div>
              </td>
              <td className="p-3 text-center">
                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getEstadoStyle(remito.estado)}`}>
                  {remito.estado || 'Sin estado'}
                </span>
              </td>
              <td className="p-3 text-sm text-gray-600 max-w-xs truncate">
                {remito.observaciones || 'Sin observaciones'}
              </td>
              <td className="p-3">
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm">
                  {remito.empleado_nombre || 'No especificado'}
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
  remitos,
  selectedRemitos,
  onSelectRemito,
  onSelectAll,
  onRowDoubleClick
}) {
  const getEstadoStyle = (estado) => {
    switch (estado) {
      case 'Activo':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'Entregado':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Pendiente':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'Cancelado':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getEstadoIcon = (estado) => {
    switch (estado) {
      case 'Activo': return '✅';
      case 'Entregado': return '📦';
      case 'Pendiente': return '⏳';
      case 'Cancelado': return '❌';
      default: return '📄';
    }
  };

  const handleCardDoubleClick = (remito) => {
    console.log('📱 Doble click en tarjeta móvil, remito:', remito.id);
    onRowDoubleClick(remito);
  };

  const handleCardClick = (remito) => {
    console.log('📱 Click simple en tarjeta móvil, remito:', remito.id);
    onRowDoubleClick(remito); // En móvil, un solo toque abre el modal
  };

  return (
    <div className="lg:hidden">
      {/* Header con seleccionar todos */}
      <div className="bg-gray-100 p-3 rounded-t-lg flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={selectedRemitos.length === remitos.length && remitos.length > 0}
            onChange={() => onSelectAll()}
            className="w-4 h-4"
          />
          <span className="text-sm font-medium text-gray-700">
            Seleccionar todos ({remitos.length})
          </span>
        </div>
        {selectedRemitos.length > 0 && (
          <span className="text-sm font-medium text-green-600">
            {selectedRemitos.length} seleccionados
          </span>
        )}
      </div>

      {/* Tarjetas de remitos */}
      <div className="space-y-3">
        {remitos.map((remito) => (
          <div
            key={remito.id}
            className={`bg-white rounded-lg border-2 p-4 transition-all duration-200 cursor-pointer relative ${
              selectedRemitos.includes(remito.id) 
                ? 'border-green-300 bg-green-50 shadow-md' 
                : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
            }`}
            onClick={() => handleCardClick(remito)}
            onDoubleClick={() => handleCardDoubleClick(remito)}
          >
            {/* Header de la tarjeta */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={selectedRemitos.includes(remito.id)}
                  onChange={() => onSelectRemito(remito.id)}
                  className="w-4 h-4 mt-1"
                  onClick={(e) => e.stopPropagation()}
                />
                <div>
                  <h3 className="text-lg font-bold text-green-600">#{remito.id}</h3>
                  <p className="text-xs text-gray-500">
                    {formatearFecha(remito.fecha)}
                  </p>
                </div>
              </div>
              
              {/* Estado */}
              <div className="flex items-center gap-1">
                <span className="text-lg">{getEstadoIcon(remito.estado)}</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getEstadoStyle(remito.estado)}`}>
                  {remito.estado || 'Sin estado'}
                </span>
              </div>
            </div>

            {/* Información del cliente */}
            <div className="mb-3 p-3 bg-gray-50 rounded-lg">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-semibold text-gray-800">
                    👤 {remito.cliente_nombre || 'Cliente no especificado'}
                  </h4>
                  {(remito.cliente_ciudad || remito.cliente_provincia) && (
                    <p className="text-sm text-gray-600">
                      📍 {remito.cliente_ciudad || 'No especificada'}
                      {remito.cliente_provincia && `, ${remito.cliente_provincia}`}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Información adicional */}
            <div className="grid grid-cols-1 gap-2 mb-3">
              <div className="text-center p-2 bg-green-50 rounded">
                <div className="text-lg font-bold text-green-600">
                  {remito.empleado_nombre || 'No especificado'}
                </div>
                <div className="text-xs text-green-800">Usuario</div>
              </div>
            </div>

            {/* Indicador de observaciones */}
            {remito.observaciones && remito.observaciones !== 'Sin observaciones' && (
              <div className="text-xs text-gray-600 bg-yellow-50 p-2 rounded border-l-4 border-yellow-400">
                💬 {remito.observaciones.length > 50 
                  ? `${remito.observaciones.substring(0, 50)}...` 
                  : remito.observaciones}
              </div>
            )}

            {/* Footer con acción */}
            <div className="mt-3 pt-3 border-t border-gray-200 text-center">
              <p className="text-xs text-gray-500">
                💡 Toca para ver detalles
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Componente principal
export default function TablaRemitos({
  remitos,
  selectedRemitos,
  onSelectRemito,
  onSelectAll,
  onRowDoubleClick,
  loading
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

  const sortedRemitos = [...remitos].sort((a, b) => {
    if (!sortField) return 0;
    
    let aValue = a[sortField];
    let bValue = b[sortField];
    
    // Manejar campos numéricos
    if (sortField === 'id') {
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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        <span className="ml-3 text-lg">Cargando remitos...</span>
      </div>
    );
  }

  if (remitos.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
        <div className="text-4xl mb-4">📄</div>
        <div className="text-lg font-medium mb-2">No hay remitos registrados</div>
        <div className="text-sm">Los remitos aparecerán aquí cuando se registren</div>
      </div>
    );
  }

  return (
    <div>
      {/* Tabla para escritorio */}
      <TablaEscritorio
        remitos={sortedRemitos}
        selectedRemitos={selectedRemitos}
        onSelectRemito={onSelectRemito}
        onSelectAll={onSelectAll}
        onRowDoubleClick={onRowDoubleClick}
        sortField={sortField}
        sortDirection={sortDirection}
        onSort={handleSort}
      />

      {/* Tarjetas para móvil */}
      <TarjetasMovil
        remitos={sortedRemitos}
        selectedRemitos={selectedRemitos}
        onSelectRemito={onSelectRemito}
        onSelectAll={onSelectAll}
        onRowDoubleClick={onRowDoubleClick}
      />
      
      {/* Footer con estadísticas */}
      <div className="bg-gray-50 px-4 py-3 border-t rounded-b-lg mt-4">
        <div className="flex flex-col sm:flex-row justify-between items-center text-sm text-gray-600 gap-2">
          <span>
            {selectedRemitos.length > 0 && (
              <span className="font-medium text-green-600">
                {selectedRemitos.length} de {remitos.length} seleccionados
              </span>
            )}
          </span>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
            <span>
              Total de remitos: <span className="font-medium">{remitos.length}</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}