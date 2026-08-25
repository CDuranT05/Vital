export type CasesFilter = 'all' | 'pending' | 'review'

interface CasesFilterSectionProps {
  filter: CasesFilter
  totalCount: number
  pendingCount: number
  reviewCount: number
  onChange: (filter: CasesFilter) => void
}

export default function CasesFilterSection({ filter, totalCount, pendingCount, reviewCount, onChange }: CasesFilterSectionProps) {
  const options: { key: CasesFilter; label: string; count: number }[] = [
    { key: 'all',     label: 'Todos',       count: totalCount },
    { key: 'pending', label: 'Pendientes',  count: pendingCount },
    { key: 'review',  label: 'Visita Pendiente', count: reviewCount },
  ]

  return (
    <div>
      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Casos Sociales</p>
      <div className="flex gap-2">
        {options.map(f => (
          <button
            key={f.key}
            onClick={() => onChange(f.key)}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold transition-all ${
              filter === f.key
                ? 'bg-[#1a5276] text-white shadow-sm'
                : 'bg-white border border-gray-200 text-gray-500 hover:border-gray-300'
            }`}
          >
            {f.label}
            {f.count > 0 && (
              <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${
                filter === f.key ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
              }`}>
                {f.count}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
