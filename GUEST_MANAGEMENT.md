# 👥 Sistema de Gestión de Invitados

## 🎉 Características Implementadas

### Panel de Administración
El panel de administración ahora incluye 3 pestañas principales:

1. **👥 Invitados** - Gestión completa de invitados
2. **⏳ Mensajes** - Mensajes pendientes de aprobación
3. **✅ Aprobados** - Mensajes aprobados

### Funcionalidades de Invitados

#### ✨ Campos de Invitado
- **Nombre (first_name)** *(requerido)*
- **Apellido (last_name)** *(requerido)*
- **Nickname** - Apodo o nombre corto
- **Código de Invitado (guest_code)** *(requerido, único)* - Ej: INV001, INV002
- **Costo por Persona (cost_per_person)** - En pesos argentinos
- **Número de Acompañantes (num_companions)** - Cuántas personas acompañan al invitado
- **Confirmado (confirmed)** - Checkbox para marcar si confirmó asistencia
- **Notas (notes)** - Campo de texto libre para anotaciones

#### 🎯 Estadísticas en Tiempo Real
- Total de invitados registrados
- Cantidad de confirmados
- Total de personas (invitados + acompañantes)

#### 🔧 Acciones Disponibles
- ➕ **Agregar Invitado** - Crear nuevo registro
- ✏️ **Editar** - Modificar datos existentes
- 🗑️ **Eliminar** - Borrar invitado (con confirmación)
- 🔗 **Copiar Link** - Genera y copia URL personalizada con el nombre del invitado

## 📋 Instrucciones de Uso

### 1. Configurar Base de Datos

Ejecuta el SQL del archivo `SUPABASE_SETUP.md` en tu consola de Supabase para crear la tabla `guests`.

```sql
-- Ver el archivo SUPABASE_SETUP.md para el SQL completo
```

### 2. Acceder al Panel de Admin

1. Ve a `/admin` en tu aplicación
2. Ingresa la contraseña configurada en `VITE_APP_ADMIN_PASSWORD`
3. Haz clic en la pestaña "👥 Invitados"

### 3. Agregar un Invitado

1. Clic en "➕ Agregar Invitado"
2. Completa el formulario:
   - Nombre y Apellido (obligatorios)
   - Código único (ej: INV001)
   - Costo por persona
   - Número de acompañantes
   - Marca "Confirmado" si ya confirmó
3. Clic en "➕ Agregar Invitado"

### 4. Editar un Invitado

1. Encuentra el invitado en la lista
2. Clic en "✏️ Editar"
3. Modifica los campos necesarios
4. Clic en "💾 Guardar Cambios"

### 5. Compartir Invitación Personalizada

1. Clic en "🔗 Copiar Link" en la tarjeta del invitado
2. Se copiará una URL como: `https://tu-dominio.com?to=NombreInvitado`
3. Comparte este link por WhatsApp, email, etc.
4. Cuando el invitado abra el link, verá su nombre personalizado

## 💡 Cálculo de Costos

El sistema calcula automáticamente:
- **Total de Personas** = Invitado + Acompañantes
- **Costo Total** = Costo por Persona × Total de Personas

Ejemplo:
- Invitado: Juan Pérez
- Costo por persona: $50,000
- Acompañantes: 2
- **Total**: 3 personas × $50,000 = **$150,000**

## 🔐 Seguridad

- La tabla tiene RLS (Row Level Security) habilitado
- Lectura pública (para mostrar invitados)
- Escritura solo con service_role (admin)
- Autenticación por contraseña en el panel

## 🎨 Diseño

- Interfaz moderna con glassmorphism
- Tarjetas con información clara y organizada
- Estadísticas visuales en la parte superior
- Responsive para móviles y desktop
- Animaciones suaves y transiciones

## 📊 Estructura de Datos

```typescript
interface Guest {
  id: UUID;
  first_name: string;
  last_name: string;
  nickname?: string;
  guest_code: string; // UNIQUE
  cost_per_person: number;
  confirmed: boolean;
  num_companions: number;
  notes?: string;
  created_at: timestamp;
  updated_at: timestamp;
}
```

## 🚀 Próximas Mejoras Sugeridas

- [ ] Exportar lista a Excel/CSV
- [ ] Envío masivo de invitaciones por WhatsApp
- [ ] Panel de estadísticas avanzadas
- [ ] Historial de cambios
- [ ] Búsqueda y filtros avanzados
- [ ] Códigos QR para cada invitado
- [ ] Integración con sistema de pagos

## 🐛 Solución de Problemas

### Error: "relation 'guests' does not exist"
- Asegúrate de haber ejecutado el SQL en Supabase
- Verifica que estés en el proyecto correcto

### No puedo editar/eliminar invitados
- Verifica que estés autenticado como admin
- Revisa las políticas RLS en Supabase

### Los cambios no se reflejan
- Refresca la página
- Verifica la consola del navegador para errores
