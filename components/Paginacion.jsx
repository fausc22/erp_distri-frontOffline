import { Fragment } from 'react';

export function Paginacion({
  datosOriginales,
  paginaActual,
  registrosPorPagina,
  totalPaginas,
  indexOfPrimero,
  indexOfUltimo,
  onCambiarPagina,
  onCambiarRegistrosPorPagina
}) {
  if (datosOriginales.length === 0) return null;

  return (
    <>
      {/* Paginación para escritorio */}
      <div className="hidden md:flex items-center justify-between p-4 border-t bg-white rounded-b">
        <div className="flex items-center">
          <span className="mr-2">Mostrar</span>
          <select 
            className="border rounded px-2 py-1"
            value={registrosPorPagina}
            onChange={(e) => onCambiarRegistrosPorPagina(Number(e.target.value))}
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
          <span className="ml-2">registros por página</span>
        </div>
        
        <div className="flex items-center">
          <span className="mr-4">
            Mostrando {indexOfPrimero + 1} a {Math.min(indexOfUltimo, datosOriginales.length)} de {datosOriginales.length} registros
          </span>
          
          <div className="flex">
            <button 
              onClick={() => onCambiarPagina(1)}
              disabled={paginaActual === 1}
              className={`px-3 py-1 border rounded-l ${paginaActual === 1 ? 'bg-gray-100 text-gray-400' : 'hover:bg-gray-100'}`}
            >
              ⟪
            </button>
            <button 
              onClick={() => onCambiarPagina(paginaActual - 1)}
              disabled={paginaActual === 1}
              className={`px-3 py-1 border-t border-b ${paginaActual === 1 ? 'bg-gray-100 text-gray-400' : 'hover:bg-gray-100'}`}
            >
              ⟨
            </button>
            
            {/* Generar botones de página */}
            {Array.from({ length: totalPaginas }, (_, i) => i + 1)
              .filter(num => 
                num === 1 || 
                num === totalPaginas || 
                (num >= paginaActual - 1 && num <= paginaActual + 1)
              )
              .map((numero, index, array) => {
                const mostrarPuntosSuspensivos = index > 0 && numero - array[index - 1] > 1;
                
                return (
                  <Fragment key={numero}>
                    {mostrarPuntosSuspensivos && (
                      <span className="px-3 py-1 border-t border-b">...</span>
                    )}
                    <button 
                      onClick={() => onCambiarPagina(numero)}
                      className={`px-3 py-1 border-t border-b ${
                        paginaActual === numero ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'
                      }`}
                    >
                      {numero}
                    </button>
                  </Fragment>
                );
              })
            }
            
            <button 
              onClick={() => onCambiarPagina(paginaActual + 1)}
              disabled={paginaActual === totalPaginas}
              className={`px-3 py-1 border-t border-b ${paginaActual === totalPaginas ? 'bg-gray-100 text-gray-400' : 'hover:bg-gray-100'}`}
            >
              ⟩
            </button>
            <button 
              onClick={() => onCambiarPagina(totalPaginas)}
              disabled={paginaActual === totalPaginas}
              className={`px-3 py-1 border rounded-r ${paginaActual === totalPaginas ? 'bg-gray-100 text-gray-400' : 'hover:bg-gray-100'}`}
            >
              ⟫
            </button>
          </div>
        </div>
      </div>

      {/* Paginación para móvil */}
      <div className="md:hidden bg-white p-4 rounded shadow">
        <div className="flex justify-between items-center">
          <button 
            onClick={() => onCambiarPagina(paginaActual - 1)}
            disabled={paginaActual === 1}
            className={`px-3 py-1 rounded ${paginaActual === 1 ? 'bg-gray-100 text-gray-400' : 'bg-blue-500 text-white'}`}
          >
            Anterior
          </button>
          
          <span>
            Página {paginaActual} de {totalPaginas}
          </span>
          
          <button 
            onClick={() => onCambiarPagina(paginaActual + 1)}
            disabled={paginaActual === totalPaginas}
            className={`px-3 py-1 rounded ${paginaActual === totalPaginas ? 'bg-gray-100 text-gray-400' : 'bg-blue-500 text-white'}`}
          >
            Siguiente
          </button>
        </div>
        
        <div className="mt-2">
          <select 
            className="border rounded w-full p-2"
            value={registrosPorPagina}
            onChange={(e) => onCambiarRegistrosPorPagina(Number(e.target.value))}
          >
            <option value={5}>5 por página</option>
            <option value={10}>10 por página</option>
            <option value={20}>20 por página</option>
            <option value={50}>50 por página</option>
          </select>
        </div>
      </div>
    </>
  );
}