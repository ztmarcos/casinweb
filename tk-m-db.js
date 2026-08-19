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

const MINDMAP_COLLECTION = 'mindmapNodesTkm';

// Nodos para TK_M Tech Solutions
const allNodes = [
  // NODOS PRINCIPALES (RAÍZ)
  {
    id: 'desarrollo-web-main',
    title: 'DESARROLLO WEB INTELIGENTE',
    color: '#2c2c2c',
    position: { x: 0, y: 0 },
    content: 'Sitios web modernos, rápidos y diseñados para crecer contigo. Integramos IA directamente en el corazón de tu plataforma. Tu sitio no solo se ve bien: piensa, predice y actúa.',
    connections: ['dev-tecnologias', 'dev-features', 'dev-integraciones'],
    isExpanded: false,
  },
  {
    id: 'blog-inteligente-main',
    title: 'BLOG INTELIGENTE',
    color: '#1a1a1a',
    position: { x: 0, y: 0 },
    content: 'Un sistema que crea contenido original automáticamente, optimizado para SEO, basado en tu voz y tus temas. Tu blog trabaja solo, 24/7. Tú solo supervisas.',
    connections: ['blog-generacion', 'blog-seo', 'blog-integracion'],
    isExpanded: false,
  },
  {
    id: 'chatbots-main',
    title: 'CHATBOTS A LA MEDIDA',
    color: '#3d3d3d',
    position: { x: 0, y: 0 },
    content: 'Chatbots con personalidad definida, entrenamiento con tus documentos, datos internos y tono único. Bots que entienden tu cosca y responden como tú. Incluye dashboards de análisis y mejoras continuas.',
    connections: ['chat-usos', 'chat-features', 'chat-entrenamiento'],
    isExpanded: false,
  },
  {
    id: 'carteras-main',
    title: 'SISTEMA INTELIGENTE DE CARTERAS',
    color: '#4a4a4a',
    position: { x: 0, y: 0 },
    content: 'Control avanzado de finanzas personales o empresariales, con IA predictiva. Tu dinero, interpretado por inteligencia artificial.',
    connections: ['cart-analisis', 'cart-prediccion', 'cart-integracion'],
    isExpanded: false,
  },

  // NODOS SECUNDARIOS - DESARROLLO WEB
  {
    id: 'dev-tecnologias',
    title: 'Tecnologías',
    color: '#5a5a5a',
    position: { x: 0, y: 0 },
    content: 'Trabajamos con las tecnologías más modernas y robustas:\n\n• React, Next.js y Vite para aplicaciones rápidas y escalables\n• TypeScript para código más seguro y mantenible\n• Tailwind CSS para diseños modernos y responsivos\n• Node.js y Python para backend potente\n• Arquitectura serverless y microservicios',
    connections: [],
    parentId: 'desarrollo-web-main',
    isExpanded: false,
  },
  {
    id: 'dev-features',
    title: 'Características',
    color: '#5a5a5a',
    position: { x: 0, y: 0 },
    content: 'Lo que incluyen nuestros desarrollos:\n\n• Dashboards analíticos con visualización de datos en tiempo real\n• Automatizaciones personalizadas que ahorran tiempo\n• Sistemas de autenticación y autorización seguros\n• Diseño responsive para todos los dispositivos\n• Optimización SEO y rendimiento\n• PWA (Progressive Web Apps) para experiencia móvil nativa',
    connections: [],
    parentId: 'desarrollo-web-main',
    isExpanded: false,
  },
  {
    id: 'dev-integraciones',
    title: 'Integraciones',
    color: '#5a5a5a',
    position: { x: 0, y: 0 },
    content: 'Conectamos tu plataforma con:\n\n• Bases de datos SQL y NoSQL (PostgreSQL, MongoDB, Firebase)\n• APIs REST y GraphQL\n• Servicios de pago (Stripe, PayPal, Mercado Pago)\n• Sistemas de email (SendGrid, Mailchimp)\n• Cloud storage (AWS S3, Google Cloud Storage)\n• Herramientas de analytics (Google Analytics, Mixpanel)',
    connections: [],
    parentId: 'desarrollo-web-main',
    isExpanded: false,
  },

  // NODOS SECUNDARIOS - BLOG INTELIGENTE
  {
    id: 'blog-generacion',
    title: 'Generación Automática',
    color: '#666666',
    position: { x: 0, y: 0 },
    content: 'Sistema de creación de contenido inteligente:\n\n• Generación automática de artículos basados en tus temas\n• Newsletters personalizadas para tu audiencia\n• Guías y tutoriales completos\n• Contenido adaptado a tu voz y estilo de marca\n• Resúmenes automáticos y versiones cortas para redes sociales\n• Traducciones automáticas a múltiples idiomas',
    connections: [],
    parentId: 'blog-inteligente-main',
    isExpanded: false,
  },
  {
    id: 'blog-seo',
    title: 'SEO Inteligente',
    color: '#666666',
    position: { x: 0, y: 0 },
    content: 'Optimización automática para motores de búsqueda:\n\n• Análisis de tendencias y palabras clave relevantes\n• Meta descripciones y títulos optimizados\n• Estructura de contenido SEO-friendly\n• Enlaces internos inteligentes\n• Sugerencias de temas basadas en búsquedas populares\n• Monitoreo de posicionamiento',
    connections: [],
    parentId: 'blog-inteligente-main',
    isExpanded: false,
  },
  {
    id: 'blog-integracion',
    title: 'Integración CMS',
    color: '#666666',
    position: { x: 0, y: 0 },
    content: 'Publicación directa en tu plataforma favorita:\n\n• WordPress\n• Notion\n• Webflow\n• Ghost\n• Medium\n• Substack\n• O tu CMS personalizado\n\nPlan editorial dinámico que se ajusta según el rendimiento del contenido.',
    connections: [],
    parentId: 'blog-inteligente-main',
    isExpanded: false,
  },

  // NODOS SECUNDARIOS - CHATBOTS
  {
    id: 'chat-usos',
    title: 'Casos de Uso',
    color: '#707070',
    position: { x: 0, y: 0 },
    content: 'Aplicaciones de chatbots personalizados:\n\n• Atención a clientes 24/7\n• Ventas automatizadas y calificación de leads\n• Soporte técnico con base de conocimiento\n• Chat para tiendas online con recomendaciones\n• Asistente interno para equipos\n• Onboarding automatizado de usuarios\n• Reservas y citas automáticas',
    connections: [],
    parentId: 'chatbots-main',
    isExpanded: false,
  },
  {
    id: 'chat-features',
    title: 'Características',
    color: '#707070',
    position: { x: 0, y: 0 },
    content: 'Lo que incluyen nuestros chatbots:\n\n• Personalidad y tono definidos según tu marca\n• Respuestas contextuales e inteligentes\n• Integración con tu base de datos\n• Soporte multicanal (web, WhatsApp, Telegram, Slack)\n• Dashboard de análisis y métricas\n• Mejora continua con machine learning\n• Escalado automático según demanda',
    connections: [],
    parentId: 'chatbots-main',
    isExpanded: false,
  },
  {
    id: 'chat-entrenamiento',
    title: 'Entrenamiento',
    color: '#707070',
    position: { x: 0, y: 0 },
    content: 'Entrenamos tu chatbot con:\n\n• Documentación interna de tu empresa\n• FAQs y bases de conocimiento\n• Conversaciones históricas\n• Catálogos de productos/servicios\n• Políticas y procedimientos\n• Datos estructurados de tu negocio\n\nEl bot aprende continuamente de cada interacción.',
    connections: [],
    parentId: 'chatbots-main',
    isExpanded: false,
  },

  // NODOS SECUNDARIOS - SISTEMA DE CARTERAS
  {
    id: 'cart-analisis',
    title: 'Análisis Financiero',
    color: '#7a7a7a',
    position: { x: 0, y: 0 },
    content: 'Control inteligente de tus finanzas:\n\n• Resumen automático de ingresos y gastos\n• Clasificación inteligente de transacciones\n• Visualización de patrones de gasto\n• Comparativas mes a mes\n• Identificación de gastos innecesarios\n• Reportes personalizados\n• Alertas de gastos inusuales',
    connections: [],
    parentId: 'carteras-main',
    isExpanded: false,
  },
  {
    id: 'cart-prediccion',
    title: 'IA Predictiva',
    color: '#7a7a7a',
    position: { x: 0, y: 0 },
    content: 'Inteligencia artificial aplicada a tus finanzas:\n\n• Proyecciones financieras basadas en comportamiento\n• Recomendaciones personalizadas de ahorro\n• Análisis de riesgo de inversiones\n• Predicción de flujo de caja\n• Alertas preventivas de problemas financieros\n• Sugerencias de optimización fiscal',
    connections: [],
    parentId: 'carteras-main',
    isExpanded: false,
  },
  {
    id: 'cart-integracion',
    title: 'Integraciones',
    color: '#7a7a7a',
    position: { x: 0, y: 0 },
    content: 'Conecta con tus herramientas financieras:\n\n• APIs bancarias para sincronización automática\n• Google Sheets y Excel\n• Plataformas de inversión\n• Software de contabilidad (QuickBooks, Xero)\n• Tarjetas de crédito y débito\n• Criptomonedas y wallets digitales\n• Exportación a formatos estándar (CSV, PDF)',
    connections: [],
    parentId: 'carteras-main',
    isExpanded: false,
  },

  // NODOS ADICIONALES - INFORMACIÓN GENERAL
  {
    id: 'diferenciadores-main',
    title: 'QUÉ NOS HACE DIFERENTES',
    color: '#333333',
    position: { x: 0, y: 0 },
    content: 'No somos una agencia más. Somos especialistas en IA aplicada:\n\n• IA construida a medida, no plantillas genéricas\n• Enfoque en diseño limpio + rendimiento óptimo\n• Integraciones reales con tus herramientas actuales\n• Seguridad y privacidad por defecto\n• Desarrollo modular que puedes expandir con el tiempo\n• Branding y narrativa tecnológica coherente\n\nAquí no solo codificamos: resolvemos problemas reales.',
    connections: [],
    isExpanded: false,
  },
  {
    id: 'proceso-main',
    title: 'PROCESO DE TRABAJO',
    color: '#404040',
    position: { x: 0, y: 0 },
    content: 'Metodología clara y transparente:\n\n1. EXPLORACIÓN — Entendemos tu proyecto, metas y estilo\n2. DISEÑO INTELIGENTE — Arquitectura técnica y propuesta visual\n3. DESARROLLO — Construcción del sistema y entrenamiento de IA\n4. INTEGRACIÓN — Conexión con tus datos, CMS o APIs\n5. ENTREGA + CAPACITACIÓN — Te enseñamos a aprovecharlo al máximo\n6. EVOLUCIÓN CONTINUA — Opcional: mantenimiento e IA avanzada\n\nTrabajamos en sprints cortos con entregas frecuentes.',
    connections: [],
    isExpanded: false,
  },
  {
    id: 'para-quien-main',
    title: 'PARA QUIÉN ES',
    color: '#2a2a2a',
    position: { x: 0, y: 0 },
    content: 'Nuestros servicios son ideales para:\n\n• Emprendedores y creadores de contenido\n• Negocios que necesitan automatizar procesos\n• Equipos que generan mucho contenido\n• Empresas que quieren chatbots personalizados\n• Personas que desean control inteligente de sus finanzas\n• Agencias que necesitan infraestructura o IA detrás de sus servicios\n• Startups que buscan ventaja tecnológica\n\nSi buscas innovación real, este es tu lugar.',
    connections: [],
    isExpanded: false,
  },
  {
    id: 'planes-main',
    title: 'PLANES Y SERVICIOS',
    color: '#505050',
    position: { x: 0, y: 0 },
    content: 'Opciones flexibles según tu necesidad:\n\n🚀 STARTER\nIdeal para proyectos pequeños\n• Sitio web básico\n• Blog inteligente (1 tema/mes)\n• Chatbot simple\n• Integración ligera\n\n💼 PRO\nPara negocios en crecimiento\n• Web app completa\n• Blog inteligente continuo\n• Chatbot entrenado con tus datos\n• Dashboard financiero\n\n🏢 ENTERPRISE\nSoluciones personalizadas\n• IA avanzada\n• Apps internas\n• Sistemas financieros complejos\n• Integraciones avanzadas\n\nContacta para cotización personalizada.',
    connections: [],
    isExpanded: false,
  },
];

async function uploadNodes() {
  try {
    console.log('🔄 Iniciando carga de nodos para TK_M...');
    
    // Primero, eliminar todos los nodos existentes
    const existingSnapshot = await getDocs(collection(db, MINDMAP_COLLECTION));
    
    if (!existingSnapshot.empty) {
      console.log(`🗑️  Eliminando ${existingSnapshot.size} nodos existentes...`);
      const deleteBatch = writeBatch(db);
      existingSnapshot.docs.forEach(doc => {
        deleteBatch.delete(doc.ref);
      });
      await deleteBatch.commit();
      console.log('✅ Nodos existentes eliminados');
    }

    // Ahora subir los nuevos nodos
    console.log(`📤 Subiendo ${allNodes.length} nodos nuevos...`);
    
    const batch = writeBatch(db);
    allNodes.forEach(node => {
      const docRef = doc(db, MINDMAP_COLLECTION, node.id);
      batch.set(docRef, node);
    });

    await batch.commit();
    console.log('✅ Todos los nodos se han subido correctamente a Firebase');
    console.log(`📊 Total de nodos: ${allNodes.length}`);
    console.log(`📍 Colección: ${MINDMAP_COLLECTION}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error al subir nodos:', error);
    process.exit(1);
  }
}

uploadNodes();






