import { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import MindMapPublic from './components/MindMapPublic'
import LandingPage from './components/LandingPage'
import AdminPage from './pages/AdminPage'
import { useClientConfig } from './hooks/useClientConfig'
import './App.css'

function App() {
  const config = useClientConfig();

  useEffect(() => {
    // Inyectar CSS variables dinámicas basadas en la configuración del cliente
    const root = document.documentElement;
    root.style.setProperty('--theme-background', config.theme.background);
    root.style.setProperty('--theme-primary', config.theme.primaryColor);
    root.style.setProperty('--theme-secondary', config.theme.secondaryColor);
    root.style.setProperty('--theme-text', config.theme.textColor);
    root.style.setProperty('--theme-header-bg', config.theme.headerBg);
    root.style.setProperty('--theme-node-shadow', config.theme.nodeShadow);
    root.style.setProperty('--theme-type', config.theme.type);

    // Establecer el atributo data-theme en el body
    document.body.setAttribute('data-theme', config.theme.type);

    // Establecer el atributo data-client para estilos específicos
    document.body.setAttribute('data-client', config.id);

    // Cambiar el favicon dinámicamente
    const favicon = document.querySelector("link[rel='icon']") as HTMLLinkElement;
    if (favicon) {
      favicon.href = config.logo;
    }

    // Cambiar el título de la página
    document.title = config.name;

    // Actualizar meta tags para WhatsApp/redes sociales
    let ogTitle = document.querySelector("meta[property='og:title']") as HTMLMetaElement;
    if (ogTitle) {
      ogTitle.content = config.name;
    }

    let ogDescription = document.querySelector("meta[property='og:description']") as HTMLMetaElement;
    if (ogDescription) {
      const description = config.id === 'terapia-psicologica' 
        ? 'Apoyo profesional en salud mental y bienestar emocional'
        : config.id === 'mqwfj'
        ? 'M&QWFJ - Portfolio'
        : 'Protección integral para ti y tu familia';
      ogDescription.content = description;
    }

    let ogImage = document.querySelector("meta[property='og:image']") as HTMLMetaElement;
    if (ogImage) {
      ogImage.content = config.logo;
    }

    let twitterTitle = document.querySelector("meta[property='twitter:title']") as HTMLMetaElement;
    if (twitterTitle) {
      twitterTitle.content = config.name;
    }

    let twitterDescription = document.querySelector("meta[property='twitter:description']") as HTMLMetaElement;
    if (twitterDescription) {
      const description = config.id === 'terapia-psicologica' 
        ? 'Apoyo profesional en salud mental y bienestar emocional'
        : config.id === 'mqwfj'
        ? 'M&QWFJ - Portfolio'
        : 'Protección integral para ti y tu familia';
      twitterDescription.content = description;
    }

    let twitterImage = document.querySelector("meta[property='twitter:image']") as HTMLMetaElement;
    if (twitterImage) {
      twitterImage.content = config.logo;
    }

    let metaDescription = document.querySelector("meta[name='description']") as HTMLMetaElement;
    if (metaDescription) {
      const description = config.id === 'terapia-psicologica' 
        ? 'Apoyo profesional en salud mental y bienestar emocional'
        : config.id === 'mqwfj'
        ? 'M&QWFJ - Portfolio'
        : 'Protección integral para ti y tu familia';
      metaDescription.content = description;
    }
  }, [config]);

  return (
    <Router>
      <Routes>
        <Route 
          path="/" 
          element={
            config.id === 'mqwfj' 
              ? <LandingPage config={config} />
              : <MindMapPublic config={config} />
          } 
        />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </Router>
  )
}

export default App
