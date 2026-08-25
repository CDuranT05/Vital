// Reglas del calendario de visitas domiciliarias:
// máximo 2 visitas por día · fines de semana y feriados cerrados

export const MAX_VISITS_PER_DAY = 2

// Feriados nacionales (Venezuela) — fijos y móviles por año
export const HOLIDAYS = new Set<string>([
  // 2026
  '2026-01-01', '2026-02-16', '2026-02-17', // Año Nuevo · Carnaval
  '2026-04-02', '2026-04-03', '2026-04-19', // Semana Santa · 19 de Abril
  '2026-05-01', '2026-06-24', '2026-07-05', '2026-07-24', // Trabajador · Carabobo · Independencia · Natalicio
  '2026-10-12', '2026-12-24', '2026-12-25', '2026-12-31', // Resistencia Indígena · Navidad · Fin de Año
  // 2027
  '2027-01-01', '2027-02-08', '2027-02-09',
  '2027-03-25', '2027-03-26', '2027-04-19',
  '2027-05-01', '2027-06-24', '2027-07-05', '2027-07-24',
  '2027-10-12', '2027-12-24', '2027-12-25', '2027-12-31',
])

/** Convierte una fecha a la clave 'YYYY-MM-DD' usada en todo el módulo */
export const dateKey = (d: Date): string => {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export const isWeekend = (d: Date): boolean => d.getDay() === 0 || d.getDay() === 6

export const isHoliday = (d: Date): boolean => HOLIDAYS.has(dateKey(d))

/** Días cerrados obligatoriamente: fin de semana o feriado */
export const isClosedDay = (d: Date): boolean => isWeekend(d) || isHoliday(d)

export const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

export const DAY_NAMES = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do']

/** Formatea 'YYYY-MM-DD' a texto legible, ej: "lunes, 25 de agosto de 2026" */
export const formatDayKey = (key: string): string => {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('es-VE', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })
}
