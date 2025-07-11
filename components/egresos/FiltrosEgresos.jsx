// components/egresos/FiltrosEgresos.jsx
import { MdClearAll } from "react-icons/md";

export default function FiltrosEgresos({ 
  mostrar,
  filtros,
  cuentas,
  onFiltroChange,
  onAplicarFiltros,
  onLimpiarFiltros
}) {
  if (!mostrar) return null;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    onFiltroChange(name, value);
  };

  return (
    <div className="bg-gray-50 p-4 rounded-lg mb-6 border">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Filtros Avanzados</h2>
        <button
          className="text-gray-600 hover:text-gray-800 flex items-center transition-colors"
          onClick={onLimpiarFiltros}
        >
          <MdClearAll className="mr-1" /> Limpiar filtros
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Desde
          </label>
          <input
            type="date"
            name="desde"
            className="w-full p-2 border rounded focus:ring-2 focus:ring-red-500 focus:border-red-500"
            value={filtros.desde}
            onChange={handleInputChange}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Hasta
          </label>
          <input
            type="date"
            name="hasta"
            className="w-full p-2 border rounded focus:ring-2 focus:ring-red-500 focus:border-red-500"
            value={filtros.hasta}
            onChange={handleInputChange}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tipo
          </label>
          <select
            name="tipo"
            className="w-full p-2 border rounded focus:ring-2 focus:ring-red-500 focus:border-red-500"
            value={filtros.tipo}
            onChange={handleInputChange}
          >
            <option value="todos">Todos</option>
            <option value="Compra">Compras</option>
            <option value="Gasto">Gastos</option>
            <option value="EGRESO">Egresos manuales</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Cuenta
          </label>
          <select
            name="cuenta"
            className="w-full p-2 border rounded focus:ring-2 focus:ring-red-500 focus:border-red-500"
            value={filtros.cuenta}
            onChange={handleInputChange}
          >
            <option value="todas">Todas</option>
            {cuentas.map((cuenta, index) => (
              <option key={index} value={cuenta}>{cuenta}</option>
            ))}
          </select>
        </div>
      </div>
      
      <div className="flex justify-end mt-4">
        <button
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition-colors"
          onClick={onAplicarFiltros}
        >
          Aplicar Filtros
        </button>
      </div>
    </div>
  );
}