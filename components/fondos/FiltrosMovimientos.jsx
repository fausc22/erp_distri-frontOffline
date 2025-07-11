// components/fondos/FiltrosMovimientos.jsx
export default function FiltrosMovimientos({ 
  cuentas, 
  filtros, 
  onFiltroChange, 
  onAplicarFiltros, 
  onLimpiarFiltros 
}) {
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    onFiltroChange(name, value);
  };

  return (
    <div className="bg-white p-4 rounded shadow mb-6">
      <h2 className="text-lg font-semibold mb-4">Filtros de Búsqueda</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Cuenta</label>
          <select
            name="cuenta_id"
            className="w-full p-2 border rounded"
            value={filtros.cuenta_id}
            onChange={handleInputChange}
          >
            <option value="todas">Todas las cuentas</option>
            {cuentas.map(cuenta => (
              <option key={cuenta.id} value={cuenta.id}>{cuenta.nombre}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
          <select
            name="tipo"
            className="w-full p-2 border rounded"
            value={filtros.tipo}
            onChange={handleInputChange}
          >
            <option value="todos">Todos</option>
            <option value="INGRESO">Ingresos</option>
            <option value="EGRESO">Egresos</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Desde</label>
          <input
            type="date"
            name="desde"
            className="w-full p-2 border rounded"
            value={filtros.desde}
            onChange={handleInputChange}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Hasta</label>
          <input
            type="date"
            name="hasta"
            className="w-full p-2 border rounded"
            value={filtros.hasta}
            onChange={handleInputChange}
          />
        </div>
      </div>
      
      <div className="flex mt-4">
        <input
          type="text"
          name="busqueda"
          placeholder="Buscar por origen o descripción..."
          className="flex-1 p-2 border rounded-l"
          value={filtros.busqueda}
          onChange={handleInputChange}
        />
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-r"
          onClick={onAplicarFiltros}
        >
          Buscar
        </button>
      </div>
      
      <div className="mt-2 text-right">
        <button
          className="text-blue-600 hover:text-blue-800 text-sm"
          onClick={onLimpiarFiltros}
        >
          Limpiar filtros
        </button>
      </div>
    </div>
  );
}