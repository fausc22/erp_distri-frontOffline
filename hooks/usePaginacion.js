import { useState, useMemo } from 'react';

export function usePaginacion(datos, registrosPorPaginaInicial = 10) {
  const [paginaActual, setPaginaActual] = useState(1);
  const [registrosPorPagina, setRegistrosPorPagina] = useState(registrosPorPaginaInicial);

  const datosActuales = useMemo(() => {
    const indexOfUltimo = paginaActual * registrosPorPagina;
    const indexOfPrimero = indexOfUltimo - registrosPorPagina;
    return datos.slice(indexOfPrimero, indexOfUltimo);
  }, [datos, paginaActual, registrosPorPagina]);

  const totalPaginas = Math.ceil(datos.length / registrosPorPagina);

  const cambiarPagina = (numeroPagina) => {
    setPaginaActual(numeroPagina);
  };

  const cambiarRegistrosPorPagina = (cantidad) => {
    setRegistrosPorPagina(cantidad);
    setPaginaActual(1); // Volver a la primera página
  };

  const indexOfPrimero = (paginaActual - 1) * registrosPorPagina;
  const indexOfUltimo = Math.min(indexOfPrimero + registrosPorPagina, datos.length);

  return {
    datosActuales,
    paginaActual,
    registrosPorPagina,
    totalPaginas,
    indexOfPrimero,
    indexOfUltimo,
    cambiarPagina,
    cambiarRegistrosPorPagina
  };
}