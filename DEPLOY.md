# 💒 Invitación de Boda - Bruno & Ivana

Sitio web de invitación de boda con información del evento, ubicaciones y confirmación de asistencia.

## 🚀 Despliegue en Vercel

### Opción 1: Despliegue desde GitHub (Recomendado)

1. **Sube tu código a GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/TU_USUARIO/cei-wedding.git
   git push -u origin main
   ```

2. **Despliega en Vercel:**
   - Ve a [vercel.com](https://vercel.com)
   - Haz clic en "Add New Project"
   - Importa tu repositorio de GitHub
   - Vercel detectará automáticamente Vite
   - Haz clic en "Deploy"

3. **Tu dominio estará listo:**
   - Dominio gratuito: `tu-proyecto.vercel.app`
   - El dominio permanece fijo incluso con redeploys
   - Cada push a main despliega automáticamente

### Opción 2: Despliegue con Vercel CLI

```bash
# Instalar Vercel CLI
npm i -g vercel

# Login en Vercel
vercel login

# Desplegar (primera vez)
vercel

# Desplegar a producción
vercel --prod
```

### 🌐 Dominio Personalizado (Opcional)

Si quieres un dominio personalizado como `bodadecocoevi.com`:

1. En Vercel, ve a tu proyecto → Settings → Domains
2. Agrega tu dominio personalizado
3. Sigue las instrucciones de configuración DNS

**Opciones de dominio:**
- ✅ **Gratuito:** `bodadecocoevi.vercel.app` (permanente)
- 💰 **Personalizado:** `bodadecocoevi.com` (~$12 USD/año)

### 📝 Ventajas de Vercel

✅ **Dominio fijo** - Nunca cambia, incluso con redeploys  
✅ **SSL gratis** - HTTPS automático  
✅ **Deploy automático** - Cada push despliega automáticamente  
✅ **Rollback fácil** - Vuelve a versiones anteriores en 1 click  
✅ **Preview URLs** - URLs únicas para cada rama/PR  
✅ **CDN global** - Rápido en todo el mundo  
✅ **100% gratis** para proyectos personales  

### 🔄 Actualizar el sitio

```bash
# Haz tus cambios
git add .
git commit -m "Actualizar información"
git push

# Vercel despliega automáticamente en 1-2 minutos
```

### 📱 Variables de Entorno

Si usas Supabase u otras APIs:

1. En Vercel → Settings → Environment Variables
2. Agrega tus variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - etc.

## 🛠️ Desarrollo Local

```bash
# Instalar dependencias
npm install

# Correr en desarrollo
npm run dev

# Build de producción
npm run build

# Preview del build
npm run preview
```

## 📦 Otras Opciones de Hosting

Si prefieres otras plataformas:

### **Netlify** (Similar a Vercel)
- Drag & drop de carpeta `dist`
- También ofrece dominio gratuito `.netlify.app`

### **GitHub Pages** (Gratis)
```bash
npm run build
# Sube la carpeta dist
```

### **Firebase Hosting** (Gratis)
```bash
npm install -g firebase-tools
firebase login
firebase init hosting
firebase deploy
```

## 📞 Configuración WhatsApp

Actualiza los números en `src/data/config.json`:
```json
{
  "gifts": {
    "groom": {
      "whatsappNumber": "5493885130544"
    },
    "bride": {
      "whatsappNumber": "5493885747152"
    }
  }
}
```

---

Hecho con ❤️ para Coco e Ivi
