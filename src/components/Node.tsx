import React, { useState, useRef } from 'react';
import './Node.css';

interface NodeProps {
  id: string;
  title: string;
  color: string;
  position: { x: number; y: number };
  onClick: (nodeId: string) => void;
  onPositionChange: (nodeId: string, newPosition: { x: number; y: number }) => void;
  onDragStart: (nodeId: string, startPos: { x: number; y: number }) => void;
  onDragEnd: (nodeId: string, endPos: { x: number; y: number }) => void;
  onConnectionStart: (nodeId: string, startPos: { x: number; y: number }) => void;
  onConnectionDrag: (currentPos: { x: number; y: number }) => void;
  onConnectionEnd: (nodeId: string) => void;
  isBeingDragged?: boolean;
}

const Node: React.FC<NodeProps> = ({ 
  id, 
  title, 
  color, 
  position, 
  onClick, 
  onPositionChange,
  onDragStart,
  onDragEnd,
  onConnectionStart,
  onConnectionDrag,
  onConnectionEnd,
  isBeingDragged = false
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const nodeRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    
    // Si es click derecho, iniciar conexión
    if (e.button === 2) {
      setIsConnecting(true);
      const rect = nodeRef.current?.getBoundingClientRect();
      if (rect) {
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        onConnectionStart(id, { x: centerX, y: centerY });
      }
      return;
    }

    // Click izquierdo para drag
    if (e.button === 0) {
      setDragOffset({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      });
      setIsDragging(true);
      onDragStart(id, position);
    }
  };

  // Manejar eventos globales para drag
  React.useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const newPosition = {
          x: e.clientX - dragOffset.x,
          y: e.clientY - dragOffset.y
        };
        onPositionChange(id, newPosition);
      }
    };

    const handleGlobalMouseUp = (e: MouseEvent) => {
      if (isDragging) {
        setIsDragging(false);
        onDragEnd(id, position);
      }
      if (isConnecting) {
        setIsConnecting(false);
        // Verificar si se soltó sobre un nodo
        const element = document.elementFromPoint(e.clientX, e.clientY);
        const nodeElement = element?.closest('.node');
        if (nodeElement) {
          const targetId = nodeElement.getAttribute('data-node-id');
          if (targetId && targetId !== id) {
            onConnectionEnd(targetId);
            return;
          }
        }
        onConnectionEnd('');
      }
    };

    if (isDragging || isConnecting) {
      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleGlobalMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [isDragging, isConnecting, dragOffset, position, id, onPositionChange, onDragEnd, onConnectionEnd]);

  const handleClick = (e: React.MouseEvent) => {
    // Solo trigger onClick si no estaba arrastrando
    if (!isDragging && !isConnecting && e.button === 0) {
      onClick(id);
    }
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevenir menú contextual del navegador
  };

  return (
    <div
      ref={nodeRef}
      data-node-id={id}
      className={`node ${isDragging ? 'dragging' : ''} ${isBeingDragged ? 'being-dragged' : ''}`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        backgroundColor: color,
        cursor: isDragging ? 'grabbing' : 'grab',
      }}
      onMouseDown={handleMouseDown}
      onClick={handleClick}
      onContextMenu={handleContextMenu}
    >
      <span className="node-title">{title}</span>
      <div className="node-connection-hint">
        Click derecho para conectar
      </div>
    </div>
  );
};

export default Node;
