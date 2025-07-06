import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useTaskContext } from '../contexts/TaskContext';
import {
  MagnifyingGlassIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  EyeSlashIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { Network, Zap, Target, GitBranch } from 'lucide-react';
import * as d3 from 'd3';

interface TaskNode extends d3.SimulationNodeDatum {
  id: number;
  title: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in-progress' | 'completed';
  dependencies: number[];
  complexity?: number;
  subtaskCount: number;
  radius: number;
  color: string;
  group: number;
  isSubtask: boolean;
  parentTaskId?: number;
}

interface TaskLink extends d3.SimulationLinkDatum<TaskNode> {
  source: TaskNode;
  target: TaskNode;
  strength: number;
  type: 'dependency' | 'subtask';
}

const TreePage: React.FC = () => {
  const { tasks, complexityData, loading, error } = useTaskContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNode, setSelectedNode] = useState<TaskNode | null>(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [showConnections, setShowConnections] = useState(true);
  const [showSubtasks, setShowSubtasks] = useState(true);
  const [layoutType, setLayoutType] = useState<'force' | 'radial' | 'hierarchy'>('force');
  const [visibleTasks, setVisibleTasks] = useState<number>(310); // Default to showing all tasks
  const [nodeDistance, setNodeDistance] = useState<number>(20); // Reduced default node distance
  const [nodeSize, ] = useState<number>(0.6); // Node size multiplier (0.5-1.5)
  const svgRef = useRef<SVGSVGElement>(null);
  const simulationRef = useRef<d3.Simulation<TaskNode, TaskLink> | null>(null);

  // Generate task nodes with D3-compatible structure including subtasks
  const { nodes, links } = useMemo(() => {
    if (!tasks.length) return { nodes: [], links: [] };

    // Limit to visibleTasks for performance
    const limitedTasks = tasks.slice(0, visibleTasks);
    
    const nodeMap = new Map<number, TaskNode>();
    const nodes: TaskNode[] = [];
    
    // Create main task nodes
    limitedTasks.forEach((task) => {
      const complexity = complexityData.find(c => c.taskId === task.id);
      const complexityScore = complexity?.complexityScore || 5;
      
      // Calculate radius based on complexity and subtasks - smaller radius for denser visualization
      const baseRadius = 5 * nodeSize; // Reduced from 8
      const complexityRadius = complexityScore * 0.5 * nodeSize;
      const subtaskRadius = (task.subtasks?.length || 0) * 0.2 * nodeSize;
      const radius = Math.max(baseRadius, Math.min(15 * nodeSize, baseRadius + complexityRadius + subtaskRadius));

      // Determine color based on status and priority
      let color = '#6b7280'; // default gray
      if (task.status === 'completed') color = '#10b981'; // green
      else if (task.status === 'in-progress') color = '#f59e0b'; // orange
      else if (task.priority === 'high') color = '#ef4444'; // red
      else if (task.priority === 'medium') color = '#8b5cf6'; // purple
      else color = '#3b82f6'; // blue

      // Group nodes by status for clustering
      let group = 0;
      if (task.status === 'completed') group = 1;
      else if (task.status === 'in-progress') group = 2;
      else if (task.priority === 'high') group = 3;
      else if (task.priority === 'medium') group = 4;
      else group = 5;

      const node: TaskNode = {
        id: task.id,
        title: task.title,
        priority: task.priority,
        status: task.status,
        dependencies: task.dependencies,
        complexity: complexityScore,
        subtaskCount: task.subtasks?.length || 0,
        radius,
        color,
        group,
        isSubtask: false,
        x: 0,
        y: 0
      };

      nodeMap.set(task.id, node);
      nodes.push(node);

      // Create subtask nodes if they exist and showSubtasks is enabled
      if (showSubtasks && task.subtasks && task.subtasks.length > 0) {
        // Limit subtasks to 20 per task for performance
        const limitedSubtasks = task.subtasks.slice(0, 20);
        limitedSubtasks.forEach((subtask) => {
          const subtaskRadius = 3 * nodeSize; // Smaller radius for subtasks (reduced from 4)
          let subtaskColor = '#94a3b8'; // default light gray for subtasks
          
          // Inherit some color from parent but make it lighter
          if (task.status === 'completed') subtaskColor = '#6ee7b7'; // light green
          else if (task.status === 'in-progress') subtaskColor = '#fcd34d'; // light orange
          else if (task.priority === 'high') subtaskColor = '#fca5a5'; // light red
          else if (task.priority === 'medium') subtaskColor = '#c4b5fd'; // light purple
          else subtaskColor = '#93c5fd'; // light blue

          const subtaskNode: TaskNode = {
            id: subtask.id + 10000, // Offset to avoid ID conflicts
            title: subtask.title,
            priority: task.priority, // Inherit from parent
            status: subtask.status,
            dependencies: subtask.dependencies,
            complexity: 1, // Subtasks have low complexity
            subtaskCount: 0,
            radius: subtaskRadius,
            color: subtaskColor,
            group: group + 10, // Different group for subtasks
            isSubtask: true,
            parentTaskId: task.id,
            x: 0,
            y: 0
          };

          nodeMap.set(subtaskNode.id, subtaskNode);
          nodes.push(subtaskNode);
        });
      }
    });

    // Create links based on dependencies and subtask relationships
    const links: TaskLink[] = [];
    
    nodes.forEach(node => {
      // Dependency links (between main tasks)
      if (!node.isSubtask) {
        // Only include dependencies that are in our visible set
        node.dependencies.forEach(depId => {
          const sourceNode = nodeMap.get(depId);
          if (sourceNode) {
            links.push({
              source: sourceNode,
              target: node,
              strength: 0.2, // Reduced from 0.3 for less rigid connections
              type: 'dependency'
            });
          }
        });
      }

      // Subtask links (from parent task to subtasks)
      if (node.isSubtask && node.parentTaskId) {
        const parentNode = nodeMap.get(node.parentTaskId);
        if (parentNode) {
          links.push({
            source: parentNode,
            target: node,
            strength: 0.3, // Reduced from 0.5
            type: 'subtask'
          });
        }
      }
    });

    return { nodes, links };
  }, [tasks, complexityData, showSubtasks, visibleTasks, nodeSize]);

  // Filter nodes based on search and filters
  const filteredNodes = useMemo(() => {
    return nodes.filter(node => {
      const matchesSearch = node.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           String(node.id).includes(searchTerm);
      const matchesStatus = filterStatus === 'all' || node.status === filterStatus;
      const matchesPriority = filterPriority === 'all' || node.priority === filterPriority;
      
      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [nodes, searchTerm, filterStatus, filterPriority]);

  // Filter links to only show connections between visible nodes
  const filteredLinks = useMemo(() => {
    const visibleNodeIds = new Set(filteredNodes.map(n => n.id));
    return links.filter(link => 
      visibleNodeIds.has((link.source as TaskNode).id) && 
      visibleNodeIds.has((link.target as TaskNode).id)
    );
  }, [links, filteredNodes]);

  // Initialize and update D3 visualization
  const updateVisualization = useCallback(() => {
    const svg = d3.select(svgRef.current);
    if (!svg.node()) return;

    // Clear previous content
    svg.selectAll('*').remove();

    const width = svg.node()?.getBoundingClientRect().width || 1200;
    const height = svg.node()?.getBoundingClientRect().height || 800;
    
    svg.attr('width', width).attr('height', height);

    // Create container group for zooming/panning
    const container = svg.append('g');

    // Add zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on('zoom', (event) => {
        container.attr('transform', event.transform);
      });

    svg.call(zoom);

    // Create simulation based on layout type
    let simulation: d3.Simulation<TaskNode, TaskLink>;

    if (layoutType === 'force') {
      simulation = d3.forceSimulation(filteredNodes)
        .force('link', d3.forceLink(filteredLinks).id((d: TaskNode) => d.id)
          .distance((d: TaskLink) => d.type === 'subtask' ? nodeDistance/2 : nodeDistance) // Reduced distances
          .strength((d: TaskLink) => d.type === 'subtask' ? 0.5 : 0.2)) // Reduced strength for more flexibility
        .force('charge', d3.forceManyBody().strength((d: TaskNode) => d.isSubtask ? -30 : -80)) // Reduced repulsion
        .force('center', d3.forceCenter(width / 2, height / 2))
        .force('x', d3.forceX(width / 2).strength(0.05)) // Gentle force toward center X
        .force('y', d3.forceY(height / 2).strength(0.05)) // Gentle force toward center Y
        .force('collision', d3.forceCollide().radius((d: TaskNode) => d.radius + 1)); // Minimal padding
    } else if (layoutType === 'radial') {
      // Radial layout based on complexity
      const radialNodes = filteredNodes.filter(n => !n.isSubtask);
      radialNodes.forEach((node, i) => {
        const angle = (i / radialNodes.length) * 2 * Math.PI;
        const radius = 60 + (node.complexity || 5) * 15; // Reduced radius
        node.fx = width / 2 + Math.cos(angle) * radius;
        node.fy = height / 2 + Math.sin(angle) * radius;
      });

      // Position subtasks around their parents
      filteredNodes.filter(n => n.isSubtask).forEach((subtask, i) => {
        const parent = filteredNodes.find(n => n.id === subtask.parentTaskId);
        if (parent && parent.fx !== undefined && parent.fy !== undefined) {
          const subtaskAngle = (i / 4) * 2 * Math.PI; // Distribute around parent
          const subtaskRadius = 20; // Reduced from 30
          subtask.fx = parent.fx + Math.cos(subtaskAngle) * subtaskRadius;
          subtask.fy = parent.fy + Math.sin(subtaskAngle) * subtaskRadius;
        }
      });
      
      simulation = d3.forceSimulation(filteredNodes)
        .force('link', d3.forceLink(filteredLinks).id((d: TaskNode) => d.id)
          .distance((d: TaskLink) => d.type === 'subtask' ? 15 : 30)) // Reduced distances
        .force('collision', d3.forceCollide().radius((d: TaskNode) => d.radius + 1)); // Minimal padding
    } else {
      // Hierarchical layout
      const mainTasks = filteredNodes.filter(n => !n.isSubtask);
      const hierarchy = d3.stratify<TaskNode>()
        .id(d => d.id.toString())
        .parentId(d => {
          const parent = mainTasks.find(n => 
            n.dependencies.length === 0 || 
            d.dependencies.includes(n.id)
          );
          return parent && parent.id !== d.id ? parent.id.toString() : null;
        })(mainTasks);

      const treeLayout = d3.tree<TaskNode>().size([width - 80, height - 80]);
      const root = treeLayout(hierarchy);

      root.descendants().forEach(d => {
        if (d.data) {
          d.data.fx = d.x + 40;
          d.data.fy = d.y + 40;
        }
      });

      // Position subtasks near their parents
      filteredNodes.filter(n => n.isSubtask).forEach((subtask, i) => {
        const parent = filteredNodes.find(n => n.id === subtask.parentTaskId);
        if (parent && parent.fx !== undefined && parent.fy !== undefined) {
          subtask.fx = parent.fx + (i % 2 === 0 ? 15 : -15); // Reduced from 25
          subtask.fy = parent.fy + 12; // Reduced from 20
        }
      });

      simulation = d3.forceSimulation(filteredNodes)
        .force('link', d3.forceLink(filteredLinks).id((d: TaskNode) => d.id)
          .distance((d: TaskLink) => d.type === 'subtask' ? 15 : 30)) // Reduced distances
        .force('collision', d3.forceCollide().radius((d: TaskNode) => d.radius + 1)); // Minimal padding
    }

    simulationRef.current = simulation;

    // Create links
    const linkGroup = container.append('g').attr('class', 'links');
    const link = linkGroup.selectAll('line')
      .data(showConnections ? filteredLinks : [])
      .enter().append('line')
      .attr('stroke', (d: TaskLink) => d.type === 'subtask' ? '#d1d5db' : '#94a3b8')
      .attr('stroke-opacity', (d: TaskLink) => d.type === 'subtask' ? 0.3 : 0.4) // More transparent
      .attr('stroke-width', (d: TaskLink) => d.type === 'subtask' ? 0.5 : 1) // Thinner lines
      .attr('stroke-dasharray', (d: TaskLink) => d.type === 'subtask' ? '1,1' : 'none') // Smaller dash
      .attr('marker-end', (d: TaskLink) => d.type === 'dependency' ? 'url(#arrowhead)' : 'none');

    // Add arrow markers for dependency links
    svg.append('defs').append('marker')
      .attr('id', 'arrowhead')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 8) // Reduced from 12
      .attr('refY', 0)
      .attr('markerWidth', 4) // Reduced from 5
      .attr('markerHeight', 4) // Reduced from 5
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-3L6,0L0,3') // Smaller arrow
      .attr('fill', '#94a3b8');

    // Create nodes
    const nodeGroup = container.append('g').attr('class', 'nodes');
    const node = nodeGroup.selectAll('g')
      .data(filteredNodes)
      .enter().append('g')
      .attr('class', 'node')
      .style('cursor', 'pointer')
      .call(d3.drag<SVGGElement, TaskNode>()
        .on('start', (event, d: TaskNode) => {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          d.fx = d.x;
          d.fy = d.y;
        })
        .on('drag', (event, d: TaskNode) => {
          d.fx = event.x;
          d.fy = event.y;
        })
        .on('end', (event, d: TaskNode) => {
          if (!event.active) simulation.alphaTarget(0);
          if (layoutType === 'force') {
            d.fx = null;
            d.fy = null;
          }
        }));

    // Add circles for nodes
    node.append('circle')
      .attr('r', d => d.radius)
      .attr('fill', d => d.color)
      .attr('stroke', d => d.isSubtask ? '#e5e7eb' : '#fff')
      .attr('stroke-width', d => d.isSubtask ? 0.5 : 1) // Thinner stroke
      .attr('opacity', d => d.isSubtask ? 0.7 : 0.9) // More transparent
      .on('click', (event, d) => {
        setSelectedNode(d);
        event.stopPropagation();
      })
      .on('mouseover', function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('stroke-width', d.isSubtask ? 1 : 2)
          .attr('stroke', '#fbbf24');
      })
      .on('mouseout', function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('stroke-width', d.isSubtask ? 0.5 : 1)
          .attr('stroke', d.isSubtask ? '#e5e7eb' : '#fff');
      });

    // Add status indicators for main tasks
    node.filter(d => !d.isSubtask)
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '0.35em')
      .attr('font-size', d => Math.min(d.radius * 0.8, 8)) // Smaller font
      .attr('fill', 'white')
      .attr('font-weight', 'bold')
      .text(d => {
        if (d.status === 'completed') return '✓';
        if (d.status === 'in-progress') return '⟳';
        return '';
      });

    // Add smaller status indicators for subtasks
    node.filter(d => d.isSubtask)
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '0.35em')
      .attr('font-size', '5px') // Smaller font
      .attr('fill', 'white')
      .attr('font-weight', 'bold')
      .text(d => {
        if (d.status === 'completed') return '✓';
        if (d.status === 'in-progress') return '⟳';
        return '';
      });

    // Add labels - only for non-subtasks to reduce clutter
    // Only show labels for larger nodes to reduce visual noise
    node.filter(d => !d.isSubtask && d.radius > 6)
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', d => d.radius + 8) // Reduced from 10
      .attr('font-size', '7px') // Smaller font
      .attr('fill', 'currentColor')
      .attr('class', 'text-zinc-700 dark:text-zinc-300')
      .text(d => `#${d.id}`)
      .style('pointer-events', 'none');

    // Add title on hover
    node.append('title')
      .text(d => {
        if (d.isSubtask) {
          return `Subtask: ${d.title}\nParent: #${d.parentTaskId}\nStatus: ${d.status}`;
        }
        return `#${d.id}: ${d.title}\nComplexity: ${d.complexity}/10\nSubtasks: ${d.subtaskCount}`;
      });

    // Update positions on simulation tick
    simulation.on('tick', () => {
      link
        .attr('x1', (d: d3.SimulationLinkDatum<TaskNode>) => (d.source as TaskNode).x)
        .attr('y1', (d: d3.SimulationLinkDatum<TaskNode>) => (d.source as TaskNode).y)
        .attr('x2', (d: d3.SimulationLinkDatum<TaskNode>) => (d.target as TaskNode).x)
        .attr('y2', (d: d3.SimulationLinkDatum<TaskNode>) => (d.target as TaskNode).y);

      node.attr('transform', (d: TaskNode) => `translate(${d.x},${d.y})`);
    });

    // Clear selection when clicking on empty space
    svg.on('click', () => setSelectedNode(null));

    // Initial zoom to fit all nodes
    setTimeout(() => {
      const bounds = container.node()?.getBBox();
      if (bounds) {
        const dx = bounds.width;
        const dy = bounds.height;
        const x = bounds.x + dx / 2;
        const y = bounds.y + dy / 2;
        
        const scale = 0.9 / Math.max(dx / width, dy / height);
        const translate = [width / 2 - scale * x, height / 2 - scale * y];
        
        svg.transition()
          .duration(750)
          .call(zoom.transform, d3.zoomIdentity
            .translate(translate[0], translate[1])
            .scale(scale));
      }
    }, 500);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredNodes, filteredLinks, layoutType, showConnections, nodeDistance, nodeSize]);

  // Update visualization when dependencies change
  useEffect(() => {
    updateVisualization();
    
    // Cleanup simulation on unmount
    return () => {
      if (simulationRef.current) {
        simulationRef.current.stop();
      }
    };
  }, [updateVisualization]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-red-500 dark:text-red-400">
        <ExclamationTriangleIcon className="h-16 w-16 mb-4" />
        <h2 className="text-xl font-semibold mb-2">Error Loading Tasks</h2>
        <p className="text-center max-w-md">
          Unable to load task data for visualization.
        </p>
      </div>
    );
  }

  const subtasksCount = tasks.reduce((count, task) => count + (task.subtasks?.length || 0), 0);

  const stats = {
    total: tasks.length,
    subtasks: subtasksCount,
    completed: tasks.filter(t => t.status === 'completed').length,
    inProgress: tasks.filter(t => t.status === 'in-progress').length,
    highPriority: tasks.filter(t => t.priority === 'high').length,
    avgComplexity: complexityData.length > 0 
      ? complexityData.reduce((sum, c) => sum + c.complexityScore, 0) / complexityData.length 
      : 5
  };

  return (
    <div className="h-screen flex flex-col bg-zinc-50 dark:bg-zinc-900">
      {/* Header */}
      <div className="flex-shrink-0 bg-white dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Network className="h-6 w-6 text-orange-500" />
            <div>
              <h1 className="text-xl font-bold text-zinc-900 dark:text-white">Task Tree</h1>
              <p className="text-xs text-zinc-600 dark:text-zinc-400">
                Interactive visualization of {tasks.length} tasks and {subtasksCount} subtasks
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center space-x-4 text-xs">
            <div className="flex items-center space-x-1">
              <Target className="h-3 w-3 text-blue-500" />
              <span className="text-zinc-600 dark:text-zinc-400">Tasks: {tasks.length}</span>
            </div>
            <div className="flex items-center space-x-1">
              <GitBranch className="h-3 w-3 text-purple-500" />
              <span className="text-zinc-600 dark:text-zinc-400">Subtasks: {subtasksCount}</span>
            </div>
            <div className="flex items-center space-x-1">
              <CheckCircleIcon className="h-3 w-3 text-green-500" />
              <span className="text-zinc-600 dark:text-zinc-400">Done: {stats.completed}</span>
            </div>
            <div className="flex items-center space-x-1">
              <ClockIcon className="h-3 w-3 text-orange-500" />
              <span className="text-zinc-600 dark:text-zinc-400">Active: {stats.inProgress}</span>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <div className="flex flex-wrap items-center gap-2">
            {/* Search */}
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-zinc-400" />
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-7 pr-2 py-1 text-xs border border-zinc-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white focus:ring-1 focus:ring-orange-500 focus:border-transparent w-40"
              />
            </div>

            {/* Filters */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-2 py-1 text-xs border border-zinc-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white focus:ring-1 focus:ring-orange-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>

            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="px-2 py-1 text-xs border border-zinc-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white focus:ring-1 focus:ring-orange-500"
            >
              <option value="all">All Priority</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>

            {/* Task Limit Selector */}
            <select
              value={visibleTasks}
              onChange={(e) => setVisibleTasks(parseInt(e.target.value))}
              className="px-2 py-1 text-xs border border-zinc-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white focus:ring-1 focus:ring-orange-500"
            >
              <option value={100}>100 Tasks</option>
              <option value={200}>200 Tasks</option>
              <option value={310}>All Tasks (310)</option>
            </select>
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            {/* Layout Controls */}
            <div className="flex items-center bg-zinc-100 dark:bg-zinc-700 rounded-md p-0.5">
              <button
                onClick={() => setLayoutType('force')}
                className={`px-2 py-0.5 text-xs rounded transition-colors ${
                  layoutType === 'force'
                    ? 'bg-white dark:bg-zinc-600 text-zinc-900 dark:text-white shadow-sm'
                    : 'text-zinc-600 dark:text-zinc-400'
                }`}
              >
                Force
              </button>
              <button
                onClick={() => setLayoutType('radial')}
                className={`px-2 py-0.5 text-xs rounded transition-colors ${
                  layoutType === 'radial'
                    ? 'bg-white dark:bg-zinc-600 text-zinc-900 dark:text-white shadow-sm'
                    : 'text-zinc-600 dark:text-zinc-400'
                }`}
              >
                Radial
              </button>
              <button
                onClick={() => setLayoutType('hierarchy')}
                className={`px-2 py-0.5 text-xs rounded transition-colors ${
                  layoutType === 'hierarchy'
                    ? 'bg-white dark:bg-zinc-600 text-zinc-900 dark:text-white shadow-sm'
                    : 'text-zinc-600 dark:text-zinc-400'
                }`}
              >
                Tree
              </button>
            </div>

            {/* View Controls */}
            <button
              onClick={() => setShowConnections(!showConnections)}
              className={`flex items-center space-x-1 px-2 py-0.5 text-xs rounded transition-colors ${
                showConnections
                  ? 'bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400'
                  : 'bg-zinc-100 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-400'
              }`}
            >
              {showConnections ? <EyeIcon className="h-3 w-3" /> : <EyeSlashIcon className="h-3 w-3" />}
              <span>Links</span>
            </button>

            <button
              onClick={() => setShowSubtasks(!showSubtasks)}
              className={`flex items-center space-x-1 px-2 py-0.5 text-xs rounded transition-colors ${
                showSubtasks
                  ? 'bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400'
                  : 'bg-zinc-100 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-400'
              }`}
            >
              <GitBranch className="h-3 w-3" />
              <span>Subtasks</span>
            </button>
            
            {/* Node Distance Slider */}
            <div className="flex items-center space-x-1 bg-zinc-100 dark:bg-zinc-700 rounded-md px-2 py-0.5">
              <span className="text-xs text-zinc-600 dark:text-zinc-400">Spacing:</span>
              <input
                type="range"
                min="5"
                max="50"
                value={nodeDistance}
                onChange={(e) => setNodeDistance(parseInt(e.target.value))}
                className="w-16 h-1.5 bg-zinc-300 dark:bg-zinc-600 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Visualization */}
        <div className="flex-1 relative overflow-hidden">
          <svg
            ref={svgRef}
            className="w-full h-full bg-white dark:bg-zinc-900"
            style={{ minHeight: '600px' }}
          />
          
          {/* Legend */}
          <div className="absolute top-2 left-2 bg-white dark:bg-zinc-800 bg-opacity-80 dark:bg-opacity-80 rounded-md shadow-sm border border-zinc-200 dark:border-zinc-700 p-2 text-[9px]">
            <div className="flex flex-col space-y-1">
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span className="text-zinc-600 dark:text-zinc-400">Completed</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                <span className="text-zinc-600 dark:text-zinc-400">In Progress</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                <span className="text-zinc-600 dark:text-zinc-400">High Priority</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                <span className="text-zinc-600 dark:text-zinc-400">Medium Priority</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                <span className="text-zinc-600 dark:text-zinc-400">Low Priority</span>
              </div>
            </div>
          </div>

          {/* Task Count Info */}
          <div className="absolute bottom-2 left-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md p-2">
            <p className="text-[9px] text-blue-700 dark:text-blue-400">
              💡 Showing {filteredNodes.length} of {tasks.length} tasks • {subtasksCount} total subtasks • Click nodes for details
            </p>
          </div>
        </div>

        {/* Side Panel */}
        {selectedNode && (
          <div className="w-64 bg-white dark:bg-zinc-800 border-l border-zinc-200 dark:border-zinc-700 p-4 overflow-y-auto">
            <div className="space-y-3">
              <div>
                <div className="flex items-center space-x-2 mb-1">
                  {selectedNode.isSubtask && (
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400">
                      <GitBranch className="h-3 w-3 mr-1" />
                      Subtask
                    </span>
                  )}
                </div>
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">
                  {selectedNode.isSubtask ? `S${selectedNode.id - 10000}` : `#${selectedNode.id}`} {selectedNode.title}
                </h3>
                {selectedNode.isSubtask && selectedNode.parentTaskId && (
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
                    Parent Task: #{selectedNode.parentTaskId}
                  </p>
                )}
                <div className="mt-2 flex items-center space-x-2">
                  <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium ${
                    selectedNode.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                    selectedNode.status === 'in-progress' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400' :
                    'bg-zinc-100 text-zinc-800 dark:bg-zinc-900/20 dark:text-zinc-400'
                  }`}>
                    {selectedNode.status.replace('-', ' ')}
                  </span>
                  <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium ${
                    selectedNode.priority === 'high' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' :
                    selectedNode.priority === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' :
                    'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                  }`}>
                    {selectedNode.priority}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {!selectedNode.isSubtask && (
                  <>
                    <div className="bg-zinc-50 dark:bg-zinc-700/50 rounded p-2">
                      <div className="flex items-center space-x-1 mb-1">
                        <ChartBarIcon className="h-3 w-3 text-purple-500" />
                        <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Complexity</span>
                      </div>
                      <div className="text-sm font-bold text-zinc-900 dark:text-white">
                        {selectedNode.complexity}/10
                      </div>
                    </div>
                    
                    <div className="bg-zinc-50 dark:bg-zinc-700/50 rounded p-2">
                      <div className="flex items-center space-x-1 mb-1">
                        <Target className="h-3 w-3 text-blue-500" />
                        <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Subtasks</span>
                      </div>
                      <div className="text-sm font-bold text-zinc-900 dark:text-white">
                        {selectedNode.subtaskCount}
                      </div>
                    </div>
                  </>
                )}

                <div className="bg-zinc-50 dark:bg-zinc-700/50 rounded p-2">
                  <div className="flex items-center space-x-1 mb-1">
                    <Network className="h-3 w-3 text-green-500" />
                    <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Dependencies</span>
                  </div>
                  <div className="text-sm font-bold text-zinc-900 dark:text-white">
                    {selectedNode.dependencies.length}
                  </div>
                </div>

                <div className="bg-zinc-50 dark:bg-zinc-700/50 rounded p-2">
                  <div className="flex items-center space-x-1 mb-1">
                    <Zap className="h-3 w-3 text-orange-500" />
                    <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Node Size</span>
                  </div>
                  <div className="text-sm font-bold text-zinc-900 dark:text-white">
                    {selectedNode.radius.toFixed(1)}px
                  </div>
                </div>
              </div>

              {selectedNode.dependencies.length > 0 && (
                <div>
                  <h4 className="text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">Dependencies</h4>
                  <div className="space-y-1 max-h-24 overflow-y-auto">
                    {selectedNode.dependencies.map(depId => {
                      const depNode = nodes.find(n => n.id === depId);
                      return depNode ? (
                        <div key={depId} className="text-[10px] bg-zinc-100 dark:bg-zinc-700 rounded px-1.5 py-0.5">
                          #{depNode.id} {depNode.title}
                        </div>
                      ) : null;
                    })}
                  </div>
                </div>
              )}

              <div className="pt-3 border-t border-zinc-200 dark:border-zinc-700">
                {!selectedNode.isSubtask ? (
                  <Link
                    to={`/tasks/${selectedNode.id}`}
                    className="w-full inline-flex justify-center items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors"
                  >
                    View Full Details
                  </Link>
                ) : (
                  <Link
                    to={`/tasks/${selectedNode.parentTaskId}`}
                    className="w-full inline-flex justify-center items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors"
                  >
                    View Parent Task
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TreePage;
