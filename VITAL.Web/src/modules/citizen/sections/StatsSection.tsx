interface StatsSectionProps {
  contractsCount: number
  invoicesCount: number
  casesCount: number
}

export default function StatsSection({ contractsCount, invoicesCount, casesCount }: StatsSectionProps) {
  const stats = [
    { label: 'Contratos', value: contractsCount, icon: '📋', color: 'bg-blue-50 border-blue-200' },
    { label: 'Facturas', value: invoicesCount, icon: '🧾', color: 'bg-yellow-50 border-yellow-200' },
    { label: 'Solicitudes', value: casesCount, icon: '🏠', color: 'bg-green-50 border-green-200' },
  ]

  return (
    <div data-tour="citizen-stats" className="grid grid-cols-3 gap-4 mb-6">
      {stats.map(s => (
        <div key={s.label} className={`${s.color} border rounded-xl p-4 text-center`}>
          <div className="text-3xl mb-1">{s.icon}</div>
          <div className="text-2xl font-bold text-gray-800">{s.value}</div>
          <div className="text-xs text-gray-500">{s.label}</div>
        </div>
      ))}
    </div>
  )
}
