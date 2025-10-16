import React, { useMemo, useState } from 'react';
import ModalPublic from './ModalPublic';
import './MindMap.css';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import type { NodeData } from '../types/NodeData';

const MINDMAP_COLLECTION = 'mindmapNodes';

const MindMapPublic: React.FC = () => {
  const [allNodes, setAllNodes] = useState<NodeData[]>([]);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [selectedNode, setSelectedNode] = useState<NodeData | null>(null);
  const [viewport, setViewport] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1024,
    height: typeof window !== 'undefined' ? window.innerHeight : 768,
  });

  const nodesCollectionRef = useMemo(() => collection(db, MINDMAP_COLLECTION), []);

  React.useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      setViewport({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  React.useEffect(() => {
    const unsubscribe = onSnapshot(
      nodesCollectionRef,
      snapshot => {
        if (snapshot.empty) return;

        const remoteNodes: NodeData[] = snapshot.docs.map(docSnap => {
          const data = docSnap.data() as Omit<NodeData, 'id'>;
          return {
            id: docSnap.id,
            title: data.title ?? '',
            color: data.color ?? '#8B5CF6',
            content: data.content ?? '',
            connections: Array.isArray(data.connections) ? data.connections : [],
            position: {
              x: data.position?.x ?? 0,
              y: data.position?.y ?? 0,
            },
            parentId: data.parentId,
            isExpanded: data.isExpanded ?? false,
            image: data.image,
          };
        });

        console.log('=== DEBUG FIREBASE ===');
        console.log('Total nodos recibidos:', remoteNodes.length);
        const rootNodes = remoteNodes.filter(n => !n.parentId);
        console.log('Nodos raíz:', rootNodes.map(n => ({ id: n.id, title: n.title })));
        
        setAllNodes([...remoteNodes].sort((a, b) => a.id.localeCompare(b.id)));
      },
      error => {
        console.error('Error fetching nodes from Firestore', error);
      }
    );

    return () => unsubscribe();
  }, [nodesCollectionRef]);

  // Filtrar nodos visibles (solo nodos raíz y sus hijos expandidos)
  const visibleNodes = useMemo(() => {
    // Filtrar SOLO nodos principales (sin parentId)
    const roots = allNodes.filter(node => !node.parentId);
    
    // Verificar si algún nodo raíz está expandido
    const expandedRoots = roots.filter(root => expandedNodes.has(root.id));
    
    // Si hay algún nodo raíz expandido, SOLO mostrar ese y sus hijos
    // Si NO hay ninguno expandido, mostrar todos los nodos raíz
    const visible: NodeData[] = expandedRoots.length > 0 ? [...expandedRoots] : [...roots];
    
    // Función recursiva para agregar hijos SOLO si el padre está expandido
    const addChildrenRecursively = (parentId: string) => {
      // SOLO agregar hijos si el nodo está expandido
      if (!expandedNodes.has(parentId)) return;
      
      const children = allNodes.filter(node => node.parentId === parentId);
      children.forEach(child => {
        visible.push(child);
        // Recursivamente agregar descendientes si este hijo también está expandido
        addChildrenRecursively(child.id);
      });
    };

    // Intentar expandir desde los nodos visibles
    visible.forEach(node => {
      if (!node.parentId) { // Solo si es raíz
        addChildrenRecursively(node.id);
      }
    });
    
    // Recalcular posiciones según el dispositivo
    const isMobile = viewport.width <= 768;
    
    if (isMobile) {
      // MÓVIL: Layout horizontal - padres a la izquierda, hijos a la derecha
      const positioned: NodeData[] = [];
      const spacing = 120;
      const leftMargin = 20;
      const parentX = leftMargin;
      const childX = Math.min(viewport.width - 250, parentX + 220); // Más separación para evitar superposición
      
      // Obtener nodos raíz
      const rootNodes = visible.filter(n => !n.parentId);
      
      if (rootNodes.length === 0) {
        return positioned;
      }
      
      // Si solo hay nodos raíz (sin expandir), mostrarlos a la izquierda
      if (rootNodes.length === visible.length) {
        const order = ['vida-main', 'gm-main', 'autos-main', 'hogar-main', 'negocio-main', 'empresarial-main', 'beneficios-main', 'blog-main'];
        const sortedRoots = rootNodes.sort((a, b) => {
          const indexA = order.indexOf(a.id);
          const indexB = order.indexOf(b.id);
          return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB);
        });
        
        const result = sortedRoots.map((node, index) => ({
          ...node,
          position: {
            x: parentX,
            y: 20 + index * spacing,
          },
        }));
        
        console.log('🔍 MOBILE - Nodos ordenados para mostrar:', result.map(n => ({ id: n.id, title: n.title, image: n.image || 'SIN_IMAGEN' })));
        return result;
      }
      
      // Si hay expandidos, mostrar padre a la izquierda y hijos a la derecha
      const rootNode = rootNodes[0]; // Solo puede haber uno expandido a la vez
      const children = visible.filter(n => n.parentId === rootNode.id);
      
      // Ordenar hijos para que "Tipos de Planes" aparezca primero
      const childOrder = ['vida-planes', 'vida-moneda', 'vida-actualizacion', 'vida-valores', 'vida-fideicomiso', 'vida-coberturas'];
      const sortedChildren = children.sort((a, b) => {
        const indexA = childOrder.indexOf(a.id);
        const indexB = childOrder.indexOf(b.id);
        return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB);
      });
      
      // Posicionar nodo raíz a la izquierda
      positioned.push({
        ...rootNode,
        position: {
          x: parentX,
          y: 100,
        },
      });
      
      // Posicionar hijos a la derecha, empezando debajo del padre
      sortedChildren.forEach((child, index) => {
        positioned.push({
          ...child,
          position: {
            x: childX,
            y: 200 + index * spacing, // Empezar debajo del padre (y=100 + altura del nodo + margen)
          },
        });
      });
      
      return positioned;
    } else {
      // DESKTOP: Layout tipo mapa mental (horizontal)
      const positioned: NodeData[] = [];
      
      // Obtener todos los nodos raíz
      const rootNodes = visible.filter(n => !n.parentId);
      
      if (rootNodes.length === 0) {
        return positioned;
      }
      
      // Si solo hay nodos raíz (sin expandir), mostrarlos a la IZQUIERDA en orden específico
      if (rootNodes.length === visible.length) {
        const spacing = 100;
        const leftMargin = 50;
        const startY = 50;
        
        // Ordenar nodos según el orden deseado
        const order = ['vida-main', 'gm-main', 'autos-main', 'hogar-main', 'negocio-main', 'empresarial-main', 'beneficios-main', 'blog-main'];
        const sortedRoots = rootNodes.sort((a, b) => {
          const indexA = order.indexOf(a.id);
          const indexB = order.indexOf(b.id);
          return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB);
        });
        
        const result = sortedRoots.map((node, index) => ({
          ...node,
          position: {
            x: leftMargin,
            y: startY + (index * spacing),
          },
        }));
        
        console.log('🔍 DESKTOP - Nodos ordenados para mostrar:');
        result.forEach((n, index) => {
          console.log(`  ${index}: ${n.id} | ${n.title}`);
        });
        return result;
      }
      
      // Si hay un nodo expandido, expandir hacia la DERECHA
      const rootNode = rootNodes[0]; // Solo puede haber uno expandido a la vez
      const leftMargin = 150;
      const topMargin = 150; // Margen superior mínimo
      
      // Obtener hijos directos del nodo raíz y ordenarlos
      const children = visible.filter(n => n.parentId === rootNode.id);
      
      // Ordenar hijos para que "Tipos de Planes" aparezca primero
      const childOrder = ['vida-planes', 'vida-moneda', 'vida-actualizacion', 'vida-valores', 'vida-fideicomiso', 'vida-coberturas'];
      const sortedChildren = children.sort((a, b) => {
        const indexA = childOrder.indexOf(a.id);
        const indexB = childOrder.indexOf(b.id);
        return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB);
      });
      
      // Posicionar nodo raíz
      const rootY = topMargin;
      
      positioned.push({
        ...rootNode,
        position: { x: leftMargin, y: rootY },
      });
      
      // Posicionar hijos debajo del padre, hacia la derecha
      const childSpacing = 130;
      const childStartY = rootY + 120; // Debajo del padre (y + altura del nodo + margen)
      
      sortedChildren.forEach((child, index) => {
        const x = leftMargin + 380; // Hacia la derecha
        const y = childStartY + (index * childSpacing);
        
        positioned.push({
          ...child,
          position: { x, y },
        });
        
        // Posicionar nietos (sub-hijos) más a la derecha, debajo del hijo
        const grandChildren = visible.filter(n => n.parentId === child.id);
        if (grandChildren.length > 0) {
          const grandChildSpacing = 110;
          const grandChildStartY = y + 120; // Debajo del hijo
          
          grandChildren.forEach((grandChild, gIndex) => {
            positioned.push({
              ...grandChild,
              position: {
                x: x + 340, // Más a la derecha
                y: grandChildStartY + (gIndex * grandChildSpacing),
              },
            });
          });
        }
      });
      
      return positioned;
    }
  }, [allNodes, expandedNodes, viewport]);

  const canvasBounds = useMemo(() => {
    const isMobile = viewport.width <= 768;
    const NODE_WIDTH = 200;
    const NODE_HEIGHT = 60;
    const marginY = isMobile ? 40 : 60;
    const marginX = isMobile ? 20 : 40;

    if (!visibleNodes.length) {
      return {
        width: viewport.width,
        height: Math.max(viewport.height, 600),
      };
    }

    const maxY = visibleNodes.reduce((acc, node) => Math.max(acc, node.position.y), 0);
    const maxX = visibleNodes.reduce((acc, node) => Math.max(acc, node.position.x), 0);

    return {
      width: Math.max(maxX + NODE_WIDTH + marginX, viewport.width),
      height: Math.max(maxY + NODE_HEIGHT + marginY, 600),
    };
  }, [visibleNodes, viewport]);

  const handleNodeClick = (nodeId: string) => {
    const node = allNodes.find(n => n.id === nodeId);
    if (!node) return;

    // Manejo especial para el blog - redirigir a URL externa
    if (nodeId === 'blog-main') {
      window.open('https://blog.casinseguros.com/', '_blank');
      return;
    }

    // Si el nodo tiene hijos, expandir/colapsar
    const hasChildren = allNodes.some(n => n.parentId === nodeId);
    
    if (hasChildren) {
      setExpandedNodes(prev => {
        const newSet = new Set(prev);
        if (newSet.has(nodeId)) {
          newSet.delete(nodeId);
          // También colapsar todos los descendientes
          const collapseDescendants = (id: string) => {
            newSet.delete(id);
            allNodes.filter(n => n.parentId === id).forEach(child => {
              collapseDescendants(child.id);
            });
          };
          collapseDescendants(nodeId);
        } else {
          newSet.add(nodeId);
        }
        return newSet;
      });
    }

    // Siempre abrir modal para mostrar contenido del nodo
    setSelectedNode(node);
  };

  const handleGoBack = () => {
    // Colapsar todos los nodos
    setExpandedNodes(new Set());
  };

  const renderConnections = () => {
    const connections: React.ReactElement[] = [];
    const isMobile = viewport.width <= 768;

    visibleNodes.forEach(node => {
      node.connections.forEach(connectionId => {
        const connectedNode = visibleNodes.find(n => n.id === connectionId);

        if (connectedNode && node.id < connectionId) {
          const fromX = node.position.x + 110;
          const fromY = node.position.y + 43;
          const toX = connectedNode.position.x + 110;
          const toY = connectedNode.position.y + 43;

          let pathData;
          
          if (isMobile) {
            // Móvil: línea vertical simple con curva
            const midY = (fromY + toY) / 2;
            pathData = `M ${fromX} ${fromY} L ${fromX} ${midY} L ${toX} ${midY} L ${toX} ${toY}`;
          } else {
            // Desktop: curva suave horizontal
            const midX = (fromX + toX) / 2;
            pathData = `M ${fromX} ${fromY} C ${midX} ${fromY}, ${midX} ${toY}, ${toX} ${toY}`;
          }

          connections.push(
            <path
              key={`${node.id}-${connectionId}`}
              d={pathData}
              stroke="#64748B"
              strokeWidth="2"
              opacity="0.3"
              fill="none"
              className="connection-line"
              style={{ pointerEvents: 'none' }}
            />
          );
        }
      });
    });

    return connections;
  };

  const hasChildren = (nodeId: string) => {
    return allNodes.some(n => n.parentId === nodeId);
  };

  const isExpanded = (nodeId: string) => {
    return expandedNodes.has(nodeId);
  };

  return (
    <div className="mind-map">
      <div className="mind-map-container">
        <div className="brand-header">
          <h1 className="brand-title">CASIN Seguros</h1>
          <img src="/logo.png" alt="CASIN Logo" className="brand-logo" />
        </div>

        {expandedNodes.size > 0 && (
          <button className="back-button" onClick={handleGoBack}>
            ← Volver
          </button>
        )}

        <div
          className="nodes-container"
          style={{
            width: `${canvasBounds.width}px`,
            height: `${canvasBounds.height}px`,
          }}
          ref={(el) => {
            if (el) {
              console.log('📐 Contenedor dimensiones:', { 
                width: canvasBounds.width, 
                height: canvasBounds.height,
                viewport: viewport
              });
            }
          }}
        >
          {(() => {
            console.log('🎨 RENDERIZANDO nodos con posiciones:');
            visibleNodes.forEach((n, i) => {
              console.log(`  ${i}: ${n.id} | ${n.title} | Pos: (${n.position.x}, ${n.position.y})`);
            });
            return visibleNodes.map(node => (
            <div
              key={node.id}
              className="node"
              style={{
                left: `${node.position.x}px`,
                top: `${node.position.y}px`,
                backgroundColor: node.color,
                cursor: 'pointer',
                position: 'absolute',
                padding: '10px 14px',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                minWidth: '160px',
                maxWidth: '200px',
                transition: 'transform 0.2s, box-shadow 0.2s',
                border: '1px solid rgba(255,255,255,0.2)',
                zIndex: 10,
              }}
              onClick={() => handleNodeClick(node.id)}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.25)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span 
                  style={{ 
                    color: 'white', 
                    fontWeight: 600,
                    fontSize: '14px',
                    textShadow: '0 1px 3px rgba(0,0,0,0.3)',
                    display: 'block',
                    lineHeight: '1.3',
                    flex: 1,
                  }}
                >
                  {node.title}
                </span>
                {hasChildren(node.id) && !isExpanded(node.id) && (
                  <span style={{ 
                    color: 'white', 
                    fontSize: '16px',
                    marginLeft: '8px',
                    fontWeight: 'bold',
                  }}>
                    +
                  </span>
                )}
                {node.id === 'blog-main' && (
                  <span style={{ 
                    color: 'white', 
                    fontSize: '14px',
                    marginLeft: '8px',
                    fontWeight: 'bold',
                  }}>
                    🔗
                  </span>
                )}
              </div>
            </div>
            ));
          })()}

          <svg 
            className="connections" 
            width={canvasBounds.width} 
            height={canvasBounds.height}
            style={{ zIndex: 0 }}
          >
            {renderConnections()}
          </svg>
        </div>
      </div>

      <ModalPublic
        isOpen={selectedNode !== null}
        onClose={() => setSelectedNode(null)}
        title={selectedNode?.title || ''}
        content={selectedNode?.content || ''}
        color={selectedNode?.color || '#8B5CF6'}
        image={selectedNode?.image}
      />
    </div>
  );
};

export default MindMapPublic;
