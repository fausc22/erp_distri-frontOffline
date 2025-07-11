import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { axiosAuth } from '../../utils/apiClient';
import { useGenerarPDFUniversal } from '../shared/useGenerarPDFUniversal';

export function useGenerarPDF() {
  const [loading, setLoading] = useState(false);
  
  // Hook unificado para PDFs
  const {
    loading: loadingPDF,
    pdfURL,
    mostrarModalPDF,
    nombreArchivo,
    tituloModal,
    subtituloModal,
    generarPDF,
    descargarPDF,
    compartirPDF,
    cerrarModalPDF
  } = useGenerarPDFUniversal();

  const generarPdfListaPrecios = async (cliente, productos) => {
    if (!cliente || productos.length === 0) {
      toast.error('Debe seleccionar un cliente y agregar al menos un producto.');
      return false;
    }

    // Preparar datos para enviar al servidor
    const datosListaPrecios = {
      cliente: {
        nombre: cliente.nombre,
        cuit: cliente.cuit || '',
        condicion_iva: cliente.condicion_iva || ''
      },
      productos: productos.map(p => ({
        id: p.id,
        nombre: p.nombre,
        unidad_medida: p.unidad_medida || 'Unidad',
        cantidad: p.cantidad,
        precio: parseFloat(p.precio),
        iva: parseFloat(p.iva || 0),
        subtotal: parseFloat(p.subtotal)
      }))
    };

    // Función que realizará la llamada a la API
    const apiCall = () => axiosAuth({
      url: `/ventas/generarpdf-listaprecio`,
      method: 'POST',
      data: datosListaPrecios,
      responseType: 'blob'
    });

    // Configuración para el modal
    const configuracion = {
      nombreArchivo: `Lista_Precios_${cliente.nombre || 'Cliente'}.pdf`,
      titulo: 'Lista de Precios Generada',
      subtitulo: `Lista de precios para ${cliente.nombre}`,
      mensajeExito: 'Lista de precios generada con éxito',
      mensajeError: 'Error al generar la lista de precios'
    };

    return await generarPDF(apiCall, configuracion);
  };

  return {
    loading: loadingPDF,
    pdfURL,
    mostrarModalPDF,
    nombreArchivo,
    tituloModal,
    subtituloModal,
    generarPdfListaPrecios,
    descargarPDF,
    compartirPDF,
    cerrarModalPDF
  };
}