import { useEffect, useRef } from 'react'
import cytoscape, { type Core, type ElementDefinition } from 'cytoscape'
import type { GraphEdge, GraphNode } from '../../types/graph'
import type { SuggestedConnection } from '../intelligence/suggestedConnections'
import './GraphCanvas.css'

interface GraphCanvasProps {
  nodes: GraphNode[]
  edges: GraphEdge[]
  suggestedConnections: SuggestedConnection[]
  showSuggestedConnections: boolean
  selectedNodeId: string | null
  selectedEdgeId: string | null
  connectSourceId: string | null
  onSelectNode: (nodeId: string | null) => void
  onSelectEdge: (edgeId: string | null) => void
  onConnectTarget: (targetNodeId: string) => void
}

function toElements(
  nodes: GraphNode[],
  edges: GraphEdge[],
): ElementDefinition[] {
  return [
    ...nodes.map((node) => ({
      data: {
        id: node.id,
        label: node.label,
        type: node.type,
        gender: node.gender ?? 'unspecified',
      },
    })),
    ...edges.map((edge) => ({
      data: {
        id: edge.id,
        source: edge.source,
        target: edge.target,
        label: edge.label,
        strength: edge.strength,
        confidence: edge.confidence,
      },
    })),
  ]
}

export function GraphCanvas({
  nodes,
  edges,
  suggestedConnections,
  showSuggestedConnections,
  selectedNodeId,
  selectedEdgeId,
  connectSourceId,
  onSelectNode,
  onSelectEdge,
  onConnectTarget,
}: GraphCanvasProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const cytoscapeRef = useRef<Core | null>(null)

  const callbacksRef = useRef({
    onSelectNode,
    onSelectEdge,
    onConnectTarget,
  })

  useEffect(() => {
    callbacksRef.current = {
      onSelectNode,
      onSelectEdge,
      onConnectTarget,
    }
  }, [onSelectNode, onSelectEdge, onConnectTarget])

  useEffect(() => {
    if (!containerRef.current) {
      return
    }

    const cy = cytoscape({
      container: containerRef.current,
      elements: toElements(nodes, edges),

      style: [
        {
          selector: 'node',
          style: {
            width: 64,
            height: 64,
            label: 'data(label)',
            'text-valign': 'bottom',
            'text-margin-y': 10,
            'font-size': 12,
            'font-weight': 700,
            color: '#dce5f2',
            'text-outline-color': '#0c121b',
            'text-outline-width': 3,
            'border-width': 4,
            'border-color': '#101721',
            'background-color': '#7c5cff',
          },
        },
        {
          selector: 'node[gender = "male"]',
          style: {
            'background-color': '#2563eb',
          },
        },
        {
          selector: 'node[gender = "female"]',
          style: {
            'background-color': '#dc2626',
          },
        },
        {
          selector: 'node[type = "company"]',
          style: {
            shape: 'round-rectangle',
            'background-color': '#0f9f78',
          },
        },
        {
          selector: 'node[type = "church"]',
          style: {
            shape: 'diamond',
            'background-color': '#d97706',
          },
        },
        {
          selector: 'node[type = "school"]',
          style: {
            shape: 'hexagon',
            'background-color': '#0891b2',
          },
        },
        {
          selector: 'node:selected',
          style: {
            width: 76,
            height: 76,
            'border-width': 7,
            'border-color': '#fbbf24',
            'overlay-opacity': 0,
          },
        },
        {
          selector: 'node.connect-source',
          style: {
            'border-width': 8,
            'border-color': '#22c55e',
          },
        },
        {
          selector: 'edge',
          style: {
            width: 'mapData(strength, 0, 100, 1.5, 7)',
            label: 'data(label)',
            'font-size': 10,
            color: '#8492a6',
            'text-outline-color': '#0c121b',
            'text-outline-width': 3,
            'line-color': '#53627a',
            'target-arrow-color': '#53627a',
            'target-arrow-shape': 'triangle',
            'curve-style': 'bezier',
          },
        },
        {
          selector: 'edge[kind = "suggested"]',
          style: {
            width: 'mapData(score, 20, 100, 1.5, 5)',
            label: 'data(label)',
            'font-size': 9,
            color: '#c4b5fd',
            'text-outline-color': '#0c121b',
            'text-outline-width': 3,
            'line-color': '#8b5cf6',
            'line-style': 'dashed',
            'target-arrow-shape': 'none',
            'curve-style': 'bezier',
            opacity: 0.7,
          },
        },
        {
          selector: 'edge[kind = "confirmed"]',
          style: {
            'target-arrow-shape': 'triangle',
          },
        },
        {
          selector: 'edge:selected',
          style: {
            'line-color': '#fbbf24',
            'target-arrow-color': '#fbbf24',
            width: 6,
          },
        },
      ],

      layout: {
        name: 'cose',
        animate: true,
        animationDuration: 500,
        nodeRepulsion: () => 9000,
        idealEdgeLength: () => 150,
        nodeOverlap: 40,
        gravity: 0.3,
      },

      minZoom: 0.2,
      maxZoom: 3,
      wheelSensitivity: 0.22,
    })

    cytoscapeRef.current = cy
    let collisionFrame: number | null = null
    let settlingLayout: ReturnType<Core['layout']> | null = null

    function moveNearbyNodesAway(
      draggedNode: cytoscape.NodeSingular,
    ) {
      if (collisionFrame !== null) {
        window.cancelAnimationFrame(collisionFrame)
      }

      collisionFrame = window.requestAnimationFrame(() => {
        const draggedPosition = draggedNode.position()
        const minimumDistance = 115

        cy.nodes()
          .not(draggedNode)
          .forEach((otherNode) => {
            const otherPosition = otherNode.position()

            let deltaX =
              otherPosition.x - draggedPosition.x

            let deltaY =
              otherPosition.y - draggedPosition.y

            let distance = Math.hypot(
              deltaX,
              deltaY,
            )

            if (distance < 1) {
              deltaX = Math.random() * 4 - 2
              deltaY = Math.random() * 4 - 2
              distance = Math.max(
                Math.hypot(deltaX, deltaY),
                1,
              )
            }

            if (distance >= minimumDistance) {
              return
            }

            const overlap =
              minimumDistance - distance

            const movement =
              Math.min(overlap * 0.22, 14)

            otherNode.position({
              x:
                otherPosition.x +
                (deltaX / distance) *
                  movement,

              y:
                otherPosition.y +
                (deltaY / distance) *
                  movement,
            })
          })

        collisionFrame = null
      })
    }

    function gentlySettleGraph(
      draggedNode: cytoscape.NodeSingular,
    ) {
      settlingLayout?.stop()

      /*
       * Keep the node the user moved in place.
       * The surrounding nodes are allowed to adjust.
       */
      draggedNode.lock()

      settlingLayout = cy.layout({
        name: 'cose',
        animate: true,
        animationDuration: 450,
        randomize: false,
        fit: false,
        padding: 50,

        nodeRepulsion: () => 12000,
        idealEdgeLength: () => 175,
        edgeElasticity: () => 80,

        nodeOverlap: 55,
        gravity: 0.18,

        numIter: 180,
        initialTemp: 90,
        coolingFactor: 0.92,
        minTemp: 1,
      })

      settlingLayout.one(
        'layoutstop',
        () => {
          draggedNode.unlock()
          settlingLayout = null
        },
      )

      settlingLayout.run()
    }

    cy.on(
      'drag',
      'node',
      (event) => {
        moveNearbyNodesAway(
          event.target,
        )
      },
    )

    cy.on(
      'dragfree',
      'node',
      (event) => {
        gentlySettleGraph(
          event.target,
        )
      },
    )
    cy.on('tap', 'node', (event) => {
      const nodeId = event.target.id()

      if (connectSourceId) {
        callbacksRef.current.onConnectTarget(nodeId)
        return
      }

      callbacksRef.current.onSelectNode(nodeId)
      callbacksRef.current.onSelectEdge(null)
    })

    cy.on('tap', 'edge', (event) => {
      if (event.target.data('kind') === 'suggested') {
        return
      }

      callbacksRef.current.onSelectEdge(event.target.id())
      callbacksRef.current.onSelectNode(null)
    })

    cy.on('tap', (event) => {
      if (event.target === cy) {
        callbacksRef.current.onSelectNode(null)
        callbacksRef.current.onSelectEdge(null)
      }
    })

    const resizeObserver = new ResizeObserver(() => {
      cy.resize()
    })

    resizeObserver.observe(containerRef.current)

    return () => {
  resizeObserver.disconnect()

  if (collisionFrame !== null) {
    window.cancelAnimationFrame(
      collisionFrame,
    )
  }

  settlingLayout?.stop()
  cy.destroy()
  cytoscapeRef.current = null
}
  }, [])

  useEffect(() => {
    const cy = cytoscapeRef.current

    if (!cy) {
      return
    }

    const desiredNodeIds = new Set(nodes.map((node) => node.id))
    const desiredEdgeIds = new Set([
      ...edges.map((edge) => edge.id),
      ...(showSuggestedConnections
        ? suggestedConnections.map(
            (connection) => connection.id,
          )
        : []),
    ])
    cy.startBatch()

    cy.nodes().forEach((node) => {
      if (!desiredNodeIds.has(node.id())) {
        node.remove()
      }
    })

    cy.edges().forEach((edge) => {
      if (!desiredEdgeIds.has(edge.id())) {
        edge.remove()
      }
    })

    nodes.forEach((node) => {
      const existingNode = cy.getElementById(node.id)

      if (existingNode.length) {
        existingNode.data({
          label: node.label,
          type: node.type,
          gender: node.gender ?? 'unspecified',
        })
      } else {
        cy.add({
          group: 'nodes',
          data: {
            id: node.id,
            label: node.label,
            type: node.type,
            gender: node.gender ?? 'unspecified',
          },
        })
      }
    })

    edges.forEach((edge) => {
      const existingEdge = cy.getElementById(edge.id)

      if (existingEdge.length) {
        existingEdge.data({
          source: edge.source,
          target: edge.target,
          label: edge.label,
          strength: edge.strength,
          confidence: edge.confidence,
          kind: 'confirmed',
        })
      } else {
        cy.add({
          group: 'edges',
          data: {
            id: edge.id,
            source: edge.source,
            target: edge.target,
            label: edge.label,
            strength: edge.strength,
            confidence: edge.confidence,
          kind: 'confirmed',
          },
        })
      }
    })


    if (showSuggestedConnections) {
      suggestedConnections.forEach((connection) => {
        const existingEdge = cy.getElementById(connection.id)

        const data = {
          id: connection.id,
          source: connection.source,
          target: connection.target,
          label: `${connection.score}% match`,
          score: connection.score,
          reasons: connection.reasons.join(' • '),
          kind: 'suggested',
        }

        if (existingEdge.length) {
          existingEdge.data(data)
        } else {
          cy.add({
            group: 'edges',
            data,
          })
        }
      })
    }

    cy.endBatch()
  }, [
    nodes,
    edges,
    suggestedConnections,
    showSuggestedConnections,
  ])

  useEffect(() => {
    const cy = cytoscapeRef.current

    if (!cy) {
      return
    }

    cy.$(':selected').unselect()

    if (selectedNodeId) {
      cy.getElementById(selectedNodeId).select()
    }

    if (selectedEdgeId) {
      cy.getElementById(selectedEdgeId).select()
    }
  }, [selectedNodeId, selectedEdgeId])

  useEffect(() => {
    const cy = cytoscapeRef.current

    if (!cy) {
      return
    }

    cy.nodes().removeClass('connect-source')

    if (connectSourceId) {
      cy.getElementById(connectSourceId).addClass('connect-source')
    }
  }, [connectSourceId])

  return <div ref={containerRef} className="graph-canvas" />
}
