import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Layout from '../../../components/Layout'
import { useAuth } from '../../../context/AuthContext'
import { getContracts } from '../../../api/contracts'
import { getInvoices } from '../../../api/invoices'
import { getMyCases } from '../../../api/cases'
import { reportIncident } from '../../../api/incidents'
import type { Contract, Invoice, VulnerabilityCase } from '../../../types'
import type { RequestType } from '../data/requestTypes'

import StatsSection from '../sections/StatsSection'
import ContractsSection from '../sections/ContractsSection'
import InvoicesSection from '../sections/InvoicesSection'
import CasesSection from '../sections/CasesSection'

import ContractDetailModal from '../modals/ContractDetailModal'
import TransferModal from '../modals/TransferModal'
import InvoiceDetailModal from '../modals/InvoiceDetailModal'
import PayInvoiceModal from '../modals/PayInvoiceModal'
import RequestTypeModal from '../modals/RequestTypeModal'
import RequestFormModal from '../modals/RequestFormModal'

export default function CitizenDashboard() {
  const { user } = useAuth()
  const [contracts, setContracts] = useState<Contract[]>([])
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [cases, setCases] = useState<VulnerabilityCase[]>([])
  const [loading, setLoading] = useState(true)
  const [apiError, setApiError] = useState(false)
  const [activeTab, setActiveTab] = useState<'contracts' | 'invoices' | 'cases'>('contracts')

  // Modales
  const [detailContract, setDetailContract] = useState<Contract | null>(null)
  const [transferContract, setTransferContract] = useState<Contract | null>(null)
  const [detailInvoice, setDetailInvoice] = useState<Invoice | null>(null)
  const [payingInvoice, setPayingInvoice] = useState<Invoice | null>(null)
  const [requestTypeOpen, setRequestTypeOpen] = useState(false)
  const [requestFormType, setRequestFormType] = useState<RequestType | null>(null)

  // Emergencia
  const [emergencySent, setEmergencySent] = useState<Set<string>>(new Set())

  // Apodos de contratos (persistidos en el navegador)
  const [nicknames, setNicknames] = useState<Record<string, string>>(() => {
    try { return JSON.parse(localStorage.getItem('vital_nicknames') ?? '{}') } catch { return {} }
  })

  const saveNickname = (contractId: string, nickname: string) => {
    const updated = { ...nicknames, [contractId]: nickname }
    setNicknames(updated)
    localStorage.setItem('vital_nicknames', JSON.stringify(updated))
  }

  const handleEmergency = async (contractId: string) => {
    try {
      await reportIncident(contractId)
      setEmergencySent(prev => new Set(prev).add(contractId))
      // Resetear el estado visual después de 5 segundos
      setTimeout(() => setEmergencySent(prev => {
        const next = new Set(prev); next.delete(contractId); return next
      }), 5000)
    } catch { /* silencioso — el botón no cambia de estado */ }
  }

  const loadData = () => {
    setLoading(true)
    setApiError(false)
    Promise.all([getContracts(), getInvoices(), getMyCases()])
      .then(([c, i, s]) => { setContracts(c); setInvoices(i); setCases(s) })
      .catch(() => setApiError(true))
      .finally(() => setLoading(false))
  }

  useEffect(() => { loadData() }, [])

  return (
    <Layout>
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Bienvenido, {user?.firstName} {user?.lastName}
          </h1>
          <p className="text-gray-500 text-sm mt-1">Cédula: {user?.identityCard}</p>
        </div>
        <Link to="/profile" className="text-gray-400 hover:text-[#1a5276] transition-colors mt-1" title="Configuración de cuenta">
          <span className="text-2xl">⚙️</span>
        </Link>
      </div>

      {/* Banner de error de conexión */}
      {apiError && (
        <div className="mb-5 bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-red-700">
            <span className="text-lg">⚠️</span>
            <div>
              <p className="font-semibold text-sm">No se pudo conectar con el servidor</p>
              <p className="text-xs text-red-500">Asegúrate de que el API esté corriendo en <code>localhost:5049</code></p>
            </div>
          </div>
          <button
            onClick={loadData}
            className="text-sm bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1.5 rounded-lg transition-colors font-medium"
          >
            Reintentar
          </button>
        </div>
      )}

      <StatsSection contractsCount={contracts.length} invoicesCount={invoices.length} casesCount={cases.length} />

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="flex border-b border-gray-100">
          {(['contracts', 'invoices', 'cases'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3 text-sm font-medium transition-colors ${
                activeTab === tab
                  ? 'text-[#1a5276] border-b-2 border-[#1a5276]'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab === 'contracts' ? '📋 Contratos' : tab === 'invoices' ? '🧾 Facturas' : '🏠 Solicitudes'}
            </button>
          ))}
        </div>

        <div className="p-4">
          {loading ? (
            <div className="text-center py-8 text-gray-400">Cargando...</div>
          ) : (
            <>
              {activeTab === 'contracts' && (
                <ContractsSection
                  contracts={contracts}
                  nicknames={nicknames}
                  emergencySent={emergencySent}
                  onOpenDetail={setDetailContract}
                  onEmergency={handleEmergency}
                />
              )}

              {activeTab === 'invoices' && (
                <InvoicesSection invoices={invoices} onOpenInvoice={setDetailInvoice} />
              )}

              {activeTab === 'cases' && (
                <CasesSection cases={cases} onNewRequest={() => setRequestTypeOpen(true)} />
              )}
            </>
          )}
        </div>
      </div>

      {/* ── Modales ── */}
      {detailContract && (
        <ContractDetailModal
          contract={detailContract}
          nickname={nicknames[detailContract.id] ?? ''}
          onSaveNickname={saveNickname}
          onRequestTransfer={contract => { setDetailContract(null); setTransferContract(contract) }}
          onClose={() => setDetailContract(null)}
        />
      )}

      {transferContract && (
        <TransferModal
          contract={transferContract}
          onClose={() => setTransferContract(null)}
        />
      )}

      {detailInvoice && !payingInvoice && (
        <InvoiceDetailModal
          invoice={detailInvoice}
          onPay={invoice => { setPayingInvoice(invoice); setDetailInvoice(null) }}
          onClose={() => setDetailInvoice(null)}
        />
      )}

      {payingInvoice && (
        <PayInvoiceModal
          invoice={payingInvoice}
          onPaid={loadData}
          onClose={() => setPayingInvoice(null)}
        />
      )}

      {requestTypeOpen && (
        <RequestTypeModal
          ineligible={contracts.length > 1}
          onSelect={type => { setRequestTypeOpen(false); setRequestFormType(type) }}
          onClose={() => setRequestTypeOpen(false)}
        />
      )}

      {requestFormType && (
        <RequestFormModal
          type={requestFormType}
          contracts={contracts}
          onBack={() => { setRequestFormType(null); setRequestTypeOpen(true) }}
          onSubmitted={loadData}
          onClose={() => setRequestFormType(null)}
        />
      )}
    </Layout>
  )
}
