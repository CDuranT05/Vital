import Modal from '../../../components/Modal'
import { REQUEST_TYPES, type RequestType } from '../data/requestTypes'

interface RequestTypeModalProps {
  /** El beneficio solo aplica a titulares con una única vivienda */
  ineligible: boolean
  onSelect: (type: RequestType) => void
  onClose: () => void
}

export default function RequestTypeModal({ ineligible, onSelect, onClose }: RequestTypeModalProps) {
  return (
    <Modal open onClose={onClose} icon="🏠" title="Solicitud de Beneficio Social" size="lg">
      {ineligible ? (
        <div className="bg-amber-50 border border-amber-300 rounded-xl p-5 text-center">
          <p className="text-3xl mb-2">🏠</p>
          <p className="font-bold text-amber-800 text-base">No elegible para beneficio social</p>
          <p className="text-sm text-amber-700 mt-1">
            El beneficio social solo aplica para titulares con <strong>una única vivienda</strong> registrada.
            Tienes más de un contrato activo a tu nombre.
          </p>
          <button onClick={onClose} className="mt-4 bg-[#1a5276] text-white px-5 py-2 rounded-lg text-sm hover:bg-[#154360]">
            Entendido
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-gray-500">Selecciona el tipo de solicitud que deseas realizar:</p>
          <div className="grid gap-3">
            {REQUEST_TYPES.map(t => (
              <button
                key={t.id}
                onClick={() => onSelect(t.id)}
                className="w-full bg-white border border-gray-200 rounded-xl p-4 text-left hover:border-[#1a5276]/40 hover:shadow-md transition-all flex items-start gap-4"
              >
                <span className="text-3xl mt-0.5">{t.icon}</span>
                <div>
                  <p className="font-semibold text-gray-800">{t.title}</p>
                  <p className="text-sm text-gray-500 mt-0.5">{t.desc}</p>
                </div>
                <span className="ml-auto text-gray-300 text-xl self-center">›</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </Modal>
  )
}
