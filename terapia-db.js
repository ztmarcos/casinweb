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

const MINDMAP_COLLECTION = 'mindmapNodesTerapia';

// Nodos para Terapia Psicológica
const allNodes = [
  // NODOS PRINCIPALES (RAÍZ)
  {
    id: 'emociones-main',
    title: 'COMPRENDIENDO LAS EMOCIONES',
    color: '#4ade80',
    position: { x: 0, y: 0 },
    content: 'Las emociones son como las luces de un semáforo en nuestra vida diaria. Cuando algo sucede, ya sea bueno o malo, nuestras emociones se encienden y nos dan una respuesta. Por ejemplo, si recibes una buena noticia, puedes sentir alegría, y si algo te preocupa, puedes sentir ansiedad. Estas reacciones son tanto psicológicas como físicas.',
    connections: ['emociones-diferencias', 'emociones-salud'],
    isExpanded: false,
    image: '/terapia2.png',
  },
  {
    id: 'problemas-main',
    title: 'PROBLEMAS EMOCIONALES',
    color: '#22c55e',
    position: { x: 0, y: 0 },
    content: 'Los problemas emocionales son respuestas naturales que pueden volverse abrumadoras cuando no se gestionan adecuadamente. Reconocer y comprender estos estados es el primer paso para recuperar el bienestar emocional.',
    connections: ['prob-ansiedad', 'prob-depresion', 'prob-estres', 'prob-ira', 'prob-tristeza', 'prob-autoestima', 'prob-soledad'],
    isExpanded: false,
    image: '/terapia4.png',
  },
  {
    id: 'relaciones-main',
    title: 'RELACIONES Y EMOCIONES',
    color: '#16a34a',
    position: { x: 0, y: 0 },
    content: 'Las relaciones sanas, tanto con la pareja como con la familia, se construyen sobre pilares de respeto mutuo, comunicación y autonomía individual. Requieren esfuerzo constante y un compromiso de ambas partes para crecer juntos.',
    connections: ['rel-pareja', 'rel-factores', 'rel-toxicas'],
    isExpanded: false,
    image: '/terapia7.png',
  },
  {
    id: 'herramientas-main',
    title: 'HERRAMIENTAS PRÁCTICAS',
    color: '#10b981',
    position: { x: 0, y: 0 },
    content: 'Técnicas y estrategias que puedes aplicar en tu día a día para mejorar tu bienestar emocional, reducir el estrés y fortalecer tu salud mental.',
    connections: ['herr-respiracion', 'herr-mindfulness', 'herr-escritura', 'herr-ejercicio', 'herr-habitos'],
    isExpanded: false,
    image: '/terapia3.png',
  },
  {
    id: 'recursos-main',
    title: 'RECURSOS DE AUTOAYUDA',
    color: '#14b8a6',
    position: { x: 0, y: 0 },
    content: 'Materiales y contenidos recomendados para profundizar en tu crecimiento personal y bienestar emocional.',
    connections: ['rec-libros', 'rec-videos'],
    isExpanded: false,
    image: '/terapia6.png',
  },
  {
    id: 'ayuda-main',
    title: 'CUÁNDO BUSCAR AYUDA',
    color: '#06b6d4',
    position: { x: 0, y: 0 },
    content: 'Es importante reconocer cuándo necesitas apoyo profesional. Si no te sientes bien contigo mismo o con el mundo, buscar ayuda es un acto de valentía y autocuidado.\n\n📱 WhatsApp: 52-5540838451\n📧 Email: aescalantemg@gmail.com',
    connections: ['ayuda-senales'],
    isExpanded: false,
    image: '/terapia1.png',
  },

  // NODOS HIJOS DE EMOCIONES
  {
    id: 'emociones-diferencias',
    title: 'Diferencias Clave',
    color: '#86efac',
    position: { x: 0, y: 0 },
    content: 'EMOCIÓN: Es una reacción rápida e intensa. Por ejemplo, si alguien te sorprende con un regalo, sientes alegría de inmediato. Las emociones son como un fogonazo.\n\nSENTIMIENTO: Es más profundo y duradero. Surge de las emociones, pero se queda con nosotros por más tiempo. Por ejemplo, después de recibir ese regalo, puedes sentir amor o gratitud.\n\nESTADO DE ÁNIMO: Es el clima emocional general. Por ejemplo, puedes estar de buen humor todo el día o sentirte un poco triste sin saber exactamente por qué.',
    connections: ['emociones-main'],
    parentId: 'emociones-main',
  },
  {
    id: 'emociones-salud',
    title: 'Impacto en la Salud',
    color: '#4ade80',
    position: { x: 0, y: 0 },
    content: 'Las emociones afectan significativamente nuestra salud física y mental:\n\n• SALUD MENTAL: Mantener hábitos saludables como la relajación, el ejercicio y el buen descanso ayuda a conservar el equilibrio emocional.\n\n• ESTRÉS FÍSICO: Las emociones negativas pueden activar la respuesta de "lucha o huida", liberando cortisol y causando hipertensión, problemas cardíacos y digestivos.\n\n• SISTEMA INMUNOLÓGICO: Un estado de ánimo positivo fortalece las defensas del cuerpo.\n\n• COMPORTAMIENTOS: Las emociones influyen en nuestras decisiones de salud, ejercicio y alimentación.',
    connections: ['emociones-main'],
    parentId: 'emociones-main',
  },

  // NODOS HIJOS DE PROBLEMAS EMOCIONALES
  {
    id: 'prob-ansiedad',
    title: 'Ansiedad',
    color: '#34d399',
    position: { x: 0, y: 0 },
    content: 'La ansiedad es una anticipación exagerada del peligro que lleva a la mente a enfocarse en escenarios negativos y al cuerpo a mantenerse en alerta.\n\nEJEMPLO: Roberto, un diseñador gráfico, experimenta ansiedad cuando recibe un correo crítico de su jefe. Su mente se llena de pensamientos catastróficos sobre el futuro, mientras su cuerpo reacciona con palpitaciones y tensión. La ansiedad le impide concentrarse y resolver el problema.\n\n💡 Te invito a considerar terapia psicológica:\n📱 WhatsApp: 52-5540838451\n📧 aescalantemg@gmail.com',
    connections: ['problemas-main'],
    parentId: 'problemas-main',
  },
  {
    id: 'prob-depresion',
    title: 'Depresión',
    color: '#22c55e',
    position: { x: 0, y: 0 },
    content: 'La depresión es un trastorno del estado de ánimo que va más allá de la tristeza común y afecta la vida diaria.\n\nSÍNTOMAS:\n• Tristeza persistente\n• Falta de interés en actividades\n• Fatiga constante\n• Problemas de sueño\n• Sentimientos de culpa\n• Aislamiento social\n\nSi no se busca ayuda profesional, los síntomas pueden volverse crónicos. Cada tipo de depresión requiere tratamiento adecuado.\n\n💡 Te invito a considerar terapia psicológica:\n📱 WhatsApp: 52-5540838451\n📧 aescalantemg@gmail.com',
    connections: ['problemas-main'],
    parentId: 'problemas-main',
  },
  {
    id: 'prob-estres',
    title: 'Estrés',
    color: '#16a34a',
    position: { x: 0, y: 0 },
    content: 'El estrés es la respuesta del cuerpo cuando percibe que las demandas superan sus recursos.\n\nEUSTRÉS (positivo): En pequeñas dosis ayuda a concentrarse y rendir mejor.\n\nESTRÉS CRÓNICO: Cuando se mantiene continuamente, provoca agotamiento, irritabilidad y síntomas físicos.\n\nEJEMPLO: Juan, diseñador gráfico, transforma el estrés de una tarea urgente usando respiración, organización de prioridades y asertividad para negociar plazos.\n\n💡 Te invito a considerar terapia psicológica:\n📱 WhatsApp: 52-5540838451\n📧 aescalantemg@gmail.com',
    connections: ['problemas-main'],
    parentId: 'problemas-main',
  },
  {
    id: 'prob-ira',
    title: 'Ira y Frustración',
    color: '#10b981',
    position: { x: 0, y: 0 },
    content: 'Manejar la ira y la frustración consiste en reconocer que son respuestas naturales ante la pérdida de control o un obstáculo. La clave es no reaccionar de forma impulsiva, sino responder con conciencia.\n\nESTRATEGIA: Reconoce tu emoción y detén la reacción automática diciéndote: "Estoy sintiendo frustración e ira". Esto te permite mantener el control y no actuar impulsivamente.\n\n💡 Te invito a considerar terapia psicológica:\n📱 WhatsApp: 52-5540838451\n📧 aescalantemg@gmail.com',
    connections: ['problemas-main'],
    parentId: 'problemas-main',
  },
  {
    id: 'prob-tristeza',
    title: 'Tristeza y Duelo',
    color: '#4ade80',
    position: { x: 0, y: 0 },
    content: 'La tristeza se manifiesta como:\n• Un nudo en el estómago\n• Desánimo general\n• Dificultad para concentrarse\n• Ganas de llorar\n• Aislamiento social\n• Pensamientos negativos sobre uno mismo\n• Sensación de que el esfuerzo no vale la pena\n\nEs importante reconocer estos síntomas y buscar apoyo cuando la tristeza persiste.\n\n💡 Te invito a considerar terapia psicológica:\n📱 WhatsApp: 52-5540838451\n📧 aescalantemg@gmail.com',
    connections: ['problemas-main'],
    parentId: 'problemas-main',
  },
  {
    id: 'prob-autoestima',
    title: 'Baja Autoestima',
    color: '#86efac',
    position: { x: 0, y: 0 },
    content: 'La baja autoestima es la tendencia a verse a uno mismo de forma negativa, sintiendo que se es menos capaz o valioso que los demás.\n\nAFECTA:\n• La toma de decisiones\n• Las relaciones interpersonales\n• El bienestar general\n• La confianza en uno mismo\n\n💡 Te invito a considerar terapia psicológica:\n📱 WhatsApp: 52-5540838451\n📧 aescalantemg@gmail.com',
    connections: ['problemas-main'],
    parentId: 'problemas-main',
  },
  {
    id: 'prob-soledad',
    title: 'Soledad',
    color: '#16a34a',
    position: { x: 0, y: 0 },
    content: 'Sentirse solo es una emoción humana común y una señal de que necesitas más conexión social o una conexión más profunda contigo mismo.\n\nESTRATEGIAS:\n• Reconoce y acepta la emoción\n• Busca conexiones significativas\n• Cultiva la relación contigo mismo\n• Participa en actividades grupales\n• Busca apoyo profesional si persiste\n\n💡 Te invito a considerar terapia psicológica:\n📱 WhatsApp: 52-5540838451\n📧 aescalantemg@gmail.com',
    connections: ['problemas-main'],
    parentId: 'problemas-main',
  },

  // NODOS HIJOS DE RELACIONES
  {
    id: 'rel-pareja',
    title: 'Pareja y Familia',
    color: '#22c55e',
    position: { x: 0, y: 0 },
    content: 'Las relaciones sanas se construyen sobre pilares fundamentales:\n\n• Respeto mutuo\n• Comunicación abierta y honesta\n• Autonomía individual\n• Confianza y apoyo mutuo\n• Límites saludables\n\nEJEMPLO: Laura y Miguel enfrentan conflictos con comunicación y respeto. Laura pone límites a su madre con apoyo de Miguel. Ante una posible mudanza, dialogan y llegan a un acuerdo equilibrado.\n\n💡 También ofrezco terapia de pareja:\n📱 WhatsApp: 52-5540838451\n📧 aescalantemg@gmail.com',
    connections: ['relaciones-main'],
    parentId: 'relaciones-main',
  },
  {
    id: 'rel-factores',
    title: 'Factores Clave',
    color: '#34d399',
    position: { x: 0, y: 0 },
    content: 'COMUNICACIÓN EFECTIVA:\n• Escucha activa\n• Honestidad\n• Asertividad para expresar necesidades\n\nRESPETO Y LÍMITES:\n• Valorar la identidad del otro\n• Preservar el espacio personal\n• Establecer reglas claras de convivencia\n\nCONFIANZA Y APOYO:\n• Actuar como un equipo\n• Validar las emociones\n• Fomentar el perdón y la responsabilidad',
    connections: ['relaciones-main'],
    parentId: 'relaciones-main',
  },
  {
    id: 'rel-toxicas',
    title: 'Relaciones Tóxicas',
    color: '#22c55e',
    position: { x: 0, y: 0 },
    content: 'IDENTIFICAR DEPENDENCIA EMOCIONAL:\n• Subordinación constante\n• Idealización de la pareja\n• Anulación del yo propio\n• Asimetría en la relación\n\nCÓMO ROMPER EL PATRÓN:\n1. Reconocer el problema\n2. Dejar de idealizar\n3. Recuperar la autoestima\n4. Establecer límites sanos\n5. Buscar terapia profesional\n6. Si es necesario, romper el vínculo\n\n💡 Te invito a considerar terapia psicológica:\n📱 WhatsApp: 52-5540838451\n📧 aescalantemg@gmail.com',
    connections: ['relaciones-main'],
    parentId: 'relaciones-main',
  },

  // NODOS HIJOS DE HERRAMIENTAS
  {
    id: 'herr-respiracion',
    title: 'Respiración 4-7-8',
    color: '#4ade80',
    position: { x: 0, y: 0 },
    content: 'Técnica sencilla y eficaz para calmar el sistema nervioso:\n\n1️⃣ Inhala por la nariz contando hasta 4\n2️⃣ Retén el aire suavemente contando hasta 7\n3️⃣ Exhala lentamente por la boca contando hasta 8\n\nRepite de 3 a 4 veces.\n\nBENEFICIOS:\n• Calma el sistema nervioso\n• Reduce la ansiedad\n• Centra la mente en el presente\n• Disminuye el estrés',
    connections: ['herramientas-main'],
    parentId: 'herramientas-main',
  },
  {
    id: 'herr-mindfulness',
    title: 'Mindfulness y Meditación',
    color: '#4ade80',
    position: { x: 0, y: 0 },
    content: 'PRÁCTICA BÁSICA (5-10 minutos):\n\n1️⃣ Encuentra un lugar tranquilo\n• Siéntate cómodamente\n• Espalda recta, pies apoyados\n• Cierra los ojos o suaviza la mirada\n\n2️⃣ Enfoca tu atención en la respiración\n• Observa cómo el aire entra y sale\n• No intentes controlarlo\n• Siente el ritmo natural\n\n3️⃣ Regresa al presente cuando te distraigas\n• Reconoce la distracción\n• Vuelve a concentrarte en la respiración\n\nRESULTADO: Sensación de calma y claridad mental',
    connections: ['herramientas-main'],
    parentId: 'herramientas-main',
  },
  {
    id: 'herr-escritura',
    title: 'Escritura Terapéutica',
    color: '#86efac',
    position: { x: 0, y: 0 },
    content: 'DIARIO EMOCIONAL - 3 PASOS:\n\n1️⃣ Elige un tema o emoción\n• Escribe sobre algo que te preocupa\n• O algo que quieres comprender mejor\n\n2️⃣ Escribe sin censura (10-15 minutos)\n• Deja fluir tus pensamientos\n• No te preocupes por ortografía u orden\n• Sé honesto contigo mismo\n\n3️⃣ Reflexiona y libera\n• Lee lo que escribiste\n• Nota qué sientes\n• Puedes guardar, releer o romper el texto\n\nBENEFICIO: Ayuda a procesar emociones y ganar claridad',
    connections: ['herramientas-main'],
    parentId: 'herramientas-main',
  },
  {
    id: 'herr-ejercicio',
    title: 'Actividad Física',
    color: '#16a34a',
    position: { x: 0, y: 0 },
    content: 'EJERCICIOS PARA LIBERAR ESTRÉS:\n\n🚶 CAMINATA RÁPIDA (20 minutos)\n• Despeja la mente\n• Mejora el ánimo\n• Aumenta energía\n\n🧘 ESTIRAMIENTOS O YOGA SUAVE\n• Relaja músculos\n• Reduce tensión\n• Mejora flexibilidad\n\n💃 BAILE LIBRE\n• Libera emociones\n• Activa endorfinas\n• Divierte y relaja\n\nSOLO 10-20 MINUTOS bastan para sentirte más relajado y con energía positiva.',
    connections: ['herramientas-main'],
    parentId: 'herramientas-main',
  },
  {
    id: 'herr-habitos',
    title: 'Hábitos Saludables',
    color: '#22c55e',
    position: { x: 0, y: 0 },
    content: 'PILARES DEL BIENESTAR:\n\n🥗 ALIMENTACIÓN EQUILIBRADA\n• Frutas y verduras\n• Alimentos naturales\n• Hidratación adecuada\n\n💤 DORMIR BIEN\n• 7-8 horas de sueño reparador\n• Rutina de descanso\n\n🧘‍♀️ MOVER EL CUERPO\n• Actividad física regular\n• Caminar, bailar o yoga\n\n🧠 CUIDAR LA MENTE\n• Meditar\n• Escribir\n• Practicar gratitud\n\n🤝 CONECTAR CON OTROS\n• Relaciones sanas\n• Apoyo emocional',
    connections: ['herramientas-main'],
    parentId: 'herramientas-main',
  },

  // NODOS HIJOS DE RECURSOS
  {
    id: 'rec-libros',
    title: 'Libros Recomendados',
    color: '#16a34a',
    position: { x: 0, y: 0 },
    content: 'LECTURAS PARA TU CRECIMIENTO:\n\n📚 "Pensar bien, sentirse bien"\nAutor: Walter Riso\nTema: Gestión de pensamientos y emociones\n\n📚 "Bienestar emocional: Superar el miedo, el odio y los celos con la energía creativa"\nAutor: Osho\nTema: Transformación emocional y creatividad\n\nEstos libros ofrecen herramientas prácticas y reflexiones profundas para mejorar tu bienestar emocional.',
    connections: ['recursos-main'],
    parentId: 'recursos-main',
  },
  {
    id: 'rec-videos',
    title: 'Podcasts y Videos',
    color: '#10b981',
    position: { x: 0, y: 0 },
    content: 'CONTENIDO RECOMENDADO:\n\n🎥 "Fortalecer el amor propio con Walter Riso"\nCanal: En Defensa Propia | Erika de la Vega\nLink: youtube.com/watch?v=3DlRszmEHFM\nTema: Autoestima y amor propio\n\n🎥 "Aprende a Controlar Tus Emociones"\nCanal: Yokoi Kenji\nLink: youtube.com/watch?v=FIlS2uXLbAM\nTema: Gestión emocional y cambio de vida\n\nEstos recursos te ayudarán a comprender mejor tus emociones y desarrollar habilidades para manejarlas.',
    connections: ['recursos-main'],
    parentId: 'recursos-main',
  },

  // NODOS HIJOS DE AYUDA
  {
    id: 'ayuda-senales',
    title: 'Señales de Alarma',
    color: '#34d399',
    position: { x: 0, y: 0 },
    content: 'CUÁNDO BUSCAR AYUDA PROFESIONAL:\n\n🚨 Cuando no te sientas bien contigo mismo\n🚨 Cuando no te sientas bien con el mundo\n🚨 Si los síntomas persisten más de 2 semanas\n🚨 Si afectan tu vida diaria\n🚨 Si tienes pensamientos de hacerte daño\n🚨 Si el malestar es intenso\n\n💡 BUSCAR AYUDA ES UN ACTO DE VALENTÍA\n\nContacto para terapia:\n📱 WhatsApp: 52-5540838451\n📧 Email: aescalantemg@gmail.com\n\n⚠️ AVISO: Este espacio es orientativo y no sustituye la atención profesional.',
    connections: ['ayuda-main'],
    parentId: 'ayuda-main',
  },
];

async function uploadNodes() {
  try {
    console.log('🔄 Limpiando colección anterior...');
    const snapshot = await getDocs(collection(db, MINDMAP_COLLECTION));
    const batch = writeBatch(db);
    
    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });
    
    await batch.commit();
    console.log('✅ Colección limpiada');

    console.log('📤 Subiendo nuevos nodos de terapia...');
    const uploadBatch = writeBatch(db);
    
    allNodes.forEach((node) => {
      const docRef = doc(db, MINDMAP_COLLECTION, node.id);
      uploadBatch.set(docRef, node);
    });
    
    await uploadBatch.commit();
    console.log(`✅ ${allNodes.length} nodos de terapia subidos exitosamente`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

uploadNodes();

