import { useRef, useState } from 'react'
import Modal from '../../../components/Modal'
import { createTransferRequest } from '../../../api/transfers'
import type { Contract } from '../../../types'

interface TransferModalProps {
  contract: Contract
  onClose: () => void
}

export default function TransferModal({ contract, onClose }: TransferModalProps) {
  const [form, setForm] = useState({ identityCard: '', firstName: '', lastName: '', phone: '', email: '' })
  const [docs, setDocs] = useState<File[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const handleSubmit = async () => {
    const { identityCard, firstName, lastName } = form
    if (!identityCard.trim() || !firstName.trim() || !lastName.trim()) {
      setError('Completa los campos requeridos del nuevo titular.')
      return
    }
    if (docs.length === 0) {
      setError('Debes adjuntar al menos un documento.')
      return
    }
    setLoading(true)
    setError('')
    try {
      await createTransferRequest(
        contract.id,
        { identityCard: identityCard.trim(), firstName: firstName.trim(), lastName: lastName.trim(), phone: form.phone.trim(), email: form.email.trim() },
        docs.map(f => ({ file: f, type: f.type.includes('pdf') ? 'PDF' : 'Imagen' }))
      )
      setSuccess(true)
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message
      setError(msg ?? 'Error al enviar la solicitud.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      open
      onClose={onClose}
      icon="🔄"
      title="Solicitud de Cambio de Titularidad"
      subtitle={contract.contractNumber}
    >
      <div className="space-y-4" data-tour="transfer-form">
        {success ? (
          <div className="text-center py-4">
            <div className="text-5xl mb-3">✅</div>
            <p className="font-bold text-gray-800 text-lg">Solicitud Enviada</p>
            <p className="text-sm text-gray-500 mt-2">
              Tu solicitud fue recibida y está <strong>Pendiente de Revisión</strong>.<br />
              Un inspector evaluará la documentación y te notificará el resultado.
            </p>
            <button onClick={onClose} className="mt-5 w-full bg-[#1a5276] text-white py-2.5 rounded-lg font-semibold">
              Cerrar
            </button>
          </div>
        ) : (
          <>
            <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-xs text-amber-700">
              ⚠️ Una vez aprobada, el contrato pasará al nuevo titular y no podrás revertirlo.
            </div>

            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Datos del nuevo titular</p>

            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Cédula *', key: 'identityCard', placeholder: 'V-12345678' },
                { label: 'Teléfono', key: 'phone', placeholder: '04141234567' },
                { label: 'Nombre *', key: 'firstName', placeholder: 'Carlos' },
                { label: 'Apellido *', key: 'lastName', placeholder: 'Pérez' },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{f.label}</label>
                  <input
                    type="text"
                    value={form[f.key as keyof typeof form]}
                    onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                    placeholder={f.placeholder}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a5276]"
                  />
                </div>
              ))}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Correo electrónico</label>
              <input
                type="email"
                value={form.email}
                onChange={e => setForm(prev => ({ ...prev, email: e.target.value }))}
                placeholder="correo@ejemplo.com"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a5276]"
              />
            </div>

            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider pt-1">Documentación *</p>
            <p className="text-xs text-gray-500 -mt-2">Adjunta cédula del nuevo titular y documentos que acrediten la propiedad o posesión del inmueble.</p>

            <input
              ref={fileRef}
              type="file"
              accept="image/*,.pdf"
              multiple
              className="hidden"
              onChange={e => setDocs(prev => [...prev, ...Array.from(e.target.files ?? [])])}
            />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="w-full border-2 border-dashed border-gray-300 rounded-xl py-3 text-sm text-gray-400 hover:border-[#1a5276] hover:text-[#1a5276] transition-colors"
            >
              📎 Agregar documentos
            </button>

            {docs.length > 0 && (
              <ul className="space-y-1">
                {docs.map((f, i) => (
                  <li key={i} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2 text-xs text-gray-600">
                    <span className="truncate max-w-[80%]">📄 {f.name}</span>
                    <button onClick={() => setDocs(prev => prev.filter((_, idx) => idx !== i))} className="text-red-400 hover:text-red-600 ml-2">×</button>
                  </li>
                ))}
              </ul>
            )}

            {error && (
              <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
            )}

            <div className="flex gap-3 pt-1">
              <button onClick={onClose} className="flex-1 border border-gray-300 text-gray-600 py-2.5 rounded-lg hover:bg-gray-50 text-sm">
                Cancelar
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 bg-[#1a5276] text-white py-2.5 rounded-lg font-bold text-sm disabled:opacity-60 hover:bg-[#154360] transition-colors"
              >
                {loading ? 'Enviando...' : 'Enviar Solicitud'}
              </button>
            </div>
          </>
        )}
      </div>
    </Modal>
  )
}
