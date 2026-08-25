import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../../../components/Layout'
import { getAssignedIncidents, type AssignedIncident } from '../../../api/incidents'
import { getAssignedTransfers, type TechnicianTransfer } from '../../../api/transfers'

import TransfersListSection from '../sections/TransfersListSection'
import IncidentsListSection from '../sections/IncidentsListSection'

import ResolveIncidentModal from '../modals/ResolveIncidentModal'
import CompleteTransferModal from '../modals/CompleteTransferModal'

const formatDate = (d: string) =>
  new Date(d).toLocaleString('es-VE', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })

export default function TechnicianIncidents() {
  const navigate = useNavigate()
  const [incidents, setIncidents] = useState<AssignedIncident[]>([])
  const [transfers, setTransfers] = useState<TechnicianTransfer[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<AssignedIncident | null>(null)
  const [selectedTransfer, setSelectedTransfer] = useState<TechnicianTransfer | null>(null)

  useEffect(() => {
    Promise.all([getAssignedIncidents(), getAssignedTransfers()])
      .then(([inc, tr]) => { setIncidents(inc); setTransfers(tr) })
      .finally(() => setLoading(false))
  }, [])

  return (
    <Layout>
      <div data-tour="tech-tasks" className="max-w-lg mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/technician')}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            ← Volver
          </button>
          <h1 className="text-lg font-bold text-gray-800">Mis Tareas</h1>
          {(incidents.length + transfers.length) > 0 && (
            <span className="ml-auto bg-red-100 text-red-700 text-xs font-bold px-2 py-1 rounded-full">
              {incidents.length + transfers.length} activa{(incidents.length + transfers.length) !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        {/* Lista */}
        {loading ? (
          <div className="text-center py-12 text-gray-400">
            <div className="w-8 h-8 border-4 border-[#1a5276] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            Cargando...
          </div>
        ) : incidents.length === 0 && transfers.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-10 text-center">
            <div className="text-5xl mb-3">✅</div>
            <p className="font-semibold text-gray-700">Sin tareas activas</p>
            <p className="text-sm text-gray-400 mt-1">No tienes emergencias ni transferencias pendientes</p>
          </div>
        ) : (
          <div className="space-y-3">
            <TransfersListSection
              transfers={transfers}
              formatDate={formatDate}
              onSelect={setSelectedTransfer}
            />
            <IncidentsListSection
              incidents={incidents}
              formatDate={formatDate}
              onSelect={setSelected}
            />
          </div>
        )}
      </div>

      {/* ── Modales ── */}
      {selected && (
        <ResolveIncidentModal
          incident={selected}
          formatDate={formatDate}
          onResolved={id => {
            setIncidents(prev => prev.filter(i => i.id !== id))
            setSelected(null)
          }}
          onClose={() => setSelected(null)}
        />
      )}

      {selectedTransfer && (
        <CompleteTransferModal
          transfer={selectedTransfer}
          onCompleted={id => setTransfers(prev => prev.filter(t => t.id !== id))}
          onClose={() => setSelectedTransfer(null)}
        />
      )}
    </Layout>
  )
}
