// =====================================================
// DATABASE TYPES - Sistema Gestión Despacho Legal
// =====================================================
// Generado desde: database-schema.json (2026-01-19)
// Actualizado: 2026-01-20 con campo 'patrocinado'
// =====================================================

/**
 * IMPORTANTE: Estos types reflejan EXACTAMENTE el esquema de Supabase
 * - is_nullable: YES → campo?: type | null
 * - is_nullable: NO → campo: type
 * - Defaults se manejan en INSERT (no en types)
 */

// =====================================================
// ENUMS - Valores permitidos por CHECK constraints
// =====================================================

export type TipoCaso = 'Penal' | 'Civil' | 'Laboral' | 'Administrativo'

export type EstadoCaso = 'Activo' | 'Pausado' | 'Cerrado'

export type EstadoProcesal = 'En proceso' | 'Ganado' | 'Perdido'

export type FormaPago = 'Por hora' | 'Por etapas' | 'Monto fijo' | 'Cuota litis'

export type CategoriaNota = 'General' | 'Urgente' | 'Legal' | 'Administrativa' | 'Financiera'

export type PrioridadNota = 'Alta' | 'Media' | 'Baja'

export type TipoEvento = 'Audiencia' | 'Plazo' | 'Reunión' | 'Otro'

export type MetodoPago = 'Efectivo' | 'Transferencia' | 'Cheque' | 'Tarjeta' | 'Otro'

export type RolUsuario = 'admin' | 'abogado' | 'secretaria'

// =====================================================
// TABLA: casos
// =====================================================

export interface Caso {
  // IDs y referencias
  id: string                        // uuid, NOT NULL, PK
  codigo_estimado: string           // text, NOT NULL, UNIQUE (auto-generado por trigger)
  
  // Personas
  cliente: string                   // text, NOT NULL (quien paga)
  patrocinado?: string | null       // text, NULLABLE (quien es defendido) - AGREGADO v2.5.0
  abogado_asignado_id?: string | null   // uuid, NULLABLE, FK → profiles(id)
  created_by?: string | null        // uuid, NULLABLE, FK → profiles(id)
  
  // Información del caso
  descripcion?: string | null       // text, NULLABLE
  expediente?: string | null        // text, NULLABLE
  tipo: TipoCaso                    // text, NOT NULL
  etapa?: string | null             // text, NULLABLE (ej: "Preliminar", "Juicio oral")
  
  // Estados (¡Tiene 2 columnas de estado!)
  estado: EstadoCaso                // text, NOT NULL, DEFAULT 'Activo'
  estado_caso?: EstadoProcesal | null   // varchar(50), NULLABLE, DEFAULT 'En proceso'
  
  // Financiero
  forma_pago?: FormaPago | null     // text, NULLABLE
  monto_total?: number | null       // numeric, NULLABLE, DEFAULT 0
  monto_cobrado?: number | null     // numeric, NULLABLE, DEFAULT 0
  monto_pendiente?: number | null   // numeric, NULLABLE (calculado?)
  
  // Ubicación y fechas
  ubicacion_fisica?: string | null  // text, NULLABLE
  fecha_inicio?: string | null      // date, NULLABLE (formato: YYYY-MM-DD)
  
  // Carpeta (organización)
  carpeta_id?: string | null        // uuid, NULLABLE, FK → carpetas(id)
  
  // Permisos (Sistema de acceso compartido - AGREGADO v2.6.0)
  usuarios_con_acceso?: string[] | null  // uuid[], NULLABLE (array de UUIDs de usuarios)
  
  // Timestamps
  created_at?: string | null        // timestamptz, DEFAULT now() (formato ISO 8601)
  updated_at?: string | null        // timestamptz, DEFAULT now()
}

/**
 * Tipo para crear un caso (INSERT)
 * - Omite campos auto-generados: id, created_at, updated_at
 * - Omite codigo_estimado (generado por trigger)
 */
export type CasoInsert = Omit<Caso, 'id' | 'created_at' | 'updated_at' | 'codigo_estimado'> & {
  // Campos obligatorios para INSERT
  cliente: string
  tipo: TipoCaso
  estado: EstadoCaso
}

/**
 * Tipo para actualizar un caso (UPDATE)
 * - Todos los campos son opcionales excepto los que se quieren cambiar
 */
export type CasoUpdate = Partial<Omit<Caso, 'id' | 'created_at' | 'codigo_estimado'>> & {
  updated_at?: string  // Auto-actualizar en UPDATE
}

// =====================================================
// TABLA: notas
// =====================================================
// ACTUALIZADO v2.7.0: Soporte para notas en carpetas
// - Una nota puede estar en un CASO (tomo individual)
// - O en una CARPETA (caso general con múltiples tomos)
// - CHECK constraint: caso_id XOR carpeta_id (uno u otro, no ambos)
// =====================================================

export interface Nota {
  id: string                        // uuid, NOT NULL, PK
  caso_id?: string | null           // uuid, NULLABLE, FK → casos(id)
  carpeta_id?: string | null        // uuid, NULLABLE, FK → carpetas(id)
  contenido: string                 // text, NOT NULL
  
  categoria?: CategoriaNota | null  // varchar(50), NULLABLE, DEFAULT 'General'
  prioridad?: PrioridadNota | null  // varchar(20), NULLABLE, DEFAULT 'Media'
  
  fecha_recordatorio?: string | null    // timestamptz, NULLABLE (ISO 8601)
  completado?: boolean | null       // boolean, DEFAULT false
  
  created_at?: string | null        // timestamptz, DEFAULT now()
  updated_at?: string | null        // timestamptz, DEFAULT now()
  created_by?: string | null        // uuid, NULLABLE, FK → profiles(id)
}

export type NotaInsert = Omit<Nota, 'id' | 'created_at' | 'updated_at'> & {
  contenido: string
  // Debe tener caso_id O carpeta_id (no ambos)
  caso_id?: string | null
  carpeta_id?: string | null
}

export type NotaUpdate = Partial<Omit<Nota, 'id' | 'caso_id' | 'carpeta_id' | 'created_at'>> & {
  updated_at?: string
}

// =====================================================
// TABLA: eventos
// =====================================================

export interface Evento {
  id: string                        // uuid, NOT NULL, PK
  caso_id: string                   // uuid, NOT NULL, FK → casos(id)
  
  tipo: string                      // text, NOT NULL (Audiencia/Plazo/Reunión)
  titulo: string                    // text, NOT NULL
  descripcion?: string | null       // text, NULLABLE
  
  fecha_evento: string              // timestamptz, NOT NULL (ISO 8601)
  ubicacion?: string | null         // text, NULLABLE
  completado?: boolean | null       // boolean, DEFAULT false
  
  // Sistema de alertas
  alerta_7_dias?: boolean | null    // boolean, DEFAULT true
  alerta_3_dias?: boolean | null    // boolean, DEFAULT true
  alerta_1_dia?: boolean | null     // boolean, DEFAULT true
  alerta_dia_evento?: boolean | null    // boolean, DEFAULT true
  
  created_at?: string | null        // timestamptz, DEFAULT now()
  updated_at?: string | null        // timestamptz, DEFAULT now()
  created_by?: string | null        // uuid, NULLABLE, FK → profiles(id)
}

export type EventoInsert = Omit<Evento, 'id' | 'created_at' | 'updated_at'> & {
  caso_id: string
  tipo: string
  titulo: string
  fecha_evento: string
}

export type EventoUpdate = Partial<Omit<Evento, 'id' | 'caso_id' | 'created_at'>> & {
  updated_at?: string
}

// =====================================================
// TABLA: pagos
// =====================================================

export interface Pago {
  id: string                        // uuid, NOT NULL, PK
  caso_id: string                   // uuid, NOT NULL, FK → casos(id)
  
  monto: number                     // numeric, NOT NULL
  fecha_pago: string                // date, NOT NULL (formato: YYYY-MM-DD)
  
  concepto?: string | null          // text, NULLABLE
  metodo_pago?: MetodoPago | null   // text, NULLABLE
  notas?: string | null             // text, NULLABLE
  
  created_at?: string | null        // timestamptz, DEFAULT now()
  created_by?: string | null        // uuid, NULLABLE, FK → profiles(id)
}

export type PagoInsert = Omit<Pago, 'id' | 'created_at'> & {
  caso_id: string
  monto: number
  fecha_pago: string
}

export type PagoUpdate = Partial<Omit<Pago, 'id' | 'caso_id' | 'created_at'>>

// =====================================================
// TABLA: fcm_tokens
// =====================================================

export interface FCMToken {
  id: string                        // uuid, NOT NULL, PK
  user_id: string                   // uuid, NOT NULL, FK → profiles(id)
  token: string                     // text, NOT NULL (token de Firebase)
  device_info?: string | null       // text, NULLABLE (user agent)
  last_used?: string | null         // timestamptz, DEFAULT now()
  created_at?: string | null        // timestamptz, DEFAULT now()
}

export type FCMTokenInsert = Omit<FCMToken, 'id' | 'created_at' | 'last_used'> & {
  user_id: string
  token: string
}

// =====================================================
// TABLA: notificaciones
// =====================================================

export interface Notificacion {
  id: string                        // uuid, NOT NULL, PK
  evento_id: string                 // uuid, NOT NULL, FK → eventos(id)
  user_id: string                   // uuid, NOT NULL, FK → profiles(id)
  
  tipo: '7_dias' | '3_dias' | '1_dia' | 'dia_evento'  // text, NOT NULL
  titulo: string                    // text, NOT NULL
  mensaje: string                   // text, NOT NULL
  
  enviada: boolean                  // boolean, DEFAULT FALSE
  leida: boolean                    // boolean, DEFAULT FALSE
  
  fecha_envio?: string | null       // timestamptz, NULLABLE
  fecha_lectura?: string | null     // timestamptz, NULLABLE
  
  created_at?: string | null        // timestamptz, DEFAULT now()
}

export type NotificacionInsert = Omit<Notificacion, 'id' | 'created_at'> & {
  evento_id: string
  user_id: string
  tipo: '7_dias' | '3_dias' | '1_dia' | 'dia_evento'
  titulo: string
  mensaje: string
}

// =====================================================
// TABLA: ubicaciones_fisicas
// =====================================================

export interface UbicacionFisica {
  id: string                        // uuid, NOT NULL, PK
  
  codigo_estimado?: string | null   // text, NULLABLE (relación con casos, NO FK)
  ubicacion: string                 // text, NOT NULL (ej: "Estante A")
  
  fila?: number | null              // integer, NULLABLE
  columna?: string | null           // text, NULLABLE
  seccion?: string | null           // text, NULLABLE
  posicion?: number | null          // integer, NULLABLE
  
  cliente?: string | null           // text, NULLABLE
  descripcion?: string | null       // text, NULLABLE
  expediente?: string | null        // text, NULLABLE
  tomo?: string | null              // text, NULLABLE
  
  created_at?: string | null        // timestamptz, DEFAULT now()
  updated_at?: string | null        // timestamptz, DEFAULT now()
}

export type UbicacionFisicaInsert = Omit<UbicacionFisica, 'id' | 'created_at' | 'updated_at'> & {
  ubicacion: string
}

export type UbicacionFisicaUpdate = Partial<Omit<UbicacionFisica, 'id' | 'created_at'>> & {
  updated_at?: string
}

// =====================================================
// TABLA: carpetas (Sistema de carpetas jerárquicas)
// =====================================================

export interface Carpeta {
  id: string                        // uuid, NOT NULL, PK
  
  nombre: string                    // text, NOT NULL
  descripcion?: string | null       // text, NULLABLE
  color?: string | null             // text, DEFAULT '#3B82F6' (hex color)
  icono?: string | null             // text, DEFAULT '📁' (emoji)
  
  carpeta_padre_id?: string | null  // uuid, NULLABLE, FK → carpetas(id)
  // NULL = carpeta raíz, UUID = subcarpeta
  
  orden?: number | null             // integer, DEFAULT 0
  
  usuarios_con_acceso?: string[]    // uuid[], DEFAULT '{}' (Array de user IDs con acceso)
  // Permisos heredados: si usuario tiene acceso a carpeta → ve todos los casos dentro
  
  created_at?: string | null        // timestamptz, DEFAULT now()
  updated_at?: string | null        // timestamptz, DEFAULT now()
  created_by?: string | null        // uuid, FK → profiles(id)
}

export interface CarpetaConConteo extends Carpeta {
  ruta_completa?: string            // Generado por vista (ej: "Penales / Robos")
  total_casos?: number              // Casos en carpeta + subcarpetas (recursivo)
  casos_directos?: number           // Casos solo en esta carpeta
}

export type CarpetaInsert = Omit<Carpeta, 'id' | 'created_at' | 'updated_at'> & {
  nombre: string
}

export type CarpetaUpdate = Partial<Omit<Carpeta, 'id' | 'created_at'>> & {
  updated_at?: string
}

// =====================================================
// TABLA: profiles (Supabase Auth)
// =====================================================

export interface Profile {
  id: string                        // uuid, NOT NULL, PK, FK → auth.users(id)
  username: string                  // text, NOT NULL
  nombre_completo?: string | null   // text, NULLABLE
  rol: RolUsuario                   // text, NOT NULL (admin | abogado | secretaria)
  activo?: boolean | null           // boolean, DEFAULT true
  avatar_url?: string | null        // text, NULLABLE (URL en Supabase Storage)
  
  created_at?: string | null        // timestamptz, DEFAULT now()
  updated_at?: string | null        // timestamptz, DEFAULT now()
}

export type ProfileInsert = Omit<Profile, 'created_at' | 'updated_at'> & {
  id: string  // Debe coincidir con auth.users(id)
  username: string
  rol: RolUsuario
}

export type ProfileUpdate = Partial<Omit<Profile, 'id' | 'created_at'>> & {
  updated_at?: string
}

// =====================================================
// TABLA: actividad_log (Auditoría)
// =====================================================

export interface ActividadLog {
  id: string                        // uuid, NOT NULL, PK
  usuario_id?: string | null        // uuid, NULLABLE, FK → profiles(id)
  
  accion: string                    // varchar(100), NOT NULL (ej: "CREAR", "EDITAR", "ELIMINAR")
  entidad: string                   // varchar(50), NOT NULL (ej: "caso", "nota", "evento")
  entidad_id?: string | null        // uuid, NULLABLE
  
  detalles?: Record<string, unknown> | null  // jsonb, NULLABLE
  
  created_at?: string | null        // timestamptz, DEFAULT now()
}

export type ActividadLogInsert = Omit<ActividadLog, 'id' | 'created_at'> & {
  accion: string
  entidad: string
}

// =====================================================
// TABLA: agenda_dias (Notas de la agenda personal)
// =====================================================

export interface AgendaDia {
  id: string                        // uuid, NOT NULL, PK
  fecha: string                     // date, NOT NULL, UNIQUE (YYYY-MM-DD)
  contenido?: string | null         // text, NULLABLE (notas del día)
  
  created_at?: string | null        // timestamptz, DEFAULT now()
  updated_at?: string | null        // timestamptz, DEFAULT now()
  created_by?: string | null        // uuid, NULLABLE, FK → profiles(id)
}

export type AgendaDiaInsert = Omit<AgendaDia, 'id' | 'created_at' | 'updated_at'> & {
  fecha: string  // YYYY-MM-DD
}

export type AgendaDiaUpdate = Partial<Omit<AgendaDia, 'id' | 'fecha' | 'created_at'>> & {
  updated_at?: string
}

// =====================================================
// TABLA: mensajes (Sistema de mensajería)
// =====================================================

export interface Mensaje {
  id: string                        // uuid, NOT NULL, PK
  caso_id?: string | null           // uuid, NULLABLE, FK → casos(id)
  
  remitente: string                 // varchar(255), NOT NULL
  asunto: string                    // varchar(500), NOT NULL
  mensaje?: string | null           // text, NULLABLE
  
  tipo?: string | null              // varchar(50), DEFAULT 'consulta'
  leido?: boolean | null            // boolean, DEFAULT false
  
  fecha_envio?: string | null       // timestamptz, DEFAULT now()
  created_at?: string | null        // timestamptz, DEFAULT now()
}

export type MensajeInsert = Omit<Mensaje, 'id' | 'fecha_envio' | 'created_at'> & {
  remitente: string
  asunto: string
}

export type MensajeUpdate = Partial<Omit<Mensaje, 'id' | 'created_at'>>

// =====================================================
// TIPOS COMPUESTOS (Para relaciones)
// =====================================================

/**
 * Caso con información del abogado asignado
 */
export interface CasoConAbogado extends Caso {
  abogado?: Profile | null
}

/**
 * Caso con todas sus relaciones
 */
export interface CasoCompleto extends Caso {
  abogado?: Profile | null
  notas?: Nota[]
  eventos?: Evento[]
  pagos?: Pago[]
  ubicacion?: UbicacionFisica | null
}

/**
 * Nota con información del creador
 */
export interface NotaConCreador extends Nota {
  creador?: Profile | null
}

/**
 * Evento con información del creador
 */
export interface EventoConCreador extends Evento {
  creador?: Profile | null
}

// =====================================================
// TIPOS PARA FORMS (Frontend)
// =====================================================

/**
 * Datos del formulario de caso (antes de enviar a BD)
 * - Campos string vacíos se convierten a null
 * - Números se validan antes de INSERT
 */
export interface CasoFormData {
  cliente: string
  patrocinado: string
  tipo: TipoCaso
  etapa: string
  descripcion: string
  expediente: string
  fecha_inicio: string
  forma_pago: FormaPago | ''
  ubicacion_fisica: string
}

/**
 * Datos financieros del formulario (separados por claridad)
 */
export interface CasoFinancieroFormData {
  monto_total: number
  monto_cobrado: number
  
  // Por etapas
  etapas?: {
    nombre: string
    monto: number
    completada: boolean
  }[]
  
  // Por hora
  horas_estimadas?: number
  tarifa_por_hora?: number
  horas_trabajadas?: number
  
  // Cuota litis
  porcentaje_exito?: number
  monto_base?: number
}

/**
 * Datos del formulario de nota
 */
export interface NotaFormData {
  contenido: string
  categoria: CategoriaNota
  prioridad: PrioridadNota
  fecha_recordatorio: string  // Empty string si no tiene
}

/**
 * Datos del formulario de evento
 */
export interface EventoFormData {
  tipo: string
  titulo: string
  descripcion: string
  fecha_evento: string
  ubicacion: string
  alerta_7_dias: boolean
  alerta_3_dias: boolean
  alerta_1_dia: boolean
  alerta_dia_evento: boolean
}

// =====================================================
// TIPOS PARA VALIDACIÓN
// =====================================================

export interface ValidationError {
  field: string
  message: string
}

export interface ValidationResult {
  valid: boolean
  errors: ValidationError[]
}

// =====================================================
// TIPOS PARA RESPUESTAS DE API
// =====================================================

export interface ApiResponse<T> {
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

// =====================================================
// HELPERS & UTILS
// =====================================================

/**
 * Helper para convertir form data a INSERT data
 * - Convierte strings vacíos a null
 * - Garantiza tipos correctos
 */
export function casoFormDataToInsert(
  formData: CasoFormData,
  financiero: CasoFinancieroFormData,
  userId?: string
): CasoInsert {
  return {
    cliente: formData.cliente.trim(),
    patrocinado: formData.patrocinado.trim() || null,
    tipo: formData.tipo,
    etapa: formData.etapa.trim() || null,
    descripcion: formData.descripcion.trim() || null,
    expediente: formData.expediente.trim() || null,
    fecha_inicio: formData.fecha_inicio || null,
    forma_pago: formData.forma_pago || null,
    ubicacion_fisica: formData.ubicacion_fisica.trim() || null,
    
    // Financiero
    monto_total: financiero.monto_total || 0,
    monto_cobrado: financiero.monto_cobrado || 0,
    monto_pendiente: (financiero.monto_total || 0) - (financiero.monto_cobrado || 0),
    
    // Estados
    estado: 'Activo',
    estado_caso: 'En proceso',
    
    // Usuario
    created_by: userId || null,
    abogado_asignado_id: null
  }
}

/**
 * Helper para convertir nota form data a INSERT (Nota de Caso)
 */
export function notaFormDataToInsert(
  formData: NotaFormData,
  casoId: string,
  userId?: string
): NotaInsert {
  return {
    caso_id: casoId,
    carpeta_id: null,
    contenido: formData.contenido.trim(),
    categoria: formData.categoria || 'General',
    prioridad: formData.prioridad || 'Media',
    fecha_recordatorio: formData.fecha_recordatorio || null,
    completado: false,
    created_by: userId || null
  }
}

/**
 * Helper para convertir nota form data a INSERT (Nota de Carpeta)
 */
export function notaCarpetaFormDataToInsert(
  formData: NotaFormData,
  carpetaId: string,
  userId?: string
): NotaInsert {
  return {
    caso_id: null,
    carpeta_id: carpetaId,
    contenido: formData.contenido.trim(),
    categoria: formData.categoria || 'General',
    prioridad: formData.prioridad || 'Media',
    fecha_recordatorio: formData.fecha_recordatorio || null,
    completado: false,
    created_by: userId || null
  }
}

/**
 * Helper para formatear fecha a YYYY-MM-DD
 */
export function formatDateForDB(date: Date | string): string {
  if (typeof date === 'string') {
    date = new Date(date)
  }
  return date.toISOString().split('T')[0]
}

/**
 * Helper para parsear fecha de BD a Date
 */
export function parseDateFromDB(dateString: string | null | undefined): Date | null {
  if (!dateString) return null
  return new Date(dateString)
}

// =====================================================
// CONSTANTES
// =====================================================

export const TIPOS_CASO: TipoCaso[] = ['Penal', 'Civil', 'Laboral', 'Administrativo']

export const FORMAS_PAGO: FormaPago[] = ['Por hora', 'Por etapas', 'Monto fijo', 'Cuota litis']

export const CATEGORIAS_NOTA: CategoriaNota[] = ['General', 'Urgente', 'Legal', 'Administrativa', 'Financiera']

export const PRIORIDADES_NOTA: PrioridadNota[] = ['Alta', 'Media', 'Baja']

export const TIPOS_EVENTO: TipoEvento[] = ['Audiencia', 'Plazo', 'Reunión', 'Otro']

export const METODOS_PAGO: MetodoPago[] = ['Efectivo', 'Transferencia', 'Cheque', 'Tarjeta', 'Otro']

// =====================================================
// NOTA: Este archivo solo exporta types e interfaces
// No hay default export porque TypeScript no permite
// exportar types como valores
// =====================================================
