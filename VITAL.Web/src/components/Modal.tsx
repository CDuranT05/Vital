import { useState, type ReactNode } from 'react'

// Hook con las dos funciones del modal: abrir y cerrar
export function useModal(initialOpen = false) {
  const [isOpen, setIsOpen] = useState(initialOpen)
  const openModal = () => setIsOpen(true)
  const closeModal = () => setIsOpen(false)
  return { isOpen, openModal, closeModal }
}

const sizeClass = {
  sm: 'sm:max-w-sm',
  md: 'sm:max-w-md',
  lg: 'sm:max-w-lg',
} as const

interface ModalProps {
  open: boolean
  onClose: () => void
  children: ReactNode
  /** Si se pasa título se renderiza el header de color con botón de cierre */
  title?: string
  subtitle?: string
  icon?: string
  /** Color del header (ej: 'bg-red-600' para emergencias). Por defecto azul VITAL */
  headerClassName?: string
  size?: keyof typeof sizeClass
  /** Padding del cuerpo. Desactivar si el contenido maneja su propio padding */
  padded?: boolean
}

// Modal genérico: se adapta al contenido que reciba cada componente.
// En móvil aparece como hoja inferior; en pantallas grandes, centrado.
export default function Modal({
  open,
  onClose,
  children,
  title,
  subtitle,
  icon,
  headerClassName = 'bg-[#1a5276]',
  size = 'md',
  padded = true,
}: ModalProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
      <div className={`bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full ${sizeClass[size]} max-h-[92vh] overflow-y-auto`}>
        {title && (
          <div className={`${headerClassName} px-5 py-4 rounded-t-2xl flex items-center gap-3 sticky top-0 z-10`}>
            {icon && <span className="text-2xl">{icon}</span>}
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-white text-base leading-tight truncate">{title}</h3>
              {subtitle && <p className="text-white/70 text-xs truncate">{subtitle}</p>}
            </div>
            <button onClick={onClose} className="text-white/70 hover:text-white text-xl leading-none shrink-0">×</button>
          </div>
        )}
        <div className={padded ? 'p-5' : ''}>{children}</div>
      </div>
    </div>
  )
}
