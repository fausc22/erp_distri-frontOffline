// components/gastos/ModalesConfirmacionGasto.jsx

export function ModalConfirmacionGasto({ 
  mostrar, 
  resumen, 
  onConfirmar, 
  onCancelar, 
  loading 
}) {
  if (!mostrar) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h3 className="text-xl font-bold mb-4 text-center text-blue-800">
          Confirmar Registro de Gasto
        </h3>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h4 className="font-semibold text-blue-800 mb-3">Resumen del gasto:</h4>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="font-medium text-gray-700">Descripción:</span>
              <span className="text-gray-900">{resumen.descripcion}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="font-medium text-gray-700">Monto:</span>
              <span className="text-blue-700 font-bold text-lg">
                {resumen.montoFormateado}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="font-medium text-gray-700">Forma de Pago:</span>
              <span className="text-gray-900">{resumen.formaPago}</span>
            </div>
            
            {resumen.observaciones && (
              <div className="pt-2 border-t border-blue-200">
                <span className="font-medium text-gray-700">Observaciones:</span>
                <p className="text-gray-900 mt-1 text-xs bg-white p-2 rounded border">
                  {resumen.observaciones}
                </p>
              </div>
            )}
            
            {resumen.tieneComprobante && (
              <div className="pt-2 border-t border-blue-200">
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                  </svg>
                  <span className="font-medium text-gray-700">Comprobante:</span>
                  <span className="text-green-700 text-sm font-medium">📎 {resumen.nombreComprobante}</span>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-6">
          <p className="text-sm text-yellow-800">
            <strong>Nota:</strong> Una vez registrado, el gasto quedará asociado a su usuario 
            y fecha actual.{resumen.tieneComprobante ? ' El comprobante se subirá automáticamente.' : ''}
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row justify-between gap-3">
          <button
            onClick={onCancelar}
            disabled={loading}
            className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded font-semibold order-2 sm:order-1"
          >
            Cancelar
          </button>
          
          <button
            onClick={onConfirmar}
            disabled={loading}
            className={`px-6 py-2 rounded text-white font-semibold order-1 sm:order-2 ${
              loading 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Registrando...
              </div>
            ) : (
              'Confirmar y Registrar'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export function ModalConfirmacionSalidaGasto({ 
  mostrar, 
  onConfirmar, 
  onCancelar 
}) {
  if (!mostrar) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h3 className="text-xl font-bold mb-4 text-center text-red-600">
          ¿Salir sin guardar?
        </h3>
        
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800 text-center">
            Tiene datos sin guardar en el formulario.
          </p>
          <p className="text-red-700 text-center mt-2 text-sm">
            Si sale ahora, <strong>se perderán todos los datos ingresados</strong> 
            incluyendo cualquier archivo seleccionado.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row justify-between gap-3">
          <button
            onClick={onCancelar}
            className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded font-semibold order-2 sm:order-1"
          >
            Continuar Editando
          </button>
          
          <button
            onClick={onConfirmar}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded font-semibold order-1 sm:order-2"
          >
            Sí, Salir sin Guardar
          </button>
        </div>
      </div>
    </div>
  );
}