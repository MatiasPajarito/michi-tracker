import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './CalendarioMichi.css';

function CalendarioMichi({ registros, alSeleccionarFecha }) {
  
  const tileContent = ({ date, view }) => {
    if (view === 'month') {
      const fechaCalendario = date.toLocaleDateString('es-CL');
      const eventosDelDia = registros.filter(r => r.fecha.split(' ')[0] === fechaCalendario);
      
      const comidas = eventosDelDia.filter(e => e.tipo === 'Comida').length;
      const limpiezas = eventosDelDia.filter(e => e.tipo === 'Arenero').length;

      if (comidas === 0 && limpiezas === 0) return null;

      return (
        <div className="flex justify-center items-center gap-1 mt-1">
          {comidas > 0 && (
            <div className="bg-indigo-500 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full font-bold shadow-sm">
              {comidas}
            </div>
          )}
          {limpiezas > 0 && (
            <div className="bg-rose-500 w-2 h-2 rounded-full"></div>
          )}
        </div>
      );
    }
  };

// ... (resto del código igual) ...

  return (
    <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 transition-colors">
      <h2 className="text-slate-500 dark:text-slate-400 font-semibold mb-4 text-center text-sm uppercase tracking-wide">
        Resumen Mensual
      </h2>
      <Calendar 
        tileContent={tileContent}
        locale="es-CL"
        // AGREGAMOS ESTA LÍNEA MÁGICA:
        calendarType="iso8601" 
        className="w-full border-none font-sans"
        onClickDay={alSeleccionarFecha} 
      />
    </div>
  );
}

export default CalendarioMichi;