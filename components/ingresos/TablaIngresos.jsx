// components/ingresos/TablaIngresos.jsx
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

function ResumenIngresos({ totalIngresos }) {
  return (
    <div className="bg-gray-800 text-white p-4">
      <div className="flex flex-col md:flex-row justify-between">
        <h2 className="text-xl font-semibold">Resumen de Ingresos</h2>
        <div className="mt-2 md:mt-0">
          <span className="mr-2">Total:</span>
          <span className="font-bold text-lg">{formatCurrency(totalIngresos)}</span>
        </div>
      </div>
    </div>
  );
}

function TablaEscritorio({ ingresos, onVerDetalle, onImprimir }) {
  const obtenerIdParaDetalle = (ingreso) => {
    return ingreso.tipo === 'Venta' ? ingreso.referencia : ingreso.id;
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
          {ingresos.length > 0 ? (
            ingresos.map((ingreso, index) => (
              <tr key={index} className="border-b hover:bg-gray-50">
                <td className="p-3">{formatDate(ingreso.fecha)}</td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    ingreso.tipo === 'Venta' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {ingreso.tipo}
                  </span>
                </td>
                <td className="p-3">{ingreso.referencia || '-'}</td>
                <td className="p-3">{ingreso.descripcion || ingreso.origen || '-'}</td>
                <td className="p-3">{ingreso.cuenta || '-'}</td>
                <td className="p-3 text-right font-semibold text-green-600">
                  {formatCurrency(ingreso.monto)}
                </td>
                <td className="p-3 text-center">
                  <div className="flex justify-center space-x-2">
                    <button 
                      onClick={() => onVerDetalle(obtenerIdParaDetalle(ingreso), ingreso.tipo)}
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
                No hay ingresos registrados
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function TarjetasMoviles({ ingresos, onVerDetalle, onImprimir }) {
  const obtenerIdParaDetalle = (ingreso) => {
    return ingreso.tipo === 'Venta' ? ingreso.referencia : ingreso.id;
  };

  return (
    <div className="md:hidden">
      {ingresos.length > 0 ? (
        <div className="divide-y">
          {ingresos.map((ingreso, index) => (
            <div key={index} className="p-4 hover:bg-gray-50">
              <div className="flex justify-between items-start mb-2">
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                  ingreso.tipo === 'Venta' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {ingreso.tipo}
                </span>
                <span className="text-right font-semibold text-green-600">
                  {formatCurrency(ingreso.monto)}
                </span>
              </div>
              
              <div className="mb-2 space-y-1">
                <p className="text-gray-500 text-sm">{formatDate(ingreso.fecha)}</p>
                <p className="font-medium">{ingreso.descripcion || ingreso.origen || '-'}</p>
                <p className="text-sm">Cuenta: {ingreso.cuenta || '-'}</p>
                {ingreso.referencia && (
                  <p className="text-sm">Ref: {ingreso.referencia}</p>
                )}
              </div>
              
              <div className="flex justify-end space-x-2">
                <button 
                  onClick={() => onVerDetalle(obtenerIdParaDetalle(ingreso), ingreso.tipo)}
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
          No hay ingresos registrados
        </div>
      )}
    </div>
  );
}

function LoadingState() {
  return (
    <div className="p-8 text-center">
      <div className="flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
      <p className="mt-2 text-gray-500">Cargando ingresos...</p>
    </div>
  );
}

export default function TablaIngresos({ 
  ingresos, 
  totalIngresos,
  loading = false,
  onVerDetalle, 
  onImprimir 
}) {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <ResumenIngresos totalIngresos={totalIngresos} />
      
      {loading ? (
        <LoadingState />
      ) : (
        <>
          <TablaEscritorio
            ingresos={ingresos}
            onVerDetalle={onVerDetalle}
            onImprimir={onImprimir}
          />
          
          <TarjetasMoviles
            ingresos={ingresos}
            onVerDetalle={onVerDetalle}
            onImprimir={onImprimir}
          />
        </>
      )}
    </div>
  );
}