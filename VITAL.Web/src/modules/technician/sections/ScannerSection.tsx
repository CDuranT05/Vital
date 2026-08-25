import type { QrScanResult } from '../../../types'

interface ScannerSectionProps {
  scanning: boolean
  scanError: string
  scanResult: QrScanResult | null
  onOpenCamera: () => void
}

export default function ScannerSection({ scanning, scanError, scanResult, onOpenCamera }: ScannerSectionProps) {
  return (
    <div data-tour="tech-scanner" className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <button
        onClick={onOpenCamera}
        disabled={scanning}
        className="w-full flex flex-col items-center justify-center gap-3 py-6 rounded-xl border-2 border-dashed border-[#1a5276]/30 hover:border-[#1a5276] hover:bg-blue-50/30 transition-colors disabled:opacity-60"
      >
        {scanning ? (
          <>
            <div className="w-10 h-10 border-4 border-[#1a5276] border-t-transparent rounded-full animate-spin" />
            <span className="text-sm font-medium text-[#1a5276]">Procesando...</span>
          </>
        ) : (
          <>
            <span className="text-5xl">📷</span>
            <span className="font-semibold text-gray-700">Escanear QR del Medidor</span>
            <span className="text-xs text-gray-400">Toca para abrir la cámara</span>
          </>
        )}
      </button>

      {scanError && (
        <div className="mt-3 bg-amber-50 border border-amber-200 text-amber-700 text-sm rounded-lg px-4 py-3">
          {scanError}
        </div>
      )}

      {scanResult?.meterId && (
        <div className="mt-3 border border-blue-200 bg-blue-50 rounded-lg p-4">
          <p className="font-semibold text-sm text-blue-800 mb-1">✓ Medidor encontrado</p>
          <div className="text-sm text-gray-600 space-y-0.5">
            {scanResult.contractNumber && <p>Contrato: <strong>{scanResult.contractNumber}</strong></p>}
            {scanResult.serviceAddress && <p>Dirección: {scanResult.serviceAddress}</p>}
            <p>Medidor N°: {scanResult.meterNumber}</p>
          </div>
        </div>
      )}
    </div>
  )
}
