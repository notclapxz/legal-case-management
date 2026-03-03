# 📍 GUÍA PARA MAPEAR EL ALMACÉN FÍSICO

## 🎯 Objetivo
Asignar una ubicación física precisa a cada archivador/expediente en el almacén para facilitar su búsqueda mediante el sistema digital.

---

## 📦 Materiales Necesarios

- ✅ **Esta guía impresa**
- ✅ **Archivo CSV**: `casos_despacho.csv` abierto en Google Sheets
- ✅ **Teléfono/tablet** con cámara
- ✅ **Cuaderno o papel** para anotar
- ✅ **Marcador/pluma**
- ✅ **Cinta métrica** (opcional)

---

## 📐 Sistema de Coordenadas

Vamos a usar el formato: **`#-Columna`**

### Estructura:
```
# = Número de fila horizontal (1, 2, 3, 4, 5)
Columna = Letra de columna vertical (A, B, C, D, E, F)
```

### Ejemplos:
- `1-A` = Fila 1, columna A
- `3-C` = Fila 3, columna C
- `5-E` = Fila 5, columna E

---

## 🗺️ Estructura del Almacén (5 FILAS en forma de U)

```
Vista desde arriba (en forma de U):

         ┌─────────────────────┐
         │    FILA 1           │
         │  [A] [B] [C] [D] [E]│ ← 5 columnas
         ├─────────────────────┤
         │    FILA 2           │
         │[A][B][C][D][E][F]   │ ← 6 columnas
    ┌────┼─────────────────────┼────┐
    │    │    FILA 3           │    │
    │    │[A][B][C][D][E][F]   │    │ ← 6 columnas
    └────┼─────────────────────┼────┘
         │    FILA 4           │
         │[A][B][C][D][E][F]   │ ← 6 columnas
         ├─────────────────────┤
         │    FILA 5           │
         │[A][B][C][D][E][F]   │ ← 6 columnas
         └─────────────────────┘
```

**IMPORTANTE**:
- FILA 1 tiene 5 columnas (A-E)
- FILAS 2-5 tienen 6 columnas (A-F)

---

## 🚀 Proceso de Mapeo (Por FILA)

### PASO 1: Identificar la FILA

Comienza con **FILA 1** (donde deberían estar los casos de Carlos Moreno según el documento).

1. Párate frente a la FILA 1
2. Toma una **foto general** de toda la fila
3. Nombra la foto: `1_vista_general.jpg`

---

### PASO 2: Identificar Columnas

Desde tu perspectiva, etiqueta las columnas de **izquierda a derecha**:

```
FILA 1 (ejemplo):
┌─────┬─────┬─────┬─────┬─────┐
│  A  │  B  │  C  │  D  │  E  │
└─────┴─────┴─────┴─────┴─────┘
 ↑                             ↑
Izquierda                 Derecha
```

**Tip**: Pon etiquetas adhesivas temporales con las letras A, B, C, D, E, F para facilitar el mapeo.

---

### PASO 3: Registrar Archivadores

Por cada archivador/expediente que veas:

1. **Lee la etiqueta** del lomo
2. **Identifica**:
   - Cliente
   - Descripción del caso
   - Número de expediente (si tiene)
   - Tomo (I, II, III... si tiene)
3. **Toma una foto cercana** (opcional, solo si la etiqueta es difícil de leer)
4. **Anota en tu cuaderno**:
   ```
   Cliente: Carlos Moreno
   Caso: REQUERIMIENTO DE PRISION PREVENTIVA
   Expediente: 2437-2016
   Tomo: I
   Ubicación: 1-A
   ```

---

### PASO 4: Actualizar el CSV en Google Sheets

Mientras vas mapeando (o al final), actualiza el CSV:

1. Busca el caso por cliente o código
2. Llena la columna `ubicacion_fisica` con: **#-Letra**
3. Ejemplo:
   ```
   Código: MORENO-01
   Cliente: Carlos Moreno
   Descripción: REQUERIMIENTO DE PRISION PREVENTIVA
   Ubicación: 1-A ← AQUÍ
   ```

---

## 📸 Fotos Recomendadas

### Para cada FILA (5 fotos generales obligatorias):
- `1_vista_general.jpg`
- `2_vista_general.jpg`
- `3_vista_general.jpg`
- `4_vista_general.jpg`
- `5_vista_general.jpg`

### Para archivadores importantes (opcional):
- Casos con etiquetas difíciles de leer
- Casos multi-tomo (para ver cómo están distribuidos)
- Zonas con muchos archivadores apilados

---

## 📋 Planilla de Mapeo (Formato)

Usa este formato en tu cuaderno mientras recorres el almacén:

| Ubicación | Cliente | Descripción Caso | Exp. | Tomo | Foto |
|-----------|---------|------------------|------|------|------|
| 1-A   | Carlos Moreno | PRISION PREVENTIVA | 2437-2016 | I | ✅ |
| 1-A   | Carlos Moreno | JURISPRUDENCIA | 2437-2016 | - | - |
| 1-B   | Carlos Moreno | NEGOCIACION INCOMP | 357-2021 | - | - |
| 1-B   | Carlos Moreno | SIS LICITACION | - | - | - |

**Nota**: Es probable que en una misma columna (ej: 1-A) haya VARIOS archivadores apilados verticalmente. Eso está bien, todos llevan la misma ubicación `1-A`.

---

## 🔍 Tips Prácticos

### ✅ Empieza por zonas homogéneas
Según el documento Word:
- **FILA 1**: Probablemente solo Carlos Moreno (~35 casos)
- **FILA 5**: Probablemente solo Carlos Aguirre (~24 casos)

Estas son las más fáciles de mapear.

### ✅ Agrupa casos multi-tomo
Si encuentras varios tomos del mismo caso en la misma columna:
```
1-A: MORENO - Exp 02437-2016 - TOMO I
1-A: MORENO - Exp 02437-2016 - TOMO II
1-A: MORENO - Exp 02437-2016 - TOMO III
```

Todos con la misma ubicación `1-A`.

### ✅ Marca casos no identificados
Si encuentras un archivador sin etiqueta clara:
- Toma foto
- Anota ubicación
- Marca en el CSV como "DESCONOCIDO-##"
- Ya después con tu papá lo identifican

### ✅ Casos eliminados
Si encuentras casos que sabes están cerrados (ej: si tienen una etiqueta especial o están aparte):
- Regístralos igual
- En el CSV marca `activo: false`

---

## 🚀 Proceso Rápido (30 min por FILA)

### Orden recomendado:

**1. FILA 1** (Carlos Moreno) - 30-40 min
   - ~35 archivadores
   - Solo un cliente → fácil
   - Columnas: A, B, C, D, E

**2. FILA 5** (Carlos Aguirre) - 20-30 min
   - ~24 archivadores
   - Solo un cliente → fácil
   - Columnas: A, B, C, D, E, F

**3. FILA 2** (Múltiples clientes) - 30 min
   - ~20 archivadores
   - Corvetto, Risco, Martinez, etc.

**4. FILA 3** (Corporativos) - 40 min
   - ~35 archivadores
   - INPESCO, BARAKA, NIPPON, AVR

**5. FILA 4** (Casos complejos) - 40 min
   - ~35 archivadores
   - ENDOMED, VELEBIT, Escalante, Tello

**Total estimado: 3-4 horas**

---

## 📝 Después del Mapeo

### 1. Completar CSV en Google Sheets

Asegúrate de que TODOS los casos tengan su `ubicacion_fisica`:

```csv
codigo,cliente,descripcion_caso,ubicacion_fisica,tomo,activo
MORENO-01,Carlos Moreno,REQUERIMIENTO DE PRISION PREVENTIVA,1-A,I,true
MORENO-02,Carlos Moreno,DOCUMENTOS PERSONALES,1-A,,true
AGUIRRE-01,Carlos Aguirre,SIS,5-A,,true
```

### 2. Subir fotos

Crea una carpeta: `fotos_almacen/` y organiza:
```
fotos_almacen/
├── 1_vista_general.jpg
├── 2_vista_general.jpg
├── 3_vista_general.jpg
├── 4_vista_general.jpg
├── 5_vista_general.jpg
└── detalle/
    ├── 1-A_moreno_2437-2016.jpg
    └── ...
```

### 3. Validar con tu papá

- Muéstrale las 5 fotos generales
- Confirma que las ubicaciones tienen sentido
- Pregunta por archivadores que no encuentres
- Identifica casos sin etiqueta clara

---

## ❓ Preguntas Frecuentes

### ¿Qué hago si encuentro un archivador que no está en el CSV?

**R**: ¡Agrégalo! Al final del CSV agrega una nueva fila:
```
NUEVO-01,Nombre Cliente,Descripción del caso,#-Letra,Tomo,true,Por identificar
```

### ¿Qué hago si hay dos archivadores con el mismo nombre pero diferente contenido?

**R**: Usa el número de expediente para distinguirlos:
- Expediente 02437-2016 → MORENO-01
- Expediente 357-2021 → MORENO-04

### ¿Qué hago si en una columna hay muchos archivadores apilados?

**R**: Todos llevan la misma ubicación `#-Letra`. Por ejemplo, si en 1-A hay 10 archivadores de Carlos Moreno, los 10 tienen ubicación `1-A`.

### ¿Qué hago si no puedo leer una etiqueta?

**R**:
1. Toma una foto clara y cercana
2. Anota la ubicación (`#-Letra`)
3. Deja el código como `DESCONOCIDO-01` en el CSV
4. En la columna `notas` pon: "Etiqueta ilegible, ver foto"

### ¿Necesito abrir los archivadores para ver qué tienen dentro?

**R**: **NO**. Solo lee las etiquetas externas. Si no tiene etiqueta clara, márcalo como "por identificar" y sigue adelante.

---

## ✅ Checklist de Mapeo

Imprime esto y marca conforme avanzas:

### FILA 1 - Carlos Moreno
- [ ] Foto general tomada
- [ ] Columna A mapeada (__ archivadores)
- [ ] Columna B mapeada (__ archivadores)
- [ ] Columna C mapeada (__ archivadores)
- [ ] Columna D mapeada (__ archivadores)
- [ ] Columna E mapeada (__ archivadores)
- [ ] CSV actualizado con ubicaciones

### FILA 2 - Múltiples clientes
- [ ] Foto general tomada
- [ ] Todos los archivadores mapeados (__ total)
- [ ] CSV actualizado

### FILA 3 - Corporativos
- [ ] Foto general tomada
- [ ] Todos los archivadores mapeados (__ total)
- [ ] CSV actualizado

### FILA 4 - ENDOMED/VELEBIT/etc
- [ ] Foto general tomada
- [ ] Todos los archivadores mapeados (__ total)
- [ ] CSV actualizado

### FILA 5 - Carlos Aguirre
- [ ] Foto general tomada
- [ ] Todos los archivadores mapeados (__ total)
- [ ] CSV actualizado

### Post-mapeo
- [ ] CSV 100% completo con ubicaciones
- [ ] 5 fotos generales tomadas y guardadas
- [ ] Archivadores no identificados listados
- [ ] Validación con tu papá completada

---

## 🎯 Meta del Mapeo

Al finalizar, deberías tener:

- ✅ **5 fotos generales** (1 por FILA) - OBLIGATORIO
- ✅ **CSV completado** con ~250 ubicaciones físicas - OBLIGATORIO
- ✅ **~10-20 fotos de detalle** (opcional, solo casos difíciles)
- ✅ **Lista de archivadores no identificados** (para revisar con tu papá)

---

## 🔄 Actualización Futura (Fase 2)

En el futuro, el sistema podrá:
- 📱 Generar **códigos QR** para cada archivador
- 🗺️ Mostrar un **mapa visual interactivo** del almacén
- 📸 Ver **fotos de cada expediente** desde la app
- 🔍 Buscar por ubicación física (ej: "¿Qué hay en 3-C?")
- 📍 Navegar: "Mostrar ruta desde entrada hasta 4-D"

Pero por ahora, con este mapeo básico **#-Letra** es suficiente para el MVP.

---

## 💡 Estrategia de Mapeo Rápido (si tienes poco tiempo)

Si solo tienes 1 hora, prioriza:

### Nivel 1 - Mínimo viable (30 min):
1. ✅ Tomar 5 fotos generales (1 por FILA)
2. ✅ Mapear solo FILA 1 (Carlos Moreno) y FILA 5 (Carlos Aguirre)
3. ✅ Casos más importantes de otras filas

### Nivel 2 - Completo pero rápido (2 horas):
1. ✅ Todo lo anterior
2. ✅ Mapear FILA 2, 3, 4 completas
3. ✅ Solo anotar ubicaciones, sin fotos de detalle

### Nivel 3 - Completo con fotos (3-4 horas):
1. ✅ Todo lo anterior
2. ✅ Fotos de casos multi-tomo
3. ✅ Fotos de etiquetas difíciles de leer

---

**¡Éxito con el mapeo! 🚀**

*Recuerda: El objetivo NO es perfección, sino tener ubicaciones aproximadas para el MVP.*
*Puedes refinar después.*

---

**Última actualización**: 12 de Enero, 2026
