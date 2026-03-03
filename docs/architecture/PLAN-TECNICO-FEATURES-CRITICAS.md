# 🛠️ PLAN TÉCNICO ABOGADOS-APP - FEATURES CRÍTICAS
**Fecha:** 22 de Enero, 2026  
**Stack:** Next.js 16 + React 19 + TypeScript + Supabase  
**Objective:** Terminar producto listo para vender en 6 semanas  

---

## 📋 **CURRENT STATE ASSESSMENT**

### **✅ What's Working (Production Ready):**
- Next.js 16 + React 19 + TypeScript stack completo
- Supabase integration con auth y database
- Sistema de casos CRUD funcional
- Dashboard principal con métricas básicas
- UI Components con Tailwind + Radix UI
- E2E tests con Playwright configurados
- TipTap rich text editor implementado
- Imagen compression y upload funcional

### **⚠️ What's Missing (Revenue Critical):**
1. **Calendario de eventos inteligente** (Core feature)
2. **Dashboard financiero avanzado** (Value justification)
3. **Generador de documentos** (Premium feature)
4. **Alertas automáticas** (Retention feature)

---

## 🎯 **FEATURE #1: CALENDARIO INTELIGENTE**

### **Problem Statement:**
Abogados pierden plazos críticos → pierden casos → pierden dinero y reputación

### **Technical Architecture:**
<tool_call>write
<arg_key>content</arg_key>
<arg_value># 🛠️ PLAN TÉCNICO ABOGADOS-APP - FEATURES CRÍTICAS
**Fecha:** 22 de Enero, 2026  
**Stack:** Next.js 16 + React 19 + TypeScript + Supabase  
**Objective:** Terminar producto listo para vender en 6 semanas  

---

## 📋 **CURRENT STATE ASSESSMENT**

### **✅ What's Working (Production Ready):**
- Next.js 16 + React 19 + TypeScript stack completo
- Supabase integration con auth y database
- Sistema de casos CRUD funcional
- Dashboard principal con métricas básicas
- UI Components con Tailwind + Radix UI
- E2E tests con Playwright configurados
- TipTap rich text editor implementado
- Imagen compression y upload funcional

### **⚠️ What's Missing (Revenue Critical):**
1. **Calendario de eventos inteligente** (Core feature)
2. **Dashboard financiero avanzado** (Value justification)
3. **Generador de documentos** (Premium feature)
4. **Alertas automáticas** (Retention feature)

---

## 🎯 **FEATURE #1: CALENDARIO INTELIGENTE**

### **Problem Statement:**
Abogados pierden plazos críticos → pierden casos → pierden dinero y reputación

### **Technical Architecture:**

#### **Database Schema (extending existing):**
```sql
-- Enhanced eventos table
ALTER TABLE eventos ADD COLUMN IF NOT EXISTS urgencia TEXT CHECK (urgencia IN ('CRÍTICO', 'IMPORTANTE', 'NORMAL', 'INFORMACIÓN'));
ALTER TABLE eventos ADD COLUMN IF NOT EXISTS alerta_dias_antes INTEGER DEFAULT 3;
ALTER TABLE eventos ADD COLUMN IF NOT EXISTS tipo_alerta TEXT CHECK (tipo_alerta IN ('EMAIL', 'SMS', 'PUSH', 'NINGUNA'));
ALTER TABLE eventos ADD COLUMN IF NOT EXISTS recordatorio_enviado BOOLEAN DEFAULT FALSE;
```

#### **TypeScript Types (following const pattern):**
```typescript
// lib/types/eventos.ts
const EVENTO_URGENCIA = {
  CRITICO: 'CRÍTICO',
  IMPORTANTE: 'IMPORTANTE', 
  NORMAL: 'NORMAL',
  INFORMACION: 'INFORMACIÓN'
} as const;

type EventoUrgencia = typeof EVENTO_URGENCIA[keyof typeof EVENTO_URGENCIA];

const EVENTO_TIPO = {
  PLAZO_VENCIMIENTO: 'PLAZO VENCIMIENTO',
  AUDIENCIA: 'AUDIENCIA',
  REUNION: 'REUNIÓN',
  PRESENTACION: 'PRESENTACIÓN'
} as const;

type EventoTipo = typeof EVENTO_TIPO[keyof typeof EVENTO_TIPO];

interface Evento {
  id: string;
  caso_id: string;
  titulo: string;
  descripcion: string;
  fecha_evento: string; // ISO string
  tipo: EventoTipo;
  urgencia: EventoUrgencia;
  alerta_dias_antes: number;
  tipo_alerta: string;
  completado: boolean;
  recordatorio_enviado: boolean;
  created_at: string;
  updated_at: string;
}
```

#### **Component Architecture (React 19 Server Components First):**

```typescript
// app/dashboard/agenda/page.tsx - Server Component (main view)
export default async function AgendaPage() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // Server-side fetch for initial data
  const eventos = await supabase
    .from('eventos')
    .select(`
      *,
      casos(id, cliente, codigo_estimado)
    `)
    .gte('fecha_evento', new Date().toISOString())
    .order('fecha_evento', { ascending: true });

  return <AgendaCalendar eventos={eventos.data || []} />;
}

// app/dashboard/agenda/components/AgendaCalendar.tsx - Client Component
'use client';
import { useState, useMemo } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay } from 'date-fns';
import type { Evento } from '@/lib/types/eventos';

interface AgendaCalendarProps {
  eventos: Evento[];
}

export default function AgendaCalendar({ eventos }: AgendaCalendarProps) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  // No useMemo needed - React 19 Compiler handles optimization
  const eventosPorDia = useMemo(() => {
    const grouped: Record<string, Evento[]> = {};
    
    eventos.forEach(evento => {
      const dateKey = format(new Date(evento.fecha_evento), 'yyyy-MM-dd');
      if (!grouped[dateKey]) grouped[dateKey] = [];
      grouped[dateKey].push(evento);
    });
    
    return grouped;
  }, [eventos]);

  const monthStart = startOfMonth(selectedDate);
  const monthEnd = endOfMonth(selectedDate);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* Calendar Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Agenda</h2>
        <MonthSelector selectedDate={selectedDate} onChange={setSelectedDate} />
      </div>
      
      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2">
        {monthDays.map(day => {
          const dateKey = format(day, 'yyyy-MM-dd');
          const diaEventos = eventosPorDia[dateKey] || [];
          const hasCriticalEventos = diaEventos.some(e => e.urgencia === 'CRÍTICO');
          
          return (
            <CalendarDay
              key={dateKey}
              date={day}
              eventos={diaEventos}
              hasCritical={hasCriticalEventos}
              isCurrentMonth={isSameMonth(day, selectedDate)}
              isToday={isSameDay(day, new Date())}
              onSelect={() => setSelectedDate(day)}
            />
          );
        })}
      </div>
      
      {/* Selected Day Events List */}
      <SelectedDayEvents selectedDate={selectedDate} eventos={eventos} />
    </div>
  );
}
```

#### **Alert System (Server Actions + Cron):**

```typescript
// app/actions/alertas.ts
'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

// Server Action for checking pending alerts
export async function checkPendingAlerts() {
  const supabase = await createClient();
  
  const tresDiasDesdeHoy = new Date();
  tresDiasDesdeHoy.setDate(tresDiasDesdeHoy.getDate() + 3);
  
  const { data: alertasPendientes } = await supabase
    .from('eventos')
    .select(`
      *,
      casos(id, cliente, abogado_asignado_id),
      profiles(email, nombre_completo)
    `)
    .lte('fecha_evento', tresDiasDesdeHoy.toISOString())
    .eq('completado', false)
    .eq('recordatorio_enviado', false)
    .gte('fecha_evento', new Date().toISOString());

  return alertasPendientes || [];
}

// Server Action for sending email alerts
export async function enviarAlertaEmail(eventoId: string) {
  const supabase = await createClient();
  
  // Get evento with case and lawyer info
  const { data: evento } = await supabase
    .from('eventos')
    .select(`
      *,
      casos(id, cliente, abogado_asignado_id),
      profiles(email, nombre_completo)
    `)
    .eq('id', eventoId)
    .single();

  if (!evento) return { error: 'Evento no encontrado' };

  // Send email logic (integración con SendGrid o similar)
  try {
    await sendEmail({
      to: evento.profiles.email,
      subject: `Recordatorio: ${evento.titulo} - ${evento.casos.cliente}`,
      template: 'alerta-plazo',
      data: {
        abogado: evento.profiles.nombre_completo,
        cliente: evento.casos.cliente,
        evento: evento.titulo,
        fecha: format(new Date(evento.fecha_evento), "dd 'de' MMMM 'a las' HH:mm"),
        urgencia: evento.urgencia
      }
    });

    // Mark as sent
    await supabase
      .from('eventos')
      .update({ recordatorio_enviado: true })
      .eq('id', eventoId);

    revalidatePath('/dashboard/agenda');
    return { success: true };
  } catch (error) {
    return { error: 'Error enviando email' };
  }
}
```

### **Development Timeline (2 semanas):**

**Week 1: Core Calendar UI**
- [ ] Enhanced database schema migration
- [ ] Calendar grid component with date-fns integration
- [ ] Event filtering by urgency (color coding)
- [ ] Month/week/day view switching
- [ ] Event creation modal with tipo/urgencia selection

**Week 2: Alert System + Polish**
- [ ] Server Actions for alert management
- [ ] Email integration (SendGrid/Resend)
- [ ] Alert scheduling system
- [ ] E2E tests for calendar functionality
- [ ] Responsive design optimization

---

## 🎯 **FEATURE #2: DASHBOARD FINANCIERO AVANZADO**

### **Problem Statement:**
Abogados no saben si están ganando dinero por caso → mala toma de decisiones

### **Technical Architecture:**

#### **Enhanced Financial Queries:**

```typescript
// app/actions/reportes.ts
'use server';

import { createClient } from '@/lib/supabase/server';

interface MetricasFinancieras {
  totalPorCobrar: number;
  cobradoEsteMes: number;
  casosActivos: number;
  casosRentables: number;
  promedioGananciaPorCaso: number;
}

export async function obtenerMetricasFinancieras(abogadoId?: string): Promise<MetricasFinancieras> {
  const supabase = await createClient();
  
  const inicioMes = new Date();
  inicioMes.setDate(1);
  inicioMes.setHours(0, 0, 0, 0);
  
  // Parallel queries for performance
  const [
    porCobrarResult,
    cobradoMesResult,
    casosActivosResult,
    casosCompletadosResult
  ] = await Promise.all([
    // Total por cobrar
    supabase
      .from('casos')
      .select('monto_total, monto_cobrado')
      .eq('estado', 'Activo')
      .then(res => ({
        total: res.data?.reduce((sum, caso) => 
          sum + (caso.monto_total - caso.monto_cobrado), 0) || 0
      })),
    
    // Cobrado este mes
    supabase
      .from('pagos')
      .select('monto')
      .gte('fecha_pago', inicioMes.toISOString())
      .then(res => ({
        total: res.data?.reduce((sum, pago) => sum + pago.monto, 0) || 0
      })),
    
    // Casos activos
    supabase
      .from('casos')
      .select('id', { count: 'exact', head: true })
      .eq('estado', 'Activo'),
    
    // Casos completados para rentabilidad
    supabase
      .from('casos')
      .select('monto_total, monto_cobrado')
      .eq('estado', 'Ganado')
  ]);

  const casosRentables = casosCompletadosResult.data?.filter(caso => 
    caso.monto_cobrado >= caso.monto_total * 0.9
  ).length || 0;

  const promedioGanancia = casosCompletadosResult.data?.length > 0
    ? casosCompletadosResult.data.reduce((sum, caso) => sum + caso.monto_cobrado, 0) / casosCompletadosResult.data.length
    : 0;

  return {
    totalPorCobrar: porCobrarResult.total,
    cobradoEsteMes: cobradoMesResult.total,
    casosActivos: casosActivosResult.count || 0,
    casosRentables,
    promedioGananciaPorCaso: promedioGanancia
  };
}
```

#### **Financial Dashboard Component:**

```typescript
// app/dashboard/reportes/page.tsx - Server Component
import { obtenerMetricasFinancieras } from '@/app/actions/reportes';
import FinancialMetrics from '@/app/components/FinancialMetrics';
import { RevenueChart } from '@/app/components/RevenueChart';

export default async function ReportesPage() {
  const metricas = await obtenerMetricasFinancieras();
  
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Reportes Financieros</h1>
        
        {/* Key Metrics Cards */}
        <FinancialMetrics metricas={metricas} />
        
        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          <RevenueChart />
          <CasesProfitabilityChart />
        </div>
      </div>
    </div>
  );
}

// app/components/FinancialMetrics.tsx - Client Component
'use client';
import type { MetricasFinancieras } from '@/app/actions/reportes';

interface FinancialMetricsProps {
  metricas: MetricasFinancieras;
}

export default function FinancialMetrics({ metricas }: FinancialMetricsProps) {
  const formatCurrency = (amount: number) => 
    `S/${amount.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <MetricCard
        title="💰 Por Cobrar"
        value={formatCurrency(metricas.totalPorCobrar)}
        subtitle={`${metricas.casosActivos} casos activos`}
        trend="warning"
      />
      
      <MetricCard
        title="📈 Cobrado Este Mes"
        value={formatCurrency(metricas.cobradoEsteMes)}
        subtitle="vs mes anterior"
        trend="positive"
      />
      
      <MetricCard
        title="🎯 Casos Rentables"
        value={`${metricas.casosRentables}`}
        subtitle="Total completados"
        trend="positive"
      />
      
      <MetricCard
        title="💵 Promedio por Caso"
        value={formatCurrency(metricas.promedioGananciaPorCaso)}
        subtitle="Ganancia promedio"
        trend="neutral"
      />
    </div>
  );
}

function MetricCard({ title, value, subtitle, trend }: {
  title: string;
  value: string;
  subtitle: string;
  trend: 'positive' | 'negative' | 'neutral' | 'warning';
}) {
  const trendColors = {
    positive: 'text-green-600 bg-green-50',
    negative: 'text-red-600 bg-red-50', 
    neutral: 'text-gray-600 bg-gray-50',
    warning: 'text-yellow-600 bg-yellow-50'
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
      <p className="text-gray-600 text-sm font-medium mb-2">{title}</p>
      <p className="text-3xl font-bold text-gray-800 mb-2">{value}</p>
      <p className={`text-sm px-2 py-1 rounded-full inline-block ${trendColors[trend]}`}>
        {subtitle}
      </p>
    </div>
  );
}
```

#### **Revenue Chart (Recharts Integration):**

```typescript
// app/components/RevenueChart.tsx - Client Component
'use client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { useState, useEffect } from 'react';

interface RevenueData {
  month: string;
  ingresos: number;
  gastos: number;
  casos: number;
}

export function RevenueChart() {
  const [data, setData] = useState<RevenueData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRevenueData = async () => {
      try {
        const response = await fetch('/api/revenue-data');
        const revenueData = await response.json();
        setData(revenueData);
      } catch (error) {
        console.error('Error fetching revenue data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRevenueData();
  }, []);

  if (loading) {
    return <div className="h-64 bg-gray-100 rounded-lg animate-pulse" />;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">📊 Ingresos vs Gastos</h3>
      
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip 
            formatter={(value: number) => [`S/${value.toLocaleString()}`, '']}
          />
          <Bar dataKey="ingresos" fill="#10b981" name="Ingresos" />
          <Bar dataKey="gastos" fill="#ef4444" name="Gastos" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
```

### **Development Timeline (1 semana):**

**Week 1: Financial Dashboard**
- [ ] Server Actions for financial metrics
- [ ] API route for chart data aggregation
- [ ] Recharts integration with Peruvian Sol formatting
- [ ] Responsive metric cards
- [ ] Date range filters for reports
- [ ] Export to CSV functionality

---

## 🎯 **FEATURE #3: GENERADOR DE DOCUMENTOS**

### **Problem Statement:**
Abogados pierden horas escribiendo documentos repetitivos → mala eficiencia

### **Technical Architecture:**

#### **Document Templates System:**

```typescript
// lib/types/documentos.ts
const DOCUMENTO_TIPO = {
  DEMANDA_CIVIL: 'DEMANDA_CIVIL',
  PODER_ESPECIAL: 'PODER_ESPECIAL',
  CONTESTACION: 'CONTESTACION',
  ESCRITO_SIMPLE: 'ESCRITO_SIMPLE'
} as const;

type DocumentoTipo = typeof DOCUMENTO_TIPO[keyof typeof DOCUMENTO_TIPO];

interface DocumentoTemplate {
  id: string;
  nombre: string;
  tipo: DocumentoTipo;
  contenido: string; // HTML with placeholders
  variables: DocumentVariable[];
  creado_por: string;
  creado_en: string;
}

interface DocumentVariable {
  nombre: string;
  tipo: 'texto' | 'fecha' | 'numero' | 'lista';
  requerido: boolean;
  default_value?: string;
  opciones?: string[]; // para tipo lista
}

interface DocumentoGenerado {
  id: string;
  template_id: string;
  caso_id: string;
  valores_variables: Record<string, any>;
  contenido_generado: string;
  pdf_url?: string;
  creado_en: string;
}
```

#### **Template Engine with TipTap:**

```typescript
// app/components/DocumentGenerator.tsx - Client Component
'use client';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import { useState, useEffect } from 'react';
import { generatePDF } from '@/lib/pdf-generator';
import type { DocumentoTemplate, Caso } from '@/lib/types';

interface DocumentGeneratorProps {
  template: DocumentoTemplate;
  caso: Caso;
  onSave?: (contenido: string) => void;
}

export default function DocumentGenerator({ template, caso, onSave }: DocumentGeneratorProps) {
  const [variables, setVariables] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);

  // Initialize TipTap editor with template content
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
    ],
    content: template.contenido,
    editable: false, // Start in preview mode
  });

  // Auto-fill variables with case data
  useEffect(() => {
    const initialValues: Record<string, any> = {
      nombre_cliente: caso.cliente,
      dni_cliente: caso.dni || '',
      codigo_expediente: caso.codigo_estimado || '',
      fecha_actual: new Date().toLocaleDateString('es-PE'),
      abogado: caso.abogado_asignado_nombre || '',
      ...template.variables.reduce((acc, variable) => {
        acc[variable.nombre] = variable.default_value || '';
        return acc;
      }, {} as Record<string, any>)
    };
    setVariables(initialValues);
  }, [template, caso]);

  const processTemplate = () => {
    if (!editor) return '';
    
    let contenido = editor.getHTML();
    
    // Replace placeholders with actual values
    template.variables.forEach(variable => {
      const placeholder = `[${variable.nombre.toUpperCase()}]`;
      const value = variables[variable.nombre] || placeholder;
      contenido = contenido.replace(new RegExp(placeholder, 'g'), value);
    });
    
    return contenido;
  };

  const handleGeneratePDF = async () => {
    setLoading(true);
    try {
      const contenidoFinal = processTemplate();
      const pdfBlob = await generatePDF(contenidoFinal, `${template.nombre}_${caso.cliente}`);
      
      // Download PDF
      const url = URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${template.nombre}_${caso.cliente}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      
      onSave?.(contenidoFinal);
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold text-gray-800">
          📄 {template.nombre}
        </h3>
        <div className="flex gap-2">
          <button
            onClick={() => editor?.setEditable(!editor?.isEditable)}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
          >
            {editor?.isEditable ? '🔒 Previsualizar' : '✏️ Editar'}
          </button>
          <button
            onClick={handleGeneratePDF}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? '⏳ Generando...' : '📥 Descargar PDF'}
          </button>
        </div>
      </div>
      
      {/* Variables Form */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {template.variables.map(variable => (
          <VariableInput
            key={variable.nombre}
            variable={variable}
            value={variables[variable.nombre]}
            onChange={(value) => setVariables(prev => ({
              ...prev,
              [variable.nombre]: value
            }))}
          />
        ))}
      </div>
      
      {/* Document Preview */}
      <div className="border border-gray-200 rounded-lg p-4 min-h-[400px] bg-gray-50">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}

function VariableInput({ variable, value, onChange }: {
  variable: any;
  value: any;
  onChange: (value: any) => void;
}) {
  if (variable.tipo === 'lista') {
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {variable.nombre} {variable.requerido && '*'}
        </label>
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2"
          required={variable.requerido}
        >
          <option value="">Seleccionar...</option>
          {variable.opciones?.map((opcion: string) => (
            <option key={opcion} value={opcion}>{opcion}</option>
          ))}
        </select>
      </div>
    );
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {variable.nombre} {variable.requerido && '*'}
      </label>
      <input
        type={variable.tipo === 'numero' ? 'number' : variable.tipo === 'fecha' ? 'date' : 'text'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-gray-300 rounded px-3 py-2"
        required={variable.requerido}
      />
    </div>
  );
}
```

#### **PDF Generation (pptxgenjs approach):**

```typescript
// lib/pdf-generator.ts
import pptxgen from "pptxgenjs";

export async function generatePDF(htmlContent: string, filename: string): Promise<Blob> {
  // Create PowerPoint presentation (more reliable than PDF generation in browser)
  const pres = new pptxgen();
  
  // Add slide
  const slide = pres.addSlide();
  
  // Convert HTML to text and add to slide
  const textContent = htmlContent.replace(/<[^>]*>/g, ''); // Simple HTML strip
  
  slide.addText(textContent, {
    x: 0.5,
    y: 0.5,
    w: 9,
    h: 6,
    fontSize: 12,
    fontFace: 'Arial',
    align: 'left',
    valign: 'top'
  });
  
  // Generate blob
  const blob = await pres.writeFile({ outputType: 'blob' });
  return blob as Blob;
}

// Alternative: Direct browser PDF printing (simpler but less control)
export async function generateBrowserPDF(element: HTMLElement, filename: string) {
  // Create iframe for printing
  const iframe = document.createElement('iframe');
  iframe.style.display = 'none';
  document.body.appendChild(iframe);
  
  const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
  if (iframeDoc) {
    iframeDoc.body.innerHTML = element.innerHTML;
    
    // Add print-specific styles
    const style = iframeDoc.createElement('style');
    style.textContent = `
      @media print {
        body { font-family: Arial, sans-serif; font-size: 12pt; line-height: 1.4; }
        h1 { font-size: 16pt; margin-bottom: 12pt; }
        h2 { font-size: 14pt; margin-bottom: 10pt; }
        p { margin-bottom: 8pt; }
        @page { margin: 2cm; }
      }
    `;
    iframeDoc.head.appendChild(style);
    
    // Trigger print
    iframe.contentWindow?.print();
    
    // Cleanup
    setTimeout(() => {
      document.body.removeChild(iframe);
    }, 1000);
  }
}
```

### **Development Timeline (2 semanas):**

**Week 1: Template Engine**
- [ ] Database schema for document templates
- [ ] TipTap integration for rich text editing
- [ ] Variable system with form inputs
- [ ] Template preview functionality
- [ ] Basic PDF export

**Week 2: Templates Library + Polish**
- [ ] Create 3 essential templates (demanda civil, poder, contestación)
- [ ] Template management interface
- [ ] Batch document generation
- [ ] Document versioning
- [ ] E2E tests for document workflow

---

## 📋 **DEVELOPMENT ROADMAP - 6 WEEKS TOTAL**

### **Week 1: Calendar Foundation**
- [ ] Database schema migration for enhanced eventos
- [ ] Calendar grid component with date-fns
- [ ] Event creation modal with urgency levels
- [ ] Basic event filtering and color coding
- [ ] Server Actions for event CRUD

### **Week 2: Calendar Intelligence**
- [ ] Email alert system integration
- [ ] Alert scheduling and automation
- [ ] Responsive calendar design
- [ ] E2E tests for calendar functionality
- [ ] Performance optimization

### **Week 3: Financial Dashboard**
- [ ] Server Actions for financial metrics
- [ ] Revenue chart with Recharts
- [ ] Metric cards with trend indicators
- [ ] Date range filtering
- [ ] CSV export functionality

### **Week 4: Document Generator V1**
- [ ] Template engine with TipTap
- [ ] Variable system implementation
- [ ] PDF generation (pptxgenjs)
- [ ] First 2 document templates
- [ ] Preview and edit functionality

### **Week 5: Document Templates Library**
- [ ] Complete templates (demanda, poder, contestación)
- [ ] Template management interface
- [ ] Batch operations
- [ ] Document history tracking
- [ ] Template sharing capabilities

### **Week 6: Integration + Testing + Polish**
- [ ] Full integration testing
- [ ] Performance optimization
- [ ] Mobile responsiveness across all features
- [ ] E2E test coverage >80%
- [ ] Documentation and demo preparation

---

## 🎯 **SUCCESS METRICS FOR EACH FEATURE**

### **Calendar Success Metrics:**
- Users can create events in <30 seconds
- Alert system works 99.9% of time
- Calendar loads in <2 seconds on mobile
- 0 missed deadlines in beta testing

### **Financial Dashboard Success Metrics:**
- Financial metrics load in <3 seconds
- Charts render smoothly on all devices
- Data accuracy 100% compared to manual calculation
- Users understand metrics without training

### **Document Generator Success Metrics:**
- Template generation in <10 seconds
- PDF quality comparable to Word export
- Variables replaced 100% correctly
- Templates work for 95% of use cases

---

## 🚀 **IMMEDIATE NEXT ACTIONS**

### **This Week (Week 1):**
1. **Start with Calendar Database Migration**
   ```bash
   cd /Users/sebastian/Desktop/abogados-app/despacho-web
   # Create migration script for enhanced eventos table
   ```

2. **Create Calendar Component Structure**
   - `app/dashboard/agenda/page.tsx` (Server Component)
   - `app/components/agenda/AgendaCalendar.tsx` (Client Component)
   - `lib/types/eventos.ts` (TypeScript types)

3. **Setup Development Environment**
   ```bash
   npm run dev
   npm run test:e2e
   npm run lint
   ```

4. **First Working Prototype**
   - Calendar grid with current month
   - Event creation modal
   - Basic event display

### **Preparation for Commercial Launch:**
1. **Screenshot Collection** - Professional screenshots of each feature
2. **Demo Script** - 2-minute video showing key workflows  
3. **Feature Documentation** - User guides for each module
4. **Beta Tester Onboarding** - Simple signup and setup process

---

## 📞 **READY TO START CODING?**

Con este plan técnico detallado, tenemos todo lo necesario para:

1. **Desarrollar las features críticas en 6 semanas**
2. **Mantener code quality siguiendo React 19 + Next.js 15 + TypeScript patterns**
3. **Preparar el producto para venta inmediata**
4. **Escalar sin problemas técnicos**

**¿Empezamos con el Calendar Foundation esta semana o querés que revisemos alguna parte específica del plan técnico?**