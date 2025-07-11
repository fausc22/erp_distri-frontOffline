import { useState } from 'react';
import { MdSearch, MdDeleteForever, MdKeyboardArrowDown, MdKeyboardArrowUp} from "react-icons/md";
import { usePedidosContext } from '../../context/PedidosContext';
import { useClienteSearch } from '../../hooks/useBusquedaClientes';

function ModalClientes({ resultados, onSeleccionar, onCerrar, loading }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
      <div className="bg-white rounded-lg p-4 max-w-md w-full">
        <h3 className="text-lg font-semibold mb-4 text-black">Seleccionar Cliente</h3>
        <ul className="max-h-60 overflow-y-auto">
          {loading ? (
            <li className="text-gray-500 text-center">Buscando...</li>
          ) : resultados.length > 0 ? (
            resultados.map((cliente, idx) => (
              <li
                key={idx}
                className="p-2 border-b hover:bg-gray-100 cursor-pointer text-black"
                onClick={() => onSeleccionar(cliente)}
              >
                {cliente.nombre}
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

function DetallesClienteListaPrecios({ cliente }) {
  const [expandido, setExpandido] = useState(false);

  if (!cliente) return null;

  return (
    <div className="bg-blue-800 p-4 rounded mt-2 text-sm text-white">
      <div
        className="flex justify-between items-center cursor-pointer"
        onClick={() => setExpandido(!expandido)}
      >
        <p><strong>Cliente:</strong> {cliente.nombre || '-'}</p>
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

export default function ClienteSelectorListaPrecios() {
  const { cliente, setCliente, clearCliente } = usePedidosContext();
  const {
    busqueda,
    setBusqueda,
    resultados,
    loading,
    mostrarModal,
    setMostrarModal,
    buscarCliente,
    limpiarBusqueda
  } = useClienteSearch();

  const handleSeleccionarCliente = (clienteSeleccionado) => {
    setCliente(clienteSeleccionado);
    setMostrarModal(false);
    limpiarBusqueda();
  };

  const handleLimpiarCliente = () => {
    clearCliente();
    limpiarBusqueda();
  };

  return (
    <div className="bg-blue-900 text-white p-6 rounded-lg flex-1 min-w-[300px]">
      <h2 className="text-2xl font-semibold mb-4 text-center">Cliente</h2>
      
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Nombre del cliente"
            value={cliente ? cliente.nombre : busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            disabled={!!cliente}
            className="w-full p-2 rounded text-black"
          />
          <button
            onClick={buscarCliente}
            disabled={!!cliente || loading}
            className="p-2 rounded bg-white text-blue-900 hover:bg-sky-300 transition disabled:opacity-50"
            title="Buscar cliente"
          >
            <MdSearch size={24} />
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

      <DetallesClienteListaPrecios cliente={cliente} />

      {mostrarModal && (
        <ModalClientes
          resultados={resultados}
          onSeleccionar={handleSeleccionarCliente}
          onCerrar={() => setMostrarModal(false)}
          loading={loading}
        />
      )}
    </div>
  );
}