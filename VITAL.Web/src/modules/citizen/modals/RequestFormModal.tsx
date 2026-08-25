import { useState, type FormEvent } from 'react'
import Modal from '../../../components/Modal'
import { createCase, uploadEvidence } from '../../../api/cases'
import { REQUEST_TYPES, type RequestType } from '../data/requestTypes'
import type { Contract } from '../../../types'

interface RequestFormModalProps {
  type: RequestType
  contracts: Contract[]
  /** Vuelve al modal de selección de tipo */
  onBack: () => void
  /** Se envió la solicitud — refrescar el listado */
  onSubmitted: () => void
  onClose: () => void
}

export default function RequestFormModal({ type, contracts, onBack, onSubmitted, onClose }: RequestFormModalProps) {
  const typeInfo = REQUEST_TYPES.find(t => t.id === type)!

  // common
  const [contractId, setContractId] = useState('')
  const [description, setDescription] = useState('')
  const [files, setFiles] = useState<(File | null)[]>([])

  // condición médica grave
  const [isRepresentative, setIsRepresentative] = useState(false)
  const [beneficiaryId, setBeneficiaryId] = useState('')

  // madre soltera
  const [childrenCount, setChildrenCount] = useState('')
  const [childrenIdentifiers, setChildrenIdentifiers] = useState('')

  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const validate = (): string | null => {
    if (!contractId) return 'Selecciona un contrato.'
    if (!description.trim()) return 'La descripción es requerida.'
    if (type === 2 && isRepresentative && !beneficiaryId.trim())
      return 'Debes ingresar la cédula del paciente ya que estás registrando como representante.'
    if (type === 3) {
      const count = parseInt(childrenCount)
      if (!childrenCount || isNaN(count) || count <= 3)
        return 'El número de hijos debe ser mayor a 3 para aplicar a este beneficio.'
      if (!childrenIdentifiers.trim())
        return 'Debes ingresar los identificadores de los hijos (número de cédula o acta).'
    }
    return null
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const validationError = validate()
    if (validationError) { setError(validationError); return }

    setLoading(true)
    setError('')
    try {
      const payload = {
        contractId,
        description,
        requestType: type,
        isRepresentative: type === 2 ? isRepresentative : undefined,
        beneficiaryIdentityCard: type === 2 && isRepresentative ? beneficiaryId.trim() : undefined,
        childrenCount: type === 3 ? parseInt(childrenCount) : undefined,
        childrenIdentifiers: type === 3 ? childrenIdentifiers.trim() : undefined,
      }
      const newCase = await createCase(payload)
      for (const file of files) {
        if (file) await uploadEvidence(newCase.id, file)
      }
      setSuccess(true)
      onSubmitted()
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message
      setError(msg ?? 'Error al enviar la solicitud. Intenta nuevamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal open onClose={onClose} icon={typeInfo.icon} title={typeInfo.title} subtitle={typeInfo.desc} size="lg">
      {success ? (
        <div className="text-center py-4">
          <div className="text-5xl mb-3">✅</div>
          <p className="font-bold text-gray-800 text-lg">Solicitud Enviada</p>
          <p className="text-sm text-gray-500 mt-2">
            Tu solicitud fue enviada correctamente.<br />
            Un inspector la revisará pronto.
          </p>
          <button onClick={onClose} className="mt-5 w-full bg-[#1a5276] text-white py-2.5 rounded-lg font-semibold">
            Cerrar
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <button type="button" onClick={onBack} className="text-sm text-gray-400 hover:text-gray-600">
            ← Cambiar tipo de solicitud
          </button>

          {/* Contract */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contrato del hogar</label>
            <select
              value={contractId}
              onChange={e => setContractId(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a5276]"
            >
              <option value="">Selecciona un contrato...</option>
              {contracts.map(c => (
                <option key={c.id} value={c.id}>{c.contractNumber} · {c.serviceAddress}</option>
              ))}
            </select>
          </div>

          {/* Condición médica grave — datos extra */}
          {type === 2 && (
            <div className="bg-blue-50 rounded-xl p-4 space-y-3">
              <p className="text-xs font-bold text-blue-500 uppercase tracking-wider">¿Quién realiza el registro?</p>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={!isRepresentative}
                    onChange={() => setIsRepresentative(false)}
                    className="accent-[#1a5276]"
                  />
                  <span className="text-sm text-gray-700">Soy el paciente</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={isRepresentative}
                    onChange={() => setIsRepresentative(true)}
                    className="accent-[#1a5276]"
                  />
                  <span className="text-sm text-gray-700">Soy representante / tutor</span>
                </label>
              </div>
              {isRepresentative && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cédula del paciente <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={beneficiaryId}
                    onChange={e => setBeneficiaryId(e.target.value)}
                    placeholder="Ej: V-12345678"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a5276]"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Si esta cédula ya tiene una solicitud activa, el sistema no permitirá registrarla nuevamente.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Madre soltera — datos extra */}
          {type === 3 && (
            <div className="bg-amber-50 rounded-xl p-4 space-y-3">
              <p className="text-xs font-bold text-amber-600 uppercase tracking-wider">Información de los hijos</p>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Número de hijos <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={childrenCount}
                  onChange={e => setChildrenCount(e.target.value)}
                  min={4}
                  placeholder="Mínimo 4"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a5276]"
                />
                <p className="text-xs text-gray-400 mt-1">Debe ser mayor a 3 para aplicar al beneficio.</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Número de cédula o acta de nacimiento de cada hijo <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={childrenIdentifiers}
                  onChange={e => setChildrenIdentifiers(e.target.value)}
                  rows={4}
                  placeholder={"Un identificador por línea:\nV-12345678\nActa-2020-001234\nV-87654321"}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#1a5276] resize-none"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Si algún identificador ya existe en otra solicitud activa, el sistema lo rechazará para evitar duplicados.
                </p>
              </div>
            </div>
          )}

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción de la situación</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={4}
              placeholder="Describe tu situación con el mayor detalle posible..."
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a5276] resize-none"
            />
          </div>

          {/* Documentos — un botón de subida por evidencia requerida */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Documentos requeridos
              <span className="ml-2 text-xs font-normal text-gray-400">
                ({files.filter(Boolean).length}/{typeInfo.docs.length} subidos)
              </span>
            </label>
            <div className="space-y-2">
              {typeInfo.docs.map((doc, idx) => {
                const uploaded = files[idx] ?? null
                return (
                  <div key={idx} className={`border rounded-xl p-3 transition-colors ${
                    uploaded ? 'border-emerald-300 bg-emerald-50' : 'border-gray-200 bg-gray-50'
                  }`}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-700">
                          {idx + 1}. {doc.label}
                          <span className="text-red-500 ml-0.5">*</span>
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">{doc.hint}</p>
                        {uploaded && (
                          <p className="text-xs text-emerald-600 mt-1 truncate">
                            ✓ {uploaded.name}
                          </p>
                        )}
                      </div>
                      <label className={`shrink-0 cursor-pointer text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
                        uploaded
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                          : 'bg-[#1a5276] hover:bg-[#154360] text-white'
                      }`}>
                        {uploaded ? 'Cambiar' : 'Subir'}
                        <input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          className="hidden"
                          onChange={e => {
                            const f = e.target.files?.[0] ?? null
                            setFiles(prev => {
                              const next = [...prev]
                              next[idx] = f
                              return next
                            })
                            e.target.value = ''
                          }}
                        />
                      </label>
                    </div>
                  </div>
                )
              })}
            </div>
            <p className="text-xs text-gray-400 mt-2">Formatos aceptados: PDF, JPG, PNG</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3">{error}</div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#1a5276] hover:bg-[#154360] text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-60"
          >
            {loading ? 'Enviando...' : 'Enviar Solicitud'}
          </button>
        </form>
      )}
    </Modal>
  )
}
