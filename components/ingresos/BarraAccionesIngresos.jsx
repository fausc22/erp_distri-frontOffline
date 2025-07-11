// components/ingresos/BarraAccionesIngresos.jsx
import { MdSearch, MdAdd, MdFilterList, MdAutorenew } from "react-icons/md";

export default function BarraAccionesIngresos({
  busqueda,
  mostrarFiltros,
  onBusquedaChange,
  onBuscar,
  onToggleFiltros,
  onNuevoIngreso,
  onActualizar
}) {
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      onBuscar();
    }
  };

  return (
    <div className="flex flex-col md:flex-row items-center justify-between mb-6">
      {/* Barra de búsqueda */}
      <div className="flex items-center w-full md:w-auto mb-4 md:mb-0">
        <div className="relative flex-1 md:w-64">
          <input
            type="text"
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Buscar..."
            value={busqueda}
            onChange={onBusquedaChange}
            onKeyDown={handleKeyDown}
          />
          <MdSearch className="absolute left-3 top-2.5 text-gray-400 text-xl" />
        </div>
        
        <button
          className="ml-2 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition-colors"
          onClick={onBuscar}
          title="Buscar"
        >
          <MdSearch size={24} />
        </button>
        
        <button
          className={`ml-2 p-2 rounded-lg transition-colors ${
            mostrarFiltros 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-600 hover:bg-gray-700 text-white'
          }`}
          onClick={onToggleFiltros}
          title="Filtros avanzados"
        >
          <MdFilterList size={24} />
        </button>
      </div>
      
      {/* Botones de acción */}
      <div className="flex w-full md:w-auto justify-between md:justify-end space-x-2">
        <button
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
          onClick={onNuevoIngreso}
        >
          <MdAdd className="mr-1" /> Nuevo Ingreso
        </button>
        
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
          onClick={onActualizar}
        >
          <MdAutorenew className="mr-1" /> Actualizar
        </button>
      </div>
    </div>
  );
}