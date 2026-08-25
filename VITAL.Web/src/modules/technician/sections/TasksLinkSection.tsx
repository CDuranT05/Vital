import { Link } from 'react-router-dom'

// Acceso directo a las tareas asignadas (emergencias y cambios de titularidad)
export default function TasksLinkSection() {
  return (
    <Link
      to="/technician/incidents"
      data-tour="tasks-link"
      className="flex items-center justify-between bg-[#1a5276] hover:bg-[#154360] rounded-2xl px-5 py-4 transition-colors shadow-sm shadow-blue-200 group"
    >
      <div className="flex items-center gap-3">
        <div className="bg-white/20 rounded-xl p-2.5">
          <span className="text-2xl">📋</span>
        </div>
        <div>
          <p className="font-bold text-white text-sm">Mis Tareas</p>
          <p className="text-blue-200 text-xs">Emergencias y cambios de titularidad</p>
        </div>
      </div>
      <span className="text-white/60 group-hover:translate-x-1 transition-transform text-lg">→</span>
    </Link>
  )
}
