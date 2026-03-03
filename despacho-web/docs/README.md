# 📚 Documentación - Despacho Web

Documentación específica de la aplicación Next.js del despacho legal.

---

## 🗂️ Estructura

### 📖 **Documentación Principal** (Root Directory)
- `AGENTS.md` - Guía de desarrollo completa (START AQUÍ)
- `README.md` - Descripción de la aplicación

---

### 📝 **Documentación de la App** (`docs/`)

#### `docs/CHANGELOG.md`
Historial de cambios principales de la aplicación.

#### `docs/CASES_DOCUMENTATION.md`
Documentación específica del sistema de casos.

#### `docs/NOTAS_PROXIMAS_MEJORAS.md`
Mejoras planeadas para el sistema de notas.

#### `docs/REFACTORING.md`
Documentación de refactorings realizados.

#### `docs/REGISTRO_DE_CAMBIOS.md`
Registro detallado de cambios.

---

## 🎯 Referencias Importantes

| Archivo | Propósito |
|---------|-----------|
| `AGENTS.md` | Guía principal de desarrollo |
| `lib/types/database.ts` | Tipos de BD (SOURCE OF TRUTH) |
| `lib/utils/errors.ts` | Manejo de errores |
| `lib/utils/helpers.ts` | Utilidades de fechas, texto, arrays |
| `lib/validaciones/financieras.ts` | Validaciones financieras |
| `playwright.config.ts` | Configuración de tests |

---

## 🚀 Comandos Rápidos

```bash
# Development
npm run dev              # Start dev server → http://localhost:3000

# Quality
npm run lint             # ESLint + TypeScript - 0 errores
npm run build            # Production build

# Testing
npm run test:e2e         # All E2E tests
npm run test:e2e:ui      # Interactive UI
npx playwright test e2e/notas.spec.ts --headed  # Single file
```

---

## 📖 Más Documentación

Para documentación general del proyecto, ver:
- `../docs/README.md` - Índice de toda la documentación
- `../AGENTS.md` - Guía rápida del proyecto
- `../docs/INGENIEROS-GUIA.md` - Guía específica para ingenieros

---

**Última actualización**: 23 Enero 2026
**Versión**: 1.0
