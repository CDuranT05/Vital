interface ProgressSectionProps {
  total: number
  restantes: number
}

export default function ProgressSection({ total, restantes }: ProgressSectionProps) {
  const medidas = total - restantes
  const porcentaje = total > 0 ? Math.round((medidas / total) * 100) : 0

  const radio = 35
  const circunferencia = 2 * Math.PI * radio
  const strokeDashoffset = circunferencia - (porcentaje / 100) * circunferencia

  return (
    <div className="flex items-center justify-center gap-6 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
      {/* Lado Izquierdo: Llevadas */}
      <div className="flex flex-col items-center justify-center min-w-22.5">
        <span className="text-3xl font-extrabold text-gray-800 ">{medidas}</span>
        <span className="text-[10px] font-bold text-gray-400 tracking-wider mt-1">LLEVADAS</span>
      </div>
      <div className="bg-linear-to-br  bg-green-300 border-green-500 w-40 h-40 rounded-2xl flex flex-col items-center justify-center shadow-lg shadow-pink-200 relative">
        <div className="relative w-22.5 h-22.5 flex items-center justify-center">
          <svg width="90" height="90" viewBox="0 0 100 100" className="-rotate-90">
            <circle
              cx="50"
              cy="50"
              r={radio}
              fill="transparent"
              stroke="rgba(255, 255, 255, 0.2)"
              strokeWidth="9"
            />
            <circle
              cx="50"
              cy="50"
              r={radio}
              fill="transparent"
              stroke="#ffffff"
              strokeWidth="9"
              strokeDasharray={circunferencia}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-[stroke-dashoffset] duration-300 ease-in-out"
            />
          </svg>
          <div className="absolute text-white text-xl font-bold">{porcentaje}%</div>
        </div>
        <div className="text-white text-[9px] font-bold tracking-widest mt-2 opacity-400 uppercase">
          Medición
        </div>
      </div>
      <div className="flex flex-col items-center justify-center min-w-22.5">
        <span className="text-3xl font-extrabold text-gray-800">{restantes}</span>
        <span className="text-[10px] font-bold text-gray-400 tracking-wider mt-1">RESTANTES</span>
      </div>
    </div>
  )
}
