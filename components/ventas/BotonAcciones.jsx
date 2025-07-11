import { ModalPDFUniversal, BotonGenerarPDFUniversal } from '../shared/ModalPDFUniversal';

export function BotonAcciones({ 
  selectedVentas, 
  onImprimirMultiple, 
  imprimiendo,
  onVolverMenu,
  solicitando,
  onSolicitarCAE,
  
  // ✅ NUEVAS PROPS para modal PDF múltiple
  mostrarModalPDFMultiple = false,
  pdfURLMultiple = null,
  nombreArchivoMultiple = '',
  tituloModalMultiple = 'Facturas Generadas Exitosamente',
  subtituloModalMultiple = '',
  onDescargarPDFMultiple,
  onCompartirPDFMultiple,
  onCerrarModalPDFMultiple,

  // 🆕 NUEVAS PROPS para ranking de ventas
  onGenerarRankingVentas,
  generandoRanking = false,
  mostrarModalRanking = false,
  pdfURLRanking = null,
  nombreArchivoRanking = '',
  tituloModalRanking = 'Ranking de Ventas Generado',
  subtituloModalRanking = '',
  onDescargarRanking,
  onCompartirRanking,
  onCerrarModalRanking
}) {
  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4">
        {/* 🆕 BOTÓN RANKING VENTAS - A la izquierda */}
        <div className="flex justify-start">
          <BotonGenerarPDFUniversal
            onGenerar={onGenerarRankingVentas}
            loading={generandoRanking}
            texto="RANKING VENTAS"
            className="bg-orange-600 hover:bg-orange-800 px-6 py-2"
            disabled={selectedVentas.length === 0 || generandoRanking}
            icono="📊"
          />
        </div>

        {/* Botones de la derecha */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button 
            className={`px-6 py-2 rounded text-white font-semibold ${
              solicitando
                ? "bg-gray-500 cursor-not-allowed" 
                : "bg-blue-600 hover:bg-blue-800"
            }`}
            onClick={onSolicitarCAE}
            disabled={selectedVentas.length === 0 || solicitando}
          >
            {solicitando ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                SOLICITANDO...
              </div>
            ) : (
              `SOLICITAR CAE (${selectedVentas.length})`
            )}
          </button>
          
          {/* ✅ BOTÓN ADAPTADO con BotonGenerarPDFUniversal */}
          <BotonGenerarPDFUniversal
            onGenerar={onImprimirMultiple}
            loading={imprimiendo}
            texto={`IMPRIMIR (${selectedVentas.length})`}
            className="bg-purple-600 hover:bg-purple-800 px-6 py-2"
            disabled={selectedVentas.length === 0 || imprimiendo}
          />
          
          <button 
            className="bg-red-600 hover:bg-red-800 px-6 py-2 rounded text-white font-semibold"
            onClick={onVolverMenu}
          >
            Volver al Menú
          </button>
        </div>
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

      {/* 🆕 MODAL PDF para ranking de ventas */}
      <ModalPDFUniversal
        mostrar={mostrarModalRanking}
        pdfURL={pdfURLRanking}
        nombreArchivo={nombreArchivoRanking}
        titulo={tituloModalRanking}
        subtitulo={subtituloModalRanking}
        onDescargar={onDescargarRanking}
        onCompartir={onCompartirRanking}
        onCerrar={onCerrarModalRanking}
        zIndex={70} // Z-index más alto por si se superpone
      />
    </>
  );
}