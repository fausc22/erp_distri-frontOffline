
import { useVenta } from '../../context/VentasContext';

function ControlCantidad({ cantidad, onCantidadChange }) {
  return (
    <div className="flex items-center justify-center space-x-2">
      <button 
        className="bg-gray-300 hover:bg-gray-400 text-black w-6 h-6 rounded flex items-center justify-center"
        onClick={() => onCantidadChange(cantidad - 1)}
      >
        -
      </button>
      <span>{cantidad}</span>
      <button 
        className="bg-gray-300 hover:bg-gray-400 text-black w-6 h-6 rounded flex items-center justify-center"
        onClick={() => onCantidadChange(cantidad + 1)}
      >
        +
      </button>
    </div>
  );
}

function TablaEscritorio({ productos, onActualizarCantidad, onEliminar }) {
  return (
    <div className="hidden md:block overflow-x-auto bg-white rounded shadow text-black">
      <table className="w-full">
        <thead className="bg-gray-200">
          <tr>
            <th className="p-2">Producto</th>
            <th className="p-2">Cantidad</th>
            <th className="p-2">Precio Unit.</th>
            <th className="p-2">Subtotal</th>
            <th className="p-2">Eliminar</th>
          </tr>
        </thead>
        <tbody>
          {productos.length > 0 ? (
            productos.map((prod, idx) => (
              <tr key={idx} className="text-center">
                <td className="p-2">{prod.nombre}</td>
                <td className="p-2">
                  <ControlCantidad
                    cantidad={prod.cantidad}
                    onCantidadChange={(nuevaCantidad) => onActualizarCantidad(idx, nuevaCantidad)}
                  />
                </td>
                <td className="p-2">${Number(prod.precio).toFixed(2)}</td>
                <td className="p-2">${prod.subtotal.toFixed(2)}</td>
                <td className="p-2">
                  <button
                    className="bg-red-500 hover:bg-red-700 text-white px-2 py-1 rounded"
                    onClick={() => onEliminar(idx)}
                  >
                    X
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" className="p-4 text-center text-gray-500">
                No hay productos agregados
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function TarjetasMovil({ productos, onActualizarCantidad, onEliminar }) {
  return (
    <div className="md:hidden space-y-4">
      {productos.length > 0 ? (
        productos.map((prod, idx) => (
          <div key={idx} className="bg-white p-4 rounded shadow">
            <div className="flex justify-between items-center">
              <h4 className="font-semibold">{prod.nombre}</h4>
              <button
                className="bg-red-500 hover:bg-red-700 text-white px-2 py-1 rounded"
                onClick={() => onEliminar(idx)}
              >
                X
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <div>
                <span className="text-gray-600">Cantidad:</span>
                <div className="flex items-center space-x-2 mt-1">
                  <button 
                    className="bg-gray-300 hover:bg-gray-400 text-black w-6 h-6 rounded flex items-center justify-center"
                    onClick={() => onActualizarCantidad(idx, prod.cantidad - 1)}
                  >
                    -
                  </button>
                  <span className="font-medium">{prod.cantidad}</span>
                  <button 
                    className="bg-gray-300 hover:bg-gray-400 text-black w-6 h-6 rounded flex items-center justify-center"
                    onClick={() => onActualizarCantidad(idx, prod.cantidad + 1)}
                  >
                    +
                  </button>
                </div>
              </div>
              <div>
                <span className="text-gray-600">Precio:</span>
                <span className="ml-2 font-medium">${Number(prod.precio).toFixed(2)}</span>
              </div>
              <div>
                <span className="text-gray-600">Subtotal:</span>
                <span className="ml-2 font-medium">${prod.subtotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
        ))
      ) : (
        <div className="bg-white p-4 rounded shadow text-center text-gray-500">
          No hay productos agregados
        </div>
      )}
    </div>
  );
}

export default function ProductosCarritoListaPrecios() {
  const { productos, total, updateCantidad, removeProducto } = useVenta();

  const handleActualizarCantidad = (index, nuevaCantidad) => {
    const cantidadValida = Math.max(1, nuevaCantidad);
    updateCantidad(index, cantidadValida);
  };

  return (
    <div className="mt-6">
      <h3 className="text-xl font-semibold mb-2">Productos Seleccionados</h3>
      
      <TablaEscritorio
        productos={productos}
        onActualizarCantidad={handleActualizarCantidad}
        onEliminar={removeProducto}
      />
      
      <TarjetasMovil
        productos={productos}
        onActualizarCantidad={handleActualizarCantidad}
        onEliminar={removeProducto}
      />
      
      {/* Total para lista de precios */}
      <div className="mt-6 text-right">
        <p className="text-xl font-bold">Total: ${Number(total).toFixed(2)}</p>
      </div>
    </div>
  );
}