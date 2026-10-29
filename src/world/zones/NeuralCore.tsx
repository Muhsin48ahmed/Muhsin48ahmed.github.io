import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import { AdditiveBlending, BufferAttribute, BufferGeometry, Color, Object3D, type Group, type InstancedMesh } from 'three'
import { isFromUi } from '../helpers'
import { HERO_CORE } from '../layout'
import { NETWORK_LAYERS, networkEdges, networkNodes, nodeLayers } from '../network'
import { createRng } from '../random'
import { useWorld } from '../store'
import { CYAN, GLOW, PINK, VIOLET } from '../theme'
import { useZoneActive } from '../useZoneActive'

const SIGNAL_COUNT = 90
const SIGNAL_SPEED = 0.9
const BURST_SPEED = 4
const BURST_DECAY = 1.6
const NODE_RADIUS = 0.17
const SPIN_SPEED = 0.12
const POINTER_TILT = 0.35
const CORE_SCALE = 0.72

const layerColor = (layer: number, total: number) =>
  new Color(CYAN).lerp(new Color(VIOLET), layer / (total - 1)).lerp(new Color(PINK), layer === total - 1 ? 0.6 : 0)

/** The hero: a 3D neural network with signals propagating layer to layer. Click it to fire a burst. */
export function NeuralCore({ stop, isReducedMotion }: { stop: number; isReducedMotion: boolean }) {
  const isActive = useZoneActive([stop])
  const setCursor = useWorld((s) => s.setCursor)
  const group = useRef<Group>(null)
  const nodesMesh = useRef<InstancedMesh>(null)
  const signalsMesh = useRef<InstancedMesh>(null)
  const burst = useRef(0)
  const hovered = useRef<number | null>(null)

  const nodes = useMemo(() => networkNodes(NETWORK_LAYERS), [])
  const edges = useMemo(() => networkEdges(NETWORK_LAYERS), [])
  const layers = useMemo(() => nodeLayers(NETWORK_LAYERS), [])
  const outgoing = useMemo(() => nodes.map((_, n) => edges.flatMap(([a], e) => (a === n ? [e] : []))), [nodes, edges])

  const edgeGeometry = useMemo(() => {
    const g = new BufferGeometry()
    g.setAttribute('position', new BufferAttribute(new Float32Array(edges.flatMap(([a, b]) => [...nodes[a]!, ...nodes[b]!])), 3))
    return g
  }, [edges, nodes])

  // Each signal travels one edge, then hops onto a random outgoing edge — forward propagation.
  const signals = useMemo(() => {
    const rng = createRng(5)
    return { rng, edge: Array.from({ length: SIGNAL_COUNT }, () => Math.floor(rng() * edges.length)), t: Array.from({ length: SIGNAL_COUNT }, rng) }
  }, [edges.length])

  const dummy = useMemo(() => new Object3D(), [])
  const nodeColors = useMemo(() => layers.map((l) => layerColor(l, NETWORK_LAYERS.length).multiplyScalar(GLOW)), [layers])

  useFrame((state, delta) => {
    if (!isActive || !group.current || !nodesMesh.current || !signalsMesh.current) return
    const dt = Math.min(delta, 0.1)
    const time = isReducedMotion ? 0 : state.clock.elapsedTime
    burst.current = Math.max(0, burst.current - dt * BURST_DECAY)

    group.current.rotation.y = time * SPIN_SPEED + state.pointer.x * POINTER_TILT
    group.current.rotation.x = -state.pointer.y * POINTER_TILT * 0.5

    nodes.forEach((node, i) => {
      const pulse = 1 + Math.sin(time * 2 + layers[i]! * 0.9) * 0.12 + burst.current * 0.6
      dummy.position.set(...node)
      dummy.scale.setScalar(pulse * (hovered.current === i ? 1.8 : 1))
      dummy.updateMatrix()
      nodesMesh.current!.setMatrixAt(i, dummy.matrix)
    })
    nodesMesh.current.instanceMatrix.needsUpdate = true

    const speed = (SIGNAL_SPEED + burst.current * BURST_SPEED) * (isReducedMotion ? 0 : 1)
    for (let s = 0; s < SIGNAL_COUNT; s++) {
      signals.t[s]! += dt * speed
      if (signals.t[s]! >= 1) {
        const next = outgoing[edges[signals.edge[s]!]![1]]!
        signals.edge[s] = next.length ? next[Math.floor(signals.rng() * next.length)]! : Math.floor(signals.rng() * edges.length)
        signals.t[s] = 0
      }
      const [a, b] = edges[signals.edge[s]!]!
      const t = signals.t[s]!
      const from = nodes[a]!
      const to = nodes[b]!
      dummy.position.set(from[0] + (to[0] - from[0]) * t, from[1] + (to[1] - from[1]) * t, from[2] + (to[2] - from[2]) * t)
      dummy.scale.setScalar(1 + burst.current)
      dummy.updateMatrix()
      signalsMesh.current.setMatrixAt(s, dummy.matrix)
    }
    signalsMesh.current.instanceMatrix.needsUpdate = true
  })

  return (
    <group position={HERO_CORE} scale={CORE_SCALE} visible={isActive}>
      <group ref={group}>
        <instancedMesh
          ref={(mesh) => {
            nodesMesh.current = mesh
            mesh?.instanceColor === null && nodeColors.forEach((c, i) => mesh.setColorAt(i, c))
          }}
          args={[undefined, undefined, nodes.length]}
          onPointerMove={(e) => {
            if (isFromUi(e.nativeEvent)) return
            hovered.current = e.instanceId ?? null
            setCursor('hover', 'pulse')
          }}
          onPointerOut={() => {
            hovered.current = null
            setCursor('default')
          }}
          onClick={(e) => {
            if (!isFromUi(e.nativeEvent)) burst.current = 1
          }}
        >
          <sphereGeometry args={[NODE_RADIUS, 24, 24]} />
          <meshBasicMaterial toneMapped={false} />
        </instancedMesh>
        <lineSegments geometry={edgeGeometry}>
          <lineBasicMaterial color={CYAN} transparent opacity={0.16} blending={AdditiveBlending} depthWrite={false} />
        </lineSegments>
        <instancedMesh ref={signalsMesh} args={[undefined, undefined, SIGNAL_COUNT]}>
          <sphereGeometry args={[0.055, 8, 8]} />
          <meshBasicMaterial color={new Color('#ffffff').multiplyScalar(GLOW * 1.5)} toneMapped={false} />
        </instancedMesh>
      </group>
      <OrbitRings isReducedMotion={isReducedMotion} />
    </group>
  )
}

function OrbitRings({ isReducedMotion }: { isReducedMotion: boolean }) {
  const rings = useRef<Group>(null)
  useFrame((state) => {
    if (!rings.current || isReducedMotion) return
    const t = state.clock.elapsedTime
    rings.current.children.forEach((ring, i) => {
      ring.rotation.z = t * (0.1 + i * 0.07) * (i % 2 ? -1 : 1)
    })
  })
  return (
    <group ref={rings}>
      {[
        { radius: 4.9, tilt: [1.2, 0.3, 0], color: CYAN },
        { radius: 5.4, tilt: [1.6, -0.5, 0], color: VIOLET },
        { radius: 5.9, tilt: [0.9, 0.9, 0], color: PINK },
      ].map(({ radius, tilt, color }) => (
        <group key={radius} rotation={tilt as [number, number, number]}>
          <mesh>
            <torusGeometry args={[radius, 0.012, 8, 160]} />
            <meshBasicMaterial color={new Color(color).multiplyScalar(1.6)} toneMapped={false} transparent opacity={0.7} />
          </mesh>
        </group>
      ))}
    </group>
  )
}
