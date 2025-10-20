import React, { useEffect, useState, useCallback, useRef } from "react";
import { NodeChange } from "reactflow";
import ReactFlow, { Background, Controls, addEdge, Handle, Position, applyNodeChanges } from "react-flow-renderer";
import type { Node, Edge, Connection, NodeProps } from "react-flow-renderer";
import axios from "axios";
import { motion } from "framer-motion";
import Sidebar from "./Sidebar";
import UserPanel from "./UserPanel";
import CreateUserPanel from "./CreateUserPanel";
import "./styles.css";

const API_BASE = import.meta.env.VITE_API_BASE_URL;
const res = await axios.get(`${API_BASE}/api/users`);


const UserNodeBase: React.FC<NodeProps & { variant?: "high" | "low" }> = ({ id, data }) => {
  const [dragOver, setDragOver] = React.useState(false);
  const tier: "high" | "low" = data?.tier === "high" ? "high" : "low";

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
    if (!dragOver) setDragOver(true);
  };

  const onDragLeave = () => setDragOver(false);

  const onDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const hobby = e.dataTransfer.getData("text/plain");
    if (!hobby) return;
    try {
      await axios.put(`/api/users/${id}/hobby`, { hobby });
      if (typeof data?.loadGraph === "function") {
        await data.loadGraph();
      }
    } catch (err: any) {
      console.error("Failed to add hobby", err);
      alert(err?.response?.data?.message || "Failed to add hobby to user");
    }
  };

  const badgeColor = tier === "high" ? "#065f46" : "#7c2d12"; 
  const badgeBg = tier === "high" ? "#d1fae5" : "#ffedd5";

  return (
    <div
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        pointerEvents: "all",
        borderRadius: 12,
        outline: dragOver ? "2px dashed #0a84ff" : "none",
        position: "relative",
      }}
    >
      <Handle type="target" position={Position.Left} style={{ zIndex: 3 }} />
      <Handle type="source" position={Position.Right} style={{ zIndex: 3 }} />
      <Handle type="source" position={Position.Top} style={{ zIndex: 3 }} />
      <Handle type="target" position={Position.Bottom} style={{ zIndex: 3 }} />

      <motion.div
        initial={{ scale: 0.98, opacity: 0.95 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {data?.label}
      </motion.div>

      <div
        style={{
          position: "absolute",
          top: 4,
          left: 6,
          fontSize: 10,
          fontWeight: 700,
          color: badgeColor,
          background: badgeBg,
          padding: "2px 6px",
          borderRadius: 10,
          border: `1px solid ${tier === "high" ? "#34d399" : "#fdba74"}`,
          pointerEvents: "none",
        }}
      >
        {tier === "high" ? "HIGH" : "LOW"}
      </div>
    </div>
  );
};

const HighScoreNode: React.FC<NodeProps> = (props) => <UserNodeBase {...props} />;
const LowScoreNode: React.FC<NodeProps> = (props) => <UserNodeBase {...props} />;

const UserNode: React.FC<NodeProps> = ({ id, data }) => {
  const [dragOver, setDragOver] = React.useState(false);
  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
    if (!dragOver) setDragOver(true);
  };
  const onDragLeave = () => setDragOver(false);
  const onDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const hobby = e.dataTransfer.getData("text/plain");
    if (!hobby) return;
    try {
      await axios.put(`/api/users/${id}/hobby`, { hobby });
      if (typeof data?.loadGraph === "function") await data.loadGraph();
    } catch (err: any) {
      console.error("Failed to add hobby", err);
      alert(err?.response?.data?.message || "Failed to add hobby to user");
    }
  };
  return (
    <div
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "all", borderRadius: 12, outline: dragOver ? "2px dashed #0a84ff" : "none", position: "relative" }}
    >
      <Handle type="target" position={Position.Left} style={{ zIndex: 3 }} />
      <Handle type="source" position={Position.Right} style={{ zIndex: 3 }} />
      <Handle type="source" position={Position.Top} style={{ zIndex: 3 }} />
      <Handle type="target" position={Position.Bottom} style={{ zIndex: 3 }} />
      {data?.label}
    </div>
  );
};

const HighScoreIndicatorNode: React.FC<NodeProps> = ({ data }) => (
  <div style={{ width: "100%", height: "100%", position: "relative", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 12 }}>
    <Handle type="target" position={Position.Left} style={{ zIndex: 3 }} />
    <Handle type="source" position={Position.Right} style={{ zIndex: 3 }} />
    <motion.div initial={{ scale: 0.9, opacity: 0.8 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.25 }}
      style={{ width: "100%", height: "100%", background: "#d1fae5", border: "1px solid #34d399", color: "#065f46", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 18 }}>
      HIGH
    </motion.div>
  </div>
);
const LowScoreIndicatorNode: React.FC<NodeProps> = ({ data }) => (
  <div style={{ width: "100%", height: "100%", position: "relative", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 12 }}>
    <Handle type="target" position={Position.Left} style={{ zIndex: 3 }} />
    <Handle type="source" position={Position.Right} style={{ zIndex: 3 }} />
    <motion.div initial={{ scale: 0.9, opacity: 0.8 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.25 }}
      style={{ width: "100%", height: "100%", background: "#ffedd5", border: "1px solid #fdba74", color: "#7c2d12", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 18 }}>
      LOW
    </motion.div>
  </div>
);

const nodeTypes = { userNode: UserNode, highScoreNode: HighScoreIndicatorNode, lowScoreNode: LowScoreIndicatorNode };

type GraphNode = {
  id: string;
  label: string; 
  popularityScore: number;
};

type GraphEdge = { source: string; target: string };

export default function App() {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [creating, setCreating] = useState(false);
  const positionsRef = useRef<Record<string, { x: number; y: number }>>({});

  useEffect(() => {
    const map: Record<string, { x: number; y: number }> = {};
    for (const n of nodes) {
      if (n.position) {
        map[n.id] = n.position;
      }
    }
    positionsRef.current = map;
  }, [nodes]);

  const loadGraph = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/graph"); 
      const data = res.data;

      const mappedNodes: Node[] = data.nodes.map((n: GraphNode, idx: number) => {
        const pop = n.popularityScore || 0;
        const baseColor = 100 + Math.min(pop * 15, 155);
        const background = `rgb(${baseColor}, ${120 + pop * 5}, 255)`;
        const width = 140 + Math.min(pop * 10, 80);
        const height = 60 + Math.min(pop * 5, 30);

        return {
          id: n.id,
          type: "userNode",
          data: { label: n.label, loadGraph, pop },
          draggable: true,
          position: positionsRef.current[n.id] ?? {
            x: (idx % 5) * 220 + 50,
            y: Math.floor(idx / 5) * 160 + 50,
          },
          style: {
            background,
            width,
            height,
            borderRadius: 12,
            color: "#fff",
            fontWeight: "bold",
            textAlign: "center",
            border: "2px solid #333",
            boxShadow: `0 0 ${5 + pop * 2}px rgba(0,0,0,0.3)`,
            transition: "width 300ms ease, height 300ms ease, background-color 300ms ease, box-shadow 300ms ease",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          },
        };
      });

      const mappedEdges: Edge[] = data.edges.map((e: GraphEdge, idx: number) => ({
        id: `e-${e.source}-${e.target}-${idx}`,
        source: e.source,
        target: e.target,
      }));

      const scoreNodes: Node[] = mappedNodes.map((u) => {
        const isHigh = (u.data as any)?.pop > 5;
        const badgeId = isHigh ? `score-high-${u.id}` : `score-low-${u.id}`;
        const badgeType = isHigh ? "highScoreNode" : "lowScoreNode";
        const baseW = typeof (u.style as any)?.width === "number" ? (u.style as any).width as number : 160;
        const offsetX = baseW + 60;
        const targetPos = positionsRef.current[badgeId] ?? { x: (u.position as any).x + offsetX, y: (u.position as any).y };
        return {
          id: badgeId,
          type: badgeType,
          data: {},
          position: targetPos,
          draggable: true,
          style: { width: 135, height: 42 },
        } as Node;
      });

      const scoreEdges: Edge[] = mappedNodes.map((u, idx2) => {
        const isHigh = (u.data as any)?.pop > 5;
        const badgeId = isHigh ? `score-high-${u.id}` : `score-low-${u.id}`;
        return { id: `e-score-${u.id}`, source: u.id, target: badgeId } as Edge;
      });

      setNodes([...mappedNodes, ...scoreNodes]);
      setEdges([...mappedEdges, ...scoreEdges]);
      setRefreshKey((k) => k + 1);
    } catch (err) {
      console.error("Failed to load graph", err);
      alert("Failed to load graph. Is the backend running?");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadGraph();
  }, [loadGraph]);

const onNodesChange = useCallback((changes: any) => {
  setNodes((nds) => applyNodeChanges(changes as any, nds));
}, []);


  const onNodeClick = (_: any, node: Node) => {
    if (typeof node.id === "string" && (node.id.startsWith("score-high-") || node.id.startsWith("score-low-"))) {
      return; 
    }
    setSelectedUserId(node.id);
  };

  const onConnect = async (connection: Connection) => {
    const { source, target } = connection;
    if (!source || !target) return;
    try {
      await axios.post(`/api/users/${source}/link`, { friendId: target });
      setEdges((eds) => addEdge({ id: `e-${source}-${target}`, source, target }, eds));
      await loadGraph();
    } catch (err: any) {
      alert(err?.response?.data?.message || "Failed to link users");
      console.error(err);
    }
  };

  return (
    <div className="app-shell">
      <Sidebar refreshKey={refreshKey} />
      <div className="graph-area">
        <div className="graph-toolbar">
          <button className="btn-primary" onClick={() => setCreating(true)}>
            + Create User
          </button>
        </div>
        {loading ? (
          <div style={{ padding: 20 }}>Loading graph...</div>
        ) : (
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            onNodesChange={onNodesChange}
            onNodeClick={onNodeClick}
            onConnect={onConnect}
            fitView
          >
            <Background color="#aaa" gap={16} />
            <Controls />
          </ReactFlow>
        )}
      </div>

      <UserPanel
        userId={selectedUserId}
        onClose={() => setSelectedUserId(null)}
        onSaved={loadGraph}
      />

      {creating && (
        <CreateUserPanel onClose={() => setCreating(false)} onCreated={loadGraph} />
      )}
    </div>
  );
}