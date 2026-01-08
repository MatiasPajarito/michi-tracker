import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

// --- TOOLTIP ADAPTABLE ---
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      // AQUI ESTA LA MAGIA: 
      // bg-white (Día) vs dark:bg-slate-800 (Noche)
      // text-slate-600 (Día) vs dark:text-slate-200 (Noche)
      <div className="bg-white dark:bg-slate-800 p-3 rounded-xl shadow-lg border border-slate-100 dark:border-slate-700 transition-colors">
        <p className="font-bold mb-1 capitalize text-slate-700 dark:text-white text-xs">{label}</p>
        <p className="text-indigo-500 dark:text-indigo-400 text-xs font-bold">
          Comidas: {payload[0].value}
        </p>
      </div>
    );
  }
  return null;
};

function MichiChart({ registros }) {
  const datosUltimaSemana = [];
  const hoy = new Date();

  for (let i = 6; i >= 0; i--) {
    const d = new Date(hoy);
    d.setDate(hoy.getDate() - i);
    
    const conteo = registros.filter(r => {
        if (r.tipo !== 'Comida') return false;
        const fechaR = r.rawDate ? new Date(r.rawDate) : new Date(r.timestamp);
        return fechaR.getDate() === d.getDate() && 
               fechaR.getMonth() === d.getMonth();
    }).length;

    datosUltimaSemana.push({
      dia: d.toLocaleDateString('es-CL', { weekday: 'short' }), 
      cantidad: conteo
    });
  }

  return (
    <div className="bg-white dark:bg-slate-800 p-5 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 mb-6 transition-colors">
      <h3 className="text-slate-400 dark:text-slate-500 text-xs font-bold uppercase tracking-widest mb-6">
        Tendencia Semanal
      </h3>
      
      <div className="h-32 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={datosUltimaSemana}>
            <XAxis 
              dataKey="dia" 
              tick={{fontSize: 10, fill: '#94a3b8'}} // Texto gris suave siempre
              axisLine={false} 
              tickLine={false} 
            />
            
            {/* El cursor ahora es transparente para no ensuciar */}
            <Tooltip content={<CustomTooltip />} cursor={{fill: 'transparent'}} />
            
            <Bar dataKey="cantidad" radius={[4, 4, 4, 4]} barSize={28}>
              {datosUltimaSemana.map((entry, index) => {
                const esHoy = index === 6;
                return (
                  <Cell 
                    key={`cell-${index}`} 
                    // DÍA: Hoy es Indigo (Azul), los otros son gris muy clarito (#f1f5f9)
                    // NOCHE: Hoy es Indigo Oscuro, los otros son gris oscuro (#334155)
                    fill={esHoy ? '#6366f1' : '#f1f5f9'} 
                    className="dark:fill-slate-700 dark:[&.recharts-bar-rectangle]:last:fill-indigo-500 transition-all duration-300"
                  />
                );
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default MichiChart;