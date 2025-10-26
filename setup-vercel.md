# 🚀 Setup Completo de Vercel

## Paso 1: Verificar que estás en la branch correcta

```bash
cd /c/Users/FrancoLavayen/Documents/Projects/cei-wedding

# Ver tu branch actual
git branch

# Si dice "master", cámbiala a "main"
git branch -M main
```

## Paso 2: Commitear todo (incluyendo vercel.json)

```bash
git add .
git commit -m "Preparar proyecto para Vercel con variables de entorno"
```

## Paso 3: Subir a GitHub

```bash
# Primero crea el repo en GitHub: https://github.com/new
# Nombre sugerido: boda-coco-ivi

# Luego conecta y sube
git remote add origin https://github.com/TU_USUARIO/boda-coco-ivi.git
git push -u origin main
```

## Paso 4: Deploy en Vercel

### Desde la Web (Recomendado):
1. Ve a https://vercel.com
2. Login con GitHub
3. **New Project** → Importa `boda-coco-ivi`
4. **IMPORTANTE:** Antes de hacer clic en "Deploy", expande **"Environment Variables"**
5. Agrega estas 3 variables:

```env
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9jaXd0ZGZ5eWhqZnJhbHp5emxhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEzODgxNTIsImV4cCI6MjA3Njk2NDE1Mn0.GUex2XcYeToe5vgNRJO5Px1YCws9RO1j4yDKPvtvXog

VITE_SUPABASE_URL=https://ociwtdfyyhjfralzyzla.supabase.co

VITE_APP_TABLE_NAME=invitations
```

6. Ahora sí, haz clic en **"Deploy"**
7. ¡Espera 1-2 minutos! ☕

### Desde CLI (Alternativa):
```bash
# Instalar Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy (te pedirá las variables de entorno)
vercel --prod
```

## Paso 5: Configurar Branch de Producción

Después del primer deploy:
1. Ve a tu proyecto en Vercel
2. **Settings** → **Git**
3. Verifica que **"Production Branch"** sea: `main`
4. Activa **"Auto Deploy"**

## Paso 6: Verificar Variables de Entorno

1. En Vercel → **Settings** → **Environment Variables**
2. Deberías ver tus 3 variables
3. Asegúrate que estén en **Production**, **Preview**, y **Development**

---

## 🔄 Workflow de Actualización

### Deploy Directo a Producción (cambios menores):
```bash
git add .
git commit -m "Actualizar info de la boda"
git push origin main
# ✅ Deploy automático a producción en 1-2 min
```

### Deploy con Preview Primero (cambios grandes):
```bash
# Crear branch de prueba
git checkout -b prueba-cambios

# Hacer cambios
git add .
git commit -m "Nuevos cambios para probar"
git push origin prueba-cambios

# Vercel crea Preview URL: boda-coco-ivi-git-prueba-cambios.vercel.app
# Prueba en el preview

# Si todo está bien, mergea a main
git checkout main
git merge prueba-cambios
git push origin main

# ✅ Ahora va a producción
```

---

## 🎯 Tu Dominio Final

Será algo como:
- **Producción:** `boda-coco-ivi.vercel.app` (o el nombre que elijas)
- **Preview branches:** `boda-coco-ivi-git-BRANCH.vercel.app`

Este dominio de producción **NUNCA cambia** 🎉

---

## ⚠️ IMPORTANTE: No Commitear .env

Tu `.env` NO debe subirse a GitHub. Verifica que esté en `.gitignore`:

```bash
# Ver si .env está en gitignore
cat .gitignore | grep .env

# Debería mostrar:
# .env
```

Si el `.env` ya se commiteó antes, removelo:
```bash
git rm --cached .env
git commit -m "Remover .env del repositorio"
git push
```

Las variables las agregas SOLO en Vercel (nunca en GitHub).

---

## 📞 Soporte

Si algo no funciona:
1. Verifica los logs en Vercel → Deployments → Click en el deployment → View Function Logs
2. Verifica que las variables de entorno estén configuradas
3. Verifica que el build funcione local: `npm run build`
