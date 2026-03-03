import { test, expect, type Page } from '@playwright/test'

// Credenciales de prueba
const TEST_EMAIL = process.env.TEST_EMAIL || 'admin@despacho.test'
const TEST_PASSWORD = process.env.TEST_PASSWORD || 'admin123'

/**
 * Helper: Login en la aplicación
 */
async function login(page: Page) {
  await page.goto('/login')
  await page.fill('input[name="email"]', TEST_EMAIL)
  await page.fill('input[name="password"]', TEST_PASSWORD)
  await page.click('button[type="submit"]')
  
  // Esperar a que redirija al dashboard
  await page.waitForURL('/dashboard', { timeout: 10000 })
}

test.describe('Agenda Personal - Flujo Completo', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
  })

  test('Navegar a la agenda y verificar que carga', async ({ page }) => {
    // Ir a la agenda
    await page.goto('/dashboard/agenda', { waitUntil: 'domcontentloaded' })
    
    // Verificar que hay un calendario visible (buscar nombres de meses o días)
    await page.waitForSelector('text=/Enero|Febrero|Marzo|Lun|Mar|Mié/i', { timeout: 10000 })
    const calendar = await page.locator('text=/Enero|Febrero|Marzo|Lun|Mar|Mié/i').first().isVisible()
    expect(calendar).toBeTruthy()
    
    console.log('✅ Agenda cargada correctamente')
  })

  test('Entrar a un día específico del mes', async ({ page }) => {
    // Obtener mes y año actual
    const now = new Date()
    const mes = now.getMonth() + 1 // 1-12
    const anio = now.getFullYear()
    const dia = 23 // Día de prueba
    
    // Ir directo al mes/año actual
    await page.goto(`/dashboard/agenda/${anio}/${mes}`)
    await page.waitForLoadState('networkidle')
    
    // Verificar que estamos en la vista del mes
    await expect(page.locator('text=/Días del Mes|DÍAS DEL MES/i')).toBeVisible()
    
    // Click en el día 23
    await page.locator(`button:has-text("${String(dia).padStart(2, '0')}")`).first().click()
    
    // Esperar a que cargue el editor
    await page.waitForSelector('.agenda-editor, textarea, [contenteditable]', { timeout: 5000 })
    
    console.log(`✅ Navegado al día ${dia}`)
  })

  test('Escribir contenido en un día y verificar que se guarda', async ({ page }) => {
    const now = new Date()
    const mes = now.getMonth() + 1
    const anio = now.getFullYear()
    const dia = 23
    const textoTest = `Test Playwright ${Date.now()}`
    
    // Ir al día
    await page.goto(`/dashboard/agenda/${anio}/${mes}?dia=${dia}`)
    await page.waitForLoadState('networkidle')
    
    // Esperar al editor
    await page.waitForSelector('.ProseMirror', { timeout: 10000 })
    
    // Hacer click en el editor y escribir
    const editor = page.locator('.ProseMirror').first()
    await editor.click()
    await editor.fill(textoTest)
    
    console.log(`✍️ Escribiendo: "${textoTest}"`)
    
    // Esperar que aparezca el indicador de guardado
    await page.waitForSelector('text=/Guardando|Guardado/i', { timeout: 5000 })
    
    // Esperar a que desaparezca "Guardando..."
    await page.waitForSelector('text=/Guardado/i', { timeout: 10000 })
    
    console.log('💾 Contenido guardado')
    
    // Verificar que el texto sigue en el editor
    const contenido = await editor.textContent()
    expect(contenido).toContain(textoTest)
    
    console.log('✅ Texto verificado en el editor')
  })

  test('Verificar persistencia: escribir, salir y volver', async ({ page }) => {
    const now = new Date()
    const mes = now.getMonth() + 1
    const anio = now.getFullYear()
    const dia = 24
    const textoTest = `Test Persistencia ${Date.now()}`
    
    // === PASO 1: Ir al día y escribir ===
    await page.goto(`/dashboard/agenda/${anio}/${mes}?dia=${dia}`)
    await page.waitForLoadState('networkidle')
    await page.waitForSelector('.ProseMirror', { timeout: 10000 })
    
    const editor = page.locator('.ProseMirror').first()
    await editor.click()
    
    // Limpiar contenido existente
    await page.keyboard.press('Control+A')
    await page.keyboard.press('Backspace')
    
    // Escribir texto nuevo
    await page.keyboard.type(textoTest)
    
    console.log(`✍️ Escribiendo: "${textoTest}"`)
    
    // Esperar guardado
    await page.waitForSelector('text=/Guardado/i', { timeout: 10000 })
    
    console.log('💾 Guardado confirmado')
    
    // === PASO 2: Salir a otro día ===
    const otroDia = dia === 31 ? 1 : dia + 1
    await page.locator(`button:has-text("${String(otroDia).padStart(2, '0')}")`).first().click()
    await page.waitForTimeout(500)
    
    console.log(`🚶 Cambiado al día ${otroDia}`)
    
    // === PASO 3: Volver al día original ===
    await page.locator(`button:has-text("${String(dia).padStart(2, '0')}")`).first().click()
    await page.waitForTimeout(1000)
    
    console.log(`🔙 Volviendo al día ${dia}`)
    
    // === PASO 4: Verificar que el contenido persiste ===
    await page.waitForSelector('.ProseMirror', { timeout: 10000 })
    
    const contenidoRecuperado = await editor.textContent()
    console.log(`📖 Contenido recuperado: "${contenidoRecuperado}"`)
    
    expect(contenidoRecuperado).toContain(textoTest)
    
    console.log('✅ Persistencia verificada exitosamente')
  })

  test('Crear tarea con checkbox', async ({ page }) => {
    const now = new Date()
    const mes = now.getMonth() + 1
    const anio = now.getFullYear()
    const dia = 25
    
    // Ir al día
    await page.goto(`/dashboard/agenda/${anio}/${mes}?dia=${dia}`)
    await page.waitForLoadState('networkidle')
    await page.waitForSelector('.ProseMirror', { timeout: 10000 })
    
    // Click en botón de Tarea
    await page.click('button:has-text("Tarea")')
    
    // Escribir tarea
    const editor = page.locator('.ProseMirror').first()
    await editor.click()
    await page.keyboard.type('Comprar suministros')
    
    // Esperar guardado
    await page.waitForSelector('text=/Guardado/i', { timeout: 10000 })
    
    // Verificar que hay un checkbox
    const checkbox = page.locator('input[type="checkbox"]').first()
    await expect(checkbox).toBeVisible()
    
    // Marcar como completado
    await checkbox.check()
    
    // Esperar guardado
    await page.waitForTimeout(1500)
    
    // Verificar que el texto está tachado
    const tareaCompletada = page.locator('li[data-checked="true"]').first()
    await expect(tareaCompletada).toBeVisible()
    
    console.log('✅ Tarea creada y marcada como completada')
  })

  test('Verificar preview en lista de días', async ({ page }) => {
    const now = new Date()
    const mes = now.getMonth() + 1
    const anio = now.getFullYear()
    const dia = 26
    const textoTest = 'Preview test'
    
    // Ir al día y escribir
    await page.goto(`/dashboard/agenda/${anio}/${mes}?dia=${dia}`)
    await page.waitForLoadState('networkidle')
    await page.waitForSelector('.ProseMirror', { timeout: 10000 })
    
    const editor = page.locator('.ProseMirror').first()
    await editor.click()
    await page.keyboard.press('Control+A')
    await page.keyboard.type(textoTest)
    
    // Esperar guardado
    await page.waitForSelector('text=/Guardado/i', { timeout: 10000 })
    
    // Cambiar a otro día para forzar refresco
    await page.locator('button:has-text("27")').first().click()
    await page.waitForTimeout(500)
    
    // Volver y verificar preview en el botón del día
    const botonDia = page.locator(`button:has-text("${String(dia).padStart(2, '0')}")`).first()
    
    // Verificar que el botón contiene el texto
    const contenidoBoton = await botonDia.textContent()
    console.log(`📋 Contenido del botón día ${dia}: "${contenidoBoton}"`)
    
    // El preview debería mostrar el texto (no HTML crudo)
    expect(contenidoBoton).toContain(textoTest)
    expect(contenidoBoton).not.toContain('<p>')
    expect(contenidoBoton).not.toContain('</p>')
    
    console.log('✅ Preview muestra texto plano correctamente')
  })
})

test.describe('Agenda - Detección de Bugs', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
  })

  test('BUG CHECK: Contenido no se pierde al cambiar de día rápidamente', async ({ page }) => {
    const now = new Date()
    const mes = now.getMonth() + 1
    const anio = now.getFullYear()
    const textoTest = `Fast switch test ${Date.now()}`
    
    // Ir al día 20
    await page.goto(`/dashboard/agenda/${anio}/${mes}?dia=20`)
    await page.waitForLoadState('networkidle')
    await page.waitForSelector('.ProseMirror', { timeout: 10000 })
    
    // Escribir rápido
    const editor = page.locator('.ProseMirror').first()
    await editor.click()
    await page.keyboard.type(textoTest, { delay: 50 })
    
    // Cambiar de día INMEDIATAMENTE (sin esperar guardado)
    await page.locator('button:has-text("21")').first().click()
    await page.waitForTimeout(300)
    
    // Volver
    await page.locator('button:has-text("20")').first().click()
    await page.waitForTimeout(1500)
    
    // Verificar contenido
    const contenido = await editor.textContent()
    
    if (contenido?.includes(textoTest)) {
      console.log('✅ Contenido guardado correctamente (no hay pérdida)')
    } else {
      console.log('❌ BUG: Contenido se perdió al cambiar rápido')
      console.log(`Esperado: "${textoTest}"`)
      console.log(`Obtenido: "${contenido}"`)
    }
    
    expect(contenido).toContain(textoTest)
  })

  test('BUG CHECK: HTML crudo no aparece en preview', async ({ page }) => {
    const now = new Date()
    const mes = now.getMonth() + 1
    const anio = now.getFullYear()
    
    // Ir al día 23
    await page.goto(`/dashboard/agenda/${anio}/${mes}?dia=23`)
    await page.waitForLoadState('networkidle')
    
    // Buscar en la lista de días si hay HTML crudo visible
    const listaTexto = await page.locator('text=/Días del Mes/i').locator('..').textContent()
    
    const tieneHTMLCrudo = listaTexto?.includes('<p>') || 
                           listaTexto?.includes('</p>') || 
                           listaTexto?.includes('<ul') ||
                           listaTexto?.includes('data-type')
    
    if (tieneHTMLCrudo) {
      console.log('❌ BUG: HTML crudo visible en preview')
      console.log('Contenido:', listaTexto?.substring(0, 200))
    } else {
      console.log('✅ No hay HTML crudo en el preview')
    }
    
    expect(tieneHTMLCrudo).toBeFalsy()
  })
})
