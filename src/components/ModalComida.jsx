import { useState } from 'react';
import { X, Gift } from 'lucide-react'; // Importamos Gift para el ícono de premio

export default function ModalComida({ alCerrar, alConfirmar }) {
  const [tipo, setTipo] = useState('seca'); // 'seca', 'humeda', 'churu'
  const [porcion, setPorcion] = useState('Normal'); 

  const manejarGuardar = () => {
    // Si es Churu, forzamos la porción a 'Normal' (1 unidad)
    const porcionFinal = tipo === 'churu' ? 'Normal' : porcion;
    alConfirmar(tipo, porcionFinal);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-800 w-full max-w-sm rounded-3xl p-6 shadow-2xl border border-slate-100 dark:border-slate-700">
        
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-black text-slate-700 dark:text-white">Registrar Alimento</h3>
          <button onClick={alCerrar} className="p-2 bg-slate-100 dark:bg-slate-700 rounded-full text-slate-500 hover:text-red-500 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* 1. ¿QUÉ COMEN? (Ahora son 3 opciones) */}
        <div className="mb-6">
          <p className="text-xs font-bold text-slate-400 uppercase mb-3">Tipo de Alimento</p>
          <div className="grid grid-cols-3 gap-2">
            <button 
              onClick={() => setTipo('seca')}
              className={`p-3 rounded-xl border-2 font-bold transition-all flex flex-col items-center gap-1 ${tipo === 'seca' ? 'border-indigo-500 bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-300' : 'border-slate-100 dark:border-slate-700 text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
            >
              <span className="text-xl">🍪</span>
              <span className="text-xs">Pellet</span>
            </button>
            <button 
              onClick={() => setTipo('humeda')}
              className={`p-3 rounded-xl border-2 font-bold transition-all flex flex-col items-center gap-1 ${tipo === 'humeda' ? 'border-pink-500 bg-pink-50 text-pink-600 dark:bg-pink-900/30 dark:text-pink-300' : 'border-slate-100 dark:border-slate-700 text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
            >
              <span className="text-xl">🥫</span>
              <span className="text-xs">Húmeda</span>
            </button>
            <button 
              onClick={() => setTipo('churu')}
              className={`p-3 rounded-xl border-2 font-bold transition-all flex flex-col items-center gap-1 ${tipo === 'churu' ? 'border-amber-400 bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-300' : 'border-slate-100 dark:border-slate-700 text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
            >
              <span className="text-xl">🍬</span>
              <span className="text-xs">Churu</span>
            </button>
          </div>
        </div>

        {/* 2. ¿CUÁNTO COMEN? (Solo visible si NO es Churu) */}
        {tipo !== 'churu' && (
          <div className="mb-8 animate-in fade-in slide-in-from-top-2">
            <p className="text-xs font-bold text-slate-400 uppercase mb-3">Tamaño de la porción</p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setPorcion('Media')}
                className={`py-3 px-4 rounded-xl border-2 transition-all flex items-center justify-center gap-2 ${porcion === 'Media' ? 'border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300' : 'border-slate-100 dark:border-slate-700 text-slate-400'}`}
              >
                <div className="w-4 h-4 rounded-full bg-purple-500 shadow-sm"></div>
                <div className="text-left">
                  <span className="block text-sm font-bold">Media</span>
                  <span className="text-[10px] opacity-70">~40g / 0.5 un</span>
                </div>
              </button>

              <button
                onClick={() => setPorcion('Normal')}
                className={`py-3 px-4 rounded-xl border-2 transition-all flex items-center justify-center gap-2 ${porcion === 'Normal' ? 'border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300' : 'border-slate-100 dark:border-slate-700 text-slate-400'}`}
              >
                <div className="w-6 h-6 rounded-full bg-green-500 shadow-sm"></div>
                <div className="text-left">
                  <span className="block text-sm font-bold">Normal</span>
                  <span className="text-[10px] opacity-70">~80g / 1 un</span>
                </div>
              </button>
            </div>
          </div>
        )}

        <button 
          onClick={manejarGuardar}
          className={`w-full py-4 text-white font-bold rounded-xl shadow-lg transition-all active:scale-95 ${tipo === 'churu' ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/30' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/30'}`}
        >
          {tipo === 'churu' ? 'Dar Premio! 😺' : 'Confirmar Plato 🍽️'}
        </button>

      </div>
    </div>
  );
}