# Investigación y Selección de NAS

**Fecha:** 28 de enero de 2026  
**Estado:** 🔍 En investigación  
**Decisión final:** Pendiente (Doctor)

---

## 🎯 Requisitos del Sistema

### Requisitos Funcionales

- ✅ Almacenar 2TB+ de archivos PDF
- ✅ RAID 1 (espejo automático para protección)
- ✅ Acceso desde tablet Samsung (Android) + PC (Windows/Mac)
- ✅ API REST o WebDAV para integración con app web
- ✅ Streaming de archivos (no descargas completas)
- ✅ Red Gigabit (1000 Mbps)
- ✅ Escalable (agregar espacio en el futuro)

### Requisitos No Funcionales

- ✅ Fácil de configurar (no requiere expertise técnico avanzado)
- ✅ Interfaz web intuitiva
- ✅ Documentación en español (deseable)
- ✅ Soporte técnico disponible
- ✅ Bajo consumo eléctrico (24/7)
- ✅ Silencioso (para oficina)

---

## 🏆 Comparación de Marcas

### 1. Synology (Recomendado)

**Ventajas:**
- ✅ **Mejor software del mercado** (DSM - DiskStation Manager)
- ✅ Interfaz super intuitiva (como usar Windows)
- ✅ APIs muy bien documentadas
- ✅ Apps para Android/iOS excelentes
- ✅ Comunidad enorme (foros, tutoriales en español)
- ✅ Actualizaciones frecuentes
- ✅ Synology Drive (como Dropbox personal)

**Desventajas:**
- ❌ Precio más alto que competencia
- ⚠️ Hardware a veces menos potente (pero suficiente)

**Modelos Recomendados:**

| Modelo | Precio (USD) | CPU | RAM | Bahías | Recomendación |
|--------|--------------|-----|-----|--------|---------------|
| **DS220+** | 280-320 | Intel Celeron J4025 | 2GB (expandible 6GB) | 2 | ⭐⭐⭐⭐⭐ IDEAL |
| **DS223** | 250-290 | Realtek RTD1619B | 2GB | 2 | ⭐⭐⭐⭐ Bueno (más nuevo) |
| DS220j | 180-220 | Realtek RTD1296 | 512MB | 2 | ⭐⭐⭐ Entrada (limitado) |

**👍 Recomendación: Synology DS220+ o DS223**

---

### 2. QNAP

**Ventajas:**
- ✅ Hardware más potente por el mismo precio
- ✅ Muchas features avanzadas
- ✅ Soporte para virtualización (si necesitan después)
- ✅ Puertos HDMI (puede conectarse a TV)

**Desventajas:**
- ❌ Interfaz más compleja (curva de aprendizaje)
- ❌ Historial de vulnerabilidades de seguridad (2019-2022)
- ⚠️ Software menos pulido que Synology

**Modelos Recomendados:**

| Modelo | Precio (USD) | CPU | RAM | Bahías | Recomendación |
|--------|--------------|-----|-----|--------|---------------|
| TS-253E | 350-400 | Intel Celeron J6412 | 8GB | 2 | ⭐⭐⭐⭐ Potente |
| TS-233 | 220-270 | ARM Cortex-A55 | 2GB | 2 | ⭐⭐⭐ Básico |

**👍 Recomendación: QNAP TS-253E (si quieren más potencia)**

---

### 3. TerraMaster

**Ventajas:**
- ✅ **Más económico** (30-40% menos que Synology)
- ✅ Hardware decente
- ✅ Silencioso

**Desventajas:**
- ❌ Software inferior (TOS - TerraMaster OS)
- ❌ Comunidad pequeña (menos soporte)
- ❌ APIs menos documentadas
- ⚠️ Marca menos conocida

**Modelos Recomendados:**

| Modelo | Precio (USD) | CPU | RAM | Bahías | Recomendación |
|--------|--------------|-----|-----|--------|---------------|
| F2-423 | 230-280 | Intel Celeron N5105 | 4GB | 2 | ⭐⭐⭐ Alternativa económica |

**👍 Recomendación: Solo si presupuesto es MUY ajustado**

---

### 4. Asustor

**Ventajas:**
- ✅ Balance entre Synology y QNAP
- ✅ Buen hardware
- ✅ Precio competitivo

**Desventajas:**
- ⚠️ Menos conocido en Latinoamérica
- ⚠️ Menor disponibilidad de stock

**Modelos Recomendados:**

| Modelo | Precio (USD) | CPU | RAM | Bahías | Recomendación |
|--------|--------------|-----|-----|--------|---------------|
| AS5202T | 280-330 | Intel Celeron J4005 | 2GB | 2 | ⭐⭐⭐⭐ Buena opción |

---

## 💾 Discos Duros (Crítico)

### ⚠️ NO usar discos normales de PC

**Discos para NAS vs Discos de PC:**
- ✅ NAS: Diseñados para 24/7, RAID, vibración
- ❌ PC: Solo 8 horas/día, fallan rápido en NAS

### Marcas y Modelos Recomendados

#### 1. Western Digital Red Plus (Recomendado)

**Serie WD Red Plus:**
- ✅ **Mejor opción calidad/precio**
- ✅ Optimizado para NAS (CMR, no SMR)
- ✅ Garantía 3 años
- ✅ 1 millón de horas MTBF

| Capacidad | Precio (USD) | Recomendación |
|-----------|--------------|---------------|
| **4TB (WD40EFPX)** | 100-120 | ⭐⭐⭐⭐⭐ IDEAL |
| 6TB (WD60EFPX) | 140-160 | ⭐⭐⭐⭐ Si necesitan más |
| 8TB (WD80EFPX) | 180-220 | ⭐⭐⭐ Futuro |

**👍 Recomendación: 2x WD Red Plus 4TB**

---

#### 2. Seagate IronWolf

**Serie IronWolf:**
- ✅ Competidor directo de WD Red
- ✅ Incluye IronWolf Health Management
- ✅ Garantía 3 años

| Capacidad | Precio (USD) | Recomendación |
|-----------|--------------|---------------|
| **4TB (ST4000VN006)** | 95-115 | ⭐⭐⭐⭐⭐ Alternativa a WD |
| 6TB (ST6000VN006) | 135-155 | ⭐⭐⭐⭐ |

**👍 Recomendación: Igual de bueno que WD Red Plus**

---

#### 3. Toshiba N300 (Alternativa)

**Serie N300:**
- ✅ Más económico
- ⚠️ Menos conocido

| Capacidad | Precio (USD) | Recomendación |
|-----------|--------------|---------------|
| 4TB (HDWG440) | 85-105 | ⭐⭐⭐ Económico |

---

### ❌ Discos a EVITAR

- ❌ **WD Blue/Green:** Para PC, no para NAS
- ❌ **Seagate Barracuda:** Para PC, no para NAS
- ❌ **SMR (Shingled Magnetic Recording):** Lentos en RAID
- ❌ **Discos usados/reacondicionados:** Riesgo alto

---

## 💰 Opciones por Presupuesto

### OPCIÓN A: Presupuesto Ajustado (~USD 400-450)

**Recomendación:**
- NAS: Synology DS220j (USD 180-220)
- Discos: 2x WD Red Plus 4TB (USD 200-240)
- **Total: USD 380-460**

**Pros:**
- ✅ Más económico
- ✅ Synology (mejor software)

**Contras:**
- ⚠️ DS220j tiene CPU débil (más lento con archivos grandes)
- ⚠️ Solo 512MB RAM (no expandible)

---

### OPCIÓN B: Balance Ideal (~USD 500-560) ⭐ RECOMENDADA

**Recomendación:**
- NAS: **Synology DS220+** (USD 280-320)
- Discos: **2x WD Red Plus 4TB** (USD 200-240)
- **Total: USD 480-560**

**Pros:**
- ✅ **Mejor relación calidad/precio**
- ✅ CPU Intel (rápido con PDFs grandes)
- ✅ 2GB RAM expandible a 6GB
- ✅ Transcodificación de archivos
- ✅ Durará 5-7 años sin problemas

**Contras:**
- ⚠️ USD 100 más que Opción A

**👍 ESTA ES LA MEJOR OPCIÓN**

---

### OPCIÓN C: Máxima Capacidad (~USD 600-700)

**Recomendación:**
- NAS: Synology DS220+ (USD 280-320)
- Discos: 2x WD Red Plus 6TB (USD 280-320)
- **Total: USD 560-640**

**Pros:**
- ✅ Más espacio (6TB útiles)
- ✅ No necesitarán expandir por años

**Contras:**
- ⚠️ USD 100+ más caro
- ⚠️ Actualmente solo usan 2TB (sobra mucho)

---

### OPCIÓN D: Máxima Potencia (~USD 550-640)

**Recomendación:**
- NAS: QNAP TS-253E (USD 350-400)
- Discos: 2x WD Red Plus 4TB (USD 200-240)
- **Total: USD 550-640**

**Pros:**
- ✅ CPU más potente (Intel J6412)
- ✅ 8GB RAM (overkill pero bien)
- ✅ Más rápido para tareas pesadas

**Contras:**
- ⚠️ Software menos intuitivo que Synology
- ⚠️ Más complejo de configurar

---

## 🛒 ¿Dónde Comprar? (Argentina)

### Online

1. **MercadoLibre Argentina**
   - ✅ Más opciones
   - ✅ Envío rápido
   - ⚠️ Verificar reputación del vendedor
   - 🔗 mercadolibre.com.ar

2. **Tiendas especializadas:**
   - **Gezatek** (gezatek.com.ar) - Especialistas en NAS
   - **Compugarden** (compugarden.com.ar)
   - **Mexx** (mexx.com.ar)

3. **Amazon (importación)**
   - ⚠️ Impuestos de importación (50%+)
   - ⚠️ Demora (2-4 semanas)
   - ❌ No recomendado a menos que no haya stock local

### Físico (CABA)

- **Av. Corrientes** (Galería Jardín, etc.)
- **Parque Patricios** (mayoristas)

---

## 📋 Checklist de Compra

Antes de comprar, verificar:

- [ ] **NAS tiene 2 bahías mínimo** (para RAID 1)
- [ ] **CPU:** Intel Celeron o superior (NO ARM básico)
- [ ] **RAM:** 2GB mínimo
- [ ] **Red:** Gigabit Ethernet (1000 Mbps)
- [ ] **Discos:** WD Red Plus o Seagate IronWolf (NO discos de PC)
- [ ] **Capacidad:** 4TB x2 = 4TB útiles en RAID 1
- [ ] **Garantía:** Al menos 1 año (NAS) y 3 años (discos)
- [ ] **Incluye:** Cables de red, tornillos, fuente de poder

---

## ⚙️ Configuración Inicial (Post-Compra)

### Paso 1: Instalación Física

1. Abrir NAS (sin tornillos, bandejas extraíbles)
2. Insertar discos en bandejas
3. Colocar bandejas en el NAS
4. Conectar cable de red (al router)
5. Conectar cable de poder
6. Encender

### Paso 2: Setup de Software

**Synology DSM:**
1. Ir a `http://find.synology.com` desde PC en misma red
2. Instalar DSM (sistema operativo del NAS)
3. Crear cuenta de administrador
4. Configurar RAID 1 (espejo):
   - Ir a "Administrador de almacenamiento"
   - Crear grupo de discos → RAID 1
   - Crear volumen
5. Crear carpeta compartida `/Casos`
6. Activar servicios:
   - File Station (explorador de archivos web)
   - WebDAV (para apps)
   - SMB/CIFS (compartir archivos)
7. Configurar IP fija (ej: 192.168.1.100)
8. Crear usuario para la app web
9. Testing: subir archivo de prueba

### Paso 3: Migración de Datos

1. Conectar disco externo actual a PC
2. Conectar NAS a misma red
3. Copiar archivos del disco al NAS:
   - Opción A: Arrastrar desde Windows Explorer
   - Opción B: Usar File Station (web)
4. Verificar que todos los archivos copiaron bien
5. NO borrar disco original hasta verificar 100%

**Tiempo estimado:** 8-12 horas (depende de tamaño)

---

## 🧪 Testing Post-Instalación

Verificar que funcione:

- [ ] Acceso desde PC (via red local)
- [ ] Acceso desde tablet (via WiFi)
- [ ] Abrir PDF desde tablet (streaming)
- [ ] Subir archivo nuevo desde PC
- [ ] Eliminar archivo de prueba
- [ ] Apagar un disco → NAS sigue funcionando (RAID 1)
- [ ] Velocidad de transferencia >100 MB/s (Gigabit)

---

## 📞 Próximos Pasos

1. **Esta sesión:** ✅ Documentación completada
2. **Siguiente sesión:** 
   - [ ] Comparar modelos específicos disponibles en Argentina
   - [ ] Revisar precios actualizados en MercadoLibre
   - [ ] Decidir modelo final (Doctor)
   - [ ] Generar lista de compra con links
3. **Post-compra:**
   - [ ] Configurar NAS (desarrollador asiste remotamente)
   - [ ] Migrar datos del disco externo
   - [ ] Comenzar FASE 2 del desarrollo (Backend APIs)

---

## 💡 Preguntas Frecuentes

### ¿Puedo empezar con 1 disco y después agregar el segundo?

❌ **NO recomendado.** RAID 1 requiere 2 discos desde el inicio. Si empieza con 1, después tiene que:
1. Hacer backup
2. Destruir volumen
3. Crear RAID 1 con 2 discos
4. Restaurar backup

**Mejor:** Comprar los 2 discos de una vez.

---

### ¿Qué pasa si un disco falla?

✅ **Con RAID 1:** El NAS sigue funcionando con el disco bueno. Usted:
1. Ve alerta en el NAS
2. Compra disco de reemplazo
3. Reemplaza el disco malo
4. NAS reconstruye automáticamente (6-8 horas)
5. Listo, protegido nuevamente

---

### ¿Necesito backup adicional además del RAID 1?

✅ **SÍ, es recomendable.** RAID 1 protege contra falla de disco, pero NO contra:
- Robo del NAS
- Incendio del estudio
- Error humano (borrado accidental)
- Ransomware

**Solución:** Backup manual mensual en disco externo adicional (guardar en casa del doctor).

---

### ¿El NAS consume mucha electricidad?

✅ **NO.** Consumo típico:
- Synology DS220+: 15-20W (activo) / 5W (hibernando)
- Costo mensual: ~USD 2-3 (24/7 encendido)

---

### ¿Puedo acceder al NAS desde fuera del estudio?

⚠️ **SÍ, pero NO recomendado por seguridad.**

Si realmente lo necesitan:
- Synology QuickConnect (túnel seguro)
- VPN (más seguro)

**Recomendación inicial:** Solo acceso en red local (WiFi del estudio).

---

## 📚 Recursos Adicionales

### Tutoriales en Español

- [Synology: Primeros Pasos (YouTube)](https://youtube.com/results?search_query=synology+primeros+pasos)
- [Configurar RAID 1 en Synology](https://kb.synology.com/es-es/DSM/tutorial/What_is_Synology_Hybrid_RAID_SHR)

### Comunidades

- [Reddit r/synology](https://reddit.com/r/synology)
- [Foro Synology Español](https://community.synology.com/esl)

---

**Última actualización:** 28/01/2026  
**Próxima sesión:** Selección final del modelo
