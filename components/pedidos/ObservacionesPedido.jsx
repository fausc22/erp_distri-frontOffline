import { usePedidosContext } from '../../context/PedidosContext';

export default function ObservacionesPedidos() {
  const { observaciones, setObservaciones } = usePedidosContext();

  const handleObservacionesChange = (e) => {
    setObservaciones(e.target.value);
  };

  return (
    <div className="mt-6">
      <div className="bg-gray-50 p-4 rounded-lg">
        <label htmlFor="observaciones" className="block text-sm font-medium text-gray-700 mb-2">
          Observaciones del Pedido
        </label>
        <textarea
          id="observaciones"
          name="observaciones"
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
          placeholder="Agregue cualquier observación o nota especial para este pedido..."
          value={observaciones}
          onChange={handleObservacionesChange}
          maxLength={500}
        />
        <div className="mt-1 text-right">
          <span className="text-xs text-gray-500">
            {observaciones.length}/500 caracteres
          </span>
        </div>
      </div>
    </div>
  );
}