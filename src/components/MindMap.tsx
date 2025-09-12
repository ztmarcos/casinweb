import React, { useState } from 'react';
import Node from './Node';
import Modal from './Modal';
import './MindMap.css';

interface NodeData {
  id: string;
  title: string;
  color: string;
  position: { x: number; y: number };
  content: string;
  connections: string[];
}

const MindMap: React.FC = () => {
  const [selectedNode, setSelectedNode] = useState<NodeData | null>(null);
  const [isCreatingNode, setIsCreatingNode] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectingFrom, setConnectingFrom] = useState<string | null>(null);
  const [draggedNode, setDraggedNode] = useState<string | null>(null);
  const [connectionLine, setConnectionLine] = useState<{
    from: { x: number; y: number };
    to: { x: number; y: number };
  } | null>(null);

  // Estado inicial de los nodos
  const [nodes, setNodes] = useState<NodeData[]>([
    {
      id: '1',
      title: 'Suma asegurada',
      color: '#8B5CF6',
      position: { x: 400, y: 100 },
      content: 'La suma asegurada es el monto máximo que la compañía de seguros pagará en caso de un siniestro cubierto por la póliza. Este valor se establece al momento de contratar el seguro y determina el límite de cobertura.',
      connections: ['2', '3', '4']
    },
    {
      id: '2',
      title: 'Seguro de gastos médicos',
      color: '#EF4444',
      position: { x: 600, y: 300 },
      content: 'El seguro de gastos médicos cubre los costos de atención médica, hospitalización, medicamentos y tratamientos. Incluye consultas médicas, estudios de laboratorio, cirugías y otros gastos relacionados con la salud.',
      connections: ['1']
    },
    {
      id: '3',
      title: 'Coberturas',
      color: '#6366F1',
      position: { x: 200, y: 300 },
      content: 'Las coberturas son los riesgos y situaciones que están protegidos por el seguro. Pueden incluir accidentes, enfermedades, catástrofes naturales, robo, responsabilidad civil, entre otros, según el tipo de póliza.',
      connections: ['1']
    },
    {
      id: '4',
      title: 'Renovación vitalicia',
      color: '#F59E0B',
      position: { x: 400, y: 500 },
      content: 'La renovación vitalicia garantiza que el asegurado pueda renovar su póliza de seguro de forma continua, sin límite de edad, manteniendo la cobertura durante toda su vida, sujeto al pago de primas.',
      connections: ['1']
    }
  ]);

  const handleNodeClick = (nodeId: string) => {
    const node = nodes.find(n => n.id === nodeId);
    if (node) {
      setSelectedNode(node);
    }
  };

  const handleNodePositionChange = (nodeId: string, newPosition: { x: number; y: number }) => {
    setNodes(prevNodes =>
      prevNodes.map(node =>
        node.id === nodeId ? { ...node, position: newPosition } : node
      )
    );
  };

  const handleDragStart = (nodeId: string, startPos: { x: number; y: number }) => {
    setDraggedNode(nodeId);
  };

  const handleDragEnd = (nodeId: string, endPos: { x: number; y: number }) => {
    setDraggedNode(null);
  };

  const handleConnectionStart = (nodeId: string, startPos: { x: number; y: number }) => {
    setIsConnecting(true);
    setConnectingFrom(nodeId);
    setConnectionLine({
      from: startPos,
      to: startPos
    });
  };

  const handleConnectionDrag = (currentPos: { x: number; y: number }) => {
    if (connectionLine) {
      setConnectionLine({
        ...connectionLine,
        to: currentPos
      });
    }
  };

  const handleConnectionEnd = (targetNodeId: string) => {
    if (isConnecting && connectingFrom && targetNodeId && targetNodeId !== connectingFrom) {
      // Crear conexión entre nodos
      setNodes(prevNodes => 
        prevNodes.map(node => {
          if (node.id === connectingFrom) {
            // Evitar conexiones duplicadas
            if (!node.connections.includes(targetNodeId)) {
              return {
                ...node,
                connections: [...node.connections, targetNodeId]
              };
            }
          }
          if (node.id === targetNodeId) {
            // Evitar conexiones duplicadas
            if (!node.connections.includes(connectingFrom)) {
              return {
                ...node,
                connections: [...node.connections, connectingFrom]
              };
            }
          }
          return node;
        })
      );
    }
    
    // Limpiar estado de conexión
    setIsConnecting(false);
    setConnectingFrom(null);
    setConnectionLine(null);
  };

  const handleCreateNode = () => {
    setIsCreatingNode(true);
    setSelectedNode({
      id: '',
      title: '',
      color: '#8B5CF6',
      position: { x: 400, y: 300 },
      content: '',
      connections: []
    });
  };

  const handleSaveNode = (title: string, content: string, color: string) => {
    if (isCreatingNode) {
      const newNode: NodeData = {
        id: Date.now().toString(),
        title,
        content,
        color,
        position: { 
          x: Math.random() * (window.innerWidth - 200) + 100,
          y: Math.random() * (window.innerHeight - 200) + 100
        },
        connections: []
      };
      setNodes(prevNodes => [...prevNodes, newNode]);
      setIsCreatingNode(false);
    } else if (selectedNode) {
      setNodes(prevNodes =>
        prevNodes.map(node =>
          node.id === selectedNode.id
            ? { ...node, title, content, color }
            : node
        )
      );
    }
  };

  const handleDeleteNode = () => {
    if (selectedNode) {
      setNodes(prevNodes => {
        // Eliminar el nodo y todas sus conexiones
        return prevNodes
          .filter(node => node.id !== selectedNode.id)
          .map(node => ({
            ...node,
            connections: node.connections.filter(connId => connId !== selectedNode.id)
          }));
      });
    }
  };

  const handleCloseModal = () => {
    setSelectedNode(null);
    setIsCreatingNode(false);
  };

  const renderConnections = () => {
    const connections: React.ReactElement[] = [];
    
    nodes.forEach(node => {
      node.connections.forEach(connectionId => {
        const connectedNode = nodes.find(n => n.id === connectionId);
        if (connectedNode) {
          // Evitar duplicar líneas (solo dibujar desde el nodo con ID menor)
          if (node.id < connectionId) {
            connections.push(
              <line
                key={`${node.id}-${connectionId}`}
                x1={node.position.x + 60}
                y1={node.position.y + 20}
                x2={connectedNode.position.x + 60}
                y2={connectedNode.position.y + 20}
                stroke="#666"
                strokeWidth="2"
                opacity="0.6"
                strokeDasharray="5,5"
              />
            );
          }
        }
      });
    });
    
    return connections;
  };

  // Manejar eventos globales del mouse para drag y conexiones
  React.useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (isConnecting && connectionLine) {
        setConnectionLine({
          ...connectionLine,
          to: { x: e.clientX, y: e.clientY }
        });
      }
    };

    const handleGlobalMouseUp = (e: MouseEvent) => {
      if (isConnecting) {
        // Si no se soltó sobre un nodo, cancelar conexión
        setIsConnecting(false);
        setConnectingFrom(null);
        setConnectionLine(null);
      }
    };

    if (isConnecting) {
      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleGlobalMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [isConnecting, connectionLine]);

  return (
    <div className="mind-map">
      <div className="mind-map-container">
        <h1 className="mind-map-title">Mapa Mental de Seguros - Admin</h1>
        
        {/* Controles de Admin */}
        <div className="admin-controls">
          <button className="admin-btn create-btn" onClick={handleCreateNode}>
            +
          </button>
        </div>

        {isConnecting && (
          <div className="connection-instructions">
            Arrastra desde el conector azul hacia otro nodo para conectarlos
          </div>
        )}
        
        <div className="nodes-container">
          {nodes.map(node => (
            <Node
              key={node.id}
              id={node.id}
              title={node.title}
              color={node.color}
              position={node.position}
              onClick={handleNodeClick}
              onPositionChange={handleNodePositionChange}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onConnectionStart={handleConnectionStart}
              onConnectionDrag={handleConnectionDrag}
              onConnectionEnd={handleConnectionEnd}
              isBeingDragged={draggedNode === node.id}
            />
          ))}
          
          {/* Líneas conectoras dinámicas */}
          <svg className="connections" width="100%" height="100%">
            {renderConnections()}
            
            {/* Línea de conexión temporal mientras se arrastra */}
            {connectionLine && (
              <line
                x1={connectionLine.from.x}
                y1={connectionLine.from.y}
                x2={connectionLine.to.x}
                y2={connectionLine.to.y}
                stroke="#3B82F6"
                strokeWidth="3"
                strokeDasharray="8,4"
                opacity="0.8"
                className="connection-preview"
              />
            )}
          </svg>
        </div>
      </div>

      <Modal
        isOpen={selectedNode !== null}
        onClose={handleCloseModal}
        title={selectedNode?.title || ''}
        content={selectedNode?.content || ''}
        color={selectedNode?.color || '#8B5CF6'}
        onSave={handleSaveNode}
        onDelete={!isCreatingNode ? handleDeleteNode : undefined}
        isNew={isCreatingNode}
      />
    </div>
  );
};

export default MindMap;
