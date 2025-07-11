import { useFormularioGasto } from '../../hooks/gastos/useFormularioGasto';

function CampoDescripcion({ formData, opcionesDescripcion, onChange }) {
  return (
    <div className="mb-6">
      <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700 mb-2">
        Descripción <span className="text-red-500">*</span>
      </label>
      <select
        id="descripcion"
        name="descripcion"
        value={formData.descripcion}
        onChange={onChange}
        className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
        required
      >
        <option value="">Seleccione un tipo de gasto</option>
        {opcionesDescripcion.map((opcion, index) => (
          <option key={index} value={opcion}>{opcion}</option>
        ))}
      </select>
    </div>
  );
}

function CampoMonto({ formData, onChange }) {
  return (
    <div className="mb-6">
      <label htmlFor="monto" className="block text-sm font-medium text-gray-700 mb-2">
        Monto ($) <span className="text-red-500">*</span>
      </label>
      <div className="flex">
        <span className="inline-flex items-center px-3 text-gray-900 bg-gray-200 border border-r-0 border-gray-300 rounded-l-md">
          $
        </span>
        <input
          type="text"
          id="monto"
          name="monto"
          value={formData.monto}
          onChange={onChange}
          className="rounded-none rounded-r-lg bg-gray-50 border border-gray-300 text-gray-900 focus:ring-blue-500 focus:border-blue-500 block flex-1 min-w-0 w-full p-2.5"
          placeholder="0.00"
          required
        />
      </div>
    </div>
  );
}

function CampoFormaPago({ formData, opcionesFormaPago, onChange }) {
  return (
    <div className="mb-6">
      <label htmlFor="formaPago" className="block text-sm font-medium text-gray-700 mb-2">
        Forma de Pago <span className="text-red-500">*</span>
      </label>
      <div className="flex flex-wrap gap-4">
        {opcionesFormaPago.map((opcion, index) => (
          <div key={index} className="flex items-center">
            <input
              type="radio"
              id={`formaPago_${index}`}
              name="formaPago"
              value={opcion}
              checked={formData.formaPago === opcion}
              onChange={onChange}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500"
            />
            <label htmlFor={`formaPago_${index}`} className="ml-2 text-sm font-medium text-gray-900">
              {opcion}
            </label>
          </div>
        ))}
      </div>
    </div>
  );
}

function CampoObservaciones({ formData, onChange }) {
  return (
    <div className="mb-6">
      <label htmlFor="observaciones" className="block text-sm font-medium text-gray-700 mb-2">
        Observaciones
      </label>
      <textarea
        id="observaciones"
        name="observaciones"
        value={formData.observaciones}
        onChange={onChange}
        rows="3"
        className="block p-2.5 w-full text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
        placeholder="Ingrese cualquier observación o detalle adicional"
      />
    </div>
  );
}

export default function FormularioGasto() {
  const {
    formData,
    opcionesDescripcion,
    opcionesFormaPago,
    handleInputChange
  } = useFormularioGasto();

  return (
    <div className="p-6">
      <CampoDescripcion
        formData={formData}
        opcionesDescripcion={opcionesDescripcion}
        onChange={handleInputChange}
      />
      
      <CampoMonto
        formData={formData}
        onChange={handleInputChange}
      />
      
      <CampoFormaPago
        formData={formData}
        opcionesFormaPago={opcionesFormaPago}
        onChange={handleInputChange}
      />
      
      <CampoObservaciones
        formData={formData}
        onChange={handleInputChange}
      />
    </div>
  );
}