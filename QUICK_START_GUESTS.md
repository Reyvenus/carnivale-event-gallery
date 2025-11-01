# 🎯 Inicio Rápido - Sistema de Gestión de Invitados

## 📝 Pasos para Configurar

### 1️⃣ Configurar Base de Datos en Supabase

1. Ve a tu proyecto en [Supabase](https://supabase.com)
2. Abre el **SQL Editor**
3. Copia y ejecuta el siguiente SQL:

```sql
-- Create guests table
CREATE TABLE IF NOT EXISTS guests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  nickname VARCHAR(100),
  guest_code VARCHAR(50) UNIQUE NOT NULL,
  cost_per_person DECIMAL(10, 2) DEFAULT 0,
  confirmed BOOLEAN DEFAULT false,
  num_companions INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_guests_code ON guests(guest_code);
CREATE INDEX idx_guests_first_name ON guests(first_name);
CREATE INDEX idx_guests_last_name ON guests(last_name);
CREATE INDEX idx_guests_confirmed ON guests(confirmed);

-- Habilitar RLS
ALTER TABLE guests ENABLE ROW LEVEL SECURITY;

-- Políticas
CREATE POLICY "Enable read access for all users" ON guests
  FOR SELECT USING (true);

CREATE POLICY "Enable all access for service role" ON guests
  FOR ALL USING (auth.role() = 'service_role');

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_guests_updated_at
  BEFORE UPDATE ON guests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

### 2️⃣ Verificar Variables de Entorno

Asegúrate de tener estas variables en tu archivo `.env`:

```env
VITE_SUPABASE_URL=tu_supabase_url
VITE_SUPABASE_ANON_KEY=tu_supabase_anon_key
VITE_APP_ADMIN_PASSWORD=tu_password_admin
VITE_APP_TABLE_NAME=wishes
```

### 3️⃣ Acceder al Panel de Admin

1. Navega a: `http://localhost:5173/admin` (o tu dominio en producción)
2. Ingresa la contraseña configurada en `VITE_APP_ADMIN_PASSWORD`
3. ¡Listo! Ya puedes gestionar invitados

## 🎉 Uso Básico

### Agregar un Invitado

1. Clic en pestaña **"👥 Invitados"**
2. Clic en **"➕ Agregar Invitado"**
3. Completa:
   - Nombre: Juan
   - Apellido: Pérez
   - Nickname: Juancho
   - Código: INV001
   - Costo: 50000
   - Acompañantes: 2
4. Marca **"✅ Confirmado"** si aplica
5. Clic en **"➕ Agregar Invitado"**

### Compartir Invitación

1. En la tarjeta del invitado, clic en **"🔗 Copiar Link"**
2. Se copiará: `https://tu-dominio.com?to=Juancho`
3. Envía el link por WhatsApp o email
4. El invitado verá su nombre personalizado en la invitación

## 📊 Vista Previa

El panel muestra:
- **Total Invitados**: Número de registros
- **Confirmados**: Cuántos confirmaron asistencia
- **Total Personas**: Invitados + Acompañantes

Cada tarjeta de invitado muestra:
- Nombre completo y nickname
- Código único
- Número de personas y acompañantes
- Costo por persona y total
- Estado de confirmación
- Notas adicionales

## ❓ ¿Necesitas Ayuda?

- Ver documentación completa en `GUEST_MANAGEMENT.md`
- Ver setup de Supabase en `SUPABASE_SETUP.md`
