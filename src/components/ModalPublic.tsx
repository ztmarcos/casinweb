import React from 'react';
import './Modal.css';

interface ModalPublicProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  content: string;
  color: string;
  image?: string;
}

const ModalPublic: React.FC<ModalPublicProps> = ({ 
  isOpen, 
  onClose, 
  title, 
  content, 
  color,
  image 
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content public-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header" style={{ backgroundColor: color }}>
          <h2 className="modal-title">{title}</h2>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>
        
        <div className="modal-body">
          {image && (
            <div className="modal-image-container">
              <img 
                src={image} 
                alt={title}
                className="modal-image"
                loading="eager"
                onError={(e) => {
                  console.error('Error loading image:', image);
                  console.error('Trying to load from:', window.location.origin + image);
                  // Intentar cargar con timestamp para evitar caché
                  const img = e.currentTarget;
                  const newSrc = image + '?v=' + Date.now();
                  img.src = newSrc;
                }}
              />
            </div>
          )}
          
          <div className="modal-text-content">
            {content.split('\n').map((paragraph, index) => {
              if (paragraph.trim() === '') {
                return <br key={index} />;
              }
              
              // Detectar si es una lista
              if (paragraph.trim().startsWith('•')) {
                return (
                  <div key={index} className="modal-list-item">
                    {paragraph}
                  </div>
                );
              }
              
              // Detectar títulos (texto en mayúsculas)
              if (paragraph === paragraph.toUpperCase() && paragraph.length > 3 && !paragraph.includes(':')) {
                return (
                  <h3 key={index} className="modal-subtitle">
                    {paragraph}
                  </h3>
                );
              }
              
              return (
                <p key={index} className="modal-paragraph">
                  {paragraph}
                </p>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalPublic;
