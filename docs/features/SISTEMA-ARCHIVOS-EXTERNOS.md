# Sistema de Archivos Externos - Plan de Implementación

**Fecha de creación:** 28 de enero de 2026  
**Estado:** 📋 En planificación  
**Prioridad:** Alta  
**Versión:** 1.0

---

## 🎯 Objetivo del Sistema

Implementar un sistema que permita gestionar **2TB+ de casos jurídicos** almacenados en archivos PDF (tomos, expedientes, sentencias) a través de la aplicación web, permitiendo:

- 📂 Drag & drop masivo de carpetas con múltiples archivos
- 🔍 Búsqueda inteligente de documentos
- 📱 Acceso desde tablet y PC
- 📄 Visualización de PDFs sin descargas completas (streaming)
- 🗂️ Organización automática por caso
- 🔐 Seguridad y control de acceso

---

## 📊 Contexto del Problema

### Situación Actual

```
Disco Externo (2TB, casi lleno)
├── Caso_001_RodriguezJuan/
│   ├── Tomo_1.pdf (450 MB)
│   ├── Tomo_2.pdf (480 MB)
│   ├── Tomo_3.pdf (520 MB)
│   ├── Sentencia_Final.pdf (120 MB)
│   └── Pruebas_Anexo_A.pdf (200 MB)
├── Caso_002_MartinezMaria/
│   ├── Tomo_1.pdf (380 MB)
│   └── Tomo_2.pdf (410 MB)
├── ... (cientos de casos más)
└── Archivos personales
```

### Desafíos Técnicos

1. **Volumen de datos:** 2TB+ de archivos (imposible subirlos a Supabase)
2. **Tamaño de archivos:** PDFs de 300-500 MB cada uno
3. **Cantidad:** Miles de archivos distribuidos en cientos de carpetas
4. **Acceso multi-dispositivo:** Tablet Samsung + PC/Laptop
5. **Streaming:** Abrir PDFs sin descargar archivos completos
6. **Seguridad del navegador:** No se pueden abrir rutas locales directamente

---

## 🏗️ Arquitectura de la Solución

### Componentes del Sistema

```
┌─────────────────────────────────────────────────────────┐
│                    USUARIO FINAL                         │
│  ┌──────────────┐              ┌──────────────┐         │
│  │ Tablet       │              │ PC/Laptop    │         │
│  │ Samsung      │              │ Windows/Mac  │         │
│  └──────┬───────┘              └──────┬───────┘         │
└─────────┼──────────────────────────────┼────────────────┘
          │                              │
          │         WiFi Local           │
          │                              │
    ┌─────▼──────────────────────────────▼─────┐
    │         Red Local del Estudio             │
    └─────┬──────────────────────────────┬──────┘
          │                              │
    ┌─────▼──────────────┐         ┌─────▼──────────────┐
    │   Supabase Cloud   │         │  NAS (Synology)    │
    │   (PostgreSQL)     │         │  - Disco 1 (4TB)   │
    │                    │         │  - Disco 2 (4TB)   │
    │  - Metadata casos  │◄────────┤  RAID 1 (Mirror)   │
    │  - Permisos        │  Sync   │                    │
    │  - Usuarios        │         │  - PDFs (2TB+)     │
    └────────────────────┘         │  - API REST        │
                                   │  - WebDAV/SMB      │
                                   └────────────────────┘
```

### Base de Datos: Nueva Tabla `casos_archivos`

```sql
-- Tabla para almacenar metadata de archivos en NAS
CREATE TABLE casos_archivos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  caso_id UUID NOT NULL REFERENCES casos(id) ON DELETE CASCADE,
  
  -- Información del archivo
  nombre_archivo TEXT NOT NULL,
  extension TEXT NOT NULL, -- 'pdf', 'docx', 'jpg', etc.
  tomo_numero INTEGER, -- Si es un tomo numerado
  tipo_documento TEXT, -- 'Demanda', 'Sentencia', 'Prueba', 'Alegato', etc.
  descripcion TEXT,
  
  -- Ubicación en NAS
  ruta_nas TEXT NOT NULL, -- '/Casos/Caso_001/Tomo_1.pdf'
  carpeta_nas TEXT NOT NULL, -- '/Casos/Caso_001'
  
  -- Metadata técnica
  tamaño_bytes BIGINT NOT NULL,
  hash_md5 TEXT, -- Para verificar integridad
  mime_type TEXT DEFAULT 'application/pdf',
  
  -- Metadata de búsqueda (opcional, para indexación futura)
  contenido_indexado TEXT, -- Texto extraído del PDF (si se implementa OCR)
  
  -- Timestamps
  fecha_subida TIMESTAMPTZ DEFAULT now(),
  fecha_modificacion TIMESTAMPTZ,
  fecha_documento DATE, -- Fecha del documento legal (ej: fecha de sentencia)
  
  -- Control de acceso (hereda de caso, pero puede sobrescribir)
  es_confidencial BOOLEAN DEFAULT false,
  usuarios_con_acceso UUID[], -- IDs de usuarios que pueden acceder
  
  -- Estado
  estado TEXT DEFAULT 'Disponible' CHECK (estado IN ('Disponible', 'Procesando', 'Error', 'Eliminado')),
  
  -- Constraints
  CONSTRAINT unique_archivo_caso UNIQUE(caso_id, ruta_nas),
  CONSTRAINT tamaño_positivo CHECK (tamaño_bytes > 0)
);

-- Índices para performance
CREATE INDEX idx_casos_archivos_caso_id ON casos_archivos(caso_id);
CREATE INDEX idx_casos_archivos_tipo ON casos_archivos(tipo_documento);
CREATE INDEX idx_casos_archivos_fecha ON casos_archivos(fecha_documento);
CREATE INDEX idx_casos_archivos_estado ON casos_archivos(estado);
CREATE INDEX idx_casos_archivos_busqueda ON casos_archivos USING gin(to_tsvector('spanish', nombre_archivo || ' ' || COALESCE(descripcion, '')));

-- RLS Policies (Row Level Security)
ALTER TABLE casos_archivos ENABLE ROW LEVEL SECURITY;

-- Policy: Ver archivos solo si tienes acceso al caso
CREATE POLICY "Ver archivos del caso"
  ON casos_archivos
  FOR SELECT
  USING (
    -- Admin ve todo
    EXISTS (
      SELECT 1 FROM perfiles
      WHERE perfiles.id = auth.uid()
      AND perfiles.rol = 'admin'
    )
    OR
    -- Abogado asignado al caso
    EXISTS (
      SELECT 1 FROM casos
      WHERE casos.id = casos_archivos.caso_id
      AND casos.abogado_asignado_id = auth.uid()
    )
    OR
    -- Usuario con acceso directo al caso
    auth.uid() = ANY(
      SELECT unnest(usuarios_con_acceso)
      FROM casos
      WHERE casos.id = casos_archivos.caso_id
    )
  );

-- Policy: Solo admin puede crear/editar/eliminar archivos
CREATE POLICY "Gestionar archivos (admin)"
  ON casos_archivos
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM perfiles
      WHERE perfiles.id = auth.uid()
      AND perfiles.rol = 'admin'
    )
  );
```

---

## 🔧 Infraestructura Requerida

### Hardware: NAS (Network Attached Storage)

**Requisitos mínimos:**
- ✅ 2 bahías para discos (RAID 1 - espejo)
- ✅ Procesador: Intel Celeron o superior (para transcodificar PDFs)
- ✅ RAM: 2GB mínimo, 4GB recomendado
- ✅ Red: Gigabit Ethernet (1000 Mbps)
- ✅ Puertos USB 3.0 para expandir almacenamiento
- ✅ Sistema operativo con API REST (Synology DSM, QNAP QTS)

**Capacidad de discos:**
- **Actual:** 2TB usados
- **Recomendado:** 2x 4TB (8TB total, 4TB útiles con RAID 1)
- **Futuro (3 años):** 2x 6TB u 8TB

**Marcas recomendadas (por orden de preferencia):**

1. **Synology DS220+ / DS223** (Recomendado)
   - Mejor software (DSM)
   - APIs bien documentadas
   - Comunidad grande
   - Precio: ~USD 250-350 (solo NAS)

2. **QNAP TS-253E**
   - Más potente que Synology
   - Más complejo de configurar
   - Precio: ~USD 300-400

3. **TerraMaster F2-423**
   - Más económico
   - Menos features
   - Precio: ~USD 200-250

**Discos recomendados:**
- **WD Red Plus 4TB** (NAS optimized, 24/7) - USD 100-120 c/u
- **Seagate IronWolf 4TB** (NAS optimized) - USD 95-110 c/u

**Inversión total estimada:**
- NAS: USD 250-350
- 2x Discos 4TB: USD 200-240
- **Total: USD 450-590**

### Software del NAS

**Servicios necesarios:**
- ✅ **SMB/CIFS:** Compartir archivos en red local
- ✅ **WebDAV:** Acceso HTTP a archivos
- ✅ **API REST:** Para integración con app web
- ✅ **File Station:** Gestión de archivos via web
- ✅ **Thumbnails:** Generación de previsualizaciones
- ✅ **Indexación:** Búsqueda de contenido (opcional)

---

## 🎨 Diseño de la Interfaz de Usuario

### Vista en Tablet/PC: Detalle de Caso

```
┌────────────────────────────────────────────────────────┐
│  📁 Caso: Rodríguez Juan vs. Estado Nacional          │
│  Código: CASO-2024-001 | Estado: Activo               │
├────────────────────────────────────────────────────────┤
│  [Resumen] [Notas] [Eventos] [Pagos] [📄 Archivos]    │
├────────────────────────────────────────────────────────┤
│                                                        │
│  📤 Arrastrar archivos o carpetas aquí                │
│  [Explorar archivos...]                               │
│                                                        │
│  ────────────────────────────────────────             │
│                                                        │
│  📂 Archivos del Caso (8 archivos - 2.1 GB)           │
│                                                        │
│  🔍 Buscar en archivos...              [⚙️ Filtros]   │
│                                                        │
│  ┌──────────────────────────────────────────────────┐ │
│  │ 📄 Tomo_1.pdf                          450 MB    │ │
│  │    Tipo: Demanda | Fecha: 15/03/2023             │ │
│  │    [👁️ Ver] [⬇️ Descargar] [🗑️ Eliminar]          │ │
│  ├──────────────────────────────────────────────────┤ │
│  │ 📄 Tomo_2.pdf                          480 MB    │ │
│  │    Tipo: Pruebas | Fecha: 22/04/2023             │ │
│  │    [👁️ Ver] [⬇️ Descargar] [🗑️ Eliminar]          │ │
│  ├──────────────────────────────────────────────────┤ │
│  │ 📄 Sentencia_Final.pdf                 120 MB    │ │
│  │    Tipo: Sentencia | Fecha: 10/11/2023           │ │
│  │    [👁️ Ver] [⬇️ Descargar] [🗑️ Eliminar]          │ │
│  └──────────────────────────────────────────────────┘ │
│                                                        │
│  [Cargar más archivos...]                             │
└────────────────────────────────────────────────────────┘
```

### Modal: Subir Archivos

```
┌────────────────────────────────────────────┐
│  📤 Subir Archivos al Caso                │
│                                            │
│  Arrastra archivos o carpetas aquí        │
│  ┌────────────────────────────────────┐   │
│  │                                    │   │
│  │        📁 Suelta aquí              │   │
│  │                                    │   │
│  └────────────────────────────────────┘   │
│                                            │
│  o [Examinar archivos...]                 │
│                                            │
│  ──────────────────────────────────        │
│                                            │
│  📋 Archivos a subir (3):                 │
│  ✓ Tomo_1.pdf (450 MB)                    │
│  ✓ Tomo_2.pdf (480 MB)                    │
│  ✓ Sentencia.pdf (120 MB)                 │
│                                            │
│  Total: 1.05 GB                           │
│                                            │
│  ⚙️ Opciones:                             │
│  □ Detectar tipo de documento automáticam.│
│  □ Extraer fecha del contenido            │
│  ☑️ Generar miniaturas                    │
│                                            │
│  [Cancelar]              [Subir archivos] │
└────────────────────────────────────────────┘
```

### Visor de PDF (Modal)

```
┌─────────────────────────────────────────────────────┐
│  📄 Tomo_1.pdf - Caso Rodríguez                     │
│  [← Atrás] [⬇️ Descargar] [🖨️ Imprimir] [❌ Cerrar] │
├─────────────────────────────────────────────────────┤
│                                                     │
│           ┌─────────────────────┐                  │
│           │                     │                  │
│           │   VISTA DEL PDF     │                  │
│           │   (iframe o embed)  │                  │
│           │                     │                  │
│           │   Streaming desde   │                  │
│           │   NAS via HTTP      │                  │
│           │                     │                  │
│           └─────────────────────┘                  │
│                                                     │
│  Página: [◀️] 1 / 145 [▶️]          Zoom: [−] [+]  │
└─────────────────────────────────────────────────────┘
```

---

## 🚀 Plan de Implementación (Fases)

### **FASE 1: Infraestructura y Setup (ACTUAL - Pendiente)**

**Objetivo:** Adquirir y configurar el NAS.

**Tareas:**
1. ✅ Documentar requisitos técnicos (este documento)
2. 📋 Investigar y comparar modelos de NAS (Synology vs QNAP vs TerraMaster)
3. 📋 Seleccionar NAS y discos según presupuesto
4. 📋 Comprar hardware (NAS + 2 discos 4TB)
5. 📋 Configurar NAS:
   - Instalar discos en RAID 1
   - Configurar red local (IP fija)
   - Crear carpeta compartida `/Casos`
   - Activar API REST
   - Configurar permisos de acceso
6. 📋 Migrar archivos del disco externo al NAS
7. 📋 Probar acceso desde tablet y PC

**Duración estimada:** 1-2 semanas  
**Responsable:** Doctor (compra) + Desarrollador (configuración)

---

### **FASE 2: Backend - API y Base de Datos**

**Objetivo:** Crear la infraestructura de software para gestionar archivos.

**Tareas:**
1. 📋 Crear migración SQL para tabla `casos_archivos`
2. 📋 Actualizar tipos TypeScript en `lib/types/database.ts`
3. 📋 Crear funciones helper para NAS:
   ```typescript
   // lib/nas/client.ts
   - uploadFile(file: File, casoId: string)
   - downloadFile(archivoId: string)
   - streamFile(archivoId: string)
   - deleteFile(archivoId: string)
   - listFiles(casoId: string)
   - searchFiles(query: string)
   ```
4. 📋 Crear API Routes en Next.js:
   ```
   /api/casos/[id]/archivos/upload
   /api/casos/[id]/archivos/[archivoId]/stream
   /api/casos/[id]/archivos/[archivoId]/delete
   ```
5. 📋 Implementar autenticación con NAS (credenciales seguras)
6. 📋 Testing de APIs

**Duración estimada:** 1 semana  
**Dependencias:** FASE 1 completada

---

### **FASE 3: Frontend - UI de Archivos**

**Objetivo:** Interfaz para subir, ver y gestionar archivos.

**Tareas:**
1. 📋 Crear componente `CasoArchivos.tsx` (vista principal)
2. 📋 Crear componente `UploadArchivos.tsx` (drag & drop)
3. 📋 Crear componente `VisorPDF.tsx` (modal para ver PDFs)
4. 📋 Crear componente `ListaArchivos.tsx` (tabla con filtros)
5. 📋 Implementar drag & drop con `react-dropzone`
6. 📋 Implementar búsqueda y filtros
7. 📋 Agregar tab "Archivos" en detalle de caso
8. 📋 Testing en tablet y PC

**Duración estimada:** 1-2 semanas  
**Dependencias:** FASE 2 completada

---

### **FASE 4: Features Avanzadas (Opcional - Futuro)**

**Objetivo:** Mejorar la experiencia con features adicionales.

**Tareas:**
1. 📋 Generación automática de thumbnails (previsualizaciones)
2. 📋 Búsqueda full-text dentro de PDFs (OCR)
3. 📋 Detección automática de tipo de documento (ML)
4. 📋 Extracción de fechas del contenido
5. 📋 Historial de versiones de archivos
6. 📋 Compartir archivos con clientes (links temporales)
7. 📋 Firma digital de documentos
8. 📋 Comparación de versiones de PDFs

**Duración estimada:** 2-4 semanas  
**Dependencias:** FASE 3 completada

---

## 📡 Integración con NAS (Detalles Técnicos)

### Opción A: API REST de Synology (Recomendada)

**Synology File Station API:**

```typescript
// lib/nas/synology.ts
import axios from 'axios'

const NAS_URL = process.env.NAS_URL || 'http://192.168.1.100:5000'
const NAS_USER = process.env.NAS_USER
const NAS_PASS = process.env.NAS_PASS

export class SynologyNAS {
  private sid: string | null = null

  // 1. Autenticación
  async login() {
    const response = await axios.get(`${NAS_URL}/webapi/auth.cgi`, {
      params: {
        api: 'SYNO.API.Auth',
        version: 3,
        method: 'login',
        account: NAS_USER,
        passwd: NAS_PASS,
        session: 'FileStation',
        format: 'sid'
      }
    })
    
    if (response.data.success) {
      this.sid = response.data.data.sid
      return this.sid
    }
    throw new Error('Login failed')
  }

  // 2. Subir archivo
  async uploadFile(file: File, remotePath: string) {
    if (!this.sid) await this.login()

    const formData = new FormData()
    formData.append('api', 'SYNO.FileStation.Upload')
    formData.append('version', '2')
    formData.append('method', 'upload')
    formData.append('path', remotePath)
    formData.append('file', file)
    formData.append('_sid', this.sid!)

    const response = await axios.post(
      `${NAS_URL}/webapi/entry.cgi`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    )

    return response.data
  }

  // 3. Descargar/Stream archivo
  getDownloadUrl(filePath: string) {
    return `${NAS_URL}/webapi/entry.cgi?api=SYNO.FileStation.Download&version=2&method=download&path=${encodeURIComponent(filePath)}&mode=download&_sid=${this.sid}`
  }

  // 4. Listar archivos
  async listFiles(folderPath: string) {
    if (!this.sid) await this.login()

    const response = await axios.get(`${NAS_URL}/webapi/entry.cgi`, {
      params: {
        api: 'SYNO.FileStation.List',
        version: 2,
        method: 'list',
        folder_path: folderPath,
        _sid: this.sid
      }
    })

    return response.data.data.files
  }

  // 5. Eliminar archivo
  async deleteFile(filePath: string) {
    if (!this.sid) await this.login()

    const response = await axios.get(`${NAS_URL}/webapi/entry.cgi`, {
      params: {
        api: 'SYNO.FileStation.Delete',
        version: 2,
        method: 'delete',
        path: filePath,
        _sid: this.sid
      }
    })

    return response.data
  }
}
```

### Opción B: WebDAV (Alternativa)

```typescript
// lib/nas/webdav.ts
import { createClient } from 'webdav'

const webdav = createClient(
  process.env.NAS_WEBDAV_URL!, // http://192.168.1.100:5005
  {
    username: process.env.NAS_USER!,
    password: process.env.NAS_PASS!
  }
)

export async function uploadFile(file: Buffer, remotePath: string) {
  await webdav.putFileContents(remotePath, file)
}

export async function downloadFile(remotePath: string) {
  return await webdav.getFileContents(remotePath)
}

export async function listFiles(folderPath: string) {
  return await webdav.getDirectoryContents(folderPath)
}
```

---

## 🔒 Seguridad y Permisos

### Control de Acceso

**Niveles de permisos:**
1. **Admin:** Acceso total (subir, ver, eliminar archivos de cualquier caso)
2. **Abogado asignado:** Ver/subir archivos solo de sus casos
3. **Abogado con acceso compartido:** Ver archivos (sin eliminar)
4. **Secretaria:** Ver archivos (solo lectura)

**Implementación en RLS:**
```sql
-- Ya incluido en la tabla casos_archivos (ver arriba)
-- Policies heredan permisos del caso padre
```

### Encriptación

**En tránsito:**
- ✅ HTTPS para app web (ya implementado con Vercel)
- ✅ HTTPS para NAS (configurar certificado SSL en Synology)

**En reposo:**
- ⚠️ Opcional: Encriptar volumen del NAS (impacto en performance)
- ✅ Recomendado: Encriptar carpetas sensibles específicas

---

## 📊 Estimación de Tiempos y Recursos

### Tiempos de Desarrollo

| Fase | Duración | Esfuerzo (horas) |
|------|----------|------------------|
| FASE 1: Setup NAS | 1-2 semanas | 8-12h (configuración) |
| FASE 2: Backend | 1 semana | 20-30h |
| FASE 3: Frontend | 1-2 semanas | 30-40h |
| FASE 4: Features extra | 2-4 semanas | 40-60h |
| **TOTAL Mínimo (F1-F3)** | **3-5 semanas** | **58-82h** |

### Recursos Necesarios

**Hardware:**
- NAS + Discos: USD 450-590 (inversión única)
- Router/Switch Gigabit: USD 30-50 (si no tienen)

**Software:**
- Todo open-source o incluido en NAS
- Costo adicional: USD 0

**Humanos:**
- 1 Desarrollador full-stack
- Disponibilidad del doctor para testing

---

## ⚠️ Riesgos y Mitigaciones

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| NAS falla durante migración | Media | Alto | Backup del disco original antes de migrar |
| Performance lenta con archivos grandes | Media | Medio | Usar streaming en lugar de descargas completas |
| Incompatibilidad de tablet con WebDAV | Baja | Alto | Usar API REST en lugar de WebDAV |
| Doctor no entiende cómo usar el sistema | Media | Bajo | Tutorial interactivo y capacitación |
| Disco del NAS falla después | Baja | Crítico | RAID 1 + backup manual mensual |

---

## 📝 Notas Adicionales

### Decisiones Pendientes

- [ ] **Marca de NAS:** Synology vs QNAP vs TerraMaster
- [ ] **Capacidad de discos:** 4TB vs 6TB (depende de presupuesto)
- [ ] **OCR/Búsqueda full-text:** ¿Implementar en Fase 4 o no?
- [ ] **Backup adicional:** ¿Cloud en el futuro o solo NAS?

### Consideraciones Legales

- ✅ Archivos quedan bajo control del doctor (no en cloud de terceros)
- ✅ RAID 1 protege contra pérdida de datos por falla de disco
- ⚠️ Implementar backup manual mensual (disco externo adicional)
- ⚠️ Configurar NAS con IP fija y firewall (solo red local)

### Escalabilidad

**¿Qué pasa si crece más de 4TB?**
1. Opción A: Reemplazar discos por 8TB (RAID rebuild)
2. Opción B: Agregar NAS adicional
3. Opción C: Migrar a NAS de 4+ bahías

---

## 📚 Referencias y Recursos

### Documentación Técnica

- [Synology DSM API Documentation](https://global.download.synology.com/download/Document/Software/DeveloperGuide/Package/FileStation/All/enu/Synology_File_Station_API_Guide.pdf)
- [QNAP API Guide](https://www.qnap.com/en/how-to/faq/article/how-to-access-qnap-nas-by-webdav)
- [WebDAV Client for JavaScript](https://github.com/perry-mitchell/webdav-client)

### Comparación de NAS

- [NAS Compares - Synology vs QNAP 2024](https://nascompares.com/)
- [Reddit r/synology](https://reddit.com/r/synology)

---

## 📞 Contacto y Soporte

**Responsable técnico:** Desarrollador del proyecto  
**Decisión final de compra:** Doctor  
**Fecha estimada de inicio:** Posterior a compra de NAS

---

**Última actualización:** 28/01/2026  
**Próxima revisión:** Después de seleccionar modelo de NAS
