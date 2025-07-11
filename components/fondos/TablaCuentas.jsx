// components/fondos/TablaCuentas.jsx
import { MdArrowDownward, MdArrowUpward, MdSwapHoriz, MdHistory } from "react-icons/md";

// Formateador de moneda
const formatCurrency = (value) => {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS'
  }).format(value);
};

function TablaEscritorio({ 
  cuentas, 
  totalSaldos, 
  onIngreso, 
  onEgreso, 
  onTransferencia, 
  onVerDetalle 
}) {
  return (
    <div className="hidden md:block overflow-x-auto bg-white rounded shadow">
      <table className="w-full">
        <thead className="bg-gray-200">
          <tr>
            <th className="p-3 text-left">ID</th>
            <th className="p-3 text-left">Nombre</th>
            <th className="p-3 text-right">Saldo</th>
            <th className="p-3 text-center">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {cuentas.length > 0 ? (
            cuentas.map((cuenta) => (
              <tr key={cuenta.id} className="border-b hover:bg-gray-50">
                <td className="p-3">{cuenta.id}</td>
                <td className="p-3 font-medium">{cuenta.nombre}</td>
                <td className={`p-3 text-right font-semibold ${
                  parseFloat(cuenta.saldo) >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {formatCurrency(cuenta.saldo)}
                </td>
                <td className="p-3 text-center">
                  <div className="flex justify-center space-x-2">
                    <button 
                      onClick={() => onIngreso(cuenta.id)}
                      className="bg-green-500 hover:bg-green-600 text-white p-2 rounded transition-colors"
                      title="Registrar Ingreso"
                    >
                      <MdArrowDownward />
                    </button>
                    <button 
                      onClick={() => onEgreso(cuenta.id)}
                      className="bg-red-500 hover:bg-red-600 text-white p-2 rounded transition-colors"
                      title="Registrar Egreso"
                    >
                      <MdArrowUpward />
                    </button>
                    <button 
                      onClick={() => onTransferencia(cuenta.id)}
                      className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded transition-colors"
                      title="Realizar Transferencia"
                    >
                      <MdSwapHoriz />
                    </button>
                    <button 
                      onClick={() => onVerDetalle(cuenta)}
                      className="bg-purple-500 hover:bg-purple-600 text-white p-2 rounded transition-colors"
                      title="Ver Historial"
                    >
                      <MdHistory />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" className="p-4 text-center text-gray-500">
                No hay cuentas registradas
              </td>
            </tr>
          )}
        </tbody>
        <tfoot className="bg-gray-100">
          <tr>
            <td colSpan="2" className="p-3 text-right font-bold">Total:</td>
            <td className={`p-3 text-right font-bold ${
              totalSaldos >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {formatCurrency(totalSaldos)}
            </td>
            <td></td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

function TarjetasMoviles({ 
  cuentas, 
  totalSaldos,
  onIngreso, 
  onEgreso, 
  onTransferencia, 
  onVerDetalle 
}) {
  const handleCardClick = (cuenta) => {
    onVerDetalle(cuenta);
  };

  return (
    <div className="md:hidden">
      {/* Header con total */}
      <div className="bg-gradient-to-r from-green-500 to-blue-500 text-white p-4 rounded-t-lg mb-4">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-1">💰 Total en Cuentas</h3>
          <p className={`text-2xl font-bold ${
            totalSaldos >= 0 ? 'text-white' : 'text-red-200'
          }`}>
            {formatCurrency(totalSaldos)}
          </p>
          <p className="text-sm opacity-90">{cuentas.length} cuentas disponibles</p>
        </div>
      </div>

      {/* Tarjetas de cuentas */}
      {cuentas.length > 0 ? (
        <div className="space-y-4">
          {cuentas.map((cuenta) => (
            <div
              key={cuenta.id}
              className="bg-white rounded-lg border-2 border-gray-200 p-4 transition-all duration-200 cursor-pointer hover:border-blue-300 hover:shadow-md"
              onClick={() => handleCardClick(cuenta)}
            >
              {/* Header de la tarjeta */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-lg">💳</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">{cuenta.nombre}</h3>
                    <p className="text-sm text-gray-500">ID: #{cuenta.id}</p>
                  </div>
                </div>
                
                {/* Badge del ID */}
                <div className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs font-medium">
                  #{cuenta.id}
                </div>
              </div>

              {/* Saldo destacado */}
              <div className="mb-4 p-3 bg-gray-50 rounded-lg text-center">
                <div className="text-sm text-gray-600 mb-1">Saldo Actual</div>
                <div className={`text-2xl font-bold ${
                  parseFloat(cuenta.saldo) >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {formatCurrency(cuenta.saldo)}
                </div>
              </div>

              {/* Botones de acción */}
              <div className="grid grid-cols-2 gap-2">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onIngreso(cuenta.id);
                  }}
                  className="bg-green-500 hover:bg-green-600 text-white py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1"
                >
                  <MdArrowDownward className="text-base" />
                  <span>Ingreso</span>
                </button>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onEgreso(cuenta.id);
                  }}
                  className="bg-red-500 hover:bg-red-600 text-white py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1"
                >
                  <MdArrowUpward className="text-base" />
                  <span>Egreso</span>
                </button>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onTransferencia(cuenta.id);
                  }}
                  className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1"
                >
                  <MdSwapHoriz className="text-base" />
                  <span>Transferir</span>
                </button>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onVerDetalle(cuenta);
                  }}
                  className="bg-purple-500 hover:bg-purple-600 text-white py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1"
                >
                  <MdHistory className="text-base" />
                  <span>Historial</span>
                </button>
              </div>

              {/* Footer con indicación */}
              <div className="mt-3 pt-3 border-t border-gray-200 text-center">
                <p className="text-xs text-gray-500">
                  💡 Toca para ver historial completo
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
          <div className="text-4xl mb-4">💳</div>
          <div className="text-lg font-medium mb-2">No hay cuentas registradas</div>
          <div className="text-sm">Crea tu primera cuenta para empezar a gestionar tus fondos</div>
        </div>
      )}

      {/* Footer con resumen */}
      {cuentas.length > 0 && (
        <div className="bg-gray-50 p-4 rounded-b-lg mt-4 border-t">
          <div className="text-center">
            <div className="text-sm text-gray-600 mb-1">💼 Resumen Total</div>
            <div className={`text-xl font-bold ${
              totalSaldos >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {formatCurrency(totalSaldos)}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Distribuido en {cuentas.length} cuentas
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function TablaCuentas({ 
  cuentas, 
  totalSaldos, 
  loading = false,
  onIngreso, 
  onEgreso, 
  onTransferencia, 
  onVerDetalle 
}) {
  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        <span className="ml-2">Cargando cuentas...</span>
      </div>
    );
  }

  return (
    <>
      <TablaEscritorio
        cuentas={cuentas}
        totalSaldos={totalSaldos}
        onIngreso={onIngreso}
        onEgreso={onEgreso}
        onTransferencia={onTransferencia}
        onVerDetalle={onVerDetalle}
      />
      
      <TarjetasMoviles
        cuentas={cuentas}
        totalSaldos={totalSaldos}
        onIngreso={onIngreso}
        onEgreso={onEgreso}
        onTransferencia={onTransferencia}
        onVerDetalle={onVerDetalle}
      />
    </>
  );
}