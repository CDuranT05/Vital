import { useState } from 'react'
import { downloadReport, type BranchMetrics } from '../../../api/supervisor'
import { REPORT_OPTIONS, type ReportType } from '../data/reportOptions'

// Descarga de informes CSV — globales o de la subestación seleccionada
export default function ReportsSection({ branch }: { branch: BranchMetrics | null }) {
  const [downloading, setDownloading] = useState<ReportType | null>(null)

  const handleDownload = async (type: ReportType, global = false) => {
    setDownloading(type)
    try {
      await downloadReport(type, global ? undefined : branch?.branchId)
    } finally {
      setDownloading(null)
    }
  }

  return (
    <section>
      <div className="flex items-center gap-3 mb-3">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Descargar Informes</p>
        <div className="flex-1 h-px bg-gray-100" />
      </div>

      {/* Globales — todas las subestaciones */}
      <div className="bg-[#1a5276]/5 border border-[#1a5276]/15 rounded-xl p-4 mb-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-sm">🌐</span>
          <p className="text-xs font-bold text-[#1a5276] uppercase tracking-wider">Métricas Globales — Las 3 Subestaciones</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {REPORT_OPTIONS.map(r => (
            <button
              key={`global-${r.id}`}
              onClick={() => handleDownload(r.id, true)}
              disabled={downloading !== null}
              className="bg-white border border-[#1a5276]/20 rounded-lg p-3 text-left hover:border-[#1a5276]/50 hover:shadow-sm transition-all disabled:opacity-60 group"
            >
              <span className="text-xl block mb-1.5">{r.icon}</span>
              <p className="font-semibold text-gray-700 text-xs group-hover:text-[#1a5276]">{r.label}</p>
              <div className="mt-2 text-xs text-[#1a5276]/70 font-medium">
                {downloading === r.id ? 'Generando...' : '⬇ Global CSV'}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Por subestación */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-sm">🏭</span>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Por Subestación</p>
          {branch && (
            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full ml-auto">
              {branch.city}
            </span>
          )}
        </div>
        <p className="text-xs text-gray-400 mb-3">
          Descarga el informe de la subestación seleccionada arriba.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {REPORT_OPTIONS.map(r => (
            <button
              key={r.id}
              onClick={() => handleDownload(r.id)}
              disabled={downloading !== null}
              className="bg-white border border-gray-200 rounded-xl p-4 text-left hover:border-[#1a5276]/40 hover:shadow-sm transition-all disabled:opacity-60 group"
            >
              <span className="text-2xl block mb-2">{r.icon}</span>
              <p className="font-semibold text-gray-700 text-sm group-hover:text-[#1a5276]">{r.label}</p>
              <p className="text-xs text-gray-400 mt-0.5 leading-snug">{r.desc}</p>
              <div className="mt-3 flex items-center gap-1 text-xs text-[#1a5276] font-medium">
                {downloading === r.id ? (
                  <span className="text-gray-400">Generando...</span>
                ) : (
                  <>⬇ Descargar CSV</>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
