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

// Todos los nodos completos
const allNodes = [
  // NODOS PRINCIPALES (RAÍZ)
  {
    id: 'vida-main',
    title: 'SEGURO DE VIDA',
    color: '#8B5CF6',
    position: { x: 0, y: 0 },
    content: 'El seguro de vida protege económicamente a tu familia en caso de fallecimiento, ofreciendo indemnización que cubre gastos inmediatos, deudas, traslado de dominio de la herencia o proyectos futuros como manutención, educación y otros gastos familiares que continúan después de fallecimiento. Brinda tranquilidad, respaldo financiero y estabilidad a los seres queridos cuando más lo necesitan.',
    connections: ['vida-planes', 'vida-moneda', 'vida-actualizacion', 'vida-valores', 'vida-fideicomiso', 'vida-coberturas'],
    image: '/vida.jpeg',
    isExpanded: false,
  },
  {
    id: 'gm-main',
    title: 'GASTOS MÉDICOS',
    color: '#EF4444',
    position: { x: 0, y: 0 },
    content: 'El seguro de gastos médicos protege tu economía ante enfermedades o accidentes, cubre hospitalización, consultas, estudios, tratamientos y medicamentos, garantiza atención de calidad, acceso a especialistas, tranquilidad financiera y respaldo oportuno para ti y tu familia.',
    connections: ['gm-planes', 'gm-nivel', 'gm-suma', 'gm-deducible', 'gm-coberturas-adicionales', 'gm-exclusiones', 'gm-ventajas'],
    image: '/gastosmedicos.jpeg',
    isExpanded: false,
  },
  {
    id: 'autos-main',
    title: 'SEGURO DE AUTOS',
    color: '#3B82F6',
    position: { x: 0, y: 0 },
    content: 'El seguro de autos protege tu vehículo y responsabilidad civil ante accidentes, robo, daños materiales y lesiones a terceros, brindando tranquilidad y respaldo económico para conducir con seguridad.',
    connections: ['autos-cobertura', 'autos-deducible', 'autos-valor', 'autos-responsabilidad'],
    image: '/autos.jpeg',
    isExpanded: false,
  },
  {
    id: 'hogar-main',
    title: 'SEGURO DE HOGAR',
    color: '#10B981',
    position: { x: 0, y: 0 },
    content: 'El seguro de hogar protege tu casa y pertenencias ante incendios, robos, daños por agua, fenómenos hidrometeorológicos y responsabilidad civil, garantizando la seguridad de tu patrimonio familiar.',
    connections: ['hogar-cobertura', 'hogar-valor', 'hogar-deducible', 'hogar-exclusiones'],
    image: '/hogar.png',
    isExpanded: false,
  },
  {
    id: 'negocio-main',
    title: 'SEGURO DE NEGOCIO',
    color: '#F59E0B',
    position: { x: 0, y: 0 },
    content: 'El seguro de negocio protege tu empresa ante riesgos operativos, responsabilidad civil, interrupción de negocios, robo, daños materiales y responsabilidad profesional, asegurando la continuidad de tu actividad comercial.',
    connections: ['negocio-cobertura', 'negocio-responsabilidad', 'negocio-interrupcion', 'negocio-valor'],
    image: '/negocio.png',
    isExpanded: false,
  },

  // NODOS HIJOS DE VIDA
  {
    id: 'vida-planes',
    title: 'Tipos de Planes',
    color: '#8B5CF6',
    position: { x: 0, y: 0 },
    content: 'Los principales tipos de planes de seguro de vida son:\n\n• TEMPORAL: Protección por un plazo definido (5, 10, 20 años)\n• VITALICIO: Cobertura de por vida con valores garantizados\n• DOTAL: Combina protección y ahorro, entregando suma al final del plazo\n• UNIVERSAL O FLEXIBLE: Ajusta primas y coberturas según necesidades\n• CON INVERSIÓN: Integra ahorro en fondos para generar rendimientos',
    connections: ['vida-main', 'vida-deducibilidad'],
    parentId: 'vida-main',
  },
  {
    id: 'vida-moneda',
    title: 'Tipo de Moneda',
    color: '#6366F1',
    position: { x: 0, y: 0 },
    content: 'Generalmente, un seguro de vida en México puede contratarse en:\n\n• Pesos mexicanos (MXN)\n• Dólares estadounidenses (USD)\n• Unidades de Inversión (UDIS)\n\nCada opción ofrece diferentes ventajas según tus necesidades de protección contra inflación y devaluación.',
    connections: ['vida-main', 'vida-actualizacion'],
    parentId: 'vida-main',
  },
  {
    id: 'vida-actualizacion',
    title: 'Actualización por Inflación',
    color: '#10B981',
    position: { x: 0, y: 0 },
    content: 'EN MONEDA NACIONAL: Las sumas aseguradas y las primas se actualizan de acuerdo con el índice nacional de precios al consumidor o al valor de la UDI.\n\nEN DÓLARES: Se actualiza con el tipo de cambio al momento del pago de las primas y la suma asegurada se pagará al tipo de cambio al momento del fallecimiento.',
    connections: ['vida-main', 'vida-moneda'],
    parentId: 'vida-main',
  },
  {
    id: 'vida-valores',
    title: 'Valores Garantizados',
    color: '#F59E0B',
    position: { x: 0, y: 0 },
    content: 'En los seguros de vida con ahorro o inversión existen valores garantizados, que son beneficios mínimos que la aseguradora otorga aunque dejes de pagar la póliza. Estos pueden usarse de diferentes maneras para mantener protección o recuperar parte de tu inversión.',
    connections: ['vida-main', 'vida-formas-valores'],
    parentId: 'vida-main',
  },
  {
    id: 'vida-formas-valores',
    title: 'Formas de Utilizar Valores',
    color: '#EC4899',
    position: { x: 0, y: 0 },
    content: '• SEGURO SALDADO: Convierte la póliza en un seguro de vida de menor suma asegurada, pero ya no pagas más primas.\n\n• SEGURO PRORROGADO: Mantiene la suma asegurada original, pero solo por un tiempo reducido.\n\n• RESCATE EN EFECTIVO: Recibes en dinero el valor acumulado en la póliza, cancelando la cobertura.',
    connections: ['vida-valores'],
    parentId: 'vida-valores',
  },
  {
    id: 'vida-fideicomiso',
    title: 'Fideicomiso',
    color: '#14B8A6',
    position: { x: 0, y: 0 },
    content: 'El fideicomiso en seguros de vida administra la suma asegurada generando intereses y según instrucciones del asegurado, entregando pagos periódicos o destinados a fines específicos, protegiendo a beneficiarios, evitando conflictos y asegurando un uso responsable del capital heredado.',
    connections: ['vida-main'],
    parentId: 'vida-main',
  },
  {
    id: 'vida-deducibilidad',
    title: 'Deducibilidad Fiscal',
    color: '#6366F1',
    position: { x: 0, y: 0 },
    content: 'Los planes de retiro con seguro de vida permiten deducir aportaciones en el ISR, generando ahorro fiscal y capital para jubilación.\n\nLa LISR, artículos 151-V y 185, respalda este beneficio.\n\nREQUISITOS:\n• Registro ante SHCP\n• Permanencia hasta los 65 años o jubilación anticipada permitida',
    connections: ['vida-planes'],
    parentId: 'vida-planes',
  },
  {
    id: 'vida-coberturas',
    title: 'Coberturas Adicionales',
    color: '#EF4444',
    position: { x: 0, y: 0 },
    content: 'COBERTURAS ADICIONALES OPCIONALES:\n\n• Muerte accidental\n• Invalidez total y permanente\n• Invalidez temporal\n• Pérdidas orgánicas\n• Enfermedades graves\n• Gastos funerarios\n• Exención de pago de primas por invalidez total',
    connections: ['vida-main'],
    parentId: 'vida-main',
  },

  // NODOS HIJOS DE GASTOS MÉDICOS
  {
    id: 'gm-planes',
    title: 'Planes de Cobertura',
    color: '#F59E0B',
    position: { x: 0, y: 0 },
    content: 'LOS PLANES NACIONALES:\nOfrecen cobertura médica en todo México, con hospitales, médicos y servicios especializados disponibles.\n\nPLANES INTERNACIONALES:\nBrindan cobertura médica dentro y fuera de México, acceso a hospitales y especialistas de prestigio mundial, atención en emergencias, tratamientos avanzados y respaldo económico para cuidar tu salud estés donde estés.',
    connections: ['gm-main'],
    parentId: 'gm-main',
  },
  {
    id: 'gm-nivel',
    title: 'Nivel de Hospitales',
    color: '#6366F1',
    position: { x: 0, y: 0 },
    content: 'Cada aseguradora los clasifica por lo menos en 4 niveles hospitalarios de calidad y precio y tú puedes elegir el nivel que mejor te convenga y se relaciona con el costo de la prima que pagarás.\n\nA mayor nivel hospitalario, mayor será la calidad de las instalaciones y el costo de la prima.',
    connections: ['gm-main', 'gm-honorarios'],
    parentId: 'gm-main',
  },
  {
    id: 'gm-honorarios',
    title: 'Honorarios Médicos',
    color: '#8B5CF6',
    position: { x: 0, y: 0 },
    content: 'Los tabuladores de honorarios médicos son listas que establecen montos máximos de pago a especialistas por procedimientos o consultas, garantizando costos justos, transparencia, control de gastos y evitando cobros excesivos al asegurado y aseguradora.\n\nTú puedes elegir el tabulador que más te convenga y es parte fundamental del costo del seguro.',
    connections: ['gm-nivel'],
    parentId: 'gm-nivel',
  },
  {
    id: 'gm-suma',
    title: 'Suma Asegurada',
    color: '#10B981',
    position: { x: 0, y: 0 },
    content: 'La suma asegurada es el monto máximo que la aseguradora pagará por gastos médicos cubiertos, brindando respaldo económico y definiendo el alcance de la protección contratada.\n\nTú eliges la cantidad que puede ir desde $800,000 hasta más de $175,000,000.\n\nEsta cantidad será fundamental para determinar el costo del seguro.',
    connections: ['gm-main'],
    parentId: 'gm-main',
  },
  {
    id: 'gm-deducible',
    title: 'El Deducible',
    color: '#EC4899',
    position: { x: 0, y: 0 },
    content: 'El deducible es la cantidad fija que el asegurado paga antes de que la aseguradora cubra los gastos médicos protegidos.\n\nJuega un papel importante en el costo del seguro: a mayor deducible, menor será la prima.',
    connections: ['gm-main', 'gm-coaseguro'],
    parentId: 'gm-main',
  },
  {
    id: 'gm-coaseguro',
    title: 'El Coaseguro',
    color: '#14B8A6',
    position: { x: 0, y: 0 },
    content: 'El coaseguro es el porcentaje de los gastos médicos cubiertos que el asegurado paga después del deducible, compartiendo costos con la aseguradora.\n\nInfluye en el costo del seguro: a mayor coaseguro, menor será la prima.',
    connections: ['gm-deducible'],
    parentId: 'gm-deducible',
  },
  {
    id: 'gm-coberturas-adicionales',
    title: 'Coberturas Adicionales',
    color: '#8B5CF6',
    position: { x: 0, y: 0 },
    content: 'ALGUNAS COBERTURAS ADICIONALES INCLUIDAS U OPCIONALES:\n\n• Cobertura dental\n• Cobertura de maternidad\n• Enfermedades graves y catastróficas en el extranjero\n• Emergencias en el extranjero\n• Gastos funerarios\n• Cobertura internacional extendida\n• Reembolso de medicamentos\n• Eliminación o reducción del deducible por accidente\n• Cobertura de trasplantes\n• Ambulancia aérea o terrestre',
    connections: ['gm-main', 'gm-cirugia-robotica', 'gm-trasplantes', 'gm-hiperbarica'],
    parentId: 'gm-main',
  },
  {
    id: 'gm-cirugia-robotica',
    title: 'Cirugía Robótica',
    color: '#6366F1',
    position: { x: 0, y: 0 },
    content: 'COBERTURA DE CIRUGÍA ROBÓTICA:\n\n• Cirugías urológicas – próstata, riñón, vejiga\n• Cirugías ginecológicas – histerectomía, endometriosis, miomas\n• Cirugía general – hernias, resección de colon\n• Cirugía bariátrica\n• Cirugías cardiotorácicas – válvulas, tumores, cardiopatías seleccionadas\n• Cirugía oncológica – resección de tumores en órganos accesibles con técnica robótica\n\nCada aseguradora define qué procedimientos robóticos están dentro del tabulador y bajo qué condiciones.',
    connections: ['gm-coberturas-adicionales'],
    parentId: 'gm-coberturas-adicionales',
  },
  {
    id: 'gm-trasplantes',
    title: 'Trasplantes',
    color: '#F59E0B',
    position: { x: 0, y: 0 },
    content: 'COBERTURA DE TRASPLANTES:\n\nLa cobertura de trasplantes incluye los gastos hospitalarios, honorarios médicos, donador vivo, medicamentos posteriores y cuidados necesarios, garantizando acceso a procedimientos complejos y costosos con respaldo financiero integral.\n\nEs una de las coberturas más valiosas en un seguro de gastos médicos.',
    connections: ['gm-coberturas-adicionales'],
    parentId: 'gm-coberturas-adicionales',
  },
  {
    id: 'gm-hiperbarica',
    title: 'Cámara Hiperbárica',
    color: '#10B981',
    position: { x: 0, y: 0 },
    content: 'COBERTURA DE CÁMARA HIPERBÁRICA:\n\nLa cobertura de cámara hiperbárica incluye algunos tratamientos médicos que utilizan oxígeno a alta presión para:\n\n• Acelerar la cicatrización de heridas\n• Tratar intoxicaciones por monóxido de carbono\n• Infecciones graves\n• Lesiones por descompresión\n\nCubre gastos hospitalarios y honorarios especializados.',
    connections: ['gm-coberturas-adicionales'],
    parentId: 'gm-coberturas-adicionales',
  },
  {
    id: 'gm-exclusiones',
    title: 'Exclusiones Principales',
    color: '#EF4444',
    position: { x: 0, y: 0 },
    content: 'PRINCIPALES EXCLUSIONES:\n\n• Tratamientos estéticos\n• Enfermedades preexistentes no declaradas\n• Accidentes intencionales\n• Consumo de drogas/alcohol\n• Deportes extremos\n• Terapias experimentales\n• Abortos (salvo excepciones legales)\n• Gastos fuera de hospitales autorizados\n\nEs importante leer la póliza para conocer todas las exclusiones específicas.',
    connections: ['gm-main'],
    parentId: 'gm-main',
  },
  {
    id: 'gm-ventajas',
    title: 'Ventajas Adicionales',
    color: '#EC4899',
    position: { x: 0, y: 0 },
    content: 'VENTAJAS ADICIONALES SIN COSTO:\n\n• Renovación garantizada y vitalicia – continuidad asegurada sin importar edad\n• Ambulancia consulta a domicilio y emergencia\n• Consultas telefónicas – asesoría médica inmediata\n• Descuentos en medicamentos\n• Descuentos en estudios de laboratorios\n\nEstos beneficios añaden valor significativo a tu póliza sin costo adicional.',
    connections: ['gm-main'],
    parentId: 'gm-main',
  },

  // NODOS HIJOS DE AUTOS
  {
    id: 'autos-cobertura',
    title: 'Tipos de Cobertura',
    color: '#3B82F6',
    position: { x: 0, y: 0 },
    content: 'COBERTURAS BÁSICAS:\n\n• Responsabilidad Civil: Daños a terceros y lesiones\n• Gastos Médicos: Atención médica para ocupantes\n• Defensa Legal: Asesoría jurídica en accidentes\n\nCOBERTURAS AMPLIAS:\n\n• Robo Total: Indemnización por robo del vehículo\n• Daños Materiales: Reparación por accidentes\n• Cristales: Reposición de vidrios y lunas\n• Equipos Especiales: Audio, GPS, accesorios',
    connections: ['autos-main'],
    parentId: 'autos-main',
  },
  {
    id: 'autos-deducible',
    title: 'Deducible',
    color: '#6366F1',
    position: { x: 0, y: 0 },
    content: 'El deducible es la cantidad que pagas en caso de siniestro antes de que la aseguradora cubra el resto.\n\nTIPOS DE DEDUCIBLE:\n\n• Fijo: Cantidad establecida (ej. $5,000)\n• Porcentual: % del valor del vehículo\n• Por edad: Varía según antigüedad del auto\n\nA mayor deducible, menor prima. A menor deducible, mayor prima.',
    connections: ['autos-main'],
    parentId: 'autos-main',
  },
  {
    id: 'autos-valor',
    title: 'Valor Comercial vs Valor Convenido',
    color: '#8B5CF6',
    position: { x: 0, y: 0 },
    content: 'VALOR COMERCIAL:\n\n• Basado en tablas de depreciación\n• Valor de mercado actual\n• Se ajusta automáticamente\n• Prima más económica\n\nVALOR CONVENIDO:\n\n• Valor acordado al contratar\n• No se deprecia durante la vigencia\n• Prima más alta\n• Ideal para autos clásicos o especiales',
    connections: ['autos-main'],
    parentId: 'autos-main',
  },
  {
    id: 'autos-responsabilidad',
    title: 'Responsabilidad Civil',
    color: '#EF4444',
    position: { x: 0, y: 0 },
    content: 'Cubre daños a terceros en caso de accidente:\n\n• Daños Materiales: Reparación de vehículos de terceros\n• Lesiones Corporales: Gastos médicos de terceros\n• Gastos Funerarios: En caso de fallecimiento\n• Defensa Legal: Asesoría jurídica\n\nLÍMITES MÍNIMOS:\n• $3,000,000 pesos por evento\n• Recomendable: $5,000,000 pesos o más',
    connections: ['autos-main'],
    parentId: 'autos-main',
  },

  // NODOS HIJOS DE HOGAR
  {
    id: 'hogar-cobertura',
    title: 'Coberturas del Hogar',
    color: '#10B981',
    position: { x: 0, y: 0 },
    content: 'COBERTURAS PRINCIPALES:\n\n• Incendio: Daños por fuego, explosión, rayo\n• Robo: Hurto de bienes dentro del hogar\n• Daños por Agua: Fugas, inundaciones\n• Fenómenos Hidrometeorológicos: Huracanes, granizo\n• Responsabilidad Civil: Daños a terceros en tu propiedad\n• Gastos de Alojamiento: Hotel durante reparaciones',
    connections: ['hogar-main'],
    parentId: 'hogar-main',
  },
  {
    id: 'hogar-valor',
    title: 'Valor de la Vivienda',
    color: '#14B8A6',
    position: { x: 0, y: 0 },
    content: 'VALOR DE CONSTRUCCIÓN:\n\n• Costo de reconstrucción actual\n• No incluye valor del terreno\n• Basado en metros cuadrados\n• Materiales y mano de obra actuales\n\nVALOR DE CONTENIDO:\n\n• Muebles, electrodomésticos\n• Ropa, joyas, arte\n• Equipos electrónicos\n• Documentos importantes',
    connections: ['hogar-main'],
    parentId: 'hogar-main',
  },
  {
    id: 'hogar-deducible',
    title: 'Deducible y Exclusiones',
    color: '#F59E0B',
    position: { x: 0, y: 0 },
    content: 'DEDUCIBLE:\n\n• Cantidad fija por siniestro\n• Varía según el tipo de daño\n• No aplica para responsabilidad civil\n\nPRINCIPALES EXCLUSIONES:\n\n• Terremotos (cobertura separada)\n• Daños por negligencia\n• Bienes en tránsito\n• Objetos de valor sin declarar\n• Daños preexistentes',
    connections: ['hogar-main'],
    parentId: 'hogar-main',
  },
  {
    id: 'hogar-exclusiones',
    title: 'Exclusiones Específicas',
    color: '#EF4444',
    position: { x: 0, y: 0 },
    content: 'EXCLUSIONES COMUNES:\n\n• Terremotos y movimientos telúricos\n• Guerra, terrorismo\n• Contaminación nuclear\n• Desgaste normal\n• Daños intencionales\n• Bienes en proceso de construcción\n\nCOBERTURAS ADICIONALES:\n\n• Terremotos (póliza separada)\n• Inundaciones (cobertura especial)\n• Joyas y objetos de valor',
    connections: ['hogar-main'],
    parentId: 'hogar-main',
  },

  // NODOS HIJOS DE NEGOCIO
  {
    id: 'negocio-cobertura',
    title: 'Coberturas Empresariales',
    color: '#F59E0B',
    position: { x: 0, y: 0 },
    content: 'COBERTURAS BÁSICAS:\n\n• Incendio y Rayo: Edificio y mercancías\n• Robo: Dinero, mercancías, equipos\n• Responsabilidad Civil: Daños a terceros\n• Cristales: Vidrios y ventanas\n• Equipos Electrónicos: Computadoras, sistemas\n\nCOBERTURAS ESPECIALIZADAS:\n\n• Interrupción de Negocios\n• Responsabilidad Profesional\n• Ciber Riesgos\n• Fidelidad de Empleados',
    connections: ['negocio-main'],
    parentId: 'negocio-main',
  },
  {
    id: 'negocio-responsabilidad',
    title: 'Responsabilidad Civil',
    color: '#8B5CF6',
    position: { x: 0, y: 0 },
    content: 'RESPONSABILIDAD GENERAL:\n\n• Daños a terceros en tus instalaciones\n• Lesiones a clientes o visitantes\n• Daños por productos defectuosos\n• Gastos médicos y legales\n\nRESPONSABILIDAD PROFESIONAL:\n\n• Errores y omisiones profesionales\n• Negligencia en servicios\n• Daños por asesoría incorrecta\n• Defensa legal especializada',
    connections: ['negocio-main'],
    parentId: 'negocio-main',
  },
  {
    id: 'negocio-interrupcion',
    title: 'Interrupción de Negocios',
    color: '#EC4899',
    position: { x: 0, y: 0 },
    content: 'COBERTURA DE INTERRUPCIÓN:\n\n• Pérdida de ingresos por siniestro\n• Gastos fijos durante la paralización\n• Gastos extraordinarios de operación\n• Utilidades perdidas\n\nFACTORES CLAVE:\n\n• Tiempo de indemnización máximo\n• Período de espera (deducible temporal)\n• Cálculo de pérdidas\n• Reanudación de actividades',
    connections: ['negocio-main'],
    parentId: 'negocio-main',
  },
  {
    id: 'negocio-valor',
    title: 'Valor de Mercancías',
    color: '#10B981',
    position: { x: 0, y: 0 },
    content: 'VALORACIÓN DE MERCANCÍAS:\n\n• Valor comercial actual\n• Inventario actualizado\n• Mercancías en tránsito\n• Productos terminados y en proceso\n\nTIPOS DE COBERTURA:\n\n• Valor Convenido: Acordado previamente\n• Valor Real: Al momento del siniestro\n• Primer Riesgo: Hasta el límite contratado\n• Valor Total: Suma asegurada completa',
    connections: ['negocio-main'],
    parentId: 'negocio-main',
  },

  // NODO PRINCIPAL EMPRESARIAL
  {
    id: 'empresarial-main',
    title: 'EMPRESARIAL',
    color: '#8B5CF6',
    position: { x: 0, y: 0 },
    content: 'Los seguros empresariales protegen a las compañías contra riesgos económicos, daños y pérdidas. Incluyen coberturas como responsabilidad civil, incendios, terremotos, inundaciones y fenómenos meteorológicos, robos, interrupción de actividades y accidentes laborales. Su objetivo es garantizar la estabilidad y continuidad operativa, adaptándose a las necesidades específicas de cada empresa para minimizar impactos financieros negativos.',
    connections: ['empresarial-transportes', 'empresarial-diversos'],
    image: '/empresarial.png?v=2',
    isExpanded: false,
  },

  // NODOS HIJOS EMPRESARIAL
  {
    id: 'empresarial-transportes',
    title: 'Seguro de Transportes',
    color: '#3B82F6',
    position: { x: 0, y: 0 },
    content: 'El seguro de transportes protege la mercancía y los bienes durante su traslado, ya sea por tierra, mar o aire. Cubre pérdidas, daños, robos y accidentes que puedan ocurrir en el transporte. Su objetivo es garantizar la protección financiera y la seguridad de los bienes en tránsito, minimizando riesgos y pérdidas.',
    connections: ['empresarial-main', 'empresarial-formas', 'empresarial-sumas', 'empresarial-coberturas'],
    parentId: 'empresarial-main',
  },
  {
    id: 'empresarial-formas',
    title: 'Formas de Contratación',
    color: '#10B981',
    position: { x: 0, y: 0 },
    content: 'FORMAS DE CONTRATACIÓN:\n\n• Viaje específico: Para un traslado particular\n• Anual con declaración: Por embarque durante el año\n• Mensual con depósito: Prima en depósito mensual\n\nCada forma se adapta a diferentes necesidades de transporte y frecuencia de envíos.',
    connections: ['empresarial-transportes'],
    parentId: 'empresarial-transportes',
  },
  {
    id: 'empresarial-sumas',
    title: 'Sumas Aseguradas',
    color: '#F59E0B',
    position: { x: 0, y: 0 },
    content: 'SUMAS ASEGURADAS:\n\n• Valor de reposición: Costo de reemplazar los bienes\n• Valor de venta: Precio de mercado de los bienes\n\nLa elección depende del tipo de mercancía y el propósito del seguro.',
    connections: ['empresarial-transportes'],
    parentId: 'empresarial-transportes',
  },
  {
    id: 'empresarial-coberturas',
    title: 'Coberturas de Transporte',
    color: '#EF4444',
    position: { x: 0, y: 0 },
    content: 'RIESGOS ORDINARIOS DE TRÁNSITO:\n\n• Incendio o explosión del vehículo\n• Volcadura, colisión o descarrilamiento\n• Caída accidental de mercancía\n• Daños por maniobras de emergencia\n• Hundimiento, encallamiento (marítimo)\n• Caída del avión o aterrizaje forzoso (aéreo)\n• Gastos de salvamento y remoción\n\nCOBERTURAS ADICIONALES:\n\n• Robo total o parcial\n• Maniobras de carga y descarga\n• Rotura, abolladura o mojadura\n• Contaminación o manchas\n• Robo con violencia\n• Gastos de reexpedición\n• Demoras extraordinarias\n• Cobertura en bodegas intermedias\n• Tránsito internacional puerta a puerta\n• Daños por huelga, motín o conmoción civil',
    connections: ['empresarial-transportes'],
    parentId: 'empresarial-transportes',
  },
  {
    id: 'empresarial-diversos',
    title: 'Seguros Diversos',
    color: '#EC4899',
    position: { x: 0, y: 0 },
    content: 'SEGUROS DIVERSOS:\n\nSon pólizas independientes que amparan diversos riesgos con coberturas muy específicas, todas con sus alcances y exclusiones que es importante conocer antes de contratar.\n\nTIPOS DE SEGUROS DIVERSOS:\n\n• Rotura de maquinaria\n• Calderas y aparatos sujetos a presión\n• Equipo de contratistas\n• Obra civil\n• Responsabilidad civil general y profesional\n• Flotillas de autos, camiones y equipo pesado\n• Ataque cibernético\n• Barcos, embarcaciones menores de placer y aviones',
    connections: ['empresarial-main'],
    parentId: 'empresarial-main',
  },

  // NODO PRINCIPAL BENEFICIOS EMPLEADOS
  {
    id: 'beneficios-main',
    title: 'BENEFICIOS EMPLEADOS',
    color: '#7C3AED',
    position: { x: 0, y: 0 },
    content: 'Diseñamos, instalamos y administramos programas de beneficios para empleados que incluyen seguros de grupo de vida, gastos médicos mayores, seguros de accidentes, flotillas de automóviles, hogar y otros en descuento por nómina. También asesoramos y diseñamos programas de prestaciones como fondos de ahorro, planes de retiro, valuaciones actuariales y otras prestaciones no asegurables que cumplen con requisitos para deducibilidad de impuestos.',
    connections: ['beneficios-vida-grupo', 'beneficios-gastos-medicos', 'beneficios-accidentes', 'beneficios-flotillas', 'beneficios-prestaciones'],
    image: '/empresarial.png',
    isExpanded: false,
  },

  // NODO PRINCIPAL BLOG
  {
    id: 'blog-main',
    title: 'BLOG',
    color: '#059669',
    position: { x: 0, y: 0 },
    content: 'Visita nuestro blog para obtener información actualizada sobre seguros, consejos de protección, noticias del sector y artículos especializados. Mantente informado sobre las últimas tendencias en seguros y cómo proteger mejor tu patrimonio y el de tu familia.',
    connections: [],
    isExpanded: false,
  },

  // NODOS HIJOS BENEFICIOS EMPLEADOS
  {
    id: 'beneficios-vida-grupo',
    title: 'Seguro de Grupo de Vida',
    color: '#8B5CF6',
    position: { x: 0, y: 0 },
    content: 'SEGURO DE GRUPO DE VIDA:\n\nProtección integral para empleados y sus familias:\n\n• Fallecimiento: Indemnización a beneficiarios\n• Invalidez total y permanente: Protección por incapacidad\n• Muerte accidental y pérdidas orgánicas: Cobertura adicional por accidentes\n\nBeneficios:\n• Cobertura colectiva con mejores tarifas\n• Proceso de contratación simplificado\n• Administración centralizada\n• Descuento directo por nómina',
    connections: ['beneficios-main'],
    parentId: 'beneficios-main',
  },
  {
    id: 'beneficios-gastos-medicos',
    title: 'Gastos Médicos Mayores',
    color: '#EF4444',
    position: { x: 0, y: 0 },
    content: 'SEGUROS DE GASTOS MÉDICOS MAYORES:\n\nCobertura integral para empleados y sus familiares:\n\n• Cobertura para enfermedades y accidentes\n• Gastos de hospitalización\n• Cirugías y tratamientos especializados\n• Medicamentos dentro y fuera del hospital\n• Otros gastos necesarios para recuperar la salud de padecimientos cubiertos\n\nVentajas:\n• Acceso a red de hospitales y médicos\n• Cobertura familiar incluida\n• Sin límite de edad para renovación\n• Administración por nómina',
    connections: ['beneficios-main'],
    parentId: 'beneficios-main',
  },
  {
    id: 'beneficios-accidentes',
    title: 'Seguros de Accidentes',
    color: '#F59E0B',
    position: { x: 0, y: 0 },
    content: 'SEGUROS DE ACCIDENTES:\n\nProtección específica contra accidentes laborales y personales:\n\n• Muerte accidental\n• Invalidez total y permanente por accidente\n• Invalidez parcial por accidente\n• Gastos médicos por accidente\n• Indemnización diaria por incapacidad temporal\n\nCaracterísticas:\n• Cobertura 24/7\n• Sin límite geográfico\n• Proceso de reclamación ágil\n• Complemento ideal para seguros de vida',
    connections: ['beneficios-main'],
    parentId: 'beneficios-main',
  },
  {
    id: 'beneficios-flotillas',
    title: 'Flotillas y Descuentos',
    color: '#10B981',
    position: { x: 0, y: 0 },
    content: 'FLOTILLAS Y DESCUENTOS POR NÓMINA:\n\nProgramas especiales para empleados:\n\n• Flotillas de automóviles con descuentos especiales\n• Seguros de hogar con tarifas preferenciales\n• Otros seguros en descuento por nómina\n\nBeneficios:\n• Tarifas corporativas preferenciales\n• Descuento automático por nómina\n• Proceso de contratación simplificado\n• Administración centralizada\n• Atención personalizada para empleados',
    connections: ['beneficios-main'],
    parentId: 'beneficios-main',
  },
  {
    id: 'beneficios-prestaciones',
    title: 'Programas de Prestaciones',
    color: '#EC4899',
    position: { x: 0, y: 0 },
    content: 'PROGRAMAS DE PRESTACIONES NO ASEGURABLES:\n\nAsesoramos y diseñamos programas especializados:\n\n• Fondos de ahorro para empleados\n• Planes de retiro complementarios\n• Valuaciones actuariales de primas de antigüedad\n• Valuaciones de contratos colectivos\n• Otras prestaciones laborales\n\nVentajas fiscales:\n• Cumplimiento con requisitos para deducibilidad de impuestos\n• Optimización fiscal para empresa y empleados\n• Asesoría especializada en legislación laboral\n• Diseño personalizado según necesidades',
    connections: ['beneficios-main'],
    parentId: 'beneficios-main',
  },
];

async function updateDatabase() {
  try {
    console.log('🔄 Actualizando base de datos con TODOS los seguros...');
    
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

    const createBatch = writeBatch(db);
    
    allNodes.forEach(node => {
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
        ...(node.image && { image: node.image }),
      };
      createBatch.set(nodeRef, nodeData);
    });

    await createBatch.commit();
    console.log(`✅ Creados ${allNodes.length} nuevos nodos.`);
    
    // Log de verificación
    const rootNodes = allNodes.filter(n => !n.parentId);
    const childNodes = allNodes.filter(n => n.parentId);
    console.log(`📊 Nodos raíz: ${rootNodes.length} (${rootNodes.map(n => n.title).join(', ')})`);
    console.log(`📊 Nodos hijos: ${childNodes.length}`);
    console.log('🎉 ¡Base de datos completa con todos los seguros!');
    
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

