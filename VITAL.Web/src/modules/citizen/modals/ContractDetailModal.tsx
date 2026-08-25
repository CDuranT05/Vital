import { useState } from 'react'
import Modal from '../../../components/Modal'
import type { Contract } from '../../../types'

interface ContractDetailModalProps {
  contract: Contract
  nickname: string
  onSaveNickname: (contractId: string, nickname: string) => void
  onRequestTransfer: (contract: Contract) => void
  onClose: () => void
}

export default function ContractDetailModal({ contract, nickname, onSaveNickname, onRequestTransfer, onClose }: ContractDetailModalProps) {
  const [editingNick, setEditingNick] = useState(nickname)
  const [nickSaved, setNickSaved] = useState(false)

  const saveNickname = () => {
    onSaveNickname(contract.id, editingNick.trim())
    setNickSaved(true)
    setTimeout(() => setNickSaved(false), 2000)
  }

  return (
    <Modal
      open
      onClose={onClose}
      icon="📋"
      title={nickname || contract.contractNumber}
      subtitle={contract.contractNumber}
    >
      <div className="space-y-4">
        {/* Apodo editable */}
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Nombre personalizado</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={editingNick}
              onChange={e => { setEditingNick(e.target.value); setNickSaved(false) }}
              placeholder="Ej: Casa Espino, Apartamento Centro..."
              maxLength={40}
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a5276]"
            />
            <button
              onClick={saveNickname}
              className="bg-[#1a5276] hover:bg-[#154360] text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
            >
              {nickSaved ? '✓' : 'Guardar'}
            </button>
          </div>
        </div>

        {/* Datos del contrato */}
        <div className="bg-gray-50 rounded-xl p-4 space-y-2.5">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Datos del contrato</p>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">N° Contrato</span>
            <span className="font-semibold text-gray-800">{contract.contractNumber}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Tipo</span>
            <span className="font-semibold text-gray-800">
              {contract.isPrimaryResidence ? '🏠 Residencia principal' : '🏢 Otro inmueble'}
            </span>
          </div>
          {contract.meter && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Medidor</span>
              <span className="font-semibold text-gray-800">{contract.meter.meterNumber}</span>
            </div>
          )}
        </div>

        {/* Dirección */}
        <div className="bg-blue-50 rounded-xl p-4 space-y-1.5">
          <p className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-1">Dirección del servicio</p>
          <p className="text-sm font-semibold text-blue-800">📍 {contract.serviceAddress}</p>
          {contract.property && (
            <p className="text-xs text-blue-500">
              {[contract.property.parish, contract.property.municipality, contract.property.state]
                .filter(Boolean).join(', ')}
            </p>
          )}
        </div>

        {/* Acciones */}
        <button
          onClick={() => onRequestTransfer(contract)}
          className="w-full flex items-center justify-between border border-gray-200 hover:border-[#1a5276] hover:bg-blue-50/50 rounded-xl px-4 py-3 text-sm transition-colors group"
        >
          <div className="flex items-center gap-2">
            <span>🔄</span>
            <span className="font-medium text-gray-700">Solicitar Cambio de Titularidad</span>
          </div>
          <span className="text-gray-400 group-hover:text-[#1a5276] transition-colors">→</span>
        </button>
      </div>
    </Modal>
  )
}
