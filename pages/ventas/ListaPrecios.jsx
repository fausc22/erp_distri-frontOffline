import { useState } from 'react';
import Head from 'next/head';
import { toast } from 'react-hot-toast';
import useAuth from '../../hooks/useAuth';

import { VentaProvider, useVenta } from '../../context/VentasContext';
import { useGenerarPDF } from '../../hooks/ventas/useGenerarPDFListaPrecio';
import { ModalPDFUniversal, BotonGenerarPDFUniversal } from '../../components/shared/ModalPDFUniversal';

import ClienteSelectorListaPrecios from '../../components/ventas/SelectorClientes';
import ProductoSelector from '../../components/ventas/SelectorProductos';
import ProductosCarritoListaPrecios from '../../components/ventas/ProductosCarritoLP';
import { ModalConfirmacionSalida } from '../../components/ventas/ModalesConfirmacion';

function GenerarListaPreciosContent() {
  const { cliente, productos, clearVenta } = useVenta();
  const { 
    loading, 
    pdfURL, 
    mostrarModalPDF,
    nombreArchivo,
    tituloModal,
    subtituloModal,
    generarPdfListaPrecios, 
    descargarPDF, 
    compartirPDF, 
    cerrarModalPDF 
  } = useGenerarPDF();
  
  const [mostrarConfirmacionSalida, setMostrarConfirmacionSalida] = useState(false);

  useAuth();

  const handleGenerarPDF = () => {
    if (!cliente) {
      toast.error('Debe seleccionar un cliente.');
      return;
    }
    
    if (productos.length === 0) {
      toast.error('Debe agregar al menos un producto.');
      return;
    }
    
    generarPdfListaPrecios(cliente, productos);
  };

  const handleConfirmarSalida = () => {
    if (cliente || productos.length > 0) {
      setMostrarConfirmacionSalida(true);
    } else {
      window.location.href = '/';
    }
  };

  const handleSalir = () => {
    cerrarModalPDF();
    window.location.href = '/';
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <Head>
        <title>VERTIMAR | LISTA DE PRECIOS</title>
        <meta name="description" content="Generador de listas de precios" />
      </Head>
      
      <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-6xl">
        <h1 className="text-2xl font-bold mb-4 text-center">LISTA DE PRECIOS</h1>
        
        <div className="flex flex-col md:flex-row gap-6">
          <ClienteSelectorListaPrecios />
          <ProductoSelector />
        </div>

        <ProductosCarritoListaPrecios />
        
        <div className="flex flex-col sm:flex-row justify-end mt-6 gap-4">
          <BotonGenerarPDFUniversal 
            onGenerar={handleGenerarPDF}
            loading={loading}
            texto="Generar Lista de Precios"
          />
          <button 
            className="bg-red-600 hover:bg-red-800 px-6 py-2 rounded text-white font-semibold"
            onClick={handleConfirmarSalida}
          >
            Volver al Menú
          </button>
        </div>
      </div>
      
      {/* Modal PDF Unificado */}
      <ModalPDFUniversal
        mostrar={mostrarModalPDF}
        pdfURL={pdfURL}
        nombreArchivo={nombreArchivo}
        titulo={tituloModal}
        subtitulo={subtituloModal}
        onDescargar={descargarPDF}
        onCompartir={compartirPDF}
        onCerrar={cerrarModalPDF}
        zIndex={70}
      />

      <ModalConfirmacionSalida
        mostrar={mostrarConfirmacionSalida}
        onConfirmar={handleSalir}
        onCancelar={() => setMostrarConfirmacionSalida(false)}
      />
    </div>
  );
}

export default function GenerarListaPrecios() {
  return (
    <VentaProvider>
      <GenerarListaPreciosContent />
    </VentaProvider>
  );
}