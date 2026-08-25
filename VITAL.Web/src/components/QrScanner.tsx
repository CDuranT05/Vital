import { useEffect, useRef, useState } from 'react'
import { Html5Qrcode } from 'html5-qrcode'

interface Props {
  onScan: (code: string) => void
  onClose: () => void
}

export default function QrScanner({ onScan, onClose }: Props) {
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const [status, setStatus] = useState<'requesting' | 'scanning' | 'denied' | 'unsupported'>('requesting')
  const [manualCode, setManualCode] = useState('')
  const elementId = 'qr-reader'

  useEffect(() => {
    let cancelled = false

    const startScanner = async () => {
      // Contexto inseguro (HTTP en red local) — cámara bloqueada por el navegador
      if (!navigator.mediaDevices?.getUserMedia) {
        setStatus('unsupported')
        return
      }

      // Solicitar permiso explícitamente antes de iniciar Html5Qrcode
      // Esto dispara el diálogo nativo del navegador
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
        // Liberar el stream de prueba; Html5Qrcode abrirá el suyo propio
        stream.getTracks().forEach(t => t.stop())
      } catch {
        if (!cancelled) setStatus('denied')
        return
      }

      if (cancelled) return

      const scanner = new Html5Qrcode(elementId)
      scannerRef.current = scanner

      try {
        await scanner.start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: 220, height: 220 } },
          (decodedText) => {
            stopScanner().then(() => onScan(decodedText))
          },
          () => {}
        )
        if (!cancelled) setStatus('scanning')
      } catch {
        if (!cancelled) setStatus('denied')
      }
    }

    startScanner()
    return () => { cancelled = true; stopScanner() }
  }, [])

  const stopScanner = async () => {
    if (scannerRef.current?.isScanning) {
      await scannerRef.current.stop().catch(() => {})
    }
  }

  const handleClose = async () => {
    await stopScanner()
    onClose()
  }

  const handleManualSubmit = async () => {
    if (!manualCode.trim()) return
    await stopScanner()
    onScan(manualCode.trim())
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex flex-col items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div>
            <h3 className="font-bold text-gray-800">Escanear Medidor</h3>
            <p className="text-xs text-gray-400 mt-0.5">
              {status === 'scanning' ? 'Apunta la cámara al código QR' : 'Iniciando cámara...'}
            </p>
          </div>
          <button onClick={handleClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors">
            ✕
          </button>
        </div>

        {/* Visor de cámara */}
        {status !== 'denied' && status !== 'unsupported' && (
          <div className="relative bg-black">
            <div id={elementId} className="w-full" />
            {status === 'scanning' && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-44 h-44 border-2 border-white rounded-xl opacity-60" />
              </div>
            )}
          </div>
        )}

        {/* Mensajes de estado */}
        <div className="px-5 pt-4">
          {status === 'requesting' && (
            <div className="bg-blue-50 border border-blue-100 rounded-lg px-3 py-3 text-center">
              <p className="text-blue-700 text-xs font-semibold">📷 Solicitando permiso de cámara...</p>
              <p className="text-blue-500 text-xs mt-1">Acepta el permiso en el diálogo de tu teléfono</p>
            </div>
          )}
          {status === 'scanning' && (
            <p className="text-xs text-gray-400 text-center">Detectando código QR automáticamente...</p>
          )}
          {status === 'denied' && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-3 text-center">
              <p className="text-red-700 text-xs font-semibold">🚫 Permiso de cámara denegado</p>
              <p className="text-red-500 text-xs mt-1">
                Ve a Configuración → Aplicaciones → Navegador → Permisos → Cámara y actívalo.
              </p>
            </div>
          )}
          {status === 'unsupported' && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-3 text-center">
              <p className="text-amber-700 text-xs font-semibold">⚠️ Cámara no disponible</p>
              <p className="text-amber-500 text-xs mt-1">
                La cámara requiere conexión segura (HTTPS). Ingresa el código manualmente.
              </p>
            </div>
          )}
        </div>

        {/* Ingreso manual */}
        <div className="px-5 pt-3 pb-5">
          <p className="text-xs text-gray-500 text-center mb-2">¿No se puede escanear? Ingrésalo manualmente</p>
          <div className="flex gap-2">
            <input
              type="text"
              value={manualCode}
              onChange={e => setManualCode(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleManualSubmit()}
              placeholder="Código del medidor..."
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a5276]"
            />
            <button
              onClick={handleManualSubmit}
              disabled={!manualCode.trim()}
              className="bg-[#1a5276] text-white px-4 py-2 rounded-lg text-sm hover:bg-[#154360] disabled:opacity-50 transition-colors"
            >
              OK
            </button>
          </div>
          <button onClick={handleClose}
            className="mt-3 w-full border border-gray-200 text-gray-500 py-2 rounded-lg text-sm hover:bg-gray-50 transition-colors">
            Cancelar
          </button>
        </div>
      </div>
    </div>
  )
}
