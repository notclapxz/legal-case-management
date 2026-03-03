import { test, expect, type Page } from '@playwright/test'

// CONFIGURACIÓN: Definir credenciales en .env.local o aquí temporalmente
const TEST_EMAIL = process.env.TEST_EMAIL || 'admin@despacho.test'
const TEST_PASSWORD = process.env.TEST_PASSWORD || 'test123'
const CASO_ID = '6d9363ec-ea61-4499-827a-eb39ad16308f'

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

/**
 * Helper: Navegar a la página de notas del caso
 */
async function navigateToNotas(page: Page) {
  await page.goto(`/dashboard/casos/${CASO_ID}/notas`)
  await page.waitForLoadState('networkidle')
}

/**
 * Helper: Crear una nota nueva
 */
async function crearNota(page: Page, titulo: string, contenido?: string): Promise<void> {
  // Click en botón "Nueva Nota"
  await page.click('button:has-text("Nueva Nota")')
  
  // Esperar a que aparezca el título editable
  await page.waitForSelector('input[placeholder*="Título"], input[value="Nueva nota"]', { timeout: 5000 })
  
  // Cambiar el título
  const tituloInput = page.locator('input[placeholder*="Título"], input[value="Nueva nota"]').first()
  await tituloInput.click()
  await tituloInput.fill(titulo)
  
  // Si hay contenido, agregarlo al editor
  if (contenido) {
    const editor = page.locator('.ProseMirror').first()
    await editor.click()
    await editor.fill(contenido)
    
    // Esperar auto-save
    await page.waitForTimeout(1000)
  }
  
  console.log(`✅ Nota creada: "${titulo}"`)
}

/**
 * Helper: Eliminar una nota
 */
async function eliminarNota(page: Page, titulo: string): Promise<void> {
  // Buscar la nota en el sidebar por título
  const notaElement = page.locator(`div:has-text("${titulo}")`).first()
  
  // Hover para mostrar el botón de eliminar
  await notaElement.hover()
  
  // Click en botón eliminar (icono de trash)
  await notaElement.locator('button[title*="Eliminar"], button:has(svg)').last().click()
  
  // Confirmar eliminación si hay modal
  const confirmButton = page.locator('button:has-text("Eliminar"), button:has-text("Confirmar")')
  if (await confirmButton.isVisible({ timeout: 2000 })) {
    await confirmButton.click()
  }
  
  // Esperar a que desaparezca del sidebar
  await expect(page.locator(`div:has-text("${titulo}")`)).not.toBeVisible({ timeout: 5000 })
  
  console.log(`✅ Nota eliminada: "${titulo}"`)
}

/**
 * Helper: Subir imagen al editor
 * TODO: Implementar cuando tengamos imagen de prueba en e2e/fixtures/
 */
// async function subirImagen(page: Page, imagePath: string): Promise<void> {
//   const imageButton = page.locator('button[title*="Insertar imagen"]').first()
//   await imageButton.click()
//   
//   const fileInput = page.locator('input[type="file"][accept*="image"]')
//   await fileInput.setInputFiles(imagePath)
//   
//   await page.waitForSelector('.image-wrapper img', { timeout: 15000 })
//   console.log(`✅ Imagen subida: ${imagePath}`)
// }

/**
 * Helper: Mover una imagen arrastrando
 */
async function moverImagen(page: Page, deltaX: number, deltaY: number): Promise<void> {
  // Seleccionar la imagen (click)
  const imagen = page.locator('.image-wrapper img').first()
  await imagen.click()
  
  // Esperar a que aparezca el anillo de selección
  await page.waitForSelector('.ring-2.ring-blue-500', { timeout: 3000 })
  
  // Obtener el contenedor Rnd
  const rndContainer = page.locator('.image-wrapper > div').first()
  const box = await rndContainer.boundingBox()
  
  if (!box) {
    throw new Error('No se pudo obtener bounding box de la imagen')
  }
  
  // Drag desde el centro
  const startX = box.x + box.width / 2
  const startY = box.y + box.height / 2
  
  await page.mouse.move(startX, startY)
  await page.mouse.down()
  await page.mouse.move(startX + deltaX, startY + deltaY, { steps: 10 })
  await page.mouse.up()
  
  // Esperar a que se actualice la posición
  await page.waitForTimeout(500)
  
  console.log(`✅ Imagen movida: (${deltaX}, ${deltaY})`)
}

/**
 * Helper: Verificar que la imagen tiene data-x y data-y en el HTML
 */
async function verificarPosicionImagenEnHTML(page: Page): Promise<{ x: number; y: number }> {
  const dataX = await page.locator('.image-wrapper img').first().getAttribute('data-x')
  const dataY = await page.locator('.image-wrapper img').first().getAttribute('data-y')
  
  console.log(`📊 Posición en HTML: data-x="${dataX}", data-y="${dataY}"`)
  
  return {
    x: parseInt(dataX || '0'),
    y: parseInt(dataY || '0'),
  }
}

// =====================================================
// TESTS
// =====================================================

test.describe('Sistema de Notas - Funcionalidad Completa', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
    await navigateToNotas(page)
  })

  test('Crear una nota nueva', async ({ page }) => {
    const titulo = `Test Nota ${Date.now()}`
    
    await crearNota(page, titulo, 'Este es el contenido de prueba')
    
    // Verificar que aparece en el sidebar
    await expect(page.locator(`text="${titulo}"`)).toBeVisible()
  })

  test('Eliminar una nota', async ({ page }) => {
    const titulo = `Nota para Eliminar ${Date.now()}`
    
    // Crear nota
    await crearNota(page, titulo, 'Contenido temporal')
    
    // Verificar que existe
    await expect(page.locator(`text="${titulo}"`)).toBeVisible()
    
    // Eliminar
    await eliminarNota(page, titulo)
    
    // Verificar que ya no existe
    await expect(page.locator(`text="${titulo}"`)).not.toBeVisible()
  })

  test.skip('Subir imagen y verificar que aparece', () => {
    // TODO: Requiere imagen de prueba en e2e/fixtures/test-image.jpg
    console.log('⚠️  Test skipeado: Necesita imagen de prueba')
  })

  test('Mover imagen y verificar persistencia con auto-save', async ({ page }) => {
    // Esperar a que cargue el editor
    await page.waitForSelector('.ProseMirror', { timeout: 5000 })
    
    // Verificar si hay imagen
    const imagenExists = await page.locator('.image-wrapper img').first().isVisible({ timeout: 2000 }).catch(() => false)
    
    if (!imagenExists) {
      console.log('⚠️  No hay imagen en la nota - Skipping test')
      test.skip()
      return
    }
    
    // Hacer click en la imagen para seleccionarla
    await page.evaluate(() => {
      const img = document.querySelector('.image-wrapper img')
      if (img) {
        img.dispatchEvent(new MouseEvent('click', { bubbles: true }))
      }
    })
    
    await page.waitForTimeout(500)
    
    // Obtener posición inicial
    const posicionInicial = await verificarPosicionImagenEnHTML(page)
    console.log('📍 Posición inicial:', posicionInicial)
    
    // Obtener bounding box del contenedor Rnd
    const box = await page.evaluate(() => {
      const rnd = document.querySelector('.image-wrapper > div')
      if (!rnd) return null
      const rect = rnd.getBoundingClientRect()
      return { x: rect.x, y: rect.y, width: rect.width, height: rect.height }
    })
    
    if (!box) {
      console.log('⚠️  No se pudo obtener bounding box - Skipping')
      test.skip()
      return
    }
    
    const centerX = box.x + box.width / 2
    const centerY = box.y + box.height / 2
    
    // Drag 80px a la derecha, 40px abajo
    await page.mouse.move(centerX, centerY)
    await page.mouse.down()
    
    for (let i = 0; i <= 10; i++) {
      await page.mouse.move(centerX + (80 * i / 10), centerY + (40 * i / 10))
      await page.waitForTimeout(5)
    }
    
    await page.mouse.up()
    
    // Esperar auto-save (100ms + margen)
    await page.waitForTimeout(300)
    
    // Verificar nueva posición
    const posicionNueva = await verificarPosicionImagenEnHTML(page)
    console.log('📍 Posición nueva:', posicionNueva)
    
    // Validar que cambió
    expect(posicionNueva.x).not.toBe(posicionInicial.x)
    expect(posicionNueva.y).not.toBe(posicionInicial.y)
    
    // Refrescar la página
    await page.reload()
    await page.waitForLoadState('networkidle')
    
    // Verificar que la posición se mantuvo
    const posicionDespuesRefresh = await verificarPosicionImagenEnHTML(page)
    console.log('📍 Posición después de refresh:', posicionDespuesRefresh)
    
    // Validar persistencia (tolerancia de 5px)
    expect(Math.abs(posicionDespuesRefresh.x - posicionNueva.x)).toBeLessThan(5)
    expect(Math.abs(posicionDespuesRefresh.y - posicionNueva.y)).toBeLessThan(5)
  })

  test('Redimensionar imagen', async ({ page }) => {
    // Click en la primera nota del sidebar
    await page.locator('div[role="button"]').first().click()
    
    // Esperar a que cargue el editor
    await page.waitForSelector('.ProseMirror', { timeout: 5000 })
    
    // Verificar si hay imagen
    const imagenExists = await page.locator('.image-wrapper img').isVisible()
    
    if (!imagenExists) {
      console.log('⚠️  No hay imagen en la nota seleccionada - Skipping test')
      test.skip()
      return
    }
    
    // Seleccionar imagen
    const imagen = page.locator('.image-wrapper img').first()
    await imagen.click()
    
    // Esperar anillo de selección
    await page.waitForSelector('.ring-2.ring-blue-500', { timeout: 3000 })
    
    // Obtener tamaño inicial
    const boxInicial = await imagen.boundingBox()
    console.log('📏 Tamaño inicial:', boxInicial)
    
    // Drag desde esquina inferior derecha para resize
    if (!boxInicial) {
      throw new Error('No se pudo obtener bounding box')
    }
    
    const cornerX = boxInicial.x + boxInicial.width - 5
    const cornerY = boxInicial.y + boxInicial.height - 5
    
    await page.mouse.move(cornerX, cornerY)
    await page.mouse.down()
    await page.mouse.move(cornerX + 50, cornerY + 50, { steps: 10 })
    await page.mouse.up()
    
    await page.waitForTimeout(500)
    
    // Obtener nuevo tamaño
    const boxNueva = await imagen.boundingBox()
    console.log('📏 Tamaño nuevo:', boxNueva)
    
    // Verificar que cambió
    expect(boxNueva?.width).toBeGreaterThan(boxInicial.width)
    expect(boxNueva?.height).toBeGreaterThan(boxInicial.height)
  })
})

test.describe('Detección de Bugs', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
    await navigateToNotas(page)
  })

  test('BUG CHECK: Eliminar nota no causa errores en consola', async ({ page }) => {
    const titulo = `Bug Test ${Date.now()}`
    
    // Escuchar errores de consola
    const consoleErrors: string[] = []
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text())
      }
    })
    
    // Crear y eliminar nota
    await crearNota(page, titulo)
    await eliminarNota(page, titulo)
    
    // Verificar que no hay errores
    console.log('🔍 Errores de consola:', consoleErrors)
    expect(consoleErrors.length).toBe(0)
  })

  test('BUG CHECK: Mover imagen actualiza el modelo de Tiptap', async ({ page }) => {
    // Click en primera nota
    await page.locator('div[role="button"]').first().click()
    await page.waitForSelector('.ProseMirror', { timeout: 5000 })
    
    const imagenExists = await page.locator('.image-wrapper img').isVisible()
    
    if (!imagenExists) {
      console.log('⚠️  No hay imagen - Skipping')
      test.skip()
      return
    }
    
    // Escuchar logs de consola específicos
    const logs: string[] = []
    page.on('console', msg => {
      if (msg.text().includes('Drag stop') || msg.text().includes('HTML serializado')) {
        logs.push(msg.text())
      }
    })
    
    // Mover imagen
    await moverImagen(page, 50, 30)
    
    // Verificar que se loguean los eventos esperados
    console.log('📋 Logs capturados:', logs)
    
    const dragStopLog = logs.find(log => log.includes('Drag stop'))
    const htmlSerializadoLog = logs.find(log => log.includes('HTML serializado'))
    
    expect(dragStopLog).toBeDefined()
    expect(htmlSerializadoLog).toBeDefined()
    
    // Verificar que el HTML serializado incluye data-x y data-y
    expect(htmlSerializadoLog).toContain('data-x')
    expect(htmlSerializadoLog).toContain('data-y')
  })
})
