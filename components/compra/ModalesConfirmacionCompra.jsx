// Formateador de moneda
const formatCurrency = (value) => {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS'
  }).format(value);
};

// Modal de confirmación simple (legacy - mantener para compatibilidad)
export function ModalConfirmacionCompra({ 
  mostrar, 
  proveedor, 
  total, 
  onConfirmar, 
  onCancelar,
  loading = false 
}) {
  if (!mostrar) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h3 className="text-xl font-bold mb-4 text-center">Confirmar Compra</h3>
        <div className="text-center mb-6">
          <p className="mb-2">
            ¿Desea confirmar la compra al proveedor{' '}
            <span className="font-bold">{proveedor?.nombre}</span> por un total de{' '}
            <span className="font-bold text-green-700">{formatCurrency(total)}</span>?
          </p>
          <div className="text-sm text-yellow-700 bg-yellow-50 p-2 rounded mt-2">
            ⚠️ Versión básica - Sin integración de cuentas de fondos
          </div>
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

// Modal de confirmación de salida
export function ModalConfirmacionSalidaCompra({ mostrar, onConfirmar, onCancelar }) {
  if (!mostrar) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h3 className="text-xl font-bold mb-4 text-center">
          ¿Estás seguro que deseas salir?
        </h3>
        <div className="text-center mb-6">
          <p className="mb-2">Se perderán los datos no guardados.</p>
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

// Exportar también el modal completo (se importa desde archivo separado)
export { ModalConfirmacionCompraCompleto } from './ModalConfirmacionCompraCompleto';