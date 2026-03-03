# 📋 Próximas Mejoras - Sistema de Notas

**Fecha**: 21 Enero 2026  
**Sesión**: Post-implementación v2.1.0  
**Usuario**: RZRV (Rolando Zagret Risco Sanchez)

---

## 🎯 **CONTEXTO**

El sistema de notas actualmente funciona estilo Apple Notes con:
- ✅ Editor split panel (sidebar + contenido)
- ✅ Categorías (General, Evidencia, Alegatos, Testigos)
- ✅ Prioridades (Alta, Media, Baja)
- ✅ **Exportar a PowerPoint** (implementado en v2.1.0)

**Propósito principal**: Preparar material para audiencias judiciales

---

## 💡 **IDEAS PARA PRÓXIMA SESIÓN**

### **1. Exportar Notas a PDF** 🔴 **PRIORIDAD ALTA**

**Razón**: No todos los jueces/salas tienen PowerPoint instalado. PDF es universal.

**Funcionalidad deseada**:
- Botón adicional "📄 Exportar PDF" junto al de PPT
- Mismo contenido que PPT pero en formato PDF
- Layout profesional (similar a documento legal)

**Opciones de implementación**:
```typescript
// Opción A: jsPDF (librería ligera)
npm install jspdf

// Opción B: react-pdf (más complejo pero mejor diseño)
npm install @react-pdf/renderer

// Opción C: Puppeteer (genera PDF desde HTML)
npm install puppeteer
```

**Decisión pendiente**: ¿Qué librería usar?

---

### **2. Filtrar Notas Antes de Exportar** 🟡 **PRIORIDAD MEDIA**

**Problema actual**: Al exportar, se incluyen TODAS las notas del caso.

**Mejora propuesta**:
- Checkbox para seleccionar qué notas exportar
- Filtros rápidos:
  - ✅ Solo notas de categoría "Evidencia"
  - ✅ Solo notas de prioridad "Alta"
  - ✅ Notas creadas en un rango de fechas
  - ✅ Notas marcadas como "Favoritas" (nueva feature)

**UI sugerida**:
```
┌─────────────────────────────────────┐
│ 📊 Exportar Notas                   │
├─────────────────────────────────────┤
│ Formato: [ PPT ] [ PDF ]            │
│                                     │
│ Filtros:                            │
│ □ Solo categoría: [Evidencia ▼]    │
│ □ Solo prioridad: [Alta ▼]         │
│ □ Rango de fechas: [___] - [___]   │
│ □ Solo favoritas                    │
│                                     │
│ Notas seleccionadas: 12/45          │
│                                     │
│ [Cancelar]  [✨ Exportar]           │
└─────────────────────────────────────┘
```

---

### **3. Logo del Despacho en Portada** 🟢 **PRIORIDAD BAJA**

**Problema actual**: Presentaciones no tienen branding del despacho.

**Mejora**:
- Agregar logo del despacho en portada de PPT/PDF
- Usar `/public/images/mlp-logo-dark.png` (ya existe)
- Posición: Esquina superior derecha o centrado arriba

**Implementación**:
```typescript
// En TakeNoteLayout.tsx (exportar PPT)
const portada = pptx.addSlide()

// Agregar logo
portada.addImage({
  path: '/public/images/mlp-logo-dark.png',
  x: 8, y: 0.5, // Esquina superior derecha
  w: 1.5, h: 0.75
})

// Resto del contenido...
portada.addText('Notas del Caso', { ... })
```

---

### **4. Marcar Notas como "Favoritas" ⭐** 🟡 **PRIORIDAD MEDIA**

**Uso**: Resaltar notas importantes para audiencias próximas.

**Funcionalidad**:
- Botón ⭐ en cada nota (toggle favorito)
- Las notas favoritas aparecen primero en la lista
- Se pueden filtrar para exportar solo favoritas

**Cambios en BD**:
```sql
-- Agregar columna a tabla 'notas'
ALTER TABLE notas 
ADD COLUMN favorito BOOLEAN DEFAULT FALSE;

-- Crear índice para búsquedas rápidas
CREATE INDEX idx_notas_favorito 
ON notas(caso_id, favorito) 
WHERE favorito = TRUE;
```

**Cambios en UI**:
```tsx
// NotasSidebar.tsx
<button 
  onClick={() => toggleFavorito(nota.id)}
  className={nota.favorito ? 'text-yellow-500' : 'text-gray-400'}
>
  {nota.favorito ? '⭐' : '☆'}
</button>
```

---

### **5. Adjuntar Archivos a Notas** 🔴 **PRIORIDAD ALTA** (Futuro)

**Caso de uso real**: 
- Adjuntar fotos de evidencias
- Adjuntar PDFs escaneados de documentos
- Adjuntar audios de declaraciones

**Complejidad**: ALTA (requiere storage en Supabase)

**Decisión**: **POSTERGAR** para cuando se necesite realmente.

---

### **6. Compartir Notas con Otros Abogados** 🟢 **PRIORIDAD BAJA** (Futuro)

**Uso**: Cuando hay varios abogados en un caso.

**Requiere**:
- Sistema de permisos/roles (no existe aún)
- Campo `abogado_asignado_id` en BD (ya existe pero no se usa)

**Decisión**: **ESPERAR** a implementar sistema de usuarios múltiples.

---

## 📊 **RESUMEN DE PRIORIDADES**

| Feature | Prioridad | Complejidad | Esfuerzo | ¿Implementar ahora? |
|---------|-----------|-------------|----------|---------------------|
| Exportar PDF | 🔴 Alta | Media | 2-3 horas | ✅ **SÍ** (próxima sesión) |
| Filtros de exportación | 🟡 Media | Baja | 1 hora | ✅ **SÍ** (junto con PDF) |
| Logo en portada | 🟢 Baja | Muy baja | 15 min | ✅ **SÍ** (rápido) |
| Notas favoritas ⭐ | 🟡 Media | Baja | 1 hora | ⚠️ **OPCIONAL** |
| Adjuntar archivos | 🔴 Alta | **Muy alta** | 8-10 horas | ❌ **NO** (futuro) |
| Compartir notas | 🟢 Baja | Alta | 5-6 horas | ❌ **NO** (requiere permisos) |

---

## 🎯 **PLAN SUGERIDO PARA PRÓXIMA SESIÓN**

### **Fase 1: Quick Wins (1 hora)**
1. ✅ Agregar logo a portada PPT (15 min)
2. ✅ Implementar filtros básicos de exportación (45 min)
   - Checkbox "Solo categoría X"
   - Checkbox "Solo prioridad Y"

### **Fase 2: Feature Principal (2-3 horas)**
3. ✅ Implementar exportación a PDF
   - Decidir librería (jsPDF vs react-pdf)
   - Diseño del documento PDF
   - Botón "Exportar PDF" funcional
   - Testing en navegador

### **Fase 3: Opcional (1 hora)**
4. ⚠️ Notas favoritas (solo si hay tiempo)
   - Migration en BD
   - Botón toggle ⭐
   - Ordenamiento por favorito

---

## 🛠️ **PREPARACIÓN TÉCNICA**

### **Librerías a Evaluar**

#### **Para PDF - Opción A: jsPDF** ⭐ RECOMENDADA
```bash
npm install jspdf
```
**Pros**:
- ✅ Ligera (300KB)
- ✅ Fácil de usar
- ✅ Funciona en navegador
- ✅ Similar a pptxgenjs (ya conocemos patrón)

**Contras**:
- ❌ Diseño básico (no tan elegante como react-pdf)

#### **Para PDF - Opción B: react-pdf**
```bash
npm install @react-pdf/renderer
```
**Pros**:
- ✅ Diseño muy profesional
- ✅ Usa JSX (familiar)

**Contras**:
- ❌ Más pesada (1.2MB)
- ❌ Curva de aprendizaje mayor

---

## 📝 **NOTAS ADICIONALES**

### **Decisiones Pendientes del Usuario**

1. **¿Qué librería usar para PDF?**
   - jsPDF (simple, rápida)
   - react-pdf (profesional, compleja)

2. **¿Implementar notas favoritas ahora o después?**
   - Ahora (agregamos columna a BD)
   - Después (cuando realmente lo necesites)

3. **Diseño del PDF**
   - ¿Similar al PPT (slides)?
   - ¿Documento legal tradicional (continuo)?
   - ¿Ambas opciones?

---

## 🎨 **MOCKUP: Exportar con Filtros**

```
┌────────────────── Notas del Caso ──────────────────┐
│                                                     │
│  [+ Nueva nota]  [📊 Exportar ▼]  [🔍 Buscar...]   │
│                                                     │
│  ┌─── Exportar Notas ───────────────────────────┐  │
│  │                                               │  │
│  │  Formato de exportación:                     │  │
│  │  ○ PowerPoint (.pptx)                        │  │
│  │  ● PDF (.pdf)                                │  │
│  │                                               │  │
│  │  Filtros (opcional):                         │  │
│  │  ☑ Solo categoría: [Evidencia ▼]            │  │
│  │  ☐ Solo prioridad: [Todas ▼]                │  │
│  │  ☐ Solo notas favoritas ⭐                   │  │
│  │                                               │  │
│  │  Incluir:                                     │  │
│  │  ☑ Portada con logo                          │  │
│  │  ☑ Índice de notas                           │  │
│  │  ☑ Fechas de creación                        │  │
│  │                                               │  │
│  │  Notas a exportar: 8 de 23                   │  │
│  │                                               │  │
│  │         [Cancelar]  [📥 Exportar]            │  │
│  └───────────────────────────────────────────────┘  │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## ✅ **CHECKLIST PRE-IMPLEMENTACIÓN**

Antes de empezar la próxima sesión, verificar:

- [ ] Usuario decidió qué librería de PDF usar
- [ ] Usuario decidió diseño del PDF (slides vs documento)
- [ ] Usuario decidió si implementar favoritos ahora
- [ ] BD tiene backup antes de migrations
- [ ] Servidor de dev está corriendo
- [ ] Build está pasando (verificar con `npm run build`)

---

## 📚 **RECURSOS ÚTILES**

### **Documentación**
- jsPDF: https://github.com/parallax/jsPDF
- react-pdf: https://react-pdf.org/
- pptxgenjs (ya usamos): https://gitbrent.github.io/PptxGenJS/

### **Ejemplos de Código**
```typescript
// Ejemplo básico jsPDF
import jsPDF from 'jspdf'

const doc = new jsPDF()
doc.setFontSize(20)
doc.text('Notas del Caso C.AGUIRRE-13', 20, 20)
doc.addPage()
doc.text('Nota 1: Contenido...', 20, 20)
doc.save('notas.pdf')
```

---

**Documento creado**: 21 Enero 2026, 03:15 AM  
**Para uso en**: Próxima sesión de desarrollo  
**Mantenido por**: Claude (Anthropic)  
**Usuario**: RZRV
