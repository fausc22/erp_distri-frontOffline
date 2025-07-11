// components/fondos/TablaMovimientos.jsx

// Formateador de moneda
const formatCurrency = (value) => {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS'
  }).format(value);
};

// Formateador de fecha
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

function TablaEscritorio({ movimientos, cuentas }) {
  return (
    <div className="overflow-x-auto bg-white rounded shadow">
      <table className="w-full">
        <thead className="bg-gray-200">
          <tr>
            <th className="p-3 text-left">ID</th>
            <th className="p-3 text-left">Fecha</th>
            <th className="p-3 text-left">Cuenta</th>
            <th className="p-3 text-left">Tipo</th>
            <th className="p-3 text-left">Origen</th>
            <th className="p-3 text-right">Monto</th>
          </tr>
        </thead>
        <tbody>
          {movimientos.length > 0 ? (
            movimientos.map((movimiento) => {
              const cuentaAsociada = cuentas.find(c => c.id === movimiento.cuenta_id) || { nombre: 'Desconocida' };
              return (
                <tr key={movimiento.id} className="border-b hover:bg-gray-50">
                  <td className="p-3">{movimiento.id}</td>
                  <td className="p-3">{formatDate(movimiento.fecha)}</td>
                  <td className="p-3">{cuentaAsociada.nombre}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      movimiento.tipo === 'INGRESO' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {movimiento.tipo}
                    </span>
                  </td>
                  <td className="p-3">{movimiento.origen}</td>
                  <td className={`p-3 text-right font-semibold ${
                    movimiento.tipo === 'INGRESO' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {formatCurrency(movimiento.monto)}
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan="6" className="p-4 text-center text-gray-500">
                No hay movimientos registrados
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function TarjetasMoviles({ movimientos, cuentas }) {
  return (
    <div className="md:hidden space-y-4">
      {movimientos.length > 0 ? (
        movimientos.map((movimiento) => {
          const cuentaAsociada = cuentas.find(c => c.id === movimiento.cuenta_id) || { nombre: 'Desconocida' };
          return (
            <div key={movimiento.id} className="bg-white p-4 rounded shadow">
              <div className="flex justify-between items-center mb-3">
                <div>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    movimiento.tipo === 'INGRESO' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {movimiento.tipo}
                  </span>
                  <p className="text-sm text-gray-600 mt-1">ID: {movimiento.id}</p>
                </div>
                <div className={`text-right font-bold ${
                  movimiento.tipo === 'INGRESO' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {formatCurrency(movimiento.monto)}
                </div>
              </div>
              
              <div className="grid grid-cols-1 gap-2 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Fecha:</span>
                  <span className="ml-2">{formatDate(movimiento.fecha)}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Cuenta:</span>
                  <span className="ml-2">{cuentaAsociada.nombre}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Origen:</span>
                  <span className="ml-2">{movimiento.origen}</span>
                </div>
                {movimiento.descripcion && (
                  <div>
                    <span className="font-medium text-gray-700">Descripción:</span>
                    <span className="ml-2">{movimiento.descripcion}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })
      ) : (
        <div className="bg-white p-4 rounded shadow text-center text-gray-500">
          No hay movimientos registrados
        </div>
      )}
    </div>
  );
}

export default function TablaMovimientos({ 
  movimientos, 
  cuentas, 
  loading = false 
}) {
  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Cargando movimientos...</span>
      </div>
    );
  }

  return (
    <>
      <TablaEscritorio
        movimientos={movimientos}
        cuentas={cuentas}
      />
      
      <TarjetasMoviles
        movimientos={movimientos}
        cuentas={cuentas}
      />
    </>
  );
}