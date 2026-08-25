import { useRef, useState } from 'react'
import Modal from '../../../components/Modal'
import { resolveIncident, type AssignedIncident } from '../../../api/incidents'

interface ResolveIncidentModalProps {
  incident: AssignedIncident
  formatDate: (d: string) => string
  onResolved: (incidentId: string) => void
  onClose: () => void
}

export default function ResolveIncidentModal({ incident, formatDate, onResolved, onClose }: ResolveIncidentModalProps) {
  const [notes, setNotes] = useState('')
  const [photos, setPhotos] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [resolving, setResolving] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    setPhotos(prev => [...prev, ...files])
    const newPreviews = files.map(f => URL.createObjectURL(f))
    setPreviews(prev => [...prev, ...newPreviews])
  }

  const removePhoto = (idx: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== idx))
    setPreviews(prev => {
      URL.revokeObjectURL(prev[idx])
      return prev.filter((_, i) => i !== idx)
    })
  }

  const handleResolve = async () => {
    if (photos.length === 0) {
      setError('Debes adjuntar al menos una fotografía como evidencia.')
      return
    }
    setResolving(true)
    setError('')
    try {
      await resolveIncident(incident.id, notes, photos)
      onResolved(incident.id)
    } catch {
      setError('Error al registrar la solución. Intenta de nuevo.')
    } finally {
      setResolving(false)
    }
  }

  return (
    <Modal
      open
      onClose={onClose}
      icon="🚨"
      title="Emergencia en Atención"
      subtitle={incident.contractNumber}
      headerClassName="bg-red-600"
    >
      <div className="space-y-4">
        {/* Datos ciudadano */}
        <div className="bg-gray-50 rounded-xl p-4 space-y-1.5">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Ciudadano</p>
          <p className="font-bold text-gray-800">{incident.citizenName}</p>
          <p className="text-sm text-gray-600">🪪 {incident.citizenIdentityCard}</p>
          <p className="text-sm text-gray-600">📞 {incident.citizenPhone || 'Sin teléfono'}</p>
        </div>

        {/* Ubicación */}
        <div className="bg-blue-50 rounded-xl p-4 space-y-1">
          <p className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-2">Ubicación</p>
          <p className="text-sm font-semibold text-blue-800">📍 {incident.serviceAddress}</p>
          {incident.parish && (
            <p className="text-xs text-blue-500">{incident.parish}, {incident.municipality}, {incident.state}</p>
          )}
          <p className="text-xs text-gray-400 mt-1">Reportado: {formatDate(incident.reportedAt)}</p>
        </div>

        {/* Formulario resolución */}
        <div className="space-y-3">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Registrar solución</p>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notas de resolución</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Describe el trabajo realizado y la solución aplicada..."
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a5276] resize-none"
            />
          </div>

          {/* Upload fotos */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Evidencias fotográficas <span className="text-red-500">*</span>
            </label>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="w-full border-2 border-dashed border-gray-300 rounded-xl py-4 text-gray-400 hover:border-[#1a5276] hover:text-[#1a5276] transition-colors text-sm font-medium"
            >
              📷 Agregar fotografías
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              multiple
              capture="environment"
              className="hidden"
              onChange={handleFileChange}
            />

            {previews.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mt-3">
                {previews.map((src, idx) => (
                  <div key={idx} className="relative group">
                    <img src={src} alt="" className="w-full h-24 object-cover rounded-lg" />
                    <button
                      onClick={() => removePhoto(idx)}
                      className="absolute top-1 right-1 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {error && (
            <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <div className="flex gap-3 pt-1">
            <button
              onClick={onClose}
              className="flex-1 border border-gray-300 text-gray-600 py-2.5 rounded-lg hover:bg-gray-50 text-sm"
            >
              Cerrar
            </button>
            <button
              onClick={handleResolve}
              disabled={resolving}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-lg font-bold text-sm disabled:opacity-60 transition-colors"
            >
              {resolving ? 'Guardando...' : '✅ Marcar Solucionado'}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  )
}
