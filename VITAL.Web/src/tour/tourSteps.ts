// Pasos del tutorial guiado de la demo, declarados por rol.
// route: pathname donde aplica el paso (prefijo, o exacto con `exact`)
// target: valor del atributo data-tour del elemento a resaltar (sin target → tarjeta centrada)
// advance: 'next' avanza con el botón Siguiente · 'action' espera a que el
//          usuario realice la acción (se avanza cuando el siguiente paso está listo)

export interface TourStep {
  /** Identificador opcional, usado como destino de saltos condicionales */
  id?: string
  route: string
  exact?: boolean
  target?: string
  title: string
  text: string
  advance: 'next' | 'action'
  /** Saltos condicionales: si el elemento aparece, el tour salta al paso con ese id
      (ej. el usuario rechazó en vez de aprobar → continuar con el siguiente flujo) */
  jumpIf?: { target: string; toId: string }[]
  /** Al avanzar con "Siguiente", navegar automáticamente a esta ruta */
  navigateTo?: string
  /** Al avanzar con "Siguiente", continuar en el paso con este id (en vez del siguiente) */
  nextId?: string
  /** Paso de acción que avanza cuando su elemento desaparece (ej. se cerró el modal) */
  advanceWhenGone?: boolean
  /** A partir de este paso se liberan las alertas de emergencia retenidas
      (el tour del técnico las retiene para presentarlas en su momento) */
  releaseAlerts?: boolean
}

export const routeMatches = (step: TourStep, pathname: string): boolean =>
  step.exact ? pathname === step.route : pathname.startsWith(step.route)

const INSPECTOR_TOUR: TourStep[] = [
  {
    route: '/inspector', advance: 'next',
    title: '👋 Bienvenido al Panel del Inspector',
    text: 'Este tutorial te guiará por los dos flujos principales del rol: las solicitudes de beneficio social y los cambios de titularidad. Puedes omitir cualquier paso o salir cuando quieras con la ✕.',
  },
  {
    route: '/inspector', exact: true, target: 'visits-calendar', advance: 'next',
    title: '📅 Calendario de visitas',
    text: 'Aquí ves las visitas domiciliarias programadas: máximo 2 por día, y los fines de semana y feriados están siempre bloqueados. Los días con puntos tienen citas — al tocarlos verás el detalle de cada visita.',
  },
  {
    route: '/inspector', exact: true, target: 'cases-link', advance: 'action',
    title: '🤝 Casos Sociales',
    text: 'Aquí llegan las solicitudes de beneficio social de los ciudadanos. 👆 Haz clic en esta tarjeta para entrar.',
  },
  {
    route: '/inspector/cases', target: 'cases-list', advance: 'action',
    title: '📋 Solicitudes recibidas',
    text: 'Puedes filtrar por etapa con los botones de arriba. 👆 Selecciona el caso Pendiente (Pedro Castillo) para revisarlo.',
  },
  {
    route: '/inspector/case/', target: 'case-documents', advance: 'next',
    title: '📄 Validación de documentos',
    text: 'El inspector revisa las evidencias adjuntas — cédulas, constancias, informes médicos — antes de tomar una decisión. Cada documento queda registrado en el sistema.',
  },
  {
    route: '/inspector/case/', target: 'case-review', advance: 'action',
    jumpIf: [{ target: 'case-rejected', toId: 'transfer-intro' }],
    title: '⚖️ Etapa 1 · Revisión de documentos',
    text: 'Si los documentos son válidos, se aprueban para continuar; si detectas una irregularidad, rechaza dejando el motivo (ej. fraude documental). 👆 Haz clic en "✓ Aprobar Documentos" para ver el flujo de aprobación.',
  },
  {
    route: '/inspector/case/', target: 'schedule-visit', advance: 'action',
    jumpIf: [{ target: 'case-rejected', toId: 'transfer-intro' }],
    title: '📅 Agendar la visita obligatoria',
    text: 'Documentos aprobados — ahora la visita domiciliaria es obligatoria. 👆 Elige un día hábil con cupo en el calendario y presiona "Programar Visita". Los días llenos, feriados y fines de semana no se pueden escoger.',
  },
  {
    route: '/inspector/case/', target: 'case-result', advance: 'next',
    navigateTo: '/inspector', nextId: 'transfers-flow',
    title: '🎉 ¡Primer flujo completado!',
    text: 'Cuando el inspector realice la visita y compruebe los datos, registrará aquí el resultado: si la persona cumple, asigna el grado de riesgo (Bajo 25% · Medio 50% · Alto 75% de descuento) y el sistema aplica la ayuda en las facturas del contrato. Si no cumple, rechaza dejando el comentario del motivo. Presiona Siguiente para ir al próximo flujo.',
  },
  {
    id: 'transfer-intro',
    route: '/inspector/case/', advance: 'next',
    navigateTo: '/inspector', nextId: 'transfers-flow',
    title: '🔄 Ahora: Cambio de Titularidad',
    text: 'Tu decisión quedó registrada en el caso. Presiona Siguiente para volver al panel y probar el flujo de cambio de titularidad.',
  },
  {
    id: 'transfers-flow',
    route: '/inspector', exact: true, target: 'transfers-link', advance: 'action',
    title: '🔄 Cambios de Titularidad',
    text: 'Cuando un ciudadano solicita traspasar su contrato a otra persona, la solicitud llega aquí con su documentación. 👆 Entra a esta tarjeta.',
  },
  {
    route: '/inspector/transfers', target: 'transfers-list', advance: 'action',
    title: '📋 Solicitudes de traspaso',
    text: '👆 Haz clic en la solicitud pendiente para revisarla.',
  },
  {
    route: '/inspector/transfers', target: 'transfer-modal', advance: 'next', advanceWhenGone: true,
    title: '⚖️ Revisión del traspaso',
    text: 'El inspector compara el titular actual con el nuevo, revisa los documentos adjuntos y decide: al aprobar, la tarea pasa al técnico, que ejecuta el cambio en sitio (irreversible). Para rechazar es obligatorio indicar el motivo.',
  },
  {
    route: '/', advance: 'next',
    title: '✅ Tutorial completado',
    text: 'Ya conoces los flujos del inspector. Explora libremente — puedes repetir este tutorial cuando quieras con el botón ❓ del encabezado.',
  },
]

const CITIZEN_TOUR: TourStep[] = [
  {
    route: '/dashboard', advance: 'next',
    title: '👋 Bienvenido a VITAL',
    text: 'Este es tu portal de autogestión del servicio eléctrico. Te mostraré cómo pagar una factura, solicitar un beneficio social y pedir un cambio de titularidad. Puedes omitir pasos o salir con la ✕.',
  },
  {
    route: '/dashboard', target: 'citizen-stats', advance: 'next',
    title: '📊 Tu resumen',
    text: 'De un vistazo: cuántos contratos, facturas y solicitudes tienes. Todo se organiza en las pestañas de abajo.',
  },
  {
    route: '/dashboard', target: 'citizen-tabs', advance: 'action',
    title: '🧾 Tus facturas',
    text: '👆 Abre la pestaña "Facturas" para ver tu historial.',
  },
  {
    route: '/dashboard', target: 'invoices-list', advance: 'action',
    title: '🧾 Historial de facturas',
    text: 'Cada factura muestra su estado: Pagada o Pendiente. 👆 Toca la factura Pendiente para ver su detalle.',
  },
  {
    route: '/dashboard', target: 'invoice-detail', advance: 'action',
    title: '📄 Detalle de la factura',
    text: 'Aquí ves el consumo del período, el monto y el descuento social si lo tienes aprobado. 👆 Haz clic en "💳 Realizar Pago".',
  },
  {
    route: '/dashboard', target: 'pay-modal', advance: 'action', advanceWhenGone: true,
    title: '💳 Registrar el pago',
    text: 'Eliges el método, cargas la referencia bancaria y la foto del comprobante (obligatoria — en la demo sirve cualquier imagen). Referencia 2345 se aprueba · 554874 se rechaza — ¡pruébalo! Al terminar, cierra el modal.',
  },
  {
    route: '/dashboard', target: 'citizen-tabs', advance: 'action',
    title: '🏠 Siguiente flujo: beneficio social',
    text: 'Listo — ahora veamos las solicitudes de ayuda social. 👆 Abre la pestaña "Solicitudes".',
  },
  {
    route: '/dashboard', target: 'cases-section', advance: 'action',
    title: '🏠 Beneficio social',
    text: 'Aquí solicitas la tarifa social si estás en situación vulnerable. 👆 Presiona "+ Realizar Solicitud".',
  },
  {
    route: '/dashboard', target: 'request-type-modal', advance: 'action',
    title: '🤝 Tipos de beneficio',
    text: 'Tres perfiles: Adulto Mayor en Situación Vulnerable, Condición Médica Grave y Madre Soltera. Cada uno exige documentos que un inspector valida — así la ayuda llega a quien realmente la necesita. 👆 Selecciona un tipo para ver su formulario.',
  },
  {
    route: '/dashboard', target: 'request-form', advance: 'action', advanceWhenGone: true,
    title: '📝 Tu solicitud',
    text: 'Seleccionas el contrato del hogar, describes tu situación y subes los documentos requeridos. Un inspector la revisará, con visita domiciliaria incluida. Puedes enviarla o simplemente cerrar el modal para continuar.',
  },
  {
    route: '/dashboard', target: 'citizen-tabs', advance: 'action',
    title: '📋 Siguiente flujo: tu contrato',
    text: 'Ahora el cambio de titularidad. 👆 Abre la pestaña "Contratos".',
  },
  {
    route: '/dashboard', target: 'contracts-list', advance: 'action',
    title: '📋 Tus contratos',
    text: '👆 Toca tu contrato para abrir su detalle.',
  },
  {
    route: '/dashboard', target: 'contract-detail', advance: 'action',
    title: '📋 Tu contrato',
    text: 'Puedes ponerle un nombre personalizado y ver su medidor y dirección. 👆 Haz clic en "Solicitar Cambio de Titularidad".',
  },
  {
    route: '/dashboard', target: 'transfer-form', advance: 'next', advanceWhenGone: true,
    title: '🔄 Cambio de titularidad',
    text: 'Ingresas los datos del nuevo titular y la documentación que acredita la propiedad. Un inspector revisará la solicitud y, si la aprueba, un técnico ejecutará el cambio en sitio. Puedes enviarla o cerrar el modal.',
  },
  {
    route: '/dashboard', target: 'emergency-btn', advance: 'next',
    title: '🚨 Emergencias',
    text: 'Un último detalle: este botón reporta una emergencia eléctrica con un solo toque. La alerta llega en tiempo real al técnico de la zona con tu dirección y teléfono de contacto. (Si aún tienes un modal abierto, ciérralo para verlo.)',
  },
  {
    route: '/', advance: 'next',
    title: '✅ Tutorial completado',
    text: 'Ya conoces el portal ciudadano. Explora libremente — puedes repetir este tutorial con el botón ❓ del encabezado.',
  },
]

const TECHNICIAN_TOUR: TourStep[] = [
  {
    route: '/technician', advance: 'next',
    title: '👋 Bienvenido al Panel Técnico',
    text: 'La herramienta de campo del personal operativo. Te muestro el flujo de medición con QR y tus tareas asignadas. Puedes omitir pasos o salir con la ✕.',
  },
  {
    route: '/technician', exact: true, target: 'tech-progress', advance: 'next',
    title: '📈 Tu jornada de medición',
    text: 'El progreso del día: casas ya medidas contra las restantes de tu ruta.',
  },
  {
    route: '/technician', exact: true, target: 'tech-scanner', advance: 'action',
    jumpIf: [{ target: 'new-contract-modal', toId: 'newcontract-info' }],
    title: '📷 Prueba la medición',
    text: 'El corazón del flujo: en campo escaneas el QR del medidor de cada casa. 👆 Toca el escáner y en "Ingrésalo manualmente" escribe el código 00142 y presiona OK.',
  },
  {
    route: '/technician', target: 'reading-modal', advance: 'action', advanceWhenGone: true,
    title: '⚡ Registrar la lectura',
    text: 'Medidor encontrado — el sistema muestra su contrato y dirección. 👆 Escribe la lectura actual en kWh (ej: 1250) y presiona "Registrar y Facturar".',
  },
  {
    route: '/technician', target: 'invoice-done', advance: 'next', advanceWhenGone: true,
    title: '🧾 ¡Factura generada!',
    text: 'Medición terminada: el sistema calculó el consumo del período y la factura ya fue enviada al cliente — sin papel ni transcripciones. Tip: con el código NUEVO-1 simulas un medidor sin contrato y verás el alta de un cliente en sitio.',
  },
  {
    id: 'newcontract-info',
    route: '/technician', target: 'new-contract-modal', advance: 'next', advanceWhenGone: true,
    title: '📋 Medidor sin contrato',
    text: 'Este código no está vinculado a ningún contrato: el técnico registra aquí mismo al nuevo cliente y su inmueble, y el medidor queda asociado automáticamente. Completa el registro o cierra el modal para continuar.',
  },
  {
    route: '/technician', target: 'emergency-alert', advance: 'next', advanceWhenGone: true, releaseAlerts: true,
    title: '🚨 ¡Llegó una emergencia!',
    text: 'Esta alerta no la genera el sistema: la envió una persona real pidiendo ayuda — un ciudadano presionó el botón 🚨 de su contrato porque tiene un problema eléctrico en su casa. Al técnico de la zona le llega al instante con el nombre, teléfono y ubicación exacta. Puedes "Atender la Emergencia" (pasa a tus tareas para resolverla en sitio) u "Omitir" si otra cuadrilla la cubre.',
  },
  {
    route: '/technician', exact: true, target: 'tasks-link', advance: 'action',
    title: '📋 Mis Tareas',
    text: '👆 Entra aquí para ver tus emergencias y cambios de titularidad asignados.',
  },
  {
    route: '/technician/incidents', target: 'tech-tasks', advance: 'action',
    title: '📋 Tus tareas asignadas',
    text: 'Aquí llegan los cambios de titularidad ya aprobados por el inspector y las emergencias en atención. 👆 Toca el Cambio de Titularidad pendiente.',
  },
  {
    route: '/technician/incidents', target: 'tech-transfer-modal', advance: 'next', advanceWhenGone: true,
    title: '🔄 Ejecutar el cambio de titularidad',
    text: 'Verificas en sitio los datos del titular actual y del nuevo, y confirmas. Es irreversible: se crea el contrato del nuevo titular y el anterior queda marcado como Transferido.',
  },
  {
    route: '/technician/incidents', advance: 'next',
    title: '🚨 Emergencias',
    text: 'Las emergencias se atienden igual: al abrirlas registras las notas de la solución y evidencias fotográficas para marcarlas como solucionadas.',
  },
  {
    route: '/', advance: 'next',
    title: '✅ Tutorial completado',
    text: 'Tip para probar el flujo completo: entra al panel ciudadano en otra pestaña, presiona el botón 🚨 de un contrato, y verás la alerta llegar aquí en segundos. Repite este tutorial con el botón ❓ del encabezado.',
  },
]

const SUPERVISOR_TOUR: TourStep[] = [
  {
    route: '/supervisor', advance: 'next',
    title: '👋 Bienvenido al Panel de Supervisión',
    text: 'La vista gerencial del sistema: métricas de toda la red eléctrica en tiempo real.',
  },
  {
    route: '/supervisor', target: 'sup-global', advance: 'next',
    title: '🌐 Métricas globales',
    text: 'Contratos activos, incidentes, transferencias y solicitudes sociales de las 3 subestaciones combinadas.',
  },
  {
    route: '/supervisor', target: 'sup-branches', advance: 'next',
    title: '🏭 Comparativa por subestación',
    text: 'El rendimiento de cada subestación con sus tasas de resolución. 👆 Toca cualquier tarjeta para seleccionarla y ver su detalle abajo.',
  },
  {
    route: '/supervisor', target: 'sup-detail', advance: 'next',
    title: '👥 Rendimiento del personal',
    text: 'El detalle de la subestación seleccionada: incidentes resueltos y transferencias de cada técnico, y casos revisados de cada inspector.',
  },
  {
    route: '/supervisor', target: 'sup-reports', advance: 'next',
    title: '📥 Informes CSV',
    text: 'Exporta informes de técnicos, inspectores, solicitudes o contratos — globales o de la subestación seleccionada.',
  },
  {
    route: '/', advance: 'next',
    title: '✅ Tutorial completado',
    text: 'Ya conoces el panel de supervisión. Repite este tutorial cuando quieras con el botón ❓ del encabezado.',
  },
]

// Tours disponibles por rol
export const TOURS: Record<string, TourStep[]> = {
  Citizen: CITIZEN_TOUR,
  Technician: TECHNICIAN_TOUR,
  Inspector: INSPECTOR_TOUR,
  Supervisor: SUPERVISOR_TOUR,
}
