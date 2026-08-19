/**
 * Migración única: COPIA datos de Firestore (solo lectura en origen)
 * desde casinbbdd → sitios-9b5ac usando Firebase Admin SDK.
 * No modifica ni borra nada en casinbbdd.
 *
 * Necesitas dos archivos JSON de cuenta de servicio:
 * - Origen (casinbbdd): Firebase Console → casinbbdd → Project settings → Service accounts → Generate new private key
 * - Destino (sitios-9b5ac): Firebase Console → sitios-9b5ac → Project settings → Service accounts → Generate new private key
 *
 * Uso:
 *   ORIGEN_KEY=./casinbbdd-key.json DESTINO_KEY=./sitios-key.json node scripts/migrate-firestore-to-sitios.mjs
 *   (o npm run migrate:to-sitios después de exportar ORIGEN_KEY y DESTINO_KEY)
 */

import admin from 'firebase-admin';
import { readFileSync } from 'fs';

const root = process.cwd();
const pathOrigen = process.env.ORIGEN_KEY || root + '/casinbbdd-firebase-adminsdk-hnwk0-73d6da7e2b.json';
const pathDestino = process.env.DESTINO_KEY || root + '/sitios-9b5ac-firebase-adminsdk-fbsvc-e335c62601.json';

function loadKey(path) {
  try {
    return JSON.parse(readFileSync(path, 'utf8'));
  } catch (e) {
    console.error('No se pudo cargar la clave:', path, e.message);
    console.error('Crea las claves en Firebase Console (Service accounts → Generate new private key) y usa:');
    console.error('  ORIGEN_KEY=./ruta/casinbbdd-key.json DESTINO_KEY=./ruta/sitios-key.json node scripts/migrate-firestore-to-sitios.mjs');
    process.exit(1);
  }
}

const keyOrigen = loadKey(pathOrigen);
const keyDestino = loadKey(pathDestino);

const appOrigen = admin.initializeApp({ credential: admin.credential.cert(keyOrigen) }, 'origen');
const appDestino = admin.initializeApp({ credential: admin.credential.cert(keyDestino) }, 'destino');
const dbOrigen = admin.firestore(appOrigen);
const dbDestino = admin.firestore(appDestino);

async function copiarColeccion(nombreColeccion) {
  console.log(`\n📂 Leyendo "${nombreColeccion}" desde casinbbdd (solo lectura)...`);
  const snapshot = await dbOrigen.collection(nombreColeccion).get();
  if (snapshot.empty) {
    console.log(`   (vacía en origen, nada que copiar)`);
    return 0;
  }
  console.log(`   Encontrados ${snapshot.docs.length} documentos. Escribiendo en sitios-9b5ac...`);
  const batch = dbDestino.batch();
  snapshot.docs.forEach(docSnap => {
    const refDestino = dbDestino.collection(nombreColeccion).doc(docSnap.id);
    batch.set(refDestino, docSnap.data());
  });
  await batch.commit();
  console.log(`   ✅ Copiados ${snapshot.docs.length} documentos a sitios-9b5ac.`);
  return snapshot.docs.length;
}

async function main() {
  console.log('Migración Firestore: casinbbdd (solo lectura) → sitios-9b5ac (escritura)');
  console.log('No se modifica nada en casinbbdd.\n');
  try {
    const a = await copiarColeccion('mindmapNodes');
    const b = await copiarColeccion('mindmapNodesTerapia');
    console.log('\n✅ Migración terminada. Total:', a + b, 'documentos.');
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
  process.exit(0);
}

main();
