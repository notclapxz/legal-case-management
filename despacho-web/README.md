# 🚀 Sistema de Gestión para Despacho de Abogados

Sistema web moderno para gestionar ~250 casos legales con dashboard de alertas, proyecciones financieras, búsqueda de expedientes y organización mediante carpetas jerárquicas.

## 🎯 Características Principales

- ✅ **Dashboard Ejecutivo** con métricas financieras en tiempo real
- ✅ **Sistema de Alertas** con colores (rojo/naranja/amarillo)
- ✅ **Buscador Flotante** con búsqueda fuzzy instantánea
- ✅ **Carpetas Jerárquicas** con Drag & Drop (casos + subcarpetas)
- ✅ **Notas Estilo Apple** con exportación a PowerPoint para audiencias
- ✅ **Agenda Personal** con editor rich text y auto-guardado
- ✅ **Responsive Tablet** optimizado para Samsung Android
- ✅ **Microinteracciones** con Framer Motion
- ✅ **Queries Optimizadas** para máxima performance

## 📋 Requisitos

- Node.js 18+
- Supabase (PostgreSQL)
- Next.js 14

## 🚀 Instalación

1. **Clonar el proyecto:**
```bash
cd "despacho-web"
```

2. **Configurar variables de entorno en `.env.local`:**
```env
NEXT_PUBLIC_SUPABASE_URL=tu-url-de-supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key-de-supabase
```

3. **Configurar base de datos:**
   - Ejecutar `MIGRACION.sql` en Supabase SQL Editor
   - Crear usuarios de prueba según documentación

4. **Instalar dependencias:**
```bash
npm install
```

5. **Iniciar desarrollo:**
```bash
npm run dev
```

6. **Abrir en navegador:**
   - URL: http://localhost:3000
   - Usuario: admin@despacho.test
   - Password: admin123

## 📁 Estructura del Proyecto

```
despacho-web/
├── app/
│   ├── dashboard/
│   │   ├── components/          # Componentes reutilizables
│   │   ├── casos/
│   │   │   ├── components/      # Carpetas, tablas, drag & drop
│   │   │   └── [id]/notas/      # Sistema de notas estilo Apple
│   │   └── agenda/              # Agenda personal con rich text editor
│   ├── components/              # Componentes compartidos
│   │   ├── ModalConfirmacion.tsx
│   │   └── casos/MetodoPagoForm.tsx
│   └── api/                     # API Routes (auth, notas)
├── lib/
│   ├── types/database.ts        # Interfaces TypeScript
│   ├── validaciones/            # Lógica de negocio
│   ├── utils/                   # Helpers (fechas, errores)
│   └── supabase/                # Cliente Supabase (client/server)
├── public/images/               # Assets (logos, fotos perfil)
├── AGENTS.md                    # Guía para agentes IA (447 líneas)
├── MIGRACION.sql                # Migración inicial BD
└── README.md                    # Este archivo
```

## 🎨 Stack Tecnológico

- **Frontend**: Next.js 16.1.2 + React 19 + TypeScript (strict mode)
- **UI**: Tailwind CSS 3.4 + Framer Motion + Lucide Icons + Radix UI
- **Rich Text**: TipTap (editor WYSIWYG con tareas y listas)
- **Drag & Drop**: @dnd-kit/core + @dnd-kit/sortable
- **Exportación**: pptxgenjs (PowerPoint generation)
- **Backend**: Supabase (PostgreSQL + Auth + RLS)
- **Performance**: Queries optimizadas + índices GIN + Turbopack

## 🚀 Comandos Útiles

```bash
npm run dev      # Iniciar servidor de desarrollo
npm run build    # Compilar para producción
npm run start    # Iniciar servidor de producción
npm run lint     # Verificar código con ESLint
```

## 📱 Acceso al Sistema

- **URL**: http://localhost:3000
- **Default Login**:
  - Email: admin@despacho.test
  - Password: admin123

## 🔧 Personalización

El sistema está optimizado para tablets Samsung con:
- Breakpoints específicos (768px-1200px)
- Touch targets de 48px mínimo
- Sidebar colapsable automático
- Búsqueda flotante con atajos

## 📊 Features Destacadas

### Dashboard Ejecutivo
- **Alertas Críticas**: Eventos del día y próximos 3 días
- **Métricas en Tiempo Real**: Casos activos, eventos próximos
- **Búsqueda Instantánea**: Fuzzy search en código, cliente, expediente
- **Responsive Design**: Optimizado para tablet y móvil

### Sistema de Carpetas
- **Organización Jerárquica**: Carpetas y subcarpetas ilimitadas
- **Drag & Drop**: Arrastrar casos a carpetas, carpetas a otras carpetas
- **Menú Contextual**: Editar, eliminar, reordenar (↑ ↓)
- **Validaciones Anti-Loop**: Previene ciclos infinitos

### Notas Profesionales
- **Editor Estilo Apple Notes**: Split panel (sidebar + editor)
- **Categorización**: General, Evidencia, Alegatos, Testigos
- **Prioridades**: Alta/Media/Baja con colores
- **Exportar a PowerPoint**: Presentaciones para audiencias judiciales
  - Portada automática (código, cliente, fecha)
  - Índice de notas
  - Una nota por slide (categoría + prioridad + contenido)

### Agenda Personal
- **Editor Rich Text**: TipTap con formato, listas y tareas
- **Auto-guardado**: Cada 1 segundo sin perder foco
- **Tareas con Checkboxes**: ☐/☑ con tachado automático
- **Vista Mensual**: Calendario + lista de días + editor
- **Previews Inteligentes**: Máximo 2 líneas, expandibles con tooltip
- **Responsive Tablet**: Vista apilada con navegación secuencial
- **Persistencia Total**: Contenido se mantiene al cambiar de día

## 🤝 Contribuir

1. Fork del proyecto
2. Crear feature branch
3. Commit de cambios
4. Push al branch
5. Abrir Pull Request

## 📄 Licencia

Proyecto privado para uso exclusivo del despacho legal.

---

## 🆕 Últimas Actualizaciones

### v2.2.0 (26 Enero 2026)
- ✅ **Agenda Personal completa** con editor rich text (TipTap)
- ✅ **Auto-guardado inteligente** cada 1s sin perder foco
- ✅ **Tareas con checkboxes** interactivos (☐/☑)
- ✅ **Previews limpios** sin HTML crudo, con tachado
- ✅ **Tooltip expandible** para ver todas las líneas
- ✅ **Update en tiempo real** del preview mientras escribís
- ✅ **Diseño responsive** para tablets Samsung (< 1024px)
- ✅ **8/8 tests E2E pasando** con Playwright
- 📄 Ver detalles en `docs/CHANGELOG-AGENDA.md`

### v2.1.0 (21 Enero 2026)
- ✅ Sistema de carpetas jerárquicas con drag & drop
- ✅ Exportación de notas a PowerPoint
- ✅ Menú contextual en carpetas (editar, eliminar, reordenar)
- ✅ Modal de confirmación reutilizable
- ✅ Mejoras en tabla de casos (columna "Patrocinado")

### v2.0.0 (20 Enero 2026)
- ✅ Refactoring completo (centralización de tipos y validaciones)
- ✅ Sistema de notas estilo Apple Notes
- ✅ Mejoras en performance y type safety
- ✅ Documentación completa para agentes IA (AGENTS.md)

---

*Última actualización: 26 Enero, 2026*
