# 🎟️ Sistema de Validación de Invitados

## 🎯 Cómo Funciona

El sistema ahora valida automáticamente el código de invitado antes de permitir el acceso a la invitación.

### 📋 Flujo de Validación

```
Usuario abre el link
      ↓
App.jsx lee el parámetro ?code=INV001
      ↓
Consulta Supabase: ¿Existe este código?
      ↓
    ┌─────────┴─────────┐
    ↓                   ↓
  ✅ SÍ              ❌ NO
    ↓                   ↓
UserWatch          Página 404
    ↓
Thumbnail
```

### 🔗 Formato de URL

**Antes:**
```
https://tu-boda.com?to=Juancho
```

**Ahora:**
```
https://tu-boda.com?code=INV001
```

### 🎨 Componentes

#### 1. **App.jsx** - Validador Principal
- Lee el parámetro `?code=` de la URL
- Consulta la base de datos de invitados
- Muestra loading mientras valida
- Renderiza NotFound si el código no existe
- Pasa `guestData` a los componentes hijos

#### 2. **NotFound.jsx** - Página 404
Características:
- Diseño atractivo y amigable
- Emoji animado (🎭)
- Mensaje claro sobre el error
- Sugerencias de qué hacer
- Información de contacto

#### 3. **UserWatch** - Pantalla de Bienvenida
- Recibe `guestData` como prop
- Muestra el nombre del invitado desde la BD
- Prioridad: `nickname` > `first_name + last_name`

### 💾 Datos del Invitado

Cuando el código es válido, se obtiene:

```javascript
guestData = {
  id: "uuid",
  first_name: "Juan",
  last_name: "Pérez",
  nickname: "Juancho",
  guest_code: "INV001",
  cost_per_person: 50000,
  confirmed: true,
  num_companions: 2,
  notes: "Vegetariano",
  created_at: "2025-10-31",
  updated_at: "2025-10-31"
}
```

### 🎭 Página 404 - Características

**Elementos visuales:**
- Emoji grande animado con bounce
- Título "¡Oops!"
- Mensaje principal personalizado
- Card con sugerencias
- Branding de los novios

**Mensajes:**
- "Parece que tu invitación se perdió en el camino..."
- "No encontramos tu código de invitación"
- Lista de acciones sugeridas

### ⚡ Estados de Carga

#### Loading (Validando)
```jsx
<div className="spinner">
  Verificando invitación...
</div>
```

#### Código Inválido
```jsx
<NotFound />
```

#### Código Válido
```jsx
<UserWatch guestData={guestData} />
  ↓
<Thumbnail guestData={guestData} />
```

### 🔐 Seguridad

✅ **Validación en servidor** - Consulta directa a Supabase
✅ **Códigos únicos** - Constraint UNIQUE en la BD
✅ **Case insensitive** - `guest_code.toUpperCase()`
✅ **Sin info sensible** - Solo el código en la URL

### 📱 Copiar Link desde Admin

**En la Vista de Tabla:**
```javascript
🔗 → Copia: https://tu-boda.com?code=INV001
```

**En las Tarjetas:**
```javascript
🔗 Copiar Link → Copia: https://tu-boda.com?code=INV001
```

### 🎯 Casos de Uso

#### Caso 1: Link Válido
```
URL: https://tu-boda.com?code=INV001
Usuario: Juan Pérez (Juancho)
Resultado: ✅ Acceso permitido
```

#### Caso 2: Link Sin Código
```
URL: https://tu-boda.com
Resultado: ❌ Página 404
```

#### Caso 3: Código Inválido
```
URL: https://tu-boda.com?code=FAKE123
Resultado: ❌ Página 404
```

#### Caso 4: Código en Minúsculas
```
URL: https://tu-boda.com?code=inv001
Conversión: INV001
Resultado: ✅ Acceso permitido
```

### 🚀 Ventajas del Sistema

1. **Seguridad** - Solo invitados válidos pueden acceder
2. **Control** - Sabes exactamente quién abre la invitación
3. **Único** - Cada invitado tiene su código único
4. **Trazable** - Puedes saber qué invitado compartió el link
5. **UX Mejorada** - Mensaje claro si algo sale mal
6. **Profesional** - Sistema robusto de validación

### 📊 Métricas Potenciales

Con este sistema podrías implementar:
- Contador de visualizaciones por código
- Fecha de primer acceso
- Última vez que vio la invitación
- Compartió el link (si varios IPs usan el mismo código)

### 🔄 Migraciones

Si ya tienes invitados con el sistema anterior (`?to=nombre`):

**Opción 1:** Regenerar todos los links con códigos

**Opción 2:** Soporte dual temporal
```javascript
const guestCode = url.searchParams.get('code');
const guestName = url.searchParams.get('to'); // Fallback

if (guestCode) {
  // Validar por código (nuevo)
} else if (guestName) {
  // Buscar por nombre (viejo)
}
```

### 💡 Mejoras Futuras

- [ ] Registro de visualizaciones
- [ ] Analytics por invitado
- [ ] Confirmación de asistencia directa desde el link
- [ ] Link con QR code para escanear
- [ ] Validación de invitados + acompañantes
- [ ] Dashboard de estadísticas de acceso

## 🎉 Ejemplo Completo

**Admin crea invitado:**
```
Nombre: Juan Pérez
Código: INV001
```

**Admin copia link:**
```
https://tu-boda.com?code=INV001
```

**Admin envía por WhatsApp:**
```
¡Hola Juan! 🎉
Estás invitado a nuestra boda.
Abre tu invitación aquí:
https://tu-boda.com?code=INV001
```

**Juan abre el link:**
```
1. Cargando... (Spinner)
2. Validando código INV001
3. ✅ Código válido
4. Muestra: "Quien es el Invitado? Juan Pérez"
5. Click → Thumbnail con detalles
```

**Si alguien más intenta con código fake:**
```
URL: https://tu-boda.com?code=FAKE
Resultado: Página 404 con mensaje amigable
```
