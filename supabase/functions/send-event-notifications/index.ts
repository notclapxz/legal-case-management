// =====================================================
// Edge Function: Send Event Notifications
// =====================================================
// Esta función se ejecuta cada 2 horas via pg_cron
// Busca eventos próximos y envía notificaciones push via Firebase FCM

import { createClient } from 'jsr:@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const FIREBASE_SERVICE_ACCOUNT = JSON.parse(Deno.env.get('FIREBASE_SERVICE_ACCOUNT_JSON')!)

interface Evento {
  id: string
  titulo: string
  descripcion: string | null
  fecha_evento: string
  tipo: 'Audiencia' | 'Plazo' | 'Reunión' | 'Otro'
  caso_id: string
  created_by: string
  alerta_7_dias: boolean
  alerta_3_dias: boolean
  alerta_1_dia: boolean
  alerta_dia_evento: boolean
}

interface FCMToken {
  user_id: string
  token: string
}

interface Notificacion {
  evento_id: string
  user_id: string
  tipo: '7_dias' | '3_dias' | '1_dia' | 'dia_evento'
  titulo: string
  mensaje: string
  enviada: boolean
  fecha_envio: string
}

// =====================================================
// Helper: Obtener Access Token de Firebase
// =====================================================
async function getFirebaseAccessToken(): Promise<string> {
  const SCOPES = ['https://www.googleapis.com/auth/firebase.messaging']
  
  // Crear JWT
  const header = { alg: 'RS256', typ: 'JWT' }
  const now = Math.floor(Date.now() / 1000)
  const claim = {
    iss: FIREBASE_SERVICE_ACCOUNT.client_email,
    scope: SCOPES.join(' '),
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now
  }

  // Importar clave privada
  const key = await crypto.subtle.importKey(
    'pkcs8',
    pemToArrayBuffer(FIREBASE_SERVICE_ACCOUNT.private_key),
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign']
  )

  // Firmar JWT
  const encodedHeader = base64UrlEncode(JSON.stringify(header))
  const encodedClaim = base64UrlEncode(JSON.stringify(claim))
  const unsignedToken = `${encodedHeader}.${encodedClaim}`
  
  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    key,
    new TextEncoder().encode(unsignedToken)
  )
  
  const jwt = `${unsignedToken}.${base64UrlEncode(signature)}`

  // Intercambiar JWT por Access Token
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt
    })
  })

  const data = await response.json()
  return data.access_token
}

function pemToArrayBuffer(pem: string): ArrayBuffer {
  const b64 = pem
    .replace(/-----BEGIN PRIVATE KEY-----/, '')
    .replace(/-----END PRIVATE KEY-----/, '')
    .replace(/\s/g, '')
  
  const binaryString = atob(b64)
  const bytes = new Uint8Array(binaryString.length)
  
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i)
  }
  
  return bytes.buffer
}

function base64UrlEncode(input: string | ArrayBuffer): string {
  const bytes = typeof input === 'string' 
    ? new TextEncoder().encode(input)
    : new Uint8Array(input)
  
  let binary = ''
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

// =====================================================
// Helper: Enviar notificación via FCM HTTP v1 API
// =====================================================
async function sendFCMNotification(
  token: string,
  title: string,
  body: string,
  eventoId: string,
  accessToken: string
): Promise<boolean> {
  try {
    const message = {
      message: {
        token,
        notification: {
          title,
          body
        },
        data: {
          evento_id: eventoId,
          click_action: '/dashboard/agenda'
        },
        webpush: {
          fcm_options: {
            link: `/dashboard/agenda?evento=${eventoId}`
          }
        }
      }
    }

    const response = await fetch(
      `https://fcm.googleapis.com/v1/projects/${FIREBASE_SERVICE_ACCOUNT.project_id}/messages:send`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify(message)
      }
    )

    if (!response.ok) {
      const error = await response.text()
      console.error('FCM Error:', error)
      return false
    }

    console.log('✅ Notification sent to token:', token.substring(0, 20) + '...')
    return true
  } catch (error) {
    console.error('Error sending FCM notification:', error)
    return false
  }
}

// =====================================================
// Helper: Calcular tipo de alerta según días restantes
// =====================================================
function getTipoAlerta(diasRestantes: number): '7_dias' | '3_dias' | '1_dia' | 'dia_evento' | null {
  if (diasRestantes <= 0 && diasRestantes > -1) return 'dia_evento'
  if (diasRestantes >= 1 && diasRestantes < 2) return '1_dia'
  if (diasRestantes >= 3 && diasRestantes < 4) return '3_dias'
  if (diasRestantes >= 7 && diasRestantes < 8) return '7_dias'
  return null
}

function getTituloAlerta(tipo: '7_dias' | '3_dias' | '1_dia' | 'dia_evento', tipoEvento: string): string {
  const dias = {
    '7_dias': '7 días',
    '3_dias': '3 días',
    '1_dia': 'mañana',
    'dia_evento': 'hoy'
  }
  
  return `${tipoEvento} ${dias[tipo]}`
}

// =====================================================
// MAIN FUNCTION
// =====================================================
Deno.serve(async (req) => {
  try {
    console.log('🔔 Starting notification job...')
    
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    const accessToken = await getFirebaseAccessToken()
    
    // Obtener eventos de los próximos 7 días
    const now = new Date()
    const sevenDaysFromNow = new Date()
    sevenDaysFromNow.setDate(now.getDate() + 7)
    
    const { data: eventos, error: eventosError } = await supabase
      .from('eventos')
      .select('*')
      .gte('fecha_evento', now.toISOString())
      .lte('fecha_evento', sevenDaysFromNow.toISOString())
    
    if (eventosError) {
      console.error('Error fetching eventos:', eventosError)
      return new Response(JSON.stringify({ error: eventosError.message }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    }
    
    if (!eventos || eventos.length === 0) {
      console.log('No hay eventos próximos')
      return new Response(JSON.stringify({ message: 'No upcoming events' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      })
    }
    
    console.log(`📅 Found ${eventos.length} upcoming events`)
    
    let notificationsSent = 0
    let notificationsFailed = 0
    
    // Procesar cada evento
    for (const evento of eventos as Evento[]) {
      // Calcular días restantes
      const fechaEvento = new Date(evento.fecha_evento)
      const diffTime = fechaEvento.getTime() - now.getTime()
      const diasRestantes = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      
      const tipoAlerta = getTipoAlerta(diasRestantes)
      
      if (!tipoAlerta) continue
      
      // Verificar si el evento tiene habilitada esta alerta
      const alertaHabilitada = 
        (tipoAlerta === '7_dias' && evento.alerta_7_dias) ||
        (tipoAlerta === '3_dias' && evento.alerta_3_dias) ||
        (tipoAlerta === '1_dia' && evento.alerta_1_dia) ||
        (tipoAlerta === 'dia_evento' && evento.alerta_dia_evento)
      
      if (!alertaHabilitada) continue
      
      // Verificar si ya se envió esta notificación
      const { data: existingNotif } = await supabase
        .from('notificaciones')
        .select('id')
        .eq('evento_id', evento.id)
        .eq('tipo', tipoAlerta)
        .eq('enviada', true)
        .single()
      
      if (existingNotif) {
        console.log(`⏭️  Notification already sent for event ${evento.id} (${tipoAlerta})`)
        continue
      }
      
      // Obtener tokens FCM del usuario
      const { data: tokens, error: tokensError } = await supabase
        .from('fcm_tokens')
        .select('token')
        .eq('user_id', evento.created_by)
      
      if (tokensError || !tokens || tokens.length === 0) {
        console.log(`⚠️  No FCM tokens for user ${evento.created_by}`)
        continue
      }
      
      // Construir mensaje
      const titulo = getTituloAlerta(tipoAlerta, evento.tipo)
      const mensaje = `${evento.titulo}${evento.descripcion ? ' - ' + evento.descripcion : ''}`
      
      // Enviar notificación a cada token
      for (const { token } of tokens as FCMToken[]) {
        const sent = await sendFCMNotification(
          token,
          titulo,
          mensaje,
          evento.id,
          accessToken
        )
        
        if (sent) {
          notificationsSent++
        } else {
          notificationsFailed++
        }
      }
      
      // Registrar notificación en la BD
      const notificacion: Notificacion = {
        evento_id: evento.id,
        user_id: evento.created_by,
        tipo: tipoAlerta,
        titulo,
        mensaje,
        enviada: true,
        fecha_envio: now.toISOString()
      }
      
      await supabase.from('notificaciones').insert([notificacion])
    }
    
    console.log(`✅ Notifications sent: ${notificationsSent}`)
    console.log(`❌ Notifications failed: ${notificationsFailed}`)
    
    return new Response(
      JSON.stringify({ 
        success: true,
        sent: notificationsSent,
        failed: notificationsFailed
      }),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  } catch (error) {
    console.error('Unhandled error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
})
