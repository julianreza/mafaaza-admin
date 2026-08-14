import { describe, expect, it } from "vitest"

import { arcOffset } from "./target-gauge"

// The gauge is the one bit of real logic on the dashboard: percent -> dash
// offset over a half-circle arc. Everything else is static markup.
const ARC_LEN = Math.PI * 70

describe("arcOffset", () => {
  it("hides the whole arc at 0%", () => {
    expect(arcOffset(0)).toBeCloseTo(ARC_LEN)
  })

  it("shows the whole arc at 100%", () => {
    expect(arcOffset(100)).toBeCloseTo(0)
  })

  it("shows half the arc at 50%", () => {
    expect(arcOffset(50)).toBeCloseTo(ARC_LEN / 2)
  })

  it("clamps out-of-range values", () => {
    expect(arcOffset(-20)).toBeCloseTo(ARC_LEN)
    expect(arcOffset(140)).toBeCloseTo(0)
  })
})
