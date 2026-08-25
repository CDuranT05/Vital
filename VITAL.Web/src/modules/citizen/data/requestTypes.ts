// Tipos de solicitud de beneficio social disponibles para el ciudadano

export type RequestType = 1 | 2 | 3

export interface RequestTypeInfo {
  id: RequestType
  icon: string
  title: string
  desc: string
  docs: { label: string; hint: string }[]
}

export const REQUEST_TYPES: RequestTypeInfo[] = [
  {
    id: 1,
    icon: '👴',
    title: 'Adulto Mayor en Situación Vulnerable',
    desc: 'Persona adulta mayor que vive sola y no cuenta con ingresos estables ni red de apoyo.',
    docs: [
      { label: 'Prueba de residencia solitaria', hint: 'Constancia, carta vecinal, etc.' },
      { label: 'Prueba de ausencia de ingresos estables', hint: 'Estado de cuenta, carta de desempleo, etc.' },
    ],
  },
  {
    id: 2,
    icon: '🏥',
    title: 'Condición Médica Grave',
    desc: 'El paciente o su representante registra el diagnóstico médico para acceder al beneficio.',
    docs: [
      { label: 'Diagnóstico médico oficial', hint: 'Informe, certificado médico, etc.' },
      { label: 'Cédula del paciente (si eres representante)', hint: 'Requerido solo si registras por otra persona.' },
    ],
  },
  {
    id: 3,
    icon: '👩‍👧‍👦',
    title: 'Madre Soltera',
    desc: 'Madre con más de 3 hijos a cargo, ingresos bajos y sin apoyo conyugal.',
    docs: [
      { label: 'Prueba de bajos ingresos', hint: 'Estado de cuenta, carta de trabajo, etc.' },
      { label: 'Actas de nacimiento / cédulas de los hijos', hint: 'Documentos de cada hijo.' },
    ],
  },
]
