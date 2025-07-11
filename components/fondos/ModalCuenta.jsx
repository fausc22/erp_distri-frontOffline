// components/fondos/ModalCuenta.jsx
export default function ModalCuenta({ 
  mostrar, 
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

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h2 className="text-xl font-bold mb-4">Nueva Cuenta</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre de la cuenta <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="nombre"
              className="w-full p-2 border rounded focus:ring-2 focus:ring-green-500 focus:border-green-500"
              value={formData.nombre}
              onChange={onInputChange}
              placeholder="Ej: Caja, Banco, Mercado Pago..."
              required
            />
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Saldo inicial
            </label>
            <div className="flex">
              <span className="inline-flex items-center px-3 text-gray-900 bg-gray-200 border border-r-0 border-gray-300 rounded-l-md">
                $
              </span>
              <input
                type="number"
                name="saldo"
                step="0.01"
                className="w-full p-2 border rounded-r focus:ring-2 focus:ring-green-500 focus:border-green-500"
                value={formData.saldo}
                onChange={onInputChange}
                placeholder="0.00"
              />
            </div>
          </div>
          
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
              disabled={loading || !formData.nombre.trim()}
              className={`px-4 py-2 text-white rounded ${
                loading || !formData.nombre.trim()
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              {loading ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Guardando...
                </div>
              ) : (
                'Guardar'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}