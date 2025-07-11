export function BotonAccionesCompra({ 
  onConfirmarCompra, 
  onVolverMenu,
  loading = false,
  disabled = false
}) {
  return (
    <div className="flex flex-col sm:flex-row justify-end mt-6 gap-4">
      <button 
        className={`px-6 py-2 rounded text-white font-semibold ${
          loading || disabled
            ? "bg-gray-500 cursor-not-allowed" 
            : "bg-green-600 hover:bg-green-800"
        }`}
        onClick={onConfirmarCompra}
        disabled={loading || disabled}
      >
        {loading ? (
          <div className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            PROCESANDO...
          </div>
        ) : (
          "Confirmar Compra"
        )}
      </button>
      <button 
        className="bg-red-600 hover:bg-red-800 px-6 py-2 rounded text-white font-semibold"
        onClick={onVolverMenu}
        disabled={loading}
      >
        Volver al Menú
      </button>
    </div>
  );
}