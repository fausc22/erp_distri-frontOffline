export function ModalAnulacionVenta({ 
  mostrar, 
  
  onConfirmar, 
  onCancelar,
  loading = false 
}) {
  if (!mostrar) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h3 className="text-xl font-bold mb-4 text-center">Anular Pedido</h3>
        <div className="text-center mb-6">
          <p className="mb-2">
            ¿Deseas anular el pedido? 
             <span className="font-bold">SE QUITARAN LOS FONDOS DE LA CUENTA</span>
          </p>
        </div>
        <div className="flex justify-center gap-4">
          <button
            onClick={onConfirmar}
            disabled={loading}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded font-semibold disabled:opacity-50"
          >
            {loading ? 'Procesando...' : 'Sí, Confirmar'}
          </button>
          <button
            onClick={onCancelar}
            disabled={loading}
            className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded font-semibold disabled:opacity-50"
          >
            No, Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}

export function ModalConfirmacionSalida({ mostrar, onConfirmar, onCancelar }) {
  if (!mostrar) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h3 className="text-xl font-bold mb-4 text-center">
          ¿Estás seguro que deseas salir?
        </h3>
        <div className="text-center mb-6">
          <p className="mb-2">Se perderán los datos guardados.</p>
        </div>
        <div className="flex justify-center gap-4">
          <button
            onClick={onConfirmar}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded font-semibold"
          >
            Sí, Salir
          </button>
          <button
            onClick={onCancelar}
            className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded font-semibold"
          >
            No, Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}