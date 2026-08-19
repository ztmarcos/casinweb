import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const distPath = './dist';
const indexPath = join(distPath, 'index.html');

// Leer el archivo index.html generado
let html = readFileSync(indexPath, 'utf-8');

// Crear versión para CASIN
const casinHtml = html
  .replace(/<title>.*?<\/title>/, '<title>CASIN Seguros</title>')
  .replace(/<meta name="description" content=".*?"/g, '<meta name="description" content="Protección integral para ti y tu familia"')
  .replace(/<meta property="og:title" content=".*?"/g, '<meta property="og:title" content="CASIN Seguros"')
  .replace(/<meta property="og:description" content=".*?"/g, '<meta property="og:description" content="Protección integral para ti y tu familia"')
  .replace(/<meta property="og:image" content=".*?"/g, '<meta property="og:image" content="https://casinbbdd.web.app/logo.png"')
  .replace(/<meta property="twitter:title" content=".*?"/g, '<meta property="twitter:title" content="CASIN Seguros"')
  .replace(/<meta property="twitter:description" content=".*?"/g, '<meta property="twitter:description" content="Protección integral para ti y tu familia"')
  .replace(/<meta property="twitter:image" content=".*?"/g, '<meta property="twitter:image" content="https://casinbbdd.web.app/logo.png"')
  .replace(/href="\/logo\.png"/g, 'href="/logo.png"');

// Crear versión para Terapia
const terapiaHtml = html
  .replace(/<title>.*?<\/title>/, '<title>Contigo Psicología - Terapia Integral</title>')
  .replace(/<meta name="description" content=".*?"/g, '<meta name="description" content="Apoyo profesional en salud mental y bienestar emocional"')
  .replace(/<meta property="og:title" content=".*?"/g, '<meta property="og:title" content="Contigo Psicología - Terapia Integral"')
  .replace(/<meta property="og:description" content=".*?"/g, '<meta property="og:description" content="Apoyo profesional en salud mental y bienestar emocional"')
  .replace(/<meta property="og:image" content=".*?"/g, '<meta property="og:image" content="https://terapia-psicologica.web.app/terpialogo3.png"')
  .replace(/<meta property="twitter:title" content=".*?"/g, '<meta property="twitter:title" content="Contigo Psicología - Terapia Integral"')
  .replace(/<meta property="twitter:description" content=".*?"/g, '<meta property="twitter:description" content="Apoyo profesional en salud mental y bienestar emocional"')
  .replace(/<meta property="twitter:image" content=".*?"/g, '<meta property="twitter:image" content="https://terapia-psicologica.web.app/terpialogo3.png"')
  .replace(/href="\/logo\.png"/g, 'href="/terpialogo3.png"');

// Crear versión para M&QWFJ
const mqwfjHtml = html
  .replace(/<title>.*?<\/title>/, '<title>M&QWFJ</title>')
  .replace(/<meta name="description" content=".*?"/g, '<meta name="description" content="M&QWFJ - Portfolio"')
  .replace(/<meta property="og:title" content=".*?"/g, '<meta property="og:title" content="M&QWFJ"')
  .replace(/<meta property="og:description" content=".*?"/g, '<meta property="og:description" content="M&QWFJ - Portfolio"')
  .replace(/<meta property="og:image" content=".*?"/g, '<meta property="og:image" content="https://mqwfj.web.app/logo-mqwfj.svg"')
  .replace(/<meta property="twitter:title" content=".*?"/g, '<meta property="twitter:title" content="M&QWFJ"')
  .replace(/<meta property="twitter:description" content=".*?"/g, '<meta property="twitter:description" content="M&QWFJ - Portfolio"')
  .replace(/<meta property="twitter:image" content=".*?"/g, '<meta property="twitter:image" content="https://mqwfj.web.app/logo-mqwfj.svg"')
  .replace(/href="\/logo\.png"/g, 'href="/logo-mqwfj.svg"');

// Guardar archivos
writeFileSync(join(distPath, 'index-casin.html'), casinHtml);
writeFileSync(join(distPath, 'index-terapia.html'), terapiaHtml);
writeFileSync(join(distPath, 'index-mqwfj.html'), mqwfjHtml);

console.log('✅ HTML files created for each site');


