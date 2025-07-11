// hooks/ventas/useRankingVentas.js
import { axiosAuth } from '../../utils/apiClient';
import { useGenerarPDFUniversal } from '../shared/useGenerarPDFUniversal';
import { toast } from 'react-hot-toast';

export function useRankingVentas() {
  const {
    loading: generandoRanking,
    pdfURL: pdfURLRanking,
    mostrarModalPDF: mostrarModalRanking,
    nombreArchivo: nombreArchivoRanking,
    tituloModal: tituloModalRanking,
    subtituloModal: subtituloModalRanking,
    generarPDF,
    descargarPDF: descargarRanking,
    compartirPDF: compartirRanking,
    cerrarModalPDF: cerrarModalRanking
  } = useGenerarPDFUniversal();

  const generarRankingVentas = async (ventasSeleccionadas) => {
    if (!ventasSeleccionadas || ventasSeleccionadas.length === 0) {
      toast.error("Seleccione al menos una venta para generar el ranking");
      return false;
    }

    // Obtener la fecha de hoy para el ranking
    const fechaHoy = new Date().toISOString().split('T')[0];

    // Preparar los datos de las ventas para el backend
    const ventasData = ventasSeleccionadas.map(venta => ({
      cliente_nombre: venta.cliente_nombre,
      direccion: venta.cliente_direccion || '',
      telefono: venta.cliente_telefono || '',
      email: venta.cliente_email || '',
      dni: venta.cliente_dni || venta.cliente_cuit || '',
      subtotal: Number(venta.subtotal || 0),
      iva_total: Number(venta.iva_total || 0),
      total: Number(venta.total || 0)
    }));

    console.log('📊 Generando ranking de ventas:', {
      fecha: fechaHoy,
      cantidadVentas: ventasData.length,
      ventasData: ventasData.slice(0, 2) // Solo los primeros 2 para debug
    });

    const apiCall = () => axiosAuth.post(
      '/ventas/generarpdf-ranking-ventas',
      { 
        fecha: fechaHoy,
        ventas: ventasData
      },
      { responseType: 'blob' }
    );

    const configuracion = {
      nombreArchivo: `Ranking_Ventas_${fechaHoy}.pdf`,
      titulo: 'Ranking de Ventas Generado',
      subtitulo: `${ventasSeleccionadas.length} ventas incluidas - ${fechaHoy}`,
      mensajeExito: `Ranking de ventas generado con éxito (${ventasSeleccionadas.length} ventas)`,
      mensajeError: 'Error al generar el ranking de ventas'
    };

    return await generarPDF(apiCall, configuracion);
  };

  return {
    // Estados
    generandoRanking,
    pdfURLRanking,
    mostrarModalRanking,
    nombreArchivoRanking,
    tituloModalRanking,
    subtituloModalRanking,
    
    // Funciones
    generarRankingVentas,
    descargarRanking,
    compartirRanking,
    cerrarModalRanking
  };
}