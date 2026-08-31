import { describe, expect, it } from 'vitest'
import {
  BASIN_CENTER,
  buildTrajectory,
  type CameraPose,
  descentDirection,
  gradLoss,
  loss,
  NEAR_PLANE,
  poseAt,
  projectionScale,
  projectPoint,
  START,
  scrollProgress,
  sliceFlowDirection,
  surfacePoint,
  type Vec3,
} from './descentField'

const len = (v: Vec3) => Math.hypot(v.x, v.y, v.z)

describe('the objective', () => {
  it('is deterministic', () => {
    const p: Vec3 = { x: 0.7, y: -1.2, z: 0.4 }
    expect(loss(p)).toBe(loss(p))
  })

  it('analytic gradient matches central finite differences', () => {
    const samples: Vec3[] = [
      { x: 0, y: 0, z: 0 },
      { x: 1.6, y: -0.9, z: -1.1 },
      { x: -2.2, y: 0.8, z: 1.6 },
      { x: 2.5, y: 1.5, z: -2.0 },
      { x: -0.5, y: 2.0, z: 0.75 },
    ]
    const h = 1e-4
    for (const p of samples) {
      const g = gradLoss(p)
      for (const axis of ['x', 'y', 'z'] as const) {
        const plus = { ...p, [axis]: p[axis] + h } as Vec3
        const minus = { ...p, [axis]: p[axis] - h } as Vec3
        const numeric = (loss(plus) - loss(minus)) / (2 * h)
        expect(Math.abs(g[axis] - numeric)).toBeLessThan(1e-5)
      }
    }
  })

  it('has a single global basin: its centre beats every window corner', () => {
    const w = 4
    const corners: Vec3[] = [
      { x: -w, y: -w, z: -w },
      { x: w, y: -w, z: -w },
      { x: -w, y: w, z: w },
      { x: w, y: w, z: w },
    ]
    for (const corner of corners) {
      expect(loss(BASIN_CENTER)).toBeLessThan(loss(corner))
    }
  })

  it('is non-convex: a saddle separates the two wells', () => {
    const local: Vec3 = { x: -2.2, y: 0.8, z: 1.6 }
    expect(loss(local)).toBeLessThan(loss({ x: 0, y: 0, z: 0 }))
    let saddleAboveBoth = false
    for (let i = 1; i < 10; i++) {
      const t = i / 10
      const mid = {
        x: BASIN_CENTER.x + (local.x - BASIN_CENTER.x) * t,
        y: BASIN_CENTER.y + (local.y - BASIN_CENTER.y) * t,
        z: BASIN_CENTER.z + (local.z - BASIN_CENTER.z) * t,
      }
      if (loss(mid) > loss(BASIN_CENTER) && loss(mid) > loss(local)) saddleAboveBoth = true
    }
    expect(saddleAboveBoth).toBe(true)
  })
})

describe('the field', () => {
  it('points straight down the negative gradient', () => {
    const samples: Vec3[] = [
      { x: 0.9, y: 0.3, z: -0.6 },
      { x: -1.7, y: 1.9, z: 2.2 },
      { x: 2.8, y: -1.1, z: 0.5 },
    ]
    for (const p of samples) {
      const dir = descentDirection(p)
      const g = gradLoss(p)
      const dot = -(dir.x * g.x + dir.y * g.y + dir.z * g.z) / len(g)
      expect(dot).toBeGreaterThan(0.999999)
      expect(len(dir)).toBeCloseTo(1, 9)
    }
  })

  it('flows downhill on the slice: a small step along it lowers the loss', () => {
    const p = { x: 1.2, y: 0, z: 0.8 }
    const d = sliceFlowDirection(p)
    const h = 0.05
    expect(loss({ x: p.x + d.dx * h, y: p.y, z: p.z + d.dz * h })).toBeLessThan(loss(p))
  })
})

describe('the trajectory', () => {
  const traj = buildTrajectory()

  it('descends monotonically and ends in the global basin', () => {
    expect(traj.points.length).toBeGreaterThan(50)
    for (let i = 1; i < traj.points.length; i++) {
      expect(loss(traj.points[i])).toBeLessThanOrEqual(loss(traj.points[i - 1]) + 1e-9)
    }
    const end = traj.points[traj.points.length - 1]
    expect(
      len({ x: end.x - BASIN_CENTER.x, y: end.y - BASIN_CENTER.y, z: end.z - BASIN_CENTER.z }),
    ).toBeLessThan(0.5)
    expect(loss(end)).toBeLessThan(loss(START))
  })

  it('is deterministic', () => {
    expect(buildTrajectory()).toEqual(traj)
  })
})

describe('the camera pose', () => {
  const traj = buildTrajectory()

  it('starts above the trajectory start, looking down the path', () => {
    const pose = poseAt(traj, 0)
    expect(pose.position.x).toBeCloseTo(START.x, 6)
    expect(pose.position.z).toBeCloseTo(START.z, 6)
    expect(pose.position.y).toBeGreaterThan(surfacePoint(START).y)
    expect(pose.forward.y).toBeLessThan(0)
    expect(len(pose.forward)).toBeCloseTo(1, 9)
  })

  it('settles over the basin at the end of the run', () => {
    const pose = poseAt(traj, 1)
    const basin = surfacePoint(BASIN_CENTER)
    expect(
      len({
        x: pose.position.x - basin.x,
        y: pose.position.y - basin.y,
        z: pose.position.z - basin.z,
      }),
    ).toBeLessThan(2.5)
  })

  it('clamps s to [0, 1]', () => {
    expect(poseAt(traj, -0.5)).toEqual(poseAt(traj, 0))
    expect(poseAt(traj, 1.5)).toEqual(poseAt(traj, 1))
  })
})

describe('the projection', () => {
  const pose: CameraPose = {
    position: { x: 0, y: 0, z: 0 },
    forward: { x: 0, y: 0, z: 1 },
    up: { x: 0, y: 1, z: 0 },
    right: { x: 1, y: 0, z: 0 },
  }
  const viewport = { width: 800, height: 600 }

  it('puts the point straight ahead at the canvas centre', () => {
    expect(projectPoint({ x: 0, y: 0, z: 10 }, pose, viewport)).toEqual({
      x: 400,
      y: 300,
      depth: 10,
    })
  })

  it('puts camera-right in the right half of the frame', () => {
    const p = projectPoint({ x: 4, y: 0, z: 8 }, pose, viewport)
    expect(p?.x).toBeGreaterThan(400)
  })

  it('culls anything behind the camera or inside the near plane', () => {
    expect(projectPoint({ x: 0, y: 0, z: -1 }, pose, viewport)).toBeNull()
    expect(projectPoint({ x: 0, y: 0, z: NEAR_PLANE / 2 }, pose, viewport)).toBeNull()
  })

  it('scales with 1/depth (foreshortening-free px-per-world-unit)', () => {
    // focal = 0.62 × min(800, 600) = 372
    expect(projectionScale(1, viewport)).toBeCloseTo(372, 6)
    expect(projectionScale(2, viewport)).toBeCloseTo(186, 6)
    expect(projectionScale(NEAR_PLANE / 2, viewport)).toBeCloseTo(372 / NEAR_PLANE, 6)
  })
})

describe('scroll progress', () => {
  it('maps the document fraction and clamps to [0, 1]', () => {
    expect(scrollProgress(-10, 1000)).toBe(0)
    expect(scrollProgress(0, 1000)).toBe(0)
    expect(scrollProgress(500, 1000)).toBeCloseTo(0.5, 9)
    expect(scrollProgress(2000, 1000)).toBe(1)
    expect(scrollProgress(120, 0)).toBe(0)
  })
})

describe('the surface slice', () => {
  it('raises the wireframe where the loss is higher (same slice plane)', () => {
    const low = surfacePoint(BASIN_CENTER)
    const high = surfacePoint({ x: BASIN_CENTER.x + 2, y: BASIN_CENTER.y, z: BASIN_CENTER.z })
    expect(high.y).toBeGreaterThan(low.y)
  })
})
