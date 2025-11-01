import { useState, useEffect } from 'react';
import './App.css';
import UserWatch from './components/section/user-watch';
import Thumbnail from './components/section/thumbnail';
import NotFound from './pages/NotFound';
import supabase from './lib/supabaseClient';

function App() {
  const [isLogin, setIsLogin] = useState(false);
  const [isValidating, setIsValidating] = useState(true);
  const [isValidGuest, setIsValidGuest] = useState(false);
  const [guestData, setGuestData] = useState(null);

  useEffect(() => {
    const validateGuestCode = async () => {
      // Obtener el código de invitado desde los query params
      const url = new URL(window.location.href);
      const guestCode = url.searchParams.get('code');
      
      // Si no hay código, mostrar 404
      if (!guestCode) {
        setIsValidating(false);
        setIsValidGuest(false);
        return;
      }

      try {
        // Buscar el invitado en la base de datos
        const { data, error } = await supabase
          .from('guests')
          .select('*')
          .eq('guest_code', guestCode.toUpperCase())
          .single();

        if (error || !data) {
          // Código no encontrado
          console.error('Guest code not found:', guestCode);
          setIsValidGuest(false);
        } else {
          // Código válido
          console.log('✅ Valid guest:', data);
          setIsValidGuest(true);
          setGuestData(data);
        }
      } catch (error) {
        console.error('Error validating guest:', error);
        setIsValidGuest(false);
      } finally {
        setIsValidating(false);
      }
    };

    validateGuestCode();
  }, []);

  // Mostrar loading mientras valida
  if (isValidating) {
    return (
      <div className="bg-black text-white min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin mx-auto"></div>
          <p className="text-white/60">Verificando invitación...</p>
        </div>
      </div>
    );
  }

  // Si el código no es válido, mostrar 404
  if (!isValidGuest) {
    return <NotFound />;
  }

  // Si el código es válido, mostrar la aplicación normal
  return (
    <div className="bg-black text-white min-h-screen overflow-x-hidden">
      <div className="max-w-sm container">
        {isLogin ? (
          <div className="animate-fade-in-up">
            <Thumbnail guestData={guestData} />
          </div>
        ) : (
          <UserWatch
            guestData={guestData}
            onClick={() => {
              setIsLogin(true);
            }}
          />
        )}
      </div>
    </div>
  );
}

export default App;
