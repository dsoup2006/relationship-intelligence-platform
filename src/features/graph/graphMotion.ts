import type {
  Core,
  EventObject,
  NodeSingular,
} from 'cytoscape'

interface Point {
  x: number
  y: number
}

interface SpringState {
  rest: Point
  velocity: Point
  displaced: boolean
  mass: number
  damping: number
}

function isMainNode(node: NodeSingular): boolean {
  return node.data('kind') !== 'attribute'
}

function massForNode(node: NodeSingular): number {
  const type = String(node.data('type') ?? '')

  switch (type) {
    case 'person':
      return 0.85

    case 'event':
      return 1

    case 'school':
      return 1.15

    case 'company':
      return 1.3

    case 'church':
      return 1.4

    case 'address':
      return 1.55

    case 'document':
      return 1.7

    default:
      return 1.1
  }
}

function dampingForNode(node: NodeSingular): number {
  const idSeed = node
    .id()
    .split('')
    .reduce(
      (total, character) =>
        total + character.charCodeAt(0),
      0,
    )

  /*
   * Small differences keep every node from stopping
   * at exactly the same moment.
   */
  return 0.885 + (idSeed % 8) * 0.006
}

export function startGraphMotion(cy: Core): () => void {
  const states = new Map<string, SpringState>()

  let frame = 0
  let previousTime = performance.now()
  let running = true
  let dashOffset = 0

  function getState(node: NodeSingular): SpringState {
    let state = states.get(node.id())

    if (!state) {
      const position = node.position()

      state = {
        rest: {
          x: position.x,
          y: position.y,
        },

        velocity: {
          x: 0,
          y: 0,
        },

        displaced: false,
        mass: massForNode(node),
        damping: dampingForNode(node),
      }

      states.set(node.id(), state)
    }

    return state
  }

  function captureRestPositions() {
    cy.nodes().forEach((element) => {
      if (
        !element.isNode() ||
        !isMainNode(element) ||
        element.grabbed()
      ) {
        return
      }

      const state = getState(element)
      const position = element.position()

      state.rest = {
        x: position.x,
        y: position.y,
      }

      state.velocity = {
        x: 0,
        y: 0,
      }

      state.mass = massForNode(element)
      state.displaced = false
    })
  }

  function pushNode(
    node: NodeSingular,
    sourcePosition: Point,
    strength: number,
  ) {
    if (
      node.grabbed() ||
      node.locked() ||
      node.selected()
    ) {
      return
    }

    const position = node.position()

    let deltaX =
      position.x - sourcePosition.x

    let deltaY =
      position.y - sourcePosition.y

    let distance = Math.hypot(
      deltaX,
      deltaY,
    )

    if (distance < 1) {
      const seed = node
        .id()
        .split('')
        .reduce(
          (total, character) =>
            total + character.charCodeAt(0),
          0,
        )

      const angle =
        ((seed % 360) * Math.PI) / 180

      deltaX = Math.cos(angle)
      deltaY = Math.sin(angle)
      distance = 1
    }

    const unitX = deltaX / distance
    const unitY = deltaY / distance
    const state = getState(node)

    /*
     * Heavy entity types respond more slowly.
     */
    const weightedStrength =
      strength / state.mass

    node.position({
      x:
        position.x +
        unitX * weightedStrength,
      y:
        position.y +
        unitY * weightedStrength,
    })

    state.velocity.x +=
      unitX *
      weightedStrength *
      0.22

    state.velocity.y +=
      unitY *
      weightedStrength *
      0.22

    state.displaced = true
  }

  function createNetworkRipple(
    draggedNode: NodeSingular,
  ) {
    const draggedPosition =
      draggedNode.position()

    const directRadius = 165
    const secondaryRadius = 300
    const minimumDistance = 125

    cy.nodes().forEach((element) => {
      if (
        !element.isNode() ||
        !isMainNode(element) ||
        element.id() === draggedNode.id()
      ) {
        return
      }

      const position = element.position()

      const distance = Math.hypot(
        position.x - draggedPosition.x,
        position.y - draggedPosition.y,
      )

      if (distance >= secondaryRadius) {
        return
      }

      if (distance < directRadius) {
        const proximity =
          1 - distance / directRadius

        const overlap =
          distance < minimumDistance
            ? minimumDistance - distance
            : 0

        const strength =
          proximity * 15 +
          overlap * 0.24

        pushNode(
          element,
          draggedPosition,
          strength,
        )

        return
      }

      /*
       * A weaker outer ripple makes the surrounding
       * cluster react after the closest nodes.
       */
      const outerProgress =
        1 -
        (distance - directRadius) /
          (secondaryRadius - directRadius)

      const strength =
        Math.max(0, outerProgress) * 3.2

      pushNode(
        element,
        draggedPosition,
        strength,
      )
    })
  }

  function handleGrab(event: EventObject) {
    const element = event.target

    if (
      !element?.isNode?.() ||
      !isMainNode(element)
    ) {
      return
    }

    const node = element as NodeSingular
    const state = getState(node)
    const position = node.position()

    state.rest = {
      x: position.x,
      y: position.y,
    }

    state.velocity = {
      x: 0,
      y: 0,
    }

    state.displaced = false
  }

  function handleDrag(event: EventObject) {
    const element = event.target

    if (
      !element?.isNode?.() ||
      !isMainNode(element)
    ) {
      return
    }

    createNetworkRipple(
      element as NodeSingular,
    )
  }

  function handleDragFree(event: EventObject) {
    const element = event.target

    if (
      !element?.isNode?.() ||
      !isMainNode(element)
    ) {
      return
    }

    /*
     * The intentionally moved node keeps its new position.
     * Only displaced surrounding nodes spring toward
     * their previous resting positions.
     */
    const node = element as NodeSingular
    const state = getState(node)
    const position = node.position()

    state.rest = {
      x: position.x,
      y: position.y,
    }

    state.velocity = {
      x: 0,
      y: 0,
    }

    state.displaced = false
  }

  function animate(now: number) {
    if (!running) {
      return
    }

    const elapsed = Math.min(
      now - previousTime,
      34,
    )

    previousTime = now

    cy.batch(() => {
      states.forEach((state, nodeId) => {
        if (!state.displaced) {
          return
        }

        const element =
          cy.getElementById(nodeId)

        if (
          !element.length ||
          !element.isNode()
        ) {
          states.delete(nodeId)
          return
        }

        const node =
          element as NodeSingular

        if (
          node.grabbed() ||
          node.locked()
        ) {
          return
        }

        const position = node.position()

        /*
         * Force divided by mass gives each entity type
         * its own physical weight.
         */
        const springStrength =
          0.0052 / state.mass

        const forceX =
          (state.rest.x - position.x) *
          springStrength *
          elapsed

        const forceY =
          (state.rest.y - position.y) *
          springStrength *
          elapsed

        const damping = Math.pow(
          state.damping,
          elapsed / 16.67,
        )

        state.velocity.x =
          (state.velocity.x + forceX) *
          damping

        state.velocity.y =
          (state.velocity.y + forceY) *
          damping

        const nextPosition = {
          x:
            position.x +
            state.velocity.x,

          y:
            position.y +
            state.velocity.y,
        }

        node.position(nextPosition)

        const distanceFromRest =
          Math.hypot(
            nextPosition.x - state.rest.x,
            nextPosition.y - state.rest.y,
          )

        const speed =
          Math.hypot(
            state.velocity.x,
            state.velocity.y,
          )

        if (
          distanceFromRest < 0.3 &&
          speed < 0.06
        ) {
          node.position(state.rest)

          state.velocity = {
            x: 0,
            y: 0,
          }

          state.displaced = false
        }
      })

      /*
       * Continue the information-flow animation on
       * relationship lines.
       */
      dashOffset =
        (dashOffset - elapsed * 0.09) %
        100

      cy.edges()
        .filter(
          (edge) =>
            edge.data('kind') !==
            'attribute',
        )
        .forEach((edge) => {
          edge.style(
            'line-dash-offset',
            dashOffset,
          )
        })
    })

    frame =
      window.requestAnimationFrame(
        animate,
      )
  }

  cy.on('grab', 'node', handleGrab)
  cy.on('drag', 'node', handleDrag)

  cy.on(
    'dragfree',
    'node',
    handleDragFree,
  )

  cy.on(
    'layoutstop',
    captureRestPositions,
  )

  cy.on('add', 'node', (event) => {
    const node =
      event.target as NodeSingular

    if (isMainNode(node)) {
      getState(node)
    }
  })

  cy.on('remove', 'node', (event) => {
    states.delete(event.target.id())
  })

  captureRestPositions()

  frame =
    window.requestAnimationFrame(
      animate,
    )

  return () => {
    running = false

    window.cancelAnimationFrame(frame)

    cy.off('grab', 'node', handleGrab)
    cy.off('drag', 'node', handleDrag)

    cy.off(
      'dragfree',
      'node',
      handleDragFree,
    )

    cy.off(
      'layoutstop',
      captureRestPositions,
    )

    states.clear()
  }
}
