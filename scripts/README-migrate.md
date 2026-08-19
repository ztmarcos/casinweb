# Migrar contenido (mindmap) a sitios-9b5ac

El contenido de CASIN y Terapia sigue en el proyecto **casinbbdd**. La app ya solo usa **sitios-9b5ac**, por eso no ves nada. Este script **copia** esos datos a sitios-9b5ac. **No modifica ni borra nada en casinbbdd.**

## Pasos (solo una vez)

### 1. Descargar claves de cuenta de servicio

- **Origen (solo lectura):**  
  [Firebase Console → casinbbdd](https://console.firebase.google.com/project/casinbbdd/settings/serviceaccounts/adminsdk) → **Service accounts** → **Generate new private key** → guarda el JSON (ej. `casinbbdd-key.json`).

- **Destino (escritura):**  
  [Firebase Console → sitios-9b5ac](https://console.firebase.google.com/project/sitios-9b5ac/settings/serviceaccounts/adminsdk) → **Service accounts** → **Generate new private key** → guarda el JSON (ej. `sitios-key.json`).

### 2. Ejecutar la migración

Pon los JSON en una carpeta (por ejemplo el escritorio) y ejecuta:

```bash
ORIGEN_KEY=/ruta/a/casinbbdd-key.json DESTINO_KEY=/ruta/a/sitios-key.json npm run migrate:to-sitios
```

O desde la raíz del proyecto:

```bash
node scripts/migrate-firestore-to-sitios.mjs
```

(El script busca por defecto `scripts/casinbbdd-key.json` y `scripts/sitios-key.json` si no defines `ORIGEN_KEY` y `DESTINO_KEY`.)

### 3. Comprobar

Abre de nuevo **terapia-psicologica.web.app** y **casinbbdd.web.app** (o casinseguros.com). Deberían cargar el mindmap con el contenido copiado a sitios-9b5ac.

---

**Importante:** No subas los archivos `*-key.json` a Git (ya están en `.gitignore`). Puedes borrar los JSON y el script después de migrar.
