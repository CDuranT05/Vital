import { useState } from 'react'
import Modal from '../../../components/Modal'
import { registerContract } from '../../../api/contracts'
import { registerMeter } from '../../../api/meters'
import type { Branch } from '../../../api/branches'

interface NewContractModalProps {
  /** QR escaneado sin contrato — se vincula automáticamente al registrar */
  scannedQrCode: string
  branches: Branch[]
  onRegistered: () => void
  onClose: () => void
}

export default function NewContractModal({ scannedQrCode, branches, onRegistered, onClose }: NewContractModalProps) {
  const [selectedBranch, setSelectedBranch] = useState('')
  const [citizenCard, setCitizenCard] = useState('')
  const [citizenFirst, setCitizenFirst] = useState('')
  const [citizenLast, setCitizenLast] = useState('')
  const [citizenPhone, setCitizenPhone] = useState('')
  const [address, setAddress] = useState('')
  const [parish, setParish] = useState('')
  const [municipality, setMunicipality] = useState('')
  const [contractState, setContractState] = useState('')
  const [isPrimary, setIsPrimary] = useState(true)
  const [contractSuccess, setContractSuccess] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleNewContract = async () => {
    if (!citizenCard.trim() || !citizenFirst.trim() || !citizenLast.trim() || !address.trim()) {
      setError('Completa todos los campos requeridos.')
      return
    }
    if (!selectedBranch) {
      setError('Selecciona la sucursal responsable del contrato.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const contract = await registerContract({
        citizenIdentityCard: citizenCard.trim(),
        citizenFirstName: citizenFirst.trim(),
        citizenLastName: citizenLast.trim(),
        citizenPhone: citizenPhone.trim(),
        serviceAddress: address.trim(),
        isPrimaryResidence: isPrimary,
        contractType: 1,
        parish: parish.trim(),
        municipality: municipality.trim(),
        state: contractState.trim(),
        branchId: selectedBranch
      })
      // Si vino de un escaneo, vincular el medidor automáticamente
      if (scannedQrCode) {
        await registerMeter({
          meterNumber: scannedQrCode,
          qrCode: scannedQrCode,
          contractId: contract.id
        })
      }
      setContractSuccess(contract.contractNumber)
      onRegistered()
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message
      setError(msg ?? 'Error al registrar el contrato.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal open onClose={onClose} size="lg" padded={false}>
      <div className="p-6" data-tour="new-contract-modal">
        <h3 className="text-lg font-bold text-gray-800 mb-1">📋 Registrar Nuevo Contrato</h3>
        <p className="text-sm text-gray-500 mb-4">El perfil de ciudadano se crea automáticamente si no existe</p>

        {scannedQrCode && (
          <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 text-sm text-blue-700 flex items-center gap-2">
            <span>🔗</span>
            <span>Medidor a vincular: <strong>{scannedQrCode}</strong></span>
          </div>
        )}

        {contractSuccess ? (
          <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-5 text-center">
            <p className="text-2xl mb-2">✓</p>
            <p className="font-bold text-lg">{contractSuccess}</p>
            <p className="text-sm mt-1">Contrato registrado exitosamente</p>
            {scannedQrCode && (
              <p className="text-xs text-green-600 mt-2">Medidor <strong>{scannedQrCode}</strong> vinculado al contrato</p>
            )}
            <p className="text-xs text-gray-500 mt-2">
              El ciudadano puede iniciar sesión con su cédula.<br />
              Contraseña inicial: su número de cédula
            </p>
            <button onClick={onClose} className="mt-4 bg-[#1a5276] text-white px-5 py-2 rounded-lg text-sm hover:bg-[#154360]">
              Registrar otro
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sucursal responsable *</label>
              <select
                value={selectedBranch}
                onChange={e => setSelectedBranch(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a5276] bg-white"
              >
                <option value="">Selecciona una sucursal...</option>
                {branches.map(b => (
                  <option key={b.id} value={b.id}>{b.name} — {b.city}</option>
                ))}
              </select>
            </div>

            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Datos del titular</p>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cédula *</label>
                <input type="text" value={citizenCard} onChange={e => setCitizenCard(e.target.value)}
                  placeholder="V-12345678"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a5276]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                <input type="text" value={citizenPhone} onChange={e => setCitizenPhone(e.target.value)}
                  placeholder="04141234567"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a5276]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                <input type="text" value={citizenFirst} onChange={e => setCitizenFirst(e.target.value)}
                  placeholder="Carlos"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a5276]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Apellido *</label>
                <input type="text" value={citizenLast} onChange={e => setCitizenLast(e.target.value)}
                  placeholder="Perez"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a5276]" />
              </div>
            </div>

            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide pt-1">Datos del inmueble</p>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Dirección *</label>
              <input type="text" value={address} onChange={e => setAddress(e.target.value)}
                placeholder="Calle, Nro, Urb..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a5276]" />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ciudad</label>
                <input type="text" value={parish} onChange={e => setParish(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a5276]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Municipio</label>
                <input type="text" value={municipality} onChange={e => setMunicipality(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a5276]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                <input type="text" value={contractState} onChange={e => setContractState(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a5276]" />
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input type="checkbox" checked={isPrimary} onChange={e => setIsPrimary(e.target.checked)}
                className="rounded border-gray-300" />
              Residencia principal
            </label>

            {error && (
              <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
            )}

            <div className="flex gap-3 pt-1">
              <button onClick={onClose} className="flex-1 border border-gray-300 text-gray-600 py-2.5 rounded-lg hover:bg-gray-50">
                Cancelar
              </button>
              <button
                onClick={handleNewContract}
                disabled={loading || !citizenCard.trim() || !citizenFirst.trim() || !citizenLast.trim() || !address.trim()}
                className="flex-1 bg-emerald-600 text-white py-2.5 rounded-lg hover:bg-emerald-700 disabled:opacity-60 font-semibold"
              >
                {loading ? 'Registrando...' : 'Registrar Contrato'}
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}
