import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../../../components/Layout'
import { getPendingTransfers, type TransferRequest } from '../../../api/transfers'

import TransferRequestsListSection from '../sections/TransferRequestsListSection'
import ReviewTransferModal from '../modals/ReviewTransferModal'

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString('es-VE', { day: '2-digit', month: '2-digit', year: 'numeric' })

export default function TransferRequests() {
  const navigate = useNavigate()
  const [transfers, setTransfers] = useState<TransferRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<TransferRequest | null>(null)

  useEffect(() => {
    getPendingTransfers()
      .then(setTransfers)
      .finally(() => setLoading(false))
  }, [])

  return (
    <Layout>
      <div className="max-w-2xl mx-auto space-y-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/inspector')} className="text-gray-400 hover:text-gray-600">← Volver</button>
          <h1 className="text-lg font-bold text-gray-800">Cambios de Titularidad</h1>
          {transfers.length > 0 && (
            <span className="ml-auto bg-yellow-100 text-yellow-700 text-xs font-bold px-2 py-1 rounded-full">
              {transfers.length} pendiente{transfers.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        <TransferRequestsListSection
          transfers={transfers}
          loading={loading}
          formatDate={formatDate}
          onSelect={setSelected}
        />
      </div>

      {/* ── Modal: Revisar solicitud ── */}
      {selected && (
        <ReviewTransferModal
          transfer={selected}
          formatDate={formatDate}
          onReviewed={id => setTransfers(prev => prev.filter(t => t.id !== id))}
          onClose={() => setSelected(null)}
        />
      )}
    </Layout>
  )
}
