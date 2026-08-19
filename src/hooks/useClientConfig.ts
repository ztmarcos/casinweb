import { useState, useEffect } from 'react';
import { getCurrentClient, type ClientConfig } from '../config/clients';

export const useClientConfig = (): ClientConfig => {
  const [config, setConfig] = useState<ClientConfig>(getCurrentClient());

  useEffect(() => {
    // Actualizar configuración si cambia la URL (por si acaso)
    setConfig(getCurrentClient());
  }, []);

  return config;
};

