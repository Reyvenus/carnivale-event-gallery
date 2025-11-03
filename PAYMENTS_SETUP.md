# 💰 Sistema de Gestión de Pagos - Guía Completa

## 📋 Configuración Inicial

### 1️⃣ Crear la Tabla en Supabase

1. Ve a tu proyecto en [Supabase](https://supabase.com)
2. Abre el **SQL Editor**
3. Copia y ejecuta el siguiente SQL:

```sql
-- Crear tabla de pagos
CREATE TABLE guest_payments (
  id SERIAL PRIMARY KEY,
  guest_id INTEGER REFERENCES guests(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  payment_date TIMESTAMP DEFAULT NOW(),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Índice para mejorar rendimiento
CREATE INDEX idx_guest_payments_guest_id ON guest_payments(guest_id);

-- Habilitar RLS (Row Level Security)
ALTER TABLE guest_payments ENABLE ROW LEVEL SECURITY;

-- Políticas de seguridad
CREATE POLICY "Enable read access for all users" ON guest_payments
  FOR SELECT USING (true);

CREATE POLICY "Enable all access for service role" ON guest_payments
  FOR ALL USING (auth.role() = 'service_role');

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_guest_payments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_guest_payments_updated_at
  BEFORE UPDATE ON guest_payments
  FOR EACH ROW
  EXECUTE FUNCTION update_guest_payments_updated_at();
```

## 🎯 Cómo Usar el Sistema de Pagos

### Ver Pagos de un Invitado

1. En el panel de Admin, ve a la pestaña **"👥 Invitados"**
2. En la columna **"Pagado"**, haz clic en el botón **"💰 Ver"**
3. Se abrirá el modal de pagos con:
   - **Total a Pagar**: Costo total del invitado
   - **Total Pagado**: Suma de todos los pagos realizados
   - **Saldo**: Lo que falta por pagar (verde si está completo, rojo si falta)

### Agregar un Pago

1. Dentro del modal de pagos, haz clic en **"➕ Agregar Pago"**
2. Completa el formulario:
   - **Monto**: Cantidad pagada (ej: 15000)
   - **Fecha**: Fecha del pago (por defecto hoy)
   - **Notas**: Información adicional (opcional)
3. Haz clic en **"💾 Guardar Pago"**
4. ¡Listo! El pago se agrega al historial

### Ver Historial de Pagos

En el modal de pagos verás una lista con:
- 💵 Monto de cada pago
- 📅 Fecha del pago
- 📝 Notas (si las hay)
- 🗑️ Botón para eliminar

### Eliminar un Pago

1. En el historial de pagos, haz clic en el botón **🗑️**
2. Confirma la eliminación
3. El pago se elimina y los totales se actualizan automáticamente

## 📊 Indicadores Visuales

### En la Tabla Principal
- **Botón "💰 Ver"**: Abre el modal de pagos para gestionar

### En el Modal de Pagos
- 🔵 **Azul**: Total a pagar
- 🟢 **Verde**: Total pagado / Saldo completo
- 🔴 **Rojo**: Saldo pendiente

## 💡 Casos de Uso

### Ejemplo 1: Pago Completo de Una Vez
```
Invitado: Juan Pérez
Costo total: $50,000
Pago 1: $50,000 (15/01/2025) - "Transferencia bancaria"
Estado: ✅ Completo
```

### Ejemplo 2: Pagos Parciales
```
Invitado: María García
Costo total: $60,000
Pago 1: $30,000 (10/01/2025) - "Seña"
Pago 2: $20,000 (20/02/2025) - "Pago parcial"
Pago 3: $10,000 (05/03/2025) - "Pago final"
Estado: ✅ Completo
```

### Ejemplo 3: Pago Pendiente
```
Invitado: Carlos López
Costo total: $75,000
Pago 1: $40,000 (01/02/2025) - "Adelanto"
Estado: ⏳ Falta $35,000
```

## 🔧 Características Técnicas

### Estructura de la Base de Datos
- **id**: Identificador único del pago
- **guest_id**: Relación con el invitado
- **amount**: Monto del pago (DECIMAL)
- **payment_date**: Fecha del pago
- **notes**: Notas adicionales
- **created_at**: Fecha de creación del registro
- **updated_at**: Fecha de última actualización

### Validaciones
- El monto debe ser un número válido
- La fecha de pago es opcional (default: hoy)
- Las notas son opcionales
- Al eliminar un invitado, se eliminan sus pagos automáticamente (CASCADE)

## 📈 Reportes y Análisis

### Información Disponible
- Total a cobrar por invitado
- Total pagado por invitado
- Saldo pendiente por invitado
- Historial completo de pagos con fechas
- Notas de cada transacción

### Futuras Mejoras (Ideas)
- 📊 Dashboard de pagos general
- 💳 Método de pago (efectivo, transferencia, etc.)
- 📄 Adjuntar comprobantes de pago
- 📧 Notificaciones automáticas de pagos
- 📑 Exportar historial a Excel/PDF

## ❓ Preguntas Frecuentes

### ¿Puedo editar un pago después de crearlo?
Actualmente no hay opción de editar. Puedes eliminar el pago y crear uno nuevo con la información correcta.

### ¿Se pueden hacer pagos negativos o reembolsos?
Sí, puedes ingresar un monto negativo para registrar reembolsos.

### ¿Qué pasa si elimino un invitado?
Todos sus pagos se eliminan automáticamente (gracias a ON DELETE CASCADE).

### ¿Los pagos se reflejan en tiempo real?
Sí, al agregar o eliminar un pago, los totales se actualizan inmediatamente.

## 🚀 Próximos Pasos

1. ✅ Crea la tabla en Supabase
2. ✅ Prueba agregar un pago de prueba
3. ✅ Verifica que los totales calculen correctamente
4. 📊 Comienza a registrar pagos reales

¡Tu sistema de gestión de pagos está listo! 🎉
