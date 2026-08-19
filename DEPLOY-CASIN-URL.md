# Poner el CASIN sitio en https://casinbbdd.web.app

La URL **casinbbdd.web.app** pertenece al proyecto Firebase **casinbbdd** (no se puede mover a otro proyecto). Para que ahí se vea el sitio de CASIN Seguros (mindmap) de este repo:

## 1. Enlazar el proyecto casinbbdd (solo la primera vez)

En la raíz del proyecto:

```bash
firebase use casinbbdd
```

Si te pide login o elegir proyecto, acepta. Luego vuelve a dejar por defecto sitios:

```bash
firebase use sitios-9b5ac
```

## 2. Build y deploy solo a casinbbdd.web.app

Cada vez que quieras actualizar lo que se ve en **https://casinbbdd.web.app/**:

```bash
npm run build
node post-build.js
npm run deploy:casin
```

Eso:
- Cambia a proyecto **casinbbdd**
- Despliega solo el sitio `casinbbdd` (el CASIN mindmap)
- Vuelve a dejar por defecto **sitios-9b5ac** (para no afectar terapia/mqwfj)

La app en casinbbdd.web.app sigue usando Firestore de **sitios-9b5ac** (datos del mindmap); solo el hosting está en el proyecto casinbbdd.

## Resumen de proyectos

| URL | Proyecto Firebase (hosting) | Dónde desplegar |
|-----|-----------------------------|------------------|
| **casinbbdd.web.app** | casinbbdd | `npm run deploy:casin` (tras build + post-build) |
| terapia-psicologica.web.app, mqwfj.web.app | sitios-9b5ac | `firebase deploy --only hosting` (tras build + post-build) |
