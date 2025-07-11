// components/ventas/TablaVentas.jsx - Versión responsiva con cards
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
  ventas,
  selectedVentas,
  onSelectVenta,
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

  const getDocumentoStyle = (tipoDoc) => {
    switch (tipoDoc) {
      case 'FACTURA':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'NOTA_DEBITO':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'NOTA_CREDITO':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTipoFiscalStyle = (tipoF) => {
    switch (tipoF) {
      case 'A':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'B':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'C':
        return 'bg-pink-100 text-pink-800 border-pink-200';
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
                checked={selectedVentas.length === ventas.length && ventas.length > 0}
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
            <th className="p-3 text-center">
              Documento
            </th>
            <th className="p-3 text-center">
              Tipo Fiscal
            </th>
            <th 
              className="p-3 text-right cursor-pointer hover:bg-gray-300 transition-colors"
              onClick={() => onSort('total')}
            >
              Total {getSortIcon('total')}
            </th>
            <th className="p-3 text-center">
              Estado CAE
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
          {ventas.map((venta) => (
            <tr
              key={venta.id}
              className={`border-b hover:bg-gray-50 cursor-pointer transition-colors ${
                selectedVentas.includes(venta.id) ? 'bg-blue-50' : ''
              }`}
              onDoubleClick={() => onRowDoubleClick(venta)}
            >
              <td className="p-3 text-center">
                <input
                  type="checkbox"
                  checked={selectedVentas.includes(venta.id)}
                  onChange={() => onSelectVenta(venta.id)}
                  className="w-4 h-4"
                  onClick={(e) => e.stopPropagation()}
                />
              </td>
              <td className="p-3 font-mono text-sm font-semibold text-blue-600">
                #{venta.id}
              </td>
              <td className="p-3 text-sm">
                {formatearFecha(venta.fecha)}
              </td>
              <td className="p-3 font-medium">
                <div>
                  <div className="font-semibold">{venta.cliente_nombre || 'Cliente no especificado'}</div>
                  {venta.cliente_ciudad && (
                    <div className="text-xs text-gray-500">{venta.cliente_ciudad}</div>
                  )}
                </div>
              </td>
              <td className="p-3 text-center">
                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getDocumentoStyle(venta.tipo_doc)}`}>
                  {venta.tipo_doc || 'N/A'}
                </span>
              </td>
              <td className="p-3 text-center">
                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getTipoFiscalStyle(venta.tipo_f)}`}>
                  {venta.tipo_f || 'N/A'}
                </span>
              </td>
              <td className="p-3 text-right">
                <div className="font-semibold text-green-600">
                  ${Number(venta.total || 0).toFixed(2)}
                </div>
                {venta.subtotal && (
                  <div className="text-xs text-gray-500">
                    Subtotal: ${Number(venta.subtotal || 0).toFixed(2)}
                  </div>
                )}
              </td>
              <td className="p-3 text-center">
                <div className="flex items-center justify-center gap-1">
                  {venta.cae_id ? (
                    <>
                      <span className="text-green-600 text-lg">✅</span>
                      <span className="text-xs text-green-600 font-medium">Aprobado</span>
                    </>
                  ) : (
                    <>
                      <span className="text-red-600 text-lg">❌</span>
                      <span className="text-xs text-red-600 font-medium">Pendiente</span>
                    </>
                  )}
                </div>
              </td>
              <td className="p-3">
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">
                  {venta.empleado_nombre || 'No especificado'}
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
  ventas,
  selectedVentas,
  onSelectVenta,
  onSelectAll,
  onRowDoubleClick
}) {
  const getDocumentoStyle = (tipoDoc) => {
    switch (tipoDoc) {
      case 'FACTURA':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'NOTA_DEBITO':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'NOTA_CREDITO':
        return 'bg-green-100 text-green-800 border-green-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getTipoFiscalStyle = (tipoF) => {
    switch (tipoF) {
      case 'A':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'B':
        return 'bg-indigo-100 text-indigo-800 border-indigo-300';
      case 'C':
        return 'bg-pink-100 text-pink-800 border-pink-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getDocumentoIcon = (tipoDoc) => {
    switch (tipoDoc) {
      case 'FACTURA': return '📄';
      case 'NOTA_DEBITO': return '📝';
      case 'NOTA_CREDITO': return '📋';
      default: return '📄';
    }
  };

  const getCAEIcon = (caeId) => {
    return caeId ? '✅' : '❌';
  };

  const handleCardDoubleClick = (venta) => {
    console.log('📱 Doble click en tarjeta móvil, venta:', venta.id);
    onRowDoubleClick(venta);
  };

  const handleCardClick = (venta) => {
    console.log('📱 Click simple en tarjeta móvil, venta:', venta.id);
    onRowDoubleClick(venta); // En móvil, un solo toque abre el modal
  };

  return (
    <div className="lg:hidden">
      {/* Header con seleccionar todos */}
      <div className="bg-gray-100 p-3 rounded-t-lg flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={selectedVentas.length === ventas.length && ventas.length > 0}
            onChange={() => onSelectAll()}
            className="w-4 h-4"
          />
          <span className="text-sm font-medium text-gray-700">
            Seleccionar todos ({ventas.length})
          </span>
        </div>
        {selectedVentas.length > 0 && (
          <span className="text-sm font-medium text-blue-600">
            {selectedVentas.length} seleccionados
          </span>
        )}
      </div>

      {/* Tarjetas de ventas */}
      <div className="space-y-3">
        {ventas.map((venta) => (
          <div
            key={venta.id}
            className={`bg-white rounded-lg border-2 p-4 transition-all duration-200 cursor-pointer relative ${
              selectedVentas.includes(venta.id) 
                ? 'border-blue-300 bg-blue-50 shadow-md' 
                : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
            }`}
            onClick={() => handleCardClick(venta)}
            onDoubleClick={() => handleCardDoubleClick(venta)}
          >
            {/* Header de la tarjeta */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={selectedVentas.includes(venta.id)}
                  onChange={() => onSelectVenta(venta.id)}
                  className="w-4 h-4 mt-1"
                  onClick={(e) => e.stopPropagation()}
                />
                <div>
                  <h3 className="text-lg font-bold text-blue-600">#{venta.id}</h3>
                  <p className="text-xs text-gray-500">
                    {formatearFecha(venta.fecha)}
                  </p>
                </div>
              </div>
              
              {/* Estado CAE */}
              <div className="flex items-center gap-1">
                <span className="text-lg">{getCAEIcon(venta.cae_id)}</span>
                <span className={`text-xs font-medium ${
                  venta.cae_id ? 'text-green-600' : 'text-red-600'
                }`}>
                  {venta.cae_id ? 'CAE' : 'Pendiente'}
                </span>
              </div>
            </div>

            {/* Información del cliente */}
            <div className="mb-3 p-3 bg-gray-50 rounded-lg">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-semibold text-gray-800">
                    👤 {venta.cliente_nombre || 'Cliente no especificado'}
                  </h4>
                  {venta.cliente_ciudad && (
                    <p className="text-sm text-gray-600">
                      📍 {venta.cliente_ciudad}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Información de tipos y totales */}
            <div className="grid grid-cols-2 gap-4 mb-3">
              <div className="text-center p-2 bg-green-50 rounded">
                <div className="text-lg font-bold text-green-600">
                  ${Number(venta.total || 0).toFixed(2)}
                </div>
                <div className="text-xs text-green-800">Total</div>
                {venta.subtotal && (
                  <div className="text-xs text-gray-500">
                    Subtotal: ${Number(venta.subtotal || 0).toFixed(2)}
                  </div>
                )}
              </div>
              <div className="text-center p-2 bg-blue-50 rounded">
                <div className="text-lg font-bold text-blue-600">
                  {venta.empleado_nombre || 'No especificado'}
                </div>
                <div className="text-xs text-blue-800">Usuario</div>
              </div>
            </div>

            {/* Información de documento y tipo fiscal */}
            <div className="grid grid-cols-2 gap-2 mb-3">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <span className="text-lg">{getDocumentoIcon(venta.tipo_doc)}</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getDocumentoStyle(venta.tipo_doc)}`}>
                    {venta.tipo_doc || 'N/A'}
                  </span>
                </div>
                <div className="text-xs text-gray-600">Documento</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getTipoFiscalStyle(venta.tipo_f)}`}>
                    Tipo {venta.tipo_f || 'N/A'}
                  </span>
                </div>
                <div className="text-xs text-gray-600">Tipo Fiscal</div>
              </div>
            </div>

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
export default function TablaVentas({
  ventas,
  selectedVentas,
  onSelectVenta,
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

  const sortedVentas = [...ventas].sort((a, b) => {
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
        <span className="ml-3 text-lg">Cargando ventas...</span>
      </div>
    );
  }

  if (ventas.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
        <div className="text-4xl mb-4">📋</div>
        <div className="text-lg font-medium mb-2">No hay ventas registradas</div>
        <div className="text-sm">Las ventas aparecerán aquí cuando se registren</div>
      </div>
    );
  }

  return (
    <div>
      {/* Tabla para escritorio */}
      <TablaEscritorio
        ventas={sortedVentas}
        selectedVentas={selectedVentas}
        onSelectVenta={onSelectVenta}
        onSelectAll={onSelectAll}
        onRowDoubleClick={onRowDoubleClick}
        sortField={sortField}
        sortDirection={sortDirection}
        onSort={handleSort}
      />

      {/* Tarjetas para móvil */}
      <TarjetasMovil
        ventas={sortedVentas}
        selectedVentas={selectedVentas}
        onSelectVenta={onSelectVenta}
        onSelectAll={onSelectAll}
        onRowDoubleClick={onRowDoubleClick}
      />
      
      {/* Footer con estadísticas */}
      <div className="bg-gray-50 px-4 py-3 border-t rounded-b-lg mt-4">
        <div className="flex flex-col sm:flex-row justify-between items-center text-sm text-gray-600 gap-2">
          <span>
            {selectedVentas.length > 0 && (
              <span className="font-medium text-blue-600">
                {selectedVentas.length} de {ventas.length} seleccionados
              </span>
            )}
          </span>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
            <span>
              Total de ventas: <span className="font-medium">{ventas.length}</span>
            </span>
            <span>
              Monto total: <span className="font-medium text-green-600">
                ${ventas.reduce((acc, v) => acc + Number(v.total || 0), 0).toFixed(2)}
              </span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}