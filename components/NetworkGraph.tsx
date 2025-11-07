
import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { TorNode, Link, NodeType } from '../types';

interface NetworkGraphProps {
  nodes: TorNode[];
  links: Link[];
  tracedPath: Link[];
  onNodeClick: (node: TorNode) => void;
}

const getNodeColor = (type: NodeType) => {
  switch (type) {
    case NodeType.Guard: return '#2563eb'; // blue-600
    case NodeType.Relay: return '#9ca3af'; // gray-400
    case NodeType.Exit: return '#dc2626'; // red-600
    case NodeType.Origin: return '#16a34a'; // green-600
    default: return '#f59e0b'; // amber-500
  }
};

const NetworkGraph: React.FC<NetworkGraphProps> = ({ nodes, links, tracedPath, onNodeClick }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!nodes.length || !svgRef.current || !containerRef.current) return;

    const { width, height } = containerRef.current.getBoundingClientRect();
    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', [-width / 2, -height / 2, width, height].join(' '));

    svg.selectAll("*").remove(); // Clear previous render

    const simulation = d3.forceSimulation(nodes as d3.SimulationNodeDatum[])
      .force('link', d3.forceLink(links).id((d: any) => d.id).distance(100))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(0, 0))
      .force('x', d3.forceX().strength(0.05))
      .force('y', d3.forceY().strength(0.05));
    
    const g = svg.append('g');

    const link = g.append('g')
      .attr('stroke', '#444')
      .attr('stroke-opacity', 0.6)
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('stroke-width', 1.5);

    const tracedLink = g.append('g')
      .attr('stroke', '#00ff99')
      .attr('stroke-opacity', 0.9)
      .selectAll('line')
      .data(tracedPath)
      .join('line')
      .attr('stroke-width', 3)
      .attr('stroke-dasharray', '5,5');

    const node = g.append('g')
      .selectAll('g')
      .data(nodes)
      .join('g')
      .attr('class', 'cursor-pointer group')
      .on('click', (event, d) => onNodeClick(d as TorNode))
      .call(d3.drag<SVGGElement, TorNode>()
          .on('start', (event, d) => {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
          })
          .on('drag', (event, d) => {
            d.fx = event.x;
            d.fy = event.y;
          })
          .on('end', (event, d) => {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
          }));

    node.append('circle')
      .attr('r', d => d.type === NodeType.Origin || d.type === NodeType.Exit ? 12 : 8)
      .attr('fill', d => getNodeColor(d.type))
      .attr('stroke', '#1a1a1a')
      .attr('stroke-width', 2);
    
    const tracedNodeIds = new Set(tracedPath.flatMap(l => [l.source, l.target]));
    node.filter(d => tracedNodeIds.has(d.id))
      .append('circle')
      .attr('r', d => (d.type === NodeType.Origin || d.type === NodeType.Exit ? 12 : 8) + 4)
      .attr('fill', 'none')
      .attr('stroke', '#00ff99')
      .attr('stroke-width', 2)
      .style('pointer-events', 'none')
      .append('animate')
        .attr('attributeName', 'r')
        .attr('from', d => (d.type === NodeType.Origin || d.type === NodeType.Exit ? 12 : 8) + 4)
        .attr('to', d => (d.type === NodeType.Origin || d.type === NodeType.Exit ? 12 : 8) + 12)
        .attr('dur', '1.5s')
        .attr('repeatCount', 'indefinite')
        .attr('begin', '0s');

    node.append('text')
      .attr('x', 15)
      .attr('y', 5)
      .attr('fill', '#e0e0e0')
      .attr('font-size', '10px')
      .attr('class', 'opacity-0 group-hover:opacity-100 transition-opacity duration-300')
      .text(d => `${d.id} [${d.country}]`);

    simulation.on('tick', () => {
      link
        .attr('x1', d => (d.source as any).x)
        .attr('y1', d => (d.source as any).y)
        .attr('x2', d => (d.target as any).x)
        .attr('y2', d => (d.target as any).y);
    
      tracedLink
        .attr('x1', d => (d.source as any).x)
        .attr('y1', d => (d.source as any).y)
        .attr('x2', d => (d.target as any).x)
        .attr('y2', d => (d.target as any).y);

      node.attr('transform', d => `translate(${d.x},${d.y})`);
    });

    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom);

    return () => {
      simulation.stop();
    };
  }, [nodes, links, tracedPath, onNodeClick]);

  return (
    <div ref={containerRef} className="w-full h-full relative">
      <svg ref={svgRef}></svg>
      <div className="absolute top-2 left-2 p-2 bg-black bg-opacity-50 rounded text-xs">
        <div className="flex items-center gap-2 mb-1"><div className="w-3 h-3 rounded-full bg-[#16a34a]"></div>Origin Candidate</div>
        <div className="flex items-center gap-2 mb-1"><div className="w-3 h-3 rounded-full bg-[#2563eb]"></div>Guard Node</div>
        <div className="flex items-center gap-2 mb-1"><div className="w-3 h-3 rounded-full bg-[#9ca3af]"></div>Relay Node</div>
        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#dc2626]"></div>Exit Node</div>
      </div>
    </div>
  );
};

export default NetworkGraph;
