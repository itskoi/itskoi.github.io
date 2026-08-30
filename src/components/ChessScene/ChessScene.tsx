import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { useTheme } from '@/hooks/useTheme'
import { prefersReducedMotion } from '@/lib/gsap'
import { figureHex, readPieceColors } from '@/lib/theme'
import styles from './ChessScene.module.css'
import { latticeHomes, SMALL_CUBE_SIZE, smallCubeEdges } from './cubeGeometry'

// Few facets around the axis => a low-poly prism, not a smooth lathe.
const SEGMENTS = 5

// Silhouettes as (radius, height) points revolved around the Y axis.
// Queen: wide base → stem → collar → neck → crown ring → rounded head.
const QUEEN_PROFILE = [
  [0.0, 0.0],
  [1.5, 0.0],
  [1.5, 0.4],
  [1.0, 0.7],
  [0.45, 1.1],
  [0.45, 2.6],
  [0.85, 3.0],
  [0.45, 3.4],
  [0.4, 4.0],
  [0.7, 4.4],
  [0.38, 4.8],
  [0.28, 5.1],
  [0.34, 5.4],
  [0.22, 5.7],
  [0.0, 5.9],
] as const

// King body ends flat at the crown so the cross can sit on top.
const KING_BODY = [
  [0.0, 0.0],
  [1.5, 0.0],
  [1.5, 0.4],
  [1.0, 0.7],
  [0.45, 1.1],
  [0.45, 2.6],
  [0.85, 3.0],
  [0.45, 3.4],
  [0.4, 4.0],
  [0.7, 4.4],
  [0.42, 4.8],
  [0.42, 5.0],
] as const

// Distance of each piece from the center; raise to spread them further apart.
const SPREAD = 11
// Vertical amplitude of the serpentine S-curve each piece traces while crossing.
const AMPLITUDE = 3
// How far the shards scatter while the pieces are "exploded".
const SCATTER_MAG = 0.5
// Fill is see-through; the per-shard border stays visible.
const SHARD_OPACITY = 0.05
const EDGE_OPACITY = 0.9
// Lattice (the cube) tuning. Border sits at a third ink: the cube drifts across the
// content columns on paper, and stronger edges read as noise over the rows.
const CUBE_FILL_OPACITY = 0.04 // small-cube face fill
const CUBE_BORDER_OPACITY = 0.35 // small-cube edge (border) brightness
const LATTICE_SCATTER = 8 // how far cubes fly in from (and out to on exit)
// Lattice drift: translates in X/Y (a lissajous) on top of the spin.
const CUBE_DRIFT_FREQ = 0.3 // drift speed (rad/s)
const CUBE_DRIFT_X = 5.5 // drift amplitude along X
const CUBE_DRIFT_Y = 1.5 // drift amplitude along Y
// Chess → cube transition: explode apart, then gather into a central cluster.
const EXPLODE_RAD = 5 // how far shards fly when the chess explodes
const GATHER_RAD = 0.7 // how tightly shards gather before becoming the cube

// Ambient idle motion layered on the swap/spin so the pieces are never static.
const IDLE_SPIN = 0.25 // rad/s — slow continuous rotation
const BOB_FREQ = 0.8 // rad/s
const BOB_AMP = 0.4
const SWAY_FREQ = 0.6 // rad/s
const SWAY_AMP = 0.3

// --- Eases (pure; the rAF stays the single source of motion, no ScrollTrigger here) ---
const clamp01 = (x: number): number => (x < 0 ? 0 : x > 1 ? 1 : x)
const easeInOutCubic = (t: number): number => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2)
const smoothstep = (a: number, b: number, x: number): number => {
  const t = clamp01((x - a) / (b - a))
  return t * t * (3 - 2 * t)
}

function toVector2(profile: readonly (readonly [number, number])[]): THREE.Vector2[] {
  return profile.map(([x, y]) => new THREE.Vector2(x, y))
}

interface Shard {
  obj: THREE.Group
  scatterDir: THREE.Vector3 // unit direction the shard flies when it explodes
  scatterPos: THREE.Vector3 // scatterDir * magnitude (the assembled-cloud offset)
  scatterRot: THREE.Euler
}

// Split a geometry into one solid triangle shard per face. Each shard is a group
// holding a transparent fill plus a visible border, with a random position +
// rotation it eases back to (identity) as it assembles.
function buildShards(
  geo: THREE.BufferGeometry,
  fillMaterial: THREE.Material,
  edgeMaterial: THREE.Material,
  maxMag: number,
): Shard[] {
  const pos = geo.attributes.position as THREE.BufferAttribute
  const index = geo.index
  const triCount = index ? index.count / 3 : pos.count / 3
  const shards: Shard[] = []

  for (let t = 0; t < triCount; t++) {
    const a = index ? index.getX(t * 3) : t * 3
    const b = index ? index.getX(t * 3 + 1) : t * 3 + 1
    const c = index ? index.getX(t * 3 + 2) : t * 3 + 2
    const pa = new THREE.Vector3().fromBufferAttribute(pos, a)
    const pb = new THREE.Vector3().fromBufferAttribute(pos, b)
    const pc = new THREE.Vector3().fromBufferAttribute(pos, c)

    const fillGeo = new THREE.BufferGeometry()
    fillGeo.setAttribute(
      'position',
      new THREE.BufferAttribute(
        new Float32Array([pa.x, pa.y, pa.z, pb.x, pb.y, pb.z, pc.x, pc.y, pc.z]),
        3,
      ),
    )
    fillGeo.computeVertexNormals()

    const edgeGeo = new THREE.BufferGeometry()
    edgeGeo.setAttribute(
      'position',
      new THREE.BufferAttribute(
        new Float32Array([pa.x, pa.y, pa.z, pb.x, pb.y, pb.z, pc.x, pc.y, pc.z]),
        3,
      ),
    )

    const group = new THREE.Group()
    group.add(new THREE.Mesh(fillGeo, fillMaterial))
    group.add(new THREE.LineLoop(edgeGeo, edgeMaterial))

    const dx = Math.random() * 2 - 1
    const dy = Math.random() * 2 - 1
    const dz = Math.random() * 2 - 1
    const len = Math.hypot(dx, dy, dz) || 1
    const mag = maxMag * (0.5 + Math.random())
    const scatterDir = new THREE.Vector3(dx / len, dy / len, dz / len)

    shards.push({
      obj: group,
      scatterDir,
      scatterPos: scatterDir.clone().multiplyScalar(mag),
      scatterRot: new THREE.Euler(
        (Math.random() * 2 - 1) * Math.PI,
        (Math.random() * 2 - 1) * Math.PI,
        (Math.random() * 2 - 1) * Math.PI,
      ),
    })
  }
  geo.dispose()
  return shards
}

function supportsWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas')
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext('webgl2') || canvas.getContext('webgl'))
    )
  } catch {
    return false
  }
}

export function ChessScene() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { theme } = useTheme()

  // `theme` is not read in the body — the colors are re-read from CSS tokens via
  // figureHex() — but it is an intentional dependency: toggling the theme must tear
  // down and rebuild the scene so the pieces pick up the new figure color.
  // biome-ignore lint/correctness/useExhaustiveDependencies(theme): forces a rebuild to re-read theme tokens
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !supportsWebGL()) return

    const reduce = prefersReducedMotion()

    const scene = new THREE.Scene()
    scene.add(new THREE.AmbientLight(0xffffff, 0.45))
    const keyLight = new THREE.DirectionalLight(0xffffff, 1.1)
    keyLight.position.set(5, 10, 7)
    scene.add(keyLight)

    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100)
    // Two framings, blended each frame as the chess hands off to the cube (see uCam):
    //  - chess: elevated front view of the pieces (also the default under reduced motion).
    //  - cube:  isometric 3/4 view (yaw/pitch/roll = ±30°, YXZ) the lattice reads well from.
    camera.position.set(0, 7, 15)
    camera.lookAt(0, 0, 0)
    const chessPos = camera.position.clone()
    const chessQuat = camera.quaternion.clone()
    const isoEuler = new THREE.Euler(-Math.PI / 6, Math.PI / 6, -Math.PI / 6, 'YXZ')
    const isoQuat = new THREE.Quaternion().setFromEuler(isoEuler)
    const isoPos = new THREE.Vector3(-2, 0, 20).applyEuler(isoEuler)

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

    const makeFill = (color: number) =>
      new THREE.MeshStandardMaterial({
        color,
        flatShading: true,
        transparent: true,
        opacity: SHARD_OPACITY,
        side: THREE.DoubleSide,
        roughness: 0.5,
        metalness: 0.1,
      })
    const makeEdge = (color: number) =>
      new THREE.LineBasicMaterial({ color, transparent: true, opacity: EDGE_OPACITY })

    // Both pieces share the scene-piece color (electric blue in dark mode, ink in light)
    // — the Queen/King distinction is geometric, not chromatic. Re-read on theme change.
    const pieceColors = readPieceColors()
    const figure = figureHex(pieceColors)
    const queenFill = makeFill(figure)
    const queenEdge = makeEdge(figure)
    const kingFill = makeFill(figure)
    const kingEdge = makeEdge(figure)

    const queen = new THREE.Group()
    const queenGeo = new THREE.LatheGeometry(toVector2(QUEEN_PROFILE), SEGMENTS)
    queenGeo.translate(0, -3, 0)
    const queenShards = buildShards(queenGeo, queenFill, queenEdge, SCATTER_MAG)
    for (const s of queenShards) queen.add(s.obj)
    queen.position.set(-SPREAD, 0, 0)

    const king = new THREE.Group()
    const kingBodyGeo = new THREE.LatheGeometry(toVector2(KING_BODY), SEGMENTS)
    kingBodyGeo.translate(0, -3, 0)
    const kingShards = buildShards(kingBodyGeo, kingFill, kingEdge, SCATTER_MAG)
    const vBarGeo = new THREE.BoxGeometry(0.16, 1.5, 0.16)
    vBarGeo.translate(0, 2.7, 0)
    const hBarGeo = new THREE.BoxGeometry(0.7, 0.16, 0.16)
    hBarGeo.translate(0, 2.95, 0)
    // Merge the cross bars into the king shard set so they assemble as one piece.
    kingShards.push(...buildShards(vBarGeo, kingFill, kingEdge, SCATTER_MAG))
    kingShards.push(...buildShards(hBarGeo, kingFill, kingEdge, SCATTER_MAG))
    for (const s of kingShards) king.add(s.obj)
    king.position.set(SPREAD, 0, 0)

    scene.add(queen, king)
    const allShards = [...queenShards, ...kingShards]

    // --- Lattice: a 4×4×4 grid of small wireframe cubes with gaps. Each cube drifts
    //     radially out + in at its own random phase/speed/amplitude ("breathes"), and the
    //     whole lattice spins. The chess hands off to it across the Education morph. -------
    const latticeGroup = new THREE.Group()
    const cubeFillMat = new THREE.MeshBasicMaterial({
      color: figure,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
    })
    const cubeBorderMat = new THREE.LineBasicMaterial({
      color: figure,
      transparent: true,
      opacity: 0,
    })
    const cubeFillGeo = new THREE.BoxGeometry(SMALL_CUBE_SIZE, SMALL_CUBE_SIZE, SMALL_CUBE_SIZE)
    const cubeEdgeGeo = smallCubeEdges(SMALL_CUBE_SIZE)
    interface LatticeCube {
      obj: THREE.Group
      home: THREE.Vector3
      radial: THREE.Vector3
      phase: number
      speed: number
      amp: number
    }
    const lattice: LatticeCube[] = []
    for (const home of latticeHomes()) {
      const cube = new THREE.Group()
      cube.add(new THREE.Mesh(cubeFillGeo, cubeFillMat))
      cube.add(new THREE.LineSegments(cubeEdgeGeo, cubeBorderMat))
      cube.position.copy(home)
      latticeGroup.add(cube)
      lattice.push({
        obj: cube,
        home: home.clone(),
        radial: home.clone().normalize(),
        phase: Math.random() * Math.PI * 2,
        speed: 0.4 + Math.random() * 1.2,
        amp: 0.5 + Math.random() * 1.5,
      })
    }
    scene.add(latticeGroup)

    const resize = () => {
      const width = canvas.clientWidth || 1
      const height = canvas.clientHeight || 1
      camera.aspect = width / height
      camera.updateProjectionMatrix()
      renderer.setSize(width, height, false)
    }
    resize()
    window.addEventListener('resize', resize)

    const experienceEl = document.getElementById('experience')
    const educationEl = document.getElementById('education')
    const publicationsEl = document.getElementById('publications')
    const maxScroll = () => document.documentElement.scrollHeight - window.innerHeight
    const absTop = (el: Element | null): number =>
      el ? el.getBoundingClientRect().top + window.scrollY : 0
    const _euler = new THREE.Euler()

    let frame = 0
    const tick = () => {
      if (!reduce) {
        const y = window.scrollY
        const vh = window.innerHeight
        const max = maxScroll()

        const expTop = absTop(experienceEl) || max * 0.2
        const eduTop = absTop(educationEl) || max
        const pubTop = absTop(publicationsEl) || max

        const lead = vh * 0.9
        const exitDur = vh * 0.6
        const transStart = eduTop - lead
        const transEnd = eduTop
        const spinEnd = pubTop + vh * 0.5

        // 1) Shards assemble (exploded cloud → chess) by the time Experience reaches the top.
        const scatter = 1 - clamp01(expTop > 0 ? y / expTop : 0)
        // 2) Pieces swap + spin until the transition begins.
        const uSwap = clamp01((y - expTop) / (transStart - expTop || 1))
        // 3) Chess → cube transition in three stages across the Education entry band:
        //    explode apart → gather into a central cluster → become the lattice.
        const uTrans = clamp01((y - transStart) / (transEnd - transStart || 1))
        const explode = clamp01(uTrans / 0.33)
        const gather = clamp01((uTrans - 0.33) / 0.33)
        const toCube = clamp01((uTrans - 0.66) / 0.34)
        // 4) Lattice spins across Education; 5) flies out on exit.
        const uSpin = clamp01((y - transEnd) / (spinEnd - transEnd || 1))
        const uExit = clamp01((y - spinEnd) / (exitDur || 1))

        // Camera: ride the chess framing, ease into the isometric cube framing across the transition.
        const uCam = easeInOutCubic(uTrans)
        camera.position.lerpVectors(chessPos, isoPos, uCam)
        camera.quaternion.copy(chessQuat).slerp(isoQuat, uCam)

        const t = performance.now() / 1000
        const idle = t * IDLE_SPIN

        // Shards: assembled chess → explode apart → gather to a central cluster → fade. The
        // piece groups converge to the origin during gather so the cluster forms at the center.
        const transitionMag = EXPLODE_RAD * explode * (1 - gather) + GATHER_RAD * gather
        const tumble = clamp01(scatter + explode)
        const groupConv = gather
        const bend = AMPLITUDE * Math.sin(uSwap * Math.PI * 2)
        const sway = Math.cos(t * SWAY_FREQ) * SWAY_AMP
        const bob = Math.sin(t * BOB_FREQ) * BOB_AMP
        queen.position.set(
          THREE.MathUtils.lerp(-SPREAD + uSwap * SPREAD * 2 + sway, 0, groupConv),
          THREE.MathUtils.lerp(bend + bob, 0, groupConv),
          0,
        )
        queen.rotation.y = THREE.MathUtils.lerp(uSwap * Math.PI * 2 + idle, idle, groupConv)
        king.position.set(
          THREE.MathUtils.lerp(SPREAD - uSwap * SPREAD * 2 - sway, 0, groupConv),
          THREE.MathUtils.lerp(-bend - bob, 0, groupConv),
          0,
        )
        king.rotation.y = THREE.MathUtils.lerp(-uSwap * Math.PI * 2 - idle, idle, groupConv)
        for (const s of allShards) {
          // assembled-cloud offset (scatterPos) + explode/gather offset (scatterDir * transitionMag)
          s.obj.position
            .copy(s.scatterPos)
            .multiplyScalar(scatter)
            .addScaledVector(s.scatterDir, transitionMag)
          _euler.set(s.scatterRot.x * tumble, s.scatterRot.y * tumble, s.scatterRot.z * tumble)
          s.obj.quaternion.setFromEuler(_euler)
        }
        const shardFade = 1 - toCube
        queenFill.opacity = SHARD_OPACITY * shardFade
        queenEdge.opacity = EDGE_OPACITY * shardFade
        kingFill.opacity = SHARD_OPACITY * shardFade
        kingEdge.opacity = EDGE_OPACITY * shardFade

        if (shardFade < 0.2) {
          queen.visible = false
          king.visible = false
        } else {
          queen.visible = true
          king.visible = true
        }

        // Lattice (the cube): cubes emanate from the gathered center cluster out to their grid
        // homes through the cube stage, then each breathes radially (out + in at random) while
        // the whole lattice spins.
        const assembleProg = smoothstep(0.2, 0.8, uTrans)
        const cubeSpin = idle + easeInOutCubic(uSpin) * Math.PI * 2
        const latticeVis = smoothstep(0.6, 0.95, uTrans) * (1 - uExit)
        for (const c of lattice) {
          const breathe = assembleProg * c.amp * (0.5 + 0.5 * Math.sin(t * c.speed + c.phase))
          c.obj.position
            .copy(c.home)
            .multiplyScalar(assembleProg)
            .addScaledVector(c.radial, breathe + uExit * LATTICE_SCATTER)
        }
        latticeGroup.rotation.y = cubeSpin
        // Drift ramps in only after the cube has formed, so it always begins at the center
        // (where the shards gathered) and only then starts to roam X/Y.
        const driftScale = smoothstep(0, 0.3, uSpin)
        latticeGroup.position.x =
          (Math.sin(t * CUBE_DRIFT_FREQ) - 0.5) * 2 * CUBE_DRIFT_X * driftScale
        latticeGroup.position.y =
          Math.sin(t * CUBE_DRIFT_FREQ * 1.3 + 1.1) * CUBE_DRIFT_Y * driftScale
        cubeFillMat.opacity = CUBE_FILL_OPACITY * latticeVis
        cubeBorderMat.opacity = CUBE_BORDER_OPACITY * latticeVis
      }
      renderer.render(scene, camera)
      frame = requestAnimationFrame(tick)
    }
    tick()

    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('resize', resize)
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh || object instanceof THREE.Line) {
          object.geometry.dispose()
        }
      })
      queenFill.dispose()
      queenEdge.dispose()
      kingFill.dispose()
      kingEdge.dispose()
      cubeFillMat.dispose()
      cubeBorderMat.dispose()
      renderer.dispose()
    }
  }, [theme])

  return <canvas ref={canvasRef} className={styles.canvas} data-chess-canvas />
}
