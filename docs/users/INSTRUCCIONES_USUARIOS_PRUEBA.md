# 👥 CREAR USUARIOS DE PRUEBA

**Fecha**: 14 de Enero, 2026
**Propósito**: Crear usuarios de prueba para el sistema

---

## 🎯 USUARIOS A CREAR

| Usuario | Email | Contraseña | Rol | Nombre Completo |
|---------|-------|------------|-----|-----------------|
| Admin | admin@despacho.test | admin123 | admin | Administrador Principal |
| Abogada 1 | abogada1@despacho.test | abogada123 | abogado | María González |
| Secretaria | secretaria@despacho.test | secre123 | secretaria | Ana Torres |

---

## 📋 PROCESO COMPLETO

### OPCIÓN A: Crear Usuarios Manualmente (Recomendado)

#### Paso 1: Ir al Dashboard de Authentication

1. En Supabase, ve al menú lateral izquierdo
2. Click en **"Authentication"**
3. Click en **"Users"**
4. Click en **"Add user"** (botón verde arriba a la derecha)

#### Paso 2: Crear el Usuario Admin

En el formulario:
- **Email**: `admin@despacho.test`
- **Password**: `admin123`
- **Auto Confirm User**: ✅ (activar este checkbox)
- Click en **"Create user"**

#### Paso 3: Copiar el UUID del Admin

Después de crear el usuario:
1. Verás una lista de usuarios
2. Encuentra el usuario `admin@despacho.test`
3. Copia su **UUID** (algo como: `a1b2c3d4-e5f6-7890-abcd-ef1234567890`)
4. Guárdalo temporalmente en un notepad (2e4578b2-0637-451d-820e-8549664712bc)

#### Paso 4: Repetir para Abogada 1 y Secretaria

Crea los otros dos usuarios:
- Email: `abogada1@despacho.test`, Password: `abogada123`, Auto Confirm: ✅ (85ae549f-9bd8-4e5b-8f36-673b1d8b61ae)
- Email: `secretaria@despacho.test`, Password: `secre123`, Auto Confirm: ✅ (48b3c04c-b8aa-4358-bad1-419bee335b2a)

Copia también sus UUIDs.

#### Paso 5: Insertar Perfiles en SQL

Ahora ve al **SQL Editor** y ejecuta este código (reemplaza los UUIDs con los que copiaste):

```sql
-- REEMPLAZA ESTOS UUIDs CON LOS QUE COPIASTE
INSERT INTO public.profiles (id, username, nombre_completo, rol, activo)
VALUES
  -- Admin
  ('REEMPLAZA-CON-UUID-DEL-ADMIN', 'admin', 'Administrador Principal', 'admin', TRUE),

  -- Abogada 1
  ('REEMPLAZA-CON-UUID-DE-ABOGADA1', 'abogada1', 'María González', 'abogado', TRUE),

  -- Secretaria
  ('REEMPLAZA-CON-UUID-DE-SECRETARIA', 'secretaria', 'Ana Torres', 'secretaria', TRUE);
```

**Ejemplo con UUIDs reales:**
```sql
INSERT INTO public.profiles (id, username, nombre_completo, rol, activo)
VALUES
  ('550e8400-e29b-41d4-a716-446655440000', 'admin', 'Administrador Principal', 'admin', TRUE),
  ('550e8400-e29b-41d4-a716-446655440001', 'abogada1', 'María González', 'abogado', TRUE),
  ('550e8400-e29b-41d4-a716-446655440002', 'secretaria', 'Ana Torres', 'secretaria', TRUE);
```

#### Paso 6: Verificar

Ejecuta esto para ver los perfiles creados:

```sql
SELECT
  p.username,
  p.nombre_completo,
  p.rol,
  au.email
FROM profiles p
JOIN auth.users au ON p.id = au.id
ORDER BY p.rol;
```

Deberías ver los 3 usuarios con sus emails y roles.

---

### OPCIÓN B: Script Automático (Avanzado)

Si prefieres hacerlo todo por SQL (más rápido pero menos recomendado), usa este script:

```sql
-- ⚠️ ADVERTENCIA: Esto crea usuarios directamente en auth.users
-- Solo usar en desarrollo/testing

-- 1. Habilitar inserción directa en auth (temporal)
-- Ejecuta esto primero:
DO $$
DECLARE
  admin_id UUID := gen_random_uuid();
  abogada_id UUID := gen_random_uuid();
  secretaria_id UUID := gen_random_uuid();
BEGIN
  -- Insertar usuarios en auth.users
  INSERT INTO auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    role,
    aud
  )
  VALUES
    (
      admin_id,
      '00000000-0000-0000-0000-000000000000',
      'admin@despacho.test',
      crypt('admin123', gen_salt('bf')),
      NOW(),
      '{"provider":"email","providers":["email"]}',
      '{}',
      NOW(),
      NOW(),
      'authenticated',
      'authenticated'
    ),
    (
      abogada_id,
      '00000000-0000-0000-0000-000000000000',
      'abogada1@despacho.test',
      crypt('abogada123', gen_salt('bf')),
      NOW(),
      '{"provider":"email","providers":["email"]}',
      '{}',
      NOW(),
      NOW(),
      'authenticated',
      'authenticated'
    ),
    (
      secretaria_id,
      '00000000-0000-0000-0000-000000000000',
      'secretaria@despacho.test',
      crypt('secre123', gen_salt('bf')),
      NOW(),
      '{"provider":"email","providers":["email"]}',
      '{}',
      NOW(),
      NOW(),
      'authenticated',
      'authenticated'
    );

  -- Insertar perfiles
  INSERT INTO public.profiles (id, username, nombre_completo, rol, activo)
  VALUES
    (admin_id, 'admin', 'Administrador Principal', 'admin', TRUE),
    (abogada_id, 'abogada1', 'María González', 'abogado', TRUE),
    (secretaria_id, 'secretaria', 'Ana Torres', 'secretaria', TRUE);

  RAISE NOTICE 'Usuarios creados exitosamente';
END $$;
```

⚠️ **NOTA**: La Opción B puede fallar si Supabase tiene restricciones en auth.users. Si da error, usa la Opción A.

---

## 🔍 VERIFICACIÓN FINAL

Después de crear los usuarios, verifica que todo funcione:

### 1. Ver Usuarios en Auth

```sql
SELECT id, email, created_at
FROM auth.users
ORDER BY email;
```

### 2. Ver Perfiles con Roles

```sql
SELECT username, nombre_completo, rol
FROM profiles
ORDER BY
  CASE rol
    WHEN 'admin' THEN 1
    WHEN 'abogado' THEN 2
    WHEN 'secretaria' THEN 3
  END;
```

### 3. Ver Todo Junto

```sql
SELECT
  p.username,
  au.email,
  p.nombre_completo,
  p.rol,
  p.activo
FROM profiles p
JOIN auth.users au ON p.id = au.id
ORDER BY p.rol;
```

---

## ✅ RESULTADO ESPERADO

Deberías ver algo como:

| username | email | nombre_completo | rol | activo |
|----------|-------|-----------------|-----|--------|
| admin | admin@despacho.test | Administrador Principal | admin | true |
| abogada1 | abogada1@despacho.test | María González | abogado | true |
| secretaria | secretaria@despacho.test | Ana Torres | secretaria | true |

---

## 🎯 PRÓXIMOS PASOS

Una vez creados los usuarios, podemos:
1. ✅ Insertar casos de ejemplo
2. ✅ Insertar eventos de prueba
3. ✅ Insertar pagos
4. ✅ Probar las políticas RLS
5. ✅ Empezar con Next.js

---

## 🐛 TROUBLESHOOTING

### Error: "duplicate key value violates unique constraint"
- Ya existe un usuario con ese email
- Solución: Elimina el usuario en Authentication > Users primero

### Error: "permission denied for table auth.users"
- No puedes insertar directamente en auth.users
- Solución: Usa la Opción A (Dashboard)

### Error: "violates foreign key constraint"
- El UUID del perfil no coincide con ningún usuario en auth.users
- Solución: Verifica que copiaste bien los UUIDs

---

**¿Listo para crear los usuarios?**
