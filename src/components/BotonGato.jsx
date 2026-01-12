import React from 'react';

export default function BotonGato({ texto, icono, tipo, alPresionar }) {
  // Definimos colores según si es Primario (Comida) o Secundario (Arenero)
  const esPrimario = tipo === 'primario';

  return (
    <button
      onClick={alPresionar}
      className={`
        relative w-full p-6 rounded-[2rem] flex flex-col items-center justify-center gap-3 
        transition-all duration-300 active:scale-95 shadow-sm border group
        ${esPrimario 
          // Estilo Comida (Indigo/Violeta sutil)
          ? 'bg-white border-indigo-100 hover:border-indigo-300 hover:shadow-indigo-500/10 dark:bg-slate-800 dark:border-indigo-900/30' 
          // Estilo Arenero (Gris/Slate sutil)
          : 'bg-white border-slate-100 hover:border-slate-300 hover:shadow-slate-500/10 dark:bg-slate-800 dark:border-slate-700'
        }
      `}
    >
      {/* Círculo del Icono */}
      <div className={`
        w-14 h-14 rounded-full flex items-center justify-center transition-transform duration-300 group-hover:scale-110
        ${esPrimario
          ? 'bg-indigo-50 text-indigo-500 dark:bg-indigo-500/10 dark:text-indigo-400'
          : 'bg-slate-100 text-slate-500 dark:bg-slate-700/50 dark:text-slate-400'
        }
      `}>
        {/* Aquí renderizamos el icono que nos pasan (ej: <Utensils />) */}
        {icono}
      </div>

      {/* Texto del Botón */}
      <span className={`font-black text-lg tracking-tight ${esPrimario ? 'text-slate-700 dark:text-indigo-100' : 'text-slate-600 dark:text-slate-300'}`}>
        {texto}
      </span>
    </button>
  );
}