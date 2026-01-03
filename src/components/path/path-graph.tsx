"use client";

import { useCallback, useState, useMemo } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Node,
  Edge,
  Handle,
  Position,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { cn } from "@/lib/utils";
import type { GraphNode, NodeStatus } from "@/types";
import { CheckCircle2, Circle, Clock, SkipForward } from "lucide-react";

interface CustomNodeData extends Record<string, unknown> {
  label: string;          // 简短标题
  title?: string;         // 完整标题（悬浮显示）
  type: "milestone" | "task";
  status: NodeStatus;
  day: number;
  onClick?: () => void;
}

function getStatusIcon(status: NodeStatus) {
  switch (status) {
    case "completed":
      return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    case "in_progress":
      return <Clock className="h-4 w-4 text-blue-500 animate-pulse" />;
    case "skipped":
      return <SkipForward className="h-4 w-4 text-yellow-500" />;
    default:
      return <Circle className="h-4 w-4 text-muted-foreground" />;
  }
}

function getStatusColor(status: NodeStatus): string {
  switch (status) {
    case "completed":
      return "border-green-500 bg-green-50";
    case "in_progress":
      return "border-blue-500 bg-blue-50";
    case "skipped":
      return "border-yellow-500 bg-yellow-50";
    default:
      return "border-muted bg-card";
  }
}

function CustomNode({ data }: { data: CustomNodeData }) {
  // 节点标题截取，最多显示 12 个字符
  const displayLabel = data.label.length > 12 
    ? data.label.substring(0, 12) + "..." 
    : data.label;

  return (
    <div
      onClick={data.onClick}
      title={data.title || data.label} // 悬浮显示完整标题
      className={cn(
        "px-3 py-2 rounded-lg border-2 shadow-sm cursor-pointer transition-all hover:shadow-md hover:scale-105",
        "min-w-[120px] max-w-[160px]",
        getStatusColor(data.status),
        data.type === "milestone" && "border-primary bg-primary/5"
      )}
    >
      <Handle type="target" position={Position.Left} className="!bg-primary" />
      <div className="flex items-center gap-2">
        {getStatusIcon(data.status)}
        <span className="font-medium text-sm truncate">{displayLabel}</span>
      </div>
      <div className="text-xs text-muted-foreground mt-1">第 {data.day} 天</div>
      <Handle type="source" position={Position.Right} className="!bg-primary" />
    </div>
  );
}

const nodeTypes = {
  custom: CustomNode,
};

interface PathGraphProps {
  nodes: GraphNode[];
  edges: { id: string; source: string; target: string }[];
  nodeProgress: Map<string, NodeStatus>;
  onNodeClick?: (nodeId: string) => void;
  /** 可选：提供节点完整标题的映射 */
  nodeTitles?: Map<string, string>;
}

export function PathGraph({
  nodes: graphNodes,
  edges: graphEdges,
  nodeProgress,
  onNodeClick,
  nodeTitles,
}: PathGraphProps) {
  const initialNodes: Node<CustomNodeData>[] = useMemo(
    () =>
      graphNodes.map((node) => ({
        id: node.id,
        type: "custom",
        position: node.position || { x: 0, y: 0 },
        data: {
          label: node.label,
          title: nodeTitles?.get(node.id) || node.label,
          type: node.type,
          status: nodeProgress.get(node.id) || "pending",
          day: node.day,
          onClick: () => onNodeClick?.(node.id),
        },
      })),
    [graphNodes, nodeProgress, onNodeClick, nodeTitles]
  );

  const initialEdges: Edge[] = useMemo(
    () =>
      graphEdges.map((edge) => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        type: "smoothstep",
        animated: nodeProgress.get(edge.source) === "completed",
        style: {
          stroke:
            nodeProgress.get(edge.source) === "completed"
              ? "#22c55e"
              : "#94a3b8",
        },
      })),
    [graphEdges, nodeProgress]
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  return (
    <div className="h-[600px] w-full rounded-lg border bg-card">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        defaultEdgeOptions={{
          type: "smoothstep",
        }}
      >
        <Background />
        <Controls />
        <MiniMap
          nodeColor={(node) => {
            const status = (node.data as CustomNodeData).status;
            switch (status) {
              case "completed":
                return "#22c55e";
              case "in_progress":
                return "#3b82f6";
              case "skipped":
                return "#eab308";
              default:
                return "#94a3b8";
            }
          }}
        />
      </ReactFlow>
    </div>
  );
}
