// components/egresos/ModalDetalleEgreso.jsx

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

function DetalleCompra({ compra, productos }) {
  return (
    <div>
      {/* Información de la compra */}
      <div className="bg-purple-50 p-4 rounded-lg mb-4">
        <div className="flex flex-col md:flex-row justify-between">
          <div>
            <p><strong>Fecha:</strong> {formatDate(compra.fecha)}</p>
            <p><strong>Proveedor:</strong> {compra.proveedor_nombre}</p>
            {compra.proveedor_cuit && (
              <p><strong>CUIT:</strong> {compra.proveedor_cuit}</p>
            )}
          </div>
          <div className="mt-4 md:mt-0">
            <p><strong>Factura:</strong> {compra.factura || 'No especificado'}</p>
            <p><strong>Estado:</strong> {compra.estado}</p>
            <p className="text-lg font-bold text-purple-700">
              <strong>Total:</strong> {formatCurrency(compra.total)}
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
              <th className="p-2 text-right">Precio Costo</th>
              <th className="p-2 text-right">Precio Venta</th>
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
                  <td className="p-2 text-right">{formatCurrency(producto.costo)}</td>
                  <td className="p-2 text-right">{formatCurrency(producto.precio)}</td>
                  <td className="p-2 text-right">{formatCurrency(producto.subtotal || (parseFloat(producto.cantidad || 0) * parseFloat(producto.costo || 0)))}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="p-4 text-center text-gray-500">
                  No hay productos en esta compra
                </td>
              </tr>
            )}
          </tbody>
          <tfoot className="bg-gray-50">
            <tr>
              <td colSpan="4" className="p-2 text-right font-bold">Total:</td>
              <td className="p-2 text-right font-bold">
                {formatCurrency(compra.total)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

function DetalleGasto({ gasto }) {
  return (
    <div className="bg-red-50 p-4 rounded-lg">
      <div className="grid grid-cols-1 gap-3">
        <div className="flex justify-between">
          <span className="font-semibold">ID:</span>
          <span>{gasto.id}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-semibold">Fecha:</span>
          <span>{formatDate(gasto.fecha)}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-semibold">Descripción:</span>
          <span>{gasto.descripcion}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-semibold">Forma de Pago:</span>
          <span>{gasto.forma_pago}</span>
        </div>
        {gasto.observaciones && (
          <div className="flex justify-between">
            <span className="font-semibold">Observaciones:</span>
            <span>{gasto.observaciones}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span className="font-semibold">Monto:</span>
          <span className="font-bold text-red-700">{formatCurrency(gasto.monto)}</span>
        </div>
      </div>
    </div>
  );
}

function DetalleEgresoManual({ egreso }) {
  return (
    <div className="bg-orange-50 p-4 rounded-lg">
      <div className="grid grid-cols-1 gap-3">
        <div className="flex justify-between">
          <span className="font-semibold">ID:</span>
          <span>{egreso.id}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-semibold">Fecha:</span>
          <span>{formatDate(egreso.fecha)}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-semibold">Origen:</span>
          <span>{egreso.origen}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-semibold">Referencia:</span>
          <span>{egreso.referencia_id || '-'}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-semibold">Cuenta:</span>
          <span>{egreso.cuenta_nombre}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-semibold">Monto:</span>
          <span className="font-bold text-red-700">{formatCurrency(egreso.monto)}</span>
        </div>
        {egreso.descripcion && (
          <div className="pt-3 border-t border-orange-200">
            <span className="font-semibold">Descripción:</span>
            <p className="text-gray-700 mt-1">{egreso.descripcion}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ModalDetalleEgreso({
  mostrar,
  detalle,
  onCerrar,
  onImprimir
}) {
  if (!mostrar || !detalle.data) return null;

  // Corregir la lógica para detectar el tipo
  const esCompra = detalle.tipo === 'compra';
  const esGasto = detalle.tipo === 'gasto';
  const esEgreso = detalle.tipo === 'egreso';

  const titulo = esCompra ? 'Detalle de Compra' 
                : esGasto ? 'Detalle de Gasto' 
                : 'Detalle de Egreso';

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-screen overflow-y-auto">
        <h2 className="text-xl font-bold mb-4 text-center">{titulo}</h2>
        
        {esCompra && (
          <DetalleCompra 
            compra={detalle.data.compra} 
            productos={detalle.data.productos} 
          />
        )}
        
        {esGasto && (
          <DetalleGasto gasto={detalle.data} />
        )}
        
        {esEgreso && (
          <DetalleEgresoManual egreso={detalle.data} />
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