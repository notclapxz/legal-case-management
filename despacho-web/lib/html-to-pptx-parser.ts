/**
 * HTML to PowerPoint Parser
 * Convierte HTML de Tiptap a formato PowerPoint usando pptxgenjs
 */

import type pptxgen from 'pptxgenjs'
import { logError } from '@/lib/utils/errors'

interface TextRun {
  text: string
  options: {
    bold?: boolean
    italic?: boolean
    underline?: boolean
    color?: string
    fontSize?: number
    breakLine?: boolean
    bullet?: boolean | { indent: number }
  }
}

interface ParsedElement {
  type: 'heading' | 'paragraph' | 'list' | 'image' | 'text'
  level?: number // Para headings (1, 2, 3)
  content?: string
  children?: ParsedElement[]
  src?: string // Para imágenes
  width?: number
  height?: number
  ordered?: boolean // Para listas (true = <ol>, false = <ul>)
  textRuns?: TextRun[] // Para texto con formato
}

/**
 * Parsea HTML y devuelve estructura de elementos
 */
export function parseHTML(html: string): ParsedElement[] {
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')
  const elements: ParsedElement[] = []

  function traverseNode(node: Node): ParsedElement | null {
    // Ignorar nodos de texto vacíos
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent?.trim() || ''
      if (!text) return null
      return {
        type: 'text',
        content: text,
        textRuns: [{ text, options: {} }]
      }
    }

    if (node.nodeType !== Node.ELEMENT_NODE) return null

    const element = node as Element
    const tagName = element.tagName.toLowerCase()

    // Headings (H1, H2, H3)
    if (tagName === 'h1' || tagName === 'h2' || tagName === 'h3') {
      return {
        type: 'heading',
        level: parseInt(tagName[1]),
        content: element.textContent?.trim() || '',
        textRuns: parseTextFormatting(element)
      }
    }

    // Paragraph
    if (tagName === 'p') {
      const textRuns = parseTextFormatting(element)
      if (textRuns.length === 0) return null // Skip empty paragraphs
      
      return {
        type: 'paragraph',
        content: element.textContent?.trim() || '',
        textRuns
      }
    }

    // Lists
    if (tagName === 'ul' || tagName === 'ol') {
      const children: ParsedElement[] = []
      
      element.querySelectorAll(':scope > li').forEach(li => {
        const textRuns = parseTextFormatting(li)
        if (textRuns.length > 0) {
          children.push({
            type: 'paragraph',
            content: li.textContent?.trim() || '',
            textRuns
          })
        }
      })

      return {
        type: 'list',
        ordered: tagName === 'ol',
        children
      }
    }

    // Images
    if (tagName === 'img') {
      const src = element.getAttribute('src')
      const width = element.getAttribute('width')
      const height = element.getAttribute('height')
      
      if (!src) return null

      return {
        type: 'image',
        src,
        width: width ? parseFloat(width) : undefined,
        height: height ? parseFloat(height) : undefined
      }
    }

    return null
  }

  // Parsear todos los hijos del body
  Array.from(doc.body.childNodes).forEach(node => {
    const parsed = traverseNode(node)
    if (parsed) elements.push(parsed)
  })

  return elements
}

/**
 * Parsea el formato de texto dentro de un elemento (bold, italic, etc.)
 */
function parseTextFormatting(element: Element): TextRun[] {
  const runs: TextRun[] = []

  function traverse(node: Node, inherited: TextRun['options'] = {}) {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent || ''
      if (text.trim()) {
        runs.push({
          text,
          options: { ...inherited }
        })
      }
      return
    }

    if (node.nodeType !== Node.ELEMENT_NODE) return

    const el = node as Element
    const tag = el.tagName.toLowerCase()
    const newInherited = { ...inherited }

    // Aplicar estilos según tag
    if (tag === 'strong' || tag === 'b') {
      newInherited.bold = true
    }
    if (tag === 'em' || tag === 'i') {
      newInherited.italic = true
    }
    if (tag === 'u') {
      newInherited.underline = true
    }
    if (tag === 'mark') {
      // pptxgenjs no soporta highlight, usamos color de texto amarillo oscuro
      newInherited.color = '854d0e' // Amarillo oscuro para que se vea sobre fondo blanco
    }

    // Recorrer hijos
    Array.from(el.childNodes).forEach(child => traverse(child, newInherited))
  }

  traverse(element)
  return runs
}

/**
 * Convierte TextRun[] a formato pptxgenjs TextProps[]
 */
export function convertTextRunsToPptxFormat(runs: TextRun[]): pptxgen.TextProps[] {
  return runs.map(run => ({
    text: run.text,
    options: {
      bold: run.options.bold,
      italic: run.options.italic,
      underline: run.options.underline ? { style: 'sng' as const } : undefined,
      color: run.options.color,
      fontSize: run.options.fontSize,
      breakLine: run.options.breakLine
    }
  }))
}

/**
 * Renderiza elementos parseados en un slide de PowerPoint
 */
export async function renderElementsToSlide(
  slide: pptxgen.Slide,
  elements: ParsedElement[],
  options: {
    startY?: number
    maxWidth?: number
    maxHeight?: number
  } = {}
): Promise<void> {
  const {
    startY = 1.2,
    maxWidth = 9,
    maxHeight = 4.5
  } = options

  let currentY = startY
  const marginX = 0.5
  const lineSpacing = 0.15

  for (const element of elements) {
    // Verificar que no nos pasemos del slide
    if (currentY > maxHeight + startY) break

    switch (element.type) {
      case 'heading': {
        const fontSize = element.level === 1 ? 28 : element.level === 2 ? 22 : 18
        const color = element.level === 1 ? '1e3a8a' : '374151'

        const textProps = element.textRuns 
          ? convertTextRunsToPptxFormat(element.textRuns)
          : [{ text: element.content || '', options: {} }]

        slide.addText(textProps, {
          x: marginX,
          y: currentY,
          w: maxWidth,
          fontSize,
          color,
          bold: true,
          breakLine: true
        })

        currentY += (fontSize / 72) * 1.5 + lineSpacing
        break
      }

      case 'paragraph': {
        if (!element.textRuns || element.textRuns.length === 0) break

        const textProps = convertTextRunsToPptxFormat(element.textRuns).map(tp => ({
          ...tp,
          options: {
            ...tp.options,
            fontSize: 14
          }
        }))

        slide.addText(textProps, {
          x: marginX,
          y: currentY,
          w: maxWidth,
          fontSize: 14,
          color: '1f2937',
          valign: 'top'
        })

        currentY += 0.4 + lineSpacing
        break
      }

      case 'list': {
        if (!element.children) break

        element.children.forEach((item) => {
          if (!item.textRuns) return

          const bulletConfig = element.ordered
            ? { type: 'number' as const }
            : { type: 'bullet' as const }

          const textProps = convertTextRunsToPptxFormat(item.textRuns).map(tp => ({
            ...tp,
            options: {
              ...tp.options,
              color: tp.options?.color || '1f2937',
              fontSize: 14
            }
          }))

          slide.addText(textProps, {
            x: marginX + 0.3,
            y: currentY,
            w: maxWidth - 0.3,
            fontSize: 14,
            color: '1f2937',
            bullet: bulletConfig
          })

          currentY += 0.35 + lineSpacing
        })

        currentY += lineSpacing
        break
      }

      case 'image': {
        if (!element.src) break

        try {
          // Descargar imagen
          const response = await fetch(element.src)
          if (!response.ok) throw new Error(`Failed to fetch image: ${response.status}`)
          
          const blob = await response.blob()
          
          // Convertir WebP a PNG/JPEG para compatibilidad con PowerPoint
          let finalBlob = blob
          if (blob.type === 'image/webp') {
            finalBlob = await convertWebPToPNG(blob)
          }

          const base64 = await blobToBase64(finalBlob)

          // Calcular dimensiones manteniendo aspect ratio
          let imgWidth = element.width ? element.width / 96 : 4 // Default 4 inches
          let imgHeight = element.height ? element.height / 96 : 3 // Default 3 inches

          // Limitar tamaño máximo
          const maxImgWidth = maxWidth - 1
          const maxImgHeight = 2.5

          if (imgWidth > maxImgWidth) {
            const ratio = maxImgWidth / imgWidth
            imgWidth = maxImgWidth
            imgHeight = imgHeight * ratio
          }

          if (imgHeight > maxImgHeight) {
            const ratio = maxImgHeight / imgHeight
            imgHeight = maxImgHeight
            imgWidth = imgWidth * ratio
          }

          // Centrar imagen
          const imgX = marginX + (maxWidth - imgWidth) / 2

          slide.addImage({
            data: base64,
            x: imgX,
            y: currentY,
            w: imgWidth,
            h: imgHeight
          })

          currentY += imgHeight + lineSpacing * 2
        } catch (error) {
          logError('html-to-pptx-parser.addImage', error)
          // Continuar sin la imagen
        }
        break
      }
    }
  }
}

/**
 * Convierte WebP a PNG usando Canvas (PowerPoint no soporta WebP bien)
 */
async function convertWebPToPNG(webpBlob: Blob): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(webpBlob)

    img.onload = () => {
      // Crear canvas con las dimensiones de la imagen
      const canvas = document.createElement('canvas')
      canvas.width = img.naturalWidth
      canvas.height = img.naturalHeight

      const ctx = canvas.getContext('2d')
      if (!ctx) {
        reject(new Error('Failed to get canvas context'))
        return
      }

      // Dibujar imagen en canvas
      ctx.drawImage(img, 0, 0)

      // Convertir canvas a PNG Blob
      canvas.toBlob(
        (pngBlob) => {
          URL.revokeObjectURL(url)
          if (pngBlob) {
            resolve(pngBlob)
          } else {
            reject(new Error('Failed to convert WebP to PNG'))
          }
        },
        'image/png',
        1.0 // Calidad máxima
      )
    }

    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Failed to load WebP image'))
    }

    img.src = url
  })
}

/**
 * Convierte Blob a Base64 con header completo (data:image/xxx;base64,...)
 */
function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => {
      const result = reader.result as string
      // pptxgenjs necesita el header completo: "data:image/png;base64,..."
      resolve(result)
    }
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}
