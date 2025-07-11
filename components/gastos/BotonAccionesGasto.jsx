// components/gastos/BotonAccionesGasto.jsx
export function BotonAccionesGasto({ 
  onRegistrarGasto, 
  onLimpiarFormulario, 
  onVolverMenu, 
  loading, 
  disabled 
}) {
  return (
    <div className="p-6 bg-gray-50 border-t border-gray-200">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        
        {/* Botón Volver al Menú */}
        <button
          onClick={onVolverMenu}
          disabled={loading}
          className="bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200 order-3 sm:order-1"
        >
          🏠 Volver al Menú
        </button>
        
        {/* Botón Limpiar Formulario */}
        <button
          onClick={onLimpiarFormulario}
          disabled={loading}
          className="bg-yellow-600 hover:bg-yellow-700 disabled:bg-yellow-400 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200 order-2 sm:order-2"
        >
          🗑️ Limpiar Formulario
        </button>
        
        {/* Botón Registrar Gasto */}
        <button
          onClick={onRegistrarGasto}
          disabled={disabled || loading}
          className={`px-8 py-3 rounded-lg font-semibold transition-colors duration-200 order-1 sm:order-3 ${
            disabled || loading
              ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl'
          }`}
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Procesando...
            </div>
          ) : (
            '💾 Registrar Gasto'
          )}
        </button>
      </div>
      
      {/* Mensaje de ayuda */}
      <div className="mt-4 text-center">
        <p className="text-sm text-gray-600">
          {disabled ? (
            <span className="text-amber-600 font-medium">
              ⚠️ Complete todos los campos obligatorios para continuar
            </span>
          ) : (
            <span className="text-green-600">
              ✅ Formulario válido - Puede proceder con el registro
            </span>
          )}
        </p>
      </div>
    </div>
  );
}