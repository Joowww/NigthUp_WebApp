import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { comunidadesAutonomas } from '../assets/dataCA';
import api from '../api';
import { useNavigate } from 'react-router-dom';
import Loader from '../ui/loading';

const OnboardingFlow = () => {
    
  const { user, updateUser, completeOnboarding } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [comunidad, setComunidad] = useState('');
  const [intereses, setIntereses] = useState<string[]>([]);
  const [filteredComunidades, setFilteredComunidades] = useState(comunidadesAutonomas);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  const categorias = ['Trap', 'Reagge', 'Edgy', 'Tecno', 'Reaggeton', 'House', 'Loofy', 'Funk', 'Pop', 'Indie', 'Rock', 'Metal'];

  useEffect(() => {
    if (search) {
      setFilteredComunidades(
        comunidadesAutonomas.filter(comunidad =>
          comunidad.toLowerCase().includes(search.toLowerCase())
        )
      );
    } else {
      setFilteredComunidades(comunidadesAutonomas);
    }
  }, [search]);

  const handleInteresToggle = (categoria: string) => {
    setIntereses(prev =>
      prev.includes(categoria)
        ? prev.filter(i => i !== categoria)
        : [...prev, categoria]
    );
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Opcional: Guardar preferencias en el backend si quieres
      if (user?._id) {
        await api.patch('/user/preferences', {
          comunidad,
          intereses
        });
      }

      // Marcar onboarding como completado en el contexto
      completeOnboarding();

      // Actualizar usuario con las preferencias (opcional)
      if (user) {
        updateUser({
          ...user,
          comunidad,
          intereses
        });
      }

      // Redirigir al HomePage
      navigate('/');
    } catch (error) {
      console.error('Error en onboarding:', error);
      // Aún así completar el onboarding localmente
      completeOnboarding();
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  // [Los pasos 1 y 2 se mantienen igual que antes...]
  // Paso 1: Selección de comunidad
  if (step === 1) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">¡Bienvenido!</h1>
            <p className="text-gray-600">Ayúdanos a personalizar tu experiencia</p>
          </div>
          
          <h2 className="text-xl font-semibold mb-4 text-gray-800">¿De dónde eres?</h2>
          <p className="text-gray-600 mb-6">Selecciona tu comunidad autónoma para encontrar eventos cerca de ti</p>
          
          <div className="relative mb-6">
            <input
              type="text"
              placeholder="🔍 Buscar comunidad..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="max-h-80 overflow-y-auto border border-gray-200 rounded-xl mb-6">
            {filteredComunidades.map((comunidadItem) => (
              <button
                key={comunidadItem}
                onClick={() => setComunidad(comunidadItem)}
                className={`w-full text-left p-4 hover:bg-blue-50 transition-colors border-b border-gray-100 last:border-b-0 ${
                  comunidad === comunidadItem 
                    ? 'bg-blue-500 text-white hover:bg-blue-600' 
                    : 'text-gray-700'
                }`}
              >
                {comunidadItem}
              </button>
            ))}
          </div>

          <button
            onClick={() => setStep(2)}
            disabled={!comunidad}
            className="w-full bg-blue-500 text-white py-4 rounded-xl hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-semibold text-lg"
          >
            Continuar
          </button>
        </div>
      </div>
    );
  }

  // Paso 2: Selección de intereses
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Tus intereses</h1>
          <p className="text-gray-600">Selecciona lo que más te gusta</p>
        </div>
        
        <h2 className="text-xl font-semibold mb-4 text-gray-800">¿Qué te interesa?</h2>
        <p className="text-gray-600 mb-6">Elige las categorías que más te llamen la atención</p>
        
        <div className="grid grid-cols-2 gap-3 mb-8">
          {categorias.map((categoria) => (
            <button
              key={categoria}
              onClick={() => handleInteresToggle(categoria)}
              className={`p-4 border-2 rounded-xl transition-all duration-200 ${
                intereses.includes(categoria)
                  ? 'bg-blue-500 text-white border-blue-500 transform scale-105'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400 hover:bg-blue-50'
              }`}
            >
              {categoria}
            </button>
          ))}
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setStep(1)}
            className="flex-1 bg-gray-200 text-gray-700 py-4 rounded-xl hover:bg-gray-300 transition-colors font-semibold"
          >
            Atrás
          </button>
          <button
            onClick={handleSubmit}
            disabled={intereses.length === 0 || loading}
            className="flex-1 bg-blue-500 text-white py-4 rounded-xl hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-semibold flex items-center justify-center"
          >
            {loading ? <Loader /> : 'Completar'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingFlow;