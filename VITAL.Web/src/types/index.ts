export type UserRole = 'Citizen' | 'Technician' | 'Inspector' | 'Supervisor' | 'Administrator' | 'Assistant'

export interface AuthUser {
  userId: string
  identityCard: string
  firstName: string
  lastName: string
  role: UserRole
  token: string
}

export interface Contract {
  id: string
  contractNumber: string
  serviceAddress: string
  isPrimaryResidence: boolean
  contractType: number
  createdAt: string
  property?: Property
  meter?: Meter
}

export interface Property {
  id: string
  address: string
  parish: string
  municipality: string
  state: string
}

export interface Meter {
  id: string
  meterNumber: string
  qrCode: string
  isActive: boolean
  installationDate: string
}

export interface Invoice {
  id: string
  contractId: string
  contractNumber: string
  billingPeriodStart: string
  billingPeriodEnd: string
  consumptionKwh: number
  amount: number
  discountAmount: number
  totalAmount: number
  dueDate: string
  status: InvoiceStatus
  createdAt: string
}

export type InvoiceStatus = 1 | 2 | 3 | 4

export const InvoiceStatusLabel: Record<InvoiceStatus, string> = {
  1: 'Pendiente',
  2: 'Pagada',
  3: 'Vencida',
  4: 'Anulada'
}

export interface VulnerabilityCase {
  id: string
  contractId: string
  contractNumber: string
  citizenName: string
  serviceAddress: string
  requestDate: string
  description: string
  status: CaseStatus
  vulnerabilityLevel: VulnerabilityLevel
  homeVisitRequired: boolean
  approvalDate?: string
  /** Observaciones del inspector — obligatorias al rechazar (ej. fraude) */
  observations?: string
  evidences: Evidence[]
  homeVisits: HomeVisit[]
}

export type CaseStatus = 1 | 2 | 3 | 4

// Flujo: Pendiente (revisión de documentos) → Visita Pendiente (papeles
// aprobados, falta la visita obligatoria) → Aprobado / Rechazado
export const CaseStatusLabel: Record<CaseStatus, string> = {
  1: 'Pendiente',
  2: 'Visita Pendiente',
  3: 'Aprobado',
  4: 'Rechazado'
}

export type VulnerabilityLevel = 0 | 1 | 2 | 3

export const VulnerabilityLevelLabel: Record<VulnerabilityLevel, string> = {
  0: 'Sin Vulnerabilidad',
  1: 'Baja',
  2: 'Media',
  3: 'Alta'
}

export interface Evidence {
  id: string
  fileName: string
  filePath: string
  contentType: string
  uploadedAt: string
}

export interface HomeVisit {
  id: string
  inspectorId: string
  visitDate: string
  observations: string
  informationConfirmed: boolean
  photoPaths: string[]
  neighborStatements: NeighborStatement[]
}

export interface NeighborStatement {
  id: string
  neighborName: string
  identityCard: string
  phoneNumber: string
  statement: string
}

export interface QrScanResult {
  qrCode: string
  meterId?: string
  meterNumber?: string
  contractId?: string
  contractNumber?: string
  serviceAddress?: string
  hasContract: boolean
}
