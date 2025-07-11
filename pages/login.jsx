import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import toast, { Toaster } from 'react-hot-toast';
import Head from 'next/head';
import { useAuthContext } from '../components/AuthProvider';

// ===== HELPER PARA SSR =====
const isClient = () => typeof window !== 'undefined';

export default function Login() {
  const router = useRouter();
  const { login: authLogin, loading: authLoading } = useAuthContext();
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [mounted, setMounted] = useState(false);

  // Evitar hidration mismatch
  useEffect(() => {
    setMounted(true);
    
    // Verificar si ya está logueado (solo en cliente)
    if (isClient()) {
      const token = localStorage.getItem('token');
      if (token) {
        console.log('🔄 Usuario ya logueado, redirigiendo...');
        router.push('/inicio');
      }
    }
  }, [router]);

  // No renderizar hasta que esté montado en el cliente
  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <Head>
          <title>VERTIMAR | INICIAR SESIÓN</title>
        </Head>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  // ===== VALIDACIÓN DEL FORMULARIO =====
  const validateForm = () => {
    const newErrors = {};

    if (!username.trim()) {
      newErrors.username = 'El usuario es requerido';
    } else if (username.length < 3) {
      newErrors.username = 'El usuario debe tener al menos 3 caracteres';
    }

    if (!password.trim()) {
      newErrors.password = 'La contraseña es requerida';
    } else if (password.length < 4) {
      newErrors.password = 'La contraseña debe tener al menos 4 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ===== LIMPIAR ERRORES AL ESCRIBIR =====
  const handleUsernameChange = (e) => {
    setUsername(e.target.value);
    if (errors.username) {
      setErrors(prev => ({ ...prev, username: '' }));
    }
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    if (errors.password) {
      setErrors(prev => ({ ...prev, password: '' }));
    }
  };

  // ===== FUNCIÓN DE LOGIN =====
  const handleLogin = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    try {
      const result = await authLogin({
        username: username.trim(),
        password,
        remember
      });

      if (result.success) {
        // El hook useAuthContext ya maneja el toast y redirección
        router.push('/inicio');
      } else {
        toast.error(result.error);
      }

    } catch (error) {
      console.error('❌ Error inesperado en login:', error);
      toast.error('Error inesperado. Inténtelo nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  // ===== PROBAR CONEXIÓN =====
  const handleTestConnection = async () => {
    if (!isClient()) return;
    
    setLoading(true);
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/health`);
      
      if (response.ok) {
        toast.success('✅ Conexión exitosa con el servidor');
      } else {
        toast.error('❌ El servidor responde pero hay un error');
      }
    } catch (error) {
      toast.error('❌ Error de conexión: No se puede conectar al servidor');
      console.error('Error de conexión:', error);
    } finally {
      setLoading(false);
    }
  };

  // ===== MANEJAR ENTER =====
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !loading && !authLoading && isFormValid) {
      handleLogin();
    }
  };

  // ===== VALIDACIÓN DE FORMULARIO =====
  const isFormValid = username.trim().length >= 3 && password.trim().length >= 4;

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <Head>
        <title>VERTIMAR | INICIAR SESIÓN</title>
      </Head>
      
      {/* Left Form Container */}
      <div className="w-full md:w-1/2 flex flex-col justify-center items-center bg-white p-8">
        <div className="w-full max-w-sm space-y-6">
          
          {/* Header */}
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-800">Iniciar Sesión</h2>
            <p className="text-gray-500 text-sm mt-2">
              Bienvenido! Por favor, inicie sesión para continuar.
            </p>
          </div>
          
          <form onSubmit={(e) => { e.preventDefault(); handleLogin(); }} className="space-y-4">
            
            {/* Campo Usuario */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                Usuario <span className="text-red-500">*</span>
              </label>
              <input
                id="username"
                type="text"
                className={`mt-1 block w-full rounded-md border p-2 shadow-sm transition-colors ${
                  errors.username 
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                    : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
                } focus:ring focus:ring-opacity-50`}
                value={username}
                onChange={handleUsernameChange}
                onKeyPress={handleKeyPress}
                placeholder="Ingrese su usuario"
                disabled={loading || authLoading}
                autoComplete="username"
                autoFocus
              />
              {errors.username && (
                <p className="mt-1 text-sm text-red-600">{errors.username}</p>
              )}
            </div>

            {/* Campo Contraseña */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Contraseña <span className="text-red-500">*</span>
              </label>
              <input
                id="password"
                type="password"
                className={`mt-1 block w-full rounded-md border p-2 shadow-sm transition-colors ${
                  errors.password 
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                    : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
                } focus:ring focus:ring-opacity-50`}
                value={password}
                onChange={handlePasswordChange}
                onKeyPress={handleKeyPress}
                placeholder="Ingrese su contraseña"
                disabled={loading || authLoading}
                autoComplete="current-password"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
              )}
            </div>

            {/* Checkbox Recordar */}
            <div className="flex items-center">
              <input
                id="remember"
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                disabled={loading || authLoading}
              />
              <label htmlFor="remember" className="ml-2 block text-sm text-gray-700">
                Mantener sesión iniciada
                <span className="text-xs text-gray-500 block">
                  (Recomendado para mayor comodidad)
                </span>
              </label>
            </div>

            {/* Botón de Login */}
            <button
              type="submit"
              onClick={handleLogin}
              disabled={loading || authLoading || !isFormValid}
              className={`w-full py-2 px-4 rounded-md font-medium transition-all duration-200 ${
                loading || authLoading || !isFormValid
                  ? 'bg-gray-400 cursor-not-allowed text-gray-200'
                  : 'bg-blue-600 hover:bg-blue-700 text-white transform hover:scale-[1.02]'
              } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
            >
              {loading || authLoading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-200" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Ingresando...
                </div>
              ) : (
                'Iniciar Sesión'
              )}
            </button>

            {/* Botón de Test de Conexión */}
            {process.env.NODE_ENV === 'development' && (
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={loading || authLoading}
              className="w-full py-2 px-4 rounded-md font-medium text-gray-600 border border-gray-300 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Probando...' : 'Probar Conexión'}
            </button>
            )}

            {/* Información de debugging en desarrollo */}
            {process.env.NODE_ENV === 'development' && (
              
              <div className="text-xs text-gray-500 space-y-1 p-2 bg-gray-50 rounded">
                <p><strong>API URL:</strong> {process.env.NEXT_PUBLIC_API_URL}</p>
                <p><strong>Usuario de prueba:</strong> admin / password</p>
                <p><strong>Client:</strong> {isClient() ? 'Si' : 'No'}</p>
                <p><strong>Mounted:</strong> {mounted ? 'Si' : 'No'}</p>
              </div>
            )}
          </form>
        </div>
      </div>

      {/* Right Image Container */}
      <div className="hidden md:flex w-1/2 bg-blue-600 text-white items-center justify-center relative">
        <img
          src="/login-bg.jpg"
          alt="Login background"
          className="absolute inset-0 object-cover w-full h-full opacity-20"
        />
        <div className="relative z-10 text-center px-6">
          <h3 className="text-2xl font-semibold mb-2">¡Bienvenido!</h3>
          <h2 className="text-4xl font-bold">DISTRIBUIDORA VERTIMAR SRL</h2>
          <p className="mt-4 text-blue-100">
            Sistema de gestión empresarial con autenticación segura
          </p>
        </div>
      </div>

      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            style: {
              background: '#10b981',
              color: 'white',
            },
          },
          error: {
            duration: 6000,
            style: {
              background: '#ef4444',
              color: 'white',
            },
          },
        }}
      />
    </div>
  );
}

// No usar layout para la página de login
Login.getLayout = (page) => page;