import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { comunidadesAutonomas } from '../assets/dataCA';
import api from '../api';
import { useNavigate } from 'react-router-dom';
import Loader from '../ui/loading';
import { Search, ChevronRight, Check } from 'lucide-react'; // Iconos para darle flow

const OnboardingFlow = () => {
    
  const { updateUser, completeOnboarding } = useAuth();
  const navigate = useNavigate();
  
  const [step, setStep] = useState(1);
  const [comunidad, setComunidad] = useState('');
  const [intereses, setIntereses] = useState<string[]>([]);
  
  const [filteredComunidades, setFilteredComunidades] = useState(comunidadesAutonomas);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  // Categorías con un poco más de estilo visual si quisieras añadir iconos luego
  const categorias = ['Trap', 'Reagge', 'Edgy', 'Tecno', 'Reaggeton', 'House', 'Loofy', 'Funk', 'Pop', 'Indie', 'Rock', 'Metal', 'Trendy'];

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
      // 1. LLAMADA AL BACKEND
      const res = await api.patch('/user/complete-onboarding', {
        comunidad,
        intereses
      });

      // 2. ACTUALIZAR ESTADO LOCAL
      if (res.data && res.data.user) {
         updateUser(res.data.user);
      } else {
         completeOnboarding();
      }

      // 3. IR A HOME
      navigate('/');
      
    } catch (error) {
      console.error('Error completando onboarding:', error);
      completeOnboarding();
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  // --- PASO 1: COMUNIDAD ---
  if (step === 1) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
        {/* Fondo decorativo */}
        <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-background to-background pointer-events-none" />
        
        <div className="bg-card border border-border/50 rounded-2xl shadow-2xl p-8 max-w-md w-full mx-auto relative z-10 animate-in fade-in zoom-in duration-300">
          
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
              ¿De dónde eres?
            </h2>
            <p className="text-muted-foreground">Para mostrarte los mejores eventos cerca de ti</p>
          </div>

          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              placeholder="Buscar comunidad..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-white placeholder:text-gray-600"
            />
          </div>

          <div className="h-64 overflow-y-auto space-y-2 mb-6 pr-2 custom-scrollbar">
            {filteredComunidades.map((c) => (
              <button
                key={c}
                onClick={() => setComunidad(c)}
                className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-200 border ${
                  comunidad === c
                    ? 'bg-primary/20 border-primary text-white shadow-[0_0_15px_rgba(255,0,128,0.3)]'
                    : 'bg-gray-800/30 border-transparent text-gray-400 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span>{c}</span>
                  {comunidad === c && <Check className="w-4 h-4 text-primary" />}
                </div>
              </button>
            ))}
          </div>

          <button
            onClick={() => setStep(2)}
            disabled={!comunidad}
            className="w-full bg-gradient-to-r from-primary to-secondary text-white py-4 rounded-xl font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-primary/25 transition-all flex items-center justify-center gap-2 group"
          >
            Continuar
            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    );
  }

  // --- PASO 2: INTERESES ---
  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-secondary/20 via-background to-background pointer-events-none" />

      <div className="bg-card border border-border/50 rounded-2xl shadow-2xl p-8 max-w-md w-full mx-auto relative z-10 animate-in fade-in slide-in-from-right-8 duration-300">
        
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-secondary to-accent bg-clip-text text-transparent mb-2">
            Tus Gustos
          </h2>
          <p className="text-muted-foreground">Elige lo que te mueve para personalizar tu feed</p>
        </div>
        
        <div className="grid grid-cols-2 gap-3 mb-8">
          {categorias.map((categoria) => (
            <button
              key={categoria}
              onClick={() => handleInteresToggle(categoria)}
              className={`p-4 border rounded-xl transition-all duration-200 font-medium ${
                intereses.includes(categoria)
                  ? 'bg-secondary/20 border-secondary text-white shadow-[0_0_15px_rgba(121,40,202,0.3)] scale-105'
                  : 'bg-gray-800/30 border-gray-800 text-gray-400 hover:border-secondary/50 hover:text-white hover:bg-gray-800'
              }`}
            >
              {categoria}
            </button>
          ))}
        </div>

        <div className="flex gap-4">
          <button
            onClick={() => setStep(1)}
            className="flex-1 bg-gray-800 text-gray-400 py-4 rounded-xl hover:bg-gray-700 hover:text-white transition-colors font-semibold"
          >
            Atrás
          </button>
          <button
            onClick={handleSubmit}
            disabled={intereses.length === 0 || loading}
            className="flex-1 bg-gradient-to-r from-secondary to-accent text-white py-4 rounded-xl font-bold hover:shadow-lg hover:shadow-secondary/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
          >
            {loading ? <Loader /> : '¡Empezar!'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingFlow;