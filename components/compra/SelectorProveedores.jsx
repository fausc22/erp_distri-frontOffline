import { useState } from 'react';
import { MdSearch, MdDeleteForever, MdKeyboardArrowUp, MdKeyboardArrowDown } from "react-icons/md";
import { useCompra } from '../../context/ComprasContext';
import { useProveedorSearch } from '../../hooks/compra/useBusquedaProveedores';

function ModalProveedores({ resultados, onSeleccionar, onCerrar, loading }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
      <div className="bg-white rounded-lg p-4 max-w-md w-full">
        <h3 className="text-lg font-semibold mb-4 text-black">Seleccionar Proveedor</h3>
        <ul className="max-h-60 overflow-y-auto">
          {loading ? (
            <li className="text-gray-500 text-center">Buscando...</li>
          ) : resultados.length > 0 ? (
            resultados.map((proveedor, idx) => (
              <li
                key={idx}
                className="p-2 border-b hover:bg-gray-100 cursor-pointer text-black"
                onClick={() => onSeleccionar(proveedor)}
              >
                {proveedor.nombre}
              </li>
            ))
          ) : (
            <li className="text-gray-500">No se encontraron resultados.</li>
          )}
        </ul>
        <button
          onClick={onCerrar}
          className="mt-4 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
        >
          Cerrar
        </button>
      </div>
    </div>
  );
}

function DetallesProveedor({ proveedor, isExpanded, onToggle }) {
  if (!proveedor) return null;

  return (
    <div className="bg-green-800 rounded mt-4 overflow-hidden transition-all duration-300">
      {/* Header - siempre visible */}
      <div 
        className="p-4 cursor-pointer hover:bg-green-700 transition-colors flex items-center justify-between"
        onClick={onToggle}
      >
        <div className="flex-1">
          <p className="font-semibold text-lg">{proveedor.nombre}</p>
          {!isExpanded && (
            <p className="text-sm text-green-200 mt-1">
              {proveedor.cuit ? `CUIT: ${proveedor.cuit}` : 'Click para ver más detalles'}
            </p>
          )}
        </div>
        <div className="ml-4">
          {isExpanded ? (
            <MdKeyboardArrowUp size={24} className="text-green-200" />
          ) : (
            <MdKeyboardArrowDown size={24} className="text-green-200" />
          )}
        </div>
      </div>

      {/* Detalles expandibles */}
      <div 
        className={`transition-all duration-300 ease-in-out ${
          isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-4 pb-4 border-t border-green-700 pt-3 space-y-2">
          <div className="grid grid-cols-1 gap-2 text-sm">
            <div className="flex justify-between">
              <span className="text-green-200">CUIT:</span>
              <span className="font-medium">{proveedor.cuit || '-'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-green-200">Condición IVA:</span>
              <span className="font-medium">{proveedor.condicion_iva || '-'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-green-200">Dirección:</span>
              <span className="font-medium text-right">{proveedor.direccion || '-'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-green-200">Ciudad:</span>
              <span className="font-medium">{proveedor.ciudad || '-'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-green-200">Provincia:</span>
              <span className="font-medium">{proveedor.provincia || '-'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-green-200">Teléfono:</span>
              <span className="font-medium">{proveedor.telefono || '-'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-green-200">Email:</span>
              <span className="font-medium text-right break-all">{proveedor.email || '-'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SelectorProveedores() {
  const { proveedor, setProveedor, clearProveedor } = useCompra();
  const {
    busqueda,
    setBusqueda,
    resultados,
    loading,
    mostrarModal,
    setMostrarModal,
    buscarProveedor,
    limpiarBusqueda
  } = useProveedorSearch();

  // Estado para controlar si los detalles están expandidos
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSeleccionarProveedor = (proveedorSeleccionado) => {
    setProveedor(proveedorSeleccionado);
    setMostrarModal(false);
    limpiarBusqueda();
    // Iniciar contraído cuando se selecciona un proveedor
    setIsExpanded(false);
  };

  const handleLimpiarProveedor = () => {
    clearProveedor();
    limpiarBusqueda();
    setIsExpanded(false);
  };

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="bg-green-900 text-white p-6 rounded-lg flex-1 min-w-[300px]">
      <h2 className="text-2xl font-semibold mb-4 text-center">Proveedor</h2>
      
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Nombre del proveedor"
            value={proveedor ? proveedor.nombre : busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            disabled={!!proveedor}
            className="w-full p-2 rounded text-black placeholder-gray-500 disabled:bg-gray-200"
          />
          <button
            onClick={buscarProveedor}
            disabled={!!proveedor || loading}
            className="p-2 rounded bg-white text-green-900 hover:bg-green-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
            title="Buscar proveedor"
          >
            <MdSearch size={24} />
          </button>
          {proveedor && (
            <button
              onClick={handleLimpiarProveedor}
              className="p-2 rounded bg-white text-red-600 hover:bg-red-100 transition"
              title="Eliminar proveedor"
            >
              <MdDeleteForever size={24} />
            </button>
          )}
        </div>
      </div>

      {/* Detalles del proveedor con funcionalidad de expansión */}
      <DetallesProveedor 
        proveedor={proveedor} 
        isExpanded={isExpanded}
        onToggle={toggleExpanded}
      />

      {/* Indicador visual cuando hay un proveedor seleccionado */}
      {proveedor && (
        <div className="mt-4 p-2 bg-green-700 rounded text-center text-sm">
          <p className="text-green-200">
            ✓ Proveedor seleccionado - {isExpanded ? 'Click arriba para minimizar' : 'Click arriba para ver detalles'}
          </p>
        </div>
      )}

      {mostrarModal && (
        <ModalProveedores
          resultados={resultados}
          onSeleccionar={handleSeleccionarProveedor}
          onCerrar={() => setMostrarModal(false)}
          loading={loading}
        />
      )}
    </div>
  );
}