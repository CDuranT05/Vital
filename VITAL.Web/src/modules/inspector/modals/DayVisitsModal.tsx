import { useState } from 'react'
import Modal from '../../../components/Modal'
import { formatDayKey } from '../data/calendarUtils'
import type { ScheduledVisit } from '../../../api/visits'

interface DayVisitsModalProps {
  dayKey: string
  visits: ScheduledVisit[]
  onClose: () => void
}

// Muestra las visitas (1 o 2) programadas para el día seleccionado.
// Al tocar una se abre su detalle: persona, dirección y motivo de la solicitud.
export default function DayVisitsModal({ dayKey, visits, onClose }: DayVisitsModalProps) {
  const [detail, setDetail] = useState<ScheduledVisit | null>(null)

  return (
    <Modal
      open
      onClose={onClose}
      icon="📅"
      title={detail ? 'Detalle de la Visita' : 'Visitas del Día'}
      subtitle={formatDayKey(dayKey)}
    >
      {detail ? (
        /* ── Detalle de una visita ── */
        <div className="space-y-4">
          <button onClick={() => setDetail(null)} className="text-sm text-gray-400 hover:text-gray-600">
            ← Volver a las visitas del día
          </button>

          {/* Persona a visitar */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-1.5">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Persona a visitar</p>
            <p className="font-bold text-gray-800">{detail.citizenName}</p>
            {detail.identityCard && <p className="text-sm text-gray-600">🪪 {detail.identityCard}</p>}
            {detail.phone && <p className="text-sm text-gray-600">📞 {detail.phone}</p>}
            <p className="text-sm text-gray-500">Contrato: {detail.contractNumber}</p>
          </div>

          {/* Dirección */}
          <div className="bg-blue-50 rounded-xl p-4 space-y-1">
            <p className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-1">Dirección</p>
            <p className="text-sm font-semibold text-blue-800">📍 {detail.serviceAddress}</p>
          </div>

          {/* Motivo */}
          <div className="bg-amber-50 rounded-xl p-4 space-y-1">
            <p className="text-xs font-bold text-amber-500 uppercase tracking-wider mb-1">Motivo de la solicitud</p>
            <p className="text-sm text-amber-800 leading-relaxed">{detail.reason}</p>
          </div>

          <button onClick={onClose} className="w-full bg-[#1a5276] hover:bg-[#154360] text-white py-2.5 rounded-lg font-semibold transition-colors">
            Cerrar
          </button>
        </div>
      ) : (
        /* ── Lista de visitas del día ── */
        <div className="space-y-3">
          <p className="text-sm text-gray-500">
            {visits.length} visita{visits.length !== 1 ? 's' : ''} programada{visits.length !== 1 ? 's' : ''} este día
            {visits.length >= 2 && <span className="ml-1.5 text-xs bg-red-100 text-red-600 font-semibold px-2 py-0.5 rounded-full">Día lleno</span>}
          </p>

          {visits.map((v, idx) => (
            <button
              key={v.id}
              onClick={() => setDetail(v)}
              className="w-full bg-white border border-gray-200 rounded-xl p-4 text-left hover:border-[#1a5276]/40 hover:shadow-md transition-all flex items-start gap-3"
            >
              <span className="bg-[#1a5276]/10 text-[#1a5276] font-bold text-sm rounded-lg w-8 h-8 flex items-center justify-center shrink-0">
                {idx + 1}
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-gray-800 text-sm">{v.citizenName}</p>
                <p className="text-xs text-gray-500 truncate mt-0.5">📍 {v.serviceAddress}</p>
                <p className="text-xs text-gray-400 truncate">{v.contractNumber}</p>
              </div>
              <span className="text-gray-300 text-lg self-center">›</span>
            </button>
          ))}
        </div>
      )}
    </Modal>
  )
}
