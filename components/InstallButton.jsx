import { useState, useEffect } from 'react';

export default function InstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Verificar si ya está en modo standalone (instalado)
    const checkStandalone = () => {
      const isStandaloneMode = 
        window.matchMedia('(display-mode: standalone)').matches ||
        window.navigator.standalone ||
        document.referrer.includes('android-app://');
      
      setIsStandalone(isStandaloneMode);
    };

    // Manejar el evento beforeinstallprompt (Chrome/Edge)
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      console.log('beforeinstallprompt event captured!');
    };

    // Manejar cuando la app se instala
    const handleAppInstalled = () => {
      setIsStandalone(true);
      setDeferredPrompt(null);
      console.log('App installed successfully!');
    };

    checkStandalone();

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // MEJORAR para Android Chrome: Intentar capturar el evento de forma más agresiva
    const timer = setTimeout(() => {
      const isAndroid = /Android/.test(navigator.userAgent);
      const isChrome = /Chrome/.test(navigator.userAgent) && !/Edg/.test(navigator.userAgent);
      
      if (isAndroid && isChrome && !deferredPrompt && !isStandalone) {
        console.log('Trying to capture install prompt on Android Chrome...');
        
        // Algunas veces el evento se dispara después de interacción
        const interactions = ['scroll', 'click', 'touchstart'];
        
        const triggerPromptCheck = () => {
          // El evento a veces se dispara después de interactuar
          setTimeout(() => {
            if (!deferredPrompt) {
              console.log('beforeinstallprompt not available yet on Android');
            }
          }, 1000);
        };

        interactions.forEach(event => {
          document.addEventListener(event, triggerPromptCheck, { once: true });
        });
      }
    }, 3000);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      clearTimeout(timer);
    };
  }, [deferredPrompt, isStandalone]);

  const handleInstall = async () => {
    // Detectar plataforma
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isAndroid = /Android/.test(navigator.userAgent);
    const isChrome = /Chrome/.test(navigator.userAgent) && !/Edg/.test(navigator.userAgent);
    const isEdge = /Edg/.test(navigator.userAgent);
    const isDesktop = !(/Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));

    if (deferredPrompt) {
      // ✅ INSTALACIÓN AUTOMÁTICA (Chrome/Edge - Desktop y Android)
      try {
        console.log('Attempting automatic installation...');
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        
        console.log('Installation outcome:', outcome);
        
        if (outcome === 'accepted') {
          setDeferredPrompt(null);
          console.log('User accepted installation');
        } else {
          console.log('User dismissed installation');
        }
      } catch (error) {
        console.log('Error during installation:', error);
        // Fallback a instrucciones si falla la instalación automática
        if (isAndroid) {
          alert('Para instalar VERTIMAR:\n\n1. Busca el ícono "⊕" o "Instalar" en la barra de direcciones\n2. O ve al menú (⋮) → "Instalar aplicación"\n3. Confirma la instalación');
        }
      }
    } else if (isIOS) {
      // 📱 iOS: INSTRUCCIONES (único método disponible)
      alert('Para instalar VERTIMAR en tu iPhone/iPad:\n\n1. Toca el botón "Compartir" (⬆️) en la parte inferior de Safari\n2. Desliza hacia abajo en el menú\n3. Selecciona "Añadir a pantalla de inicio"\n4. Toca "Añadir" para confirmar\n\n¡La app aparecerá en tu pantalla de inicio!');
    } else if (isAndroid && (isChrome || isEdge)) {
      // 🤖 Android Chrome: INSTRUCCIONES si no hay evento automático
      alert('Para instalar VERTIMAR:\n\n1. Busca el ícono "⊕" o "Instalar" en la barra de direcciones del navegador\n2. O toca el menú (⋮) del navegador\n3. Selecciona "Instalar aplicación" o "Añadir a pantalla de inicio"\n4. Confirma la instalación\n\n¡La app aparecerá en tu dispositivo!');
    } else if (isDesktop && (isChrome || isEdge)) {
      // 💻 Desktop Chrome/Edge: INSTRUCCIONES si no hay evento
      alert('Para instalar VERTIMAR:\n\n1. Busca el ícono "⊕" en la barra de direcciones\n2. O ve al menú (⋮) → "Instalar VERTIMAR..."\n3. Confirma la instalación\n\n¡La app aparecerá como programa en tu computadora!');
    } else {
      // 🌐 Otros navegadores: INSTRUCCIONES generales
      alert('Para instalar esta aplicación:\n\n1. Ve al menú de tu navegador\n2. Busca "Instalar aplicación" o "Añadir a pantalla de inicio"\n3. Sigue las instrucciones del navegador\n\nNota: Algunos navegadores no soportan instalación de aplicaciones web.');
    }
  };

  // Texto del botón según el estado
  const getButtonText = () => {
    if (isStandalone) {
      return {
        full: 'App Instalada ✓',
        short: 'Instalada ✓'
      };
    }
    
    return {
      full: 'Instalar App',
      short: 'Instalar'
    };
  };

  const buttonText = getButtonText();

  // ⭐ EL BOTÓN SIEMPRE SE MUESTRA
  return (
    <button
      onClick={handleInstall}
      className={`
        ${isStandalone 
          ? 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800' 
          : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800'
        }
        text-white 
        px-3 py-2 md:px-4 md:py-2 
        rounded-lg 
        text-xs md:text-sm 
        font-medium 
        flex items-center space-x-1 md:space-x-2 
        transition-all duration-300 
        transform hover:scale-105 
        shadow-md hover:shadow-lg
        border ${isStandalone ? 'border-green-500' : 'border-blue-500'}
        whitespace-nowrap
        cursor-pointer
      `}
      title={
        isStandalone 
          ? 'Aplicación ya instalada' 
          : deferredPrompt 
            ? 'Instalar VERTIMAR automáticamente' 
            : 'Ver instrucciones de instalación'
      }
    >
      <svg 
        className="w-3 h-3 md:w-4 md:h-4" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        {isStandalone ? (
          // ✓ Icono de check cuando está instalado
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M5 13l4 4L19 7" 
          />
        ) : (
          // ↓ Icono de descarga cuando no está instalado
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
          />
        )}
      </svg>
      <span className="hidden sm:inline">{buttonText.full}</span>
      <span className="sm:hidden">{buttonText.short}</span>
    </button>
  );
}