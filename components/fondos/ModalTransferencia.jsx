// components/fondos/ModalTransferencia.jsx
export default function ModalTransferencia({ 
  mostrar, 
  cuentas,
  formData, 
  loading = false,
  onInputChange, 
  onGuardar, 
  onCerrar 
}) {
  if (!mostrar) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onGuardar();
  };

  // Filtrar cuentas para origen y destino
  const cuentasOrigen = cuentas.filter(cuenta => cuenta.id !== formData.cuenta_destino);
  const cuentasDestino = cuentas.filter(cuenta => cuenta.id !== formData.cuenta_origen);

  // Obtener información de las cuentas seleccionadas
  const cuentaOrigen = cuentas.find(c => c.id === formData.cuenta_origen);
  const cuentaDestino = cuentas.find(c => c.id === formData.cuenta_destino);

  // Validar si la transferencia es válida
  const esTransferenciaValida = 
    formData.cuenta_origen && 
    formData.cuenta_destino && 
    formData.cuenta_origen !== formData.cuenta_destino &&
    formData.monto > 0 &&
    cuentaOrigen &&
    parseFloat(cuentaOrigen.saldo) >= parseFloat(formData.monto);

  const saldoInsuficiente = 
    cuentaOrigen && 
    formData.monto > 0 && 
    parseFloat(cuentaOrigen.saldo) < parseFloat(formData.monto);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h2 className="text-xl font-bold mb-4">Transferencia entre Cuentas</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cuenta de Origen <span className="text-red-500">*</span>
            </label>
            <select
              name="cuenta_origen"
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={formData.cuenta_origen}
              onChange={onInputChange}
              required
            >
              <option value="">Seleccionar cuenta de origen</option>
              {cuentasOrigen.map(cuenta => (
                <option key={cuenta.id} value={cuenta.id}>
                  {cuenta.nombre} - Saldo: ${parseFloat(cuenta.saldo).toFixed(2)}
                </option>
              ))}
            </select>
            {cuentaOrigen && (
              <p className="text-xs text-gray-600 mt-1">
                Saldo disponible: ${parseFloat(cuentaOrigen.saldo).toFixed(2)}
              </p>
            )}
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cuenta de Destino <span className="text-red-500">*</span>
            </label>
            <select
              name="cuenta_destino"
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={formData.cuenta_destino}
              onChange={onInputChange}
              required
            >
              <option value="">Seleccionar cuenta de destino</option>
              {cuentasDestino.map(cuenta => (
                <option key={cuenta.id} value={cuenta.id}>
                  {cuenta.nombre}
                </option>
              ))}
            </select>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Monto a Transferir <span className="text-red-500">*</span>
            </label>
            <div className="flex">
              <span className="inline-flex items-center px-3 text-gray-900 bg-gray-200 border border-r-0 border-gray-300 rounded-l-md">
                $
              </span>
              <input
                type="number"
                name="monto"
                step="0.01"
                min="0.01"
                className={`w-full p-2 border rounded-r focus:ring-2 ${
                  saldoInsuficiente 
                    ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                    : 'focus:ring-blue-500 focus:border-blue-500'
                }`}
                value={formData.monto}
                onChange={onInputChange}
                placeholder="0.00"
                required
              />
            </div>
            {saldoInsuficiente && (
              <p className="text-xs text-red-600 mt-1">
                Saldo insuficiente en la cuenta de origen
              </p>
            )}
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción (opcional)</label>
            <textarea
              name="descripcion"
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows="2"
              value={formData.descripcion}
              onChange={onInputChange}
              placeholder="Motivo de la transferencia..."
            />
          </div>
          
          {/* Resumen de la transferencia */}
          {formData.cuenta_origen && formData.cuenta_destino && formData.monto > 0 && (
            <div className="mb-6 p-3 bg-blue-50 rounded border border-blue-200">
              <h4 className="font-medium text-blue-800 mb-2">Resumen de Transferencia:</h4>
              <div className="text-sm text-blue-700 space-y-1">
                <p><strong>Desde:</strong> {cuentaOrigen?.nombre}</p>
                <p><strong>Hacia:</strong> {cuentaDestino?.nombre}</p>
                <p><strong>Monto:</strong> ${parseFloat(formData.monto).toFixed(2)}</p>
                {cuentaOrigen && (
                  <p><strong>Saldo restante origen:</strong> ${(parseFloat(cuentaOrigen.saldo) - parseFloat(formData.monto)).toFixed(2)}</p>
                )}
              </div>
            </div>
          )}
          
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onCerrar}
              disabled={loading}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || !esTransferenciaValida}
              className={`px-4 py-2 text-white rounded ${
                loading || !esTransferenciaValida
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {loading ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Procesando...
                </div>
              ) : (
                'Realizar Transferencia'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}