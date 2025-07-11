// hooks/useDynamicOptions.js
import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

export const useDynamicOptions = (config) => {
  const [dynamicConfig, setDynamicConfig] = useState(config);
  const [loading, setLoading] = useState(false);

  // Función para obtener headers de autenticación
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json'
      }
    };
  };

  // Cargar opciones dinámicas para campos específicos
  const loadDynamicOptions = async () => {
    // Solo cargar si hay campos dinámicos
    const hasDynamicFields = config.fields?.some(field => field.isDynamic);
    if (!hasDynamicFields) return;

    setLoading(true);
    try {
      const updatedFields = await Promise.all(
        config.fields.map(async (field) => {
          if (field.isDynamic && field.name === 'categoria_id') {
            try {
              console.log('🔄 Cargando categorías...');
              const response = await axios.get(config.endpoints.categorias, getAuthHeaders());
              const categorias = response.data.data || response.data;
              
              console.log('✅ Categorías cargadas:', categorias);
              
              // Crear opciones para el select
              const options = [
                { value: '', label: 'SELECCIONE UNA CATEGORIA' },
                ...categorias.map(categoria => ({
                  value: categoria.id.toString(),
                  label: categoria.nombre
                }))
              ];

              return { ...field, options };
            } catch (error) {
              console.error('Error cargando categorías:', error);
              toast.error('Error al cargar categorías');
              return field; // Retornar field original si hay error
            }
          }
          return field; // Retornar field sin cambios si no es dinámico
        })
      );

      // Actualizar la configuración con las nuevas opciones
      setDynamicConfig(prev => ({
        ...prev,
        fields: updatedFields
      }));

    } catch (error) {
      console.error('Error en loadDynamicOptions:', error);
      toast.error('Error al cargar opciones dinámicas');
    } finally {
      setLoading(false);
    }
  };

  // Cargar opciones al montar el componente
  useEffect(() => {
    loadDynamicOptions();
  }, [config.entityName]); // Recargar si cambia la entidad

  return {
    config: dynamicConfig,
    loading,
    reloadOptions: loadDynamicOptions
  };
};