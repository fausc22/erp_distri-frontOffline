import { useGasto } from '../../context/GastosContext';

export default function SelectorArchivosGasto() {
  // Usar el contexto en lugar del hook independiente
  const { 
    formData, 
    handleArchivoChange, 
    hayArchivo, 
    getArchivoInfo 
  } = useGasto();

  const archivoInfo = getArchivoInfo();
  const preview = formData.archivoPreview;

  return (
    <div className="mb-6 px-6">
      <label htmlFor="comprobante" className="block text-sm font-medium text-gray-700 mb-2">
        Comprobante (Opcional)
      </label>
      <div className="flex items-center justify-center w-full">
        <label htmlFor="comprobante" className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <svg className="w-8 h-8 mb-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
            </svg>
            <p className="mb-2 text-sm text-gray-500">
              <span className="font-semibold">Haga clic para cargar</span> o arrastre y suelte
            </p>
            <p className="text-xs text-gray-500">PDF, PNG, JPG, DOC, DOCX (Máx. 10MB)</p>
          </div>
          <input 
            id="comprobante" 
            name="comprobante"
            type="file" 
            className="hidden" 
            onChange={handleArchivoChange}
            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
          />
        </label>
      </div>
      
      {/* Mostrar información del archivo seleccionado */}
      {hayArchivo() && archivoInfo && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-start space-x-3">
            {/* Icono del archivo */}
            <div className="flex-shrink-0">
              {preview ? (
                <img 
                  src={preview} 
                  alt="Vista previa" 
                  className="w-16 h-16 object-cover rounded border"
                />
              ) : (
                <div className="w-16 h-16 bg-gray-200 rounded border flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
            
            {/* Información del archivo */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-green-900 truncate">
                📎 {archivoInfo.nombre}
              </p>
              <p className="text-sm text-green-700">
                📏 Tamaño: {archivoInfo.tamaño}
              </p>
              <p className="text-xs text-green-600">
                📋 {archivoInfo.tipo}
              </p>
            </div>
            
            {/* Icono de éxito */}
            <div className="flex-shrink-0">
              <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          
          <div className="mt-3 bg-green-100 p-2 rounded text-xs text-green-800">
            ✅ <strong>Archivo listo para subir.</strong> Se cargará automáticamente después de registrar el gasto.
          </div>
        </div>
      )}
    </div>
  );
}