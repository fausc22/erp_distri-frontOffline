// components/ingresos/ModalDetalleIngreso.jsx

// Formateadores
const formatCurrency = (value) => {
  // Manejar valores nulos, undefined o no numéricos
  if (value === null || value === undefined || isNaN(value)) {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(0);
  }
  
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS'
  }).format(parseFloat(value) || 0);
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('es-AR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

function DetalleVenta({ venta, productos }) {
  return (
    <div>
      {/* Información de la venta */}
      <div className="bg-green-50 p-4 rounded-lg mb-4">
        <div className="flex flex-col md:flex-row justify-between">
          <div>
            <p><strong>Fecha:</strong> {formatDate(venta.fecha)}</p>
            <p><strong>Cliente:</strong> {venta.cliente_nombre}</p>
            {venta.cliente_documento && (
              <p><strong>Documento:</strong> {venta.cliente_documento}</p>
            )}
          </div>
          <div className="mt-4 md:mt-0">
            <p><strong>Factura:</strong> {venta.factura || 'No especificado'}</p>
            <p><strong>Estado:</strong> {venta.estado}</p>
            <p className="text-lg font-bold text-green-700">
              <strong>Total:</strong> {formatCurrency(venta.total)}
            </p>
          </div>
        </div>
      </div>
      
      {/* Tabla de productos */}
      <h3 className="font-bold text-lg mb-2">Productos</h3>
      <div className="overflow-x-auto bg-white rounded shadow mb-4">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 text-left">Producto</th>
              <th className="p-2 text-center">Cantidad</th>
              <th className="p-2 text-right">Precio</th>
              <th className="p-2 text-right">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {productos && productos.length > 0 ? (
              productos.map((producto, index) => (
                <tr key={index} className="border-b hover:bg-gray-50">
                  <td className="p-2">{producto.producto_nombre}</td>
                  <td className="p-2 text-center">
                    {producto.cantidad} {producto.producto_um || producto.unidad_medida || ''}
                  </td>
                  <td className="p-2 text-right">
                    {formatCurrency(producto.precio_venta || producto.precio_unitario || producto.precio)}
                  </td>
                  <td className="p-2 text-right">
                    {formatCurrency(producto.subtotal || (parseFloat(producto.cantidad || 0) * parseFloat(producto.precio_venta || producto.precio_unitario || producto.precio || 0)))}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="p-4 text-center text-gray-500">
                  No hay productos en esta venta
                </td>
              </tr>
            )}
          </tbody>
          <tfoot className="bg-gray-50">
            <tr>
              <td colSpan="3" className="p-2 text-right font-bold">Total:</td>
              <td className="p-2 text-right font-bold">
                {formatCurrency(venta.total)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

function DetalleIngresoManual({ ingreso }) {
  return (
    <div className="bg-blue-50 p-4 rounded-lg">
      <div className="grid grid-cols-1 gap-3">
        <div className="flex justify-between">
          <span className="font-semibold">ID:</span>
          <span>{ingreso.id}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-semibold">Fecha:</span>
          <span>{formatDate(ingreso.fecha)}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-semibold">Origen:</span>
          <span>{ingreso.origen}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-semibold">Referencia:</span>
          <span>{ingreso.referencia_id || '-'}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-semibold">Cuenta:</span>
          <span>{ingreso.cuenta_nombre}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-semibold">Monto:</span>
          <span className="font-bold text-green-700">
            {formatCurrency(ingreso.monto)}
          </span>
        </div>
        {ingreso.descripcion && (
          <div className="pt-3 border-t border-blue-200">
            <span className="font-semibold">Descripción:</span>
            <p className="text-gray-700 mt-1">{ingreso.descripcion}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ModalDetalleIngreso({
  mostrar,
  detalle,
  onCerrar,
  onImprimir
}) {
  if (!mostrar || !detalle.data) return null;

  // Corregir la lógica para detectar el tipo
  const esVenta = detalle.tipo === 'venta';
  const esIngreso = detalle.tipo === 'ingreso';
  
  const titulo = esVenta ? 'Detalle de Venta' : 'Detalle de Ingreso';

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-screen overflow-y-auto">
        <h2 className="text-xl font-bold mb-4 text-center">{titulo}</h2>
        
        {esVenta ? (
          <DetalleVenta 
            venta={detalle.data.venta} 
            productos={detalle.data.productos} 
          />
        ) : (
          <DetalleIngresoManual ingreso={detalle.data} />
        )}
        
        {/* Botones de acción */}
        <div className="flex justify-end mt-6">
          <button
            onClick={onCerrar}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}