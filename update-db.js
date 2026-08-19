import { initializeApp } from 'firebase/app';
import { getFirestore, collection, writeBatch, doc, getDocs } from 'firebase/firestore';

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAbpUOH4D4Q_GyJBV-fgDEo3khkbIMNvZs",
  authDomain: "casinbbdd.firebaseapp.com",
  projectId: "casinbbdd",
  storageBucket: "casinbbdd.firebasestorage.app",
  messagingSenderId: "812853971334",
  appId: "1:812853971334:web:3e16417cca4ef093ce8407"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const MINDMAP_COLLECTION = 'mindmapNodes';

async function updateDatabase() {
  try {
    console.log('🔄 Actualizando base de datos con todos los nodos principales...');
    
    // Eliminar todos los nodos existentes
    const nodesCollectionRef = collection(db, MINDMAP_COLLECTION);
    const snapshot = await getDocs(nodesCollectionRef);
    
    if (!snapshot.empty) {
      const deleteBatch = writeBatch(db);
      snapshot.docs.forEach(docSnap => {
        deleteBatch.delete(docSnap.ref);
      });
      await deleteBatch.commit();
      console.log(`🗑️ Eliminados ${snapshot.size} nodos existentes.`);
    }

    // Importar los nodos actualizados desde el archivo
    const { buildDefaultNodes } = await import('./src/data/defaultNodes.js');
    const defaultNodes = buildDefaultNodes(1024, 768);

    const createBatch = writeBatch(db);
    
    defaultNodes.forEach(node => {
      const nodeRef = doc(nodesCollectionRef, node.id);
      const nodeData = {
        id: node.id,
        title: node.title,
        color: node.color,
        position: node.position,
        content: node.content,
        connections: node.connections,
        ...(node.parentId && { parentId: node.parentId }),
        ...(node.isExpanded !== undefined && { isExpanded: node.isExpanded }),
      };
      createBatch.set(nodeRef, nodeData);
    });

    await createBatch.commit();
    console.log(`✅ Creados ${defaultNodes.length} nuevos nodos.`);
    
    // Log de verificación
    const rootNodes = defaultNodes.filter(n => !n.parentId);
    const childNodes = defaultNodes.filter(n => n.parentId);
    console.log(`📊 Nodos raíz: ${rootNodes.length} (${rootNodes.map(n => n.title).join(', ')})`);
    console.log(`📊 Nodos hijos: ${childNodes.length}`);
    console.log('🎉 ¡Base de datos actualizada con todos los seguros!');
    
  } catch (error) {
    console.error('❌ Error actualizando la base de datos:', error);
    process.exit(1);
  }
}

// Ejecutar la actualización
updateDatabase().then(() => {
  console.log('✨ Proceso completado');
  process.exit(0);
});

