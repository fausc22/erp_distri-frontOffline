import { ModalPDFUniversal, BotonGenerarPDFUniversal } from '../shared/ModalPDFUniversal';

export function BotonAccionesRemitos({ 
  selectedRemitos, 
  onImprimirMultiple, 
  imprimiendo,
  onVolverMenu,
  
  // ✅ NUEVAS PROPS para modal PDF múltiple
  mostrarModalPDFMultiple = false,
  pdfURLMultiple = null,
  nombreArchivoMultiple = '',
  tituloModalMultiple = 'Remitos Generados Exitosamente',
  subtituloModalMultiple = '',
  onDescargarPDFMultiple,
  onCompartirPDFMultiple,
  onCerrarModalPDFMultiple
}) {
  return (
    <>
      <div className="flex flex-col sm:flex-row justify-end mt-6 gap-4">
        {/* ✅ BOTÓN ADAPTADO con BotonGenerarPDFUniversal */}
        <BotonGenerarPDFUniversal
          onGenerar={onImprimirMultiple}
          loading={imprimiendo}
          texto={`IMPRIMIR REMITOS (${selectedRemitos.length})`}
          className="bg-green-600 hover:bg-green-800 px-6 py-2"
          disabled={selectedRemitos.length === 0 || imprimiendo}
        />
        
        <button 
          className="bg-red-600 hover:bg-red-800 px-6 py-2 rounded text-white font-semibold"
          onClick={onVolverMenu}
        >
          Volver al Menú
        </button>
      </div>

      {/* ✅ MODAL PDF para impresiones múltiples */}
      <ModalPDFUniversal
        mostrar={mostrarModalPDFMultiple}
        pdfURL={pdfURLMultiple}
        nombreArchivo={nombreArchivoMultiple}
        titulo={tituloModalMultiple}
        subtitulo={subtituloModalMultiple}
        onDescargar={onDescargarPDFMultiple}
        onCompartir={onCompartirPDFMultiple}
        onCerrar={onCerrarModalPDFMultiple}
        zIndex={60}
      />
    </>
  );
}