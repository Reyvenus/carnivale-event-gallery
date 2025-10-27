# 🔐 Panel de Administración - Instrucciones

## ✅ ¡Ya está configurado!

He creado un panel de administración completo para que puedas revisar y aprobar los mensajes de tu boda.

## 📍 Cómo acceder

### Desarrollo local:
```
http://localhost:5173/admin
```

### Producción (después de deployar):
```
https://tu-dominio.com/admin
```

## 🔑 Contraseña por defecto

**⚠️ IMPORTANTE: Cambia esta contraseña antes de deployar**

La contraseña por defecto es: `admin123`

Para cambiarla, edita el archivo:
```
src/pages/Admin.jsx
```

Busca esta línea (aproximadamente línea 15):
```javascript
const ADMIN_PASSWORD = 'admin123'; // ⚠️ Cámbiala por una segura
```

Y cámbiala por una contraseña segura.

## 🎯 Funcionalidades

### 1. **Vista de Mensajes Pendientes**
- Ver todos los mensajes que aún no han sido aprobados
- Cada mensaje muestra:
  - 👤 Nombre del invitado
  - 📅 Fecha y hora de envío
  - 💬 Mensaje completo
  - 🎨 Color del avatar

### 2. **Acciones Disponibles**
- ✅ **Aprobar**: El mensaje aparecerá en la página pública
- 🗑️ **Eliminar**: Elimina el mensaje permanentemente
- ⏳ **Rechazar**: Mueve el mensaje de aprobado a pendiente

### 3. **Vista de Mensajes Aprobados**
- Ver todos los mensajes que ya están publicados
- Opción de rechazar si te arrepientes
- Opción de eliminar

### 4. **Actualización Automática**
- El panel se actualiza automáticamente cada 30 segundos
- También puedes actualizar manualmente con el botón 🔄

## 🔒 Seguridad

### Sesión persistente
- Una vez que ingresas, tu sesión se guarda en el navegador
- No necesitas volver a ingresar la contraseña
- Puedes cerrar sesión con el botón "🚪 Cerrar Sesión"

### Recomendaciones
1. **Cambia la contraseña** antes de deployar
2. No compartas el link `/admin` públicamente
3. Para mayor seguridad, considera implementar autenticación real con Supabase Auth

## 🚀 Uso típico

### Workflow recomendado:

1. **Recibe notificación** de nuevo mensaje
   - Los mensajes llegan con `approved: false` por defecto

2. **Accede al panel admin**
   - Ve a `/admin` en tu navegador

3. **Revisa el mensaje**
   - Lee el nombre y contenido
   - Verifica que no sea spam o inapropiado

4. **Aprueba o elimina**
   - ✅ Aprueba los mensajes genuinos
   - 🗑️ Elimina spam o mensajes inapropiados

5. **El mensaje aparece**
   - Los mensajes aprobados aparecen inmediatamente en la página pública

## 💡 Tips

- **Revisa regularmente**: Configura recordatorios para revisar mensajes
- **Usa el tab de aprobados**: Para verificar qué mensajes están públicos
- **Aprovecha el auto-refresh**: Deja la pestaña abierta para ver nuevos mensajes

## 🎨 Personalización

Si quieres personalizar el panel:

### Cambiar colores
Edita las clases de Tailwind en `src/pages/Admin.jsx`

### Cambiar el tiempo de auto-refresh
En el `useEffect` de `AdminPanel`, cambia:
```javascript
const interval = setInterval(fetchMessages, 30000); // 30 segundos
```

### Agregar filtros adicionales
Puedes agregar más queries en la función `fetchMessages()`

## 📱 Responsive

El panel está optimizado para:
- 💻 Desktop
- 📱 Mobile
- 📱 Tablet

## ⚡ Performance

- ✅ Carga rápida
- ✅ Actualización eficiente
- ✅ Sin recargas de página

## 🆘 Troubleshooting

### "No aparecen los mensajes"
- Verifica tu conexión a Supabase
- Verifica que la variable `VITE_APP_TABLE_NAME` esté configurada

### "Error al aprobar"
- Verifica los permisos de tu tabla en Supabase
- Asegúrate de tener una columna `approved` (boolean)

### "No puedo iniciar sesión"
- Verifica que la contraseña sea correcta
- Limpia el localStorage: `localStorage.clear()`

## 📊 Estructura de la base de datos requerida

Tu tabla debe tener estos campos:
```sql
- id (serial/integer)
- name (text)
- message (text)
- color (text)
- approved (boolean) DEFAULT false
- created_at (timestamp) DEFAULT now()
```

## 🎉 ¡Listo!

Ahora puedes gestionar los mensajes de tu boda de forma profesional y sencilla.

---

**Creado con ❤️ para tu boda perfecta**
