interface InspectorStatsSectionProps {
  total: number
  pending: number
  review: number
}

export default function InspectorStatsSection({ total, pending, review }: InspectorStatsSectionProps) {
  return (
    <div className="grid grid-cols-3 gap-3">
      <div className="bg-white border border-gray-100 rounded-2xl p-4 text-center shadow-sm">
        <p className="text-2xl font-extrabold text-gray-800">{total}</p>
        <p className="text-xs text-gray-400 mt-0.5">Total</p>
      </div>
      <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 text-center shadow-sm">
        <p className="text-2xl font-extrabold text-yellow-700">{pending}</p>
        <p className="text-xs text-yellow-500 mt-0.5">Pendientes</p>
      </div>
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 text-center shadow-sm">
        <p className="text-2xl font-extrabold text-blue-700">{review}</p>
        <p className="text-xs text-blue-400 mt-0.5">Visita Pendiente</p>
      </div>
    </div>
  )
}
