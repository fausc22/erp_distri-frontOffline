import { useState } from 'react';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import useAuth from '../../hooks/useAuth';

// Hooks
import { useEntityCRUD, useFormMode } from '../../hooks/useCRUD';
import { useDynamicOptions } from '../../hooks/useDynamicOptions';

// Componentes
import { LayoutCRUD } from './LayoutCRUD';
import { PanelLateralCRUD } from './PanelLateralCRUD';
import FormularioGenerico from './FormGenerico';
import { ModalBusquedaGenerica } from './ModalBusquedaGenerica';

export default function CRUDMaestro({ config }) {
  useAuth();

  const { config: dynamicConfig, loading: optionsLoading } = useDynamicOptions(config);
  const activeConfig = dynamicConfig;

  const isEmpleado = activeConfig.entityName === 'empleado';

  const {
    formData,
    setFormData,
    loading,
    errors,
    user,
    handleInputChange,
    resetForm,
    saveEntity,
    validateForm
  } = useEntityCRUD(activeConfig);

  const { selectedOption, setMode } = useFormMode();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

  const handleInput = (e) => {
    const { name, value } = e.target;
    if (activeConfig.liveValidations?.[name]) {
      if (!activeConfig.liveValidations[name](value)) return;
    }
    handleInputChange(e);
  };

  const handleSave = async () => {
    const valid = validateForm();
    if (!valid) {
      toast.error('Por favor completa los campos requeridos');
      return;
    }

    const success = await saveEntity();
    if (success) {
      toast.success('Operación completada exitosamente');
    }
  };

  const handleSearch = async () => {
    if (searchQuery.length < 2) {
      toast.error('Ingrese al menos 2 caracteres para buscar');
      return;
    }

    setSearchLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Authorization': token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json'
      };

      const response = await axios.get(
        `${activeConfig.searchConfig.searchEndpoint}?search=${encodeURIComponent(searchQuery)}`,
        { headers }
      );

      const results = response.data.data || response.data;
      setSearchResults(results);
      setModalIsOpen(true);
    } catch (error) {
      console.error('Error en búsqueda:', error);
      toast.error(`Error al buscar ${activeConfig.entityName}s`);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleResultSelect = (item) => {
    const mappedData = { ...activeConfig.initialData };
    Object.keys(activeConfig.initialData).forEach(key => {
      if (item[key] !== undefined) mappedData[key] = item[key];
    });
    mappedData.id = item.id;
    setFormData(mappedData);
    clearSearch();
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setModalIsOpen(false);
  };

  const handleModeSelect = (mode) => {
    setMode(mode);
    resetForm();
    clearSearch();
  };

  const canAccess = () => {
    if (isEmpleado && user && user.rol !== 'GERENTE') {
      return false;
    }
    return true;
  };

  if (isEmpleado && !canAccess()) {
    return (
      <LayoutCRUD
        title={activeConfig.title}
        descripcion={`Gestión de ${activeConfig.entityName}s VERTIMAR`}
      >
        <div className="w-full p-8 text-center">
          <h2 className="text-xl font-bold text-red-600 mb-4">Acceso Restringido</h2>
          <p className="text-gray-600">Solo los gerentes pueden gestionar empleados.</p>
          <p className="text-sm text-gray-500 mt-2">Tu rol actual: {user?.rol || 'No definido'}</p>
        </div>
      </LayoutCRUD>
    );
  }

  if (optionsLoading && activeConfig.entityName === 'producto') {
    return (
      <LayoutCRUD
        title={activeConfig.title}
        descripcion={`Gestión de ${activeConfig.entityName}s VERTIMAR`}
      >
        <div className="w-full p-8 text-center">
          <p className="text-gray-600">Cargando categorías...</p>
        </div>
      </LayoutCRUD>
    );
  }

  return (
    <LayoutCRUD
      title={activeConfig.title}
      descripcion={`Gestión de ${activeConfig.entityName}s VERTIMAR`}
    >
      <PanelLateralCRUD config={activeConfig} onModeSelect={handleModeSelect} />

      <div className={`w-full md:w-2/3 p-8 ${selectedOption ? 'block' : 'hidden md:block'}`}>
        {selectedOption && (
          <FormularioGenerico
            config={activeConfig}
            formData={formData}
            mode={selectedOption}
            errors={errors}
            onInputChange={handleInput}
            onSave={handleSave}
            onReset={resetForm}
            onSearch={handleSearch}
            searchQuery={searchQuery}
            onSearchQueryChange={(e) => setSearchQuery(e.target.value)}
            loading={loading}
          >
            <ModalBusquedaGenerica
              mostrar={modalIsOpen}
              titulo={`Seleccionar ${activeConfig.entityName.charAt(0).toUpperCase() + activeConfig.entityName.slice(1)}`}
              resultados={searchResults}
              onSeleccionar={handleResultSelect}
              onCerrar={() => setModalIsOpen(false)}
              loading={searchLoading}
              displayField={activeConfig.searchConfig?.displayField || 'nombre'}
            />
          </FormularioGenerico>
        )}
      </div>
    </LayoutCRUD>
  );
}
