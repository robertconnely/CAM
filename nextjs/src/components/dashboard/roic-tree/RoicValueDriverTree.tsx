"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import type { Initiative, CapitalScore } from "@/lib/types/database";
import { ROIC_TREE, TREE_COLORS, type TreeNode } from "./roicTreeData";
import {
  mapInitiativesToTree,
  countInitiativesPerNode,
} from "./mapInitiatives";
import { STATUS_CONFIG } from "@/components/tracker/constants";

interface RoicValueDriverTreeProps {
  initiatives: Initiative[];
  capitalScores: CapitalScore[];
  hideTitle?: boolean;
}

/* ── Layout constants — left-to-right ── */
const NODE_W = 140;
const NODE_H = 46;
const NODE_RX = 4;
const H_GAP = 48;
const V_GAP = 10;
const PAD_LEFT = 24;
const PAD_TOP = 24;

interface LayoutNode {
  node: TreeNode;
  x: number;
  y: number; // center y
  depth: number;
}

interface Connection {
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  parentId: string;
  childId: string;
}

/**
 * Recursive left-to-right layout.
 */
function layoutTree(
  node: TreeNode,
  x: number,
  yStart: number,
  depth: number
): { nodes: LayoutNode[]; connections: Connection[]; height: number } {
  const children = node.children ?? [];

  if (children.length === 0) {
    const cy = yStart + NODE_H / 2;
    return {
      nodes: [{ node, x, y: cy, depth }],
      connections: [],
      height: NODE_H,
    };
  }

  const childX = x + NODE_W + H_GAP;
  let allNodes: LayoutNode[] = [];
  let allConns: Connection[] = [];
  let currentY = yStart;
  const childCenters: number[] = [];

  for (const child of children) {
    const sub = layoutTree(child, childX, currentY, depth + 1);
    allNodes = allNodes.concat(sub.nodes);
    allConns = allConns.concat(sub.connections);
    childCenters.push(sub.nodes[0].y);
    currentY += sub.height + V_GAP;
  }

  const totalHeight = currentY - yStart - V_GAP;
  const parentCY =
    childCenters.length > 0
      ? (childCenters[0] + childCenters[childCenters.length - 1]) / 2
      : yStart + NODE_H / 2;

  allNodes.unshift({ node, x, y: parentCY, depth });

  for (let i = 0; i < children.length; i++) {
    allConns.push({
      fromX: x + NODE_W,
      fromY: parentCY,
      toX: childX,
      toY: childCenters[i],
      parentId: node.id,
      childId: children[i].id,
    });
  }

  return { nodes: allNodes, connections: allConns, height: totalHeight };
}

/* ── Ancestor / descendant helpers ── */
function getAncestorPath(tree: TreeNode, targetId: string): Set<string> {
  const path: string[] = [];
  function dfs(node: TreeNode, trail: string[]): boolean {
    trail.push(node.id);
    if (node.id === targetId) return true;
    for (const child of node.children ?? []) {
      if (dfs(child, trail)) return true;
    }
    trail.pop();
    return false;
  }
  dfs(tree, path);
  return new Set(path);
}

function getDescendantIds(tree: TreeNode, targetId: string): Set<string> {
  const ids = new Set<string>();
  function findAndCollect(node: TreeNode): boolean {
    if (node.id === targetId) {
      collectAll(node);
      return true;
    }
    for (const child of node.children ?? []) {
      if (findAndCollect(child)) return true;
    }
    return false;
  }
  function collectAll(node: TreeNode) {
    ids.add(node.id);
    for (const child of node.children ?? []) collectAll(child);
  }
  findAndCollect(tree);
  return ids;
}

function isLeaf(node: TreeNode): boolean {
  return !node.children || node.children.length === 0;
}

export function RoicValueDriverTree({
  initiatives,
  capitalScores,
  hideTitle,
}: RoicValueDriverTreeProps) {
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = useCallback(() => {
    setIsFullscreen((prev) => !prev);
  }, []);

  useEffect(() => {
    if (!isFullscreen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsFullscreen(false);
    };
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [isFullscreen]);

  const leafMap = useMemo(
    () => mapInitiativesToTree(initiatives, capitalScores),
    [initiatives, capitalScores]
  );

  const countMap = useMemo(
    () => countInitiativesPerNode(ROIC_TREE, leafMap),
    [leafMap]
  );

  const { nodes, connections, height: treeHeight } = useMemo(
    () => layoutTree(ROIC_TREE, PAD_LEFT, PAD_TOP, 0),
    []
  );

  const maxX = Math.max(...nodes.map((n) => n.x + NODE_W)) + PAD_LEFT;
  const svgW = maxX;
  const svgH = treeHeight + PAD_TOP * 2;

  const highlightedIds = useMemo(() => {
    if (!hoveredNodeId) return null;
    const ancestors = getAncestorPath(ROIC_TREE, hoveredNodeId);
    const descendants = getDescendantIds(ROIC_TREE, hoveredNodeId);
    return new Set([...ancestors, ...descendants]);
  }, [hoveredNodeId]);

  const selectedLayout = nodes.find((n) => n.node.id === selectedNodeId);
  const selectedInitiatives = selectedNodeId
    ? leafMap.get(selectedNodeId) ?? []
    : [];

  /* ── Render a single node ── */
  function renderNode(ln: LayoutNode) {
    const isHovered = hoveredNodeId === ln.node.id;
    const isSelected = selectedNodeId === ln.node.id;
    const isActive = isHovered || isSelected;
    const dimmed = highlightedIds && !highlightedIds.has(ln.node.id);
    const count = countMap.get(ln.node.id) ?? 0;
    const leaf = isLeaf(ln.node);
    const kd = ln.node.isKeyDriver;

    const rx = ln.x;
    const ry = ln.y - NODE_H / 2;

    // Node fill & stroke colors — Zelis brand palette
    const fill = kd
      ? isActive ? "#1a0038" : TREE_COLORS.keyDriverBg
      : isActive ? ln.node.color : TREE_COLORS.nodeBg;
    const stroke = kd
      ? TREE_COLORS.keyDriverBorder
      : isActive ? ln.node.color : TREE_COLORS.nodeBorder;
    const textColor = kd || isActive ? "#fff" : TREE_COLORS.nodeText;

    return (
      <g
        key={ln.node.id}
        onMouseEnter={() => setHoveredNodeId(ln.node.id)}
        onMouseLeave={() => setHoveredNodeId(null)}
        onClick={() => {
          if (kd || leaf) {
            setSelectedNodeId(
              selectedNodeId === ln.node.id ? null : ln.node.id
            );
          }
        }}
        style={{ cursor: kd || leaf ? "pointer" : "default" }}
      >
        {/* Node rect */}
        <rect
          x={rx}
          y={ry}
          width={NODE_W}
          height={NODE_H}
          rx={NODE_RX}
          fill={fill}
          stroke={stroke}
          strokeWidth={isActive ? "2" : "1"}
          opacity={dimmed ? 0.2 : 1}
          style={{ transition: "all 0.2s ease" }}
        />

        {/* Label */}
        <text
          x={rx + NODE_W / 2}
          y={ln.y + (count > 0 && kd ? -3 : 1)}
          textAnchor="middle"
          dominantBaseline="middle"
          fill={textColor}
          fontSize={ln.depth === 0 ? "13" : "10.5"}
          fontWeight={ln.depth === 0 ? "800" : "700"}
          fontFamily="'Nunito Sans', sans-serif"
          opacity={dimmed ? 0.25 : 1}
          style={{ transition: "all 0.2s", pointerEvents: "none" }}
        >
          {ln.node.shortLabel || ln.node.label}
        </text>

        {/* Initiative count (key drivers only) */}
        {kd && count > 0 && (
          <text
            x={rx + NODE_W / 2}
            y={ln.y + 10}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="rgba(255,255,255,0.7)"
            fontSize="8.5"
            fontWeight="600"
            fontFamily="'Nunito Sans', sans-serif"
            opacity={dimmed ? 0.2 : 1}
            style={{ pointerEvents: "none", transition: "all 0.2s" }}
          >
            {count} init.
          </text>
        )}

        {/* Count badge for branch nodes */}
        {!leaf && !kd && count > 0 && (
          <>
            <circle
              cx={rx + NODE_W - 1}
              cy={ry + 1}
              r="9"
              fill="var(--zelis-gold)"
              opacity={dimmed ? 0.15 : 1}
              style={{ transition: "opacity 0.25s" }}
            />
            <text
              x={rx + NODE_W - 1}
              y={ry + 1.5}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="#23004B"
              fontSize="8.5"
              fontWeight="800"
              fontFamily="'Nunito Sans', sans-serif"
              style={{ pointerEvents: "none" }}
              opacity={dimmed ? 0.15 : 1}
            >
              {count}
            </text>
          </>
        )}
      </g>
    );
  }

  const treeContent = (
    <>
      {/* SVG Tree */}
      <div
        style={{
          overflowX: "auto",
          overflowY: isFullscreen ? "auto" : "hidden",
          paddingBottom: "0.5rem",
          flex: isFullscreen ? 1 : undefined,
        }}
      >
        <svg
          viewBox={`0 0 ${svgW} ${svgH}`}
          style={{
            width: "100%",
            height: isFullscreen ? "100%" : "auto",
            maxHeight: isFullscreen ? undefined : 440,
            minHeight: 200,
          }}
        >
          {/* Connections — right-angle elbow style (like McKinsey diagram) */}
          {connections.map((conn, i) => {
            const midX = conn.fromX + H_GAP / 2;
            const dimmed =
              highlightedIds &&
              !(
                highlightedIds.has(conn.parentId) &&
                highlightedIds.has(conn.childId)
              );

            return (
              <path
                key={`conn-${i}`}
                d={`M ${conn.fromX} ${conn.fromY} H ${midX} V ${conn.toY} H ${conn.toX}`}
                fill="none"
                stroke={TREE_COLORS.connectorLine}
                strokeWidth="1.2"
                opacity={dimmed ? 0.08 : 0.35}
                style={{ transition: "opacity 0.25s" }}
              />
            );
          })}

          {/* Nodes */}
          {nodes.map((ln) => renderNode(ln))}
        </svg>
      </div>

      {/* Legend */}
      <div
        style={{
          display: "flex",
          gap: "1.5rem",
          alignItems: "center",
          padding: "0.4rem 0",
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
          <div
            style={{
              width: 14,
              height: 14,
              borderRadius: "3px",
              background: TREE_COLORS.keyDriverBg,
            }}
          />
          <span
            style={{
              fontSize: "0.72rem",
              fontWeight: 600,
              color: "var(--zelis-medium-gray)",
            }}
          >
            Key value drivers
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
          <div
            style={{
              width: 14,
              height: 14,
              borderRadius: "3px",
              background: TREE_COLORS.nodeBg,
              border: `1px solid ${TREE_COLORS.nodeBorder}`,
            }}
          />
          <span
            style={{
              fontSize: "0.72rem",
              fontWeight: 600,
              color: "var(--zelis-medium-gray)",
            }}
          >
            Financial decomposition
          </span>
        </div>
      </div>

      {/* Detail panel */}
      <div style={{ minHeight: 40, marginTop: "0.25rem", flexShrink: 0 }}>
        {selectedLayout && (selectedLayout.node.isKeyDriver || isLeaf(selectedLayout.node)) ? (
          <div
            style={{
              padding: "1rem 1.25rem",
              borderRadius: "10px",
              background: isFullscreen ? "var(--zelis-light-gray)" : "white",
              border: `2px solid ${selectedLayout.node.isKeyDriver ? TREE_COLORS.keyDriverBg : TREE_COLORS.nodeBorder}20`,
              boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
              animation: "fadeInUp 0.2s ease-out",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                marginBottom: "0.5rem",
              }}
            >
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: selectedLayout.node.isKeyDriver ? "2px" : "50%",
                  background: selectedLayout.node.isKeyDriver ? TREE_COLORS.keyDriverBg : selectedLayout.node.color,
                  flexShrink: 0,
                }}
              />
              <h4
                style={{
                  margin: 0,
                  fontSize: "0.92rem",
                  fontWeight: 800,
                  color: selectedLayout.node.isKeyDriver ? TREE_COLORS.keyDriverBg : "var(--zelis-purple)",
                }}
              >
                {selectedLayout.node.label}
              </h4>
              {selectedLayout.node.isKeyDriver && (
                <span
                  style={{
                    fontSize: "0.62rem",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    padding: "0.15rem 0.4rem",
                    borderRadius: "3px",
                    background: `${TREE_COLORS.keyDriverBg}12`,
                    color: TREE_COLORS.keyDriverBg,
                  }}
                >
                  Key Value Driver
                </span>
              )}
            </div>
            {selectedLayout.node.description && (
              <p
                style={{
                  margin: "0 0 0.75rem",
                  fontSize: "0.8rem",
                  color: "var(--zelis-medium-gray)",
                  lineHeight: 1.5,
                }}
              >
                {selectedLayout.node.description}
              </p>
            )}
            {selectedLayout.node.isKeyDriver && (
              <>
                <div
                  style={{
                    fontSize: "0.72rem",
                    fontWeight: 700,
                    color: TREE_COLORS.keyDriverBg,
                    textTransform: "uppercase",
                    letterSpacing: "0.04em",
                    marginBottom: "0.4rem",
                  }}
                >
                  Mapped Initiatives ({selectedInitiatives.length})
                </div>
                {selectedInitiatives.length === 0 ? (
                  <div
                    style={{
                      fontSize: "0.78rem",
                      color: "var(--zelis-warm-gray)",
                      fontStyle: "italic",
                    }}
                  >
                    No initiatives mapped to this value driver yet.
                  </div>
                ) : (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.3rem",
                    }}
                  >
                    {selectedInitiatives.map((init) => {
                      const cfg = STATUS_CONFIG[init.status];
                      return (
                        <div
                          key={init.id}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.5rem",
                            padding: "0.35rem 0.5rem",
                            borderRadius: "6px",
                            background: isFullscreen
                              ? "white"
                              : "var(--zelis-light-gray)",
                            fontSize: "0.78rem",
                          }}
                        >
                          <span
                            style={{
                              display: "inline-block",
                              width: 8,
                              height: 8,
                              borderRadius: "50%",
                              background: cfg.color,
                              flexShrink: 0,
                            }}
                          />
                          <span
                            style={{
                              fontWeight: 700,
                              color: "var(--zelis-purple)",
                              fontSize: "0.72rem",
                              flexShrink: 0,
                            }}
                          >
                            {init.initiative_id}
                          </span>
                          <span
                            style={{
                              color: "var(--zelis-dark)",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {init.name}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </div>
        ) : hoveredNodeId ? (
          <div
            style={{
              padding: "0.6rem 1rem",
              borderRadius: "8px",
              background: isFullscreen
                ? "var(--zelis-light-gray)"
                : "var(--zelis-ice)",
              fontSize: "0.8rem",
              color: "var(--zelis-purple)",
              fontWeight: 500,
            }}
          >
            {nodes.find((n) => n.node.id === hoveredNodeId)?.node
              .description ?? ""}
          </div>
        ) : (
          <div
            style={{
              padding: "0.6rem 1rem",
              borderRadius: "8px",
              background: isFullscreen
                ? "var(--zelis-light-gray)"
                : "var(--zelis-ice)",
              textAlign: "center",
              fontSize: "0.78rem",
              color: "var(--zelis-blue-purple)",
              fontWeight: 500,
            }}
          >
            Hover to explore value drivers. Click a dark node to see mapped
            initiatives.
          </div>
        )}
      </div>
    </>
  );

  /* ── Action buttons (always visible) ── */
  const actionButtons = (
    <div style={{ display: "flex", gap: "0.4rem", alignItems: "center" }}>
        {selectedNodeId && (
          <button
            onClick={() => setSelectedNodeId(null)}
            style={{
              background: "var(--zelis-ice)",
              border: "none",
              borderRadius: "6px",
              padding: "0.3rem 0.75rem",
              fontSize: "0.72rem",
              fontWeight: 600,
              cursor: "pointer",
              color: "var(--zelis-purple)",
              fontFamily: "inherit",
            }}
          >
            Clear selection
          </button>
        )}
        <button
          onClick={toggleFullscreen}
          title={isFullscreen ? "Exit fullscreen (Esc)" : "View fullscreen"}
          style={{
            background: isFullscreen
              ? "var(--zelis-purple)"
              : "var(--zelis-ice)",
            border: "none",
            borderRadius: "6px",
            padding: isFullscreen ? "0.4rem 1rem" : "0.35rem 0.75rem",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.4rem",
            color: isFullscreen ? "white" : "var(--zelis-purple)",
            fontSize: "0.72rem",
            fontWeight: 700,
            fontFamily: "inherit",
            transition: "all 0.15s",
          }}
        >
          {isFullscreen ? (
            <>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path
                  d="M5 1v4H1M11 1v4h4M5 15v-4H1M11 15v-4h4"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Exit Fullscreen
            </>
          ) : (
            <>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path
                  d="M1 5V1h4M15 5V1h-4M1 11v4h4M15 11v4h-4"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Fullscreen
            </>
          )}
        </button>
    </div>
  );

  /* ── Title bar ── */
  const titleBar = (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "0.75rem",
        flexShrink: 0,
      }}
    >
      <div>
        <h3 className="dashboard-section-title">ROIC Value Driver Tree</h3>
        <p
          style={{
            margin: "0.2rem 0 0",
            fontSize: "0.75rem",
            color: "var(--zelis-medium-gray)",
            fontWeight: 500,
          }}
        >
          Aligning product initiatives to business value creation
        </p>
      </div>
      {actionButtons}
    </div>
  );

  /* ── Fullscreen overlay ── */
  if (isFullscreen) {
    return (
      <>
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            background: "white",
            display: "flex",
            flexDirection: "column",
            padding: "1.5rem 2rem",
            overflow: "hidden",
          }}
        >
          {hideTitle ? (
            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "0.5rem", flexShrink: 0 }}>
              {actionButtons}
            </div>
          ) : titleBar}
          {treeContent}
        </div>
        <style>{`
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(8px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>
      </>
    );
  }

  /* ── Inline view ── */
  return (
    <div>
      {hideTitle ? (
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "0.5rem" }}>
          {actionButtons}
        </div>
      ) : titleBar}
      {treeContent}
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
