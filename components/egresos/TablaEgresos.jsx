// components/egresos/TablaEgresos.jsx
import { MdRemoveRedEye, MdPrint } from "react-icons/md";

// Formateadores
const formatCurrency = (value) => {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS'
  }).format(value);
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

function ResumenEgresos({ totalEgresos }) {
  return (
    <div className="bg-gray-800 text-white p-4">
      <div className="flex flex-col md:flex-row justify-between">
        <h2 className="text-xl font-semibold">Resumen de Egresos</h2>
        <div className="mt-2 md:mt-0">
          <span className="mr-2">Total:</span>
          <span className="font-bold text-lg">{formatCurrency(totalEgresos)}</span>
        </div>
      </div>
    </div>
  );
}

function TablaEscritorio({ egresos, onVerDetalle, onImprimir }) {
  const obtenerIdParaDetalle = (egreso) => {
    return (egreso.tipo === 'Compra' || egreso.tipo === 'Gasto') 
      ? egreso.referencia 
      : egreso.id;
  };

  return (
    <div className="hidden md:block overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-3 text-left">Fecha</th>
            <th className="p-3 text-left">Tipo</th>
            <th className="p-3 text-left">Referencia</th>
            <th className="p-3 text-left">Descripción/Origen</th>
            <th className="p-3 text-left">Cuenta</th>
            <th className="p-3 text-right">Monto</th>
            <th className="p-3 text-center">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {egresos.length > 0 ? (
            egresos.map((egreso, index) => (
              <tr key={index} className="border-b hover:bg-gray-50">
                <td className="p-3">{formatDate(egreso.fecha)}</td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    egreso.tipo === 'Compra' 
                      ? 'bg-purple-100 text-purple-800' 
                      : egreso.tipo === 'Gasto'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-orange-100 text-orange-800'
                  }`}>
                    {egreso.tipo}
                  </span>
                </td>
                <td className="p-3">{egreso.referencia || '-'}</td>
                <td className="p-3">{egreso.descripcion || egreso.origen || '-'}</td>
                <td className="p-3">{egreso.cuenta || '-'}</td>
                <td className="p-3 text-right font-semibold text-red-600">
                  {formatCurrency(egreso.monto)}
                </td>
                <td className="p-3 text-center">
                  <div className="flex justify-center space-x-2">
                    <button 
                      onClick={() => onVerDetalle(obtenerIdParaDetalle(egreso), egreso.tipo)}
                      className="bg-blue-500 hover:bg-blue-600 text-white p-1 rounded transition-colors"
                      title="Ver Detalle"
                    >
                      <MdRemoveRedEye size={20} />
                    </button>
                    
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7" className="p-4 text-center text-gray-500">
                No hay egresos registrados
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function TarjetasMoviles({ egresos, onVerDetalle, onImprimir }) {
  const obtenerIdParaDetalle = (egreso) => {
    return (egreso.tipo === 'Compra' || egreso.tipo === 'Gasto') 
      ? egreso.referencia 
      : egreso.id;
  };

  return (
    <div className="md:hidden">
      {egresos.length > 0 ? (
        <div className="divide-y">
          {egresos.map((egreso, index) => (
            <div key={index} className="p-4 hover:bg-gray-50">
              <div className="flex justify-between items-start mb-2">
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                  egreso.tipo === 'Compra' 
                    ? 'bg-purple-100 text-purple-800' 
                    : egreso.tipo === 'Gasto'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-orange-100 text-orange-800'
                }`}>
                  {egreso.tipo}
                </span>
                <span className="text-right font-semibold text-red-600">
                  {formatCurrency(egreso.monto)}
                </span>
              </div>
              
              <div className="mb-2 space-y-1">
                <p className="text-gray-500 text-sm">{formatDate(egreso.fecha)}</p>
                <p className="font-medium">{egreso.descripcion || egreso.origen || '-'}</p>
                <p className="text-sm">Cuenta: {egreso.cuenta || '-'}</p>
                {egreso.referencia && (
                  <p className="text-sm">Ref: {egreso.referencia}</p>
                )}
              </div>
              
              <div className="flex justify-end space-x-2">
                <button 
                  onClick={() => onVerDetalle(obtenerIdParaDetalle(egreso), egreso.tipo)}
                  className="bg-blue-500 hover:bg-blue-600 text-white p-1 rounded transition-colors"
                  title="Ver Detalle"
                >
                  <MdRemoveRedEye size={20} />
                </button>
                
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-4 text-center text-gray-500">
          No hay egresos registrados
        </div>
      )}
    </div>
  );
}

function LoadingState() {
  return (
    <div className="p-8 text-center">
      <div className="flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
      </div>
      <p className="mt-2 text-gray-500">Cargando egresos...</p>
    </div>
  );
}

export default function TablaEgresos({ 
  egresos, 
  totalEgresos,
  loading = false,
  onVerDetalle, 
  onImprimir 
}) {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <ResumenEgresos totalEgresos={totalEgresos} />
      
      {loading ? (
        <LoadingState />
      ) : (
        <>
          <TablaEscritorio
            egresos={egresos}
            onVerDetalle={onVerDetalle}
            onImprimir={onImprimir}
          />
          
          <TarjetasMoviles
            egresos={egresos}
            onVerDetalle={onVerDetalle}
            onImprimir={onImprimir}
          />
        </>
      )}
    </div>
  );
}