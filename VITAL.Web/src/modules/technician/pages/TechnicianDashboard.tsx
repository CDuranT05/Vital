import { useState, useEffect } from 'react'
import Layout from '../../../components/Layout'
import QrScanner from '../../../components/QrScanner'
import { scanQr } from '../../../api/meters'
import { getBranches, type Branch } from '../../../api/branches'
import type { GenerateInvoiceResult } from '../../../api/invoices'
import type { QrScanResult } from '../../../types'

import ProgressSection from '../sections/ProgressSection'
import TasksLinkSection from '../sections/TasksLinkSection'
import ScannerSection from '../sections/ScannerSection'

import ReadingModal from '../modals/ReadingModal'
import InvoiceGeneratedModal from '../modals/InvoiceGeneratedModal'
import NewContractModal from '../modals/NewContractModal'

type ModalType = 'reading' | 'invoice' | 'newContract' | null

const TOTAL_CASAS = 55

export default function TechnicianDashboard() {
  const [cameraOpen, setCameraOpen] = useState(false)
  const [scanning, setScanning] = useState(false)
  const [scanResult, setScanResult] = useState<QrScanResult | null>(null)
  const [scanError, setScanError] = useState('')
  const [scannedQrCode, setScannedQrCode] = useState('')
  const [modal, setModal] = useState<ModalType>(null)

  // Proceso de lectura
  const [casasRestantes, setCasasRestantes] = useState(TOTAL_CASAS)
  const [invoiceResult, setInvoiceResult] = useState<GenerateInvoiceResult | null>(null)

  // Sucursales
  const [branches, setBranches] = useState<Branch[]>([])

  useEffect(() => {
    getBranches().then(setBranches).catch(() => {})
  }, [])

  const descont = () => {
    setCasasRestantes(prev => (prev > 0 ? prev - 1 : 0))
  }

  const handleQrDetected = async (code: string) => {
    setCameraOpen(false)
    setScanning(true)
    setScanError('')
    setScanResult(null)
    try {
      const result = await scanQr(code)
      setScanResult(result)
      if (!result.meterId) {
        setScannedQrCode(result.qrCode)
        setModal('newContract')
      } else {
        setModal('reading')
        descont()
      }
    } catch {
      setScanError('No se encontró el medidor. Verifique el código QR e intente de nuevo.')
    } finally {
      setScanning(false)
    }
  }

  const reset = () => {
    setModal(null)
    setScanResult(null)
    setInvoiceResult(null)
    setScannedQrCode('')
    setScanError('')
  }

  return (
    <Layout>
      <div className="max-w-lg mx-auto space-y-4">
        <ProgressSection total={TOTAL_CASAS} restantes={casasRestantes} />

        <TasksLinkSection />

        <ScannerSection
          scanning={scanning}
          scanError={scanError}
          scanResult={scanResult}
          onOpenCamera={() => { setScanError(''); setScanResult(null); setCameraOpen(true) }}
        />
      </div>

      {/* ── Cámara QR ── */}
      {cameraOpen && (
        <QrScanner
          onScan={handleQrDetected}
          onClose={() => setCameraOpen(false)}
        />
      )}

      {/* ── Modales ── */}
      {modal === 'reading' && scanResult && (
        <ReadingModal
          scanResult={scanResult}
          onGenerated={result => { setInvoiceResult(result); setModal('invoice') }}
          onClose={reset}
        />
      )}

      {modal === 'invoice' && invoiceResult && (
        <InvoiceGeneratedModal result={invoiceResult} onClose={reset} />
      )}

      {modal === 'newContract' && (
        <NewContractModal
          scannedQrCode={scannedQrCode}
          branches={branches}
          onRegistered={descont}
          onClose={reset}
        />
      )}
    </Layout>
  )
}
