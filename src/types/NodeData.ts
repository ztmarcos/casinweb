export interface NodeData {
  id: string;
  title: string;
  color: string;
  position: { x: number; y: number };
  content: string;
  connections: string[];
  parentId?: string;
  image?: string;
  isExpanded?: boolean;
}
