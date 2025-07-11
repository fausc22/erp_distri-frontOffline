export function FiltroCliente({ 
  filtroCliente, 
  onFiltroChange, 
  onLimpiarFiltro,
  remitosFiltered,
  remitosTotal 
}) {
  return (
    <div className="mb-4">
      <div className="flex">
        <input
          type="text"
          placeholder="Filtrar por cliente..."
          className="rounded-l-md border border-gray-300 p-2 flex-grow focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={filtroCliente}
          onChange={onFiltroChange}
        />
        {filtroCliente && (
          <button
            onClick={onLimpiarFiltro}
            className="bg-gray-200 hover:bg-gray-300 px-3 border-t border-b border-r border-gray-300"
            title="Limpiar filtro"
          >
            ✕
          </button>
        )}
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-r-md">
          Filtrar
        </button>
      </div>
      
      {remitosFiltered < remitosTotal && (
        <div className="mt-2 text-sm text-gray-600">
          Mostrando {remitosFiltered} de {remitosTotal} remitos.
          {remitosFiltered === 0 && (
            <button
              onClick={onLimpiarFiltro}
              className="ml-2 text-blue-600 hover:text-blue-800 underline"
            >
              Mostrar todos
            </button>
          )}
        </div>
      )}
    </div>
  );
}