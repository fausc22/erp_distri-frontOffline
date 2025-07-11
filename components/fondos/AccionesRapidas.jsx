// components/fondos/AccionesRapidas.jsx
import { MdArrowDownward, MdArrowUpward, MdSwapHoriz } from "react-icons/md";

export default function AccionesRapidas({ 
  onIngreso, 
  onEgreso, 
  onTransferencia 
}) {
  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-4">Acciones Rápidas</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button 
          onClick={onIngreso}
          className="bg-gradient-to-r from-green-500 to-green-700 hover:from-green-600 hover:to-green-800 text-white p-4 rounded-lg flex flex-col items-center transition-all duration-200"
        >
          <MdArrowDownward className="text-3xl mb-2" />
          <span className="font-semibold">Registrar Ingreso</span>
        </button>
        
        <button 
          onClick={onEgreso}
          className="bg-gradient-to-r from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 text-white p-4 rounded-lg flex flex-col items-center transition-all duration-200"
        >
          <MdArrowUpward className="text-3xl mb-2" />
          <span className="font-semibold">Registrar Egreso</span>
        </button>
        
        <button 
          onClick={onTransferencia}
          className="bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white p-4 rounded-lg flex flex-col items-center transition-all duration-200"
        >
          <MdSwapHoriz className="text-3xl mb-2" />
          <span className="font-semibold">Realizar Transferencia</span>
        </button>
      </div>
    </div>
  );
}