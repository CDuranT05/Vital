// Tipos de informe CSV disponibles para descarga

export type ReportType = 'technicians' | 'inspectors' | 'cases' | 'contracts'

export const REPORT_OPTIONS: { id: ReportType; label: string; icon: string; desc: string }[] = [
  { id: 'technicians', label: 'Técnicos',      icon: '🔧', desc: 'Rendimiento e incidentes por técnico' },
  { id: 'inspectors',  label: 'Inspectores',   icon: '🔍', desc: 'Revisiones y transferencias por inspector' },
  { id: 'cases',       label: 'Solicitudes',   icon: '🤝', desc: 'Historial de beneficios sociales' },
  { id: 'contracts',   label: 'Contratos',     icon: '📋', desc: 'Registro de contratos y titulares' },
]
