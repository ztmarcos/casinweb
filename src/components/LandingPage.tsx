import React, { useEffect, useRef, useState } from 'react';
import type { ClientConfig } from '../config/clients';
import { logPageVisit, logAnalyticsEvent, logAudioPlay } from '../utils/analytics';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import './LandingPage.css';

interface LandingPageProps {
  config: ClientConfig;
}

const LandingPage: React.FC<LandingPageProps> = ({ config }) => {
  const heroRef = useRef<HTMLDivElement>(null);
  const bioRef = useRef<HTMLDivElement>(null);
  const techRef = useRef<HTMLDivElement>(null);
  const linksRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [activeSection, setActiveSection] = useState('hero');
  const [language, setLanguage] = useState<'es' | 'en'>('es');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [comment, setComment] = useState('');
  const [commentStatus, setCommentStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

  const translations = {
    es: {
      menu: {
        home: 'Home',
        bio: 'Bio',
        tech: 'Set',
        links: 'Links',
      },
      hero: {
        title: '@M&QWFJ',
      },
      bio: {
        title: 'Bio',
        content: 'Originario de CDMX, construí un robot que toca música y estoy trabajando y haciendo música con él y el piano todos los días, sincronizados con un sintetizador modular.',
      },
      tech: {
        title: 'set',
        diagramTitle: 'para nerds:',
        diagram: {
          fuente: 'Fuente Lab',
          arduino: 'Arduino Nano',
          trigger: '(Trigger)',
          moog: 'Moog',
          pianoLabel: 'Piano',
          pocketLabel: 'Pocket',
          operator: 'Operator',
          conexiones: 'Conexiones:',
          fuenteToArduino: 'Fuente 30V → Arduino Nano',
          arduinoToServos: 'Arduino Nano → Servo 1-4 (PWM)',
          arduinoToMoog: 'Arduino Nano → Moog DFAM (Trigger)',
          pianoConn: 'Piano',
          pocketConn: 'Pocket Operator',
        },
      },
      links: {
        title: 'Contacto',
        instagram: 'Instagram',
        tiktok: 'TikTok',
        youtube: 'YouTube',
      },
      comment: {
        placeholder: 'Deja un comentario',
        button: 'Enviar',
        success: '¡Comentario enviado!',
        error: 'Error al enviar comentario',
      },
    },
    en: {
      menu: {
        home: 'Home',
        bio: 'Bio',
        tech: 'Set',
        links: 'Links',
      },
      hero: {
        title: '@M&QWFJ',
      },
      bio: {
        title: 'Bio',
        content: 'From Mexico City, I built a robot that plays music and I\'m working and making music with it and the piano every day, synchronized with a modular synthesizer.',
      },
      tech: {
        title: 'tech',
        diagramTitle: 'for nerds:',
        diagram: {
          fuente: 'Lab Power',
          arduino: 'Arduino Nano',
          trigger: '(Trigger)',
          moog: 'Moog',
          pianoLabel: 'Piano',
          pocketLabel: 'Pocket',
          operator: 'Operator',
          conexiones: 'Connections:',
          fuenteToArduino: '30V Power → Arduino Nano',
          arduinoToServos: 'Arduino Nano → Servo 1-4 (PWM)',
          arduinoToMoog: 'Arduino Nano → Moog DFAM (Trigger)',
          pianoConn: 'Piano → Independent',
          pocketConn: 'Pocket Operator → Independent',
        },
      },
      links: {
        title: 'Connect',
        instagram: 'Instagram',
        tiktok: 'TikTok',
        youtube: 'YouTube',
      },
      comment: {
        placeholder: 'Leave a comment',
        button: 'Send',
        success: 'Comment sent!',
        error: 'Error sending comment',
      },
    },
  };

  const t = translations[language];

  useEffect(() => {
    // Log page visit on mount
    logPageVisit(config.id);
    
    // Track time on page and scroll depth
    const startTime = Date.now();
    let interactionCount = 0;
    let maxScrollDepth = 0;
    
    // Track interactions
    const trackInteraction = () => {
      interactionCount++;
    };
    
    // Track scroll depth
    const trackScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight;
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const clientHeight = document.documentElement.clientHeight;
      const scrollPercentage = Math.round(((scrollTop + clientHeight) / scrollHeight) * 100);
      maxScrollDepth = Math.max(maxScrollDepth, scrollPercentage);
    };
    
    window.addEventListener('click', trackInteraction);
    window.addEventListener('scroll', trackScroll, { passive: true });
    window.addEventListener('keydown', trackInteraction);
    
    const handleBeforeUnload = () => {
      const timeOnPage = Math.floor((Date.now() - startTime) / 1000); // in seconds
      logAnalyticsEvent({
        eventType: 'page_visit',
        clientId: config.id,
        timeOnPage,
        scrollDepth: maxScrollDepth,
        interactionCount,
        sessionDuration: timeOnPage,
      });
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('click', trackInteraction);
      window.removeEventListener('scroll', trackScroll);
      window.removeEventListener('keydown', trackInteraction);
    };
  }, [config.id]);

  useEffect(() => {
    const handleScroll = () => {
      const sections = [
        { id: 'hero', ref: heroRef },
        { id: 'bio', ref: bioRef },
        { id: 'tech', ref: techRef },
        { id: 'links', ref: linksRef },
      ];

      const scrollPosition = window.scrollY + 200;

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i];
        if (section.ref.current) {
          const offsetTop = section.ref.current.offsetTop;
          if (scrollPosition >= offsetTop) {
            setActiveSection(section.id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (ref: React.RefObject<HTMLDivElement | null>) => {
    if (ref.current) {
      ref.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const menuItems = [
    { id: 'hero', label: t.menu.home, ref: heroRef },
    { id: 'bio', label: t.menu.bio, ref: bioRef },
    { id: 'tech', label: t.menu.tech, ref: techRef },
    { id: 'links', label: t.menu.links, ref: linksRef },
  ];

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handlePlay = () => {
      setIsPlaying(true);
      logAudioPlay(config.id);
    };
    const handlePause = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
    };
  }, [config.id]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;
    const newTime = parseFloat(e.target.value);
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;

    setCommentStatus('sending');
    try {
      const commentsCollection = config.id === 'mqwfj' ? 'commentsMQWFJ' : 'commentsMarcos';
      await addDoc(collection(db, commentsCollection), {
        comment: comment.trim(),
        timestamp: serverTimestamp(),
        userAgent: navigator.userAgent,
        language: navigator.language || navigator.languages?.[0] || 'unknown',
        sessionId: sessionStorage.getItem('analytics_session_id') || 'unknown',
      });
      
      setComment('');
      setCommentStatus('success');
      setTimeout(() => setCommentStatus('idle'), 3000);
    } catch (error) {
      console.error('Error sending comment:', error);
      setCommentStatus('error');
      setTimeout(() => setCommentStatus('idle'), 3000);
    }
  };

  return (
    <div className="landing-page">
      {/* Social Links Header */}
      <div className="social-header">
        <a 
          href={config.id === 'mqwfj' ? 'https://instagram.com/marqwfj_' : 'https://instagram.com/marcoszt0'} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="social-link-header social-instagram"
          onClick={() => logAnalyticsEvent({
            eventType: 'node_click',
            clientId: config.id,
            nodeId: 'instagram-link-header',
            nodeTitle: 'Instagram',
          })}
        >
          IG
        </a>
        <a 
          href="https://tiktok.com/@marcoszavala66" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="social-link-header social-tiktok"
          onClick={() => logAnalyticsEvent({
            eventType: 'node_click',
            clientId: config.id,
            nodeId: 'tiktok-link-header',
            nodeTitle: 'TikTok',
          })}
        >
          TT
        </a>
        <a 
          href="https://youtube.com/@marcoszavalas" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="social-link-header social-youtube"
          onClick={() => logAnalyticsEvent({
            eventType: 'node_click',
            clientId: config.id,
            nodeId: 'youtube-link-header',
            nodeTitle: 'YouTube',
          })}
        >
          YT
        </a>
      </div>

      {/* Language Toggle Button */}
      <button 
        className="language-toggle"
        onClick={() => setLanguage(language === 'es' ? 'en' : 'es')}
      >
        {language === 'es' ? 'EN' : 'ES'}
      </button>

      {/* Floating Menu (Desktop) */}
      <nav className="floating-menu">
        {menuItems.map((item) => (
          <button
            key={item.id}
            className={`menu-item ${activeSection === item.id ? 'active' : ''}`}
            onClick={() => scrollToSection(item.ref)}
          >
            {item.label}
          </button>
        ))}
      </nav>

      {/* Hero Section */}
      <section ref={heroRef} id="hero" className="hero-section">
        <div className="hero-card">
          <h1 className="hero-title">{t.hero.title}</h1>
          <img src="/IMG_1413.jpg" alt="Marcos Zavala" className="hero-image" />
          <div className="audio-player-container">
            <audio ref={audioRef} src="/moogpianodeep.mp3" />
            <div className="custom-audio-player">
              <button className="play-pause-btn" onClick={togglePlay}>
                {isPlaying ? (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="square">
                    <rect x="6" y="4" width="4" height="16" />
                    <rect x="14" y="4" width="4" height="16" />
                  </svg>
                ) : (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="square" strokeLinejoin="round">
                    <polygon points="5 3 19 12 5 21 5 3" />
                  </svg>
                )}
              </button>
              <div className="audio-controls">
                <span className="time-display">{formatTime(currentTime)}</span>
                <input
                  type="range"
                  min="0"
                  max={duration || 0}
                  value={currentTime}
                  onChange={handleSeek}
                  className="audio-progress"
                />
                <span className="time-display">{formatTime(duration)}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bio Section */}
      <section ref={bioRef} id="bio" className="bio-section">
        <div className="section-card">
          <h2 className="section-title">{t.bio.title}</h2>
          <img src="/IMG_1195.jpg" alt="Bio" className="section-image" />
          <div className="bio-content">
            <p>{t.bio.content}</p>
          </div>
        </div>
      </section>

      {/* Set Section */}
      <section ref={techRef} id="tech" className="tech-section">
        <div className="section-card">
          <h2 className="section-title">{t.tech.title}</h2>
          <img src="/IMG_1197.jpg" alt="Set" className="section-image" />
          <div className="diagram-section">
            <h3 className="diagram-title">{t.tech.diagramTitle}</h3>
            <pre className="diagram-ascii">{`
    ┌──────────┐
    │ ⚡ 30V   │ ${t.tech.diagram.fuente}
    │ ──────── │
    └────┬─────┘
         │
    ┌────▼─────┐
    │  ╔═══╗   │ ${t.tech.diagram.arduino}
    │  ║███║   │ ${t.tech.diagram.trigger}
    │  ╚═══╝   │
    └────┬─────┘
         │
    ┌────┼────┬────┬────┬────┐
    │    │    │    │    │    │
 ┌──▼──┐┌─▼─┐┌─▼─┐┌─▼─┐┌───────┐
 │ ╔═╗ ││╔═╗││╔═╗││╔═╗││ ╔═══╗ │
 │ ║⚙║ ││║⚙║││║⚙║││║⚙║││ ║DFAM║│
 │ ╚═╝ ││╚═╝││╚═╝││╚═╝││ ╚═══╝ │
 │Srv1 ││Sr2││Sr3││Sr4││ ${t.tech.diagram.moog}  │
 └─────┘└───┘└───┘└───┘└───────┘

 ┌──────────┐  ┌──────────┐
 │  ╔════╗  │  │  ╔═══╗   │
 │  ║    ║  │  │  ║   ║   │
 │  ╚════╝  │  │  ╚═══╝   │
 │  ${t.tech.diagram.pianoLabel}   │  │ ${t.tech.diagram.pocketLabel}   │
 └──────────┘  │ ${t.tech.diagram.operator} │
               └──────────┘

 ${t.tech.diagram.conexiones}
 • ${t.tech.diagram.fuenteToArduino}
 • ${t.tech.diagram.arduinoToServos}
 • ${t.tech.diagram.arduinoToMoog}
 • ${t.tech.diagram.pianoConn}
 • ${t.tech.diagram.pocketConn}
            `}</pre>
          </div>
        </div>
      </section>

      {/* Links Section */}
      <section ref={linksRef} id="links" className="links-section">
        <div className="section-card">
          <h2 className="section-title">{t.links.title}</h2>
          <div className="links-grid">
            <a 
              href={config.id === 'mqwfj' ? 'https://instagram.com/marqwfj_' : 'https://instagram.com/marcoszt0'} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="link-card link-instagram"
              onClick={() => logAnalyticsEvent({
                eventType: 'node_click',
                clientId: config.id,
                nodeId: 'instagram-link',
                nodeTitle: 'Instagram',
              })}
            >
              <span className="link-text">{t.links.instagram}</span>
            </a>
            <a 
              href="https://tiktok.com/@marcoszavala66" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="link-card link-tiktok"
              onClick={() => logAnalyticsEvent({
                eventType: 'node_click',
                clientId: config.id,
                nodeId: 'tiktok-link',
                nodeTitle: 'TikTok',
              })}
            >
              <span className="link-text">{t.links.tiktok}</span>
            </a>
            <a 
              href="https://youtube.com/@marcoszavalas" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="link-card link-youtube"
              onClick={() => logAnalyticsEvent({
                eventType: 'node_click',
                clientId: config.id,
                nodeId: 'youtube-link',
                nodeTitle: 'YouTube',
              })}
            >
              <span className="link-text">{t.links.youtube}</span>
            </a>
          </div>
          
          {/* Comment Section */}
          <div className="comment-section">
            <form onSubmit={handleSubmitComment} className="comment-form">
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={t.comment.placeholder}
                className="comment-input"
                rows={3}
                maxLength={500}
              />
              <button 
                type="submit" 
                className="comment-button"
                disabled={commentStatus === 'sending' || !comment.trim()}
              >
                {commentStatus === 'sending' ? '...' : t.comment.button}
              </button>
              {commentStatus === 'success' && (
                <span className="comment-status success">{t.comment.success}</span>
              )}
              {commentStatus === 'error' && (
                <span className="comment-status error">{t.comment.error}</span>
              )}
            </form>
          </div>
        </div>
      </section>

      {/* Mobile Navigation Bar */}
      <nav className="mobile-nav">
        {menuItems.map((item) => (
          <button
            key={item.id}
            className={`mobile-nav-item ${activeSection === item.id ? 'active' : ''}`}
            onClick={() => scrollToSection(item.ref)}
          >
            {item.label}
          </button>
        ))}
      </nav>
    </div>
  );
};

export default LandingPage;




