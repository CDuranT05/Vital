// ─── Datos de demostración para VITAL ────────────────────────────────────────
// Representan una sucursal "El Espino" con contratos, facturas, incidentes y más.

import type { Contract, Invoice, VulnerabilityCase, AuthUser } from '../../types'
import type { IncidentAlert, AssignedIncident } from '../incidents'
import type { TransferRequest, TechnicianTransfer } from '../transfers'
import type { GlobalMetrics, BranchMetrics } from '../supervisor'
import type { ProfileData } from '../profile'
import type { ScheduledVisit } from '../visits'
import { isClosedDay, dateKey } from '../../modules/inspector/data/calendarUtils'

// ── IDs fijos (para que las relaciones entre datos sean coherentes) ────────────
export const IDS = {
  branchEspino:     'b1000000-0000-0000-0000-000000000001',
  branchValle:      'b2000000-0000-0000-0000-000000000002',
  branchSanJuan:    'b3000000-0000-0000-0000-000000000003',

  contract1:  'c1000000-0000-0000-0000-000000000001',
  contract2:  'c2000000-0000-0000-0000-000000000002',
  contract3:  'c3000000-0000-0000-0000-000000000003',
  contract4:  'c4000000-0000-0000-0000-000000000004',
  contract5:  'c5000000-0000-0000-0000-000000000005',

  meter1: 'm1000000-0000-0000-0000-000000000001',
  meter2: 'm2000000-0000-0000-0000-000000000002',
  meter3: 'm3000000-0000-0000-0000-000000000003',

  case1: 'ca100000-0000-0000-0000-000000000001',
  case2: 'ca200000-0000-0000-0000-000000000002',
  case3: 'ca300000-0000-0000-0000-000000000003',

  incident1: 'i1000000-0000-0000-0000-000000000001',
  incident2: 'i2000000-0000-0000-0000-000000000002',
  incident3: 'i3000000-0000-0000-0000-000000000003',

  transfer1: 't1000000-0000-0000-0000-000000000001',
  transfer2: 't2000000-0000-0000-0000-000000000002',
}

// ── Usuarios demo ─────────────────────────────────────────────────────────────
export const DEMO_USERS: Record<string, AuthUser & { password: string }> = {
  // Ciudadano
  'V-14523187': {
    userId: 'u-citizen-01',
    identityCard: 'V-14523187',
    firstName: 'Carmen',
    lastName: 'Rodríguez',
    role: 'Citizen',
    token: 'demo-token-citizen',
    password: 'Demo123!',
  },
  // Técnico
  'T-001': {
    userId: 'u-tech-01',
    identityCard: 'T-001',
    firstName: 'Jorge',
    lastName: 'Méndez',
    role: 'Technician',
    token: 'demo-token-tech',
    password: 'Demo123!',
  },
  // Inspector
  'I-001': {
    userId: 'u-insp-01',
    identityCard: 'I-001',
    firstName: 'María',
    lastName: 'González',
    role: 'Inspector',
    token: 'demo-token-inspector',
    password: 'Inspector123!',
  },
  // Supervisor
  'SUP-001': {
    userId: 'u-sup-01',
    identityCard: 'SUP-001',
    firstName: 'Ana',
    lastName: 'Supervisora',
    role: 'Supervisor',
    token: 'demo-token-supervisor',
    password: 'Demo123!',
  },
}

// ── Contratos del ciudadano Carmen ────────────────────────────────────────────
export const CITIZEN_CONTRACTS: Contract[] = [
  {
    id: IDS.contract1,
    contractNumber: 'ESP-2024-0042',
    serviceAddress: 'Calle Bolívar N°14, El Espino',
    isPrimaryResidence: true,
    contractType: 1,
    createdAt: '2024-03-10T08:00:00Z',
    property: {
      id: 'prop-01',
      address: 'Calle Bolívar N°14',
      parish: 'El Espino',
      municipality: 'Infantes',
      state: 'Guárico',
    },
    meter: {
      id: IDS.meter1,
      meterNumber: 'MTR-ESP-00142',
      qrCode: 'QR-MTR-ESP-00142',
      isActive: true,
      installationDate: '2024-03-10T08:00:00Z',
    },
  },
]

// ── Facturas del ciudadano ────────────────────────────────────────────────────
export const CITIZEN_INVOICES: Invoice[] = [
  {
    id: 'inv-001',
    contractId: IDS.contract1,
    contractNumber: 'ESP-2024-0042',
    billingPeriodStart: '2025-05-01T00:00:00Z',
    billingPeriodEnd:   '2025-05-31T23:59:59Z',
    consumptionKwh: 320,
    amount: 64.00,
    discountAmount: 6.40,
    totalAmount: 57.60,
    dueDate: '2025-06-15T00:00:00Z',
    status: 2,
    createdAt: '2025-06-01T09:00:00Z',
  },
  {
    id: 'inv-002',
    contractId: IDS.contract1,
    contractNumber: 'ESP-2024-0042',
    billingPeriodStart: '2025-04-01T00:00:00Z',
    billingPeriodEnd:   '2025-04-30T23:59:59Z',
    consumptionKwh: 295,
    amount: 59.00,
    discountAmount: 0,
    totalAmount: 59.00,
    dueDate: '2025-05-15T00:00:00Z',
    status: 2,
    createdAt: '2025-05-01T09:00:00Z',
  },
  {
    id: 'inv-003',
    contractId: IDS.contract1,
    contractNumber: 'ESP-2024-0042',
    billingPeriodStart: '2025-06-01T00:00:00Z',
    billingPeriodEnd:   '2025-06-30T23:59:59Z',
    consumptionKwh: 348,
    amount: 69.60,
    discountAmount: 0,
    totalAmount: 69.60,
    dueDate: '2025-07-15T00:00:00Z',
    status: 1,
    createdAt: '2025-07-01T09:00:00Z',
  },
]

// ── Casos de vulnerabilidad del ciudadano ─────────────────────────────────────
export const CITIZEN_CASES: VulnerabilityCase[] = [
  {
    id: IDS.case1,
    contractId: IDS.contract1,
    contractNumber: 'ESP-2024-0042',
    citizenName: 'Carmen Rodríguez',
    serviceAddress: 'Calle Bolívar N°14, El Espino',
    requestDate: '2025-05-20T10:30:00Z',
    description: 'Soy madre soltera con 4 hijos menores de edad, trabajo como costurera con ingresos muy bajos y solicito el beneficio social eléctrico para aliviar la carga económica.',
    status: 3,
    vulnerabilityLevel: 2,
    homeVisitRequired: true,
    approvalDate: '2025-06-03T14:00:00Z',
    evidences: [
      { id: 'ev-01', fileName: 'prueba_ingresos.pdf', filePath: '/evidence/prueba_ingresos.pdf', contentType: 'application/pdf', uploadedAt: '2025-05-20T10:35:00Z' },
      { id: 'ev-02', fileName: 'actas_nacimiento.pdf', filePath: '/evidence/actas_nacimiento.pdf', contentType: 'application/pdf', uploadedAt: '2025-05-20T10:36:00Z' },
    ],
    homeVisits: [],
  },
]

// ── Alertas de incidentes (para técnico) ───────────────────────────────────────
export const INCIDENT_ALERTS: IncidentAlert[] = [
  {
    id: IDS.incident1,
    contractNumber: 'ESP-2024-0042',
    serviceAddress: 'Calle Bolívar N°14, El Espino',
    parish: 'El Espino',
    municipality: 'Infantes',
    state: 'Guárico',
    citizenName: 'Carmen Rodríguez',
    citizenPhone: '04141234567',
    citizenIdentityCard: 'V-14523187',
    reportedAt: '2025-06-22T07:45:00Z',
  },
  {
    id: IDS.incident2,
    contractNumber: 'ESP-2024-0078',
    serviceAddress: 'Av. Sucre N°7, El Espino',
    parish: 'El Espino',
    municipality: 'Infantes',
    state: 'Guárico',
    citizenName: 'Luis Fernández',
    citizenPhone: '04169876543',
    citizenIdentityCard: 'V-18765432',
    reportedAt: '2025-06-22T09:10:00Z',
  },
]

// ── Incidentes asignados al técnico ──────────────────────────────────────────
export const ASSIGNED_INCIDENTS: AssignedIncident[] = [
  {
    id: IDS.incident3,
    contractNumber: 'ESP-2024-0031',
    serviceAddress: 'Carrera 3, Casa 22, El Espino',
    parish: 'El Espino',
    municipality: 'Infantes',
    state: 'Guárico',
    citizenName: 'Rosa Peña',
    citizenPhone: '04241112233',
    citizenIdentityCard: 'V-11223344',
    reportedAt: '2025-06-21T16:00:00Z',
    attendedAt: '2025-06-22T08:00:00Z',
    status: 2,
  },
  {
    id: IDS.incident2,
    contractNumber: 'ESP-2024-0078',
    serviceAddress: 'Av. Sucre N°7, El Espino',
    parish: 'El Espino',
    municipality: 'Infantes',
    state: 'Guárico',
    citizenName: 'Luis Fernández',
    citizenPhone: '04169876543',
    citizenIdentityCard: 'V-18765432',
    reportedAt: '2025-06-22T09:10:00Z',
    attendedAt: null,
    status: 1,
  },
]

// ── Casos de vulnerabilidad pendientes (inspector) ────────────────────────────
export const PENDING_CASES: VulnerabilityCase[] = [
  {
    id: IDS.case2,
    contractId: IDS.contract2,
    contractNumber: 'ESP-2024-0078',
    citizenName: 'Pedro Castillo',
    serviceAddress: 'Av. Sucre N°7, El Espino',
    requestDate: '2025-06-10T11:00:00Z',
    description: 'Adulto mayor de 78 años que vive solo desde el fallecimiento de su esposa. Sin ingresos formales, depende de ayuda de vecinos.',
    status: 1,
    vulnerabilityLevel: 0,
    homeVisitRequired: false,
    evidences: [
      { id: 'ev-03', fileName: 'constancia_residencia.pdf', filePath: '/evidence/constancia_residencia.pdf', contentType: 'application/pdf', uploadedAt: '2025-06-10T11:05:00Z' },
      { id: 'ev-04', fileName: 'carta_desempleo.pdf', filePath: '/evidence/carta_desempleo.pdf', contentType: 'application/pdf', uploadedAt: '2025-06-10T11:06:00Z' },
    ],
    homeVisits: [],
  },
  {
    id: IDS.case3,
    contractId: IDS.contract3,
    contractNumber: 'ESP-2024-0055',
    citizenName: 'María Lozada',
    serviceAddress: 'Calle Miranda N°3, El Espino',
    requestDate: '2025-06-15T09:00:00Z',
    description: 'Paciente con condición médica grave — diagnóstico oncológico en etapa avanzada. Su hija actúa como representante.',
    status: 2,
    vulnerabilityLevel: 0,
    homeVisitRequired: true,
    evidences: [
      { id: 'ev-05', fileName: 'diagnostico_medico.pdf', filePath: '/evidence/diagnostico_medico.pdf', contentType: 'application/pdf', uploadedAt: '2025-06-15T09:05:00Z' },
      { id: 'ev-06', fileName: 'cedula_paciente.jpg', filePath: '/evidence/cedula_paciente.jpg', contentType: 'image/jpeg', uploadedAt: '2025-06-15T09:06:00Z' },
    ],
    homeVisits: [],
  },
]

// ── Visitas domiciliarias programadas (inspector) ─────────────────────────────
// Se generan sobre los próximos días hábiles para que el calendario de la demo
// siempre muestre citas vigentes: un día lleno (2 visitas) y otro con cupo.
const nextOpenDays = (count: number): string[] => {
  const days: string[] = []
  const d = new Date()
  while (days.length < count) {
    d.setDate(d.getDate() + 1)
    if (!isClosedDay(d)) days.push(dateKey(d))
  }
  return days
}

const [visitDay1, visitDay2] = nextOpenDays(2)

export const SCHEDULED_VISITS: ScheduledVisit[] = [
  {
    id: 'visit-01',
    caseId: IDS.case3,
    date: visitDay1,
    citizenName: 'María Lozada',
    identityCard: 'V-16789034',
    phone: '04145556677',
    contractNumber: 'ESP-2024-0055',
    serviceAddress: 'Calle Miranda N°3, El Espino',
    reason: 'Condición Médica Grave — verificación del diagnóstico y condiciones del hogar. Su hija actúa como representante.',
  },
  {
    id: 'visit-02',
    caseId: 'ca400000-0000-0000-0000-000000000004',
    date: visitDay1,
    citizenName: 'Rosa Peña',
    identityCard: 'V-11223344',
    phone: '04241112233',
    contractNumber: 'ESP-2024-0031',
    serviceAddress: 'Carrera 3, Casa 22, El Espino',
    reason: 'Adulto Mayor en Situación Vulnerable — verificación de residencia solitaria y ausencia de ingresos.',
  },
  {
    id: 'visit-03',
    caseId: 'ca500000-0000-0000-0000-000000000005',
    date: visitDay2,
    citizenName: 'Yolanda Rivas',
    identityCard: 'V-19887766',
    phone: '04165554433',
    contractNumber: 'ESP-2024-0067',
    serviceAddress: 'Urb. Los Pinos, Mz 2 Casa 15, El Espino',
    reason: 'Madre Soltera — verificación del núcleo familiar (5 hijos a cargo).',
  },
]

// ── Transferencias pendientes (inspector) ─────────────────────────────────────
export const PENDING_TRANSFERS: TransferRequest[] = [
  {
    id: IDS.transfer1,
    contractId: IDS.contract4,
    contractNumber: 'ESP-2024-0099',
    serviceAddress: 'Urb. Los Pinos, Mz 4 Casa 8, El Espino',
    parish: 'El Espino',
    municipality: 'Infantes',
    state: 'Guárico',
    currentOwnerName: 'Alejandro Mora',
    currentOwnerIdentityCard: 'V-9876543',
    newOwnerIdentityCard: 'V-22334455',
    newOwnerFirstName: 'Sofía',
    newOwnerLastName: 'Torres',
    newOwnerPhone: '04241234567',
    newOwnerEmail: 'storres@gmail.com',
    status: 1,
    statusLabel: 'Pendiente',
    reviewNotes: null,
    createdAt: '2025-06-18T10:00:00Z',
    reviewedAt: null,
    documents: [
      { id: 'td-01', originalName: 'documento_venta.pdf', documentType: 'Contrato de venta', uploadedAt: '2025-06-18T10:02:00Z' },
    ],
  },
]

// ── Transferencias asignadas al técnico ───────────────────────────────────────
export const ASSIGNED_TRANSFERS: TechnicianTransfer[] = [
  {
    id: IDS.transfer2,
    contractId: IDS.contract5,
    contractNumber: 'ESP-2024-0110',
    serviceAddress: 'Calle Páez N°22, El Espino',
    parish: 'El Espino',
    municipality: 'Infantes',
    state: 'Guárico',
    currentOwnerName: 'Marcos Salinas',
    currentOwnerIdentityCard: 'V-7654321',
    newOwnerIdentityCard: 'V-33445566',
    newOwnerFirstName: 'Andrea',
    newOwnerLastName: 'Vásquez',
    newOwnerPhone: '04161234567',
    createdAt: '2025-06-20T14:00:00Z',
  },
]

// ── Métricas globales (supervisor) ────────────────────────────────────────────
const branchEspino: BranchMetrics = {
  branchId: IDS.branchEspino,
  branchName: 'Subestación El Espino',
  city: 'El Espino',
  activeContracts: 284,
  totalIncidents: 47,
  resolvedIncidents: 41,
  pendingIncidents: 6,
  totalTransfers: 18,
  pendingTransfers: 3,
  completedTransfers: 15,
  totalCases: 22,
  pendingCases: 5,
  approvedCases: 14,
  rejectedCases: 3,
  technicians: [
    { id: 'u-tech-01', name: 'Jorge Méndez', identityCard: 'T-001', incidentsAssigned: 28, incidentsResolved: 25, incidentsPending: 3, transfersCompleted: 9 },
    { id: 'u-tech-02', name: 'Carlos Blanco', identityCard: 'T-002', incidentsAssigned: 19, incidentsResolved: 16, incidentsPending: 3, transfersCompleted: 6 },
  ],
  inspectors: [
    { id: 'u-insp-01', name: 'María González', identityCard: 'I-001', casesReviewed: 22, casesApproved: 14, casesRejected: 3, transfersReviewed: 18, transfersApproved: 15, transfersRejected: 3 },
  ],
}

const branchValle: BranchMetrics = {
  branchId: IDS.branchValle,
  branchName: 'Subestación Valle de la Pascua',
  city: 'Valle de la Pascua',
  activeContracts: 412,
  totalIncidents: 63,
  resolvedIncidents: 58,
  pendingIncidents: 5,
  totalTransfers: 27,
  pendingTransfers: 4,
  completedTransfers: 23,
  totalCases: 31,
  pendingCases: 7,
  approvedCases: 20,
  rejectedCases: 4,
  technicians: [
    { id: 'u-tech-03', name: 'Enrique Díaz', identityCard: 'T-003', incidentsAssigned: 35, incidentsResolved: 33, incidentsPending: 2, transfersCompleted: 14 },
    { id: 'u-tech-04', name: 'Paola Gómez', identityCard: 'T-004', incidentsAssigned: 28, incidentsResolved: 25, incidentsPending: 3, transfersCompleted: 9 },
  ],
  inspectors: [
    { id: 'u-insp-02', name: 'Rafael Morales', identityCard: 'I-002', casesReviewed: 31, casesApproved: 20, casesRejected: 4, transfersReviewed: 27, transfersApproved: 23, transfersRejected: 4 },
  ],
}

const branchSanJuan: BranchMetrics = {
  branchId: IDS.branchSanJuan,
  branchName: 'Subestación San Juan de los Morros',
  city: 'San Juan de los Morros',
  activeContracts: 568,
  totalIncidents: 89,
  resolvedIncidents: 82,
  pendingIncidents: 7,
  totalTransfers: 39,
  pendingTransfers: 5,
  completedTransfers: 34,
  totalCases: 45,
  pendingCases: 9,
  approvedCases: 30,
  rejectedCases: 6,
  technicians: [
    { id: 'u-tech-05', name: 'Roberto Soto', identityCard: 'T-005', incidentsAssigned: 48, incidentsResolved: 44, incidentsPending: 4, transfersCompleted: 20 },
    { id: 'u-tech-06', name: 'Luisa Herrera', identityCard: 'T-006', incidentsAssigned: 41, incidentsResolved: 38, incidentsPending: 3, transfersCompleted: 14 },
  ],
  inspectors: [
    { id: 'u-insp-03', name: 'Gabriela Vargas', identityCard: 'I-003', casesReviewed: 45, casesApproved: 30, casesRejected: 6, transfersReviewed: 39, transfersApproved: 34, transfersRejected: 5 },
  ],
}

export const GLOBAL_METRICS: GlobalMetrics = {
  totalActiveContracts: branchEspino.activeContracts + branchValle.activeContracts + branchSanJuan.activeContracts,
  totalIncidents: branchEspino.totalIncidents + branchValle.totalIncidents + branchSanJuan.totalIncidents,
  totalResolvedIncidents: branchEspino.resolvedIncidents + branchValle.resolvedIncidents + branchSanJuan.resolvedIncidents,
  totalTransfers: branchEspino.totalTransfers + branchValle.totalTransfers + branchSanJuan.totalTransfers,
  totalCompletedTransfers: branchEspino.completedTransfers + branchValle.completedTransfers + branchSanJuan.completedTransfers,
  totalCases: branchEspino.totalCases + branchValle.totalCases + branchSanJuan.totalCases,
  totalApprovedCases: branchEspino.approvedCases + branchValle.approvedCases + branchSanJuan.approvedCases,
  branches: [branchEspino, branchValle, branchSanJuan],
}

export const BRANCH_METRICS: Record<string, BranchMetrics> = {
  [IDS.branchEspino]: branchEspino,
  [IDS.branchValle]: branchValle,
  [IDS.branchSanJuan]: branchSanJuan,
}

// ── Perfil del ciudadano ─────────────────────────────────────────────────────
export const CITIZEN_PROFILE: ProfileData = {
  firstName: 'Carmen',
  lastName: 'Rodríguez',
  identityCard: 'V-14523187',
  email: 'carmen.rodriguez@gmail.com',
  phone: '04141234567',
}

// ── Resultado de escaneo QR (técnico) ────────────────────────────────────────
export const QR_SCAN_RESULT = {
  qrCode: 'QR-MTR-ESP-00142',
  meterId: IDS.meter1,
  meterNumber: 'MTR-ESP-00142',
  contractId: IDS.contract1,
  contractNumber: 'ESP-2024-0042',
  serviceAddress: 'Calle Bolívar N°14, El Espino',
  hasContract: true,
}
