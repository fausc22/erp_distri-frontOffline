import { useState } from 'react';

// Componente para campos individuales con manejo de errores
function CampoFormulario({ field, value, onChange, disabled = false, error = null }) {
  const baseClasses = "rounded-none rounded-r-lg border text-gray-900 block flex-1 min-w-0 w-full p-2.5";
  const errorClasses = error ? "border-red-500 bg-red-50" : "border-gray-300";
  const disabledClasses = disabled ? "bg-gray-100" : "";

  const renderInput = () => {
    const inputClasses = `${baseClasses} ${errorClasses} ${disabledClasses}`;
    
    switch (field.type) {
      case 'select':
        return (
          <select
            name={field.name}
            value={value}
            onChange={onChange}
            className={inputClasses}
            disabled={disabled}
          >
            {field.options.map((option, index) => (
              <option key={index} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );
      
      case 'number':
        return (
          <input
            type="number"
            name={field.name}
            value={value}
            onChange={onChange}
            className={inputClasses}
            step={field.step}
            min={field.min}
            placeholder={field.placeholder}
            disabled={disabled}
          />
        );
      
      case 'email':
        return (
          <input
            type="email"
            name={field.name}
            value={value}
            onChange={onChange}
            className={inputClasses}
            placeholder={field.placeholder}
            disabled={disabled}
          />
        );
      
      case 'password':
        return (
          <input
            type="password"
            name={field.name}
            value={value}
            onChange={onChange}
            className={inputClasses}
            placeholder={field.placeholder}
            disabled={disabled}
          />
        );
      
      default: // text
        return (
          <input
            type="text"
            name={field.name}
            value={value}
            onChange={onChange}
            className={inputClasses}
            placeholder={field.placeholder}
            disabled={disabled}
          />
        );
    }
  };

  return (
    <div className="mb-4">
      <div className="flex">
        <span className={`inline-flex items-center px-3 text-gray-900 bg-gray-200 border rounded-l-md ${error ? 'border-red-500' : 'border-gray-300'}`}>
          {field.label}
          {field.required && <span className="text-red-500 ml-1">*</span>}
        </span>
        {field.prefix && (
          <span className={`inline-flex items-center px-3 text-gray-900 bg-gray-100 border-t border-b ${error ? 'border-red-500' : 'border-gray-300'}`}>
            {field.prefix}
          </span>
        )}
        {renderInput()}
        {field.suffix && (
          <span className={`inline-flex items-center px-3 text-gray-900 bg-gray-100 border-t border-b rounded-r-md ${error ? 'border-red-500' : 'border-gray-300'}`}>
            {field.suffix}
          </span>
        )}
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}

// Componente principal del formulario
export default function FormularioGenerico({
  config,
  formData,
  mode, // 'new' o 'edit'
  errors = {}, // Errores de validación
  onInputChange,
  onSave,
  onReset,
  onSearch,
  searchQuery,
  onSearchQueryChange,
  loading = false,
  children // Para el modal de búsqueda
}) {
  const isEditMode = mode === 'edit';
  const formTitle = config.formTitles[mode];
  
  if (!formTitle) return null;

  // Función para obtener mensaje de ayuda para campos específicos
  const getFieldHelp = (fieldName) => {
    switch (fieldName) {
      case 'usuario':
        return 'Entre 3 y 20 caracteres. Solo letras, números y guión bajo.';
      case 'password':
        return isEditMode ? 'Deje vacío para mantener la contraseña actual. Mínimo 6 caracteres si desea cambiarla.' : 'Mínimo 6 caracteres.';
      case 'email':
        return 'Formato: usuario@dominio.com';
      case 'cuit':
        return 'Solo números, 11 dígitos.';
      case 'precio':
      case 'costo':
        return 'Ingrese solo números y punto decimal (ej: 150.50)';
      case 'iva':
        return 'Porcentaje de IVA (ej: 21.00)';
      default:
        return null;
    }
  };

  // Verificar si hay errores
  const hasErrors = Object.keys(errors).length > 0;

  return (
    <div className="w-full">
      <div className="mb-6 text-center">
        <h2 className="text-xl font-bold">{formTitle.title}</h2>
        <p className="text-gray-600">{formTitle.subtitle}</p>
      </div>
      
      {/* Campo de búsqueda solo en modo edición */}
      {isEditMode && (
        <div className="mb-4">
          <div className="flex">
            <input
              type="text"
              placeholder={config.searchConfig.placeholder}
              value={searchQuery}
              onChange={onSearchQueryChange}
              className="rounded-none rounded-l-lg border border-gray-300 text-gray-900 block flex-1 min-w-0 w-full p-2.5"
            />
            <button 
              onClick={onSearch}
              disabled={loading}
              className={`inline-flex items-center px-4 py-2 text-white rounded-r-md transition-colors ${
                loading 
                  ? 'bg-gray-500 cursor-not-allowed' 
                  : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              {loading ? 'BUSCANDO...' : 'BUSCAR'}
            </button>
          </div>
        </div>
      )}
      
      {/* Mensaje general de errores */}
      {hasErrors && (
        <div className="mb-4 p-3 bg-red-50 border border-red-300 rounded">
          <p className="text-red-700 text-sm font-medium mb-2">
            Por favor corrija los siguientes errores:
          </p>
          <ul className="text-red-600 text-sm list-disc list-inside">
            {Object.entries(errors).map(([field, error]) => (
              <li key={field}>{error}</li>
            ))}
          </ul>
        </div>
      )}
      
      {/* Campos del formulario */}
      {config.fields.map((field) => {
        const fieldError = errors[field.name];
        const helpText = getFieldHelp(field.name);
        
        return (
          <div key={field.name}>
            <CampoFormulario
              field={field}
              value={formData[field.name] || ''}
              onChange={onInputChange}
              error={fieldError}
              disabled={loading}
            />
            {helpText && !fieldError && (
              <p className="mt-1 mb-2 text-xs text-gray-500">{helpText}</p>
            )}
          </div>
        );
      })}
      
      {/* Botones de acción */}
      <div className="flex gap-2 mt-6">
        <button 
          onClick={onSave}
          disabled={loading}
          className={`text-white py-2 px-6 rounded transition-colors font-medium ${
            loading 
              ? 'bg-gray-500 cursor-not-allowed' 
              : 'bg-green-600 hover:bg-green-700'
          }`}
        >
          {loading ? 'GUARDANDO...' : (isEditMode ? config.buttons.update : config.buttons.create)}
        </button>
        <button 
          onClick={onReset}
          disabled={loading}
          className="bg-red-600 hover:bg-red-700 text-white py-2 px-6 rounded disabled:opacity-50 transition-colors font-medium"
        >
          {config.buttons.clear}
        </button>
      </div>
      
      
      
      {/* Modal de búsqueda pasado como children */}
      {children}
    </div>
  );
}