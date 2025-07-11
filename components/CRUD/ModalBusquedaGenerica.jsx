export function ModalBusquedaGenerica({ 
  mostrar, 
  titulo, 
  resultados, 
  onSeleccionar, 
  onCerrar,
  loading = false,
  displayField = 'nombre' // Campo a mostrar en la lista
}) {
  if (!mostrar) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h3 className="text-xl font-bold mb-4">{titulo}</h3>
        
        <div className="max-h-60 overflow-y-auto mb-4">
          {loading ? (
            <div className="flex justify-center items-center h-20">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : resultados.length > 0 ? (
            resultados.map((item, index) => (
              <div 
                key={index} 
                className="p-2 border-b hover:bg-gray-100 cursor-pointer"
                onClick={() => onSeleccionar(item)}
              >
                {item[displayField]}
              </div>
            ))
          ) : (
            <p className="text-gray-500">No se encontraron resultados</p>
          )}
        </div>
        
        <button 
          onClick={onCerrar}
          className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded w-full"
        >
          Cerrar
        </button>
      </div>
    </div>
  );
}