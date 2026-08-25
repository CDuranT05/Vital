import { Link } from 'react-router-dom'

// Acceso rápido al panel de casos sociales
export default function CasesLinkSection({ count }: { count: number }) {
  return (
    <Link
      to="/inspector/cases"
      data-tour="cases-link"
      className="flex items-center justify-between bg-[#1a5276] hover:bg-[#154360] rounded-2xl px-5 py-4 transition-colors shadow-sm shadow-blue-200 group"
    >
      <div className="flex items-center gap-3">
        <div className="bg-white/20 rounded-xl p-2.5">
          <span className="text-2xl">🤝</span>
        </div>
        <div>
          <p className="font-bold text-white text-sm">Casos Sociales</p>
          <p className="text-blue-200 text-xs">Revisar solicitudes de beneficio</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className="bg-white/15 text-white/80 text-xs font-semibold px-2.5 py-1 rounded-full min-w-[28px] text-center">
          {count}
        </span>
        <span className="text-white/60 group-hover:translate-x-1 transition-transform text-lg">→</span>
      </div>
    </Link>
  )
}
