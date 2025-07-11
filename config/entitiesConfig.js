// config/entitiesConfig.js
const apiUrl = process.env.NEXT_PUBLIC_API_URL;

// Validaciones en tiempo real (MUY PERMISIVAS - solo previenen caracteres claramente incorrectos)
const liveValidations = {
  // Solo números: permite vacío y números
  onlyNumbers: (value) => value === '' || /^[\d]*$/.test(value),
  // Email en vivo: permite caracteres de email mientras escribe
  emailLive: (value) => value === '' || /^[a-zA-Z0-9@._-]*$/.test(value),
  // Decimal en vivo: permite números y punto decimal
  decimalLive: (value) => value === '' || /^[\d.]*$/.test(value),
  // Usuario en vivo: permite letras, números y guión bajo
  usuarioLive: (value) => value === '' || /^[a-zA-Z0-9_]*$/.test(value)
};

// Validaciones estrictas para el envío del formulario
const strictValidations = {
  onlyNumbers: (value) => !value || /^\d+$/.test(value),
  email: (value) => !value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
  decimal: (value) => !value || /^\d*\.?\d+$/.test(value),
  usuario: (value) => !value || (/^[a-zA-Z0-9_]{3,20}$/.test(value) && value.length >= 3),
  password: (value) => !value || value.length >= 6,
  cuit: (value) => !value || (/^\d{11}$/.test(value.replace(/-/g, '')))
};

// Configuración para Productos CON SELECT DINÁMICO DE CATEGORÍAS
export const productosConfig = {
  entityName: 'producto',
  title: 'PRODUCTOS',
  subtitle: 'SELECCIONE UNA OPCIÓN',
  
  initialData: {
    nombre: '',
    unidad_medida: '',
    costo: '',
    precio: '',
    categoria_id: '',
    iva: '',
    stock_actual: ''
  },
  
  endpoints: {
    create: `${apiUrl}/productos/crear-producto`,
    update: `${apiUrl}/productos/actualizar-producto`,
    search: `${apiUrl}/productos/buscar-producto`,
    categorias: `${apiUrl}/productos/categorias`  // ← NUEVO ENDPOINT
  },
  
  messages: {
    createSuccess: 'Producto agregado correctamente',
    updateSuccess: 'Producto actualizado correctamente',
    saveError: 'Error al guardar producto'
  },
  
  // Validaciones en tiempo real (permisivas)
  liveValidations: {
    costo: liveValidations.decimalLive,
    precio: liveValidations.decimalLive,
    iva: liveValidations.decimalLive,
    stock_actual: liveValidations.onlyNumbers
  },
  
  // Validaciones estrictas para envío
  validations: {
    costo: strictValidations.decimal,
    precio: strictValidations.decimal,
    iva: strictValidations.decimal,
    stock_actual: strictValidations.onlyNumbers
  },
  
  fields: [
    {
      name: 'nombre',
      label: 'NOMBRE',
      type: 'text',
      required: true,
      placeholder: 'Nombre del producto'
    },
    {
      name: 'categoria_id',
      label: 'CATEGORIA',
      type: 'select',
      required: true,
      options: [
        { value: '', label: 'SELECCIONE UNA CATEGORIA' }
        // Las opciones se cargarán dinámicamente
      ],
      isDynamic: true  // ← MARCA ESPECIAL PARA CAMPOS DINÁMICOS
    },
    {
      name: 'unidad_medida',
      label: 'UNIDAD MEDIDA',
      type: 'select',
      options: [
        { value: '', label: 'SELECCIONE UNIDAD' },
        { value: 'UNIDADES', label: 'UNIDADES' },
        { value: 'LITROS', label: 'LITROS' }
      ],
      required: true
    },
    {
      name: 'costo',
      label: 'PRECIO COSTO',
      type: 'number',
      prefix: '$',
      step: '0.01',
      required: true,
      placeholder: '0.00'
    },
    {
      name: 'precio',
      label: 'PRECIO VENTA',
      type: 'number',
      prefix: '$',
      step: '0.01',
      required: true,
      placeholder: '0.00'
    },
    {
      name: 'iva',
      label: 'IVA',
      type: 'select',
      options: [
        { value: '', label: 'SELECCIONE IVA' },
        { value: '21.00', label: '21.00%' },
        { value: '10.50', label: '10.50%' },
        { value: '0.00', label: '0.00%' }
      ],
      required: true
    },
    {
      name: 'stock_actual',
      label: 'STOCK',
      type: 'number',
      min: '0',
      required: true,
      placeholder: '0'
    }
  ],
  
  searchConfig: {
    searchEndpoint: `${apiUrl}/productos/buscar-producto`,
    placeholder: 'BUSCAR POR NOMBRE O CATEGORIA',
    entityName: 'producto'
  },
  
  buttons: {
    new: 'NUEVO PRODUCTO',
    edit: 'EDITAR PRODUCTO',
    create: 'CREAR PRODUCTO',
    update: 'ACTUALIZAR PRODUCTO',
    clear: 'LIMPIAR DATOS'
  },
  
  formTitles: {
    new: {
      title: 'NUEVO PRODUCTO',
      subtitle: 'INSERTE LOS SIGUIENTES DATOS'
    },
    edit: {
      title: 'EDITAR PRODUCTO',
      subtitle: 'MODIFIQUE LOS DATOS DEL PRODUCTO'
    }
  }
};

// Configuración para Clientes
export const clientesConfig = {
  entityName: 'cliente',
  title: 'CLIENTES',
  subtitle: 'SELECCIONE UNA OPCIÓN',
  
  initialData: {
    nombre: '',
    condicion_iva: '',
    cuit: '',
    dni: '',
    direccion: '',
    ciudad: '',
    provincia: '',
    telefono: '',
    email: ''
  },
  
  endpoints: {
    create: `${apiUrl}/personas/crear-cliente`,
    update: `${apiUrl}/personas/actualizar-cliente`,
    search: `${apiUrl}/personas/buscar-cliente`
  },
  
  messages: {
    createSuccess: 'Cliente creado correctamente',
    updateSuccess: 'Cliente actualizado correctamente',
    saveError: 'Error al guardar cliente'
  },
  
  // Validaciones en tiempo real (permisivas)
  liveValidations: {
    cuit: liveValidations.onlyNumbers,
    dni: liveValidations.onlyNumbers,
    telefono: liveValidations.onlyNumbers,
    email: liveValidations.emailLive
  },
  
  // Validaciones estrictas para envío
  validations: {
    cuit: strictValidations.onlyNumbers,
    dni: strictValidations.onlyNumbers,
    telefono: strictValidations.onlyNumbers,
    email: strictValidations.email
  },
  
  fields: [
    {
      name: 'nombre',
      label: 'NOMBRE',
      type: 'text',
      required: true,
      placeholder: 'Nombre completo del cliente'
    },
    {
      name: 'condicion_iva',
      label: 'CONDICION IVA',
      type: 'select',
      options: [
        { value: '', label: 'SELECCIONE UNA CATEGORIA' },
        { value: 'Responsable Inscripto', label: 'Responsable Inscripto' },
        { value: 'Monotributo', label: 'Monotributo' },
        { value: 'Consumidor Final', label: 'Consumidor Final' }
      ],
      required: true
    },
    {
      name: 'cuit',
      label: 'CUIT',
      type: 'text',
      required: false,
      placeholder: '20-12345678-9'
    },
    {
      name: 'dni',
      label: 'DNI',
      type: 'text',
      required: false,
      placeholder: '12345678'
    },
    {
      name: 'direccion',
      label: 'DIRECCION',
      type: 'text',
      required: false,
      placeholder: 'Dirección completa'
    },
    {
      name: 'ciudad',
      label: 'CIUDAD',
      type: 'text',
      required: false,
      placeholder: 'Ciudad'
    },
    {
      name: 'provincia',
      label: 'PROVINCIA',
      type: 'text',
      required: false,
      placeholder: 'Provincia'
    },
    {
      name: 'telefono',
      label: 'TELEFONO',
      type: 'text',
      required: false,
      placeholder: '3514567890'
    },
    {
      name: 'email',
      label: 'EMAIL',
      type: 'email',
      prefix: '@',
      required: false,
      placeholder: 'cliente@email.com'
    }
  ],
  
  searchConfig: {
    searchEndpoint: `${apiUrl}/personas/buscar-cliente`,
    placeholder: 'BUSCAR POR NOMBRE',
    entityName: 'cliente'
  },
  
  buttons: {
    new: 'NUEVO CLIENTE',
    edit: 'EDITAR CLIENTE',
    create: 'CREAR CLIENTE',
    update: 'ACTUALIZAR CLIENTE',
    clear: 'LIMPIAR DATOS'
  },
  
  formTitles: {
    new: {
      title: 'NUEVO CLIENTE',
      subtitle: 'INSERTE LOS SIGUIENTES DATOS'
    },
    edit: {
      title: 'EDITAR CLIENTE',
      subtitle: 'MODIFIQUE LOS DATOS DEL CLIENTE'
    }
  }
};


// Validaciones completamente permisivas - TODO ACEPTA
const ultraPermissiveValidations = {
  // Siempre retorna true - acepta cualquier valor
  alwaysTrue: (value) => true,
  // Solo verifica que exista contenido para campos requeridos
  hasContent: (value) => value && value.toString().trim().length > 0
};

// Configuración para Proveedores - SIN VALIDACIONES RESTRICTIVAS
export const proveedoresConfig = {
  entityName: 'proveedor',
  title: 'PROVEEDORES',
  subtitle: 'SELECCIONE UNA OPCIÓN',
  
  initialData: {
    nombre: '',
    condicion_iva: '',
    cuit: '',
    dni: '',
    direccion: '',
    ciudad: '',
    provincia: '',
    telefono: '',
    email: ''
  },
  
  endpoints: {
    create: `${apiUrl}/personas/crear-proveedor`,
    update: `${apiUrl}/personas/actualizar-proveedor`,
    search: `${apiUrl}/personas/buscar-proveedor`
  },
  
  messages: {
    createSuccess: 'Proveedor creado correctamente',
    updateSuccess: 'Proveedor actualizado correctamente',
    saveError: 'Error al guardar proveedor'
  },
  
  // Validaciones en tiempo real - ACEPTA TODO
  liveValidations: {
    // Todas las validaciones en vivo retornan true (sin restricciones)
    cuit: ultraPermissiveValidations.alwaysTrue,
    dni: ultraPermissiveValidations.alwaysTrue,
    telefono: ultraPermissiveValidations.alwaysTrue,
    email: ultraPermissiveValidations.alwaysTrue
  },
  
  // Validaciones de envío - SOLO NOMBRE REQUERIDO
  validations: {
    // Solo validamos que el nombre tenga contenido
    nombre: ultraPermissiveValidations.hasContent,
    // TODO LO DEMÁS ACEPTA CUALQUIER COSA O VACÍO
    condicion_iva: ultraPermissiveValidations.alwaysTrue,
    cuit: ultraPermissiveValidations.alwaysTrue,
    dni: ultraPermissiveValidations.alwaysTrue,
    direccion: ultraPermissiveValidations.alwaysTrue,
    ciudad: ultraPermissiveValidations.alwaysTrue,
    provincia: ultraPermissiveValidations.alwaysTrue,
    telefono: ultraPermissiveValidations.alwaysTrue,
    email: ultraPermissiveValidations.alwaysTrue
  },
  
  fields: [
    {
      name: 'nombre',
      label: 'NOMBRE',
      type: 'text',
      required: true, // Solo este campo es obligatorio
      placeholder: 'Nombre de la empresa o proveedor'
    },
    {
      name: 'condicion_iva',
      label: 'CONDICION IVA',
      type: 'select',
      options: [
        { value: '', label: 'SELECCIONE UNA CATEGORIA' },
        { value: 'Responsable Inscripto', label: 'Responsable Inscripto' },
        { value: 'Monotributo', label: 'Monotributo' },
        { value: 'Consumidor Final', label: 'Consumidor Final' }
      ],
      required: false // CAMBIÉ A FALSE - NO ES OBLIGATORIO
    },
    {
      name: 'cuit',
      label: 'CUIT',
      type: 'text',
      required: false,
      placeholder: 'Cualquier formato'
    },
    {
      name: 'dni',
      label: 'DNI',
      type: 'text',
      required: false,
      placeholder: 'Cualquier formato'
    },
    {
      name: 'direccion',
      label: 'DIRECCION',
      type: 'text',
      required: false,
      placeholder: 'Dirección completa'
    },
    {
      name: 'ciudad',
      label: 'CIUDAD',
      type: 'text',
      required: false,
      placeholder: 'Ciudad'
    },
    {
      name: 'provincia',
      label: 'PROVINCIA',
      type: 'text',
      required: false,
      placeholder: 'Provincia'
    },
    {
      name: 'telefono',
      label: 'TELEFONO',
      type: 'text',
      required: false,
      placeholder: 'Cualquier formato'
    },
    {
      name: 'email',
      label: 'EMAIL',
      type: 'email',
      prefix: '@',
      required: false,
      placeholder: 'proveedor@email.com'
    }
  ],
  
  searchConfig: {
    searchEndpoint: `${apiUrl}/personas/buscar-proveedor`,
    placeholder: 'BUSCAR POR NOMBRE',
    entityName: 'proveedor'
  },
  
  buttons: {
    new: 'NUEVO PROVEEDOR',
    edit: 'EDITAR PROVEEDOR',
    create: 'CREAR PROVEEDOR',
    update: 'ACTUALIZAR PROVEEDOR',
    clear: 'LIMPIAR DATOS'
  },
  
  formTitles: {
    new: {
      title: 'NUEVO PROVEEDOR',
      subtitle: 'INSERTE LOS SIGUIENTES DATOS'
    },
    edit: {
      title: 'EDITAR PROVEEDOR',
      subtitle: 'MODIFIQUE LOS DATOS DEL PROVEEDOR'
    }
  }
};

// Configuración para Empleados
export const empleadosConfig = {
  entityName: 'empleado',
  title: 'EMPLEADOS',
  subtitle: 'GESTIÓN DE USUARIOS DEL SISTEMA',
  
  initialData: {
    nombre: '',
    apellido: '',
    dni: '',
    telefono: '',
    email: '',
    usuario: '',
    password: '',
    rol: ''
  },
  
  endpoints: {
    create: `${apiUrl}/empleados/crear-empleado`,
    update: `${apiUrl}/empleados/actualizar-empleado`,
    search: `${apiUrl}/empleados/buscar-empleado`
  },
  
  messages: {
    createSuccess: 'Empleado creado correctamente',
    updateSuccess: 'Empleado actualizado correctamente',
    saveError: 'Error al guardar empleado'
  },
  
  // Validaciones en tiempo real (permisivas)
  liveValidations: {
    dni: liveValidations.onlyNumbers,
    telefono: liveValidations.onlyNumbers,
    email: liveValidations.emailLive,
    usuario: liveValidations.usuarioLive
  },
  
  // Validaciones estrictas para envío
  validations: {
    dni: strictValidations.onlyNumbers,
    telefono: strictValidations.onlyNumbers,
    email: strictValidations.email,
    usuario: strictValidations.usuario,
    password: strictValidations.password
  },
  
  fields: [
    {
      name: 'nombre',
      label: 'NOMBRE',
      type: 'text',
      required: true,
      placeholder: 'Nombre del empleado'
    },
    {
      name: 'apellido',
      label: 'APELLIDO',
      type: 'text',
      required: true,
      placeholder: 'Apellido del empleado'
    },
    {
      name: 'dni',
      label: 'DNI',
      type: 'text',
      required: false,
      placeholder: 'Documento Nacional de Identidad'
    },
    {
      name: 'telefono',
      label: 'TELÉFONO',
      type: 'text',
      required: false,
      placeholder: 'Número de teléfono'
    },
    {
      name: 'email',
      label: 'EMAIL',
      type: 'email',
      required: false,
      placeholder: 'correo@ejemplo.com'
    },
    {
      name: 'usuario',
      label: 'USUARIO',
      type: 'text',
      required: true,
      placeholder: 'Usuario para login (3-20 caracteres)'
    },
    {
      name: 'password',
      label: 'CONTRASEÑA',
      type: 'password',
      required: true,
      placeholder: 'Mínimo 6 caracteres'
    },
    {
      name: 'rol',
      label: 'ROL',
      type: 'select',
      options: [
        { value: '', label: 'SELECCIONE UN ROL' },
        { value: 'GERENTE', label: 'GERENTE' },
        { value: 'VENDEDOR', label: 'VENDEDOR' }
      ],
      required: true
    }
  ],
  
  searchConfig: {
  searchEndpoint: `${apiUrl}/empleados/buscar-empleado`,
  placeholder: 'BUSCAR POR NOMBRE, APELLIDO O USUARIO',
  entityName: 'empleado',
  displayField: 'nombre_completo'
},
  
  buttons: {
    new: 'NUEVO EMPLEADO',
    edit: 'EDITAR EMPLEADO',
    create: 'CREAR EMPLEADO',
    update: 'ACTUALIZAR EMPLEADO',
    clear: 'LIMPIAR DATOS'
  },
  
  formTitles: {
    new: {
      title: 'NUEVO EMPLEADO',
      subtitle: 'CREAR NUEVO USUARIO DEL SISTEMA'
    },
    edit: {
      title: 'EDITAR EMPLEADO',
      subtitle: 'MODIFICAR DATOS DEL EMPLEADO'
    }
  },
  
  // Configuraciones específicas para empleados
  specialRules: {
    // En modo edición, la contraseña no es obligatoria
    editMode: {
      fieldsOptional: ['password']
    },
    // Solo gerentes pueden acceder
    requiredRole: 'GERENTE',
    // Campos que se muestran en la búsqueda
    searchDisplayFields: ['nombre_completo', 'usuario', 'rol'],
    // Campos sensibles que no se muestran en listados
    sensitiveFields: ['password'],
    // Validaciones flexibles activadas
    strictValidation: false
  }
};