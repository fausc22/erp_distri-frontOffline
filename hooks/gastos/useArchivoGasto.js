// hooks/gastos/useArchivoGasto.js
import { useState } from 'react';

export const useArchivoGasto = () => {
  const [archivo, setArchivo] = useState(null);
  const [preview, setPreview] = useState(null);

  // Validar archivo antes de aceptarlo
  const validarArchivo = (file) => {
    // Validar tamaño (10MB máximo)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return { valido: false, mensaje: 'El archivo es demasiado grande. Máximo 10MB permitido.' };
    }
    
    // Validar tipo de archivo
    const allowedTypes = [
      'image/jpeg', 
      'image/jpg', 
      'image/png', 
      'application/pdf', 
      'application/msword', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    if (!allowedTypes.includes(file.type)) {
      return { valido: false, mensaje: 'Tipo de archivo no válido. Solo se permiten: JPG, PNG, PDF, DOC, DOCX' };
    }
    
    return { valido: true, mensaje: '' };
  };

  // Manejar selección de archivo
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    
    if (!file) {
      limpiarArchivo();
      return;
    }
    
    console.log('📁 Archivo seleccionado:', {
      name: file.name,
      size: file.size,
      type: file.type
    });
    
    const validacion = validarArchivo(file);
    
    if (!validacion.valido) {
      console.error('❌ Archivo no válido:', validacion.mensaje);
      alert(validacion.mensaje);
      limpiarArchivo();
      return;
    }
    
    setArchivo(file);
    
    // Generar preview si es una imagen
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target.result);
        console.log('🖼️ Preview generado para imagen');
      };
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
      console.log('📄 Archivo no es imagen, sin preview');
    }
  };

  // Limpiar archivo seleccionado
  const limpiarArchivo = () => {
    console.log('🗑️ Limpiando archivo seleccionado');
    setArchivo(null);
    setPreview(null);
  };

  // Obtener nombre del archivo
  const fileName = archivo?.name || null;

  // Verificar si hay archivo seleccionado
  const hayArchivo = !!archivo;

  // Obtener información completa del archivo
  const archivoInfo = archivo ? {
    nombre: archivo.name,
    tamaño: (archivo.size / (1024 * 1024)).toFixed(2) + ' MB',
    tipo: archivo.type,
    preview: preview
  } : null;

  // Obtener el archivo real (para pasarlo al hook de registro)
  const obtenerArchivo = () => {
    console.log('📋 Obteniendo archivo:', archivo ? archivo.name : 'sin archivo');
    return archivo;
  };

  return {
    // Estados básicos
    fileName,
    preview,
    hayArchivo,
    archivo,
    archivoInfo,
    
    // Funciones
    handleFileChange,
    limpiarArchivo,
    validarArchivo,
    obtenerArchivo
  };
};