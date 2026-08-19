export interface ClientConfig {
  id: string;
  name: string;
  agent: string;
  phone: string;
  email: string;
  logo: string;
  firestoreCollection: string;
  theme: {
    type: 'dark' | 'light';
    background: string;
    primaryColor: string;
    secondaryColor: string;
    textColor: string;
    headerBg: string;
    nodeShadow: string;
  };
}

export const CLIENTS: Record<string, ClientConfig> = {
  'casinbbdd': {
    id: 'casinbbdd',
    name: 'CASIN Seguros',
    agent: 'Actuario Marcos Zavala Díaz',
    phone: '5215518490723',
    email: 'casinseguros@gmail.com',
    logo: '/logo.png',
    firestoreCollection: 'mindmapNodes',
    theme: {
      type: 'dark',
      background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
      primaryColor: '#cf982b',
      secondaryColor: '#8c6912',
      textColor: '#ffffff',
      headerBg: 'rgba(0, 0, 0, 0.2)',
      nodeShadow: 'rgba(0, 0, 0, 0.15)',
    },
  },
  'terapia-psicologica': {
    id: 'terapia-psicologica',
    name: 'Contigo Psicología',
    agent: 'Psic. Adriana Escalante MacGregor',
    phone: '5215540838451',
    email: 'aescalantemg@gmail.com',
    logo: '/terpialogo3.png',
    firestoreCollection: 'mindmapNodesTerapia',
    theme: {
      type: 'light',
      background: 'rgb(234, 250, 209)',
      primaryColor: '#4ade80',
      secondaryColor: '#22c55e',
      textColor: '#065f46',
      headerBg: 'rgba(255, 252, 238, 0.95)',
      nodeShadow: 'rgba(74, 222, 128, 0.3)',
    },
  },
  'mqwfj': {
    id: 'mqwfj',
    name: 'M&QWFJ',
    agent: 'M&QWFJ',
    phone: '52XXXXXXXXXX',
    email: 'mqwfj@example.com',
    logo: '/logo-mqwfj.svg',
    firestoreCollection: 'notUsed',
    theme: {
      type: 'dark',
      background: '#000000',
      primaryColor: '#3E6868',
      secondaryColor: '#C94E44',
      textColor: '#ffffff',
      headerBg: '#000000',
      nodeShadow: 'rgba(0, 0, 0, 0.3)',
    },
  },
};

export const DEFAULT_CLIENT = 'casinbbdd';

export const getCurrentClient = (): ClientConfig => {
  if (typeof window === 'undefined') {
    return CLIENTS[DEFAULT_CLIENT];
  }

  const hostname = window.location.hostname;
  
  // Detectar el sitio por hostname (solo 3 sitios: CASIN, Terapia, MQWFJ)
  // casinbbdd.web.app -> CASIN | terapia-psicologica.web.app -> Terapia | mqwfj.web.app -> MQWFJ
  // localhost -> casinbbdd (default)
  
  if (hostname.includes('localhost') || hostname.includes('127.0.0.1')) {
    // En desarrollo, puedes cambiar esto para probar diferentes clientes
    return CLIENTS[DEFAULT_CLIENT];
  }

  const siteId = hostname.split('.')[0];
  return CLIENTS[siteId] || CLIENTS[DEFAULT_CLIENT];
};

