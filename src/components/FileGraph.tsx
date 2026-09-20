import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { FileItem } from '../types';

interface FileGraphProps {
  fs: FileItem[];
  currentPath: string;
  onSelectNode: (file: FileItem) => void;
  onContextMenuNode?: (event: MouseEvent, file: FileItem) => void;
  width?: number;
  height?: number;
}

interface GraphNode extends d3.SimulationNodeDatum {
  id: string;
  name: string;
  type: string;
  path: string;
  size?: string;
  val: number;
  fileItem: FileItem;
}

interface GraphLink extends d3.SimulationLinkDatum<GraphNode> {
  source: string | GraphNode;
  target: string | GraphNode;
}

export const FileGraph: React.FC<FileGraphProps> = ({ fs, currentPath, onSelectNode, onContextMenuNode }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight || 500;

    // Clear old graph
    d3.select(containerRef.current).selectAll('*').remove();

    const nodes: GraphNode[] = [];
    const links: GraphLink[] = [];

    const traverse = (item: FileItem, parentId?: string) => {
      const node: GraphNode = {
        id: item.id,
        name: item.name,
        type: item.type,
        path: item.path,
        size: item.size,
        val: item.type === 'folder' ? 20 : 10,
        fileItem: item,
      };
      nodes.push(node);

      if (parentId) {
        links.push({
          source: parentId,
          target: item.id,
        });
      }

      if (item.children) {
        item.children.forEach(child => traverse(child, item.id));
      }
    };

    fs.forEach(item => traverse(item));

    const svg = d3.select(containerRef.current)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', [0, 0, width, height])
      .style('max-width', '100%')
      .style('height', '100%');

    // Add zoom capabilities
    const g = svg.append('g');

    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom);

    // Forces
    const simulation = d3.forceSimulation(nodes)
      .force('link', d3.forceLink<GraphNode, GraphLink>(links).id(d => d.id).distance(60))
      .force('charge', d3.forceManyBody().strength(-200))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collide', d3.forceCollide().radius(d => (d as GraphNode).val + 10).iterations(2));

    // Links
    const link = g.append('g')
      .attr('stroke', 'rgba(255, 255, 255, 0.15)')
      .attr('stroke-opacity', 0.6)
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('stroke-width', 1.5);

    // Nodes
    const node = g.append('g')
      .attr('stroke', 'rgba(255,255,255,0.2)')
      .attr('stroke-width', 1.5)
      .selectAll('circle')
      .data(nodes)
      .join('circle')
      .attr('r', d => d.val)
      .attr('fill', d => {
        if (d.type === 'folder') return '#fbbf24'; // amber-400
        if (d.type === 'code') return '#60a5fa'; // blue-400
        if (d.type === 'audio') return '#f472b6'; // pink-400
        return '#cbd5e1'; // slate-300
      })
      .call(drag(simulation) as any)
      .on('click', (event, d) => {
        onSelectNode(d.fileItem);
        event.stopPropagation();
      })
      .on('contextmenu', (event, d) => {
        event.preventDefault();
        event.stopPropagation();
        if (onContextMenuNode) {
          onContextMenuNode(event, d.fileItem);
        }
      });
      
    // Highlight current path node
    node.attr('stroke', d => d.path === currentPath ? '#fff' : 'rgba(255,255,255,0.2)')
        .attr('stroke-width', d => d.path === currentPath ? 3 : 1.5);

    // Labels
    const labels = g.append('g')
      .selectAll('text')
      .data(nodes)
      .join('text')
      .attr('text-anchor', 'middle')
      .attr('dy', d => d.val + 12)
      .attr('font-size', '10px')
      .attr('fill', '#94a3b8')
      .attr('font-family', 'ui-sans-serif, system-ui, sans-serif')
      .attr('pointer-events', 'none')
      .text(d => d.name);

    simulation.on('tick', () => {
      link
        .attr('x1', d => (d.source as GraphNode).x!)
        .attr('y1', d => (d.source as GraphNode).y!)
        .attr('x2', d => (d.target as GraphNode).x!)
        .attr('y2', d => (d.target as GraphNode).y!);

      node
        .attr('cx', d => d.x!)
        .attr('cy', d => d.y!);

      labels
        .attr('x', d => d.x!)
        .attr('y', d => d.y!);
    });

    // Handle resize
    const resizeObserver = new ResizeObserver(entries => {
      if (!entries.length) return;
      const { width: newWidth, height: newHeight } = entries[0].contentRect;
      svg.attr('width', newWidth).attr('height', newHeight).attr('viewBox', [0, 0, newWidth, newHeight]);
      simulation.force('center', d3.forceCenter(newWidth / 2, newHeight / 2));
      simulation.alpha(0.3).restart();
    });

    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
      simulation.stop();
    };
  }, [fs, currentPath, onSelectNode, onContextMenuNode]);

  // Drag utility for d3
  function drag(simulation: d3.Simulation<GraphNode, undefined>) {
    function dragstarted(event: any) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }
    
    function dragged(event: any) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }
    
    function dragended(event: any) {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    }
    
    return d3.drag()
      .on('start', dragstarted)
      .on('drag', dragged)
      .on('end', dragended);
  }

  return (
    <div className="w-full h-full relative">
      <div ref={containerRef} className="absolute inset-0 w-full h-full bg-slate-900/40" />
      <div className="absolute top-2 left-2 pointer-events-none text-[10px] text-slate-500 bg-black/40 px-2 py-1 rounded backdrop-blur-sm border border-white/5">
        Pan & Zoom to explore • Drag nodes to reposition
      </div>
    </div>
  );
};
