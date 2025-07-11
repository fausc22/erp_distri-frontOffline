import { useState } from 'react';
import axios from 'axios';
import { toast, Toaster } from 'react-hot-toast';
import Head from 'next/head';
import useAuth from '../../hooks/useAuth';

const apiUrl = process.env.NEXT_PUBLIC_API_URL;
import { axiosAuth, fetchAuth } from '../../utils/apiClient'; 


export default function ConsultaStock() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  
  // Verificar autenticación
  useAuth();

  const handleSearch = async () => {
    if (searchQuery.length >= 3) {
      try {
        const response = await axiosAuth.get(`/productos/buscar-producto?search=${searchQuery}`);
        setSearchResults(response.data.data);
        setModalIsOpen(true);
      } catch (error) {
        console.error('Error al buscar productos:', error);
        toast.error('Error al buscar productos');
      }
    } else {
      toast.error('Ingrese al menos 3 caracteres para buscar');
    }
  };

  const handleResultClick = (product) => {
    setSelectedProduct(product);
    setModalIsOpen(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const resetSearch = () => {
    setSearchQuery('');
    setSelectedProduct(null);
  };

  // Función para formatear valores monetarios
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(value);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <Head>
        <title>VERTIMAR | Consulta de Stock</title>
        <meta name="description" content="Consulta de stock y precios VERTIMAR" />
      </Head>
      
      <div className="w-full max-w-4xl bg-white shadow-lg rounded-lg overflow-hidden">
        {/* Encabezado con título */}
        <div className="bg-blue-800 p-6 text-center">
          <h1 className="text-2xl font-bold text-white">CONSULTAR STOCK</h1>
          <p className="text-blue-200 mt-2">Consulte disponibilidad y precios de productos</p>
        </div>
        
        {/* Sección de búsqueda */}
        <div className="p-6">
          <div className="mb-6">
            <label htmlFor="search-product" className="block text-sm font-medium text-gray-700 mb-2">
              Buscar producto por nombre o categoría
            </label>
            <div className="flex">
              <input
                id="search-product"
                type="text"
                placeholder="Ingrese nombre o categoría del producto"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                className="rounded-l-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
              />
              <button 
                onClick={handleSearch}
                className="inline-flex items-center px-4 py-2.5 text-white bg-blue-600 hover:bg-blue-700 rounded-r-lg"
              >
                Buscar
              </button>
            </div>
          </div>

          {/* Detalles del producto seleccionado */}
          {selectedProduct && (
            <div className="mt-8">
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
                <h2 className="text-xl font-bold text-blue-800">{selectedProduct.nombre}</h2>
                <p className="text-sm text-gray-600">Código: {selectedProduct.id}</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Información de Precios */}
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Información de Precios</h3>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                      <span className="font-medium">Precio de Costo:</span>
                      <span className="text-gray-700">{formatCurrency(selectedProduct.costo || 0)}</span>
                    </div>
                    
                    <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                      <span className="font-medium">Precio de Venta:</span>
                      <span className="text-green-600 font-bold">{formatCurrency(selectedProduct.precio || 0)}</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="font-medium">IVA (%):</span>
                      <span className="text-gray-700">{selectedProduct.iva || 0}%</span>
                    </div>
                  </div>
                </div>
                
                {/* Información de Stock */}
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Información de Stock</h3>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                      <span className="font-medium">Categoría:</span>
                      <span className="text-gray-700">{selectedProduct.categoria_id || 'Sin categoría'}</span>
                    </div>
                    
                    <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                      <span className="font-medium">Unidad de Medida:</span>
                      <span className="text-gray-700">{selectedProduct.unidad_medida || 'N/A'}</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Stock Disponible:</span>
                      <span className={`font-bold ${parseInt(selectedProduct.stock_actual) > 10 
                        ? 'text-green-600' 
                        : parseInt(selectedProduct.stock_actual) > 0 
                          ? 'text-yellow-600' 
                          : 'text-red-600'}`}>
                        {selectedProduct.stock_actual || 0} {selectedProduct.unidad_medida}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Botón para realizar nueva búsqueda */}
              <div className="mt-6 text-center">
                <button 
                  onClick={resetSearch}
                  className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded"
                >
                  Nueva Búsqueda
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Modal para resultados de búsqueda */}
      {modalIsOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold mb-4">Seleccionar Producto</h3>
            
            <div className="max-h-60 overflow-y-auto mb-4">
              {searchResults.length > 0 ? (
                searchResults.map((product, index) => (
                  <div 
                    key={index} 
                    className="p-3 border-b hover:bg-blue-50 cursor-pointer transition-colors duration-150"
                    onClick={() => handleResultClick(product)}
                  >
                    <div className="font-medium">{product.nombre}</div>
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Stock: {product.stock_actual || 0} {product.unidad_medida}</span>
                      <span>{formatCurrency(product.precio || 0)}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">No se encontraron resultados</p>
              )}
            </div>
            
            <div className="flex justify-between">
              <button 
                onClick={() => setModalIsOpen(false)}
                className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded"
              >
                Cerrar
              </button>
              <button 
                onClick={() => setSearchQuery('')}
                className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
              >
                Nueva Búsqueda
              </button>
            </div>
          </div>
        </div>
      )}
      
      <Toaster position="top-right" />
    </div>
  );
}