import React, { useState, useEffect } from 'react';
import './Modal.css';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  content: string;
  color: string;
  onSave: (title: string, content: string, color: string) => void;
  onDelete?: () => void;
  isNew?: boolean;
}

const Modal: React.FC<ModalProps> = ({ 
  isOpen, 
  onClose, 
  title, 
  content, 
  color, 
  onSave, 
  onDelete,
  isNew = false 
}) => {
  const [editTitle, setEditTitle] = useState(title);
  const [editContent, setEditContent] = useState(content);
  const [editColor, setEditColor] = useState(color);

  useEffect(() => {
    setEditTitle(title);
    setEditContent(content);
    setEditColor(color);
  }, [title, content, color, isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(editTitle, editContent, editColor);
    onClose();
  };

  const handleDelete = () => {
    if (onDelete && window.confirm('¿Estás seguro de que quieres eliminar este nodo?')) {
      onDelete();
      onClose();
    }
  };

  const colorOptions = [
    { value: '#8B5CF6', name: 'Morado' },
    { value: '#EF4444', name: 'Rojo' },
    { value: '#6366F1', name: 'Azul' },
    { value: '#F59E0B', name: 'Naranja' },
    { value: '#10B981', name: 'Verde' },
    { value: '#EC4899', name: 'Rosa' },
    { value: '#06B6D4', name: 'Cian' },
    { value: '#84CC16', name: 'Lima' }
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{isNew ? 'Crear Nuevo Nodo' : 'Editar Nodo'}</h2>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="modal-body">
          <div className="form-group">
            <label htmlFor="title">Título:</label>
            <input
              id="title"
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              placeholder="Título del nodo"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="color">Color:</label>
            <div className="color-picker">
              {colorOptions.map((colorOption) => (
                <button
                  key={colorOption.value}
                  className={`color-option ${editColor === colorOption.value ? 'selected' : ''}`}
                  style={{ backgroundColor: colorOption.value }}
                  onClick={() => setEditColor(colorOption.value)}
                  title={colorOption.name}
                />
              ))}
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="content">Contenido:</label>
            <textarea
              id="content"
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              placeholder="Contenido del nodo"
              rows={6}
            />
          </div>
          
          <div className="modal-actions">
            <button className="btn btn-primary" onClick={handleSave}>
              {isNew ? 'Crear' : 'Guardar'}
            </button>
            {!isNew && onDelete && (
              <button className="btn btn-danger" onClick={handleDelete}>
                Eliminar
              </button>
            )}
            <button className="btn btn-secondary" onClick={onClose}>
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
