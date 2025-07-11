// components/egresos/ModalNuevoEgreso.jsx
export default function ModalNuevoEgreso({
  mostrar,
  formData,
  cuentas,
  loading = false,
  onInputChange,
  onRegistrar,
  onCerrar
}) {
  if (!mostrar) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onRegistrar();
  };

  const opcionesOrigen = [
    { value: 'egreso manual', label: 'Egreso Manual' },
    { value: 'pago', label: 'Pago a Proveedor' },
    { value: 'impuestos', label: 'Impuestos' },
    { value: 'servicios', label: 'Servicios' },
    { value: 'sueldos', label: 'Sueldos' },
    { value: 'alquiler', label: 'Alquiler' },
    { value: 'otro', label: 'Otro' }
  ];

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h2 className="text-xl font-bold mb-4">Registrar Nuevo Egreso</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cuenta <span className="text-red-500">*</span>
            </label>
            <select
              name="cuenta_id"
              className="w-full p-2 border rounded focus:ring-2 focus:ring-red-500 focus:border-red-500"
              value={formData.cuenta_id}
              onChange={onInputChange}
              required
            >
              <option value="">Seleccionar cuenta</option>
              {cuentas.map((cuenta, index) => (
                <option key={index} value={index + 1}>{cuenta}</option>
              ))}
            </select>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Monto <span className="text-red-500">*</span>
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
                className="w-full p-2 border rounded-r focus:ring-2 focus:ring-red-500 focus:border-red-500"
                value={formData.monto}
                onChange={onInputChange}
                placeholder="0.00"
                required
              />
            </div>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Origen <span className="text-red-500">*</span>
            </label>
            <select
              name="origen"
              className="w-full p-2 border rounded focus:ring-2 focus:ring-red-500 focus:border-red-500"
              value={formData.origen}
              onChange={onInputChange}
              required
            >
              {opcionesOrigen.map((opcion) => (
                <option key={opcion.value} value={opcion.value}>
                  {opcion.label}
                </option>
              ))}
            </select>
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descripción (opcional)
            </label>
            <textarea
              name="descripcion"
              className="w-full p-2 border rounded focus:ring-2 focus:ring-red-500 focus:border-red-500"
              rows="3"
              value={formData.descripcion}
              onChange={onInputChange}
              placeholder="Añadir una descripción..."
            />
          </div>
          
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onCerrar}
              disabled={loading}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 transition-colors"
            >
              Cancelar
            </button>
            
            <button
              type="submit"
              disabled={loading || !formData.cuenta_id || !formData.monto || parseFloat(formData.monto) <= 0}
              className={`px-4 py-2 text-white rounded transition-colors ${
                loading || !formData.cuenta_id || !formData.monto || parseFloat(formData.monto) <= 0
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-red-600 hover:bg-red-700'
              }`}
            >
              {loading ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Registrando...
                </div>
              ) : (
                'Registrar Egreso'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}