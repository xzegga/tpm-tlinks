# TPM-Tlinks – Administrador de Proyectos de Traducción

Este proyecto es un **Administrador de Proyectos de Traducción** desarrollado sobre **Firebase** (Hosting, Firestore y Functions) con frontend en **Vite/React** y backend en **Firebase Functions (TypeScript)**.  
El objetivo principal es gestionar proyectos de traducción, sus estados, usuarios y flujos de trabajo de forma eficiente.

---

## 🚀 Instalación de dependencias

Puedes instalar dependencias de dos formas:

### Opción rápida con script

```bash
npm run installdev
```

Este script ejecuta:

- `npm i` en el proyecto raíz
- `npm i` dentro de la carpeta `functions`
- instala globalmente `firebase-tools`

### Opción manual

```bash
npm install
cd functions
npm install
npm install -g firebase-tools
```

---

## ⚙️ Variables de entorno

Debes crear los archivos de entorno en la raíz del proyecto:

- `.env.local` → para desarrollo local con emuladores
- `.env.development` → para entorno de desarrollo (dev)
- `.env.production` → para entorno de producción

Ejemplo de contenido:

```env
VITE_API_KEY=AIzaSyXXXXXXX
VITE_AUTH_DOMAIN=project-id.firebaseapp.com
VITE_PROJECT_ID=project-id
VITE_STORAGE_BUCKET=project-id.appspot.com
VITE_MESSAGING_SENDER_ID=1234567890
VITE_APP_ID=1:1234567890:web:abcdef123456
```

_(para producción reemplaza con los valores del proyecto prod)_

---

## 🔑 Configuración de Firebase Functions

Las Functions **no leen archivos `.env`**, sino que usan configuración propia de Firebase.

### Para Dev

```bash
firebase functions:config:set app.key="xxxxx" --project tpm-tlinks-dev
```

### Para Producción

```bash
firebase functions:config:set app.key="yyyyy" --project tpm-tlinks
```

Puedes verificar lo guardado con:

```bash
firebase functions:config:get --project tpm-tlinks-dev
firebase functions:config:get --project tpm-tlinks
```

---

## 🖥️ Trabajo en local

1. Instalar dependencias:
   ```bash
   npm run installdev
   ```
2. Crear un archivo `.env.local` con las credenciales del proyecto de desarrollo.
3. Levantar los emuladores de Firebase:
   ```bash
   firebase emulators:start
   ```
4. Correr el frontend en paralelo:
   ```bash
   npm run dev
   ```

---

## 📦 Deploy

### Deploy solo frontend (Hosting)

#### Dev

```bash
npm run build:dev
firebase use dev
firebase deploy --only hosting
```

#### Producción

```bash
npm run build
firebase use default
firebase deploy --only hosting
```

---

### Deploy Functions

#### Dev

```bash
firebase use dev
npm run build:functions   # si defines un script para compilar las functions con tsc
firebase deploy --only functions
```

#### Producción

```bash
firebase use default
npm run build:functions
firebase deploy --only functions
```

---

### Deploy completo (App + Functions)

#### Dev

```bash
npm run build:dev
firebase use dev
firebase deploy
```

#### Producción

```bash
npm run build
firebase use default
firebase deploy
```

---

## 📌 Notas finales

- El archivo `firestore.indexes.json` en la raíz define los índices requeridos por Firestore.
- Usa `firebase deploy --only firestore:indexes` **solo en dev** para crear/actualizar los índices.
- En prod ya están creados y no es necesario redeployarlos.
- Para evitar confusión, usa siempre `firebase use dev` o `firebase use default` antes de desplegar.
