// components/remitos/FiltrosHistorialRemitos.jsx
import { useState, useEffect } from 'react';
import { MdFilterList, MdClear, MdExpandMore, MdExpandLess } from 'react-icons/md';

export default function FiltrosHistorialRemitos({ 
  filtros, 
  onFiltrosChange, 
  onLimpiarFiltros,
  user,
  totalRemitos = 0,
  remitosFiltrados = 0,
  remitosOriginales = []
}) {
  const [expandido, setExpandido] = useState(false);

  // Estados únicos extraídos de los remitos
  const [ciudadesUnicas, setCiudadesUnicas] = useState([]);
  const [provinciasUnicas, setProvinciasUnicas] = useState([]);
  const [clientesUnicos, setClientesUnicos] = useState([]);
  const [empleadosUnicos, setEmpleadosUnicos] = useState([]);
  const [loadingDatos, setLoadingDatos] = useState(false);

  const esGerente = user?.rol === 'GERENTE';

  // Cargar datos únicos para autocompletado
  useEffect(() => {
    if (expandido) {
      cargarDatosUnicos();
      if (esGerente && remitosOriginales.length > 0) {
        extraerEmpleadosUnicos();
      }
    }
  }, [expandido, remitosOriginales, esGerente]);

  const cargarDatosUnicos = async () => {
    setLoadingDatos(true);
    try {
      if (remitosOriginales.length > 0) {
        extraerDatosDeLocal();
      }
    } catch (error) {
      console.error('Error cargando datos para filtros:', error);
      if (remitosOriginales.length > 0) {
        extraerDatosDeLocal();
      }
    } finally {
      setLoadingDatos(false);
    }
  };

  // Extraer empleados únicos de los remitos existentes
  const extraerEmpleadosUnicos = () => {
    if (!remitosOriginales || remitosOriginales.length === 0) return;

    const empleados = [...new Set(
      remitosOriginales
        .map(remito => remito.empleado_nombre)
        .filter(nombre => nombre && nombre.trim() !== '' && nombre !== 'No especificado')
    )].sort();

    setEmpleadosUnicos(empleados);
    console.log('👥 Empleados únicos extraídos de remitos:', empleados);
  };

  // Extraer datos localmente de los remitos
  const extraerDatosDeLocal = () => {
    const ciudades = [...new Set(
      remitosOriginales
        .map(remito => remito.cliente_ciudad)
        .filter(ciudad => ciudad && ciudad.trim() !== '' && ciudad !== 'No especificada')
    )].sort();

    const provincias = [...new Set(
      remitosOriginales
        .map(remito => remito.cliente_provincia)
        .filter(provincia => provincia && provincia.trim() !== '' && provincia !== 'No especificada')
    )].sort();

    const clientes = [...new Set(
      remitosOriginales
        .map(remito => remito.cliente_nombre)
        .filter(cliente => cliente && cliente.trim() !== '' && cliente !== 'Cliente no especificado')
    )].sort();

    setCiudadesUnicas(ciudades);
    setProvinciasUnicas(provincias);
    setClientesUnicos(clientes);
    console.log('📊 Datos extraídos localmente:', { 
      ciudades: ciudades.length, 
      provincias: provincias.length,
      clientes: clientes.length 
    });
  };

  const handleFiltroChange = (campo, valor) => {
    onFiltrosChange({
      ...filtros,
      [campo]: valor
    });
  };

  const limpiarTodosFiltros = () => {
    onLimpiarFiltros();
  };

  const hayFiltrosActivos = () => {
    return Object.values(filtros).some(valor => valor && valor !== '');
  };

  const contarFiltrosActivos = () => {
    return Object.values(filtros).filter(valor => valor && valor !== '').length;
  };

  return (
    <div className="bg-white border rounded-lg shadow-sm mb-4">
      {/* Header del filtro */}
      <div 
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setExpandido(!expandido)}
      >
        <div className="flex items-center gap-3">
          <MdFilterList className="text-green-600" size={24} />
          <div>
            <h3 className="font-semibold text-gray-800">Filtros de Búsqueda</h3>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span>
                Mostrando {remitosFiltrados} de {totalRemitos} remitos
              </span>
              {hayFiltrosActivos() && (
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                  {contarFiltrosActivos()} filtro{contarFiltrosActivos() !== 1 ? 's' : ''} activo{contarFiltrosActivos() !== 1 ? 's' : ''}
                </span>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {hayFiltrosActivos() && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                limpiarTodosFiltros();
              }}
              className="text-red-600 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-colors"
              title="Limpiar todos los filtros"
            >
              <MdClear size={20} />
            </button>
          )}
          <div className="text-gray-400">
            {expandido ? <MdExpandLess size={24} /> : <MdExpandMore size={24} />}
          </div>
        </div>
      </div>

      {/* Panel de filtros expandible */}
      <div className={`transition-all duration-300 ease-in-out ${
        expandido ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
      } overflow-hidden`}>
        <div className="px-4 pb-4 border-t border-gray-200">
          <div className={`grid gap-4 mt-4 ${
            esGerente 
              ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6' 
              : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-5'
          }`}>
            
            {/* Filtro por Cliente */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cliente
              </label>
              <input
                type="text"
                value={filtros.cliente || ''}
                onChange={(e) => handleFiltroChange('cliente', e.target.value)}
                placeholder="Buscar cliente..."
                list="clientes-list"
                className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              <datalist id="clientes-list">
                {clientesUnicos.map((cliente, index) => (
                  <option key={index} value={cliente} />
                ))}
              </datalist>
            </div>

            {/* Filtro por Ciudad */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ciudad
              </label>
              <input
                type="text"
                value={filtros.ciudad || ''}
                onChange={(e) => handleFiltroChange('ciudad', e.target.value)}
                placeholder="Buscar ciudad..."
                list="ciudades-list"
                className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              <datalist id="ciudades-list">
                {ciudadesUnicas.map((ciudad, index) => (
                  <option key={index} value={ciudad} />
                ))}
              </datalist>
            </div>

            {/* Filtro por Provincia */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Provincia
              </label>
              <input
                type="text"
                value={filtros.provincia || ''}
                onChange={(e) => handleFiltroChange('provincia', e.target.value)}
                placeholder="Buscar provincia..."
                list="provincias-list"
                className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              <datalist id="provincias-list">
                {provinciasUnicas.map((provincia, index) => (
                  <option key={index} value={provincia} />
                ))}
              </datalist>
            </div>

            {/* Filtro por Estado */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estado
              </label>
              <select
                value={filtros.estado || ''}
                onChange={(e) => handleFiltroChange('estado', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">Todos los estados</option>
                <option value="Activo">✅ Activo</option>
                <option value="Entregado">📦 Entregado</option>
                <option value="Pendiente">⏳ Pendiente</option>
                <option value="Cancelado">❌ Cancelado</option>
              </select>
            </div>

            {/* Filtro por Empleado (solo para gerente) */}
            {esGerente && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Empleado
                </label>
                <select
                  value={filtros.empleado || ''}
                  onChange={(e) => handleFiltroChange('empleado', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">Todos los empleados</option>
                  {empleadosUnicos.map((empleado, index) => (
                    <option key={index} value={empleado}>
                      {empleado}
                    </option>
                  ))}
                </select>
                {loadingDatos && (
                  <div className="text-xs text-gray-500 mt-1">Cargando empleados...</div>
                )}
              </div>
            )}

            {/* Filtro por Fecha */}
            <div className={`${esGerente ? 'xl:col-span-1' : 'lg:col-span-1'}`}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha
              </label>
              <div className="space-y-2">
                <input
                  type="date"
                  value={filtros.fechaDesde || ''}
                  onChange={(e) => handleFiltroChange('fechaDesde', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  title="Fecha desde"
                />
                <input
                  type="date"
                  value={filtros.fechaHasta || ''}
                  onChange={(e) => handleFiltroChange('fechaHasta', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  title="Fecha hasta"
                />
              </div>
            </div>
          </div>

          {/* Botones de acción para móvil */}
          <div className="flex flex-col sm:flex-row gap-2 mt-4 sm:justify-end">
            {hayFiltrosActivos() && (
              <button
                onClick={limpiarTodosFiltros}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
              >
                <MdClear size={16} />
                Limpiar Filtros
              </button>
            )}
            <button
              onClick={() => setExpandido(false)}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium"
            >
              Cerrar Filtros
            </button>
          </div>

          {/* Resumen de filtros activos */}
          {hayFiltrosActivos() && (
            <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="text-sm">
                <span className="font-medium text-green-800">Filtros activos:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {Object.entries(filtros).map(([campo, valor]) => {
                    if (!valor) return null;
                    
                    let etiqueta = campo;
                    switch (campo) {
                      case 'fechaDesde': etiqueta = 'Desde'; break;
                      case 'fechaHasta': etiqueta = 'Hasta'; break;
                      case 'cliente': etiqueta = 'Cliente'; break;
                      case 'ciudad': etiqueta = 'Ciudad'; break;
                      case 'provincia': etiqueta = 'Provincia'; break;
                      case 'estado': etiqueta = 'Estado'; break;
                      case 'empleado': etiqueta = 'Empleado'; break;
                    }
                    
                    return (
                      <span 
                        key={campo}
                        className="inline-flex items-center gap-1 bg-white text-green-800 px-2 py-1 rounded text-xs border border-green-300"
                      >
                        <strong>{etiqueta}:</strong> {valor}
                        <button
                          onClick={() => handleFiltroChange(campo, '')}
                          className="text-green-600 hover:text-green-800 ml-1"
                          title={`Quitar filtro ${etiqueta}`}
                        >
                          ×
                        </button>
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}