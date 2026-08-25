// ─── Capa mock completa — reemplaza todas las llamadas al API ─────────────────
// Activa con VITE_DEMO_MODE=true en el archivo .env.demo

import type { AuthUser, Contract, Invoice, VulnerabilityCase } from '../../types'
import type { IncidentAlert, AssignedIncident } from '../incidents'
import type { TransferRequest, TechnicianTransfer } from '../transfers'
import type { GlobalMetrics, BranchMetrics } from '../supervisor'
import type { ProfileData } from '../profile'
import type { GenerateInvoiceResult } from '../invoices'
import {
  DEMO_USERS, CITIZEN_CONTRACTS, CITIZEN_INVOICES, CITIZEN_CASES,
  INCIDENT_ALERTS, ASSIGNED_INCIDENTS, PENDING_CASES, PENDING_TRANSFERS,
  ASSIGNED_TRANSFERS, GLOBAL_METRICS, BRANCH_METRICS, CITIZEN_PROFILE,
  QR_SCAN_RESULT, IDS, SCHEDULED_VISITS,
} from './data'
import type { ScheduledVisit } from '../visits'
import { MAX_VISITS_PER_DAY } from '../../modules/inspector/data/calendarUtils'

const delay = (ms = 400) => new Promise(r => setTimeout(r, ms))

// ── Estado mutable en memoria (las acciones de la demo cambian el estado) ─────
let _invoices = [...CITIZEN_INVOICES]
let _cases    = [...CITIZEN_CASES]
let _pendingCases = [...PENDING_CASES]
let _alerts   = [...INCIDENT_ALERTS]
let _assigned = [...ASSIGNED_INCIDENTS]
let _pendingTransfers = [...PENDING_TRANSFERS]
let _assignedTransfers = [...ASSIGNED_TRANSFERS]
let _profile = { ...CITIZEN_PROFILE }
let _scheduledVisits = [...SCHEDULED_VISITS]

// Usuarios registrados dinámicamente en la demo (se suman a los fijos)
const _registeredUsers: Record<string, AuthUser & { password: string }> = {}

export const resetDemoState = () => {
  _invoices         = [...CITIZEN_INVOICES]
  _cases            = [...CITIZEN_CASES]
  _pendingCases     = [...PENDING_CASES]
  _alerts           = [...INCIDENT_ALERTS]
  _assigned         = [...ASSIGNED_INCIDENTS]
  _pendingTransfers = [...PENDING_TRANSFERS]
  _assignedTransfers= [...ASSIGNED_TRANSFERS]
  _profile          = { ...CITIZEN_PROFILE }
  _scheduledVisits  = [...SCHEDULED_VISITS]
}

// ── auth ─────────────────────────────────────────────────────────────────────
export const mockLogin = async (identityCard: string, password: string): Promise<AuthUser> => {
  await delay()
  const user = DEMO_USERS[identityCard] ?? _registeredUsers[identityCard]
  if (!user) throw { response: { data: { message: 'Cédula o contraseña incorrecta' } } }
  if (user.password !== password) throw { response: { data: { message: 'Cédula o contraseña incorrecta' } } }
  const { password: _p, ...authUser } = user
  return authUser
}

export const mockRegister = async (payload: {
  identityCard: string
  firstName: string
  lastName: string
  email: string
  phoneNumber: string
  password: string
  role: string
}): Promise<AuthUser> => {
  await delay(600)
  if (DEMO_USERS[payload.identityCard] || _registeredUsers[payload.identityCard])
    throw { response: { data: { message: 'Ya existe un usuario registrado con esa cédula.' } } }

  const roleMap: Record<string, AuthUser['role']> = {
    Citizen: 'Citizen', Technician: 'Technician',
    Inspector: 'Inspector', Supervisor: 'Supervisor',
  }
  const authUser: AuthUser = {
    userId: `demo-${Date.now()}`,
    identityCard: payload.identityCard,
    firstName: payload.firstName,
    lastName: payload.lastName,
    role: roleMap[payload.role] ?? 'Citizen',
    token: `demo-token-${payload.identityCard}`,
  }
  _registeredUsers[payload.identityCard] = { ...authUser, password: payload.password }
  return authUser
}

// ── contracts ────────────────────────────────────────────────────────────────
export const mockGetContracts = async (): Promise<Contract[]> => {
  await delay()
  return CITIZEN_CONTRACTS
}

// ── invoices ─────────────────────────────────────────────────────────────────
export const mockGetInvoices = async (): Promise<Invoice[]> => {
  await delay()
  return _invoices
}

export const mockGenerateInvoice = async (_meterId: string, currentReading: number): Promise<GenerateInvoiceResult> => {
  await delay(600)
  const prev = 1450
  const kwh = Math.max(0, currentReading - prev)
  const amount = parseFloat((kwh * 0.20).toFixed(2))
  const newInvoice: Invoice = {
    id: `inv-demo-${Date.now()}`,
    contractId: IDS.contract1,
    contractNumber: 'ESP-2024-0042',
    billingPeriodStart: new Date().toISOString(),
    billingPeriodEnd: new Date().toISOString(),
    consumptionKwh: kwh,
    amount,
    discountAmount: 0,
    totalAmount: amount,
    dueDate: new Date(Date.now() + 15 * 86400000).toISOString(),
    status: 1,
    createdAt: new Date().toISOString(),
  }
  _invoices = [newInvoice, ..._invoices]
  return { invoice: newInvoice, previousReading: prev, consumptionKwh: kwh }
}

// ── vulnerability cases ───────────────────────────────────────────────────────
export const mockGetMyCases = async (): Promise<VulnerabilityCase[]> => {
  await delay()
  return _cases
}

export const mockGetPendingCases = async (): Promise<VulnerabilityCase[]> => {
  await delay()
  return _pendingCases
}

export const mockGetCase = async (id: string): Promise<VulnerabilityCase> => {
  await delay()
  const found = [..._cases, ..._pendingCases].find(c => c.id === id)
  if (!found) throw { response: { data: { message: 'Caso no encontrado' } } }
  return found
}

export const mockCreateCase = async (payload: { contractId: string; description: string; requestType: number }): Promise<VulnerabilityCase> => {
  await delay(600)
  const newCase: VulnerabilityCase = {
    id: `ca-demo-${Date.now()}`,
    contractId: payload.contractId,
    contractNumber: 'ESP-2024-0042',
    citizenName: 'Carmen Rodríguez',
    serviceAddress: 'Calle Bolívar N°14, El Espino',
    requestDate: new Date().toISOString(),
    description: payload.description,
    status: 1,
    vulnerabilityLevel: 0,
    homeVisitRequired: false,
    evidences: [],
    homeVisits: [],
  }
  _cases = [newCase, ..._cases]
  return newCase
}

// Descuento en factura según el grado de riesgo aprobado
const DISCOUNT_BY_LEVEL: Record<number, number> = { 1: 0.25, 2: 0.5, 3: 0.75 }

export const mockReviewCase = async (id: string, payload: { status: number; vulnerabilityLevel: number; observations?: string }): Promise<VulnerabilityCase> => {
  await delay(500)
  const apply = (c: VulnerabilityCase): VulnerabilityCase => ({
    ...c,
    status: payload.status as VulnerabilityCase['status'],
    vulnerabilityLevel: payload.vulnerabilityLevel as VulnerabilityCase['vulnerabilityLevel'],
    observations: payload.observations ?? c.observations,
    approvalDate: payload.status === 3 ? new Date().toISOString() : c.approvalDate,
  })
  _pendingCases = _pendingCases.map(c => c.id === id ? apply(c) : c)
  _cases = _cases.map(c => c.id === id ? apply(c) : c)
  const updated = [..._pendingCases, ..._cases].find(c => c.id === id) ?? _cases[0]

  // Al aprobar, el sistema aplica la ayuda en las facturas pendientes del contrato
  if (payload.status === 3) {
    const pct = DISCOUNT_BY_LEVEL[payload.vulnerabilityLevel] ?? 0
    _invoices = _invoices.map(inv =>
      inv.contractId === updated.contractId && inv.status === 1
        ? {
            ...inv,
            discountAmount: +(inv.amount * pct).toFixed(2),
            totalAmount: +(inv.amount * (1 - pct)).toFixed(2),
          }
        : inv
    )
  }
  return updated
}

export const mockUploadEvidence = async (): Promise<void> => {
  await delay(400)
}

// ── home visits (inspector) ──────────────────────────────────────────────────
export const mockGetScheduledVisits = async (): Promise<ScheduledVisit[]> => {
  await delay()
  return [..._scheduledVisits]
}

export const mockScheduleVisit = async (caseId: string, date: string): Promise<ScheduledVisit> => {
  await delay(500)
  const dayCount = _scheduledVisits.filter(v => v.date === date).length
  if (dayCount >= MAX_VISITS_PER_DAY)
    throw { response: { data: { message: 'Ese día ya tiene el máximo de visitas programadas.' } } }
  if (_scheduledVisits.some(v => v.caseId === caseId))
    throw { response: { data: { message: 'Este caso ya tiene una visita programada.' } } }

  const c = [..._pendingCases, ..._cases].find(c => c.id === caseId)
  const visit: ScheduledVisit = {
    id: `visit-demo-${Date.now()}`,
    caseId,
    date,
    citizenName: c?.citizenName ?? 'Ciudadano',
    contractNumber: c?.contractNumber ?? '—',
    serviceAddress: c?.serviceAddress ?? '—',
    reason: c?.description ?? 'Verificación de solicitud de beneficio social.',
  }
  _scheduledVisits = [..._scheduledVisits, visit]
  return visit
}

// ── incidents ────────────────────────────────────────────────────────────────
export const mockGetAlerts = async (): Promise<IncidentAlert[]> => {
  await delay()
  return _alerts
}

export const mockAcknowledgeIncident = async (id: string): Promise<void> => {
  await delay(300)
  _alerts = _alerts.filter(a => a.id !== id)
}

export const mockGetAssignedIncidents = async (): Promise<AssignedIncident[]> => {
  await delay()
  return _assigned
}

export const mockReportIncident = async (): Promise<void> => {
  await delay(300)
}

export const mockResolveIncident = async (id: string): Promise<void> => {
  await delay(500)
  _assigned = _assigned.map(i => i.id === id ? { ...i, status: 3, attendedAt: i.attendedAt ?? new Date().toISOString() } : i)
}

// ── transfers ────────────────────────────────────────────────────────────────
export const mockGetPendingTransfers = async (): Promise<TransferRequest[]> => {
  await delay()
  return _pendingTransfers
}

export const mockApproveTransfer = async (id: string, notes?: string): Promise<TransferRequest> => {
  await delay(500)
  const found = _pendingTransfers.find(t => t.id === id)!
  const updated = { ...found, status: 2, statusLabel: 'Aprobada', reviewNotes: notes ?? null, reviewedAt: new Date().toISOString() }
  _pendingTransfers = _pendingTransfers.map(t => t.id === id ? updated : t)
  return updated
}

export const mockRejectTransfer = async (id: string, notes: string): Promise<TransferRequest> => {
  await delay(500)
  const found = _pendingTransfers.find(t => t.id === id)!
  const updated = { ...found, status: 3, statusLabel: 'Rechazada', reviewNotes: notes, reviewedAt: new Date().toISOString() }
  _pendingTransfers = _pendingTransfers.map(t => t.id === id ? updated : t)
  return updated
}

export const mockGetAssignedTransfers = async (): Promise<TechnicianTransfer[]> => {
  await delay()
  return _assignedTransfers
}

export const mockCompleteTransfer = async (id: string): Promise<void> => {
  await delay(400)
  _assignedTransfers = _assignedTransfers.filter(t => t.id !== id)
}

export const mockCreateTransferRequest = async (): Promise<TransferRequest> => {
  await delay(600)
  return _pendingTransfers[0]
}

export const mockGetPendingTransferForContract = async (): Promise<null> => {
  await delay()
  return null
}

// ── supervisor ────────────────────────────────────────────────────────────────
export const mockGetGlobalMetrics = async (): Promise<GlobalMetrics> => {
  await delay()
  return GLOBAL_METRICS
}

export const mockGetBranchMetrics = async (branchId: string): Promise<BranchMetrics> => {
  await delay()
  return BRANCH_METRICS[branchId] ?? GLOBAL_METRICS.branches[0]
}

export const mockDownloadReport = async (type: string): Promise<void> => {
  await delay(300)
  // Genera un CSV mínimo descargable para que la demo funcione
  const csvContent = `"Reporte VITAL — ${type}"\n"Generado en modo demo"\n"Fecha","${new Date().toLocaleDateString('es-VE')}"\n`
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `vital-${type}-demo.csv`
  a.click()
  URL.revokeObjectURL(url)
}

// ── profile ──────────────────────────────────────────────────────────────────
export const mockGetProfile = async (): Promise<ProfileData> => {
  await delay()
  return _profile
}

export const mockChangePassword = async (): Promise<void> => { await delay(500) }
export const mockChangeEmail = async (_cp: string, newEmail: string): Promise<void> => {
  await delay(500)
  _profile = { ..._profile, email: newEmail }
}
export const mockChangePhone = async (_cp: string, newPhone: string): Promise<void> => {
  await delay(500)
  _profile = { ..._profile, phone: newPhone }
}

// ── meters / qr ──────────────────────────────────────────────────────────────
export const mockScanQr = async (_qrCode: string) => {
  await delay(300)
  return QR_SCAN_RESULT
}

export const mockRegisterMeter = async () => {
  await delay(400)
  return { id: IDS.meter1, meterNumber: 'MTR-ESP-DEMO', qrCode: 'QR-DEMO', isActive: true, installationDate: new Date().toISOString() }
}

export const mockRecordReading = async (meterId: string, currentReading: number) => {
  await delay(400)
  return { id: 'reading-demo', meterId, meterNumber: 'MTR-ESP-00142', currentReading, readingDate: new Date().toISOString() }
}

// ── payments ──────────────────────────────────────────────────────────────────
const REFERENCE_SUCCESS = '2345'
const REFERENCE_REJECTED = '554874'

export const mockSubmitPayment = async (_invoiceId: string, referenceNumber: string): Promise<void> => {
  await delay(900)
  const ref = referenceNumber.trim()

  if (ref === REFERENCE_SUCCESS) return  // éxito — no lanza nada

  if (ref === REFERENCE_REJECTED) {
    throw {
      response: {
        data: {
          message:
            '⚠️ Pago no encontrado en el sistema bancario. Tu referencia N° 554874 no coincide con ningún movimiento registrado en nuestras cuentas. Por favor, verifica que realizaste el pago al número de cuenta correcto y que el monto corresponde al total de la factura. Si el problema persiste, comunícate con atención al cliente de VITAL para recibir asistencia.',
        },
      },
    }
  }

  // Cualquier otra referencia → éxito genérico en demo
  return
}

// ── password reset ────────────────────────────────────────────────────────────
export const mockRequestReset = async () => {
  await delay(600)
  return { message: 'Si la cédula está registrada, recibirás un código.', devToken: 'DEMO-TOKEN-ABC123' }
}
export const mockValidateToken = async () => { await delay(400); return { valid: true } }
export const mockResetPassword = async () => { await delay(500) }
